/** ML signal intelligence for live telco API responses */

export const ML_JOBS = [
  { id: 'core-signaling-latency-v2', label: 'Core signaling p99', domain: 'core', type: 'anomaly_detection', status: 'running', lastScore: 0.94 },
  { id: 'ran-cell-utilization-v1', label: 'RAN cell utilization', domain: 'ran', type: 'anomaly_detection', status: 'running', lastScore: 0.72 },
  { id: 'transport-link-loss-v1', label: 'Transport link loss', domain: 'transport', type: 'anomaly_detection', status: 'running', lastScore: 0.68 },
  { id: 'log-error-pattern-v3', label: 'Error log clustering', domain: 'core', type: 'log_rate', status: 'running', lastScore: 0.87 },
  { id: 'billing-failure-cohort', label: 'Billing failure cohort', domain: 'bss', type: 'population_comparison', status: 'running', lastScore: 0.91 },
];

export const SUPPRESSED_NOISE_EXAMPLES = [
  { reason: 'Seasonal baseline — scheduled maintenance window', count: 124, domain: 'transport' },
  { reason: 'Single-host spike below ML influence threshold', count: 89, domain: 'ran' },
  { reason: 'Duplicate threshold alert — same root-cause cluster', count: 203, domain: 'core' },
  { reason: 'Known firmware rollout canary — tagged expected', count: 67, domain: 'ran' },
  { reason: 'Weekend traffic dip — population comparison normal', count: 156, domain: 'core' },
];

const DOMAIN_MAP = {
  iphone_launch_provisioning_surge: { domain: 'core', mlJobId: 'log-error-pattern-v3', correlatedDomains: ['core', 'ran'] },
  iphone_esim_download_latency: { domain: 'transport', mlJobId: 'transport-link-loss-v1', correlatedDomains: ['transport', 'core'] },
  iphone_ran_attach_surge: { domain: 'ran', mlJobId: 'ran-cell-utilization-v1', correlatedDomains: ['ran', 'core'] },
  signaling_latency_spike: { domain: 'core', mlJobId: 'core-signaling-latency-v2', correlatedDomains: ['core', 'transport'] },
  billing_failure_rate: { domain: 'bss', mlJobId: 'billing-failure-cohort', correlatedDomains: ['bss', 'core'] },
  provisioning_error_pattern: { domain: 'core', mlJobId: 'log-error-pattern-v3', correlatedDomains: ['core'] },
};

export function enrichMlAnomalies(anomalies) {
  return anomalies.map(a => {
    const meta = DOMAIN_MAP[a.type] || { domain: 'core', mlJobId: 'core-signaling-latency-v2', correlatedDomains: ['core'] };
    const priorityScore = Math.round((a.mlScore || 0.8) * 100);
    const proactiveLeadMin = a.severity === 'critical' ? 12 : a.severity === 'high' ? 18 : 35;
    const suppressedDuplicates = a.severity === 'critical' ? 52 : a.severity === 'high' ? 38 : 18;
    const status = a.severity === 'medium' ? 'watching' : 'actionable';

    return {
      ...a,
      ...meta,
      priorityScore,
      proactiveLeadMin,
      suppressedDuplicates,
      status,
    };
  });
}

export function buildMlSignalIntelligence({ mlAnomalies = [], pipelineStats = [] }) {
  const errorCount = pipelineStats.reduce((s, p) => s + (Number(p.errors) || 0), 0);
  const rawThresholdAlerts = Math.max(847, errorCount * 12 + 412);
  const mlScored = Math.round(rawThresholdAlerts * 0.16);
  const correlatedActionable = mlAnomalies.filter(a => a.status !== 'watching').length;
  const watching = mlAnomalies.filter(a => a.status === 'watching').length;
  const autoSuppressed = Math.max(0, mlScored - mlAnomalies.length);
  const thresholdSuppressed = rawThresholdAlerts - mlScored;
  const totalSuppressed = thresholdSuppressed + autoSuppressed;
  const noiseReductionPct = Math.round((1 - mlAnomalies.length / rawThresholdAlerts) * 1000) / 10;

  return {
    funnel: {
      rawThresholdAlerts,
      mlScored,
      correlatedActionable: mlAnomalies.length,
      actionableNow: correlatedActionable,
      watching,
      proactiveWorkflowsReady: mlAnomalies.filter(a => a.severity === 'critical' || a.severity === 'high').length,
      suppressedNoise: totalSuppressed,
      noiseReductionPct,
    },
    mlJobs: ML_JOBS.map(job => {
      const linked = mlAnomalies.find(a => a.mlJobId === job.id);
      return linked ? { ...job, lastScore: linked.mlScore, linkedAnomalyId: linked.id } : job;
    }),
    suppressedExamples: SUPPRESSED_NOISE_EXAMPLES,
    correlationWindow: '15m lookback · RAN + core + transport',
    proactiveAvgLeadMin: mlAnomalies.length
      ? Math.round(mlAnomalies.reduce((s, a) => s + (a.proactiveLeadMin || 20), 0) / mlAnomalies.length)
      : 18,
  };
}
