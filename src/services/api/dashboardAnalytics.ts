import { 
  RevenueAnalyticsConfig, 
  AccountDistributionConfig,
  TodaysPerformanceConfig,
  TopPerformingClient,
  Transaction
} from '@/types/crm';

export const initialRevenueAnalytics: RevenueAnalyticsConfig = {
  netRevenue: 0,
  netRevenueChange: 0,
  ibCommission: 0,
  ibTradingVolume: 0,
  depositsAmount: 0,
  withdrawalsAmount: 0,
  depositsTrend: 0,
  withdrawalsTrend: 0,
  period: '30d',
  chartType: 'radial',
};

export const initialAccountDistribution: AccountDistributionConfig = {
  title: 'Account Distribution',
  periodLabel: 'Live Overview',
  categories: [
    { id: 'basic', name: 'BASIC', count: 0, color: '#2563eb', badgeColor: '#3b82f6' },
    { id: 'standard', name: 'STANDARD', count: 0, color: '#10b981', badgeColor: '#10b981' },
    { id: 'vvip', name: 'VVIP', count: 0, color: '#f59e0b', badgeColor: '#f59e0b' },
  ],
  totalAccountTypes: 3,
  totalAccountsCount: 0,
};

export const initialTodaysPerformance: TodaysPerformanceConfig = {
  dateLabel: 'Today',
  lastUpdated: 'Live',
  totalNetDeposits: 0,
  totalNetDepositsChange: 0,
  grossInflows: 0,
  grossInflowsChange: 0,
  grossOutflows: 0,
  grossOutflowsChange: 0,
  totalRegisteredClients: 0,
  totalRegisteredClientsChange: 0,
  netFlowToday: 0,
  depositRate: 0,
  withdrawalRate: 0,
  avgDeposit: 0,
};

export const initialTopPerformingClients: TopPerformingClient[] = [];

export const initialDashboardTransactions: Transaction[] = [];

export const dashboardAnalyticsService = {
  async getRevenueAnalytics(period: string = '30d'): Promise<RevenueAnalyticsConfig> {
    return {
      ...initialRevenueAnalytics,
      period: period as RevenueAnalyticsConfig['period'],
    };
  },

  async getAccountDistribution(): Promise<AccountDistributionConfig> {
    return {
      ...initialAccountDistribution,
    };
  },

  async getTodaysPerformance(): Promise<TodaysPerformanceConfig> {
    return {
      ...initialTodaysPerformance,
    };
  },

  async getTopPerformingClients(): Promise<TopPerformingClient[]> {
    return [...initialTopPerformingClients];
  },

  async getRecentTransactions(): Promise<Transaction[]> {
    return [...initialDashboardTransactions];
  },
};
