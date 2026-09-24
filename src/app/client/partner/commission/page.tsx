'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Users, 
  CreditCard, 
  LayoutPanelTop, 
  Search, 
  FileText, 
  File, 
  ArrowUpRight, 
  Eye, 
  Download,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { ClientPageHeader } from '@/components/layout/ClientPageHeader';
import { clsx } from 'clsx';

interface IBPartnerRow {
  accountNumber: number;
  name: string;
  email: string;
  level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  totalVolume: number;
  totalEarned: number;
  status: 'Active' | 'Pending';
}

export default function ClientPartnerCommissionPage() {
  const { showToast } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'All' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5'>('All');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Mock multi-tier partner network data
  const initialPartners: IBPartnerRow[] = [
    {
      accountNumber: 98989898912,
      name: 'Alexander Wright',
      email: 'alex.wright@tradehub.uk',
      level: 'L1',
      totalVolume: 64.20,
      totalEarned: 513.60,
      status: 'Active',
    },
    {
      accountNumber: 98989898944,
      name: 'Elena Rostova',
      email: 'elena.rostova@finance.de',
      level: 'L1',
      totalVolume: 48.50,
      totalEarned: 388.00,
      status: 'Active',
    },
    {
      accountNumber: 98989898978,
      name: 'Marcus Chen',
      email: 'm.chen@apexcapital.sg',
      level: 'L2',
      totalVolume: 32.10,
      totalEarned: 192.60,
      status: 'Active',
    },
    {
      accountNumber: 98989898991,
      name: 'Tariq Al-Mansoor',
      email: 'tariq.mansoor@gulfinv.ae',
      level: 'L1',
      totalVolume: 25.40,
      totalEarned: 203.20,
      status: 'Active',
    },
    {
      accountNumber: 98989898905,
      name: 'Sophie Laurent',
      email: 'sophie.laurent@zurichtrade.ch',
      level: 'L3',
      totalVolume: 14.00,
      totalEarned: 84.00,
      status: 'Active',
    },
  ];

  const filteredPartners = initialPartners.filter((p) => {
    if (selectedLevel !== 'All' && p.level !== selectedLevel) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.accountNumber.toString().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalCommission = initialPartners.reduce((acc, p) => acc + p.totalEarned, 0);
  const totalVolume = initialPartners.reduce((acc, p) => acc + p.totalVolume, 0);
  const activeCount = initialPartners.length;

  const handleCopyAccount = (e: React.MouseEvent, acc: number) => {
    e.stopPropagation();
    navigator.clipboard.writeText(acc.toString());
    setCopiedAccount(acc.toString());
    showToast('info', 'Account Copied', `Account #${acc} copied to clipboard.`);
    setTimeout(() => setCopiedAccount(null), 1800);
  };

  const handleExport = (type: 'Excel' | 'PDF') => {
    showToast('success', `${type} Export Ready`, `Partner commission statement exported as ${type}.`);
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl mx-auto pb-12">
      {/* 1. ROYAL BLUE HERO BANNER */}
      <ClientPageHeader
        badge="Earnings Matrix"
        badgeIcon={<DollarSign className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-300" />}
        title="Commission Snapshot"
        subtitle="Core network performance sits on dashboard-style KPI cards with transparent multi-tier rebate telemetry."
        chips={[
          { label: 'Total Commission', value: `$${totalCommission.toFixed(2)}`, icon: <DollarSign className="w-3.5 h-3.5 text-emerald-300" /> },
          { label: 'Network Volume', value: `${totalVolume.toFixed(1)} Lots`, icon: <BarChart3 className="w-3.5 h-3.5 text-amber-300" /> },
        ]}
      />

      {/* Navigation Sub-Tabs (Dashboard vs Commission vs Onboarding) */}
      <div className="flex items-center gap-2 border-b border-slate-200/90 pb-3">
        <Link
          href="/client/partner/dashboard"
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
        >
          Partner Overview
        </Link>
        <Link
          href="/client/partner/commission"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs"
        >
          Commission Matrix
        </Link>
        <Link
          href="/client/partner/create"
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
        >
          Onboarding &amp; Tiers
        </Link>
      </div>

      {/* 2. 6 EARNINGS KPI CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {/* Total Commission */}
        <div className="group rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 p-3 shadow-2xs">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-400 group-hover:text-emerald-600 transition">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
            Total Commission
          </p>
          <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
            ${totalCommission.toFixed(4)}
          </p>
          <p className="mt-1.5 text-xs text-slate-500">From 184 processed trades</p>
        </div>

        {/* Total Volume */}
        <div className="group rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-3">
            <div className="rounded-xl border border-sky-200 bg-sky-50 text-sky-600 p-3 shadow-2xs">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-400 group-hover:text-sky-600 transition">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
            Total Volume
          </p>
          <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-blue-700 font-mono">
            {totalVolume.toFixed(4)}
          </p>
          <p className="mt-1.5 text-xs text-slate-500">Aggregated lot flow across referred accounts</p>
        </div>

        {/* Active Partners */}
        <div className="group rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-3">
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 p-3 shadow-2xs">
              <Users className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-400 group-hover:text-indigo-600 transition">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
            Active Partners
          </p>
          <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
            {activeCount}
          </p>
          <p className="mt-1.5 text-xs text-slate-500">Referred traders in the commission network</p>
        </div>

        {/* 30-Day Summary */}
        <div className="group rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-3">
            <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-600 p-3 shadow-2xs">
              <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-400 group-hover:text-amber-600 transition">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
            30-Day Summary
          </p>
          <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
            ${totalCommission.toFixed(4)}
          </p>
          <p className="mt-1.5 text-xs text-slate-500">Most recent rolling commission window</p>
        </div>

        {/* Pending Commission */}
        <div className="group rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-3">
            <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-600 p-3 shadow-2xs">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-400 group-hover:text-rose-600 transition">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
            Pending Commission
          </p>
          <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
            $0.0000
          </p>
          <p className="mt-1.5 text-xs text-slate-500">Reserved for unsettled or future payout logic</p>
        </div>

        {/* Avg Per Trade */}
        <div className="group rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-3">
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 p-3 shadow-2xs">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-400 group-hover:text-indigo-600 transition">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
            Avg Per Trade
          </p>
          <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">
            ${(totalCommission / 184).toFixed(4)}
          </p>
          <p className="mt-1.5 text-xs text-slate-500">Mean rebate generated per completed trade</p>
        </div>
      </div>

      {/* 3. NETWORK LEDGER (IB Partners Table) */}
      <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden">
        {/* Table Header Section */}
        <div className="border-b border-slate-100 p-5 sm:p-6 lg:p-7 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                <LayoutPanelTop className="h-3.5 w-3.5 text-amber-500" />
                <span>Network Ledger</span>
              </div>
              <h2 className="mt-2 flex items-center gap-2 text-lg sm:text-2xl font-extrabold text-slate-900 font-heading">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                <span>IB Partners ({filteredPartners.length})</span>
              </h2>
              <p className="mt-1 max-w-2xl text-xs sm:text-sm text-slate-500">
                Search the hierarchy, isolate level segments, and inspect trade performance for any partner account.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search by account, partner name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-11 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
              type="text"
            />
          </div>

          {/* Level Filter Pills & Export Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-1">
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
              {(['All', 'L1', 'L2', 'L3', 'L4', 'L5'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelectedLevel(level)}
                  className={clsx(
                    "whitespace-nowrap rounded-xl border px-3.5 py-1.5 text-xs font-bold transition cursor-pointer font-mono",
                    selectedLevel === level
                      ? "border-blue-600 bg-blue-600 text-white shadow-2xs"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleExport('Excel')}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs active:scale-95"
              >
                <FileText className="h-3.5 w-3.5 text-emerald-600" />
                <span>Excel</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport('PDF')}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs active:scale-95"
              >
                <File className="h-3.5 w-3.5 text-rose-600" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          {filteredPartners.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-600 shadow-2xs">
                <Users className="h-10 w-10 text-blue-500" />
              </div>
              <span className="font-bold text-slate-900 text-base sm:text-lg font-heading">No IB Partners Found</span>
              <span className="text-slate-500 text-xs text-center px-4 max-w-sm">
                IB partners will appear here once you have active attributed referrals.
              </span>
            </div>
          ) : (
            /* Populated Table */
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-mono uppercase text-slate-500 font-bold">
                <tr>
                  <th className="px-6 py-4">Account Number</th>
                  <th className="px-6 py-4">Name / Email</th>
                  <th className="px-6 py-4 text-center">Level</th>
                  <th className="px-6 py-4 text-right">Total Volume</th>
                  <th className="px-6 py-4 text-right">Total Earned</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredPartners.map((p) => (
                  <tr key={p.accountNumber} className="hover:bg-slate-50/70 transition-colors">
                    {/* Account */}
                    <td className="px-6 py-4 font-mono font-bold text-blue-700">
                      <div className="flex items-center gap-1.5">
                        <span>#{p.accountNumber}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyAccount(e, p.accountNumber)}
                          className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                          title="Copy account number"
                        >
                          {copiedAccount === p.accountNumber.toString() ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Name / Email */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 font-heading">{p.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{p.email}</p>
                    </td>

                    {/* Level */}
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono font-bold text-[11px]">
                        {p.level}
                      </span>
                    </td>

                    {/* Total Volume */}
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                      {p.totalVolume.toFixed(2)} lots
                    </td>

                    {/* Total Earned */}
                    <td className="px-6 py-4 text-right font-mono font-extrabold text-emerald-600 text-sm">
                      ${p.totalEarned.toFixed(2)} USD
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
