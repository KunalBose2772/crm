'use client';

import React, { useState } from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  ChevronDown, 
  PieChart,
  BarChart3,
  LineChart as LineChartIcon
} from 'lucide-react';
import { clsx } from 'clsx';
import { RevenueAnalyticsConfig } from '@/types/crm';
import { initialRevenueAnalytics } from '@/services/api/dashboardAnalytics';

export interface RevenueAnalyticsSectionProps {
  data?: Partial<RevenueAnalyticsConfig>;
  onPeriodChange?: (period: 'today' | '7d' | '30d' | 'year') => void;
  onChartViewChange?: (view: 'radial' | 'bar' | 'line') => void;
  className?: string;
}

export const RevenueAnalyticsSection: React.FC<RevenueAnalyticsSectionProps> = ({
  data,
  onPeriodChange,
  onChartViewChange,
  className,
}) => {
  const config: RevenueAnalyticsConfig = {
    ...initialRevenueAnalytics,
    ...data,
  };

  const [timePeriod, setTimePeriod] = useState<'today' | '7d' | '30d' | 'year'>(
    config.period || '30d'
  );
  const [chartView, setChartView] = useState<'radial' | 'bar' | 'line'>(
    config.chartType || 'radial'
  );
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [chartDropdownOpen, setChartDropdownOpen] = useState(false);
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{ label: string; deposits: number; withdrawals: number; revenue: number } | null>(null);

  const periodLabels: Record<string, string> = {
    today: 'Today',
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    year: 'This Year',
  };

  const handlePeriodSelect = (p: 'today' | '7d' | '30d' | 'year') => {
    setTimePeriod(p);
    setPeriodDropdownOpen(false);
    onPeriodChange?.(p);
  };

  const handleChartSelect = (v: 'radial' | 'bar' | 'line') => {
    setChartView(v);
    setChartDropdownOpen(false);
    onChartViewChange?.(v);
  };

  const formatCurrency = (val: number, decimals = 0) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(val);
  };

  // Realistic working dataset for Bar & Line Charts across periods
  const weeklyData = [
    { label: 'Week 1', deposits: 18000, withdrawals: 4500, revenue: 13500 },
    { label: 'Week 2', deposits: 32000, withdrawals: 8200, revenue: 23800 },
    { label: 'Week 3', deposits: 24000, withdrawals: 6100, revenue: 17900 },
    { label: 'Week 4', deposits: 39000, withdrawals: 11000, revenue: 28000 },
  ];

  // Compact Radial Gauge Ring Component
  const CompactRadialGauge: React.FC<{
    value: string;
    sublabel: string;
    sublabelColor: string;
    percentage: number;
    gradientId: string;
    startColor: string;
    endColor: string;
    trackColor?: string;
  }> = ({ 
    value, 
    sublabel, 
    sublabelColor, 
    percentage, 
    gradientId,
    startColor,
    endColor,
    trackColor = '#f1f5f9' 
  }) => {
    const size = 110;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const displayPercent = Math.max(12, Math.min(percentage, 100));
    const strokeDashoffset = circumference - (displayPercent / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center my-1.5 sm:my-3">
        <svg 
          viewBox={`0 0 ${size} ${size}`} 
          className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 transform -rotate-90"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={startColor} />
              <stop offset="100%" stopColor={endColor} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xs sm:text-base md:text-lg font-extrabold text-slate-900 font-mono tracking-tight leading-none">
            {value}
          </span>
          <span className={clsx("text-[9px] sm:text-[11px] font-semibold mt-0.5 font-sans", sublabelColor)}>
            {sublabel}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={clsx(
      "rounded-2xl sm:rounded-3xl border border-purple-100/90 bg-white p-3.5 sm:p-5 md:p-6 shadow-xs flex flex-col justify-between h-full relative overflow-hidden transition-all select-none",
      className
    )}>
      {/* Subtle Purple Ambient Glow */}
      <div className="absolute -top-20 -left-20 w-52 h-52 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header & Controls */}
      <div className="flex items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-purple-50 relative z-10">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight font-heading bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-900 bg-clip-text text-transparent">
            Revenue Analytics
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-400 font-sans">
            Real-time financial performance overview
          </p>
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Chart View Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setChartDropdownOpen(!chartDropdownOpen);
                setPeriodDropdownOpen(false);
              }}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-purple-150 bg-white hover:bg-purple-50/60 text-[11px] sm:text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <span>
                {chartView === 'radial' && 'Radial Chart'}
                {chartView === 'bar' && 'Bar Chart'}
                {chartView === 'line' && 'Line Chart'}
              </span>
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-600" />
            </button>

            {chartDropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 rounded-2xl bg-white border border-purple-100 shadow-xl p-1 z-40 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => handleChartSelect('radial')}
                  className={clsx(
                    'w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-xl transition-colors cursor-pointer font-medium',
                    chartView === 'radial' ? 'bg-purple-50 text-purple-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <PieChart className="w-3.5 h-3.5 text-purple-600" />
                  Radial Chart
                </button>
                <button
                  type="button"
                  onClick={() => handleChartSelect('bar')}
                  className={clsx(
                    'w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-xl transition-colors cursor-pointer font-medium',
                    chartView === 'bar' ? 'bg-purple-50 text-purple-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
                  Bar Chart
                </button>
                <button
                  type="button"
                  onClick={() => handleChartSelect('line')}
                  className={clsx(
                    'w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-xl transition-colors cursor-pointer font-medium',
                    chartView === 'line' ? 'bg-purple-50 text-purple-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <LineChartIcon className="w-3.5 h-3.5 text-purple-600" />
                  Line Chart
                </button>
              </div>
            )}
          </div>

          {/* Time Period Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setPeriodDropdownOpen(!periodDropdownOpen);
                setChartDropdownOpen(false);
              }}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-purple-150 bg-white hover:bg-purple-50/60 text-[11px] sm:text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <span>{periodLabels[timePeriod]}</span>
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-600" />
            </button>

            {periodDropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 rounded-2xl bg-white border border-purple-100 shadow-xl p-1 z-40 animate-in fade-in zoom-in-95">
                {(['today', '7d', '30d', 'year'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePeriodSelect(p)}
                    className={clsx(
                      'w-full text-left px-3 py-1.5 text-xs rounded-xl transition-colors cursor-pointer font-medium',
                      timePeriod === p ? 'bg-purple-50 text-purple-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {periodLabels[p]}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 2. Top Row: 3 Side-by-Side Highlight Cards (Compact & Mobile-Optimized) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3.5 my-3 sm:my-4 relative z-10">
        
        {/* Card 1: NET REVENUE */}
        <div className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border border-sky-100 bg-gradient-to-b from-sky-50/40 to-white shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] sm:text-[11px] font-extrabold text-[#0284c7] uppercase tracking-wider font-heading truncate">
              Net Revenue
            </span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[8px] sm:text-[10px] font-bold font-mono shrink-0">
              {config.netRevenueChange}%
            </span>
          </div>
          <div className="my-1 sm:my-2">
            <p className="text-sm sm:text-xl md:text-2xl font-extrabold text-[#0284c7] font-mono tabular-nums leading-none truncate">
              {formatCurrency(config.netRevenue)}
            </p>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[11px] text-rose-500 font-sans truncate">
            <TrendingDown className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">Decrease</span>
          </div>
        </div>

        {/* Card 2: IB COMMISSION */}
        <div className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border border-amber-100 bg-gradient-to-b from-amber-50/40 to-white shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] sm:text-[11px] font-extrabold text-amber-700 uppercase tracking-wider font-heading truncate">
              IB Commission
            </span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100/70 text-amber-800 border border-amber-200 text-[8px] sm:text-[10px] font-bold font-sans shrink-0">
              Total
            </span>
          </div>
          <div className="my-1 sm:my-2">
            <p className="text-sm sm:text-xl md:text-2xl font-extrabold text-amber-600 font-mono tabular-nums leading-none truncate">
              {formatCurrency(config.ibCommission)}
            </p>
          </div>
          <p className="text-[8px] sm:text-[11px] text-slate-400 font-sans truncate">
            Earnings
          </p>
        </div>

        {/* Card 3: IB TRADING VOLUME */}
        <div className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border border-purple-200 bg-gradient-to-b from-purple-100/30 via-purple-50/20 to-white shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] sm:text-[11px] font-extrabold text-purple-800 uppercase tracking-wider font-heading truncate">
              IB Volume
            </span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 border border-purple-200 text-[8px] sm:text-[10px] font-bold font-sans shrink-0">
              Total
            </span>
          </div>
          <div className="my-1 sm:my-2">
            <p className="text-sm sm:text-xl md:text-2xl font-extrabold text-purple-700 font-mono tabular-nums leading-none truncate">
              {formatCurrency(config.ibTradingVolume, 3)}
            </p>
          </div>
          <p className="text-[8px] sm:text-[11px] text-slate-500 font-sans truncate">
            Trading volume
          </p>
        </div>
      </div>

      {/* 3. The 3 Distinct Chart Views */}

      {/* CHART 1: RADIAL CHART (Compact 3 Cards Side-by-Side) */}
      {chartView === 'radial' && (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3.5 pt-1 relative z-10">
          
          {/* Card 1: Deposits */}
          <div className="p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 bg-white hover:border-emerald-200 transition-all flex flex-col justify-between text-center sm:text-left">
            <div>
              <h4 className="text-xs sm:text-base font-bold text-slate-900 font-heading">Deposits</h4>
              <p className="text-[8px] sm:text-[11px] text-slate-400 font-sans hidden sm:block">
                Overview for {periodLabels[timePeriod]}
              </p>
            </div>

            <CompactRadialGauge
              value={formatCurrency(config.depositsAmount)}
              sublabel="Total"
              sublabelColor="text-emerald-600"
              percentage={config.depositsAmount > 0 ? 70 : 15}
              gradientId="grad-dep-compact"
              startColor="#10b981"
              endColor="#059669"
            />

            <div className="pt-1.5 border-t border-slate-100">
              <div className="flex items-center justify-center sm:justify-start gap-0.5 text-[8px] sm:text-xs font-bold text-rose-500 font-sans">
                <span className="truncate">Down {Math.abs(config.depositsTrend)}%</span>
                <TrendingDown className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0" />
              </div>
              <p className="text-[9px] text-slate-400 font-sans mt-0.5 hidden sm:block">
                Deposit performance
              </p>
            </div>
          </div>

          {/* Card 2: Withdrawals */}
          <div className="p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 bg-white hover:border-rose-200 transition-all flex flex-col justify-between text-center sm:text-left">
            <div>
              <h4 className="text-xs sm:text-base font-bold text-slate-900 font-heading">Withdrawals</h4>
              <p className="text-[8px] sm:text-[11px] text-slate-400 font-sans hidden sm:block">
                Overview for {periodLabels[timePeriod]}
              </p>
            </div>

            <CompactRadialGauge
              value={formatCurrency(config.withdrawalsAmount)}
              sublabel="Total"
              sublabelColor="text-rose-500"
              percentage={config.withdrawalsAmount > 0 ? 40 : 12}
              gradientId="grad-wdr-compact"
              startColor="#f43f5e"
              endColor="#e11d48"
            />

            <div className="pt-1.5 border-t border-slate-100">
              <div className="flex items-center justify-center sm:justify-start gap-0.5 text-[8px] sm:text-xs font-bold text-emerald-600 font-sans">
                <span className="truncate">Down {Math.abs(config.withdrawalsTrend)}%</span>
                <TrendingDown className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0" />
              </div>
              <p className="text-[9px] text-slate-400 font-sans mt-0.5 hidden sm:block">
                Withdrawal trends
              </p>
            </div>
          </div>

          {/* Card 3: Net Revenue */}
          <div className="p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 bg-white hover:border-purple-200 transition-all flex flex-col justify-between text-center sm:text-left">
            <div>
              <h4 className="text-xs sm:text-base font-bold text-slate-900 font-heading">Net Revenue</h4>
              <p className="text-[8px] sm:text-[11px] text-slate-400 font-sans hidden sm:block">
                Overview for {periodLabels[timePeriod]}
              </p>
            </div>

            <CompactRadialGauge
              value={formatCurrency(config.netRevenue)}
              sublabel="Total"
              sublabelColor="text-purple-600"
              percentage={config.netRevenue > 0 ? 55 : 10}
              gradientId="grad-rev-compact"
              startColor="#8b5cf6"
              endColor="#6d28d9"
            />

            <div className="pt-1.5 border-t border-slate-100">
              <div className="flex items-center justify-center sm:justify-start gap-0.5 text-[8px] sm:text-xs font-bold text-rose-500 font-sans">
                <span className="truncate">Down {Math.abs(config.netRevenueChange)}%</span>
                <TrendingDown className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0" />
              </div>
              <p className="text-[9px] text-slate-400 font-sans mt-0.5 hidden sm:block">
                Net revenue
              </p>
            </div>
          </div>

        </div>
      )}

      {/* CHART 2: BAR CHART (Exact Match with Reference Screenshot) */}
      {chartView === 'bar' && (
        <div className="rounded-2xl border border-slate-150 bg-white p-3 sm:p-5 shadow-2xs relative z-10 flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
              Bar Chart
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-sans">
              Weekly breakdown - {periodLabels[timePeriod]}
            </p>
          </div>

          {/* SVG Grouped Bar Chart */}
          <div className="relative w-full h-44 sm:h-52">
            <svg viewBox="0 0 540 180" className="w-full h-full overflow-visible">
              {/* Y-Axis Grid Lines & Labels */}
              {[4, 3, 2, 1, 0].map((val, idx) => {
                const y = 20 + idx * 32;
                return (
                  <g key={val}>
                    <text x="12" y={y + 4} className="text-[10px] font-mono fill-slate-400" textAnchor="end">
                      {val}
                    </text>
                    <line
                      x1="22"
                      y1={y}
                      x2="530"
                      y2={y}
                      stroke="#f1f5f9"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    />
                  </g>
                );
              })}

              {/* Grouped Bars per Week */}
              {weeklyData.map((item, idx) => {
                const groupX = 60 + idx * 115;
                const maxVal = 40000;
                const chartBottom = 148;
                const maxBarH = 120;

                const depH = (item.deposits / maxVal) * maxBarH;
                const wdrH = (item.withdrawals / maxVal) * maxBarH;
                const revH = (item.revenue / maxVal) * maxBarH;

                return (
                  <g 
                    key={item.label}
                    onMouseEnter={() => setHoveredDataPoint(item)}
                    onMouseLeave={() => setHoveredDataPoint(null)}
                    className="cursor-pointer group"
                  >
                    {/* Deposits Bar (Green) */}
                    <rect
                      x={groupX}
                      y={chartBottom - depH}
                      width="14"
                      height={depH}
                      rx="3"
                      fill="#10b981"
                      className="transition-all duration-300 group-hover:opacity-90 group-hover:scale-y-105 origin-bottom"
                    />

                    {/* Withdrawals Bar (Pink/Red) */}
                    <rect
                      x={groupX + 18}
                      y={chartBottom - wdrH}
                      width="14"
                      height={wdrH}
                      rx="3"
                      fill="#f43f5e"
                      className="transition-all duration-300 group-hover:opacity-90 group-hover:scale-y-105 origin-bottom"
                    />

                    {/* Revenue Bar (Blue/Purple) */}
                    <rect
                      x={groupX + 36}
                      y={chartBottom - revH}
                      width="14"
                      height={revH}
                      rx="3"
                      fill="#6366f1"
                      className="transition-all duration-300 group-hover:opacity-90 group-hover:scale-y-105 origin-bottom"
                    />

                    {/* X-Axis Week Label */}
                    <text
                      x={groupX + 25}
                      y={chartBottom + 16}
                      textAnchor="middle"
                      className="text-[10px] font-sans font-medium fill-slate-500"
                    >
                      {item.label}
                    </text>
                  </g>
                );
              })}

              {/* X-Axis Baseline */}
              <line x1="22" y1="148" x2="530" y2="148" stroke="#cbd5e1" strokeWidth="1" />
            </svg>

            {/* Hover Tooltip */}
            {hoveredDataPoint && (
              <div className="absolute top-2 right-4 bg-slate-900/90 text-white px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-xs text-xs font-mono z-20 animate-in fade-in">
                <span className="font-bold text-slate-300 mr-2">{hoveredDataPoint.label}:</span>
                <span className="text-emerald-400 mr-2">Dep: {formatCurrency(hoveredDataPoint.deposits)}</span>
                <span className="text-rose-400 mr-2">Wdr: {formatCurrency(hoveredDataPoint.withdrawals)}</span>
                <span className="text-indigo-400">Rev: {formatCurrency(hoveredDataPoint.revenue)}</span>
              </div>
            )}
          </div>

          {/* Bottom Legend Matching Reference Screenshot */}
          <div className="flex items-center justify-center gap-5 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <span className="w-3.5 h-1.5 rounded-full bg-emerald-500" />
              <span>deposits</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <span className="w-3.5 h-1.5 rounded-full bg-rose-500" />
              <span>withdrawals</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <span className="w-3.5 h-1.5 rounded-full bg-indigo-500" />
              <span>revenue</span>
            </div>
          </div>
        </div>
      )}

      {/* CHART 3: LINE CHART (Interactive Multi-Line Splines) */}
      {chartView === 'line' && (
        <div className="rounded-2xl border border-slate-150 bg-white p-3 sm:p-5 shadow-2xs relative z-10 flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
              Line Chart
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-sans">
              Trend progression - {periodLabels[timePeriod]}
            </p>
          </div>

          {/* SVG Spline Line Chart */}
          <div className="relative w-full h-44 sm:h-52">
            <svg viewBox="0 0 540 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="area-dep" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="area-rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[4, 3, 2, 1, 0].map((val, idx) => {
                const y = 20 + idx * 32;
                return (
                  <g key={val}>
                    <text x="12" y={y + 4} className="text-[10px] font-mono fill-slate-400" textAnchor="end">
                      {val}
                    </text>
                    <line
                      x1="22"
                      y1={y}
                      x2="530"
                      y2={y}
                      stroke="#f1f5f9"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    />
                  </g>
                );
              })}

              {/* Splines with smooth bezier curves */}
              {/* Deposits Area & Line */}
              <path
                d="M 60,94 C 150,52 260,76 350,50 C 420,30 480,24 500,22 L 500,148 L 60,148 Z"
                fill="url(#area-dep)"
              />
              <path
                d="M 60,94 C 150,52 260,76 350,50 C 420,30 480,24 500,22"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Revenue Area & Line */}
              <path
                d="M 60,108 C 150,76 260,94 350,64 C 420,44 480,36 500,34 L 500,148 L 60,148 Z"
                fill="url(#area-rev)"
              />
              <path
                d="M 60,108 C 150,76 260,94 350,64 C 420,44 480,36 500,34"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Withdrawals Line */}
              <path
                d="M 60,134 C 150,123 260,130 350,115 C 420,105 480,95 500,92"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data Nodes */}
              {[
                { x: 60, dep: 94, wdr: 134, rev: 108, item: weeklyData[0] },
                { x: 200, dep: 60, wdr: 125, rev: 80, item: weeklyData[1] },
                { x: 350, dep: 74, wdr: 120, rev: 88, item: weeklyData[2] },
                { x: 500, dep: 22, wdr: 92, rev: 34, item: weeklyData[3] },
              ].map((pt, i) => (
                <g 
                  key={i}
                  onMouseEnter={() => setHoveredDataPoint(pt.item)}
                  onMouseLeave={() => setHoveredDataPoint(null)}
                  className="cursor-pointer"
                >
                  <circle cx={pt.x} cy={pt.dep} r="4" fill="#10b981" stroke="#fff" strokeWidth="2" />
                  <circle cx={pt.x} cy={pt.rev} r="4" fill="#6366f1" stroke="#fff" strokeWidth="2" />
                  <circle cx={pt.x} cy={pt.wdr} r="4" fill="#f43f5e" stroke="#fff" strokeWidth="2" />
                  <text x={pt.x} y="164" textAnchor="middle" className="text-[10px] font-sans font-medium fill-slate-500">
                    W{i + 1}
                  </text>
                </g>
              ))}

              {/* X-Axis Baseline */}
              <line x1="22" y1="148" x2="530" y2="148" stroke="#cbd5e1" strokeWidth="1" />
            </svg>

            {/* Hover Tooltip */}
            {hoveredDataPoint && (
              <div className="absolute top-2 right-4 bg-slate-900/90 text-white px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-xs text-xs font-mono z-20 animate-in fade-in">
                <span className="font-bold text-slate-300 mr-2">{hoveredDataPoint.label}:</span>
                <span className="text-emerald-400 mr-2">Dep: {formatCurrency(hoveredDataPoint.deposits)}</span>
                <span className="text-rose-400 mr-2">Wdr: {formatCurrency(hoveredDataPoint.withdrawals)}</span>
                <span className="text-indigo-400">Rev: {formatCurrency(hoveredDataPoint.revenue)}</span>
              </div>
            )}
          </div>

          {/* Bottom Legend */}
          <div className="flex items-center justify-center gap-5 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <span className="w-3.5 h-1.5 rounded-full bg-emerald-500" />
              <span>deposits</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <span className="w-3.5 h-1.5 rounded-full bg-rose-500" />
              <span>withdrawals</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <span className="w-3.5 h-1.5 rounded-full bg-indigo-500" />
              <span>revenue</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
