'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowLeftRight, CheckCircle2 } from 'lucide-react';

export default function ClientTransferPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/client/dashboard" className="text-xs text-purple-400 hover:underline flex items-center gap-1.5 mb-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="font-serif text-3xl font-bold text-white tracking-tight">Internal Transfer</h1>
        <p className="text-xs text-slate-400 mt-1">Move funds instantly between your MT5 trading accounts</p>
      </div>

      <div className="bg-[#0E1422] border border-[#1C263C] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div>
          <label className="text-xs font-mono uppercase text-slate-400 font-bold block mb-1.5">From Account</label>
          <select className="w-full px-4 py-2.5 bg-[#12192A] border border-[#1E2B44] rounded-xl text-white text-xs focus:outline-none">
            <option>MT5 #260730279 - Balance: $411.20</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-mono uppercase text-slate-400 font-bold block mb-1.5">To Account</label>
          <select className="w-full px-4 py-2.5 bg-[#12192A] border border-[#1E2B44] rounded-xl text-white text-xs focus:outline-none">
            <option>MT5 #260730280 (Demo / Secondary)</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-mono uppercase text-slate-400 font-bold block mb-1.5">Transfer Amount ($ USD)</label>
          <input type="number" defaultValue="100" className="w-full px-4 py-2.5 bg-[#12192A] border border-[#1E2B44] rounded-xl text-white font-mono text-sm focus:outline-none" />
        </div>
        <button type="button" className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md">
          Execute Transfer
        </button>
      </div>
    </div>
  );
}
