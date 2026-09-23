'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Bell, 
  User, 
  LogOut, 
  ChevronDown,
  Menu
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export const AdminHeader: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { kycRecords, deposits, withdrawals, setMobileSidebarOpen } = useCRM();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Generate page title based on route
  const getPageTitle = () => {
    switch (pathname) {
      case '/admin/dashboard':
        return 'Broker Executive Dashboard';
      case '/admin/client-page':
        return 'Client Management & Accounts';
      case '/admin/kyc-verification':
        return 'KYC Document Verification Queue';
      case '/admin/deposits':
        return 'Deposit Requests & Gateway Approval';
      case '/admin/withdrawals':
        return 'Withdrawal Processing & Payouts';
      case '/admin/add-payments':
        return 'Manual Adjustments & Credit Bonuses';
      case '/admin/Admin-transaction-page':
        return 'Unified Financial Ledger & Transactions';
      case '/admin/IB-Configuration':
        return 'Introducing Broker (IB) Rebates & Tiers';
      case '/admin/IB-Withdrawals':
        return 'IB Commission Payout Requests';
      case '/admin/settings':
        return 'System & Broker Configuration';
      default:
        return 'Admin Workspace';
    }
  };

  const pendingItemsCount = 
    kycRecords.filter(k => k.status === 'pending').length +
    deposits.filter(d => d.status === 'pending').length +
    withdrawals.filter(w => w.status === 'pending').length;

  return (
    <header className="h-16 border-b border-slate-200/90 bg-white/95 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Title & Hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden p-2 rounded-full text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer border border-slate-200/80"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 font-heading">
            {getPageTitle()}
          </h1>
          <p className="text-[11px] text-slate-500 font-mono hidden sm:block">
            Route: <span className="text-purple-600 font-semibold">{pathname}</span>
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full text-slate-600 hover:text-purple-700 hover:bg-purple-50 border border-slate-200/80 transition-colors relative cursor-pointer shadow-2xs"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            {pendingItemsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-600 animate-ping" />
            )}
            {pendingItemsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-600" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-3xl bg-white border border-slate-200 shadow-xl p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-800 font-heading">Pending Actions</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
                  {pendingItemsCount} Total
                </span>
              </div>
              <div className="py-2 space-y-2 text-xs font-sans">
                {deposits.filter(d => d.status === 'pending').slice(0, 2).map(d => (
                  <div key={d.id} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Deposit #{d.accountLogin}</span>
                    <span className="text-purple-600 font-bold font-mono">{d.amount} {d.currency}</span>
                  </div>
                ))}
                {kycRecords.filter(k => k.status === 'pending').slice(0, 2).map(k => (
                  <div key={k.id} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-700 font-medium">KYC: {k.clientName}</span>
                    <span className="text-purple-600 font-semibold">{k.documentType}</span>
                  </div>
                ))}
                {pendingItemsCount === 0 && (
                  <p className="text-slate-400 py-3 text-center">All queues cleared!</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200/80 bg-white hover:bg-purple-50/50 transition-colors cursor-pointer shadow-2xs"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-2xs">
              A
            </div>
            <span className="text-xs font-semibold text-slate-800 hidden sm:inline font-sans">Admin</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-3xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="p-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 font-heading">Admin Master</p>
                <p className="text-[11px] text-slate-500 truncate font-sans">admintest@gmail.com</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push('/admin/settings');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:text-purple-700 hover:bg-purple-50 rounded-full flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  Account Settings
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push('/login');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-full flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
