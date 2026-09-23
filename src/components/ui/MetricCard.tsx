import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { clsx } from 'clsx';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number; // e.g. 12.5%
  changePeriod?: string;
  icon: React.ReactNode;
  iconColor?: 'purple' | 'indigo' | 'violet' | 'fuchsia';
  badge?: React.ReactNode;
  subtitle?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changePeriod = 'vs last month',
  icon,
  badge,
  subtitle,
}) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-br from-[#7e22ce] via-[#6b21a8] to-[#581c87] p-5 text-white border border-purple-400/25 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Subtle ambient light */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

      {/* Top row */}
      <div className="flex items-start justify-between relative z-10 gap-3">
        <span className="text-xs font-bold text-purple-100 uppercase tracking-wider font-heading">{title}</span>
        <div className="w-10 h-10 rounded-2xl bg-white text-[#6b21a8] shadow-xs flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>

      {/* Main value */}
      <div className="mt-4 relative z-10">
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">{value}</h3>
        {subtitle && <p className="text-xs text-purple-100/90 mt-1 font-sans">{subtitle}</p>}
      </div>

      {/* Footer / Trend */}
      {(change !== undefined || badge) && (
        <div className="mt-4 pt-3.5 border-t border-purple-400/25 flex items-center justify-between text-xs relative z-10">
          {change !== undefined ? (
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  'inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full text-xs shadow-xs',
                  isPositive && 'bg-[#10b981] text-white',
                  isNegative && 'bg-[#ef4444] text-white',
                  !isPositive && !isNegative && 'bg-white/20 text-white'
                )}
              >
                {isPositive && <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />}
                {isNegative && <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />}
                {!isPositive && !isNegative && <Minus className="w-3.5 h-3.5" />}
                {Math.abs(change)}%
              </span>
              <span className="text-purple-100 text-xs font-medium font-sans">{changePeriod}</span>
            </div>
          ) : (
            <div />
          )}

          {badge && <div>{badge}</div>}
        </div>
      )}
    </div>
  );
};
