'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export default function ClientDepositPage() {
  const { showToast } = useCRM();
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
        <Link href="/client/dashboard" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1.5 mb-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">Deposit Funds</h1>
        <p className="text-xs text-slate-500 mt-1">Instant funding via Crypto, Bank Wire, or Card</p>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        {isSuccess ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-slate-900">Deposit Initiated</h3>
            <p className="text-xs text-slate-500">
              Your transfer for ${amount} has been queued. Funds will reflect in MT5 once confirmed.
            </p>
            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-xs"
            >
              Make Another Deposit
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase text-slate-500 font-bold block mb-1.5">
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
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-2xs'
                        : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-500 font-bold block mb-1.5">
                Deposit Amount ($ USD)
              </label>
              <input
                type="number"
                min="50"
                step="10"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-mono text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              Confirm Deposit
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
