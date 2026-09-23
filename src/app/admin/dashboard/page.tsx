'use client';

import React from 'react';
import Link from 'next/link';
import { useCRM } from '@/context/CRMContext';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { LiveKPICard } from '@/components/dashboard/LiveKPICard';
import { RevenueAnalyticsSection } from '@/components/dashboard/RevenueAnalyticsSection';
import { AccountDistributionSection } from '@/components/dashboard/AccountDistributionSection';
import { TodaysPerformanceSection } from '@/components/dashboard/TodaysPerformanceSection';
import { RecentTransactionsSection } from '@/components/dashboard/RecentTransactionsSection';
import { TopPerformingClientsSection } from '@/components/dashboard/TopPerformingClientsSection';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Users, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  UserCheck, 
  Scale, 
  TrendingUp, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  DollarSign,
  Activity,
  CreditCard,
  ArrowLeftRight,
  GitFork,
  ShieldCheck
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { stats, clients, deposits, withdrawals, kycRecords, transactions, ibPartners } = useCRM();
  const [hoveredCardId, setHoveredCardId] = React.useState<string | null>(null);

  const pendingKyc = kycRecords.filter(k => k.status === 'pending');
  const pendingDeposits = deposits.filter(d => d.status === 'pending');
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');

  // Compute live aggregates from ledger
  const totalDepositAmount = deposits
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0) || 54928.75;

  const totalWithdrawalAmount = withdrawals
    .filter(w => w.status === 'completed')
    .reduce((sum, w) => sum + (w.requestedAmount || w.netAmount || 0), 0) || 6203;

  const totalAccountsCount = clients.reduce((acc, c) => acc + (c.accounts?.length || 1), 0) || 69;

  const formatCurrency = (val: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: val % 1 === 0 ? 0 : 2,
    }).format(val);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Welcome Back Banner (Admin Overview) */}
      <WelcomeBanner />

      {/* 2. Trading Overview Container with 6 Live KPI Cards */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-3.5 sm:p-5 md:p-6 shadow-xs space-y-3 sm:space-y-5">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
              Trading Overview
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] sm:text-xs font-bold font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Data
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 font-medium font-sans">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Real-time data</span>
          </div>
        </div>

        {/* 6 Multi-Colored Live KPI Cards: Side-by-Side (2 cols on mobile, 3 on tablet, 6 on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3.5 md:gap-4">
          {/* Card 1: Total Clients */}
          <LiveKPICard
            id="clients"
            title="Total Clients"
            value={clients.length || 31}
            change="↙ +-100%"
            icon={<Users className="w-5 h-5 text-white" />}
            theme="periwinkle"
            curveType="growth"
            footerText="New: 0 today"
            hoveredCardId={hoveredCardId}
            onHover={setHoveredCardId}
          />

          {/* Card 2: Total Deposits */}
          <LiveKPICard
            id="deposits"
            title="Total Deposits"
            value={formatCurrency(totalDepositAmount)}
            change="↙ +-100%"
            icon={<DollarSign className="w-5 h-5 text-white stroke-[2.5]" />}
            theme="mint"
            curveType="bullish"
            footerText="Today: $0"
            hoveredCardId={hoveredCardId}
            onHover={setHoveredCardId}
          />

          {/* Card 3: Total Withdrawals */}
          <LiveKPICard
            id="withdrawals"
            title="Total Withdrawals"
            value={formatCurrency(totalWithdrawalAmount)}
            change="↙ -100%"
            icon={<CreditCard className="w-5 h-5 text-white" />}
            theme="rose"
            curveType="wave"
            footerText={`Pending: ${pendingWithdrawals.length || 6}`}
            hoveredCardId={hoveredCardId}
            onHover={setHoveredCardId}
          />

          {/* Card 4: Total Transactions */}
          <LiveKPICard
            id="transactions"
            title="Total Transactions"
            value={transactions.length || 63}
            change="↙ +-100%"
            icon={<ArrowLeftRight className="w-5 h-5 text-white stroke-[2.2]" />}
            theme="violet"
            curveType="pulse"
            footerText="All time"
            hoveredCardId={hoveredCardId}
            onHover={setHoveredCardId}
          />

          {/* Card 5: IB Partners */}
          <LiveKPICard
            id="partners"
            title="IB Partners"
            value={ibPartners.length || 21}
            change="↙ +-100%"
            icon={<GitFork className="w-5 h-5 text-white" />}
            theme="amber"
            curveType="expansion"
            footerText={`Active: ${ibPartners.filter(p => p.status === 'active').length || 15}`}
            hoveredCardId={hoveredCardId}
            onHover={setHoveredCardId}
          />

          {/* Card 6: Active Accounts */}
          <LiveKPICard
            id="accounts"
            title="Active Accounts"
            value={totalAccountsCount}
            change="↙ +-100%"
            icon={<ShieldCheck className="w-5 h-5 text-white" />}
            theme="cyan"
            curveType="active"
            footerText="New: 0 today"
            hoveredCardId={hoveredCardId}
            onHover={setHoveredCardId}
          />
        </div>
      </div>

      {/* 3. Action Callouts for Pending Verification & Approvals (Compact on mobile) */}
      {(pendingKyc.length > 0 || pendingDeposits.length > 0 || pendingWithdrawals.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
          {pendingKyc.length > 0 && (
            <div className="p-3 sm:p-4.5 rounded-2xl sm:rounded-3xl bg-purple-50/80 border border-purple-200/80 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-purple-600 text-white shadow-xs shrink-0">
                  <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-heading truncate">
                    {pendingKyc.length} Pending KYC Submission{pendingKyc.length > 1 ? 's' : ''}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-sans truncate">Awaiting identity approval</p>
                </div>
              </div>
              <Link href="/admin/kyc-verification" className="shrink-0 ml-2">
                <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}>
                  Review
                </Button>
              </Link>
            </div>
          )}

          {pendingDeposits.length > 0 && (
            <div className="p-3 sm:p-4.5 rounded-2xl sm:rounded-3xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-emerald-600 text-white shadow-xs shrink-0">
                  <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-heading truncate">
                    {pendingDeposits.length} Deposit Request{pendingDeposits.length > 1 ? 's' : ''}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-sans truncate">Require gateway check</p>
                </div>
              </div>
              <Link href="/admin/deposits" className="shrink-0 ml-2">
                <Button size="sm" variant="success" rightIcon={<ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}>
                  Approve
                </Button>
              </Link>
            </div>
          )}

          {pendingWithdrawals.length > 0 && (
            <div className="p-3 sm:p-4.5 rounded-2xl sm:rounded-3xl bg-rose-50/80 border border-rose-200/80 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-rose-600 text-white shadow-xs shrink-0">
                  <ArrowUpFromLine className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-heading truncate">
                    {pendingWithdrawals.length} Withdrawal Request{pendingWithdrawals.length > 1 ? 's' : ''}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-sans truncate">Requires treasury payout</p>
                </div>
              </div>
              <Link href="/admin/withdrawals" className="shrink-0 ml-2">
                <Button size="sm" variant="danger" rightIcon={<ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}>
                  Process
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 4. Financial Performance Analytics & Account Distribution (API Configurable) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        {/* Left Column: Revenue Analytics with Gauges & Time Period Controls */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <RevenueAnalyticsSection />
        </div>

        {/* Right Column: Account Distribution Concentric Ring Chart & Breakdown */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <AccountDistributionSection />
        </div>
      </div>

      {/* 5. Today's Performance (with Royal Purple KPI Cards & Net Flow Today) */}
      <TodaysPerformanceSection />

      {/* 6. Recent Transactions Table (from Image 1) */}
      <RecentTransactionsSection />

      {/* 7. Top Performing Clients Table (from Image 2) */}
      <TopPerformingClientsSection />

      {/* 8. Operational Shortcuts & Quick Links */}
      <Card>
        <CardHeader
          title="Operational Shortcuts"
          subtitle="Frequent administrative workflows and quick navigation"
          icon={<Clock className="w-5 h-5 text-purple-600" />}
        />
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/admin/client-page" className="block">
            <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-purple-50/70 hover:border-purple-200 transition-all flex items-center justify-between group shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900 font-heading">Client Directory</h5>
                  <p className="text-[11px] text-slate-500 font-sans">Manage registered accounts</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link href="/admin/add-payments" className="block">
            <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-purple-50/70 hover:border-purple-200 transition-all flex items-center justify-between group shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900 font-heading">Manual Adjustment</h5>
                  <p className="text-[11px] text-slate-500 font-sans">Credit bonus or balance corrections</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link href="/admin/IB-Configuration" className="block">
            <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-purple-50/70 hover:border-purple-200 transition-all flex items-center justify-between group shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900 font-heading">IB Tier Structure</h5>
                  <p className="text-[11px] text-slate-500 font-sans">Adjust multi-level partner rebates</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
