/** Illustrative CSP outcomes for executive-session narrative — not measured in sandbox data. */

export const EXECUTIVE_DISCLAIMER =
  'Illustrative outcomes — representative CSP operating model, not measured in this sandbox.';

export const P1_BASELINE_MONTHLY = 48;
export const P1_REDUCTION_TARGET_PCT = 60;
export const MTTR_BEFORE_HOURS = 4.2;
export const MTTR_AFTER_MINUTES = 18;

export function computeP1Outcomes(
  baseline = P1_BASELINE_MONTHLY,
  reductionPct = P1_REDUCTION_TARGET_PCT,
) {
  const prevented = Math.round(baseline * reductionPct / 100);
  const after = baseline - prevented;
  return {
    baseline,
    after,
    prevented,
    reductionPct,
    mttrBeforeHours: MTTR_BEFORE_HOURS,
    mttrAfterMinutes: MTTR_AFTER_MINUTES,
  };
}

/**
 * Estimate subscriber churn exposure from region SLA / performance signals.
 * Uses session volume as a proxy for active subscribers in the region.
 */
export function estimateChurnRisk({
  sessions24h = 0,
  successRate = 99.9,
  sloStatus = 'healthy',
  sloCurrent,
  sloTarget = 99.9,
  tier = 'Standard',
  regionName = 'Region',
  regionId,
}) {
  const activeSubs = Math.max(1200, Math.round(sessions24h * 0.38));

  let slaGap = 0;
  if (sloStatus && sloStatus !== 'healthy') {
    slaGap = sloStatus === 'at_risk' ? 0.35 : 0.55;
  } else if (sloCurrent != null && sloTarget != null && sloCurrent < sloTarget) {
    slaGap = Math.min(0.6, (sloTarget - sloCurrent) / 5);
  }

  const perfGap = successRate >= 99.7 ? 0 : Math.min(0.35, (99.7 - successRate) / 8);

  const tierKey = String(tier).toLowerCase();
  const tierMultiplier = tierKey.includes('enterprise') || tierKey.includes('tier-1') || tierKey.includes('tier 1')
    ? 2.4
    : tierKey.includes('premium') || tierKey.includes('tier-2')
      ? 1.6
      : 1;

  const riskScore = Math.min(1, (slaGap + perfGap) * tierMultiplier);
  const subscribersAtRisk = Math.round(activeSubs * riskScore);
  const arpuMonthly = tierMultiplier >= 2 ? 95 : tierMultiplier > 1 ? 78 : 62;
  const monthlyExposureUsd = Math.round(subscribersAtRisk * arpuMonthly * 0.12);
  const churnDeltaPct = riskScore > 0.15 ? Number((0.06 + riskScore * 0.14).toFixed(2)) : 0;

  return {
    subscribersAtRisk,
    activeSubs,
    riskScore,
    monthlyExposureUsd,
    churnDeltaPct,
    severity: riskScore > 0.5 ? 'high' : riskScore > 0.2 ? 'medium' : 'low',
    regionName,
    regionId,
  };
}

export function streamsRetentionSavings({ fullRetentionCostMonthly = 1_240_000 } = {}) {
  const savingsLowPct = 60;
  const savingsHighPct = 80;
  return {
    fullRetentionCostMonthly,
    optimizedLow: Math.round(fullRetentionCostMonthly * (1 - savingsLowPct / 100)),
    optimizedHigh: Math.round(fullRetentionCostMonthly * (1 - savingsHighPct / 100)),
    savingsLowPct,
    savingsHighPct,
    sampledSignalsPct: 72,
    fullResolutionSignalsPct: 28,
  };
}

export function formatUsd(value) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value.toLocaleString()}`;
}

export function formatSubscriberCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}
