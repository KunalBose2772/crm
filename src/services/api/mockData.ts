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
    tierName: 'Standard',
    minLots: 0,
    forexRebatePerLot: 5.0,
    metalsRebatePerLot: 6.0,
    cryptoRebatePerLot: 10.0,
    indicesRebatePerLot: 3.0,
    subIbSharePercent: 10,
  },
  {
    tierName: 'Silver',
    minLots: 250,
    forexRebatePerLot: 7.0,
    metalsRebatePerLot: 8.5,
    cryptoRebatePerLot: 14.0,
    indicesRebatePerLot: 5.0,
    subIbSharePercent: 15,
  },
  {
    tierName: 'Gold',
    minLots: 1000,
    forexRebatePerLot: 9.5,
    metalsRebatePerLot: 11.0,
    cryptoRebatePerLot: 18.0,
    indicesRebatePerLot: 8.0,
    subIbSharePercent: 20,
  },
  {
    tierName: 'VIP',
    minLots: 2500,
    forexRebatePerLot: 12.0,
    metalsRebatePerLot: 15.0,
    cryptoRebatePerLot: 22.0,
    indicesRebatePerLot: 10.0,
    subIbSharePercent: 25,
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
