'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/context/CRMContext';
import { IBWithdrawalRequest } from '@/types/crm';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { Modal } from '@/components/ui/Modal';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Landmark, 
  Wallet, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Copy, 
  Check, 
  ChevronDown, 
  ArrowDownRight, 
  AlertCircle, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { clsx } from 'clsx';

export default function IBWithdrawalsPage() {
  const { ibWithdrawals, approveIBWithdrawal, rejectIBWithdrawal, adminUser, showToast } = useCRM();

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Modals
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<IBWithdrawalRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    if (!text || text === '-') return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    showToast('info', `${label} Copied`, text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Metrics Calculation
  const metrics = useMemo(() => {
    const total = ibWithdrawals.length;
    const pendingList = ibWithdrawals.filter(w => w.status === 'pending');
    const approvedList = ibWithdrawals.filter(w => w.status === 'completed');
    const rejectedList = ibWithdrawals.filter(w => w.status === 'rejected');

    const pendingAmount = pendingList.reduce((acc, curr) => acc + curr.amount, 0);
    const approvedAmount = approvedList.reduce((acc, curr) => acc + curr.amount, 0);
    const rejectedAmount = rejectedList.reduce((acc, curr) => acc + curr.amount, 0);

    return {
      total,
      pendingCount: pendingList.length,
      pendingAmount,
      approvedCount: approvedList.length,
      approvedAmount,
      rejectedCount: rejectedList.length,
      rejectedAmount,
    };
  }, [ibWithdrawals]);

  // Filtered List
  const filteredList = useMemo(() => {
    return ibWithdrawals.filter(w => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        w.id.toLowerCase().includes(q) ||
        w.ibEmail.toLowerCase().includes(q) ||
        (w.ibName && w.ibName.toLowerCase().includes(q)) ||
        (w.paymentMethod && w.paymentMethod.toLowerCase().includes(q)) ||
        (w.walletAddress && w.walletAddress.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (statusFilter !== 'all') {
        if (statusFilter === 'completed' && w.status !== 'completed') return false;
        if (statusFilter === 'pending' && w.status !== 'pending') return false;
        if (statusFilter === 'rejected' && w.status !== 'rejected') return false;
      }

      return true;
    });
  }, [ibWithdrawals, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage, itemsPerPage]);

  // Format Date Helper
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Request ID', 'User Email', 'Partner Name', 'Amount (USD)', 'Payment Method', 'Wallet/Bank', 'Status', 'Date'];
    const rows = filteredList.map(w => [
      w.id,
      w.ibEmail,
      w.ibName || '',
      w.amount.toFixed(2),
      w.paymentMethod || 'Wallet',
      w.walletAddress || w.bankDetails || '-',
      w.status === 'completed' ? 'Approved' : w.status,
      formatDate(w.createdAt)
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ib-withdrawals-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'CSV Exported', `Exported ${filteredList.length} IB withdrawal records`);
  };

  // Action Handlers
  const handleOpenApprove = (req: IBWithdrawalRequest) => {
    setSelectedWithdrawal(req);
    setIsApproveModalOpen(true);
  };

  const handleConfirmApprove = () => {
    if (!selectedWithdrawal) return;
    approveIBWithdrawal(selectedWithdrawal.id);
    setIsApproveModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedWithdrawal(null);
  };

  const handleOpenReject = (req: IBWithdrawalRequest) => {
    setSelectedWithdrawal(req);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedWithdrawal) return;
    rejectIBWithdrawal(selectedWithdrawal.id);
    setIsRejectModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedWithdrawal(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Welcome Banner */}
      <WelcomeBanner
        title="IB Withdrawal Management"
        subtitle="Review, approve, and disburse accumulated affiliate commission payouts to introducing brokers."
        badgeText="IB Payouts"
        onRefresh={() => showToast('success', 'IB Withdrawals Synchronized', 'Retrieved latest commission payout requests.')}
      />

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Total Requests */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-purple-100/90 bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-purple-200">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Total Requests
            </span>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {metrics.total}
            </p>
            <p className="text-xs text-slate-400 mt-1 font-medium">All recorded partner requests</p>
          </div>
        </div>

        {/* Pending */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-100/90 bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-amber-200">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-amber-600 uppercase tracking-wider">
              Pending
            </span>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
              {metrics.pendingCount}
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              ${metrics.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Approved */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-100/90 bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-emerald-600 uppercase tracking-wider">
              Approved
            </span>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
              {metrics.approvedCount}
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              ${metrics.approvedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Rejected */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-rose-100/90 bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-rose-200">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-rose-600 uppercase tracking-wider">
              Rejected
            </span>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight">
              {metrics.rejectedCount}
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              ${metrics.rejectedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Control Bar (Search, Filters, Export) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-purple-100/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by user email, partner name, wallet, or ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-100/90 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {/* Status Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Status:</span>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-purple-100/90 bg-white text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Per Page Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Per Page:</span>
              <div className="relative">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-purple-100/90 bg-white text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 text-purple-700 text-xs sm:text-sm font-semibold transition-all shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Desktop Table View (hidden on mobile, visible on lg) */}
      <div className="hidden lg:block bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-purple-100/80">
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Wallet Address</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No withdrawal requests found</p>
                    <p className="text-xs text-slate-400 mt-1">Try changing your search query or status filter.</p>
                  </td>
                </tr>
              ) : (
                paginatedList.map((row) => (
                  <tr key={row.id} className="hover:bg-purple-50/20 transition-colors">
                    {/* User */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 leading-tight">
                          {row.ibName || 'Partner Account'}
                        </p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          {row.ibEmail}
                        </p>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        ${row.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="px-5 py-4">
                      <span className={clsx(
                        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
                        row.paymentMethod?.toLowerCase().includes('trx') ? 'bg-red-50 text-red-700 border border-red-200' :
                        row.paymentMethod?.toLowerCase().includes('usdt') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      )}>
                        {row.paymentMethod || 'Wallet'}
                      </span>
                    </td>

                    {/* Wallet Address */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 max-w-[220px]">
                        <span className="text-xs font-mono text-slate-700 truncate" title={row.walletAddress || row.bankDetails || '-'}>
                          {row.walletAddress || row.bankDetails || '-'}
                        </span>
                        {row.walletAddress && row.walletAddress !== '-' && (
                          <button
                            onClick={() => handleCopy(row.walletAddress!, 'Wallet Address')}
                            className="text-slate-400 hover:text-purple-600 transition-colors shrink-0"
                            title="Copy address"
                          >
                            {copiedText === row.walletAddress ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {row.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved
                        </span>
                      ) : row.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-xs text-slate-600 font-medium">
                      {formatDate(row.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedWithdrawal(row);
                            setIsDetailModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                        >
                          View
                        </button>
                        {row.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleOpenApprove(row)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleOpenReject(row)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Mobile Cards View (Visible on lg:hidden) */}
      <div className="lg:hidden space-y-3 sm:space-y-4">
        {paginatedList.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-purple-100 text-slate-500">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No requests found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          paginatedList.map((row) => (
            <div
              key={row.id}
              className="bg-white rounded-2xl border border-purple-100/90 shadow-xs p-4 sm:p-5 hover:shadow-md transition-shadow"
            >
              {/* Header: User & Status */}
              <div className="flex justify-between items-start mb-3 gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {row.ibName || 'Partner Account'}
                  </p>
                  <p className="text-xs text-slate-500 font-mono truncate">
                    {row.ibEmail}
                  </p>
                </div>
                {row.status === 'completed' ? (
                  <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    Approved
                  </span>
                ) : row.status === 'pending' ? (
                  <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                    Pending
                  </span>
                ) : (
                  <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                    Rejected
                  </span>
                )}
              </div>

              {/* Grid: Amount & Payment Method */}
              <div className="grid grid-cols-2 gap-3 mb-3 p-2.5 rounded-xl bg-slate-50/60 border border-slate-100">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Amount</p>
                  <p className="text-base sm:text-lg font-bold text-slate-900 font-mono">
                    ${row.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Payment Method</p>
                  <p className="text-sm font-semibold text-purple-700 truncate mt-0.5">
                    {row.paymentMethod || 'Wallet'}
                  </p>
                </div>
              </div>

              {/* Wallet Address */}
              <div className="mb-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Wallet Address:</span>
                <span className="font-mono text-slate-800 break-all font-semibold max-w-[200px] text-right">
                  {row.walletAddress || row.bankDetails || '-'}
                </span>
              </div>

              {/* Date */}
              <div className="mb-3.5 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Date:</span>
                <span className="text-slate-700 font-medium">{formatDate(row.createdAt)}</span>
              </div>

              {/* Mobile Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedWithdrawal(row);
                    setIsDetailModalOpen(true);
                  }}
                  className="flex-1 min-w-[80px] px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-colors text-center"
                >
                  View
                </button>
                {row.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleOpenApprove(row)}
                      className="flex-1 min-w-[80px] px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors text-center"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleOpenReject(row)}
                      className="flex-1 min-w-[80px] px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors text-center"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 6. Pagination Footer */}
      {filteredList.length > 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 border border-purple-100/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-500">
          <p>
            Showing <span className="font-bold text-slate-800">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="font-bold text-slate-800">
              {Math.min(currentPage * itemsPerPage, filteredList.length)}
            </span>{' '}
            of <span className="font-bold text-slate-800">{filteredList.length}</span> requests
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-slate-800">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 7. View Details Modal */}
      {selectedWithdrawal && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="IB Withdrawal Details"
          maxWidth="lg"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
              <div>
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Payout Amount</p>
                <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                  ${selectedWithdrawal.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 font-medium">Status</p>
                <span className={clsx(
                  'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mt-1',
                  selectedWithdrawal.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                  selectedWithdrawal.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                )}>
                  {selectedWithdrawal.status === 'completed' ? 'Approved' : selectedWithdrawal.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] block">Partner Info</span>
                <p className="font-bold text-slate-900 mt-1">{selectedWithdrawal.ibName || 'Partner Account'}</p>
                <p className="font-mono text-slate-600 mt-0.5">{selectedWithdrawal.ibEmail}</p>
                <p className="text-[11px] text-purple-600 font-mono mt-1">ID: {selectedWithdrawal.ibId}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] block">Payment Gateway</span>
                <p className="font-bold text-purple-700 mt-1">{selectedWithdrawal.paymentMethod || 'Cryptocurrency'}</p>
                <p className="text-slate-600 mt-0.5 text-xs">Network: TRC20 / ERC20 / Local</p>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">Req ID: {selectedWithdrawal.id}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {selectedWithdrawal.walletAddress ? 'Payout Wallet Address' : 'Bank Transfer Details'}
                </span>
                {(selectedWithdrawal.walletAddress || selectedWithdrawal.bankDetails) && (
                  <button
                    onClick={() => handleCopy(selectedWithdrawal.walletAddress || selectedWithdrawal.bankDetails || '', 'Destination')}
                    className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                )}
              </div>
              <p className="font-mono text-sm text-slate-800 break-all bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {selectedWithdrawal.walletAddress || selectedWithdrawal.bankDetails || 'No address specified'}
              </p>
            </div>

            {selectedWithdrawal.notes && (
              <div className="p-3 rounded-xl bg-purple-50/30 border border-purple-100/60 text-xs">
                <span className="font-bold text-purple-800">Admin/Audit Notes:</span>
                <p className="text-slate-600 mt-0.5 italic">{selectedWithdrawal.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              {selectedWithdrawal.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      setIsRejectModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      setIsApproveModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs"
                  >
                    Approve & Disburse
                  </button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* 8. Approve Modal */}
      {selectedWithdrawal && (
        <Modal
          isOpen={isApproveModalOpen}
          onClose={() => setIsApproveModalOpen(false)}
          title="Confirm IB Commission Payout"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900 text-sm">
              <p className="font-bold">Are you sure you want to approve this withdrawal?</p>
              <p className="text-xs text-emerald-700 mt-1">
                This will deduct the commission funds from partner {selectedWithdrawal.ibEmail} and record the payout as settled.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-slate-800">${selectedWithdrawal.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Method:</span>
                <span className="font-bold text-slate-800">{selectedWithdrawal.paymentMethod || 'Wallet'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-mono text-slate-800 truncate max-w-[220px]">
                  {selectedWithdrawal.walletAddress || selectedWithdrawal.bankDetails || '-'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprove}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 9. Reject Modal */}
      {selectedWithdrawal && (
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          title="Reject IB Commission Payout"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-900 text-sm">
              <p className="font-bold">Reject Payout Request</p>
              <p className="text-xs text-rose-700 mt-1">
                The requested amount will be reverted back to partner {selectedWithdrawal.ibEmail}&apos;s commission balance.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rejection Reason (Optional):
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Invalid wallet destination address, compliance review required..."
                rows={3}
                className="w-full p-3 rounded-xl border border-purple-100/90 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
