'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowDownToLine, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  Landmark, 
  Zap, 
  DollarSign, 
  ArrowRight 
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { ClientPageHeader } from '@/components/layout/ClientPageHeader';

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
    <div className="space-y-6 font-sans select-none max-w-7xl mx-auto pb-12">
      {/* 1. ROYAL BLUE PAGE HEADER */}
      <ClientPageHeader
        badge="Financial Operations"
        badgeIcon={<ArrowDownToLine className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-300" />}
        title="Deposit Funds"
        subtitle="Instant funding across Bank Wire, Crypto (USDT), or UPI with real-time settlement."
        chips={[
          { label: 'Security', value: '256-bit Encrypted', icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-200" /> },
          { label: 'Processing Fee', value: '$0.00 (Zero Fee)', icon: <Zap className="w-3.5 h-3.5 text-emerald-300" /> },
        ]}
      />

      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs max-w-2xl mx-auto">
        {isSuccess ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 font-heading">Deposit Initiated</h3>
            <p className="text-xs text-slate-500">
              Your transfer for ${amount} has been queued. Funds will reflect in MT5 once confirmed.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-xs cursor-pointer"
              >
                Make Another Deposit
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading block mb-2">
                Payment Channel
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'USDT_TRC20', label: 'USDT (TRC-20)', sub: 'Instant network settlement' },
                  { id: 'USDT_ERC20', label: 'USDT (ERC-20)', sub: 'Ethereum blockchain' },
                  { id: 'Bank_Wire', label: 'Bank Wire', sub: 'Traditional wire transfer' },
                  { id: 'UPI_QR', label: 'UPI / QR', sub: 'Instant local payout' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`p-3.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                      method === m.id
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-2xs ring-1 ring-blue-500/20'
                        : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-extrabold font-heading block">{m.label}</span>
                    <span className="text-[10px] text-slate-500 font-sans block mt-0.5">{m.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading block mb-1.5">
                Deposit Amount ($ USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-bold font-mono focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading block mb-1.5">
                Target Trading Account
              </label>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-slate-900">#98989898989 • Standard</span>
                <span className="text-xs font-mono text-slate-500">Balance: $5,937.47</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continue to Payment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
