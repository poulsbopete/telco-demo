/**
 * Simulated iPhone 18 Pro launch — carrier-scale telemetry, care, and fraud patterns.
 * Shared by API (live telco context) and client-side demo tabs.
 */

export const IPHONE_LAUNCH = {
  eventName: 'iPhone 18 Pro Launch',
  tagline: 'Launch Weekend · Sept 2026',
  phase: 'launch_day',
  launchDate: '2026-09-18',
  models: ['iPhone 18', 'iPhone 18 Pro', 'iPhone 18 Pro Max', 'iPhone Air'],
  metrics: {
    preOrders24h: 2_400_000,
    activationsFirst6h: 847_000,
    activationsPerMinutePeak: 14_200,
    provisioningSpikePct: 340,
    esimDownloadsPerMin: 124_000,
    careContactsPerHour: 18_400,
    tradeInQueueDepth: 52_000,
    numberPortsQueued: 31_600,
    retailStoresOnline: 4_820,
    grossAddRevenue24hUsd: 142_000_000,
    upgradeAttachRatePct: 38,
    tradeInConversionPct: 62,
    avgRevenuePerActivationUsd: 94,
    careCostPerContactUsd: 6.5,
    churnRiskSubsIfSlaMiss: 84_000,
  },
  hotspotRegions: [
    {
      regionId: 'REG-8847291',
      name: 'Metro East 5G',
      role: 'Flagship retail · NYC & Northeast',
      sessionMultiplier: 2.8,
    },
    {
      regionId: 'REG-1187632',
      name: 'National CDN Edge',
      role: 'eSIM OTA · iOS restore CDN',
      sessionMultiplier: 3.4,
    },
    {
      regionId: 'REG-4421098',
      name: 'West Fiber Backbone',
      role: 'Midnight PT launch wave',
      sessionMultiplier: 2.1,
    },
  ],
};

/** Launch lifecycle — ML forecast windows for surge vs slowdown (simulated launch weekend). */
export const LAUNCH_LIFECYCLE_PHASES = [
  {
    id: 'pre_order',
    label: 'Pre-order fulfillment',
    window: 'T-7d → T-1d',
    trend: 'steady',
    activationsPerMin: 1200,
    careContactsPerHour: 4200,
    mlConfidence: 0.91,
    businessNote: 'Steady eSIM pre-staging · low NOC load',
  },
  {
    id: 'midnight_drop',
    label: 'Midnight release',
    window: 'Fri 12:00 AM local',
    trend: 'surge',
    activationsPerMin: 9800,
    careContactsPerHour: 11200,
    mlConfidence: 0.94,
    businessNote: 'First surge · West coast midnight wave',
  },
  {
    id: 'morning_retail',
    label: 'Retail open · pickup',
    window: 'Fri 8:00–11:00 AM',
    trend: 'peak',
    activationsPerMin: 14200,
    careContactsPerHour: 18400,
    mlConfidence: 0.96,
    businessNote: 'Peak gross adds · highest churn risk if queues slip',
  },
  {
    id: 'afternoon_tail',
    label: 'Afternoon activation tail',
    window: 'Fri 2:00–6:00 PM',
    trend: 'slowdown',
    activationsPerMin: 8600,
    careContactsPerHour: 12100,
    mlConfidence: 0.93,
    businessNote: 'Slowing ~40% from peak · trade-in backlog clearing',
  },
  {
    id: 'evening_lull',
    label: 'Evening lull',
    window: 'Fri 8:00 PM → Sat 8:00 AM',
    trend: 'slowdown',
    activationsPerMin: 2100,
    careContactsPerHour: 3800,
    mlConfidence: 0.89,
    businessNote: 'Expected trough · restore staffing to baseline',
  },
  {
    id: 'weekend_secondary',
    label: 'Weekend suburban surge',
    window: 'Sat 10:00 AM – 4:00 PM',
    trend: 'surge',
    activationsPerMin: 7600,
    careContactsPerHour: 9800,
    mlConfidence: 0.88,
    businessNote: 'Second wave · mall & suburban stores',
  },
  {
    id: 'weekend_taper',
    label: 'Sunday taper',
    window: 'Sun all day',
    trend: 'slowdown',
    activationsPerMin: 3400,
    careContactsPerHour: 5100,
    mlConfidence: 0.92,
    businessNote: 'Return toward baseline by Mon 6 AM',
  },
  {
    id: 'steady_state',
    label: 'Post-launch steady',
    window: 'Mon+ week 1',
    trend: 'steady',
    activationsPerMin: 1800,
    careContactsPerHour: 2900,
    mlConfidence: 0.95,
    businessNote: 'Normal device mix · ML watch only',
  },
];

/** Simulated "now" on launch timeline for demo narrative. */
export const LAUNCH_SIM_NOW = {
  phaseId: 'afternoon_tail',
  hoursFromMidnight: 14,
  minutesToNextTrendChange: 135,
  nextPhaseId: 'evening_lull',
  nextTrend: 'slowdown',
};

function formatUsdShort(value) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1000)}K`;
  return `$${value.toLocaleString()}`;
}

export function buildLaunchBusinessForecast(now = LAUNCH_SIM_NOW) {
  const currentIdx = LAUNCH_LIFECYCLE_PHASES.findIndex(p => p.id === now.phaseId);
  const current = LAUNCH_LIFECYCLE_PHASES[currentIdx] || LAUNCH_LIFECYCLE_PHASES[2];
  const next = LAUNCH_LIFECYCLE_PHASES.find(p => p.id === now.nextPhaseId)
    || LAUNCH_LIFECYCLE_PHASES[currentIdx + 1]
    || LAUNCH_LIFECYCLE_PHASES[4];
  const m = IPHONE_LAUNCH.metrics;

  const hoursToNext = Math.round((now.minutesToNextTrendChange || 135) / 60 * 10) / 10;
  const nextActivationsPerMin = next.activationsPerMin;
  const deltaPct = Math.round((1 - nextActivationsPerMin / current.activationsPerMin) * 100);

  const projectedActivationsNext4h = Math.round(current.activationsPerMin * 60 * 4 * 0.85);
  const projectedCareNext4h = Math.round(current.careContactsPerHour * 4);
  const careCostNext4hUsd = projectedCareNext4h * m.careCostPerContactUsd;
  const revenueNext4hUsd = projectedActivationsNext4h * m.avgRevenuePerActivationUsd;

  return {
    currentPhase: current,
    nextPhase: next,
    now: {
      label: current.label,
      trend: current.trend,
      activationsPerMin: current.activationsPerMin,
      mlConfidence: current.mlConfidence,
    },
    mlOutlook: {
      summary: next.trend === 'slowdown'
        ? `ML expects ${next.trend} in ~${hoursToNext}h · activations/min −${Math.abs(deltaPct)}%`
        : `ML expects ${next.trend} in ~${hoursToNext}h · activations/min +${Math.abs(deltaPct)}%`,
      nextPhaseLabel: next.label,
      nextPhaseWindow: next.window,
      minutesToNextTrend: now.minutesToNextTrendChange,
      hoursToNextTrend: hoursToNext,
      nextTrend: next.trend,
      confidence: current.mlConfidence,
      model: 'Elastic ML · device_launch_forecast_v2',
    },
    business: {
      grossAddRevenue24h: formatUsdShort(m.grossAddRevenue24hUsd),
      grossAddRevenue24hUsd: m.grossAddRevenue24hUsd,
      revenueNext4h: formatUsdShort(revenueNext4hUsd),
      careCostNext4h: formatUsdShort(careCostNext4hUsd),
      upgradeAttachRatePct: m.upgradeAttachRatePct,
      tradeInConversionPct: m.tradeInConversionPct,
      churnRiskSubs: m.churnRiskSubsIfSlaMiss,
      projectedActivationsNext4h,
      projectedCareContactsNext4h: projectedCareNext4h,
      arpuUsd: m.avgRevenuePerActivationUsd,
    },
    phases: LAUNCH_LIFECYCLE_PHASES,
  };
}

/** Hourly activation curve — actual vs ML forecast for launch weekend chart. */
export function buildLaunchVolumeSeries(hours = 36, startHour = 0) {
  const curve = [
    0.4, 0.5, 0.6, 0.7, 0.9, 1.2, 2.1, 4.5, 8.2, 10.5, 12.8, 14.2,
    13.1, 11.4, 9.8, 8.6, 6.2, 4.1, 2.8, 2.1, 1.8, 1.6, 1.5, 1.4,
    2.2, 3.8, 5.6, 7.6, 8.9, 7.2, 5.4, 4.1, 3.2, 2.6, 2.1, 1.9,
  ];
  const peak = 14.2;

  return Array.from({ length: hours }, (_, i) => {
    const hour = startHour + i;
    const idx = Math.min(i, curve.length - 1);
    const actual = Math.round(curve[idx] * 1000) / 100;
    const forecast = Math.round((curve[idx] * (0.97 + (i % 5) * 0.008)) * 1000) / 100;
    const phase = LAUNCH_LIFECYCLE_PHASES.find(p => {
      if (hour < 6) return p.id === 'pre_order';
      if (hour < 8) return p.id === 'midnight_drop';
      if (hour < 11) return p.id === 'morning_retail';
      if (hour < 18) return p.id === 'afternoon_tail';
      if (hour < 32) return p.id === 'evening_lull';
      if (hour < 40) return p.id === 'weekend_secondary';
      return p.id === 'weekend_taper';
    });
    const label = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
    return {
      hour,
      time: label,
      activationsPerMin: Math.round(actual * peak * 100) / 100,
      mlForecast: Math.round(forecast * peak * 100) / 100,
      baseline: Math.round(peak * 0.12 * 100) / 100,
      trend: phase?.trend || 'steady',
      phase: phase?.label,
    };
  });
}

export function buildLaunchEventSummary() {
  const m = IPHONE_LAUNCH.metrics;
  const businessForecast = buildLaunchBusinessForecast();
  return {
    ...IPHONE_LAUNCH,
    headline: `${(m.activationsFirst6h / 1_000_000).toFixed(2)}M activations in 6h`,
    subline: `${m.provisioningSpikePct}% provisioning spike · ${(m.preOrders24h / 1_000_000).toFixed(1)}M pre-orders`,
    businessForecast,
    volumeSeries: buildLaunchVolumeSeries(24, 0),
  };
}

export function applyLaunchRegionBoost(regions) {
  const hotspots = new Map(IPHONE_LAUNCH.hotspotRegions.map(h => [h.regionId, h]));
  return regions.map(r => {
    const hotspot = hotspots.get(r.regionId);
    if (!hotspot) return r;
    return {
      ...r,
      sessions24h: Math.round(r.sessions24h * hotspot.sessionMultiplier),
      bandwidthGbps: Math.round(r.bandwidthGbps * hotspot.sessionMultiplier * 10) / 10,
      launchHotspot: true,
      launchRole: hotspot.role,
      p99LatencyMs: r.p99LatencyMs + (hotspot.sessionMultiplier > 2.5 ? 85 : 45),
      successRate: Math.max(99.45, r.successRate - 0.25),
    };
  }).sort((a, b) => b.sessions24h - a.sessions24h);
}

export function buildIphoneLaunchMlAnomaly(regionMetrics) {
  const hotspot = regionMetrics.find(r => r.regionId === 'REG-8847291')
    || regionMetrics.find(r => r.launchHotspot)
    || regionMetrics[0];
  const m = IPHONE_LAUNCH.metrics;

  return {
    id: 'ML-ANOM-IPHONE-001',
    type: 'iphone_launch_provisioning_surge',
    title: 'iPhone 18 Pro launch — provisioning queue surge',
    mlScore: 0.96,
    severity: 'critical',
    service: 'Service Provisioning · Device Activation',
    regionId: hotspot?.regionId,
    regionName: hotspot?.name,
    signal: `${m.provisioningSpikePct}% above baseline · ${(m.activationsPerMinutePeak / 1000).toFixed(1)}K activations/min · eSIM OTA ${(m.esimDownloadsPerMin / 1000).toFixed(0)}K/min`,
    detectedAt: new Date(Date.now() - 4 * 60000).toISOString(),
    correlatedTraces: 12_400,
    correlatedLogs: 48_200,
    workflowId: 'wf-provisioning-error-triage',
    launchEvent: true,
    deviceModels: IPHONE_LAUNCH.models,
  };
}

export function buildLaunchMlAnomalies(regionMetrics) {
  const primary = buildIphoneLaunchMlAnomaly(regionMetrics);
  const cdnRegion = regionMetrics.find(r => r.regionId === 'REG-1187632') || regionMetrics[1];

  return [
    primary,
    {
      id: 'ML-ANOM-IPHONE-002',
      type: 'iphone_esim_download_latency',
      title: 'eSIM profile download latency — launch CDN edge',
      mlScore: 0.93,
      severity: 'high',
      service: 'eSIM OTA · SM-DP+',
      regionId: cdnRegion?.regionId,
      regionName: cdnRegion?.name,
      signal: `p99 eSIM download 8.4s vs 1.2s baseline · ${IPHONE_LAUNCH.metrics.esimDownloadsPerMin.toLocaleString()} profiles/min`,
      detectedAt: new Date(Date.now() - 11 * 60000).toISOString(),
      correlatedTraces: 6_800,
      correlatedLogs: 19_400,
      workflowId: 'wf-core-latency-remediation',
      launchEvent: true,
    },
    {
      id: 'ML-ANOM-IPHONE-003',
      type: 'iphone_ran_attach_surge',
      title: 'RAN attach storm — retail micro-cells (launch weekend)',
      mlScore: 0.89,
      severity: 'high',
      service: '5G RAN · gNodeB attach',
      regionId: 'REG-8847291',
      regionName: 'Metro East 5G',
      signal: 'Attach failures 1.9% vs 0.3% near flagship stores · correlated with trade-in queue',
      detectedAt: new Date(Date.now() - 18 * 60000).toISOString(),
      correlatedTraces: 3_200,
      correlatedLogs: 8_700,
      workflowId: 'wf-core-latency-remediation',
      launchEvent: true,
    },
    {
      id: 'ML-ANOM-IPHONE-004',
      type: 'iphone_launch_volume_forecast',
      title: 'ML forecast — activation taper in ~2.3h (evening lull)',
      mlScore: 0.91,
      severity: 'medium',
      service: 'Elastic ML · device_launch_forecast_v2',
      regionId: 'REG-8847291',
      regionName: 'National launch footprint',
      signal: 'Activations/min expected −76% by 8 PM · care staffing can drop 68% · weekend suburban surge Sat 10 AM',
      detectedAt: new Date(Date.now() - 2 * 60000).toISOString(),
      correlatedTraces: 0,
      correlatedLogs: 0,
      workflowId: 'wf-provisioning-error-triage',
      launchEvent: true,
      businessImpact: {
        projectedActivationsNext4h: 1_756_800,
        careCostNext4hUsd: 314_600,
        nextTrend: 'slowdown',
      },
    },
  ];
}

export const IPHONE_LAUNCH_CARE_DOCUMENTS = [
  {
    doc_id: 'iphone18_activation_stuck',
    title: 'iPhone 18 Pro Activation Stuck on "It may take a few minutes"',
    product: 'Device Activation',
    domain_path: ['Devices', 'iPhone', 'Launch Support'],
    content: 'During iPhone 18 Pro launch windows, activation may queue behind provisioning bursts. Verify eSIM is selected, ensure Wi‑Fi or cellular data is stable, and retry after 15 minutes. Enterprise customers with MDM should confirm DEP assignment propagated. Escalate if ICCID shows "profile download failed" for more than 30 minutes.',
    keywords: ['iphone 18', 'iphone 18 pro', 'activation stuck', 'esim', 'provisioning', 'launch day', 'new iphone', 'setup', 'transfer'],
    eligibility_rules: ['verified_email'],
    resolution_type: 'automated_guide',
    legal_context: null,
  },
  {
    doc_id: 'iphone18_esim_transfer',
    title: 'Transfer eSIM from Old iPhone to iPhone 18 Pro',
    product: 'Device Activation',
    domain_path: ['Devices', 'iPhone', 'eSIM'],
    content: 'Use Quick Transfer during setup or scan QR from My Account. Number port during launch weekend may take 2–4 hours. Do not remove old eSIM until new line shows "Active" in account portal. Dual-SIM customers: assign primary line before enabling 5G standalone.',
    keywords: ['esim transfer', 'quick transfer', 'iphone 18', 'number port', 'dual sim', 'new phone', 'launch'],
    eligibility_rules: ['verified_email', 'identity_verified'],
    resolution_type: 'automated_guide',
    legal_context: null,
  },
  {
    doc_id: 'iphone18_trade_in_launch',
    title: 'iPhone 18 Launch Trade-In and Upgrade Program',
    product: 'Device Upgrade',
    domain_path: ['Devices', 'iPhone', 'Trade-In'],
    content: 'Launch trade-in credits apply to iPhone 18, 18 Pro, and Pro Max through Oct 31. Ship old device within 30 days to avoid chargeback. In-store trade-in queues are prioritized for pre-order pickup appointments. Bill credits for iPhone Upgrade Program post within 1–2 billing cycles.',
    keywords: ['trade in', 'upgrade', 'iphone 18 pro', 'pre-order', 'launch offer', 'bill credit', 'old iphone'],
    eligibility_rules: ['verified_email'],
    resolution_type: 'information',
    legal_context: null,
  },
  {
    doc_id: 'iphone18_preorder_pickup',
    title: 'iPhone 18 Pro Pre-Order Pickup and Store Appointment',
    product: 'Retail',
    domain_path: ['Devices', 'iPhone', 'Retail'],
    content: 'Launch day pickup requires QR code from order confirmation and government ID matching account holder. Appointments are 15-minute windows; arrive early for SIM/eSIM selection. Inventory is reserved until end of appointment day. Waitlist customers notified by SMS when device is ready.',
    keywords: ['pre-order', 'pickup', 'store', 'appointment', 'iphone 18', 'launch day', 'reserved', 'inventory'],
    eligibility_rules: [],
    resolution_type: 'information',
    legal_context: null,
  },
];

export const IPHONE_LAUNCH_CUSTOMER = {
  customer_id: 'CUST-1006',
  name: 'Morgan Blake',
  email: 'morgan.blake@demo.elastic.co',
  lifecycle_stage: 'active',
  account_state: 'verified',
  account_type: 'personal',
  age: 31,
  country: 'US',
  identity_verified: true,
  credit_eligible: true,
  credit_limit: 1200,
  account_age_days: 640,
  last_contact: '2026-09-18T14:22:00Z',
  launch_context: {
    pre_order: 'iPhone 18 Pro Max · Deep Blue · 256GB',
    pickup_store: 'Reg-8847291 flagship · Manhattan',
    trade_in: 'iPhone 16 Pro',
    issue: 'activation_stuck',
  },
};

export const IPHONE_LAUNCH_SECURITY_ALERT = {
  type: 'SIM Swap · Launch Fraud',
  severity: 'critical',
  remediation: 'Block SIM change; require in-store ID verification; Entity Analytics risk score > 92',
  ruleName: 'Launch Window SIM Swap Surge',
  ruleId: 'rule-iphone-sim-swap-launch',
  mitreTactic: 'Credential Access',
  ruleType: 'ml',
};
