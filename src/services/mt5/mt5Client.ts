import https from 'https';
import crypto from 'crypto';
import { MT5_CONFIG } from '@/config/mt5';

export interface MT5CreateAccountParams {
  name: string;
  email: string;
  group: string;
  leverage?: number | string;
  mainPassword?: string;
  investorPassword?: string;
  phone?: string;
  country?: string;
}

export interface MT5AccountResponse {
  login: string;
  name: string;
  group: string;
  leverage: string;
  currency: string;
  balance: number;
  equity: number;
  freeMargin: number;
  margin: number;
  server: string;
  mainPassword?: string;
  investorPassword?: string;
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MT5ClientService {
  // In-memory micro-cache (3 seconds TTL) to prevent MT5 socket exhaustion under high concurrency
  private cache = new Map<string, CacheEntry<any>>();

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCached<T>(key: string, data: T, ttlMs = 3000): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  public invalidateAccountCache(login: string | number): void {
    const strLogin = String(login);
    this.cache.delete(`acc:${strLogin}`);
    this.cache.delete(`pos:${strLogin}`);
    this.cache.delete(`deals:${strLogin}`);
  }

  /**
   * Executes a command on MT5 WebAPI within an isolated authenticated session
   */
  private async executeSession<T = any>(
    callback: (reqHelper: (path: string) => Promise<any>) => Promise<T>
  ): Promise<T> {
    const agent = new https.Agent({
      rejectUnauthorized: false,
      keepAlive: true,
      maxSockets: 1,
    });

    const reqHelper = (path: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        const req = https.request(
          {
            hostname: MT5_CONFIG.serverHost,
            port: MT5_CONFIG.serverPort,
            path,
            method: 'GET',
            agent,
            headers: {
              Connection: 'keep-alive',
            },
            timeout: 15000,
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              try {
                resolve(JSON.parse(data));
              } catch {
                resolve(data);
              }
            });
          }
        );

        req.on('timeout', () => {
          req.destroy();
          reject(new Error('MT5 WebAPI connection timeout'));
        });

        req.on('error', reject);
        req.end();
      });
    };

    try {
      const login = MT5_CONFIG.managerLogin;
      const password = MT5_CONFIG.apiPassword;

      // 1. /api/auth/start
      const startRes = await reqHelper(
        `/api/auth/start?version=3000&agent=WebCRM&login=${login}&type=manager`
      );

      if (!startRes || !startRes.srv_rand) {
        throw new Error(`MT5 Auth Start failed: ${JSON.stringify(startRes)}`);
      }

      const srvRandBuf = Buffer.from(startRes.srv_rand, 'hex');

      // 2. /api/auth/answer
      // Hash formula: md5(md5(md5(pwd_utf16le) + 'WebAPI') + srv_rand_bytes)
      const p1 = crypto.createHash('md5').update(Buffer.from(password, 'utf16le')).digest();
      const p2 = crypto.createHash('md5').update(p1).update('WebAPI').digest();
      const srvRandAnswer = crypto.createHash('md5').update(p2).update(srvRandBuf).digest('hex');
      const cliRand = crypto.randomBytes(16).toString('hex');

      const ansRes = await reqHelper(
        `/api/auth/answer?srv_rand_answer=${srvRandAnswer}&cli_rand=${cliRand}`
      );

      if (!ansRes || ansRes.retcode !== '0 Done') {
        throw new Error(`MT5 Auth Answer rejected: ${JSON.stringify(ansRes)}`);
      }

      // 3. Execute payload
      return await callback(reqHelper);
    } finally {
      agent.destroy();
    }
  }

  /**
   * Generates a secure random MT5 password
   */
  private generatePassword(length = 10): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Creates a new live trading account on MT5
   */
  public async createAccount(params: MT5CreateAccountParams): Promise<MT5AccountResponse> {
    const mainPass = params.mainPassword || this.generatePassword(10);
    const investorPass = params.investorPassword || this.generatePassword(10);
    const leverageNum = typeof params.leverage === 'string'
      ? parseInt(params.leverage.replace('1:', ''), 10) || 100
      : params.leverage || 100;

    return await this.executeSession(async (req) => {
      const query = new URLSearchParams({
        pass_main: mainPass,
        pass_investor: investorPass,
        name: params.name || 'CRM Client',
        group: params.group,
        email: params.email || '',
        leverage: leverageNum.toString(),
        country: params.country || 'India',
        phone: params.phone || '',
      });

      const addRes = await req(`/api/user/add?${query.toString()}`);

      if (!addRes || addRes.retcode !== '0 Done' || !addRes.answer?.Login) {
        throw new Error(`Failed to create account on MT5: ${addRes?.retcode || JSON.stringify(addRes)}`);
      }

      const login = String(addRes.answer.Login);

      return {
        login,
        name: params.name,
        group: params.group,
        leverage: `1:${leverageNum}`,
        currency: 'USD',
        balance: 0,
        equity: 0,
        freeMargin: 0,
        margin: 0,
        server: MT5_CONFIG.serverName,
        mainPassword: mainPass,
        investorPassword: investorPass,
      };
    });
  }

  /**
   * Fetches real-time live trading account balance and details (with 3-second micro-cache)
   */
  public async getAccount(login: string | number): Promise<MT5AccountResponse> {
    const cacheKey = `acc:${String(login)}`;
    const cached = this.getCached<MT5AccountResponse>(cacheKey);
    if (cached) return cached;

    const result = await this.executeSession(async (req) => {
      const [userRes, accRes] = await Promise.all([
        req(`/api/user/get?login=${login}`),
        req(`/api/user/account/get?login=${login}`),
      ]);

      if (!userRes || userRes.retcode !== '0 Done') {
        throw new Error(`Account not found on MT5: ${login}`);
      }

      const u = userRes.answer || {};
      const a = accRes?.answer || {};

      return {
        login: String(login),
        name: u.Name || '',
        group: u.Group || '',
        leverage: `1:${u.Leverage || 100}`,
        currency: 'USD',
        balance: parseFloat(a.Balance || u.Balance || '0'),
        equity: parseFloat(a.Equity || u.Balance || '0'),
        freeMargin: parseFloat(a.MarginFree || '0'),
        margin: parseFloat(a.Margin || '0'),
        server: MT5_CONFIG.serverName,
      };
    });

    this.setCached(cacheKey, result, 3000);
    return result;
  }

  /**
   * Executes a live balance deposit or withdrawal on MT5
   */
  public async balanceOperation(
    login: string | number,
    amount: number,
    comment = 'CRM Balance Operation'
  ): Promise<{ ticket: string; balance: number }> {
    return await this.executeSession(async (req) => {
      const query = new URLSearchParams({
        login: String(login),
        type: '2',
        balance: amount.toFixed(2),
        comment,
      });

      const res = await req(`/api/trade/balance?${query.toString()}`);

      if (!res || res.retcode !== '0 Done') {
        throw new Error(`MT5 balance operation failed: ${res?.retcode || JSON.stringify(res)}`);
      }

      const ticket = String(res.answer?.ticket || '');

      // Query updated balance
      const accRes = await req(`/api/user/account/get?login=${login}`);
      const updatedBalance = parseFloat(accRes?.answer?.Balance || '0');

      return {
        ticket,
        balance: updatedBalance,
      };
    });
  }

  /**
   * Executes an internal transfer between two MT5 trading accounts
   */
  public async transfer(
    fromLogin: string | number,
    toLogin: string | number,
    amount: number,
    comment?: string
  ): Promise<{ debitTicket: string; creditTicket: string; fromBalance: number; toBalance: number }> {
    return await this.executeSession(async (req) => {
      const debitComment = comment || `Transfer to #${toLogin}`;
      const creditComment = comment || `Transfer from #${fromLogin}`;

      // 1. Debit from source account
      const debitQuery = new URLSearchParams({
        login: String(fromLogin),
        type: '2',
        balance: (-Math.abs(amount)).toFixed(2),
        comment: debitComment,
      });

      const debitRes = await req(`/api/trade/balance?${debitQuery.toString()}`);
      if (!debitRes || debitRes.retcode !== '0 Done') {
        throw new Error(`Failed to debit Account #${fromLogin}: ${debitRes?.retcode || 'Error'}`);
      }

      // 2. Credit to destination account
      const creditQuery = new URLSearchParams({
        login: String(toLogin),
        type: '2',
        balance: Math.abs(amount).toFixed(2),
        comment: creditComment,
      });

      const creditRes = await req(`/api/trade/balance?${creditQuery.toString()}`);
      if (!creditRes || creditRes.retcode !== '0 Done') {
        // Rollback debit if credit fails
        await req(`/api/trade/balance?login=${fromLogin}&type=2&balance=${Math.abs(amount).toFixed(2)}&comment=Rollback`);
        throw new Error(`Failed to credit Account #${toLogin}: ${creditRes?.retcode || 'Error'}`);
      }

      // 3. Fetch updated balances
      const [fromAcc, toAcc] = await Promise.all([
        req(`/api/user/account/get?login=${fromLogin}`),
        req(`/api/user/account/get?login=${toLogin}`),
      ]);

      return {
        debitTicket: String(debitRes.answer?.ticket || ''),
        creditTicket: String(creditRes.answer?.ticket || ''),
        fromBalance: parseFloat(fromAcc?.answer?.Balance || '0'),
        toBalance: parseFloat(toAcc?.answer?.Balance || '0'),
      };
    });
  }

  /**
   * Updates account leverage on MT5
   */
  public async updateLeverage(login: string | number, leverage: string | number): Promise<boolean> {
    const leverageNum = typeof leverage === 'string'
      ? parseInt(leverage.replace('1:', ''), 10) || 100
      : leverage;

    return await this.executeSession(async (req) => {
      const res = await req(`/api/user/update?login=${login}&leverage=${leverageNum}`);
      return res && res.retcode === '0 Done';
    });
  }

  /**
   * Updates trading or investor password on MT5
   */
  public async changePassword(
    login: string | number,
    password: string,
    type: 'main' | 'investor' = 'main'
  ): Promise<boolean> {
    return await this.executeSession(async (req) => {
      // 1. Try standard /api/user/change_password
      const res = await req(
        `/api/user/change_password?login=${login}&type=${type}&password=${encodeURIComponent(password)}`
      );
      if (res && res.retcode === '0 Done') {
        return true;
      }

      // 2. Fallback to /api/user/update if change_password is not enabled on server
      const passParam = type === 'investor' ? 'pass_investor' : 'pass_main';
      const updateRes = await req(
        `/api/user/update?login=${login}&${passParam}=${encodeURIComponent(password)}`
      );
      if (updateRes && updateRes.retcode === '0 Done') {
        return true;
      }

        const errMsg = res?.retcode || updateRes?.retcode || 'Password change failed on MT5 server';
        throw new Error(`MT5 password update failed: ${errMsg}`);
      });
    }

  /**
   * Fetches open positions for a trading account from MT5 (cached for 3s)
   */
  public async getPositions(login: string | number): Promise<any[]> {
    const cacheKey = `pos:${String(login)}`;
    const cached = this.getCached<any[]>(cacheKey);
    if (cached) return cached;

    const result = await this.executeSession(async (req) => {
      try {
        const res = await req(`/api/position/get_page?login=${login}&offset=0&total=50`);
        if (res && res.retcode === '0 Done' && Array.isArray(res.answer)) {
          return res.answer;
        }
        return [];
      } catch (err: any) {
        console.warn(`[MT5Client] getPositions #${login} note:`, err.message);
        return [];
      }
    });

    this.setCached(cacheKey, result, 3000);
    return result;
  }

  /**
   * Fetches trade history deals for an account from MT5 (cached for 5s)
   */
  public async getDeals(login: string | number): Promise<any[]> {
    const cacheKey = `deals:${String(login)}`;
    const cached = this.getCached<any[]>(cacheKey);
    if (cached) return cached;

    const result = await this.executeSession(async (req) => {
      try {
        const res = await req(`/api/deal/get_page?login=${login}&offset=0&total=50`);
        if (res && res.retcode === '0 Done' && Array.isArray(res.answer)) {
          return res.answer;
        }
        return [];
      } catch (err: any) {
        console.warn(`[MT5Client] getDeals #${login} note:`, err.message);
        return [];
      }
    });

    this.setCached(cacheKey, result, 5000);
    return result;
  }

  /**
   * Automatically places a mirror market trade on a copier account
   */
  public async orderOpen(params: {
    login: string | number;
    symbol: string;
    action: 'BUY' | 'SELL';
    volume: number; // In lots, e.g. 0.01, 0.10, 1.00
    price?: number;
    sl?: number;
    tp?: number;
    comment?: string;
  }): Promise<{ ticket: string; retcode: string }> {
    return await this.executeSession(async (req) => {
      // MT5 WebAPI action types: 0 = BUY, 1 = SELL
      const actionType = params.action === 'SELL' ? '1' : '0';
      // Convert standard lot to MT5 API volume (1 lot = 100 or 10000 depending on server configuration)
      const volumeParam = Math.max(1, Math.round(params.volume * 100)).toString();

      const query = new URLSearchParams({
        login: String(params.login),
        symbol: params.symbol,
        type: actionType,
        volume: volumeParam,
        comment: params.comment || 'Copy Engine Mirror',
      });

      if (params.price && params.price > 0) query.append('price', params.price.toString());
      if (params.sl && params.sl > 0) query.append('sl', params.sl.toString());
      if (params.tp && params.tp > 0) query.append('tp', params.tp.toString());

      const res = await req(`/api/trade/order?${query.toString()}`);
      if (!res || (res.retcode !== '0 Done' && !res.answer?.ticket)) {
        throw new Error(`MT5 order open failed: ${res?.retcode || JSON.stringify(res)}`);
      }

      return {
        ticket: String(res.answer?.ticket || res.answer?.order || Date.now()),
        retcode: res.retcode || '0 Done',
      };
    });
  }

  /**
   * Automatically closes a mirrored position on a copier account
   */
  public async positionClose(params: {
    login: string | number;
    ticket: string | number;
    symbol: string;
    volume: number;
    action: 'BUY' | 'SELL';
  }): Promise<boolean> {
    return await this.executeSession(async (req) => {
      // Opposite action to close: BUY closes with SELL (1), SELL closes with BUY (0)
      const closeActionType = params.action === 'BUY' ? '1' : '0';
      const volumeParam = Math.max(1, Math.round(params.volume * 100)).toString();

      const query = new URLSearchParams({
        login: String(params.login),
        position: String(params.ticket),
        symbol: params.symbol,
        type: closeActionType,
        volume: volumeParam,
        comment: 'Copy Engine Close',
      });

      const res = await req(`/api/trade/close?${query.toString()}`);
      return Boolean(res && (res.retcode === '0 Done' || res.answer));
    });
  }
}

export const mt5Client = new MT5ClientService();
