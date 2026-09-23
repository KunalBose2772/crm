'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { KYCRecord } from '@/types/crm';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { 
  ShieldCheck, 
  ShieldX, 
  Eye, 
  FileText, 
  Clock,
  ExternalLink
} from 'lucide-react';

export default function KYCVerificationPage() {
  const { kycRecords, approveKYC, rejectKYC } = useCRM();
  const [selectedRecord, setSelectedRecord] = useState<KYCRecord | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const handleOpenReview = (record: KYCRecord) => {
    setSelectedRecord(record);
    setIsRejecting(false);
    setRejectReason('');
    setIsReviewModalOpen(true);
  };

  const handleApprove = () => {
    if (!selectedRecord) return;
    approveKYC(selectedRecord.id);
    setIsReviewModalOpen(false);
  };

  const handleReject = () => {
    if (!selectedRecord) return;
    if (!rejectReason.trim()) {
      alert('Please provide a reason for document rejection.');
      return;
    }
    rejectKYC(selectedRecord.id, rejectReason);
    setIsReviewModalOpen(false);
  };

  const columns: Column<KYCRecord>[] = [
    {
      header: 'Submission ID',
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
      header: 'Country',
      accessorKey: 'country',
      sortable: true,
      cell: (row) => <span className="text-xs text-slate-700 font-medium font-sans">{row.country}</span>,
    },
    {
      header: 'Document Type',
      accessorKey: 'documentType',
      sortable: true,
      cell: (row) => (
        <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-xs font-bold text-purple-800 border border-purple-200 font-sans">
          {row.documentType.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      header: 'Doc Number',
      accessorKey: 'documentNumber',
      cell: (row) => <span className="font-mono text-xs text-slate-700 font-semibold tabular-nums">{row.documentNumber}</span>,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Submitted',
      accessorKey: 'submittedAt',
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-slate-500" suppressHydrationWarning>
          {new Date(row.submittedAt).toLocaleDateString()} {new Date(row.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      header: 'Review',
      cell: (row) => (
        <Button
          size="sm"
          variant={row.status === 'pending' ? 'primary' : 'outline'}
          onClick={() => handleOpenReview(row)}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
        >
          {row.status === 'pending' ? 'Inspect & Verify' : 'View Docs'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">KYC Verification Queue</h2>
          <p className="text-xs text-slate-500 mt-1">
            Review identity proofs, passports, driving licenses, and proof of residence documents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold flex items-center gap-2 shadow-2xs">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>{kycRecords.filter(k => k.status === 'pending').length} Pending Review</span>
          </div>
        </div>
      </div>

      {/* KYC Table */}
      <DataTable
        data={kycRecords as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchPlaceholder="Search by client name, email, or doc number..."
        searchKeys={['clientName', 'clientEmail', 'documentNumber', 'country']}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Pending', value: 'pending' },
              { label: 'Verified', value: 'verified' },
              { label: 'Rejected', value: 'rejected' },
            ],
          },
        ]}
        exportFilename="kyc-verification-log.csv"
      />

      {/* Review & Verification Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={selectedRecord ? `Review KYC: ${selectedRecord.clientName}` : 'Document Verification'}
        subtitle={selectedRecord ? `${selectedRecord.documentType.replace(/_/g, ' ')} • #${selectedRecord.documentNumber}` : ''}
        maxWidth="2xl"
      >
        {selectedRecord && (
          <div className="space-y-6">
            {/* Applicant metadata bar */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Client Name</span>
                <span className="font-bold text-slate-900">{selectedRecord.clientName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Country</span>
                <span className="font-bold text-slate-900">{selectedRecord.country}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Current Status</span>
                <StatusBadge status={selectedRecord.status} className="mt-0.5" />
              </div>
            </div>

            {/* Document Preview Scans */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Submitted Document Images
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-500 font-semibold">Front Document Scan</span>
                  <div className="h-52 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative group flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedRecord.frontImageUrl}
                      alt="Front Document"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <a
                      href={selectedRecord.frontImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5"
                    >
                      <ExternalLink className="w-4 h-4" /> Expand Original
                    </a>
                  </div>
                </div>

                {selectedRecord.backImageUrl && (
                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-500 font-semibold">Back Document Scan</span>
                    <div className="h-52 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative group flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedRecord.backImageUrl}
                        alt="Back Document"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <a
                        href={selectedRecord.backImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5"
                      >
                        <ExternalLink className="w-4 h-4" /> Expand Original
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rejection input area if toggled */}
            {isRejecting && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                <label className="block text-xs font-bold text-rose-800">
                  Reason for Document Rejection *
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Specify why the submission was rejected (e.g. Blurry photo, document expired, name mismatch)..."
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button
                variant="ghost"
                onClick={() => setIsReviewModalOpen(false)}
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                {!isRejecting ? (
                  <>
                    <Button
                      variant="danger"
                      onClick={() => setIsRejecting(true)}
                      leftIcon={<ShieldX className="w-4 h-4" />}
                    >
                      Reject Submission
                    </Button>
                    <Button
                      variant="success"
                      onClick={handleApprove}
                      leftIcon={<ShieldCheck className="w-4 h-4" />}
                    >
                      Approve & Verify Client
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setIsRejecting(false)}
                    >
                      Cancel Rejection
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleReject}
                    >
                      Confirm Rejection
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
