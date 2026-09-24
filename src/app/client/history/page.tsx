'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ArrowLeftRight, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Download, 
  Search, 
  Filter,
  Copy,
  Check
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { ClientPageHeader } from '@/components/layout/ClientPageHeader';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  status: 'completed' | 'processing' | 'approved';
  date: string;
  method: string;
  account: string;
  fee: number;
}

export default function ClientHistoryPage() {
  const { showToast } = useCRM();
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdrawal' | 'transfer'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const mockHistory: Transaction[] = [
    { id: 'TX-10928', type: 'deposit', amount: 500.00, status: 'completed', date: '2026-03-20 14:32', method: 'USDT (TRC-20)', account: 'MT5 #98989898989', fee: 0.00 },
    { id: 'TX-10814', type: 'deposit', amount: 1200.00, status: 'completed', date: '2026-03-15 10:15', method: 'Credit Card', account: 'MT5 #98989898989', fee: 0.00 },
    { id: 'TX-10702', type: 'transfer', amount: 250.00, status: 'completed', date: '2026-03-12 09:20', method: 'Internal Liquidity', account: 'MT5 #98989898989 -> #260730279', fee: 0.00 },
    { id: 'TX-10502', type: 'withdrawal', amount: 350.00, status: 'completed', date: '2026-03-10 18:40', method: 'Bank Wire', account: 'MT5 #98989898989', fee: 0.00 },
    { id: 'TX-10488', type: 'deposit', amount: 4500.00, status: 'completed', date: '2026-03-01 11:05', method: 'USDT (TRC-20)', account: 'MT5 #98989898989', fee: 0.00 },
    { id: 'TX-10319', type: 'withdrawal', amount: 125.00, status: 'completed', date: '2026-02-24 16:12', method: 'USDT (TRC-20)', account: 'MT5 #98989898989', fee: 0.00 },
  ];

  const filteredHistory = mockHistory.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        tx.id.toLowerCase().includes(q) ||
        tx.method.toLowerCase().includes(q) ||
        tx.account.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showToast('info', 'ID Copied', `Transaction reference ${id} copied.`);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleExport = () => {
    showToast('success', 'Export Generated', 'CSV transaction ledger statement downloaded.');
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl mx-auto pb-12">
      {/* 1. ROYAL BLUE PAGE HEADER */}
      <ClientPageHeader
        badge="Ledger Audit"
        badgeIcon={<FileText className="h-6 w-6 sm:h-7 sm:w-7 text-blue-200" />}
        title="Transaction History"
        subtitle="Complete, cryptographically verified audit log of all deposits, withdrawals, and internal transfers."
        chips={[
          { label: 'Settled Volume', value: '$6,925.00', icon: <DollarSign className="w-3.5 h-3.5 text-emerald-300" /> },
          { label: 'Ledger Health', value: '100% Reconciled', icon: <CheckCircle2 className="w-3.5 h-3.5 text-blue-200" /> },
        ]}
        actionButton={
          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2.5 rounded-full bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export Statement</span>
          </button>
        }
      />

      {/* 2. CONTROLS BAR: Filter Tabs & Search */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'deposit', label: 'Deposits' },
            { id: 'withdrawal', label: 'Withdrawals' },
            { id: 'transfer', label: 'Transfers' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-heading transition-all cursor-pointer whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, method, account..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* 3. TRANSACTION TABLE CARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-mono uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6 font-bold">Transaction ID</th>
                <th className="p-4 font-bold">Type</th>
                <th className="p-4 font-bold">Method / Gateway</th>
                <th className="p-4 font-bold">Account</th>
                <th className="p-4 font-bold">Timestamp</th>
                <th className="p-4 font-bold text-right">Fee</th>
                <th className="p-4 font-bold text-right">Amount ($ USD)</th>
                <th className="p-4 pr-6 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                    No transactions match your search filter.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-blue-700">
                      <div className="flex items-center gap-1.5">
                        <span>{tx.id}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(tx.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Copy ID"
                        >
                          {copiedId === tx.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="p-4 capitalize font-semibold">
                      <span className="inline-flex items-center gap-1.5">
                        {tx.type === 'deposit' && (
                          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <ArrowDownToLine className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {tx.type === 'withdrawal' && (
                          <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                            <ArrowUpFromLine className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {tx.type === 'transfer' && (
                          <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className="capitalize">{tx.type}</span>
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-700">{tx.method}</td>
                    <td className="p-4 font-mono text-[11px] text-slate-500">{tx.account}</td>
                    <td className="p-4 text-slate-500 font-mono text-[11px]">{tx.date}</td>
                    <td className="p-4 text-right font-mono text-slate-400 font-medium">${tx.fee.toFixed(2)}</td>
                    <td className="p-4 text-right font-mono font-extrabold text-sm">
                      <span
                        className={
                          tx.type === 'deposit'
                            ? 'text-emerald-600'
                            : tx.type === 'withdrawal'
                            ? 'text-rose-600'
                            : 'text-blue-700'
                        }
                      >
                        {tx.type === 'deposit' ? '+' : tx.type === 'withdrawal' ? '-' : ''}
                        ${tx.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
