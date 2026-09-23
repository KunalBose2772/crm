'use client';

import React, { useState } from 'react';
import { 
  RotateCw, 
  ChevronDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { Transaction } from '@/types/crm';
import { initialDashboardTransactions } from '@/services/api/dashboardAnalytics';
import Link from 'next/link';

export interface RecentTransactionsSectionProps {
  data?: Transaction[];
  onRefresh?: () => Promise<void> | void;
  className?: string;
}

export const RecentTransactionsSection: React.FC<RecentTransactionsSectionProps> = ({
  data,
  onRefresh,
  className,
}) => {
  const transactions = data && data.length > 0 ? data : initialDashboardTransactions;

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await new Promise((res) => setTimeout(res, 500));
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter & Sort
  const filteredTransactions = transactions
    .filter((tx) => {
      if (typeFilter === 'all') return true;
      return tx.type.toLowerCase() === typeFilter.toLowerCase();
    })
    .sort((a, b) => {
      if (sortBy === 'amount') return b.amount - a.amount;
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  const formatCurrency = (val: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className={clsx(
      "rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-3.5 sm:p-5 md:p-6 shadow-xs select-none relative overflow-hidden transition-all",
      className
    )}>
      {/* 1. Header with Filters (matching Image 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight font-heading">
            Recent Transactions
          </h3>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh transactions"
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"
          >
            <RotateCw className={clsx("w-3.5 h-3.5", isRefreshing && "animate-spin text-purple-600")} />
          </button>
        </div>

        {/* Filters on the right (matching Image 1) */}
        <div className="flex items-center gap-2">
          {/* All Types Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setTypeDropdownOpen(!typeDropdownOpen);
                setSortDropdownOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span>{typeFilter === 'all' ? 'All Types' : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {typeDropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 rounded-2xl bg-white border border-slate-200 shadow-xl p-1 z-30 animate-in fade-in zoom-in-95">
                {['all', 'deposit', 'withdrawal'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTypeFilter(t);
                      setTypeDropdownOpen(false);
                    }}
                    className={clsx(
                      'w-full text-left px-3 py-1.5 text-xs rounded-xl transition-colors cursor-pointer font-medium',
                      typeFilter === t ? 'bg-purple-50 text-purple-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort by Date Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSortDropdownOpen(!sortDropdownOpen);
                setTypeDropdownOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span>{sortBy === 'date' ? 'Sort by Date' : sortBy === 'amount' ? 'Sort by Amount' : 'Sort by Status'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {sortDropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 rounded-2xl bg-white border border-slate-200 shadow-xl p-1 z-30 animate-in fade-in zoom-in-95">
                {[
                  { id: 'date', label: 'Sort by Date' },
                  { id: 'amount', label: 'Sort by Amount' },
                  { id: 'status', label: 'Sort by Status' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSortBy(s.id as any);
                      setSortDropdownOpen(false);
                    }}
                    className={clsx(
                      'w-full text-left px-3 py-1.5 text-xs rounded-xl transition-colors cursor-pointer font-medium',
                      sortBy === s.id ? 'bg-purple-50 text-purple-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Transactions Table matching Image 1 */}
      <div className="overflow-x-auto custom-scrollbar mt-2">
        <table className="w-full text-left text-xs sm:text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-blue-900/80 uppercase tracking-wider font-heading">
              <th className="py-3 px-3.5">#</th>
              <th className="py-3 px-3.5">Account & Method</th>
              <th className="py-3 px-3.5">Name & Email</th>
              <th className="py-3 px-3.5">Type</th>
              <th className="py-3 px-3.5">Amount</th>
              <th className="py-3 px-3.5">Date & Time</th>
              <th className="py-3 px-3.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {filteredTransactions.map((tx, idx) => {
              const isDeposit = tx.type === 'deposit';
              return (
                <tr key={tx.id} className="hover:bg-purple-50/20 transition-colors">
                  <td className="py-3 px-3.5 font-mono text-xs text-slate-400 tabular-nums">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-slate-900 font-mono text-xs tabular-nums">
                      {tx.accountLogin || tx.referenceId}
                    </div>
                    <div className="text-[11px] text-slate-400 capitalize">
                      {tx.method}
                    </div>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                      {tx.clientName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {tx.clientEmail}
                    </div>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className={clsx(
                      "inline-flex items-center gap-1 font-semibold text-xs",
                      isDeposit ? "text-emerald-600" : "text-rose-500"
                    )}>
                      {isDeposit ? (
                        <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      )}
                      <span className="capitalize">{tx.type}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3.5">
                    <span className={clsx(
                      "font-mono font-bold text-xs sm:text-sm tabular-nums",
                      isDeposit ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {isDeposit ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-xs text-slate-500 tabular-nums">
                    {formatDate(tx.timestamp)}
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <span className={clsx(
                      "inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold font-sans",
                      tx.status === 'completed' && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                      tx.status === 'pending' && "bg-amber-50 text-amber-700 border border-amber-200",
                      tx.status === 'rejected' && "bg-rose-50 text-rose-700 border border-rose-200"
                    )}>
                      {tx.status === 'completed' ? 'Approved' : tx.status === 'pending' ? 'Pending' : 'Rejected'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
