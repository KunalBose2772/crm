'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface ClientPageHeaderProps {
  badge: string;
  badgeIcon?: React.ReactNode;
  title: string;
  subtitle: string;
  chips?: Array<{
    label: string;
    value: string | React.ReactNode;
    icon?: React.ReactNode;
  }>;
  actionButton?: React.ReactNode;
  className?: string;
}

export const ClientPageHeader: React.FC<ClientPageHeaderProps> = ({
  badge,
  badgeIcon,
  title,
  subtitle,
  chips,
  actionButton,
  className,
}) => {
  return (
    <div
      className={clsx(
        'relative rounded-2xl sm:rounded-3xl border border-blue-400/30 bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] p-5 sm:p-7 md:p-8 shadow-md text-white select-none',
        className
      )}
    >
      {/* Ambient Royal Blue Glow with internal overflow containment */}
      <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-start gap-4">
          {badgeIcon && (
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xs text-white shadow-xs">
              {badgeIcon}
            </div>
          )}
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-xs border border-white/20 text-[10px] font-extrabold uppercase tracking-wider text-blue-100 font-heading">
              {badge}
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
              {title}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-blue-100/90 font-sans max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right Side: Quick Metric Cards & Action Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start lg:self-center">
          {chips && chips.length > 0 && (
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 sm:gap-3">
              {chips.map((chip, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-3.5 py-2.5 sm:px-4 sm:py-2.5 min-w-[130px] shadow-xs hover:bg-white/15 transition-all"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200/90 font-heading leading-tight truncate">
                    {chip.label}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-white font-mono leading-none">
                    {chip.icon && <span className="shrink-0">{chip.icon}</span>}
                    <span className="truncate">{chip.value}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {actionButton && (
            <div className="shrink-0 flex items-center">
              {actionButton}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
