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
  PaymentGatewayConfig
} from '@/types/crm';

export const initialClients: Client[] = [];
export const initialKYCRecords: KYCRecord[] = [];
export const initialDeposits: DepositRequest[] = [];
export const initialWithdrawals: WithdrawalRequest[] = [];
export const initialTransactions: Transaction[] = [];
export const initialIBPartners: IBPartner[] = [];
export const initialIBWithdrawals: IBWithdrawalRequest[] = [];

export const initialIBTiers: IBTierConfig[] = [
  {
    tierName: 'Silver',
    minLots: 0,
    minTrades: 0,
    minActiveClients: 0,
    forexRebatePerLot: 6.0,
    metalsRebatePerLot: 8.0,
    cryptoRebatePerLot: 12.0,
    indicesRebatePerLot: 4.0,
    subIbSharePercent: 10,
    description: 'Entry-level partner status assigned to every new IB by default.',
  },
  {
    tierName: 'Gold',
    minLots: 50,
    minTrades: 100,
    minActiveClients: 5,
    forexRebatePerLot: 8.0,
    metalsRebatePerLot: 10.0,
    cryptoRebatePerLot: 15.0,
    indicesRebatePerLot: 6.0,
    subIbSharePercent: 15,
    description: 'Promoted once minimum 50 lots, 100 trades or 5 active traders are reached.',
  },
  {
    tierName: 'Platinum',
    minLots: 150,
    minTrades: 300,
    minActiveClients: 15,
    forexRebatePerLot: 10.0,
    metalsRebatePerLot: 12.0,
    cryptoRebatePerLot: 18.0,
    indicesRebatePerLot: 8.0,
    subIbSharePercent: 20,
    description: 'Promoted once minimum 150 lots, 300 trades or 15 active traders are reached.',
  },
  {
    tierName: 'Diamond',
    minLots: 400,
    minTrades: 800,
    minActiveClients: 35,
    forexRebatePerLot: 12.0,
    metalsRebatePerLot: 15.0,
    cryptoRebatePerLot: 22.0,
    indicesRebatePerLot: 10.0,
    subIbSharePercent: 25,
    description: 'Elite partner status for large volume networks and high trade turnover.',
  },
  {
    tierName: 'VIP',
    minLots: 1000,
    minTrades: 2000,
    minActiveClients: 75,
    forexRebatePerLot: 15.0,
    metalsRebatePerLot: 20.0,
    cryptoRebatePerLot: 30.0,
    indicesRebatePerLot: 12.0,
    subIbSharePercent: 30,
    description: 'Institutional level top-bracket tier with maximum spreads & sub-IB splits.',
  },
];

export const initialStats: DashboardStats = {
  totalClients: 0,
  activeClients: 0,
  totalDepositsVolume: 0,
  totalWithdrawalsVolume: 0,
  netCashFlow: 0,
  pendingDepositsCount: 0,
  pendingWithdrawalsCount: 0,
  pendingKycCount: 0,
  totalTradingVolumeLots: 0,
  activeIbsCount: 0,
  depositsTrendPercent: 0,
  withdrawalsTrendPercent: 0,
};

export const initialPaymentGateways: PaymentGatewayConfig[] = [];
