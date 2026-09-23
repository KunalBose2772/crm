'use client';

import React, { useState } from 'react';
import { 
  BarChart2, 
  RotateCw, 
  Calendar, 
  DollarSign, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { clsx } from 'clsx';
import { TodaysPerformanceConfig } from '@/types/crm';
import { initialTodaysPerformance } from '@/services/api/dashboardAnalytics';

export interface TodaysPerformanceSectionProps {
  data?: Partial<TodaysPerformanceConfig>;
  onRefresh?: () => Promise<void> | void;
  className?: string;
}

export const TodaysPerformanceSection: React.FC<TodaysPerformanceSectionProps> = ({
  data,
  onRefresh,
  className,
}) => {
  const config: TodaysPerformanceConfig = {
    ...initialTodaysPerformance,
    ...data,
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await new Promise((res) => setTimeout(res, 600));
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (val: number, decimals = 0) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(val);
  };

  // Royal Purple KPI Card Component matching Image 3 with mobile optimization
  const RoyalPurpleKPICard: React.FC<{
    title: string;
    value: string;
    change: number;
    changePeriod: string;
    icon: React.ReactNode;
    isPositive?: boolean;
  }> = ({ title, value, change, changePeriod, icon, isPositive = true }) => {
    return (
      <div className="relative group overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#7e22ce] via-[#6b21a8] to-[#581c87] p-3.5 sm:p-5 text-white border border-purple-400/25 shadow-xs hover:shadow-md transition-all duration-200 select-none">
        {/* Subtle ambient light */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

        {/* Top row: Label + White Circle Badge with Purple Icon */}
        <div className="flex items-start justify-between relative z-10 gap-2">
          <span className="text-[10px] sm:text-xs font-bold text-purple-100 uppercase tracking-wider font-heading leading-tight line-clamp-2">
            {title}
          </span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-[#6b21a8] shadow-xs flex items-center justify-center shrink-0">
            {icon}
          </div>
        </div>

        {/* Main value */}
        <div className="mt-2.5 sm:mt-4 relative z-10">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums leading-none truncate">
            {value}
          </h3>
        </div>

        {/* Footer / Trend Badge */}
        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3.5 border-t border-purple-400/25 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs relative z-10">
          <span
            className={clsx(
              'inline-flex items-center gap-0.5 sm:gap-1 font-bold px-2 py-0.5 rounded-full text-[9px] sm:text-xs shadow-2xs font-mono tabular-nums shrink-0',
              isPositive ? 'bg-[#10b981] text-white' : 'bg-[#ef4444] text-white'
            )}
          >
            {isPositive ? <ArrowUpRight className="w-3 h-3 stroke-[2.5]" /> : <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />}
            {Math.abs(change)}%
          </span>
          <span className="text-purple-100 text-[10px] sm:text-xs font-medium font-sans truncate">
            {changePeriod}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={clsx(
      "rounded-2xl sm:rounded-3xl border border-purple-150/90 bg-white p-3.5 sm:p-5 md:p-6 shadow-xs relative overflow-hidden transition-all",
      className
    )}>
      {/* 1. Header matching Image 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-purple-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-2xs">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight font-heading bg-gradient-to-r from-purple-800 to-indigo-700 bg-clip-text text-transparent">
              Today's Performance
            </h2>
            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-400 font-sans mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{config.dateLabel || 'Wednesday, September 23, 2026'}</span>
            </div>
          </div>
        </div>

        {/* Right side: Last Updated + Refresh */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-[11px] sm:text-xs text-slate-400 font-sans">
            Last updated <span className="font-semibold text-slate-600 font-mono">{config.lastUpdated || '01:58 PM'}</span>
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh Today's Performance"
            className="p-1.5 sm:p-2 rounded-xl border border-purple-150 bg-purple-50/60 hover:bg-purple-100 text-purple-700 transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
          >
            <RotateCw className={clsx(
              "w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-700 transition-transform duration-500",
              isRefreshing && "animate-spin"
            )} />
          </button>
        </div>
      </div>

      {/* 2. Main KPI Stats Grid: Royal Purple Cards from Image 3 (2 cols mobile, 4 cols desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 my-3 sm:my-4">
        <RoyalPurpleKPICard
          title="TOTAL NET DEPOSITS"
          value={formatCurrency(config.totalNetDeposits)}
          change={config.totalNetDepositsChange ?? 18.4}
          changePeriod="vs last month"
          icon={<DollarSign className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />}
          isPositive={true}
        />

        <RoyalPurpleKPICard
          title="GROSS INFLOWS (DEPOSITS)"
          value={formatCurrency(config.grossInflows)}
          change={config.grossInflowsChange ?? 14.2}
          changePeriod="30-day volume"
          icon={<ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />}
          isPositive={true}
        />

        <RoyalPurpleKPICard
          title="GROSS OUTFLOWS (WITHDRAWALS)"
          value={formatCurrency(config.grossOutflows)}
          change={config.grossOutflowsChange ?? -4.2}
          changePeriod="vs last month"
          icon={<ArrowUpFromLine className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />}
          isPositive={false}
        />

        <RoyalPurpleKPICard
          title="TOTAL REGISTERED CLIENTS"
          value={config.totalRegisteredClients.toLocaleString()}
          change={config.totalRegisteredClientsChange ?? 8.7}
          changePeriod="new clients this month"
          icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />}
          isPositive={true}
        />
      </div>

      {/* 3. Bottom Net Flow Today Summary Bar matching Image 1 */}
      <div className="p-3 sm:p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left: Net Flow Today */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 font-sans block">
              Net Flow Today
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tabular-nums leading-tight">
                {formatCurrency(config.netFlowToday || 0)}
              </span>
              <span className="text-[11px] text-slate-400 font-sans">
                Deposits <span className="font-bold text-slate-700">exceed</span> withdrawals
              </span>
            </div>
          </div>
        </div>

        {/* Right: 3 Metric Badges */}
        <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
          <div className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-center shadow-2xs">
            <span className="text-[10px] font-medium text-slate-400 block font-sans">Deposit Rate</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-600 font-mono tabular-nums">{config.depositRate || 0}%</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-center shadow-2xs">
            <span className="text-[10px] font-medium text-slate-400 block font-sans">Withdrawal Rate</span>
            <span className="text-xs sm:text-sm font-bold text-rose-500 font-mono tabular-nums">{config.withdrawalRate || 0}%</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-center shadow-2xs">
            <span className="text-[10px] font-medium text-slate-400 block font-sans">Avg Deposit</span>
            <span className="text-xs sm:text-sm font-bold text-purple-700 font-mono tabular-nums">{formatCurrency(config.avgDeposit || 0)}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
