/**
 * Shared Google A2A v0.2 helpers for cross-project agent federation.
 */

export const ELASTIC_ORCHESTRATOR_AGENT = {
  name: 'elastic-workflow-orchestrator',
  description: 'Elastic Workflows AI agent — correlates logs, ML anomalies, and regions context across Elastic projects',
  url: 'https://paypal-demo.elastic.co/.well-known/agent.json',
  version: '1.0.0',
  project: 'elastic_observability',
  capabilities: { streaming: false, pushNotifications: false },
  skills: [
    { id: 'esql_query', name: 'ES|QL Query', description: 'Query Elasticsearch logs and metrics' },
    { id: 'ml_anomaly', name: 'ML Anomaly Analysis', description: 'Elastic ML anomaly detection' },
    { id: 'workflow_remediate', name: 'Auto Remediation', description: 'Execute Elastic Workflows' },
    { id: 'a2a_delegate', name: 'A2A Delegation', description: 'Delegate tasks to federated agents via A2A' },
  ],
  authentication: { schemes: ['apiKey'] },
};

/** @deprecated use ELASTIC_ORCHESTRATOR_AGENT */
export const ELASTIC_AGENT_CARD = ELASTIC_ORCHESTRATOR_AGENT;

export function makeTaskId(prefix = 'a2a') {
  return `${prefix}-task-${Date.now().toString(36)}`;
}

export function makeContextId(regionId) {
  return `ctx-${regionId}-${Date.now().toString(36)}`;
}

export function buildA2ARequest({ taskId, contextId, prompt, toAgent, delegation }) {
  return {
    protocol: 'A2A v0.2',
    jsonrpc: '2.0',
    method: 'message/send',
    id: taskId,
    params: {
      message: {
        role: 'user',
        parts: [{ type: 'text', text: prompt }],
      },
      configuration: { blocking: true, acceptedOutputModes: ['text', 'data'] },
    },
    metadata: {
      from: ELASTIC_ORCHESTRATOR_AGENT,
      to: toAgent,
      contextId,
      delegation,
    },
  };
}

export function buildA2AResponse({ taskId, contextId, agentCard, artifacts, latencyMs = 120, extraMeta = {} }) {
  return {
    protocol: 'A2A v0.2',
    jsonrpc: '2.0',
    method: 'message/result',
    id: taskId,
    result: {
      id: `result-${taskId}`,
      contextId,
      status: { state: 'completed', timestamp: new Date().toISOString() },
      artifacts,
    },
    metadata: {
      agent: agentCard.name,
      project: agentCard.project,
      latencyMs: latencyMs + Math.floor(Math.random() * 60),
      ...extraMeta,
    },
  };
}

export function wrapA2AResult({
  target,
  regionId,
  regionName,
  taskId,
  contextId,
  request,
  response,
  elasticSynthesis,
  narrative,
  timingExtra = {},
}) {
  return {
    ok: true,
    target,
    taskId,
    contextId,
    regionId,
    regionName,
    request,
    response,
    elasticSynthesis,
    timing: {
      a2aRoundTripMs: response.metadata.latencyMs,
      ...timingExtra,
      totalMs: response.metadata.latencyMs + (timingExtra.processingMs ?? 40),
    },
    narrative,
  };
}
