import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeString } from '@/lib/security';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kycId = searchParams.get('id');
    const clientId = searchParams.get('clientId');

    if (!kycId && !clientId) {
      return NextResponse.json({ success: false, error: 'Document ID or Client ID required' }, { status: 400 });
    }

    let query = supabaseAdmin.from('kyc_records').select('*');
    if (kycId) {
      query = query.eq('id', kycId);
    } else if (clientId) {
      query = query.eq('client_id', clientId).order('created_at', { ascending: false }).limit(1);
    }

    const { data: records, error } = await query;
    if (error || !records || records.length === 0) {
      return NextResponse.json({ success: false, error: 'KYC Document not found' }, { status: 404 });
    }

    const rec = records[0];
    const clientName = sanitizeString(rec.client_name || 'Client', 100);
    const clientEmail = sanitizeString(rec.client_email || 'client@crm.com', 100);
    const documentType = sanitizeString((rec.document_type || 'Passport').replace(/_/g, ' '), 50);
    const documentNumber = sanitizeString(rec.document_number || 'N/A', 50);
    const submittedAt = new Date(rec.created_at || Date.now()).toUTCString();
    const status = (rec.status || 'pending').toUpperCase();
    const frontUrl = rec.document_front_url;
    const backUrl = rec.document_back_url;

    // Strict bank-grade, institutional A4 single-page layout (exactly 210mm x 297mm)
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>KYC Dossier - ${clientName} - ${documentNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      -webkit-font-smoothing: antialiased;
    }
    .toolbar {
      width: 100%;
      background: #0f172a;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .toolbar-info {
      color: #cbd5e1;
      font-size: 13px;
      font-weight: 500;
    }
    .toolbar-btn {
      background: #2563eb;
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s;
    }
    .toolbar-btn:hover {
      background: #1d4ed8;
    }

    /* Fixed Exact A4 Canvas */
    .a4-wrapper {
      padding: 24px 0;
      display: flex;
      justify-content: center;
    }
    .a4-page {
      width: 210mm;
      height: 296mm;
      max-height: 296mm;
      background: #ffffff;
      padding: 14mm 16mm 12mm 16mm;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      page-break-after: avoid;
      page-break-inside: avoid;
    }

    /* Institutional Header */
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
    }
    .brand-mark {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0f172a;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .brand-tagline {
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: #64748b;
      margin-top: 3px;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 14px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }
    .status-pill.verified {
      background: #ecfdf5;
      color: #065f46;
      border-color: #a7f3d0;
    }
    .status-pill.rejected {
      background: #fef2f2;
      color: #991b1b;
      border-color: #fecaca;
    }

    /* Data Table / Metadata Block */
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 14px;
      margin-bottom: 14px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
    }
    .meta-table th {
      background: #f1f5f9;
      color: #475569;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      padding: 7px 12px;
      border-bottom: 1px solid #cbd5e1;
      text-align: left;
    }
    .meta-table td {
      padding: 9px 12px;
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
      border-right: 1px solid #e2e8f0;
      vertical-align: middle;
    }
    .meta-table td:last-child {
      border-right: none;
    }
    .meta-table td.mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12.5px;
      color: #1d4ed8;
      letter-spacing: 0.5px;
    }

    /* Section Divider */
    .section-banner {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #334155;
      background: #f1f5f9;
      border-left: 3px solid #2563eb;
      padding: 5px 10px;
      margin-bottom: 12px;
    }

    /* Document Scans Grid (Engineered to fit standard A4 without page overrun) */
    .scans-container {
      display: grid;
      grid-template-columns: ${backUrl ? '1fr 1fr' : '1fr'};
      gap: 14px;
      flex: 1;
      min-height: 0;
      margin-bottom: 12px;
    }
    .scan-card {
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      background: #f8fafc;
      padding: 8px;
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
    }
    .scan-label {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
      text-align: center;
      padding-bottom: 6px;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 6px;
    }
    .scan-image-wrapper {
      flex: 1;
      min-height: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 4px;
      overflow: hidden;
    }
    .scan-image-wrapper img {
      max-width: 100%;
      max-height: 142mm;
      width: auto;
      height: auto;
      object-fit: contain;
      display: block;
    }

    /* Security & Regulatory Footer */
    .doc-footer {
      border-top: 1.5px solid #0f172a;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5px;
      color: #64748b;
    }
    .doc-footer strong {
      color: #0f172a;
    }
    .doc-footer code {
      font-family: ui-monospace, SFMono-Regular, monospace;
      color: #334155;
      font-size: 9px;
    }

    /* Print Overrides */
    @media print {
      body {
        background: #ffffff;
      }
      .toolbar {
        display: none !important;
      }
      .a4-wrapper {
        padding: 0 !important;
      }
      .a4-page {
        width: 210mm !important;
        height: 297mm !important;
        max-height: 297mm !important;
        padding: 12mm 15mm !important;
        box-shadow: none !important;
        border: none !important;
      }
      .scan-image-wrapper img {
        max-height: 145mm !important;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div class="toolbar-info">
      Client Verification Dossier (A4 Print Layout) • <strong>${clientName}</strong>
    </div>
    <button onclick="window.print()" class="toolbar-btn">
      🖨️ Print / Save as PDF
    </button>
  </div>

  <div class="a4-wrapper">
    <div class="a4-page">
      <!-- Top Compliance Header -->
      <div>
        <div class="doc-header">
          <div>
            <div class="brand-mark">
              <span>🛡️</span>
              <span>Client Identity Verification Dossier</span>
            </div>
            <div class="brand-tagline">
              Official Regulatory Compliance & AML/CFT Audit File
            </div>
          </div>
          <div class="status-pill ${status.toLowerCase()}">
            ● ${status}
          </div>
        </div>

        <!-- Structured Metadata Table -->
        <table class="meta-table">
          <thead>
            <tr>
              <th style="width: 25%;">Client Full Name</th>
              <th style="width: 32%;">Email Address</th>
              <th style="width: 20%;">Document Type</th>
              <th style="width: 23%;">Document Number</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${clientName}</td>
              <td style="font-size: 11px; word-break: break-all;">${clientEmail}</td>
              <td>${documentType}</td>
              <td class="mono">${documentNumber}</td>
            </tr>
          </tbody>
        </table>

        <!-- Section Label -->
        <div class="section-banner">
          Submitted Verification Proofs & Identification Attachments
        </div>
      </div>

      <!-- Centered Document Scans Grid -->
      <div class="scans-container">
        <div class="scan-card">
          <div class="scan-label">Primary Scan (Front Page)</div>
          <div class="scan-image-wrapper">
            <img src="${frontUrl}" alt="Front Document Scan" crossorigin="anonymous" />
          </div>
        </div>

        ${backUrl ? `
        <div class="scan-card">
          <div class="scan-label">Secondary Scan (Back Page)</div>
          <div class="scan-image-wrapper">
            <img src="${backUrl}" alt="Back Document Scan" crossorigin="anonymous" />
          </div>
        </div>
        ` : ''}
      </div>

      <!-- Legal Compliance & Audit Footer -->
      <div class="doc-footer">
        <div>
          <strong>Record Reference:</strong> <code>${rec.id}</code> &nbsp;|&nbsp;
          <strong>Submission:</strong> ${submittedAt}
        </div>
        <div>
          <strong>Security:</strong> 256-Bit SSL Archive &nbsp;|&nbsp;
          <strong>Jurisdiction:</strong> Global Brokerage Compliance
        </div>
      </div>
    </div>
  </div>

  <script>
    if (new URLSearchParams(window.location.search).get('print') === 'true') {
      window.addEventListener('load', () => setTimeout(() => window.print(), 500));
    }
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('[API /api/kyc/download] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
