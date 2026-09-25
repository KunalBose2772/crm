import { NextRequest, NextResponse } from 'next/server';
import { mt5Client } from '@/services/mt5/mt5Client';
import { checkRateLimit, getClientIP } from '@/lib/security';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ login: string }> }
) {
  try {
    const { login } = await params;
    const cleanLogin = parseInt(String(login), 10);

    if (!cleanLogin || isNaN(cleanLogin)) {
      return NextResponse.json({ success: false, error: 'Invalid account login' }, { status: 400 });
    }

    // Rate limit account status queries (max 60 per minute per IP)
    const clientIP = getClientIP(req);
    const rateCheck = checkRateLimit(`${clientIP}:get_account`, 60, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many queries. Please slow down.' },
        { status: 429 }
      );
    }

    const account = await mt5Client.getAccount(cleanLogin);

    return NextResponse.json({
      success: true,
      account,
    });
  } catch (error: any) {
    console.error(`[API /api/mt5/accounts] Error:`, error.message);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to retrieve account details.',
      },
      { status: 500 }
    );
  }
}
