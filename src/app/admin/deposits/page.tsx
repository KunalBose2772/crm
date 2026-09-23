'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { DepositRequest } from '@/types/crm';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { 
  ArrowDownToLine, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Clock
} from 'lucide-react';

export default function AdminDepositsPage() {
  const { deposits, approveDeposit, rejectDeposit } = useCRM();
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectMode, setIsRejectMode] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAction = (deposit: DepositRequest, reject = false) => {
    setSelectedDeposit(deposit);
    setIsRejectMode(reject);
    setRejectReason('');
    setIsConfirmModalOpen(true);
  };

  const handleConfirm = () => {
    if (!selectedDeposit) return;
    if (isRejectMode) {
      if (!rejectReason) {
        alert('Please enter a rejection reason.');
        return;
      }
      rejectDeposit(selectedDeposit.id, rejectReason);
    } else {
      approveDeposit(selectedDeposit.id);
    }
    setIsConfirmModalOpen(false);
  };

  const columns: Column<DepositRequest>[] = [
    {
      header: 'Deposit ID',
      accessorKey: 'id',
      sortable: true,
      className: 'font-mono text-xs text-purple-700 font-bold tabular-nums',
    },
    {
      header: 'Client Details',
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
      header: 'Trading Account',
      accessorKey: 'accountLogin',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-bold tabular-nums">
          #{row.accountLogin}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-emerald-600 text-xs sm:text-sm font-mono tabular-nums">
          +{row.amount.toLocaleString()} {row.currency}
        </span>
      ),
    },
    {
      header: 'Gateway / Method',
      accessorKey: 'paymentMethod',
      sortable: true,
      cell: (row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.paymentMethod.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      header: 'TX Reference / Hash',
      accessorKey: 'txHash',
      cell: (row) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-600">
          <span className="truncate max-w-[140px] font-medium">{row.txHash || 'N/A'}</span>
          {row.txHash && (
            <button
              onClick={() => handleCopy(row.txHash!, row.id)}
              className="p-1 hover:text-purple-700 hover:bg-purple-50 rounded-full cursor-pointer transition-colors"
              title="Copy Hash"
            >
              {copiedId === row.id ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
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
      header: 'Created At',
      accessorKey: 'createdAt',
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-slate-500" suppressHydrationWarning>
          {new Date(row.createdAt).toLocaleDateString()} {new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          {row.status === 'pending' ? (
            <>
              <Button
                size="sm"
                variant="success"
                onClick={() => handleOpenAction(row, false)}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleOpenAction(row, true)}
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

  const pendingCount = deposits.filter(d => d.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Deposit Requests & Gateways</h2>
          <p className="text-xs text-slate-500 mt-1">
            Verify blockchain hashes, bank wire slips, and instantly credit trading accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-2xs">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{pendingCount} Deposit{pendingCount === 1 ? '' : 's'} Pending Approval</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        data={deposits as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchPlaceholder="Search deposits by ID, client, or TX hash..."
        searchKeys={['id', 'clientName', 'clientEmail', 'txHash', 'paymentMethod']}
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
          {
            key: 'paymentMethod',
            label: 'Method',
            options: [
              { label: 'USDT TRC20', value: 'USDT_TRC20' },
              { label: 'Bank Wire', value: 'Bank_Wire' },
              { label: 'Credit Card', value: 'Credit_Card' },
            ],
          },
        ]}
        exportFilename="crm-deposits-ledger.csv"
      />

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={isRejectMode ? 'Reject Deposit Request' : 'Confirm Deposit Approval'}
        subtitle={selectedDeposit ? `Deposit #${selectedDeposit.id} • Account #${selectedDeposit.accountLogin}` : ''}
        maxWidth="md"
      >
        {selectedDeposit && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Client:</span>
                <span className="font-bold text-slate-900">{selectedDeposit.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Credit Amount:</span>
                <span className="font-bold text-emerald-600 text-sm">
                  +{selectedDeposit.amount.toLocaleString()} {selectedDeposit.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Destination Account:</span>
                <span className="font-mono text-purple-700 font-bold">#{selectedDeposit.accountLogin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Payment Gateway:</span>
                <span className="text-slate-700 font-medium">{selectedDeposit.paymentMethod.replace(/_/g, ' ')}</span>
              </div>
            </div>

            {isRejectMode ? (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-rose-800">
                  Reason for Rejection *
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="e.g. TX hash not found on blockchain / payment declined by processor..."
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed">
                Approving this deposit will immediately increment the client&apos;s MT5/cTrader balance and equity by{' '}
                <strong className="text-purple-900 font-bold">{selectedDeposit.amount} {selectedDeposit.currency}</strong> and notify the trader.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={isRejectMode ? 'danger' : 'success'}
                onClick={handleConfirm}
              >
                {isRejectMode ? 'Confirm Rejection' : 'Confirm & Credit Balance'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
