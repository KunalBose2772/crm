'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, History, ArrowDownToLine, ArrowUpFromLine, CheckCircle2 } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export default function ClientHistoryPage() {
  const { impersonation } = useCRM();
  const client = impersonation.client;

  const mockHistory = [
    { id: 'TX-10928', type: 'deposit', amount: 500, status: 'completed', date: '2026-03-20 14:32', method: 'USDT_TRC20' },
    { id: 'TX-10814', type: 'deposit', amount: 1200, status: 'completed', date: '2026-03-15 10:15', method: 'Credit_Card' },
    { id: 'TX-10502', type: 'withdrawal', amount: 350, status: 'completed', date: '2026-03-10 18:40', method: 'Bank_Wire' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/client/dashboard" className="text-xs text-purple-400 hover:underline flex items-center gap-1.5 mb-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="font-serif text-3xl font-bold text-white tracking-tight">Transaction History</h1>
        <p className="text-xs text-slate-400 mt-1">Audit log of all deposits, withdrawals, and account funding</p>
      </div>

      <div className="bg-[#0E1422] border border-[#1C263C] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#12192A] text-slate-400 font-mono uppercase text-[10px] border-b border-[#1C263C]">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Type</th>
                <th className="p-4">Method</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#162033] text-slate-300">
              {mockHistory.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#12192A]/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-white">{tx.id}</td>
                  <td className="p-4 capitalize">
                    <span className="inline-flex items-center gap-1.5">
                      {tx.type === 'deposit' ? (
                        <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <ArrowUpFromLine className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      {tx.type}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-slate-400">{tx.method}</td>
                  <td className="p-4 text-slate-400">{tx.date}</td>
                  <td className="p-4 text-right font-mono font-extrabold text-white">
                    {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-[10px] font-bold">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
