'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export default function ClientAccountsPage() {
  const { impersonation, openClientModal } = useCRM();
  const client = impersonation.client;
  const accounts = client?.accounts || [
    {
      id: 'acc_02_1',
      login: 98989898989,
      platform: 'MT5',
      type: 'BASIC',
      currency: 'USD',
      balance: 5937.47,
      equity: 5937.47,
      leverage: '1:100',
      server: 'Ocean Markets Ltd.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link href="/client/dashboard" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1.5 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Trading Accounts
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage active MT5 live &amp; demo trading accounts</p>
        </div>

        <button
          type="button"
          onClick={() => openClientModal('open-account')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold shadow-xs hover:brightness-105 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Open Account</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono text-xs font-bold">
                  {acc.platform}
                </span>
                <span className="font-mono font-bold text-slate-900 text-base">#{acc.login}</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                  {acc.type}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 font-medium">Leverage {acc.leverage}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Balance</span>
                <span className="font-mono text-xl font-extrabold text-emerald-600 block">
                  ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Equity</span>
                <span className="font-mono text-xl font-extrabold text-slate-900 block">
                  ${acc.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">{acc.server}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => openClientModal('deposit')}
                  className="text-emerald-600 hover:text-emerald-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" /> Deposit
                </button>
                <button
                  type="button"
                  onClick={() => openClientModal('withdrawal')}
                  className="text-blue-600 hover:text-blue-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> Withdraw
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
