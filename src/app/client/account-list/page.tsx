'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  Sparkles, 
  Funnel, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Landmark, 
  Activity, 
  TrendingUp, 
  Layers, 
  Server, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Ellipsis, 
  Copy, 
  Check, 
  ShieldCheck, 
  Lock, 
  Settings, 
  FileText, 
  ArrowLeftRight 
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { ClientPageHeader } from '@/components/layout/ClientPageHeader';
import { clsx } from 'clsx';

export default function ClientAccountListPage() {
  const { impersonation, openClientModal, showToast } = useCRM();
  const client = impersonation.client;

  const [filter, setFilter] = useState<'All' | 'MT5' | 'Live' | 'Demo'>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [copiedLogin, setCopiedLogin] = useState<string | null>(null);
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>('acc_02_1');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Accounts list (from context or standard client accounts)
  const defaultAccounts = [
    {
      id: 'acc_02_1',
      login: 98989898989,
      name: client?.name || 'test nikita',
      platform: 'MT5',
      type: 'BASIC',
      status: 'Active',
      currency: 'USD',
      balance: 5937.47,
      equity: 5937.47,
      pnl: 0.00,
      leverage: '100',
      server: 'Ocean Markets Ltd.',
      freeMargin: 5937.47,
      marginLevel: '0.00%',
      isLive: true,
    },
    {
      id: 'acc_02_2',
      login: 260730279,
      name: client?.name || 'test nikita',
      platform: 'MT5',
      type: 'PRO ECN',
      status: 'Active',
      currency: 'USD',
      balance: 411.20,
      equity: 411.20,
      pnl: 14.50,
      leverage: '200',
      server: 'Ocean Markets Ltd.',
      freeMargin: 411.20,
      marginLevel: '0.00%',
      isLive: true,
    },
  ];

  const accounts = client?.accounts && client.accounts.length > 0
    ? client.accounts.map((a, idx) => ({
        id: a.id || `acc_${idx}`,
        login: a.login,
        name: client.name,
        platform: a.platform || 'MT5',
        type: a.type || 'BASIC',
        status: 'Active',
        currency: a.currency || 'USD',
        balance: a.balance,
        equity: a.equity,
        pnl: 0.00,
        leverage: a.leverage ? a.leverage.replace('1:', '') : '100',
        server: a.server || 'Ocean Markets Ltd.',
        freeMargin: a.balance,
        marginLevel: '0.00%',
        isLive: true,
      }))
    : defaultAccounts;

  const filteredAccounts = accounts.filter((acc) => {
    if (filter === 'All') return true;
    if (filter === 'MT5') return acc.platform === 'MT5';
    if (filter === 'Live') return acc.isLive;
    if (filter === 'Demo') return !acc.isLive;
    return true;
  });

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalEquity = accounts.reduce((sum, acc) => sum + acc.equity, 0);
  const totalPnl = accounts.reduce((sum, acc) => sum + acc.pnl, 0);

  const handleCopyLogin = (e: React.MouseEvent, login: number) => {
    e.stopPropagation();
    navigator.clipboard.writeText(login.toString());
    setCopiedLogin(login.toString());
    showToast('info', 'Account Copied', `Account #${login} copied to clipboard.`);
    setTimeout(() => setCopiedLogin(null), 1800);
  };

  const toggleExpand = (id: string) => {
    setExpandedAccountId((prev) => (prev === id ? null : id));
  };

  const toggleDropdown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl mx-auto pb-12">
      {/* 1. ROYAL BLUE PAGE HEADER */}
      <ClientPageHeader
        badge="Portfolio Command"
        badgeIcon={<CreditCard className="h-6 w-6 sm:h-7 sm:w-7 text-amber-200" />}
        title="Trading Account Overview"
        subtitle="Review live balances, switch by account type, and open new setups from the same workspace."
        actionButton={
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white shadow-xs backdrop-blur-xs transition hover:bg-white/15 cursor-pointer"
              >
                <Funnel className="h-3.5 w-3.5 text-amber-300" />
                <span>
                  <span className="hidden sm:inline text-blue-200">Filter:</span> {filter}
                </span>
                <ChevronDown className={clsx("h-3.5 w-3.5 text-blue-200 transition-transform", isFilterOpen && "rotate-180")} />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-36 rounded-2xl bg-white border border-slate-200 shadow-xl py-1 z-50 text-slate-800 text-xs font-bold">
                  {(['All', 'MT5', 'Live', 'Demo'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setFilter(opt);
                        setIsFilterOpen(false);
                      }}
                      className={clsx(
                        "w-full text-left px-4 py-2 transition-colors hover:bg-slate-50 cursor-pointer",
                        filter === opt ? "text-blue-700 bg-blue-50/70" : "text-slate-700"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Open Account CTA */}
            <button
              type="button"
              onClick={() => openClientModal('open-account')}
              className="inline-flex items-center gap-2 rounded-full bg-white text-blue-900 hover:bg-blue-50 px-4 py-2.5 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Plus className="h-4 w-4 text-blue-600" />
              <span>Open Account</span>
            </button>
          </div>
        }
      />

      {/* 2. 3 TOP KPI METRIC CARDS (Admin Panel Card Styling) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Balance */}
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400">
                Total Balance
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[11px] text-slate-400 font-sans mt-0.5 block">Aggregated USD liquidity</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600 shadow-2xs">
              <Landmark className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Total Equity */}
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400">
                Total Equity
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-700 font-mono">
                ${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[11px] text-slate-400 font-sans mt-0.5 block">Mark-to-market valuation</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs">
              <Activity className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Total P&L */}
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400">
                Total P&amp;L
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 font-mono">
                {totalPnl >= 0 ? `+$${totalPnl.toFixed(2)}` : `-$${Math.abs(totalPnl).toFixed(2)}`}
              </p>
              <span className="text-[11px] text-slate-400 font-sans mt-0.5 block">Floating unclosed positions</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-2xs">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. TRADING ACCOUNTS ROSTER */}
      <div className="space-y-4 sm:space-y-5">
        {filteredAccounts.map((acc) => {
          const isExpanded = expandedAccountId === acc.id;
          const isDropdownOpen = openDropdownId === acc.id;
          const initial = acc.name.charAt(0).toUpperCase() || 'B';

          return (
            <div
              key={acc.id}
              className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md transition-all duration-200"
            >
              {/* Account Card Row */}
              <div
                onClick={() => toggleExpand(acc.id)}
                className="cursor-pointer p-5 sm:p-6 transition-colors hover:bg-slate-50/50"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  {/* Left: Avatar & Meta Information */}
                  <div className="flex flex-1 items-center gap-3.5 sm:gap-5 min-w-0">
                    <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-base sm:text-lg font-extrabold text-white shadow-xs">
                      {initial}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2 sm:gap-3">
                        <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-heading">
                          {acc.name}
                        </h3>
                        <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {acc.status}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(acc.id);
                          }}
                          className="ml-auto text-slate-400 hover:text-slate-600 lg:hidden p-1"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Chips */}
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-xs">
                        <button
                          type="button"
                          onClick={(e) => handleCopyLogin(e, acc.login)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono font-bold text-slate-800 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Click to copy account ID"
                        >
                          <span>{acc.login}</span>
                          {copiedLogin === acc.login.toString() ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3 text-slate-400" />
                          )}
                        </button>

                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-50 border border-cyan-200 px-2.5 py-1 font-bold text-cyan-800 text-[11px]">
                          <Layers className="h-3.5 w-3.5 text-cyan-600" />
                          {acc.type}
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700 font-semibold text-[11px]">
                          <Server className="h-3.5 w-3.5 text-amber-500" />
                          {acc.platform}
                        </span>

                        <span className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600 font-mono text-[11px]">
                          Leverage {acc.leverage}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: 3 Metric Columns */}
                  <div className="grid w-full grid-cols-3 gap-2.5 sm:gap-3 lg:w-auto lg:min-w-[340px]">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-3 py-2.5 text-center">
                      <p className="mb-0.5 text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-slate-400">
                        Balance
                      </p>
                      <p className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
                        ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-3 py-2.5 text-center">
                      <p className="mb-0.5 text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-slate-400">
                        Equity
                      </p>
                      <p className="text-sm sm:text-base font-extrabold text-blue-700 font-mono">
                        ${acc.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-3 py-2.5 text-center">
                      <p className="mb-0.5 text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-slate-400">
                        P&amp;L
                      </p>
                      <p className="text-sm sm:text-base font-extrabold text-emerald-600 font-mono">
                        {acc.pnl >= 0 ? `+$${acc.pnl.toFixed(2)}` : `-$${Math.abs(acc.pnl).toFixed(2)}`}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="action-buttons flex w-full items-center justify-end gap-2 lg:w-auto sm:gap-2.5">
                    {/* Deposit Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openClientModal('deposit');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-3.5 py-2.5 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <ArrowDownLeft className="h-4 w-4" />
                      <span className="hidden xl:inline">Deposit</span>
                    </button>

                    {/* Withdraw Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openClientModal('withdrawal');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-3.5 py-2.5 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="hidden xl:inline">Withdraw</span>
                    </button>

                    {/* Options / Ellipsis Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => toggleDropdown(e, acc.id)}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Account settings"
                      >
                        <Ellipsis className="h-4 w-4" />
                      </button>

                      {isDropdownOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 text-xs font-semibold text-slate-700"
                        >
                          <Link
                            href="/client/transfer"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 hover:text-blue-700"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
                            <span>Internal Transfer</span>
                          </Link>
                          <Link
                            href="/client/history"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 hover:text-blue-700"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span>Account Ledger</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenDropdownId(null);
                              showToast('info', 'Password Reset', 'Password update instructions dispatched to your email.');
                            }}
                            className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-slate-50 hover:text-blue-700 cursor-pointer"
                          >
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Change MT5 Password</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenDropdownId(null);
                              showToast('info', 'Leverage Setting', 'Leverage modification request sent to risk management.');
                            }}
                            className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-slate-50 hover:text-blue-700 cursor-pointer"
                          >
                            <Settings className="w-3.5 h-3.5 text-slate-400" />
                            <span>Adjust Leverage</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expandable Accordion Drawer */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/60 p-5 sm:p-6 transition-all">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Server Host</span>
                      <p className="font-extrabold text-slate-900">{acc.server}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Currency</span>
                      <p className="font-extrabold text-blue-700">{acc.currency}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Free Margin</span>
                      <p className="font-extrabold text-emerald-600">${acc.freeMargin.toFixed(2)}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Margin Level</span>
                      <p className="font-extrabold text-slate-700">{acc.marginLevel}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="text-slate-500 font-sans text-[11px] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Live connection status: 18ms latency to London LD4
                    </span>
                    <div className="flex items-center gap-3">
                      <Link
                        href="/client/transfer"
                        className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
                      >
                        Transfer Funds &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
