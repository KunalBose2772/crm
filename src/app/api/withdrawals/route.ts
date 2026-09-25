import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateOrigin, sanitizeString } from '@/lib/security';
import { sendEmail } from '@/lib/mail';
import { getBrokerSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized origin' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const login = searchParams.get('login');

    let query = supabaseAdmin
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false });

    if (clientId) {
      query = query.eq('client_id', clientId);
    } else if (login) {
      query = query.eq('account_login', parseInt(login, 10));
    }

    const { data: rows, error } = await query;
    if (error) throw error;

    const formattedWithdrawals = (rows || []).map((r: any) => ({
      id: r.id,
      clientId: r.client_id,
      clientName: r.client_name,
      clientEmail: r.client_email,
      tradingAccountId: r.trading_account_id || (r.account_login ? `acc_${r.account_login}` : ''),
      accountLogin: Number(r.account_login),
      requestedAmount: parseFloat(r.requested_amount) || 0,
      fee: parseFloat(r.fee) || 0,
      netAmount: parseFloat(r.net_amount) || 0,
      currency: r.currency || 'USD',
      paymentMethod: r.payment_method || 'bank_transfer',
      destinationType: r.destination_type || 'Bank_Account',
      destinationDetails: r.destination_details || {},
      status: r.status,
      rejectReason: r.rejection_reason,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      plan: 'STANDARD',
    }));

    return NextResponse.json({ success: true, withdrawals: formattedWithdrawals });
  } catch (error: any) {
    console.error('[API /api/withdrawals GET] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized origin' }, { status: 403 });
    }

    const body = await req.json();
    const id = body.id || `wdr_${Date.now()}`;
    const clientId = sanitizeString(body.clientId || 'cli_portal', 60);
    const clientName = sanitizeString(body.clientName || 'Trader', 80);
    const clientEmail = sanitizeString(body.clientEmail || 'client@tradingdesk.com', 100);
    const accountLogin = parseInt(String(body.accountLogin || '0'), 10);
    const requestedAmount = parseFloat(String(body.requestedAmount || '0'));
    const fee = parseFloat(String(body.fee || '0'));
    const netAmount = Math.max(0, requestedAmount - fee);
    const currency = sanitizeString(body.currency || 'USD', 10);
    const paymentMethod = sanitizeString(body.paymentMethod || 'bank_transfer', 50);
    const destinationType = sanitizeString(body.destinationType || 'Bank_Account', 50);
    const destinationDetails = body.destinationDetails || {};

    if (requestedAmount <= 0 || !accountLogin) {
      return NextResponse.json({
        success: false,
        error: 'Valid account login and withdrawal amount greater than 0 are required'
      }, { status: 400 });
    }

    // Check account available balance before accepting request
    const { data: currentAcc } = await supabaseAdmin
      .from('trading_accounts')
      .select('balance')
      .eq('login', accountLogin)
      .maybeSingle();

    const currentBalance = parseFloat(currentAcc?.balance) || 0;
    if (requestedAmount > currentBalance) {
      return NextResponse.json({
        success: false,
        error: `Insufficient balance. Account #${accountLogin} has $${currentBalance.toFixed(2)} available.`
      }, { status: 400 });
    }

    // Insert into live Supabase withdrawals table
    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('withdrawals')
      .insert({
        id,
        client_id: clientId,
        client_name: clientName,
        client_email: clientEmail,
        account_login: accountLogin,
        requested_amount: requestedAmount,
        fee,
        net_amount: netAmount,
        currency,
        payment_method: paymentMethod,
        destination_type: destinationType,
        destination_details: destinationDetails,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertErr) {
      console.error('[API /api/withdrawals POST] Insert error:', insertErr.message);
      return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 });
    }

    // Notify Admin via email
    try {
      const brokerSettings = await getBrokerSettings();
      if (brokerSettings.adminNotificationEmail) {
        sendEmail({
          to: brokerSettings.adminNotificationEmail,
          subject: `🔔 New Withdrawal Request: $${requestedAmount.toLocaleString()} from Account #${accountLogin}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #1e3a8a; margin-top: 0;">New Payout / Withdrawal Request</h2>
              <p>A new withdrawal request has been submitted by <strong>${clientName}</strong> (${clientEmail}):</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Requested Amount:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #dc2626;">$${requestedAmount.toLocaleString()} ${currency}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Account Login:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-family: monospace; font-weight: bold;">#${accountLogin}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Destination:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${destinationType} (${paymentMethod})</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Net Payout:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">$${netAmount.toLocaleString()} ${currency}</td></tr>
              </table>
              <p>Log in to the Admin Panel &rarr; <strong>Withdrawals</strong> to review and process or reject this request.</p>
            </div>
          `,
        }).catch(err => console.warn('[API /api/withdrawals POST] Email dispatch warning:', err.message));
      }
    } catch {}

    const formatted = {
      id: inserted.id,
      clientId: inserted.client_id,
      clientName: inserted.client_name,
      clientEmail: inserted.client_email,
      tradingAccountId: `acc_${inserted.account_login}`,
      accountLogin: Number(inserted.account_login),
      requestedAmount: parseFloat(inserted.requested_amount),
      fee: parseFloat(inserted.fee || 0),
      netAmount: parseFloat(inserted.net_amount),
      currency: inserted.currency || 'USD',
      paymentMethod: inserted.payment_method,
      destinationType: inserted.destination_type,
      destinationDetails: inserted.destination_details || {},
      status: inserted.status,
      createdAt: inserted.created_at,
      updatedAt: inserted.updated_at,
      plan: 'STANDARD',
    };

    return NextResponse.json({ success: true, withdrawal: formatted });
  } catch (error: any) {
    console.error('[API /api/withdrawals POST] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized origin' }, { status: 403 });
    }

    const body = await req.json();
    const id = sanitizeString(body.id || '', 60);
    const status = sanitizeString(body.status || '', 30); // 'completed' | 'processing' | 'rejected'
    const rejectReason = sanitizeString(body.rejectReason || body.reason || '', 500);

    if (!id || !['completed', 'processing', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Valid id and status (completed, processing, or rejected) required' }, { status: 400 });
    }

    // Fetch existing withdrawal record
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ success: false, error: 'Withdrawal not found' }, { status: 404 });
    }

    const updatePayload: any = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (rejectReason) {
      updatePayload.rejection_reason = rejectReason;
    }

    const { data: updated, error } = await supabaseAdmin
      .from('withdrawals')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // When withdrawal is completed (approved), deduct from trading account & record transaction
    if (status === 'completed' && existing.status !== 'completed') {
      try {
        const withdrawAmount = parseFloat(updated.requested_amount) || 0;
        const login = Number(updated.account_login);

        if (login && withdrawAmount > 0) {
          // 1. Fetch current trading account balance
          const { data: currentAcc } = await supabaseAdmin
            .from('trading_accounts')
            .select('balance')
            .eq('login', login)
            .single();

          const prevBal = parseFloat(currentAcc?.balance) || 0;
          const newBalance = Math.max(0, prevBal - withdrawAmount);

          // 2. Update trading account balance
          await supabaseAdmin
            .from('trading_accounts')
            .update({
              balance: newBalance,
              updated_at: new Date().toISOString()
            })
            .eq('login', login);

          // 3. Record transaction in ledger
          const txRef = `WDR-${login}-${Date.now().toString().slice(-6)}`;
          await supabaseAdmin.from('transactions').insert({
            id: `tx_${Date.now()}`,
            reference_id: txRef,
            client_id: updated.client_id,
            client_name: updated.client_name,
            client_email: updated.client_email,
            account_login: login,
            type: 'withdrawal',
            amount: withdrawAmount,
            currency: updated.currency || 'USD',
            status: 'completed',
            method: updated.destination_type === 'Crypto_Wallet' ? 'Crypto Payout' : 'Bank Wire',
            remarks: `Approved withdrawal of $${withdrawAmount} from Account #${login}`,
            created_at: new Date().toISOString()
          });
        }
      } catch (debitErr: any) {
        console.warn('[API /api/withdrawals PATCH] Balance debit warning:', debitErr.message);
      }
    }

    return NextResponse.json({ success: true, withdrawal: updated });
  } catch (error: any) {
    console.error('[API /api/withdrawals PATCH] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
