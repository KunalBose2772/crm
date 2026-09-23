'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ClientTransferPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/client/dashboard" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1.5 mb-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">Internal Transfer</h1>
        <p className="text-xs text-slate-500 mt-1">Move funds instantly between your MT5 trading accounts</p>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div>
          <label className="text-xs font-mono uppercase text-slate-500 font-bold block mb-1.5">From Account</label>
          <select className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500">
            <option>MT5 #260730279 - Balance: $411.20</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-mono uppercase text-slate-500 font-bold block mb-1.5">To Account</label>
          <select className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500">
            <option>MT5 #260730280 (Demo / Secondary)</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-mono uppercase text-slate-500 font-bold block mb-1.5">Transfer Amount ($ USD)</label>
          <input type="number" defaultValue="100" className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 font-mono text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <button type="button" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95 cursor-pointer">
          Execute Transfer
        </button>
      </div>
    </div>
  );
}
