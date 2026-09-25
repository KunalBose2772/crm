'use client';

import React, { useState } from 'react';
import { RotateCw, ChevronDown, Trophy, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { TopPerformingClient } from '@/types/crm';
import { initialTopPerformingClients } from '@/services/api/dashboardAnalytics';

export interface TopPerformingClientsSectionProps {
  data?: TopPerformingClient[];
  onRefresh?: () => Promise<void> | void;
  className?: string;
}

export const TopPerformingClientsSection: React.FC<TopPerformingClientsSectionProps> = ({
  data,
  onRefresh,
  className,
}) => {
  const clients = data && data.length > 0 ? data : initialTopPerformingClients;

  const [sortBy, setSortBy] = useState<'amount' | 'deposits' | 'accounts'>('amount');
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

  const sortedClients = [...clients].sort((a, b) => {
    if (sortBy === 'deposits') return b.depositsCount - a.depositsCount;
    if (sortBy === 'accounts') return b.accountsCount - a.accountsCount;
    return b.totalDeposited - a.totalDeposited;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className={clsx(
      "rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-3.5 sm:p-5 md:p-6 shadow-xs select-none relative overflow-hidden transition-all",
      className
    )}>
      {/* 1. Header with Title & Sort (matching Image 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight font-heading">
              Top Performing Clients
            </h3>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh Top Clients"
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"
            >
              <RotateCw className={clsx("w-3.5 h-3.5", isRefreshing && "animate-spin text-purple-600")} />
            </button>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 font-sans mt-0.5">
            Highest value clients by deposits
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="relative self-start sm:self-center">
          <button
            type="button"
            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <span>
              {sortBy === 'amount' && 'Sort by Amount'}
              {sortBy === 'deposits' && 'Sort by Deposits'}
              {sortBy === 'accounts' && 'Sort by Accounts'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {sortDropdownOpen && (
            <div className="absolute right-0 mt-1 w-40 rounded-2xl bg-white border border-slate-200 shadow-xl p-1 z-30 animate-in fade-in zoom-in-95">
              {[
                { id: 'amount', label: 'Sort by Amount' },
                { id: 'deposits', label: 'Sort by Deposits' },
                { id: 'accounts', label: 'Sort by Accounts' },
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

      {/* 2. Top Clients Table matching Image 2 */}
      <div className="overflow-x-auto custom-scrollbar mt-2">
        <table className="w-full text-left text-xs sm:text-sm min-w-[550px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-700 uppercase tracking-wider font-heading">
              <th className="py-3 px-3.5 w-12">#</th>
              <th className="py-3 px-3.5">Name & Email</th>
              <th className="py-3 px-3.5 text-center">Deposits</th>
              <th className="py-3 px-3.5 text-center">Accounts</th>
              <th className="py-3 px-3.5 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {sortedClients.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                  No client deposit records yet. Top performing traders will appear here.
                </td>
              </tr>
            ) : (
              sortedClients.map((client, idx) => (
                <tr key={client.id} className="hover:bg-purple-50/20 transition-colors">
                  <td className="py-3 px-3.5 font-mono text-xs text-slate-400 tabular-nums">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3.5">
                    <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                      {client.nameOrEmail}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-center font-mono font-medium text-slate-700 tabular-nums">
                    {client.depositsCount}
                  </td>
                  <td className="py-3 px-3.5 text-center font-mono font-medium text-slate-700 tabular-nums">
                    {client.accountsCount}
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <span className="font-mono font-bold text-xs sm:text-sm text-emerald-600 tabular-nums">
                      {formatCurrency(client.totalDeposited)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
