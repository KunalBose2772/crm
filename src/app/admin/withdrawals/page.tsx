'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/context/CRMContext';
import { WithdrawalRequest } from '@/types/crm';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { Modal } from '@/components/ui/Modal';
import { 
  ArrowUpFromLine, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  ChevronDown, 
  Download, 
  X, 
  Eye, 
  ShieldCheck, 
  ShieldX, 
  CreditCard, 
  Wallet, 
  Building2, 
  CircleCheck, 
  TriangleAlert, 
  MoreHorizontal, 
  Check,
  CircleCheckBig,
  CircleX
} from 'lucide-react';
import { clsx } from 'clsx';

export default function AdminWithdrawalsPage() {
  const { withdrawals, approveWithdrawal, rejectWithdrawal, showToast } = useCRM();

  // Search, filter, and pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'rejected'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'createdAt' | 'amount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isRejectMode, setIsRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Stats calculation
  const totalCount = withdrawals.length;
  const approvedWithdrawals = withdrawals.filter(w => w.status === 'completed');
  const totalApprovedAmount = approvedWithdrawals.reduce((acc, curr) => acc + curr.requestedAmount, 0);
  const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
  const rejectedCount = withdrawals.filter(w => w.status === 'rejected').length;

  // Filtered and sorted list
  const filteredWithdrawals = useMemo(() => {
    return withdrawals
      .filter(wdr => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = 
          !q ||
          wdr.clientName.toLowerCase().includes(q) ||
          wdr.clientEmail.toLowerCase().includes(q) ||
          wdr.accountLogin.toString().includes(q) ||
          (wdr.paymentMethod && wdr.paymentMethod.toLowerCase().includes(q)) ||
          (wdr.plan && wdr.plan.toLowerCase().includes(q));

        if (!matchesSearch) return false;

        if (statusFilter !== 'all' && wdr.status !== statusFilter) {
          return false;
        }

        if (planFilter !== 'all') {
          const wPlan = wdr.plan?.toUpperCase() || '';
          if (wPlan !== planFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortField === 'amount') {
          return sortOrder === 'desc' ? b.requestedAmount - a.requestedAmount : a.requestedAmount - b.requestedAmount;
        }
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [withdrawals, searchQuery, statusFilter, planFilter, sortField, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredWithdrawals.length / pageSize) || 1;
  const paginatedWithdrawals = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredWithdrawals.slice(startIndex, startIndex + pageSize);
  }, [filteredWithdrawals, currentPage, pageSize]);

  // Actions
  const handleOpenDetail = (wdr: WithdrawalRequest) => {
    setSelectedWithdrawal(wdr);
    setIsDetailModalOpen(true);
    setActiveMenuId(null);
  };

  const handleOpenAction = (wdr: WithdrawalRequest, reject = false) => {
    setSelectedWithdrawal(wdr);
    setIsRejectMode(reject);
    setRejectReason('');
    setIsActionModalOpen(true);
    setActiveMenuId(null);
  };

  const handleConfirmAction = () => {
    if (!selectedWithdrawal) return;
    if (isRejectMode) {
      if (!rejectReason.trim()) {
        showToast('error', 'Reason Required', 'Please enter a reason for rejecting this payout.');
        return;
      }
      rejectWithdrawal(selectedWithdrawal.id, rejectReason);
      setIsActionModalOpen(false);
      setIsDetailModalOpen(false);
    } else {
      approveWithdrawal(selectedWithdrawal.id);
      setIsActionModalOpen(false);
      setIsDetailModalOpen(false);
    }
  };

  const handleRefresh = () => {
    showToast('success', 'Withdrawal Queue Synchronized', 'Real-time payout ledger updated.');
  };

  const handleExportCSV = () => {
    const headers = ['Withdrawal ID', 'User', 'Email', 'Account', 'Amount', 'Currency', 'Plan', 'Payment Method', 'Status', 'Date'];
    const rows = filteredWithdrawals.map(w => [
      `"${w.id}"`,
      `"${w.clientName}"`,
      `"${w.clientEmail}"`,
      `"${w.accountLogin}"`,
      w.requestedAmount,
      `"${w.currency}"`,
      `"${w.plan || 'STANDARD'}"`,
      `"${w.paymentMethod || w.destinationType}"`,
      w.status,
      `"${new Date(w.createdAt).toLocaleString()}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `withdrawal_management_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('info', 'Export Successful', `Exported ${filteredWithdrawals.length} withdrawals to CSV.`);
  };

  const toggleSort = (field: 'createdAt' | 'amount') => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getPlanBadge = (plan?: string) => {
    const p = (plan || 'STANDARD').toUpperCase();
    if (p === 'VVIP') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-800 border border-amber-300 shadow-2xs">
          VVIP
        </span>
      );
    }
    if (p === 'BASIC') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-gradient-to-r from-purple-50 to-slate-100 text-purple-700 border border-purple-200 shadow-2xs">
          BASIC
        </span>
      );
    }
    if (p === '200' || p === '300') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
          {p}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
        STANDARD
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center justify-center rounded-md px-2.5 py-0.5 text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xs">
          Approved
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="inline-flex items-center justify-center rounded-md px-2.5 py-0.5 text-xs font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-xs">
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center rounded-md px-2.5 py-0.5 text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-xs">
        Pending
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 select-none pb-12 font-sans">
      {/* 1. Established Royal Purple Welcome Banner */}
      <WelcomeBanner
        title="Withdrawal Management"
        subtitle="Manage and view all withdrawal requests."
        badgeText="Withdrawal Queue"
        onRefresh={handleRefresh}
      />

      {/* 2. Top 4 Established KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {/* Card 1: Total Withdrawals */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
              Total Withdrawals
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <ArrowUpFromLine className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {totalCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">requests</span>
          </div>
        </div>

        {/* Card 2: Settled Volume */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
              Settled Volume
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <CircleCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">
              ${totalApprovedAmount.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-600/80 font-medium">disbursed</span>
          </div>
        </div>

        {/* Card 3: Pending Payouts */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
              Pending Payouts
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">
              {pendingCount}
            </span>
            <span className="text-xs text-amber-500/80 font-medium">awaiting dispatch</span>
          </div>
        </div>

        {/* Card 4: Rejected / Declined */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
              Rejected
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <TriangleAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-mono">
              {rejectedCount}
            </span>
            <span className="text-xs text-rose-500/80 font-medium">declined</span>
          </div>
        </div>
      </div>

      {/* 3. Search, Filter, and Export Controls Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 shadow-xs p-3.5 sm:p-5 relative z-20">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by name, email, or account..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl sm:rounded-2xl border border-purple-100 bg-purple-50/20 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200/50 transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={clsx(
                  "flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold border transition-all cursor-pointer shadow-2xs",
                  statusFilter !== 'all' || planFilter !== 'all' || isFilterOpen
                    ? "bg-purple-600 text-white border-purple-600 shadow-purple-500/20"
                    : "bg-white text-slate-700 border-purple-200/80 hover:bg-purple-50/50 hover:text-purple-700"
                )}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
                {(statusFilter !== 'all' || planFilter !== 'all') && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white text-purple-700 text-[10px] font-extrabold capitalize">
                    {statusFilter !== 'all' ? statusFilter : planFilter}
                  </span>
                )}
                <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform duration-200", isFilterOpen && "rotate-180")} />
              </button>

              {/* Filter Popover Dropdown */}
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-purple-100 shadow-xl p-3.5 z-50 animate-in fade-in zoom-in-95 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900 font-heading">Filter Withdrawals</span>
                    {(statusFilter !== 'all' || planFilter !== 'all') && (
                      <button
                        type="button"
                        onClick={() => { setStatusFilter('all'); setPlanFilter('all'); setIsFilterOpen(false); }}
                        className="text-[10px] font-bold text-purple-600 hover:underline cursor-pointer"
                      >
                        Reset All
                      </button>
                    )}
                  </div>

                  {/* Status Group */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">Status</span>
                    {[
                      { id: 'all', label: 'All Statuses' },
                      { id: 'pending', label: 'Pending Payout' },
                      { id: 'completed', label: 'Approved / Disbursed' },
                      { id: 'rejected', label: 'Rejected' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setStatusFilter(item.id as any);
                          setIsFilterOpen(false);
                          setCurrentPage(1);
                        }}
                        className={clsx(
                          "w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-between",
                          statusFilter === item.id
                            ? "bg-purple-50 text-purple-700 font-bold"
                            : "text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <span>{item.label}</span>
                        {statusFilter === item.id && <Check className="w-3.5 h-3.5 text-purple-600" />}
                      </button>
                    ))}
                  </div>

                  {/* Plan Group */}
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">Plan / Quota</span>
                    {['all', 'STANDARD', 'BASIC', 'VVIP', '200', '300'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setPlanFilter(p);
                          setIsFilterOpen(false);
                          setCurrentPage(1);
                        }}
                        className={clsx(
                          "w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-between",
                          planFilter === p
                            ? "bg-purple-50 text-purple-700 font-bold"
                            : "text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <span>{p === 'all' ? 'All Plans' : p}</span>
                        {planFilter === p && <Check className="w-3.5 h-3.5 text-purple-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold border border-purple-200/80 bg-white text-slate-700 hover:bg-purple-50/50 hover:text-purple-700 transition-all cursor-pointer shadow-2xs"
              title="Export withdrawals to CSV"
            >
              <Download className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Summary Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mt-3 sm:mt-4 pt-3 border-t border-purple-100/80 text-xs sm:text-sm">
          <span className="font-medium text-slate-600">
            Found <span className="text-purple-700 font-bold">{filteredWithdrawals.length}</span> withdrawals
          </span>
          <span className="text-slate-500 text-xs">
            Sorted by Date (newest)
          </span>
        </div>
      </div>

      {/* 4. DESKTOP WITHDRAWALS TABLE (Hidden on Mobile) */}
      <div className="hidden md:block bg-white rounded-3xl border border-purple-100/90 shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto pb-2">
          <table className="w-max min-w-[980px] divide-y divide-purple-100/80 text-slate-700">
            <thead className="bg-gradient-to-r from-slate-50 to-purple-50/40 text-slate-600 font-bold uppercase tracking-wider text-[11px] font-heading">
              <tr>
                <th className="px-6 py-4 text-left font-semibold whitespace-nowrap">User</th>
                <th className="px-6 py-4 text-left font-semibold whitespace-nowrap">Account</th>
                <th 
                  className="px-6 py-4 text-left font-semibold whitespace-nowrap cursor-pointer hover:text-purple-700 transition-colors"
                  onClick={() => toggleSort('amount')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Amount</span>
                    <span className="text-purple-400 font-mono text-[10px]">
                      {sortField === 'amount' ? (sortOrder === 'desc' ? '▼' : '▲') : '⇅'}
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left font-semibold whitespace-nowrap">Plan</th>
                <th className="px-6 py-4 text-left font-semibold whitespace-nowrap">Payment</th>
                <th 
                  className="px-6 py-4 text-left font-semibold whitespace-nowrap cursor-pointer hover:text-purple-700 transition-colors"
                  onClick={() => toggleSort('createdAt')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    <span className="text-purple-600 font-mono text-[10px]">
                      {sortField === 'createdAt' ? (sortOrder === 'desc' ? '▼' : '▲') : '⇅'}
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left font-semibold whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-right font-semibold whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 bg-white">
              {paginatedWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No withdrawals match your criteria.</p>
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setStatusFilter('all'); setPlanFilter('all'); }}
                      className="mt-2 text-xs font-bold text-purple-600 hover:underline cursor-pointer"
                    >
                      Clear search &amp; filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedWithdrawals.map((wdr, index) => {
                  const paymentDisplay = wdr.paymentMethod || (wdr.destinationType === 'Crypto_Wallet' ? 'Crypto Wallet' : 'Bank Account');

                  return (
                    <tr
                      key={wdr.id}
                      className="hover:bg-gradient-to-r hover:from-purple-50/40 hover:to-indigo-50/30 transition-all duration-200 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* 1. User */}
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {wdr.clientName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                              {wdr.clientName}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              {wdr.clientEmail}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Account */}
                      <td className="px-6 py-4 text-slate-700 font-mono text-sm">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-800 font-semibold border border-slate-200/60">
                          {wdr.accountLogin}
                        </span>
                      </td>

                      {/* 3. Amount */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-emerald-600 text-sm font-mono tracking-tight">
                          ${wdr.requestedAmount.toLocaleString()}
                        </span>
                      </td>

                      {/* 4. Plan */}
                      <td className="px-6 py-4">
                        {getPlanBadge(wdr.plan)}
                      </td>

                      {/* 5. Payment */}
                      <td className="px-6 py-4 text-slate-700 text-sm">
                        <div className="flex items-center gap-1.5 capitalize">
                          {paymentDisplay.toLowerCase().includes('crypto') || paymentDisplay.toLowerCase().includes('usdt') ? (
                            <Wallet className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          ) : (
                            <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          )}
                          <span>{paymentDisplay}</span>
                        </div>
                      </td>

                      {/* 6. Date */}
                      <td className="px-6 py-4 text-xs text-slate-600 font-mono whitespace-nowrap">
                        {formatDisplayDate(wdr.createdAt)}
                      </td>

                      {/* 7. Status */}
                      <td className="px-6 py-4">
                        {getStatusBadge(wdr.status)}
                      </td>

                      {/* 8. Action */}
                      <td className="px-6 py-4 text-right relative">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(activeMenuId === wdr.id ? null : wdr.id)}
                            className="inline-flex items-center justify-center p-2 rounded-xl text-slate-600 hover:text-purple-700 hover:bg-purple-100/70 transition-colors cursor-pointer"
                            title="Actions"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>

                          {activeMenuId === wdr.id && (
                            <div className="absolute right-0 mt-1 w-44 rounded-2xl bg-white border border-purple-100 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 space-y-1">
                              <button
                                type="button"
                                onClick={() => handleOpenDetail(wdr)}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-purple-600" />
                                <span>View Details</span>
                              </button>
                              {wdr.status === 'pending' && (
                                <>
                                  <div className="h-px bg-slate-100 my-1" />
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAction(wdr, false)}
                                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Approve Payout</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAction(wdr, true)}
                                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <ShieldX className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Reject Payout</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MOBILE RESPONSIVE CARDS (Matches user's mobile layout) */}
      <div className="md:hidden space-y-3">
        {paginatedWithdrawals.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-purple-100 text-center text-slate-400">
            <p className="text-sm font-semibold">No withdrawals match your filters.</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); setPlanFilter('all'); }}
              className="mt-2 text-xs font-bold text-purple-600 hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          paginatedWithdrawals.map((wdr, idx) => {
            const paymentDisplay = wdr.paymentMethod || (wdr.destinationType === 'Crypto_Wallet' ? 'Crypto Wallet' : 'Bank Account');

            return (
              <div
                key={wdr.id}
                className="bg-white rounded-2xl border border-purple-100/90 shadow-sm p-4 space-y-3 animate-in fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* User row + Status */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">{wdr.clientName}</div>
                    <div className="text-xs text-slate-500 font-mono">{wdr.clientEmail}</div>
                  </div>
                  {getStatusBadge(wdr.status)}
                </div>

                {/* Grid 2 cols */}
                <div className="grid grid-cols-2 gap-3 text-sm pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 text-xs">MT5 Account</span>
                    <div className="font-mono text-slate-900 text-xs font-semibold">{wdr.accountLogin}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs">Amount</span>
                    <div className="font-bold text-green-600 font-mono text-sm">${wdr.requestedAmount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs">Plan</span>
                    <div className="mt-0.5">{getPlanBadge(wdr.plan)}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs">Payment</span>
                    <div className="text-slate-800 text-xs font-medium capitalize">{paymentDisplay}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 text-xs">Date</span>
                    <div className="text-slate-700 text-xs font-mono">{formatDisplayDate(wdr.createdAt)}</div>
                  </div>
                </div>

                {/* Action buttons row */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  {wdr.status === 'pending' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenAction(wdr, false)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 h-8.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        <CircleCheckBig className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenAction(wdr, true)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 h-8.5 rounded-xl text-red-600 border border-red-300 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        <CircleX className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(wdr)}
                        className="flex-none inline-flex items-center justify-center px-3 h-8.5 rounded-xl border border-purple-200/80 bg-white hover:bg-purple-50 text-purple-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(wdr)}
                      className="w-full inline-flex items-center justify-center gap-1.5 h-8.5 rounded-xl border border-purple-200/80 bg-white hover:bg-purple-50 text-purple-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 6. Pagination Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 shadow-sm p-4 sm:p-5 mt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{paginatedWithdrawals.length}</span> of{' '}
            <span className="font-bold text-slate-800">{filteredWithdrawals.length}</span> withdrawals
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3.5 py-1.5 rounded-xl border border-purple-200/80 bg-white hover:bg-purple-50 text-slate-700 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={clsx(
                    "w-8 h-8 rounded-xl font-bold text-xs transition-all cursor-pointer",
                    currentPage === page
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs"
                      : "bg-white border border-purple-100 text-slate-600 hover:bg-purple-50"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3.5 py-1.5 rounded-xl border border-purple-200/80 bg-white hover:bg-purple-50 text-slate-700 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 7. DETAIL VIEW MODAL */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedWithdrawal ? `Withdrawal Request: #${selectedWithdrawal.id}` : 'Withdrawal Overview'}
        subtitle={selectedWithdrawal ? `Client: ${selectedWithdrawal.clientName} (${selectedWithdrawal.clientEmail})` : ''}
        maxWidth="lg"
      >
        {selectedWithdrawal && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-purple-100/60">
                <span className="text-slate-500 font-medium">Payout Request ID</span>
                <span className="font-mono font-bold text-purple-700">{selectedWithdrawal.id}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-purple-100/60">
                <span className="text-slate-500 font-medium">Debited MT5 Account</span>
                <span className="font-mono font-bold text-slate-900">#{selectedWithdrawal.accountLogin}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-purple-100/60">
                <span className="text-slate-500 font-medium">Requested Payout</span>
                <span className="font-mono font-extrabold text-emerald-600 text-sm">
                  ${selectedWithdrawal.requestedAmount.toLocaleString()} {selectedWithdrawal.currency}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-purple-100/60">
                <span className="text-slate-500 font-medium">Account Plan / Tier</span>
                <div>{getPlanBadge(selectedWithdrawal.plan)}</div>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-purple-100/60">
                <span className="text-slate-500 font-medium">Payment Rail</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {selectedWithdrawal.paymentMethod || selectedWithdrawal.destinationType.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Destination Details */}
              {selectedWithdrawal.destinationType === 'Crypto_Wallet' ? (
                <div className="py-1 border-b border-purple-100/60 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Crypto Network</span>
                    <span className="font-semibold text-purple-700">{selectedWithdrawal.destinationDetails.network || 'TRC20 (Tron)'}</span>
                  </div>
                  <div className="text-slate-500 font-medium">Wallet Address:</div>
                  <div className="p-2 rounded-lg bg-white border border-purple-100 font-mono text-[11px] text-slate-800 break-all select-all">
                    {selectedWithdrawal.destinationDetails.walletAddress || 'TYDzsYUEpvnYmQk4zGP9s263VSt59b74bK'}
                  </div>
                </div>
              ) : (
                <div className="py-1 border-b border-purple-100/60 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Bank Institution</span>
                    <span className="font-semibold text-slate-800">{selectedWithdrawal.destinationDetails.bankName || 'State Bank of India'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Account Holder</span>
                    <span className="font-medium text-slate-800">{selectedWithdrawal.destinationDetails.accountHolder || selectedWithdrawal.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Account / IBAN</span>
                    <span className="font-mono text-purple-700 font-semibold">{selectedWithdrawal.destinationDetails.accountNumber || selectedWithdrawal.destinationDetails.iban || 'N/A'}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center py-1 border-b border-purple-100/60">
                <span className="text-slate-500 font-medium">Submission Timestamp</span>
                <span className="font-mono text-slate-700">{formatDisplayDate(selectedWithdrawal.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Current Status</span>
                <div>{getStatusBadge(selectedWithdrawal.status)}</div>
              </div>
            </div>

            {selectedWithdrawal.rejectReason && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                <span className="font-bold text-rose-800 block mb-0.5">Rejection Reason:</span>
                <p className="text-rose-700">{selectedWithdrawal.rejectReason}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer transition-colors"
              >
                Close
              </button>

              {selectedWithdrawal.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setIsDetailModalOpen(false); handleOpenAction(selectedWithdrawal, true); }}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ShieldX className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsDetailModalOpen(false); handleOpenAction(selectedWithdrawal, false); }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Approve Payout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 8. APPROVE / REJECT ACTION MODAL */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title={isRejectMode ? 'Reject Withdrawal Request' : 'Confirm Payout Approval'}
        subtitle={selectedWithdrawal ? `Payout #${selectedWithdrawal.id} • Account #${selectedWithdrawal.accountLogin}` : ''}
        maxWidth="md"
      >
        {selectedWithdrawal && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2 text-xs font-sans">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Client:</span>
                <span className="font-bold text-slate-900">{selectedWithdrawal.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Withdrawal Amount:</span>
                <span className="font-bold text-emerald-600 text-sm font-mono">
                  ${selectedWithdrawal.requestedAmount.toLocaleString()} {selectedWithdrawal.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Source MT5 Account:</span>
                <span className="font-mono text-purple-700 font-bold">#{selectedWithdrawal.accountLogin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Payout Gateway:</span>
                <span className="text-slate-700 font-medium capitalize">
                  {selectedWithdrawal.paymentMethod || selectedWithdrawal.destinationType.replace(/_/g, ' ')}
                </span>
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
                  placeholder="e.g. Exceeded maximum allowable daily bank withdrawal quota / invalid destination wallet..."
                  className="w-full px-3.5 py-2.5 bg-white border border-rose-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed">
                Approving this withdrawal will confirm payment dispatch of{' '}
                <strong className="text-purple-900 font-bold">${selectedWithdrawal.requestedAmount.toLocaleString()} {selectedWithdrawal.currency}</strong> to the client&apos;s specified payment destination and update ledger records.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsActionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={clsx(
                  "px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95",
                  isRejectMode ? "bg-rose-600 hover:bg-rose-700" : "bg-purple-600 hover:bg-purple-700"
                )}
              >
                {isRejectMode ? 'Confirm Rejection' : 'Confirm & Disburse Payout'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
