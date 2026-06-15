const API_BASE = import.meta.env.VITE_API_BASE || '';

async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json', ...options.headers },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

export function fetchHealth() {
  return fetchJson('/api/health');
}

/** Telco regions observability overview (primary live endpoint) */
export function fetchTelcoOverview() {
  return fetchJson('/api/demo/telco-overview');
}

export function fetchRegionDetail(regionId) {
  return fetchJson(`/api/demo/region?regionId=${encodeURIComponent(regionId)}`);
}

export function fetchOverview() {
  return fetchTelcoOverview();
}

export function searchLogs({ service, level, q, regionId, limit = 25 } = {}) {
  const params = new URLSearchParams();
  if (service) params.set('service', service);
  if (level) params.set('level', level);
  if (q) params.set('q', q);
  if (regionId) params.set('regionId', regionId);
  if (limit) params.set('limit', String(limit));
  return fetchJson(`/api/demo/logs?${params}`);
}

export function fetchWorkflow(workflowId) {
  return fetchJson(`/api/demo/workflow?workflowId=${encodeURIComponent(workflowId)}`);
}

export function runWorkflow({ workflowId, anomalyId, regionId, alertId, threatType, hostName, userName }) {
  return fetchJson('/api/demo/workflow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workflowId, anomalyId, regionId, alertId, threatType, hostName, userName }),
  });
}

export const SECURITY_INCIDENT_WORKFLOW_ID = 'wf-security-incident-response';

export function runSecurityIncidentWorkflow({
  alertId,
  threatType,
  hostName,
  userName,
  workflowId = SECURITY_INCIDENT_WORKFLOW_ID,
} = {}) {
  return runWorkflow({ workflowId, alertId, anomalyId: alertId, threatType, hostName, userName });
}

export function openSecurityCase({
  alertId,
  threatType,
  hostName,
  userName,
} = {}) {
  return simulateElasticSecurityA2A({
    regionId: alertId || 'SEC-ALERT',
    regionName: userName || 'Telco SOC',
    taskType: 'open_case',
    alertId,
    threatType,
    hostName,
    userName,
  });
}

export function simulateDatadogA2A({ regionId, regionName, taskType = 'investigate_latency' } = {}) {
  return fetchJson('/api/demo/datadog-a2a', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ regionId, regionName, taskType }),
  });
}

export function simulateElasticSecurityA2A({
  regionId,
  regionName,
  taskType = 'correlate_incident',
  alertId,
  threatType,
  hostName,
  userName,
} = {}) {
  return fetchJson('/api/demo/elastic-security-a2a', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      regionId,
      regionName,
      taskType,
      alertId,
      threatType,
      hostName,
      userName,
    }),
  });
}

export function simulateElasticSearchA2A({ regionId, regionName, taskType = 'fetch_runbooks' } = {}) {
  return fetchJson('/api/demo/elastic-search-a2a', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ regionId, regionName, taskType }),
  });
}

export function simulateA2AFederation({ regionId, regionName, targets } = {}) {
  return fetchJson('/api/demo/a2a-federation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ regionId, regionName, targets }),
  });
}

export function runEsql(query) {
  return fetchJson('/api/esql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
}

/** ES|QL preloaded in Kibana Discover — Telco payment pipeline by service */
export const TELCO_DISCOVER_ESQL = [
  'FROM logs-generic.otel-default',
  '| WHERE service.name IN ("checkout", "payment", "cart")',
  '| STATS volume = COUNT(*), errors = COUNT(*) WHERE log.level IN ("ERROR", "Error", "WARN", "Warning")',
  '  BY service.name',
  '| EVAL error_rate_pct = ROUND(errors * 100.0 / volume, 3)',
  '| SORT volume DESC',
  '| LIMIT 10',
].join(' ');

/** OTel demo cluster data can lag — use a wide window so Discover always hits indexed docs */
export const TELCO_DISCOVER_TIME = { from: 'now-90d', to: 'now' };

function escapeEsql(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/** ES|QL for Discover deep link scoped to a single log event */
export function buildLogDiscoverEsql(log) {
  if (log?.traceId) {
    return [
      'FROM logs-generic.otel-default',
      `| WHERE trace.id == "${escapeEsql(log.traceId)}"`,
      '| KEEP @timestamp, service.name, log.level, body.text, trace.id, host.name',
      '| SORT @timestamp DESC',
      '| LIMIT 50',
    ].join(' ');
  }

  const filters = ['service.name IN ("checkout", "payment", "cart")'];
  if (log?.service) filters.push(`service.name == "${escapeEsql(log.service)}"`);
  if (log?.level) {
    const upper = log.level.toUpperCase();
    filters.push(`log.level IN ("${escapeEsql(log.level)}", "${escapeEsql(upper)}")`);
  }
  if (log?.host) filters.push(`host.name == "${escapeEsql(log.host)}"`);

  return [
    'FROM logs-generic.otel-default',
    `| WHERE ${filters.join(' AND ')}`,
    '| KEEP @timestamp, service.name, log.level, body.text, trace.id, host.name',
    '| SORT @timestamp DESC',
    '| LIMIT 25',
  ].join(' ');
}

export function kibanaDiscoverLogUrl(kibanaBase, log) {
  if (!log) return null;
  return kibanaDiscoverUrl(kibanaBase, {
    query: buildLogDiscoverEsql(log),
    ...TELCO_DISCOVER_TIME,
  });
}

function risonQuote(str) {
  if (/^[\w\-.*@]+$/.test(str)) return str;
  return `'${String(str).replace(/'/g, "!'")}'`;
}

function risonEncode(value) {
  if (value === null || value === undefined) return '!n';
  if (value === true) return '!t';
  if (value === false) return '!f';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return risonQuote(value);
  if (Array.isArray(value)) {
    return value.length ? `!(${value.map(risonEncode).join(',')})` : '!()';
  }
  if (typeof value === 'object') {
    return `(${Object.entries(value).map(([k, v]) => `${k}:${risonEncode(v)}`).join(',')})`;
  }
  return String(value);
}

/** Registered Elastic Workflows slug for the Telco checkout remediation workflow */
export const ELASTIC_CORE_WORKFLOW_SLUG = 'telco-core-latency-auto-remediation';

const DEMO_WORKFLOW_SLUGS = {
  'wf-core-latency-remediation': ELASTIC_CORE_WORKFLOW_SLUG,
};

export function resolveElasticWorkflowId(workflowId) {
  if (!workflowId) return ELASTIC_CORE_WORKFLOW_SLUG;
  return DEMO_WORKFLOW_SLUGS[workflowId] || workflowId;
}

/** Deep link to Elastic Workflows in Serverless (/app/workflows) */
export function elasticWorkflowUrl(elasticBase, { workflowId, executionId, url } = {}) {
  if (url) return url;
  const base = (elasticBase || import.meta.env.VITE_KIBANA_URL || '').replace(/\/$/, '');
  if (!base) return null;
  const resolvedWorkflowId = resolveElasticWorkflowId(workflowId);
  if (executionId) {
    const params = new URLSearchParams({
      executionId,
      stepExecutionId: '__overview',
      tab: 'executions',
    });
    return `${base}/app/workflows/${encodeURIComponent(resolvedWorkflowId)}?${params.toString()}`;
  }
  if (workflowId || resolvedWorkflowId) {
    return `${base}/app/workflows/${encodeURIComponent(resolvedWorkflowId)}`;
  }
  return `${base}/app/workflows`;
}

/** @deprecated use elasticWorkflowUrl */
export const kibanaWorkflowUrl = elasticWorkflowUrl;

/** Deep links into Kibana Security (SIEM, cases, rules, entity analytics). */
export function kibanaSecurityUrl(kibanaBase, section = 'alerts') {
  const base = kibanaBase || import.meta.env.VITE_KIBANA_URL || '';
  if (!base) return null;

  const paths = {
    alerts: '/app/security/alerts',
    cases: '/app/security/cases',
    rules: '/app/security/rules',
    overview: '/app/security/overview',
    entityAnalytics: '/app/security/explore/users',
    attackDiscovery: '/app/security/attack_discovery',
    timelines: '/app/security/timelines',
  };

  return `${base.replace(/\/$/, '')}${paths[section] || paths.alerts}`;
}

export function kibanaDiscoverUrl(kibanaBase, { query, timeFrom = TELCO_DISCOVER_TIME.from, timeTo = TELCO_DISCOVER_TIME.to } = {}) {
  const base = kibanaBase || import.meta.env.VITE_KIBANA_URL || '';
  if (!base) return null;

  const esql = query || TELCO_DISCOVER_ESQL;
  const appState = {
    dataSource: { type: 'esql' },
    filters: [],
    interval: 'auto',
    query: { esql },
    sort: [],
  };
  const globalState = {
    filters: [],
    refreshInterval: { pause: true, value: 60000 },
    time: { from: timeFrom, to: timeTo },
  };

  const hash = `/?_g=${risonEncode(globalState)}&_a=${risonEncode(appState)}`;
  return `${base.replace(/\/$/, '')}/app/discover#${hash}`;
}

export function formatCount(n) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}

export function formatUsd(n) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}
