'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  UserPlus, 
  ArrowRight, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Users, 
  DollarSign, 
  Award,
  ExternalLink
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { clsx } from 'clsx';

export default function ClientPartnerCreatePage() {
  const { impersonation, showToast } = useCRM();
  const client = impersonation.client;

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const partnerCode = client ? `IB-${client.id.replace('CL-', '')}` : 'IB-88912';
  const partnerLink = `https://nd1crm.testcrm.co.in/register?ib=${partnerCode}`;

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
      showToast('success', 'Partner Account Activated', `Assigned IB Code ${partnerCode} with Tier 1 commission.`);
    }, 800);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(partnerLink);
    setCopiedLink(true);
    showToast('info', 'Link Copied', 'Your unique partner link has been copied to clipboard.');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-5xl mx-auto pb-12">
      {/* 1. ROYAL BLUE HERO SECTION (Partner Onboarding) */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-blue-400/30 bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] p-6 sm:p-8 md:p-10 shadow-md text-white">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] xl:items-start">
          {/* Left Column: Onboarding Details & CTA */}
          <div className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase text-amber-200 backdrop-blur-xs font-heading">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>Partner Onboarding</span>
              </div>

              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.25em] text-blue-200 font-mono">
                Client Dashboard
              </p>

              <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white font-heading leading-tight">
                Create your partner account
              </h1>

              <p className="mt-2.5 max-w-xl text-xs sm:text-sm text-blue-100/90 leading-relaxed font-sans">
                Generate a referral identity, unlock partner tracking, and start routing prospects into a measurable acquisition pipeline.
              </p>
            </div>

            {/* Generated State Card */}
            {isGenerated ? (
              <div className="rounded-2xl border border-emerald-300/30 bg-white/15 p-5 backdrop-blur-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-400/20 border border-emerald-300/40 flex items-center justify-center text-emerald-300 shadow-2xs">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-heading">Partner Desk Active</h3>
                    <p className="text-xs text-blue-100">IB Code: <span className="font-mono font-bold text-amber-300">{partnerCode}</span></p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 bg-black/20 border border-white/15 rounded-xl p-2 sm:pl-3">
                  <span className="font-mono text-xs text-blue-100 truncate w-full sm:flex-1 py-1 px-2 sm:p-0">
                    {partnerLink}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white text-blue-950 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>

                <div className="pt-1">
                  <Link
                    href="/client/partners"
                    className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-amber-200 underline decoration-white/40 underline-offset-4"
                  >
                    <span>Go to Partner Dashboard &amp; Roster</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              /* Generate CTA */
              <div className="space-y-4 pt-1">
                <div className="flex items-start gap-3 rounded-2xl border border-blue-300/20 bg-white/10 px-4 py-3 text-xs text-blue-100 backdrop-blur-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                  <span>Your master trading account is pre-approved for Tier 1 Master IB commissions ($8.00 USD / lot rebate).</span>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 px-6 py-3.5 text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-60 whitespace-nowrap"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-900/30 border-t-blue-900 rounded-full animate-spin" />
                      <span>Activating Partner ID...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 text-blue-600" />
                      <span>Generate partner account</span>
                      <ArrowRight className="h-4 w-4 text-blue-600" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: 3 Benefit Cards */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 self-start">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4.5 backdrop-blur-xs space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200 font-mono">Benefit</p>
              <h3 className="text-sm sm:text-base font-bold text-white font-heading">Earn on activity</h3>
              <p className="text-xs text-blue-100/90 leading-relaxed">
                Receive commission credit as attributed clients begin executing live trades.
              </p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-4.5 backdrop-blur-xs space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200 font-mono">Benefit</p>
              <h3 className="text-sm sm:text-base font-bold text-white font-heading">Measure performance</h3>
              <p className="text-xs text-blue-100/90 leading-relaxed">
                Track balances, multi-tier volumes, and withdrawals from the same dashboard system.
              </p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-4.5 backdrop-blur-xs space-y-1 sm:col-span-2 xl:col-span-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200 font-mono">Benefit</p>
              <h3 className="text-sm sm:text-base font-bold text-white font-heading">Scale distribution</h3>
              <p className="text-xs text-blue-100/90 leading-relaxed">
                Use one persistent referral code across marketing campaigns without referral limits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROGRAM DETAILS & TIERS CARD */}
      <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 font-heading">Partnership Structure &amp; Tier Payouts</h2>
          <p className="text-xs text-slate-500 mt-0.5">Spread rebate schedules are audited and reconciled daily at market close.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border-2 border-blue-500 bg-blue-50/50 space-y-1.5 relative">
            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-mono text-[10px] font-bold uppercase">
              Current Tier
            </span>
            <h3 className="text-base font-bold text-blue-900 font-heading">Tier 1 Master IB</h3>
            <p className="text-2xl font-mono font-extrabold text-blue-700">$8.00 <span className="text-xs font-normal text-slate-500">/ lot</span></p>
            <p className="text-[11px] text-slate-600">Up to 250 monthly trading lots</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1.5">
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono text-[10px] font-bold uppercase">
              Growth Tier
            </span>
            <h3 className="text-base font-bold text-slate-800 font-heading">Tier 2 Premier IB</h3>
            <p className="text-2xl font-mono font-extrabold text-slate-800">$10.00 <span className="text-xs font-normal text-slate-500">/ lot</span></p>
            <p className="text-[11px] text-slate-500">251 – 750 monthly trading lots</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1.5">
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono text-[10px] font-bold uppercase">
              Institutional
            </span>
            <h3 className="text-base font-bold text-slate-800 font-heading">Tier 3 Elite IB</h3>
            <p className="text-2xl font-mono font-extrabold text-amber-600">$12.50 <span className="text-xs font-normal text-slate-500">/ lot</span></p>
            <p className="text-[11px] text-slate-500">750+ monthly trading lots + sub-IB override</p>
          </div>
        </div>
      </section>
    </div>
  );
}
