/**
 * Programmatic data generators for realistic demo streams.
 * Simulates petabyte-scale ingestion rates without storing massive datasets.
 */

const SERVICES = [
  'checkout-api', 'payment-gateway', 'fraud-service', 'user-service',
  'notification-service', 'inventory-api', 'shipping-service', 'auth-service',
];

const SECURITY_SOURCES = [
  'server', 'firewall', 'ids', 'vpn', 'endpoint', 'cloud-audit', 'pci-segment',
];

const THREAT_TYPES = [
  {
    type: 'Brute Force',
    severity: 'high',
    remediation: 'Block source IP via Elastic Defend response action; force password reset',
    ruleName: 'Brute Force Authentication Detection',
    ruleId: 'rule-brute-force',
    mitreTactic: 'Credential Access',
    ruleType: 'threshold',
    index: '.alerts-security.alerts-default',
  },
  {
    type: 'Lateral Movement',
    severity: 'critical',
    remediation: 'Isolate affected hosts with Elastic Defend; review Entity Analytics host risk',
    ruleName: 'Lateral Movement Indicators',
    ruleId: 'rule-lateral-movement',
    mitreTactic: 'Lateral Movement',
    ruleType: 'eql',
    index: '.alerts-security.alerts-default',
  },
  {
    type: 'Data Exfiltration',
    severity: 'critical',
    remediation: 'Block egress via network rules; preserve evidence in Kibana Cases',
    ruleName: 'Data Exfiltration Pattern',
    ruleId: 'rule-data-exfil',
    mitreTactic: 'Exfiltration',
    ruleType: 'esql',
    index: '.alerts-security.alerts-default',
  },
  {
    type: 'Anomalous Login',
    severity: 'medium',
    remediation: 'Require MFA re-enrollment; review Entity Analytics user risk score',
    ruleName: 'Anomalous User Behavior',
    ruleId: 'rule-anomalous-user',
    mitreTactic: 'Persistence',
    ruleType: 'ml',
    index: '.alerts-security.alerts-default',
  },
  {
    type: 'PCI Violation',
    severity: 'critical',
    remediation: 'Revoke access; open Kibana Case and notify compliance within 1 hour',
    ruleName: 'PCI Unauthorized Access',
    ruleId: 'rule-pci-unauthorized',
    mitreTactic: 'Initial Access',
    ruleType: 'threshold',
    index: '.alerts-security.alerts-default',
  },
  {
    type: 'Privilege Escalation',
    severity: 'high',
    remediation: 'Revert permissions; run Attack Discovery hunt on admin entities',
    ruleName: 'Failed Auth Spike (PCI)',
    ruleId: 'rule-failed-auth-spike',
    mitreTactic: 'Credential Access',
    ruleType: 'threshold',
    index: '.alerts-security.alerts-default',
  },
];

const SYNTHETIC_USERS = [
  'john.doe', 'jane.smith', 'svc-payment', 'admin-backup', 'api-gateway',
  'morgan.blake', 'alex.rivera', 'unknown-external',
];

function randomIp() {
  return `${Math.floor(Math.random() * 223 + 1)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateMetricPoint(baseTime, index) {
  const spike = index > 18 && index < 24;
  return {
    time: new Date(baseTime + index * 5000).toISOString(),
    latency: spike ? 450 + Math.random() * 200 : 80 + Math.random() * 40,
    errorRate: spike ? 2.5 + Math.random() * 3 : 0.1 + Math.random() * 0.3,
    throughput: 45000 + Math.random() * 10000,
    cpu: 45 + Math.random() * 30 + (spike ? 25 : 0),
    memory: 60 + Math.random() * 20,
    paymentSuccess: spike ? 94 + Math.random() * 2 : 99.2 + Math.random() * 0.5,
    fraudDetection: 99.5 + Math.random() * 0.4,
  };
}

export function generateMetricsSeries(count = 30) {
  const baseTime = Date.now() - count * 5000;
  return Array.from({ length: count }, (_, i) => generateMetricPoint(baseTime, i));
}

export function generateIngestionStats() {
  return {
    spansPerMinute: 1_200_000_000 + Math.floor(Math.random() * 50_000_000),
    logsPerDay: 2.7 + Math.random() * 0.3,
    metricsPerMinute: 520_000_000 + Math.floor(Math.random() * 20_000_000),
    sourcesOnline: 648_000 + Math.floor(Math.random() * 5000),
    queryLatencyMs: 180 + Math.floor(Math.random() * 320),
    ingestionLagMs: 800 + Math.floor(Math.random() * 400),
  };
}

export function generateSecurityEvent() {
  const threat = randomItem(THREAT_TYPES);
  const riskScore = threat.severity === 'critical'
    ? 85 + Math.floor(Math.random() * 15)
    : threat.severity === 'high'
      ? 65 + Math.floor(Math.random() * 20)
      : 40 + Math.floor(Math.random() * 25);

  const alertId = `sec-${Date.now().toString(36)}-${Math.floor(Math.random() * 10000)}`;

  return {
    id: alertId,
    alertId,
    timestamp: new Date().toISOString(),
    title: threat.ruleName,
    rule_name: threat.ruleName,
    rule_id: threat.ruleId,
    rule_type: threat.ruleType,
    mitre_tactic: threat.mitreTactic,
    alert_index: threat.index,
    'event.category': threat.type.includes('PCI') ? 'compliance' : 'authentication',
    'event.action': threat.type.toLowerCase().replace(/\s+/g, '-'),
    'event.outcome': threat.severity === 'medium' ? 'unknown' : 'failure',
    'source.ip': randomIp(),
    'user.name': randomItem(SYNTHETIC_USERS),
    'host.name': `server-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
    'labels.pci': threat.type.includes('PCI') || Math.random() > 0.7,
    source_type: randomItem(SECURITY_SOURCES),
    threat_type: threat.type,
    severity: threat.severity,
    status: Math.random() > 0.3 ? 'open' : 'acknowledged',
    risk_score: riskScore,
    remediation: threat.remediation,
    events_correlated: Math.floor(Math.random() * 50) + 3,
    blast_radius: Math.floor(Math.random() * 12) + 1,
    kibana_space: 'security',
    project: 'paypal-security-prod',
  };
}

export function generateSecurityFeed(count = 8) {
  return Array.from({ length: count }, () => generateSecurityEvent())
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export function generateSecurityIngestionStats() {
  return {
    eventsPerSecond: 3_500_000 + Math.floor(Math.random() * 200_000),
    tbPerDay: 298 + Math.random() * 5,
    sourcesOnline: 502_000 + Math.floor(Math.random() * 8000),
    pciTbPerDay: 148 + Math.random() * 4,
    queriesToday: 1_100_000 + Math.floor(Math.random() * 400_000),
    mttdMinutes: 4.2 + Math.random() * 2,
    mttrMinutes: 18 + Math.random() * 12,
  };
}

export function generateTraceSummary() {
  return {
    totalSpans: 1_200_000_000,
    errorRate: 0.08 + Math.random() * 0.05,
    p50Latency: 45 + Math.random() * 10,
    p99Latency: 320 + Math.random() * 80,
    activeServices: SERVICES.length,
  };
}

export default {
  generateMetricsSeries,
  generateIngestionStats,
  generateSecurityEvent,
  generateSecurityFeed,
  generateSecurityIngestionStats,
  generateTraceSummary,
};
