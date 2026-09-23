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
  const [isRotating, setIsRotating] = useState(false);

  // Live ticking clock & dynamic date formatted exactly as: "02:35 PM • Wednesday, September 23"
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
      setTimeString(time);
      setDateString(date);
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

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 relative z-10">
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

          {/* Live Date & Time pill */}
          {showDateTime && (
            <div className="pt-1.5 sm:pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-xs font-semibold text-purple-100 shadow-2xs font-sans">
                <Clock className="w-3.5 h-3.5 text-purple-200" />
                <span className="font-mono tabular-nums">{timeString || '02:35 PM'}</span>
                <span className="text-purple-300/60">•</span>
                <span>{dateString || 'Wednesday, September 23'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Refresh Button on the top right */}
        <div className="shrink-0 self-start sm:self-auto pt-1 sm:pt-0">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 backdrop-blur-xs border border-white/25 text-xs font-bold text-white transition-all duration-150 shadow-2xs cursor-pointer active:scale-95"
            title="Refresh real-time data"
          >
            <RotateCw
              className={clsx(
                "w-3.5 h-3.5 text-purple-100 transition-transform duration-700",
                isRotating && "animate-spin text-white"
              )}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
