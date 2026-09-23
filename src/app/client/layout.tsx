'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCRM } from '@/context/CRMContext';
import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  BarChart3,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  FileText,
  Users,
  Monitor,
  Gift,
  LogOut,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { clsx } from 'clsx';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { impersonation, stopImpersonation } = useCRM();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active trader information (from impersonation or fallback mock demo)
  const currentTrader = impersonation.client || {
    name: 'test nikita',
    email: '68l0pklxpu@8btiwd.com',
    initials: 'TN',
  };

  const traderInitials = impersonation.client
    ? impersonation.client.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'TN';

  const navGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { label: 'Dashboard', href: '/client/dashboard', icon: LayoutDashboard },
        { label: 'Open New Account', href: '/client/open-account', icon: PlusCircle },
        { label: 'My Trading Accounts', href: '/client/accounts', icon: Briefcase },
        { label: 'Trading Stats', href: '/client/stats', icon: BarChart3 },
      ],
    },
    {
      group: 'FUNDS',
      items: [
        { label: 'Deposit', href: '/client/deposit', icon: ArrowDownToLine },
        { label: 'Withdrawal', href: '/client/withdrawal', icon: ArrowUpFromLine },
        { label: 'Transfer', href: '/client/transfer', icon: ArrowLeftRight },
        { label: 'Transaction History', href: '/client/history', icon: FileText },
      ],
    },
    {
      group: 'GROWTH',
      items: [
        { label: 'Partners Zone', href: '/client/partners', icon: Users, hasSubmenu: true },
        { label: 'Trading Platforms', href: '/client/platforms', icon: Monitor },
        { label: 'Refer a Friend', href: '/client/referrals', icon: Gift },
      ],
    },
  ];

  const handleLogout = () => {
    if (impersonation.isActive) {
      stopImpersonation();
      router.push('/admin/client-page');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col font-sans antialiased selection:bg-purple-600 selection:text-white">
      {/* Background Subtle Cyber Grid */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.035] z-0" 
        style={{
          backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />

      <div className="relative z-10 flex min-h-screen w-full">
        {/* DESKTOP SIDEBAR */}
        <aside
          className={clsx(
            'hidden lg:flex flex-col border-r border-[#192233] bg-[#0A0E1A]/90 backdrop-blur-md transition-all duration-300 shrink-0 sticky top-0 h-screen select-none',
            isSidebarCollapsed ? 'w-20' : 'w-64'
          )}
        >
          {/* Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#192233]">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1C2638] to-[#121926] border border-[#2B3A55] flex items-center justify-center font-serif font-black text-slate-100 shadow-inner shrink-0">
                TB
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-serif font-bold text-base text-slate-100 tracking-tight leading-tight truncate">
                    Test Brand
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-slate-400 font-semibold leading-none mt-0.5">
                    CLIENT DESK
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="w-7 h-7 rounded-lg border border-[#24314A] bg-[#121824] hover:bg-[#1A2334] text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
            {navGroups.map((group) => (
              <div key={group.group} className="space-y-1">
                {!isSidebarCollapsed && (
                  <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block mb-2">
                    {group.group}
                  </span>
                )}
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href === '/client/dashboard' && pathname === '/client');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer',
                        isActive
                          ? 'bg-[#1C2438] text-white font-bold border border-[#2D3B59] shadow-inner shadow-black/40'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-[#121826]'
                      )}
                      title={isSidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className={clsx('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-300')} />
                      {!isSidebarCollapsed && (
                        <div className="flex items-center justify-between flex-1 min-w-0">
                          <span className="truncate">{item.label}</span>
                          {item.hasSubmenu && <ChevronDown className="w-3.5 h-3.5 text-slate-500 opacity-60" />}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Bottom Logout */}
          <div className="p-3 border-t border-[#192233]">
            <button
              type="button"
              onClick={handleLogout}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400/90 hover:text-rose-300 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 transition-all cursor-pointer',
                isSidebarCollapsed && 'justify-center'
              )}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>{impersonation.isActive ? 'Exit to Admin' : 'Logout'}</span>}
            </button>
          </div>
        </aside>

        {/* MOBILE SIDEBAR OVERLAY */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="relative w-72 bg-[#0A0E1A] border-r border-[#192233] flex flex-col h-full z-10 animate-in slide-in-from-left duration-200">
              <div className="h-16 px-4 flex items-center justify-between border-b border-[#192233]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1C2638] border border-[#2B3A55] flex items-center justify-center font-serif font-black text-slate-100">
                    TB
                  </div>
                  <div>
                    <span className="font-serif font-bold text-base text-slate-100 block">Test Brand</span>
                    <span className="text-[9px] font-mono tracking-widest text-slate-400">CLIENT DESK</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
                {navGroups.map((group) => (
                  <div key={group.group} className="space-y-1">
                    <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block mb-2">
                      {group.group}
                    </span>
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={clsx(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all',
                            isActive
                              ? 'bg-[#1C2438] text-white font-bold border border-[#2D3B59]'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-[#121826]'
                          )}
                        >
                          <Icon className="w-4 h-4 text-purple-400 shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-[#192233]">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-950/20 border border-rose-900/40"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{impersonation.isActive ? 'Exit to Admin' : 'Logout'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN DESK WRAPPER */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* TOP HEADER BAR */}
          <header className="h-16 px-4 lg:px-8 border-b border-[#192233] bg-[#0A0E1A]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4">
            {/* Left: Mobile Toggle + Search Box */}
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-[#24314A] bg-[#121824] text-slate-300"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="relative w-full max-w-md hidden sm:block">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="search accounts, transactions, or references"
                  className="w-full pl-9 pr-4 py-2 bg-[#101624] border border-[#1E293F] rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/80 transition-colors"
                />
              </div>
            </div>

            {/* Right: Action Buttons + User Pill */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Gold "Open Account" button */}
              <button
                type="button"
                onClick={() => router.push('/client/open-account')}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#D9A05B] to-[#C28C42] hover:from-[#E3AA65] hover:to-[#CF974C] text-[#130E07] text-xs font-bold shadow-md shadow-amber-900/20 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              >
                Open Account
              </button>

              {/* Green "Deposit" button */}
              <button
                type="button"
                onClick={() => router.push('/client/deposit')}
                className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#09261C] hover:bg-[#0D3528] border border-emerald-500/40 text-emerald-400 text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
              >
                <span className="text-emerald-400 font-extrabold">+</span>
                <span>Deposit</span>
              </button>

              {/* Dark "withdraw" button */}
              <button
                type="button"
                onClick={() => router.push('/client/withdrawal')}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#121824] hover:bg-[#1A2233] border border-[#26354F] text-amber-200/90 text-xs font-semibold transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <ArrowUpFromLine className="w-3.5 h-3.5 text-amber-300" />
                <span>withdraw</span>
              </button>

              {/* User Profile Chip */}
              <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-[#192233]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-800 to-indigo-600 border border-purple-400/40 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {traderInitials}
                </div>
                <div className="hidden xl:flex flex-col text-left leading-tight">
                  <span className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                    {currentTrader.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                    {currentTrader.email}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
              </div>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
