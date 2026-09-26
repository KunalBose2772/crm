'use client';

import React, { useState } from 'react';
import { 
  X, 
  Award, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  CheckCircle2, 
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { TradingAccount } from '@/types/crm';
import { useCRM } from '@/context/CRMContext';

interface BecomeMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: TradingAccount[];
  clientId: string;
  clientName: string;
  onSuccess: (newMaster: any) => void;
}

export const BecomeMasterModal: React.FC<BecomeMasterModalProps> = ({
  isOpen,
  onClose,
  accounts,
  clientId,
  clientName,
  onSuccess,
}) => {
  const { showToast } = useCRM();

  const [selectedLogin, setSelectedLogin] = useState<string>(
    accounts.length > 0 ? accounts[0].login.toString() : ''
  );
  const [strategyName, setStrategyName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [profitShare, setProfitShare] = useState<number>(20);
  const [minInvestment, setMinInvestment] = useState<number>(50);
  const [riskLevel, setRiskLevel] = useState<number>(2);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLogin) {
      showToast('error', 'Select Account', 'Please select an MT5 trading account.');
      return;
    }

    if (!strategyName.trim()) {
      showToast('error', 'Strategy Name Required', 'Please enter your strategy name.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/copy-trading/masters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientName || 'Master Trader',
          login: selectedLogin,
          strategyName,
          description: description || 'Professional MT5 multi-asset strategy.',
          totalProfitShare: profitShare,
          minInvestment,
          riskScore: riskLevel,
        }),
      });

      const data = await res.json();

      if (data.success) {
        showToast('success', 'Strategy Published', 'Your Master Trader Strategy is now live!');
        onSuccess(data.master);
        onClose();
      } else {
        showToast('error', 'Submission Failed', data.error || 'Failed to register strategy');
      }
    } catch (err: any) {
      showToast('error', 'Submission Error', err.message || 'Network error occurred');
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
                <Award className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-900 font-heading truncate">
                  Become a Master Trader
                </h2>
                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                  Publish your MT5 account &amp; earn profit commissions
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

          {/* Scrollable Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Your Master Account (MT5)
              </label>
              <select
                value={selectedLogin}
                onChange={(e) => setSelectedLogin(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-emerald-600 bg-white"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.login.toString()}>
                    MT5 #{acc.login} ({acc.type}) — Balance: ${acc.balance.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Strategy Public Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Gold Momentum"
                value={strategyName}
                onChange={(e) => setStrategyName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Strategy Description &amp; Rules
              </label>
              <textarea
                rows={3}
                placeholder="Explain your pairs, risk limits, stop loss approach, and expected holding duration..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Profit Share (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={profitShare}
                    onChange={(e) => setProfitShare(parseInt(e.target.value, 10) || 20)}
                    className="w-full px-3.5 py-2 pr-8 rounded-xl border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-emerald-600"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Min Investment ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                  <input
                    type="number"
                    min="25"
                    step="25"
                    value={minInvestment}
                    onChange={(e) => setMinInvestment(parseInt(e.target.value, 10) || 50)}
                    className="w-full pl-7 pr-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Self-Assessed Risk Score (1: Low to 5: High)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setRiskLevel(lvl)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      riskLevel === lvl
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

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
                className="w-2/3 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publish Strategy</span>
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
