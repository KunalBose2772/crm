'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  TrendingUp, 
  Users, 
  Award, 
  ShieldCheck, 
  DollarSign, 
  ArrowUpRight, 
  SlidersHorizontal, 
  Search, 
  CheckCircle2, 
  PauseCircle, 
  PlayCircle, 
  StopCircle,
  ExternalLink,
  ChevronRight,
  Flame,
  Filter,
  Sparkles,
  Info,
  Crown,
  Rocket,
  Zap,
  BarChart3,
  Settings,
  Eye
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { ClientPageHeader } from '@/components/layout/ClientPageHeader';
import { MasterTrader, CopySubscription } from '@/types/crm';
import { INITIAL_MASTER_TRADERS } from '@/data/mockCopyTrading';
import { StartCopyModal } from '@/components/modals/StartCopyModal';
import { BecomeMasterModal } from '@/components/modals/BecomeMasterModal';
import { MasterTraderCard } from '@/components/cards/MasterTraderCard';

function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 120;
  const height = 36;
  
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const strokeColor = positive ? '#10b981' : '#f43f5e';
  const fillColor = positive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)';

  return (
    <div className="relative w-[120px] h-[36px]">
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
}

function CopyTradingHubContent() {
  const searchParams = useSearchParams();
  const targetClientId = searchParams?.get('clientId');
  const { clients, impersonation, clientUser, showToast } = useCRM();

  const clientFromParam = targetClientId ? clients.find(c => c.id === targetClientId) : null;
  const rawClient = clientFromParam || impersonation.client || clientUser || clients[0];
  const client = (rawClient?.id ? clients.find(c => c.id === rawClient.id || c.email === rawClient.email) : null) || rawClient;

  const [activeTab, setActiveTab] = useState<'masters' | 'my_copies' | 'master_earnings'>('masters');
  const [masters, setMasters] = useState<MasterTrader[]>(INITIAL_MASTER_TRADERS);
  const [subscriptions, setSubscriptions] = useState<CopySubscription[]>([]);
  const [loading, setLoading] = useState(false);

  // Grid layout column selection (2 columns for bigger cards, 3 columns standard, 4 columns compact)
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4>(3);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState<'overallGain' | 'copiers' | 'winRate' | 'riskScore'>('overallGain');
  const [riskFilter, setRiskFilter] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');

  // Modals
  const [selectedMasterForCopy, setSelectedMasterForCopy] = useState<MasterTrader | null>(null);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isBecomeMasterOpen, setIsBecomeMasterOpen] = useState(false);

  // Fetch Masters & Subscriptions from Supabase API
  useEffect(() => {
    async function loadData() {
      // 1. Fetch Masters
      try {
        const res = await fetch('/api/copy-trading/masters');
        const data = await res.json();
        if (data.success && Array.isArray(data.masters) && data.masters.length > 0) {
          setMasters(data.masters);
        }
      } catch (e) {
        console.error('Error loading master traders', e);
      }

      // 2. Fetch Subscriptions for current client
      if (!client?.id) return;
      try {
        const res = await fetch(`/api/copy-trading/subscriptions?clientId=${client.id}`);
        const data = await res.json();
        if (data.success && data.subscriptions) {
          setSubscriptions(data.subscriptions);
        }
      } catch (e) {
        console.error('Error loading subscriptions', e);
      }
    }
    loadData();
  }, [client?.id]);

  // Handle subscription pause/resume/stop
  const handleUpdateSub = async (subId: string, action: 'pause' | 'resume' | 'stop') => {
    try {
      const res = await fetch('/api/copy-trading/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subId, action }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Subscription Updated', data.message);
        setSubscriptions(prev =>
          prev.map(s => (s.id === subId ? { ...s, status: data.subscription.status } : s))
        );
      } else {
        showToast('error', 'Update Failed', data.error || 'Failed to update subscription');
      }
    } catch (err: any) {
      showToast('error', 'Status Error', err.message || 'Error updating status');
    }
  };

  // Filter & sort masters
  const filteredMasters = masters.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.strategyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'all' || m.riskScore === parseInt(riskFilter, 10);
    return matchesSearch && matchesRisk;
  }).sort((a, b) => {
    if (selectedSort === 'overallGain') return b.overallGain - a.overallGain;
    if (selectedSort === 'copiers') return b.totalCopiers - a.totalCopiers;
    if (selectedSort === 'winRate') return b.winRate - a.winRate;
    if (selectedSort === 'riskScore') return a.riskScore - b.riskScore;
    return 0;
  });

  const totalCopiedCapital = subscriptions.reduce((acc, s) => acc + (s.allocatedAmount || 0), 0);
  const totalCopiedProfit = subscriptions.reduce((acc, s) => acc + (s.realizedPnL || 0) + (s.unrealizedPnL || 0), 0);

  // Check if the active client is already a registered Master Trader
  const currentClientMaster = masters.find(m => 
    client && (
      (m.id && client.id && (m.id === `master_${client.id}` || client.id.includes(m.id) || m.id.includes(client.id))) ||
      (client.email && (m.id?.includes(client.email) || client.email.includes('master.'))) ||
      (client.name && m.name.toLowerCase() === client.name.toLowerCase()) ||
      (client.accounts && client.accounts.some((acc: any) => Number(acc.login) === Number(m.login)))
    )
  );

  const isMasterTrader = Boolean(currentClientMaster);

  return (
    <div className="space-y-6">
      {/* Header Banner - Customized dynamically for Master Traders vs Copiers */}
      {isMasterTrader ? (
        <ClientPageHeader
          badge="Verified Master Strategy Command Hub"
          badgeIcon={<Crown className="w-6 h-6 text-amber-300" />}
          title={`${currentClientMaster?.name || client?.name || 'Master Strategy'} Control Center`}
          subtitle={`Strategy: ${currentClientMaster?.strategyName || 'Institutional Multi-Asset'} • MT5 #${currentClientMaster?.login || client?.accounts?.[0]?.login || 'Master'} • Automated follower trade broadcast & High-Water Mark profit split.`}
          chips={[
            {
              label: 'Performance Fee',
              value: `${currentClientMaster?.totalProfitShare || 20}% HWM`,
              icon: <DollarSign className="w-3.5 h-3.5 text-emerald-300" />,
            },
            {
              label: 'Strategy Followers',
              value: `${currentClientMaster?.activeCopiers || currentClientMaster?.totalCopiers || 284} Copiers`,
              icon: <Users className="w-3.5 h-3.5 text-sky-300" />,
            },
            {
              label: 'Overall Strategy Gain',
              value: `+${currentClientMaster?.overallGain || 142.6}%`,
              icon: <TrendingUp className="w-3.5 h-3.5 text-amber-300" />,
            },
          ]}
          actionButton={
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-400/20 border border-amber-300/40 text-amber-200 font-extrabold text-xs shadow-sm">
                <Crown className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Active Master Trader</span>
              </span>
              <Link
                href={`/client/copy-trading/${currentClientMaster?.id || masters[0]?.id}${targetClientId ? `?clientId=${targetClientId}` : ''}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-blue-900 font-extrabold text-xs hover:bg-blue-50 transition-all shadow-sm shrink-0 whitespace-nowrap active:scale-[0.98] cursor-pointer"
              >
                <Eye className="w-4 h-4 text-blue-600 shrink-0" />
                <span>My Public Profile</span>
              </Link>
            </div>
          }
        />
      ) : (
        <ClientPageHeader
          badge="Social Trading & Copy Engine"
          badgeIcon={<TrendingUp className="w-6 h-6 text-white" />}
          title="Copy Trading Platform"
          subtitle="Mirror verified professional Master Traders in real-time on your MT5 account. Automate your returns with institutional-grade risk controls."
          chips={[
            {
              label: 'Copied Profit',
              value: `$${totalCopiedProfit >= 0 ? '+' : ''}${totalCopiedProfit.toFixed(2)}`,
              icon: <DollarSign className="w-3.5 h-3.5 text-emerald-300" />,
            },
            {
              label: 'Active Copied',
              value: `${subscriptions.filter(s => s.status === 'active').length} Strategies`,
              icon: <Users className="w-3.5 h-3.5 text-sky-300" />,
            },
          ]}
          actionButton={
            <button
              onClick={() => setIsBecomeMasterOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white text-blue-900 font-extrabold text-xs hover:bg-blue-50 transition-all shadow-sm shrink-0 whitespace-nowrap active:scale-[0.98] cursor-pointer"
            >
              <Award className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Become a Master Trader</span>
            </button>
          }
        />
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 border-b border-slate-200 pb-4">
        {/* Left: Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl w-fit shrink-0">
          <button
            onClick={() => setActiveTab('masters')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'masters'
                ? 'bg-white text-blue-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Master Traders</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[10px]">
              {masters.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('my_copies')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'my_copies'
                ? 'bg-white text-blue-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>My Active Copies</span>
            {subscriptions.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 text-[10px]">
                {subscriptions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('master_earnings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'master_earnings'
                ? 'bg-white text-blue-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-purple-600" />
            <span>{isMasterTrader ? 'My Strategy Commission Ledger' : 'Commission Ledger'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700 text-[10px] font-mono">
              HWM {currentClientMaster?.totalProfitShare || 20}%
            </span>
          </button>
        </div>

        {/* Right: Search, Filter, Sort & Grid Controls in 1 Line */}
        {activeTab === 'masters' && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Search Input */}
            <div className="relative w-44 sm:w-52">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search trader..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Risk Dropdown */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-semibold text-[11px] hidden sm:inline">Risk:</span>
              <select
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="all">All Risk</option>
                <option value="1">Risk 1 (Low)</option>
                <option value="2">Risk 2</option>
                <option value="3">Risk 3</option>
                <option value="4">Risk 4</option>
                <option value="5">Risk 5 (High)</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-semibold text-[11px] hidden sm:inline">Sort:</span>
              <select
                value={selectedSort}
                onChange={e => setSelectedSort(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none cursor-pointer"
              >
                <option value="overallGain">Gain %</option>
                <option value="copiers">Copiers</option>
                <option value="winRate">Win Rate</option>
                <option value="riskScore">Risk</option>
              </select>
            </div>

            {/* Cards Grid Switcher */}
            <div className="flex items-center gap-1 pl-1.5 sm:border-l sm:border-slate-200">
              <span className="text-slate-400 font-semibold text-[11px] hidden md:inline mr-0.5">Cards:</span>
              {([2, 3, 4] as const).map(cols => (
                <button
                  key={cols}
                  type="button"
                  onClick={() => setGridColumns(cols)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    gridColumns === cols
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title={`${cols} columns layout`}
                >
                  {cols}x
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Master Trader Broadcast & Live Telemetry Deck (Exclusive to Master Traders) */}
      {isMasterTrader && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white border border-indigo-900/60 shadow-xl relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
          <div className="absolute right-1/3 -bottom-20 w-60 h-60 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-amber-400/20 border border-amber-300/30 text-amber-300 font-extrabold text-[11px] flex items-center gap-1.5 shadow-2xs font-heading">
                  <Crown className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>Master Broadcast Active</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Syncing to MT5 Server Realtime
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white">
                {currentClientMaster?.strategyName || 'Verified Master'} Strategy Desk
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                Every trade executed on your MT5 Master account (<span className="text-amber-300 font-mono font-bold">#{currentClientMaster?.login || 'Master'}</span>) is instantly replicated across your copier fleet with institutional lot-ratio scaling.
              </p>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-md">
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Followers Volume</div>
                <div className="text-base sm:text-lg font-black text-white font-heading">
                  {currentClientMaster?.activeCopiers || currentClientMaster?.totalCopiers || 284} Copiers
                </div>
                <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5" /> +14 this week
                </div>
              </div>

              <div className="space-y-1 border-l border-white/10 pl-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">HWM Profit Share</div>
                <div className="text-base sm:text-lg font-black text-amber-300 font-heading">
                  {currentClientMaster?.totalProfitShare || 20}%
                </div>
                <div className="text-[10px] text-slate-400">High-Water Mark</div>
              </div>

              <div className="space-y-1 border-l border-white/10 pl-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Strategy Gain</div>
                <div className="text-base sm:text-lg font-black text-emerald-400 font-heading">
                  +{currentClientMaster?.overallGain || 142.6}%
                </div>
                <div className="text-[10px] text-emerald-400 font-bold">Verified MT5</div>
              </div>

              <div className="space-y-1 border-l border-white/10 pl-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Settlement Cycle</div>
                <div className="text-base sm:text-lg font-black text-sky-300 font-heading">
                  Weekly
                </div>
                <div className="text-[10px] text-sky-400 font-medium">Direct to Wallet</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Master Traders Directory (1 column on mobile, customizable 2x/3x/4x on desktop) */}
      {activeTab === 'masters' && (
        <div className={`grid grid-cols-1 gap-3 sm:gap-4 ${
          gridColumns === 2 
            ? 'sm:grid-cols-2 lg:grid-cols-2' 
            : gridColumns === 4 
              ? 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4' 
              : 'sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {filteredMasters.map(master => {
            const isBeingCopied = subscriptions.some(
              s => s.masterId === master.id && s.status === 'active'
            );
            const isOwnStrategy = Boolean(
              currentClientMaster && (
                currentClientMaster.id === master.id ||
                Number(currentClientMaster.login) === Number(master.login) ||
                (master.name && currentClientMaster.name && master.name.toLowerCase() === currentClientMaster.name.toLowerCase())
              )
            );

            return (
              <MasterTraderCard
                key={master.id}
                master={master}
                isAdmin={false}
                isBeingCopied={isBeingCopied}
                isOwnStrategy={isOwnStrategy}
                profileHref={`/client/copy-trading/${master.id}${targetClientId ? `?clientId=${targetClientId}` : ''}`}
                onCopy={(m) => {
                  setSelectedMasterForCopy(m);
                  setIsCopyModalOpen(true);
                }}
                onSelect={(m) => {
                  setSelectedMasterForCopy(m);
                  setIsCopyModalOpen(true);
                }}
              />
            );
          })}
        </div>
      )}

      {/* Tab 2: My Active Copies */}
      {activeTab === 'my_copies' && (
        <div className="space-y-4">
          {subscriptions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">You are not copying any master yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore our leaderboard of verified Master Traders, evaluate their trading stats, and copy them with one click.
              </p>
              <button
                onClick={() => setActiveTab('masters')}
                className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
              >
                Browse Master Directory
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200/90 shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-5">Master Trader</th>
                    <th className="py-3.5 px-4">Your MT5 Account</th>
                    <th className="py-3.5 px-4">Allocated Capital</th>
                    <th className="py-3.5 px-4">Floating PnL</th>
                    <th className="py-3.5 px-4">Copy Mode</th>
                    <th className="py-3.5 px-4">Stop Guard</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subscriptions.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          {sub.masterAvatar && (
                            <img
                              src={sub.masterAvatar}
                              alt={sub.masterName}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                            />
                          )}
                          <div>
                            <Link
                              href={`/client/copy-trading/${sub.masterId}${targetClientId ? `?clientId=${targetClientId}` : ''}`}
                              className="font-bold text-slate-900 hover:text-blue-600 transition"
                            >
                              {sub.masterName}
                            </Link>
                            <span className="block text-[10px] text-slate-400">
                              Started: {sub.startDate}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-800">
                        MT5 #{sub.copierAccountLogin}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-800">
                        ${sub.allocatedAmount.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 font-bold">
                        <span
                          className={sub.unrealizedPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}
                        >
                          {sub.unrealizedPnL >= 0 ? '+' : ''}${sub.unrealizedPnL.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-600 capitalize">
                        {sub.copyMode}
                      </td>
                      <td className="py-4 px-4 font-medium text-amber-700">
                        {sub.riskStopPercent}% DD Guard
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            sub.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : sub.status === 'paused'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {sub.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {sub.status === 'active' ? (
                            <button
                              onClick={() => handleUpdateSub(sub.id, 'pause')}
                              className="px-2.5 py-1 rounded-lg border border-amber-300 text-amber-800 text-[11px] font-bold hover:bg-amber-50 transition"
                            >
                              Pause
                            </button>
                          ) : sub.status === 'paused' ? (
                            <button
                              onClick={() => handleUpdateSub(sub.id, 'resume')}
                              className="px-2.5 py-1 rounded-lg border border-emerald-300 text-emerald-800 text-[11px] font-bold hover:bg-emerald-50 transition"
                            >
                              Resume
                            </button>
                          ) : null}

                          {sub.status !== 'stopped' && (
                            <button
                              onClick={() => handleUpdateSub(sub.id, 'stop')}
                              className="px-2.5 py-1 rounded-lg border border-rose-300 text-rose-700 text-[11px] font-bold hover:bg-rose-50 transition"
                            >
                              Stop & Detach
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Master Commission Ledger & Transparency View */}
      {activeTab === 'master_earnings' && (
        <div className="space-y-5 animate-in fade-in select-none">
          {/* Top Overview Cards for Master Trader Earnings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                Cumulative Commission Earned
              </span>
              <p className="mt-1 text-xl sm:text-2xl font-black text-emerald-600 font-heading">
                $1,480.50
              </p>
              <span className="text-[11px] text-slate-500 font-medium">
                High-Water Mark (HWM) audited
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                Active Strategy Followers
              </span>
              <p className="mt-1 text-xl sm:text-2xl font-black text-blue-700 font-heading">
                284 Copiers
              </p>
              <span className="text-[11px] text-slate-500 font-medium">
                Titan Trend Master & Apex FX
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                Total Copier Capital Managed
              </span>
              <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 font-heading">
                $48,920.00
              </p>
              <span className="text-[11px] text-slate-500 font-medium">
                Cloned across live accounts
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                Settlement Cycle
              </span>
              <p className="mt-1 text-xl sm:text-2xl font-black text-purple-700 font-heading">
                Weekly (Sat 00:00)
              </p>
              <span className="text-[11px] text-slate-500 font-medium">
                Direct MT5 wallet deposit
              </span>
            </div>
          </div>

          {/* Detailed Audit Table */}
          <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm font-heading">
                  Real-Time Commission Sharing Audit Ledger
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every closed trade that creates new net profit is recorded here with formula transparency.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-mono">
                Auto-Settled to Wallet
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-5">Date & Time</th>
                  <th className="py-3 px-4">Master Strategy</th>
                  <th className="py-3 px-4">Copier Account</th>
                  <th className="py-3 px-4">Closed Profit</th>
                  <th className="py-3 px-4">HWM Threshold</th>
                  <th className="py-3 px-4">Fee %</th>
                  <th className="py-3 px-4">Your Commission</th>
                  <th className="py-3 px-5 text-right">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {[
                  {
                    time: 'Today 14:22 UTC',
                    master: 'Titan Trend Master (#4587463242561)',
                    copier: 'MT5 #4587463242557 (Client Kunal B.)',
                    profit: '+$240.00',
                    hwm: '$1,200.00 (Exceeded)',
                    fee: '20%',
                    comm: '+$48.00',
                    status: 'Settled',
                  },
                  {
                    time: 'Today 11:05 UTC',
                    master: 'Apex FX Scalper Pro (#4587463242562)',
                    copier: 'MT5 #4587463242558 (Client Kunal B.)',
                    profit: '+$180.00',
                    hwm: '$2,500.00 (Exceeded)',
                    fee: '25%',
                    comm: '+$45.00',
                    status: 'Settled',
                  },
                  {
                    time: 'Yesterday 19:40 UTC',
                    master: 'Titan Trend Master (#4587463242561)',
                    copier: 'MT5 #4587463242559 (Client Kunal B.)',
                    profit: '+$520.00',
                    hwm: '$5,000.00 (Exceeded)',
                    fee: '20%',
                    comm: '+$104.00',
                    status: 'Settled',
                  },
                  {
                    time: 'Sep 24 16:15 UTC',
                    master: 'Apex FX Scalper Pro (#4587463242562)',
                    copier: 'MT5 #4587463242560 (Client Test)',
                    profit: '+$310.00',
                    hwm: '$1,800.00 (Exceeded)',
                    fee: '25%',
                    comm: '+$77.50',
                    status: 'Settled',
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-5 font-mono text-[11px] text-slate-500">{row.time}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{row.master}</td>
                    <td className="py-3.5 px-4 text-slate-600">{row.copier}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 font-mono">{row.profit}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{row.hwm}</td>
                    <td className="py-3.5 px-4 font-bold text-purple-700">{row.fee}</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-600 font-mono">{row.comm}</td>
                    <td className="py-3.5 px-5 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Start Copy Modal */}
      <StartCopyModal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        master={selectedMasterForCopy}
        accounts={client?.accounts || []}
        clientId={client?.id || ''}
        onSuccess={(newSub) => {
          setSubscriptions(prev => [newSub, ...prev]);
        }}
      />

      {/* Become Master Modal */}
      <BecomeMasterModal
        isOpen={isBecomeMasterOpen}
        onClose={() => setIsBecomeMasterOpen(false)}
        accounts={client?.accounts || []}
        clientId={client?.id || ''}
        clientName={client?.name || ''}
        onSuccess={(newMaster) => {
          setMasters(prev => [newMaster, ...prev]);
        }}
      />
    </div>
  );
}

export default function ClientCopyTradingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Copy Trading Hub...</div>}>
      <CopyTradingHubContent />
    </Suspense>
  );
}
