'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
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
  AlertCircle,
  Medal,
  Users,
  Flame,
  Check,
  Copy,
  Zap,
  BarChart3
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { ClientPageHeader } from '@/components/layout/ClientPageHeader';
import { clsx } from 'clsx';

interface ContestTrade {
  ticket: string;
  accountLogin: number;
  clientName: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  lots: number;
  openPrice: number;
  currentPrice: number;
  closePrice?: number;
  profit: number;
  profitPercent: number;
  openTime: string;
  closeTime?: string;
  status: 'open' | 'closed';
}

interface ContestLeaderboardRank {
  rank: number;
  accountLogin: number;
  clientName: string;
  country: string;
  totalTrades: number;
  winRate: number;
  netProfit: number;
  growthPercent: number;
  equity: number;
  balance: number;
  status: 'active' | 'qualified';
}

function ClientTradingContestContent() {
  const searchParams = useSearchParams();
  const targetClientId = searchParams?.get('clientId');
  const { clients, impersonation, clientUser, showToast } = useCRM();

  const clientFromParam = targetClientId ? clients.find(c => c.id === targetClientId) : null;
  const rawClient = clientFromParam || impersonation.client || clientUser || clients[0];
  const client = (rawClient?.id ? clients.find(c => c.id === rawClient.id || c.email === rawClient.email) : null) || rawClient;

  const [activeTab, setActiveTab] = useState<'open' | 'closed' | 'leaderboard'>('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [copiedTicket, setCopiedTicket] = useState<string | null>(null);

  // Live contest data from Supabase-backed API
  const [contestData, setContestData] = useState<{
    contest: any;
    leaderboard: ContestLeaderboardRank[];
    trades: { open: ContestTrade[]; closed: ContestTrade[] };
    summary: any;
  } | null>(null);

  const fetchContestData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const resolvedClientId = targetClientId || client?.id;
      const url = resolvedClientId ? `/api/trading-contest?clientId=${resolvedClientId}` : '/api/trading-contest';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setContestData(data);
        if (!isSilent) {
          showToast('success', 'Contest Synced', 'Live leaderboard and position marks updated.');
        }
      }
    } catch (err: any) {
      console.warn('Contest fetch note:', err.message);
    } finally {
      if (!isSilent) setIsRefreshing(false);
    }
  }, [client?.id, showToast]);

  useEffect(() => {
    fetchContestData(true);
    // Relaxed polling interval (60s) and only when active in browser to avoid sluggishness
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchContestData(true);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchContestData]);

  // Live clock
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

  const handleCopyTicket = (ticket: string) => {
    navigator.clipboard.writeText(ticket);
    setCopiedTicket(ticket);
    showToast('info', 'Copied', `Ticket ${ticket} copied to clipboard.`);
    setTimeout(() => setCopiedTicket(null), 1800);
  };

  // Compute active trade lists and metrics
  const openTrades = contestData?.trades?.open || [];
  const closedTrades = contestData?.trades?.closed || [];
  const leaderboard = contestData?.leaderboard || [];

  const currentTradeList = activeTab === 'open' ? openTrades : activeTab === 'closed' ? closedTrades : [];

  const filteredTrades = currentTradeList.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.ticket.toLowerCase().includes(q) ||
      t.symbol.toLowerCase().includes(q) ||
      t.accountLogin.toString().includes(q) ||
      t.type.toLowerCase().includes(q)
    );
  });

  const filteredLeaderboard = leaderboard.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.clientName.toLowerCase().includes(q) ||
      r.accountLogin.toString().includes(q) ||
      r.country.toLowerCase().includes(q)
    );
  });

  const totalTradesCount = openTrades.length + closedTrades.length;
  const profitableTrades = [...openTrades, ...closedTrades].filter(t => t.profit > 0);
  const lossTrades = [...openTrades, ...closedTrades].filter(t => t.profit < 0);
  const totalNetPnl = [...openTrades, ...closedTrades].reduce((acc, t) => acc + t.profit, 0);
  const winRate = totalTradesCount > 0 ? Math.round((profitableTrades.length / totalTradesCount) * 100) : 0;
  const bestResult = Math.max(0, ...[...openTrades, ...closedTrades].map(t => t.profit));

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl mx-auto pb-12">
      {/* 1. ROYAL BLUE CONTEST HERO BANNER (ClientPageHeader Standard) */}
      <ClientPageHeader
        badge="Contest Command Center"
        badgeIcon={<Trophy className="h-6 w-6 sm:h-7 sm:w-7 text-amber-200" />}
        title="Global Championship Arena"
        subtitle="Compete in real-time with verified mark-to-market calculations, MT5 live positions, and institutional leaderboard rankings."
        chips={[
          { label: 'Prize Pool', value: '$50,000 USD', icon: <Award className="w-3.5 h-3.5 text-amber-300" /> },
          { label: 'Active Contestants', value: `${leaderboard.length} Traders`, icon: <Users className="w-3.5 h-3.5 text-sky-300" /> },
          { label: 'Current Best P&L', value: `+$${bestResult.toFixed(2)}`, icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-300" /> },
        ]}
      />

      {/* 2. CONTEST OVERVIEW SECTION (5 Primary Metric Cards) */}
      <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 font-mono">
              <Activity className="h-3 w-3 text-blue-600" />
              <span>Real-Time Telemetry</span>
            </div>
            <h2 className="mt-1.5 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
              Contest Performance Overview
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Aggregated trading activity, win-rate, and exposure calculated dynamically from your verified accounts.
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-600 shadow-2xs">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Total Trades</p>
                <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{totalTradesCount}</p>
              </div>
            </div>
          </div>

          {/* Open Positions */}
          <div className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:bg-white hover:shadow-xs">
            <div className="flex flex-col gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-2xs">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Open Positions</p>
                <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-blue-700 font-mono">{openTrades.length}</p>
              </div>
            </div>
          </div>

          {/* Profitable Trades */}
          <div className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:bg-white hover:shadow-xs">
            <div className="flex flex-col gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-lime-200 bg-lime-50 text-lime-600 shadow-2xs">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Profitable</p>
                <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">{profitableTrades.length}</p>
              </div>
            </div>
          </div>

          {/* Loss Trades */}
          <div className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:bg-white hover:shadow-xs">
            <div className="flex flex-col gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 shadow-2xs">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Loss Trades</p>
                <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-rose-600 font-mono">{lossTrades.length}</p>
              </div>
            </div>
          </div>

          {/* Total P&L */}
          <div className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:bg-white hover:shadow-xs col-span-2 sm:col-span-1">
            <div className="flex flex-col gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600 shadow-2xs">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Total P&amp;L</p>
                <p className={clsx(
                  "mt-1 text-2xl sm:text-3xl font-extrabold font-mono",
                  totalNetPnl >= 0 ? "text-emerald-600" : "text-rose-600"
                )}>
                  {totalNetPnl >= 0 ? `+$${totalNetPnl.toFixed(2)}` : `-$${Math.abs(totalNetPnl).toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INSIGHT LANE SECTION (3 Real-time Cards) */}
      <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 font-mono">
              <Waves className="h-3 w-3 text-blue-600" />
              <span>Contest Insights</span>
            </div>
            <h2 className="mt-1.5 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">Insight Lane</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Pacing ratios and risk distribution across active championship markets.
            </p>
          </div>
          <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs">
            <Waves className="h-5 w-5" />
          </div>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 font-mono">Winning Pace</p>
            <p className="text-2xl font-extrabold text-slate-900 font-mono">{winRate}%</p>
            <p className="text-xs text-slate-500 mt-1">{profitableTrades.length} profitable positions in current cycle</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 font-mono">Open Exposure</p>
            <p className="text-2xl font-extrabold text-blue-700 font-mono">{openTrades.length} Trades</p>
            <p className="text-xs text-slate-500 mt-1">Positions actively floating in the live MT5 market</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 font-mono">Best Single Gain</p>
            <p className="text-2xl font-extrabold text-emerald-600 font-mono">+${bestResult.toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-1">Highest recorded profit on a single position</p>
          </div>
        </div>
      </section>

      {/* 4. DUAL SECTION: Trade Controls & Session Rhythm */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
        {/* Left: Trade Controls */}
        <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-600 font-mono">Contest Navigation</p>
              <h2 className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">Trade &amp; Board Controls</h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Filter between Open Book, Closed Settlements, and Global Championship Leaderboard.
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
                placeholder={activeTab === 'leaderboard' ? "Search trader name or account..." : "Search ticket, symbol, or account..."}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pr-4 pl-10 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
            </div>
            <button
              type="button"
              onClick={() => fetchContestData(false)}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-xs active:scale-95 cursor-pointer whitespace-nowrap disabled:opacity-60"
            >
              <RefreshCw className={clsx("h-4 w-4 transition-transform", isRefreshing && "animate-spin")} />
              <span>Refresh Feed</span>
            </button>
          </div>

          {/* 3 Interactive Tab Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('open')}
              className={clsx(
                "rounded-xl border p-3 text-left transition-all cursor-pointer",
                activeTab === 'open'
                  ? "border-emerald-400 bg-emerald-50/80 text-emerald-950 shadow-2xs ring-1 ring-emerald-400"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Open Positions</p>
              <p className="mt-1 text-sm sm:text-base font-extrabold font-mono">Open ({openTrades.length})</p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('closed')}
              className={clsx(
                "rounded-xl border p-3 text-left transition-all cursor-pointer",
                activeTab === 'closed'
                  ? "border-blue-400 bg-blue-50/80 text-blue-950 shadow-2xs ring-1 ring-blue-400"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Closed History</p>
              <p className="mt-1 text-sm sm:text-base font-extrabold font-mono">Closed ({closedTrades.length})</p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('leaderboard')}
              className={clsx(
                "rounded-xl border p-3 text-left transition-all cursor-pointer",
                activeTab === 'leaderboard'
                  ? "border-amber-400 bg-amber-50/80 text-amber-950 shadow-2xs ring-1 ring-amber-400"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-500" /> Leaderboard
              </p>
              <p className="mt-1 text-sm sm:text-base font-extrabold font-mono">Ranks ({leaderboard.length})</p>
            </button>
          </div>
        </section>

        {/* Right: Session Rhythm & Live Clock */}
        <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-600 font-mono">Championship Clock</p>
              <h2 className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">Session Rhythm</h2>
              <p className="mt-1 text-xs text-slate-500">
                Server execution synchronization.
              </p>
            </div>
            <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs">
              <Clock3 className="h-5 w-5" />
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Broker Server Time</p>
                <p className="mt-0.5 text-base font-extrabold text-slate-900 font-mono">{currentTime || '12:00:00 PM'}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Feed
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">Current Season</p>
              <p className="mt-1 text-sm font-extrabold text-slate-900">Season 2026 Q3 — Forex Global</p>
              <p className="mt-0.5 text-[11px] text-slate-500">Ends in 36 days • Automated payout to trading wallet.</p>
            </div>
          </div>
        </section>
      </div>

      {/* 5. CONTEST LEDGER / LEADERBOARD SECTION */}
      <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 font-mono">
              <Table2 className="h-3 w-3 text-blue-600" />
              <span>{activeTab === 'leaderboard' ? 'Live Championship Leaderboard' : 'Real-Time Position Ledger'}</span>
            </div>
            <h2 className="mt-1.5 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
              {activeTab === 'leaderboard' ? 'Leaderboard Standings' : `${activeTab.toUpperCase()} Contest Positions`}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              {activeTab === 'leaderboard'
                ? 'Rankings evaluated by account growth, net settled equity, and disciplined risk-to-reward ratio.'
                : 'Live MT5 bridge executions matching your championship account.'}
            </p>
          </div>
          <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs">
            <Table2 className="h-5 w-5" />
          </div>
        </div>

        {/* Dynamic Display: Trades Table OR Leaderboard Table */}
        {activeTab === 'leaderboard' ? (
          /* LEADERBOARD VIEW */
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pl-4 text-center">Rank</th>
                  <th className="p-3.5">Trader / Client</th>
                  <th className="p-3.5">Trading Account</th>
                  <th className="p-3.5 text-right">Contest Trades</th>
                  <th className="p-3.5 text-right">Win Rate</th>
                  <th className="p-3.5 text-right">Net Profit</th>
                  <th className="p-3.5 text-right">Account Equity</th>
                  <th className="p-3.5 pr-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredLeaderboard.map((r) => (
                  <tr key={r.accountLogin} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 pl-4 text-center">
                      {r.rank === 1 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs font-mono shadow-xs">
                          🥇 1
                        </span>
                      ) : r.rank === 2 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-extrabold text-xs font-mono shadow-xs">
                          🥈 2
                        </span>
                      ) : r.rank === 3 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-extrabold text-xs font-mono shadow-xs">
                          🥉 3
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-slate-600">#{r.rank}</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <div>
                        <p className="font-bold text-slate-900 font-heading">{r.clientName}</p>
                        <p className="text-[10px] font-mono text-slate-400">{r.country}</p>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-blue-700">
                      #{r.accountLogin}
                    </td>
                    <td className="p-3.5 text-right font-mono font-semibold text-slate-800">
                      {r.totalTrades}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-600">
                      {r.winRate}%
                    </td>
                    <td className="p-3.5 text-right font-mono font-extrabold text-emerald-600 text-sm">
                      +${r.netProfit.toFixed(2)}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                      ${r.equity.toFixed(2)}
                    </td>
                    <td className="p-3.5 pr-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Qualified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredTrades.length === 0 ? (
          /* EMPTY STATE */
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60 p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Table2 className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 font-heading">
              No {activeTab} trades found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Contest trades matching your search will appear here. Switch between Open Book and Closed History above.
            </p>
          </div>
        ) : (
          /* TRADES TABLE VIEW */
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pl-4">Ticket</th>
                  <th className="p-3.5">Account #</th>
                  <th className="p-3.5">Symbol</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5 text-right">Volume</th>
                  <th className="p-3.5 text-right">Open Price</th>
                  <th className="p-3.5 text-right">Market Price</th>
                  <th className="p-3.5 text-right">Profit ($ USD)</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5 pr-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredTrades.map((t) => (
                  <tr key={t.ticket} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 pl-4 font-mono font-bold text-blue-700">
                      <div className="flex items-center gap-1.5">
                        <span>{t.ticket}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyTicket(t.ticket)}
                          className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Copy Ticket"
                        >
                          {copiedTicket === t.ticket ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono font-semibold text-slate-800">
                      #{t.accountLogin}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      {t.symbol}
                    </td>
                    <td className="p-3.5">
                      <span className={clsx(
                        "px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase",
                        t.type === 'BUY' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                      )}>
                        {t.type}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-semibold text-slate-800">
                      {t.lots.toFixed(2)} lots
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-700">
                      {t.openPrice.toFixed(t.symbol.includes('JPY') ? 2 : 4)}
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-700">
                      {t.currentPrice.toFixed(t.symbol.includes('JPY') ? 2 : 4)}
                    </td>
                    <td className={clsx(
                      "p-3.5 text-right font-mono font-extrabold text-sm",
                      t.profit >= 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {t.profit >= 0 ? `+$${t.profit.toFixed(2)}` : `-$${Math.abs(t.profit).toFixed(2)}`}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500">
                      {t.openTime}
                    </td>
                    <td className="p-3.5 pr-4 text-center">
                      <span className={clsx(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 font-mono",
                        t.status === 'open' ? "bg-blue-50 border border-blue-200 text-blue-700" : "bg-slate-100 border border-slate-200 text-slate-700"
                      )}>
                        <span className={clsx("w-1.5 h-1.5 rounded-full", t.status === 'open' ? "bg-blue-500 animate-pulse" : "bg-slate-400")} />
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default function ClientTradingContestPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    }>
      <ClientTradingContestContent />
    </React.Suspense>
  );
}
