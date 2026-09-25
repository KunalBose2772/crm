'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useCRM } from '@/context/CRMContext';
import { DepositRequest } from '@/types/crm';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { Modal } from '@/components/ui/Modal';
import { 
  ArrowDownToLine, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  ChevronDown, 
  Download, 
  X, 
  Eye, 
  FileText, 
  ExternalLink, 
  ShieldCheck, 
  ShieldX, 
  CreditCard, 
  Wallet, 
  Building2, 
  CircleCheck, 
  TriangleAlert, 
  MoreHorizontal, 
  Check,
  Calendar,
  DollarSign,
  Copy
} from 'lucide-react';
import { clsx } from 'clsx';

export default function AdminDepositsPage() {
  const { deposits, approveDeposit, rejectDeposit, showToast } = useCRM();

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
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close action dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMenuId(null);
    };

    if (activeMenuId) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeMenuId]);

  // Modals state
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isRejectMode, setIsRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [copiedTxHash, setCopiedTxHash] = useState<string | null>(null);

  const handleCopyTxHash = (hash: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedTxHash(hash);
    showToast('success', 'Copied', 'Transaction ID copied to clipboard');
    setTimeout(() => {
      setCopiedTxHash(null);
    }, 2000);
  };

  // Stats calculation
  const totalCount = deposits.length;
  const approvedDeposits = deposits.filter(d => d.status === 'completed');
  const totalApprovedAmount = approvedDeposits.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingCount = deposits.filter(d => d.status === 'pending').length;
  const rejectedCount = deposits.filter(d => d.status === 'rejected').length;

  // Filtered and sorted list
  const filteredDeposits = useMemo(() => {
    return deposits
      .filter(deposit => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = 
          !q ||
          deposit.clientName.toLowerCase().includes(q) ||
          deposit.clientEmail.toLowerCase().includes(q) ||
          deposit.accountLogin.toString().includes(q) ||
          (deposit.txHash && deposit.txHash.toLowerCase().includes(q)) ||
          deposit.paymentMethod.toLowerCase().includes(q);

        if (!matchesSearch) return false;

        if (statusFilter !== 'all' && deposit.status !== statusFilter) {
          return false;
        }

        if (planFilter !== 'all') {
          const depositPlan = deposit.plan?.toUpperCase() || '';
          if (depositPlan !== planFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortField === 'amount') {
          return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
        }
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [deposits, searchQuery, statusFilter, planFilter, sortField, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredDeposits.length / pageSize) || 1;
  const paginatedDeposits = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredDeposits.slice(startIndex, startIndex + pageSize);
  }, [filteredDeposits, currentPage, pageSize]);

  // Actions
  const handleOpenDoc = (deposit: DepositRequest) => {
    setSelectedDeposit(deposit);
    setIsDocModalOpen(true);
    setActiveMenuId(null);
  };

  const handleOpenDetail = (deposit: DepositRequest) => {
    setSelectedDeposit(deposit);
    setIsDetailModalOpen(true);
    setActiveMenuId(null);
  };

  const handleOpenAction = (deposit: DepositRequest, reject = false) => {
    setSelectedDeposit(deposit);
    setIsRejectMode(reject);
    setRejectReason('');
    setIsActionModalOpen(true);
    setActiveMenuId(null);
  };

  const handleConfirmAction = () => {
    if (!selectedDeposit) return;
    if (isRejectMode) {
      if (!rejectReason.trim()) {
        showToast('error', 'Reason Required', 'Please enter a reason for rejecting this deposit.');
        return;
      }
      rejectDeposit(selectedDeposit.id, rejectReason);
      setIsActionModalOpen(false);
      setIsDetailModalOpen(false);
      setIsDocModalOpen(false);
    } else {
      approveDeposit(selectedDeposit.id);
      setIsActionModalOpen(false);
      setIsDetailModalOpen(false);
      setIsDocModalOpen(false);
    }
  };

  const handleRefresh = () => {
    showToast('success', 'Deposit Queue Synchronized', 'Real-time gateway feeds and ledger updated.');
  };

  const handleExportCSV = () => {
    const headers = ['Deposit ID', 'User', 'Email', 'Account', 'Amount', 'Currency', 'Plan', 'Payment Method', 'Status', 'Date'];
    const rows = filteredDeposits.map(d => [
      `"${d.id}"`,
      `"${d.clientName}"`,
      `"${d.clientEmail}"`,
      `"${d.accountLogin}"`,
      d.amount,
      `"${d.currency}"`,
      `"${d.plan || 'STANDARD'}"`,
      `"${d.paymentMethod}"`,
      d.status,
      `"${new Date(d.createdAt).toLocaleString()}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `deposit_management_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('info', 'Export Successful', `Exported ${filteredDeposits.length} deposits to CSV.`);
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
        <span className="inline-flex items-center justify-center rounded-md px-2.5 py-0.5 text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-xs">
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center rounded-md px-2.5 py-0.5 text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xs">
        Pending
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 select-none pb-12 font-sans">
      {/* 1. Established Royal Purple Welcome Banner */}
      <WelcomeBanner
        title="Deposit Management"
        subtitle="Manage and view all deposit requests."
        badgeText="Deposit Ledger"
        onRefresh={handleRefresh}
      />

      {/* 2. Top 4 Established KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {/* Card 1: Total Deposits */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
              Total Deposits
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {totalCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">transactions</span>
          </div>
        </div>

        {/* Card 2: Approved Volume */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
              Approved Volume
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <CircleCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">
              ${totalApprovedAmount >= 1000000 ? `${(totalApprovedAmount / 1000000).toFixed(2)}M` : totalApprovedAmount.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-600/80 font-medium">credited</span>
          </div>
        </div>

        {/* Card 3: Pending Review */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
              Pending Review
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">
              {pendingCount}
            </span>
            <span className="text-xs text-amber-500/80 font-medium">awaiting check</span>
          </div>
        </div>

        {/* Card 4: Rejected */}
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
                    <span className="text-xs font-bold text-slate-900 font-heading">Filter Deposits</span>
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
                      { id: 'completed', label: 'Approved' },
                      { id: 'pending', label: 'Pending Review' },
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
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">Trading Plan</span>
                    {['all', 'STANDARD', 'BASIC', 'VVIP'].map((p) => (
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
              title="Export deposits to CSV"
            >
              <Download className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Summary Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mt-3 sm:mt-4 pt-3 border-t border-purple-100/80 text-xs sm:text-sm">
          <span className="font-medium text-slate-600">
            Found <span className="text-purple-700 font-bold">{filteredDeposits.length}</span> deposits
          </span>
          <span className="text-slate-500 text-xs">
            Sorted by Date (newest)
          </span>
        </div>
      </div>

      {/* 4. DESKTOP DEPOSITS TABLE (Hidden on Mobile) */}
      <div className="hidden md:block bg-white rounded-3xl border border-purple-100/90 shadow-sm">
        <div className="w-full overflow-x-auto pb-8 custom-scrollbar min-h-[340px]">
          <table className="w-max min-w-[1100px] divide-y divide-purple-100/80 text-slate-700">
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
                <th className="px-6 py-4 text-left font-semibold whitespace-nowrap">Doc</th>
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
              {paginatedDeposits.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No deposits match your search or filter.</p>
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
                paginatedDeposits.map((dep, index) => {
                  const isNearBottom = index >= paginatedDeposits.length - 2 && paginatedDeposits.length > 3;

                  return (
                    <tr
                      key={dep.id}
                      className="hover:bg-gradient-to-r hover:from-purple-50/40 hover:to-indigo-50/30 transition-all duration-200 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* 1. User */}
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {dep.clientName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                              {dep.clientName}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              {dep.clientEmail}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Account */}
                      <td className="px-6 py-4 text-slate-700 font-mono text-sm">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-800 font-semibold border border-slate-200/60">
                          {dep.accountLogin}
                        </span>
                      </td>

                      {/* 3. Amount */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-emerald-600 text-sm font-mono tracking-tight">
                          +${dep.amount.toLocaleString()}
                        </span>
                      </td>

                      {/* 4. Plan */}
                      <td className="px-6 py-4">
                        {getPlanBadge(dep.plan)}
                      </td>

                      {/* 5. Payment & TXID */}
                      <td className="px-6 py-4 text-slate-700 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 capitalize font-medium">
                            {dep.paymentMethod.toLowerCase().includes('crypto') ? (
                              <Wallet className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            ) : dep.paymentMethod.toLowerCase().includes('bank') ? (
                              <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            ) : (
                              <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                            <span>{dep.paymentMethod}</span>
                          </div>
                          
                          {/* Transaction ID Badge with 1-click copy */}
                          <div className="flex items-center gap-1">
                            <span 
                              className="font-mono text-[11px] font-semibold text-purple-700 bg-purple-50/90 px-2 py-0.5 rounded-md border border-purple-200/80 max-w-[140px] truncate"
                              title={dep.txHash || dep.id}
                            >
                              {dep.txHash || dep.id}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyTxHash(dep.txHash || dep.id, e)}
                              className="p-1 rounded text-slate-400 hover:text-purple-700 hover:bg-purple-100/70 transition-colors cursor-pointer"
                              title="Copy Transaction ID"
                            >
                              {copiedTxHash === (dep.txHash || dep.id) ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* 6. Doc */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleOpenDoc(dep)}
                          className="p-1.5 rounded-lg text-purple-600 hover:text-purple-800 hover:bg-purple-100/70 transition-all cursor-pointer group-hover:scale-110"
                          title="Preview Proof Document / Voucher"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                      </td>

                      {/* 7. Date */}
                      <td className="px-6 py-4 text-xs text-slate-600 font-mono whitespace-nowrap">
                        {formatDisplayDate(dep.createdAt)}
                      </td>

                      {/* 8. Status */}
                      <td className="px-6 py-4">
                        {getStatusBadge(dep.status)}
                      </td>

                      {/* 9. Action */}
                      <td className="px-6 py-4 text-right">
                        <div 
                          ref={activeMenuId === dep.id ? menuRef : undefined}
                          className="relative inline-block text-left"
                        >
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(activeMenuId === dep.id ? null : dep.id)}
                            className="inline-flex items-center justify-center p-2 rounded-xl text-slate-600 hover:text-purple-700 hover:bg-purple-100/70 transition-colors cursor-pointer"
                            title="More Actions"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>

                          {activeMenuId === dep.id && (
                            <div 
                              className={clsx(
                                "absolute right-0 w-48 rounded-2xl bg-white border border-purple-100 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 space-y-1 ring-1 ring-black/5",
                                isNearBottom ? "bottom-full mb-2 origin-bottom-right" : "top-full mt-1 origin-top-right"
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => handleOpenDetail(dep)}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-purple-600" />
                                <span>View Details</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDoc(dep)}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Preview Receipt</span>
                              </button>
                              {dep.status === 'pending' && (
                                <>
                                  <div className="h-px bg-slate-100 my-1" />
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAction(dep, false)}
                                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer transition-colors"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Approve Deposit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAction(dep, true)}
                                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                                  >
                                    <ShieldX className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Reject Deposit</span>
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
        {paginatedDeposits.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-purple-100 text-center text-slate-400">
            <p className="text-sm font-semibold">No deposits match your filters.</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); setPlanFilter('all'); }}
              className="mt-2 text-xs font-bold text-purple-600 hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          paginatedDeposits.map((dep, idx) => (
            <div
              key={dep.id}
              className="bg-white rounded-2xl border border-purple-100/90 shadow-sm p-4 space-y-3 animate-in fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* User row + Status */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 text-sm">{dep.clientName}</div>
                  <div className="text-xs text-slate-500 font-mono">{dep.clientEmail}</div>
                </div>
                {getStatusBadge(dep.status)}
              </div>

              {/* Grid 2 cols */}
              <div className="grid grid-cols-2 gap-3 text-sm pt-1 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 text-xs">Account</span>
                  <div className="font-mono text-slate-900 text-xs font-semibold">{dep.accountLogin}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Amount</span>
                  <div className="font-bold text-emerald-600 font-mono text-sm">+${dep.amount.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Plan</span>
                  <div className="mt-0.5">{getPlanBadge(dep.plan)}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Payment</span>
                  <div className="text-slate-800 text-xs font-medium capitalize">{dep.paymentMethod}</div>
                </div>
                <div className="col-span-2 flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-bold uppercase">TXID / Hash</span>
                    <span className="font-mono text-purple-700 text-xs font-bold truncate max-w-[200px] block">
                      {dep.txHash || dep.id}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleCopyTxHash(dep.txHash || dep.id, e)}
                    className="p-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                    title="Copy Transaction ID"
                  >
                    {copiedTxHash === (dep.txHash || dep.id) ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 text-xs">Date</span>
                  <div className="text-slate-700 text-xs font-mono">{formatDisplayDate(dep.createdAt)}</div>
                </div>
              </div>

              {/* Action buttons row */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleOpenDetail(dep)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 h-8.5 rounded-xl border border-purple-200/80 bg-white hover:bg-purple-50 text-purple-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenDoc(dep)}
                  className="flex-none inline-flex items-center justify-center w-9 h-8.5 rounded-xl border border-purple-200/80 bg-purple-50 hover:bg-purple-100 text-purple-700 transition-all cursor-pointer shadow-2xs"
                  title="Document Preview"
                >
                  <FileText className="w-4 h-4" />
                </button>
                {dep.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleOpenAction(dep, false)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-8.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 6. Pagination Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 shadow-sm p-4 sm:p-5 mt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{paginatedDeposits.length}</span> of{' '}
            <span className="font-bold text-slate-800">{filteredDeposits.length}</span> deposits
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

      {/* 7. DOCUMENT PROOF PREVIEW MODAL */}
      <Modal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        title={selectedDeposit ? `Deposit Proof: ${selectedDeposit.clientName}` : 'Deposit Document'}
        subtitle={selectedDeposit ? `Account #${selectedDeposit.accountLogin} • +$${selectedDeposit.amount.toLocaleString()} ${selectedDeposit.currency}` : ''}
        maxWidth="lg"
      >
        {selectedDeposit && (
          <div className="space-y-5">
            {/* Metadata chip */}
            <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Account</span>
                <span className="font-bold text-slate-900 font-mono">#{selectedDeposit.accountLogin}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Amount</span>
                <span className="font-bold text-emerald-600 font-mono">+${selectedDeposit.amount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Method</span>
                <span className="font-semibold text-slate-800 capitalize">{selectedDeposit.paymentMethod}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Status</span>
                <div className="mt-0.5">{getStatusBadge(selectedDeposit.status)}</div>
              </div>
            </div>

            {/* Transaction ID / Blockchain Hash Verification Bar */}
            <div className="p-3 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-purple-400 tracking-wider">
                    Transaction ID / TX Hash
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Primary Proof
                  </span>
                </div>
                <div className="mt-1 font-mono text-xs sm:text-sm font-semibold text-slate-100 truncate select-all">
                  {selectedDeposit.txHash || selectedDeposit.id}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleCopyTxHash(selectedDeposit.txHash || selectedDeposit.id, e)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
                  title="Copy Transaction ID"
                >
                  {copiedTxHash === (selectedDeposit.txHash || selectedDeposit.id) ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy TXID</span>
                    </>
                  )}
                </button>

                {selectedDeposit.paymentMethod.toLowerCase().includes('crypto') && selectedDeposit.txHash && !selectedDeposit.txHash.startsWith('TXN-') && (
                  <a
                    href={`https://tronscan.org/#/transaction/${selectedDeposit.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
                    title="Verify on TronScan Explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">TronScan</span>
                  </a>
                )}
              </div>
            </div>

            {/* Document preview container */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 flex items-center justify-between font-heading">
                <span>Payment Slip / Blockchain Voucher</span>
                <span className="text-[11px] text-purple-600 font-normal">Verified Receipt Scan</span>
              </span>

              <div className="rounded-2xl border border-purple-100 overflow-hidden bg-slate-50 relative group shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedDeposit.proofDocumentUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop'}
                  alt="Deposit Proof"
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <a
                  href={selectedDeposit.proofDocumentUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" /> Expand Original Proof
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDocModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer transition-colors"
              >
                Close
              </button>

              {selectedDeposit.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenAction(selectedDeposit, true)}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ShieldX className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenAction(selectedDeposit, false)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Approve Deposit</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 8. DETAIL VIEW MODAL */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedDeposit ? `Deposit Details: #${selectedDeposit.id}` : 'Deposit Overview'}
        subtitle={selectedDeposit ? `Client: ${selectedDeposit.clientName} (${selectedDeposit.clientEmail})` : ''}
        maxWidth="lg"
      >
        {selectedDeposit && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-purple-100/60">
                <span className="text-slate-500 font-medium">Deposit Identifier</span>
                <span className="font-mono font-bold text-purple-700">{selectedDeposit.id}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-purple-100/60">
                <span className="text-slate-500 font-medium">Destination Trading Account</span>
                <span className="font-mono font-bold text-slate-900">#{selectedDeposit.accountLogin}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-purple-100/60">
                <span className="text-slate-500 font-medium">Credited Amount</span>
                <span className="font-mono font-extrabold text-emerald-600 text-sm">
                  +${selectedDeposit.amount.toLocaleString()} {selectedDeposit.currency}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-purple-100/60">
                <span className="text-slate-500 font-medium">Selected Plan</span>
                <div>{getPlanBadge(selectedDeposit.plan)}</div>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-purple-100/60">
                <span className="text-slate-500 font-medium">Payment Gateway / Rail</span>
                <span className="font-semibold text-slate-800 capitalize">{selectedDeposit.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-purple-100/60">
                <span className="text-slate-500 font-medium">Transaction ID / TX Hash</span>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                    {selectedDeposit.txHash || selectedDeposit.id}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleCopyTxHash(selectedDeposit.txHash || selectedDeposit.id, e)}
                    className="p-1 rounded-md text-purple-600 hover:text-purple-800 hover:bg-purple-100 cursor-pointer"
                    title="Copy Transaction ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-purple-100/60">
                <span className="text-slate-500 font-medium">Timestamp</span>
                <span className="font-mono text-slate-700">{formatDisplayDate(selectedDeposit.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Current Status</span>
                <div>{getStatusBadge(selectedDeposit.status)}</div>
              </div>
            </div>

            {selectedDeposit.remarks && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-0.5">Remarks / Reason:</span>
                <p className="text-slate-600">{selectedDeposit.remarks}</p>
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

              <button
                type="button"
                onClick={() => { setIsDetailModalOpen(false); handleOpenDoc(selectedDeposit); }}
                className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Payment Receipt</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 9. APPROVE / REJECT ACTION MODAL */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title={isRejectMode ? 'Reject Deposit Request' : 'Confirm Deposit Approval'}
        subtitle={selectedDeposit ? `Deposit #${selectedDeposit.id} • Account #${selectedDeposit.accountLogin}` : ''}
        maxWidth="md"
      >
        {selectedDeposit && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2 text-xs font-sans">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Client:</span>
                <span className="font-bold text-slate-900">{selectedDeposit.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Credit Amount:</span>
                <span className="font-bold text-emerald-600 text-sm font-mono">
                  +${selectedDeposit.amount.toLocaleString()} {selectedDeposit.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Destination Account:</span>
                <span className="font-mono text-purple-700 font-bold">#{selectedDeposit.accountLogin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Payment Gateway:</span>
                <span className="text-slate-700 font-medium capitalize">{selectedDeposit.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-purple-100/60">
                <span className="text-slate-500 font-medium">Transaction ID / TX Hash:</span>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="font-bold text-purple-700 bg-white px-2 py-0.5 rounded-lg border border-purple-200">
                    {selectedDeposit.txHash || selectedDeposit.id}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleCopyTxHash(selectedDeposit.txHash || selectedDeposit.id, e)}
                    className="p-1 rounded text-purple-600 hover:text-purple-800 hover:bg-purple-100 cursor-pointer"
                    title="Copy Transaction ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
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
                  placeholder="e.g. TX hash not verified on blockchain / sender bank account name mismatch..."
                  className="w-full px-3.5 py-2.5 bg-white border border-rose-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed">
                Approving this deposit will instantly credit the client&apos;s MT5 balance and equity by{' '}
                <strong className="text-purple-900 font-bold">${selectedDeposit.amount.toLocaleString()} {selectedDeposit.currency}</strong> and generate a transaction ledger receipt.
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
                {isRejectMode ? 'Confirm Rejection' : 'Confirm & Credit Balance'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
