'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCRM } from '@/context/CRMContext';
import {
  AlertTriangle,
  ArrowRight,
  Shield,
  Server,
  Layers,
  TrendingUp,
  TrendingDown,
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
  const { impersonation, stopImpersonation } = useCRM();

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
      {/* 1. IMPERSONATION WARNING BANNER (Image 3) */}
      {impersonation.isActive && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8E7] border border-[#FDE68A] text-[#78350F] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
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

      {/* 2. HERO GREETING BANNER (Image 3) */}
      <div className="relative rounded-3xl bg-[#0D1322] border border-[#1C263C] p-6 sm:p-8 overflow-hidden shadow-xl">
        {/* Subtle radial glow */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-40 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Greeting & Details */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141E33] border border-[#233355] text-[11px] font-semibold text-slate-300">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Secured client workspace</span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 font-bold block">
                CLIENT DASHBOARD
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mt-1">
                Good afternoon, {clientFirstName}.
              </h1>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                ACCOUNT OVERVIEW
              </span>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Review balances, activity, and funding in one clean view.
              </p>
            </div>

            {/* Meta Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-[#141D30] border border-[#202E4D] text-xs flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">TODAY</span>
                <span className="text-slate-200 font-medium">Wednesday, September 23, 2026</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-[#141D30] border border-[#202E4D] text-xs flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">FOCUS</span>
                <span className="text-slate-200 font-medium">Balances and recent activity</span>
              </div>
            </div>
          </div>

          {/* Right Sub-card (Ocean Markets Ltd Server & Cashflow) */}
          <div className="lg:col-span-4 bg-[#12192A]/90 border border-[#22314E] rounded-2xl p-5 space-y-4 shadow-inner">
            <div className="space-y-1.5 pb-4 border-b border-[#1E2B45]">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                SERVER NAME
              </span>
              <div className="flex items-center gap-2 text-slate-100 font-serif font-bold text-sm sm:text-base">
                <Server className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Ocean Markets Ltd.</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Connected trading infrastructure from backend settings
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                CASH FLOW
              </span>
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-white">
                $0.00
              </div>
              <p className="text-[11px] text-slate-400">
                0 funding actions tracked
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CAPITAL SNAPSHOT 2x2 GRID (Image 3) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
              CLIENT DASHBOARD
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
              Capital snapshot
            </h2>
          </div>
          <button
            type="button"
            className="p-2 rounded-xl bg-[#121826] border border-[#212C42] hover:bg-[#1A2438] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Export snapshot"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: TOTAL DEPOSITS */}
          <div className="bg-[#0E1422] border border-[#1C263C] hover:border-emerald-500/40 rounded-2xl p-5 space-y-4 transition-all duration-300 group shadow-lg">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-[#141F2E] border border-[#23334A] text-[10px] font-mono uppercase tracking-wider text-slate-300 font-bold">
                CAPITAL
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#141F2E] border border-[#23334A] flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                TOTAL DEPOSITS
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-white">
                  ${(client.totalDeposit || 0).toFixed(2)}
                </span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  +100%
                </span>
              </div>
            </div>

            {/* Emerald Progress Bar */}
            <div className="w-full bg-[#141C2C] h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-[60%] rounded-full shadow-xs" />
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Growth
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                SIGNAL 01
              </span>
            </div>
          </div>

          {/* Card 2: TOTAL EQUITY */}
          <div className="bg-[#0E1422] border border-[#1C263C] hover:border-sky-500/40 rounded-2xl p-5 space-y-4 transition-all duration-300 group shadow-lg">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-[#141F2E] border border-[#23334A] text-[10px] font-mono uppercase tracking-wider text-slate-300 font-bold">
                PORTFOLIO
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#141F2E] border border-[#23334A] flex items-center justify-center text-slate-400 group-hover:text-sky-400 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                TOTAL EQUITY
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-white">
                  ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Net: $0.00
                </span>
              </div>
            </div>

            {/* Sky Blue Progress Bar */}
            <div className="w-full bg-[#141C2C] h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-sky-500 to-blue-400 h-full w-[85%] rounded-full shadow-xs" />
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-950/40 border border-sky-800/40 text-sky-400 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                Growth
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                SIGNAL 02
              </span>
            </div>
          </div>

          {/* Card 3: TOTAL WITHDRAWALS */}
          <div className="bg-[#0E1422] border border-[#1C263C] hover:border-rose-500/40 rounded-2xl p-5 space-y-4 transition-all duration-300 group shadow-lg">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-[#141F2E] border border-[#23334A] text-[10px] font-mono uppercase tracking-wider text-slate-300 font-bold">
                OUTFLOW
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#141F2E] border border-[#23334A] flex items-center justify-center text-slate-400 group-hover:text-rose-400 transition-colors">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                TOTAL WITHDRAWALS
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-white">
                  ${(client.totalWithdrawal || 0).toFixed(2)}
                </span>
                <span className="text-xs font-bold text-rose-400 font-mono">
                  -3.1%
                </span>
              </div>
            </div>

            {/* Rose Progress Bar */}
            <div className="w-full bg-[#141C2C] h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 h-full w-[45%] rounded-full shadow-xs" />
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950/40 border border-rose-800/40 text-rose-400 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Decline
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                SIGNAL 03
              </span>
            </div>
          </div>

          {/* Card 4: MT5 ACCOUNTS */}
          <div className="bg-[#0E1422] border border-[#1C263C] hover:border-purple-500/40 rounded-2xl p-5 space-y-4 transition-all duration-300 group shadow-lg">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-[#141F2E] border border-[#23334A] text-[10px] font-mono uppercase tracking-wider text-slate-300 font-bold">
                ACCOUNTS
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#141F2E] border border-[#23334A] flex items-center justify-center text-slate-400 group-hover:text-purple-400 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                MT5 ACCOUNTS
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-white">
                  {accountsCount}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Balance: ${(totalBalance / 1000).toFixed(2)}K
                </span>
              </div>
            </div>

            {/* Purple Progress Bar */}
            <div className="w-full bg-[#141C2C] h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full w-[75%] rounded-full shadow-xs" />
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-950/40 border border-purple-800/40 text-purple-400 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                Growth
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                SIGNAL 04
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TODAY PERFORMANCE SECTION (Image 3) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
              CLIENT DASHBOARD
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
              Today performance
            </h2>
          </div>
          <button
            type="button"
            className="p-2 rounded-xl bg-[#121826] border border-[#212C42] hover:bg-[#1A2438] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Layer views"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Active Trading Account Card / Row */}
        <div className="bg-[#0E1422] border border-[#1C263C] rounded-2xl overflow-hidden shadow-lg">
          <div className="p-5 border-b border-[#1A2336] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-900/30 border border-purple-600/40 flex items-center justify-center font-mono font-bold text-purple-300">
                MT5
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-base text-white">
                    #{(client.accounts && client.accounts[0]?.login) || '260730279'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#1B273E] text-slate-300 text-[10px] font-mono font-bold uppercase">
                    {(client.accounts && client.accounts[0]?.type) || 'STANDARD'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-[10px] font-bold">
                    LIVE
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-sans">
                  Server: OceanMarkets-Live • Leverage 1:300
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                  ACCOUNT BALANCE
                </span>
                <span className="font-mono font-extrabold text-xl text-emerald-400">
                  ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <button
                type="button"
                onClick={() => router.push('/client/deposit')}
                className="px-3.5 py-2 rounded-xl bg-[#09261C] hover:bg-[#0D3528] border border-emerald-500/40 text-emerald-400 text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                + Deposit
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#1A2336] bg-[#0A0F1A]/60 text-xs p-4">
            <div className="p-3 text-center sm:text-left">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Free Margin</span>
              <span className="font-mono font-bold text-slate-200 text-sm mt-0.5 block">
                ${totalBalance.toLocaleString()}
              </span>
            </div>
            <div className="p-3 text-center sm:text-left">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Margin Level</span>
              <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">
                100.00%
              </span>
            </div>
            <div className="p-3 text-center sm:text-left">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Floating P&amp;L</span>
              <span className="font-mono font-bold text-slate-400 text-sm mt-0.5 block">
                $0.00
              </span>
            </div>
            <div className="p-3 text-center sm:text-left">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Currency</span>
              <span className="font-mono font-bold text-slate-200 text-sm mt-0.5 block">
                USD ($)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
