'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  FileText, 
  CreditCard, 
  Car, 
  Check, 
  Loader2, 
  X, 
  Info,
  Lock,
  Building2,
  FileCheck,
  Download
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { clsx } from 'clsx';

interface KYCVerificationModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isInline?: boolean; // When rendered directly inside /client/kyc page
}

export const KYCVerificationModal: React.FC<KYCVerificationModalProps> = ({
  isOpen,
  onClose,
  isInline = false,
}) => {
  const { clients, impersonation, clientUser, authLoading, kycRecords, submitKycRecord, showToast } = useCRM();
  
  // Accurately resolve active client from impersonation, logged-in clientUser, or clients list
  const rawClient = impersonation.client || clientUser || (clients.length > 0 ? clients[0] : null);
  const activeClient = (rawClient ? clients.find(c => (rawClient.email && c.email?.toLowerCase() === rawClient.email?.toLowerCase()) || (rawClient.id && c.id === rawClient.id)) : null) || rawClient;

  const [documentType, setDocumentType] = useState<'Passport' | 'National_ID' | 'Driving_License'>('Passport');
  const [documentNumber, setDocumentNumber] = useState('');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmittedLocal, setIsSubmittedLocal] = useState(false);

  const [hasLocalPending, setHasLocalPending] = useState(false);

  const existingKyc = kycRecords.find(k => (activeClient?.id && k.clientId === activeClient.id) || (activeClient?.email && k.clientEmail?.toLowerCase() === activeClient.email.toLowerCase()));
  const isApproved = !!activeClient?.kycVerified || existingKyc?.status === 'verified';
  const isPending = !isApproved && (existingKyc?.status === 'pending' || hasLocalPending || isSubmittedLocal);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && activeClient) {
        if (activeClient.kycVerified || existingKyc?.status === 'verified') {
          setHasLocalPending(false);
          const stored = JSON.parse(localStorage.getItem('nd1_crm_submitted_kyc') || '{}');
          if (stored[activeClient.id] || stored[activeClient.email]) {
            delete stored[activeClient.id];
            delete stored[activeClient.email];
            localStorage.setItem('nd1_crm_submitted_kyc', JSON.stringify(stored));
          }
          return;
        }

        const stored = JSON.parse(localStorage.getItem('nd1_crm_submitted_kyc') || '{}');
        if (stored[activeClient.id] || stored[activeClient.email]) {
          setHasLocalPending(true);
        } else {
          setHasLocalPending(false);
        }
      }
    } catch {
      // ignore
    }
  }, [activeClient, existingKyc]);

  if (!isOpen) return null;

  const uploadFileToSupabase = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'kyc-documents');
    formData.append('clientId', activeClient?.id || 'cli_user');

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!data.success || !data.url) {
      throw new Error(data.error || 'Failed to upload document image');
    }
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontFile) {
      showToast('error', 'Front Document Required', 'Please upload a clear front scan of your identification document.');
      return;
    }
    if (!documentNumber.trim()) {
      showToast('error', 'Document ID Required', 'Please input your official document identification number.');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload front scan
      const frontUrl = await uploadFileToSupabase(frontFile);

      // 2. Upload back scan if provided
      let backUrl = '';
      if (backFile) {
        backUrl = await uploadFileToSupabase(backFile);
      }

      // 3. Submit KYC record
      const res = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: activeClient?.id || `cli_${Date.now()}`,
          clientName: activeClient?.name || 'Trader',
          clientEmail: activeClient?.email || 'trader@client.com',
          documentType,
          documentNumber,
          frontUrl,
          backUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSubmittedLocal(true);
        if (data.record) {
          submitKycRecord({
            id: data.record.id,
            clientId: data.record.clientId || activeClient?.id,
            clientName: activeClient?.name || 'Trader',
            clientEmail: activeClient?.email || 'trader@client.com',
            documentType: documentType as any,
            documentNumber,
            frontImageUrl: frontUrl,
            backImageUrl: backUrl || undefined,
            submittedAt: new Date().toISOString(),
            status: 'pending',
            country: activeClient?.country || 'Global',
          });
        }
        showToast('success', 'Documents Submitted', 'Your documents have been submitted to compliance for review.');
      } else {
        throw new Error(data.error || 'Failed to submit KYC documents');
      }
    } catch (err: any) {
      console.error('KYC submission error:', err);
      showToast('error', 'Submission Failed', err.message || 'Error processing document upload');
    } finally {
      setIsUploading(false);
    }
  };

  const modalBody = (
    <div className="w-full max-w-2xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden font-sans select-none flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[92vh]">
      {/* Trust Header with Bank-Grade Security Shield */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 sm:p-6 text-white relative shrink-0">
        {/* Subtle geometric lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-blue-300 shadow-md shrink-0">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[10px] font-extrabold uppercase tracking-wider font-heading mb-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>256-Bit Encrypted Verification</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-heading">
                Identity Verification (KYC)
              </h2>
              <p className="text-xs text-blue-100/80 mt-0.5">
                Official regulatory compliance for live MetaTrader 5 trading &amp; withdrawals.
              </p>
            </div>
          </div>

          {onClose && !isInline && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Close Dialog"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-5">
        {/* State 1: Verification Already Approved */}
        {isApproved ? (
          <div className="py-8 text-center space-y-4 max-w-md mx-auto animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase tracking-wider font-heading mb-1.5">
                Verification Complete
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 font-heading">Identity Verified</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Your regulatory documents have been approved by compliance. You have full, unrestricted live trading, deposit, and withdrawal access.
              </p>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                Access Trading Desk
              </button>
            )}
          </div>
        ) : isPending ? (
          /* State 2: Under Review State */
          <div className="py-8 text-center space-y-4 max-w-md mx-auto animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold uppercase tracking-wider font-heading mb-1.5">
                Compliance Review in Progress
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 font-heading">Documents Under Review</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Your documents have been securely uploaded and routed to our compliance review team. You will be notified via email once your account has been verified.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Client</span>
                <span className="font-bold text-slate-800">{activeClient?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Document Type</span>
                <span className="font-bold text-blue-700">{documentType.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Audit Status</span>
                <span className="font-bold text-amber-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  Pending Compliance Approval
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <a
                href={`/api/kyc/download?clientId=${activeClient?.id || ''}&print=true`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Complete Document Page (PDF)</span>
              </a>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  Close &amp; Return
                </button>
              )}
            </div>
          </div>
        ) : (
          /* State 3: Active Document Submission Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step Indicator & Security Guarantee */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/70 flex items-start gap-3 text-xs text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Why is this required?</strong> To protect client assets and comply with global anti-money laundering (AML) frameworks, live trading accounts must verify personal identity before processing external deposits and wire payouts.
              </div>
            </div>

            {/* Document Selection Grid */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-2 font-heading">
                Step 1: Choose Identification Document Type <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'Passport', label: 'Passport', icon: FileCheck, desc: 'International Travel Document' },
                  { id: 'National_ID', label: 'National ID Card', icon: CreditCard, desc: 'Government Issued Identity Card' },
                  { id: 'Driving_License', label: 'Driver License', icon: Car, desc: 'Official Motor Vehicle Permit' },
                ].map((type) => {
                  const Icon = type.icon;
                  const isSelected = documentType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setDocumentType(type.id as any)}
                      className={clsx(
                        'p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 select-none',
                        isSelected
                          ? 'bg-blue-50/80 border-blue-600 text-blue-700 font-bold shadow-xs ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      <div className={clsx(
                        'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold tracking-tight">{type.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal hidden sm:block leading-tight">{type.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Document Number Input */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1 font-heading">
                Step 2: Document / Identification Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder={
                  documentType === 'Passport' 
                    ? "e.g. 9-digit Passport Number (e.g. A12345678)"
                    : documentType === 'Driving_License'
                    ? "e.g. Driver's License Number (e.g. DL-98765432)"
                    : "e.g. Official Government ID Code (e.g. ID-45678901)"
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>

            {/* Two-Column Upload Zones */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 block mb-1 font-heading">
                Step 3: Document Clear Scans or Photos
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Front Document Upload */}
                <div>
                  <span className="text-[11px] font-bold text-slate-600 block mb-1">
                    Front Side <span className="text-rose-500">*</span>
                  </span>
                  <div className={clsx(
                    "border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer relative",
                    frontFile 
                      ? "border-emerald-400 bg-emerald-50/40" 
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-400"
                  )}>
                    <input
                      type="file"
                      id="modal-front-doc"
                      accept="image/png,image/jpeg,image/webp,application/pdf"
                      onChange={(e) => setFrontFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label htmlFor="modal-front-doc" className="cursor-pointer space-y-1 block">
                      {frontFile ? (
                        <>
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                          <span className="text-xs font-bold text-emerald-800 block truncate max-w-[200px] mx-auto">
                            {frontFile.name}
                          </span>
                          <span className="text-[10px] text-emerald-600 block font-medium">Ready to upload</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                          <span className="text-xs font-bold text-blue-600 block">
                            Upload Front Scan
                          </span>
                          <span className="text-[10px] text-slate-400 block">JPG, PNG, or PDF</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Back Document Upload */}
                <div>
                  <span className="text-[11px] font-bold text-slate-600 block mb-1">
                    Back Side {documentType === 'Passport' ? '(Optional)' : <span className="text-rose-500">*</span>}
                  </span>
                  <div className={clsx(
                    "border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer relative",
                    backFile 
                      ? "border-emerald-400 bg-emerald-50/40" 
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-400"
                  )}>
                    <input
                      type="file"
                      id="modal-back-doc"
                      accept="image/png,image/jpeg,image/webp,application/pdf"
                      onChange={(e) => setBackFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label htmlFor="modal-back-doc" className="cursor-pointer space-y-1 block">
                      {backFile ? (
                        <>
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                          <span className="text-xs font-bold text-emerald-800 block truncate max-w-[200px] mx-auto">
                            {backFile.name}
                          </span>
                          <span className="text-[10px] text-emerald-600 block font-medium">Ready to upload</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                          <span className="text-xs font-bold text-blue-600 block">
                            Upload Back Scan
                          </span>
                          <span className="text-[10px] text-slate-400 block">JPG, PNG, or PDF</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submission Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Encrypting &amp; Dispatching to Compliance...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Identification for Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Trust Badges Footer */}
            <div className="pt-2 flex items-center justify-center gap-6 text-[10px] text-slate-400 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-500" /> AES-256 SSL Storage
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3 text-blue-500" /> Regulatory Compliant
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-indigo-500" /> Confidential &amp; Verified
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  // If inline, render directly without the overlay wrapper
  if (isInline) {
    return (
      <div className="w-full flex justify-center py-4">
        {modalBody}
      </div>
    );
  }

  // Otherwise, render as full backdrop modal popup
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none flex items-center justify-center">
      {modalBody}
    </div>
  );
};
