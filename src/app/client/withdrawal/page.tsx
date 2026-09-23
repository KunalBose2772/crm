'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export default function ClientWithdrawalPage() {
  const { showToast } = useCRM();
  const [amount, setAmount] = useState('200');
  const [wallet, setWallet] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    showToast('success', 'Withdrawal Request Submitted', `Amount of $${amount} to ${wallet} submitted for approval.`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/client/dashboard" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1.5 mb-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">Withdrawal Request</h1>
        <p className="text-xs text-slate-500 mt-1">Submit payout request to external wallet or bank account</p>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        {isSuccess ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-slate-900">Withdrawal Submitted</h3>
            <p className="text-xs text-slate-500">
              Request for ${amount} has been forwarded to the finance desk for compliance verification.
            </p>
            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-xs"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase text-slate-500 font-bold block mb-1.5">
                Withdrawal Amount ($ USD)
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

            <div>
              <label className="text-xs font-mono uppercase text-slate-500 font-bold block mb-1.5">
                Destination Address / IBAN
              </label>
              <input
                type="text"
                required
                placeholder="e.g. TRC20 wallet or Bank Account IBAN"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-sans text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              Submit Withdrawal Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
