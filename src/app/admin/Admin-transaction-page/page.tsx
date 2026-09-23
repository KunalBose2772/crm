'use client';

import React from 'react';
import { useCRM } from '@/context/CRMContext';
import { Transaction } from '@/types/crm';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { MetricCard } from '@/components/ui/MetricCard';
import { 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Scale
} from 'lucide-react';

export default function AdminTransactionPage() {
  const { transactions, stats } = useCRM();

  const columns: Column<Transaction>[] = [
    {
      header: 'Reference ID',
      accessorKey: 'referenceId',
      sortable: true,
      className: 'font-mono text-xs text-purple-700 font-bold tabular-nums',
    },
    {
      header: 'Client',
      accessorKey: 'clientName',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900 font-sans">{row.clientName}</div>
          <div className="text-xs text-slate-500 font-sans">{row.clientEmail}</div>
        </div>
      ),
    },
    {
      header: 'Account',
      accessorKey: 'accountLogin',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-bold tabular-nums">
          {row.accountLogin ? `#${row.accountLogin}` : 'Wallet'}
        </span>
      ),
    },
    {
      header: 'Type',
      accessorKey: 'type',
      sortable: true,
      cell: (row) => {
        const t = row.type;
        return (
          <span className="capitalize text-xs font-bold text-purple-800 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 font-sans">
            {t.replace(/_/g, ' ')}
          </span>
        );
      },
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      sortable: true,
      cell: (row) => {
        const isNegative = row.type === 'withdrawal' || row.type === 'debit_correction';
        return (
          <span className={`font-mono font-bold text-xs sm:text-sm tabular-nums ${isNegative ? 'text-rose-600' : 'text-emerald-600'}`}>
            {isNegative ? '-' : '+'}
            {row.amount.toLocaleString()} {row.currency}
          </span>
        );
      },
    },
    {
      header: 'Method / Gateway',
      accessorKey: 'method',
      sortable: true,
      cell: (row) => <span className="text-xs font-semibold text-slate-700">{row.method}</span>,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Timestamp',
      accessorKey: 'timestamp',
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-slate-500" suppressHydrationWarning>
          {new Date(row.timestamp).toLocaleDateString()} {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: (row) => (
        <span className="text-xs text-slate-500 truncate max-w-[200px] block" title={row.description}>
          {row.description}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Unified Transaction Ledger</h2>
        <p className="text-xs text-slate-500 mt-1">
          Complete, immutable audit log of all financial operations including deposits, payouts, bonuses, and partner commissions.
        </p>
      </div>

      {/* Summary KPI Cards - Royal Purple Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard
          title="Settled Inflows"
          value={`$${stats.totalDepositsVolume.toLocaleString()}`}
          icon={<ArrowDownToLine className="w-5 h-5" />}
        />
        <MetricCard
          title="Settled Disbursements"
          value={`$${stats.totalWithdrawalsVolume.toLocaleString()}`}
          icon={<ArrowUpFromLine className="w-5 h-5" />}
        />
        <MetricCard
          title="Net Cash Position"
          value={`$${stats.netCashFlow.toLocaleString()}`}
          icon={<Scale className="w-5 h-5" />}
        />
      </div>

      {/* Ledger Table */}
      <DataTable
        data={transactions as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchPlaceholder="Search by reference ID, client name, email, or method..."
        searchKeys={['referenceId', 'clientName', 'clientEmail', 'method', 'description']}
        filters={[
          {
            key: 'type',
            label: 'Type',
            options: [
              { label: 'Deposit', value: 'deposit' },
              { label: 'Withdrawal', value: 'withdrawal' },
              { label: 'Trading Bonus', value: 'credit_bonus' },
              { label: 'IB Commission', value: 'ib_commission' },
              { label: 'Correction Debit', value: 'debit_correction' },
            ],
          },
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Completed', value: 'completed' },
              { label: 'Pending', value: 'pending' },
              { label: 'Failed', value: 'failed' },
            ],
          },
        ]}
        exportFilename="crm-unified-transactions-ledger.csv"
      />
    </div>
  );
}
