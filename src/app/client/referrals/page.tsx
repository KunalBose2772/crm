'use client';

import React, { useState } from 'react';
import { 
  Gift, 
  Copy, 
  Check, 
  Percent, 
  QrCode, 
  Share2, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { ClientPageHeader } from '@/components/layout/ClientPageHeader';

export default function ClientReferralsPage() {
  const { impersonation, showToast } = useCRM();
  const [copied, setCopied] = useState(false);
  const client = impersonation.client;
  const refCode = client ? `REF-${client.id.replace('CL-', '')}` : 'REF-8891';
  const referralLink = `https://nd1crm.testcrm.co.in/register?ref=${refCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast('info', 'Link Copied', 'Your referral link has been copied to your clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl mx-auto pb-12">
      {/* 1. ROYAL BLUE PAGE HEADER */}
      <ClientPageHeader
        badge="Affiliate & Network"
        badgeIcon={<Gift className="h-6 w-6 sm:h-7 sm:w-7 text-amber-200" />}
        title="Refer & Earn Program"
        subtitle="Share your private invitation link with your trader network and earn 20% lifetime spread commission rebates."
        chips={[
          { label: 'Program Rebate', value: '20% Lifetime', icon: <Percent className="w-3.5 h-3.5 text-emerald-300" /> },
          { label: 'Referral Code', value: refCode, icon: <QrCode className="w-3.5 h-3.5 text-blue-200" /> },
        ]}
      />

      {/* 2. REFERRAL LINK & SHARING CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Link & Tier Information */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading">Your Private Referral Link</h2>
            <p className="text-xs text-slate-500 mt-0.5">Any accounts opened via this URL are permanently attributed to your profile.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 sm:pl-4">
            <span className="font-mono text-xs text-slate-700 truncate w-full sm:flex-1 py-1 px-2 sm:p-0">
              {referralLink}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Link'}</span>
            </button>
          </div>

          {/* Tier Milestones */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Commission Tier Levels</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Tier 1 (1-5 Users)</span>
                <div className="text-lg font-bold text-slate-700 font-mono">15% Rebate</div>
                <p className="text-[11px] text-slate-500">Starter affiliate rate</p>
              </div>
              <div className="p-3.5 rounded-xl border-2 border-blue-500 bg-blue-50/50 space-y-1 relative">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-600" /> Current Tier
                </span>
                <div className="text-lg font-bold text-blue-900 font-mono">20% Rebate</div>
                <p className="text-[11px] text-blue-700">6-20 active traders</p>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">VIP (20+ Users)</span>
                <div className="text-lg font-bold text-slate-700 font-mono">30% Rebate</div>
                <p className="text-[11px] text-slate-500">Institutional IB rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: How It Works & Program Benefits */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading">Program Workflow</h2>
            <p className="text-xs text-slate-500 mt-0.5">3 simple steps to generating automated passive rebates.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 font-heading">Invite Traders</h4>
                <p className="text-xs text-slate-500 mt-0.5">Share your referral link on social media, trading channels, or direct invite.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 font-heading">Clients Open & Fund Account</h4>
                <p className="text-xs text-slate-500 mt-0.5">When referred users open an MT5 account and start trading, volume tracks live.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 font-heading">Earn Lifetime Cash Rebates</h4>
                <p className="text-xs text-slate-500 mt-0.5">Rebates calculate per round-turn lot and credit directly into your withdrawal wallet.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
