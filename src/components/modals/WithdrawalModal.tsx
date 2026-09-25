'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Landmark, 
  CreditCard, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  DollarSign, 
  Wallet,
  AlertCircle,
  Check
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { clsx } from 'clsx';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose }) => {
  const { showToast, impersonation, clientUser, clients, createWithdrawalRequest } = useCRM();
  const rawClient = impersonation.client || clientUser || clients[0];
  const client = (rawClient?.id ? clients.find(c => c.id === rawClient.id || c.email === rawClient.email) : null) || rawClient;

  const defaultAccounts: any[] = [];
  const accounts = client?.accounts && client.accounts.length > 0 ? client.accounts : defaultAccounts;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRoute, setSelectedRoute] = useState<'bank' | 'crypto'>('bank');
  const [selectedAccount, setSelectedAccount] = useState<string>(accounts[0]?.login?.toString() || '');
  const [amount, setAmount] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState(client?.name || '');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync selectedAccount when accounts load
  React.useEffect(() => {
    if (accounts.length > 0 && (!selectedAccount || !accounts.some(a => a.login?.toString() === selectedAccount))) {
      setSelectedAccount(accounts[0].login?.toString() || '');
    }
  }, [accounts, selectedAccount]);

  const activeAccount = accounts.find(a => a.login?.toString() === selectedAccount) || accounts[0];
  const availableBalance = activeAccount?.balance ?? 0;

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setIsSuccess(false);
    onClose();
  };

  const handleSetMax = () => {
    setAmount(availableBalance.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount || '0');
    if (parsedAmount <= 0) {
      showToast('error', 'Invalid Amount', 'Please enter a valid withdrawal amount.');
      return;
    }
    if (parsedAmount > availableBalance) {
      showToast('error', 'Insufficient Funds', `Available balance in account #${selectedAccount} is $${availableBalance.toFixed(2)}.`);
      return;
    }

    createWithdrawalRequest({
      clientId: client?.id,
      clientName: client?.name,
      clientEmail: client?.email,
      tradingAccountId: `acc_${selectedAccount}`,
      accountLogin: parseInt(selectedAccount),
      requestedAmount: parsedAmount,
      fee: 0,
      currency: 'USD',
      paymentMethod: selectedRoute === 'crypto' ? 'crypto_usdt' : 'bank_transfer',
      destinationType: selectedRoute === 'crypto' ? 'Crypto_Wallet' : 'Bank_Account',
      destinationDetails: selectedRoute === 'crypto'
        ? { walletAddress: cryptoAddress || 'TRC20-Wallet', network: 'TRC-20' }
        : { bankName, accountNumber, accountHolder: beneficiaryName },
      clientBalance: availableBalance,
      clientEquity: availableBalance,
      plan: 'STANDARD',
    });

    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none flex items-start sm:items-center justify-center">
      <div className="relative w-full max-w-4xl my-auto bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 font-sans flex flex-col md:flex-row max-h-[calc(100dvh-1rem)] sm:max-h-[90vh]">
        
        {/* MOBILE STICKY HEADER (Visible on < md screens so header & close button are NEVER cut off) */}
        <div className="md:hidden p-3.5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/90 sticky top-0 z-20 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase tracking-wider font-heading">
                Step {step} of 3
              </span>
              <span className="text-xs font-bold text-slate-800 truncate font-heading">
                {step === 1 && 'Select account'}
                {step === 2 && 'Set amount & route'}
                {step === 3 && 'Confirm destination'}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1 mt-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LEFT COLUMN: GUIDED DRAWER (Desktop Only, hidden on mobile) */}
        <div className="hidden md:flex w-72 bg-slate-50/90 border-r border-slate-200/80 p-5 sm:p-6 flex-col justify-between shrink-0 overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            {/* Top Brand Tag */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase tracking-wider font-heading">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Secure Payout
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 font-heading tracking-tight mt-1.5">
                Withdrawal center
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Review your funded accounts, choose a payout route, and send the request through a clearer guided surface.
              </p>
            </div>

            {/* Current Route & Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                  Progress
                </span>
                <span className="text-[11px] font-bold text-blue-700 font-mono">
                  Step {step} of 3 • {selectedRoute === 'bank' ? 'Bank transfer' : 'Crypto'}
                </span>
              </div>
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
                { num: 1, title: 'Select account', desc: 'Pick the funded account you want to withdraw from.' },
                { num: 2, title: 'Set amount and route', desc: 'Define the payout amount and delivery method.' },
                { num: 3, title: 'Confirm destination', desc: 'Add bank or wallet details and submit the request.' },
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
                        {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : s.num}
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
            Direct custodial settlement
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN CONTENT */}
        <div className="flex-1 p-4 sm:p-7 flex flex-col justify-between overflow-y-auto custom-scrollbar">
          <div>
            {/* Desktop Header with Close Button (Hidden on mobile) */}
            <div className="hidden md:flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider font-heading">
                  Fund Withdrawal
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading tracking-tight mt-1">
                  Withdraw funds
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Move money out of your trading account with a guided workflow for bank and wallet payouts.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
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
                    <h4 className="text-2xl font-extrabold text-slate-900 font-heading">Payout Initiated</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Your withdrawal request of ${parseFloat(amount || '0').toLocaleString()} has been queued for verification.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                    <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Estimated Settlement</p>
                    <p className="text-sm font-bold text-blue-700 font-heading">Same Day Payout Processing</p>
                    <p className="text-xs text-slate-500 font-mono">From: 98989898989 • Fee: $0.00</p>
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
                /* STEP 1: Select Source Account & Amount (Matching Screenshot 1 exactly) */
                <div className="space-y-5 max-w-lg mx-auto">
                  {/* Source Account Box */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-heading">
                        Source Account
                      </span>
                      <span className="text-xs text-slate-400 font-mono">1 account available</span>
                    </div>

                    <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/40 relative">
                      {accounts.length > 1 ? (
                        <div className="mb-3">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-heading block mb-1">
                            Choose Trading Account
                          </label>
                          <select
                            value={selectedAccount}
                            onChange={(e) => setSelectedAccount(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-blue-200 bg-white text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                          >
                            {accounts.map((acc) => (
                              <option key={acc.login} value={acc.login}>
                                Account #{acc.login} • {acc.type || 'MT5'} (${acc.balance?.toFixed(2) ?? '0.00'})
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : null}

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                          <Landmark className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 font-heading">
                              {activeAccount?.type || 'BASIC'}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-800">#{selectedAccount}</span>
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                                Available Balance
                              </p>
                              <p className="text-xl font-extrabold text-slate-900 font-mono">
                                ${availableBalance.toFixed(2)}
                              </p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-blue-100/80 text-blue-700 flex items-center justify-center">
                              <DollarSign className="w-4 h-4 stroke-[2.5]" />
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                            Funds will be deducted from this account once approved by admin.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payout Amount Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 font-heading">
                        Enter Withdrawal Amount ($)
                      </span>
                      <button
                        type="button"
                        onClick={handleSetMax}
                        className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        Max: ${availableBalance.toFixed(2)}
                      </button>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        value={amount}
                        max={availableBalance}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="500"
                        className="w-full pl-8 pr-16 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-bold font-mono focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleSetMax}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-[10px] font-bold uppercase cursor-pointer"
                      >
                        Max
                      </button>
                    </div>
                  </div>
                </div>
              ) : step === 2 ? (
                /* STEP 2: Choose Payout Route & Enter Destination Details */
                <div className="space-y-4 max-w-lg mx-auto">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading block mb-2">
                      Choose Delivery Method
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedRoute('bank')}
                        className={clsx(
                          'p-3 rounded-xl border text-left transition-all cursor-pointer',
                          selectedRoute === 'bank'
                            ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs'
                            : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                        )}
                      >
                        <Landmark className="w-5 h-5 text-blue-600 mb-1" />
                        <div className="text-xs font-bold font-heading">Bank Transfer</div>
                        <div className="text-[10px] text-slate-500 font-mono">SWIFT / Local Wire</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRoute('crypto')}
                        className={clsx(
                          'p-3 rounded-xl border text-left transition-all cursor-pointer',
                          selectedRoute === 'crypto'
                            ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs'
                            : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                        )}
                      >
                        <CreditCard className="w-5 h-5 text-emerald-600 mb-1" />
                        <div className="text-xs font-bold font-heading">Crypto Payout</div>
                        <div className="text-[10px] text-slate-500 font-mono">USDT (TRC-20)</div>
                      </button>
                    </div>
                  </div>

                  {selectedRoute === 'bank' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-heading block mb-1">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="e.g. Standard Chartered"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-heading block mb-1">
                          Beneficiary Account Number / IBAN
                        </label>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="Enter account number or IBAN"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-heading block mb-1">
                        Destination USDT (TRC-20) Wallet Address
                      </label>
                      <input
                        type="text"
                        value={cryptoAddress}
                        onChange={(e) => setCryptoAddress(e.target.value)}
                        placeholder="e.g. T9yD14Nj9j7xAB4..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-800"
                      />
                    </div>
                  )}
                </div>
              ) : (
                /* STEP 3: Confirm Destination & Payout Breakdown */
                <div className="space-y-4 max-w-lg mx-auto">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                      Payout Summary
                    </p>
                    <div className="flex justify-between py-1 border-b border-slate-200/60 font-mono">
                      <span className="text-slate-500">Source Account:</span>
                      <span className="font-bold text-slate-800">#98989898989 (BASIC)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60 font-mono">
                      <span className="text-slate-500">Payout Amount:</span>
                      <span className="font-bold text-slate-900">${parseFloat(amount || '0').toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60 font-mono">
                      <span className="text-slate-500">Processing Fee:</span>
                      <span className="font-bold text-emerald-600">$0.00 (Zero Fee)</span>
                    </div>
                    <div className="flex justify-between py-1 font-mono text-sm">
                      <span className="font-bold text-slate-700">Net Transfer:</span>
                      <span className="font-extrabold text-blue-700">${parseFloat(amount || '0').toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2 text-xs text-blue-900">
                    <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Funds will be debited from MT5 #98989898989 upon submission. Verification takes 1-3 business hours.</span>
                  </div>
                </div>
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
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Payout Request</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
