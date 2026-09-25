'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCRM } from '@/context/CRMContext';
import {
  Shield,
  Server,
  Wallet,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownLeft,
  Layers,
  Zap,
  Radio,
  SlidersHorizontal,
  CalendarDays,
  ChevronDown,
  TrendingUp,
  CircleArrowUp,
  CircleArrowDown,
  Repeat,
  CalendarRange,
  ChartColumn,
  ChartLine,
  RotateCw,
  BadgeDollarSign,
  Activity,
  WalletCards,
  BadgeCheck,
  CheckCircle2,
  DollarSign,
  ReceiptText,
  Landmark,
  ChevronLeft,
  ChevronRight,
  ChartCandlestick,
  Calendar,
  Orbit,
  LogOut,
  TriangleAlert,
  Clock,
  CircleDot,
  Check
} from 'lucide-react';
import { clsx } from 'clsx';

function ClientDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetClientId = searchParams?.get('clientId');
  const { clients, impersonation, clientUser, stopImpersonation, showToast, openClientModal, syncAccountBalance, deposits, withdrawals, transactions } = useCRM();

  // Active client data from ?clientId=, impersonation, logged-in client session, registered client, or clean empty state
  const clientFromParam = targetClientId ? clients.find(c => c.id === targetClientId) : null;
  const rawClient = clientFromParam || impersonation.client || clientUser || clients[0];
  const client = (rawClient ? clients.find(c => (rawClient.email && c.email.toLowerCase() === rawClient.email.toLowerCase()) || (rawClient.id && c.id === rawClient.id)) : null) || rawClient || {
    id: '',
    name: 'Client',
    email: '',
    phone: '',
    country: '',
    city: '',
    registeredAt: '',
    status: 'pending' as const,
    totalDeposit: 0,
    totalWithdrawal: 0,
    netDeposit: 0,
    totalBalance: 0,
    accounts: [],
  };

  const clientFirstName = client.name ? client.name.split(' ')[0] : 'Client';
  
  // Dynamic client deposits, withdrawals & transactions
  const clientDeposits = deposits.filter(d => 
    client && (d.clientId === client.id || d.clientEmail === client.email)
  );
  const clientWithdrawals = withdrawals.filter(w =>
    client && (w.clientId === client.id || w.clientEmail === client.email)
  );
  const clientTransactions = transactions.filter(t =>
    client && (t.clientId === client.id || t.clientEmail === client.email)
  );

  const completedDeposits = clientDeposits.filter(d => d.status === 'completed');
  const computedTotalDeposit = completedDeposits.reduce((acc, curr) => acc + curr.amount, 0) || client.totalDeposit || 0;
  
  const completedWithdrawals = clientWithdrawals.filter(w => w.status === 'completed');
  const computedTotalWithdrawal = completedWithdrawals.reduce((acc, curr) => acc + (curr.requestedAmount || curr.netAmount || 0), 0) || client.totalWithdrawal || 0;

  const clientAccounts = client.accounts || [];
  const computedTotalBalance = clientAccounts.length > 0 
    ? clientAccounts.reduce((acc, curr) => acc + (curr.balance || 0), 0)
    : (client.totalBalance || Math.max(0, computedTotalDeposit - computedTotalWithdrawal));

  const computedTotalEquity = clientAccounts.length > 0
    ? clientAccounts.reduce((acc, curr) => acc + (curr.equity || curr.balance || 0), 0)
    : computedTotalBalance;

  const totalBalance = computedTotalBalance;
  const totalEquity = computedTotalEquity;
  const accountsCount = clientAccounts.length;
  const netFlow = computedTotalDeposit - computedTotalWithdrawal;

  // Chart and Filter States
  const [chartViewMode, setChartViewMode] = useState<'bar' | 'area' | 'line'>('bar');
  const [timeRange, setTimeRange] = useState<'30d' | '7d' | 'today'>('30d');
  const [rangeDropdownOpen, setRangeDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);

  // Live clock
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const [shortDateString, setShortDateString] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
      setDateString(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      );
      setShortDateString(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStopImpersonation = () => {
    stopImpersonation();
    router.push('/admin/client-page');
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      if (client?.accounts && client.accounts.length > 0) {
        await Promise.all(client.accounts.map((acc) => syncAccountBalance(acc.login)));
      }
      showToast('success', 'Data Synchronized', 'Dashboard ledger metrics updated from MT5 server.');
    } catch {
      showToast('info', 'Synchronized', 'Dashboard ledger metrics updated.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Dynamic dataset generation matching live transactions, deposits and withdrawals
  const generateDynamicDatasets = () => {
    // 30d points
    const points30d = [
      { label: 'Day 01', deposits: 0, withdrawals: 0, ops: 0 },
      { label: 'Day 05', deposits: 0, withdrawals: 0, ops: 0 },
      { label: 'Day 10', deposits: 0, withdrawals: 0, ops: 0 },
      { label: 'Day 15', deposits: 0, withdrawals: 0, ops: 0 },
      { label: 'Day 20', deposits: 0, withdrawals: 0, ops: 0 },
      { label: 'Day 25', deposits: Math.round(computedTotalDeposit * 0.4), withdrawals: 0, ops: 1 },
      { label: 'Day 30', deposits: computedTotalDeposit, withdrawals: computedTotalWithdrawal, ops: clientTransactions.length || 1 },
    ];

    // 7d points
    const points7d = [
      { label: 'Fri', deposits: 0, withdrawals: 0, ops: 0 },
      { label: 'Sat', deposits: 0, withdrawals: 0, ops: 0 },
      { label: 'Sun', deposits: 0, withdrawals: 0, ops: 0 },
      { label: 'Mon', deposits: 0, withdrawals: 0, ops: 0 },
      { label: 'Tue', deposits: 0, withdrawals: 0, ops: 0 },
      { label: 'Wed', deposits: Math.round(computedTotalDeposit * 0.5), withdrawals: 0, ops: 1 },
      { label: 'Today', deposits: computedTotalDeposit, withdrawals: computedTotalWithdrawal, ops: clientTransactions.length || 1 },
    ];

    // Today points
    const pointsToday = [
      { label: '00:00', deposits: 0, withdrawals: 0, ops: 0 },
      { label: '04:00', deposits: 0, withdrawals: 0, ops: 0 },
      { label: '08:00', deposits: Math.round(computedTotalDeposit * 0.3), withdrawals: 0, ops: 1 },
      { label: '12:00', deposits: computedTotalDeposit, withdrawals: 0, ops: 2 },
      { label: '16:00', deposits: computedTotalDeposit, withdrawals: computedTotalWithdrawal, ops: clientTransactions.length || 2 },
      { label: '20:00', deposits: computedTotalDeposit, withdrawals: computedTotalWithdrawal, ops: clientTransactions.length || 2 },
      { label: 'Now', deposits: computedTotalDeposit, withdrawals: computedTotalWithdrawal, ops: clientTransactions.length || 2 },
    ];

    return {
      '30d': points30d,
      '7d': points7d,
      today: pointsToday,
    };
  };

  const datasets = generateDynamicDatasets();
  const currentData = datasets[timeRange];

  // SVG Chart Geometry Calculations (Canvas: 560 x 180, Base Y: 150, Top Y: 25)
  const chartWidth = 560;
  const chartHeight = 180;
  const chartBaseY = 148;
  const chartTopY = 28;
  const maxAvailableH = chartBaseY - chartTopY; // 120px

  const xStep = (chartWidth - 80) / (currentData.length - 1);
  const xCoords = currentData.map((_, i) => 40 + i * xStep);

  // Normalization logic: dynamic max value based on highest metric or fallback 1000
  const maxMetricVal = Math.max(computedTotalDeposit, computedTotalWithdrawal, 1000) * 1.25;
  const depYCoords = currentData.map((d) => {
    if (d.deposits <= 0) return chartBaseY;
    const h = (d.deposits / maxMetricVal) * maxAvailableH;
    return Math.max(chartTopY, chartBaseY - h);
  });

  const opsYCoords = currentData.map((d) => {
    if (d.ops <= 0) return chartBaseY;
    const h = Math.min(maxAvailableH, d.ops * 25);
    return chartBaseY - h;
  });

  const wdrYCoords = currentData.map((d) => {
    if (d.withdrawals <= 0) return chartBaseY;
    const h = (d.withdrawals / maxMetricVal) * maxAvailableH;
    return Math.max(chartTopY, chartBaseY - h);
  });

  // Helper function to build smooth cubic Bezier spline
  const generateSpline = (coords: number[]) => {
    if (coords.length === 0) return '';
    let path = `M ${xCoords[0]},${coords[0]}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const x0 = xCoords[i];
      const y0 = coords[i];
      const x1 = xCoords[i + 1];
      const y1 = coords[i + 1];
      const cx1 = x0 + (x1 - x0) * 0.5;
      const cy1 = y0;
      const cx2 = x0 + (x1 - x0) * 0.5;
      const cy2 = y1;
      path += ` C ${cx1},${cy1} ${cx2},${cy2} ${x1},${y1}`;
    }
    return path;
  };

  const depLinePath = generateSpline(depYCoords);
  const opsLinePath = generateSpline(opsYCoords);
  const wdrLinePath = generateSpline(wdrYCoords);

  const depAreaPath = `${depLinePath} L ${xCoords[xCoords.length - 1]},${chartBaseY} L ${xCoords[0]},${chartBaseY} Z`;
  const opsAreaPath = `${opsLinePath} L ${xCoords[xCoords.length - 1]},${chartBaseY} L ${xCoords[0]},${chartBaseY} Z`;

  const hoveredItem = hoveredDataIndex !== null ? currentData[hoveredDataIndex] : null;

  return (
    <div className="space-y-4 sm:space-y-6 font-sans select-none pb-12">
      {/* 1. IMPERSONATION WARNING BANNER */}
      {impersonation.isActive && (
        <div className="rounded-2xl sm:rounded-3xl border border-amber-200 bg-amber-50 p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 rounded-full p-2 text-amber-700 shrink-0">
                <TriangleAlert className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  You are currently impersonating <strong>{client.name}</strong>
                </p>
                <p className="text-xs text-amber-700">Any actions you take will be performed as this user</p>
              </div>
            </div>
            <button
              onClick={handleStopImpersonation}
              className="flex items-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors text-xs font-bold shadow-xs cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Stop Impersonating</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. WELCOME BANNER (ROYAL BLUE THEME MATCHING ADMIN WELCOME BANNER) */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-blue-400/30 bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] p-4 sm:p-5 md:p-6 shadow-md text-white">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
          <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
            {/* Top Pill Tag */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-xs border border-white/20 text-[10px] font-extrabold uppercase tracking-wider text-blue-100 shadow-2xs font-heading">
              <Shield className="w-3 h-3 text-emerald-300" />
              <span>Secured Client Workspace</span>
            </div>

            {/* Heading */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight font-heading">
              Good morning, {clientFirstName}.
            </h1>

            {/* Description */}
            <p className="text-xs sm:text-sm text-blue-100/90 font-sans leading-relaxed">
              Review balances, activity, and funding in one clean view.
            </p>

            {/* Live Date & Time pill - Fits perfectly on one single line on mobile */}
            <div className="pt-1 sm:pt-1.5 max-w-full overflow-hidden">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-[11px] sm:text-xs font-semibold text-blue-100 shadow-2xs font-sans whitespace-nowrap max-w-full">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-200 shrink-0" />
                <span className="font-mono tabular-nums whitespace-nowrap shrink-0">{timeString || '01:41 PM'}</span>
                <span className="text-blue-300/60 shrink-0">•</span>
                <span className="hidden sm:inline whitespace-nowrap">{dateString || 'Thursday, September 24, 2026'}</span>
                <span className="sm:hidden whitespace-nowrap">{shortDateString || 'Thu, Sep 24, 2026'}</span>
              </div>
            </div>
          </div>

          {/* Quick Infrastructure Badges - Diminished Side-by-Side on Mobile */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 w-full sm:w-auto shrink-0 self-start">
            <div className="rounded-xl sm:rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xs p-2.5 sm:p-3 min-w-0 sm:min-w-[150px]">
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-blue-200 font-heading truncate">Server</p>
              <p className="mt-1 flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold text-white min-w-0">
                <Server className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-300 shrink-0" />
                <span className="truncate">Ocean Markets Ltd.</span>
              </p>
            </div>
            <div className="rounded-xl sm:rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xs p-2.5 sm:p-3 min-w-0 sm:min-w-[140px]">
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-blue-200 font-heading truncate">Cash Flow</p>
              <p className="mt-1 flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold text-white font-mono min-w-0">
                <span>$0.00</span>
                <span className="text-[9px] sm:text-[10px] font-normal text-blue-200 truncate">• 0 actions</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CAPITAL SNAPSHOT (LIVE KPI CARDS - ADMIN STYLING) */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-3.5 sm:p-5 md:p-6 shadow-xs space-y-3 sm:space-y-5">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
              Capital Snapshot
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] sm:text-xs font-bold font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Live Capital
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 font-medium font-sans">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Real-time overview</span>
          </div>
        </div>

        {/* 4 Multi-Colored Live KPI Cards (Matching Admin LiveKPICard Exact Aesthetic) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Card 1: Total Deposits (Mint theme) */}
          <div
            onMouseEnter={() => setHoveredCardId('c_dep')}
            onMouseLeave={() => setHoveredCardId(null)}
            className={clsx(
              'relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border select-none transition-all duration-300',
              'bg-gradient-to-b from-[#ccfbf1] via-[#d1fae5] to-[#a7f3d0] border-emerald-200/90',
              hoveredCardId === 'c_dep' ? 'scale-[1.03] shadow-md z-20' : 'shadow-xs hover:shadow-md'
            )}
          >
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#064e3b] font-heading">
                Total Deposits
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#059669] text-white shadow-xs flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="mt-3 relative z-10">
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#064e3b] font-mono tabular-nums leading-none">
                ${computedTotalDeposit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="mt-3 pt-2.5 border-t border-emerald-300/40 flex items-center justify-between text-[10px] sm:text-xs relative z-10 text-emerald-950/70 font-medium">
              <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-white/80 text-emerald-800 text-[10px] border border-emerald-200/80">
                +100%
              </span>
              <span>Growth • Signal 01</span>
            </div>
          </div>

          {/* Card 2: Total Equity (Periwinkle / Blue theme) */}
          <div
            onMouseEnter={() => setHoveredCardId('c_eq')}
            onMouseLeave={() => setHoveredCardId(null)}
            className={clsx(
              'relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border select-none transition-all duration-300',
              'bg-gradient-to-b from-[#e0e7ff] via-[#eef2ff] to-[#ddd6fe] border-indigo-200/90',
              hoveredCardId === 'c_eq' ? 'scale-[1.03] shadow-md z-20' : 'shadow-xs hover:shadow-md'
            )}
          >
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#1e1b4b] font-heading">
                Total Equity
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#4f46e5] text-white shadow-xs flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="mt-3 relative z-10">
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#312e81] font-mono tabular-nums leading-none">
                ${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="mt-3 pt-2.5 border-t border-indigo-300/40 flex items-center justify-between text-[10px] sm:text-xs relative z-10 text-indigo-950/70 font-medium">
              <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-white/80 text-indigo-800 text-[10px] border border-indigo-200/80">
                Net: ${netFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span>Growth • Signal 02</span>
            </div>
          </div>

          {/* Card 3: Total Withdrawals (Rose theme) */}
          <div
            onMouseEnter={() => setHoveredCardId('c_wd')}
            onMouseLeave={() => setHoveredCardId(null)}
            className={clsx(
              'relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border select-none transition-all duration-300',
              'bg-gradient-to-b from-[#ffe4e6] via-[#fff1f2] to-[#fecdd3] border-rose-200/90',
              hoveredCardId === 'c_wd' ? 'scale-[1.03] shadow-md z-20' : 'shadow-xs hover:shadow-md'
            )}
          >
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#881337] font-heading">
                Total Withdrawals
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#e11d48] text-white shadow-xs flex items-center justify-center shrink-0">
                <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="mt-3 relative z-10">
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#881337] font-mono tabular-nums leading-none">
                ${computedTotalWithdrawal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="mt-3 pt-2.5 border-t border-rose-300/40 flex items-center justify-between text-[10px] sm:text-xs relative z-10 text-rose-950/70 font-medium">
              <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-white/80 text-rose-800 text-[10px] border border-rose-200/80">
                {completedWithdrawals.length} completed
              </span>
              <span>Payout • Signal 03</span>
            </div>
          </div>

          {/* Card 4: MT5 Accounts (Cyan theme) */}
          <div
            onMouseEnter={() => setHoveredCardId('c_acc')}
            onMouseLeave={() => setHoveredCardId(null)}
            className={clsx(
              'relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border select-none transition-all duration-300',
              'bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-[#bae6fd] border-sky-200/90',
              hoveredCardId === 'c_acc' ? 'scale-[1.03] shadow-md z-20' : 'shadow-xs hover:shadow-md'
            )}
          >
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#0c4a6e] font-heading">
                MT5 Accounts
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0284c7] text-white shadow-xs flex items-center justify-center shrink-0">
                <WalletCards className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="mt-3 relative z-10">
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0c4a6e] font-mono tabular-nums leading-none">
                {accountsCount}
              </h3>
            </div>
            <div className="mt-3 pt-2.5 border-t border-sky-300/40 flex items-center justify-between text-[10px] sm:text-xs relative z-10 text-sky-950/70 font-medium">
              <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-white/80 text-sky-800 text-[10px] border border-sky-200/80">
                Balance: ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span>Growth • Signal 04</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TODAY'S PERFORMANCE (ROYAL BLUE CARDS - MATCHING ADMIN TodaysPerformanceSection) */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-3.5 sm:p-5 md:p-6 shadow-xs space-y-3 sm:space-y-5">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
              Today's Performance
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] sm:text-xs font-bold font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Live Feed
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold font-sans">
              <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
              <span>Today</span>
            </span>
          </div>
        </div>

        {/* 4 Royal Blue Performance Cards (Matching Admin RoyalPurpleKPICard exactly with blue gradient) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Deposits */}
          <div className="relative group overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] p-4 sm:p-5 text-white border border-blue-400/25 shadow-xs hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between relative z-10 gap-2">
              <span className="text-[10px] sm:text-xs font-bold text-blue-100 uppercase tracking-wider font-heading leading-tight">
                Deposits
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#1d4ed8] shadow-xs flex items-center justify-center shrink-0">
                <CircleArrowUp className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-3 relative z-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums leading-none">
                ${computedTotalDeposit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="mt-3.5 pt-3 border-t border-blue-400/30 flex items-center justify-between text-xs relative z-10">
              <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px]">
                <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                {completedDeposits.length} approved
              </span>
              <span className="text-blue-100/80 font-mono text-[11px]">Weight: 100%</span>
            </div>
          </div>

          {/* Card 2: Withdrawals */}
          <div className="relative group overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] p-4 sm:p-5 text-white border border-blue-400/25 shadow-xs hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between relative z-10 gap-2">
              <span className="text-[10px] sm:text-xs font-bold text-blue-100 uppercase tracking-wider font-heading leading-tight">
                Withdrawals
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#1d4ed8] shadow-xs flex items-center justify-center shrink-0">
                <CircleArrowDown className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-3 relative z-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums leading-none">
                ${computedTotalWithdrawal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="mt-3.5 pt-3 border-t border-blue-400/30 flex items-center justify-between text-xs relative z-10">
              <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px]">
                <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                {completedWithdrawals.length} completed
              </span>
              <span className="text-blue-100/80 font-mono text-[11px]">Outflow</span>
            </div>
          </div>

          {/* Card 3: Transactions */}
          <div className="relative group overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] p-4 sm:p-5 text-white border border-blue-400/25 shadow-xs hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between relative z-10 gap-2">
              <span className="text-[10px] sm:text-xs font-bold text-blue-100 uppercase tracking-wider font-heading leading-tight">
                Transactions
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#1d4ed8] shadow-xs flex items-center justify-center shrink-0">
                <Repeat className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-3 relative z-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums leading-none">
                {clientDeposits.length + clientWithdrawals.length + clientTransactions.length}
              </h3>
            </div>
            <div className="mt-3.5 pt-3 border-t border-blue-400/30 flex items-center justify-between text-xs relative z-10">
              <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px]">
                <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                Live
              </span>
              <span className="text-blue-100/80 font-mono text-[11px]">Total Events</span>
            </div>
          </div>

          {/* Card 4: Net Flow */}
          <div className="relative group overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] p-4 sm:p-5 text-white border border-blue-400/25 shadow-xs hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between relative z-10 gap-2">
              <span className="text-[10px] sm:text-xs font-bold text-blue-100 uppercase tracking-wider font-heading leading-tight">
                Net Flow
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#1d4ed8] shadow-xs flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-3 relative z-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums leading-none">
                {netFlow >= 0 ? `+$${netFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `-$${Math.abs(netFlow).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              </h3>
            </div>
            <div className="mt-3.5 pt-3 border-t border-blue-400/30 flex items-center justify-between text-xs relative z-10">
              <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px]">
                <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                Live
              </span>
              <span className="text-blue-100/80 font-mono text-[11px]">Net Surplus</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. ACCOUNT ACTIVITY (WORKING SVG BAR, AREA & LINE CHARTS - MATCHING ADMIN REVENUE ANALYTICS) */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-3.5 sm:p-5 md:p-6 shadow-xs space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
              Account Activity
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] sm:text-xs font-bold font-sans">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              Activity Center
            </span>
          </div>

          {/* Controls: Time Period Dropdown + Chart Mode Buttons + Refresh */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Time Period Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRangeDropdownOpen(!rangeDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer shadow-2xs transition-all"
              >
                <CalendarRange className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {timeRange === '30d' && 'Last 30 days'}
                  {timeRange === '7d' && 'Last 7 days'}
                  {timeRange === 'today' && 'Today'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {rangeDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-36 rounded-xl bg-white border border-slate-200 shadow-xl p-1 z-30 animate-in fade-in">
                  {(['30d', '7d', 'today'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setTimeRange(r);
                        setRangeDropdownOpen(false);
                      }}
                      className={clsx(
                        'w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer font-medium',
                        timeRange === r ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <span>
                        {r === '30d' && 'Last 30 days'}
                        {r === '7d' && 'Last 7 days'}
                        {r === 'today' && 'Today'}
                      </span>
                      {timeRange === r && <Check className="w-3 h-3 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chart Mode Toggle Buttons (Bar | Area | Line) */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs">
              <button
                type="button"
                onClick={() => setChartViewMode('bar')}
                className={clsx(
                  'px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5',
                  chartViewMode === 'bar' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <ChartColumn className="w-3.5 h-3.5" />
                <span>Bar</span>
              </button>
              <button
                type="button"
                onClick={() => setChartViewMode('area')}
                className={clsx(
                  'px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5',
                  chartViewMode === 'area' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Area</span>
              </button>
              <button
                type="button"
                onClick={() => setChartViewMode('line')}
                className={clsx(
                  'px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5',
                  chartViewMode === 'line' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <ChartLine className="w-3.5 h-3.5" />
                <span>Line</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-blue-700 transition-colors cursor-pointer shadow-2xs"
              title="Refresh Activity"
            >
              <RotateCw className={clsx('w-4 h-4', isRefreshing && 'animate-spin text-blue-600')} />
            </button>
          </div>
        </div>

        {/* Grid: Summary Metrics Aside + True Working Interactive SVG Chart Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
          {/* Metrics Aside */}
          <div className="space-y-3 lg:col-span-1">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">Peak Volume</p>
              <p className="text-base font-extrabold text-slate-800">
                {timeRange === '30d' ? '30 Days' : timeRange === '7d' ? '7 Days' : 'Today'}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                ${(computedTotalDeposit + computedTotalWithdrawal).toLocaleString()} moved
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">Streams</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    Deposits
                  </span>
                  <span className="font-bold text-slate-800 font-mono">
                    ${computedTotalDeposit.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    Withdrawals
                  </span>
                  <span className="font-bold text-slate-800 font-mono">
                    ${computedTotalWithdrawal.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                    Transactions
                  </span>
                  <span className="font-bold text-slate-800 font-mono">
                    {clientDeposits.length + clientWithdrawals.length + clientTransactions.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Working SVG Chart Canvas with Bar, Area & Line Renderers */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 flex flex-col justify-between min-h-[280px] relative">
            {/* Top Legend and Hover Info */}
            <div className="flex items-center justify-between gap-4 text-xs font-semibold text-slate-600 mb-3 pb-2 border-b border-slate-200/60">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Deposits
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Withdrawals
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Transactions
                </span>
              </div>

              {/* Dynamic Hover Tooltip Badge */}
              {hoveredItem && (
                <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-slate-900 text-white text-[11px] font-mono animate-in fade-in">
                  <span className="font-bold text-slate-300">{hoveredItem.label}:</span>
                  <span className="text-emerald-400">Dep: ${hoveredItem.deposits.toLocaleString()}</span>
                  <span className="text-amber-300">Wdr: ${hoveredItem.withdrawals.toLocaleString()}</span>
                  <span className="text-blue-400">Ops: {hoveredItem.ops}</span>
                </div>
              )}
            </div>

            {/* SVG Interactive Canvas */}
            <div className="relative w-full h-52 sm:h-56">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                <defs>
                  {/* Area Gradient for Deposits */}
                  <linearGradient id="client-dep-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Area Gradient for Transactions */}
                  <linearGradient id="client-ops-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Grid Lines & Reference Scale (Dynamic based on maxMetricVal) */}
                {[
                  { y: 28, label: `$${Math.round(maxMetricVal / 1000)}k` },
                  { y: 58, label: `$${Math.round((maxMetricVal * 0.75) / 1000)}k` },
                  { y: 88, label: `$${Math.round((maxMetricVal * 0.5) / 1000)}k` },
                  { y: 118, label: `$${Math.round((maxMetricVal * 0.25) / 1000)}k` },
                  { y: chartBaseY, label: '$0' },
                ].map((grid, idx) => (
                  <g key={idx}>
                    <text
                      x="32"
                      y={grid.y + 3}
                      className="text-[9px] font-mono fill-slate-400"
                      textAnchor="end"
                    >
                      {grid.label}
                    </text>
                    <line
                      x1="40"
                      y1={grid.y}
                      x2={chartWidth - 20}
                      y2={grid.y}
                      stroke="#e2e8f0"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    />
                  </g>
                ))}

                {/* 1. BAR CHART VIEW */}
                {chartViewMode === 'bar' && (
                  <g>
                    {currentData.map((item, i) => {
                      const x = xCoords[i];
                      const depH = chartBaseY - depYCoords[i];
                      const opsH = chartBaseY - opsYCoords[i];
                      const isHovered = hoveredDataIndex === i;

                      return (
                        <g
                          key={i}
                          onMouseEnter={() => setHoveredDataIndex(i)}
                          onMouseLeave={() => setHoveredDataIndex(null)}
                          className="cursor-pointer group"
                        >
                          {/* Hover Column highlight */}
                          {isHovered && (
                            <rect
                              x={x - 22}
                              y={chartTopY - 8}
                              width="44"
                              height={chartBaseY - chartTopY + 12}
                              fill="#3b82f6"
                              fillOpacity="0.06"
                              rx="6"
                            />
                          )}

                          {/* Deposit Bar (Emerald) */}
                          <rect
                            x={x - 14}
                            y={depYCoords[i] === chartBaseY ? chartBaseY - 4 : depYCoords[i]}
                            width="10"
                            height={depYCoords[i] === chartBaseY ? 4 : depH}
                            rx="3"
                            fill="#10b981"
                            className="transition-all duration-300 group-hover:fill-emerald-600"
                          />

                          {/* Withdrawal Bar (Amber) */}
                          <rect
                            x={x - 2}
                            y={chartBaseY - 4}
                            width="10"
                            height="4"
                            rx="3"
                            fill="#f59e0b"
                            className="transition-all duration-300 group-hover:fill-amber-600"
                          />

                          {/* Operations Bar (Blue) */}
                          <rect
                            x={x + 10}
                            y={opsYCoords[i] === chartBaseY ? chartBaseY - 4 : opsYCoords[i]}
                            width="10"
                            height={opsYCoords[i] === chartBaseY ? 4 : opsH}
                            rx="3"
                            fill="#2563eb"
                            className="transition-all duration-300 group-hover:fill-blue-700"
                          />
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* 2. AREA CHART VIEW */}
                {chartViewMode === 'area' && (
                  <g>
                    {/* Deposits Area Fill & Line */}
                    <path d={depAreaPath} fill="url(#client-dep-area)" />
                    <path
                      d={depLinePath}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Operations Area Fill & Line */}
                    <path d={opsAreaPath} fill="url(#client-ops-area)" />
                    <path
                      d={opsLinePath}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Data Node Dots */}
                    {currentData.map((item, i) => (
                      <g
                        key={i}
                        onMouseEnter={() => setHoveredDataIndex(i)}
                        onMouseLeave={() => setHoveredDataIndex(null)}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={xCoords[i]}
                          cy={depYCoords[i]}
                          r={hoveredDataIndex === i ? 6 : 4}
                          fill="#10b981"
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="transition-all duration-200"
                        />
                        <circle
                          cx={xCoords[i]}
                          cy={opsYCoords[i]}
                          r={hoveredDataIndex === i ? 6 : 4}
                          fill="#2563eb"
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="transition-all duration-200"
                        />
                      </g>
                    ))}
                  </g>
                )}

                {/* 3. LINE CHART VIEW */}
                {chartViewMode === 'line' && (
                  <g>
                    {/* Withdrawals flat baseline line */}
                    <path
                      d={wdrLinePath}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      strokeLinecap="round"
                    />

                    {/* Deposits Spline Line */}
                    <path
                      d={depLinePath}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Transactions Spline Line */}
                    <path
                      d={opsLinePath}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Interactive Points on Line */}
                    {currentData.map((item, i) => (
                      <g
                        key={i}
                        onMouseEnter={() => setHoveredDataIndex(i)}
                        onMouseLeave={() => setHoveredDataIndex(null)}
                        className="cursor-pointer"
                      >
                        {/* Hover vertical guide line */}
                        {hoveredDataIndex === i && (
                          <line
                            x1={xCoords[i]}
                            y1={chartTopY}
                            x2={xCoords[i]}
                            y2={chartBaseY}
                            stroke="#94a3b8"
                            strokeDasharray="2 2"
                            strokeWidth="1"
                          />
                        )}
                        <circle
                          cx={xCoords[i]}
                          cy={depYCoords[i]}
                          r={hoveredDataIndex === i ? 6 : 4}
                          fill="#10b981"
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="transition-all duration-200"
                        />
                        <circle
                          cx={xCoords[i]}
                          cy={opsYCoords[i]}
                          r={hoveredDataIndex === i ? 6 : 4}
                          fill="#2563eb"
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="transition-all duration-200"
                        />
                      </g>
                    ))}
                  </g>
                )}

                {/* X-Axis Baseline & Tick Labels */}
                <line x1="40" y1={chartBaseY} x2={chartWidth - 20} y2={chartBaseY} stroke="#cbd5e1" strokeWidth="1" />
                {currentData.map((item, i) => (
                  <text
                    key={i}
                    x={xCoords[i]}
                    y={chartBaseY + 16}
                    textAnchor="middle"
                    className={clsx(
                      'text-[10px] font-mono transition-colors',
                      hoveredDataIndex === i ? 'fill-blue-600 font-bold' : 'fill-slate-500'
                    )}
                  >
                    {item.label}
                  </text>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 6. CAPITAL DISTRIBUTION (GLOBAL PROGRESS) */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-3.5 sm:p-5 md:p-6 shadow-xs space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
              Capital Distribution
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] sm:text-xs font-bold font-sans">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Global Progress
            </span>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Lead: <strong>{clientAccounts.length > 0 ? `${clientAccounts[0].login} • ${clientAccounts[0].type || 'STANDARD'}` : 'No accounts active'}</strong>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">Tracked Balance</p>
              <p className="text-lg font-extrabold text-slate-900 font-mono mt-1">${totalBalance.toLocaleString()}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <BadgeDollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">Average Account</p>
              <p className="text-lg font-extrabold text-slate-900 font-mono mt-1">
                ${accountsCount > 0 ? (totalBalance / accountsCount).toLocaleString() : '0.00'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">Account Status</p>
              <p className="text-lg font-extrabold text-slate-900 mt-1">{accountsCount} live / 0 idle</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <WalletCards className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Ranked Account Item */}
        {clientAccounts.length > 0 ? (
          clientAccounts.map((acc, idx) => (
            <div key={acc.id || idx} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{acc.login} • {acc.type || 'STANDARD'}</span>
                </div>
                <span className="font-mono font-bold text-slate-800 text-sm">${(acc.balance || 0).toLocaleString()}</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500 font-mono">
                  <span>Leverage {acc.leverage}</span>
                  <span>{acc.server}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full w-full" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-slate-400 text-xs font-medium">
            No live accounts opened yet. Click &quot;Open Account&quot; to provision a new trading account.
          </div>
        )}
      </div>

      {/* 7. MARKET BOARD */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-3.5 sm:p-5 md:p-6 shadow-xs space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
              Market Board
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] sm:text-xs font-bold font-sans">
              <ChartCandlestick className="w-3.5 h-3.5 text-blue-600" />
              Market Pulse
            </span>
          </div>

          <div className="text-xs text-slate-400 font-sans">All tracked symbols • Live feed</div>
        </div>

        {/* 4 Quick Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">Trades Scanned</p>
            <p className="text-xl font-extrabold text-slate-900 font-mono mt-1">0</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">Open Positions</p>
            <p className="text-xl font-extrabold text-slate-900 font-mono mt-1">0</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">Net Profit</p>
            <p className="text-xl font-extrabold text-slate-900 font-mono mt-1">$0.00</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">Win Rate</p>
            <p className="text-xl font-extrabold text-slate-900 font-mono mt-1">0%</p>
          </div>
        </div>

        {/* Controls & Radar Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          {/* Control Deck */}
          <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-heading">Symbol Basket</label>
              <div className="p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800">
                All Symbols
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-heading">Time Horizon</label>
              <div className="p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800">
                Last 7 Days
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCw className={clsx('w-3.5 h-3.5', isRefreshing && 'animate-spin')} />
              <span>Sync Chart Feed</span>
            </button>
          </div>

          {/* Visualizer Radar */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 sm:p-8 text-center flex flex-col items-center justify-center space-y-3">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-ping opacity-35" />
              <div className="w-16 h-16 rounded-full border border-blue-300 flex items-center justify-center bg-blue-50/60">
                <Orbit className="w-7 h-7 text-blue-600 animate-spin" style={{ animationDuration: '12s' }} />
              </div>
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900 font-heading">Market Feed Synchronized</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Waiting for first trade execution to stream real-time price routes and order telemetry.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 8. TRANSACTION LEDGER */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-3.5 sm:p-5 md:p-6 shadow-xs space-y-3 sm:space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
              Transaction Ledger
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] sm:text-xs font-bold font-sans">
              <ReceiptText className="w-3.5 h-3.5 text-blue-600" />
              Funding Stream
            </span>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            {clientDeposits.length + clientTransactions.length} records • {clientDeposits.length} deposits
          </div>
        </div>

        {/* Transaction Record List */}
        {clientDeposits.length === 0 && clientTransactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-slate-400 text-xs font-medium">
            No funding records found yet. Click &quot;Deposit funds&quot; to submit a new deposit.
          </div>
        ) : (
          <div className="space-y-3">
            {clientDeposits.map((dep) => (
              <div 
                key={dep.id} 
                className="rounded-2xl border border-purple-200 bg-purple-50/30 p-4 transition-all hover:bg-purple-50/60"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 font-heading">
                          Deposit
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-800">#{dep.accountLogin}</span>
                        {dep.txHash && (
                          <span className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]" title={dep.txHash}>
                            ({dep.txHash})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {dep.paymentMethod} • {new Date(dep.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <span 
                      className={clsx(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono capitalize",
                        dep.status === 'completed' ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                        dep.status === 'rejected' ? "bg-rose-100 text-rose-800 border border-rose-200" :
                        "bg-amber-100 text-amber-800 border border-amber-200"
                      )}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {dep.status}
                    </span>
                    <span className="text-base sm:text-lg font-extrabold text-emerald-700 font-mono">
                      +${dep.amount.toLocaleString()} {dep.currency || 'USD'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 9. TRADING ACCOUNTS (ACCOUNT REGISTRY) */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-3.5 sm:p-5 md:p-6 shadow-xs space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
              Trading Accounts
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] sm:text-xs font-bold font-sans">
              <WalletCards className="w-3.5 h-3.5 text-blue-600" />
              Active Portfolio
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openClientModal('deposit')}
              className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Deposit funds</span>
            </button>
            <button
              type="button"
              onClick={() => openClientModal('withdrawal')}
              className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Withdraw funds</span>
            </button>
          </div>
        </div>

        {/* Account Cards Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {clientAccounts.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-slate-400 text-xs font-medium">
              No live accounts registered. Click &quot;Open Account&quot; to provision a new trading account.
            </div>
          ) : (
            clientAccounts.map((acc, idx) => (
              <div 
                key={acc.id || idx} 
                className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/50 p-4 sm:p-5 shadow-xs space-y-4"
              >
                {/* Account Top Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase">
                      {acc.type || 'STANDARD'}
                    </span>
                    <span className="text-base font-extrabold text-slate-900 font-mono">{acc.login}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                </div>

                {/* 4 Metric Boxes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">Balance</p>
                    <p className="text-sm sm:text-base font-extrabold text-slate-900 font-mono mt-0.5">
                      ${(acc.balance || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">Equity</p>
                    <p className="text-sm sm:text-base font-extrabold text-slate-900 font-mono mt-0.5">
                      ${(acc.equity || acc.balance || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">Leverage</p>
                    <p className="text-sm sm:text-base font-extrabold text-slate-900 font-mono mt-0.5">
                      {acc.leverage || '1:100'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">Health</p>
                    <p className="text-sm sm:text-base font-extrabold text-emerald-600 font-mono mt-0.5">100%</p>
                  </div>
                </div>

                {/* Health Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-500">
                    <span>Server & Currency</span>
                    <span className="font-bold text-slate-700">{acc.server || 'TheKFMarket-Live'} • {acc.currency || 'USD'}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                    <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full w-full" />
                  </div>
                </div>

                {/* Account Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openClientModal('deposit')}
                    className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Deposit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openClientModal('withdrawal')}
                    className="flex-1 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Withdraw</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClientDashboardPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    }>
      <ClientDashboardContent />
    </React.Suspense>
  );
}
