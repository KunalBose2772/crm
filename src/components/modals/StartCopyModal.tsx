'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  Sliders, 
  DollarSign, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';
import { MasterTrader, TradingAccount } from '@/types/crm';
import { useCRM } from '@/context/CRMContext';

interface StartCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  master: MasterTrader | null;
  accounts: TradingAccount[];
  clientId: string;
  onSuccess: (sub: any) => void;
}

export const StartCopyModal: React.FC<StartCopyModalProps> = ({
  isOpen,
  onClose,
  master,
  accounts,
  clientId,
  onSuccess,
}) => {
  const { showToast } = useCRM();

  const [selectedLogin, setSelectedLogin] = useState<string>(
    accounts.length > 0 ? accounts[0].login.toString() : ''
  );
  const [investmentAmount, setInvestmentAmount] = useState<number>(
    master?.minInvestment || 100
  );
  const [copyMode, setCopyMode] = useState<'proportional' | 'equal' | 'fixed_ratio'>('proportional');
  const [customMultiplier, setCustomMultiplier] = useState<number>(1.0);
  const [riskStopPercent, setRiskStopPercent] = useState<number>(25);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !master) return null;

  const selectedAccount = accounts.find(
    (acc) => acc.login.toString() === selectedLogin
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLogin) {
      showToast('error', 'Account Selection Required', 'Please select a trading account to copy trades to.');
      return;
    }

    if (investmentAmount < master.minInvestment) {
      showToast('error', 'Minimum Capital Required', `Minimum investment for this master is $${master.minInvestment}.`);
      return;
    }

    if (selectedAccount && selectedAccount.balance < investmentAmount) {
      showToast(
        'error',
        'Insufficient Balance',
        `Insufficient account balance ($${selectedAccount.balance.toLocaleString()}). Please deposit or enter a lower amount.`
      );
      return;
    }

    if (!agreedToTerms) {
      showToast('error', 'Terms Required', 'Please accept the risk disclosure and copy trading terms.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/copy-trading/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          masterId: master.id,
          masterName: master.name,
          masterAvatar: master.avatar,
          copierAccountLogin: selectedLogin,
          allocatedAmount: investmentAmount,
          copyMode,
          multiplier: copyMode === 'fixed_ratio' ? customMultiplier : 1.0,
          riskStopPercent,
        }),
      });

      const data = await res.json();

      if (data.success) {
        showToast('success', 'Strategy Connected', `Started copying ${master.name}!`);
        onSuccess(data.subscription);
        onClose();
      } else {
        showToast('error', 'Connection Failed', data.error || 'Failed to start copying');
      }
    } catch (err: any) {
      showToast('error', 'Connection Error', err.message || 'Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none">
        <div className="w-screen max-w-md sm:max-w-lg pointer-events-auto bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
          {/* Header - Clean, Flat, Professional Solid Style */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-900 font-heading truncate">
                  Copy {master.name}
                </h2>
                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                  {master.strategyName} • Gain: <span className="text-emerald-600 font-bold">+{master.overallGain}%</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Master Overview Mini Strip */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 grid grid-cols-4 gap-2 text-left">
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Fee</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">{master.totalProfitShare}% profit</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Min</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">${master.minInvestment}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Risk</span>
                <span className="font-bold text-emerald-600 text-xs mt-0.5 block">Level {master.riskScore}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Copiers</span>
                <span className="font-bold text-blue-600 text-xs mt-0.5 block">{master.totalCopiers.toLocaleString()}</span>
              </div>
            </div>

            {/* Account Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Your Trading Account
              </label>
              {accounts.length === 0 ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>No active accounts found. Please open a live trading account first.</span>
                </div>
              ) : (
                <select
                  value={selectedLogin}
                  onChange={(e) => setSelectedLogin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-600 bg-white"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.login.toString()}>
                      MT5 #{acc.login} ({acc.type}) — Balance: ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </option>
                  ))}
                </select>
              )}
              {selectedAccount && (
                <div className="mt-1.5 flex justify-between text-[11px] text-slate-400 px-1">
                  <span>Free Margin: ${selectedAccount.freeMargin?.toLocaleString() || selectedAccount.balance?.toLocaleString()}</span>
                  <span className="font-medium text-slate-600">Server: {selectedAccount.server || 'TheKFMarket-Live'}</span>
                </div>
              )}
            </div>

            {/* Investment Capital */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Investment Capital ($)
                </label>
                <span className="text-[11px] text-blue-600 font-semibold">Min: ${master.minInvestment}</span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                <input
                  type="number"
                  min={master.minInvestment}
                  step="10"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm focus:outline-none focus:border-blue-600 bg-white"
                />
              </div>
              <div className="flex gap-1.5 mt-2">
                {[50, 100, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setInvestmentAmount(amt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      investmentAmount === amt
                        ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Copy Mode - 3 Proportion Types */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Copy Proportion Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* 1. Proportional */}
                <button
                  type="button"
                  onClick={() => setCopyMode('proportional')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    copyMode === 'proportional'
                      ? 'border-blue-600 bg-blue-50/60 text-blue-950 ring-2 ring-blue-600 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold flex items-center justify-between gap-1">
                      <span>Proportional</span>
                      {copyMode === 'proportional' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 leading-snug line-clamp-2">
                      Scales lot sizes in exact ratio to your balance vs Master equity.
                    </div>
                  </div>
                  <span className="inline-block mt-2 text-[9px] font-bold text-blue-600 bg-blue-100/70 px-1.5 py-0.5 rounded w-fit">
                    Recommended
                  </span>
                </button>

                {/* 2. Equal Lot (1:1) */}
                <button
                  type="button"
                  onClick={() => setCopyMode('equal')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    copyMode === 'equal'
                      ? 'border-blue-600 bg-blue-50/60 text-blue-950 ring-2 ring-blue-600 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold flex items-center justify-between gap-1">
                      <span>Equal Lot (1:1)</span>
                      {copyMode === 'equal' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 leading-snug line-clamp-2">
                      Copies identical lot size regardless of copier balance.
                    </div>
                  </div>
                  <span className="inline-block mt-2 text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded w-fit">
                    Direct Mirror
                  </span>
                </button>

                {/* 3. Multiple / Custom Multiplier */}
                <button
                  type="button"
                  onClick={() => setCopyMode('fixed_ratio')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    copyMode === 'fixed_ratio'
                      ? 'border-blue-600 bg-blue-50/60 text-blue-950 ring-2 ring-blue-600 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold flex items-center justify-between gap-1">
                      <span>Multiple (Ratio)</span>
                      {copyMode === 'fixed_ratio' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 leading-snug line-clamp-2">
                      Custom multiple ratio (×0.5, ×1.5, ×2, ×3) of Master's lot size.
                    </div>
                  </div>
                  <span className="inline-block mt-2 text-[9px] font-bold text-purple-600 bg-purple-100/70 px-1.5 py-0.5 rounded w-fit">
                    Custom Multiplier
                  </span>
                </button>
              </div>

              {/* Multiplier Slider / Buttons when Multiple is active */}
              {copyMode === 'fixed_ratio' && (
                <div className="mt-3 p-3 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-950">Multiplier Ratio</span>
                    <span className="font-black text-purple-700 font-heading text-sm">×{customMultiplier}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[0.5, 1.0, 1.5, 2.0, 3.0].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCustomMultiplier(m)}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                          customMultiplier === m
                            ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                            : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-100/50'
                        }`}
                      >
                        ×{m}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-purple-700/80 font-medium">
                    Your copied trade volume will be {customMultiplier} times the volume of the Master Trader's orders.
                  </p>
                </div>
              )}
            </div>

            {/* Drawdown Protection Slider */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-bold text-slate-800">Drawdown Stop-Loss Guard</span>
                </div>
                <span className="text-xs font-extrabold text-blue-600">{riskStopPercent}%</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2.5 leading-relaxed">
                If your allocated equity drops by {riskStopPercent}%, copy trading automatically detaches.
              </p>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={riskStopPercent}
                onChange={(e) => setRiskStopPercent(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                <span>Conservative (10%)</span>
                <span>Moderate (25%)</span>
                <span>Aggressive (50%)</span>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs text-slate-500 leading-normal">
                I accept the {master.totalProfitShare}% profit commission payable to {master.name} on profitable closed trades.
              </span>
            </label>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || accounts.length === 0}
                className="w-2/3 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Start Copying (${investmentAmount})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
