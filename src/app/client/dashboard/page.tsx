'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCRM } from '@/context/CRMContext';
import {
  AlertTriangle,
  Shield,
  Server,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  ChevronRight,
  CreditCard,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { clsx } from 'clsx';

export default function ClientDashboardPage() {
  const router = useRouter();
  const { impersonation, stopImpersonation, showToast } = useCRM();

  // Active client data or fallback client matching Image 3 (test nikita / ref soumya)
  const client = impersonation.client || {
    id: 'CL-8891',
    name: 'test nikita',
    email: '68l0pklxpu@8btiwd.com',
    phone: '+1 555 0192',
    country: 'United Kingdom',
    city: 'London',
    registeredAt: '2026-03-12',
    status: 'verified' as const,
    totalDeposit: 0,
    totalWithdrawal: 0,
    netDeposit: 0,
    totalBalance: 5937.47,
    accounts: [
      {
        id: 'acc-mt5-1',
        login: 260730279,
        platform: 'MT5' as const,
        type: 'Standard' as const,
        currency: 'USD',
        balance: 5937.47,
        equity: 5937.47,
        freeMargin: 5937.47,
        marginLevel: 100,
        leverage: '1:300',
        server: 'OceanMarkets-Live',
        createdAt: '2026-03-15',
      },
    ],
  };

  const clientFirstName = client.name ? client.name.split(' ')[0] : 'Trader';
  const totalBalance = client.totalBalance || (client.accounts && client.accounts[0]?.balance) || 5937.47;
  const accountsCount = client.accounts ? client.accounts.length : 1;

  const handleStopImpersonation = () => {
    stopImpersonation();
    router.push('/admin/client-page');
  };

  return (
    <div className="space-y-6">
      {/* 1. IMPERSONATION WARNING BANNER */}
      {impersonation.isActive && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8E7] border border-[#FDE68A] text-[#78350F] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs animate-in fade-in duration-300">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FEF3C7] text-[#D97706] shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#92400E]">
                You are currently impersonating <span className="underline">{client.name}</span>
              </p>
              <p className="text-xs text-[#B45309] mt-0.5">
                Any actions you take will be performed as this user
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStopImpersonation}
            className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95 shrink-0 self-start sm:self-auto"
          >
            <span>[→ Stop impersonating]</span>
          </button>
        </div>
      )}

      {/* 2. HERO GREETING BANNER - Royal Blue Theme */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] text-white p-6 sm:p-8 overflow-hidden shadow-lg border border-blue-600/30">
        {/* Subtle decorative glow */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-40 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Greeting & Details */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-white">
              <Shield className="w-3.5 h-3.5 text-emerald-300" />
              <span>Secured client workspace</span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-blue-200 font-bold block">
                CLIENT DASHBOARD
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mt-1">
                Good afternoon, {clientFirstName}.
              </h1>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-blue-200/90 font-bold block">
                ACCOUNT OVERVIEW
              </span>
              <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
                Review balances, activity, and funding in one clean view.
              </p>
            </div>

            {/* Meta Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-blue-200 font-bold">TODAY</span>
                <span className="text-white font-medium">Wednesday, September 23, 2026</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-blue-200 font-bold">FOCUS</span>
                <span className="text-white font-medium">Balances and recent activity</span>
              </div>
            </div>
          </div>

          {/* Right Sub-card (Ocean Markets Ltd Server & Cashflow) */}
          <div className="lg:col-span-4 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-5 space-y-4 shadow-inner text-white">
            <div className="space-y-1.5 pb-4 border-b border-white/20">
              <span className="text-[9px] font-mono uppercase tracking-widest text-blue-200 font-bold block">
                SERVER NAME
              </span>
              <div className="flex items-center gap-2 text-white font-serif font-bold text-sm sm:text-base">
                <Server className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Ocean Markets Ltd.</span>
              </div>
              <p className="text-[11px] text-blue-100 leading-tight">
                Connected trading infrastructure from backend settings
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-mono uppercase tracking-widest text-blue-200 font-bold block">
                CASH FLOW
              </span>
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-white">
                $0.00
              </div>
              <p className="text-[11px] text-blue-100">
                0 funding actions tracked
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CAPITAL SNAPSHOT 2x2 GRID - Crisp White Light Theme */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-600 font-bold block">
              CLIENT DASHBOARD
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Capital snapshot
            </h2>
          </div>
          <button
            type="button"
            onClick={() => showToast('info', 'Snapshot Copied', 'Portfolio summary copied to clipboard.')}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shadow-2xs"
            title="Export snapshot"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: TOTAL DEPOSITS */}
          <div className="bg-white border border-slate-200/90 hover:border-emerald-500/50 rounded-2xl p-5 space-y-4 transition-all duration-300 group shadow-xs hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold">
                CAPITAL
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                TOTAL DEPOSITS
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900">
                  ${(client.totalDeposit || 0).toFixed(2)}
                </span>
                <span className="text-xs font-bold text-emerald-600 font-mono">
                  +100%
                </span>
              </div>
            </div>

            {/* Emerald Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-[60%] rounded-full shadow-xs" />
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Growth
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
                SIGNAL 01
              </span>
            </div>
          </div>

          {/* Card 2: TOTAL EQUITY */}
          <div className="bg-white border border-slate-200/90 hover:border-blue-500/50 rounded-2xl p-5 space-y-4 transition-all duration-300 group shadow-xs hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[10px] font-mono uppercase tracking-wider text-blue-700 font-bold">
                PORTFOLIO
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                TOTAL EQUITY
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900">
                  ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Net: $0.00
                </span>
              </div>
            </div>

            {/* Royal Blue Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full w-[85%] rounded-full shadow-xs" />
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Active
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
                SIGNAL 02
              </span>
            </div>
          </div>

          {/* Card 3: TOTAL WITHDRAWALS */}
          <div className="bg-white border border-slate-200/90 hover:border-rose-500/50 rounded-2xl p-5 space-y-4 transition-all duration-300 group shadow-xs hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-[10px] font-mono uppercase tracking-wider text-rose-700 font-bold">
                OUTFLOW
              </span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                TOTAL WITHDRAWALS
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900">
                  ${(client.totalWithdrawal || 0).toFixed(2)}
                </span>
                <span className="text-xs font-bold text-rose-600 font-mono">
                  -3.1%
                </span>
              </div>
            </div>

            {/* Rose Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 h-full w-[45%] rounded-full shadow-xs" />
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Decline
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
                SIGNAL 03
              </span>
            </div>
          </div>

          {/* Card 4: MT5 ACCOUNTS */}
          <div className="bg-white border border-slate-200/90 hover:border-indigo-500/50 rounded-2xl p-5 space-y-4 transition-all duration-300 group shadow-xs hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-[10px] font-mono uppercase tracking-wider text-indigo-700 font-bold">
                ACCOUNTS
              </span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                MT5 ACCOUNTS
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {accountsCount}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Balance: ${(totalBalance / 1000).toFixed(2)}K
                </span>
              </div>
            </div>

            {/* Indigo Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full w-[75%] rounded-full shadow-xs" />
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Live Desk
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
                SIGNAL 04
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TODAY PERFORMANCE SECTION - Crisp White Card */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-600 font-bold block">
              CLIENT DASHBOARD
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Today performance
            </h2>
          </div>
          <button
            type="button"
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shadow-2xs"
            title="Layer views"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Active Trading Account Card / Row */}
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center font-mono font-bold text-blue-700 text-sm shadow-2xs">
                MT5
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-base text-slate-900">
                    #{(client.accounts && client.accounts[0]?.login) || '260730279'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-bold uppercase">
                    {(client.accounts && client.accounts[0]?.type) || 'STANDARD'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                    LIVE
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-sans mt-0.5 block">
                  Server: OceanMarkets-Live • Leverage 1:300
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-semibold">
                  ACCOUNT BALANCE
                </span>
                <span className="font-mono font-extrabold text-xl text-emerald-600">
                  ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <button
                type="button"
                onClick={() => router.push('/client/deposit')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                + Deposit
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/60 text-xs p-4">
            <div className="p-3 text-center sm:text-left">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Free Margin</span>
              <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                ${totalBalance.toLocaleString()}
              </span>
            </div>
            <div className="p-3 text-center sm:text-left">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Margin Level</span>
              <span className="font-mono font-bold text-emerald-600 text-sm mt-0.5 block">
                100.00%
              </span>
            </div>
            <div className="p-3 text-center sm:text-left">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Floating P&amp;L</span>
              <span className="font-mono font-bold text-slate-400 text-sm mt-0.5 block">
                $0.00
              </span>
            </div>
            <div className="p-3 text-center sm:text-left">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Currency</span>
              <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">
                USD ($)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
