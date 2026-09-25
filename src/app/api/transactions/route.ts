import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateOrigin } from '@/lib/security';

export async function GET(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized origin' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const login = searchParams.get('login');
    const clientId = searchParams.get('clientId');

    let queryBuilder = supabaseAdmin
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (login) {
      queryBuilder = queryBuilder.eq('account_login', parseInt(login, 10));
    } else if (clientId) {
      queryBuilder = queryBuilder.eq('client_id', clientId);
    }

    const { data: rows, error: txErr } = await queryBuilder;
    if (txErr) throw txErr;

    const transactions = rows.map((r: any) => ({
      id: r.id,
      referenceId: r.reference_id,
      clientId: r.client_id,
      clientName: r.client_name,
      clientEmail: r.client_email,
      accountLogin: Number(r.account_login),
      type: r.type,
      amount: parseFloat(r.amount) || 0,
      fee: parseFloat(r.fee) || 0,
      currency: r.currency || 'USD',
      status: r.status,
      method: r.method,
      timestamp: r.created_at,
      remarks: r.remarks,
      description: r.remarks || `${r.type.toUpperCase()} transaction #${r.reference_id}`,
    }));

    return NextResponse.json({ success: true, transactions });
  } catch (error: any) {
    console.error('[API /api/transactions] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
