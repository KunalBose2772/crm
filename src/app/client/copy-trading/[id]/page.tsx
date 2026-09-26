'use client';

import React, { useState, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  TrendingUp,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Users,
  DollarSign,
  Percent,
  Activity,
  Layers,
  HelpCircle,
  Award,
  ChevronDown,
  AlertTriangle,
  Send,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Clock,
  Sparkles,
  Info,
  Calendar,
  Check,
  Coins,
  Target
} from 'lucide-react';
import { INITIAL_MASTER_TRADERS } from '@/data/mockCopyTrading';
import { useCRM } from '@/context/CRMContext';
import { StartCopyModal } from '@/components/modals/StartCopyModal';

// Country code to Flag emoji helper
function getFlagEmoji(countryCode?: string) {
  if (!countryCode || countryCode === 'UN') return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Experience ranks based on trader statistics
function getExperienceTier(riskScore: number, trades: number) {
  if (trades > 2000) return { label: 'Legend', color: 'bg-amber-50 text-amber-700 border-amber-200' };
  if (trades > 1000) return { label: 'High achiever', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (trades > 300) return { label: 'Growing talent', color: 'bg-blue-50 text-blue-700 border-blue-200' };
  return { label: 'Newcomer', color: 'bg-slate-100 text-slate-700 border-slate-200' };
}

function MasterProfileContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const masterId = params?.id as string;
  const targetClientId = searchParams?.get('clientId');

  const { clients, impersonation, clientUser } = useCRM();
  const clientFromParam = targetClientId ? clients.find(c => c.id === targetClientId) : null;
  const rawClient = clientFromParam || impersonation.client || clientUser || clients[0];
  const client = (rawClient?.id ? clients.find(c => c.id === rawClient.id || c.email === rawClient.email) : null) || rawClient;

  // Match the specific master by ID from URL with dynamic fetch fallback
  const initialFound = INITIAL_MASTER_TRADERS.find(m => m.id === masterId);
  const [master, setMaster] = useState(initialFound || INITIAL_MASTER_TRADERS[0]);

  React.useEffect(() => {
    async function loadMaster() {
      try {
        const res = await fetch('/api/copy-trading/masters');
        const data = await res.json();
        if (data.success && Array.isArray(data.masters)) {
          const found = data.masters.find((m: any) => m.id === masterId);
          if (found) {
            setMaster(found);
          }
        }
      } catch (err) {
        console.error('Error fetching master detail', err);
      }
    }
    loadMaster();
  }, [masterId]);

  // States
  const [activeTimeframe, setActiveTimeframe] = useState<'2W' | '1M' | '3M' | '6M' | 'ALL'>('ALL');
  const [activeHistoryTab, setActiveHistoryTab] = useState<'closed' | 'open' | 'balance'>('closed');
  const [historyShowCount, setHistoryShowCount] = useState(8);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const expTier = getExperienceTier(master.riskScore, master.totalTrades);

  // Realistic dynamic days with us from joinedDate
  const daysWithUs = useMemo(() => {
    const inception = new Date(master.joinedDate).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - inception) / (1000 * 60 * 60 * 24));
    return isNaN(diff) || diff <= 0 ? 840 : diff;
  }, [master.joinedDate]);

  // Derived realistic stats for this specific master
  const primarySymbol = master.favoritePairs?.[0]?.symbol || 'US100';
  const secondarySymbol = master.favoritePairs?.[1]?.symbol || 'XAUUSD';

  const maxUnrealizedLoss = -Math.abs(master.equity * (master.maxDrawdown / 100) * 0.75).toFixed(2);
  const maxDrawdownDuration = `${Math.round(master.maxDrawdown * 4.2)}d`;

  // Timeframe calculation for sparklines & gain
  const timeframeMultiplier = useMemo(() => {
    switch (activeTimeframe) {
      case '2W': return 0.18;
      case '1M': return 0.35;
      case '3M': return 0.58;
      case '6M': return 0.82;
      default: return 1.0;
    }
  }, [activeTimeframe]);

  const chartPoints = useMemo(() => {
    const base = master.sparklineData && master.sparklineData.length >= 2
      ? master.sparklineData
      : [100, 115, 130, 155, 180, 215, 260, 290, 320, 350, 389.5];

    if (activeTimeframe === '2W') return base.slice(-4).map(v => v * 1.02);
    if (activeTimeframe === '1M') return base.slice(-6).map(v => v * 1.01);
    if (activeTimeframe === '3M') return base.slice(-8);
    if (activeTimeframe === '6M') return base.slice(-10);
    return base;
  }, [master.sparklineData, activeTimeframe]);

  const periodGain = (master.overallGain * timeframeMultiplier).toFixed(1);
  const periodCopierDelta = Math.max(1, Math.round(master.totalCopiers * 0.09 * timeframeMultiplier));

  // Profit vs Loss breakdown values
  const grossProfitVal = (master.balance * 0.18 * timeframeMultiplier).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const grossLossVal = (master.balance * 0.015 * timeframeMultiplier).toFixed(2);
  const profitPctBar = Math.min(99, Math.max(70, Math.round(master.winRate)));

  // SVG Chart Calculation
  const rawMin = Math.min(...chartPoints);
  const rawMax = Math.max(...chartPoints);
  const delta = rawMax - rawMin || 1;
  const minVal = Math.floor(rawMin - delta * 0.06);
  const maxVal = Math.ceil(rawMax + delta * 0.06);
  const valRange = maxVal - minVal || 1;

  const svgWidth = 840;
  const svgHeight = 220;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 26;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const points = chartPoints.map((val, idx) => {
    const x = paddingLeft + (idx / (chartPoints.length - 1)) * chartWidth;
    const normalized = (val - minVal) / valRange;
    const clampedNorm = Math.max(0, Math.min(1, normalized));
    const y = paddingTop + (1 - clampedNorm) * chartHeight;
    return { x, y, val, idx };
  });

  const pathD = points.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    const prev = a[i - 1];
    const cpX1 = prev.x + (point.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (point.x - prev.x) / 2;
    const cpY2 = point.y;
    return `${acc} C ${cpX1.toFixed(1)},${cpY1.toFixed(1)} ${cpX2.toFixed(1)},${cpY2.toFixed(1)} ${point.x.toFixed(1)},${point.y.toFixed(1)}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)},${(svgHeight - paddingBottom).toFixed(1)} L ${points[0].x.toFixed(1)},${(svgHeight - paddingBottom).toFixed(1)} Z`;

  const lastPoint = points[points.length - 1];
  const activePoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : lastPoint;

  const yLabels = [
    { label: `${Math.round(maxVal)}%`, y: paddingTop },
    { label: `${Math.round(minVal + valRange * 0.66)}%`, y: paddingTop + chartHeight * 0.33 },
    { label: `${Math.round(minVal + valRange * 0.33)}%`, y: paddingTop + chartHeight * 0.66 },
    { label: `${Math.round(minVal)}%`, y: paddingTop + chartHeight },
  ];

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgRelativeX = (mouseX / rect.width) * svgWidth;

    let closestIdx = 0;
    let minDistance = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - svgRelativeX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = i;
      }
    });
    setHoveredIndex(closestIdx);
  };

  // Realistic mock trade ledger customized to the active Master Trader
  const closedOrdersByDate = useMemo(() => {
    return [
      {
        dateLabel: 'Yesterday',
        orders: [
          { id: 't1', symbol: primarySymbol, volume: '0.50', time: '16:42', duration: '4h 12m 30s', profit: 124.50, type: 'BUY' },
          { id: 't2', symbol: secondarySymbol, volume: '0.20', time: '11:15', duration: '1h 05m 18s', profit: 62.00, type: 'BUY' },
        ]
      },
      {
        dateLabel: '2026-09-24',
        orders: [
          { id: 't3', symbol: primarySymbol, volume: '0.40', time: '21:05', duration: '2h 45m 10s', profit: 98.40, type: 'BUY' },
          { id: 't4', symbol: primarySymbol, volume: '0.50', time: '18:30', duration: '5h 19m 40s', profit: 142.10, type: 'BUY' },
          { id: 't5', symbol: secondarySymbol, volume: '0.15', time: '14:20', duration: '48m 12s', profit: 34.50, type: 'BUY' },
        ]
      },
      {
        dateLabel: '2026-09-23',
        orders: [
          { id: 't6', symbol: primarySymbol, volume: '0.50', time: '15:10', duration: '3h 22m 15s', profit: 115.80, type: 'BUY' },
          { id: 't7', symbol: secondarySymbol, volume: '0.30', time: '10:05', duration: '1h 14m 50s', profit: 78.20, type: 'BUY' },
        ]
      },
      {
        dateLabel: '2026-09-22',
        orders: [
          { id: 't8', symbol: primarySymbol, volume: '0.50', time: '19:40', duration: '6h 05m 00s', profit: 154.20, type: 'BUY' },
          { id: 't9', symbol: primarySymbol, volume: '0.25', time: '13:15', duration: '25m 40s', profit: -28.50, type: 'SELL' },
        ]
      }
    ];
  }, [primarySymbol, secondarySymbol]);

  const openOrders = useMemo(() => {
    return [
      {
        id: 'op1',
        symbol: primarySymbol,
        volume: '0.50',
        openTime: '14:15',
        openDate: '2026-09-25',
        duration: '18h 42m',
        floatingPnl: master.floatingProfit,
        type: 'BUY'
      }
    ];
  }, [primarySymbol, master.floatingProfit]);

  const balanceOperations = useMemo(() => {
    return [
      { id: 'b1', type: 'Deposit', date: '2026-09-10', time: '09:30', amount: 5000.00 },
      { id: 'b2', type: 'Withdrawal', date: '2026-08-28', time: '14:15', amount: 1200.00 },
      { id: 'b3', type: 'Deposit', date: '2026-07-15', time: '11:00', amount: 3500.00 }
    ];
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-12 select-none">
      {/* Top Header / Breadcrumb navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/client/copy-trading${targetClientId ? `?clientId=${targetClientId}` : ''}`}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-2xs"
            title="Back to Master Traders"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading">
                {master.name}
              </h1>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${expTier.color}`}>
                <Award className="w-3 h-3" />
                <span>{expTier.label}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              MT5 #{master.login} • {master.strategyName} • Joined {master.joinedDate}
            </p>
          </div>
        </div>

        {/* Copy CTA Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCopyModalOpen(true)}
            className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow transition flex items-center justify-center gap-2 cursor-pointer font-heading"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Start Copying (Min ${master.minInvestment})</span>
          </button>
        </div>
      </div>

      {/* Third-Party Content Disclaimer Accordion */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 overflow-hidden shadow-2xs transition">
        <button
          onClick={() => setIsDisclaimerOpen(!isDisclaimerOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-left cursor-pointer hover:bg-amber-50 transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-amber-950 font-heading">
              Third-party content & risk disclaimer
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-amber-800 transition-transform duration-200 ${
              isDisclaimerOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isDisclaimerOpen && (
          <div className="px-5 pb-4 pt-1 text-xs text-amber-900/90 font-sans border-t border-amber-200/60 space-y-2 bg-amber-50/40 leading-relaxed">
            <p>
              Trading leveraged products involves significant risk of loss. Strategy statistics are provided by independent Master Traders. Past performance does not guarantee future results.
            </p>
            <p className="font-semibold text-amber-950">Important reminders:</p>
            <ul className="list-disc pl-5 space-y-1 text-amber-900/80">
              <li>Statements and profit estimates made by third parties are not guaranteed by the platform.</li>
              <li>Always size your allocated copy capital according to your personal risk tolerance.</li>
              <li>Stop guards and maximum drawdown controls should be applied when setting up copying.</li>
            </ul>
          </div>
        )}
      </div>

      {/* 4 Performance Metric Cards: Clean Admin Panel Card Styles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Overall Gain */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-indigo-200/70 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all duration-300 group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-indigo-900/70 font-sans truncate">
              Overall Gain
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex flex-wrap items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black text-slate-900 font-heading tracking-tight">
              +{master.overallGain.toFixed(1)}%
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[9px] sm:text-[10px] font-bold">
              +{periodGain}% {activeTimeframe}
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-1 truncate">
            Trajectory since inception
          </p>
        </div>

        {/* Card 2: Win Rate */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-blue-200/70 bg-gradient-to-br from-blue-50/70 via-white to-sky-50/40 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-300 group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-blue-900/70 font-sans truncate">
              Win Rate
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform shrink-0">
              <Target className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex flex-wrap items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black text-blue-600 font-heading tracking-tight">
              {master.winRate}%
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[9px] sm:text-[10px] font-bold">
              PF {master.profitFactor.toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-1 truncate">
            Over {master.totalTrades.toLocaleString()} settled trades
          </p>
        </div>

        {/* Card 3: Total Equity */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-emerald-200/70 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-300 group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-emerald-900/70 font-sans truncate">
              Master Equity
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform shrink-0">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex flex-wrap items-baseline gap-1.5 sm:gap-2">
            <span className="text-lg sm:text-3xl font-black text-emerald-600 font-heading tracking-tight">
              ${master.equity.toLocaleString()}
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] sm:text-[10px] font-bold">
              AUC
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-1 truncate">
            Controlled live on MT5
          </p>
        </div>

        {/* Card 4: Max Drawdown */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-amber-200/70 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 shadow-xs hover:shadow-md hover:border-amber-300 transition-all duration-300 group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-amber-900/70 font-sans truncate">
              Max Drawdown
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform shrink-0">
              <Percent className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex flex-wrap items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black text-amber-600 font-heading tracking-tight">
              {master.maxDrawdown}%
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[9px] sm:text-[10px] font-bold">
              {master.totalProfitShare}% Fee
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-1 truncate">
            Risk level: {master.riskScore}/5 • {master.totalCopiers} copiers
          </p>
        </div>
      </div>

      {/* Main Grid: Compounding Curve + Strategy DNA & Instrument Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Cols: Cumulative Growth Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 font-heading">
                Cumulative Compounding Trajectory (%)
              </h2>
              <p className="text-xs text-slate-400 font-sans">Live performance trajectory of strategy</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
              {(['2W', '1M', '3M', '6M', 'ALL'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setActiveTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer font-heading ${
                    activeTimeframe === tf
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Performance Chart with Hover Tracker */}
          <div className="relative w-full overflow-hidden pt-2">
            {hoveredIndex !== null && (
              <div className="absolute right-2 top-0 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-700 text-white text-xs font-black shadow-xs font-heading">
                <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                <span>Gain: +{activePoint.val.toFixed(1)}%</span>
              </div>
            )}

            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto cursor-crosshair overflow-visible"
              onMouseMove={handleSvgMouseMove}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <defs>
                <linearGradient id="detailCurveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="60%" stopColor="#10b981" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="detailStrokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {yLabels.map((grid, gIdx) => (
                <g key={gIdx}>
                  <text
                    x="45"
                    y={grid.y + 4}
                    textAnchor="end"
                    className="fill-slate-400 text-[10px] font-sans font-medium"
                  >
                    {grid.label}
                  </text>
                  <line
                    x1={paddingLeft}
                    y1={grid.y}
                    x2={svgWidth - paddingRight}
                    y2={grid.y}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                </g>
              ))}

              <path d={areaD} fill="url(#detailCurveGradient)" className="transition-all duration-300" />
              <path
                d={pathD}
                fill="none"
                stroke="url(#detailStrokeGradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {hoveredIndex !== null && (
                <line
                  x1={activePoint.x}
                  y1={paddingTop}
                  x2={activePoint.x}
                  y2={svgHeight - paddingBottom}
                  stroke="#10b981"
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                />
              )}

              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="4.5"
                fill="#ffffff"
                stroke="#10b981"
                strokeWidth="2.5"
                className="shadow-xs"
              />
            </svg>

            <div className="flex justify-between text-[11px] text-slate-400 font-medium px-2 pt-2 border-t border-slate-100">
              <span>{master.joinedDate} (Inception)</span>
              <span>Today (Current Balance: ${master.balance.toLocaleString()})</span>
            </div>
          </div>

          {/* Monthly Heatmap Returns */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Monthly Return Heatmap (2026)
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-2">
              {master.monthlyReturns?.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    m.returnPct >= 0
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50/70 border-rose-200 text-rose-800'
                  }`}
                >
                  <span className="block text-[10px] text-slate-500 font-semibold">{m.month}</span>
                  <span className="block text-xs font-extrabold mt-0.5">
                    {m.returnPct >= 0 ? '+' : ''}{m.returnPct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Strategy DNA & Symbol Breakdown */}
        <div className="space-y-4 sm:space-y-6">
          {/* Strategy Details Box */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 font-heading">
              Strategy Characteristics
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Trading Style</span>
                <span className="font-bold text-slate-800 font-heading">Institutional / Breakout</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Avg Holding Time</span>
                <span className="font-bold text-slate-800 font-heading">{master.avgHoldingTime}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Master Balance</span>
                <span className="font-bold text-slate-800 font-heading">${master.balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Floating Profit</span>
                <span className={`font-bold font-heading ${master.floatingProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {master.floatingProfit >= 0 ? '+' : ''}${master.floatingProfit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Min Investment</span>
                <span className="font-bold text-blue-600 font-heading">${master.minInvestment}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">Profit Commission</span>
                <span className="font-bold text-slate-800 font-heading">{master.totalProfitShare}% (HWM)</span>
              </div>
            </div>

            <button
              onClick={() => setIsCopyModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer font-heading"
            >
              Copy Master Strategy
            </button>
          </div>

          {/* Favorite Traded Pairs */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 font-heading">
              Traded Instruments Allocation
            </h3>
            <div className="space-y-3">
              {master.favoritePairs?.map(pair => (
                <div key={pair.symbol} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-800 font-heading">
                    <span>{pair.symbol}</span>
                    <span>{pair.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${pair.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Account Details & Risk Management Twin Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left: Account Details */}
        <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-black text-slate-900 font-heading">
            Account details
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Floating profit */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Floating profit</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              <div className={`text-sm sm:text-base font-black font-heading ${master.floatingProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {master.floatingProfit >= 0 ? '+' : ''}${master.floatingProfit.toFixed(2)}
              </div>
            </div>

            {/* Balance */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Balance</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-sm sm:text-base font-black text-slate-900 font-heading">
                ${master.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Master bonus */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                <span>Master's bonus</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-sm sm:text-base font-black text-slate-900 font-heading">
                $0.00
              </div>
            </div>

            {/* Leverage */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Leverage</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-sm sm:text-base font-black text-slate-900 font-heading">
                1:500
              </div>
            </div>
          </div>
        </div>

        {/* Right: Risk Management */}
        <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-black text-slate-900 font-heading">
            Risk management
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Max unrealised loss */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                <span>Max unrealised loss</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-sm sm:text-base font-black text-rose-600 font-heading">
                ${maxUnrealizedLoss}
              </div>
            </div>

            {/* Max drawdown duration */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                <span>Drawdown duration</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-sm sm:text-base font-black text-slate-900 font-heading">
                {maxDrawdownDuration}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: History Section: Closed orders | Open orders | Balance operations */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <h3 className="text-base sm:text-lg font-black text-slate-900 font-heading">
            Trade & Settlement History
          </h3>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveHistoryTab('closed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer font-heading ${
                activeHistoryTab === 'closed'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Closed orders
            </button>
            <button
              onClick={() => setActiveHistoryTab('open')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer font-heading ${
                activeHistoryTab === 'open'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Open orders ({openOrders.length})
            </button>
            <button
              onClick={() => setActiveHistoryTab('balance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer font-heading ${
                activeHistoryTab === 'balance'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Balance operations
            </button>
          </div>
        </div>

        {/* Tab 1: Closed Orders Table */}
        {activeHistoryTab === 'closed' && (
          <div className="space-y-6">
            {closedOrdersByDate.map((group, gIdx) => (
              <div key={gIdx} className="space-y-2">
                <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider font-heading px-1">
                  {group.dateLabel}
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                        <th className="py-2.5 px-4">Instrument & Volume</th>
                        <th className="py-2.5 px-4">Close time</th>
                        <th className="py-2.5 px-4">Duration</th>
                        <th className="py-2.5 px-4 text-right">Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {group.orders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                                order.type === 'BUY' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                              }`}>
                                <TrendingUp className="w-3 h-3" />
                              </span>
                              <span className="font-semibold text-slate-900">{order.volume} Lot</span>
                              <span className="font-bold text-slate-800">{order.symbol}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500">{order.time}</td>
                          <td className="py-2.5 px-4 text-slate-500">{order.duration}</td>
                          <td className={`py-2.5 px-4 text-right font-bold font-heading ${
                            order.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {order.profit >= 0 ? '+' : ''}${order.profit.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            <div className="text-center pt-2">
              <button
                onClick={() => setHistoryShowCount(prev => prev + 10)}
                className="px-5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-blue-600 font-bold text-xs shadow-2xs hover:shadow transition cursor-pointer font-heading"
              >
                show more
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Open Orders */}
        {activeHistoryTab === 'open' && (
          <div className="overflow-x-auto rounded-xl border border-slate-200/80">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Instrument & Volume</th>
                  <th className="py-2.5 px-4">Open time</th>
                  <th className="py-2.5 px-4">Duration</th>
                  <th className="py-2.5 px-4 text-right">Floating PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {openOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <TrendingUp className="w-3 h-3" />
                        </span>
                        <span className="font-semibold text-slate-900">{order.volume} Lot</span>
                        <span className="font-bold text-slate-800">{order.symbol}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">{order.openDate} {order.openTime}</td>
                    <td className="py-2.5 px-4 text-slate-500">{order.duration}</td>
                    <td className={`py-2.5 px-4 text-right font-bold font-heading ${order.floatingPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {order.floatingPnl >= 0 ? '+' : ''}${order.floatingPnl.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Balance Operations */}
        {activeHistoryTab === 'balance' && (
          <div className="overflow-x-auto rounded-xl border border-slate-200/80">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Operation</th>
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {balanceOperations.map(op => (
                  <tr key={op.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                          op.type === 'Deposit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {op.type === 'Deposit' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                        </span>
                        <span className="font-bold text-slate-900">{op.type}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">{op.date} • {op.time}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900 font-heading">
                      ${op.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Start Copying Modal Drawer */}
      <StartCopyModal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        master={master}
        accounts={client?.accounts || []}
        clientId={client?.id || ''}
        onSuccess={() => { }}
      />
    </div>
  );
}

export default function MasterTraderProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Master Trader Profile...</div>}>
      <MasterProfileContent />
    </Suspense>
  );
}
