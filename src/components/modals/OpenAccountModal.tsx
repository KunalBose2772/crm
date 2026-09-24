'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  DollarSign, 
  Star, 
  Monitor, 
  Scale, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Check 
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { clsx } from 'clsx';

interface OpenAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OpenAccountModal: React.FC<OpenAccountModalProps> = ({ isOpen, onClose }) => {
  const { showToast, clientModal, closeClientModal } = useCRM();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<'BASIC' | 'STANDARD' | 'VVIP'>('STANDARD');
  const [leverage, setLeverage] = useState('1:300');
  const [isSuccess, setIsSuccess] = useState(false);
  const [newLogin, setNewLogin] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setIsSuccess(false);
    onClose();
  };

  const handleCreate = () => {
    const login = Math.floor(200000000 + Math.random() * 900000000);
    setNewLogin(login);
    setIsSuccess(true);
    showToast('success', 'Trading Account Created', `New MT5 ${selectedType} Account #${login} generated successfully.`);
  };

  const accountTypes = [
    {
      id: 'BASIC' as const,
      name: 'BASIC',
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      tag: 'Starter Account',
      deposit: '$5.00 - $2,500',
      description: 'Perfect for beginners entering live markets',
      features: 'Low minimum deposit • Instant execution • Negative balance protection',
      platform: 'MT5',
      leverageOptions: '3 leverage options',
    },
    {
      id: 'STANDARD' as const,
      name: 'STANDARD',
      icon: <DollarSign className="w-5 h-5 text-blue-600" />,
      tag: 'Professional Account',
      deposit: '$3,000 - $4,000',
      description: 'Built for serious & active traders',
      features: 'Tighter spreads from 0.8 pips • Zero commission • Full EA support',
      platform: 'MT5',
      leverageOptions: '4 leverage options',
    },
    {
      id: 'VVIP' as const,
      name: 'VVIP',
      icon: <Star className="w-5 h-5 text-indigo-600" />,
      tag: 'Partner / IB Account',
      deposit: '$5,000 - $10,000',
      description: 'Best for introducers & business partners',
      features: 'Multi-level rebate structure • Dedicated account manager • Institutional liquidity',
      platform: 'MT5',
      leverageOptions: '2 leverage options',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 font-sans">
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase tracking-wider font-heading">
              {step === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading mt-1 flex items-center gap-2">
              {step === 1 ? '🚀 Open New Trading Account' : '⚙️ Account Configuration'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === 1
                ? 'Select the setup that matches your strategy and risk profile'
                : 'Finalize leverage and platform details before launch'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 sm:py-7">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4 max-w-md mx-auto animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 font-heading">Account Ready</h3>
                <p className="text-xs text-slate-500 mt-1">Your live trading account is provisioned and ready.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Trading Account Login</p>
                <p className="font-mono text-3xl font-extrabold text-blue-700">#{newLogin}</p>
                <p className="text-xs text-slate-600 font-mono">
                  {selectedType} • {leverage} • Ocean Markets Ltd.
                </p>
              </div>

              <div className="flex gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : step === 1 ? (
            /* STEP 1: 3 Account Type Cards */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
                {accountTypes.map((acc) => {
                  const isSelected = selectedType === acc.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => setSelectedType(acc.id)}
                      className={clsx(
                        'relative p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none',
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-md'
                          : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
                      )}
                    >
                      <div>
                        {/* Top: Icon + Radio Indicator */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center">
                            {acc.icon}
                          </div>
                          <div
                            className={clsx(
                              'w-5 h-5 rounded-full border flex items-center justify-center transition-all',
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-300 bg-white'
                            )}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        {/* Title & Tags */}
                        <h4 className="text-base font-extrabold text-slate-900 font-heading tracking-tight">
                          {acc.name}
                        </h4>
                        <div className="mt-1 flex flex-wrap gap-1 text-[11px] font-semibold text-slate-600">
                          <span className="text-emerald-700">{acc.tag}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-blue-700 font-mono">Deposit: {acc.deposit}</span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                          {acc.description}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                          {acc.features}
                        </p>
                      </div>

                      {/* Bottom Badges */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[10px] font-bold text-slate-500">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                          <Monitor className="w-3 h-3 text-slate-400" />
                          {acc.platform}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                          <Scale className="w-3 h-3 text-slate-400" />
                          {acc.leverageOptions}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  <span className="font-bold text-slate-700 font-heading uppercase text-[10px] tracking-wider mr-1.5">
                    Selection Status:
                  </span>
                  Pick one account type to continue to leverage setup.
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer self-end sm:self-auto"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: Account Configuration */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left 2 Cols: Form Inputs */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading block mb-2 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Leverage Ratio
                    </label>
                    <select
                      value={leverage}
                      onChange={(e) => setLeverage(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer font-mono"
                    >
                      <option value="1:100">1:100 (Conservative)</option>
                      <option value="1:200">1:200 (Balanced)</option>
                      <option value="1:300">1:300 (Standard)</option>
                      <option value="1:500">1:500 (High Leverage)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading block mb-2 flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-blue-600" />
                      Trading Platform
                    </label>
                    <input
                      type="text"
                      value="MT5 (MetaTrader 5)"
                      readOnly
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 text-xs font-bold font-mono cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Right 1 Col: Quick Summary Box */}
                <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                    Quick Summary
                  </p>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-mono block">Account Type</span>
                      <span className="font-extrabold text-slate-900 font-heading">{selectedType}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-mono block">Platform</span>
                      <span className="font-extrabold text-slate-900 font-mono">MT5</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-mono block">Leverage</span>
                      <span className="font-extrabold text-blue-600 font-mono">{leverage}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-mono block">KYC Status</span>
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold font-sans">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[10px] uppercase text-slate-400 font-mono block">Trading Accounts</span>
                      <span className="font-bold text-slate-700 font-mono">1/3 accounts used</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleCreate}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Create Trading Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
