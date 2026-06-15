/**
 * Simulates Google A2A (Agent-to-Agent) calls to Datadog's observability agent.
 * Telco uses Datadog as primary for metrics/traces; Elastic orchestrates via A2A during incidents.
 */

import {
  ELASTIC_ORCHESTRATOR_AGENT,
  ELASTIC_AGENT_CARD,
  buildA2ARequest,
  buildA2AResponse,
  makeContextId,
  makeTaskId,
  wrapA2AResult,
} from './a2a-common.js';
import { CHECKOUT_INCIDENT, checkoutPrompt } from './demo-incident.js';

export { ELASTIC_AGENT_CARD, ELASTIC_ORCHESTRATOR_AGENT };

export const DATADOG_AGENT_CARD = {
  name: 'datadog-observability-agent',
  description: 'Datadog Bits AI agent — metrics, traces, monitors, and APM (Telco primary O11y)',
  url: 'https://agent.datadoghq.com/.well-known/agent.json',
  version: '2.1.0',
  provider: 'Datadog, Inc.',
  capabilities: {
    streaming: true,
    pushNotifications: true,
  },
  skills: [
    { id: 'get_metrics', name: 'Query Metrics', description: 'Datadog metrics API — 500M+ datapoints/min' },
    { id: 'get_traces', name: 'APM Traces', description: 'Distributed traces — 1.2B spans/min peak' },
    { id: 'get_monitors', name: 'Monitors & SLOs', description: 'Active monitors and alert status' },
    { id: 'query_logs', name: 'Log Analytics', description: 'Datadog Log Management (legacy eBay pipeline)' },
  ],
  authentication: { schemes: ['oauth2', 'apiKey'] },
};

function buildDatadogMetrics(regionId, service) {
  const seed = regionId?.slice(-4) || '7291';
  const p99 = 380 + parseInt(seed, 10) % 120;
  return {
    source: 'datadog.metrics.query',
    site: 'datadoghq.com',
    window: 'last_15m',
    series: [
      { metric: 'trace.http.request.duration.p99', service: 'checkout-api', value: p99, unit: 'ms', tags: [`regions_id:${regionId}`, 'env:production'] },
      { metric: 'trace.http.request.errors', service: 'checkout-api', value: 2.1 + (parseInt(seed, 10) % 10) / 10, unit: 'percent', tags: [`regions_id:${regionId}`] },
      { metric: 'checkout.transactions.rate', service: 'checkout-api', value: 48500 + parseInt(seed, 10) * 12, unit: 'per_minute', tags: [`regions_id:${regionId}`] },
      { metric: 'payment.success_rate', service: 'payment-gateway', value: 99.4 - (parseInt(seed, 10) % 5) / 10, unit: 'percent', tags: [`regions_id:${regionId}`] },
      { metric: 'db.pool.connections.active', service: 'checkout-api', value: CHECKOUT_INCIDENT.poolConnections.active, unit: 'count', tags: ['pool:checkout-primary'], alert: `threshold ${CHECKOUT_INCIDENT.poolConnections.max} exceeded` },
    ],
  };
}

function buildDatadogTraces(regionId) {
  return {
    source: 'datadog.apm.search',
    count: 1,
    traces: [
      {
        trace_id: CHECKOUT_INCIDENT.traceId,
        root_service: CHECKOUT_INCIDENT.service,
        version: CHECKOUT_INCIDENT.version,
        duration_ms: CHECKOUT_INCIDENT.durationMs,
        status: 'error',
        regions_id: regionId,
        spans: 7,
        resource: 'POST /api/v2/checkout',
        error_type: 'database.pool_exhausted',
      },
    ],
    slowest_span: {
      name: CHECKOUT_INCIDENT.criticalSpan,
      service: CHECKOUT_INCIDENT.service,
      duration_ms: CHECKOUT_INCIDENT.criticalSpanMs,
      resource: 'SELECT * FROM transactions WHERE cart_id = ?',
    },
  };
}

function buildDatadogMonitors(regionId) {
  return {
    source: 'datadog.monitors.list',
    triggered: [
      { id: 12847291, name: 'Checkout p99 latency > 400ms', status: 'Alert', scope: `regions_id:${regionId}`, triggered_at: new Date(Date.now() - 8 * 60000).toISOString() },
      { id: 12847292, name: 'DB connection pool > 90%', status: 'Warn', scope: 'service:checkout-api', triggered_at: new Date(Date.now() - 12 * 60000).toISOString() },
    ],
    total_monitors: 2847,
  };
}

export function simulateA2ACall({ regionId = 'REG-8847291', regionName = 'Acme Global Retail', service = 'checkout-api', taskType = 'investigate_latency' } = {}) {
  const taskId = makeTaskId('dd');
  const contextId = makeContextId(regionId);

  const taskPrompts = {
    investigate_latency: `${checkoutPrompt(regionId, regionName)} — return p99, error traces, monitors.`,
    fetch_traces: `Fetch ${CHECKOUT_INCIDENT.traceId} and critical span ${CHECKOUT_INCIDENT.criticalSpan} for regions_id:${regionId}.`,
    correlate_incident: `Correlate Datadog metrics with ${CHECKOUT_INCIDENT.traceId} checkout failure for ${regionId}.`,
  };

  const request = buildA2ARequest({
    taskId,
    contextId,
    prompt: taskPrompts[taskType] || taskPrompts.investigate_latency,
    toAgent: DATADOG_AGENT_CARD,
    delegation: 'elastic-workflow-orchestrator → datadog-observability-agent',
  });

  const metrics = buildDatadogMetrics(regionId, service);
  const traces = buildDatadogTraces(regionId);
  const monitors = buildDatadogMonitors(regionId);

  const response = buildA2AResponse({
    taskId,
    contextId,
    agentCard: DATADOG_AGENT_CARD,
    latencyMs: 142,
    extraMeta: {
      datadogSite: 'datadoghq.com',
      otelExportNote: 'Same OTel instrumentation — no code change required for Elastic DR',
    },
    artifacts: [
        {
          artifactId: 'metrics-bundle',
          name: 'Datadog Metrics',
          parts: [{ type: 'data', data: metrics }],
        },
        {
          artifactId: 'traces-bundle',
          name: 'APM Traces',
          parts: [{ type: 'data', data: traces }],
        },
        {
          artifactId: 'monitors-bundle',
          name: 'Active Monitors',
          parts: [{ type: 'data', data: monitors }],
        },
        {
          artifactId: 'ai-summary',
          name: 'Datadog Agent Analysis',
          parts: [{
            type: 'text',
            text: `${CHECKOUT_INCIDENT.traceId}: p99 ${metrics.series[0].value}ms, pool ${CHECKOUT_INCIDENT.poolConnections.active}/${CHECKOUT_INCIDENT.poolConnections.max}, ${CHECKOUT_INCIDENT.criticalSpan} ${CHECKOUT_INCIDENT.criticalSpanMs}ms.`,
          }],
        },
    ],
  });

  const elasticSynthesis = {
    agent: 'elastic-workflow-orchestrator',
    action: 'merge_datadog_context',
    summary: `Datadog: ${CHECKOUT_INCIDENT.traceId} · p99 ${metrics.series[0].value}ms · ${CHECKOUT_INCIDENT.criticalSpan} critical path.`,
    nextStep: 'Scale checkout-api +30%, enable regions circuit breaker',
  };

  return wrapA2AResult({
    target: 'datadog',
    regionId,
    regionName,
    taskId,
    contextId,
    request,
    response,
    elasticSynthesis,
    timingExtra: { datadogQueryMs: 89 },
    narrative: 'Datadog primary O11y — same OTel export, delegated via A2A.',
  });
}

export function getAgentCards() {
  return { elastic: ELASTIC_AGENT_CARD, datadog: DATADOG_AGENT_CARD };
}
