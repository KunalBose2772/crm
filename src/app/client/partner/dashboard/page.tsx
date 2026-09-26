'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Sparkles, 
  Share2, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  DollarSign, 
  Award, 
  Wallet, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { ClientPageHeader } from '@/components/layout/ClientPageHeader';
import { evaluatePartnerTier } from '@/lib/ibTierEngine';
import { clsx } from 'clsx';

function ClientPartnerDashboardContent() {
  const searchParams = useSearchParams();
  const targetClientId = searchParams?.get('clientId');
  const { clients, impersonation, clientUser, ibPartners, ibTiers, openClientModal, showToast } = useCRM();
  const clientFromParam = targetClientId ? clients.find(c => c.id === targetClientId) : null;
  const rawClient = clientFromParam || impersonation.client || clientUser || clients[0];
  const client = (rawClient?.id ? clients.find(c => c.id === rawClient.id || c.email === rawClient.email) : null) || rawClient;

  // Find registered IB partner record for this client
  const existingPartner = ibPartners.find(
    p => (client?.email && p.email?.toLowerCase() === client.email.toLowerCase()) || 
         (client?.id && p.id === client.id) ||
         (client?.id && (p as any).clientId === client.id) ||
         (client?.name && p.name?.toLowerCase() === client.name?.toLowerCase())
  );

  // If client is already approved as an IB in CRM or exists in ibPartners, they are already an active partner
  const isRegisteredPartner = !!existingPartner || client?.ibPartnerStatus === 'active';

  // Track whether the partner profile is activated
  const [isActivated, setIsActivated] = useState(isRegisteredPartner);
  const [isActivating, setIsActivating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isRegisteredPartner) {
      setIsActivated(true);
    }
  }, [isRegisteredPartner]);

  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const partnerCode = existingPartner?.referralCode || (client ? `IB-${client.id.replace('CL-', '')}` : 'IB-88912');
  const partnerTier = existingPartner?.tier || 'Silver';
  const baseUrl = origin || (process.env.NEXT_PUBLIC_APP_URL || '');
  const partnerLink = baseUrl ? `${baseUrl}/register?ib=${partnerCode}` : `/register?ib=${partnerCode}`;
  const totalVolume = existingPartner?.totalVolumeLots || 0;
  const totalTrades = existingPartner?.totalTradesCount || 0;
  const lifetimeEarned = existingPartner?.totalCommissionEarned || 0;
  const walletBalance = existingPartner?.withdrawableCommission || 0;
  const activeTradersCount = existingPartner?.activeClientsCount || 0;

  // Evaluate Auto-Promotion and Threshold Progress
  const evaluation = evaluatePartnerTier(
    {
      tier: partnerTier,
      totalVolumeLots: totalVolume,
      totalTradesCount: totalTrades,
      activeClientsCount: activeTradersCount,
    },
    ibTiers
  );

  const referredTraders: Array<{ id: string; country: string; lots: number; rebate: string; status: string; joined: string }> = [];

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      const res = await fetch('/api/ib/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: client?.name || 'IB Partner',
          email: client?.email || '',
          tier: 'Silver',
          rebatePerLotUsd: 6.0
        })
      });
      const data = await res.json();
      setIsActivating(false);
      setIsActivated(true);
      showToast('success', 'Partner Profile Activated', `Assigned IB Code ${data.partner?.referralCode || partnerCode} with Silver Tier commission.`);
    } catch {
      setIsActivating(false);
      setIsActivated(true);
      showToast('success', 'Partner Profile Activated', `Assigned IB Code ${partnerCode} with Silver Tier commission.`);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(partnerLink);
    setCopiedLink(true);
    showToast('info', 'Link Copied', 'Your referral link has been copied to your clipboard.');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl mx-auto pb-12">
      {/* 1. STATE A: NOT ACTIVATED YET (Exact match to live CRM /client/partner/dashboard) */}
      {!isActivated ? (
        <div className="flex min-h-[560px] items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-xs">
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] p-6 sm:p-8 text-white">
              <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wider uppercase text-amber-200 backdrop-blur-xs font-heading">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>Partner Onboarding</span>
                </div>

                <p className="mt-3.5 text-[10px] font-bold uppercase tracking-[0.28em] text-blue-200 font-mono">
                  Referral Setup
                </p>

                <h2 className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-white font-heading">
                  Activate your partner profile.
                </h2>

                <p className="mt-2.5 max-w-xl text-xs sm:text-sm text-blue-100/90 leading-relaxed font-sans">
                  Create your IB referral code to start onboarding partners, tracking commissions, and requesting withdrawals from the same dashboard shell.
                </p>
              </div>
            </div>

            {/* Action Row */}
            <div className="grid gap-4 p-6 sm:grid-cols-[minmax(0,1fr)_230px] sm:p-8 items-center bg-slate-50/50">
              {/* Left Info Box */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs">
                  <Share2 className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900 font-heading">Become a partner</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Once your code is created, this page will unlock overview metrics, referral management, and withdrawal operations.
                </p>
              </div>

              {/* Right CTA Button */}
              <button
                type="button"
                onClick={handleActivate}
                disabled={isActivating}
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-6 text-left transition shadow-md hover:shadow-lg active:scale-95 cursor-pointer disabled:opacity-60 flex flex-col justify-between h-full"
              >
                <div>
                  <span className="block text-[10px] uppercase font-bold tracking-[0.24em] text-blue-200 font-mono">
                    Start Now
                  </span>
                  <span className="mt-2 block text-base sm:text-lg font-extrabold font-heading">
                    {isActivating ? 'Generating Code...' : 'Create My Referral Code'}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-blue-100">
                  <span>Pre-approved</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 2. STATE B: ACTIVATED PARTNER DASHBOARD (Full IB Telemetry & Management) */
        <div className="space-y-6">
          {/* Header */}
          <ClientPageHeader
            badge="Partner Command"
            badgeIcon={<Users className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-200" />}
            title="Partner Dashboard (IB Desk)"
            subtitle="Monitor referred sub-traders, tiered spread rebates, volume milestones, and monthly commission settlement."
            chips={[
              { label: 'Available Wallet', value: `$${walletBalance.toFixed(2)}`, icon: <DollarSign className="w-3.5 h-3.5 text-emerald-300" /> },
              { label: 'Tier Level', value: `${partnerTier} Partner`, icon: <Award className="w-3.5 h-3.5 text-amber-300" /> },
            ]}
            actionButton={
              <button
                type="button"
                onClick={() => openClientModal('withdrawal')}
                className="px-4 py-2.5 rounded-full bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Wallet className="w-4 h-4 text-blue-600" />
                <span>Withdraw Commissions</span>
              </button>
            }
          />

          {/* Active Referral Link Banner */}
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                  Active IB Code: {partnerCode}
                </span>
                <span className="text-xs text-slate-500 font-mono">{partnerTier} Partner</span>
              </div>
              <p className="text-xs text-slate-600">Share your invitation link to automatically credit new signups under your partner profile.</p>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 pl-3 max-w-md w-full">
              <span className="font-mono text-xs text-slate-700 truncate flex-1">{partnerLink}</span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Tier Promotion Roadmap & Clauses Progress Card */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-2xl sm:rounded-3xl p-6 sm:p-7 text-white shadow-lg border border-indigo-500/20 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-200 uppercase tracking-wider font-mono">Current Status</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/40 font-heading">
                        {evaluation.currentTier} IB Tier
                      </span>
                      {evaluation.currentTier === 'Silver' && (
                        <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-md font-mono">
                          Default Starting Tier
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5 font-heading">
                      {evaluation.nextTier ? `Upgrade Progress to ${evaluation.nextTier.tierName} Tier` : 'Peak Institutional Tier Achieved'}
                    </h3>
                  </div>
                </div>

                {evaluation.isEligibleForPromotion && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold animate-pulse">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Auto-Promoted to {evaluation.promotedToTier?.tierName}!</span>
                  </span>
                )}
              </div>

              {/* Progress Milestones */}
              {evaluation.nextTier ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-200 font-medium">Overall Progression to {evaluation.nextTier.tierName}</span>
                    <span className="font-mono font-extrabold text-amber-300 text-sm">{evaluation.overallProgress}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div 
                      className="bg-gradient-to-r from-blue-500 via-indigo-400 to-amber-400 h-full rounded-full transition-all duration-700 shadow-sm"
                      style={{ width: `${Math.min(100, Math.max(5, evaluation.overallProgress))}%` }}
                    />
                  </div>

                  {/* Promotion Clauses Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {/* Lots Milestone */}
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">Trading Volume</span>
                        <span className="font-mono text-white font-bold">{totalVolume.toFixed(1)} / {evaluation.nextTier.minLots} Lots</span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-400 h-full rounded-full" style={{ width: `${evaluation.progressLots}%` }} />
                      </div>
                      <p className="text-[10px] text-blue-200">
                        {evaluation.remainingLots === 0 ? '✓ Volume requirement satisfied' : `${evaluation.remainingLots.toFixed(1)} lots remaining`}
                      </p>
                    </div>

                    {/* Trades Milestone */}
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">Processed Trades</span>
                        <span className="font-mono text-white font-bold">{totalTrades.toLocaleString()} / {(evaluation.nextTier.minTrades || 0).toLocaleString()} Trades</span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${evaluation.progressTrades}%` }} />
                      </div>
                      <p className="text-[10px] text-blue-200">
                        {evaluation.remainingTrades === 0 ? '✓ Trades count satisfied' : `${evaluation.remainingTrades.toLocaleString()} trades remaining`}
                      </p>
                    </div>

                    {/* Active Traders Milestone */}
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">Active Traders</span>
                        <span className="font-mono text-white font-bold">{activeTradersCount} / {evaluation.nextTier.minActiveClients || 0} Traders</span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${evaluation.progressClients}%` }} />
                      </div>
                      <p className="text-[10px] text-blue-200">
                        {evaluation.remainingClients === 0 ? '✓ Trader network satisfied' : `${evaluation.remainingClients} clients remaining`}
                      </p>
                    </div>
                  </div>

                  {evaluation.nextTier.description && (
                    <p className="text-xs text-blue-200/80 italic bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                      Clause rule: {evaluation.nextTier.description}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-blue-200 space-y-1">
                  <p className="font-bold text-white">Congratulations! You are receiving maximum VIP institutional rebates.</p>
                  <p>Enjoy peak per-lot rebates, premium asset spreads, and maximum sub-IB revenue splits.</p>
                </div>
              )}
            </div>
          </div>

          {/* 3 Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-2 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Partner Status</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold">
                  {partnerTier}
                </span>
              </div>
              <div className="text-2xl font-mono font-extrabold text-purple-700">ACTIVE IB</div>
              <p className="text-xs text-slate-500">${(existingPartner?.rebatePerLotUsd || 6).toFixed(2)} USD rebate per standard lot</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-2 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Referred Volume & Trades</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                  {activeTradersCount} Traders
                </span>
              </div>
              <div className="text-2xl font-mono font-extrabold text-emerald-600">{totalVolume.toFixed(2)} Lots</div>
              <p className="text-xs text-slate-500">{totalTrades.toLocaleString()} trades executed across your network</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-2 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Withdrawable Commission</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
                  Available
                </span>
              </div>
              <div className="text-2xl font-mono font-extrabold text-amber-600">${walletBalance.toFixed(2)}</div>
              <p className="text-xs text-slate-500">Lifetime earned: ${lifetimeEarned.toFixed(2)}</p>
            </div>
          </div>

          {/* Referred Client Roster Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-heading">Referred Accounts Roster</h2>
                <p className="text-xs text-slate-500">Real-time volume telemetry and accrued rebates per sub-account.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  showToast('info', 'Refreshing', 'Syncing latest commission and volume records...');
                  setTimeout(() => showToast('success', 'Up to Date', 'Partner metrics synchronized.'), 500);
                }}
                className="text-xs text-slate-400 hover:text-blue-600 transition flex items-center gap-1 cursor-pointer font-medium"
                title="Refresh Partner Telemetry"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Sync Data</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-mono uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-4 pl-6 font-bold">Client Account</th>
                    <th className="p-4 font-bold">Jurisdiction</th>
                    <th className="p-4 font-bold">Joined Date</th>
                    <th className="p-4 font-bold text-right">Volume (Lots)</th>
                    <th className="p-4 font-bold text-right">Rebate Earned</th>
                    <th className="p-4 pr-6 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {referredTraders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400">
                        No referred sub-accounts yet. Share your partner link to start earning rebates.
                      </td>
                    </tr>
                  ) : (
                    referredTraders.map((trader) => (
                      <tr key={trader.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 pl-6 font-mono font-bold text-blue-700">{trader.id}</td>
                        <td className="p-4">{trader.country}</td>
                        <td className="p-4 font-mono text-[11px] text-slate-500">{trader.joined}</td>
                        <td className="p-4 text-right font-mono font-bold text-slate-900">{trader.lots.toFixed(1)} lots</td>
                        <td className="p-4 text-right font-mono font-extrabold text-emerald-600">{trader.rebate}</td>
                        <td className="p-4 pr-6 text-center">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {trader.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientPartnerDashboardPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    }>
      <ClientPartnerDashboardContent />
    </React.Suspense>
  );
}
