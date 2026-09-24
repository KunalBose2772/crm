'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  ArrowUpRight, 
  Activity, 
  TrendingUp, 
  DollarSign, 
  Award, 
  Waves, 
  SearchCheck, 
  Search, 
  RefreshCw, 
  Clock3, 
  Table2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { clsx } from 'clsx';

export default function ClientTradingContestPage() {
  const { showToast } = useCRM();
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('info', 'Feed Refreshed', 'Live contest positions and leaderboard synced.');
    }, 600);
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl mx-auto pb-12">
      {/* 1. ROYAL BLUE CONTEST HERO BANNER (Command Center) */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-blue-400/30 bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] p-5 sm:p-7 md:p-8 shadow-md text-white">
        {/* Glow circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] xl:items-start">
          {/* Hero Left Content */}
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase text-amber-200 backdrop-blur-xs font-heading">
              <Trophy className="h-4 w-4 text-amber-300" />
              <span>Contest Command Center</span>
            </div>

            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.25em] text-blue-200 font-mono">
              Client Trading Arena
            </p>

            <h1 className="mt-1.5 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white font-heading">
              Trading Contest.
              <span className="mt-1 block text-xs sm:text-sm font-semibold uppercase tracking-widest text-blue-100 font-sans">
                Live positions and leaderboard pace
              </span>
            </h1>

            <p className="mt-2.5 max-w-xl text-xs sm:text-sm text-blue-100/90 leading-relaxed font-sans">
              Monitor open and closed contest trades in the unified workspace environment with real-time mark-to-market calculations.
            </p>

            {/* Quick Status Chips */}
            <div className="mt-5 flex flex-wrap gap-2.5">
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200 font-mono">Active View</p>
                <p className="mt-0.5 text-xs sm:text-sm font-bold text-white capitalize">{activeTab} trades</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200 font-mono">Search Focus</p>
                <p className="mt-0.5 text-xs sm:text-sm font-bold text-white">Account, symbol, and type</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200 font-mono">Contest Mode</p>
                <p className="mt-0.5 text-xs sm:text-sm font-bold text-white">Live command overview</p>
              </div>
            </div>
          </div>

          {/* Hero Right: 3 Metric Cards */}
          <div className="grid gap-2.5 self-start sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200 font-mono">Contest Entries</p>
              <p className="mt-1 text-2xl font-extrabold text-white font-mono">0</p>
              <p className="mt-1 text-xs text-blue-100/90">0 open positions and 0 closed results currently tracked.</p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200 font-mono">Best Visible Result</p>
              <p className="mt-1 text-2xl font-extrabold text-white font-mono">0.00</p>
              <p className="mt-1 text-xs text-blue-100/90">Highest profit inside the current filtered contest feed.</p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xs sm:col-span-2 xl:col-span-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200 font-mono">Net Visible P&amp;L</p>
                  <p className="mt-1 text-2xl font-extrabold text-emerald-300 font-mono">+$0.00</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-amber-300">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-1 text-xs text-blue-100/90">Combined result for the trades currently shown in this contest workspace.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CONTEST OVERVIEW SECTION (5 Primary Metric Cards) */}
      <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-600 font-mono">Client Dashboard</p>
            <h2 className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">Contest Overview</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Performance totals remain visible, grouped inside the admin dashboard card treatment.
            </p>
          </div>
          <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        {/* 5 Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {/* Total Trades */}
          <div className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:bg-white hover:shadow-xs">
            <div className="flex flex-col gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-600 shadow-2xs">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Total Trades</p>
                <p className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">0</p>
              </div>
            </div>
          </div>

          {/* Open Positions */}
          <div className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:bg-white hover:shadow-xs">
            <div className="flex flex-col gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-2xs">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Open Positions</p>
                <p className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">0</p>
              </div>
            </div>
          </div>

          {/* Profitable */}
          <div className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:bg-white hover:shadow-xs">
            <div className="flex flex-col gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-lime-200 bg-lime-50 text-lime-600 shadow-2xs">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Profitable</p>
                <p className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">0</p>
              </div>
            </div>
          </div>

          {/* Loss Trades */}
          <div className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:bg-white hover:shadow-xs">
            <div className="flex flex-col gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 shadow-2xs">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Loss Trades</p>
                <p className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-rose-600 font-mono">0</p>
              </div>
            </div>
          </div>

          {/* Total P&L */}
          <div className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:bg-white hover:shadow-xs col-span-2 sm:col-span-1">
            <div className="flex flex-col gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600 shadow-2xs">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Total P&amp;L</p>
                <p className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">+$0.00</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INSIGHT LANE SECTION (3 Cards) */}
      <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-600 font-mono">Client Dashboard</p>
            <h2 className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">Insight Lane</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              A broader dashboard summary layer for pacing, exposure, and combined result inside the current contest slice.
            </p>
          </div>
          <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs">
            <Waves className="h-5 w-5" />
          </div>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 font-mono">Winning Pace</p>
            <p className="text-2xl font-extrabold text-slate-900 font-mono">0%</p>
            <p className="text-xs text-slate-500 mt-1">0 profitable trades in the current view</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 font-mono">Open Pressure</p>
            <p className="text-2xl font-extrabold text-slate-900 font-mono">0%</p>
            <p className="text-xs text-slate-500 mt-1">0 positions are still active across the filtered contest feed</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 font-mono">Net Result</p>
            <p className="text-2xl font-extrabold text-emerald-600 font-mono">+$0.00</p>
            <p className="text-xs text-slate-500 mt-1">Visible positions are holding a positive combined result</p>
          </div>
        </div>
      </section>

      {/* 4. DUAL SECTION: Trade Controls & Session Rhythm */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
        {/* Left: Trade Controls */}
        <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-600 font-mono">Client Dashboard</p>
              <h2 className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">Trade Controls</h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Search, refresh, and status filters are consolidated into one operational surface.
              </p>
            </div>
            <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs">
              <SearchCheck className="h-5 w-5" />
            </div>
          </div>

          {/* Search & Refresh Bar */}
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                placeholder="Search by account, symbol, or type"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pr-4 pl-10 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className={clsx("h-4 w-4 transition-transform", isRefreshing && "animate-spin")} />
              <span>Refresh Feed</span>
            </button>
          </div>

          {/* Book Toggles & Clock */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
            <div className="grid grid-cols-2 gap-2.5 flex-1 max-w-sm">
              <button
                type="button"
                onClick={() => setActiveTab('open')}
                className={clsx(
                  "rounded-xl border p-3 text-left transition-all cursor-pointer",
                  activeTab === 'open'
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900 shadow-2xs"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                )}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Open Book</p>
                <p className="mt-1 text-sm sm:text-base font-extrabold font-mono">Open (0)</p>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('closed')}
                className={clsx(
                  "rounded-xl border p-3 text-left transition-all cursor-pointer",
                  activeTab === 'closed'
                    ? "border-blue-300 bg-blue-50 text-blue-900 shadow-2xs"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                )}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Closed Book</p>
                <p className="mt-1 text-sm sm:text-base font-extrabold font-mono">Closed (0)</p>
              </button>
            </div>

            {/* Current Time Clock */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-center sm:text-right shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Current Time</p>
              <p className="mt-0.5 text-sm sm:text-base font-extrabold text-slate-900 font-mono">{currentTime || '12:00:00 PM'}</p>
            </div>
          </div>
        </section>

        {/* Right: Session Rhythm */}
        <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-600 font-mono">Client Dashboard</p>
              <h2 className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">Session Rhythm</h2>
              <p className="mt-1 text-xs text-slate-500">
                A compact contest status panel mirroring cadence.
              </p>
            </div>
            <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs">
              <Clock3 className="h-5 w-5" />
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">Winning Trades</p>
              <p className="mt-1 text-xl font-extrabold text-slate-900 font-mono">0</p>
              <p className="mt-0.5 text-[11px] text-slate-500">Profitable entries inside the current view.</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">Pressure Side</p>
              <p className="mt-1 text-xl font-extrabold text-slate-900 font-mono">0</p>
              <p className="mt-0.5 text-[11px] text-slate-500">Trades currently sitting in loss across this list.</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">Closed Coverage</p>
              <p className="mt-1 text-xl font-extrabold text-slate-900 font-mono">0</p>
              <p className="mt-0.5 text-[11px] text-slate-500">Historical contest results available in the closed ledger.</p>
            </div>
          </div>
        </section>
      </div>

      {/* 5. CONTEST LEDGER TABLE SECTION */}
      <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-600 font-mono">Client Dashboard</p>
            <h2 className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">Contest Ledger</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              The trade list remains the primary detailed record, framed as a full dashboard ledger.
            </p>
          </div>
          <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs">
            <Table2 className="h-5 w-5" />
          </div>
        </div>

        {/* Empty state container */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <Table2 className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 font-heading">
            No {activeTab} trades found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            When you execute trades in the contest environment, they will be logged and audited here in real-time.
          </p>
        </div>
      </section>
    </div>
  );
}
