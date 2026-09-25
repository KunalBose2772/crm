'use client';

import React, { useState } from 'react';
import { 
  RotateCw, 
  Layers, 
  Users, 
  PieChart as PieIcon, 
  Disc,
  Sparkles
} from 'lucide-react';
import { clsx } from 'clsx';
import { AccountDistributionConfig, AccountCategoryItem } from '@/types/crm';
import { initialAccountDistribution } from '@/services/api/dashboardAnalytics';

export interface AccountDistributionSectionProps {
  data?: Partial<AccountDistributionConfig>;
  onRefresh?: () => Promise<void> | void;
  className?: string;
}

export const AccountDistributionSection: React.FC<AccountDistributionSectionProps> = ({
  data,
  onRefresh,
  className,
}) => {
  // Merge prop data with initial configuration
  const config: AccountDistributionConfig = {
    ...initialAccountDistribution,
    ...data,
  };

  const categories = config.categories || initialAccountDistribution.categories;
  const totalAccounts = typeof config.totalAccountsCount === 'number' 
    ? config.totalAccountsCount 
    : categories.reduce((sum, c) => sum + c.count, 0);
  const totalAccountTypes = typeof config.totalAccountTypes === 'number'
    ? config.totalAccountTypes
    : categories.length;

  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartMode, setChartMode] = useState<'donut' | 'radial'>('donut');

  const handleRefreshClick = async () => {
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

  // Color gradient definitions for each account tier
  const categoryGradients: Record<string, { start: string; end: string; textClass: string; bgClass: string }> = {
    basic: { start: '#3b82f6', end: '#1d4ed8', textClass: 'text-blue-600', bgClass: 'bg-blue-500' },
    standard: { start: '#10b981', end: '#047857', textClass: 'text-emerald-600', bgClass: 'bg-emerald-500' },
    vvip: { start: '#f59e0b', end: '#b45309', textClass: 'text-amber-600', bgClass: 'bg-amber-500' },
    type_300: { start: '#ef4444', end: '#b91c1c', textClass: 'text-rose-600', bgClass: 'bg-rose-500' },
    type_200: { start: '#8b5cf6', end: '#6d28d9', textClass: 'text-purple-600', bgClass: 'bg-purple-500' },
    type_100: { start: '#ec4899', end: '#be185d', textClass: 'text-pink-600', bgClass: 'bg-pink-500' },
  };

  // Calculations for Modern Donut Chart
  const donutRadius = 78;
  const donutStrokeWidth = 18;
  const donutCircumference = 2 * Math.PI * donutRadius;

  let cumulativePercent = 0;
  const donutSegments = categories.map((cat) => {
    const pct = totalAccounts > 0 ? cat.count / totalAccounts : 0;
    const strokeDash = pct * donutCircumference;
    const gap = 3; // subtle spacing between slices
    const dashArray = `${Math.max(0, strokeDash - gap)} ${donutCircumference}`;
    const dashOffset = -cumulativePercent * donutCircumference;
    cumulativePercent += pct;

    return {
      ...cat,
      percentage: pct * 100,
      dashArray,
      dashOffset,
    };
  });

  // Concentric Radial Arcs configuration
  const radialRingConfigs = [
    { id: 'basic', radius: 46, strokeWidth: 7 },
    { id: 'standard', radius: 57, strokeWidth: 7 },
    { id: 'vvip', radius: 68, strokeWidth: 7 },
    { id: 'type_300', radius: 79, strokeWidth: 7 },
    { id: 'type_200', radius: 90, strokeWidth: 7 },
    { id: 'type_100', radius: 101, strokeWidth: 7 },
  ];

  const activeCategory = hoveredCategoryId
    ? categories.find((c) => c.id === hoveredCategoryId)
    : null;

  return (
    <div className={clsx(
      "rounded-2xl sm:rounded-3xl border border-purple-100/90 bg-white p-3.5 sm:p-5 md:p-6 shadow-xs flex flex-col justify-between h-full relative overflow-hidden transition-all hover:border-purple-200 select-none",
      className
    )}>
      {/* Ambient Purple Background Flare */}
      <div className="absolute -top-20 -right-20 w-52 h-52 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header with Consistent Purple Branding */}
      <div className="flex items-start justify-between pb-2.5 sm:pb-3.5 border-b border-purple-50 relative z-10">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-purple-700 font-heading">
              Allocation Suite
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight font-heading leading-tight bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-800 bg-clip-text text-transparent">
            Account Distribution
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-400 font-sans mt-0.5">
            {config.periodLabel || 'September 2026'} • Active Trader Segments
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Chart View Toggle (Donut vs Radial) */}
          <button
            type="button"
            onClick={() => setChartMode(chartMode === 'donut' ? 'radial' : 'donut')}
            title={chartMode === 'donut' ? 'Switch to Radial Arcs' : 'Switch to Donut Ring'}
            className="p-1.5 sm:p-2 rounded-xl border border-purple-150 bg-white hover:bg-purple-50 text-purple-700 transition-all cursor-pointer shadow-2xs group"
          >
            {chartMode === 'donut' ? (
              <Disc className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 group-hover:scale-110 transition-transform" />
            ) : (
              <PieIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 group-hover:scale-110 transition-transform" />
            )}
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            title="Synchronize account distribution"
            className="p-1.5 sm:p-2 rounded-xl border border-purple-150 bg-purple-50/60 hover:bg-purple-100 text-purple-700 transition-all cursor-pointer shadow-2xs group active:scale-95 disabled:opacity-50"
          >
            <RotateCw className={clsx(
              "w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-700 group-hover:rotate-180 transition-transform duration-500",
              isRefreshing && "animate-spin"
            )} />
          </button>
        </div>
      </div>

      {/* 2. Interactive Modern Chart Centerpiece */}
      <div className="relative flex items-center justify-center py-2 sm:py-4 my-auto">
        {chartMode === 'donut' ? (
          /* MODERN DONUT CHART VIEW */
          <div className="relative">
            <svg 
              viewBox="0 0 220 220" 
              className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 transform -rotate-90 filter drop-shadow-xs"
            >
              <defs>
                {categories.map((cat) => {
                  const grad = categoryGradients[cat.id] || { start: cat.color, end: cat.color };
                  return (
                    <linearGradient key={`grad-${cat.id}`} id={`donut-grad-${cat.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={grad.start} />
                      <stop offset="100%" stopColor={grad.end} />
                    </linearGradient>
                  );
                })}
              </defs>

              {/* Background Track Circle */}
              <circle
                cx="110"
                cy="110"
                r={donutRadius}
                fill="transparent"
                stroke="#f8fafc"
                strokeWidth={donutStrokeWidth}
              />

              {/* Donut Segments */}
              {donutSegments.map((segment) => {
                const isHovered = hoveredCategoryId === segment.id;
                return (
                  <circle
                    key={segment.id}
                    cx="110"
                    cy="110"
                    r={donutRadius}
                    fill="transparent"
                    stroke={`url(#donut-grad-${segment.id})`}
                    strokeWidth={isHovered ? donutStrokeWidth + 4 : donutStrokeWidth}
                    strokeDasharray={segment.dashArray}
                    strokeDashoffset={segment.dashOffset}
                    strokeLinecap="round"
                    onMouseEnter={() => setHoveredCategoryId(segment.id)}
                    onMouseLeave={() => setHoveredCategoryId(null)}
                    className={clsx(
                      "cursor-pointer transition-all duration-300 ease-out",
                      isHovered ? "opacity-100 filter drop-shadow(0 2px 8px rgba(0,0,0,0.25))" : "opacity-95 hover:opacity-100"
                    )}
                  />
                );
              })}
            </svg>

            {/* Dynamic Center Metric Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
              {activeCategory ? (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider font-heading block" style={{ color: activeCategory.color }}>
                    {activeCategory.name}
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums leading-none">
                    {activeCategory.count}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 font-sans block mt-0.5">
                    {totalAccounts > 0 ? ((activeCategory.count / totalAccounts) * 100).toFixed(1) : '0.0'}% Share
                  </span>
                </div>
              ) : (
                <div className="animate-in fade-in duration-200">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight leading-none">
                    {totalAccounts}
                  </span>
                  <span className="text-[11px] font-bold text-purple-700 font-sans tracking-wide block mt-1">
                    Total Accounts
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 font-sans">
                    6 Active Tiers
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* CONCENTRIC RADIAL ARCS VIEW */
          <div className="relative">
            <svg 
              viewBox="0 0 240 240" 
              className="w-52 h-52 sm:w-56 sm:h-56 transform -rotate-90"
            >
              {radialRingConfigs.map((ring, idx) => {
                const cat = categories[idx] || { id: ring.id, name: 'Tier', count: 0, color: '#94a3b8' };
                const circ = 2 * Math.PI * ring.radius;
                const pct = cat.count / totalAccounts;
                const visualPct = Math.max(0.12, Math.min(pct * 1.55, 0.88));
                const offset = circ * (1 - visualPct);
                const isHovered = hoveredCategoryId === cat.id;

                return (
                  <g 
                    key={ring.id}
                    onMouseEnter={() => setHoveredCategoryId(cat.id)}
                    onMouseLeave={() => setHoveredCategoryId(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx="120"
                      cy="120"
                      r={ring.radius}
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth={ring.strokeWidth}
                    />
                    <circle
                      cx="120"
                      cy="120"
                      r={ring.radius}
                      fill="transparent"
                      stroke={cat.color}
                      strokeWidth={isHovered ? ring.strokeWidth + 2.5 : ring.strokeWidth}
                      strokeDasharray={circ}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">
                {activeCategory ? activeCategory.count : totalAccounts}
              </span>
              <span className="text-[10px] font-bold text-purple-700 uppercase font-sans">
                {activeCategory ? activeCategory.name : 'Accounts'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Perfectly Aligned Enterprise Category Cards (3 Columns for compact layout) */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 my-2 sm:my-3 relative z-10">
        {categories.map((cat) => {
          const isHovered = hoveredCategoryId === cat.id;
          const sharePct = totalAccounts > 0 ? ((cat.count / totalAccounts) * 100).toFixed(1) : '0.0';

          return (
            <div
              key={cat.id}
              onMouseEnter={() => setHoveredCategoryId(cat.id)}
              onMouseLeave={() => setHoveredCategoryId(null)}
              onClick={() => setHoveredCategoryId(hoveredCategoryId === cat.id ? null : cat.id)}
              className={clsx(
                "p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex flex-col justify-between",
                isHovered
                  ? "bg-purple-50/80 border-purple-300 shadow-xs scale-102"
                  : "bg-slate-50/70 border-slate-100 hover:bg-slate-100/80 hover:border-slate-200"
              )}
            >
              {/* Header: Dot + Name and Count */}
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                  <span 
                    className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 transition-transform" 
                    style={{ 
                      backgroundColor: cat.color,
                      transform: isHovered ? 'scale(1.3)' : 'scale(1)'
                    }} 
                  />
                  <span className="text-[10px] sm:text-xs font-bold text-slate-800 truncate font-heading tracking-tight">
                    {cat.name}
                  </span>
                </div>
                <span className="font-mono text-[10px] sm:text-xs font-bold text-slate-900 shrink-0 tabular-nums">
                  {cat.count}
                </span>
              </div>

              {/* Progress Mini Bar */}
              <div className="mt-1.5 flex items-center justify-between gap-1 sm:gap-2">
                <div className="h-1 sm:h-1.5 flex-1 bg-slate-200/70 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.max(8, Number(sharePct))}%`, 
                      backgroundColor: cat.color 
                    }}
                  />
                </div>
                <span className="text-[8px] sm:text-[10px] font-semibold text-slate-500 font-mono tabular-nums shrink-0">
                  {sharePct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Bottom 2 Summary Metric Cards (Amber & Royal Purple CRM Accents) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1.5 relative z-10">
        
        {/* Card 1: Account Types (Amber Gold Accent) */}
        <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/80 to-amber-100/40 flex items-center justify-between shadow-2xs hover:border-amber-300 transition-all">
          <div>
            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-amber-700 font-mono tabular-nums leading-none">
              {totalAccountTypes}
            </p>
            <span className="text-[10px] sm:text-xs font-bold text-amber-800 font-sans block mt-1">
              Account Types
            </span>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-200/70 text-amber-800 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
        </div>

        {/* Card 2: Total Accounts (Royal Purple CRM Accent) */}
        <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-purple-200/80 bg-gradient-to-br from-purple-50/90 to-purple-100/40 flex items-center justify-between shadow-2xs hover:border-purple-300 transition-all">
          <div>
            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-purple-900 font-mono tabular-nums leading-none">
              {totalAccounts}
            </p>
            <span className="text-[10px] sm:text-xs font-bold text-purple-900 font-sans block mt-1">
              Total Accounts
            </span>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-200/70 text-purple-800 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
        </div>

      </div>

    </div>
  );
};
