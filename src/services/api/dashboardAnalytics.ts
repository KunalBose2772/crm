import { RevenueAnalyticsConfig, AccountDistributionConfig } from '@/types/crm';

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

/**
 * API Service Layer for Dashboard Analytics.
 * Replace mock responses with actual axios/fetch calls when backend endpoints are ready:
 * e.g., return (await api.get('/admin/analytics/revenue', { params: { period } })).data;
 */
export const dashboardAnalyticsService = {
  /**
   * Fetch Revenue Analytics data
   * @param period Time period filter ('today' | '7d' | '30d' | 'year')
   */
  async getRevenueAnalytics(period: string = '30d'): Promise<RevenueAnalyticsConfig> {
    // Simulated network delay for realistic async state handling
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      ...initialRevenueAnalytics,
      period: period as RevenueAnalyticsConfig['period'],
    };
  },

  /**
   * Fetch Account Distribution data
   */
  async getAccountDistribution(): Promise<AccountDistributionConfig> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      ...initialAccountDistribution,
    };
  },

  /**
   * Update Revenue Analytics configuration (e.g. from Admin settings or websocket sync)
   */
  async updateRevenueAnalytics(updates: Partial<RevenueAnalyticsConfig>): Promise<RevenueAnalyticsConfig> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return {
      ...initialRevenueAnalytics,
      ...updates,
    };
  },
};
