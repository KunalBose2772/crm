'use client';

import React, { useState, useEffect } from 'react';
import { Clock, RotateCw, Sparkles } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { clsx } from 'clsx';

export interface WelcomeBannerProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  onRefresh?: () => void;
  showDateTime?: boolean;
  className?: string;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  title = 'Welcome back',
  subtitle = 'Review platform activity, monitor client operations, and keep the workspace moving from one place.',
  badgeText = 'Admin Overview',
  onRefresh,
  showDateTime = true,
  className,
}) => {
  const { showToast } = useCRM();
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const [shortDateString, setShortDateString] = useState('');
  const [isRotating, setIsRotating] = useState(false);

  // Live ticking clock & dynamic date
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      const date = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
      const shortDate = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      setTimeString(time);
      setDateString(date);
      setShortDateString(shortDate);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRotating(true);
    if (onRefresh) {
      onRefresh();
    }
    showToast('success', 'Data Synchronized', 'Real-time ledger metrics and trading queues updated.');
    setTimeout(() => {
      setIsRotating(false);
    }, 800);
  };

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-2xl sm:rounded-3xl border border-purple-400/30 bg-gradient-to-r from-[#4c1d95] via-[#581c87] to-[#6b21a8] p-4 sm:p-5 md:p-6 shadow-md select-none text-white transition-all",
        className
      )}
    >
      {/* Ambient Royal Purple Glow Orbs */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Right Refresh Icon Button */}
      <button
        type="button"
        onClick={handleRefresh}
        className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 z-20 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 backdrop-blur-xs border border-white/25 text-purple-100 hover:text-white transition-all duration-150 shadow-2xs cursor-pointer active:scale-95 group"
        title="Refresh real-time data"
        aria-label="Refresh real-time data"
      >
        <RotateCw
          className={clsx(
            "w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-100 group-hover:text-white transition-transform duration-700",
            isRotating && "animate-spin text-white"
          )}
        />
      </button>

      <div className="relative z-10 pr-10 sm:pr-12">
        <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-xs border border-white/20 text-[10px] font-extrabold uppercase tracking-wider text-purple-100 shadow-2xs font-heading">
            <Sparkles className="w-3 h-3 text-purple-200" />
            <span>{badgeText}</span>
          </div>

          {/* Heading */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight font-heading">
            {title}
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm text-purple-100/90 font-sans leading-relaxed">
            {subtitle}
          </p>

          {/* Live Date & Time pill - Fits perfectly on one line */}
          {showDateTime && (
            <div className="pt-1 sm:pt-1.5 max-w-full overflow-hidden">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-[11px] sm:text-xs font-semibold text-purple-100 shadow-2xs font-sans whitespace-nowrap max-w-full">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-200 shrink-0" />
                <span className="font-mono tabular-nums whitespace-nowrap shrink-0">{timeString || '02:35 PM'}</span>
                <span className="text-purple-300/60 shrink-0">•</span>
                <span className="hidden sm:inline whitespace-nowrap">{dateString || 'Wednesday, September 23'}</span>
                <span className="sm:hidden whitespace-nowrap">{shortDateString || 'Wed, Sep 23'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
