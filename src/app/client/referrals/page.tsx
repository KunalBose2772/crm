'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Gift, Copy, Check } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export default function ClientReferralsPage() {
  const { impersonation, showToast } = useCRM();
  const [copied, setCopied] = useState(false);
  const client = impersonation.client;
  const refCode = client ? `REF-${client.id.replace('CL-', '')}` : 'REF-8891';
  const referralLink = `https://nd1crm.testcrm.co.in/register?ref=${refCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast('info', 'Link Copied', 'Referral link copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/client/dashboard" className="text-xs text-purple-400 hover:underline flex items-center gap-1.5 mb-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="font-serif text-3xl font-bold text-white tracking-tight">Refer a Friend</h1>
        <p className="text-xs text-slate-400 mt-1">Earn 20% lifetime volume rebates on every trader you invite</p>
      </div>

      <div className="bg-[#0E1422] border border-[#1C263C] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-900/30 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-white">Your Unique Referral Link</h3>
            <p className="text-xs text-slate-400">Share this link to credit new trader sign-ups under your account</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#12192A] border border-[#1E2B44] rounded-xl p-2 pl-4">
          <span className="font-mono text-xs text-slate-300 truncate flex-1">{referralLink}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
