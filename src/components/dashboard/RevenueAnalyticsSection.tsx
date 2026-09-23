'use client';

import React, { useState } from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  ChevronDown, 
  Calendar,
  Layers,
  BarChart3,
  PieChart,
  DollarSign
} from 'lucide-react';
import { clsx } from 'clsx';
import { RevenueAnalyticsConfig } from '@/types/crm';
import { initialRevenueAnalytics } from '@/services/api/dashboardAnalytics';

export interface RevenueAnalyticsSectionProps {
  data?: Partial<RevenueAnalyticsConfig>;
  onPeriodChange?: (period: 'today' | '7d' | '30d' | 'year') => void;
  onChartViewChange?: (view: 'radial' | 'bar') => void;
  className?: string;
}

export const RevenueAnalyticsSection: React.FC<RevenueAnalyticsSectionProps> = ({
  data,
  onPeriodChange,
  onChartViewChange,
  className,
}) => {
  // Merge prop data with initial default configuration
  const config: RevenueAnalyticsConfig = {
    ...initialRevenueAnalytics,
    ...data,
  };

  const [timePeriod, setTimePeriod] = useState<'today' | '7d' | '30d' | 'year'>(
    config.period || '30d'
  );
  const [chartView, setChartView] = useState<'radial' | 'bar'>(
    config.chartType || 'radial'
  );
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [chartDropdownOpen, setChartDropdownOpen] = useState(false);

  // Period display labels
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

  const handleChartSelect = (v: 'radial' | 'bar') => {
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

  // High-End Radial Gauge Ring Component with Purple Brand Nuances
  const RadialGauge: React.FC<{
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
    const size = 148;
    const strokeWidth = 9;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    // Cap visual arc between 12% and 100% for aesthetic completeness
    const displayPercent = Math.max(12, Math.min(percentage, 100));
    const strokeDashoffset = circumference - (displayPercent / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center my-3.5">
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={startColor} />
              <stop offset="100%" stopColor={endColor} />
            </linearGradient>
          </defs>

          {/* Background track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />

          {/* Active Progress Arc with Gradient */}
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
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Values */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl sm:text-[26px] font-extrabold text-slate-900 font-mono tracking-tight leading-none">
            {value}
          </span>
          <span className={clsx("text-xs font-semibold mt-1.5 font-sans tracking-wide", sublabelColor)}>
            {sublabel}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={clsx(
      "rounded-3xl border border-purple-100/90 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full relative overflow-hidden transition-all hover:border-purple-200",
      className
    )}>
      {/* Subtle Purple Ambient Glow */}
      <div className="absolute -top-20 -left-20 w-56 h-56 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-purple-50 relative z-10">
        <div>
          <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight font-heading bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-900 bg-clip-text text-transparent">
            Revenue Analytics
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Real-time financial performance overview
          </p>
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2">
          
          {/* Chart View Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setChartDropdownOpen(!chartDropdownOpen);
                setPeriodDropdownOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-purple-150 bg-white hover:bg-purple-50/60 hover:border-purple-300 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <span>{chartView === 'radial' ? 'Radial Chart' : 'Bar Chart'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-purple-500" />
            </button>

            {chartDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-36 rounded-2xl bg-white border border-purple-100 shadow-xl p-1.5 z-30 animate-in fade-in zoom-in-95">
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-purple-150 bg-white hover:bg-purple-50/60 hover:border-purple-300 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <span>{periodLabels[timePeriod]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-purple-500" />
            </button>

            {periodDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-36 rounded-2xl bg-white border border-purple-100 shadow-xl p-1.5 z-30 animate-in fade-in zoom-in-95">
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

      {/* 2. Top Row: 3 Highlight Metric Cards with Royal Purple CRM Consistency */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-5 relative z-10">
        
        {/* Card 1: NET REVENUE */}
        <div className="p-4 rounded-2xl border border-sky-100 bg-gradient-to-b from-sky-50/40 to-white shadow-2xs flex flex-col justify-between hover:border-sky-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#0284c7] uppercase tracking-wider font-heading">
              Net Revenue
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold font-mono">
              {config.netRevenueChange > 0 ? `+${config.netRevenueChange}%` : `${config.netRevenueChange}%`}
            </span>
          </div>
          <div className="my-2">
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0284c7] font-mono tabular-nums leading-none">
              {formatCurrency(config.netRevenue)}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-rose-500 font-sans">
            <TrendingDown className="w-3.5 h-3.5 shrink-0" />
            <span>Decrease from last period</span>
          </div>
        </div>

        {/* Card 2: IB COMMISSION */}
        <div className="p-4 rounded-2xl border border-amber-100 bg-gradient-to-b from-amber-50/40 to-white shadow-2xs flex flex-col justify-between hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider font-heading">
              IB Commission
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100/70 text-amber-800 border border-amber-200 text-[10px] font-bold font-sans">
              Total
            </span>
          </div>
          <div className="my-2">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono tabular-nums leading-none">
              {formatCurrency(config.ibCommission)}
            </p>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Commission earnings for the period
          </p>
        </div>

        {/* Card 3: IB TRADING VOLUME */}
        <div className="p-4 rounded-2xl border border-purple-200 bg-gradient-to-b from-purple-100/30 via-purple-50/20 to-white shadow-2xs flex flex-col justify-between hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-purple-800 uppercase tracking-wider font-heading">
              IB Trading Volume
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold font-sans">
              Total
            </span>
          </div>
          <div className="my-2">
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-700 font-mono tabular-nums leading-none truncate">
              {formatCurrency(config.ibTradingVolume, 3)}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 font-sans">
            Total trading volume for the period
          </p>
        </div>
      </div>

      {/* 3. Bottom Row: 3 Radial Gauge Cards */}
      {chartView === 'radial' ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 relative z-10">
          
          {/* Gauge 1: Deposits */}
          <div className="p-4 sm:p-5 rounded-3xl border border-slate-100 bg-white hover:border-emerald-200 hover:shadow-xs transition-all flex flex-col justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-900 font-heading">Deposits</h4>
              <p className="text-[11px] text-slate-400 font-sans">Overview for {periodLabels[timePeriod]}</p>
            </div>

            <RadialGauge
              value={formatCurrency(config.depositsAmount)}
              sublabel="Total"
              sublabelColor="text-emerald-600"
              percentage={config.depositsAmount > 0 ? 70 : 15}
              gradientId="grad-deposits"
              startColor="#10b981"
              endColor="#059669"
              trackColor="#f1f5f9"
            />

            <div className="pt-2 border-t border-slate-100 text-left">
              <div className="flex items-center gap-1 text-xs font-bold text-rose-500 font-sans">
                <span>Trending down by {Math.abs(config.depositsTrend)}%</span>
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Deposit performance
              </p>
            </div>
          </div>

          {/* Gauge 2: Withdrawals */}
          <div className="p-4 sm:p-5 rounded-3xl border border-slate-100 bg-white hover:border-rose-200 hover:shadow-xs transition-all flex flex-col justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-900 font-heading">Withdrawals</h4>
              <p className="text-[11px] text-slate-400 font-sans">Overview for {periodLabels[timePeriod]}</p>
            </div>

            <RadialGauge
              value={formatCurrency(config.withdrawalsAmount)}
              sublabel="Total"
              sublabelColor="text-rose-500"
              percentage={config.withdrawalsAmount > 0 ? 40 : 12}
              gradientId="grad-withdrawals"
              startColor="#f43f5e"
              endColor="#e11d48"
              trackColor="#f1f5f9"
            />

            <div className="pt-2 border-t border-slate-100 text-left">
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 font-sans">
                <span>Trending down by {Math.abs(config.withdrawalsTrend)}%</span>
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Withdrawal trends
              </p>
            </div>
          </div>

          {/* Gauge 3: Net Revenue (Royal Purple/Blue Accent) */}
          <div className="p-4 sm:p-5 rounded-3xl border border-slate-100 bg-white hover:border-purple-200 hover:shadow-xs transition-all flex flex-col justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-900 font-heading">Net Revenue</h4>
              <p className="text-[11px] text-slate-400 font-sans">Overview for {periodLabels[timePeriod]}</p>
            </div>

            <RadialGauge
              value={formatCurrency(config.netRevenue)}
              sublabel="Total"
              sublabelColor="text-purple-600"
              percentage={config.netRevenue > 0 ? 55 : 10}
              gradientId="grad-net-rev"
              startColor="#8b5cf6"
              endColor="#6d28d9"
              trackColor="#f1f5f9"
            />

            <div className="pt-2 border-t border-slate-100 text-left">
              <div className="flex items-center gap-1 text-xs font-bold text-rose-500 font-sans">
                <span>Trending down by {Math.abs(config.netRevenueChange)}%</span>
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Net revenue for selected period
              </p>
            </div>
          </div>

        </div>
      ) : (
        /* Alternative Interactive Bar Breakdown View */
        <div className="p-6 rounded-3xl border border-purple-100 bg-purple-50/30 flex flex-col justify-center items-center my-auto min-h-[220px]">
          <div className="w-full max-w-md space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1 font-sans">
                <span>Deposits</span>
                <span className="font-mono text-emerald-600">{formatCurrency(config.depositsAmount)}</span>
              </div>
              <div className="h-3 w-full bg-slate-200/80 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full w-[15%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1 font-sans">
                <span>Withdrawals</span>
                <span className="font-mono text-rose-500">{formatCurrency(config.withdrawalsAmount)}</span>
              </div>
              <div className="h-3 w-full bg-slate-200/80 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full w-[12%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1 font-sans">
                <span>Net Revenue</span>
                <span className="font-mono text-purple-700">{formatCurrency(config.netRevenue)}</span>
              </div>
              <div className="h-3 w-full bg-slate-200/80 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full w-[10%]" />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
