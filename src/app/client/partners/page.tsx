'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ClientPartnersPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/client/dashboard" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1.5 mb-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">Partners Zone (IB Desk)</h1>
        <p className="text-xs text-slate-500 mt-1">Multi-tier commission tracking, sub-IB network, and rebate reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-1 shadow-xs hover:shadow-md transition-shadow">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Partner Status</span>
          <div className="text-2xl font-mono font-extrabold text-blue-700">ACTIVE IB</div>
          <p className="text-xs text-slate-500">Tier 1 Master Broker</p>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-1 shadow-xs hover:shadow-md transition-shadow">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Referred Traders</span>
          <div className="text-2xl font-mono font-extrabold text-emerald-600">14 Active</div>
          <p className="text-xs text-slate-500">Total volume: 184.2 lots</p>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-1 shadow-xs hover:shadow-md transition-shadow">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Unpaid Commission</span>
          <div className="text-2xl font-mono font-extrabold text-amber-600">$1,420.00</div>
          <p className="text-xs text-slate-500">Paid out on 1st of every month</p>
        </div>
      </div>
    </div>
  );
}
