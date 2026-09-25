'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/context/CRMContext';
import { IBTierConfig, IBPartner } from '@/types/crm';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { Modal } from '@/components/ui/Modal';
import { 
  GitFork, 
  Award, 
  Save, 
  Copy, 
  Check, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Wallet, 
  Search, 
  Filter, 
  Download, 
  X, 
  Eye, 
  ChevronDown, 
  ExternalLink,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Network,
  Plus,
  LogIn
} from 'lucide-react';
import { clsx } from 'clsx';

export default function IBConfigurationPage() {
  const { ibTiers, updateIBTiers, ibPartners, clients, startImpersonation, showToast } = useCRM();

  // Tier Matrix State
  const [tiers, setTiers] = useState<IBTierConfig[]>(ibTiers);
  const [isSavingTiers, setIsSavingTiers] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'Gold' | 'Platinum' | 'Diamond' | 'VIP'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Partner Detail Modal
  const [selectedPartner, setSelectedPartner] = useState<IBPartner | null>(null);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  // Add Partner Modal State
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [isSubmittingPartner, setIsSubmittingPartner] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    email: '',
    tier: 'Gold',
    rebatePerLotUsd: '8.0'
  });

  // Copy code helper
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast('info', 'Referral Code Copied', code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerForm.name.trim() || !partnerForm.email.trim()) {
      showToast('error', 'Fields Required', 'Please enter partner name and email.');
      return;
    }
    setIsSubmittingPartner(true);
    try {
      const res = await fetch('/api/ib/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partnerForm)
      });
      const data = await res.json();
      if (data.success && data.partner) {
        showToast('success', 'Partner Created', `${data.partner.name} registered with referral code ${data.partner.referralCode}.`);
        setIsAddPartnerOpen(false);
        setPartnerForm({ name: '', email: '', tier: 'Gold', rebatePerLotUsd: '8.0' });
        // Refresh page
        window.location.reload();
      } else {
        showToast('error', 'Registration Failed', data.error || 'Unable to register partner.');
      }
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to submit partner.');
    } finally {
      setIsSubmittingPartner(false);
    }
  };

  // Modify tier
  const handleTierChange = (index: number, field: keyof IBTierConfig, val: number) => {
    const updated = [...tiers];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    setTiers(updated);
  };

  // Save Tiers
  const handleSaveTiers = () => {
    setIsSavingTiers(true);
    updateIBTiers(tiers);
    setTimeout(() => {
      setIsSavingTiers(false);
      showToast('success', 'Tier Rates Saved', 'Rebate rates and multi-tier commission structures updated.');
    }, 400);
  };

  // Live Metrics from IB Partners
  const activePartnersCount = ibPartners.length;
  const totalLots = ibPartners.reduce((acc, p) => acc + (p.totalVolumeLots || 0), 0);
  const totalPaid = ibPartners.reduce((acc, p) => acc + (p.totalCommissionEarned || 0), 0);
  const totalWalletBalance = ibPartners.reduce((acc, p) => acc + (p.withdrawableCommission || 0), 0);

  // Filtered partners
  const filteredPartners = useMemo(() => {
    return ibPartners.filter(partner => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        partner.name.toLowerCase().includes(q) ||
        partner.email.toLowerCase().includes(q) ||
        partner.referralCode.toLowerCase().includes(q) ||
        partner.tier.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (tierFilter !== 'all' && partner.tier !== tierFilter) {
        return false;
      }

      return true;
    });
  }, [ibPartners, searchQuery, tierFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPartners.length / pageSize) || 1;
  const paginatedPartners = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPartners.slice(startIndex, startIndex + pageSize);
  }, [filteredPartners, currentPage, pageSize]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Partner ID', 'Name', 'Email', 'Tier', 'Referral Code', 'Active Clients', 'Sub-IBs', 'Volume Lots', 'Lifetime Commission', 'Wallet Balance'];
    const rows = filteredPartners.map(p => [
      `"${p.id}"`,
      `"${p.name}"`,
      `"${p.email}"`,
      `"${p.tier}"`,
      `"${p.referralCode}"`,
      p.activeClientsCount,
      p.subIbCount,
      p.totalVolumeLots,
      p.totalCommissionEarned,
      p.withdrawableCommission,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ib_partners_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('info', 'Export Successful', `Exported ${filteredPartners.length} IB partners to CSV.`);
  };

  // Wire "Login as Partner" directly into Client IB Portal
  const handleImpersonatePartner = (partner: IBPartner) => {
    const matchedClient = clients.find(
      c => (partner.email && c.email?.toLowerCase() === partner.email.toLowerCase()) ||
           (partner.id && c.id === partner.id) ||
           ((partner as any).clientId && c.id === (partner as any).clientId)
    );

    if (matchedClient) {
      startImpersonation(matchedClient);
      showToast('info', 'Partner Portal Active', `Opening partner workspace for ${partner.name}...`);
      window.open(`/client/partner/dashboard?clientId=${matchedClient.id}`, '_blank');
    } else {
      // If client object is not loaded yet in memory, fallback to clientId
      showToast('info', 'Partner Portal Active', `Opening partner workspace for ${partner.name}...`);
      window.open(`/client/partner/dashboard`, '_blank');
    }
  };

  const getTierBadge = (tier: string) => {
    if (tier === 'VIP') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
          VIP
        </span>
      );
    }
    if (tier === 'Diamond') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-900 border border-cyan-300 shadow-2xs">
          Diamond
        </span>
      );
    }
    if (tier === 'Platinum') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs">
          Platinum
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-900 border border-yellow-300 shadow-2xs">
        Gold
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 select-none pb-12 font-sans">
      {/* 1. Established Royal Purple Welcome Banner */}
      <WelcomeBanner
        title="IB Configuration & Rebates"
        subtitle="Configure multi-tier partner commissions, per-lot asset rebates, and sub-IB revenue splits."
        badgeText="Partner Network"
        onRefresh={() => showToast('success', 'Affiliate Network Refreshed', 'IB tier matrices and partner volumes synchronized.')}
      />

      {/* 2. Top 4 Established KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
              Active Partners
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {activePartnersCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">registered IBs</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
              Referred Volume
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">
              {totalLots.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-xs text-emerald-600/80 font-medium">lots traded</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
              Lifetime Paid
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">
              ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-amber-500/80 font-medium">commissions</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
              Unclaimed Balance
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-700 font-mono">
              ${totalWalletBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-purple-600/80 font-medium">in IB wallets</span>
          </div>
        </div>
      </div>

      {/* 3. Multi-Tier Rebate Matrix Editor */}
      <div className="bg-white rounded-3xl shadow-sm border border-purple-100/90 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4c1d95] via-[#581c87] to-[#6b21a8] p-5 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl shadow-inner border border-white/20">
              <GitFork className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">Commission Tier Structures</h2>
              <p className="text-purple-200 text-xs sm:text-sm">Define rebate values ($ USD per round-turn lot) by partner tier</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveTiers}
            disabled={isSavingTiers}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-purple-900 rounded-xl hover:bg-purple-50 transition-all font-bold text-xs sm:text-sm cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Save className="h-4 w-4 text-purple-700" />
            <span>{isSavingTiers ? 'Saving...' : 'Save Tier Rates'}</span>
          </button>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[820px]">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-heading">
                <th className="py-3.5 px-5">Tier Level</th>
                <th className="py-3.5 px-4 text-right">Min Monthly Lots</th>
                <th className="py-3.5 px-4 text-right">Forex ($/lot)</th>
                <th className="py-3.5 px-4 text-right">Metals ($/lot)</th>
                <th className="py-3.5 px-4 text-right">Crypto ($/lot)</th>
                <th className="py-3.5 px-4 text-right">Indices ($/lot)</th>
                <th className="py-3.5 px-5 text-right">Sub-IB Share (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {tiers.map((tier, idx) => {
                const tierBadges: Record<string, { bg: string; text: string; border: string }> = {
                  Standard: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
                  Silver: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
                  Gold: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
                  VIP: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
                };
                const badge = tierBadges[tier.tierName] || { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' };

                return (
                  <tr key={tier.tierName} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3.5 px-5 font-bold font-heading">
                      <div className="flex items-center gap-2.5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                          <Award className="w-3.5 h-3.5" />
                          <span>{tier.tierName}</span>
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end">
                        <input
                          type="number"
                          value={tier.minLots}
                          onChange={e => handleTierChange(idx, 'minLots', Number(e.target.value))}
                          className="w-24 px-3 py-1.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 text-right focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-500 transition-all tabular-nums"
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end relative">
                        <span className="absolute left-2.5 text-xs text-slate-400 font-mono">$</span>
                        <input
                          type="number"
                          step="0.5"
                          value={tier.forexRebatePerLot}
                          onChange={e => handleTierChange(idx, 'forexRebatePerLot', Number(e.target.value))}
                          className="w-24 pl-6 pr-2.5 py-1.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-xs font-mono text-emerald-700 font-bold text-right focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 transition-all tabular-nums"
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end relative">
                        <span className="absolute left-2.5 text-xs text-slate-400 font-mono">$</span>
                        <input
                          type="number"
                          step="0.5"
                          value={tier.metalsRebatePerLot}
                          onChange={e => handleTierChange(idx, 'metalsRebatePerLot', Number(e.target.value))}
                          className="w-24 pl-6 pr-2.5 py-1.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-xs font-mono text-amber-700 font-bold text-right focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500 transition-all tabular-nums"
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end relative">
                        <span className="absolute left-2.5 text-xs text-slate-400 font-mono">$</span>
                        <input
                          type="number"
                          step="0.5"
                          value={tier.cryptoRebatePerLot}
                          onChange={e => handleTierChange(idx, 'cryptoRebatePerLot', Number(e.target.value))}
                          className="w-24 pl-6 pr-2.5 py-1.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-xs font-mono text-purple-700 font-bold text-right focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-500 transition-all tabular-nums"
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end relative">
                        <span className="absolute left-2.5 text-xs text-slate-400 font-mono">$</span>
                        <input
                          type="number"
                          step="0.5"
                          value={tier.indicesRebatePerLot}
                          onChange={e => handleTierChange(idx, 'indicesRebatePerLot', Number(e.target.value))}
                          className="w-24 pl-6 pr-2.5 py-1.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-xs font-mono text-blue-700 font-bold text-right focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-500 transition-all tabular-nums"
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center justify-end relative">
                        <input
                          type="number"
                          value={tier.subIbSharePercent}
                          onChange={e => handleTierChange(idx, 'subIbSharePercent', Number(e.target.value))}
                          className="w-20 pr-6 pl-2.5 py-1.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 text-right focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-500 transition-all tabular-nums"
                        />
                        <span className="absolute right-2 text-xs text-slate-400 font-bold">%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Active IB Partners Directory */}
      <div className="bg-white rounded-3xl shadow-sm border border-purple-100/90 p-4 sm:p-6 space-y-4">
        {/* Header & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-3 border-b border-purple-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">Active Introducing Brokers Directory</h3>
            <p className="text-xs text-slate-500">Registered broker affiliates, commission earnings, and referred trading volume.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddPartnerOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Partner</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-purple-200/80 bg-white hover:bg-purple-50 text-purple-700 rounded-xl font-bold text-xs cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Directory</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by partner name, email, or referral code..."
              className="w-full pl-10 pr-4 py-2 bg-purple-50/20 border border-purple-100 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tier Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'VIP', 'Diamond', 'Platinum', 'Gold'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => { setTierFilter(t as any); setCurrentPage(1); }}
                className={clsx(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                  tierFilter === t
                    ? "bg-purple-600 text-white shadow-2xs"
                    : "bg-purple-50/60 text-slate-600 hover:bg-purple-100/70 hover:text-purple-700"
                )}
              >
                {t === 'all' ? 'All Tiers' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Table (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-purple-100/90 text-slate-600 font-bold uppercase tracking-wider text-[11px] font-heading">
                <th className="py-3.5 px-4 pl-6">Partner</th>
                <th className="py-3.5 px-4">Tier</th>
                <th className="py-3.5 px-4">Referral Code</th>
                <th className="py-3.5 px-4">Network</th>
                <th className="py-3.5 px-4">Trading Volume</th>
                <th className="py-3.5 px-4">Lifetime Commission</th>
                <th className="py-3.5 px-4">Wallet Balance</th>
                <th className="py-3.5 px-4 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 text-slate-700">
              {paginatedPartners.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No introducing brokers registered yet. Partners will be listed here once registered.
                  </td>
                </tr>
              ) : (
                paginatedPartners.map(p => (
                  <tr key={p.id} className="hover:bg-purple-50/30 transition-colors group">
                  {/* Partner */}
                  <td className="py-4 px-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                          {p.name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">{p.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Tier */}
                  <td className="py-4 px-4">
                    {getTierBadge(p.tier)}
                  </td>

                  {/* Referral Code */}
                  <td className="py-4 px-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-mono text-xs text-slate-800 font-bold">
                      <span>{p.referralCode}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(p.referralCode)}
                        className="hover:text-purple-700 cursor-pointer"
                        title="Copy Referral Code"
                      >
                        {copiedCode === p.referralCode ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Network */}
                  <td className="py-4 px-4 text-xs font-semibold text-slate-800">
                    <div>{p.activeClientsCount} Traders</div>
                    <div className="text-[11px] text-slate-400 font-normal">{p.subIbCount} Sub-IBs</div>
                  </td>

                  {/* Trading Volume */}
                  <td className="py-4 px-4 font-mono font-bold text-purple-700 text-xs">
                    {p.totalVolumeLots.toLocaleString()} Lots
                  </td>

                  {/* Commission */}
                  <td className="py-4 px-4 font-mono font-bold text-emerald-600 text-sm">
                    ${p.totalCommissionEarned.toLocaleString()}
                  </td>

                  {/* Wallet */}
                  <td className="py-4 px-4 font-mono font-bold text-slate-900 text-sm">
                    ${p.withdrawableCommission.toLocaleString()}
                  </td>

                  {/* Action */}
                  <td className="py-4 px-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleImpersonatePartner(p)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-200/80 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                        title="Login as Partner (Client IB Workspace)"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Portal</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setSelectedPartner(p); setIsPartnerModalOpen(true); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200/80 bg-white hover:bg-purple-50 text-purple-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards */}
        <div className="md:hidden space-y-3">
          {paginatedPartners.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs bg-purple-50/30 rounded-2xl border border-purple-100 p-4">
              No introducing brokers registered yet.
            </div>
          ) : (
            paginatedPartners.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-purple-100/90 shadow-sm p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{p.email}</div>
                </div>
                {getTierBadge(p.tier)}
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Referral Code</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-slate-800 mt-0.5">
                    <span>{p.referralCode}</span>
                    <button type="button" onClick={() => handleCopy(p.referralCode)}>
                      <Copy className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Traders &amp; Sub-IBs</span>
                  <span className="font-bold text-slate-800">{p.activeClientsCount} Traders ({p.subIbCount} Sub-IBs)</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Volume</span>
                  <span className="font-mono font-bold text-purple-700">{p.totalVolumeLots.toLocaleString()} Lots</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Earned</span>
                  <span className="font-mono font-bold text-emerald-600">${p.totalCommissionEarned.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleImpersonatePartner(p)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 h-8.5 rounded-xl border border-emerald-200/80 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedPartner(p); setIsPartnerModalOpen(true); }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 h-8.5 rounded-xl border border-purple-200/80 bg-white hover:bg-purple-50 text-purple-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Details</span>
                </button>
              </div>
            </div>
          )))}
        </div>

        {/* Directory Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-purple-100/80 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{paginatedPartners.length}</span> of{' '}
            <span className="font-bold text-slate-800">{filteredPartners.length}</span> partners
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-xl border border-purple-200/80 bg-white hover:bg-purple-50 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={clsx(
                  "w-8 h-8 rounded-xl font-bold text-xs transition-all cursor-pointer",
                  currentPage === page
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-white border border-purple-100 text-slate-600 hover:bg-purple-50"
                )}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-xl border border-purple-200/80 bg-white hover:bg-purple-50 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 5. PARTNER DETAILS MODAL */}
      <Modal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        title={selectedPartner ? `Partner: ${selectedPartner.name}` : 'Partner Details'}
        subtitle={selectedPartner ? `Tier: ${selectedPartner.tier} • Code: ${selectedPartner.referralCode}` : ''}
        maxWidth="lg"
      >
        {selectedPartner && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-purple-100/60">
                <span className="text-slate-500 font-medium">Partner Identifier</span>
                <span className="font-mono font-bold text-purple-700">{selectedPartner.id}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-purple-100/60">
                <span className="text-slate-500 font-medium">Affiliate Name &amp; Email</span>
                <span className="font-bold text-slate-900">{selectedPartner.name} ({selectedPartner.email})</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-purple-100/60">
                <span className="text-slate-500 font-medium">Assigned Tier Level</span>
                <div>{getTierBadge(selectedPartner.tier)}</div>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-purple-100/60">
                <span className="text-slate-500 font-medium">Referral Link / Code</span>
                <span className="font-mono font-bold text-purple-900">{selectedPartner.referralCode}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-purple-100/60">
                <span className="text-slate-500 font-medium">Traders Referred</span>
                <span className="font-bold text-slate-800">{selectedPartner.activeClientsCount} Live Accounts</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-purple-100/60">
                <span className="text-slate-500 font-medium">Sub-IB Network</span>
                <span className="font-bold text-slate-800">{selectedPartner.subIbCount} Sub-Affiliates</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-purple-100/60">
                <span className="text-slate-500 font-medium">Total Volume Traded</span>
                <span className="font-mono font-bold text-purple-700">{selectedPartner.totalVolumeLots.toLocaleString()} Lots</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-purple-100/60">
                <span className="text-slate-500 font-medium">Lifetime Commission Earned</span>
                <span className="font-mono font-extrabold text-emerald-600 text-sm">${selectedPartner.totalCommissionEarned.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Withdrawable Wallet Balance</span>
                <span className="font-mono font-extrabold text-slate-900 text-sm">${selectedPartner.withdrawableCommission.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between items-center gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsPartnerModalOpen(false);
                  handleImpersonatePartner(selectedPartner);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-all active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login to Partner Portal</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPartnerModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Partner Modal */}
      <Modal
        isOpen={isAddPartnerOpen}
        onClose={() => setIsAddPartnerOpen(false)}
        title="Register New Introducing Broker"
        subtitle="Add a new affiliate partner to your rebate and commission tier network"
        maxWidth="md"
      >
        <form onSubmit={handleCreatePartner} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Partner Full Name *</label>
            <input
              type="text"
              required
              value={partnerForm.name}
              onChange={e => setPartnerForm({ ...partnerForm, name: e.target.value })}
              placeholder="e.g. John Doe or Prime Affiliates"
              className="w-full px-3.5 py-2.5 bg-white border border-purple-100 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Partner Email Address *</label>
            <input
              type="email"
              required
              value={partnerForm.email}
              onChange={e => setPartnerForm({ ...partnerForm, email: e.target.value })}
              placeholder="partner@example.com"
              className="w-full px-3.5 py-2.5 bg-white border border-purple-100 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-purple-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Commission Tier</label>
              <select
                value={partnerForm.tier}
                onChange={e => {
                  const t = e.target.value;
                  const defaultRates: Record<string, string> = { Gold: '8.0', Platinum: '10.0', Diamond: '12.0', VIP: '15.0' };
                  setPartnerForm({ ...partnerForm, tier: t, rebatePerLotUsd: defaultRates[t] || '8.0' });
                }}
                className="w-full px-3 py-2.5 bg-white border border-purple-100 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-purple-600 cursor-pointer"
              >
                <option value="Gold">Gold Tier</option>
                <option value="Platinum">Platinum Tier</option>
                <option value="Diamond">Diamond Tier</option>
                <option value="VIP">VIP Tier</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Rebate ($ / Lot)</label>
              <input
                type="number"
                step="0.5"
                required
                value={partnerForm.rebatePerLotUsd}
                onChange={e => setPartnerForm({ ...partnerForm, rebatePerLotUsd: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-purple-100 rounded-xl text-xs sm:text-sm font-mono font-bold text-purple-900 focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddPartnerOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingPartner}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
            >
              {isSubmittingPartner ? 'Registering...' : 'Register Partner'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
