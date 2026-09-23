import { apiClient } from './client';
import { API_ENDPOINTS, USE_MOCK_API } from './endpoints';
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
} from './mockData';

export const api = {
  dashboard: {
    getStats: async (): Promise<DashboardStats> => {
      if (USE_MOCK_API) return initialStats;
      return apiClient<DashboardStats>(API_ENDPOINTS.dashboard.stats);
    },
  },
  clients: {
    getAll: async (): Promise<Client[]> => {
      if (USE_MOCK_API) return initialClients;
      return apiClient<Client[]>(API_ENDPOINTS.clients.list);
    },
    getById: async (id: string): Promise<Client> => {
      if (USE_MOCK_API) {
        const found = initialClients.find(c => c.id === id);
        if (!found) throw new Error('Client not found');
        return found;
      }
      return apiClient<Client>(API_ENDPOINTS.clients.detail(id));
    },
    updateStatus: async (id: string, status: Client['status']): Promise<{ success: boolean }> => {
      if (USE_MOCK_API) return { success: true };
      return apiClient<{ success: boolean }>(API_ENDPOINTS.clients.updateStatus(id), {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
  },
  kyc: {
    getAll: async (): Promise<KYCRecord[]> => {
      if (USE_MOCK_API) return initialKYCRecords;
      return apiClient<KYCRecord[]>(API_ENDPOINTS.kyc.list);
    },
    approve: async (id: string): Promise<{ success: boolean }> => {
      if (USE_MOCK_API) return { success: true };
      return apiClient<{ success: boolean }>(API_ENDPOINTS.kyc.approve(id), { method: 'POST' });
    },
    reject: async (id: string, reason: string): Promise<{ success: boolean }> => {
      if (USE_MOCK_API) return { success: true };
      return apiClient<{ success: boolean }>(API_ENDPOINTS.kyc.reject(id), {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    },
  },
  deposits: {
    getAll: async (): Promise<DepositRequest[]> => {
      if (USE_MOCK_API) return initialDeposits;
      return apiClient<DepositRequest[]>(API_ENDPOINTS.deposits.list);
    },
    approve: async (id: string): Promise<{ success: boolean }> => {
      if (USE_MOCK_API) return { success: true };
      return apiClient<{ success: boolean }>(API_ENDPOINTS.deposits.approve(id), { method: 'POST' });
    },
    reject: async (id: string, reason: string): Promise<{ success: boolean }> => {
      if (USE_MOCK_API) return { success: true };
      return apiClient<{ success: boolean }>(API_ENDPOINTS.deposits.reject(id), {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    },
  },
  withdrawals: {
    getAll: async (): Promise<WithdrawalRequest[]> => {
      if (USE_MOCK_API) return initialWithdrawals;
      return apiClient<WithdrawalRequest[]>(API_ENDPOINTS.withdrawals.list);
    },
    approve: async (id: string): Promise<{ success: boolean }> => {
      if (USE_MOCK_API) return { success: true };
      return apiClient<{ success: boolean }>(API_ENDPOINTS.withdrawals.approve(id), { method: 'POST' });
    },
    reject: async (id: string, reason: string): Promise<{ success: boolean }> => {
      if (USE_MOCK_API) return { success: true };
      return apiClient<{ success: boolean }>(API_ENDPOINTS.withdrawals.reject(id), {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    },
  },
  transactions: {
    getAll: async (): Promise<Transaction[]> => {
      if (USE_MOCK_API) return initialTransactions;
      return apiClient<Transaction[]>(API_ENDPOINTS.transactions.list);
    },
  },
  ib: {
    getPartners: async (): Promise<IBPartner[]> => {
      if (USE_MOCK_API) return initialIBPartners;
      return apiClient<IBPartner[]>(API_ENDPOINTS.ib.partnersList);
    },
    getTiers: async (): Promise<IBTierConfig[]> => {
      if (USE_MOCK_API) return initialIBTiers;
      return apiClient<IBTierConfig[]>(API_ENDPOINTS.ib.config);
    },
    getWithdrawals: async (): Promise<IBWithdrawalRequest[]> => {
      if (USE_MOCK_API) return initialIBWithdrawals;
      return apiClient<IBWithdrawalRequest[]>(API_ENDPOINTS.ib.withdrawalsList);
    },
  }
};
