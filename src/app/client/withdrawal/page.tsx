'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowUpFromLine, 
  CheckCircle2, 
  ShieldCheck, 
  DollarSign, 
  Wallet, 
  ArrowRight,
  Landmark,
  CreditCard
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { ClientPageHeader } from '@/components/layout/ClientPageHeader';

export default function ClientWithdrawalPage() {
  const { showToast } = useCRM();
  const [amount, setAmount] = useState('200');
  const [wallet, setWallet] = useState('');
  const [channel, setChannel] = useState<'bank' | 'crypto'>('crypto');
  const [isSuccess, setIsSuccess] = useState(false);

  const availableBalance = 5937.47;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    showToast('success', 'Withdrawal Request Submitted', `Amount of $${amount} submitted for processing.`);
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl mx-auto pb-12">
      {/* 1. ROYAL BLUE PAGE HEADER */}
      <ClientPageHeader
        badge="Custodial Payout"
        badgeIcon={<ArrowUpFromLine className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-300" />}
        title="Withdraw Funds"
        subtitle="Submit secure withdrawal requests directly from your funded trading accounts."
        chips={[
          { label: 'Available Balance', value: `$${availableBalance.toFixed(2)}`, icon: <DollarSign className="w-3.5 h-3.5 text-blue-200" /> },
          { label: 'Processing Fee', value: '$0.00 (Zero Fee)', icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> },
        ]}
      />

      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs max-w-2xl mx-auto">
        {isSuccess ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 font-heading">Withdrawal Queued</h3>
            <p className="text-xs text-slate-500">
              Request for ${amount} has been forwarded to the finance desk for compliance verification.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-xs cursor-pointer"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading block mb-2">
                Payout Channel
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setChannel('crypto')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    channel === 'crypto'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-2xs ring-1 ring-blue-500/20'
                      : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="font-extrabold font-heading text-xs block">Crypto (USDT TRC-20)</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Instant blockchain transfer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('bank')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    channel === 'bank'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-2xs ring-1 ring-blue-500/20'
                      : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Landmark className="w-4 h-4 text-blue-600 mb-1" />
                  <span className="font-extrabold font-heading text-xs block">Bank Wire</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Local or SWIFT payout</span>
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading">
                  Withdrawal Amount ($ USD)
                </label>
                <button
                  type="button"
                  onClick={() => setAmount(availableBalance.toString())}
                  className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Max: ${availableBalance.toFixed(2)}
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  min="50"
                  max={availableBalance}
                  step="10"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-bold font-mono focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading block mb-1.5">
                {channel === 'crypto' ? 'Destination USDT (TRC-20) Address' : 'Bank Account / IBAN'}
              </label>
              <input
                type="text"
                required
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder={channel === 'crypto' ? 'T9yD14Nj9j7xAB4...' : 'Enter bank account number or IBAN'}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading block mb-1.5">
                Source Trading Account
              </label>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-slate-900">#98989898989 • Standard</span>
                <span className="text-xs font-mono text-slate-500">Available: ${availableBalance.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Submit Payout Request</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
