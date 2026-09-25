import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateOrigin, sanitizeString } from '@/lib/security';
import { sendEmail, emailTemplates } from '@/lib/mail';
import { getBrokerSettings } from '@/lib/settings';

export async function POST(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized origin' }, { status: 403 });
    }

    const body = await req.json();
    const clientId = sanitizeString(body.clientId || '', 60);
    const clientName = sanitizeString(body.clientName || 'Trader', 60);
    const clientEmail = sanitizeString(body.clientEmail || '', 100);
    const documentType = sanitizeString(body.documentType || 'Passport', 50);
    const documentNumber = sanitizeString(body.documentNumber || '', 50);
    const frontUrl = sanitizeString(body.frontImageUrl || body.frontUrl || '', 500);
    const backUrl = sanitizeString(body.backImageUrl || body.backUrl || '', 500);

    if (!clientId || !clientEmail || !documentNumber || !frontUrl) {
      return NextResponse.json({
        success: false,
        error: 'Client ID, Email, Document Number, and Front Image URL are required'
      }, { status: 400 });
    }

    const kycId = `kyc_${Date.now()}`;

    // 1. Insert into kyc_records table in Supabase
    const { error: insertErr } = await supabaseAdmin.from('kyc_records').insert({
      id: kycId,
      client_id: clientId,
      client_name: clientName,
      client_email: clientEmail,
      document_type: documentType,
      document_number: documentNumber,
      document_front_url: frontUrl,
      document_back_url: backUrl || null,
      status: 'pending',
    });

    if (insertErr) {
      console.error('[API /api/kyc/submit] Error inserting record:', insertErr.message);
      return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 });
    }

    // 2. Update client table status to pending review
    await supabaseAdmin
      .from('clients')
      .update({
        kyc_verified: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId);

    // 3. Send confirmation email to Client (Template 5: KYC submission received)
    sendEmail({
      to: clientEmail,
      ...emailTemplates.kycUpload(clientName, documentType),
    }).catch(err => console.warn('[API /api/kyc/submit] Client confirmation mail error:', err.message));

    // 4. Send alert email to Admin
    const brokerSettings = await getBrokerSettings();
    const hostHeader = req.headers.get('host') || 'localhost:3000';
    const proto = hostHeader.includes('localhost') ? 'http' : 'https';
    const downloadUrl = `${proto}://${hostHeader}/api/kyc/download?id=${kycId}&print=true`;

    if (brokerSettings.adminNotificationEmail) {
      sendEmail({
        to: brokerSettings.adminNotificationEmail,
        ...emailTemplates.adminKycNotification(
          clientName,
          clientEmail,
          documentType,
          documentNumber,
          frontUrl,
          backUrl,
          downloadUrl
        ),
      }).catch(err => console.warn('[API /api/kyc/submit] Admin notification mail error:', err.message));
    }

    const record = {
      id: kycId,
      clientId,
      clientName,
      clientEmail,
      documentType,
      documentNumber,
      frontImageUrl: frontUrl,
      backImageUrl: backUrl || undefined,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      country: 'Global',
    };

    return NextResponse.json({
      success: true,
      kycId,
      record,
      message: 'KYC documents submitted successfully. Verification is pending review.'
    });
  } catch (error: any) {
    console.error('[API /api/kyc/submit] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
