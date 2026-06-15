/**
 * Cost calculator for observability data volumes.
 * Elastic Serverless rates from official Observability pricing (effective Nov 1, 2025).
 * @see https://www.elastic.co/pricing/serverless-observability
 */

export const ELASTIC_SERVERLESS_PRICING_URL = 'https://www.elastic.co/pricing/serverless-observability';
export const ELASTIC_PRICING_EFFECTIVE = 'November 1, 2025';

/**
 * Published Observability Serverless rates (elastic.co/pricing/serverless-observability).
 * Complete: logs + metrics + traces + ML + workflows. Logs Essentials: logs only.
 */
export const SERVERLESS_O11Y_PRICING = {
  complete: {
    label: 'Observability Complete',
    ingestPerGB: 0.09,
    retentionPerGBMonth: 0.019,
    egressPerGB: 0.05,
    egressFreeGB: 50,
    sourceNote: 'As low as $0.09/GB ingest · $0.019/GB retained/mo',
  },
  logsEssentials: {
    label: 'Logs Essentials',
    ingestPerGB: 0.07,
    retentionPerGBMonth: 0.017,
    egressPerGB: 0.05,
    egressFreeGB: 50,
    sourceNote: 'As low as $0.07/GB ingest · $0.017/GB retained/mo',
  },
};

/** Illustrative Telco-hosted on-prem Elastic — not on elastic.co; split-retention TCO only */
export const ON_PREM_ELASTIC_PRICING = {
  label: 'Telco-hosted Elastic (on-prem)',
  ingestPerGB: 0.018,
  retentionPerGBMonth: 0.0045,
  platformBaseMonthly: 18000,
  /** Workflows + A2A orchestration layer — not CCS cluster peering */
  a2aOrchestrationMonthly: 4500,
};

/** Illustrative enterprise commit discounts — observability calculator only (not Security tab) */
export const ENTERPRISE_DISCOUNTS = {
  /** 30% off published Serverless Observability Complete rates */
  serverlessPct: 30,
  /** 85% off illustrative self-managed / on-prem Elastic TCO */
  onPremPct: 85,
};

/** Telco production volumes from RFP / modernization planning (June 2026) */
export const PAYPAL_O11Y_VOLUMES = {
  logsTBPerDay: 3072,
  logsLabel: '3 PB/day',
  metricsPerMinute: 500_000_000,
  metricsLabel: '500M/min (~50 TB/day indexed)',
  spansPerMinute: 1_200_000_000,
  spansLabel: '1.2B spans/min (~3 PB/day indexed)',
};

/**
 * Volume commitment tiers for observability pricing.
 * Volumes scale by tier; enterprise discount is 30% Serverless / 85% on-prem at all tiers.
 */
export const OBSERVABILITY_VOLUME_TIERS = [
  {
    id: 'tier1',
    label: 'Tier 1 · Initial workloads',
    description: '100 TB/day logs · 50M metrics/min · 100M spans/min',
    logsTBPerDay: 100,
    metricsPerMinute: 50_000_000,
    spansPerMinute: 100_000_000,
    serverlessDiscountPct: ENTERPRISE_DISCOUNTS.serverlessPct,
    onPremDiscountPct: ENTERPRISE_DISCOUNTS.onPremPct,
  },
  {
    id: 'tier2',
    label: 'Tier 2 · Enterprise scale',
    description: '1 PB/day logs · 200M metrics/min · 500M spans/min',
    logsTBPerDay: 1024,
    metricsPerMinute: 200_000_000,
    spansPerMinute: 500_000_000,
    serverlessDiscountPct: ENTERPRISE_DISCOUNTS.serverlessPct,
    onPremDiscountPct: ENTERPRISE_DISCOUNTS.onPremPct,
  },
  {
    id: 'tier3',
    label: 'Tier 3 · Adoption at scale',
    description: '3 PB/day logs · 500M metrics/min · 1.2B spans/min',
    logsTBPerDay: PAYPAL_O11Y_VOLUMES.logsTBPerDay,
    metricsPerMinute: PAYPAL_O11Y_VOLUMES.metricsPerMinute,
    spansPerMinute: PAYPAL_O11Y_VOLUMES.spansPerMinute,
    serverlessDiscountPct: ENTERPRISE_DISCOUNTS.serverlessPct,
    onPremDiscountPct: ENTERPRISE_DISCOUNTS.onPremPct,
    isTelcoAnchor: true,
  },
];

function resolveDiscounts(discounts) {
  return {
    serverlessPct: discounts?.serverlessPct ?? ENTERPRISE_DISCOUNTS.serverlessPct,
    onPremPct: discounts?.onPremPct ?? ENTERPRISE_DISCOUNTS.onPremPct,
  };
}

function effectiveServerlessRates(discounts) {
  const { serverlessPct } = resolveDiscounts(discounts);
  const list = SERVERLESS_O11Y_PRICING.complete;
  const mult = discountMultiplier(serverlessPct);
  return {
    ingestPerGB: list.ingestPerGB * mult,
    retentionPerGBMonth: list.retentionPerGBMonth * mult,
    serverlessDiscountPct: serverlessPct,
  };
}

function effectiveOnPremRates(discounts) {
  const { onPremPct } = resolveDiscounts(discounts);
  const mult = discountMultiplier(onPremPct);
  return {
    ingestPerGB: ON_PREM_ELASTIC_PRICING.ingestPerGB * mult,
    retentionPerGBMonth: ON_PREM_ELASTIC_PRICING.retentionPerGBMonth * mult,
    onPremDiscountPct: onPremPct,
  };
}

function discountMultiplier(discountPct) {
  return 1 - discountPct / 100;
}

function applyDiscount(amount, discountPct) {
  const list = amount;
  const multiplier = discountMultiplier(discountPct);
  return {
    list: Math.round(list),
    discountPct,
    discountAmount: Math.round(list * (discountPct / 100)),
    total: Math.round(list * multiplier),
  };
}

/** Default split: short-retention Serverless + long-retention on-prem (separate ingest paths) */
export const HYBRID_DEFAULTS = {
  serverlessShare: 0.12,
  serverlessRetentionDays: 14,
  onPremRetentionDays: 730,
};

/** Honest architecture positioning — CCS Self-Managed ↔ Serverless is not GA today. */
export const FEDERATION_ARCHITECTURE = {
  todayPattern: 'A2A agent federation + Kibana Workflows',
  todayDetail:
    'Orchestrator agents call each boundary over HTTPS (Security, Search, Datadog, on-prem ES|QL proxies). '
    + 'No cluster peering — fits Serverless egress and DC firewall policies.',
  ccsRoadmap: 'Cross-Cluster Search (Self-Managed ↔ Serverless)',
  ccsRoadmapEta: 'FY27+ (long-term roadmap; not available for hybrid production today)',
  ccsRoadmapDetail:
    'Unified ES|QL across Serverless hot data and Telco DC archives requires product work on peering, '
    + 'network security, and Serverless-to-customer-DC connectivity — not shippable in current releases.',
  ccsNetworkNote:
    'CCS initiated from Serverless into a customer DC implies outbound cluster connectivity and data-path review. '
    + 'A2A uses explicit agent endpoints and scoped API calls instead.',
};

const PRICING = {
  /** Illustrative Datadog enterprise model — no single public GB rate at Telco scale */
  datadog: {
    logsPerGB: 0.15,
    /** Indexed logs + bundled APM/custom metrics on enterprise commits */
    signalUpliftBase: 0.38,
    signalUpliftPerMetricsM: 0.20,
    signalUpliftPerSpansM: 0.22,
    metricsBaselineM: 500,
    spansBaselineM: 1200,
    storagePerGBMonth: 0.048,
    flexArchivePerGBMonth: 0.012,
    basePlatformFee: 12000,
    maxRetentionDays: 15,
  },
  splunk: {
    /** Illustrative model of Telco's current Splunk ES + indexed storage stack */
    ingestPerGB: 0.15,
    storagePerGBMonth: 0.04,
    basePlatformFee: 8000,
  },
};

/** Splunk → Elastic Security capability mapping for Telco migration narrative */
export const SPLUNK_REPLACEMENT_MAP = [
  {
    splunk: 'Splunk Enterprise Security',
    elastic: 'Elastic Security SIEM',
    detail: 'Detection rules, correlation, and alert triage in Kibana Security',
  },
  {
    splunk: 'Splunk UBA',
    elastic: 'Entity Analytics + ML',
    detail: 'User/host risk scores, blast radius, and anomaly jobs on the same data tier',
  },
  {
    splunk: 'Splunk SOAR / Phantom',
    elastic: 'Kibana Workflows + Cases',
    detail: 'Case management, connector-driven response, and agentic automation',
  },
  {
    splunk: 'Indexed cold / frozen tiers',
    elastic: 'Search AI Lake',
    detail: 'Searchable multi-year retention without rehydration — sub-2s at Telco scale',
  },
  {
    splunk: 'Splunk forwarders + add-ons',
    elastic: 'Elastic Agent + 650+ integrations',
    detail: 'Unified collection for logs, cloud audit, endpoint, and PCI-scoped sources',
  },
];

export const HYBRID_CAPABILITIES = [
  {
    id: 'a2a',
    title: 'A2A federation (available today)',
    detail: FEDERATION_ARCHITECTURE.todayDetail,
    datadogLimit: 'Datadog: no native agent-to-agent orchestration across Elastic projects or customer DC boundaries.',
  },
  {
    id: 'retention',
    title: 'Split retention economics',
    detail: '14-day Serverless hot tier on a subset of ingest; full corpus archived on Telco hardware for multi-year retention — separate ingest paths, not CCS-linked.',
    datadogLimit: 'Datadog: 15-day default log retention; long archive requires costly indexable or flex tiers.',
  },
  {
    id: 'ccs-roadmap',
    title: 'CCS Self-Managed ↔ Serverless (roadmap only)',
    detail: `${FEDERATION_ARCHITECTURE.ccsRoadmap} — ${FEDERATION_ARCHITECTURE.ccsRoadmapEta}. ${FEDERATION_ARCHITECTURE.ccsNetworkNote}`,
    datadogLimit: 'Not a Datadog comparison — future Elastic capability. Use A2A agents or tier-specific queries until CCS ships.',
  },
];

export function formatBytes(bytes) {
  if (bytes >= 1e15) return `${(bytes / 1e15).toFixed(2)} PB`;
  if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(2)} TB`;
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`;
  return `${bytes} B`;
}

export function formatNumber(n) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(0);
}

/** Compact USD for narrow cost cards — full value available via title/tooltip */
export function formatCompactUsd(n) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

export function formatCompactCount(n) {
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(Math.round(n));
}

/**
 * Telco RFP reference rate: 1.2B spans/min.
 * At ~2KB indexed per span in Elasticsearch ≈ 3 PB/day — not 5 TB/day.
 */
export const RFP_TRACE_SPANS_PER_MIN = 1_200_000_000;
export const INDEXED_BYTES_PER_SPAN = 2000;
export const RFP_MISSTATED_TRACE_TB_PER_DAY = 5;

/** Convert spans/min → daily indexed trace volume (binary TB/PB). */
export function traceVolumeFromSpansPerMinute(
  spansPerMinute,
  bytesPerSpan = INDEXED_BYTES_PER_SPAN,
) {
  const spansPerDay = spansPerMinute * 60 * 24;
  const bytesPerDay = spansPerDay * bytesPerSpan;
  const tbPerDay = bytesPerDay / (1024 ** 4);
  const pbPerDay = tbPerDay / 1024;
  const gbPerDay = bytesPerDay / (1024 ** 3);

  return {
    spansPerMinute,
    spansPerMinMillions: spansPerMinute / 1e6,
    spansPerDay,
    bytesPerSpan,
    gbPerDay,
    tbPerDay,
    pbPerDay,
  };
}

export function formatDailyVolume(tbPerDay) {
  if (tbPerDay >= 1024) {
    const pb = tbPerDay / 1024;
    return `${pb >= 10 ? pb.toFixed(1) : pb.toFixed(2)} PB/day`;
  }
  return `${tbPerDay >= 100 ? Math.round(tbPerDay) : tbPerDay.toFixed(1)} TB/day`;
}

export function formatTraceRate(spansPerMinute) {
  const m = spansPerMinute / 1e6;
  if (m >= 1000) return `${(m / 1000).toFixed(2)}B/min`;
  if (m >= 1) return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M/min`;
  return `${(spansPerMinute / 1000).toFixed(0)}K/min`;
}

/** RFP trace volume cross-check for capacity planning. */
export function rfpTraceVolumeValidation(spansPerMinute = RFP_TRACE_SPANS_PER_MIN) {
  const volume = traceVolumeFromSpansPerMinute(spansPerMinute);
  const misstatedBytesPerSpan = (RFP_MISSTATED_TRACE_TB_PER_DAY * (1024 ** 4)) / volume.spansPerDay;

  return {
    ...volume,
    rfpSpansPerMin: spansPerMinute,
    rfpMisstatedTbPerDay: RFP_MISSTATED_TRACE_TB_PER_DAY,
    misstatedBytesPerSpan: Math.round(misstatedBytesPerSpan),
    planningVolumeLabel: formatDailyVolume(volume.tbPerDay),
    summary:
      `${formatTraceRate(spansPerMinute)} → ${formatDailyVolume(volume.tbPerDay)} at ~${INDEXED_BYTES_PER_SPAN.toLocaleString()} B/span indexed. `
      + `RFP "5 TB/day" would require ~${Math.max(1, Math.round(misstatedBytesPerSpan))} B/span — use span rate for capacity planning.`,
  };
}

/** Estimated metrics/traces GB added to log volume (Elastic bills all signals as ingested GB) */
function signalOverhead(metricsPerMinute, spansPerMinute) {
  const metricsM = metricsPerMinute / 1e6;
  const spansM = spansPerMinute / 1e6;
  return 1 + (metricsM / 500) * 0.15 + (spansM / 1200) * 0.25;
}

function totalIngestGBPerDay(logsTBPerDay, metricsPerMinute, spansPerMinute) {
  return logsTBPerDay * 1024 * signalOverhead(metricsPerMinute, spansPerMinute);
}

/**
 * Elastic Serverless: ingest GB/month × rate + stored GB × retention rate.
 * Stored GB = daily ingested GB × retention days (Search AI Lake rolling window).
 */
export function calculateServerlessRetentionCost({
  logsTBPerDay = 100,
  retentionDays = 90,
  metricsPerMinute = 500_000_000,
  spansPerMinute = 1_200_000_000,
  tier = 'complete',
  discounts,
} = {}) {
  const pricing = SERVERLESS_O11Y_PRICING[tier] || SERVERLESS_O11Y_PRICING.complete;
  const { serverlessPct } = resolveDiscounts(discounts);
  const ingestGBPerDay = totalIngestGBPerDay(logsTBPerDay, metricsPerMinute, spansPerMinute);
  const ingestGBPerMonth = ingestGBPerDay * 30;
  const storedGB = ingestGBPerDay * retentionDays;

  const ingestCostMonthlyList = ingestGBPerMonth * pricing.ingestPerGB;
  const retentionCostMonthlyList = storedGB * pricing.retentionPerGBMonth;
  const ingestDiscounted = applyDiscount(ingestCostMonthlyList, serverlessPct);
  const retentionDiscounted = applyDiscount(retentionCostMonthlyList, serverlessPct);
  const totalList = ingestCostMonthlyList + retentionCostMonthlyList;

  return {
    tier: pricing.label,
    pricingSource: ELASTIC_SERVERLESS_PRICING_URL,
    pricingEffective: ELASTIC_PRICING_EFFECTIVE,
    enterpriseDiscountPct: serverlessPct,
    retentionDays,
    ingestGBPerDay: Math.round(ingestGBPerDay),
    ingestGBPerMonth: Math.round(ingestGBPerMonth),
    storedGB: Math.round(storedGB),
    storedTB: storedGB / 1024,
    ingestCostMonthlyList: Math.round(ingestCostMonthlyList),
    retentionCostMonthlyList: Math.round(retentionCostMonthlyList),
    totalMonthlyList: Math.round(totalList),
    ingestCostMonthly: ingestDiscounted.total,
    retentionCostMonthly: retentionDiscounted.total,
    totalMonthly: ingestDiscounted.total + retentionDiscounted.total,
    ingestRate: pricing.ingestPerGB,
    retentionRate: pricing.retentionPerGBMonth,
    sourceNote: pricing.sourceNote,
    pricingUrl: ELASTIC_SERVERLESS_PRICING_URL,
  };
}

/** Split deployment: Serverless hot tier + on-prem archive — federated via A2A, not CCS today */
export function calculateHybridElasticCost({
  logsTBPerDay = 100,
  metricsPerMinute = 500_000_000,
  spansPerMinute = 1_200_000_000,
  serverlessShare = HYBRID_DEFAULTS.serverlessShare,
  serverlessRetentionDays = HYBRID_DEFAULTS.serverlessRetentionDays,
  onPremRetentionDays = HYBRID_DEFAULTS.onPremRetentionDays,
  discounts,
} = {}) {
  const slPricing = SERVERLESS_O11Y_PRICING.complete;
  const opPricing = ON_PREM_ELASTIC_PRICING;
  const { serverlessPct, onPremPct } = resolveDiscounts(discounts);
  const scaleFactor = Math.min(1, Math.max(0.35, logsTBPerDay / 1024));
  const ingestGBPerDay = totalIngestGBPerDay(logsTBPerDay, metricsPerMinute, spansPerMinute);

  // Hot path: subset of ingest for ML, alerting, and federated workflows on Serverless.
  const slIngestGBDay = ingestGBPerDay * serverlessShare;
  const slStoredGB = slIngestGBDay * serverlessRetentionDays;

  // Archive path: full corpus indexed on-prem for long retention (compliance / Search AI Lake cold tier).
  const opIngestGBDay = ingestGBPerDay;
  const opStoredGB = ingestGBPerDay * onPremRetentionDays;

  const slIngestMonthlyList = slIngestGBDay * 30 * slPricing.ingestPerGB;
  const slRetentionMonthlyList = slStoredGB * slPricing.retentionPerGBMonth;

  const opIngestMonthlyList = opIngestGBDay * 30 * opPricing.ingestPerGB;
  const opRetentionMonthlyList = opStoredGB * opPricing.retentionPerGBMonth;

  const platformList = Math.round(opPricing.platformBaseMonthly * (0.6 + scaleFactor * 0.8));
  const a2aOrchestrationList = Math.round(
    opPricing.a2aOrchestrationMonthly * (1 + scaleFactor * 2)
    + logsTBPerDay * 20,
  );

  const slIngestMonthly = applyDiscount(slIngestMonthlyList, serverlessPct).total;
  const slRetentionMonthly = applyDiscount(slRetentionMonthlyList, serverlessPct).total;
  const opIngestMonthly = applyDiscount(opIngestMonthlyList, onPremPct).total;
  const opRetentionMonthly = applyDiscount(opRetentionMonthlyList, onPremPct).total;
  const platform = applyDiscount(platformList, onPremPct).total;
  const a2aOrchestration = applyDiscount(a2aOrchestrationList, onPremPct).total;

  const serverlessTotalList = slIngestMonthlyList + slRetentionMonthlyList;
  const onPremTotalList = opIngestMonthlyList + opRetentionMonthlyList + platformList + a2aOrchestrationList;
  const serverlessTotal = slIngestMonthly + slRetentionMonthly;
  const onPremTotal = opIngestMonthly + opRetentionMonthly + platform + a2aOrchestration;

  return {
    label: 'Split deployment (Serverless + Telco on-prem)',
    architecture: FEDERATION_ARCHITECTURE.todayPattern,
    ingestModel:
      `${Math.round(serverlessShare * 100)}% of daily ingest on Serverless hot tier (${serverlessRetentionDays}d); `
      + '100% of corpus archived on-prem for long retention.',
    serverlessShare,
    serverlessRetentionDays,
    onPremRetentionDays,
    serverless: {
      sharePct: Math.round(serverlessShare * 100),
      retentionDays: serverlessRetentionDays,
      ingestGBPerDay: slIngestGBDay,
      storedTB: slStoredGB / 1024,
      enterpriseDiscountPct: serverlessPct,
      ingest: slIngestMonthly,
      retention: slRetentionMonthly,
      total: serverlessTotal,
      totalList: Math.round(serverlessTotalList),
    },
    onPrem: {
      archivePct: 100,
      retentionDays: onPremRetentionDays,
      ingestGBPerDay: opIngestGBDay,
      storedTB: opStoredGB / 1024,
      enterpriseDiscountPct: onPremPct,
      ingest: opIngestMonthly,
      retention: opRetentionMonthly,
      platform,
      a2aOrchestration,
      total: onPremTotal,
      totalList: Math.round(onPremTotalList),
    },
    federation: {
      pattern: FEDERATION_ARCHITECTURE.todayPattern,
      a2aOrchestrationCost: a2aOrchestration,
      ccsRoadmap: FEDERATION_ARCHITECTURE.ccsRoadmapEta,
    },
    ingest: slIngestMonthly + opIngestMonthly,
    storage: slRetentionMonthly + opRetentionMonthly,
    platform: platform + a2aOrchestration,
    total: serverlessTotal + onPremTotal,
    totalList: Math.round(serverlessTotalList + onPremTotalList),
  };
}

/** 100% self-managed Elastic in Telco DC — no Serverless, no A2A federation */
export function calculateSelfHostedElasticCost({
  logsTBPerDay = 100,
  metricsPerMinute = 500_000_000,
  spansPerMinute = 1_200_000_000,
  retentionDays = 365,
  discounts,
} = {}) {
  const opPricing = ON_PREM_ELASTIC_PRICING;
  const { onPremPct } = resolveDiscounts(discounts);
  const scaleFactor = Math.min(1, Math.max(0.35, logsTBPerDay / 1024));
  const ingestGBPerDay = totalIngestGBPerDay(logsTBPerDay, metricsPerMinute, spansPerMinute);

  const ingestMonthlyList = ingestGBPerDay * 30 * opPricing.ingestPerGB;
  const storedGB = ingestGBPerDay * retentionDays;
  const retentionMonthlyList = storedGB * opPricing.retentionPerGBMonth;
  const platformList = Math.round(opPricing.platformBaseMonthly * (0.6 + scaleFactor * 0.8));
  const totalList = ingestMonthlyList + retentionMonthlyList + platformList;

  const ingestMonthly = applyDiscount(ingestMonthlyList, onPremPct).total;
  const retentionMonthly = applyDiscount(retentionMonthlyList, onPremPct).total;
  const platform = applyDiscount(platformList, onPremPct).total;

  return {
    label: 'Self-hosted Elastic (Telco DC)',
    architecture: 'Single self-managed cluster — all ingest and retention on-prem',
    enterpriseDiscountPct: onPremPct,
    retentionDays,
    ingestGBPerDay: Math.round(ingestGBPerDay),
    storedTB: storedGB / 1024,
    ingest: ingestMonthly,
    retention: retentionMonthly,
    platform,
    total: ingestMonthly + retentionMonthly + platform,
    totalList: Math.round(totalList),
    note: 'Illustrative TCO — hardware, licensing, and ops folded into platform line. Includes 85% enterprise discount on list TCO.',
  };
}

export function calculateObservabilityCost({
  logsTBPerDay = 100,
  metricsPerMinute = 500_000_000,
  spansPerMinute = 1_200_000_000,
  retentionDays = 90,
  hybridOptions = {},
  selfHostedRetentionDays = 365,
  discounts,
  volumeTierId,
} = {}) {
  const resolvedDiscounts = resolveDiscounts(discounts);
  const effectiveSl = effectiveServerlessRates(resolvedDiscounts);
  const effectiveOp = effectiveOnPremRates(resolvedDiscounts);
  const logsGBPerDay = logsTBPerDay * 1024;
  const metricsPerDay = metricsPerMinute * 60 * 24;
  const spansPerDay = spansPerMinute * 60 * 24;
  const metricsPerMonth = (metricsPerDay * 30) / 1e6;
  const spansPerMonth = (spansPerDay * 30) / 1e6;
  const logsGBPerMonth = logsGBPerDay * 30;

  const serverless = calculateServerlessRetentionCost({
    logsTBPerDay,
    retentionDays,
    metricsPerMinute,
    spansPerMinute,
    tier: 'complete',
    discounts: resolvedDiscounts,
  });

  const hybrid = calculateHybridElasticCost({
    logsTBPerDay,
    metricsPerMinute,
    spansPerMinute,
    ...hybridOptions,
    discounts: resolvedDiscounts,
  });

  const selfHosted = calculateSelfHostedElasticCost({
    logsTBPerDay,
    metricsPerMinute,
    spansPerMinute,
    retentionDays: selfHostedRetentionDays,
    discounts: resolvedDiscounts,
  });

  const elastic = {
    ingest: serverless.ingestCostMonthly,
    storage: serverless.retentionCostMonthly,
    platform: 0,
    total: serverless.totalMonthly,
    listTotal: serverless.totalMonthlyList,
    enterpriseDiscountPct: serverless.enterpriseDiscountPct,
  };

  function calcDatadog() {
    const p = PRICING.datadog;
    const metricsM = metricsPerMinute / 1e6;
    const spansM = spansPerMinute / 1e6;
    const logIngest = logsGBPerMonth * p.logsPerGB;

    // At Telco scale, Datadog is sold on enterprise commits — not list $/million indexed spans
    // for every trace in the firehose. Model APM/metrics as a bounded uplift on log ingest.
    const signalUplift =
      p.signalUpliftBase
      + p.signalUpliftPerMetricsM * (metricsM / p.metricsBaselineM)
      + p.signalUpliftPerSpansM * (spansM / p.spansBaselineM);
    const ingest = Math.round(logIngest * (1 + signalUplift));

    // SaaS log storage across requested retention window
    const storage = Math.round(logsGBPerMonth * (retentionDays / 30) * p.storagePerGBMonth);
    const archivePenalty = 0;

    return {
      ingest,
      logIngest: Math.round(logIngest),
      signalIngest: Math.round(logIngest * signalUplift),
      storage,
      archivePenalty,
      platform: p.basePlatformFee,
      maxRetentionDays: p.maxRetentionDays,
      total: Math.round(ingest + storage + archivePenalty + p.basePlatformFee),
    };
  }

  const datadog = calcDatadog();
  const hybridTotal = hybrid.total;
  const datadogTotal = datadog.total;
  const selfHostedTotal = selfHosted.total;
  const traceVolume = traceVolumeFromSpansPerMinute(spansPerMinute);
  const traceValidation = rfpTraceVolumeValidation(spansPerMinute);

  return {
    inputs: {
      logsTBPerDay,
      metricsPerMinute,
      spansPerMinute,
      retentionDays,
      selfHostedRetentionDays,
      volumeTierId,
      discounts: resolvedDiscounts,
      ...hybridOptions,
    },
    volumeTier: OBSERVABILITY_VOLUME_TIERS.find(t => t.id === volumeTierId) || null,
    effectiveRates: {
      serverless: effectiveSl,
      onPrem: effectiveOp,
    },
    volumes: {
      logsGBPerDay,
      metricsPerDay,
      spansPerDay,
      traceVolume,
      traceValidation,
    },
    elastic,
    hybrid,
    selfHosted,
    datadog,
    serverless,
    savings: {
      serverlessVsDatadog: {
        amount: datadogTotal - elastic.total,
        percent: Math.round((1 - elastic.total / datadogTotal) * 100),
      },
      hybridVsDatadog: {
        amount: datadogTotal - hybridTotal,
        percent: Math.round((1 - hybridTotal / datadogTotal) * 100),
      },
      selfHostedVsDatadog: {
        amount: datadogTotal - selfHostedTotal,
        percent: Math.round((1 - selfHostedTotal / datadogTotal) * 100),
      },
      amount: datadogTotal - hybridTotal,
      percent: Math.round((1 - hybridTotal / datadogTotal) * 100),
    },
    drNote: '30% enterprise discount on official Serverless Complete list rates and 85% on illustrative on-prem TCO at all volume tiers. Telco anchor: 3 PB/day logs, 500M metrics/min, 1.2B spans/min. Split on-prem costs are illustrative. Cross-boundary correlation uses A2A today — CCS Self-Managed ↔ Serverless is FY27+ roadmap, not GA.',
  };
}

export function getTieredPricingMatrix({
  retentionDays = 90,
  selfHostedRetentionDays = 365,
  hybridOptions = HYBRID_DEFAULTS,
} = {}) {
  return OBSERVABILITY_VOLUME_TIERS.map(tier => {
    const cost = calculateObservabilityCost({
      logsTBPerDay: tier.logsTBPerDay,
      metricsPerMinute: tier.metricsPerMinute,
      spansPerMinute: tier.spansPerMinute,
      retentionDays,
      selfHostedRetentionDays,
      hybridOptions,
      discounts: {
        serverlessPct: tier.serverlessDiscountPct,
        onPremPct: tier.onPremDiscountPct,
      },
      volumeTierId: tier.id,
    });

    return {
      ...tier,
      monthly: {
        selfHosted: cost.selfHosted.total,
        hybrid: cost.hybrid.total,
        serverless: cost.elastic.total,
        datadog: cost.datadog.total,
      },
      listMonthly: {
        selfHosted: cost.selfHosted.totalList,
        hybrid: cost.hybrid.totalList,
        serverless: cost.serverless.totalMonthlyList,
        datadog: cost.datadog.total,
      },
      effectiveRates: cost.effectiveRates,
      savingsVsDatadog: cost.savings,
    };
  });
}

export function getVolumeTierById(tierId) {
  return OBSERVABILITY_VOLUME_TIERS.find(t => t.id === tierId) || null;
}

export function calculateSecurityCost({ securityTBPerDay = 300, retentionDays = 365 }) {
  const gbPerDay = securityTBPerDay * 1024;
  const gbPerMonth = gbPerDay * 30;
  const storedGB = gbPerDay * retentionDays;
  const pricing = SERVERLESS_O11Y_PRICING.complete;

  const elasticMonthly = Math.round(
    gbPerMonth * pricing.ingestPerGB +
    storedGB * pricing.retentionPerGBMonth
  );

  const splunkMonthly = Math.round(
    gbPerMonth * PRICING.splunk.ingestPerGB +
    gbPerMonth * (retentionDays / 30) * PRICING.splunk.storagePerGBMonth +
    PRICING.splunk.basePlatformFee
  );

  return {
    elastic: elasticMonthly,
    splunk: splunkMonthly,
    splunkLabel: 'Splunk Enterprise Security',
    elasticLabel: 'Elastic Security Serverless',
    savings: {
      amount: splunkMonthly - elasticMonthly,
      percent: Math.round((1 - elasticMonthly / splunkMonthly) * 100),
    },
    migrationNote: 'Splunk figures are an illustrative model of Telco\'s current ES stack. Elastic uses official Serverless Complete rates.',
  };
}

export function getSecurityScenarioComparisons() {
  const rows = [
    { label: '300 TB/day · 1yr (Telco)', securityTBPerDay: 300, retentionDays: 365 },
    { label: '300 TB/day · 90d retention', securityTBPerDay: 300, retentionDays: 90 },
    { label: '500 TB/day · 1yr retention', securityTBPerDay: 500, retentionDays: 365 },
  ];
  return rows.map(({ label, ...inputs }) => {
    const cost = calculateSecurityCost(inputs);
    return { label, elastic: cost.elastic, splunk: cost.splunk, savings: cost.savings };
  });
}

export function getScenarioComparisons() {
  return getTieredPricingMatrix().map(row => ({
    label: row.label,
    logsTBPerDay: row.logsTBPerDay,
    selfHosted: { total: row.monthly.selfHosted },
    hybrid: { total: row.monthly.hybrid },
    elastic: { total: row.monthly.serverless },
    datadog: { total: row.monthly.datadog },
  }));
}

export default calculateObservabilityCost;
