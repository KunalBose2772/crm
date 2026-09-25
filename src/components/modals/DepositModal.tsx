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
  const { showToast, impersonation, clientUser, clients, createDepositRequest } = useCRM();
  const rawClient = impersonation.client || clientUser || clients[0];
  const client = (rawClient?.id ? clients.find(c => c.id === rawClient.id || c.email === rawClient.email) : null) || rawClient;

  const defaultAccounts: any[] = [];
  const accounts = client?.accounts && client.accounts.length > 0 ? client.accounts : defaultAccounts;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRoute, setSelectedRoute] = useState<'bank' | 'crypto'>('crypto');
  const [selectedAccount, setSelectedAccount] = useState<string>(accounts[0]?.login?.toString() || '');
  const [amount, setAmount] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [treasury, setTreasury] = useState({
    usdtAddress: 'TX9aB2cD4eF6gH8jK1mN3pQ5rS7tU9vW2x',
    bankIban: 'GB82BARC20000012345678',
    bankName: 'Standard Chartered Bank',
    bankBeneficiary: 'Ocean Markets Global Ltd.',
  });

  // Load broker treasury configuration
  React.useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setTreasury({
            usdtAddress: data.settings.usdtAddress || 'TX9aB2cD4eF6gH8jK1mN3pQ5rS7tU9vW2x',
            bankIban: data.settings.bankIban || 'GB82BARC20000012345678',
            bankName: data.settings.bankName || 'Standard Chartered Bank',
            bankBeneficiary: data.settings.bankBeneficiary || 'Ocean Markets Global Ltd.',
          });
        }
      })
      .catch(() => {});
  }, []);

  // Keep selectedAccount in sync when accounts load
  React.useEffect(() => {
    if (accounts.length > 0 && (!selectedAccount || !accounts.some(a => a.login?.toString() === selectedAccount))) {
      setSelectedAccount(accounts[0].login?.toString() || '');
    }
  }, [accounts, selectedAccount]);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setIsSuccess(false);
    setReceiptFile(null);
    setReceiptPreview(null);
    setRefNumber('');
    setAmount('');
    onClose();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('info', 'Address Copied', 'USDT TRC-20 wallet address copied to clipboard.');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'File Too Large', 'Please upload a file smaller than 10MB.');
      return;
    }
    setReceiptFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setReceiptPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }
    showToast('success', 'File Selected', `${file.name} ready for submission.`);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    const parsedAmount = parseFloat(amount || '0');
    if (parsedAmount <= 0) {
      showToast('error', 'Invalid Amount', 'Please enter a valid deposit amount.');
      return;
    }

    if (!selectedAccount && accounts.length > 0) {
      setSelectedAccount(accounts[0].login?.toString() || '');
    }

    setIsUploading(true);
    let uploadedReceiptUrl: string | undefined = undefined;

    if (receiptFile) {
      try {
        const formData = new FormData();
        formData.append('file', receiptFile);
        formData.append('bucket', 'deposit-receipts');
        formData.append('clientId', client?.id || 'client');
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.url) {
          uploadedReceiptUrl = uploadData.url;
        }
      } catch (err) {
        console.error('Receipt upload failed, continuing with deposit request:', err);
      }
    }

    createDepositRequest({
      clientId: client?.id,
      clientName: client?.name,
      clientEmail: client?.email,
      accountLogin: parseInt(selectedAccount || accounts[0]?.login?.toString() || '0', 10),
      amount: parsedAmount,
      paymentMethod: selectedRoute === 'crypto' ? 'crypto_usdt' : 'bank_transfer',
      txHash: refNumber || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      currency: 'USD',
      plan: 'STANDARD',
      remarks: uploadedReceiptUrl ? `Receipt: ${uploadedReceiptUrl}` : undefined,
    });

    setIsUploading(false);
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
                {step === 1 && 'Choose funding method'}
                {step === 2 && 'Set deposit amount & account'}
                {step === 3 && 'Submit payment proof'}
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
            Encrypted 256-bit gateway
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN CONTENT */}
        <div className="flex-1 p-4 sm:p-7 flex flex-col justify-between overflow-y-auto custom-scrollbar">
          <div>
            {/* Desktop Header with Close Button (Hidden on mobile) */}
            <div className="hidden md:flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
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
                    <h4 className="text-2xl font-extrabold text-slate-900 font-heading">Deposit Request Received</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Your transfer of ${parseFloat(amount || '0').toLocaleString()} has been queued for verification.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                    <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Transaction Status</p>
                    <p className="text-sm font-bold text-amber-600 font-heading">Processing (Instant / Same-Day Approval)</p>
                    <p className="text-xs text-slate-700 font-mono font-bold">
                      Target MT5 Account: #{selectedAccount || accounts[0]?.login || 'Active'}
                    </p>
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
                    <select
                      value={selectedAccount}
                      onChange={(e) => setSelectedAccount(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                    >
                      {accounts.length === 0 ? (
                        <option value="">No MT5 Accounts Found — Please Open an Account First</option>
                      ) : (
                        accounts.map((acc: any) => {
                          const bal = typeof acc.balance === 'number' ? acc.balance : parseFloat(acc.balance || '0');
                          const accType = acc.accountType || acc.type || 'MT5';
                          return (
                            <option key={acc.login} value={acc.login}>
                              Account #{acc.login} • {accType} (${bal.toFixed(2)})
                            </option>
                          );
                        })
                      )}
                    </select>
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

                  {/* Payment Route Address & Real-time Scannable QR Box */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-heading flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-blue-600" />
                        <span>{selectedRoute === 'crypto' ? 'Instant Scan or Copy USDT (TRC-20)' : 'Bank Wire Account Details'}</span>
                      </p>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                        {selectedRoute === 'crypto' ? 'TRC20 Network' : 'SWIFT / SEPA'}
                      </span>
                    </div>

                    {selectedRoute === 'crypto' ? (
                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        {/* Compact Real-Time Scannable QR Code */}
                        <div className="relative group shrink-0">
                          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-lg p-1 bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-xs">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(treasury.usdtAddress)}&color=0f172a&bgcolor=ffffff`}
                              alt="Deposit QR Code"
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          </div>
                          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-slate-800 text-white tracking-widest whitespace-nowrap">
                            Scan
                          </span>
                        </div>

                        {/* Address Details & Fast Copy */}
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div>
                            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Broker Deposit Address</div>
                            <div className="font-mono text-[11px] sm:text-xs text-slate-800 font-bold break-all bg-slate-50 p-1.5 rounded-lg border border-slate-100 select-all">
                              {treasury.usdtAddress}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <span className="text-[10px] text-slate-500 font-medium">
                              Scan with Binance, OKX, TrustWallet or UPI
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(treasury.usdtAddress)}
                              className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center gap-1 transition-colors shrink-0 cursor-pointer border border-blue-200/60"
                            >
                              {copied ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        {/* Compact QR for Bank Transfer Beneficiary Reference */}
                        <div className="relative group shrink-0">
                          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-lg p-1 bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-xs">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`IBAN:${treasury.bankIban};BENEFICIARY:${treasury.bankBeneficiary};BANK:${treasury.bankName}`)}&color=0f172a&bgcolor=ffffff`}
                              alt="Bank Details QR"
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          </div>
                          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-slate-800 text-white tracking-widest whitespace-nowrap">
                            Wire
                          </span>
                        </div>

                        <div className="min-w-0 flex-1 text-[11px] text-slate-700 space-y-1 font-mono">
                          <div className="truncate">Beneficiary: <strong className="text-slate-900">{treasury.bankBeneficiary}</strong></div>
                          <div className="truncate">IBAN: <strong className="text-slate-900 select-all">{treasury.bankIban}</strong></div>
                          <div className="truncate">Bank: <strong className="text-slate-900">{treasury.bankName}</strong></div>
                          <button
                            type="button"
                            onClick={() => handleCopy(treasury.bankIban)}
                            className="mt-1 px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] inline-flex items-center gap-1 border border-blue-200/60 cursor-pointer"
                          >
                            <Copy className="w-2.5 h-2.5" />
                            <span>Copy IBAN</span>
                          </button>
                        </div>
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
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                      placeholder="e.g. 0x8a9f... or BANK-REF-98124 (Optional)"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading block mb-1.5">
                      Upload Payment Receipt
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={clsx(
                        "border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer group",
                        receiptFile ? "border-emerald-500 bg-emerald-50/30" : "border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/30"
                      )}
                    >
                      {receiptFile ? (
                        <div className="space-y-2">
                          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                          <p className="text-xs font-bold text-emerald-800 truncate max-w-xs mx-auto">
                            {receiptFile.name} ({(receiptFile.size / 1024).toFixed(1)} KB)
                          </p>
                          <p className="text-[10px] text-emerald-600 underline font-semibold">Click to choose a different file</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-600 mx-auto mb-2 transition-colors" />
                          <p className="text-xs font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
                            Click to upload transfer screenshot
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, PDF up to 10MB</p>
                        </>
                      )}
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
                  disabled={isUploading}
                  onClick={() => handleSubmit()}
                  className={clsx(
                    "px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer",
                    isUploading ? "bg-emerald-400 cursor-not-allowed opacity-80" : "bg-emerald-600 hover:bg-emerald-700 active:scale-98"
                  )}
                >
                  {isUploading ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Deposit Request</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
