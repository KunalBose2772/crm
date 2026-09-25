import { NextRequest, NextResponse } from 'next/server';
import { mt5Client } from '@/services/mt5/mt5Client';
import { validateOrigin, checkRateLimit, getClientIP, sanitizeAmount, sanitizeString } from '@/lib/security';
import { supabaseAdmin } from '@/lib/supabase';
import { sendEmail, emailTemplates } from '@/lib/mail';

export async function POST(req: NextRequest) {
  try {
    // 1. Origin verification to prevent CSRF
    if (!validateOrigin(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized request origin' },
        { status: 403 }
      );
    }

    // 2. Rate limiting (max 10 financial operations per minute per IP)
    const clientIP = getClientIP(req);
    const rateCheck = checkRateLimit(`${clientIP}:withdraw`, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many transaction requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    // 3. Input validation & sanitization
    const body = await req.json();
    const login = parseInt(String(body.login), 10);
    const validAmount = sanitizeAmount(body.amount, 0.01, 500000);
    const safeComment = sanitizeString(body.comment || 'CRM Withdrawal Payout', 64);

    if (!login || isNaN(login) || !validAmount) {
      return NextResponse.json(
        { success: false, error: 'Valid account login and withdrawal amount are required' },
        { status: 400 }
      );
    }

    // MT5 requires negative balance for debit/withdrawal
    const result = await mt5Client.balanceOperation(login, -Math.abs(validAmount), safeComment);

    // 4. Record into live Supabase PostgreSQL database
    try {
      const txId = `tx_${Date.now()}`;
      const refId = `WDR-${login}-${Date.now().toString().slice(-6)}`;

      // Resolve real client name and email from trading_accounts and clients tables if not explicitly passed
      let clientId = body.clientId;
      let clientName = body.clientName;
      let clientEmail = body.clientEmail;

      if (!clientId || !clientName || !clientEmail || clientName === 'Live Trader') {
        const { data: accRecord } = await supabaseAdmin
          .from('trading_accounts')
          .select('client_id')
          .eq('login', login)
          .maybeSingle();

        if (accRecord?.client_id) {
          const { data: clientRecord } = await supabaseAdmin
            .from('clients')
            .select('id, name, email')
            .eq('id', accRecord.client_id)
            .maybeSingle();

          if (clientRecord) {
            clientId = clientRecord.id;
            clientName = clientRecord.name;
            clientEmail = clientRecord.email;
          }
        }
      }

      clientId = clientId || 'cli_portal';
      clientName = sanitizeString(clientName || 'Valued Trader', 100);
      clientEmail = sanitizeString(clientEmail || 'client@tradingdesk.com', 100);

      // If skipLedgerRecord is true, the calling workflow (like PATCH /api/withdrawals) already recorded the transaction and deducted the balance
      if (!body.skipLedgerRecord) {
        // Record in transactions ledger
        await supabaseAdmin.from('transactions').insert({
          id: txId,
          reference_id: refId,
          client_id: clientId,
          client_name: clientName,
          client_email: clientEmail,
          account_login: login,
          type: 'withdrawal',
          amount: validAmount,
          currency: 'USD',
          status: 'completed',
          method: body.paymentMethod || 'Manual Withdrawal',
          remarks: safeComment,
        });

        // Decrement trading account balance
        const { data: acc } = await supabaseAdmin
          .from('trading_accounts')
          .select('balance')
          .eq('login', login)
          .single();

        if (acc) {
          const newBal = Math.max(0, (parseFloat(acc.balance) || 0) - validAmount);
          await supabaseAdmin
            .from('trading_accounts')
            .update({ balance: newBal, updated_at: new Date().toISOString() })
            .eq('login', login);
        }
      }
    } catch (dbErr: any) {
      console.error('[API /api/mt5/trade/withdraw] Supabase Persistence Warning:', dbErr.message);
    }

    // 5. Send automated transaction receipt via Hostinger SMTP (non-blocking)
    const clientEmail = sanitizeString(body.clientEmail || '', 100);
    const clientName = sanitizeString(body.clientName || 'Trader', 100);
    if (clientEmail && clientEmail.includes('@')) {
      sendEmail({
        to: clientEmail,
        ...emailTemplates.transactionReceipt(
          clientName,
          'Withdrawal',
          validAmount,
          'USD',
          result?.ticket ? `MT5 #${result.ticket}` : `WDR-${login}`
        ),
      }).catch(err => console.warn('[API /api/mt5/trade/withdraw] Receipt email warning:', err.message));
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('[API /api/mt5/trade/withdraw] Error:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Withdrawal operation could not be processed on MT5 at this time.',
      },
      { status: 500 }
    );
  }
}
