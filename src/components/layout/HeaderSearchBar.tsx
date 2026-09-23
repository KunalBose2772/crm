'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShieldCheck,
  ReceiptText,
  GitFork,
  Settings,
  LayoutDashboard,
  PlusCircle,
  WalletCards,
  ArrowRight,
  CornerDownLeft,
  Sparkles,
  Command,
  ChevronRight,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { StatusBadge } from '@/components/ui/Badge';

export type SearchCategory = 'all' | 'pages' | 'clients' | 'finance' | 'kyc' | 'partners';

interface SearchResultItem {
  id: string;
  category: 'pages' | 'clients' | 'deposits' | 'withdrawals' | 'kyc' | 'transactions' | 'partners' | 'actions';
  categoryGroup: 'pages' | 'clients' | 'finance' | 'kyc' | 'partners';
  categoryLabel: string;
  title: string;
  subtitle: string;
  url: string;
  searchQuery?: string;
  badge?: {
    text: string;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral';
  };
  icon: React.ReactNode;
}

export const HeaderSearchBar: React.FC = () => {
  const router = useRouter();
  const {
    clients,
    kycRecords,
    deposits,
    withdrawals,
    transactions,
    ibPartners
  } = useCRM();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isMac, setIsMac] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsListRef = useRef<HTMLDivElement>(null);

  // Detect platform for keyboard shortcut display
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent;
      const platform = window.navigator.platform || '';
      setIsMac(/Mac|iPod|iPhone|iPad/i.test(platform) || /Macintosh/i.test(userAgent));
    }
  }, []);

  // Global shortcut (Ctrl+K or Cmd+K, or '/') to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in textarea or another input
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setIsMobileExpanded(true);
        setTimeout(() => inputRef.current?.focus(), 50);
        return;
      }

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        setIsOpen(true);
        setIsMobileExpanded(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsMobileExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation pages list
  const navPages = useMemo(() => [
    {
      title: 'Broker Dashboard',
      subtitle: 'Overview, liquidity & financial metrics',
      url: '/admin/dashboard',
      keywords: ['overview', 'metrics', 'stats', 'analytics', 'broker', 'dashboard', 'home'],
      icon: <LayoutDashboard className="w-4 h-4 text-purple-600" />
    },
    {
      title: 'Client Management',
      subtitle: 'Trader accounts, balances & leverage directory',
      url: '/admin/client-page',
      keywords: ['clients', 'users', 'accounts', 'traders', 'profiles', 'directory', 'customers'],
      icon: <Users className="w-4 h-4 text-blue-600" />
    },
    {
      title: 'KYC Document Verification',
      subtitle: 'Passports, National IDs & address compliance queue',
      url: '/admin/kyc-verification',
      keywords: ['kyc', 'compliance', 'documents', 'passport', 'id', 'verification', 'identity'],
      icon: <ShieldCheck className="w-4 h-4 text-amber-600" />
    },
    {
      title: 'Deposit Requests & Gateway',
      subtitle: 'Inbound USDT crypto hashes & wire approval queue',
      url: '/admin/deposits',
      keywords: ['deposits', 'funding', 'crypto', 'usdt', 'gateway', 'inbound', 'payment'],
      icon: <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
    },
    {
      title: 'Withdrawal Processing & Payouts',
      subtitle: 'Outbound treasury disbursements & bank payouts',
      url: '/admin/withdrawals',
      keywords: ['withdrawals', 'payouts', 'wire', 'usdt', 'outbound', 'cashout'],
      icon: <ArrowUpFromLine className="w-4 h-4 text-rose-600" />
    },
    {
      title: 'Manual Adjustments & Credit Bonus',
      subtitle: 'Post credit bonus, manual balance credits or corrections',
      url: '/admin/add-payments',
      keywords: ['bonus', 'credit', 'manual', 'adjustment', 'correction', 'payment'],
      icon: <PlusCircle className="w-4 h-4 text-purple-600" />
    },
    {
      title: 'Financial Ledger & Transactions',
      subtitle: 'Complete financial history, journal audit & receipts',
      url: '/admin/Admin-transaction-page',
      keywords: ['transactions', 'ledger', 'history', 'statement', 'audit', 'journal'],
      icon: <ReceiptText className="w-4 h-4 text-indigo-600" />
    },
    {
      title: 'IB Rebates & Tiers Configuration',
      subtitle: 'Introducing Broker tiered structures & rebate rules',
      url: '/admin/IB-Configuration',
      keywords: ['ib', 'partners', 'rebates', 'tiers', 'referrals', 'commission'],
      icon: <GitFork className="w-4 h-4 text-cyan-600" />
    },
    {
      title: 'IB Commission Withdrawals',
      subtitle: 'Partner commission settlement & withdrawal requests',
      url: '/admin/IB-Withdrawals',
      keywords: ['ib withdrawals', 'partner payouts', 'commission settlement'],
      icon: <WalletCards className="w-4 h-4 text-purple-600" />
    },
    {
      title: 'System & Broker Configuration',
      subtitle: 'Broker parameters, security, API keys & branding',
      url: '/admin/settings',
      keywords: ['settings', 'config', 'broker', 'security', 'preferences', 'api', 'system'],
      icon: <Settings className="w-4 h-4 text-slate-600" />
    }
  ], []);

  // Quick Action items shown when input is empty
  const quickActions: SearchResultItem[] = useMemo(() => [
    {
      id: 'act-add-payment',
      category: 'actions',
      categoryGroup: 'finance',
      categoryLabel: 'Quick Action',
      title: 'Add Manual Payment or Credit Bonus',
      subtitle: 'Credit or adjust trader account balance instantly',
      url: '/admin/add-payments',
      icon: <PlusCircle className="w-4 h-4 text-purple-600" />
    },
    {
      id: 'act-review-kyc',
      category: 'actions',
      categoryGroup: 'kyc',
      categoryLabel: 'Quick Action',
      title: 'Review Pending KYC Documents',
      subtitle: `${kycRecords.filter(k => k.status === 'pending').length} document submissions awaiting review`,
      url: '/admin/kyc-verification?search=pending',
      searchQuery: 'pending',
      badge: {
        text: `${kycRecords.filter(k => k.status === 'pending').length} Pending`,
        variant: 'warning'
      },
      icon: <ShieldCheck className="w-4 h-4 text-amber-600" />
    },
    {
      id: 'act-review-deposits',
      category: 'actions',
      categoryGroup: 'finance',
      categoryLabel: 'Quick Action',
      title: 'Review Pending Inbound Deposits',
      subtitle: `${deposits.filter(d => d.status === 'pending').length} crypto and wire deposits awaiting approval`,
      url: '/admin/deposits?search=pending',
      searchQuery: 'pending',
      badge: {
        text: `${deposits.filter(d => d.status === 'pending').length} Pending`,
        variant: 'info'
      },
      icon: <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
    },
    {
      id: 'act-review-withdrawals',
      category: 'actions',
      categoryGroup: 'finance',
      categoryLabel: 'Quick Action',
      title: 'Review Pending Outbound Withdrawals',
      subtitle: `${withdrawals.filter(w => w.status === 'pending').length} client payout requests awaiting treasury action`,
      url: '/admin/withdrawals?search=pending',
      searchQuery: 'pending',
      badge: {
        text: `${withdrawals.filter(w => w.status === 'pending').length} Pending`,
        variant: 'danger'
      },
      icon: <ArrowUpFromLine className="w-4 h-4 text-rose-600" />
    }
  ], [kycRecords, deposits, withdrawals]);

  // Real-time multi-category search results
  const searchResults = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];

    const results: SearchResultItem[] = [];

    // 1. Pages & Tools
    navPages.forEach((page, i) => {
      const match =
        page.title.toLowerCase().includes(term) ||
        page.subtitle.toLowerCase().includes(term) ||
        page.url.toLowerCase().includes(term) ||
        page.keywords.some(k => k.toLowerCase().includes(term));

      if (match) {
        results.push({
          id: `page-${i}`,
          category: 'pages',
          categoryGroup: 'pages',
          categoryLabel: 'Page',
          title: page.title,
          subtitle: page.subtitle,
          url: page.url,
          icon: page.icon
        });
      }
    });

    // 2. Clients
    clients.forEach(client => {
      const matchName = client.name.toLowerCase().includes(term);
      const matchEmail = client.email.toLowerCase().includes(term);
      const matchCountry = client.country.toLowerCase().includes(term);
      const matchPhone = client.phone.toLowerCase().includes(term);
      const matchId = client.id.toLowerCase().includes(term);
      const matchAccount = client.accounts?.some(acc => acc.login.toString().includes(term));

      if (matchName || matchEmail || matchCountry || matchPhone || matchId || matchAccount) {
        const primaryAcc = client.accounts?.[0];
        results.push({
          id: `client-${client.id}`,
          category: 'clients',
          categoryGroup: 'clients',
          categoryLabel: 'Client',
          title: client.name,
          subtitle: `${client.email} • ${client.country} • MT5 #${primaryAcc ? primaryAcc.login : 'N/A'}`,
          url: `/admin/client-page?search=${encodeURIComponent(client.name)}`,
          searchQuery: client.name,
          badge: {
            text: client.status.toUpperCase(),
            variant: client.status === 'verified' ? 'success' : client.status === 'pending' ? 'warning' : 'neutral'
          },
          icon: <Users className="w-4 h-4 text-purple-600" />
        });
      }
    });

    // 3. Deposits
    deposits.forEach(deposit => {
      const matchId = deposit.id.toLowerCase().includes(term);
      const matchClient = deposit.clientName.toLowerCase().includes(term);
      const matchAccount = deposit.accountLogin.toString().includes(term);
      const matchTx = deposit.txHash?.toLowerCase().includes(term);
      const matchMethod = deposit.paymentMethod.toLowerCase().includes(term);
      const matchAmount = deposit.amount.toString().includes(term);

      if (matchId || matchClient || matchAccount || matchTx || matchMethod || matchAmount) {
        results.push({
          id: `deposit-${deposit.id}`,
          category: 'deposits',
          categoryGroup: 'finance',
          categoryLabel: 'Deposit',
          title: `${deposit.id} • ${deposit.amount.toLocaleString()} ${deposit.currency}`,
          subtitle: `${deposit.clientName} • Account #${deposit.accountLogin} • ${deposit.paymentMethod.replace('_', ' ')}`,
          url: `/admin/deposits?search=${encodeURIComponent(deposit.id)}`,
          searchQuery: deposit.id,
          badge: {
            text: deposit.status.toUpperCase(),
            variant: deposit.status === 'completed' ? 'success' : deposit.status === 'pending' ? 'warning' : 'danger'
          },
          icon: <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
        });
      }
    });

    // 4. Withdrawals
    withdrawals.forEach(withdrawal => {
      const matchId = withdrawal.id.toLowerCase().includes(term);
      const matchClient = withdrawal.clientName.toLowerCase().includes(term);
      const matchAccount = withdrawal.accountLogin.toString().includes(term);
      const matchDest = withdrawal.destinationType.toLowerCase().includes(term);
      const matchAmount = withdrawal.requestedAmount.toString().includes(term);

      if (matchId || matchClient || matchAccount || matchDest || matchAmount) {
        results.push({
          id: `withdrawal-${withdrawal.id}`,
          category: 'withdrawals',
          categoryGroup: 'finance',
          categoryLabel: 'Withdrawal',
          title: `${withdrawal.id} • ${withdrawal.requestedAmount.toLocaleString()} ${withdrawal.currency}`,
          subtitle: `${withdrawal.clientName} • Account #${withdrawal.accountLogin} • ${withdrawal.destinationType.replace('_', ' ')}`,
          url: `/admin/withdrawals?search=${encodeURIComponent(withdrawal.id)}`,
          searchQuery: withdrawal.id,
          badge: {
            text: withdrawal.status.toUpperCase(),
            variant: withdrawal.status === 'completed' ? 'success' : withdrawal.status === 'pending' ? 'warning' : 'danger'
          },
          icon: <ArrowUpFromLine className="w-4 h-4 text-rose-600" />
        });
      }
    });

    // 5. KYC Records
    kycRecords.forEach(kyc => {
      const matchClient = kyc.clientName.toLowerCase().includes(term);
      const matchDocType = kyc.documentType.toLowerCase().includes(term);
      const matchDocNum = kyc.documentNumber.toLowerCase().includes(term);
      const matchCountry = kyc.country.toLowerCase().includes(term);

      if (matchClient || matchDocType || matchDocNum || matchCountry) {
        results.push({
          id: `kyc-${kyc.id}`,
          category: 'kyc',
          categoryGroup: 'kyc',
          categoryLabel: 'KYC Document',
          title: `KYC: ${kyc.clientName}`,
          subtitle: `${kyc.documentType.replace(/_/g, ' ')} #${kyc.documentNumber} • ${kyc.country}`,
          url: `/admin/kyc-verification?search=${encodeURIComponent(kyc.clientName)}`,
          searchQuery: kyc.clientName,
          badge: {
            text: kyc.status.toUpperCase(),
            variant: kyc.status === 'verified' ? 'success' : kyc.status === 'pending' ? 'warning' : 'danger'
          },
          icon: <ShieldCheck className="w-4 h-4 text-amber-600" />
        });
      }
    });

    // 6. Transactions
    transactions.forEach(tx => {
      const matchId = tx.id.toLowerCase().includes(term);
      const matchRef = tx.referenceId.toLowerCase().includes(term);
      const matchClient = tx.clientName.toLowerCase().includes(term);
      const matchType = tx.type.toLowerCase().includes(term);
      const matchMethod = tx.method.toLowerCase().includes(term);

      if (matchId || matchRef || matchClient || matchType || matchMethod) {
        results.push({
          id: `tx-${tx.id}`,
          category: 'transactions',
          categoryGroup: 'finance',
          categoryLabel: 'Transaction',
          title: `${tx.id} (${tx.type.replace(/_/g, ' ')}) • $${tx.amount.toLocaleString()}`,
          subtitle: `${tx.clientName} • ${tx.method} • Ref: ${tx.referenceId}`,
          url: `/admin/Admin-transaction-page?search=${encodeURIComponent(tx.id)}`,
          searchQuery: tx.id,
          badge: {
            text: tx.status.toUpperCase(),
            variant: tx.status === 'completed' ? 'success' : tx.status === 'pending' ? 'warning' : 'danger'
          },
          icon: <ReceiptText className="w-4 h-4 text-indigo-600" />
        });
      }
    });

    // 7. IB Partners
    ibPartners.forEach(partner => {
      const matchName = partner.name.toLowerCase().includes(term);
      const matchEmail = partner.email.toLowerCase().includes(term);
      const matchCode = partner.referralCode.toLowerCase().includes(term);
      const matchTier = partner.tier.toLowerCase().includes(term);

      if (matchName || matchEmail || matchCode || matchTier) {
        results.push({
          id: `ib-${partner.id}`,
          category: 'partners',
          categoryGroup: 'partners',
          categoryLabel: 'IB Partner',
          title: `Partner: ${partner.name}`,
          subtitle: `Code: ${partner.referralCode} • ${partner.tier} Tier • ${partner.activeClientsCount} Clients`,
          url: `/admin/IB-Configuration?search=${encodeURIComponent(partner.name)}`,
          searchQuery: partner.name,
          badge: {
            text: `${partner.tier.toUpperCase()}`,
            variant: 'purple'
          },
          icon: <GitFork className="w-4 h-4 text-cyan-600" />
        });
      }
    });

    return results;
  }, [query, navPages, clients, deposits, withdrawals, kycRecords, transactions, ibPartners]);

  // Filtered by selected category pill
  const filteredResults = useMemo(() => {
    if (activeCategory === 'all') return searchResults;
    return searchResults.filter(item => item.categoryGroup === activeCategory);
  }, [searchResults, activeCategory]);

  // Grouped results for clear visual separation
  const groupedResults = useMemo(() => {
    if (!query.trim()) {
      return {
        quickActions: quickActions,
        pages: navPages.slice(0, 5).map((p, idx) => ({
          id: `nav-${idx}`,
          category: 'pages' as const,
          categoryGroup: 'pages' as const,
          categoryLabel: 'Navigation',
          title: p.title,
          subtitle: p.subtitle,
          url: p.url,
          icon: p.icon
        }))
      };
    }

    const groups: Record<string, SearchResultItem[]> = {};
    filteredResults.forEach(item => {
      const label = item.categoryLabel;
      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
    });
    return groups;
  }, [query, filteredResults, quickActions, navPages]);

  // Flattened active list for keyboard navigation
  const flatList: SearchResultItem[] = useMemo(() => {
    if (!query.trim()) {
      return [...quickActions, ...navPages.slice(0, 5).map((p, idx) => ({
        id: `nav-${idx}`,
        category: 'pages' as const,
        categoryGroup: 'pages' as const,
        categoryLabel: 'Navigation',
        title: p.title,
        subtitle: p.subtitle,
        url: p.url,
        icon: p.icon
      }))];
    }
    return filteredResults;
  }, [query, filteredResults, quickActions, navPages]);

  // Reset highlight index when results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [query, activeCategory]);

  // Scroll active item into view
  useEffect(() => {
    if (resultsListRef.current) {
      const activeEl = resultsListRef.current.querySelector('[data-highlighted="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  // Handle result selection
  const handleSelectResult = useCallback((item: SearchResultItem) => {
    setIsOpen(false);
    setIsMobileExpanded(false);
    setQuery('');

    // Trigger URL navigation
    router.push(item.url);

    // If item carries a search query for table filtering, dispatch event so active DataTable picks it up instantly
    if (item.searchQuery && typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('crm-table-search', { detail: item.searchQuery }));
      }, 50);
    }
  }, [router]);

  // Keyboard controls inside input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      setHighlightedIndex(prev => (prev + 1) % Math.max(flatList.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      setHighlightedIndex(prev => (prev - 1 + Math.max(flatList.length, 1)) % Math.max(flatList.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatList.length > 0 && flatList[highlightedIndex]) {
        handleSelectResult(flatList[highlightedIndex]);
      } else if (query.trim()) {
        // Fallback: search in client directory
        router.push(`/admin/client-page?search=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
        setIsMobileExpanded(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setIsMobileExpanded(false);
      inputRef.current?.blur();
    }
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = {
      all: searchResults.length,
      pages: searchResults.filter(i => i.categoryGroup === 'pages').length,
      clients: searchResults.filter(i => i.categoryGroup === 'clients').length,
      finance: searchResults.filter(i => i.categoryGroup === 'finance').length,
      kyc: searchResults.filter(i => i.categoryGroup === 'kyc').length,
      partners: searchResults.filter(i => i.categoryGroup === 'partners').length,
    };
    return counts;
  }, [searchResults]);

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs z-40 sm:hidden animate-in fade-in duration-100"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Search Input Container */}
      <div className="relative flex items-center w-full">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          title={`Search CRM (${isMac ? '⌘K' : 'Ctrl+K'})`}
          placeholder="Search CRM..."
          className="w-full h-10 pl-4 pr-16 sm:pr-20 rounded-full border border-slate-200/90 bg-slate-50/70 hover:bg-white hover:border-purple-300 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 transition-all shadow-2xs"
        />

        {/* Right side controls: Clear (X) and Butter Purple Search Button */}
        <div className="absolute right-1 sm:right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-1.5">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Butter Purple Search Button */}
          <button
            type="button"
            onClick={() => {
              if (!isOpen) {
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 50);
              } else if (query.trim() && flatList.length > 0) {
                handleSelectResult(flatList[highlightedIndex] || flatList[0]);
              } else {
                setIsOpen(false);
              }
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white flex items-center justify-center transition-all shadow-sm shadow-purple-600/30 cursor-pointer shrink-0 group/btn"
            title={`Search CRM (${isMac ? '⌘K' : 'Ctrl+K'})`}
          >
            <Search className="w-3.5 h-3.5 text-white group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Results Dropdown Popover */}
      {isOpen && (
        <div className="no-scrollbar fixed inset-x-2.5 top-14 sm:top-full sm:absolute sm:inset-x-auto sm:left-0 sm:right-0 md:left-1/2 md:-translate-x-1/2 sm:mt-2 w-auto sm:w-full md:w-[600px] lg:w-[640px] max-w-[calc(100vw-20px)] sm:max-w-none bg-white/98 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-[82vh] sm:max-h-[500px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Mobile Full-Width Search Input */}
          <div className="p-2.5 border-b border-slate-100 bg-white sm:hidden flex items-center gap-2">
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search clients, deposits, KYC, ledger..."
                autoFocus
                className="w-full h-9 pl-3.5 pr-16 rounded-full border border-purple-200 bg-purple-50/40 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (query.trim() && flatList.length > 0) {
                      handleSelectResult(flatList[highlightedIndex] || flatList[0]);
                    }
                  }}
                  className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
                >
                  <Search className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer shrink-0"
            >
              Close
            </button>
          </div>
          {/* Header Bar with Category Filters */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/60 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5 font-heading">
                {query.trim() ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Search Results for &ldquo;{query}&rdquo;</span>
                  </>
                ) : (
                  <>
                    <Command className="w-3.5 h-3.5 text-purple-600" />
                    <span>Quick Navigation & Actions</span>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 font-sans font-normal ml-1.5">
                      (Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-purple-700 font-mono text-[10px] font-semibold">{isMac ? '⌘K' : 'Ctrl+K'}</kbd> anytime)
                    </span>
                  </>
                )}
              </span>
              <span className="text-[11px] font-medium text-slate-500 font-sans">
                {query.trim() ? `${searchResults.length} matches` : 'Ready'}
              </span>
            </div>

            {/* Filter Pills when query is typed */}
            {query.trim().length > 0 && searchResults.length > 0 && (
              <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-1 text-[11px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-2.5 py-0.5 rounded-full font-medium transition-colors cursor-pointer shrink-0 ${activeCategory === 'all'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  All ({categoryCounts.all})
                </button>
                {categoryCounts.clients > 0 && (
                  <button
                    onClick={() => setActiveCategory('clients')}
                    className={`px-2.5 py-0.5 rounded-full font-medium transition-colors cursor-pointer shrink-0 ${activeCategory === 'clients'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    Clients ({categoryCounts.clients})
                  </button>
                )}
                {categoryCounts.finance > 0 && (
                  <button
                    onClick={() => setActiveCategory('finance')}
                    className={`px-2.5 py-0.5 rounded-full font-medium transition-colors cursor-pointer shrink-0 ${activeCategory === 'finance'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    Finance ({categoryCounts.finance})
                  </button>
                )}
                {categoryCounts.kyc > 0 && (
                  <button
                    onClick={() => setActiveCategory('kyc')}
                    className={`px-2.5 py-0.5 rounded-full font-medium transition-colors cursor-pointer shrink-0 ${activeCategory === 'kyc'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    KYC ({categoryCounts.kyc})
                  </button>
                )}
                {categoryCounts.pages > 0 && (
                  <button
                    onClick={() => setActiveCategory('pages')}
                    className={`px-2.5 py-0.5 rounded-full font-medium transition-colors cursor-pointer shrink-0 ${activeCategory === 'pages'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    Pages ({categoryCounts.pages})
                  </button>
                )}
                {categoryCounts.partners > 0 && (
                  <button
                    onClick={() => setActiveCategory('partners')}
                    className={`px-2.5 py-0.5 rounded-full font-medium transition-colors cursor-pointer shrink-0 ${activeCategory === 'partners'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    Partners ({categoryCounts.partners})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Scrollable Results List */}
          <div ref={resultsListRef} className="no-scrollbar overflow-y-auto p-2 divide-y divide-slate-100 max-h-[360px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* Empty state: No query typed */}
            {!query.trim() && (
              <div className="space-y-4 py-1">
                {/* Quick Actions */}
                <div>
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-heading">
                    Quick Operational Actions
                  </div>
                  <div className="space-y-1">
                    {quickActions.map((action, idx) => {
                      const isHighlighted = highlightedIndex === idx;
                      return (
                        <div
                          key={action.id}
                          data-highlighted={isHighlighted}
                          onClick={() => handleSelectResult(action)}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${isHighlighted
                            ? 'bg-purple-50 text-purple-900 shadow-2xs'
                            : 'hover:bg-slate-50 text-slate-700'
                            }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0">
                              {action.icon}
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-semibold truncate font-sans">{action.title}</p>
                              <p className="text-[11px] text-slate-400 truncate">{action.subtitle}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {action.badge && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-700">
                                {action.badge.text}
                              </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Popular Pages */}
                <div>
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-heading">
                    Frequent Destinations
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {navPages.slice(0, 6).map((page, idx) => {
                      const totalIdx = quickActions.length + idx;
                      const isHighlighted = highlightedIndex === totalIdx;
                      return (
                        <div
                          key={page.url}
                          data-highlighted={isHighlighted}
                          onClick={() => handleSelectResult({
                            id: `page-freq-${idx}`,
                            category: 'pages',
                            categoryGroup: 'pages',
                            categoryLabel: 'Navigation',
                            title: page.title,
                            subtitle: page.subtitle,
                            url: page.url,
                            icon: page.icon
                          })}
                          onMouseEnter={() => setHighlightedIndex(totalIdx)}
                          className={`p-2 rounded-xl flex items-center gap-2.5 cursor-pointer transition-all ${isHighlighted
                            ? 'bg-purple-50 text-purple-900 shadow-2xs'
                            : 'hover:bg-slate-50 text-slate-700'
                            }`}
                        >
                          <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0">
                            {page.icon}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-medium truncate font-sans">{page.title}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Empty state: Query typed but no matches */}
            {query.trim() && filteredResults.length === 0 && (
              <div className="py-8 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="text-xs font-bold text-slate-800 font-heading">No matching results found</h3>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto font-sans">
                  We couldn&apos;t find anything matching &ldquo;<span className="text-purple-600 font-semibold">{query}</span>&rdquo;.
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
                  <button
                    onClick={() => {
                      router.push(`/admin/client-page?search=${encodeURIComponent(query)}`);
                      setIsOpen(false);
                    }}
                    className="text-[11px] px-3 py-1 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium transition-colors cursor-pointer border border-purple-200/60"
                  >
                    Search in Clients
                  </button>
                  <button
                    onClick={() => {
                      router.push(`/admin/deposits?search=${encodeURIComponent(query)}`);
                      setIsOpen(false);
                    }}
                    className="text-[11px] px-3 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-colors cursor-pointer border border-slate-200"
                  >
                    Search Deposits
                  </button>
                  <button
                    onClick={() => {
                      router.push(`/admin/Admin-transaction-page?search=${encodeURIComponent(query)}`);
                      setIsOpen(false);
                    }}
                    className="text-[11px] px-3 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-colors cursor-pointer border border-slate-200"
                  >
                    Search Ledger
                  </button>
                </div>
              </div>
            )}

            {/* Results: Query typed and matches found */}
            {query.trim() && filteredResults.length > 0 && (
              <div className="space-y-1 py-1">
                {filteredResults.map((item, idx) => {
                  const isHighlighted = highlightedIndex === idx;
                  return (
                    <div
                      key={item.id}
                      data-highlighted={isHighlighted}
                      onClick={() => handleSelectResult(item)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${isHighlighted
                        ? 'bg-purple-50/90 text-purple-950 border-l-3 border-purple-600 shadow-2xs'
                        : 'hover:bg-slate-50 text-slate-700'
                        }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0">
                          {item.icon}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-slate-900 truncate font-sans">
                              {item.title}
                            </p>
                            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-heading">
                              {item.categoryLabel}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        {item.badge && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.badge.variant === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' :
                            item.badge.variant === 'warning' ? 'bg-amber-50 text-amber-800 border border-amber-200/60' :
                              item.badge.variant === 'danger' ? 'bg-rose-50 text-rose-700 border border-rose-200/60' :
                                'bg-purple-50 text-purple-700 border border-purple-200/60'
                            }`}>
                            {item.badge.text}
                          </span>
                        )}
                        <CornerDownLeft className={`w-3.5 h-3.5 transition-opacity ${isHighlighted ? 'opacity-100 text-purple-600' : 'opacity-0'
                          }`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Guide */}
          <div className="px-3 py-2 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <div className="hidden sm:flex items-center gap-3">
              <span className="flex items-center gap-1 font-sans text-[11px] text-slate-500">
                <span>Shortcut:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-purple-700 font-mono font-semibold text-[10px] shadow-2xs">
                  {isMac ? '⌘K' : 'Ctrl+K'}
                </kbd>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-semibold shadow-2xs">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-semibold shadow-2xs">↓</kbd>
                <span className="text-slate-500">navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-semibold shadow-2xs">↵</kbd>
                <span className="text-slate-500">select</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-semibold shadow-2xs">esc</kbd>
                <span className="text-slate-500">close</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-sans sm:hidden">
              Tap any result to jump to record
            </span>
            <span className="text-[10px] text-purple-600 font-sans font-medium hidden sm:inline">
              Instant Global CRM Search
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
