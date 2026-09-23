export type VerificationStatus = 'verified' | 'pending' | 'unverified' | 'rejected' | 'suspended';
export type TransactionStatus = 'pending' | 'completed' | 'processing' | 'rejected' | 'failed';
export type PaymentMethod = 'USDT_TRC20' | 'USDT_ERC20' | 'Bank_Wire' | 'Credit_Card' | 'Skrill' | 'Neteller' | 'Local_Bank';
export type TransactionType = 'deposit' | 'withdrawal' | 'credit_bonus' | 'debit_correction' | 'internal_transfer' | 'transfer' | 'ib_commission';

export interface TradingAccount {
  id: string;
  login: number;
  platform: 'MT4' | 'MT5' | 'cTrader';
  type: 'Standard' | 'ECN' | 'Pro' | 'Islamic';
  currency: string;
  balance: number;
  equity: number;
  freeMargin: number;
  marginLevel: number;
  leverage: string;
  server: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  registeredAt: string;
  status: VerificationStatus;
  ibId?: string;
  ibName?: string;
  totalDeposit: number;
  totalWithdrawal: number;
  netDeposit: number;
  totalBalance: number;
  accounts: TradingAccount[];
  notes?: string;
  emailVerified?: boolean;
  kycVerified?: boolean;
  ibPartnerStatus?: 'active' | 'inactive' | 'None';
}

export interface KYCRecord {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  country: string;
  dob?: string;
  accountNumber?: string;
  documentType: 'Passport' | 'National_ID' | 'Driving_License' | 'Proof_of_Address';
  documentNumber: string;
  frontImageUrl: string;
  backImageUrl?: string;
  submittedAt: string;
  status: VerificationStatus;
  reviewedDocsCount?: number;
  totalDocsCount?: number;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface DepositRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  tradingAccountId: string;
  accountLogin: number;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod | string;
  txHash?: string;
  proofDocumentUrl?: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
  remarks?: string;
  plan?: string;
}

export interface WithdrawalRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  tradingAccountId: string;
  accountLogin: number;
  requestedAmount: number;
  currency: string;
  fee: number;
  netAmount: number;
  destinationType: 'Bank_Account' | 'Crypto_Wallet';
  destinationDetails: {
    bankName?: string;
    accountHolder?: string;
    accountNumber?: string;
    iban?: string;
    swiftCode?: string;
    walletAddress?: string;
    network?: string;
  };
  clientBalance: number;
  clientEquity: number;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
  rejectReason?: string;
  plan?: string;
  paymentMethod?: string;
}

export interface Transaction {
  id: string;
  referenceId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  accountLogin?: number;
  type: TransactionType;
  amount: number;
  fee: number;
  currency: string;
  status: TransactionStatus;
  method: string;
  timestamp: string;
  description: string;
  plan?: string;
}

export interface IBPartner {
  id: string;
  name: string;
  email: string;
  tier: 'Gold' | 'Platinum' | 'Diamond' | 'VIP';
  referralCode: string;
  activeClientsCount: number;
  totalVolumeLots: number;
  totalCommissionEarned: number;
  withdrawableCommission: number;
  status: 'active' | 'inactive';
  joinedAt: string;
  rebatePerLotUsd: number;
  subIbCount: number;
}

export interface IBWithdrawalRequest {
  id: string;
  ibId: string;
  ibName: string;
  ibEmail: string;
  amount: number;
  walletAddress?: string;
  bankDetails?: string;
  status: TransactionStatus;
  createdAt: string;
  notes?: string;
}

export interface IBTierConfig {
  tierName: string;
  minLots: number;
  forexRebatePerLot: number;
  metalsRebatePerLot: number;
  cryptoRebatePerLot: number;
  indicesRebatePerLot: number;
  subIbSharePercent: number;
}

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalDepositsVolume: number;
  totalWithdrawalsVolume: number;
  netCashFlow: number;
  pendingDepositsCount: number;
  pendingWithdrawalsCount: number;
  pendingKycCount: number;
  totalTradingVolumeLots: number;
  activeIbsCount: number;
  depositsTrendPercent: number;
  withdrawalsTrendPercent: number;
}

// API Configurable Data Model for Revenue Analytics
export interface RevenueAnalyticsConfig {
  netRevenue: number;
  netRevenueChange: number;
  ibCommission: number;
  ibTradingVolume: number;
  depositsAmount: number;
  withdrawalsAmount: number;
  depositsTrend: number;
  withdrawalsTrend: number;
  period?: 'today' | '7d' | '30d' | 'year';
  chartType?: 'radial' | 'bar' | 'line';
}

// API Configurable Data Model for Account Distribution
export interface AccountCategoryItem {
  id: string;
  name: string;
  count: number;
  color: string;
  badgeColor?: string;
  percentage?: number;
}

export interface AccountDistributionConfig {
  title?: string;
  periodLabel?: string;
  categories: AccountCategoryItem[];
  totalAccountTypes?: number;
  totalAccountsCount?: number;
}

// API Configurable Data Model for Today's Performance (Image 1 & 3)
export interface TodaysPerformanceConfig {
  dateLabel?: string;
  lastUpdated?: string;
  totalNetDeposits: number;
  totalNetDepositsChange?: number;
  grossInflows: number;
  grossInflowsChange?: number;
  grossOutflows: number;
  grossOutflowsChange?: number;
  totalRegisteredClients: number;
  totalRegisteredClientsChange?: number;
  netFlowToday?: number;
  depositRate?: number;
  withdrawalRate?: number;
  avgDeposit?: number;
}

// Top Performing Clients Leaderboard (Image 2)
export interface TopPerformingClient {
  id: string;
  rank: number;
  nameOrEmail: string;
  depositsCount: number;
  accountsCount: number;
  totalDeposited: number;
}

export interface PaymentGatewayConfig {
  id: string;
  name: string;
  paymentType: 'Crypto Wallet' | 'Bank Account' | 'Credit Card' | 'Other';
  status: 'active' | 'inactive';
  accountDetails: {
    walletAddress?: string;
    network?: string;
    qrCodeUrl?: string;
    bankName?: string;
    accountHolder?: string;
    accountNumber?: string;
    iban?: string;
    swiftCode?: string;
    branch?: string;
    instructions?: string;
  };
  createdAt: string;
}



