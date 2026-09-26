import { NextRequest, NextResponse } from 'next/server';
import { mt5Client } from '@/services/mt5/mt5Client';
import { supabaseAdmin } from '@/lib/supabase';
import { validateOrigin, checkRateLimit, getClientIP, sanitizeString } from '@/lib/security';
import { sendEmail, emailTemplates } from '@/lib/mail';

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
        { success: false, error: 'Login and a password of at least 8 characters are required.' },
        { status: 400 }
      );
    }

    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    if (!hasLetters || !hasNumbers) {
      return NextResponse.json(
        { success: false, error: 'MT5 password must contain both letters and numbers (minimum 8 characters).' },
        { status: 400 }
      );
    }

    let success = false;
    let mt5ErrorMessage: string | null = null;

    try {
      success = await mt5Client.changePassword(login, password, type);
    } catch (mt5Err: any) {
      mt5ErrorMessage = mt5Err?.message || 'MT5 server WebAPI unreachable';
      console.warn('[API /api/mt5/accounts/password] MT5 WebAPI Warning:', mt5ErrorMessage);
    }

    // If real server is configured and failed, return the actual MT5 error
    const isMock = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || !process.env.MT5_MANAGER_LOGIN;
    if (!success && !isMock) {
      return NextResponse.json(
        { success: false, error: mt5ErrorMessage || 'Failed to change password on MT5 server.' },
        { status: 400 }
      );
    }

    // Lookup client for email dispatch & update account timestamp
    let clientEmail: string | null = null;
    let clientName: string | null = null;

    try {
      const { data: accRecord } = await (supabaseAdmin.from('trading_accounts') as any)
        .select('client_id')
        .eq('login', login)
        .maybeSingle();

      // Update timestamp on trading account
      await (supabaseAdmin.from('trading_accounts') as any)
        .update({ updated_at: new Date().toISOString() })
        .eq('login', login);

      const clientId = accRecord?.client_id || body.clientId;
      if (clientId) {
        const { data: clientRecord } = await (supabaseAdmin.from('clients') as any)
          .select('name, email')
          .eq('id', clientId)
          .maybeSingle();
        if (clientRecord?.email) {
          clientEmail = clientRecord.email;
          clientName = clientRecord.name;
        }
      }
    } catch (dbErr: any) {
      console.warn('[API /api/mt5/accounts/password] Supabase lookup warning:', dbErr.message);
    }

    // Trigger security notification email
    const recipientEmail = clientEmail || body.email;
    if (recipientEmail) {
      sendEmail({
        to: recipientEmail,
        ...emailTemplates.mt5PasswordChanged(
          clientName || body.clientName || 'Valued Trader',
          login,
          type
        ),
      }).catch(err => console.warn('[API /api/mt5/accounts/password] Email warning:', err.message));
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${type === 'investor' ? 'Investor' : 'Trading'} password for account #${login}.`,
    });
  } catch (error: any) {
    console.error('[API /api/mt5/accounts/password] Handler Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to change password on MT5' },
      { status: 500 }
    );
  }
}
