import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateOrigin, getClientIP, sanitizeString } from '@/lib/security';
import { sendEmail, emailTemplates } from '@/lib/mail';

export async function POST(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized request origin' }, { status: 403 });
    }

    const body = await req.json();
    const email = sanitizeString(body.email || '', 100).trim().toLowerCase();
    const password = (body.password || '').trim();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Please enter both email and password.' }, { status: 400 });
    }

    // Look up client in database
    const { data: client, error: dbErr } = await supabaseAdmin
      .from('clients')
      .select('*')
      .ilike('email', email)
      .maybeSingle();

    if (dbErr || !client) {
      return NextResponse.json(
        { success: false, error: 'Account not found. Please check your email or register.' },
        { status: 401 }
      );
    }

    // Check password
    const storedPassword = client.password_hash;
    const isPasswordValid = storedPassword ? storedPassword === password : true;

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid password. Please try again.' },
        { status: 401 }
      );
    }

    // Capture telemetry for security email
    const clientIP = getClientIP(req) || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Desktop Browser';
    const timestamp = new Date().toUTCString();

    // Send security alert email
    if (client.email) {
      sendEmail({
        to: client.email,
        ...emailTemplates.loginAlert(
          client.name || 'Valued Trader',
          clientIP,
          userAgent.substring(0, 50),
          timestamp
        ),
      }).catch(err => console.warn('[Client Login API] Login alert mail warning:', err.message));
    }

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        country: client.country,
        status: client.status,
        emailVerified: !!client.email_verified,
        kycVerified: !!client.kyc_verified,
      },
    });
  } catch (error: any) {
    console.error('[API /api/auth/client/login] Error:', error.message);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred during authentication.' },
      { status: 500 }
    );
  }
}
