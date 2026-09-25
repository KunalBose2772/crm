import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateOrigin, sanitizeString } from '@/lib/security';
import { sendEmail, emailTemplates } from '@/lib/mail';
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
      .from('deposits')
      .select('*')
      .order('created_at', { ascending: false });

    if (clientId) {
      query = query.eq('client_id', clientId);
    } else if (login) {
      query = query.eq('account_login', parseInt(login, 10));
    }

    const { data: rows, error } = await query;
    if (error) throw error;

    const formattedDeposits = (rows || []).map((r: any) => ({
      id: r.id,
      clientId: r.client_id,
      clientName: r.client_name,
      clientEmail: r.client_email,
      tradingAccountId: r.trading_account_id || (r.account_login ? `acc_${r.account_login}` : ''),
      accountLogin: Number(r.account_login),
      amount: parseFloat(r.amount) || 0,
      currency: r.currency || 'USD',
      paymentMethod: r.payment_method || 'crypto_usdt',
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      plan: 'STANDARD',
      txHash: r.tx_hash,
      remarks: r.remarks || (r.receipt_url ? `Receipt: ${r.receipt_url}` : undefined),
    }));

    return NextResponse.json({ success: true, deposits: formattedDeposits });
  } catch (error: any) {
    console.error('[API /api/deposits GET] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized origin' }, { status: 403 });
    }

    const body = await req.json();
    const id = body.id || `dep_${Date.now()}`;
    const clientId = sanitizeString(body.clientId || 'cli_portal', 60);
    const clientName = sanitizeString(body.clientName || 'Trader', 80);
    const clientEmail = sanitizeString(body.clientEmail || 'client@tradingdesk.com', 100);
    const accountLogin = parseInt(String(body.accountLogin || '0'), 10);
    const amount = parseFloat(String(body.amount || '0'));
    const currency = sanitizeString(body.currency || 'USD', 10);
    const paymentMethod = sanitizeString(body.paymentMethod || 'crypto_usdt', 50);
    const txHash = sanitizeString(body.txHash || `TXN-${Math.floor(100000 + Math.random() * 900000)}`, 128);
    const remarks = sanitizeString(body.remarks || '', 500);

    if (amount <= 0 || !accountLogin) {
      return NextResponse.json({
        success: false,
        error: 'Valid account login and deposit amount greater than 0 are required'
      }, { status: 400 });
    }

    // Insert into live Supabase deposits table
    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('deposits')
      .insert({
        id,
        client_id: clientId,
        client_name: clientName,
        client_email: clientEmail,
        account_login: accountLogin,
        amount,
        currency,
        payment_method: paymentMethod,
        tx_hash: txHash,
        status: 'pending',
        remarks: remarks || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertErr) {
      console.error('[API /api/deposits POST] Error inserting deposit:', insertErr.message);
      return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 });
    }

    // Notify Admin via email
    try {
      const brokerSettings = await getBrokerSettings();
      if (brokerSettings.adminNotificationEmail) {
        sendEmail({
          to: brokerSettings.adminNotificationEmail,
          subject: `🔔 New Deposit Request: $${amount.toLocaleString()} for Account #${accountLogin}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
              <h2 style="color: #1e3a8a; margin-top: 0;">New Client Deposit Request</h2>
              <p>A new deposit request has been submitted by <strong>${clientName}</strong> (${clientEmail}):</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Amount:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #059669;">$${amount.toLocaleString()} ${currency}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Account Login:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-family: monospace; font-weight: bold;">${accountLogin}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Method:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${paymentMethod}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Reference / TXID:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-family: monospace;">${txHash}</td></tr>
                ${remarks ? `<tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Remarks / Proof:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${remarks}</td></tr>` : ''}
              </table>
              <p>Log in to the Admin Panel &rarr; <strong>Finance & Deposits</strong> to review and approve this deposit.</p>
            </div>
          `,
        }).catch(err => console.warn('[API /api/deposits POST] Email dispatch warning:', err.message));
      }
    } catch {}

    const formatted = {
      id: inserted.id,
      clientId: inserted.client_id,
      clientName: inserted.client_name,
      clientEmail: inserted.client_email,
      tradingAccountId: `acc_${inserted.account_login}`,
      accountLogin: Number(inserted.account_login),
      amount: parseFloat(inserted.amount),
      currency: inserted.currency || 'USD',
      paymentMethod: inserted.payment_method,
      status: inserted.status,
      createdAt: inserted.created_at,
      updatedAt: inserted.updated_at,
      plan: 'STANDARD',
      txHash: inserted.tx_hash,
      remarks: inserted.remarks,
    };

    return NextResponse.json({ success: true, deposit: formatted });
  } catch (error: any) {
    console.error('[API /api/deposits POST] Error:', error.message);
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
    const status = sanitizeString(body.status || '', 30); // 'completed' | 'rejected'
    const remarks = sanitizeString(body.remarks || '', 500);

    if (!id || (status !== 'completed' && status !== 'rejected')) {
      return NextResponse.json({ success: false, error: 'Valid id and status (completed or rejected) required' }, { status: 400 });
    }

    const { data: updated, error } = await supabaseAdmin
      .from('deposits')
      .update({
        status,
        remarks: remarks || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // When a deposit is approved (completed), update trading account balance & record transaction
    if (status === 'completed' && updated) {
      try {
        const depositAmount = parseFloat(updated.amount) || 0;
        const login = Number(updated.account_login);

        if (login && depositAmount > 0) {
          // 1. Fetch current trading account balance
          const { data: currentAcc } = await supabaseAdmin
            .from('trading_accounts')
            .select('balance')
            .eq('login', login)
            .single();

          const newBalance = (parseFloat(currentAcc?.balance) || 0) + depositAmount;

          // 2. Update trading account balance
          await supabaseAdmin
            .from('trading_accounts')
            .update({
              balance: newBalance,
              updated_at: new Date().toISOString()
            })
            .eq('login', login);

          // 3. Record transaction in ledger if not already recorded
          const txRef = `DEP-${login}-${Date.now().toString().slice(-6)}`;
          await supabaseAdmin.from('transactions').insert({
            id: `tx_${Date.now()}`,
            reference_id: txRef,
            client_id: updated.client_id,
            client_name: updated.client_name,
            client_email: updated.client_email,
            account_login: login,
            type: 'deposit',
            amount: depositAmount,
            currency: updated.currency || 'USD',
            status: 'completed',
            method: updated.payment_method || 'Deposit',
            remarks: `Approved deposit of $${depositAmount} for Account #${login}`,
            created_at: new Date().toISOString()
          });
        }
      } catch (creditErr: any) {
        console.warn('[API /api/deposits PATCH] Balance update warning:', creditErr.message);
      }
    }

    return NextResponse.json({ success: true, deposit: updated });
  } catch (error: any) {
    console.error('[API /api/deposits PATCH] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
