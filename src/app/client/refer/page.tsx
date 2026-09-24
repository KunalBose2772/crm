'use client';

import React, { useState } from 'react';
import { 
  Gift, 
  Sparkles, 
  Users, 
  Copy, 
  Check, 
  Share2, 
  CheckCircle2, 
  Percent, 
  QrCode, 
  ArrowUpRight, 
  DollarSign,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { ClientPageHeader } from '@/components/layout/ClientPageHeader';

export default function ClientReferPage() {
  const { impersonation, showToast } = useCRM();

  // State: Code generation status
  const [hasCode, setHasCode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const client = impersonation.client;
  const referralCode = client ? `REF-${client.id.replace('CL-', '')}` : 'REF-8891';
  const referralLink = `https://nd1crm.testcrm.co.in/register?ref=${referralCode}`;

  const handleCreateCode = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setHasCode(true);
      setIsGenerating(false);
      showToast('success', 'Referral Code Created', `Your personal code ${referralCode} has been activated.`);
    }, 600);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast('info', 'Link Copied', 'Your referral link has been copied to your clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl mx-auto pb-12">
      {/* 1. SIGNATURE ROYAL BLUE HERO BANNER */}
      <ClientPageHeader
        badge="Referral Program"
        badgeIcon={<Gift className="h-6 w-6 sm:h-7 sm:w-7 text-amber-200" />}
        title="Activate your referral desk."
        subtitle="Generate a code and start tracking rewards. This page follows the unified dashboard theme while keeping referral setup, sharing, and earnings controls in one place."
        chips={[
          { label: 'Setup', value: 'One-click generation', icon: <Gift className="w-3.5 h-3.5 text-emerald-300" /> },
          { label: 'Reward flow', value: 'Share, convert, track', icon: <TrendingUp className="w-3.5 h-3.5 text-sky-300" /> },
          { label: 'Status', value: hasCode ? 'Code Active' : 'Code not created', icon: <Sparkles className="w-3.5 h-3.5 text-amber-300" /> },
        ]}
      />

      {/* 2. PROGRAM VALUE & STATUS HIGHLIGHT CARDS */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
            Program value
          </p>
          <p className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
            Referral-led growth
          </p>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
            Bring in new traders and manage the reward cycle from the same unified workspace.
          </p>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
            Status
          </p>
          <p className="mt-2 text-xl sm:text-2xl font-extrabold text-blue-700 font-heading font-mono">
            {hasCode ? `Active (${referralCode})` : 'Code not created'}
          </p>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
            {hasCode
              ? 'Your personal link is active and tracking incoming registrations.'
              : 'Generate your personal link to unlock sharing and dashboard tracking.'}
          </p>
        </div>
      </div>

      {/* 3. SPLIT WORKSPACE: CREATE REFERRAL CODE / ACTIVE DESK & HOW REWARDS WORK */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.95fr)]">
        {/* Left Section: Create Referral Code OR Active Referral Desk */}
        <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-7 shadow-xs space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Client dashboard</span>
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                {hasCode ? 'Your referral desk' : 'Create referral code'}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                {hasCode
                  ? 'Distribute your personal registration link and oversee your referred network.'
                  : 'The empty state behaves like a proper dashboard module instead of a separate marketing card.'}
              </p>
            </div>
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs sm:flex">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>

          {!hasCode ? (
            /* Empty State: 3 Grid Cards + Action Button */
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-blue-700">
                    Referral code
                  </p>
                  <p className="mt-2 text-base font-extrabold text-slate-900 font-heading">
                    Generated for you
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Instant code allocation</p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-blue-700">
                    Sharing
                  </p>
                  <p className="mt-2 text-base font-extrabold text-slate-900 font-heading">
                    Copy &amp; distribute
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Direct link or invite</p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-blue-700">
                    Tracking
                  </p>
                  <p className="mt-2 text-base font-extrabold text-slate-900 font-heading">
                    Dashboard stats
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Real-time conversions</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateCode}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 text-xs sm:text-sm transition shadow-sm cursor-pointer active:scale-98 disabled:opacity-60"
              >
                <Gift className="h-4 w-4" />
                <span>{isGenerating ? 'Activating Referral Desk...' : 'Create my referral code'}</span>
              </button>
            </div>
          ) : (
            /* Active State: Link Box + KPI Counters + Tier Breakdown */
            <div className="space-y-6">
              {/* Copy Referral Link Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 font-heading">
                  Your Personal Referral Link
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 sm:pl-4">
                  <span className="font-mono text-xs text-slate-700 truncate w-full sm:flex-1 py-1 px-2 sm:p-0">
                    {referralLink}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied to Clipboard' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* Live Metric Counters */}
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
                    Total Referrals
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900 font-mono">0</p>
                  <p className="mt-1 text-[11px] text-slate-500">Registered traders</p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
                    Network Volume
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-blue-700 font-mono">0.00 Lots</p>
                  <p className="mt-1 text-[11px] text-slate-500">Aggregated trading flow</p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
                    Total Earned
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-emerald-600 font-mono">$0.00</p>
                  <p className="mt-1 text-[11px] text-slate-500">Lifetime rebate cash</p>
                </div>
              </div>

              {/* Commission Tier Schedule */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Commission Tier Levels
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Tier 1 (1–5 Users)</span>
                    <div className="text-base font-bold text-slate-700 font-mono">15% Rebate</div>
                    <p className="text-[11px] text-slate-500">Starter affiliate rate</p>
                  </div>
                  <div className="p-3.5 rounded-xl border-2 border-blue-500 bg-blue-50/50 space-y-1 relative">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 font-mono flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-600" /> Current Tier
                    </span>
                    <div className="text-base font-bold text-blue-900 font-mono">20% Rebate</div>
                    <p className="text-[11px] text-blue-700">6–20 active traders</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">VIP (20+ Users)</span>
                    <div className="text-base font-bold text-slate-700 font-mono">30% Rebate</div>
                    <p className="text-[11px] text-slate-500">Institutional IB rate</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Right Section: How Rewards Work */}
        <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-7 shadow-xs space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                <Users className="h-3.5 w-3.5 text-blue-600" />
                <span>Client dashboard</span>
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                How rewards work
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Setup expectations are shown in the same compact summary style used across the dashboard.
              </p>
            </div>
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs sm:flex">
              <Users className="h-6 w-6" />
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Step 1 */}
            <article className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-xs font-mono font-bold text-blue-700">
                  1
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-heading">
                    Share your code
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Send your personal signup link to clients, partners, or friends from the channels you already use.
                  </p>
                </div>
              </div>
            </article>

            {/* Step 2 */}
            <article className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-xs font-mono font-bold text-blue-700">
                  2
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-heading">
                    They register
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Every signup tied to your code is tracked back to your referral workspace automatically.
                  </p>
                </div>
              </div>
            </article>

            {/* Step 3 */}
            <article className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-xs font-mono font-bold text-emerald-700">
                  3
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-heading">
                    You earn
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Commission totals and withdrawable balance accumulate directly inside your dashboard view.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
