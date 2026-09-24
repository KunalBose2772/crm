'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Wallet, 
  CircleDollarSign, 
  Landmark, 
  Clock3, 
  ShieldAlert, 
  CircleAlert, 
  Banknote, 
  WalletCards, 
  CircleArrowDown, 
  Building2, 
  History, 
  TimerReset, 
  CheckCircle2, 
  ArrowUpRight, 
  Download, 
  RefreshCw, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { ClientPageHeader } from '@/components/layout/ClientPageHeader';
import { clsx } from 'clsx';

interface PartnerWithdrawalRequest {
  id: string;
  referenceId: string;
  date: string;
  method: 'bank' | 'crypto';
  destination: string;
  details: string;
  amount: number;
  status: 'Settled' | 'Pending' | 'Rejected';
}

export default function ClientPartnerWithdrawalPage() {
  const { showToast } = useCRM();

  // State
  const [withdrawableBalance, setWithdrawableBalance] = useState<number>(540.00);
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<'bank' | 'crypto'>('bank');

  // Bank Form State
  const [bankForm, setBankForm] = useState({
    bankName: 'Chase Manhattan Bank, N.A.',
    accountHolderName: 'Alexander Wright',
    accountNumber: '987654321012',
    ifscCode: 'CHASUS33XXX',
  });

  // Crypto Form State
  const [cryptoForm, setCryptoForm] = useState({
    network: 'USDT (TRC20)',
    walletAddress: 'TYDzsYUE2t...9pLx2Q4W',
    memo: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Recent withdrawal requests
  const [requests, setRequests] = useState<PartnerWithdrawalRequest[]>([
    {
      id: 'pwr-101',
      referenceId: 'IBW-98241',
      date: 'Sep 21, 2026, 14:32',
      method: 'bank',
      destination: 'Chase Manhattan Bank',
      details: '••••1012 | Alexander Wright',
      amount: 450.00,
      status: 'Settled',
    },
    {
      id: 'pwr-102',
      referenceId: 'IBW-98104',
      date: 'Sep 14, 2026, 09:18',
      method: 'crypto',
      destination: 'USDT (TRC20)',
      details: 'TYDzs...Lx2Q4W',
      amount: 391.40,
      status: 'Settled',
    },
  ]);

  const settledCount = requests.filter(r => r.status === 'Settled').length;
  const settledTotal = requests
    .filter(r => r.status === 'Settled')
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const pendingTotal = pendingRequests.reduce((sum, r) => sum + r.amount, 0);

  const totalCommissions = 1381.40;

  const handleMaxClick = () => {
    setAmount(withdrawableBalance.toFixed(2));
  };

  const handleReset = () => {
    setAmount('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    showToast('info', 'Copied to Clipboard', text);
    setTimeout(() => setCopiedText(null), 1800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('error', 'Invalid Amount', 'Please enter a valid withdrawal amount.');
      return;
    }

    if (numAmount > withdrawableBalance) {
      showToast('error', 'Insufficient Balance', `Requested amount exceeds withdrawable balance of $${withdrawableBalance.toFixed(2)}.`);
      return;
    }

    if (method === 'bank') {
      if (!bankForm.bankName || !bankForm.accountHolderName || !bankForm.accountNumber || !bankForm.ifscCode) {
        showToast('error', 'Missing Bank Details', 'Please complete all required bank fields.');
        return;
      }
    } else {
      if (!cryptoForm.walletAddress) {
        showToast('error', 'Missing Wallet Address', 'Please provide a valid destination wallet address.');
        return;
      }
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newRef = `IBW-${Math.floor(10000 + Math.random() * 90000)}`;
      const newReq: PartnerWithdrawalRequest = {
        id: `pwr-${Date.now()}`,
        referenceId: newRef,
        date: 'Just now',
        method,
        destination: method === 'bank' ? bankForm.bankName : cryptoForm.network,
        details: method === 'bank' ? `••••${bankForm.accountNumber.slice(-4)} | ${bankForm.accountHolderName}` : cryptoForm.walletAddress.slice(0, 10) + '...',
        amount: numAmount,
        status: 'Pending',
      };

      setRequests(prev => [newReq, ...prev]);
      setWithdrawableBalance(prev => Math.max(0, prev - numAmount));
      setAmount('');
      setIsSubmitting(false);

      showToast(
        'success',
        'Withdrawal Requested',
        `Request #${newRef} for $${numAmount.toFixed(2)} USD is submitted for processing.`
      );
    }, 700);
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl mx-auto pb-12">
      {/* 1. SIGNATURE ROYAL BLUE HERO BANNER */}
      <ClientPageHeader
        badge="Partner Withdrawal Desk"
        badgeIcon={<ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-300" />}
        title="Route IB commissions through a cleaner payout workflow."
        subtitle="Review withdrawable balance, choose bank or crypto routing, and track recent requests from one unified dashboard surface."
        chips={[
          { label: 'Available now', value: `$${withdrawableBalance.toFixed(2)}`, icon: <Wallet className="w-3.5 h-3.5 text-emerald-300" /> },
          { label: 'Total requests', value: `${requests.length}`, icon: <History className="w-3.5 h-3.5 text-amber-300" /> },
        ]}
      />

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/90 pb-3 overflow-x-auto custom-scrollbar">
        <Link
          href="/client/partner/dashboard"
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition whitespace-nowrap"
        >
          Partner Overview
        </Link>
        <Link
          href="/client/partner/commission"
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition whitespace-nowrap"
        >
          Commission Matrix
        </Link>
        <Link
          href="/client/partner/withdrawal"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs whitespace-nowrap"
        >
          Partner Withdrawal Desk
        </Link>
        <Link
          href="/client/partner/create"
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition whitespace-nowrap"
        >
          Onboarding &amp; Tiers
        </Link>
      </div>

      {/* 2. 4 TOP METRIC CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {/* Withdrawable Balance */}
        <div className="group rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
                Withdrawable balance
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                ${withdrawableBalance.toFixed(2)}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-2xs">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Ready for the next payout request</p>
        </div>

        {/* Total Commissions */}
        <div className="group rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
                Total commissions
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-blue-700 font-mono">
                ${totalCommissions.toFixed(2)}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs">
              <CircleDollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Gross earnings tracked in the partner dashboard</p>
        </div>

        {/* Settled Withdrawals */}
        <div className="group rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
                Settled withdrawals
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                {settledCount}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-600 shadow-2xs">
              <Landmark className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            ${settledTotal.toFixed(2)} completed across approved requests
          </p>
        </div>

        {/* Pending Queue */}
        <div className="group rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
                Pending queue
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">
                ${pendingTotal.toFixed(2)}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600 shadow-2xs">
              <Clock3 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {pendingRequests.length} request{pendingRequests.length !== 1 ? 's' : ''} being processed
          </p>
        </div>
      </div>

      {/* 3. PAYOUT GUIDANCE (Before you submit) */}
      <section className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 lg:p-7 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600 shadow-2xs">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Payout guidance
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
              Before you submit
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              The payout form operates inside the verified partner clearing protocol. Review these checkpoints before submitting.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {/* Card 1 */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 shrink-0">
                <CircleAlert className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-heading">Processing window</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Most requests are audited and reviewed within 24 to 48 hours before automated clearing.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 shrink-0">
                <Banknote className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-heading">Bank routing</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  International SWIFT &amp; SEPA transfers can take 1–3 business days after administrative settlement.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 shrink-0">
                <WalletCards className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-heading">Wallet routing</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Always use a verified personal wallet destination to avoid irreversible blockchain routing failures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WITHDRAWAL FORM (Request Payout) */}
      <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden">
        {/* Form Header */}
        <div className="border-b border-slate-100 p-5 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                <CircleArrowDown className="h-3.5 w-3.5 text-blue-600" />
                <span>Withdrawal form</span>
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                Request payout
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Route your IB commission to a bank account or saved wallet directly from this dashboard.
              </p>
            </div>

            <div className="grid gap-2 sm:min-w-[200px]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-3.5">
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
                  Available balance
                </p>
                <p className="mt-1 text-xl font-extrabold text-slate-900 font-mono">
                  ${withdrawableBalance.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 lg:p-7 space-y-6">
          {/* Info callout cards */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs shrink-0">
                  <Landmark className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 font-heading">Profile-linked payout</p>
                  <p className="text-xs text-slate-500">Bank details are reused when already stored on record.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs shrink-0">
                  <WalletCards className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 font-heading">Flexible routing</p>
                  <p className="text-xs text-slate-500">Switch between bank and crypto without leaving the page.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <label className="text-xs sm:text-sm font-bold text-slate-900 font-heading">
                  Withdrawal amount
                </label>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                  Enter the commission amount to route out
                </p>
              </div>
              <button
                type="button"
                onClick={handleMaxClick}
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition cursor-pointer self-start sm:self-auto font-mono"
              >
                <Wallet className="h-3.5 w-3.5 text-blue-600" />
                <span>Max {withdrawableBalance.toFixed(2)} USD</span>
              </button>
            </div>

            <div className="relative mt-3">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 font-mono">
                USD
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                max={withdrawableBalance}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-16 text-base font-extrabold text-slate-900 outline-none transition placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono shadow-2xs"
              />
            </div>
          </div>

          {/* Method Selector */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-900 font-heading">
                Withdrawal method
              </label>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                Choose where the payout should be routed
              </p>
            </div>

            <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
              {/* Option 1: Bank */}
              <button
                type="button"
                onClick={() => setMethod('bank')}
                className={clsx(
                  "p-4 rounded-xl border text-left transition cursor-pointer flex items-start gap-3.5",
                  method === 'bank'
                    ? "border-blue-500 bg-blue-50/50 shadow-xs"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                )}
              >
                <div className={clsx(
                  "flex h-10 w-10 items-center justify-center rounded-xl border shrink-0 transition",
                  method === 'bank'
                    ? "border-blue-300 bg-blue-100 text-blue-700"
                    : "border-slate-200 bg-slate-100 text-slate-600"
                )}>
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 font-heading">Bank transfer</p>
                  <p className="mt-0.5 text-xs text-slate-500">Send to your saved bank account</p>
                </div>
              </button>

              {/* Option 2: Crypto */}
              <button
                type="button"
                onClick={() => setMethod('crypto')}
                className={clsx(
                  "p-4 rounded-xl border text-left transition cursor-pointer flex items-start gap-3.5",
                  method === 'crypto'
                    ? "border-blue-500 bg-blue-50/50 shadow-xs"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                )}
              >
                <div className={clsx(
                  "flex h-10 w-10 items-center justify-center rounded-xl border shrink-0 transition",
                  method === 'crypto'
                    ? "border-blue-300 bg-blue-100 text-blue-700"
                    : "border-slate-200 bg-slate-100 text-slate-600"
                )}>
                  <Wallet className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 font-heading">Crypto wallet</p>
                  <p className="mt-0.5 text-xs text-slate-500">Route funds to a verified wallet</p>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional Method Details Form */}
          {method === 'bank' ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-4">
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 font-heading">Bank payout details</p>
                <p className="text-xs text-slate-500">These fields are prefilled when profile bank data is available.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Bank name</label>
                  <input
                    type="text"
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    placeholder="Enter bank name"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Account holder name</label>
                  <input
                    type="text"
                    value={bankForm.accountHolderName}
                    onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                    placeholder="Enter account holder name"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Account number</label>
                  <input
                    type="text"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    placeholder="Enter account number"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs font-mono"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">IFSC or SWIFT code</label>
                  <input
                    type="text"
                    value={bankForm.ifscCode}
                    onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                    placeholder="Enter IFSC or SWIFT code"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs font-mono"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-4">
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 font-heading">Crypto wallet payout details</p>
                <p className="text-xs text-slate-500">Provide your verified cryptocurrency wallet address and network.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Cryptocurrency Network</label>
                  <select
                    value={cryptoForm.network}
                    onChange={(e) => setCryptoForm({ ...cryptoForm, network: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs font-mono"
                  >
                    <option value="USDT (TRC20)">USDT (TRC20)</option>
                    <option value="USDT (ERC20)">USDT (ERC20)</option>
                    <option value="BTC (Bitcoin)">BTC (Bitcoin)</option>
                    <option value="ETH (Ethereum)">ETH (Ethereum)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Memo / Tag (Optional)</label>
                  <input
                    type="text"
                    value={cryptoForm.memo}
                    onChange={(e) => setCryptoForm({ ...cryptoForm, memo: e.target.value })}
                    placeholder="Optional memo or destination tag"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Wallet Address</label>
                  <input
                    type="text"
                    value={cryptoForm.walletAddress}
                    onChange={(e) => setCryptoForm({ ...cryptoForm, walletAddress: e.target.value })}
                    placeholder="Enter recipient wallet address"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col gap-3 sm:flex-row pt-2">
            <button
              type="submit"
              disabled={isSubmitting || withdrawableBalance <= 0}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3.5 text-xs sm:text-sm transition shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Request...</span>
                </>
              ) : (
                <>
                  <CircleArrowDown className="w-4 h-4" />
                  <span>Submit withdrawal request</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold px-5 py-3.5 text-xs sm:text-sm transition cursor-pointer"
            >
              Reset form
            </button>
          </div>
        </form>
      </section>

      {/* 5. WITHDRAWAL LEDGER (Recent Requests) */}
      <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden">
        {/* Ledger Header */}
        <div className="border-b border-slate-100 p-5 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                <History className="h-3.5 w-3.5 text-blue-600" />
                <span>Withdrawal ledger</span>
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                Recent requests
              </h2>
              <p className="mt-1 max-w-2xl text-xs sm:text-sm text-slate-500">
                Scan payout activity in a unified dashboard ledger that collapses into cards on mobile.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
              <TimerReset className="h-3.5 w-3.5 text-blue-600" />
              <span>{requests.length} total requests</span>
            </div>
          </div>
        </div>

        {/* Ledger Content */}
        <div className="p-0">
          {requests.length === 0 ? (
            /* Empty State */
            <div className="p-8 sm:p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 mb-4">
                <History className="h-7 w-7" />
              </div>
              <p className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                No withdrawal history yet
              </p>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Your submitted payout requests will appear here once the first withdrawal is created.
              </p>
            </div>
          ) : (
            /* Populated Table / Card List */
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-mono uppercase text-slate-500 font-bold">
                    <tr>
                      <th className="px-6 py-4">Reference ID</th>
                      <th className="px-6 py-4">Date / Time</th>
                      <th className="px-6 py-4">Method</th>
                      <th className="px-6 py-4">Destination</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {requests.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Reference ID */}
                        <td className="px-6 py-4 font-mono font-bold text-blue-700">
                          <div className="flex items-center gap-1.5">
                            <span>{r.referenceId}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(r.referenceId)}
                              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                              title="Copy reference"
                            >
                              {copiedText === r.referenceId ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 font-mono text-slate-500">
                          {r.date}
                        </td>

                        {/* Method */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700 font-bold text-[11px]">
                            {r.method === 'bank' ? (
                              <Building2 className="w-3 h-3 text-blue-600" />
                            ) : (
                              <Wallet className="w-3 h-3 text-emerald-600" />
                            )}
                            {r.method === 'bank' ? 'Bank Transfer' : 'Crypto Wallet'}
                          </span>
                        </td>

                        {/* Destination */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 font-heading">{r.destination}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{r.details}</p>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 text-right font-mono font-extrabold text-slate-900 text-sm">
                          ${r.amount.toFixed(2)} USD
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                          <span className={clsx(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 font-mono",
                            r.status === 'Settled' && "bg-emerald-50 border border-emerald-200 text-emerald-700",
                            r.status === 'Pending' && "bg-amber-50 border border-amber-200 text-amber-700",
                            r.status === 'Rejected' && "bg-rose-50 border border-rose-200 text-rose-700"
                          )}>
                            {r.status === 'Settled' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {r.status === 'Pending' && <Clock3 className="w-3 h-3 text-amber-600" />}
                            {r.status === 'Rejected' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden divide-y divide-slate-100 p-4 space-y-3">
                {requests.map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-700 text-xs">{r.referenceId}</span>
                      <span className={clsx(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 font-mono",
                        r.status === 'Settled' && "bg-emerald-50 border border-emerald-200 text-emerald-700",
                        r.status === 'Pending' && "bg-amber-50 border border-amber-200 text-amber-700",
                        r.status === 'Rejected' && "bg-rose-50 border border-rose-200 text-rose-700"
                      )}>
                        {r.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-mono">{r.date}</span>
                      <span className="font-mono font-bold text-slate-900">${r.amount.toFixed(2)} USD</span>
                    </div>
                    <div className="pt-1 text-xs border-t border-slate-200/60">
                      <p className="font-bold text-slate-800">{r.destination}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{r.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
