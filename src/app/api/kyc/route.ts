import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateOrigin } from '@/lib/security';

export async function GET(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized origin' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    let query = supabaseAdmin
      .from('kyc_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data: rows, error } = await query;
    if (error) throw error;

    const formattedRecords = (rows || []).map((r: any) => ({
      id: r.id,
      clientId: r.client_id,
      clientName: r.client_name,
      clientEmail: r.client_email,
      country: r.country || 'Global',
      documentType: r.document_type,
      documentNumber: r.document_number,
      frontImageUrl: r.document_front_url,
      backImageUrl: r.document_back_url || undefined,
      submittedAt: r.created_at,
      status: r.status,
      rejectionReason: r.rejection_reason || undefined,
      reviewedAt: r.reviewed_at || undefined,
    }));

    return NextResponse.json({ success: true, records: formattedRecords });
  } catch (error: any) {
    console.error('[API /api/kyc] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
