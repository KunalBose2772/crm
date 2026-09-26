import { NextRequest, NextResponse } from 'next/server';
import { mt5Client } from '@/services/mt5/mt5Client';
import { checkRateLimit, getClientIP } from '@/lib/security';
import { supabaseAdmin } from '@/lib/supabase';

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

    // Persist real-time MT5 balance, equity, and margin to database
    if (account && typeof account.balance === 'number') {
      try {
        await supabaseAdmin
          .from('trading_accounts')
          .update({
            balance: account.balance,
            equity: account.equity,
            free_margin: account.freeMargin,
            margin: account.margin,
            updated_at: new Date().toISOString(),
          })
          .eq('login', cleanLogin);
      } catch (err: any) {
        console.warn('[Supabase update balance error]:', err?.message);
      }
    }

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
