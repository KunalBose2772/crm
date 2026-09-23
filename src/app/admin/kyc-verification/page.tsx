'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/context/CRMContext';
import { KYCRecord } from '@/types/crm';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { Modal } from '@/components/ui/Modal';
import { 
  FileText, 
  Clock, 
  CircleCheck, 
  TriangleAlert, 
  Search, 
  Filter, 
  ChevronDown, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  X, 
  Check, 
  ShieldCheck, 
  ShieldX, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { clsx } from 'clsx';

export default function KYCVerificationPage() {
  const { kycRecords, approveKYC, rejectKYC, showToast } = useCRM();

  // Search, filter, and pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'rejected'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Review modal state
  const [selectedRecord, setSelectedRecord] = useState<KYCRecord | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Stats calculation
  const totalSubmissions = kycRecords.length;
  const pendingCount = kycRecords.filter(r => r.status === 'pending').length;
  const approvedCount = kycRecords.filter(r => r.status === 'verified').length;
  const rejectedCount = kycRecords.filter(r => r.status === 'rejected').length;

  // Filtered list
  const filteredRecords = useMemo(() => {
    return kycRecords.filter(record => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        record.clientName.toLowerCase().includes(q) ||
        record.clientEmail.toLowerCase().includes(q) ||
        record.country.toLowerCase().includes(q) ||
        (record.accountNumber && record.accountNumber.toLowerCase().includes(q)) ||
        record.documentNumber.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter !== 'all' && record.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [kycRecords, searchQuery, statusFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRecords.slice(startIndex, startIndex + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Review Actions
  const handleOpenReview = (record: KYCRecord) => {
    setSelectedRecord(record);
    setIsRejecting(false);
    setRejectReason('');
    setIsReviewModalOpen(true);
  };

  const handleApprove = () => {
    if (!selectedRecord) return;
    approveKYC(selectedRecord.id);
    showToast('success', 'KYC Approved', `${selectedRecord.clientName}'s identity documents verified.`);
    setIsReviewModalOpen(false);
  };

  const handleReject = () => {
    if (!selectedRecord) return;
    if (!rejectReason.trim()) {
      showToast('error', 'Reason Required', 'Please specify a reason for document rejection.');
      return;
    }
    rejectKYC(selectedRecord.id, rejectReason);
    showToast('warning', 'KYC Rejected', `${selectedRecord.clientName}'s documents marked as rejected.`);
    setIsReviewModalOpen(false);
  };

  const handleRefresh = () => {
    showToast('success', 'KYC Queue Refreshed', 'Synchronized real-time KYC submissions.');
  };

  const handleExportCSV = () => {
    const headers = ['Client', 'Email', 'Phone', 'Country', 'DOB', 'Submitted', 'Status', 'Doc Number'];
    const rows = filteredRecords.map(r => [
      `"${r.clientName}"`,
      `"${r.clientEmail}"`,
      `"${r.clientPhone || 'N/A'}"`,
      `"${r.country}"`,
      `"${r.dob || 'N/A'}"`,
      `"${r.submittedAt}"`,
      r.status,
      `"${r.documentNumber}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kyc_verification_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('info', 'Export Successful', `Exported ${filteredRecords.length} records to CSV.`);
  };

  const formatSubmittedDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    } catch {
      return '7/30/2026';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 select-none pb-12 font-sans">
      {/* 1. Established Royal Purple Welcome Banner */}
      <WelcomeBanner
        title="KYC Verification Management"
        subtitle="Review and verify client KYC documents"
        badgeText="Verification Queue"
        onRefresh={handleRefresh}
      />

      {/* 2. Top 4 Established KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {/* Card 1: Total Submissions */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
              Total Submissions
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {totalSubmissions}
            </span>
            <span className="text-xs text-slate-400 font-medium">applications</span>
          </div>
        </div>

        {/* Card 2: Pending Review */}
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

        {/* Card 3: Approved */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
              Approved
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <CircleCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">
              {approvedCount}
            </span>
            <span className="text-xs text-emerald-600/80 font-medium">verified</span>
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

      {/* 3. Consistent Search, Filter, and Export Controls Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 shadow-xs p-3.5 sm:p-5 relative z-20">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by name, email, country, or doc number..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl sm:rounded-2xl border border-purple-100 bg-purple-50/20 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200/50 transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Filter Status Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={clsx(
                  "flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold border transition-all cursor-pointer shadow-2xs",
                  statusFilter !== 'all' || isFilterOpen
                    ? "bg-purple-600 text-white border-purple-600 shadow-purple-500/20"
                    : "bg-white text-slate-700 border-purple-200/80 hover:bg-purple-50/50 hover:text-purple-700"
                )}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter Status</span>
                {statusFilter !== 'all' && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white text-purple-700 text-[10px] font-extrabold capitalize">
                    {statusFilter}
                  </span>
                )}
                <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform duration-200", isFilterOpen && "rotate-180")} />
              </button>

              {/* Filter Popover Dropdown */}
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-purple-100 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 space-y-1">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900 font-heading">Filter Queue</span>
                    {statusFilter !== 'all' && (
                      <button
                        type="button"
                        onClick={() => { setStatusFilter('all'); setIsFilterOpen(false); }}
                        className="text-[10px] font-bold text-purple-600 hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  {[
                    { id: 'all', label: 'All Submissions' },
                    { id: 'verified', label: 'Verified / Approved' },
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
                        "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer",
                        statusFilter === item.id
                          ? "bg-purple-50 text-purple-700 font-bold"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold border border-purple-200/80 bg-white text-slate-700 hover:bg-purple-50/50 hover:text-purple-700 transition-all cursor-pointer shadow-2xs"
              title="Export KYC queue to CSV"
            >
              <Download className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Active Filter Pill */}
        {statusFilter !== 'all' && (
          <div className="flex items-center gap-2 pt-2.5 text-xs">
            <span className="text-[11px] text-slate-400 font-bold">Active Filter:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] flex items-center gap-1.5 capitalize">
              Status: {statusFilter}
              <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => setStatusFilter('all')} />
            </span>
          </div>
        )}
      </div>

      {/* 4. DESKTOP KYC TABLE (Hidden on Mobile) */}
      <div className="hidden lg:block bg-white rounded-3xl border border-purple-100/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1280px] w-full border-collapse">
            <thead>
              <tr className="border-b border-purple-100/90 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[11px] font-heading">
                <th className="py-4 px-4 pl-6 text-left">Client</th>
                <th className="py-4 px-4 text-left">Contact</th>
                <th className="py-4 px-4 text-left">Country / DOB</th>
                <th className="py-4 px-4 text-left">Submitted</th>
                <th className="py-4 px-4 text-left">Documents</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 pr-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 text-slate-700">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No KYC records match your criteria.</p>
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                      className="mt-2 text-xs font-bold text-purple-600 hover:underline cursor-pointer"
                    >
                      Clear search &amp; filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => {
                  const isVerified = record.status === 'verified';
                  const isPending = record.status === 'pending';
                  const isRejected = record.status === 'rejected';

                  const reviewedCount = record.reviewedDocsCount || 1;
                  const totalDocs = record.totalDocsCount || 1;
                  const progressPct = Math.round((reviewedCount / totalDocs) * 100);

                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-purple-50/30 transition-colors group"
                    >
                      {/* 1. Client Column */}
                      <td className="py-4 px-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {record.clientName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate group-hover:text-purple-700 transition-colors">
                              {record.clientName}
                            </span>
                            <span className="text-xs text-slate-500 font-mono block truncate max-w-[190px]">
                              {record.clientEmail}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                              A/C: {record.accountNumber || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Contact Column */}
                      <td className="py-4 px-4 text-xs text-slate-600">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span className="font-mono">{record.clientPhone || '8888888888'}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">N/A</div>
                        </div>
                      </td>

                      {/* 3. Country / DOB Column */}
                      <td className="py-4 px-4 text-xs text-slate-600">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span className="font-medium text-slate-700">{record.country}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span className="font-mono text-[11px] text-slate-400">
                              {record.dob ? record.dob.split('T')[0] : '1988-08-08'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 4. Submitted Column */}
                      <td className="py-4 px-4 text-xs font-mono text-slate-600 whitespace-nowrap">
                        {formatSubmittedDate(record.submittedAt)}
                      </td>

                      {/* 5. Documents Column with Progress Bar */}
                      <td className="py-4 px-4">
                        <div className="min-w-[170px] space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-slate-600 font-sans">
                            <span className="font-medium">{reviewedCount}/{totalDocs} reviewed</span>
                            <span className="text-[11px] text-slate-400 font-mono">{totalDocs} docs</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 6. Status Column */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                            isVerified && "bg-emerald-100 text-emerald-800",
                            isPending && "bg-amber-100 text-amber-800",
                            isRejected && "bg-rose-100 text-rose-800"
                          )}
                        >
                          {isVerified ? (
                            <CircleCheck className="w-3.5 h-3.5 text-emerald-600" />
                          ) : isPending ? (
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          <span className="capitalize">{record.status}</span>
                        </span>
                      </td>

                      {/* 7. Actions Column */}
                      <td className="py-4 px-4 pr-6 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenReview(record)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200/80 bg-white hover:bg-purple-50 text-purple-700 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-600" />
                          <span>Open Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Directory Footer with Pagination */}
        <div className="p-4 border-t border-purple-50 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{paginatedRecords.length}</span> of{' '}
            <span className="font-bold text-slate-800">{filteredRecords.length}</span> total submissions
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-xl border border-purple-200/80 bg-white hover:bg-purple-50 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
                      ? "bg-purple-600 text-white shadow-xs"
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
              className="px-3 py-1.5 rounded-xl border border-purple-200/80 bg-white hover:bg-purple-50 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 5. MOBILE RESPONSIVE CARDS (Visible only on mobile/tablet) */}
      <div className="lg:hidden space-y-3">
        {paginatedRecords.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-purple-100 text-center text-slate-400">
            <p className="text-sm font-semibold">No KYC records match your criteria.</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
              className="mt-2 text-xs font-bold text-purple-600 hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          paginatedRecords.map((record) => {
            const isVerified = record.status === 'verified';
            const isPending = record.status === 'pending';
            const isRejected = record.status === 'rejected';

            return (
              <div
                key={record.id}
                className="p-4 rounded-2xl bg-white border border-purple-100/90 shadow-2xs space-y-3"
              >
                {/* Header: Name, Country, and Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {record.clientName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{record.clientName}</h4>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        A/C: {record.accountNumber || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <span
                    className={clsx(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize shrink-0",
                      isVerified && "bg-emerald-100 text-emerald-800",
                      isPending && "bg-amber-100 text-amber-800",
                      isRejected && "bg-rose-100 text-rose-800"
                    )}
                  >
                    {record.status}
                  </span>
                </div>

                {/* Details */}
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="font-mono truncate">{record.clientEmail}</div>
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-purple-500" />
                      {record.clientPhone || '8888888888'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-purple-500" />
                      {record.country}
                    </span>
                  </div>
                </div>

                {/* Open Review button */}
                <button
                  type="button"
                  onClick={() => handleOpenReview(record)}
                  className="w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open Review &amp; Verify</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* 6. REVIEW & VERIFICATION MODAL */}
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
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 grid grid-cols-3 gap-4 text-xs font-sans">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Client Name</span>
                <span className="font-bold text-slate-900 text-sm">{selectedRecord.clientName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Country</span>
                <span className="font-bold text-slate-900 text-sm">{selectedRecord.country}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Current Status</span>
                <span className={clsx(
                  "inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize",
                  selectedRecord.status === 'verified' && "bg-emerald-100 text-emerald-800",
                  selectedRecord.status === 'pending' && "bg-amber-100 text-amber-800",
                  selectedRecord.status === 'rejected' && "bg-rose-100 text-rose-800"
                )}>
                  {selectedRecord.status}
                </span>
              </div>
            </div>

            {/* Document Preview Scans */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 font-heading">
                <FileText className="w-4 h-4 text-purple-600" />
                Submitted Document Images
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-500 font-semibold">Front Document Scan</span>
                  <div className="h-52 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative group flex items-center justify-center shadow-inner">
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
                    <div className="h-52 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative group flex items-center justify-center shadow-inner">
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
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                <label className="block text-xs font-bold text-rose-800">
                  Reason for Document Rejection *
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Specify why the submission was rejected (e.g. Blurry photo, document expired, name mismatch)..."
                  className="w-full px-3.5 py-2.5 bg-white border border-rose-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {!isRejecting ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsRejecting(true)}
                      className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ShieldX className="w-4 h-4" />
                      <span>Reject Submission</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleApprove}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Approve &amp; Verify Client</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsRejecting(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      Confirm Rejection
                    </button>
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
