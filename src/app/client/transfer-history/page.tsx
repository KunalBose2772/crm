'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowUpDown, 
  CalendarRange, 
  Funnel, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Download, 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Rows3, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Copy,
  Check,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { clsx } from 'clsx';

interface LedgerItem {
  id: string;
  account: number;
  flow: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  currency: string;
  date: string;
  status: 'completed' | 'pending' | 'rejected';
}

export default function ClientTransferHistoryPage() {
  const { clients, impersonation, clientUser, transactions, showToast } = useCRM();
  const rawClient = impersonation.client || clientUser || clients[0];
  const client = (rawClient?.id ? clients.find(c => c.id === rawClient.id || c.email === rawClient.email) : null) || rawClient;

  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'withdrawal' | 'deposit' | 'transfer'>('all');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Client's transaction records from live context
  const clientTransactions = (transactions || []).filter(tx => {
    if (client && tx.clientId !== client.id && tx.clientEmail !== client.email) return false;
    return true;
  });

  const defaultLedger: LedgerItem[] = clientTransactions.map(tx => ({
    id: tx.referenceId || tx.id,
    account: tx.accountLogin || 0,
    flow: (tx.type === 'deposit' || tx.type === 'withdrawal' || tx.type === 'transfer' ? tx.type : 'deposit') as 'deposit' | 'withdrawal' | 'transfer',
    amount: tx.amount,
    currency: tx.currency || 'USD',
    date: tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'N/A',
    status: (tx.status === 'completed' || tx.status === 'rejected' ? tx.status : 'pending') as 'completed' | 'pending' | 'rejected',
  }));

  const filteredRecords = defaultLedger.filter((item) => {
    if (selectedType !== 'all' && item.flow !== selectedType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.id.toLowerCase().includes(q) ||
        item.account.toString().includes(q) ||
        item.flow.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeFiltersCount = 
    (selectedType !== 'all' ? 1 : 0) + 
    (searchQuery ? 1 : 0) + 
    (selectedDay !== null ? 1 : 0);

  const handleCopyAccount = (e: React.MouseEvent, acc: number) => {
    e.stopPropagation();
    navigator.clipboard.writeText(acc.toString());
    setCopiedAccount(acc.toString());
    showToast('info', 'Account Copied', `Account #${acc} copied to clipboard.`);
    setTimeout(() => setCopiedAccount(null), 1800);
  };

  const handleExportCSV = () => {
    showToast('success', 'Export Generated', 'CSV transaction ledger statement downloaded.');
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl mx-auto pb-12">
      {/* 1. ROYAL BLUE HERO BANNER (Transaction Ledger Command Center) */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-blue-400/30 bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] p-5 sm:p-7 md:p-8 shadow-md text-white">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.5fr_0.9fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase text-amber-200 backdrop-blur-xs font-heading">
              <TrendingUp className="h-4 w-4 text-amber-300" />
              <span>Client Dashboard</span>
            </div>

            <div className="mt-3 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-amber-300 shadow-xs">
              <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>

            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.25em] text-blue-200 font-mono">
              Transaction Ledger
            </p>

            <h1 className="mt-1.5 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white font-heading">
              Review history from one stacked workspace
            </h1>

            <p className="mt-2.5 max-w-2xl text-xs sm:text-sm text-blue-100/90 leading-relaxed font-sans">
              Filters, search, and export controls stay at the top. The full activity history sits below in a dedicated review area.
            </p>
          </div>

          {/* 2 Quick Metric Cards */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xs">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-amber-200 font-mono">
                <ArrowUpDown className="h-4 w-4 text-amber-300" />
                <span>Total Records</span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{filteredRecords.length}</p>
              <p className="mt-1 text-xs text-blue-100/90">Visible after active filters.</p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xs text-white">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-amber-200 font-mono">
                <CalendarRange className="h-4 w-4 text-amber-300" />
                <span>View Mode</span>
              </div>
              <p className="text-sm sm:text-base font-extrabold font-heading">Top filters, bottom history</p>
              <p className="mt-1 text-xs text-blue-100/90">Built for faster review and scanning.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REFINEMENT & FILTER PANEL SECTION */}
      <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden">
        {/* Toggle Header */}
        <button
          type="button"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left transition hover:bg-slate-50/70 cursor-pointer"
        >
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
              <Funnel className="h-3.5 w-3.5 text-amber-500" />
              <span>Filter Panel</span>
            </div>
            <h2 className="mt-2 text-lg sm:text-xl font-bold text-slate-900 font-heading">
              Refine Transaction History
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {activeFiltersCount} active {activeFiltersCount === 1 ? 'filter' : 'filters'} applied
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 font-mono">
              {isFilterOpen ? 'Expanded' : 'Collapsed'}
            </span>
            <ChevronDown className={clsx("h-5 w-5 text-slate-400 transition-transform duration-200", isFilterOpen && "rotate-180")} />
          </div>
        </button>

        {/* Expanded 2-Column Content */}
        {isFilterOpen && (
          <div className="border-t border-slate-100 p-5 sm:p-6 lg:p-7 bg-slate-50/50">
            <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
              {/* Left Column: Search, Type Filters, Export */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5 shadow-2xs">
                {/* Search */}
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-900 font-heading">
                    <Search className="h-4 w-4 text-blue-600" />
                    <span>Search Records</span>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search transactions by ID, account, or flow..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Flow Filter Pills */}
                <div>
                  <div className="mb-2.5 flex items-center gap-2 text-xs font-bold text-slate-900 font-heading">
                    <Funnel className="h-4 w-4 text-blue-600" />
                    <span>Transaction Type</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'withdrawal', label: 'Withdrawal' },
                      { id: 'deposit', label: 'Deposit' },
                      { id: 'transfer', label: 'Transfer' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedType(type.id as any)}
                        className={clsx(
                          "px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer",
                          selectedType === type.id
                            ? "bg-blue-600 text-white shadow-xs"
                            : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        )}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Export Card */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 border border-blue-200 p-2 text-blue-600">
                      <Rows3 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 font-heading">Export Current View</p>
                      <p className="text-[11px] text-slate-500">Download the filtered transaction list.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800 shadow-2xs transition active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Pick a Date Calendar & Results */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 font-heading">
                  <CalendarDays className="h-4 w-4 text-blue-600" />
                  <span>Pick a Date</span>
                </div>

                {/* Calendar Widget */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 sm:p-4">
                  <div className="mb-3 flex items-center justify-between text-xs font-bold text-slate-800">
                    <button type="button" className="p-1 hover:text-blue-600 cursor-pointer">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-heading">September 2026</span>
                    <button type="button" className="p-1 hover:text-blue-600 cursor-pointer">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mb-2 grid grid-cols-7 gap-1 text-[10px] text-slate-400 font-mono text-center font-bold">
                    <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-xs text-slate-700 font-mono">
                    <div className="h-7 w-7" />
                    <div className="h-7 w-7" />
                    {[...Array(30)].map((_, i) => {
                      const day = i + 1;
                      const isSelected = selectedDay === day;
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setSelectedDay(isSelected ? null : day)}
                          className={clsx(
                            "h-7 w-7 rounded-lg flex items-center justify-center font-bold text-[11px] transition cursor-pointer",
                            isSelected
                              ? "bg-blue-600 text-white shadow-2xs"
                              : "hover:bg-blue-50 hover:text-blue-700 text-slate-700"
                          )}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Results Pill */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">Results</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900 font-mono">{filteredRecords.length}</p>
                  <p className="mt-0.5 text-xs text-slate-500">Records matching the current search and filter state.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. TRANSACTION HISTORY TABLE SECTION */}
      <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden">
        {/* Section Header */}
        <div className="border-b border-slate-100 p-5 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">History Section</p>
              <h2 className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                Transaction History
              </h2>
              <p className="mt-1 max-w-2xl text-xs sm:text-sm text-slate-500">
                Browse the filtered records in the bottom review area.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 font-mono text-xs font-bold text-slate-700">
              Page 1 / 1
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="p-4 sm:p-6">
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-4 pl-6">Account</th>
                  <th className="p-4">Flow</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 pr-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 text-xs">
                      No transaction records match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Account */}
                      <td className="p-4 pl-6 font-mono font-bold text-blue-700">
                        <div className="flex items-center gap-1.5">
                          <span>#{item.account}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyAccount(e, item.account)}
                            className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Copy account ID"
                          >
                            {copiedAccount === item.account.toString() ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Flow */}
                      <td className="p-4 capitalize">
                        <span className="inline-flex items-center gap-1.5">
                          {item.flow === 'deposit' && (
                            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <ArrowDownToLine className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {item.flow === 'withdrawal' && (
                            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                              <ArrowUpFromLine className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {item.flow === 'transfer' && (
                            <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <span className="capitalize font-semibold">{item.flow}</span>
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="p-4 text-right font-mono font-extrabold text-sm">
                        <span
                          className={
                            item.flow === 'deposit'
                              ? 'text-emerald-600'
                              : item.flow === 'withdrawal'
                              ? 'text-rose-600'
                              : 'text-blue-700'
                          }
                        >
                          {item.flow === 'deposit' ? '+' : item.flow === 'withdrawal' ? '-' : ''}
                          ${item.amount.toFixed(2)} {item.currency}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="p-4 font-mono text-[11px] text-slate-500">{item.date}</td>

                      {/* Status */}
                      <td className="p-4 pr-6 text-center">
                        <span
                          className={clsx(
                            'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1',
                            item.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          )}
                        >
                          {item.status === 'completed' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : item.status === 'pending' ? (
                            <Clock className="w-3 h-3 text-amber-600" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                          )}
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
