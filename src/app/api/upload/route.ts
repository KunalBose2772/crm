import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateOrigin, checkRateLimit, getClientIP, sanitizeString } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized request origin' }, { status: 403 });
    }

    const clientIP = getClientIP(req);
    const rateCheck = checkRateLimit(`${clientIP}:upload`, 20, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ success: false, error: 'Too many uploads. Please wait a moment.' }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const bucket = sanitizeString((formData.get('bucket') as string) || 'deposit-receipts', 30);
    const clientId = sanitizeString((formData.get('clientId') as string) || 'cli_user', 50);

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Supported buckets: 'kyc-documents' and 'deposit-receipts'
    const allowedBuckets = ['kyc-documents', 'deposit-receipts'];
    if (!allowedBuckets.includes(bucket)) {
      return NextResponse.json({ success: false, error: 'Invalid storage destination' }, { status: 400 });
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size must not exceed 10MB' }, { status: 400 });
    }

    // Sanitize extension and filename
    const originalName = file.name || 'document.png';
    const ext = originalName.split('.').pop()?.toLowerCase() || 'png';
    const safeExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
    if (!safeExtensions.includes(ext)) {
      return NextResponse.json({ success: false, error: 'Unsupported file format. Use JPG, PNG, WEBP, or PDF.' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const filePath = `${clientId}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      console.error('[API /api/upload] Supabase Storage Error:', uploadError.message);
      return NextResponse.json({ success: false, error: 'Failed to upload document to storage' }, { status: 500 });
    }

    // Retrieve public URL
    const { data: publicData } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: publicData.publicUrl,
      bucket,
      path: filePath,
    });
  } catch (error: any) {
    console.error('[API /api/upload] Error:', error.message);
    return NextResponse.json({ success: false, error: 'Server error processing file upload' }, { status: 500 });
  }
}
