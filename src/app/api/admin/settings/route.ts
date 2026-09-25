import { NextRequest, NextResponse } from 'next/server';
import { getBrokerSettings, saveBrokerSettings } from '@/lib/settings';
import { validateOrigin, sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const settings = await getBrokerSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('[API /api/admin/settings GET] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized request origin' }, { status: 403 });
    }

    const body = await req.json();
    const updatePayload: any = {};

    if (body.adminNotificationEmail !== undefined) {
      updatePayload.adminNotificationEmail = sanitizeString(body.adminNotificationEmail.trim().toLowerCase(), 100);
    }
    if (body.supportEmail !== undefined) {
      updatePayload.supportEmail = sanitizeString(body.supportEmail.trim().toLowerCase(), 100);
    }
    if (body.brandName !== undefined) {
      updatePayload.brandName = sanitizeString(body.brandName.trim(), 80);
    }
    if (body.defaultLeverage !== undefined) {
      updatePayload.defaultLeverage = sanitizeString(body.defaultLeverage.trim(), 20);
    }
    if (body.baseCurrency !== undefined) {
      updatePayload.baseCurrency = sanitizeString(body.baseCurrency.trim().toUpperCase(), 10);
    }
    if (body.usdtAddress !== undefined) {
      updatePayload.usdtAddress = sanitizeString(body.usdtAddress.trim(), 100);
    }
    if (body.bankIban !== undefined) {
      updatePayload.bankIban = sanitizeString(body.bankIban.trim(), 100);
    }
    if (body.bankName !== undefined) {
      updatePayload.bankName = sanitizeString(body.bankName.trim(), 100);
    }
    if (body.bankBeneficiary !== undefined) {
      updatePayload.bankBeneficiary = sanitizeString(body.bankBeneficiary.trim(), 100);
    }
    if (body.bypassPaymentGateway !== undefined) {
      updatePayload.bypassPaymentGateway = !!body.bypassPaymentGateway;
    }

    const updated = await saveBrokerSettings(updatePayload);
    return NextResponse.json({
      success: true,
      message: 'Broker settings updated successfully',
      settings: updated,
    });
  } catch (error: any) {
    console.error('[API /api/admin/settings POST] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
