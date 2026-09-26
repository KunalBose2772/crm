import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { mt5Client } from '@/services/mt5/mt5Client';
import { validateOrigin } from '@/lib/security';

export interface ContestTrade {
  ticket: string;
  accountLogin: number;
  clientName: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  lots: number;
  openPrice: number;
  currentPrice: number;
  closePrice?: number;
  profit: number;
  profitPercent: number;
  openTime: string;
  closeTime?: string;
  status: 'open' | 'closed';
}

export interface ContestLeaderboardRank {
  rank: number;
  accountLogin: number;
  clientName: string;
  country: string;
  totalTrades: number;
  winRate: number;
  netProfit: number;
  growthPercent: number;
  equity: number;
  balance: number;
  status: 'active' | 'qualified';
}

export async function GET(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized origin' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const loginParam = searchParams.get('login');
    const clientIdParam = searchParams.get('clientId');

    // 1. Fetch real trading accounts and clients from Supabase
    const [{ data: dbAccounts }, { data: dbClients }] = await Promise.all([
      supabaseAdmin.from('trading_accounts').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('clients').select('id, name, email, country, status'),
    ]);

    const accounts = dbAccounts || [];
    const clients = dbClients || [];

    // Client lookup map
    const clientMap = new Map<string, any>();
    clients.forEach(c => clientMap.set(c.id, c));

    // 2. Fetch live MT5 positions, deals, and balances for real accounts
    // Concurrency optimization: Process accounts in batches of 10 to prevent socket pool exhaustion
    const mt5DataMap = new Map<number, { positions: any[]; deals: any[]; balance: number; equity: number }>();
    const BATCH_SIZE = 10;

    for (let i = 0; i < accounts.length; i += BATCH_SIZE) {
      const batch = accounts.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (acc) => {
          const loginNum = Number(acc.login);
          try {
            const [mt5Acc, positions, deals] = await Promise.all([
              mt5Client.getAccount(loginNum).catch(() => null),
              mt5Client.getPositions(loginNum).catch(() => []),
              mt5Client.getDeals(loginNum).catch(() => []),
            ]);

            const bal = mt5Acc ? mt5Acc.balance : (parseFloat(acc.balance) || 0);
            const eq = mt5Acc ? mt5Acc.equity : (parseFloat(acc.equity) || bal);

            mt5DataMap.set(loginNum, {
              positions: positions || [],
              deals: deals || [],
              balance: bal,
              equity: eq,
            });
          } catch {
            mt5DataMap.set(loginNum, {
              positions: [],
              deals: [],
              balance: parseFloat(acc.balance) || 0,
              equity: parseFloat(acc.equity) || 0,
            });
          }
        })
      );
    }

    // 3. Transform real MT5 positions and deals into ContestTrade objects
    const openTrades: ContestTrade[] = [];
    const closedTrades: ContestTrade[] = [];

    accounts.forEach((acc) => {
      const loginNum = Number(acc.login);
      const client = clientMap.get(acc.client_id) || { name: 'Trader #' + acc.login };
      const mt5Info = mt5DataMap.get(loginNum);

      if (!mt5Info) return;

      // Real open positions from MT5 WebAPI
      mt5Info.positions.forEach((pos: any) => {
        const rawAction = String(pos.Action || '0');
        const posType: 'BUY' | 'SELL' = rawAction === '1' ? 'SELL' : 'BUY';
        const openPrice = parseFloat(pos.PriceOpen || '0');
        const currentPrice = parseFloat(pos.PriceCurrent || pos.PriceOpen || '0');
        const profit = parseFloat(pos.Profit || '0');
        // Volume in MT5 WebAPI: 100 volume units = 1.00 lot (or contractSize dependent)
        const volumeUnits = parseFloat(pos.Volume || '100');
        const lots = parseFloat((volumeUnits / 100).toFixed(2)) || 0.01;
        const timeCreateSec = parseInt(pos.TimeCreate || '0', 10);
        const openDate = timeCreateSec > 0 ? new Date(timeCreateSec * 1000) : new Date();

        openTrades.push({
          ticket: `TK-${pos.Position || pos.ExpertPositionID || loginNum}`,
          accountLogin: loginNum,
          clientName: client.name,
          symbol: String(pos.Symbol || 'FOREX'),
          type: posType,
          lots,
          openPrice,
          currentPrice,
          profit,
          profitPercent: mt5Info.balance > 0 ? parseFloat(((profit / mt5Info.balance) * 100).toFixed(2)) : 0,
          openTime: openDate.toLocaleString(),
          status: 'open',
        });
      });

      // Real trade deals from MT5 WebAPI (Action 0 = Buy deal, Action 1 = Sell deal, ignore Action 2 = Balance)
      mt5Info.deals.forEach((deal: any) => {
        const actionStr = String(deal.Action || '');
        if (actionStr === '2') return; // Skip deposits/transfers/withdrawals

        const dealType: 'BUY' | 'SELL' = actionStr === '1' ? 'SELL' : 'BUY';
        const price = parseFloat(deal.Price || '0');
        const profit = parseFloat(deal.Profit || '0');
        const volumeUnits = parseFloat(deal.Volume || '100');
        const lots = parseFloat((volumeUnits / 100).toFixed(2)) || 0.01;
        const timeSec = parseInt(deal.Time || '0', 10);
        const dealDate = timeSec > 0 ? new Date(timeSec * 1000) : new Date();

        closedTrades.push({
          ticket: `TK-D${deal.Deal || deal.Order || loginNum}`,
          accountLogin: loginNum,
          clientName: client.name,
          symbol: String(deal.Symbol || 'MARKET'),
          type: dealType,
          lots,
          openPrice: price,
          currentPrice: price,
          closePrice: price,
          profit,
          profitPercent: mt5Info.balance > 0 ? parseFloat(((profit / mt5Info.balance) * 100).toFixed(2)) : 0,
          openTime: dealDate.toLocaleString(),
          closeTime: dealDate.toLocaleString(),
          status: 'closed',
        });
      });
    });

    // 4. Compute real Leaderboard from live MT5 account telemetry
    const leaderboard: ContestLeaderboardRank[] = accounts.map((acc, index) => {
      const loginNum = Number(acc.login);
      const client = clientMap.get(acc.client_id) || { name: 'Trader #' + acc.login, country: 'United Kingdom' };
      const mt5Info = mt5DataMap.get(loginNum) || {
        positions: [],
        deals: [],
        balance: parseFloat(acc.balance) || 0,
        equity: parseFloat(acc.equity) || 0,
      };

      const bal = mt5Info.balance;
      const eq = mt5Info.equity;

      // Filter closed deals for this account
      const accountDeals = mt5Info.deals.filter((d: any) => String(d.Action) !== '2');
      const accountPositions = mt5Info.positions;
      const totalTrades = accountDeals.length + accountPositions.length;
      
      const profitableTrades = accountDeals.filter((d: any) => parseFloat(d.Profit || '0') > 0).length +
        accountPositions.filter((p: any) => parseFloat(p.Profit || '0') > 0).length;

      const winRate = totalTrades > 0 ? Math.round((profitableTrades / totalTrades) * 100) : 0;
      
      // Real net profit: equity minus initial benchmark (or total floating + closed deal profit)
      const floatingProfit = accountPositions.reduce((sum: number, p: any) => sum + (parseFloat(p.Profit) || 0), 0);
      const closedProfit = accountDeals.reduce((sum: number, d: any) => sum + (parseFloat(d.Profit) || 0), 0);
      const netProfit = parseFloat((floatingProfit + closedProfit).toFixed(2));
      const growthPercent = bal > 0 ? parseFloat(((netProfit / bal) * 100).toFixed(2)) : 0;

      return {
        rank: index + 1,
        accountLogin: loginNum,
        clientName: client.name,
        country: client.country || 'Global',
        totalTrades,
        winRate,
        netProfit,
        growthPercent,
        equity: eq,
        balance: bal,
        status: 'active' as const,
      };
    });

    // Sort leaderboard by live equity / net profit
    leaderboard.sort((a, b) => b.equity - a.equity || b.netProfit - a.netProfit || b.winRate - a.winRate);
    leaderboard.forEach((item, idx) => { item.rank = idx + 1; });

    // 5. Filter trades by specific account login or client id
    let filteredOpen = openTrades;
    let filteredClosed = closedTrades;

    if (loginParam) {
      const targetLogin = parseInt(loginParam, 10);
      filteredOpen = openTrades.filter(t => t.accountLogin === targetLogin);
      filteredClosed = closedTrades.filter(t => t.accountLogin === targetLogin);
    } else if (clientIdParam) {
      const clientAccs = accounts.filter(a => a.client_id === clientIdParam).map(a => Number(a.login));
      filteredOpen = openTrades.filter(t => clientAccs.includes(t.accountLogin));
      filteredClosed = closedTrades.filter(t => clientAccs.includes(t.accountLogin));
    }

    const allFiltered = [...filteredOpen, ...filteredClosed];
    const bestResult = allFiltered.length > 0 ? Math.max(...allFiltered.map(t => t.profit)) : 0;
    const netVisiblePnl = parseFloat(allFiltered.reduce((sum, t) => sum + t.profit, 0).toFixed(2));

    return NextResponse.json({
      success: true,
      contest: {
        id: 'CONTEST-2026-Q3',
        title: 'Global Forex & Commodities Championship',
        status: 'Active',
        prizePoolUsd: 50000,
        startDate: '2026-09-01',
        endDate: '2026-10-31',
      },
      leaderboard,
      trades: {
        open: filteredOpen,
        closed: filteredClosed,
      },
      summary: {
        totalParticipants: accounts.length,
        openTradesCount: filteredOpen.length,
        closedTradesCount: filteredClosed.length,
        bestResult,
        netVisiblePnl,
      }
    });
  } catch (error: any) {
    console.error('[API /api/trading-contest] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
