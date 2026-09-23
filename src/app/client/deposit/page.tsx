'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowDownToLine, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export default function ClientDepositPage() {
  const { impersonation, showToast } = useCRM();
  const [amount, setAmount] = useState('500');
  const [method, setMethod] = useState('USDT_TRC20');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    showToast('success', 'Deposit Request Submitted', `Amount of $${amount} via ${method} is being processed.`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/client/dashboard" className="text-xs text-purple-400 hover:underline flex items-center gap-1.5 mb-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="font-serif text-3xl font-bold text-white tracking-tight">Deposit Funds</h1>
        <p className="text-xs text-slate-400 mt-1">Instant funding via Crypto, Bank Wire, or Card</p>
      </div>

      <div className="bg-[#0E1422] border border-[#1C263C] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        {isSuccess ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white">Deposit Initiated</h3>
            <p className="text-xs text-slate-400">
              Your transfer for ${amount} has been queued. Funds will reflect in MT5 once confirmed on-chain.
            </p>
            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
            >
              Make Another Deposit
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase text-slate-400 font-bold block mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'USDT_TRC20', label: 'USDT (TRC-20)' },
                  { id: 'USDT_ERC20', label: 'USDT (ERC-20)' },
                  { id: 'Bank_Wire', label: 'Bank Wire' },
                  { id: 'Credit_Card', label: 'Credit Card' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      method === m.id
                        ? 'border-emerald-500 bg-[#09261C] text-emerald-300'
                        : 'border-[#1E2B44] bg-[#12192A] text-slate-300 hover:bg-[#162035]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 font-bold block mb-1.5">
                Deposit Amount ($ USD)
              </label>
              <input
                type="number"
                min="50"
                step="10"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#12192A] border border-[#1E2B44] rounded-xl font-mono text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Confirm Deposit
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
