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
    const id = sanitizeString(body.id || '', 60);
    const action = sanitizeString(body.action || '', 20); // 'approve' | 'reject'
    const reason = sanitizeString(body.reason || 'Document verification declined', 200);
    const comment = sanitizeString(body.comment || '', 300);

    if (!id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Record ID and valid action (approve/reject) are required' }, { status: 400 });
    }

    // 1. Fetch record
    const { data: record, error: fetchErr } = await supabaseAdmin
      .from('kyc_records')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !record) {
      return NextResponse.json({ success: false, error: 'KYC record not found' }, { status: 404 });
    }

    const isApprove = action === 'approve';
    const newStatus = isApprove ? 'verified' : 'rejected';

    // 2. Update kyc_records
    await supabaseAdmin
      .from('kyc_records')
      .update({
        status: newStatus,
        rejection_reason: isApprove ? (comment ? `Approved: ${comment}` : null) : reason,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    // 3. Update clients table
    await supabaseAdmin
      .from('clients')
      .update({
        kyc_verified: isApprove,
        status: isApprove ? 'verified' : 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', record.client_id);

    // 4. Send email notification to client via Hostinger SMTP
    if (record.client_email) {
      try {
        if (isApprove) {
          // Template 6: KYC Approved with optional admin comment
          await sendEmail({
            to: record.client_email,
            ...emailTemplates.kycApproved(record.client_name || 'Valued Trader', comment || undefined),
          });
        } else {
          await sendEmail({
            to: record.client_email,
            ...emailTemplates.withdrawalRejected(record.client_name || 'Valued Trader', reason),
          });
        }
      } catch (err: any) {
        console.warn('[API /api/kyc/review] Email delivery error:', err.message);
      }
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error: any) {
    console.error('[API /api/kyc/review] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
