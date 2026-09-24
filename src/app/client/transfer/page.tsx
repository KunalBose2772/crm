'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowRightLeft, 
  Zap, 
  ChevronDown, 
  Funnel, 
  TrendingUp, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Copy,
  Check,
  Wallet
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { clsx } from 'clsx';

interface TransferRecord {
  id: string;
  fromAccount: number;
  toAccount: number;
  amount: number;
  date: string;
  speed: string;
  status: 'completed' | 'processing' | 'pending';
}

export default function ClientTransferPage() {
  const { impersonation, showToast } = useCRM();
  const client = impersonation.client;

  const defaultAccounts = [
    { id: 'acc_02_1', login: 98989898989, platform: 'MT5', type: 'BASIC', balance: 5937.47 },
    { id: 'acc_02_2', login: 260730279, platform: 'MT5', type: 'PRO ECN', balance: 411.20 },
  ];

  const accounts = client?.accounts && client.accounts.length > 0
    ? client.accounts.map((a) => ({
        id: a.id,
        login: a.login,
        platform: a.platform || 'MT5',
        type: a.type || 'BASIC',
        balance: a.balance,
      }))
    : defaultAccounts;

  const [fromAccount, setFromAccount] = useState<string>(accounts[0]?.login.toString() || '98989898989');
  const [toAccount, setToAccount] = useState<string>(accounts[1]?.login.toString() || '260730279');
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter Panel State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'completed' | 'pending'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Transfers list (with realistic initial records or live additions)
  const [transfers, setTransfers] = useState<TransferRecord[]>([
    {
      id: 'TR-91824',
      fromAccount: 98989898989,
      toAccount: 260730279,
      amount: 250.00,
      date: '2026-03-22 14:15:20',
      speed: 'Instant (<1s)',
      status: 'completed',
    },
    {
      id: 'TR-91410',
      fromAccount: 260730279,
      toAccount: 98989898989,
      amount: 100.00,
      date: '2026-03-18 09:42:10',
      speed: 'Instant (<1s)',
      status: 'completed',
    },
  ]);

  const selectedFromAcc = accounts.find((a) => a.login.toString() === fromAccount) || accounts[0];
  const selectedToAcc = accounts.find((a) => a.login.toString() === toAccount) || accounts[1];
  const transferNum = parseFloat(amount) || 0;

  const handleSwap = () => {
    const temp = fromAccount;
    setFromAccount(toAccount);
    setToAccount(temp);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromAccount === toAccount) {
      showToast('error', 'Identical Accounts', 'Source and destination trading accounts cannot be identical.');
      return;
    }
    if (transferNum < 10) {
      showToast('error', 'Minimum Amount', 'Minimum internal transfer amount is $10.00.');
      return;
    }
    if (selectedFromAcc && transferNum > selectedFromAcc.balance) {
      showToast('error', 'Insufficient Balance', `Account #${fromAccount} only has $${selectedFromAcc.balance.toFixed(2)} available.`);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const newRecord: TransferRecord = {
        id: `TR-${Math.floor(10000 + Math.random() * 90000)}`,
        fromAccount: parseInt(fromAccount),
        toAccount: parseInt(toAccount),
        amount: transferNum,
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        speed: 'Instant (<1s)',
        status: 'completed',
      };
      setTransfers((prev) => [newRecord, ...prev]);
      setAmount('');
      showToast('success', 'Transfer Completed', `Transferred $${transferNum.toFixed(2)} from #${fromAccount} to #${toAccount}.`);
    }, 700);
  };

  const filteredTransfers = transfers.filter((t) => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.fromAccount.toString().includes(q) ||
        t.toAccount.toString().includes(q)
      );
    }
    return true;
  });

  const activeFiltersCount = (statusFilter !== 'All' ? 1 : 0) + (searchQuery ? 1 : 0);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showToast('info', 'ID Copied', `Transfer reference ${id} copied.`);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl mx-auto pb-12">
      {/* 1. ROYAL BLUE HERO BANNER (Transfer Command Center) */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-blue-400/30 bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] p-5 sm:p-7 md:p-8 shadow-md text-white">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase text-amber-200 backdrop-blur-xs font-heading">
            <ShieldCheck className="h-4 w-4 text-amber-300" />
            <span>Transfer Command Center</span>
          </div>

          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.25em] text-blue-200 font-mono">
            Client Transfer
          </p>

          <div className="mt-1.5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 max-w-4xl">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white font-heading">
                Move funds across accounts in one vertical workflow.
                <span className="mt-1 block text-xs sm:text-sm font-semibold uppercase tracking-widest text-blue-100 font-sans">
                  Build the transfer, refine the filters, then review history from top to bottom
                </span>
              </h1>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-amber-300 shadow-xs">
              <ArrowRightLeft className="h-7 w-7" />
            </div>
          </div>

          {/* 3 Metric Chips */}
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200 font-mono">Active Filters</p>
              <p className="mt-1 text-lg font-extrabold text-white font-mono">{activeFiltersCount}</p>
              <p className="mt-0.5 text-xs text-blue-100/90">Filters currently applied to the transfer ledger.</p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200 font-mono">Visible Transfers</p>
              <p className="mt-1 text-lg font-extrabold text-white font-mono">{filteredTransfers.length}</p>
              <p className="mt-0.5 text-xs text-blue-100/90">Records matching the current filter state.</p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200 font-mono">Transfer Accounts</p>
              <p className="mt-1 text-lg font-extrabold text-white font-mono">{accounts.length}</p>
              <p className="mt-0.5 text-xs text-blue-100/90">Available accounts you can move funds between.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRANSFER FORM SECTION (Clean Vertical Flow) */}
      <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="border-b border-slate-100 p-5 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span>Transfer Form</span>
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                Create a New Internal Transfer
              </h2>
              <p className="mt-1 max-w-2xl text-xs sm:text-sm text-slate-500">
                The page now follows a clean vertical flow. Choose the source account, select the destination, enter the amount, and submit in a single stacked sequence.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[18rem] shrink-0">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">Processing</p>
                <p className="mt-1 text-sm font-extrabold text-slate-900">Ready to submit</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">Minimum Amount</p>
                <p className="mt-1 text-sm font-extrabold text-slate-900 font-mono">$10.00 USD</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 lg:p-7">
          <form onSubmit={handleExecuteTransfer} className="mx-auto max-w-5xl space-y-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {/* From Account */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
                    From Account (Source)
                  </label>
                  {selectedFromAcc && (
                    <span className="text-xs font-mono text-slate-500 font-semibold">
                      Balance: <span className="font-extrabold text-slate-900">${selectedFromAcc.balance.toFixed(2)}</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <select
                    value={fromAccount}
                    onChange={(e) => setFromAccount(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.login.toString()}>
                        #{acc.login} ({acc.type}) — Balance: ${acc.balance.toFixed(2)} USD
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* To Account */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
                    To Account (Destination)
                  </label>
                  {selectedToAcc && (
                    <span className="text-xs font-mono text-slate-500 font-semibold">
                      Balance: <span className="font-extrabold text-slate-900">${selectedToAcc.balance.toFixed(2)}</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <select
                    value={toAccount}
                    onChange={(e) => setToAccount(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.login.toString()}>
                        #{acc.login} ({acc.type}) — Balance: ${acc.balance.toFixed(2)} USD
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Swap Button */}
            <div className="flex justify-center -my-2 relative z-10">
              <button
                type="button"
                onClick={handleSwap}
                className="p-2.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 shadow-2xs hover:rotate-180 transition-all duration-300 cursor-pointer active:scale-90"
                title="Swap source and destination"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Amount Input */}
            <div className="space-y-3">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
                Amount ($ USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">$</span>
                <input
                  type="number"
                  min="10"
                  step="any"
                  placeholder="Enter transfer amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-8 pr-4 py-3.5 text-base sm:text-lg font-mono font-extrabold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs text-slate-600">
                Minimum transfer: <span className="font-bold text-slate-900">$10</span>. Internal transfers are processed instantly when the balance is available.
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-blue-600 hover:bg-blue-700 px-6 py-4 font-bold text-white transition shadow-xs hover:shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing Internal Settlement...</span>
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="w-5 h-5" />
                    <span>Submit Transfer</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 3. TRANSFER FILTERS SECTION (Collapsible) */}
      <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left transition hover:bg-slate-50/70 cursor-pointer"
        >
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
              <Funnel className="h-3.5 w-3.5 text-amber-500" />
              <span>Transfer Filters</span>
            </div>
            <h2 className="mt-2 text-lg sm:text-xl font-bold text-slate-900 font-heading">
              Refine Transfer History
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Keep account type, status, and date controls in one stacked panel below the transfer form.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 font-mono">
              {activeFiltersCount} active
            </span>
            <ChevronDown className={clsx("h-5 w-5 text-slate-400 transition-transform duration-200", isFilterOpen && "rotate-180")} />
          </div>
        </button>

        {isFilterOpen && (
          <div className="border-t border-slate-100 p-5 sm:p-6 bg-slate-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Account Search */}
              <div>
                <label className="text-[11px] font-mono uppercase font-bold text-slate-500 block mb-1.5">
                  Search by Account # or ID
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. 98989898989 or TR-91824"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-[11px] font-mono uppercase font-bold text-slate-500 block mb-1.5">
                  Transfer Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="completed">Completed / Settled</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer hover:underline"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 4. RECENT TRANSFERS / TRANSFER LEDGER SECTION */}
      <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-100 p-5 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Transfer Ledger
                </div>
                <h2 className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                  Recent Transfers
                </h2>
              </div>
            </div>

            <div className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">
              {filteredTransfers.length} transfers
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-xs sm:text-sm text-slate-500">
            Review the latest internal movements in a single full-width ledger after the form and filter sections.
          </p>
        </div>

        {/* Ledger Table Container */}
        <div className="p-4 sm:p-6">
          {filteredTransfers.length === 0 ? (
            /* Empty State */
            <div className="flex min-h-[240px] flex-col items-center justify-center space-y-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 shadow-2xs">
                <Funnel className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-bold text-slate-900 font-heading">No transfers found</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Try adjusting your filters to see more results
                </p>
              </div>
            </div>
          ) : (
            /* Populated Table */
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-4 pl-5">Transfer ID</th>
                    <th className="p-4">From Account</th>
                    <th className="p-4">To Account</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Execution Speed</th>
                    <th className="p-4 pr-5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredTransfers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-5 font-mono font-bold text-blue-700">
                        <div className="flex items-center gap-1.5">
                          <span>{t.id}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyId(t.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Copy ID"
                          >
                            {copiedId === t.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-semibold text-slate-800">
                        #{t.fromAccount}
                      </td>
                      <td className="p-4 font-mono font-semibold text-slate-800">
                        #{t.toAccount}
                      </td>
                      <td className="p-4 text-right font-mono font-extrabold text-blue-700 text-sm">
                        ${t.amount.toFixed(2)} USD
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-500">{t.date}</td>
                      <td className="p-4 font-mono text-[11px] text-emerald-600 font-bold">{t.speed}</td>
                      <td className="p-4 pr-5 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
