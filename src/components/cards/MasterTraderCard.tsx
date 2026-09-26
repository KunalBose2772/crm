'use client';

import React, { useState } from 'react';
import { 
  Check, 
  Info, 
  Users, 
  Target, 
  Coins, 
  TrendingUp, 
  ChevronDown 
} from 'lucide-react';
import { MasterTrader } from '@/types/crm';
import { clsx } from 'clsx';

interface MasterTraderCardProps {
  master: MasterTrader;
  onSelect?: (master: MasterTrader) => void;
  onVerifyToggle?: (masterId: string) => void;
  isAdmin?: boolean;
  onCopy?: (master: MasterTrader) => void;
  isBeingCopied?: boolean;
  profileHref?: string;
}

// Country code to Flag emoji helper
function getFlagEmoji(countryCode?: string) {
  if (!countryCode || countryCode === 'UN') return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export const MasterTraderCard: React.FC<MasterTraderCardProps> = ({
  master,
  onSelect,
  onVerifyToggle,
  isAdmin = false,
  onCopy,
  isBeingCopied = false,
  profileHref,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Generate realistic smooth curve coordinates for SVG
  const dataPoints = master.sparklineData && master.sparklineData.length >= 2
    ? master.sparklineData
    : [20, 24, 28, 35, 42, 50, 65, 80, 110, 140, 190, 250, 310, 342.8];

  const svgWidth = 560;
  const svgHeight = 100;
  const paddingLeft = 38;
  const paddingRight = 14;
  const paddingTop = 12;
  const paddingBottom = 12;

  // Compute dynamic min and max from actual data with a small margin so curve doesn't clip
  const rawMin = Math.min(...dataPoints);
  const rawMax = Math.max(...dataPoints);
  const delta = rawMax - rawMin || 1;
  const minVal = Math.floor(rawMin - delta * 0.08);
  const maxVal = Math.ceil(rawMax + delta * 0.08);
  const valRange = maxVal - minVal || 1;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const points = dataPoints.map((val, idx) => {
    const x = paddingLeft + (idx / (dataPoints.length - 1)) * chartWidth;
    // Map val to y: higher value = lower y in SVG coordinates
    const normalized = (val - minVal) / valRange;
    const clampedNorm = Math.max(0, Math.min(1, normalized));
    const y = paddingTop + (1 - clampedNorm) * chartHeight;
    return { x, y, val, idx };
  });

  // Smooth SVG Path using cubic beziers
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
  const lastPctChange = (master.gain3m || 35.66).toFixed(2);

  // Dynamic Y-axis labels
  const yLabels = [
    { label: `${Math.round(maxVal)}%`, y: paddingTop },
    { label: `${Math.round(minVal + valRange * 0.66)}%`, y: paddingTop + chartHeight * 0.33 },
    { label: `${Math.round(minVal + valRange * 0.33)}%`, y: paddingTop + chartHeight * 0.66 },
    { label: `${Math.round(minVal)}%`, y: paddingTop + chartHeight },
  ];

  // Risk text & color
  const getRiskLabel = (score: number) => {
    if (score <= 1) return { badge: 'R1', text: 'Risk Level 1', sub: '(Very Low)' };
    if (score === 2) return { badge: 'R2', text: 'Risk Level 2', sub: '(Low - Moderate)' };
    if (score === 3) return { badge: 'R3', text: 'Risk Level 3', sub: '(Moderate)' };
    if (score === 4) return { badge: 'R4', text: 'Risk Level 4', sub: '(High)' };
    return { badge: 'R5', text: 'Risk Level 5', sub: '(Extreme)' };
  };

  const riskInfo = getRiskLabel(master.riskScore);

  // Mouse handler on SVG for hover tracking
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

  return (
    <div className="relative bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.07)] transition-all duration-300 overflow-hidden flex flex-col justify-between group">
      {/* Ambient background soft glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row: Avatar + Identity + (Risk & Fee Badges) */}
      <div className="flex items-start justify-between gap-2">
        {/* Left: Avatar & Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <img
              src={master.avatar}
              alt={master.name}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-white shadow-xs ring-1 ring-slate-100"
            />
            {master.verified && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#10b981] text-white flex items-center justify-center border-2 border-white shadow-2xs">
                <Check className="w-2 h-2 stroke-[3]" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight font-heading truncate">
              {master.name}
            </h3>
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400 font-medium font-sans mt-0.5 truncate">
              <span>#{master.login}</span>
              <span>•</span>
              <span>{getFlagEmoji(master.countryCode)}</span>
              <span className="text-slate-500 truncate">{master.country}</span>
            </div>
          </div>
        </div>

        {/* Right Badges: Risk Pill + Commission Fee Pill */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1.5">
            {/* Commission Fee Badge on Top */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200/70 text-rose-600 text-[10px] font-extrabold shadow-2xs">
              <Coins className="w-2.5 h-2.5 stroke-[2.5]" />
              <span>{master.totalProfitShare}% Fee</span>
            </span>

            {/* Risk Badge */}
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 shadow-2xs">
              <span className="font-black text-[11px] font-heading">{riskInfo.badge}</span>
              <ChevronDown className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-400 font-medium">
            <span>{riskInfo.text}</span>
            <Info className="w-2.5 h-2.5 text-slate-400 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Description line */}
      <p className="mt-2 text-[11px] sm:text-xs text-slate-600 font-sans leading-relaxed line-clamp-2">
        {master.description}
      </p>

      {/* Primary KPI Ribbon - Fits perfectly without horizontal scrollbar */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-4 items-center gap-2 text-left">
        {/* Column 1: Total Return */}
        <div className="min-w-0">
          <div className="text-slate-400 text-[10px] font-semibold font-sans truncate">
            Total Return
          </div>
          <div className="text-base sm:text-lg font-black text-[#10b981] font-heading tracking-tight truncate">
            +{master.overallGain.toFixed(1)}%
          </div>
          <div className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold mt-0.5">
            <TrendingUp className="w-2.5 h-2.5 stroke-[2.5]" />
            <span>+{lastPctChange}%</span>
          </div>
        </div>

        {/* Column 2: Current Equity */}
        <div className="min-w-0 border-l border-slate-100 pl-2">
          <div className="text-slate-400 text-[10px] font-semibold font-sans truncate">
            Equity
          </div>
          <div className="text-xs sm:text-sm font-black text-slate-900 font-heading tracking-tight truncate mt-0.5">
            ${master.equity.toLocaleString()}
          </div>
        </div>

        {/* Column 3: Copiers */}
        <div className="min-w-0 border-l border-slate-100 pl-2">
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-2.5 h-2.5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="block text-[9px] text-slate-400 font-medium leading-none truncate">Copiers</span>
              <span className="text-[11px] sm:text-xs font-black text-slate-900 font-heading mt-0.5 block truncate">
                {master.totalCopiers.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Column 4: Win Rate */}
        <div className="min-w-0 border-l border-slate-100 pl-2">
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Target className="w-2.5 h-2.5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="block text-[9px] text-slate-400 font-medium leading-none truncate">Win Rate</span>
              <span className="text-[11px] sm:text-xs font-black text-[#7c3aed] font-heading mt-0.5 block truncate">
                {master.winRate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Interactive SVG Area Chart with Hover Crosshair and Value Tooltip */}
      <div className="relative mt-2 pt-1">
        {/* Hover / Sparkline dynamic readout (only visible during hover, preventing duplicate return label) */}
        {hoveredIndex !== null && (
          <div className="absolute right-1.5 -top-1 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-black shadow-xs font-heading">
            <TrendingUp className="w-2.5 h-2.5 stroke-[2.5]" />
            <span>Gain: +{activePoint.val.toFixed(1)}%</span>
          </div>
        )}

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-18 sm:h-22 overflow-visible cursor-crosshair"
          onMouseMove={handleSvgMouseMove}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id={`chart-grad-${master.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id={`stroke-grad-${master.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Horizontal grid guide lines with y-axis values */}
          {yLabels.map((grid, gIdx) => (
            <g key={gIdx}>
              <text
                x="32"
                y={grid.y + 3}
                textAnchor="end"
                className="fill-slate-400 text-[9px] font-sans font-medium"
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

          {/* Area Fill */}
          <path
            d={areaD}
            fill={`url(#chart-grad-${master.id})`}
            className="transition-all duration-300"
          />

          {/* Line Curve */}
          <path
            d={pathD}
            fill="none"
            stroke={`url(#stroke-grad-${master.id})`}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Vertical guideline on hover */}
          {hoveredIndex !== null && (
            <line
              x1={activePoint.x}
              y1={paddingTop}
              x2={activePoint.x}
              y2={svgHeight - paddingBottom}
              stroke="#10b981"
              strokeWidth="1.2"
              strokeDasharray="2 2"
              opacity="0.8"
            />
          )}

          {/* Dynamic/Hover Marker Dot */}
          <circle
            cx={activePoint.x}
            cy={activePoint.y}
            r="4.5"
            fill="#ffffff"
            stroke="#10b981"
            strokeWidth="2.5"
            className="shadow-xs transition-all duration-75"
          />
          {hoveredIndex === null && (
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="8"
              fill="#10b981"
              opacity="0.25"
              className="animate-ping"
            />
          )}
        </svg>
      </div>

      {/* Integrated Action Footer: Admin View */}
      {isAdmin && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onSelect && onSelect(master)}
            className="px-2.5 py-1 rounded-lg border border-purple-200 text-purple-700 text-[11px] font-bold hover:bg-purple-50 transition cursor-pointer shadow-2xs font-heading"
          >
            Strategy Details
          </button>

          <button
            type="button"
            onClick={() => onVerifyToggle && onVerifyToggle(master.id)}
            className={clsx(
              "px-2.5 py-1 rounded-lg text-[11px] font-bold transition border cursor-pointer shadow-2xs font-heading",
              master.verified
                ? 'border-purple-200 bg-white text-slate-700 hover:bg-purple-50'
                : 'border-purple-600 bg-purple-600 text-white hover:bg-purple-700'
            )}
          >
            {master.verified ? 'Revoke Badge' : 'Verify Master'}
          </button>
        </div>
      )}

      {/* Integrated Action Footer: Client View */}
      {!isAdmin && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          {profileHref ? (
            <a
              href={profileHref}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-blue-600 transition font-heading"
            >
              <span>Profile</span>
              <span className="text-xs">↗</span>
            </a>
          ) : (
            <span />
          )}

          {isBeingCopied ? (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold flex items-center gap-1 shadow-2xs">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Copying Live</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onCopy ? onCopy(master) : onSelect && onSelect(master)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-600 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white text-[11px] font-bold shadow-xs hover:shadow-sm transition flex items-center gap-1.5 font-heading cursor-pointer active:scale-[0.98]"
            >
              <TrendingUp className="w-3 h-3 stroke-[2.5]" />
              <span>Copy Trader</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
