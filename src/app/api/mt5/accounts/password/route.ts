import { NextRequest, NextResponse } from 'next/server';
import { mt5Client } from '@/services/mt5/mt5Client';
import { validateOrigin, checkRateLimit, getClientIP, sanitizeString } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized request origin' }, { status: 403 });
    }

    const clientIP = getClientIP(req);
    const rateCheck = checkRateLimit(`${clientIP}:password`, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const login = parseInt(String(body.login), 10);
    const password = String(body.password || '');
    const type = body.type === 'investor' ? 'investor' : 'main';

    if (!login || isNaN(login) || !password || password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Login and a password of at least 8 characters are required' },
        { status: 400 }
      );
    }

    const success = await mt5Client.changePassword(login, password, type);

    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('[API /api/mt5/accounts/password] Error:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to change password on MT5' },
      { status: 500 }
    );
  }
}
