'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowLeftRight, 
  Zap, 
  ShieldCheck, 
  Wallet, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Lock,
  Layers
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { ClientPageHeader } from '@/components/layout/ClientPageHeader';

export default function ClientTransferPage() {
  const { impersonation, showToast } = useCRM();
  const client = impersonation.client;
  const accounts = client?.accounts || [
    { id: 'acc_02_1', login: 98989898989, platform: 'MT5', type: 'BASIC', balance: 5937.47 },
    { id: 'acc_02_2', login: 260730279, platform: 'MT5', type: 'PRO_ECN', balance: 411.20 },
  ];

  const [fromAccount, setFromAccount] = useState(accounts[0]?.login.toString() || '98989898989');
  const [toAccount, setToAccount] = useState(accounts[1]?.login.toString() || '260730279');
  const [amount, setAmount] = useState('250');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedFromAcc = accounts.find((a) => a.login.toString() === fromAccount) || accounts[0];
  const selectedToAcc = accounts.find((a) => a.login.toString() === toAccount) || accounts[1];
  const transferNum = parseFloat(amount) || 0;

  const handleSwap = () => {
    const temp = fromAccount;
    setFromAccount(toAccount);
    setToAccount(temp);
  };

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromAccount === toAccount) {
      showToast('error', 'Invalid Selection', 'Source and target trading accounts cannot be identical.');
      return;
    }
    if (transferNum <= 0) {
      showToast('error', 'Invalid Amount', 'Please specify a transfer amount greater than $0.00.');
      return;
    }
    if (selectedFromAcc && transferNum > selectedFromAcc.balance) {
      showToast('error', 'Insufficient Liquidity', `Account #${fromAccount} only has $${selectedFromAcc.balance.toFixed(2)} available.`);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      showToast(
        'success',
        'Transfer Complete',
        `Successfully transferred $${transferNum.toFixed(2)} from #${fromAccount} to #${toAccount}.`
      );
    }, 900);
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl mx-auto pb-12">
      {/* 1. ROYAL BLUE PAGE HEADER */}
      <ClientPageHeader
        badge="Internal Liquidity"
        badgeIcon={<ArrowLeftRight className="h-6 w-6 sm:h-7 sm:w-7 text-sky-300" />}
        title="Internal Funds Transfer"
        subtitle="Instantly reallocate capital between your live MT5 accounts with zero network fees and real-time ledger settlement."
        chips={[
          { label: 'Execution Speed', value: 'Instant (<1s)', icon: <Zap className="w-3.5 h-3.5 text-amber-300" /> },
          { label: 'Transfer Fee', value: '0.00% Zero Fee', icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> },
        ]}
      />

      {/* 2. MAIN TRANSFER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Transfer Form Card */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">Transfer Parameters</h2>
              <p className="text-xs text-slate-500">Capital is moved immediately via internal liquidity routing.</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Settlement: Live
            </div>
          </div>

          <form onSubmit={handleExecute} className="space-y-5">
            {/* From Account */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase text-slate-500 font-bold">Source Account (From)</label>
                {selectedFromAcc && (
                  <span className="text-xs font-mono text-slate-600 font-semibold">
                    Available: <span className="font-extrabold text-slate-900">${selectedFromAcc.balance.toFixed(2)}</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <select
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.login.toString()}>
                      {acc.platform} #{acc.login} ({acc.type}) — ${acc.balance.toFixed(2)} USD
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-2 relative z-10">
              <button
                type="button"
                onClick={handleSwap}
                className="p-2.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 shadow-2xs hover:rotate-180 transition-all duration-300 cursor-pointer active:scale-90"
                title="Swap source and target"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            {/* To Account */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase text-slate-500 font-bold">Destination Account (To)</label>
                {selectedToAcc && (
                  <span className="text-xs font-mono text-slate-600 font-semibold">
                    Current: <span className="font-extrabold text-slate-900">${selectedToAcc.balance.toFixed(2)}</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <select
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.login.toString()}>
                      {acc.platform} #{acc.login} ({acc.type}) — ${acc.balance.toFixed(2)} USD
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Transfer Amount */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase text-slate-500 font-bold">Transfer Amount ($ USD)</label>
                <span className="text-xs text-slate-400 font-mono">Min: $10.00</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 font-mono text-base font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="grid grid-cols-4 gap-2 mt-2.5">
                {['50', '100', '250', '500'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className="py-1.5 px-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-mono font-bold transition-all text-center cursor-pointer"
                  >
                    +${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Execute Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs hover:shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Settlement...</span>
                </>
              ) : (
                <>
                  <span>Execute Instant Transfer</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Security & Summary Information */}
        <div className="lg:col-span-5 space-y-6">
          {/* Transfer Summary Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 font-heading">Transfer Breakdown</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Gross Transfer</span>
                <span className="font-extrabold text-slate-900">${transferNum.toFixed(2)} USD</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Processing Fee</span>
                <span className="font-bold text-emerald-600">$0.00 (0.00%)</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Settlement Timeline</span>
                <span className="font-bold text-blue-700">Immediate</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-700 font-bold font-sans">Net Received</span>
                <span className="font-extrabold text-emerald-600 text-sm">${transferNum.toFixed(2)} USD</span>
              </div>
            </div>
          </div>

          {/* Infrastructure Guarantee Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 font-heading">Zero-Latency Bridge</h4>
                <p className="text-[11px] text-slate-500">Direct atomic transfer via MT5 server API</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>No balance locking or withholding during internal movements.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Open trading positions are not affected on destination accounts.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Both MT5 accounts share identical master client profile credentials.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
