'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  ArrowLeftRight,
  RotateCw,
  X,
  KeyRound,
  Gauge
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { ClientPageHeader } from '@/components/layout/ClientPageHeader';
import { clsx } from 'clsx';

function ClientAccountListContent() {
  const searchParams = useSearchParams();
  const targetClientId = searchParams?.get('clientId');
  const { clients, impersonation, clientUser, openClientModal, showToast, syncAccountBalance } = useCRM();
  const clientFromParam = targetClientId ? clients.find(c => c.id === targetClientId) : null;
  const rawClient = clientFromParam || impersonation.client || clientUser || clients[0];
  const client = (rawClient ? clients.find(c => (rawClient.email && c.email.toLowerCase() === rawClient.email.toLowerCase()) || (rawClient.id && c.id === rawClient.id)) : null) || rawClient;

  const [filter, setFilter] = useState<'All' | 'MT5' | 'Live' | 'Demo'>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [copiedLogin, setCopiedLogin] = useState<string | null>(null);
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>('acc_02_1');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Live MT5 Account Actions Modal States
  const [passwordModalAccount, setPasswordModalAccount] = useState<number | null>(null);
  const [passwordType, setPasswordType] = useState<'main' | 'investor'>('main');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [leverageModalAccount, setLeverageModalAccount] = useState<number | null>(null);
  const [newLeverage, setNewLeverage] = useState('1:100');
  const [isUpdatingLeverage, setIsUpdatingLeverage] = useState(false);

  const [syncingLogin, setSyncingLogin] = useState<number | null>(null);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);

  // Auto-sync accounts with live MT5 on mount and periodically every 15s
  useEffect(() => {
    if (!client?.accounts || client.accounts.length === 0) return;

    let isMounted = true;
    const autoSyncAll = async () => {
      // Scale Optimization: Do NOT query MT5 server if user minimized the window or switched tabs
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return;
      }
      if (isAutoSyncing) return;
      setIsAutoSyncing(true);
      try {
        await Promise.all(
          client.accounts.map((acc: any) => syncAccountBalance(Number(acc.login)).catch(() => null))
        );
      } finally {
        if (isMounted) setIsAutoSyncing(false);
      }
    };

    // Run immediately on page load
    autoSyncAll();

    // Periodic sync every 15 seconds
    const interval = setInterval(autoSyncAll, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [client?.id]);

  // Accounts list (from context or standard client accounts)
  const defaultAccounts: any[] = [];

  const accounts = client?.accounts && client.accounts.length > 0
    ? client.accounts.map((a: any, idx: number) => {
        const bal = typeof a.balance === 'number' ? a.balance : parseFloat(a.balance || '0');
        const rawEq = typeof a.equity === 'number' ? a.equity : parseFloat(a.equity || '0');
        // If equity is 0 or unpopulated but balance exists, fallback equity to balance
        const eq = rawEq > 0 ? rawEq : bal;
        const pnl = eq - bal;

        return {
          id: a.id || `acc_${idx}`,
          login: Number(a.login),
          name: client.name || 'Trader',
          platform: a.platform || 'MT5',
          type: a.accountType || a.type || 'STANDARD',
          status: a.status || 'Active',
          currency: a.currency || 'USD',
          balance: bal,
          equity: eq,
          pnl: pnl,
          leverage: a.leverage ? a.leverage.replace('1:', '') : '100',
          server: a.server || 'TheKFMarket-Live',
          freeMargin: typeof a.freeMargin === 'number' && a.freeMargin > 0 ? a.freeMargin : (parseFloat(a.freeMargin || '0') > 0 ? parseFloat(a.freeMargin) : bal),
          marginLevel: '0.00%',
          isLive: a.isLive !== undefined ? Boolean(a.isLive) : !(String(a.server || '').toLowerCase().includes('demo') || String(a.mt5Group || a.mt5_group || '').toLowerCase().includes('demo')),
        };
      })
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

  const handleSyncAccount = async (e: React.MouseEvent, login: number) => {
    e.stopPropagation();
    setSyncingLogin(login);
    try {
      const res = await syncAccountBalance(login);
      if (res) {
        showToast('success', 'Balance Synchronized', `Account #${login} ledger updated from MT5 server.`);
      } else {
        showToast('info', 'MT5 Live Status', `Account #${login} ledger is currently up to date.`);
      }
    } finally {
      setSyncingLogin(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalAccount || !newPassword || newPassword.length < 8) {
      showToast('error', 'Invalid Password', 'Password must be at least 8 characters long.');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const res = await fetch('/api/mt5/accounts/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: passwordModalAccount,
          password: newPassword,
          type: passwordType,
          clientId: client?.id,
          email: client?.email,
          clientName: client?.name,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update MT5 password.');
      }
      showToast('success', 'Password Updated on MT5', `Successfully changed MT5 ${passwordType === 'main' ? 'Trading' : 'Investor'} password for #${passwordModalAccount}.`);
      setPasswordModalAccount(null);
      setNewPassword('');
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Could not change password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleUpdateLeverage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leverageModalAccount) return;
    setIsUpdatingLeverage(true);
    try {
      const res = await fetch('/api/mt5/accounts/leverage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: leverageModalAccount,
          leverage: newLeverage,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update leverage on MT5.');
      }
      showToast('success', 'Leverage Updated on MT5', `Account #${leverageModalAccount} leverage updated to ${newLeverage}.`);
      setLeverageModalAccount(null);
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Could not update leverage.');
    } finally {
      setIsUpdatingLeverage(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedAccountId((prev) => (prev === id ? null : id));
  };

  const toggleDropdown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenDropdownId(null);
      setIsFilterOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

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
            {/* Auto-Sync All Accounts Live with MT5 */}
            <button
              type="button"
              onClick={async () => {
                if (isAutoSyncing || !client?.accounts) return;
                setIsAutoSyncing(true);
                try {
                  await Promise.all(
                    client.accounts.map((acc: any) => syncAccountBalance(Number(acc.login)).catch(() => null))
                  );
                  showToast('success', 'Accounts Synchronized', 'All MT5 account ledgers and mark-to-market valuations refreshed.');
                } finally {
                  setIsAutoSyncing(false);
                }
              }}
              disabled={isAutoSyncing}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/15 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xs backdrop-blur-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
              title="Synchronize all accounts with live MT5 Server"
            >
              <RotateCw className={clsx("h-3.5 w-3.5 text-emerald-300", isAutoSyncing && "animate-spin text-white")} />
              <span>{isAutoSyncing ? 'Syncing...' : 'Sync Live MT5'}</span>
            </button>

            {/* Filter Dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFilterOpen(prev => !prev);
                }}
                className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white shadow-xs backdrop-blur-xs transition hover:bg-white/15 cursor-pointer active:scale-95"
              >
                <Funnel className="h-3.5 w-3.5 text-amber-300" />
                <span>
                  <span className="hidden sm:inline text-blue-200">Filter:</span> {filter}
                </span>
                <ChevronDown className={clsx("h-3.5 w-3.5 text-blue-200 transition-transform duration-200", isFilterOpen && "rotate-180")} />
              </button>

              {isFilterOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-2 w-36 rounded-2xl bg-white border border-slate-200 shadow-xl py-1 z-50 text-slate-800 text-xs font-bold animate-in fade-in zoom-in-95"
                >
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
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                Total Balance
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-heading">
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
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                Total Equity
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-700 font-heading">
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
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                Total P&amp;L
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 font-heading">
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
        {filteredAccounts.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 bg-white space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                No Trading Accounts Found
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                You haven&apos;t opened an MT5 trading account yet. Click below to create your live MetaTrader 5 account instantly.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openClientModal('open-account')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Open Trading Account</span>
            </button>
          </div>
        ) : (
          filteredAccounts.map((acc) => {
          const isExpanded = expandedAccountId === acc.id;
          const isDropdownOpen = openDropdownId === acc.id;
          const initial = acc.name.charAt(0).toUpperCase() || 'B';

          return (
            <div
              key={acc.id}
              className={clsx(
                "rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-200",
                isDropdownOpen ? "relative z-30" : "relative z-0"
              )}
            >
              {/* Account Card Row */}
              <div
                onClick={() => toggleExpand(acc.id)}
                className={clsx(
                  "cursor-pointer p-4 sm:p-5 transition-colors hover:bg-slate-50/40 rounded-2xl sm:rounded-3xl",
                  isExpanded && "rounded-b-none"
                )}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  {/* Left: Avatar & Meta Information */}
                  <div className="flex flex-1 items-center gap-3.5 sm:gap-4 min-w-0">
                    <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-sm sm:text-base font-extrabold text-white shadow-xs">
                      {initial}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 font-heading">
                          {acc.name}
                        </h3>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
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
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                        <button
                          type="button"
                          onClick={(e) => handleCopyLogin(e, acc.login)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Click to copy account ID"
                        >
                          <span>{acc.login}</span>
                          {copiedLogin === acc.login.toString() ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3 text-slate-400" />
                          )}
                        </button>

                        <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200/80 px-2 py-0.5 font-bold text-blue-700 text-[10px] uppercase font-mono">
                          <Layers className="h-3 w-3 text-blue-600" />
                          {acc.type}
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-slate-600 font-semibold text-[10px] font-mono">
                          <Server className="h-3 w-3 text-amber-500" />
                          {acc.platform}
                        </span>

                        <span className="rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-slate-500 font-mono text-[10px]">
                          1:{acc.leverage.replace('1:', '')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: 3 Metric Columns */}
                  <div className="grid w-full grid-cols-3 gap-2 sm:gap-3 lg:w-auto lg:min-w-[320px]">
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-center">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 leading-tight">
                        Balance
                      </p>
                      <p className="mt-0.5 text-sm sm:text-base font-extrabold text-slate-900 font-mono">
                        ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-center">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 leading-tight">
                        Equity
                      </p>
                      <p className="mt-0.5 text-sm sm:text-base font-extrabold text-blue-700 font-mono">
                        ${acc.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-center">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 leading-tight">
                        P&amp;L
                      </p>
                      <p className="mt-0.5 text-sm sm:text-base font-extrabold text-emerald-600 font-mono">
                        {acc.pnl >= 0 ? `+$${acc.pnl.toFixed(2)}` : `-$${Math.abs(acc.pnl).toFixed(2)}`}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="action-buttons flex w-full items-center justify-end gap-1.5 lg:w-auto sm:gap-2">
                    {/* Deposit Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openClientModal('deposit');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      <ArrowDownLeft className="h-3.5 w-3.5" />
                      <span>Deposit</span>
                    </button>

                    {/* Withdraw Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openClientModal('withdrawal');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
                      <span>Withdraw</span>
                    </button>

                    {/* Quick Sync Button */}
                    <button
                      type="button"
                      onClick={(e) => handleSyncAccount(e, acc.login)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-2 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                      title="Sync live MT5 balance"
                    >
                      <RotateCw className={clsx("h-3.5 w-3.5 text-slate-500", syncingLogin === acc.login && "animate-spin text-blue-600")} />
                      <span className="hidden xl:inline">Sync</span>
                    </button>

                    {/* Options / Ellipsis Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => toggleDropdown(e, acc.id)}
                        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer shadow-2xs"
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
                            onClick={(e) => {
                              setOpenDropdownId(null);
                              handleSyncAccount(e, acc.login);
                            }}
                            className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-slate-50 hover:text-blue-700 cursor-pointer"
                          >
                            <RotateCw className={clsx("w-3.5 h-3.5 text-slate-400", syncingLogin === acc.login && "animate-spin text-blue-600")} />
                            <span>Sync Live Balance</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              setOpenDropdownId(null);
                              setPasswordModalAccount(acc.login);
                              setNewPassword('');
                            }}
                            className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-slate-50 hover:text-blue-700 cursor-pointer"
                          >
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Change MT5 Password</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              setOpenDropdownId(null);
                              setLeverageModalAccount(acc.login);
                              setNewLeverage(acc.leverage.startsWith('1:') ? acc.leverage : `1:${acc.leverage}`);
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
                <div className="border-t border-slate-100 bg-slate-50/60 p-5 sm:p-6 transition-all rounded-b-2xl sm:rounded-b-3xl">
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
        }))}
      </div>

      {/* Password Modal */}
      {passwordModalAccount !== null && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-heading">
                    Change MT5 Password
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">Account #{passwordModalAccount}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalAccount(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-1.5 font-heading">
                  Password Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPasswordType('main')}
                    className={clsx(
                      "py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                      passwordType === 'main'
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    Trading Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setPasswordType('investor')}
                    className={clsx(
                      "py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                      passwordType === 'investor'
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    Investor (Read-only)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-1.5 font-heading">
                  New MT5 Password
                </label>
                <input
                  type="text"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 alphanumeric characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalAccount(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  {isUpdatingPassword ? 'Updating...' : 'Update on MT5'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leverage Modal */}
      {leverageModalAccount !== null && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-heading">
                    Adjust Leverage
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">Account #{leverageModalAccount}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLeverageModalAccount(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateLeverage} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-1.5 font-heading">
                  Select Maximum Leverage
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['1:50', '1:100', '1:200', '1:300', '1:500'].map((lev) => (
                    <button
                      key={lev}
                      type="button"
                      onClick={() => setNewLeverage(lev)}
                      className={clsx(
                        "py-2.5 px-3 rounded-xl text-xs font-bold font-mono border transition-all cursor-pointer",
                        newLeverage === lev
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      {lev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLeverageModalAccount(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingLeverage}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  {isUpdatingLeverage ? 'Updating...' : 'Apply on MT5'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientAccountListPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    }>
      <ClientAccountListContent />
    </React.Suspense>
  );
}
