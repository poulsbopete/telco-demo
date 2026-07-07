import {
  buildTelcoLaunchDiscoverEsql,
  buildTelcoPipelineDiscoverEsql,
  buildTelcoRegionsDiscoverEsql,
  buildTelcoTracesDiscoverEsql,
  escapeEsql,
} from '../../lib/telco-discover-esql.js';
import {
  resolveElasticWorkflowId,
  TELCO_CORE_WORKFLOW_SLUG,
} from '../../lib/telco-workflow-ids.js';

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

/** ES|QL preloaded in Kibana Discover — telco core pipeline (renamed from OTel service names) */
export const TELCO_DISCOVER_ESQL = buildTelcoPipelineDiscoverEsql();

export {
  buildTelcoLaunchDiscoverEsql,
  buildTelcoPipelineDiscoverEsql,
  buildTelcoRegionsDiscoverEsql,
  buildTelcoTracesDiscoverEsql,
};

/** OTel demo cluster data can lag — use a wide window so Discover always hits indexed docs */
export const TELCO_DISCOVER_TIME = { from: 'now-90d', to: 'now' };

function escapeEsqlLog(value) {
  return escapeEsql(value);
}

/** ES|QL for Discover deep link scoped to a single log event */
export function buildLogDiscoverEsql(log) {
  if (log?.traceId) {
    return buildTelcoTracesDiscoverEsql({ traceId: log.traceId, regionId: log.regionId });
  }

  if (log?.regionId) {
    return buildTelcoRegionsDiscoverEsql(log.regionId);
  }

  const clauses = ['service.name IN ("checkout", "payment", "cart", "checkoutservice", "paymentservice")'];
  if (log?.service) clauses.push(`service.name == "${escapeEsqlLog(log.service)}"`);
  if (log?.level) {
    const upper = log.level.toUpperCase();
    clauses.push(`log.level IN ("${escapeEsqlLog(log.level)}", "${escapeEsqlLog(upper)}")`);
  }
  if (log?.host) clauses.push(`host.name == "${escapeEsqlLog(log.host)}"`);

  return [
    'FROM logs-generic.otel-default',
    `| WHERE ${clauses.join(' AND ')}`,
    '| EVAL telco_service = CASE(',
    'service.name == "checkout" OR service.name == "checkoutservice", "Core Signaling (5G AMF/SMF)",',
    'service.name == "payment" OR service.name == "paymentservice", "Billing & Charging",',
    'service.name == "cart", "Service Provisioning",',
    'COALESCE(service.name, "Unknown"))',
    '| KEEP @timestamp, telco_service, service.name, log.level, body.text, trace.id, host.name',
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

/** Registered Elastic Workflows slug (bootstrap via npm run bootstrap:workflow) */
export const ELASTIC_CORE_WORKFLOW_SLUG = TELCO_CORE_WORKFLOW_SLUG;

export { resolveElasticWorkflowId, TELCO_CORE_WORKFLOW_SLUG };

/** Deep link to Elastic Workflows in Serverless (/app/workflows) */
export function elasticWorkflowUrl(elasticBase, { workflowId, executionId, url } = {}) {
  if (url) return url;
  const base = (elasticBase || import.meta.env.VITE_KIBANA_URL || '').replace(/\/$/, '');
  if (!base) return null;
  const resolvedWorkflowId = resolveElasticWorkflowId(workflowId);
  if (resolvedWorkflowId && executionId) {
    const params = new URLSearchParams({
      executionId,
      stepExecutionId: '__overview',
      tab: 'executions',
    });
    return `${base}/app/workflows/${encodeURIComponent(resolvedWorkflowId)}?${params.toString()}`;
  }
  if (resolvedWorkflowId) {
    return `${base}/app/workflows/${encodeURIComponent(resolvedWorkflowId)}`;
  }
  return `${base}/app/workflows`;
}

/** @deprecated use elasticWorkflowUrl */
export const kibanaWorkflowUrl = elasticWorkflowUrl;

/** Deep links into Kibana Security (SIEM, cases, rules, entity analytics). */
export const SECURITY_KIBANA_DEFAULT = 'https://my-security-project-b0679b.kb.us-central1.gcp.elastic.cloud';

export function getSecurityKibanaUrl(override) {
  const base = (override || import.meta.env.VITE_SECURITY_KIBANA_URL || SECURITY_KIBANA_DEFAULT).replace(/\/$/, '');
  return base || null;
}

export function kibanaSecurityUrl(kibanaBase, section = 'alerts') {
  const base = getSecurityKibanaUrl(kibanaBase);
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

  return `${base}${paths[section] || paths.alerts}`;
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

/** Adaptive Networks — fault injection + workflow polling */
/** Adaptive Networks — fault breakdown (body.text mnemonics; attributes.* not ES|QL columns) */
export const ADAPTIVE_DISCOVER_ESQL = [
  'FROM logs.otel.adaptive-networks*',
  '| WHERE severity_text == "ERROR"',
  '| EVAL fault = CASE(',
  '    body.text LIKE "*SW_MATM*", "MAC Flap",',
  '    body.text LIKE "*SPANTREE*", "STP",',
  '    body.text LIKE "*BGP-3*", "BGP",',
  '    body.text LIKE "*INTF-4*", "Interface",',
  '    "Other")',
  '| STATS errors = COUNT(*) BY fault',
  '| SORT errors DESC',
  '| LIMIT 10',
].join(' ');

export function fetchAdaptiveNetworksConfig() {
  return fetchJson('/api/adaptive-networks/config');
}

export function injectNetworkFault(channel) {
  return fetchJson('/api/adaptive-networks/inject', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel }),
  });
}

export function pollAdaptiveExecutions(since) {
  return fetchJson(`/api/adaptive-networks/executions?since=${encodeURIComponent(since)}`);
}

export function resumeAdaptiveExecution(executionId, { approved, notes } = {}) {
  return fetchJson('/api/adaptive-networks/resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ executionId, approved, notes }),
  });
}

export function kibanaAdaptiveCasesUrl(kibanaBase) {
  const base = kibanaBase || import.meta.env.VITE_KIBANA_URL || '';
  if (!base) return null;
  return `${base.replace(/\/$/, '')}/app/observability/cases?tags=adaptive-networks`;
}

/** Elastic Serverless Search project (separate from otel-demo observability cluster) */
export const SEARCH_KIBANA_DEFAULT = 'https://ai-assistants-ffcafb.kb.us-east-1.aws.elastic.cloud';
export const SEARCH_ENGINE_DEFAULT = 'telco-tmobile-kb';

export function getSearchKibanaUrl(override) {
  const base = (override || import.meta.env.VITE_SEARCH_KIBANA_URL || SEARCH_KIBANA_DEFAULT).replace(/\/$/, '');
  return base || null;
}

export function getSearchEngine(override) {
  return override || import.meta.env.VITE_SEARCH_ENGINE || SEARCH_ENGINE_DEFAULT;
}

/** Default ES|QL for telco-tmobile-kb (Serverless ES index — not a legacy App Search engine) */
export function buildSearchKbDiscoverEsql(engine, { titleLike } = {}) {
  const index = getSearchEngine(engine);
  const lines = [`FROM ${index}`];
  if (titleLike) {
    const term = String(titleLike).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    lines.push(`| WHERE title LIKE "*${term}*" OR content LIKE "*${term}*"`);
  }
  lines.push('| KEEP title, section, carrier, persona_tags, content');
  lines.push('| SORT fetched_at DESC');
  lines.push(`| LIMIT ${titleLike ? 25 : 50}`);
  return lines.join(' ');
}

/** Discover deep link on the Search Serverless project */
export function kibanaSearchDiscoverUrl(kibanaBase, { query, engine, timeFrom = 'now-365d', timeTo = 'now' } = {}) {
  const base = getSearchKibanaUrl(kibanaBase);
  if (!base) return null;
  const esql = query || buildSearchKbDiscoverEsql(engine);
  return kibanaDiscoverUrl(base, { query: esql, timeFrom, timeTo });
}

/** Search Serverless — KB index in Discover (replaces legacy /app/search routes) */
export function kibanaSearchHomeUrl(kibanaBase) {
  return kibanaSearchDiscoverUrl(kibanaBase);
}

/** Agent Builder on the Search Serverless project */
export function kibanaAgentBuilderUrl(kibanaBase) {
  const base = getSearchKibanaUrl(kibanaBase);
  if (!base) return null;
  return `${base}/app/agent_builder`;
}

/** telco-tmobile-kb index in Discover */
export function kibanaSearchAppUrl(kibanaBase, engine) {
  return kibanaSearchDiscoverUrl(kibanaBase, { engine });
}

/** Document/context drill-down in Discover */
export function kibanaSearchDocumentUrl(kibanaBase, { engine, documentId, query, title } = {}) {
  const searchTerm = title || query || documentId;
  if (searchTerm) {
    return kibanaSearchDiscoverUrl(kibanaBase, {
      engine,
      query: buildSearchKbDiscoverEsql(engine, { titleLike: searchTerm }),
    });
  }
  return kibanaSearchAppUrl(kibanaBase, engine);
}

/** Telco demo dashboard IDs (created via scripts/deploy-telco-dashboards.mjs) */
export const TELCO_O11Y_DASHBOARD_ID = 'telco-demo-network-telemetry';
export const TELCO_SEARCH_DASHBOARD_ID = 'telco-demo-enterprise-search';
export const TELCO_SECURITY_DASHBOARD_ID = 'telco-demo-elastic-security';

export function kibanaDashboardUrl(kibanaBase, dashboardId) {
  const base = (kibanaBase || '').replace(/\/$/, '');
  if (!base || !dashboardId) return null;
  return `${base}/app/dashboards#/view/${encodeURIComponent(dashboardId)}`;
}

export function kibanaO11yDashboardUrl(kibanaBase) {
  return kibanaDashboardUrl(
    kibanaBase || import.meta.env.VITE_KIBANA_URL || '',
    TELCO_O11Y_DASHBOARD_ID,
  );
}

export function kibanaSearchDashboardUrl(kibanaBase) {
  return kibanaDashboardUrl(getSearchKibanaUrl(kibanaBase), TELCO_SEARCH_DASHBOARD_ID);
}

export function kibanaSecurityDashboardUrl(kibanaBase) {
  return kibanaDashboardUrl(getSecurityKibanaUrl(kibanaBase), TELCO_SECURITY_DASHBOARD_ID);
}
