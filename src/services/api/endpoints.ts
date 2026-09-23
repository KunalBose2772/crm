/**
 * Central API Endpoints Registry
 * -------------------------------------------------------------
 * Map your backend API endpoints here. 
 * Toggle NEXT_PUBLIC_USE_MOCK_API to false in .env.local to hit your live server.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://nd1crm.testcrm.co.in/api';
export const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false'; // Defaults to true until backend is connected

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    adminLogin: '/auth/admin/login',
    logout: '/auth/logout',
    me: '/auth/me',
    refreshToken: '/auth/refresh',
  },
  dashboard: {
    stats: '/admin/dashboard/stats',
    volumeChart: '/admin/dashboard/volume-charts',
    recentActivity: '/admin/dashboard/recent-activity',
  },
  clients: {
    list: '/admin/clients',
    detail: (id: string) => `/admin/clients/${id}`,
    updateStatus: (id: string) => `/admin/clients/${id}/status`,
    create: '/admin/clients',
    update: (id: string) => `/admin/clients/${id}`,
    accounts: (clientId: string) => `/admin/clients/${clientId}/accounts`,
  },
  kyc: {
    list: '/admin/kyc-verification',
    detail: (id: string) => `/admin/kyc-verification/${id}`,
    approve: (id: string) => `/admin/kyc-verification/${id}/approve`,
    reject: (id: string) => `/admin/kyc-verification/${id}/reject`,
  },
  deposits: {
    list: '/admin/deposits',
    approve: (id: string) => `/admin/deposits/${id}/approve`,
    reject: (id: string) => `/admin/deposits/${id}/reject`,
  },
  withdrawals: {
    list: '/admin/withdrawals',
    approve: (id: string) => `/admin/withdrawals/${id}/approve`,
    process: (id: string) => `/admin/withdrawals/${id}/process`,
    reject: (id: string) => `/admin/withdrawals/${id}/reject`,
  },
  payments: {
    addPayment: '/admin/payments/manual-adjustment',
    paymentGateways: '/admin/payments/gateways',
    history: '/admin/payments/history',
  },
  transactions: {
    list: '/admin/transactions',
    exportCsv: '/admin/transactions/export',
  },
  ib: {
    partnersList: '/admin/ib/partners',
    config: '/admin/ib/configuration',
    updateTiers: '/admin/ib/tiers',
    withdrawalsList: '/admin/ib/withdrawals',
    approveWithdrawal: (id: string) => `/admin/ib/withdrawals/${id}/approve`,
    rejectWithdrawal: (id: string) => `/admin/ib/withdrawals/${id}/reject`,
  },
  settings: {
    general: '/admin/settings/general',
    tradingServers: '/admin/settings/trading-servers',
    security: '/admin/settings/security',
  }
};
