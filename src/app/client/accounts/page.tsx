'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Wallet, ShieldCheck, Plus, ArrowUpRight } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export default function ClientAccountsPage() {
  const { impersonation } = useCRM();
  const client = impersonation.client;
  const accounts = client?.accounts || [
    {
      id: 'acc-mt5-1',
      login: 260730279,
      platform: 'MT5',
      type: 'BASIC',
      currency: 'USD',
      balance: 411.20,
      equity: 411.20,
      leverage: '1:300',
      server: 'OceanMarkets-Live',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/client/dashboard" className="text-xs text-purple-400 hover:underline flex items-center gap-1.5 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="font-serif text-3xl font-bold text-white tracking-tight">
            My Trading Accounts
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage active MT5 live &amp; demo trading accounts</p>
        </div>

        <Link
          href="/client/open-account"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D9A05B] to-[#C28C42] text-[#130E07] text-xs font-bold shadow-md hover:brightness-110 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Open Account</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-[#0E1422] border border-[#1C263C] rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-900/60 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold">
                  {acc.platform}
                </span>
                <span className="font-mono font-bold text-white text-base">#{acc.login}</span>
                <span className="px-2 py-0.5 rounded-md bg-[#162033] text-slate-300 text-[10px] font-bold">
                  {acc.type}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Leverage {acc.leverage}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#192233]">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Balance</span>
                <span className="font-mono text-xl font-extrabold text-emerald-400 block">
                  ${acc.balance.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Equity</span>
                <span className="font-mono text-xl font-extrabold text-white block">
                  ${acc.equity.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#192233] text-xs">
              <span className="text-slate-400">{acc.server}</span>
              <Link href="/client/deposit" className="text-emerald-400 hover:underline font-bold flex items-center gap-1">
                Deposit Funds <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
