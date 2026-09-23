'use client';

import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Clock } from 'lucide-react';

export type LiveKPITheme = 'periwinkle' | 'mint' | 'rose' | 'violet' | 'amber' | 'cyan';

interface LiveKPICardProps {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  theme: LiveKPITheme;
  footerText: string;
  curveType?: 'growth' | 'bullish' | 'wave' | 'pulse' | 'expansion' | 'active';
  hoveredCardId?: string | null;
  onHover?: (id: string | null) => void;
}

// Visual themes matching the user's exact pastel gradient references
const themeStyles: Record<LiveKPITheme, {
  cardBg: string;
  borderColor: string;
  iconBg: string;
  accentBar: string;
  strokeColor: string;
  areaGradStart: string;
  areaGradEnd: string;
  valueText: string;
  titleText: string;
  pillBg: string;
  pillText: string;
  footerText: string;
  liveDotColor: string;
}> = {
  periwinkle: {
    cardBg: 'bg-gradient-to-b from-[#e0e7ff] via-[#eef2ff] to-[#ddd6fe]',
    borderColor: 'border-indigo-200/90',
    iconBg: 'bg-[#4f46e5] text-white shadow-md shadow-indigo-500/35',
    accentBar: 'bg-[#4f46e5]',
    strokeColor: '#4f46e5',
    areaGradStart: '#6366f1',
    areaGradEnd: '#e0e7ff',
    valueText: 'text-[#312e81]',
    titleText: 'text-[#1e1b4b]',
    pillBg: 'bg-white/85 border-indigo-200/90',
    pillText: 'text-indigo-800',
    footerText: 'text-indigo-950/70',
    liveDotColor: '#4f46e5',
  },
  mint: {
    cardBg: 'bg-gradient-to-b from-[#ccfbf1] via-[#d1fae5] to-[#a7f3d0]',
    borderColor: 'border-emerald-200/90',
    iconBg: 'bg-[#059669] text-white shadow-md shadow-emerald-500/35',
    accentBar: 'bg-[#059669]',
    strokeColor: '#059669',
    areaGradStart: '#10b981',
    areaGradEnd: '#ccfbf1',
    valueText: 'text-[#064e3b]',
    titleText: 'text-[#064e3b]',
    pillBg: 'bg-white/85 border-emerald-200/90',
    pillText: 'text-emerald-800',
    footerText: 'text-emerald-950/70',
    liveDotColor: '#059669',
  },
  rose: {
    cardBg: 'bg-gradient-to-b from-[#ffe4e6] via-[#fff1f2] to-[#fecdd3]',
    borderColor: 'border-rose-200/90',
    iconBg: 'bg-[#e11d48] text-white shadow-md shadow-rose-500/35',
    accentBar: 'bg-[#e11d48]',
    strokeColor: '#e11d48',
    areaGradStart: '#f43f5e',
    areaGradEnd: '#ffe4e6',
    valueText: 'text-[#881337]',
    titleText: 'text-[#881337]',
    pillBg: 'bg-white/85 border-rose-200/90',
    pillText: 'text-rose-800',
    footerText: 'text-rose-950/70',
    liveDotColor: '#e11d48',
  },
  violet: {
    cardBg: 'bg-gradient-to-b from-[#f3e8ff] via-[#faf5ff] to-[#e9d5ff]',
    borderColor: 'border-purple-200/90',
    iconBg: 'bg-[#7c3aed] text-white shadow-md shadow-purple-500/35',
    accentBar: 'bg-[#7c3aed]',
    strokeColor: '#7c3aed',
    areaGradStart: '#8b5cf6',
    areaGradEnd: '#f3e8ff',
    valueText: 'text-[#4c1d95]',
    titleText: 'text-[#4c1d95]',
    pillBg: 'bg-white/85 border-purple-200/90',
    pillText: 'text-purple-800',
    footerText: 'text-purple-950/70',
    liveDotColor: '#7c3aed',
  },
  amber: {
    cardBg: 'bg-gradient-to-b from-[#fef3c7] via-[#fffbeb] to-[#fde68a]',
    borderColor: 'border-amber-200/90',
    iconBg: 'bg-[#d97706] text-white shadow-md shadow-amber-500/35',
    accentBar: 'bg-[#d97706]',
    strokeColor: '#d97706',
    areaGradStart: '#f59e0b',
    areaGradEnd: '#fef3c7',
    valueText: 'text-[#78350f]',
    titleText: 'text-[#78350f]',
    pillBg: 'bg-white/85 border-amber-200/90',
    pillText: 'text-amber-800',
    footerText: 'text-amber-950/70',
    liveDotColor: '#d97706',
  },
  cyan: {
    cardBg: 'bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-[#bae6fd]',
    borderColor: 'border-sky-200/90',
    iconBg: 'bg-[#0284c7] text-white shadow-md shadow-sky-500/35',
    accentBar: 'bg-[#0284c7]',
    strokeColor: '#0284c7',
    areaGradStart: '#0ea5e9',
    areaGradEnd: '#e0f2fe',
    valueText: 'text-[#0c4a6e]',
    titleText: 'text-[#0c4a6e]',
    pillBg: 'bg-white/85 border-sky-200/90',
    pillText: 'text-sky-800',
    footerText: 'text-sky-950/70',
    liveDotColor: '#0284c7',
  },
};

// SVG curve definitions for background line graphs
const curvePaths: Record<string, { path: string; area: string; endX: number; endY: number }> = {
  growth: {
    path: 'M 0,38 C 30,36 50,28 75,30 C 100,32 120,18 150,16 C 175,14 190,8 200,6',
    area: 'M 0,38 C 30,36 50,28 75,30 C 100,32 120,18 150,16 C 175,14 190,8 200,6 L 200,50 L 0,50 Z',
    endX: 200,
    endY: 6,
  },
  bullish: {
    path: 'M 0,42 C 25,38 45,40 70,26 C 95,14 125,24 150,12 C 175,4 190,8 200,2',
    area: 'M 0,42 C 25,38 45,40 70,26 C 95,14 125,24 150,12 C 175,4 190,8 200,2 L 200,50 L 0,50 Z',
    endX: 200,
    endY: 2,
  },
  wave: {
    path: 'M 0,22 C 30,36 60,10 95,24 C 130,38 160,14 200,20',
    area: 'M 0,22 C 30,36 60,10 95,24 C 130,38 160,14 200,20 L 200,50 L 0,50 Z',
    endX: 200,
    endY: 20,
  },
  pulse: {
    path: 'M 0,34 C 25,34 40,20 65,22 C 90,24 110,8 135,16 C 160,24 180,6 200,8',
    area: 'M 0,34 C 25,34 40,20 65,22 C 90,24 110,8 135,16 C 160,24 180,6 200,8 L 200,50 L 0,50 Z',
    endX: 200,
    endY: 8,
  },
  expansion: {
    path: 'M 0,40 C 35,38 70,36 105,26 C 140,16 170,12 200,4',
    area: 'M 0,40 C 35,38 70,36 105,26 C 140,16 170,12 200,4 L 200,50 L 0,50 Z',
    endX: 200,
    endY: 4,
  },
  active: {
    path: 'M 0,30 C 30,16 60,34 95,18 C 130,6 165,28 200,10',
    area: 'M 0,30 C 30,16 60,34 95,18 C 130,6 165,28 200,10 L 200,50 L 0,50 Z',
    endX: 200,
    endY: 10,
  },
};

export const LiveKPICard: React.FC<LiveKPICardProps> = ({
  id,
  title,
  value,
  change = '↙ +-100%',
  icon,
  theme,
  footerText,
  curveType = 'growth',
  hoveredCardId,
  onHover,
}) => {
  const styles = themeStyles[theme];
  const curve = curvePaths[curveType] || curvePaths.growth;

  const isThisHovered = hoveredCardId === id;
  const isOtherHovered = hoveredCardId !== null && hoveredCardId !== undefined && hoveredCardId !== id;

  // Mock live fluctuation simulation (subtle pulse effect every few seconds)
  const [isFluctuating, setIsFluctuating] = useState(false);

  useEffect(() => {
    const randomDelay = 2500 + Math.random() * 3000;
    const interval = setInterval(() => {
      setIsFluctuating(true);
      setTimeout(() => setIsFluctuating(false), 800);
    }, randomDelay);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      onMouseEnter={() => onHover && onHover(id)}
      onMouseLeave={() => onHover && onHover(null)}
      className={clsx(
        'relative overflow-hidden rounded-2xl sm:rounded-3xl p-3 sm:p-4 border select-none',
        styles.cardBg,
        styles.borderColor,
        // Smooth transitions for focus-blur effect
        'transition-all duration-300 ease-out will-change-transform',
        // Hovered card grows and pops forward
        isThisHovered && 'scale-[1.04] z-30 shadow-xl ring-2 ring-purple-500/30 opacity-100 blur-none',
        // Other cards softly blur and dim
        isOtherHovered && 'opacity-45 blur-[2px] scale-[0.97] z-10 pointer-events-none',
        // Neutral default state
        !hoveredCardId && 'opacity-100 blur-none scale-100 z-10 shadow-xs hover:shadow-md'
      )}
    >
      {/* Background Interactive SVG Line Graph with Area Fill */}
      <div className="absolute inset-x-0 bottom-0 h-20 sm:h-24 overflow-hidden pointer-events-none opacity-45 transition-opacity duration-300">
        <svg
          viewBox="0 0 200 50"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id={`area-grad-${theme}-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={styles.areaGradStart} stopOpacity="0.45" />
              <stop offset="100%" stopColor={styles.areaGradEnd} stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id={`line-grad-${theme}-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={styles.strokeColor} stopOpacity="0.7" />
              <stop offset="100%" stopColor={styles.strokeColor} stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path
            d={curve.area}
            fill={`url(#area-grad-${theme}-${id})`}
            className="transition-all duration-500"
          />

          {/* Glowing line curve */}
          <path
            d={curve.path}
            fill="none"
            stroke={`url(#line-grad-${theme}-${id})`}
            strokeWidth="2.4"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* Animated live pulsing dot at the curve end */}
          <circle
            cx={curve.endX}
            cy={curve.endY}
            r={isThisHovered ? '4.5' : '3.5'}
            fill={styles.liveDotColor}
            className="transition-all duration-200"
          />
          <circle
            cx={curve.endX}
            cy={curve.endY}
            r={isFluctuating || isThisHovered ? '7' : '4.5'}
            fill={styles.liveDotColor}
            opacity={isFluctuating || isThisHovered ? '0.45' : '0.2'}
            className={isFluctuating ? 'animate-ping' : ''}
          />
        </svg>
      </div>

      {/* Top row: Elevated glowing icon + trend pill */}
      <div className="flex items-start justify-between gap-1 sm:gap-2 relative z-10">
        <div
          className={clsx(
            'w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4.5 sm:[&>svg]:h-4.5',
            styles.iconBg,
            isThisHovered && 'scale-110'
          )}
        >
          {icon}
        </div>

        <div className="flex items-center gap-1">
          {isFluctuating && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          )}
          <div
            className={clsx(
              'px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full border text-[9px] sm:text-[11px] font-bold tracking-tight shadow-2xs font-mono tabular-nums whitespace-nowrap transition-transform duration-200',
              styles.pillBg,
              styles.pillText,
              isFluctuating && 'scale-105'
            )}
          >
            {change}
          </div>
        </div>
      </div>

      {/* Value with left vertical accent bar */}
      <div className="mt-2.5 sm:mt-3.5 flex items-center gap-1.5 sm:gap-2 relative z-10">
        <div className={clsx('w-1 h-5 sm:h-6 rounded-full shrink-0', styles.accentBar)} />
        <h3
          className={clsx(
            'text-base sm:text-xl md:text-2xl font-extrabold tracking-tight font-heading truncate transition-all duration-200',
            styles.valueText,
            isFluctuating && 'opacity-90'
          )}
        >
          {value}
        </h3>
      </div>

      {/* Label Title */}
      <p className={clsx('text-[10px] sm:text-xs font-bold mt-0.5 sm:mt-1 font-heading relative z-10 truncate', styles.titleText)}>
        {title}
      </p>

      {/* Footer status text - Clean */}
      <div
        className={clsx(
          'mt-2.5 sm:mt-4 pt-1.5 sm:pt-2 border-t border-black/5 flex items-center gap-1 text-[9px] sm:text-[11px] font-medium font-sans relative z-10 truncate',
          styles.footerText
        )}
      >
        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 opacity-70" />
        <span className="truncate">{footerText}</span>
      </div>
    </div>
  );
};
