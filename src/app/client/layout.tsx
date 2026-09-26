'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  User,
  ShieldCheck,
} from 'lucide-react';
import { clsx } from 'clsx';
import { OpenAccountModal } from '@/components/modals/OpenAccountModal';
import { DepositModal } from '@/components/modals/DepositModal';
import { WithdrawalModal } from '@/components/modals/WithdrawalModal';
import { KYCVerificationModal } from '@/components/modals/KYCVerificationModal';

function ClientLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetClientId = searchParams?.get('clientId');

  const { clients, kycRecords, impersonation, startImpersonation, stopImpersonation, clientModal, openClientModal, closeClientModal, showToast, clientUser, authLoading, logout } = useCRM();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Sync if opened with explicit ?clientId=
  React.useEffect(() => {
    if (targetClientId && clients.length > 0) {
      const found = clients.find(c => c.id === targetClientId);
      if (found && impersonation.client?.id !== found.id) {
        startImpersonation(found);
      }
    }
  }, [targetClientId, clients]);

  // Active trader information (from impersonation, matching targetClientId, logged in clientUser, first client, or generic portal default)
  const clientFromParam = targetClientId ? clients.find(c => c.id === targetClientId) : null;
  const rawClient = clientFromParam || impersonation.client || clientUser || (clients.length > 0 ? clients[0] : null);
  // Match with latest clients state to get live kyc_verified attribute
  const activeClient = (rawClient ? clients.find(c => (rawClient.email && c.email?.toLowerCase() === rawClient.email?.toLowerCase()) || (rawClient.id && c.id === rawClient.id)) : null) || rawClient;

  const currentTrader = activeClient || {
    name: 'Trading Client',
    email: 'client@portal.com',
  };

  // Check KYC status dynamically
  const clientKycRecord = kycRecords.find(k => k.clientId === activeClient?.id || k.clientEmail === activeClient?.email);
  const [hasLocalPending, setHasLocalPending] = useState(false);

  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined' && activeClient) {
        // If already verified, clear local pending flag
        if (activeClient.kycVerified || clientKycRecord?.status === 'verified') {
          setHasLocalPending(false);
          const stored = JSON.parse(localStorage.getItem('nd1_crm_submitted_kyc') || '{}');
          if (stored[activeClient.id] || stored[activeClient.email]) {
            delete stored[activeClient.id];
            delete stored[activeClient.email];
            localStorage.setItem('nd1_crm_submitted_kyc', JSON.stringify(stored));
          }
          return;
        }

        const stored = JSON.parse(localStorage.getItem('nd1_crm_submitted_kyc') || '{}');
        if (stored[activeClient.id] || stored[activeClient.email]) {
          setHasLocalPending(true);
        } else {
          setHasLocalPending(false);
        }
      }
    } catch {
      // ignore
    }
  }, [activeClient, clientKycRecord]);

  const isKycVerified = !!activeClient?.kycVerified || clientKycRecord?.status === 'verified';
  const isKycPending = !isKycVerified && (clientKycRecord?.status === 'pending' || hasLocalPending);

  // Strict Regulatory Compliance Gate: Do NOT trigger on initial page load if auth is loading or if already verified
  const hasWarnedRef = React.useRef(false);
  React.useEffect(() => {
    if (authLoading) return;
    if (pathname.startsWith('/client/login')) return;
    if (!activeClient || !activeClient.id) return;

    // If verified or already pending review, NEVER redirect to /client/kyc
    if (isKycVerified || isKycPending) return;

    // Only redirect if unverified and not on the KYC page
    if (pathname !== '/client/kyc') {
      if (!hasWarnedRef.current) {
        hasWarnedRef.current = true;
        showToast('warning', 'Mandatory KYC Required', 'You must submit your identification documents before accessing trading desk features.');
      }
      router.replace('/client/kyc');
    }
  }, [activeClient, isKycVerified, isKycPending, pathname, router, showToast, authLoading]);

  const traderInitials = currentTrader.name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'TC';

  const navSections = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', href: '/client/dashboard', icon: LayoutDashboard },
        // Show KYC Verification in sidebar only if unverified, or if currently on /client/kyc page
        ...(!isKycVerified || pathname === '/client/kyc'
          ? [{ label: 'KYC Verification', href: '/client/kyc', icon: ShieldCheck }]
          : []),
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
        { label: 'Copy Trading', href: '/client/copy-trading', icon: TrendingUp },
        { label: 'Partners Zone', href: '/client/partner/dashboard', icon: Users },
        { label: 'Trading Platforms', href: '/client/platforms', icon: Monitor },
        { label: 'Refer a Friend', href: '/client/refer', icon: Gift },
      ],
    },
  ];

  const handleLogout = () => {
    if (impersonation.isActive) {
      stopImpersonation();
    }
    logout();
    router.push('/client/login');
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
                  (item.href === '/client/transfer-history' && pathname === '/client/history') ||
                  (item.href === '/client/refer' && pathname === '/client/referrals') ||
                  (item.href === '/client/partner/dashboard' && (
                    pathname === '/client/partners' || 
                    pathname === '/client/partner/dashboard' ||
                    pathname === '/client/partner/create' ||
                    pathname === '/client/partner/commission' ||
                    pathname === '/client/partner/withdrawal'
                  ));
                const Icon = item.icon;
                const finalHref = targetClientId && !item.href.includes('?') 
                  ? `${item.href}?clientId=${targetClientId}` 
                  : item.href;

                return (
                  <Link
                    key={item.href}
                    href={finalHref}
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

  // Dedicated isolated rendering for client login route
  if (pathname === '/client/login' || pathname.startsWith('/client/login')) {
    return <>{children}</>;
  }

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
                onClick={() => {
                  if (!isKycVerified) {
                    showToast('warning', 'KYC Verification Required', 'Please submit your KYC documents to unlock new live accounts.');
                    router.push('/client/kyc');
                    return;
                  }
                  openClientModal('open-account');
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              >
                Open Account
              </button>

              {/* Green "Deposit" button */}
              <button
                type="button"
                onClick={() => {
                  if (!isKycVerified) {
                    showToast('warning', 'KYC Verification Required', 'Identity verification is mandatory before depositing funds.');
                    router.push('/client/kyc');
                    return;
                  }
                  openClientModal('deposit');
                }}
                className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
              >
                <span className="font-extrabold">+</span>
                <span>Deposit</span>
              </button>

              {/* Royal Blue "Withdraw" button */}
              <button
                type="button"
                onClick={() => {
                  if (!isKycVerified) {
                    showToast('warning', 'KYC Verification Required', 'Identity verification is mandatory before requesting withdrawals.');
                    router.push('/client/kyc');
                    return;
                  }
                  openClientModal('withdrawal');
                }}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <ArrowUpFromLine className="w-3.5 h-3.5 text-blue-600" />
                <span>Withdraw</span>
              </button>

              {/* User Profile Chip with Interactive Dropdown Menu */}
              <div className="relative pl-2 sm:pl-3 border-l border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer select-none"
                  title="Trader Profile & Settings"
                >
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
                  <ChevronDown className={clsx("w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform duration-200", showProfileMenu && "rotate-180")} />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-60 rounded-3xl bg-white border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="p-3 border-b border-slate-100 bg-slate-50/60 rounded-2xl mb-1">
                      <p className="text-xs font-bold text-slate-900 font-heading truncate">{currentTrader.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{currentTrader.email}</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Verified Trader
                      </div>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <Link
                        href="/client/dashboard"
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer font-medium"
                      >
                        <User className="w-4 h-4 text-blue-600" />
                        Dashboard
                      </Link>

                      <Link
                        href="/client/account-list"
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer font-medium"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Trading Accounts
                      </Link>

                      <Link
                        href="/client/kyc"
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-xl flex items-center justify-between transition-colors cursor-pointer font-medium"
                      >
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>KYC Compliance</span>
                        </div>
                        <span className={clsx(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                          isKycVerified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        )}>
                          {isKycVerified ? 'Verified' : 'Pending'}
                        </span>
                      </Link>

                      <Link
                        href="/client/transfer-history"
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer font-medium"
                      >
                        <FileText className="w-4 h-4 text-slate-500" />
                        Transaction Ledger
                      </Link>

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer font-medium"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        {impersonation.isActive ? 'Exit Workspace' : 'Sign Out'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* KYC Status Compliance Banner (when unverified / under review) */}
          {!isKycVerified && (
            <div className={clsx(
              "px-3 sm:px-4 py-2 flex items-center justify-between gap-3 text-xs font-medium shadow-xs sticky top-16 z-20 w-full select-none animate-in fade-in",
              isKycPending 
                ? "bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white shadow-amber-500/10" 
                : "bg-gradient-to-r from-slate-800 via-indigo-900 to-slate-900 text-amber-200 border-b border-amber-400/20"
            )}>
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className={clsx(
                  "w-2.5 h-2.5 rounded-full shrink-0",
                  isKycPending ? "bg-white animate-ping" : "bg-amber-400 animate-pulse"
                )} />
                <span className="font-extrabold uppercase tracking-wider text-[11px] font-heading shrink-0">
                  {isKycPending ? 'Verification Under Processing:' : 'Mandatory Verification:'}
                </span>
                <span className={clsx("truncate text-xs", isKycPending ? "text-amber-50 font-medium" : "text-slate-200")}>
                  {isKycPending
                    ? 'Your identification documents are currently under compliance review. You can browse the desk while pending.'
                    : 'Federal regulatory compliance requires identity document verification before live trading or deposits.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => openClientModal('kyc')}
                className={clsx(
                  "px-3 py-1 rounded-lg text-[11px] font-bold shadow-xs shrink-0 transition-all cursor-pointer active:scale-95",
                  isKycPending
                    ? "bg-black/25 hover:bg-black/40 text-white border border-white/20"
                    : "bg-amber-500 hover:bg-amber-600 text-white"
                )}
              >
                {isKycPending ? 'Review Submission' : 'Submit KYC'}
              </button>
            </div>
          )}

          {/* PAGE CONTENT */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>

      {/* Global Client Modals (Open Account, Deposit, Withdraw, KYC) */}
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
      <KYCVerificationModal
        isOpen={clientModal === 'kyc'}
        onClose={closeClientModal}
      />
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    }>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </React.Suspense>
  );
}
