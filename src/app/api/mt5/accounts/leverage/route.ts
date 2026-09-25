import { NextRequest, NextResponse } from 'next/server';
import { mt5Client } from '@/services/mt5/mt5Client';
import { validateOrigin, checkRateLimit, getClientIP, sanitizeString } from '@/lib/security';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized request origin' }, { status: 403 });
    }

    const clientIP = getClientIP(req);
    const rateCheck = checkRateLimit(`${clientIP}:leverage`, 20, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const login = parseInt(String(body.login), 10);
    const leverage = sanitizeString(body.leverage, 10);

    if (!login || isNaN(login) || !leverage) {
      return NextResponse.json({ success: false, error: 'Login and leverage are required' }, { status: 400 });
    }

    const success = await mt5Client.updateLeverage(login, leverage);

    if (success) {
      try {
        await supabaseAdmin
          .from('trading_accounts')
          .update({ leverage, updated_at: new Date().toISOString() })
          .eq('login', login);
      } catch (dbErr: any) {
        console.error('[API /api/mt5/accounts/leverage] Supabase Persistence Warning:', dbErr.message);
      }
    }

    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('[API /api/mt5/accounts/leverage] Error:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to update leverage on MT5' },
      { status: 500 }
    );
  }
}
