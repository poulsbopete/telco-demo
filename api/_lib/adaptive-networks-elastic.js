import { getElasticConfig } from './elastic.js';

const INCIDENT_WORKFLOW_NAME =
  process.env.INCIDENT_WORKFLOW_NAME ?? 'Adaptive Networks Network Incident Response';
const INCIDENT_WORKFLOW_ID = process.env.INCIDENT_WORKFLOW_ID ?? '';

function requireAdaptiveConfig() {
  const config = getElasticConfig();
  if (!config.ok) throw new Error(config.error);
  const kibanaUrl = process.env.KIBANA_URL || process.env.VITE_KIBANA_URL || config.kibanaUrl;
  if (!kibanaUrl) throw new Error('Missing KIBANA_URL');
  return { kibanaUrl: kibanaUrl.replace(/\/$/, ''), apiKey: config.apiKey };
}

function kibanaHeaders(apiKey) {
  return {
    Authorization: `ApiKey ${apiKey}`,
    'Content-Type': 'application/json',
    'kbn-xsrf': 'true',
    'x-elastic-internal-origin': 'Kibana',
  };
}

async function kibanaFetch(path, { method = 'GET', body } = {}) {
  const { kibanaUrl, apiKey } = requireAdaptiveConfig();
  const res = await fetch(`${kibanaUrl}${path}`, {
    method,
    headers: kibanaHeaders(apiKey),
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = data?.message || data?.error || text.slice(0, 300) || res.statusText;
    throw new Error(`Kibana ${path} failed (${res.status}): ${msg}`);
  }
  return data;
}

export async function resolveIncidentWorkflowId() {
  if (INCIDENT_WORKFLOW_ID) return INCIDENT_WORKFLOW_ID;

  const data = await kibanaFetch('/api/workflows?page=1&size=100');
  const matches = (data.results ?? []).filter(w => w.name === INCIDENT_WORKFLOW_NAME);
  if (!matches.length) {
    throw new Error(`Workflow not found: ${INCIDENT_WORKFLOW_NAME}`);
  }

  const prefixed = matches.filter(w => w.id.startsWith('adaptive-networks-network-incident-response'));
  const pool = prefixed.length ? prefixed : matches;
  pool.sort((a, b) => {
    const suffix = id => {
      const part = id.split('-').pop() ?? '0';
      const n = Number(part);
      return Number.isFinite(n) ? n : 0;
    };
    return suffix(a.id) - suffix(b.id);
  });
  return pool[pool.length - 1].id;
}

export async function listWorkflowExecutions(workflowId, page = 1, size = 10) {
  return kibanaFetch(
    `/api/workflows/workflow/${encodeURIComponent(workflowId)}/executions?page=${page}&size=${size}`,
  );
}

export async function getWorkflowExecution(executionId) {
  return kibanaFetch(`/api/workflows/executions/${encodeURIComponent(executionId)}`);
}

const TERMINAL_STEP_STATUSES = new Set(['completed', 'failed', 'cancelled', 'skipped']);

export function isExecutionWaitingForHitl(detail) {
  const status = (detail.status ?? '').toLowerCase();
  if (status === 'waiting_for_input') return true;
  if (detail.currentNodeId?.includes('hitl_approval')) return true;
  return Boolean(
    detail.stepExecutions?.some(
      s => s.stepId === 'hitl_approval' && !TERMINAL_STEP_STATUSES.has((s.status ?? '').toLowerCase()),
    ),
  );
}

export function canResumeHitlApproval(detail) {
  const status = (detail.status ?? '').toLowerCase();
  return status === 'waiting_for_input' || isExecutionWaitingForHitl(detail);
}

export async function resumeWorkflowExecution(executionId, input) {
  return kibanaFetch(`/api/workflows/executions/${encodeURIComponent(executionId)}/resume`, {
    method: 'POST',
    body: { input },
  });
}

export function executionDeepLink(executionId, workflowId, spaceId = 'default') {
  const { kibanaUrl } = requireAdaptiveConfig();
  const prefix = !spaceId || spaceId === 'default' ? '' : `/s/${encodeURIComponent(spaceId)}`;
  const params = new URLSearchParams({
    tab: 'executions',
    executionId,
    stepExecutionId: '__overview',
  });
  return `${kibanaUrl}${prefix}/app/workflows/${encodeURIComponent(workflowId)}?${params.toString()}`;
}

export function workflowsLibraryDeepLink(spaceId = 'default') {
  const { kibanaUrl } = requireAdaptiveConfig();
  const prefix = !spaceId || spaceId === 'default' ? '' : `/s/${encodeURIComponent(spaceId)}`;
  return `${kibanaUrl}${prefix}/app/workflows`;
}

export function casesDeepLink(spaceId = 'default') {
  const { kibanaUrl } = requireAdaptiveConfig();
  const prefix = !spaceId || spaceId === 'default' ? '' : `/s/${encodeURIComponent(spaceId)}`;
  return `${kibanaUrl}${prefix}/app/observability/cases?tags=adaptive-networks`;
}

export function getPublicConfig() {
  const { kibanaUrl } = requireAdaptiveConfig();
  return {
    kibanaUrl,
    workflowName: INCIDENT_WORKFLOW_NAME,
    workflowId: INCIDENT_WORKFLOW_ID || null,
    alertIntervalHint: '~60 seconds',
    otlpConfigured: Boolean(process.env.OTLP_ENDPOINT && (process.env.ES_API_KEY || process.env.ELASTICSEARCH_API_KEY)),
  };
}

export function assertDemoAuth(req) {
  const secret = process.env.DEMO_API_SECRET;
  if (!secret) return;
  const header = req.headers['x-demo-secret'];
  if (header !== secret) {
    throw new Error('Unauthorized');
  }
}
