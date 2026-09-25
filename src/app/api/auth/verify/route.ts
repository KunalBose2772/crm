import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateOrigin, sanitizeString } from '@/lib/security';
import { sendEmail, emailTemplates } from '@/lib/mail';

export async function POST(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized origin' }, { status: 403 });
    }

    const body = await req.json();
    const token = sanitizeString(body.token || '', 128);

    if (!token) {
      return NextResponse.json({ success: false, error: 'Verification token is required' }, { status: 400 });
    }

    // Find client with this token
    const { data: client, error: findErr } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('verification_token', token)
      .single();

    if (findErr || !client) {
      return NextResponse.json({ success: false, error: 'Invalid or expired verification link' }, { status: 404 });
    }

    const wasAlreadyVerified = !!client.email_verified;

    // Mark client email verified and activate status
    const { error: updateErr } = await supabaseAdmin
      .from('clients')
      .update({
        email_verified: true,
        status: 'verified',
        updated_at: new Date().toISOString(),
      })
      .eq('id', client.id);

    if (updateErr) {
      console.error('[API /api/auth/verify] Update error:', updateErr.message);
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    // Resolve portal login URL
    const hostHeader = req.headers.get('host') || 'localhost:3000';
    const proto = hostHeader.includes('localhost') ? 'http' : 'https';
    const loginUrl = `${proto}://${hostHeader}/client/login`;
    const tempPassword = client.password_hash || 'PasswordSetDuringRegistration';

    // Dispatch credentials email via Hostinger SMTP ONLY ONCE when verifying for the first time
    if (client.email && !wasAlreadyVerified) {
      sendEmail({
        to: client.email,
        ...emailTemplates.afterVerifyCredentials(
          client.name,
          client.email,
          tempPassword,
          loginUrl
        ),
      }).catch(err => console.warn('[API /api/auth/verify] Credentials email error:', err.message));
    }

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        emailVerified: true,
        kycVerified: !!client.kyc_verified,
      },
      credentials: {
        username: client.email,
        password: tempPassword,
        loginUrl,
      },
    });
  } catch (error: any) {
    console.error('[API /api/auth/verify] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
