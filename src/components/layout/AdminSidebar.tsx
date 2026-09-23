'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  PlusCircle, 
  ReceiptText, 
  GitFork, 
  WalletCards, 
  Settings, 
  TrendingUp
} from 'lucide-react';
import { clsx } from 'clsx';
import { useCRM } from '@/context/CRMContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  badgeColor?: 'purple' | 'amber' | 'rose';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const AdminSidebar: React.FC<{ isCollapsed?: boolean }> = ({ isCollapsed = false }) => {
  const pathname = usePathname();
  const { deposits, withdrawals, kycRecords, ibWithdrawals, isMobileSidebarOpen, setMobileSidebarOpen } = useCRM();

  const pendingKycCount = kycRecords.filter(k => k.status === 'pending').length;
  const pendingDepositsCount = deposits.filter(d => d.status === 'pending').length;
  const pendingWithdrawalsCount = withdrawals.filter(w => w.status === 'pending').length;
  const pendingIbWdrCount = ibWithdrawals.filter(w => w.status === 'pending').length;

  const sections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        {
          label: 'Dashboard',
          href: '/admin/dashboard',
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
      ],
    },
    {
      title: 'Operations',
      items: [
        {
          label: 'Clients',
          href: '/admin/client-page',
          icon: <Users className="w-5 h-5" />,
        },
        {
          label: 'KYC Verification',
          href: '/admin/kyc-verification',
          icon: <UserCheck className="w-5 h-5" />,
          badge: pendingKycCount > 0 ? pendingKycCount : undefined,
          badgeColor: 'purple',
        },
      ],
    },
    {
      title: 'Finance & Treasury',
      items: [
        {
          label: 'Deposits',
          href: '/admin/deposits',
          icon: <ArrowDownToLine className="w-5 h-5" />,
          badge: pendingDepositsCount > 0 ? pendingDepositsCount : undefined,
          badgeColor: 'amber',
        },
        {
          label: 'Withdrawals',
          href: '/admin/withdrawals',
          icon: <ArrowUpFromLine className="w-5 h-5" />,
          badge: pendingWithdrawalsCount > 0 ? pendingWithdrawalsCount : undefined,
          badgeColor: 'rose',
        },
        {
          label: 'Add Payments',
          href: '/admin/add-payments',
          icon: <PlusCircle className="w-5 h-5" />,
        },
        {
          label: 'Transactions',
          href: '/admin/Admin-transaction-page',
          icon: <ReceiptText className="w-5 h-5" />,
        },
      ],
    },
    {
      title: 'Partner Zone',
      items: [
        {
          label: 'IB Configuration',
          href: '/admin/IB-Configuration',
          icon: <GitFork className="w-5 h-5" />,
        },
        {
          label: 'IB Withdrawals',
          href: '/admin/IB-Withdrawals',
          icon: <WalletCards className="w-5 h-5" />,
          badge: pendingIbWdrCount > 0 ? pendingIbWdrCount : undefined,
          badgeColor: 'purple',
        },
      ],
    },
    {
      title: 'System Workspace',
      items: [
        {
          label: 'System Settings',
          href: '/admin/settings',
          icon: <Settings className="w-5 h-5" />,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            {(!isCollapsed || isMobileSidebarOpen) && (
              <div className="flex flex-col">
                <span className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-1.5 font-heading">
                  ND1 <span className="text-purple-600 font-extrabold">CRM</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 font-sans">
                  Broker Admin Suite
                </span>
              </div>
            )}
          </div>
          {isMobileSidebarOpen && (
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <span className="text-xl leading-none">&times;</span>
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
          {sections.map(section => (
            <div key={section.title} className="space-y-1">
              {(!isCollapsed || isMobileSidebarOpen) && (
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                  {section.title}
                </div>
              )}
              {section.items.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-all group relative',
                      isActive
                        ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200/80 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    )}
                    title={isCollapsed && !isMobileSidebarOpen ? item.label : undefined}
                  >
                    <span
                      className={clsx(
                        'transition-colors shrink-0',
                        isActive ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                      )}
                    >
                      {item.icon}
                    </span>

                    {(!isCollapsed || isMobileSidebarOpen) && (
                      <span className="truncate flex-1 font-sans">{item.label}</span>
                    )}

                    {(!isCollapsed || isMobileSidebarOpen) && item.badge !== undefined && (
                      <span
                        className={clsx(
                          'px-2 py-0.5 text-xs font-bold rounded-full border shrink-0',
                          item.badgeColor === 'purple' && 'bg-purple-100 text-purple-700 border-purple-200',
                          item.badgeColor === 'amber' && 'bg-amber-100 text-amber-700 border-amber-200',
                          item.badgeColor === 'rose' && 'bg-rose-100 text-rose-700 border-rose-200'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}

                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-purple-600 rounded-r-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Admin User Footer Card */}
      <div className="p-3 border-t border-slate-200/90 bg-slate-50/70">
        <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 ring-2 ring-purple-400/30">
            AD
          </div>
          {(!isCollapsed || isMobileSidebarOpen) && (
            <div className="flex-1 min-w-0 font-sans">
              <p className="text-xs font-bold text-slate-900 truncate">Administrator</p>
              <p className="text-[11px] text-slate-500 truncate">admintest@gmail.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={clsx(
          'hidden lg:flex h-screen sticky top-0 bg-white border-r border-slate-200/90 flex-col justify-between select-none z-30 transition-all duration-300 shadow-xs',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Drawer content */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl z-10 flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
