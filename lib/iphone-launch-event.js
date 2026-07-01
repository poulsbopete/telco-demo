/**
 * Simulated iPhone 17 Pro launch — carrier-scale telemetry, care, and fraud patterns.
 * Shared by API (live telco context) and client-side demo tabs.
 */

export const IPHONE_LAUNCH = {
  eventName: 'iPhone 17 Pro Launch',
  tagline: 'Launch Day · Wave 1',
  phase: 'launch_day',
  launchDate: '2026-09-19',
  models: ['iPhone 17', 'iPhone 17 Pro', 'iPhone 17 Pro Max', 'iPhone Air'],
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

export function buildLaunchEventSummary() {
  const m = IPHONE_LAUNCH.metrics;
  return {
    ...IPHONE_LAUNCH,
    headline: `${(m.activationsFirst6h / 1_000_000).toFixed(2)}M activations in 6h`,
    subline: `${m.provisioningSpikePct}% provisioning spike · ${(m.preOrders24h / 1_000_000).toFixed(1)}M pre-orders`,
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
    title: 'iPhone 17 Pro launch — provisioning queue surge',
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
  ];
}

export const IPHONE_LAUNCH_CARE_DOCUMENTS = [
  {
    doc_id: 'iphone17_activation_stuck',
    title: 'iPhone 17 Pro Activation Stuck on "It may take a few minutes"',
    product: 'Device Activation',
    domain_path: ['Devices', 'iPhone', 'Launch Support'],
    content: 'During iPhone 17 Pro launch windows, activation may queue behind provisioning bursts. Verify eSIM is selected, ensure Wi‑Fi or cellular data is stable, and retry after 15 minutes. Enterprise customers with MDM should confirm DEP assignment propagated. Escalate if ICCID shows "profile download failed" for more than 30 minutes.',
    keywords: ['iphone 17', 'iphone 17 pro', 'activation stuck', 'esim', 'provisioning', 'launch day', 'new iphone', 'setup', 'transfer'],
    eligibility_rules: ['verified_email'],
    resolution_type: 'automated_guide',
    legal_context: null,
  },
  {
    doc_id: 'iphone17_esim_transfer',
    title: 'Transfer eSIM from Old iPhone to iPhone 17 Pro',
    product: 'Device Activation',
    domain_path: ['Devices', 'iPhone', 'eSIM'],
    content: 'Use Quick Transfer during setup or scan QR from My Account. Number port during launch weekend may take 2–4 hours. Do not remove old eSIM until new line shows "Active" in account portal. Dual-SIM customers: assign primary line before enabling 5G standalone.',
    keywords: ['esim transfer', 'quick transfer', 'iphone 17', 'number port', 'dual sim', 'new phone', 'launch'],
    eligibility_rules: ['verified_email', 'identity_verified'],
    resolution_type: 'automated_guide',
    legal_context: null,
  },
  {
    doc_id: 'iphone17_trade_in_launch',
    title: 'iPhone 17 Launch Trade-In and Upgrade Program',
    product: 'Device Upgrade',
    domain_path: ['Devices', 'iPhone', 'Trade-In'],
    content: 'Launch trade-in credits apply to iPhone 17, 17 Pro, and Pro Max through Oct 31. Ship old device within 30 days to avoid chargeback. In-store trade-in queues are prioritized for pre-order pickup appointments. Bill credits for iPhone Upgrade Program post within 1–2 billing cycles.',
    keywords: ['trade in', 'upgrade', 'iphone 17 pro', 'pre-order', 'launch offer', 'bill credit', 'old iphone'],
    eligibility_rules: ['verified_email'],
    resolution_type: 'information',
    legal_context: null,
  },
  {
    doc_id: 'iphone17_preorder_pickup',
    title: 'iPhone 17 Pro Pre-Order Pickup and Store Appointment',
    product: 'Retail',
    domain_path: ['Devices', 'iPhone', 'Retail'],
    content: 'Launch day pickup requires QR code from order confirmation and government ID matching account holder. Appointments are 15-minute windows; arrive early for SIM/eSIM selection. Inventory is reserved until end of appointment day. Waitlist customers notified by SMS when device is ready.',
    keywords: ['pre-order', 'pickup', 'store', 'appointment', 'iphone 17', 'launch day', 'reserved', 'inventory'],
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
  last_contact: '2026-09-19T14:22:00Z',
  launch_context: {
    pre_order: 'iPhone 17 Pro Max · Natural Titanium · 256GB',
    pickup_store: 'Reg-8847291 flagship · Manhattan',
    trade_in: 'iPhone 15 Pro',
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
