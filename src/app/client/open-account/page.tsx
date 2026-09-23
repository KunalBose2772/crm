'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, CheckCircle2 } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export default function ClientOpenAccountPage() {
  const { impersonation, showToast } = useCRM();
  const [platform, setPlatform] = useState('MT5');
  const [type, setType] = useState('Standard');
  const [leverage, setLeverage] = useState('1:300');
  const [isSuccess, setIsSuccess] = useState(false);
  const [newLogin, setNewLogin] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const login = Math.floor(200000000 + Math.random() * 900000000);
    setNewLogin(login);
    setIsSuccess(true);
    showToast('success', 'Trading Account Created', `New MT5 Account #${login} generated successfully.`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/client/dashboard" className="text-xs text-purple-400 hover:underline flex items-center gap-1.5 mb-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="font-serif text-3xl font-bold text-white tracking-tight">Open New Trading Account</h1>
        <p className="text-xs text-slate-400 mt-1">Configure live or demo account on Ocean Markets infrastructure</p>
      </div>

      <div className="bg-[#0E1422] border border-[#1C263C] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        {isSuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-white">Account Ready</h3>
              <p className="text-xs text-slate-400 mt-1">Your new MT5 account has been provisioned.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#12192A] border border-[#1E2B44] text-center space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Account Login ID</span>
              <div className="font-mono text-2xl font-extrabold text-amber-400">#{newLogin}</div>
              <span className="text-xs text-slate-400 font-mono">Server: OceanMarkets-Live • 1:300</span>
            </div>

            <div className="flex justify-center gap-3">
              <Link
                href="/client/dashboard"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
              >
                Go to Dashboard
              </Link>
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="px-4 py-2 rounded-xl bg-[#141C2C] text-slate-300 text-xs font-bold hover:bg-[#1A2538]"
              >
                Open Another Account
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase text-slate-400 font-bold block mb-1.5">
                Trading Platform
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['MT5', 'cTrader'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      platform === p
                        ? 'border-purple-500 bg-purple-950/30 text-purple-300'
                        : 'border-[#1E2B44] bg-[#12192A] text-slate-300 hover:bg-[#162035]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 font-bold block mb-1.5">
                Account Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Standard', 'ECN', 'Islamic'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                      type === t
                        ? 'border-purple-500 bg-purple-950/30 text-purple-300'
                        : 'border-[#1E2B44] bg-[#12192A] text-slate-300 hover:bg-[#162035]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 font-bold block mb-1.5">
                Leverage
              </label>
              <select
                value={leverage}
                onChange={(e) => setLeverage(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#12192A] border border-[#1E2B44] rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="1:100">1:100</option>
                <option value="1:200">1:200</option>
                <option value="1:300">1:300 (Recommended)</option>
                <option value="1:500">1:500</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D9A05B] to-[#C28C42] hover:brightness-110 text-[#130E07] font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Create Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
