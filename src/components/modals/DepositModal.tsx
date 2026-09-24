'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Landmark, 
  CreditCard, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  CheckCircle2, 
  Copy, 
  Sparkles,
  QrCode,
  Check
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { clsx } from 'clsx';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const { showToast, impersonation } = useCRM();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRoute, setSelectedRoute] = useState<'bank' | 'crypto'>('crypto');
  const [amount, setAmount] = useState('500');
  const [refNumber, setRefNumber] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setIsSuccess(false);
    onClose();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('info', 'Address Copied', 'USDT TRC-20 wallet address copied to clipboard.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    showToast(
      'success',
      'Deposit Request Submitted',
      `Deposit of $${parseFloat(amount || '0').toLocaleString()} has been queued for verification.`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 font-sans flex flex-col md:flex-row min-h-[520px]">
        {/* LEFT COLUMN: GUIDED DRAWER (Matching Screenshot 2 exactly) */}
        <div className="w-full md:w-72 bg-slate-50/90 border-b md:border-b-0 md:border-r border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            {/* Top Brand Tag */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase tracking-wider font-heading">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Secure Funding
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 font-heading tracking-tight mt-1.5">
                Deposit center
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Review payment routes and submit verification.
              </p>
            </div>

            {/* Current Route & Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                  Current Route
                </span>
                <span className="text-[11px] font-bold text-blue-700 font-mono">
                  Step {step} of 3
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 font-sans">
                {selectedRoute === 'bank' ? 'Bank transfer' : 'Crypto or UPI'}
              </p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Steps List */}
            <div className="space-y-3 pt-2">
              {[
                { num: 1, title: 'Choose route', desc: 'Pick bank transfer or wallet funding' },
                { num: 2, title: 'Select destination', desc: 'Choose the wallet you will fund through' },
                { num: 3, title: 'Submit proof', desc: 'Attach the transfer reference and payment receipt' },
              ].map((s) => {
                const isActive = step === s.num;
                const isCompleted = step > s.num;
                return (
                  <div
                    key={s.num}
                    onClick={() => {
                      if (step > s.num) setStep(s.num as any);
                    }}
                    className={clsx(
                      'p-2.5 rounded-xl border text-left transition-all',
                      isActive
                        ? 'border-blue-500 bg-white shadow-xs'
                        : isCompleted
                        ? 'border-slate-200 bg-white/60 cursor-pointer hover:bg-white'
                        : 'border-transparent text-slate-400'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={clsx(
                          'w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 font-mono',
                          isActive
                            ? 'bg-blue-600 text-white'
                            : isCompleted
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-500'
                        )}
                      >
                        {isCompleted ? '✓' : s.num}
                      </div>
                      <span
                        className={clsx(
                          'text-xs font-bold font-heading',
                          isActive ? 'text-blue-900' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                        )}
                      >
                        {s.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 pl-7 leading-tight">
                      {s.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/80 text-[10px] text-slate-400 font-mono">
            Encrypted 256-bit gateway
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN CONTENT */}
        <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between">
          <div>
            {/* Header with Close Button */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider font-heading">
                  Method
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading tracking-tight mt-1">
                  {step === 1 && 'Choose funding method'}
                  {step === 2 && 'Set deposit amount & account'}
                  {step === 3 && 'Submit payment proof'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {step === 1 && 'Start by choosing the channel that matches how you transferred funds.'}
                  {step === 2 && 'Select your trading account and specify the funding amount.'}
                  {step === 3 && 'Attach your transaction reference or receipt to speed up confirmation.'}
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

            {/* Content Based on Current Step */}
            <div className="py-5">
              {isSuccess ? (
                <div className="text-center py-6 space-y-4 max-w-md mx-auto animate-in fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-extrabold text-slate-900 font-heading">Deposit Request Received</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Your transfer of ${parseFloat(amount || '0').toLocaleString()} has been queued for verification.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                    <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Transaction Status</p>
                    <p className="text-sm font-bold text-amber-600 font-heading">Processing (1-3 Business Days)</p>
                    <p className="text-xs text-slate-500 font-mono">Target: 98989898989 • Standard</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : step === 1 ? (
                /* STEP 1: Route Selection Cards */
                <div className="space-y-4">
                  {/* Alert banner */}
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Select a card to start your deposit. Each option opens the next step with the exact funding details you need.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Bank Transfer Card */}
                    <div
                      onClick={() => setSelectedRoute('bank')}
                      className={clsx(
                        'p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none',
                        selectedRoute === 'bank'
                          ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-md'
                          : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700">
                            <Landmark className="w-5 h-5 text-blue-600" />
                          </div>
                          {selectedRoute === 'bank' && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
                              Selected Route
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-extrabold text-slate-900 font-heading">Bank transfer</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Best when you need a traditional funding trail with bank-backed settlement details.
                        </p>

                        <div className="mt-3 inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          Typical review: 1 to 3 business days
                        </div>

                        <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            Bank account details provided before upload
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            Designed for larger manual transfers
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Crypto or UPI Card */}
                    <div
                      onClick={() => setSelectedRoute('crypto')}
                      className={clsx(
                        'p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none',
                        selectedRoute === 'crypto'
                          ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-md'
                          : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700">
                            <CreditCard className="w-5 h-5 text-emerald-600" />
                          </div>
                          {selectedRoute === 'crypto' && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
                              Selected Route
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-extrabold text-slate-900 font-heading">Crypto or UPI</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Best for faster confirmation when you already sent funds from a supported wallet or through UPI.
                        </p>

                        <div className="mt-3 inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                          Real-time after confirmation
                        </div>

                        <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Supported: USDT (TRC20/ERC20), BTC, UPI QR
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Instant network verification
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : step === 2 ? (
                /* STEP 2: Amount & Destination Account */
                <div className="space-y-4 max-w-lg mx-auto">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading block mb-1.5">
                      Target Trading Account
                    </label>
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-bold uppercase">
                          BASIC
                        </span>
                        <span className="font-mono text-sm font-bold text-slate-900">98989898989</span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">Balance: $5,937.47</span>
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
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-bold font-mono focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                    {/* Quick amount chips */}
                    <div className="flex gap-2 mt-2">
                      {['100', '500', '1000', '5000'].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setAmount(chip)}
                          className={clsx(
                            'px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer',
                            amount === chip ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          )}
                        >
                          +${chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Route Address Box */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                      {selectedRoute === 'crypto' ? 'Send USDT (TRC-20) to Address' : 'Bank Wire Account Details'}
                    </p>
                    {selectedRoute === 'crypto' ? (
                      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200">
                        <span className="font-mono text-xs text-slate-800 truncate">
                          TX9aB2cD4eF6gH8jK1mN3pQ5rS7tU9vW2x
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy('TX9aB2cD4eF6gH8jK1mN3pQ5rS7tU9vW2x')}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors shrink-0 cursor-pointer"
                        >
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-700 space-y-1 font-mono">
                        <div>Beneficiary: <strong>Ocean Markets Global Ltd.</strong></div>
                        <div>Account: <strong>987654321000</strong></div>
                        <div>Bank: <strong>Standard Chartered Bank</strong></div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* STEP 3: Reference & Upload Proof */
                <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading block mb-1.5">
                      Transaction Reference Number / TXID
                    </label>
                    <input
                      type="text"
                      required
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                      placeholder="e.g. 0x8a9f... or BANK-REF-98124"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading block mb-1.5">
                      Upload Payment Receipt
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-blue-500 bg-slate-50/50 transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">Click to upload transfer screenshot</p>
                      <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, PDF up to 10MB</p>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Footer Controls */}
          {!isSuccess && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((step - 1) as any)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep((step + 1) as any)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Deposit Request</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
