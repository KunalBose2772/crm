'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ClientStatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/client/dashboard" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1.5 mb-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">Trading Statistics</h1>
        <p className="text-xs text-slate-500 mt-1">Analytics on win-rate, profit factor, volume, and drawdown</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Win Rate', value: '68.4%', sub: 'Over last 120 trades', color: 'text-emerald-600' },
          { label: 'Profit Factor', value: '2.14', sub: 'Gross Profit / Gross Loss', color: 'text-blue-700' },
          { label: 'Max Drawdown', value: '4.2%', sub: 'Well within safety thresholds', color: 'text-sky-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-1 shadow-xs hover:shadow-md transition-shadow">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">{stat.label}</span>
            <div className={`text-3xl font-mono font-extrabold ${stat.color}`}>{stat.value}</div>
            <p className="text-xs text-slate-500">{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
