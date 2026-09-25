import { NextRequest, NextResponse } from 'next/server';
import { mt5Client } from '@/services/mt5/mt5Client';
import { validateOrigin, checkRateLimit, getClientIP, sanitizeAmount, sanitizeString } from '@/lib/security';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    // 1. Origin verification
    if (!validateOrigin(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized request origin' },
        { status: 403 }
      );
    }

    // 2. Rate limiting (max 15 transfers per minute per IP)
    const clientIP = getClientIP(req);
    const rateCheck = checkRateLimit(`${clientIP}:transfer`, 15, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Transfer rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      );
    }

    // 3. Input validation
    const body = await req.json();
    const fromLogin = parseInt(String(body.fromLogin), 10);
    const toLogin = parseInt(String(body.toLogin), 10);
    const validAmount = sanitizeAmount(body.amount, 1, 100000);
    const safeComment = sanitizeString(body.comment || '', 64);

    if (!fromLogin || !toLogin || isNaN(fromLogin) || isNaN(toLogin)) {
      return NextResponse.json(
        { success: false, error: 'Valid source and destination accounts are required' },
        { status: 400 }
      );
    }

    if (fromLogin === toLogin) {
      return NextResponse.json(
        { success: false, error: 'Source and destination accounts cannot be identical' },
        { status: 400 }
      );
    }

    if (!validAmount) {
      return NextResponse.json(
        { success: false, error: 'Valid transfer amount is required' },
        { status: 400 }
      );
    }

    const result = await mt5Client.transfer(fromLogin, toLogin, validAmount, safeComment);

    // 4. Record into live Supabase PostgreSQL database
    try {
      const txId = `tx_${Date.now()}`;
      const refId = `TRF-${fromLogin}-${toLogin}-${Date.now().toString().slice(-4)}`;
      const clientId = body.clientId || 'cli_portal';
      const clientName = sanitizeString(body.clientName || 'Live Trader', 100);
      const clientEmail = sanitizeString(body.clientEmail || 'trader@client.com', 100);

      // Record in transactions ledger
      await supabaseAdmin.from('transactions').insert({
        id: txId,
        reference_id: refId,
        client_id: clientId,
        client_name: clientName,
        client_email: clientEmail,
        account_login: fromLogin,
        type: 'transfer',
        amount: validAmount,
        currency: 'USD',
        status: 'completed',
        method: 'Internal Transfer',
        remarks: `Transfer to #${toLogin}`,
      });

      // Update source and destination account balances
      const { data: fromAcc } = await supabaseAdmin.from('trading_accounts').select('balance').eq('login', fromLogin).single();
      const { data: toAcc } = await supabaseAdmin.from('trading_accounts').select('balance').eq('login', toLogin).single();

      if (fromAcc) {
        const fromBal = Math.max(0, (parseFloat(fromAcc.balance) || 0) - validAmount);
        await supabaseAdmin.from('trading_accounts').update({ balance: fromBal, updated_at: new Date().toISOString() }).eq('login', fromLogin);
      }
      if (toAcc) {
        const toBal = (parseFloat(toAcc.balance) || 0) + validAmount;
        await supabaseAdmin.from('trading_accounts').update({ balance: toBal, updated_at: new Date().toISOString() }).eq('login', toLogin);
      }
    } catch (dbErr: any) {
      console.error('[API /api/mt5/trade/transfer] Supabase Persistence Warning:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('[API /api/mt5/trade/transfer] Error:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal transfer could not be completed on MT5.',
      },
      { status: 500 }
    );
  }
}
