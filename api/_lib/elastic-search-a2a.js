/**
 * Simulates A2A calls to Elastic Enterprise Search (Search Serverless project).
 * Retrieves runbooks, regions playbooks, and policy docs for incident resolution.
 */

import {
  buildA2ARequest,
  buildA2AResponse,
  makeContextId,
  makeTaskId,
  wrapA2AResult,
} from './a2a-common.js';
import { CHECKOUT_INCIDENT, checkoutPrompt } from './demo-incident.js';

export const SEARCH_AGENT_CARD = {
  name: 'elastic-enterprise-search-agent',
  description: 'Enterprise Search AI agent — runbooks, regions playbooks, policy KB (Search Serverless project)',
  url: 'https://paypal-search.kb.us-east-1.aws.elastic.cloud/.well-known/agent.json',
  version: '1.1.0',
  project: 'elastic_search',
  provider: 'Elastic N.V.',
  capabilities: { streaming: true, pushNotifications: false },
  skills: [
    { id: 'semantic_search', name: 'Semantic Search', description: 'ELSER-powered runbook and policy retrieval' },
    { id: 'regions_playbooks', name: 'Merchant Playbooks', description: 'Per-regionID escalation and SLA docs' },
    { id: 'change_management', name: 'Change Management', description: 'Approved remediation procedures and CAB refs' },
    { id: 'ivr_knowledge', name: 'Support Knowledge', description: 'Customer support and IVR resolution articles' },
  ],
  authentication: { schemes: ['apiKey', 'oauth2'] },
};

function buildRunbookResults(regionId, regionName) {
  return {
    source: 'enterprise_search.search',
    engine: 'paypal-ops-runbooks',
    query: `${CHECKOUT_INCIDENT.criticalSpan} ${CHECKOUT_INCIDENT.criticalSpanMs}ms pool exhaustion ${regionId}`,
    totalHits: 4,
    documents: [
      {
        id: 'rb-checkout-pool-exhaustion',
        title: 'Runbook: Checkout DB Pool Exhaustion',
        score: 0.94,
        excerpt: 'Scale checkout-api replicas +30%. Enable per-regions circuit breaker. Verify pool max_connections ≥ 50.',
        url: '/app/enterprise_search/app/search/paypal-ops-runbooks/document/rb-checkout-pool-exhaustion',
        tags: ['checkout-api', 'latency', 'database'],
      },
      {
        id: 'rb-regions-circuit-breaker',
        title: 'Runbook: Per-Merchant Circuit Breaker',
        score: 0.89,
        excerpt: `Enable circuit breaker for regionID ${regionId} via workflow.action — limits blast radius during degradation.`,
        url: '/app/enterprise_search/app/search/paypal-ops-runbooks/document/rb-regions-circuit-breaker',
        tags: ['regionID', 'resilience'],
      },
      {
        id: 'rb-slo-verify-recovery',
        title: 'Runbook: Post-Remediation SLO Verification',
        score: 0.82,
        excerpt: 'Wait for p99 < 250ms for 5 consecutive minutes before closing incident. Notify regions webhook.',
        url: '/app/enterprise_search/app/search/paypal-ops-runbooks/document/rb-slo-verify-recovery',
        tags: ['slo', 'verification'],
      },
    ],
  };
}

function buildMerchantPlaybook(regionId, regionName) {
  return {
    source: 'enterprise_search.search',
    engine: 'regions-playbooks',
    regionId,
    documents: [
      {
        id: `mp-${regionId}`,
        title: `${regionName} — Enterprise SLA & Escalation`,
        tier: 'Enterprise',
        sla: { p99_ms: 250, error_budget_pct: 0.1 },
        escalation: ['regions-tam@paypal.com', 'checkout-oncall@paypal.com'],
        approvedActions: ['scale_replicas', 'circuit_breaker', 'read_replica_failover'],
        cabRequired: false,
      },
    ],
  };
}

function buildPolicyContext() {
  return {
    source: 'enterprise_search.search',
    engine: 'change-management-policies',
    matchedPolicy: 'POL-OPS-0142',
    title: 'Automated scaling during checkout degradation',
    approval: 'Pre-approved for Enterprise regions when ML anomaly score > 0.9',
    auditTrail: 'Workflow execution logged to .logs-security-audit',
  };
}

export function simulateSearchA2ACall({
  regionId = 'REG-8847291',
  regionName = 'Acme Global Retail',
  taskType = 'fetch_runbooks',
} = {}) {
  const taskId = makeTaskId('search');
  const contextId = makeContextId(regionId);

  const prompts = {
    fetch_runbooks: `${checkoutPrompt(regionId, regionName)} — find runbook for ${CHECKOUT_INCIDENT.criticalSpan} (${CHECKOUT_INCIDENT.criticalSpanMs}ms critical path).`,
    regions_playbook: `Enterprise playbook + escalation for ${regionId}.`,
    change_policy: `Change policy for auto-scale during ${CHECKOUT_INCIDENT.traceId} incident.`,
  };

  const request = buildA2ARequest({
    taskId,
    contextId,
    prompt: prompts[taskType] || prompts.fetch_runbooks,
    toAgent: SEARCH_AGENT_CARD,
    delegation: 'elastic-workflow-orchestrator → elastic-enterprise-search-agent',
  });

  const runbooks = buildRunbookResults(regionId, regionName);
  const playbook = buildMerchantPlaybook(regionId, regionName);
  const policy = buildPolicyContext();

  const response = buildA2AResponse({
    taskId,
    contextId,
    agentCard: SEARCH_AGENT_CARD,
    latencyMs: 76,
    extraMeta: { searchProject: 'paypal-search-prod', retrievalModel: 'ELSER v2' },
    artifacts: [
      { artifactId: 'runbooks', name: 'Ops Runbooks', parts: [{ type: 'data', data: runbooks }] },
      { artifactId: 'regions-playbook', name: 'Merchant Playbook', parts: [{ type: 'data', data: playbook }] },
      { artifactId: 'change-policy', name: 'Change Policy', parts: [{ type: 'data', data: policy }] },
      {
        artifactId: 'ai-summary',
        name: 'Search Agent Analysis',
        parts: [{
          type: 'text',
          text: `"${runbooks.documents[0].title}" (${runbooks.documents[0].score}) for ${CHECKOUT_INCIDENT.criticalSpan}. ${policy.matchedPolicy} pre-approved.`,
        }],
      },
    ],
  });

  const elasticSynthesis = {
    agent: 'elastic-workflow-orchestrator',
    action: 'merge_search_context',
    summary: `Search: ${runbooks.documents[0].title} · ${policy.matchedPolicy} · scale + circuit breaker steps loaded.`,
    nextStep: 'Execute workflow.action from runbook bundle',
  };

  return wrapA2AResult({
    target: 'search',
    regionId,
    regionName,
    taskId,
    contextId,
    request,
    response,
    elasticSynthesis,
    timingExtra: { semanticSearchMs: 54, rerankMs: 18 },
    narrative: 'Enterprise Search project — runbooks via A2A, no console switch.',
  });
}
