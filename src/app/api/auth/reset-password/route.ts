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
    const token = sanitizeString(body.token || '', 120);
    const newPassword = (body.newPassword || '').trim();

    if (!token || !newPassword) {
      return NextResponse.json({ success: false, error: 'Token and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    // Match client by verification/reset token
    const { data: client, error: findErr } = await supabaseAdmin
      .from('clients')
      .select('id, name, email')
      .eq('verification_token', token)
      .maybeSingle();

    if (findErr || !client) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired password reset link. Please request a new one.'
      }, { status: 400 });
    }

    // Update password and clear reset token
    const { error: updateErr } = await supabaseAdmin
      .from('clients')
      .update({
        password_hash: newPassword,
        verification_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', client.id);

    if (updateErr) {
      console.error('[API /api/auth/reset-password] Password update error:', updateErr.message);
      return NextResponse.json({ success: false, error: 'Failed to update password.' }, { status: 500 });
    }

    // Send confirmation email
    sendEmail({
      to: client.email,
      ...emailTemplates.passwordChanged(client.name || 'Valued Trader'),
    }).catch(err => console.warn('[API /api/auth/reset-password] Confirmation mail warning:', err.message));

    return NextResponse.json({
      success: true,
      message: 'Password has been updated successfully. You can now log in.'
    });
  } catch (error: any) {
    console.error('[API /api/auth/reset-password] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
