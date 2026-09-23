'use client';

import React from 'react';
import { useCRM } from '@/context/CRMContext';
import { IBWithdrawalRequest } from '@/types/crm';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, Clock, Landmark } from 'lucide-react';

export default function IBWithdrawalsPage() {
  const { ibWithdrawals, approveIBWithdrawal, rejectIBWithdrawal } = useCRM();

  const columns: Column<IBWithdrawalRequest>[] = [
    {
      header: 'Request ID',
      accessorKey: 'id',
      sortable: true,
      className: 'font-mono text-xs text-purple-700 font-bold tabular-nums',
    },
    {
      header: 'Partner Details',
      accessorKey: 'ibName',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900 font-sans">{row.ibName}</div>
          <div className="text-xs text-slate-500 font-sans">{row.ibEmail}</div>
        </div>
      ),
    },
    {
      header: 'Commission Amount',
      accessorKey: 'amount',
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-emerald-600 text-xs sm:text-sm font-mono tabular-nums">
          ${row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'Payout Destination',
      cell: (row) => (
        <div className="text-xs space-y-0.5 font-sans">
          {row.walletAddress ? (
            <div className="flex items-center gap-1.5 font-mono text-slate-700 font-semibold tabular-nums">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">USDT</span>
              <span className="truncate max-w-[180px]">{row.walletAddress}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <Landmark className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate max-w-[200px]">{row.bankDetails}</span>
            </div>
          )}
          {row.notes && <p className="text-[11px] text-slate-400 italic">{row.notes}</p>}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Submitted',
      accessorKey: 'createdAt',
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-slate-500" suppressHydrationWarning>
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'pending' ? (
            <>
              <Button
                size="sm"
                variant="success"
                onClick={() => approveIBWithdrawal(row.id)}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => rejectIBWithdrawal(row.id)}
                leftIcon={<XCircle className="w-3.5 h-3.5" />}
              >
                Reject
              </Button>
            </>
          ) : (
            <span className="text-xs text-slate-400 font-mono">Settled</span>
          )}
        </div>
      ),
    },
  ];

  const pendingCount = ibWithdrawals.filter(w => w.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Partner (IB) Commission Withdrawals</h2>
          <p className="text-xs text-slate-500 mt-1">
            Review and disburse accumulated affiliate commission payouts to introducing brokers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold flex items-center gap-2 shadow-2xs">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>{pendingCount} Pending Partner Payout{pendingCount === 1 ? '' : 's'}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={ibWithdrawals as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchPlaceholder="Search IB payouts by name, email, or destination..."
        searchKeys={['id', 'ibName', 'ibEmail', 'walletAddress', 'bankDetails']}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Pending', value: 'pending' },
              { label: 'Completed', value: 'completed' },
              { label: 'Rejected', value: 'rejected' },
            ],
          },
        ]}
        exportFilename="crm-ib-withdrawals.csv"
      />
    </div>
  );
}
