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
  DashboardStats 
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

interface ImpersonationState {
  isActive: boolean;
  client?: Client;
}

interface CRMContextType {
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
  approveKYC: (id: string) => void;
  rejectKYC: (id: string, reason: string) => void;
  
  // Deposit actions
  approveDeposit: (id: string) => void;
  rejectDeposit: (id: string, reason: string) => void;
  
  // Withdrawal actions
  approveWithdrawal: (id: string) => void;
  rejectWithdrawal: (id: string, reason: string) => void;
  processWithdrawal: (id: string) => void;
  
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
  addClient: (clientData: Partial<Client>) => void;
  
  // IB actions
  updateIBTiers: (tiers: IBTierConfig[]) => void;
  approveIBWithdrawal: (id: string) => void;
  rejectIBWithdrawal: (id: string) => void;
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

  const showToast = (type: Toast['type'], title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const startImpersonation = (client: Client) => {
    setImpersonation({ isActive: true, client });
    showToast('info', 'Impersonation Mode Active', `Viewing portal as ${client.name} (${client.email})`);
  };

  const stopImpersonation = () => {
    setImpersonation({ isActive: false });
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
      totalDepositsVolume: totalDepVol + 4200000,
      totalWithdrawalsVolume: totalWdrVol + 1650000,
      netCashFlow: (totalDepVol + 4200000) - (totalWdrVol + 1650000),
      pendingDepositsCount: pendingDep,
      pendingWithdrawalsCount: pendingWdr,
      pendingKycCount: pendingK,
      totalClients: newClients.length + 1278,
    }));
  };

  // KYC Actions
  const approveKYC = (id: string) => {
    const record = kycRecords.find(k => k.id === id);
    if (!record) return;

    setKycRecords(prev => prev.map(k => k.id === id ? {
      ...k,
      status: 'verified',
      reviewedBy: 'Super Admin',
      reviewedAt: new Date().toISOString()
    } : k));

    setClients(prev => prev.map(c => c.id === record.clientId ? { ...c, status: 'verified' } : c));
    showToast('success', 'KYC Approved', `Identity documents for ${record.clientName} verified.`);
    refreshStats();
  };

  const rejectKYC = (id: string, reason: string) => {
    const record = kycRecords.find(k => k.id === id);
    if (!record) return;

    setKycRecords(prev => prev.map(k => k.id === id ? {
      ...k,
      status: 'rejected',
      rejectionReason: reason,
      reviewedBy: 'Super Admin',
      reviewedAt: new Date().toISOString()
    } : k));

    setClients(prev => prev.map(c => c.id === record.clientId ? { ...c, status: 'rejected' } : c));
    showToast('warning', 'KYC Rejected', `Application for ${record.clientName} rejected: "${reason}"`);
    refreshStats();
  };

  // Deposit Actions
  const approveDeposit = (id: string) => {
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
  };

  const rejectDeposit = (id: string, reason: string) => {
    const dep = deposits.find(d => d.id === id);
    if (!dep) return;

    setDeposits(prev => prev.map(d => d.id === id ? { ...d, status: 'rejected', remarks: reason, updatedAt: new Date().toISOString() } : d));
    showToast('error', 'Deposit Rejected', `Deposit #${dep.id} rejected. Client notified.`);
    refreshStats();
  };

  // Withdrawal Actions
  const approveWithdrawal = (id: string) => {
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
          netDeposit: c.netDeposit - wdr.requestedAmount,
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
  };

  const processWithdrawal = (id: string) => {
    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'processing', updatedAt: new Date().toISOString() } : w));
    showToast('info', 'Status Updated', `Withdrawal #${id} marked as Processing.`);
  };

  const rejectWithdrawal = (id: string, reason: string) => {
    const wdr = withdrawals.find(w => w.id === id);
    if (!wdr) return;

    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'rejected', rejectReason: reason, updatedAt: new Date().toISOString() } : w));
    showToast('warning', 'Withdrawal Rejected', `Withdrawal rejected: "${reason}"`);
    refreshStats();
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
  };

  const updateClientStatus = (clientId: string, status: Client['status']) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, status } : c));
    showToast('info', 'Client Status Updated', `Client marked as ${status.toUpperCase()}`);
  };

  const addClient = (data: Partial<Client>) => {
    const newClient: Client = {
      id: `cli_${Date.now().toString().slice(-4)}`,
      name: data.name || 'New Client',
      email: data.email || 'client@example.com',
      phone: data.phone || '+1 555 0199',
      country: data.country || 'Global',
      city: data.city || 'Headquarters',
      registeredAt: new Date().toISOString(),
      status: 'pending',
      totalDeposit: 0,
      totalWithdrawal: 0,
      netDeposit: 0,
      totalBalance: 0,
      accounts: [
        {
          id: `acc_${Date.now()}`,
          login: Math.floor(100000 + Math.random() * 900000),
          platform: 'MT5',
          type: 'Standard',
          currency: 'USD',
          balance: 0,
          equity: 0,
          freeMargin: 0,
          marginLevel: 0,
          leverage: '1:500',
          server: 'Live-Server-01',
          createdAt: new Date().toISOString(),
        }
      ],
      ...data,
    };
    setClients(prev => [newClient, ...prev]);
    showToast('success', 'Client Registered', `Created client record for ${newClient.name}`);
    refreshStats();
  };

  const updateIBTiers = (tiers: IBTierConfig[]) => {
    setIbTiers(tiers);
    showToast('success', 'IB Tiers Saved', 'Commission structures and rebate tiers updated.');
  };

  const approveIBWithdrawal = (id: string) => {
    setIbWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'completed' } : w));
    showToast('success', 'IB Payout Approved', `Partner commission payout #${id} approved.`);
  };

  const rejectIBWithdrawal = (id: string) => {
    setIbWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'rejected' } : w));
    showToast('error', 'IB Payout Rejected', `Partner commission payout #${id} rejected.`);
  };

  return (
    <CRMContext.Provider value={{
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
      approveDeposit,
      rejectDeposit,
      approveWithdrawal,
      rejectWithdrawal,
      processWithdrawal,
      addManualPayment,
      updateClientStatus,
      addClient,
      updateIBTiers,
      approveIBWithdrawal,
      rejectIBWithdrawal,
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
