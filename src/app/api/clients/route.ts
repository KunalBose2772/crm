import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateOrigin, sanitizeString } from '@/lib/security';
import { mt5Client } from '@/services/mt5/mt5Client';
import { MT5_ACCOUNT_MAPPING } from '@/config/mt5';
import { getAccountGroups } from '@/app/api/mt5/groups/route';
import { sendEmail, emailTemplates } from '@/lib/mail';

export async function GET(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized origin' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    let clientQuery = supabaseAdmin.from('clients').select('*').order('created_at', { ascending: false });
    if (clientId) {
      clientQuery = clientQuery.eq('id', clientId);
    }
    const { data: clients, error: clientErr } = await clientQuery;
    if (clientErr) throw clientErr;

    // Fetch accounts
    const { data: accounts, error: accErr } = await supabaseAdmin
      .from('trading_accounts')
      .select('*')
      .order('created_at', { ascending: false });
    // Fetch deposits to aggregate client's total approved deposits
    const { data: allDeposits } = await supabaseAdmin
      .from('deposits')
      .select('client_id, amount, status')
      .eq('status', 'completed');

    // Fetch withdrawals to aggregate client's total approved payouts
    const { data: allWithdrawals } = await supabaseAdmin
      .from('withdrawals')
      .select('client_id, requested_amount, status')
      .eq('status', 'completed');

    const formattedClients = clients.map((c: any) => {
      const clientAccounts = (accounts || [])
        .filter((a: any) => a.client_id === c.id)
        .map((a: any) => {
          const bal = parseFloat(a.balance) || 0;
          const eqRaw = parseFloat(a.equity) || 0;
          const eq = eqRaw > 0 ? eqRaw : bal;
          const fmRaw = parseFloat(a.free_margin) || 0;
          const fm = fmRaw > 0 ? fmRaw : bal;
          return {
            id: a.id,
            login: Number(a.login),
            type: a.account_type || 'Standard',
            group: a.mt5_group,
            server: a.server,
            currency: a.currency,
            leverage: a.leverage,
            balance: bal,
            equity: eq,
            freeMargin: fm,
            margin: parseFloat(a.margin) || 0,
            status: a.status,
            createdAt: a.created_at,
          };
        });

      const computedTotalBalance = clientAccounts.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0);
      const computedTotalEquity = clientAccounts.reduce((sum: number, acc: any) => sum + (acc.equity || acc.balance || 0), 0);
      const computedTotalDeposit = (allDeposits || [])
        .filter((d: any) => d.client_id === c.id)
        .reduce((sum: number, d: any) => sum + (parseFloat(d.amount) || 0), 0);
      const computedTotalWithdrawal = (allWithdrawals || [])
        .filter((w: any) => w.client_id === c.id)
        .reduce((sum: number, w: any) => sum + (parseFloat(w.requested_amount) || 0), 0);

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || '',
        country: c.country || 'India',
        city: c.city || 'Headquarters',
        status: c.status || 'pending',
        registeredAt: c.created_at,
        emailVerified: !!c.email_verified,
        kycVerified: !!c.kyc_verified,
        ibPartnerStatus: c.ib_partner_status,
        totalDeposit: computedTotalDeposit,
        totalWithdrawal: computedTotalWithdrawal,
        netDeposit: Math.max(0, computedTotalDeposit - computedTotalWithdrawal),
        totalBalance: computedTotalBalance,
        totalEquity: computedTotalEquity,
        joinedAt: c.created_at,
        accounts: clientAccounts,
      };
    });

    return NextResponse.json({ success: true, clients: formattedClients });
  } catch (error: any) {
    console.error('[API /api/clients] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized origin' }, { status: 403 });
    }

    const body = await req.json();
    const name = sanitizeString(body.name || '', 60);
    const email = sanitizeString(body.email || '', 100);
    const phone = sanitizeString(body.phone || '', 30);
    const country = sanitizeString(body.country || 'India', 60);
    const city = sanitizeString(body.city || 'Headquarters', 60);

    if (!name || !email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid client name and email address are required' }, { status: 400 });
    }

    const clientId = `cli_${Date.now()}`;
    const generatedPassword = body.password || `Nd1#${Math.random().toString(36).substring(2, 8).toUpperCase()}!`;
    const verificationToken = `vtok_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // 1. Save client with unverified status and verification token
    const { error: insertErr } = await supabaseAdmin.from('clients').insert({
      id: clientId,
      name,
      email,
      phone,
      country,
      status: 'pending',
      email_verified: false,
      kyc_verified: false,
      verification_token: verificationToken,
      password_hash: generatedPassword,
      total_balance: 0.00,
      total_equity: 0.00,
    });

    if (insertErr) {
      console.error('[API /api/clients] Insert client error:', insertErr.message);
      return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 });
    }

    // 2. Automatically provision primary MetaTrader 5 live standard account
    let createdAccount: any = null;
    try {
      const activeGroups = await getAccountGroups();
      const mapping = activeGroups.STANDARD || MT5_ACCOUNT_MAPPING.STANDARD;
      createdAccount = await mt5Client.createAccount({
        name,
        email,
        group: mapping.group,
        leverage: mapping.defaultLeverage,
      });

      if (createdAccount && createdAccount.login) {
        await supabaseAdmin.from('trading_accounts').insert({
          id: `acc_${createdAccount.login}`,
          client_id: clientId,
          login: parseInt(String(createdAccount.login), 10),
          account_type: 'STANDARD',
          mt5_group: mapping.group,
          server: mapping.server,
          currency: 'USD',
          leverage: mapping.defaultLeverage,
          balance: 0.00,
          equity: 0.00,
          status: 'active',
        });
      }
    } catch (mt5Err: any) {
      console.warn('[API /api/clients] MT5 auto-provisioning note:', mt5Err.message);
    }

    // 3. Resolve verification URL
    const hostHeader = req.headers.get('host') || 'localhost:3000';
    const proto = hostHeader.includes('localhost') ? 'http' : 'https';
    const verifyUrl = `${proto}://${hostHeader}/verify-email?token=${verificationToken}`;

    // 4. Send Register Verification email first (Template 1)
    sendEmail({
      to: email,
      ...emailTemplates.registerVerification(
        name,
        verifyUrl
      ),
    }).catch(mailErr => console.warn('[API /api/clients] Verification email dispatch warning:', mailErr.message));

    return NextResponse.json({
      success: true,
      client: {
        id: clientId,
        name,
        email,
        phone,
        country,
        city,
        status: 'pending',
        registeredAt: new Date().toISOString(),
        emailVerified: false,
        kycVerified: false,
        totalBalance: 0,
        totalEquity: 0,
        accounts: createdAccount ? [{
          id: `acc_${createdAccount.login}`,
          login: Number(createdAccount.login),
          accountType: 'STANDARD',
          group: createdAccount.group,
          server: createdAccount.server || 'TheKFMarket-Live',
          currency: 'USD',
          leverage: '1:500',
          balance: 0,
          equity: 0,
          freeMargin: 0,
          margin: 0,
          status: 'active',
          createdAt: new Date().toISOString(),
        }] : [],
      },
      verificationUrl: verifyUrl,
    });
  } catch (err: any) {
    console.error('[API /api/clients] POST Error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized origin' }, { status: 403 });
    }

    const body = await req.json();
    const { clientId, password } = body;

    if (!clientId || !password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Client ID and a password of at least 6 characters are required.' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('clients')
      .update({
        password_hash: password,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId);

    if (error) {
      console.error('[API /api/clients] PATCH Error:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Client credentials updated successfully.',
    });
  } catch (err: any) {
    console.error('[API /api/clients] PATCH Error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
