import { IBTierConfig, IBPartner } from '@/types/crm';

export interface TierEvaluationResult {
  currentTier: string;
  nextTier: IBTierConfig | null;
  isEligibleForPromotion: boolean;
  promotedToTier: IBTierConfig | null;
  progressLots: number; // 0 to 100
  progressTrades: number; // 0 to 100
  progressClients: number; // 0 to 100
  overallProgress: number; // 0 to 100
  remainingLots: number;
  remainingTrades: number;
  remainingClients: number;
}

/**
 * Calculates current tier progression and determines if an IB has achieved promotion thresholds.
 */
export function evaluatePartnerTier(
  partner: {
    tier?: string;
    totalVolumeLots?: number;
    totalTradesCount?: number;
    activeClientsCount?: number;
  },
  tiers: IBTierConfig[]
): TierEvaluationResult {
  // Sort tiers by minimum lots ascending
  const sortedTiers = [...tiers].sort((a, b) => a.minLots - b.minLots);
  const currentTierName = partner.tier || 'Silver';

  const lots = partner.totalVolumeLots || 0;
  const trades = partner.totalTradesCount || 0;
  const clients = partner.activeClientsCount || 0;

  // Find the highest tier the partner qualifies for based on threshold clauses
  let eligibleTier = sortedTiers[0] || { tierName: 'Silver', minLots: 0 };
  for (const t of sortedTiers) {
    const lotThreshold = t.minLots || 0;
    const tradesThreshold = t.minTrades || 0;
    const clientsThreshold = t.minActiveClients || 0;

    // A partner meets promotion requirements if they meet the lot threshold
    // and if specified, their trade count or active clients reach the requirement
    const meetsLots = lots >= lotThreshold;
    const meetsTrades = tradesThreshold === 0 || trades >= tradesThreshold;
    const meetsClients = clientsThreshold === 0 || clients >= clientsThreshold;

    if (meetsLots && (meetsTrades || meetsClients || lotThreshold === 0)) {
      eligibleTier = t;
    }
  }

  // Find index of current tier
  const currentIndex = sortedTiers.findIndex(
    t => t.tierName.toLowerCase() === currentTierName.toLowerCase()
  );
  const nextTier = currentIndex >= 0 && currentIndex < sortedTiers.length - 1
    ? sortedTiers[currentIndex + 1]
    : null;

  // Calculate progress towards next tier
  let progressLots = 100;
  let progressTrades = 100;
  let progressClients = 100;
  let remainingLots = 0;
  let remainingTrades = 0;
  let remainingClients = 0;

  if (nextTier) {
    const targetLots = nextTier.minLots || 1;
    const targetTrades = nextTier.minTrades || 1;
    const targetClients = nextTier.minActiveClients || 1;

    remainingLots = Math.max(0, targetLots - lots);
    remainingTrades = Math.max(0, targetTrades - trades);
    remainingClients = Math.max(0, targetClients - clients);

    progressLots = Math.min(100, Math.round((lots / targetLots) * 100));
    progressTrades = Math.min(100, Math.round((trades / targetTrades) * 100));
    progressClients = Math.min(100, Math.round((clients / targetClients) * 100));
  }

  // Overall average progress towards next promotion
  const overallProgress = nextTier
    ? Math.round((progressLots + progressTrades + progressClients) / 3)
    : 100;

  // Check if promotion is needed (i.e. qualified tier is higher in index than current tier)
  const qualifiedIndex = sortedTiers.findIndex(
    t => t.tierName.toLowerCase() === eligibleTier.tierName.toLowerCase()
  );
  const isEligibleForPromotion = qualifiedIndex > (currentIndex >= 0 ? currentIndex : 0);

  return {
    currentTier: currentTierName,
    nextTier,
    isEligibleForPromotion,
    promotedToTier: isEligibleForPromotion ? eligibleTier : null,
    progressLots,
    progressTrades,
    progressClients,
    overallProgress,
    remainingLots,
    remainingTrades,
    remainingClients,
  };
}
