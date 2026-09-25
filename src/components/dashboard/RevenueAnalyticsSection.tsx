'use client';

import React, { useState } from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  ChevronDown, 
  PieChart,
  BarChart3,
  LineChart as LineChartIcon,
  DollarSign,
  Coins,
  Activity,
  Calendar,
  Check
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

  // Dataset for Bar & Line Charts across periods from live props
  const weeklyData = config.weeklyBreakdown && config.weeklyBreakdown.length > 0
    ? config.weeklyBreakdown
    : [
        { label: 'Week 1', deposits: Math.round(config.depositsAmount * 0.15), withdrawals: Math.round(config.withdrawalsAmount * 0.10), revenue: Math.round(config.netRevenue * 0.15) },
        { label: 'Week 2', deposits: Math.round(config.depositsAmount * 0.25), withdrawals: Math.round(config.withdrawalsAmount * 0.30), revenue: Math.round(config.netRevenue * 0.25) },
        { label: 'Week 3', deposits: Math.round(config.depositsAmount * 0.20), withdrawals: Math.round(config.withdrawalsAmount * 0.20), revenue: Math.round(config.netRevenue * 0.20) },
        { label: 'Week 4', deposits: Math.round(config.depositsAmount * 0.40), withdrawals: Math.round(config.withdrawalsAmount * 0.40), revenue: Math.round(config.netRevenue * 0.40) },
      ];

  // Dynamic max value calculation for responsive Y-axis scaling
  const maxComputedVal = Math.max(
    1000,
    ...weeklyData.flatMap(d => [d.deposits, d.withdrawals, d.revenue])
  );
  // Round up to clean ceiling (e.g. 6000 -> 8000 or nearest 1000/5000)
  const chartCeiling = Math.ceil(maxComputedVal / 1000) * 1000 || 5000;

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
      "rounded-2xl sm:rounded-3xl border border-purple-100/90 bg-white p-4 sm:p-5 md:p-6 shadow-xs flex flex-col justify-between h-full relative select-none transition-all",
      className
    )}>
      {/* Invisible backdrop to instantly dismiss open dropdowns on outside click */}
      {(chartDropdownOpen || periodDropdownOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setChartDropdownOpen(false);
            setPeriodDropdownOpen(false);
          }} 
        />
      )}

      {/* Subtle Purple Ambient Glow */}
      <div className="absolute -top-20 -left-20 w-52 h-52 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header & Beautifully Cooked & Styled Pill Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 sm:pb-4 border-b border-purple-50 relative z-20">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight font-heading bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-900 bg-clip-text text-transparent">
            Revenue Analytics
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-400 font-sans">
            Real-time financial performance overview
          </p>
        </div>

        {/* Cooked Pill Selectors (Not Naked - Styled with Purple Tint, Borders, and Icons) */}
        <div className="flex items-center gap-2 self-start sm:self-auto relative z-50">
          
          {/* Chart View Pill Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setChartDropdownOpen(!chartDropdownOpen);
                setPeriodDropdownOpen(false);
              }}
              className={clsx(
                "inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95",
                chartDropdownOpen 
                  ? "bg-purple-100 border-purple-300 text-purple-900 ring-2 ring-purple-300/40" 
                  : "bg-purple-50/80 hover:bg-purple-100/90 border-purple-200/90 hover:border-purple-300 text-purple-900"
              )}
            >
              {chartView === 'radial' && <PieChart className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
              {chartView === 'bar' && <BarChart3 className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
              {chartView === 'line' && <LineChartIcon className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
              
              <span>
                {chartView === 'radial' && 'Radial Chart'}
                {chartView === 'bar' && 'Bar Chart'}
                {chartView === 'line' && 'Line Chart'}
              </span>
              <ChevronDown className={clsx("w-3.5 h-3.5 text-purple-600 stroke-[2.5] transition-transform duration-200", chartDropdownOpen && "rotate-180")} />
            </button>

            {chartDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl bg-white border border-purple-200/90 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => handleChartSelect('radial')}
                  className={clsx(
                    'w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer font-medium',
                    chartView === 'radial' ? 'bg-purple-50 text-purple-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <PieChart className="w-3.5 h-3.5 text-purple-600" />
                    <span>Radial Chart</span>
                  </div>
                  {chartView === 'radial' && <Check className="w-3.5 h-3.5 text-purple-600 stroke-[3]" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleChartSelect('bar')}
                  className={clsx(
                    'w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer font-medium',
                    chartView === 'bar' ? 'bg-purple-50 text-purple-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Bar Chart</span>
                  </div>
                  {chartView === 'bar' && <Check className="w-3.5 h-3.5 text-purple-600 stroke-[3]" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleChartSelect('line')}
                  className={clsx(
                    'w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer font-medium',
                    chartView === 'line' ? 'bg-purple-50 text-purple-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <LineChartIcon className="w-3.5 h-3.5 text-purple-600" />
                    <span>Line Chart</span>
                  </div>
                  {chartView === 'line' && <Check className="w-3.5 h-3.5 text-purple-600 stroke-[3]" />}
                </button>
              </div>
            )}
          </div>

          {/* Time Period Pill Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setPeriodDropdownOpen(!periodDropdownOpen);
                setChartDropdownOpen(false);
              }}
              className={clsx(
                "inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95",
                periodDropdownOpen 
                  ? "bg-purple-100 border-purple-300 text-purple-900 ring-2 ring-purple-300/40" 
                  : "bg-purple-50/80 hover:bg-purple-100/90 border-purple-200/90 hover:border-purple-300 text-purple-900"
              )}
            >
              <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>{periodLabels[timePeriod]}</span>
              <ChevronDown className={clsx("w-3.5 h-3.5 text-purple-600 stroke-[2.5] transition-transform duration-200", periodDropdownOpen && "rotate-180")} />
            </button>

            {periodDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl bg-white border border-purple-200/90 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                {(['today', '7d', '30d', 'year'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePeriodSelect(p)}
                    className={clsx(
                      'w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer font-medium',
                      timePeriod === p ? 'bg-purple-50 text-purple-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <span>{periodLabels[p]}</span>
                    {timePeriod === p && <Check className="w-3.5 h-3.5 text-purple-600 stroke-[3]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 2. Middle Section: The 3 Distinct Working Chart Views (Spacious clearance above bottom cards) */}
      <div className="my-3 sm:my-4 relative z-10 flex-1 flex flex-col justify-center">

        {/* CHART VIEW 1: RADIAL CHART (Compact 3 Gauges Side-by-Side) */}
        {chartView === 'radial' && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 py-1">
            
            {/* Card 1: Deposits */}
            <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 bg-white hover:border-emerald-200 transition-all flex flex-col justify-between text-center sm:text-left shadow-2xs">
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
            <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 bg-white hover:border-rose-200 transition-all flex flex-col justify-between text-center sm:text-left shadow-2xs">
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
            <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 bg-white hover:border-purple-200 transition-all flex flex-col justify-between text-center sm:text-left shadow-2xs">
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

        {/* CHART VIEW 2: BAR CHART (Grouped Bars with Weekly Breakdown) */}
        {chartView === 'bar' && (
          <div className="rounded-2xl border border-slate-150 bg-white p-3.5 sm:p-5 shadow-2xs relative flex flex-col justify-between">
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
                {[4, 3, 2, 1, 0].map((stepIdx, idx) => {
                  const y = 20 + idx * 32;
                  const labelValue = Math.round((chartCeiling / 4) * stepIdx);
                  const displayLabel = labelValue >= 1000 ? `$${(labelValue / 1000).toFixed(0)}k` : `$${labelValue}`;
                  return (
                    <g key={stepIdx}>
                      <text x="32" y={y + 4} className="text-[10px] font-mono fill-slate-400 font-semibold" textAnchor="end">
                        {displayLabel}
                      </text>
                      <line
                        x1="38"
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
                  const groupX = 75 + idx * 115;
                  const chartBottom = 148;
                  const maxBarH = 120;

                  const depH = Math.min(maxBarH, Math.max(item.deposits > 0 ? 6 : 0, (item.deposits / chartCeiling) * maxBarH));
                  const wdrH = Math.min(maxBarH, Math.max(item.withdrawals > 0 ? 6 : 0, (item.withdrawals / chartCeiling) * maxBarH));
                  const revH = Math.min(maxBarH, Math.max(item.revenue > 0 ? 6 : 0, (item.revenue / chartCeiling) * maxBarH));

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
                        width="16"
                        height={depH}
                        rx="4"
                        fill="#10b981"
                        className="transition-all duration-300 group-hover:opacity-90 group-hover:scale-y-105 origin-bottom shadow-xs"
                      />

                      {/* Withdrawals Bar (Pink/Red) */}
                      <rect
                        x={groupX + 20}
                        y={chartBottom - wdrH}
                        width="16"
                        height={wdrH}
                        rx="4"
                        fill="#f43f5e"
                        className="transition-all duration-300 group-hover:opacity-90 group-hover:scale-y-105 origin-bottom shadow-xs"
                      />

                      {/* Revenue Bar (Blue/Purple) */}
                      <rect
                        x={groupX + 40}
                        y={chartBottom - revH}
                        width="16"
                        height={revH}
                        rx="4"
                        fill="#6366f1"
                        className="transition-all duration-300 group-hover:opacity-90 group-hover:scale-y-105 origin-bottom shadow-xs"
                      />

                      {/* X-Axis Week Label */}
                      <text
                        x={groupX + 28}
                        y={chartBottom + 16}
                        textAnchor="middle"
                        className="text-[10px] font-sans font-bold fill-slate-500 uppercase tracking-wider"
                      >
                        {item.label}
                      </text>
                    </g>
                  );
                })}

                {/* X-Axis Baseline */}
                <line x1="38" y1="148" x2="530" y2="148" stroke="#cbd5e1" strokeWidth="1" />
              </svg>

              {/* Hover Tooltip */}
              {hoveredDataPoint && (
                <div className="absolute top-2 right-4 bg-slate-900/95 text-white px-3.5 py-2 rounded-xl shadow-xl backdrop-blur-xs text-xs font-mono z-20 animate-in fade-in border border-slate-700">
                  <span className="font-bold text-slate-300 mr-2">{hoveredDataPoint.label}:</span>
                  <span className="text-emerald-400 mr-2 font-bold">Dep: {formatCurrency(hoveredDataPoint.deposits)}</span>
                  <span className="text-rose-400 mr-2 font-bold">Wdr: {formatCurrency(hoveredDataPoint.withdrawals)}</span>
                  <span className="text-indigo-400 font-bold">Rev: {formatCurrency(hoveredDataPoint.revenue)}</span>
                </div>
              )}
            </div>

            {/* Bottom Legend Matching Reference */}
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

        {/* CHART VIEW 3: LINE CHART (Interactive Multi-Line Splines) */}
        {chartView === 'line' && (
          <div className="rounded-2xl border border-slate-150 bg-white p-3.5 sm:p-5 shadow-2xs relative flex flex-col justify-between">
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
                  <linearGradient id="area-dep-main" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="area-rev-main" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[4, 3, 2, 1, 0].map((stepIdx, idx) => {
                  const y = 20 + idx * 32;
                  const labelValue = Math.round((chartCeiling / 4) * stepIdx);
                  const displayLabel = labelValue >= 1000 ? `$${(labelValue / 1000).toFixed(0)}k` : `$${labelValue}`;
                  return (
                    <g key={stepIdx}>
                      <text x="32" y={y + 4} className="text-[10px] font-mono fill-slate-400 font-semibold" textAnchor="end">
                        {displayLabel}
                      </text>
                      <line
                        x1="38"
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

                {/* Calculate Dynamic Points for Line Splines */}
                {(() => {
                  const maxBarH = 120;
                  const chartBottom = 148;

                  const points = weeklyData.map((item, i) => {
                    const x = 75 + i * 140;
                    const depY = chartBottom - Math.min(maxBarH, Math.max(item.deposits > 0 ? 6 : 0, (item.deposits / chartCeiling) * maxBarH));
                    const wdrY = chartBottom - Math.min(maxBarH, Math.max(item.withdrawals > 0 ? 6 : 0, (item.withdrawals / chartCeiling) * maxBarH));
                    const revY = chartBottom - Math.min(maxBarH, Math.max(item.revenue > 0 ? 6 : 0, (item.revenue / chartCeiling) * maxBarH));
                    return { x, depY, wdrY, revY, item };
                  });

                  // Generate SVG smooth spline paths
                  const buildPath = (getY: (p: typeof points[0]) => number) => {
                    return points.reduce((acc, p, i, arr) => {
                      if (i === 0) return `M ${p.x},${getY(p)}`;
                      const prev = arr[i - 1];
                      const cpX1 = prev.x + (p.x - prev.x) / 2;
                      const cpX2 = cpX1;
                      return `${acc} C ${cpX1},${getY(prev)} ${cpX2},${getY(p)} ${p.x},${getY(p)}`;
                    }, '');
                  };

                  const depPath = buildPath(p => p.depY);
                  const wdrPath = buildPath(p => p.wdrY);
                  const revPath = buildPath(p => p.revY);

                  const firstX = points[0]?.x || 75;
                  const lastX = points[points.length - 1]?.x || 495;

                  return (
                    <>
                      {/* Deposits Spline Area & Line */}
                      <path
                        d={`${depPath} L ${lastX},148 L ${firstX},148 Z`}
                        fill="url(#area-dep-main)"
                      />
                      <path
                        d={depPath}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      {/* Revenue Spline Area & Line */}
                      <path
                        d={`${revPath} L ${lastX},148 L ${firstX},148 Z`}
                        fill="url(#area-rev-main)"
                      />
                      <path
                        d={revPath}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      {/* Withdrawals Line */}
                      <path
                        d={wdrPath}
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      {/* Data Nodes */}
                      {points.map((pt, i) => (
                        <g 
                          key={i}
                          onMouseEnter={() => setHoveredDataPoint(pt.item)}
                          onMouseLeave={() => setHoveredDataPoint(null)}
                          className="cursor-pointer group"
                        >
                          <circle cx={pt.x} cy={pt.depY} r="4.5" fill="#10b981" stroke="#fff" strokeWidth="2" className="transition-transform group-hover:scale-125" />
                          <circle cx={pt.x} cy={pt.revY} r="4.5" fill="#6366f1" stroke="#fff" strokeWidth="2" className="transition-transform group-hover:scale-125" />
                          <circle cx={pt.x} cy={pt.wdrY} r="4.5" fill="#f43f5e" stroke="#fff" strokeWidth="2" className="transition-transform group-hover:scale-125" />
                          <text x={pt.x} y="164" textAnchor="middle" className="text-[10px] font-sans font-bold fill-slate-500 uppercase tracking-wider">
                            W{i + 1}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}

                {/* X-Axis Baseline */}
                <line x1="38" y1="148" x2="530" y2="148" stroke="#cbd5e1" strokeWidth="1" />
              </svg>

              {/* Hover Tooltip */}
              {hoveredDataPoint && (
                <div className="absolute top-2 right-4 bg-slate-900/95 text-white px-3.5 py-2 rounded-xl shadow-xl backdrop-blur-xs text-xs font-mono z-20 animate-in fade-in border border-slate-700">
                  <span className="font-bold text-slate-300 mr-2">{hoveredDataPoint.label}:</span>
                  <span className="text-emerald-400 mr-2 font-bold">Dep: {formatCurrency(hoveredDataPoint.deposits)}</span>
                  <span className="text-rose-400 mr-2 font-bold">Wdr: {formatCurrency(hoveredDataPoint.withdrawals)}</span>
                  <span className="text-indigo-400 font-bold">Rev: {formatCurrency(hoveredDataPoint.revenue)}</span>
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

      {/* 3. Bottom Row: 3 KPI Cards Styled Exactly Like the Top Pending Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 pt-2 border-t border-purple-50/80 relative z-10">
        
        {/* Card 1: NET REVENUE (Sky Blue Theme with Rounded-2xl Icon Badge & Pill) */}
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-sky-50/80 border border-sky-200/90 flex items-center justify-between shadow-2xs hover:border-sky-300 hover:shadow-xs transition-all">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#0284c7] text-white shadow-xs flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-heading truncate">
                Net Revenue
              </h4>
              <p className="text-base sm:text-xl font-extrabold text-[#0284c7] font-mono tabular-nums leading-tight truncate">
                {formatCurrency(config.netRevenue)}
              </p>
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-rose-500 font-sans mt-0.5 truncate">
                <TrendingDown className="w-3 h-3 shrink-0" />
                <span className="truncate">Decrease</span>
              </div>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-rose-500 text-white font-bold text-[11px] sm:text-xs font-mono shadow-xs shrink-0 ml-2">
            {config.netRevenueChange}%
          </span>
        </div>

        {/* Card 2: IB COMMISSION (Golden Amber Theme with Rounded-2xl Icon Badge & Pill) */}
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-amber-50/80 border border-amber-200/90 flex items-center justify-between shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#d97706] text-white shadow-xs flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-heading truncate">
                IB Commission
              </h4>
              <p className="text-base sm:text-xl font-extrabold text-[#d97706] font-mono tabular-nums leading-tight truncate">
                {formatCurrency(config.ibCommission)}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500 font-sans mt-0.5 truncate">
                Earnings
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-[#d97706] text-white font-bold text-[11px] sm:text-xs font-sans shadow-xs shrink-0 ml-2">
            Total
          </span>
        </div>

        {/* Card 3: IB VOLUME (Royal Purple Theme with Rounded-2xl Icon Badge & Pill) */}
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-purple-50/80 border border-purple-200/90 flex items-center justify-between shadow-2xs hover:border-purple-300 hover:shadow-xs transition-all">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-purple-600 text-white shadow-xs flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-heading truncate">
                IB Volume
              </h4>
              <p className="text-base sm:text-xl font-extrabold text-purple-700 font-mono tabular-nums leading-tight truncate">
                {formatCurrency(config.ibTradingVolume, 3)}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500 font-sans mt-0.5 truncate">
                Trading volume
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-purple-600 text-white font-bold text-[11px] sm:text-xs font-sans shadow-xs shrink-0 ml-2">
            Total
          </span>
        </div>

      </div>

    </div>
  );
};
