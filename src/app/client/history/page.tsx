'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export default function ClientHistoryPage() {
  const mockHistory = [
    { id: 'TX-10928', type: 'deposit', amount: 500, status: 'completed', date: '2026-03-20 14:32', method: 'USDT_TRC20' },
    { id: 'TX-10814', type: 'deposit', amount: 1200, status: 'completed', date: '2026-03-15 10:15', method: 'Credit_Card' },
    { id: 'TX-10502', type: 'withdrawal', amount: 350, status: 'completed', date: '2026-03-10 18:40', method: 'Bank_Wire' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/client/dashboard" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1.5 mb-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">Transaction History</h1>
        <p className="text-xs text-slate-500 mt-1">Audit log of all deposits, withdrawals, and account funding</p>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Type</th>
                <th className="p-4">Method</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {mockHistory.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-mono font-bold text-blue-700">{tx.id}</td>
                  <td className="p-4 capitalize font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      {tx.type === 'deposit' ? (
                        <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpFromLine className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      {tx.type}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-slate-500">{tx.method}</td>
                  <td className="p-4 text-slate-500">{tx.date}</td>
                  <td className="p-4 text-right font-mono font-extrabold text-slate-900">
                    {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
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
