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
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { clsx } from 'clsx';
import { OpenAccountModal } from '@/components/modals/OpenAccountModal';
import { DepositModal } from '@/components/modals/DepositModal';
import { WithdrawalModal } from '@/components/modals/WithdrawalModal';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { impersonation, stopImpersonation, clientModal, openClientModal, closeClientModal } = useCRM();
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

  const navSections = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', href: '/client/dashboard', icon: LayoutDashboard },
        { label: 'Open New Account', href: '/client/open-account', icon: PlusCircle },
        { label: 'Trading Accounts', href: '/client/account-list', icon: Briefcase },
        { label: 'Trading Contest', href: '/client/trading-contest', icon: Trophy },
      ],
    },
    {
      title: 'Funds & Transfers',
      items: [
        { label: 'Deposit', href: '/client/deposit', icon: ArrowDownToLine },
        { label: 'Withdrawal', href: '/client/withdrawal', icon: ArrowUpFromLine },
        { label: 'Transfer', href: '/client/transfer', icon: ArrowLeftRight },
        { label: 'Transaction History', href: '/client/transfer-history', icon: FileText },
      ],
    },
    {
      title: 'Growth & Network',
      items: [
        { label: 'Partners Zone', href: '/client/partners', icon: Users },
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

  // Reusable Sidebar Content - Exactly copied from AdminSidebar styling
  const sidebarContent = (
    <div className="flex flex-col h-full justify-between select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            {(!isSidebarCollapsed || isMobileMenuOpen) && (
              <div className="flex flex-col">
                <span className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-1.5 font-heading">
                  Test <span className="text-blue-600 font-extrabold">Brand</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 font-sans">
                  Client Trading Desk
                </span>
              </div>
            )}
          </div>

          {/* Toggle or Mobile Close */}
          {isMobileMenuOpen ? (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <span className="text-xl leading-none">&times;</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden lg:flex w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {(!isSidebarCollapsed || isMobileMenuOpen) && (
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const isActive = 
                  pathname === item.href || 
                  (item.href === '/client/dashboard' && pathname === '/client') ||
                  (item.href === '/client/account-list' && pathname === '/client/accounts') ||
                  (item.href === '/client/trading-contest' && pathname === '/client/stats') ||
                  (item.href === '/client/transfer-history' && pathname === '/client/history');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-all group relative',
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    )}
                    title={isSidebarCollapsed && !isMobileMenuOpen ? item.label : undefined}
                  >
                    <span
                      className={clsx(
                        'transition-colors shrink-0',
                        isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </span>

                    {(!isSidebarCollapsed || isMobileMenuOpen) && (
                      <span className="truncate flex-1 font-sans">{item.label}</span>
                    )}

                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Trader User Footer Card - Exactly matching AdminSidebar */}
      <div className="p-3 border-t border-slate-200/90 bg-slate-50/70">
        <div className="flex items-center justify-between gap-2 p-2 rounded-2xl hover:bg-white transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 ring-2 ring-blue-400/30">
              {traderInitials}
            </div>
            {(!isSidebarCollapsed || isMobileMenuOpen) && (
              <div className="flex-1 min-w-0 font-sans">
                <p className="text-xs font-bold text-slate-900 truncate">{currentTrader.name}</p>
                <p className="text-[11px] text-slate-500 truncate font-mono">{currentTrader.email}</p>
              </div>
            )}
          </div>
          {(!isSidebarCollapsed || isMobileMenuOpen) && (
            <button
              type="button"
              onClick={handleLogout}
              title={impersonation.isActive ? 'Exit Impersonation' : 'Sign Out'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      <div className="relative z-10 flex min-h-screen w-full">
        {/* DESKTOP PERSISTENT SIDEBAR - Exactly matching AdminSidebar */}
        <aside
          className={clsx(
            'hidden lg:flex h-screen sticky top-0 bg-white border-r border-slate-200/90 flex-col justify-between select-none z-30 transition-all duration-300 shadow-xs',
            isSidebarCollapsed ? 'w-20' : 'w-64'
          )}
        >
          {sidebarContent}
        </aside>

        {/* MOBILE SLIDE-OVER DRAWER - Exactly matching AdminSidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Drawer content */}
            <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl z-10 flex flex-col">
              {sidebarContent}
            </aside>
          </div>
        )}

        {/* MAIN DESK WRAPPER */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* TOP HEADER BAR - Matching AdminHeader Styling */}
          <header className="h-16 border-b border-slate-200/90 bg-white/95 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
            {/* Left: Mobile Toggle + Search Box */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-full text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer border border-slate-200/80"
                title="Open Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="relative w-full max-w-md hidden sm:block">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search accounts, transactions, or balance..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            {/* Right: Action Buttons + User Pill */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Gold "Open Account" button */}
              <button
                type="button"
                onClick={() => openClientModal('open-account')}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              >
                Open Account
              </button>

              {/* Green "Deposit" button */}
              <button
                type="button"
                onClick={() => openClientModal('deposit')}
                className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
              >
                <span className="font-extrabold">+</span>
                <span>Deposit</span>
              </button>

              {/* Royal Blue "Withdraw" button */}
              <button
                type="button"
                onClick={() => openClientModal('withdrawal')}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <ArrowUpFromLine className="w-3.5 h-3.5 text-blue-600" />
                <span>Withdraw</span>
              </button>

              {/* User Profile Chip */}
              <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ring-2 ring-blue-300/40">
                  {traderInitials}
                </div>
                <div className="hidden xl:flex flex-col text-left leading-tight">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                    {currentTrader.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">
                    {currentTrader.email}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </div>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>

      {/* Global Client Modals (Open Account, Deposit, Withdraw) */}
      <OpenAccountModal
        isOpen={clientModal === 'open-account'}
        onClose={closeClientModal}
      />
      <DepositModal
        isOpen={clientModal === 'deposit'}
        onClose={closeClientModal}
      />
      <WithdrawalModal
        isOpen={clientModal === 'withdrawal'}
        onClose={closeClientModal}
      />
    </div>
  );
}
