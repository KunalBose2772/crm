'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Client, 
  KYCRecord, 
  DepositRequest, 
  WithdrawalRequest, 
  Transaction, 
  IBPartner, 
  IBWithdrawalRequest, 
  IBTierConfig, 
  DashboardStats,
  TradingAccount 
} from '@/types/crm';
import { 
  initialClients, 
  initialKYCRecords, 
  initialDeposits, 
  initialWithdrawals, 
  initialTransactions, 
  initialIBPartners, 
  initialIBWithdrawals, 
  initialIBTiers, 
  initialStats 
} from '@/services/api/mockData';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export interface AdminUser {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface ImpersonationState {
  isActive: boolean;
  client?: Client;
}

interface CRMContextType {
  // Authentication
  isAuthenticated: boolean;
  authLoading: boolean;
  adminUser: AdminUser | null;
  clientUser: Client | null;
  login: (email: string, password: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  clientLogin: (email: string, password: string) => Promise<{ success: boolean; client?: Client; error?: string }>;
  logout: () => void;

  clients: Client[];
  kycRecords: KYCRecord[];
  deposits: DepositRequest[];
  withdrawals: WithdrawalRequest[];
  transactions: Transaction[];
  ibPartners: IBPartner[];
  ibWithdrawals: IBWithdrawalRequest[];
  ibTiers: IBTierConfig[];
  stats: DashboardStats;
  toasts: Toast[];
  impersonation: ImpersonationState;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  
  // Actions
  showToast: (type: Toast['type'], title: string, message?: string) => void;
  dismissToast: (id: string) => void;
  startImpersonation: (client: Client) => void;
  stopImpersonation: () => void;
  
  // KYC actions
  approveKYC: (id: string, comment?: string) => Promise<void> | void;
  rejectKYC: (id: string, reason: string) => void;
  submitKycRecord: (record: KYCRecord) => void;
  
  // Deposit actions
  approveDeposit: (id: string) => Promise<void> | void;
  rejectDeposit: (id: string, reason: string) => void;
  createDepositRequest: (data: Partial<DepositRequest>) => void;
  
  // Withdrawal actions
  approveWithdrawal: (id: string) => Promise<void> | void;
  rejectWithdrawal: (id: string, reason: string) => void;
  processWithdrawal: (id: string) => void;
  createWithdrawalRequest: (data: Partial<WithdrawalRequest>) => void;
  
  // MT5 Live Sync
  syncAccountBalance: (login: number) => Promise<{ balance: number; equity: number; freeMargin: number } | null>;
  
  // Payment actions
  addManualPayment: (data: {
    clientId: string;
    accountLogin: number;
    amount: number;
    type: 'deposit' | 'credit_bonus' | 'debit_correction';
    currency: string;
    description: string;
  }) => void;
  
  // Client actions
  updateClientStatus: (clientId: string, status: Client['status']) => void;
  addClient: (clientData: Partial<Client>) => Promise<{ success: boolean; client?: Client; error?: string }>;
  
  // IB actions
  updateIBTiers: (tiers: IBTierConfig[]) => void;
  approveIBWithdrawal: (id: string) => void;
  rejectIBWithdrawal: (id: string) => void;

  // Client modal actions (for Open Account, Deposit, Withdraw, KYC)
  clientModal: 'open-account' | 'deposit' | 'withdrawal' | 'kyc' | null;
  openClientModal: (modal: 'open-account' | 'deposit' | 'withdrawal' | 'kyc') => void;
  closeClientModal: () => void;

  // Trading Account actions
  addTradingAccount: (account: TradingAccount) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [kycRecords, setKycRecords] = useState<KYCRecord[]>(initialKYCRecords);
  const [deposits, setDeposits] = useState<DepositRequest[]>(initialDeposits);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(initialWithdrawals);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [ibPartners, setIbPartners] = useState<IBPartner[]>(initialIBPartners);
  const [ibWithdrawals, setIbWithdrawals] = useState<IBWithdrawalRequest[]>(initialIBWithdrawals);
  const [ibTiers, setIbTiers] = useState<IBTierConfig[]>(initialIBTiers);
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [impersonation, setImpersonation] = useState<ImpersonationState>({ isActive: false });
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [clientModal, setClientModal] = useState<'open-account' | 'deposit' | 'withdrawal' | 'kyc' | null>(null);

  const openClientModal = (modal: 'open-account' | 'deposit' | 'withdrawal' | 'kyc') => setClientModal(modal);
  const closeClientModal = () => setClientModal(null);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [clientUser, setClientUser] = useState<Client | null>(null);

  // Check stored session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nd1_crm_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          setIsAuthenticated(true);
          setAdminUser(parsed);
        }
      }

      const storedClient = localStorage.getItem('nd1_crm_client_auth');
      if (storedClient) {
        const parsedClient = JSON.parse(storedClient);
        if (parsedClient && parsedClient.email) {
          setClientUser(parsedClient);
        }
      }

      const storedImp = localStorage.getItem('nd1_crm_impersonation');
      if (storedImp) {
        const parsedImp = JSON.parse(storedImp);
        if (parsedImp && parsedImp.client) {
          setImpersonation(parsedImp);
        }
      }
    } catch {
      // ignore
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const HARDCODED_ACCOUNTS = [
    {
      email: 'admintest@gmail.com',
      pass: 'Test123',
      name: 'Administrator',
      role: 'admin',
      avatar: 'AD',
    },
    {
      email: 'superadmin@nd1crm.com',
      pass: 'SuperAdmin2026!',
      name: 'Master SuperAdmin',
      role: 'superadmin',
      avatar: 'SA',
    },
    {
      email: 'telecaller@nd1crm.com',
      pass: 'SalesDesk123!',
      name: 'Senior Telecaller',
      role: 'telecaller',
      avatar: 'TC',
    },
    {
      email: 'partner@nd1crm.com',
      pass: 'PartnerPass123!',
      name: 'VIP IB Partner',
      role: 'partner',
      avatar: 'IB',
    },
  ];

  const login = async (
    emailInput: string,
    passwordInput: string,
    role = 'admin'
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = (emailInput || '').trim().toLowerCase();
    const cleanPassword = (passwordInput || '').trim();

    // Check credentials against hardcoded accounts
    const match = HARDCODED_ACCOUNTS.find(
      acc => acc.email.toLowerCase() === cleanEmail && acc.pass === cleanPassword
    );

    if (match) {
      const user: AdminUser = {
        name: match.name,
        email: match.email,
        role: match.role || role || 'admin',
        avatar: match.avatar,
      };
      try {
        localStorage.setItem('nd1_crm_auth', JSON.stringify(user));
      } catch {
        // ignore
      }
      setIsAuthenticated(true);
      setAdminUser(user);
      showToast('success', 'Authentication Successful', `Welcome, ${user.name}`);
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid credentials. Please verify your email and password.',
    };
  };

  const clientLogin = async (
    emailInput: string,
    passwordInput: string
  ): Promise<{ success: boolean; client?: Client; error?: string }> => {
    try {
      const res = await fetch('/api/auth/client/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });
      const data = await res.json();
      if (data.success && data.client) {
        setClientUser(data.client);
        try {
          localStorage.setItem('nd1_crm_client_auth', JSON.stringify(data.client));
        } catch {
          // ignore
        }
        showToast('success', 'Authentication Successful', `Welcome back, ${data.client.name}`);
        return { success: true, client: data.client };
      }
      return { success: false, error: data.error || 'Invalid credentials. Please verify your email and password.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'An unexpected error occurred. Please try again.' };
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('nd1_crm_auth');
      localStorage.removeItem('nd1_crm_client_auth');
      localStorage.removeItem('nd1_crm_impersonation');
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setAdminUser(null);
    setClientUser(null);
    setImpersonation({ isActive: false });
    showToast('info', 'Signed Out', 'You have been successfully signed out.');
  };

  // Ensure dark class is removed on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
      try {
        localStorage.removeItem('crm_theme');
      } catch {
        // ignore
      }
    }
  }, []);

  // Fetch live clients, trading accounts, transactions, KYC records, deposits, withdrawals, and IB data from Supabase
  const fetchLiveData = React.useCallback(async () => {
    try {
      const [clientsRes, txRes, kycRes, depositsRes, withdrawalsRes, ibPartnersRes, ibTiersRes] = await Promise.all([
        fetch('/api/clients').catch(() => null),
        fetch('/api/transactions').catch(() => null),
        fetch('/api/kyc').catch(() => null),
        fetch('/api/deposits').catch(() => null),
        fetch('/api/withdrawals').catch(() => null),
        fetch('/api/ib/partners').catch(() => null),
        fetch('/api/ib/tiers').catch(() => null),
      ]);

      if (ibPartnersRes && ibPartnersRes.ok) {
        const pData = await ibPartnersRes.json();
        if (pData.success && Array.isArray(pData.partners) && pData.partners.length > 0) {
          setIbPartners(pData.partners);
        }
      }

      if (ibTiersRes && ibTiersRes.ok) {
        const tData = await ibTiersRes.json();
        if (tData.success && Array.isArray(tData.tiers) && tData.tiers.length > 0) {
          setIbTiers(tData.tiers);
        }
      }

      if (withdrawalsRes && withdrawalsRes.ok) {
        const wdrData = await withdrawalsRes.json();
        if (wdrData.success && Array.isArray(wdrData.withdrawals)) {
          setWithdrawals(wdrData.withdrawals);
        }
      }

      if (depositsRes && depositsRes.ok) {
        const depData = await depositsRes.json();
        if (depData.success && Array.isArray(depData.deposits)) {
          setDeposits(depData.deposits);
        }
      }

      if (clientsRes && clientsRes.ok) {
        const clientData = await clientsRes.json();
        if (clientData.success && Array.isArray(clientData.clients)) {
          setClients(clientData.clients);

          // Update active impersonation if client is currently being viewed
          setImpersonation(prev => {
            if (prev.isActive && prev.client) {
              const matched = clientData.clients.find((c: Client) => c.id === prev.client?.id || c.email === prev.client?.email);
              if (matched) {
                const updated = { isActive: true, client: matched };
                try {
                  localStorage.setItem('nd1_crm_impersonation', JSON.stringify(updated));
                } catch {}
                return updated;
              }
            }
            return prev;
          });

          // Update logged in clientUser if active
          setClientUser(prev => {
            if (prev) {
              const matched = clientData.clients.find((c: Client) => c.id === prev.id || c.email === prev.email);
              if (matched) {
                try {
                  localStorage.setItem('nd1_crm_client_auth', JSON.stringify(matched));
                } catch {}
                return matched;
              }
            }
            return prev;
          });
        }
      }

      if (txRes && txRes.ok) {
        const txData = await txRes.json();
        if (txData.success && Array.isArray(txData.transactions)) {
          setTransactions(txData.transactions);
        }
      }

      if (kycRes && kycRes.ok) {
        const kycData = await kycRes.json();
        if (kycData.success && Array.isArray(kycData.records)) {
          let combined = [...kycData.records];
          try {
            if (typeof window !== 'undefined') {
              const storedLocal = JSON.parse(localStorage.getItem('nd1_crm_submitted_kyc') || '{}');
              
              // Clean up any local storage overrides for records that are now verified
              for (const liveRecord of kycData.records) {
                if (liveRecord.status === 'verified') {
                  delete storedLocal[liveRecord.clientId];
                  delete storedLocal[liveRecord.clientEmail];
                }
              }
              localStorage.setItem('nd1_crm_submitted_kyc', JSON.stringify(storedLocal));

              const localList = Object.values(storedLocal) as KYCRecord[];
              for (const loc of localList) {
                if (!combined.some(r => r.clientId === loc.clientId || r.clientEmail === loc.clientEmail)) {
                  combined.unshift(loc);
                }
              }
            }
          } catch {
            // ignore
          }
          setKycRecords(combined);
        }
      }
    } catch (err) {
      console.warn('[CRMContext] Supabase live fetch error:', err);
    }
  }, []);

  // Multi-tab synchronization and event-driven updates (NO rapid interval polling)
  useEffect(() => {
    // 1. Initial live fetch on mount
    fetchLiveData();

    // 2. Revalidate only when user switches back to this window/tab after being away
    const handleFocus = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchLiveData();
      }
    };
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchLiveData();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. Cross-tab BroadcastChannel listener (zero-delay instant sync across browser tabs)
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('crm_events');
      bc.onmessage = (event) => {
        if (
          event.data?.type === 'KYC_STATUS_CHANGED' || 
          event.data?.type === 'KYC_SUBMITTED' ||
          event.data?.type === 'DEPOSIT_CREATED' ||
          event.data?.type === 'DEPOSIT_UPDATED' ||
          event.data?.type === 'WITHDRAWAL_CREATED' ||
          event.data?.type === 'WITHDRAWAL_UPDATED' ||
          event.data?.type === 'ACCOUNT_CREATED'
        ) {
          fetchLiveData();
        }
      };
    }

    // 5. Cross-tab Storage Event listener
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'crm_cross_tab_sync' || e.key === 'nd1_crm_impersonation' || e.key === 'nd1_crm_submitted_kyc') {
        fetchLiveData();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorage);
      if (bc) {
        bc.close();
      }
    };
  }, [fetchLiveData]);

  const dismissToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = React.useCallback((type: Toast['type'], title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  }, [dismissToast]);

  const startImpersonation = (client: Client) => {
    const newState = { isActive: true, client };
    setImpersonation(newState);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('nd1_crm_impersonation', JSON.stringify(newState));
        localStorage.setItem('crm_cross_tab_sync', JSON.stringify({ type: 'IMPERSONATION_STARTED', client, time: Date.now() }));
      }
    } catch {
      // ignore
    }
    showToast('info', 'Impersonation Mode Active', `Viewing portal as ${client.name} (${client.email})`);
  };

  const stopImpersonation = () => {
    setImpersonation({ isActive: false });
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nd1_crm_impersonation');
        localStorage.setItem('crm_cross_tab_sync', JSON.stringify({ type: 'IMPERSONATION_ENDED', time: Date.now() }));
      }
    } catch {
      // ignore
    }
    showToast('info', 'Impersonation Ended', 'Returned to Admin Workspace');
  };

  // Recalculate stats when deposits/withdrawals/clients change
  const refreshStats = (newDeposits = deposits, newWithdrawals = withdrawals, newClients = clients, newKyc = kycRecords) => {
    const totalDepVol = newDeposits.filter(d => d.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0);
    const totalWdrVol = newWithdrawals.filter(w => w.status === 'completed').reduce((acc, curr) => acc + curr.requestedAmount, 0);
    const pendingDep = newDeposits.filter(d => d.status === 'pending').length;
    const pendingWdr = newWithdrawals.filter(w => w.status === 'pending').length;
    const pendingK = newKyc.filter(k => k.status === 'pending').length;

    setStats(prev => ({
      ...prev,
      totalDepositsVolume: totalDepVol,
      totalWithdrawalsVolume: totalWdrVol,
      netCashFlow: totalDepVol - totalWdrVol,
      pendingDepositsCount: pendingDep,
      pendingWithdrawalsCount: pendingWdr,
      pendingKycCount: pendingK,
      totalClients: newClients.length,
      activeClients: newClients.filter(c => c.status === 'verified').length,
    }));
  };

  // KYC Actions with cross-tab broadcast
  const approveKYC = async (id: string, comment?: string) => {
    const record = kycRecords.find(k => k.id === id);
    if (!record) return;

    // 1. Optimistic UI updates in this tab
    setKycRecords(prev => prev.map(k => k.id === id ? {
      ...k,
      status: 'verified',
      adminComment: comment || undefined,
      reviewedBy: 'Super Admin',
      reviewedAt: new Date().toISOString()
    } : k));

    setClients(prev => prev.map(c => c.id === record.clientId ? { ...c, status: 'verified', kycVerified: true } : c));

    // Update active impersonation if matching
    setImpersonation(prev => {
      if (prev.isActive && prev.client?.id === record.clientId) {
        const updated = { isActive: true, client: { ...prev.client, status: 'verified' as const, kycVerified: true } };
        try {
          localStorage.setItem('nd1_crm_impersonation', JSON.stringify(updated));
        } catch {}
        return updated;
      }
      return prev;
    });

    // Update logged in clientUser if matching
    setClientUser(prev => {
      if (prev?.id === record.clientId) {
        const updated = { ...prev, status: 'verified' as const, kycVerified: true };
        try {
          localStorage.setItem('nd1_crm_client_auth', JSON.stringify(updated));
        } catch {}
        return updated;
      }
      return prev;
    });

    // Clean up local storage pending entries for this client
    try {
      if (typeof window !== 'undefined') {
        const storedLocal = JSON.parse(localStorage.getItem('nd1_crm_submitted_kyc') || '{}');
        delete storedLocal[record.clientId];
        delete storedLocal[record.clientEmail];
        localStorage.setItem('nd1_crm_submitted_kyc', JSON.stringify(storedLocal));

        // Broadcast to other open tabs
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('crm_events');
          bc.postMessage({
            type: 'KYC_STATUS_CHANGED',
            id,
            clientId: record.clientId,
            clientEmail: record.clientEmail,
            status: 'verified',
          });
          bc.close();
        }
        localStorage.setItem('crm_cross_tab_sync', JSON.stringify({
          type: 'KYC_STATUS_CHANGED',
          id,
          clientId: record.clientId,
          status: 'verified',
          time: Date.now()
        }));
      }
    } catch {}

    showToast('success', 'KYC Approved', `Identity documents for ${record.clientName} verified.`);
    refreshStats();

    // Call live backend to update Supabase and dispatch Hostinger approval email
    try {
      await fetch('/api/kyc/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'approve', comment }),
      });
      // Re-fetch to guarantee sync with Supabase
      fetchLiveData();
    } catch (err) {
      console.warn('[CRMContext] Live KYC approve error:', err);
    }
  };

  const rejectKYC = async (id: string, reason: string) => {
    const record = kycRecords.find(k => k.id === id);
    if (!record) return;

    // Optimistic UI updates
    setKycRecords(prev => prev.map(k => k.id === id ? {
      ...k,
      status: 'rejected',
      rejectionReason: reason,
      reviewedBy: 'Super Admin',
      reviewedAt: new Date().toISOString()
    } : k));

    setClients(prev => prev.map(c => c.id === record.clientId ? { ...c, status: 'rejected', kycVerified: false } : c));

    // Broadcast rejection to other tabs
    try {
      if (typeof window !== 'undefined') {
        const storedLocal = JSON.parse(localStorage.getItem('nd1_crm_submitted_kyc') || '{}');
        delete storedLocal[record.clientId];
        delete storedLocal[record.clientEmail];
        localStorage.setItem('nd1_crm_submitted_kyc', JSON.stringify(storedLocal));

        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('crm_events');
          bc.postMessage({
            type: 'KYC_STATUS_CHANGED',
            id,
            clientId: record.clientId,
            clientEmail: record.clientEmail,
            status: 'rejected',
          });
          bc.close();
        }
        localStorage.setItem('crm_cross_tab_sync', JSON.stringify({
          type: 'KYC_STATUS_CHANGED',
          id,
          clientId: record.clientId,
          status: 'rejected',
          time: Date.now()
        }));
      }
    } catch {}

    showToast('warning', 'KYC Rejected', `Application for ${record.clientName} rejected: "${reason}"`);
    refreshStats();

    // Call live backend to update Supabase and dispatch Hostinger rejection email
    try {
      await fetch('/api/kyc/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'reject', reason }),
      });
      fetchLiveData();
    } catch (err) {
      console.warn('[CRMContext] Live KYC reject error:', err);
    }
  };

  const submitKycRecord = (newRecord: KYCRecord) => {
    setKycRecords(prev => {
      const filtered = prev.filter(k => k.id !== newRecord.id && k.clientId !== newRecord.clientId);
      return [newRecord, ...filtered];
    });

    // Also update client kyc status
    setClients(prev => prev.map(c => {
      if (c.id === newRecord.clientId || c.email === newRecord.clientEmail) {
        return { ...c, kycVerified: false };
      }
      return c;
    }));

    if (impersonation.isActive && impersonation.client) {
      if (impersonation.client.id === newRecord.clientId || impersonation.client.email === newRecord.clientEmail) {
        setImpersonation(prev => ({
          ...prev,
          client: prev.client ? { ...prev.client, kycVerified: false } : undefined,
        }));
      }
    }

    try {
      if (typeof window !== 'undefined') {
        const submittedMap = JSON.parse(localStorage.getItem('nd1_crm_submitted_kyc') || '{}');
        submittedMap[newRecord.clientId] = newRecord;
        submittedMap[newRecord.clientEmail] = newRecord;
        localStorage.setItem('nd1_crm_submitted_kyc', JSON.stringify(submittedMap));

        // Broadcast to other open tabs (e.g. Admin Tab instantly sees new submission)
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('crm_events');
          bc.postMessage({ type: 'KYC_SUBMITTED', record: newRecord });
          bc.close();
        }
        localStorage.setItem('crm_cross_tab_sync', JSON.stringify({
          type: 'KYC_SUBMITTED',
          recordId: newRecord.id,
          time: Date.now()
        }));
      }
    } catch {
      // ignore
    }

    refreshStats(deposits, withdrawals, clients, [newRecord, ...kycRecords]);
  };

  // Deposit Actions
  const approveDeposit = async (id: string) => {
    const dep = deposits.find(d => d.id === id);
    if (!dep) return;

    setDeposits(prev => prev.map(d => d.id === id ? { ...d, status: 'completed', updatedAt: new Date().toISOString() } : d));

    // Update Client balance and account
    setClients(prev => prev.map(c => {
      if (c.id === dep.clientId) {
        const updatedAccounts = c.accounts.map(acc => {
          if (acc.login === dep.accountLogin) {
            return {
              ...acc,
              balance: acc.balance + dep.amount,
              equity: acc.equity + dep.amount,
              freeMargin: acc.freeMargin + dep.amount,
            };
          }
          return acc;
        });
        return {
          ...c,
          totalDeposit: c.totalDeposit + dep.amount,
          netDeposit: c.netDeposit + dep.amount,
          totalBalance: c.totalBalance + dep.amount,
          accounts: updatedAccounts,
        };
      }
      return c;
    }));

    // Add to Transactions
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      referenceId: `DEP-${Math.floor(1000 + Math.random() * 9000)}`,
      clientId: dep.clientId,
      clientName: dep.clientName,
      clientEmail: dep.clientEmail,
      accountLogin: dep.accountLogin,
      type: 'deposit',
      amount: dep.amount,
      fee: 0,
      currency: dep.currency,
      status: 'completed',
      method: dep.paymentMethod.replace('_', ' '),
      timestamp: new Date().toISOString(),
      description: `Approved deposit of ${dep.amount} ${dep.currency} to Account #${dep.accountLogin}`
    };
    setTransactions(prev => [newTx, ...prev]);

    showToast('success', 'Deposit Approved', `Credited ${dep.amount} ${dep.currency} to Account #${dep.accountLogin}`);
    refreshStats();

    // Update status in Supabase database
    fetch('/api/deposits', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'completed' })
    }).catch(err => console.warn('Supabase deposit status patch error:', err));

    // MT5 Live API Integration
    if (dep.accountLogin) {
      try {
        const res = await fetch('/api/mt5/trade/deposit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            login: dep.accountLogin,
            amount: dep.amount,
            comment: `Deposit ${dep.id.slice(-6)} Approved`,
            skipLedgerRecord: true
          })
        });
        const data = await res.json();
        if (data.success && data.result?.ticket) {
          showToast('success', 'MT5 Live Credit Executed', `Live Ticket #${data.result.ticket} registered on MT5 server.`);
        }
      } catch (err) {
        console.warn('[CRM] MT5 live balance credit warning:', err);
      }
    }

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('crm_events');
      bc.postMessage({ type: 'DEPOSIT_UPDATED', id, status: 'completed' });
    }
  };

  const rejectDeposit = (id: string, reason: string) => {
    const dep = deposits.find(d => d.id === id);
    if (!dep) return;

    setDeposits(prev => prev.map(d => d.id === id ? { ...d, status: 'rejected', remarks: reason, updatedAt: new Date().toISOString() } : d));
    showToast('error', 'Deposit Rejected', `Deposit #${dep.id} rejected. Client notified.`);
    refreshStats();

    fetch('/api/deposits', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'rejected', remarks: reason })
    }).catch(err => console.warn('Supabase deposit reject patch error:', err));

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('crm_events');
      bc.postMessage({ type: 'DEPOSIT_UPDATED', id, status: 'rejected' });
    }
  };

  const createDepositRequest = (data: Partial<DepositRequest>) => {
    const id = data.id || `dep_${Date.now()}`;
    const activeClient = impersonation.client || clients[0];
    const targetLogin = data.accountLogin || (activeClient?.accounts[0]?.login ?? 0);
    const newDep: DepositRequest = {
      id,
      clientId: data.clientId || activeClient?.id || `cli_${Date.now()}`,
      clientName: data.clientName || activeClient?.name || 'Client',
      clientEmail: data.clientEmail || activeClient?.email || 'client@crm.com',
      tradingAccountId: data.tradingAccountId || (targetLogin ? `acc_${targetLogin}` : ''),
      accountLogin: targetLogin,
      amount: data.amount || 0,
      currency: data.currency || 'USD',
      paymentMethod: data.paymentMethod || 'crypto_usdt',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plan: data.plan || 'STANDARD',
      txHash: data.txHash,
      remarks: data.remarks,
    };

    setDeposits(prev => [newDep, ...prev.filter(d => d.id !== id)]);
    showToast('success', 'Deposit Request Queued', `Deposit request of $${newDep.amount.toLocaleString()} submitted for admin verification.`);
    refreshStats();

    // Persist to Supabase database so it survives page reloads
    fetch('/api/deposits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newDep.id,
        clientId: newDep.clientId,
        clientName: newDep.clientName,
        clientEmail: newDep.clientEmail,
        accountLogin: newDep.accountLogin,
        amount: newDep.amount,
        currency: newDep.currency,
        paymentMethod: newDep.paymentMethod,
        txHash: newDep.txHash,
        remarks: newDep.remarks,
      })
    })
    .then(res => res.json())
    .then(resData => {
      if (resData.success && resData.deposit) {
        setDeposits(prev => [resData.deposit, ...prev.filter(d => d.id !== id && d.id !== resData.deposit.id)]);
      }
    })
    .catch(err => console.warn('Supabase deposit creation error:', err));

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('crm_events');
      bc.postMessage({ type: 'DEPOSIT_CREATED', deposit: newDep });
    }
  };

  // Withdrawal Actions
  const approveWithdrawal = async (id: string) => {
    const wdr = withdrawals.find(w => w.id === id);
    if (!wdr) return;

    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'completed', updatedAt: new Date().toISOString() } : w));

    // Deduct from client balance
    setClients(prev => prev.map(c => {
      if (c.id === wdr.clientId) {
        const updatedAccounts = c.accounts.map(acc => {
          if (acc.login === wdr.accountLogin) {
            return {
              ...acc,
              balance: Math.max(0, acc.balance - wdr.requestedAmount),
              equity: Math.max(0, acc.equity - wdr.requestedAmount),
              freeMargin: Math.max(0, acc.freeMargin - wdr.requestedAmount),
            };
          }
          return acc;
        });
        return {
          ...c,
          totalWithdrawal: c.totalWithdrawal + wdr.requestedAmount,
          netDeposit: Math.max(0, c.netDeposit - wdr.requestedAmount),
          totalBalance: Math.max(0, c.totalBalance - wdr.requestedAmount),
          accounts: updatedAccounts,
        };
      }
      return c;
    }));

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      referenceId: `WDR-${Math.floor(1000 + Math.random() * 9000)}`,
      clientId: wdr.clientId,
      clientName: wdr.clientName,
      clientEmail: wdr.clientEmail,
      accountLogin: wdr.accountLogin,
      type: 'withdrawal',
      amount: wdr.requestedAmount,
      fee: wdr.fee,
      currency: wdr.currency,
      status: 'completed',
      method: wdr.destinationType === 'Crypto_Wallet' ? 'Crypto Payout' : 'Bank Wire',
      timestamp: new Date().toISOString(),
      description: `Processed payout of ${wdr.netAmount} ${wdr.currency} from Account #${wdr.accountLogin}`
    };
    setTransactions(prev => [newTx, ...prev]);

    showToast('success', 'Withdrawal Processed', `Disbursed ${wdr.netAmount} ${wdr.currency} to client.`);
    refreshStats();

    // Persist status change to Supabase database
    fetch('/api/withdrawals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'completed' })
    }).catch(err => console.warn('Supabase withdrawal status patch error:', err));

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('crm_events');
      bc.postMessage({ type: 'WITHDRAWAL_UPDATED', id, status: 'completed' });
    }

    // MT5 Live API Integration
    if (wdr.accountLogin) {
      try {
        const res = await fetch('/api/mt5/trade/withdraw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            login: wdr.accountLogin,
            amount: wdr.requestedAmount,
            comment: `Withdrawal ${wdr.id.slice(-6)} Payout`,
            skipLedgerRecord: true
          })
        });
        const data = await res.json();
        if (data.success && data.result?.ticket) {
          showToast('success', 'MT5 Live Debit Executed', `Live Ticket #${data.result.ticket} deducted on MT5 server.`);
        }
      } catch (err) {
        console.warn('[CRM] MT5 live balance debit warning:', err);
      }
    }
  };

  const processWithdrawal = (id: string) => {
    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'processing', updatedAt: new Date().toISOString() } : w));
    showToast('info', 'Status Updated', `Withdrawal #${id} marked as Processing.`);

    fetch('/api/withdrawals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'processing' })
    }).catch(err => console.warn('Supabase withdrawal status patch error:', err));

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('crm_events');
      bc.postMessage({ type: 'WITHDRAWAL_UPDATED', id, status: 'processing' });
    }
  };

  const rejectWithdrawal = (id: string, reason: string) => {
    const wdr = withdrawals.find(w => w.id === id);
    if (!wdr) return;

    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'rejected', rejectReason: reason, updatedAt: new Date().toISOString() } : w));
    showToast('warning', 'Withdrawal Rejected', `Withdrawal rejected: "${reason}"`);
    refreshStats();

    fetch('/api/withdrawals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'rejected', reason })
    }).catch(err => console.warn('Supabase withdrawal status patch error:', err));

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('crm_events');
      bc.postMessage({ type: 'WITHDRAWAL_UPDATED', id, status: 'rejected' });
    }
  };

  const createWithdrawalRequest = (data: Partial<WithdrawalRequest>) => {
    const id = data.id || `wdr_${Date.now()}`;
    const activeClient = impersonation.client || clients[0];
    const targetLogin = data.accountLogin || (activeClient?.accounts[0]?.login ?? 0);
    const reqAmount = data.requestedAmount || 0;
    const fee = data.fee || 0;
    const newWdr: WithdrawalRequest = {
      id,
      clientId: data.clientId || activeClient?.id || `cli_${Date.now()}`,
      clientName: data.clientName || activeClient?.name || 'Client',
      clientEmail: data.clientEmail || activeClient?.email || 'client@crm.com',
      tradingAccountId: data.tradingAccountId || (targetLogin ? `acc_${targetLogin}` : ''),
      accountLogin: targetLogin,
      requestedAmount: reqAmount,
      fee,
      netAmount: reqAmount - fee,
      currency: data.currency || 'USD',
      paymentMethod: data.paymentMethod || 'bank_transfer',
      destinationType: data.destinationType || 'Bank_Account',
      destinationDetails: data.destinationDetails || {
        bankName: '',
        accountNumber: ''
      },
      clientBalance: data.clientBalance ?? (activeClient?.totalBalance ?? 0),
      clientEquity: data.clientEquity ?? (activeClient?.totalBalance ?? 0),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plan: data.plan || 'STANDARD',
    };

    setWithdrawals(prev => [newWdr, ...prev.filter(w => w.id !== id)]);
    showToast('success', 'Withdrawal Request Queued', `Payout request of $${newWdr.requestedAmount.toLocaleString()} submitted for admin review.`);
    refreshStats();

    // Persist to Supabase database so it survives page reloads
    fetch('/api/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newWdr.id,
        clientId: newWdr.clientId,
        clientName: newWdr.clientName,
        clientEmail: newWdr.clientEmail,
        accountLogin: newWdr.accountLogin,
        requestedAmount: newWdr.requestedAmount,
        fee: newWdr.fee,
        currency: newWdr.currency,
        paymentMethod: newWdr.paymentMethod,
        destinationType: newWdr.destinationType,
        destinationDetails: newWdr.destinationDetails,
      })
    })
    .then(res => res.json())
    .then(resData => {
      if (resData.success && resData.withdrawal) {
        setWithdrawals(prev => [resData.withdrawal, ...prev.filter(w => w.id !== id && w.id !== resData.withdrawal.id)]);
      }
    })
    .catch(err => console.warn('Supabase withdrawal creation error:', err));

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('crm_events');
      bc.postMessage({ type: 'WITHDRAWAL_CREATED', withdrawal: newWdr });
    }
  };

  // MT5 Real-time Account Sync
  const syncAccountBalance = async (login: number): Promise<{ balance: number; equity: number; freeMargin: number } | null> => {
    try {
      const res = await fetch(`/api/mt5/accounts/${login}`);
      const data = await res.json();
      if (data.success && data.account) {
        const { balance, equity, freeMargin } = data.account;
        setClients(prev => prev.map(c => {
          const hasAcc = c.accounts.some(a => a.login === login);
          if (!hasAcc) return c;
          return {
            ...c,
            accounts: c.accounts.map(a => a.login === login ? {
              ...a,
              balance,
              equity,
              freeMargin,
            } : a),
          };
        }));

        if (impersonation.client) {
          setImpersonation(prev => {
            if (!prev.client) return prev;
            return {
              ...prev,
              client: {
                ...prev.client,
                accounts: prev.client.accounts.map(a => a.login === login ? {
                  ...a,
                  balance,
                  equity,
                  freeMargin,
                } : a),
              }
            };
          });
        }
        return { balance, equity, freeMargin };
      }
      return null;
    } catch (err) {
      console.warn(`[syncAccountBalance] Failed to sync account #${login}:`, err);
      return null;
    }
  };

  // Manual Payments / Credits
  const addManualPayment = ({ clientId, accountLogin, amount, type, currency, description }: {
    clientId: string;
    accountLogin: number;
    amount: number;
    type: 'deposit' | 'credit_bonus' | 'debit_correction';
    currency: string;
    description: string;
  }) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const multiplier = type === 'debit_correction' ? -1 : 1;
    const delta = amount * multiplier;

    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        const updatedAccounts = c.accounts.map(acc => {
          if (acc.login === accountLogin) {
            return {
              ...acc,
              balance: acc.balance + delta,
              equity: acc.equity + delta,
              freeMargin: acc.freeMargin + delta,
            };
          }
          return acc;
        });
        return {
          ...c,
          totalBalance: c.totalBalance + delta,
          accounts: updatedAccounts,
        };
      }
      return c;
    }));

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      referenceId: `ADJ-${Math.floor(1000 + Math.random() * 9000)}`,
      clientId,
      clientName: client.name,
      clientEmail: client.email,
      accountLogin,
      type,
      amount,
      fee: 0,
      currency,
      status: 'completed',
      method: 'Admin Manual Action',
      timestamp: new Date().toISOString(),
      description,
    };
    setTransactions(prev => [newTx, ...prev]);

    showToast('success', 'Adjustment Applied', `Applied ${type.replace('_', ' ')} of ${amount} ${currency} to #${accountLogin}`);
    refreshStats();

    // Call MT5 Live API in background
    if (accountLogin && delta !== 0) {
      fetch('/api/mt5/trade/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: accountLogin,
          amount: delta,
          comment: description || `Admin ${type}`
        })
      })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.result?.ticket) {
          showToast('success', 'MT5 Live Adjustment Done', `Ticket #${data.result.ticket} registered on MT5 broker server.`);
        }
      })
      .catch(err => console.warn('[CRM] MT5 adjustment call warning:', err));
    }
  };

  const updateClientStatus = (clientId: string, status: Client['status']) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, status } : c));
    showToast('info', 'Client Status Updated', `Client marked as ${status.toUpperCase()}`);
  };

  const addClient = async (data: Partial<Client>): Promise<{ success: boolean; client?: Client; error?: string }> => {
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          country: data.country,
          city: data.city,
        }),
      });

      const json = await res.json();
      if (json.success && json.client) {
        const newClient: Client = json.client;
        setClients(prev => [newClient, ...prev]);
        showToast('success', 'Client Registered', `Created client record for ${newClient.name} & sent credentials email.`);
        refreshStats();
        return { success: true, client: newClient };
      } else {
        throw new Error(json.error || 'Failed to register client');
      }
    } catch (err: any) {
      console.warn('[CRMContext] Error creating client via /api/clients:', err.message);
      // Local fallback
      const fallbackClient: Client = {
        id: `cli_${Date.now().toString().slice(-4)}`,
        name: data.name || 'New Client',
        email: data.email || 'client@example.com',
        phone: data.phone || '+1 555 0199',
        country: data.country || 'Global',
        city: data.city || 'Headquarters',
        registeredAt: new Date().toISOString(),
        status: 'verified',
        emailVerified: true,
        kycVerified: false,
        totalDeposit: 0,
        totalWithdrawal: 0,
        netDeposit: 0,
        totalBalance: 0,
        accounts: [],
        ...data,
      };
      setClients(prev => [fallbackClient, ...prev]);
      showToast('warning', 'Client Registered (Offline)', `Created local record for ${fallbackClient.name}`);
      refreshStats();
      return { success: true, client: fallbackClient };
    }
  };

  const updateIBTiers = (tiers: IBTierConfig[]) => {
    setIbTiers(tiers);
    showToast('success', 'IB Tiers Saved', 'Commission structures and rebate tiers updated.');

    fetch('/api/ib/tiers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tiers }),
    }).catch(err => console.warn('Error persisting IB tiers:', err));
  };

  const approveIBWithdrawal = (id: string) => {
    setIbWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'completed' } : w));
    showToast('success', 'IB Payout Approved', `Partner commission payout #${id} approved.`);
  };

  const rejectIBWithdrawal = (id: string) => {
    setIbWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'rejected' } : w));
    showToast('error', 'IB Payout Rejected', `Partner commission payout #${id} rejected.`);
  };

  const addTradingAccount = (newAcc: TradingAccount) => {
    // 1. Update clients list
    setClients(prev => {
      const targetId = impersonation.client?.id || clientUser?.id || prev[0]?.id;
      return prev.map(c => {
        if (c.id === targetId || (clientUser && c.email === clientUser.email)) {
          const updatedAccs = [newAcc, ...(c.accounts || []).filter(a => a.login !== newAcc.login)];
          return {
            ...c,
            accounts: updatedAccs,
          };
        }
        return c;
      });
    });

    // 2. Update impersonation if active
    if (impersonation.isActive && impersonation.client) {
      setImpersonation(prev => ({
        ...prev,
        client: prev.client ? {
          ...prev.client,
          accounts: [newAcc, ...(prev.client.accounts || []).filter(a => a.login !== newAcc.login)],
        } : undefined,
      }));
    }

    // 3. Update logged-in clientUser session and localStorage
    setClientUser(prev => {
      if (prev) {
        const updated = {
          ...prev,
          accounts: [newAcc, ...(prev.accounts || []).filter(a => a.login !== newAcc.login)],
        };
        try {
          localStorage.setItem('nd1_crm_client_auth', JSON.stringify(updated));
        } catch {}
        return updated;
      }
      return prev;
    });

    // 4. Broadcast to other tabs & trigger immediate re-fetch
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('crm_events');
      bc.postMessage({ type: 'ACCOUNT_CREATED', account: newAcc });
    }

    fetchLiveData();
  };

  return (
    <CRMContext.Provider value={{
      isAuthenticated,
      authLoading,
      adminUser,
      clientUser,
      login,
      clientLogin,
      logout,
      clients,
      kycRecords,
      deposits,
      withdrawals,
      transactions,
      ibPartners,
      ibWithdrawals,
      ibTiers,
      stats,
      toasts,
      impersonation,
      isMobileSidebarOpen,
      setMobileSidebarOpen,
      showToast,
      dismissToast,
      startImpersonation,
      stopImpersonation,
      approveKYC,
      rejectKYC,
      submitKycRecord,
      approveDeposit,
      rejectDeposit,
      createDepositRequest,
      approveWithdrawal,
      rejectWithdrawal,
      processWithdrawal,
      createWithdrawalRequest,
      syncAccountBalance,
      addManualPayment,
      updateClientStatus,
      addClient,
      updateIBTiers,
      approveIBWithdrawal,
      rejectIBWithdrawal,
      clientModal,
      openClientModal,
      closeClientModal,
      addTradingAccount,
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
