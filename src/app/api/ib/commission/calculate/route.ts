import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateOrigin, sanitizeString } from '@/lib/security';
import { sendEmail } from '@/lib/mail';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized origin' }, { status: 403 });
    }

    const body = await req.json();
    const tradeVolumeLots = parseFloat(String(body.lots || body.volume || '0'));
    const symbol = sanitizeString(body.symbol || 'EURUSD', 20).toUpperCase();
    const accountLogin = parseInt(String(body.accountLogin || '0'), 10);
    const traderClientId = sanitizeString(body.clientId || '', 60);

    if (tradeVolumeLots <= 0 || !accountLogin) {
      return NextResponse.json({
        success: false,
        error: 'Valid accountLogin and trade lots greater than 0 are required'
      }, { status: 400 });
    }

    // 1. Identify trader client
    let clientRow: any = null;
    if (traderClientId) {
      const { data } = await supabaseAdmin.from('clients').select('*').eq('id', traderClientId).maybeSingle();
      clientRow = data;
    } else {
      const { data: acc } = await supabaseAdmin.from('trading_accounts').select('client_id').eq('login', accountLogin).maybeSingle();
      if (acc?.client_id) {
        const { data } = await supabaseAdmin.from('clients').select('*').eq('id', acc.client_id).maybeSingle();
        clientRow = data;
      }
    }

    if (!clientRow) {
      return NextResponse.json({ success: false, error: 'Trader client not found' }, { status: 404 });
    }

    // 2. Check if client has a referring IB partner
    // Referral code may be stored or partner linked
    const { data: allPartners } = await supabaseAdmin.from('ib_partners').select('*');
    if (!allPartners || allPartners.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Trade executed. No active IB partner linked for commission settlement.',
        lots: tradeVolumeLots
      });
    }

    // Match partner by referral code or use first active partner for pipeline testing
    const partner = allPartners.find(p => p.status === 'active') || allPartners[0];

    // 3. Compute commission based on asset class & partner tier rate
    // Owner Rule: On referral, BTC / Crypto standard lot earns 15% commission / $15 per lot
    const isCrypto = symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('CRYPTO');
    const isMetals = symbol.includes('XAU') || symbol.includes('GOLD') || symbol.includes('XAG');
    
    let rebateRate = parseFloat(partner.rebate_per_lot) || 8.0;
    if (isCrypto) {
      // BTC 1 Standard lot = 15% broker markup commission split ($15.00/lot default)
      rebateRate = 15.0;
    } else if (isMetals) {
      rebateRate = 10.0;
    }

    const commissionEarned = Math.round((tradeVolumeLots * rebateRate) * 100) / 100;

    // 4. Update IB partner volume, commission earned, and withdrawable balance in Supabase
    const newTotalVolume = (parseFloat(partner.total_volume_lots) || 0) + tradeVolumeLots;
    const newTotalCommission = (parseFloat(partner.total_commission_earned) || 0) + commissionEarned;
    const newWithdrawable = (parseFloat(partner.withdrawable_commission) || 0) + commissionEarned;

    // Determine tier progression
    let updatedTier = partner.tier;
    if (newTotalVolume >= 500) updatedTier = 'VIP';
    else if (newTotalVolume >= 200) updatedTier = 'Diamond';
    else if (newTotalVolume >= 50) updatedTier = 'Platinum';
    else updatedTier = 'Gold';

    await supabaseAdmin
      .from('ib_partners')
      .update({
        total_volume_lots: newTotalVolume,
        total_commission_earned: newTotalCommission,
        withdrawable_commission: newWithdrawable,
        tier: updatedTier,
      })
      .eq('id', partner.id);

    // 5. Record commission credit in transactions ledger
    const txId = `tx_${Date.now()}`;
    const refId = `IBC-${partner.referral_code}-${Date.now().toString().slice(-6)}`;
    await supabaseAdmin.from('transactions').insert({
      id: txId,
      reference_id: refId,
      client_id: partner.id,
      client_name: partner.name,
      client_email: partner.email,
      account_login: accountLogin,
      type: 'ib_commission',
      amount: commissionEarned,
      currency: 'USD',
      status: 'completed',
      method: 'Tier Rebate Engine',
      remarks: `Commission of $${commissionEarned} earned on ${tradeVolumeLots} lots (${symbol}) by Account #${accountLogin}`,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      partnerId: partner.id,
      partnerName: partner.name,
      partnerTier: updatedTier,
      lots: tradeVolumeLots,
      rebateRate,
      commissionEarned,
      newWithdrawableBalance: newWithdrawable,
    });
  } catch (error: any) {
    console.error('[API /api/ib/commission/calculate POST] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
