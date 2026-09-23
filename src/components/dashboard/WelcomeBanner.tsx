'use client';

import React, { useState, useEffect } from 'react';
import { Clock, RotateCw } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export const WelcomeBanner: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => {
  const { showToast } = useCRM();
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const [isRotating, setIsRotating] = useState(false);

  // Live ticking clock & dynamic date formatted exactly as: "01:43 PM • Wednesday, September 23"
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
    <div className="relative overflow-hidden rounded-3xl border border-[#fed7aa]/60 bg-gradient-to-r from-[#fff7ed]/90 via-[#fffaf5] to-[#fef2f2]/80 p-5 sm:p-6 shadow-xs select-none">
      {/* Subtle ambient warm glow */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
        <div className="space-y-2 max-w-2xl">
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 border border-orange-200/80 text-[10px] font-extrabold uppercase tracking-wider text-amber-900 shadow-2xs font-heading">
            Admin Overview
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Welcome back
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
            Review platform activity, monitor client operations, and keep the workspace moving from one place.
          </p>

          {/* Live Date & Time pill */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-orange-200/60 text-xs font-semibold text-slate-700 shadow-2xs font-sans">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-mono tabular-nums">{timeString || '01:43 PM'}</span>
              <span className="text-slate-300">•</span>
              <span>{dateString || 'Wednesday, September 23'}</span>
            </div>
          </div>
        </div>

        {/* Refresh Button on the top right */}
        <div className="shrink-0 pt-1 sm:pt-0">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white hover:bg-orange-50/50 border border-slate-200/90 hover:border-orange-300 text-xs font-bold text-slate-700 hover:text-amber-900 transition-all duration-150 shadow-2xs cursor-pointer active:scale-95"
            title="Refresh real-time data"
          >
            <RotateCw className={`w-3.5 h-3.5 text-slate-600 transition-transform duration-700 ${isRotating ? 'animate-spin text-purple-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
