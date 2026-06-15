/**
 * Register and run Telco demo workflows in Kibana Serverless.
 * The demo UI simulates steps locally; this module ensures a real workflow exists in Kibana.
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { getElasticConfig } from './elastic.js';

export const TELCO_CORE_WORKFLOW_NAME = 'Telco 5G Core Latency Auto-Remediation';
export const TELCO_CORE_WORKFLOW_SLUG = 'telco-core-latency-auto-remediation';

const __dir = dirname(fileURLToPath(import.meta.url));
const WORKFLOW_YAML = readFileSync(
  join(__dir, '../../workflows/telco-core-latency-remediation.yaml'),
  'utf8',
);

function kibanaHeaders(apiKey) {
  return {
    'kbn-xsrf': 'true',
    'x-elastic-internal-origin': 'Kibana',
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `ApiKey ${apiKey}`,
  };
}

export function kibanaWorkflowAppUrl(kibanaUrl, { workflowId, executionId } = {}) {
  const base = (kibanaUrl || '').replace(/\/$/, '');
  if (!base) return null;
  if (executionId && workflowId) {
    const params = new URLSearchParams({
      executionId,
      stepExecutionId: '__overview',
      tab: 'executions',
    });
    return `${base}/app/workflows/${encodeURIComponent(workflowId)}?${params.toString()}`;
  }
  if (workflowId) {
    return `${base}/app/workflows/${encodeURIComponent(workflowId)}`;
  }
  return `${base}/app/workflows`;
}

async function kibanaFetch(path, { method = 'GET', body } = {}) {
  const config = getElasticConfig();
  if (!config.ok) return { ok: false, error: config.error };

  const kibanaUrl = process.env.KIBANA_URL || process.env.VITE_KIBANA_URL || config.kibanaUrl;
  if (!kibanaUrl) return { ok: false, error: 'Missing KIBANA_URL' };

  const url = `${kibanaUrl.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    method,
    headers: kibanaHeaders(config.apiKey),
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, status: res.status, error: data.message || data.error || res.statusText, data };
  }
  return { ok: true, data, kibanaUrl };
}

export async function listKibanaWorkflows() {
  const result = await kibanaFetch('/api/workflows/workflows?size=200&sortField=name&sortDirection=asc');
  if (!result.ok) {
    const fallback = await kibanaFetch('/api/workflows?size=200');
    if (!fallback.ok) return fallback;
    return normalizeWorkflowList(fallback);
  }
  return normalizeWorkflowList(result);
}

function normalizeWorkflowList(result) {
  const raw = result.data;
  const items = raw?.workflows || raw?.data || raw?.items || (Array.isArray(raw) ? raw : []);
  return { ...result, workflows: items };
}

export async function findTelcoCheckoutWorkflow() {
  const candidates = [
    process.env.KIBANA_CORE_WORKFLOW_ID,
    TELCO_CORE_WORKFLOW_SLUG,
    'telco-core-latency-remediation',
  ].filter(Boolean);

  for (const id of candidates) {
    const got = await kibanaFetch(`/api/workflows/workflow/${encodeURIComponent(id)}`);
    if (got.ok) return got.data?.workflow || got.data;
  }

  const listed = await listKibanaWorkflows();
  if (!listed.ok) return null;

  return listed.workflows.find(w =>
    w.name === TELCO_CORE_WORKFLOW_NAME
    || w.id === TELCO_CORE_WORKFLOW_SLUG
    || (w.tags || []).includes('telco-o11y'),
  ) || null;
}

export async function ensureTelcoCheckoutWorkflow() {
  const existing = await findTelcoCheckoutWorkflow();
  if (existing?.id) return existing;

  const created = await kibanaFetch('/api/workflows/workflow', {
    method: 'POST',
    body: { yaml: WORKFLOW_YAML },
  });

  if (!created.ok) {
    return { error: created.error, status: created.status, linked: false };
  }

  return created.data?.workflow || created.data;
}

export async function runTelcoCheckoutWorkflow({ regionId = 'REG-8847291', traceId = 'trace-checkout-001' } = {}) {
  const workflow = await ensureTelcoCheckoutWorkflow();
  if (!workflow?.id) {
    return {
      linked: false,
      error: workflow?.error || 'Telco checkout workflow not found in Kibana',
      kibanaWorkflowUrl: kibanaWorkflowAppUrl(process.env.KIBANA_URL || process.env.VITE_KIBANA_URL),
    };
  }

  const kibanaUrl = process.env.KIBANA_URL || process.env.VITE_KIBANA_URL;
  const run = await kibanaFetch(`/api/workflows/workflow/${encodeURIComponent(workflow.id)}/run`, {
    method: 'POST',
    body: {
      inputs: { regionId, traceId },
      metadata: { source: 'telco-o11y-demo' },
    },
  });

  if (!run.ok) {
    return {
      linked: true,
      kibanaWorkflowId: workflow.id,
      kibanaWorkflowName: workflow.name || TELCO_CORE_WORKFLOW_NAME,
      kibanaWorkflowUrl: kibanaWorkflowAppUrl(kibanaUrl, { workflowId: workflow.id }),
      runError: run.error,
    };
  }

  const executionId =
    run.data?.workflowExecutionId
    || run.data?.executionId
    || run.data?.id
    || run.data?.execution?.id;

  return {
    linked: true,
    kibanaWorkflowId: workflow.id,
    kibanaWorkflowName: workflow.name || PAYPAL_CHECKOUT_WORKFLOW_NAME,
    kibanaWorkflowUrl: kibanaWorkflowAppUrl(kibanaUrl, { workflowId: workflow.id }),
    kibanaExecutionId: executionId || null,
    kibanaExecutionUrl: executionId
      ? kibanaWorkflowAppUrl(kibanaUrl, { workflowId: workflow.id, executionId })
      : kibanaWorkflowAppUrl(kibanaUrl, { workflowId: workflow.id }),
  };
}
