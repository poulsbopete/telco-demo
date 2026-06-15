/**
 * Telco demo context — maps live OTel network core data to telco
 * regional observability narrative (regionID, ML anomalies, workflows).
 */

export const TELCO_SERVICES = {
  cart: { label: 'Service Provisioning', domain: 'core-network' },
  checkout: { label: 'Core Signaling (5G AMF/SMF)', domain: 'core-network' },
  payment: { label: 'Billing & Charging', domain: 'bss' },
  'checkoutservice': { label: 'Core Signaling (5G AMF/SMF)', domain: 'core-network' },
  'paymentservice': { label: 'Billing & Charging', domain: 'bss' },
  'frauddetectionservice': { label: 'Fraud & Abuse Detection', domain: 'security' },
  'frontend-web': { label: 'Customer Self-Care Portal', domain: 'digital-experience' },
  kafka: { label: 'Network Event Bus', domain: 'platform' },
};

export const REGIONS = [
  { regionId: 'REG-8847291', name: 'Metro East 5G', tier: 'Tier-1', market: 'US-East', segment: 'Consumer Mobile' },
  { regionId: 'REG-4421098', name: 'West Fiber Backbone', tier: 'Tier-1', market: 'US-West', segment: 'Enterprise VPN' },
  { regionId: 'REG-7710234', name: 'Central IoT Hub', tier: 'Tier-2', market: 'US-Central', segment: 'IoT Fleet' },
  { regionId: 'REG-3301847', name: 'APAC Roaming Gateway', tier: 'Tier-2', market: 'APAC', segment: 'International Roaming' },
  { regionId: 'REG-5590021', name: 'Northeast Fixed Wireless', tier: 'Tier-3', market: 'US-Northeast', segment: 'FWA' },
  { regionId: 'REG-2209876', name: 'EU Edge Compute', tier: 'Tier-3', market: 'EU-West', segment: 'MEC' },
  { regionId: 'REG-6610453', name: 'South Enterprise MPLS', tier: 'Tier-2', market: 'US-South', segment: 'Enterprise VPN' },
  { regionId: 'REG-1187632', name: 'National CDN Edge', tier: 'Tier-1', market: 'US-National', segment: 'Content Delivery' },
];

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function mapServiceName(raw) {
  return TELCO_SERVICES[raw]?.label || raw;
}

/** Distribute real pipeline volume across network regions deterministically */
export function buildRegionMetrics(pipelineStats, regionCount = 8) {
  const regions = REGIONS.slice(0, regionCount);
  const totalSessions = pipelineStats.reduce((s, p) => s + p.session_count, 0) || 1;

  return regions.map((r, i) => {
    const weight = 0.28 - i * 0.025 + (hashSeed(r.regionId) % 100) / 2000;
    const share = Math.max(weight, 0.04);
    const sessions = Math.round(totalSessions * share);
    const successRate = 99.85 - (hashSeed(r.regionId) % 40) / 100 - (i > 5 ? 0.15 : 0);
    const p99Latency = 180 + (hashSeed(r.regionId) % 120) + i * 15;
    const errors = Math.round(sessions * (1 - successRate / 100));

    return {
      ...r,
      sessions24h: sessions,
      successRate: Math.round(successRate * 100) / 100,
      p99LatencyMs: p99Latency,
      errorCount: errors,
      bandwidthGbps: Math.round(sessions * 0.012 * 10) / 10,
    };
  }).sort((a, b) => b.sessions24h - a.sessions24h);
}

export function buildMlAnomalies({ pipelineStats, regionMetrics, recentErrors }) {
  const signaling = pipelineStats.find(p => p.service === 'checkout');
  const provisioning = pipelineStats.find(p => p.service === 'cart');
  const billing = pipelineStats.find(p => p.service === 'payment');
  const topRegion = regionMetrics[0];
  const affectedRegion = regionMetrics.find(r => r.successRate < 99.7) || regionMetrics[2];

  const anomalies = [
    {
      id: 'ML-ANOM-001',
      type: 'signaling_latency_spike',
      title: '5G Core Signaling p99 latency anomaly',
      mlScore: 0.94,
      severity: 'high',
      service: 'Core Signaling (5G AMF/SMF)',
      regionId: affectedRegion?.regionId,
      regionName: affectedRegion?.name,
      signal: `p99 latency 3.2σ above 7-day baseline (${420 + (signaling?.session_count ? 0 : 0)}ms)`,
      detectedAt: new Date(Date.now() - 8 * 60000).toISOString(),
      correlatedTraces: 847,
      correlatedLogs: 2341,
      workflowId: 'wf-core-latency-remediation',
    },
    {
      id: 'ML-ANOM-002',
      type: 'billing_failure_rate',
      title: 'Billing failure rate spike — region cohort',
      mlScore: 0.91,
      severity: 'critical',
      service: 'Billing & Charging',
      regionId: topRegion?.regionId,
      regionName: topRegion?.name,
      signal: 'Failure rate 2.8% vs 0.4% baseline for Tier-1 regions',
      detectedAt: new Date(Date.now() - 22 * 60000).toISOString(),
      correlatedTraces: 1203,
      correlatedLogs: 5620,
      workflowId: 'wf-billing-failure-investigate',
    },
    {
      id: 'ML-ANOM-003',
      type: 'provisioning_error_pattern',
      title: 'Service provisioning error pattern (ML clustering)',
      mlScore: 0.87,
      severity: 'medium',
      service: 'Service Provisioning',
      regionId: regionMetrics[4]?.regionId,
      regionName: regionMetrics[4]?.name,
      signal: `${provisioning?.errors || 64} errors clustered — similar stack traces across 3 regionIDs`,
      detectedAt: new Date(Date.now() - 45 * 60000).toISOString(),
      correlatedTraces: 156,
      correlatedLogs: provisioning?.errors || 64,
      workflowId: 'wf-provisioning-error-triage',
    },
  ];

  if (recentErrors?.length) {
    anomalies[0].sampleLog = recentErrors[0]?.message?.slice(0, 120);
    anomalies[0].traceId = recentErrors[0]?.traceId;
  }

  return anomalies;
}

export const WORKFLOW_TEMPLATES = {
  'wf-core-latency-remediation': {
    name: '5G Core Latency Auto-Remediation',
    trigger: 'ML anomaly: signaling_latency_spike',
    steps: [
      { id: 1, name: 'Ingest ML anomaly signal', tool: 'kibana.alerting', status: 'completed', detail: 'Anomaly ML job core-signaling-latency-v2 score 0.94' },
      { id: 2, name: 'Correlate traces + logs', tool: 'esql_query', status: 'completed', detail: 'FROM traces-* | JOIN logs-* ON trace.id — 847 spans, 2,341 logs' },
      { id: 3, name: 'A2A call to Datadog agent', tool: 'a2a_datadog', status: 'completed', detail: 'tasks/send → datadog-observability-agent: fetch p99, error traces, monitors for regionID' },
      { id: 4, name: 'A2A call to Elastic Security', tool: 'a2a_security', status: 'completed', detail: 'tasks/send → elastic-security-soc-agent: SIEM alerts, threat intel, SOC case linkage' },
      { id: 5, name: 'A2A call to Enterprise Search', tool: 'a2a_search', status: 'completed', detail: 'tasks/send → elastic-enterprise-search-agent: NOC runbooks, region playbook, change policy' },
      { id: 6, name: 'AI root cause analysis', tool: 'elastic_agent', status: 'completed', detail: 'Cross-project synthesis — infra root cause, security cleared, runbook steps loaded' },
      { id: 7, name: 'Execute remediation', tool: 'workflow.action', status: 'running', detail: 'Scale AMF/SMF pods +30%, enable circuit breaker for regionID' },
      { id: 8, name: 'Verify recovery', tool: 'slo_check', status: 'pending', detail: 'Wait for p99 < 250ms for 5 min' },
      { id: 9, name: 'Notify NOC', tool: 'webhook', status: 'pending', detail: 'Post incident summary to NOC webhook' },
    ],
  },
  'wf-billing-failure-investigate': {
    name: 'Billing Failure Investigation',
    trigger: 'ML anomaly: billing_failure_rate',
    steps: [
      { id: 1, name: 'Ingest ML anomaly signal', tool: 'kibana.alerting', status: 'completed', detail: 'Failure rate 2.8% vs 0.4% baseline' },
      { id: 2, name: 'Query by regionID', tool: 'esql_query', status: 'completed', detail: 'FROM logs-* | WHERE region.id == "REG-8847291"' },
      { id: 3, name: 'AI classify failure reasons', tool: 'elastic_agent', status: 'completed', detail: '68% OCS timeout, 22% rating rule FP, 10% CDR mismatch' },
      { id: 4, name: 'Tune rating rules', tool: 'workflow.action', status: 'running', detail: 'Adjust ML fraud threshold for Tier-1 regions' },
      { id: 5, name: 'Update NOC dashboard', tool: 'kibana.dashboard', status: 'pending', detail: 'Pin region-specific billing failure breakdown' },
    ],
  },
  'wf-provisioning-error-triage': {
    name: 'Provisioning Error Triage',
    trigger: 'ML anomaly: provisioning_error_pattern',
    steps: [
      { id: 1, name: 'Cluster error logs (ML)', tool: 'ml_dataframe_analytics', status: 'completed', detail: '3 log clusters identified via ML' },
      { id: 2, name: 'Map to regionIDs', tool: 'esql_query', status: 'completed', detail: 'Cross-reference trace.id → region.id enrichment' },
      { id: 3, name: 'AI recommend fix', tool: 'elastic_agent', status: 'running', detail: 'Session timeout config mismatch — recommend rollback v2.3.1' },
    ],
  },
  'wf-security-incident-response': {
    name: 'Security Incident Auto-Response',
    trigger: 'SIEM alert: critical/high detection',
    steps: [
      { id: 1, name: 'Enrich SIEM alert', tool: 'kibana.alerting', status: 'completed', detail: 'Risk score, MITRE mapping, and entity context from .alerts-security.*' },
      { id: 2, name: 'Threat intel enrichment', tool: 'elastic.security.threat_intel', status: 'completed', detail: 'OTX + Mandiant IOC lookup on source IP and host' },
      { id: 3, name: 'Entity Analytics blast radius', tool: 'entity_analytics', status: 'completed', detail: 'User/host risk scores and correlated authentication failures' },
      { id: 4, name: 'Open Kibana Case', tool: 'kibana.cases', status: 'completed', detail: 'SOC case created and linked to alert timeline' },
      { id: 5, name: 'Execute response actions', tool: 'workflow.action', status: 'running', detail: 'Elastic Defend host isolation + access revocation via connector chain' },
      { id: 6, name: 'Notify stakeholders', tool: 'kibana.connector', status: 'pending', detail: 'PagerDuty/Slack/ServiceNow via Kibana connectors' },
    ],
  },
};

export function buildNetworkPipeline(pipelineStats) {
  return pipelineStats.map(p => ({
    service: p.service,
    telcoService: mapServiceName(p.service),
    sessionCount: Number(p.session_count) || 0,
    errors: Number(p.errors) || 0,
    errorRate: p.session_count ? ((Number(p.errors) || 0) / Number(p.session_count) * 100).toFixed(3) : '0',
  }));
}

export function enrichLogForTelco(log, index = 0, forceRegionId = null) {
  const region = forceRegionId
    ? REGIONS.find(r => r.regionId === forceRegionId) || REGIONS[0]
    : REGIONS[hashSeed(log.traceId || log.host || String(index)) % REGIONS.length];
  return {
    ...log,
    regionId: region.regionId,
    regionName: region.name,
    telcoService: mapServiceName(log.service),
    sessionId: log.traceId ? `SES-${log.traceId.slice(0, 12)}` : `SES-DEMO-${1000 + index}`,
  };
}

function regionById(regionId) {
  return REGIONS.find(r => r.regionId === regionId);
}

/** Full region drill-down payload */
export function buildRegionDetail(regionId, { pipelineStats, mlAnomalies, recentErrors, networkPipeline }) {
  const region = regionById(regionId);
  if (!region) return null;

  const metrics = buildRegionMetrics(pipelineStats).find(r => r.regionId === regionId);
  if (!metrics) return null;

  const seed = hashSeed(regionId);
  const share = metrics.sessions24h / (pipelineStats.reduce((s, p) => s + p.session_count, 0) || 1);

  const serviceBreakdown = (networkPipeline || buildNetworkPipeline(pipelineStats)).map(p => ({
    service: p.telcoService,
    rawService: p.service,
    sessions: Math.round(p.sessionCount * share * (0.8 + (hashSeed(regionId + p.service) % 40) / 100)),
    errors: Math.round((p.errors || 0) * share),
    p99Ms: 120 + (hashSeed(regionId + p.service) % 200),
    successRate: Math.round((99.9 - (hashSeed(regionId + p.service) % 30) / 100) * 100) / 100,
  }));

  const hourlyTrend = Array.from({ length: 12 }, (_, i) => {
    const hour = new Date(Date.now() - (11 - i) * 3600000);
    const base = metrics.sessions24h / 24;
    const variance = 0.85 + (hashSeed(`${regionId}-${i}`) % 30) / 100;
    return {
      hour: hour.toISOString(),
      label: hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sessions: Math.round(base * variance),
      errors: Math.round(base * variance * (1 - metrics.successRate / 100)),
      p99Ms: metrics.p99LatencyMs + (hashSeed(`${regionId}-lat-${i}`) % 80) - 40,
    };
  });

  const regionAnomalies = mlAnomalies.filter(a => a.regionId === regionId);
  const primaryAnomaly = regionAnomalies[0] || null;

  const syntheticLogs = [
    { level: 'INFO', message: `Session established regionID=${regionId} bandwidth=${(142 + seed % 500).toFixed(1)}Mbps ses=SES-${seed.toString(16).slice(0, 8)}`, service: 'checkout' },
    { level: 'INFO', message: `Provisioning completed — ${metrics.sessions24h} daily sessions`, service: 'cart' },
    ...(metrics.errorCount > 0 ? [{ level: 'ERROR', message: `Signaling timeout regionID=${regionId} — upstream latency ${metrics.p99LatencyMs}ms`, service: 'checkout' }] : []),
    ...(metrics.successRate < 99.7 ? [{ level: 'WARN', message: `Billing failure rate elevated for ${regionId}: ${(100 - metrics.successRate).toFixed(2)}%`, service: 'payment' }] : []),
  ].map((log, i) => enrichLogForTelco({
    timestamp: new Date(Date.now() - i * 120000).toISOString(),
    service: log.service,
    level: log.level,
    message: log.message,
    traceId: `trace-${regionId.slice(-4)}-${seed.toString(16).slice(0, 8)}`,
    host: `amf-pod-${(seed % 12) + 1}`,
  }, i, regionId));

  const liveLogs = recentErrors
    .map((log, i) => enrichLogForTelco(log, i))
    .filter(log => log.regionId === regionId)
    .slice(0, 5);

  const logs = liveLogs.length ? liveLogs : syntheticLogs;

  const traceDrilldown = buildTraceDrilldown(
    primaryAnomaly || { regionId, regionName: region.name },
    recentErrors
  );
  traceDrilldown.regionId = regionId;

  const slo = {
    target: region.tier === 'Tier-1' ? 99.95 : region.tier === 'Tier-2' ? 99.9 : 99.5,
    current: metrics.successRate,
    status: metrics.successRate >= (region.tier === 'Tier-1' ? 99.95 : 99.5) ? 'healthy' : 'at_risk',
    errorBudgetRemaining: Math.max(0, Math.round((metrics.successRate - 99) * 100) / 10),
  };

  return {
    region: { ...region, ...metrics },
    serviceBreakdown,
    hourlyTrend,
    anomalies: regionAnomalies,
    primaryAnomaly,
    logs,
    traceDrilldown,
    slo,
    recentSessions: Array.from({ length: 6 }, (_, i) => ({
      sessionId: `SES-${regionId.slice(-4)}-${String(seed + i).slice(-8)}`,
      bandwidthMbps: Math.round(25 + (hashSeed(`${regionId}-ses-${i}`) % 500)),
      status: hashSeed(`${regionId}-st-${i}`) % 20 === 0 ? 'failed' : 'active',
      timestamp: new Date(Date.now() - i * 900000).toISOString(),
      service: ['Core Signaling (5G AMF/SMF)', 'Billing & Charging', 'Service Provisioning'][i % 3],
    })),
    esql: `FROM logs-generic.otel-default | WHERE service.name IN ("checkout", "payment", "cart") | LIMIT 100`,
  };
}

export function buildTraceDrilldown(anomaly, recentErrors) {
  const err = recentErrors?.[0];
  return {
    traceId: err?.traceId || 'trace-signaling-7f3a9b2c',
    regionId: anomaly.regionId,
    durationMs: 847,
    status: 'error',
    spans: [
      { name: 'POST /v1/signaling/session', service: 'Core Signaling (5G AMF/SMF)', durationMs: 847, status: 'ERROR', critical: false },
      { name: 'validate.region', service: 'Core Signaling (5G AMF/SMF)', durationMs: 12, status: 'OK', critical: false },
      { name: 'fraud.score', service: 'Fraud & Abuse Detection', durationMs: 89, status: 'OK', critical: false },
      { name: 'billing.authorize', service: 'Billing & Charging', durationMs: 156, status: 'OK', critical: false },
      { name: 'db.query.sessions', service: 'Core Signaling (5G AMF/SMF)', durationMs: 612, status: 'ERROR', critical: true },
    ],
    logs: [
      { level: 'ERROR', message: err?.message?.slice(0, 100) || 'Connection pool exhausted: max 50 connections — regionID=' + anomaly.regionId, timestamp: err?.timestamp },
      { level: 'WARN', message: `Slow query for region ${anomaly.regionId}: SELECT * FROM sessions (612ms)`, timestamp: err?.timestamp },
      { level: 'INFO', message: `Signaling initiated regionID=${anomaly.regionId} bandwidth=142.5Mbps`, timestamp: err?.timestamp },
    ],
    rootCause: 'Database connection pool exhaustion on AMF shard — affects Tier-1 region cohort',
    mlRecommendation: 'Elastic Workflow triggered: scale replicas + circuit breaker for affected regionID',
  };
}
