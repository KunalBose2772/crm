import { 
  RevenueAnalyticsConfig, 
  AccountDistributionConfig,
  TodaysPerformanceConfig,
  TopPerformingClient,
  Transaction
} from '@/types/crm';

/**
 * Default initial mock data matching the financial platform requirements.
 * When the real REST/GraphQL API is connected, update the API client functions below.
 */

export const initialRevenueAnalytics: RevenueAnalyticsConfig = {
  netRevenue: 0,
  netRevenueChange: -100,
  ibCommission: 0,
  ibTradingVolume: 78674.651,
  depositsAmount: 0,
  withdrawalsAmount: 0,
  depositsTrend: -100,
  withdrawalsTrend: -100,
  period: '30d',
  chartType: 'radial',
};

export const initialAccountDistribution: AccountDistributionConfig = {
  title: 'Account Distribution',
  periodLabel: 'September 2026',
  categories: [
    { id: 'basic', name: 'BASIC', count: 35, color: '#2563eb', badgeColor: '#3b82f6' },
    { id: 'standard', name: 'STANDARD', count: 22, color: '#10b981', badgeColor: '#10b981' },
    { id: 'vvip', name: 'VVIP', count: 6, color: '#f59e0b', badgeColor: '#f59e0b' },
    { id: 'type_300', name: '300', count: 3, color: '#ef4444', badgeColor: '#ef4444' },
    { id: 'type_200', name: '200', count: 2, color: '#8b5cf6', badgeColor: '#8b5cf6' },
    { id: 'type_100', name: '100', count: 2, color: '#ec4899', badgeColor: '#ec4899' },
  ],
  totalAccountTypes: 6,
  totalAccountsCount: 69,
};

// Section 1: Today's Performance Data (matching Image 1 header & Image 3 royal purple cards)
export const initialTodaysPerformance: TodaysPerformanceConfig = {
  dateLabel: 'Wednesday, September 23, 2026',
  lastUpdated: '01:58 PM',
  totalNetDeposits: 2560200,
  totalNetDepositsChange: 18.4,
  grossInflows: 4280500,
  grossInflowsChange: 14.2,
  grossOutflows: 1720300,
  grossOutflowsChange: -4.2,
  totalRegisteredClients: 1284,
  totalRegisteredClientsChange: 8.7,
  netFlowToday: 0,
  depositRate: 0,
  withdrawalRate: 0,
  avgDeposit: 0,
};

// Section 3: Top Performing Clients (exact match with Image 2)
export const initialTopPerformingClients: TopPerformingClient[] = [
  { id: 'tpc_1', rank: 1, nameOrEmail: 'oaacw28813@minitts.net', depositsCount: 6, accountsCount: 6, totalDeposited: 42363438 },
  { id: 'tpc_2', rank: 2, nameOrEmail: 'hipbdei3ee@ruutukf.com', depositsCount: 5, accountsCount: 7, totalDeposited: 8649093 },
  { id: 'tpc_3', rank: 3, nameOrEmail: 'mf0hb0qr6j@tnovic.com', depositsCount: 1, accountsCount: 2, totalDeposited: 987600 },
  { id: 'tpc_4', rank: 4, nameOrEmail: 'drzqn11373@minitts.net', depositsCount: 1, accountsCount: 2, totalDeposited: 700000 },
  { id: 'tpc_5', rank: 5, nameOrEmail: 'pn7pzxndn@bltiwd.com', depositsCount: 1, accountsCount: 2, totalDeposited: 600000 },
  { id: 'tpc_6', rank: 6, nameOrEmail: '6810plcvpu@bltiwd.com', depositsCount: 1, accountsCount: 1, totalDeposited: 560000 },
  { id: 'tpc_7', rank: 7, nameOrEmail: 'shvug75549@minitts.net', depositsCount: 1, accountsCount: 2, totalDeposited: 550000 },
];

// Section 2: Recent Transactions Data (matching Image 1 bottom table)
export const initialDashboardTransactions: Transaction[] = [
  {
    id: 'tx_img_1',
    referenceId: '260703745',
    clientId: 'cli_img_1',
    clientName: 'test pammi',
    clientEmail: 'hipbdei3ee@ruutukf.com',
    accountLogin: 260703745,
    type: 'deposit',
    amount: 49000,
    fee: 0,
    currency: 'USD',
    status: 'completed',
    method: 'bank',
    timestamp: '2026-08-07T12:02:00Z',
    description: 'Bank wire deposit credit',
  },
  {
    id: 'tx_img_2',
    referenceId: '260527834',
    clientId: 'cli_img_2',
    clientName: 'testsubi Rathore',
    clientEmail: 'vatewom153@marineso.com',
    accountLogin: 260527834,
    type: 'withdrawal',
    amount: 20,
    fee: 0,
    currency: 'USD',
    status: 'pending',
    method: 'Crypto Wallet',
    timestamp: '2026-07-31T11:56:00Z',
    description: 'TRC20 crypto payout request',
  },
  {
    id: 'tx_img_3',
    referenceId: '260729468',
    clientId: 'cli_img_3',
    clientName: 'Whatsapp Bot',
    clientEmail: 'bot.service@automated.io',
    accountLogin: 260729468,
    type: 'withdrawal',
    amount: 500,
    fee: 0,
    currency: 'USD',
    status: 'pending',
    method: 'bank',
    timestamp: '2026-07-31T11:48:00Z',
    description: 'Client portal automated bank withdrawal',
  },
  {
    id: 'tx_img_4',
    referenceId: '260991204',
    clientId: 'cli_img_4',
    clientName: 'Alexander Wright',
    clientEmail: 'alex.wright@tradecapital.io',
    accountLogin: 809210,
    type: 'deposit',
    amount: 10000,
    fee: 0,
    currency: 'USD',
    status: 'completed',
    method: 'USDT_TRC20',
    timestamp: '2026-03-12T08:14:00Z',
    description: 'Priority credit transaction',
  },
  {
    id: 'tx_img_5',
    referenceId: '260882190',
    clientId: 'cli_img_5',
    clientName: 'Marcus Becker',
    clientEmail: 'marcus.becker@quantfx.de',
    accountLogin: 661099,
    type: 'deposit',
    amount: 50000,
    fee: 0,
    currency: 'EUR',
    status: 'completed',
    method: 'Bank Wire',
    timestamp: '2026-03-11T14:10:00Z',
    description: 'SEPA verified institutional transfer',
  },
];

/**
 * API Service Layer for Dashboard Analytics.
 * Replace mock responses with actual axios/fetch calls when backend endpoints are ready.
 */
export const dashboardAnalyticsService = {
  async getRevenueAnalytics(period: string = '30d'): Promise<RevenueAnalyticsConfig> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return {
      ...initialRevenueAnalytics,
      period: period as RevenueAnalyticsConfig['period'],
    };
  },

  async getAccountDistribution(): Promise<AccountDistributionConfig> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return {
      ...initialAccountDistribution,
    };
  },

  async getTodaysPerformance(): Promise<TodaysPerformanceConfig> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return {
      ...initialTodaysPerformance,
    };
  },

  async getTopPerformingClients(): Promise<TopPerformingClient[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [...initialTopPerformingClients];
  },

  async getRecentTransactions(): Promise<Transaction[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [...initialDashboardTransactions];
  },
};
