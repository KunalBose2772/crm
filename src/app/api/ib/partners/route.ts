import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateOrigin, sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized origin' }, { status: 403 });
    }

    const { data: rows, error } = await supabaseAdmin
      .from('ib_partners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedPartners = (rows || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      tier: r.tier || 'Gold',
      referralCode: r.referral_code,
      activeClientsCount: 0,
      totalVolumeLots: parseFloat(r.total_volume_lots) || 0,
      totalTradesCount: parseInt(r.total_trades_count || r.trades_count || '0', 10) || 0,
      totalCommissionEarned: parseFloat(r.total_commission_earned) || 0,
      withdrawableCommission: parseFloat(r.withdrawable_commission) || 0,
      status: r.status || 'active',
      joinedAt: r.created_at,
      rebatePerLotUsd: parseFloat(r.rebate_per_lot) || 6.0,
      subIbCount: 0,
    }));

    return NextResponse.json({ success: true, partners: formattedPartners });
  } catch (error: any) {
    console.error('[API /api/ib/partners GET] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized origin' }, { status: 403 });
    }

    const body = await req.json();
    const id = body.id || `ib_${Date.now()}`;
    const name = sanitizeString(body.name || '', 100);
    const email = sanitizeString(body.email || '', 100).toLowerCase();
    const referralCode = sanitizeString(body.referralCode || `REF${Math.floor(100000 + Math.random() * 900000)}`, 30);
    const tier = sanitizeString(body.tier || 'Silver', 20);
    const rebatePerLot = parseFloat(body.rebatePerLotUsd || body.rebatePerLot || '6.0');

    if (!name || !email) {
      return NextResponse.json({ success: false, error: 'Partner name and email are required.' }, { status: 400 });
    }

    // 1. Resolve or create client record for foreign key integrity
    let clientId = sanitizeString(body.clientId || '', 60);
    if (!clientId) {
      const { data: existingClient } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingClient?.id) {
        clientId = existingClient.id;
      } else {
        clientId = `cli_${Date.now()}`;
        await supabaseAdmin.from('clients').insert({
          id: clientId,
          name,
          email,
          status: 'verified',
          email_verified: true,
          ib_partner_status: 'approved',
          created_at: new Date().toISOString(),
        });
      }
    }

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('ib_partners')
      .insert({
        id,
        client_id: clientId,
        name,
        email,
        referral_code: referralCode,
        tier,
        rebate_per_lot: rebatePerLot,
        total_volume_lots: 0,
        total_commission_earned: 0,
        withdrawable_commission: 0,
        status: 'active',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    return NextResponse.json({
      success: true,
      partner: {
        id: inserted.id,
        name: inserted.name,
        email: inserted.email,
        tier: inserted.tier,
        referralCode: inserted.referral_code,
        activeClientsCount: 0,
        totalVolumeLots: 0,
        totalCommissionEarned: 0,
        withdrawableCommission: 0,
        status: inserted.status,
        joinedAt: inserted.created_at,
        rebatePerLotUsd: parseFloat(inserted.rebate_per_lot),
        subIbCount: 0,
      }
    });
  } catch (error: any) {
    console.error('[API /api/ib/partners POST] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
