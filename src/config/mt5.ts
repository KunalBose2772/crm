export type MT5AccountType = 'BASIC' | 'STANDARD' | 'VVIP' | 'GRP4' | 'GRP5';

export interface MT5GroupConfig {
  id: MT5AccountType;
  name: string;
  group: string;
  tag: string;
  server: string;
  deposit: string;
  minDeposit: number;
  maxDeposit?: number;
  defaultLeverage: string;
  maxLeverage: string;
  description: string;
  features: string[];
  highlightsCount: number;
}

export const MT5_CONFIG = {
  serverHost: process.env.MT5_SERVER_HOST || 'access.tgshost.org',
  serverPort: parseInt(process.env.MT5_SERVER_PORT || '26043', 10),
  managerLogin: process.env.MT5_MANAGER_LOGIN || '',
  apiPassword: process.env.MT5_API_PASSWORD || '',
  serverName: process.env.NEXT_PUBLIC_MT5_SERVER_NAME || 'TheKFMarket-Live',
};

export const MT5_ACCOUNT_MAPPING: Record<'BASIC' | 'STANDARD' | 'VVIP', MT5GroupConfig> = {
  BASIC: {
    id: 'BASIC',
    name: 'BASIC',
    group: 'crmtest\\grp1',
    tag: 'Starter Account',
    server: MT5_CONFIG.serverName,
    deposit: '$5.00 – $2,500',
    minDeposit: 5,
    maxDeposit: 2500,
    defaultLeverage: '1:100',
    maxLeverage: '1:300',
    description: 'Engineered for new market entrants with negative balance protection',
    features: [
      'Zero commission per lot',
      'Standard tight spreads',
      'Direct email & desk support',
      'Real-time risk telemetry',
      'Instant server onboarding',
    ],
    highlightsCount: 5,
  },
  STANDARD: {
    id: 'STANDARD',
    name: 'STANDARD',
    group: 'crmtest\\grp2',
    tag: 'Professional Account',
    server: MT5_CONFIG.serverName,
    deposit: '$3,000 – $4,000',
    minDeposit: 3000,
    maxDeposit: 4000,
    defaultLeverage: '1:300',
    maxLeverage: '1:500',
    description: 'Optimized for high-volume active traders requiring sub-millisecond execution',
    features: [
      'Tighter spreads from 0.8 pips',
      'Sub-millisecond execution routing',
      'Dedicated trading account manager',
      'Full Expert Advisor (EA) access',
      'Live market liquidity feeds',
    ],
    highlightsCount: 5,
  },
  VVIP: {
    id: 'VVIP',
    name: 'VVIP',
    group: 'crmtest\\grp3',
    tag: 'Partner / IB Account',
    server: MT5_CONFIG.serverName,
    deposit: '$5,000 – $10,000',
    minDeposit: 5000,
    maxDeposit: 10000,
    defaultLeverage: '1:200',
    maxLeverage: '1:200',
    description: 'Exclusive tier with institutional multi-level rebates and white-glove service',
    features: [
      'Multi-tier commission rebates',
      'Live partner network analytics',
      'Institutional order execution',
      'Comprehensive audit reporting',
      'Priority withdrawal processing',
    ],
    highlightsCount: 5,
  },
};
