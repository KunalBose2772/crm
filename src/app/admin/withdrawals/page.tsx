'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { WithdrawalRequest } from '@/types/crm';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { 
  ArrowUpFromLine, 
  CheckCircle2, 
  Clock, 
  Wallet, 
  Building2, 
  Copy,
  Check
} from 'lucide-react';

export default function AdminWithdrawalsPage() {
  const { withdrawals, approveWithdrawal, rejectWithdrawal, processWithdrawal } = useCRM();
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenAction = (wdr: WithdrawalRequest, reject = false) => {
    setSelectedWithdrawal(wdr);
    setIsRejecting(reject);
    setRejectReason('');
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    if (!selectedWithdrawal) return;
    if (isRejecting) {
      if (!rejectReason.trim()) {
        alert('Please specify a rejection reason.');
        return;
      }
      rejectWithdrawal(selectedWithdrawal.id, rejectReason);
    } else {
      approveWithdrawal(selectedWithdrawal.id);
    }
    setIsModalOpen(false);
  };

  const columns: Column<WithdrawalRequest>[] = [
    {
      header: 'Payout ID',
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
      header: 'Account',
      accessorKey: 'accountLogin',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-bold tabular-nums">
          #{row.accountLogin}
        </span>
      ),
    },
    {
      header: 'Requested',
      accessorKey: 'requestedAmount',
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-rose-600 text-xs sm:text-sm font-mono tabular-nums">
          -{row.requestedAmount.toLocaleString()} {row.currency}
        </span>
      ),
    },
    {
      header: 'Net Payout',
      accessorKey: 'netAmount',
      sortable: true,
      cell: (row) => (
        <div className="text-xs sm:text-sm font-bold text-slate-900 font-mono tabular-nums">
          {row.netAmount.toLocaleString()} {row.currency}
          {row.fee > 0 && <span className="text-[10px] text-slate-500 block font-normal font-sans">(Fee: ${row.fee})</span>}
        </div>
      ),
    },
    {
      header: 'Destination',
      accessorKey: 'destinationType',
      cell: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            {row.destinationType === 'Crypto_Wallet' ? (
              <Wallet className="w-3.5 h-3.5 text-purple-600" />
            ) : (
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>{row.destinationType.replace(/_/g, ' ')}</span>
          </div>
          <p className="font-mono text-[11px] text-slate-500 truncate max-w-[150px]">
            {row.destinationDetails.walletAddress || row.destinationDetails.iban || row.destinationDetails.bankName}
          </p>
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
      header: 'Date',
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
        <div className="flex items-center gap-1.5">
          {row.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => processWithdrawal(row.id)}
                title="Mark as processing"
              >
                In Review
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleOpenAction(row, true)}
              >
                Reject
              </Button>
            </>
          )}

          {row.status === 'processing' && (
            <Button
              size="sm"
              variant="success"
              onClick={() => handleOpenAction(row, false)}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Disburse & Settle
            </Button>
          )}

          {(row.status === 'completed' || row.status === 'rejected') && (
            <span className="text-xs text-slate-400 font-mono">Finalized</span>
          )}
        </div>
      ),
    },
  ];

  const pendingCount = withdrawals.filter(w => w.status === 'pending' || w.status === 'processing').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Withdrawal Processing & Payouts</h2>
          <p className="text-xs text-slate-500 mt-1">
            Audit client margin thresholds, verify bank/crypto payout details, and execute settlements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 shadow-2xs">
            <Clock className="w-4 h-4 text-rose-600" />
            <span>{pendingCount} Active Payout Request{pendingCount === 1 ? '' : 's'}</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        data={withdrawals as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchPlaceholder="Search withdrawals by client, account, or ID..."
        searchKeys={['id', 'clientName', 'clientEmail', 'accountLogin']}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Pending', value: 'pending' },
              { label: 'Processing', value: 'processing' },
              { label: 'Completed', value: 'completed' },
              { label: 'Rejected', value: 'rejected' },
            ],
          },
        ]}
        exportFilename="crm-withdrawals-ledger.csv"
      />

      {/* Action Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isRejecting ? 'Reject Payout Request' : 'Execute Treasury Disbursement'}
        subtitle={selectedWithdrawal ? `Payout #${selectedWithdrawal.id} • Account #${selectedWithdrawal.accountLogin}` : ''}
        maxWidth="lg"
      >
        {selectedWithdrawal && (
          <div className="space-y-5">
            {/* Account & Margin Health Check */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Client Name:</span>
                <span className="font-bold text-slate-900">{selectedWithdrawal.clientName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Available Equity:</span>
                <span className="font-bold text-emerald-600">
                  ${selectedWithdrawal.clientEquity.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Requested Amount:</span>
                <span className="font-bold text-rose-600">
                  -${selectedWithdrawal.requestedAmount.toLocaleString()} {selectedWithdrawal.currency}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                <span className="text-slate-700 font-bold">Net Payout After Fees:</span>
                <span className="font-bold text-slate-900 text-sm">
                  ${selectedWithdrawal.netAmount.toLocaleString()} {selectedWithdrawal.currency}
                </span>
              </div>
            </div>

            {/* Destination Payout Credentials */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Settlement Destination Credentials
              </h4>
              {selectedWithdrawal.destinationType === 'Crypto_Wallet' ? (
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Network:</span>
                    <span className="font-bold text-purple-900">{selectedWithdrawal.destinationDetails.network || 'TRC20'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-slate-500 font-medium">Wallet:</span>
                    <div className="flex items-center gap-1.5 font-mono text-purple-700 font-bold">
                      <span>{selectedWithdrawal.destinationDetails.walletAddress}</span>
                      <button
                        onClick={() => handleCopy(selectedWithdrawal.destinationDetails.walletAddress!, 'wallet')}
                        className="p-1 hover:text-purple-900 hover:bg-purple-50 rounded-full cursor-pointer transition-colors"
                      >
                        {copiedKey === 'wallet' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Bank Name:</span>
                    <span className="font-bold text-slate-900">{selectedWithdrawal.destinationDetails.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Beneficiary:</span>
                    <span className="font-bold text-slate-900">{selectedWithdrawal.destinationDetails.accountHolder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">IBAN:</span>
                    <span className="font-mono font-bold text-purple-700">{selectedWithdrawal.destinationDetails.iban}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">SWIFT / BIC:</span>
                    <span className="font-mono font-bold text-purple-700">{selectedWithdrawal.destinationDetails.swiftCode}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Rejection input */}
            {isRejecting ? (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-rose-800">
                  Reason for Payout Rejection *
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="e.g. Free margin insufficient / KYC documentation required before withdrawal..."
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                Confirming settlement will mark the disbursement as completed, deduct the amount from the client account, and update the global cash flow ledger.
              </p>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={isRejecting ? 'danger' : 'success'}
                onClick={handleConfirm}
              >
                {isRejecting ? 'Confirm Rejection' : 'Execute Disbursement'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
