'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Users, 
  Award, 
  ShieldCheck, 
  DollarSign, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle,
  Search,
  Filter,
  BarChart3,
  Percent,
  Sliders,
  LayoutGrid,
  List,
  Download,
  RotateCw,
  ExternalLink,
  ChevronDown,
  X,
  Eye,
  ShieldAlert,
  ArrowDownRight,
  TrendingDown,
  Clock,
  Sparkles,
  FileSpreadsheet,
  Info,
  FileText,
  BarChart2
} from 'lucide-react';
import { INITIAL_MASTER_TRADERS } from '@/data/mockCopyTrading';
import { MasterTrader } from '@/types/crm';
import { useCRM } from '@/context/CRMContext';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { MasterTraderCard } from '@/components/cards/MasterTraderCard';
import { clsx } from 'clsx';

export default function AdminCopyTradingPage() {
  const { showToast } = useCRM();
  const [masters, setMasters] = useState<MasterTrader[]>(INITIAL_MASTER_TRADERS);

  // View Switcher State: 'table' | 'grid' | 'subscriptions'
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'subscriptions'>('table');
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4>(3);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'verified' | 'unverified'>('all');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterMenuOpen(false);
      }
    }
    if (filterMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filterMenuOpen]);

  // Selected Master Detail Drawer / Modal
  const [selectedMaster, setSelectedMaster] = useState<MasterTrader | null>(null);

  // Aggregate Metrics
  const totalCopiersAll = masters.reduce((acc, m) => acc + m.totalCopiers, 0);
  const totalMasterEquity = masters.reduce((acc, m) => acc + m.equity, 0);
  const totalMasterBalance = masters.reduce((acc, m) => acc + m.balance, 0);
  const avgProfitShare = (masters.reduce((acc, m) => acc + m.totalProfitShare, 0) / (masters.length || 1)).toFixed(1);
  const avgWinRate = (masters.reduce((acc, m) => acc + m.winRate, 0) / (masters.length || 1)).toFixed(1);

  // Filter Logic
  const filteredMasters = useMemo(() => {
    return masters.filter(m => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.strategyName.toLowerCase().includes(q) ||
        m.login.toString().includes(q) ||
        m.country.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedRisk !== 'all' && m.riskScore.toString() !== selectedRisk) {
        return false;
      }

      if (selectedStatus === 'verified' && !m.verified) return false;
      if (selectedStatus === 'unverified' && m.verified) return false;

      return true;
    });
  }, [masters, searchQuery, selectedRisk, selectedStatus]);

  // Actions
  const toggleVerify = (masterId: string) => {
    setMasters(prev =>
      prev.map(m => {
        if (m.id === masterId) {
          const updated = !m.verified;
          showToast(
            'success',
            'Verification Updated',
            `${m.name} is now ${updated ? 'verified' : 'unverified'}.`
          );
          return { ...m, verified: updated };
        }
        return m;
      })
    );
  };

  const handleRefresh = () => {
    showToast('success', 'Synchronized', 'Master trading accounts and copier allocations updated.');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Master Name', 'MT5 Login', 'Strategy', 'Country', 'Gain %', 'Copiers', 'Equity', 'Balance', 'Win Rate %', 'Profit Share %', 'Risk Score', 'Verified'];
    const rows = filteredMasters.map(m => [
      `"${m.id}"`,
      `"${m.name}"`,
      m.login,
      `"${m.strategyName}"`,
      `"${m.country}"`,
      m.overallGain,
      m.totalCopiers,
      m.equity,
      m.balance,
      m.winRate,
      m.totalProfitShare,
      m.riskScore,
      m.verified ? 'Verified' : 'Unverified'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `master_traders_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('info', 'Export Successful', `Exported ${filteredMasters.length} master strategies to CSV.`);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRisk('all');
    setSelectedStatus('all');
  };

  const activeFiltersCount = [
    selectedRisk !== 'all',
    selectedStatus !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 select-none pb-12">
      {/* 1. Royal Purple Welcome Header Banner */}
      <WelcomeBanner
        title="Copy Trading Administration"
        subtitle="Manage master traders, monitor institutional asset allocation, supervise real-time risk scores, and manage copier subscriptions."
        badgeText="Institutional Asset Desk"
        onRefresh={handleRefresh}
      />

      {/* 2. Top Metric Cards - Responsive 2x2 Grid on Mobile with Compact Modern Proportions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Active Master Strategies */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-indigo-200/70 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all duration-300 group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-indigo-900/70 font-sans truncate">
              Strategies
            </span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform shrink-0">
              <Award className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-3 flex flex-wrap items-baseline gap-1 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black text-slate-900 font-heading tracking-tight">
              {masters.length}
            </span>
            <span className="px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[9px] sm:text-[10px] font-bold">
              Active
            </span>
          </div>
          <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium mt-0.5 sm:mt-1 truncate">
            Algorithmic pools
          </p>
        </div>

        {/* Card 2: Total Active Copiers */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-blue-200/70 bg-gradient-to-br from-blue-50/70 via-white to-sky-50/40 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-300 group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-blue-900/70 font-sans truncate">
              Total Copiers
            </span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform shrink-0">
              <Users className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-3 flex flex-wrap items-baseline gap-1 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black text-blue-600 font-heading tracking-tight">
              {totalCopiersAll.toLocaleString()}
            </span>
            <span className="px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full bg-blue-100 text-blue-800 text-[9px] sm:text-[10px] font-bold">
              Live
            </span>
          </div>
          <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium mt-0.5 sm:mt-1 truncate">
            Replicating orders
          </p>
        </div>

        {/* Card 3: Total Master Equity */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-emerald-200/70 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-300 group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-emerald-900/70 font-sans truncate">
              Total Equity
            </span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform shrink-0">
              <DollarSign className="w-3.5 h-3.5 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-3 flex flex-wrap items-baseline gap-1 sm:gap-2">
            <span className="text-lg sm:text-3xl font-black text-emerald-600 font-heading tracking-tight">
              ${totalMasterEquity.toLocaleString()}
            </span>
            <span className="px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] sm:text-[10px] font-bold">
              AUC
            </span>
          </div>
          <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium mt-0.5 sm:mt-1 truncate">
            Controlled on MT5
          </p>
        </div>

        {/* Card 4: Average Win Rate */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-amber-200/70 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 shadow-xs hover:shadow-md hover:border-amber-300 transition-all duration-300 group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-amber-900/70 font-sans truncate">
              Avg Win Rate
            </span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform shrink-0">
              <Percent className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-3 flex flex-wrap items-baseline gap-1 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black text-amber-600 font-heading tracking-tight">
              {avgWinRate}%
            </span>
            <span className="px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full bg-purple-100 text-purple-800 text-[9px] sm:text-[10px] font-bold">
              {avgProfitShare}% fee
            </span>
          </div>
          <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium mt-0.5 sm:mt-1 truncate">
            Closed positions
          </p>
        </div>
      </div>

      {/* 3. Search, Filter, View Switcher & Action Toolbar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 shadow-xs p-3.5 sm:p-5 relative z-20">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search master by name, strategy, country, or MT5 login..."
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

            {/* View Switcher & Action Controls */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* View Switcher Segmented Control */}
              <div className="flex items-center bg-purple-50/60 p-1 rounded-xl sm:rounded-2xl border border-purple-100">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all",
                    viewMode === 'table'
                      ? "bg-white text-purple-900 shadow-xs"
                      : "text-slate-500 hover:text-purple-700"
                  )}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">Table</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all cursor-pointer",
                    viewMode === 'grid'
                      ? "bg-white text-purple-900 shadow-xs"
                      : "text-slate-500 hover:text-purple-700"
                  )}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
              </div>

              {/* Grid Column Selector (Visible in Grid Mode on Desktop) */}
              {viewMode === 'grid' && (
                <div className="hidden sm:flex items-center gap-1 p-1 bg-purple-50/70 border border-purple-100 rounded-xl">
                  <span className="text-[10px] font-extrabold text-purple-900/60 uppercase px-1">Layout:</span>
                  {([2, 3, 4] as const).map(cols => (
                    <button
                      key={cols}
                      type="button"
                      onClick={() => setGridColumns(cols)}
                      className={clsx(
                        "px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer",
                        gridColumns === cols
                          ? "bg-purple-600 text-white shadow-2xs"
                          : "text-slate-600 hover:bg-white"
                      )}
                      title={`${cols} columns`}
                    >
                      {cols}x
                    </button>
                  ))}
                </div>
              )}

              {/* Filter Popover Button */}
              <div className="relative" ref={filterRef}>
                <button
                  type="button"
                  onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold border transition-all cursor-pointer shadow-2xs",
                    filterMenuOpen || activeFiltersCount > 0
                      ? "bg-purple-600 text-white border-purple-600 shadow-purple-500/20"
                      : "bg-white text-slate-700 border-purple-200/80 hover:bg-purple-50/50 hover:text-purple-700"
                  )}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-white text-purple-700 text-[10px] font-extrabold flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                  <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform", filterMenuOpen && "rotate-180")} />
                </button>

                {/* Filter Dropdown Menu */}
                {filterMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-purple-100 p-4 z-50 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-800">Filter Strategies</span>
                      <button
                        onClick={resetFilters}
                        className="text-[11px] font-semibold text-purple-600 hover:underline"
                      >
                        Reset All
                      </button>
                    </div>

                    {/* Risk Filter */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Risk Level
                      </label>
                      <select
                        value={selectedRisk}
                        onChange={(e) => setSelectedRisk(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="all">All Risk Levels</option>
                        <option value="1">Risk 1 (Ultra Conservative)</option>
                        <option value="2">Risk 2 (Moderate)</option>
                        <option value="3">Risk 3 (Balanced)</option>
                        <option value="4">Risk 4 (Aggressive)</option>
                        <option value="5">Risk 5 (Extreme)</option>
                      </select>
                    </div>

                    {/* Verification Status */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Verification
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="all">All Masters</option>
                        <option value="verified">Verified Only</option>
                        <option value="unverified">Unverified Only</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setFilterMenuOpen(false)}
                      className="w-full py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition"
                    >
                      Apply Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Export CSV Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold border border-purple-200/80 bg-white text-slate-700 hover:bg-purple-50/50 hover:text-purple-700 transition-all shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              {/* View Client Hub Link */}
              <Link
                href="/client/copy-trading"
                target="_blank"
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold bg-gradient-to-r from-purple-700 to-indigo-700 text-white hover:from-purple-800 hover:to-indigo-800 transition-all shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Client View</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. DESKTOP COPY TRADING TABLE (Hidden on Mobile/Tablet) */}
      {viewMode === 'table' && (
        <>
          <div className="hidden lg:block bg-white rounded-3xl border border-purple-100/90 shadow-sm overflow-hidden">
            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-purple-100/90 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[11px] font-heading">
                    <th className="py-4 px-4 pl-6">Master Trader</th>
                    <th className="py-4 px-4">MT5 Login</th>
                    <th className="py-4 px-4">Overall Gain</th>
                    <th className="py-4 px-4">Copiers</th>
                    <th className="py-4 px-4">Master Equity</th>
                    <th className="py-4 px-4">Win Rate</th>
                    <th className="py-4 px-4">Profit Share</th>
                    <th className="py-4 px-3 text-center">Risk Level</th>
                    <th className="py-4 px-3 text-center">Verification</th>
                    <th className="py-4 px-4 pr-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50 text-slate-700 font-sans">
                  {filteredMasters.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        <p className="text-sm font-semibold">No master traders found matching your criteria.</p>
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="mt-2 text-xs font-bold text-purple-600 hover:underline cursor-pointer"
                        >
                          Clear search &amp; filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredMasters.map(master => (
                      <tr key={master.id} className="hover:bg-purple-50/30 transition-colors group">
                        <td className="py-4 px-4 pl-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={master.avatar}
                              alt={master.name}
                              className="w-9 h-9 rounded-xl object-cover border border-purple-100 shadow-2xs"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block text-xs group-hover:text-purple-700 transition-colors">
                                {master.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {master.strategyName} • {master.country}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-heading text-[11px] font-extrabold tracking-tight">
                            #{master.login}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-black text-emerald-600 text-sm font-heading tracking-tight">
                            +{master.overallGain.toFixed(1)}%
                          </span>
                          <span className="block text-[10px] text-slate-400 font-semibold font-heading">
                            3M: +{master.gain3m}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-800 font-heading text-xs">
                          {master.totalCopiers.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-900 font-heading text-xs">
                          ${master.equity.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-black text-blue-600 font-heading text-xs">{master.winRate}%</span>
                          <span className="block text-[10px] text-slate-400 font-semibold font-heading">PF: {master.profitFactor}</span>
                        </td>
                        <td className="py-3.5 px-4 font-black text-purple-700 font-heading text-xs">
                          {master.totalProfitShare}%
                        </td>
                        <td className="py-4 px-3 text-center">
                          <span
                            className={clsx(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                              master.riskScore <= 2
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : master.riskScore === 3
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            )}
                          >
                            Level {master.riskScore}/5
                          </span>
                        </td>
                        <td className="py-4 px-3 text-center">
                          {master.verified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200">
                              Unverified
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 pr-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedMaster(master)}
                              className="p-1.5 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 transition cursor-pointer shadow-2xs"
                              title="View Strategy DNA"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleVerify(master.id)}
                              className={clsx(
                                "px-2.5 py-1 rounded-xl text-[11px] font-bold transition border cursor-pointer shadow-2xs",
                                master.verified
                                  ? 'border-purple-200/80 bg-white text-slate-700 hover:bg-purple-50/50 hover:text-purple-700'
                                  : 'border-purple-600 bg-purple-600 text-white hover:bg-purple-700'
                              )}
                            >
                              {master.verified ? 'Revoke' : 'Verify'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Directory Footer with Count */}
            <div className="p-4 border-t border-purple-50 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
              <div>
                Showing <span className="font-bold text-slate-800">{filteredMasters.length}</span> of{' '}
                <span className="font-bold text-slate-800">{masters.length}</span> total master strategies
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-purple-700 font-semibold">
                  Live Algorithmic Replicator Active
                </span>
              </div>
            </div>
          </div>

          {/* MOBILE RESPONSIVE CARDS (Visible only on mobile/tablet) */}
          <div className="lg:hidden space-y-3">
            {filteredMasters.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-purple-100 text-center text-slate-400">
                <p className="text-sm font-semibold">No master traders match your filter criteria.</p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-2 text-xs font-bold text-purple-600 hover:underline cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredMasters.map((master) => (
                <div
                  key={master.id}
                  className="p-4 rounded-2xl bg-white border border-purple-100/90 shadow-2xs space-y-3 transition-all"
                >
                  {/* Header: Name, MT5, and Verification */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={master.avatar}
                        alt={master.name}
                        className="w-10 h-10 rounded-xl object-cover border border-purple-100 shadow-2xs"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{master.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono block">MT5 #{master.login} • {master.country}</span>
                      </div>
                    </div>
                    {master.verified ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        Unverified
                      </span>
                    )}
                  </div>

                  {/* Return and Equity row */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-purple-50/30 border border-purple-100/60 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Overall Gain</span>
                      <span className="text-base font-black text-emerald-600 font-heading">+{master.overallGain.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Master Equity</span>
                      <span className="text-base font-black text-slate-900 font-heading">${master.equity.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Micro stats */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>Copiers: <strong className="text-slate-800 font-heading">{master.totalCopiers}</strong></span>
                    <span>Win Rate: <strong className="text-blue-600 font-heading">{master.winRate}%</strong></span>
                    <span>Fee: <strong className="text-purple-700 font-heading">{master.totalProfitShare}%</strong></span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedMaster(master)}
                      className="px-3 py-1.5 rounded-xl border border-purple-200 text-purple-700 text-xs font-bold hover:bg-purple-50 transition"
                    >
                      Strategy DNA
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleVerify(master.id)}
                      className={clsx(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition border",
                        master.verified
                          ? 'border-purple-200/80 bg-white text-slate-700 hover:bg-purple-50/50'
                          : 'border-purple-600 bg-purple-600 text-white hover:bg-purple-700'
                      )}
                    >
                      {master.verified ? 'Revoke' : 'Verify Master'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* 5. Main Content: Grid Card View (1 col on mobile, customizable 2x/3x/4x on desktop) */}
      {viewMode === 'grid' && (
        <div className={`grid grid-cols-1 gap-3 sm:gap-4 ${
          gridColumns === 2
            ? 'sm:grid-cols-2 lg:grid-cols-2'
            : gridColumns === 4
              ? 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
              : 'sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {filteredMasters.map(master => (
            <MasterTraderCard
              key={master.id}
              master={master}
              isAdmin={true}
              onSelect={(m) => setSelectedMaster(m)}
              onVerifyToggle={(id) => toggleVerify(id)}
            />
          ))}
        </div>
      )}

      {/* 6. Strategy Detail Offcanvas Right Drawer */}
      {selectedMaster && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={() => setSelectedMaster(null)} />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none">
            <div className="w-screen max-w-md sm:max-w-lg pointer-events-auto bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
              {/* Header - Clean, Crisp, Flat Design */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={selectedMaster.avatar}
                    alt={selectedMaster.name}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-slate-900 font-heading truncate">
                      {selectedMaster.name}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                      MT5 #{selectedMaster.login} • {selectedMaster.strategyName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMaster(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                  title="Close panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Strategy Rules & Scope</h3>
                  <p className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 leading-relaxed font-sans">
                    {selectedMaster.description}
                  </p>
                </div>

                {/* 2x2 Stat Cards matching Image 2 */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Total Gain */}
                  <div className="relative overflow-hidden p-3.5 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[92px]">
                    <div className="flex items-center justify-between gap-1.5 z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500 text-[10px] font-bold tracking-wider uppercase">Total Gain</span>
                          <Info className="w-3 h-3 text-slate-400 cursor-pointer" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-2 z-10">
                      <span className="text-xl font-black text-emerald-600 font-heading tracking-tight">
                        +{selectedMaster.overallGain}%
                      </span>
                    </div>

                    {/* Green upward sparkline curve graphic */}
                    <div className="absolute right-2 bottom-1.5 w-24 h-12 pointer-events-none opacity-90">
                      <svg viewBox="0 0 100 45" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="gainGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 5,38 C 25,36 35,42 50,30 C 65,18 75,25 92,8 L 92,45 L 5,45 Z"
                          fill="url(#gainGrad)"
                        />
                        <path
                          d="M 5,38 C 25,36 35,42 50,30 C 65,18 75,25 92,8"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <circle cx="92" cy="8" r="3.5" fill="#10b981" />
                      </svg>
                    </div>
                  </div>

                  {/* Max Drawdown */}
                  <div className="relative overflow-hidden p-3.5 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[92px]">
                    <div className="flex items-center justify-between gap-1.5 z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                          <TrendingDown className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500 text-[10px] font-bold tracking-wider uppercase">Max Drawdown</span>
                          <Info className="w-3 h-3 text-slate-400 cursor-pointer" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-2 z-10">
                      <span className="text-xl font-black text-rose-600 font-heading tracking-tight">
                        {selectedMaster.maxDrawdown}%
                      </span>
                    </div>

                    {/* Red downward sparkline curve graphic */}
                    <div className="absolute right-2 bottom-1 w-24 h-12 pointer-events-none opacity-85">
                      <svg viewBox="0 0 100 45" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.22" />
                            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 5,10 L 15,22 L 25,12 L 35,28 L 48,15 L 60,34 L 72,24 L 88,40 L 88,45 L 5,45 Z"
                          fill="url(#ddGrad)"
                        />
                        <path
                          d="M 5,10 L 15,22 L 25,12 L 35,28 L 48,15 L 60,34 L 72,24 L 88,40"
                          fill="none"
                          stroke="#f43f5e"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="88" cy="40" r="3" fill="#f43f5e" />
                      </svg>
                    </div>
                  </div>

                  {/* Profit Factor */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[92px]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <BarChart2 className="w-4 h-4" />
                      </div>
                      <span className="text-slate-500 text-[10px] font-bold tracking-wider uppercase">Profit Factor</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xl font-black text-slate-800 font-heading tracking-tight">
                        {selectedMaster.profitFactor}
                      </span>
                    </div>
                  </div>

                  {/* Closed Trades */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[92px]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-slate-500 text-[10px] font-bold tracking-wider uppercase">Closed Trades</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xl font-black text-blue-600 font-heading tracking-tight">
                        {selectedMaster.totalTrades.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Asset Allocation */}
                {selectedMaster.favoritePairs && (
                  <div className="pt-2">
                    <div className="flex items-center gap-1.5 mb-3.5 text-slate-600 font-bold uppercase tracking-wider text-xs">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>Asset Allocation</span>
                    </div>
                    <div className="space-y-3.5">
                      {selectedMaster.favoritePairs.map(p => {
                        const pairFlags: Record<string, string> = {
                          USDJPY: '🇺🇸',
                          EURUSD: '🇪🇺',
                          GBPUSD: '🇬🇧',
                          AUDUSD: '🇦🇺',
                          USDCAD: '🇨🇦',
                          USDCHF: '🇨🇭',
                          NZDUSD: '🇳🇿',
                          XAUUSD: '🪙',
                          BTCUSD: '₿'
                        };
                        const flag = pairFlags[p.symbol] || '🌐';

                        return (
                          <div key={p.symbol} className="flex items-center gap-3">
                            {/* Flag Circle */}
                            <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xs shrink-0 overflow-hidden shadow-2xs">
                              <span className="leading-none">{flag}</span>
                            </div>

                            {/* Symbol Name */}
                            <span className="font-bold text-slate-800 text-xs w-16 shrink-0 font-heading">
                              {p.symbol}
                            </span>

                            {/* Rounded Pill Bar */}
                            <div className="flex-1 bg-slate-100/90 h-2.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#6b21a8] bg-linear-to-r from-[#7c3aed] to-[#8b5cf6] h-full rounded-full transition-all duration-500"
                                style={{ width: `${p.percentage}%` }}
                              />
                            </div>

                            {/* Percentage */}
                            <span className="font-bold text-slate-700 text-xs w-9 text-right shrink-0">
                              {p.percentage}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer matching Image 2 */}
              <div className="p-4 border-t border-slate-100 bg-white flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedMaster(null)}
                  className="w-1/3 py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold text-xs hover:bg-slate-50 transition cursor-pointer shadow-2xs text-center"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toggleVerify(selectedMaster.id);
                    setSelectedMaster(prev => prev ? { ...prev, verified: !prev.verified } : null);
                  }}
                  className={clsx(
                    "w-2/3 py-3 px-4 rounded-xl font-bold text-xs transition cursor-pointer shadow-md text-center",
                    selectedMaster.verified
                      ? "bg-[#6d28d9] hover:bg-[#5b21b6] text-white"
                      : "bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
                  )}
                >
                  {selectedMaster.verified ? 'Revoke Verification' : 'Verify Master Badge'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
