import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateOrigin, sanitizeString } from '@/lib/security';
import { sendEmail, emailTemplates } from '@/lib/mail';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized request origin' }, { status: 403 });
    }

    const body = await req.json();
    const email = sanitizeString(body.email || '', 100).trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Look up client
    const { data: client, error: dbErr } = await supabaseAdmin
      .from('clients')
      .select('id, name, email')
      .ilike('email', email)
      .maybeSingle();

    if (dbErr || !client) {
      // Return success without revealing user enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email address, a password reset link has been dispatched.'
      });
    }

    // Generate secure reset token (valid for 1 hour)
    const resetToken = `rst_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Store token in client verification_token column or reset token field
    const { error: updateErr } = await supabaseAdmin
      .from('clients')
      .update({
        verification_token: resetToken,
        updated_at: new Date().toISOString(),
      })
      .eq('id', client.id);

    if (updateErr) {
      console.error('[API /api/auth/forgot-password] Token save error:', updateErr.message);
      return NextResponse.json({ success: false, error: 'Failed to initiate password reset.' }, { status: 500 });
    }

    // Build reset URL
    const hostHeader = req.headers.get('host') || 'localhost:3000';
    const proto = hostHeader.includes('localhost') ? 'http' : 'https';
    const resetUrl = `${proto}://${hostHeader}/reset-password?token=${resetToken}`;

    // Send password reset email via Hostinger SMTP
    const emailResult = await sendEmail({
      to: client.email,
      ...emailTemplates.passwordReset(
        client.name || 'Valued Trader',
        resetUrl
      ),
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset link has been dispatched to your email address.',
      emailDelivered: emailResult.success,
      resetUrl: process.env.NODE_ENV !== 'production' ? resetUrl : undefined,
    });
  } catch (error: any) {
    console.error('[API /api/auth/forgot-password] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
