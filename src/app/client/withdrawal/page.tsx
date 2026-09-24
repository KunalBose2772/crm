'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Funnel, 
  ChevronDown, 
  ChevronUp, 
  WalletCards, 
  TrendingDown, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Copy,
  Check,
  ArrowUpFromLine,
  Landmark,
  Wallet
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { clsx } from 'clsx';

export default function ClientWithdrawalPage() {
  const { impersonation, withdrawals, openClientModal, showToast } = useCRM();
  const client = impersonation.client;

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'completed' | 'pending' | 'rejected'>('All');
  const [routeFilter, setRouteFilter] = useState<'All' | 'Bank' | 'Crypto'>('All');
  const [searchAccount, setSearchAccount] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Client's withdrawals from context, filtered to current trader if applicable
  const clientWithdrawals = withdrawals.filter((w) => {
    if (client && w.clientId !== client.id && w.clientEmail !== client.email) {
      return false;
    }
    return true;
  });

  const filteredWithdrawals = clientWithdrawals.filter((w) => {
    if (statusFilter !== 'All' && w.status !== statusFilter) return false;
    if (routeFilter === 'Bank' && w.destinationType !== 'Bank_Account') return false;
    if (routeFilter === 'Crypto' && w.destinationType !== 'Crypto_Wallet') return false;
    if (searchAccount && !w.accountLogin.toString().includes(searchAccount)) return false;
    return true;
  });

  const activeFiltersCount = 
    (statusFilter !== 'All' ? 1 : 0) + 
    (routeFilter !== 'All' ? 1 : 0) + 
    (searchAccount ? 1 : 0);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showToast('info', 'ID Copied', `Withdrawal reference ${id} copied.`);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleResetFilters = () => {
    setStatusFilter('All');
    setRouteFilter('All');
    setSearchAccount('');
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl mx-auto pb-12">
      {/* 1. ROYAL BLUE HERO BANNER (Withdrawal Command Center) */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-blue-400/30 bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] p-5 sm:p-7 md:p-8 shadow-md text-white">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase text-amber-200 backdrop-blur-xs font-heading">
              <ShieldCheck className="h-4 w-4 text-amber-300" />
              <span>Withdrawal Command Center</span>
            </div>

            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.25em] text-blue-200 font-mono">
              Client Withdrawal
            </p>

            <h1 className="mt-1.5 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white font-heading">
              Route capital out with tighter control.
              <span className="mt-1 block text-xs sm:text-sm font-semibold uppercase tracking-widest text-blue-100 font-sans">
                Review payout activity, active filters, and request flow in one lane
              </span>
            </h1>

            {/* Metric Chips */}
            <div className="mt-5 flex flex-wrap gap-2.5">
              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200 font-mono">Active Filters</p>
                <p className="mt-0.5 text-sm sm:text-base font-extrabold text-white font-mono">{activeFiltersCount}</p>
              </div>

              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200 font-mono">Visible Withdrawals</p>
                <p className="mt-0.5 text-sm sm:text-base font-extrabold text-white font-mono">{filteredWithdrawals.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FILTER PANEL SECTION (Collapsible) */}
      <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
          className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left transition hover:bg-slate-50/70 cursor-pointer"
        >
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
              <Funnel className="h-3.5 w-3.5 text-amber-500" />
              <span>Filter Panel</span>
            </div>
            <h2 className="mt-2 text-lg sm:text-xl font-bold text-slate-900 font-heading">Refine Withdrawal History</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Control account type, status, and date range from one cleaner panel.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 font-mono">
              {activeFiltersCount} active
            </span>
            <ChevronDown className={clsx("h-5 w-5 text-slate-400 transition-transform duration-200", isFilterPanelOpen && "rotate-180")} />
          </div>
        </button>

        {isFilterPanelOpen && (
          <div className="border-t border-slate-100 p-5 sm:p-6 bg-slate-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Account Search */}
              <div>
                <label className="text-[11px] font-mono uppercase font-bold text-slate-500 block mb-1.5">
                  Trading Account #
                </label>
                <input
                  type="text"
                  placeholder="e.g. 98989898989"
                  value={searchAccount}
                  onChange={(e) => setSearchAccount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-[11px] font-mono uppercase font-bold text-slate-500 block mb-1.5">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="completed">Completed / Approved</option>
                  <option value="pending">Pending Review</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Payout Route Filter */}
              <div>
                <label className="text-[11px] font-mono uppercase font-bold text-slate-500 block mb-1.5">
                  Payout Route
                </label>
                <select
                  value={routeFilter}
                  onChange={(e) => setRouteFilter(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  <option value="All">All Routes</option>
                  <option value="Crypto">Crypto Wallet (USDT)</option>
                  <option value="Bank">Bank Wire / SWIFT</option>
                </select>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-end">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. WITHDRAWAL LEDGER SECTION */}
      <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden">
        {/* Ledger Header */}
        <div className="border-b border-slate-100 p-5 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-700">
                <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
                <span>Withdrawal Ledger</span>
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">Withdrawal History</h2>
              <p className="mt-1 max-w-2xl text-xs sm:text-sm text-slate-500">
                Review payout requests in a clean ledger layout with faster scanning for account, method, amount, and status.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row lg:items-center shrink-0">
              <button
                type="button"
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-100 lg:hidden cursor-pointer"
              >
                <Funnel className="h-4 w-4 text-amber-500" />
                <span>Filters</span>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-800">{activeFiltersCount}</span>
              </button>

              <button
                type="button"
                onClick={() => openClientModal('withdrawal')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 text-xs sm:text-sm font-bold shadow-xs transition hover:shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <WalletCards className="h-4 w-4" />
                <span>Withdraw Funds</span>
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Inner Card Header */}
        <div className="p-5 sm:p-6 pb-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 shadow-2xs">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">Recent Withdrawals</h3>
                <p className="text-xs text-slate-500">{filteredWithdrawals.length} records</p>
              </div>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Full Ledger View
            </div>
          </div>
        </div>

        {/* Ledger Table Container */}
        <div className="p-4 sm:p-6">
          {filteredWithdrawals.length === 0 ? (
            /* Empty State */
            <div className="flex min-h-[260px] flex-col items-center justify-center space-y-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 shadow-2xs">
                <TrendingDown className="h-8 w-8" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-bold text-slate-900 font-heading">No withdrawals found</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeFiltersCount > 0 ? 'Try adjusting your filters' : 'You have not submitted any withdrawal requests yet'}
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => openClientModal('withdrawal')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                >
                  Withdraw Funds
                </button>
              </div>
            </div>
          ) : (
            /* Populated Table */
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-4 pl-5">Account</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Payout Route</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4">Initiated</th>
                    <th className="p-4">Processed</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4 pr-5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredWithdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-5 font-mono font-bold text-blue-700">
                        #{w.accountLogin}
                      </td>
                      <td className="p-4 capitalize">Payout</td>
                      <td className="p-4 font-sans">
                        <div className="flex items-center gap-1.5">
                          {w.destinationType === 'Crypto_Wallet' ? (
                            <Wallet className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <Landmark className="w-3.5 h-3.5 text-slate-600" />
                          )}
                          <span>
                            {w.destinationType === 'Crypto_Wallet'
                              ? `USDT (${w.destinationDetails?.network || 'TRC20'})`
                              : w.destinationDetails?.bankName || 'Bank Wire'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-mono font-extrabold text-rose-600">
                        -${w.requestedAmount.toFixed(2)} {w.currency}
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-500">{w.createdAt}</td>
                      <td className="p-4 font-mono text-[11px] text-slate-500">{w.updatedAt || '—'}</td>
                      <td className="p-4 font-mono text-[11px] text-slate-400">Standard</td>
                      <td className="p-4 pr-5 text-center">
                        <span
                          className={clsx(
                            'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1',
                            w.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : w.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          )}
                        >
                          {w.status === 'completed' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : w.status === 'pending' ? (
                            <Clock className="w-3 h-3 text-amber-600" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                          )}
                          {w.status}
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
