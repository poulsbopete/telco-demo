/**
 * Simulates A2A calls to Elastic Enterprise Search (Search Serverless project).
 * Retrieves runbooks, region playbooks, and policy docs for incident resolution.
 */

import {
  buildA2ARequest,
  buildA2AResponse,
  makeContextId,
  makeTaskId,
  wrapA2AResult,
} from './a2a-common.js';
import { CHECKOUT_INCIDENT, checkoutPrompt } from './demo-incident.js';

const SEARCH_KIBANA_URL = (
  process.env.SEARCH_KIBANA_URL
  || process.env.VITE_SEARCH_KIBANA_URL
  || 'https://ai-assistants-ffcafb.kb.us-east-1.aws.elastic.cloud'
).replace(/\/$/, '');

const SEARCH_ENGINE = process.env.SEARCH_ENGINE || process.env.VITE_SEARCH_ENGINE || 'telco-ops-runbooks';

function searchKibanaPath(path) {
  return `${SEARCH_KIBANA_URL}${path}`;
}

export const SEARCH_AGENT_CARD = {
  name: 'elastic-enterprise-search-agent',
  description: 'Enterprise Search AI agent — runbooks, region playbooks, policy KB (Search Serverless project)',
  url: `${SEARCH_KIBANA_URL}/.well-known/agent.json`,
  version: '1.1.0',
  project: 'elastic_search',
  provider: 'Elastic N.V.',
  capabilities: { streaming: true, pushNotifications: false },
  skills: [
    { id: 'semantic_search', name: 'Semantic Search', description: 'ELSER-powered runbook and policy retrieval' },
    { id: 'regions_playbooks', name: 'Region Playbooks', description: 'Per-regionID escalation and SLA docs' },
    { id: 'change_management', name: 'Change Management', description: 'Approved remediation procedures and CAB refs' },
    { id: 'ivr_knowledge', name: 'Support Knowledge', description: 'Customer support and IVR resolution articles' },
  ],
  authentication: { schemes: ['apiKey', 'oauth2'] },
};

function buildRunbookResults(regionId, regionName) {
  return {
    source: 'enterprise_search.search',
    engine: SEARCH_ENGINE,
    kibanaUrl: searchKibanaPath('/app/discover'),
    query: `${CHECKOUT_INCIDENT.criticalSpan} ${CHECKOUT_INCIDENT.criticalSpanMs}ms pool exhaustion ${regionId}`,
    totalHits: 4,
    documents: [
      {
        id: 'rb-signaling-pool-exhaustion',
        title: 'Runbook: Signaling DB Pool Exhaustion',
        score: 0.94,
        excerpt: 'Scale signaling-api replicas +30%. Enable per-region circuit breaker. Verify pool max_connections ≥ 50.',
        url: searchKibanaPath(`/app/enterprise_search/app/search/${SEARCH_ENGINE}/document/rb-signaling-pool-exhaustion`),
        tags: ['signaling-api', 'latency', 'database'],
      },
      {
        id: 'rb-region-circuit-breaker',
        title: 'Runbook: Per-Region Circuit Breaker',
        score: 0.89,
        excerpt: `Enable circuit breaker for regionID ${regionId} via workflow.action — limits blast radius during degradation.`,
        url: searchKibanaPath(`/app/enterprise_search/app/search/${SEARCH_ENGINE}/document/rb-region-circuit-breaker`),
        tags: ['regionID', 'resilience'],
      },
      {
        id: 'rb-slo-verify-recovery',
        title: 'Runbook: Post-Remediation SLO Verification',
        score: 0.82,
        excerpt: 'Wait for p99 < 250ms for 5 consecutive minutes before closing incident. Notify region webhook.',
        url: searchKibanaPath(`/app/enterprise_search/app/search/${SEARCH_ENGINE}/document/rb-slo-verify-recovery`),
        tags: ['slo', 'verification'],
      },
    ],
  };
}

function buildRegionPlaybook(regionId, regionName) {
  return {
    source: 'enterprise_search.search',
    engine: 'telco-region-playbooks',
    regionId,
    documents: [
      {
        id: `rp-${regionId}`,
        title: `${regionName} — Enterprise SLA & Escalation`,
        tier: 'Enterprise',
        sla: { p99_ms: 250, error_budget_pct: 0.1 },
        escalation: ['regions-tam@telco.demo', 'signaling-oncall@telco.demo'],
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
    title: 'Automated scaling during signaling degradation',
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
  const playbook = buildRegionPlaybook(regionId, regionName);
  const policy = buildPolicyContext();

  const response = buildA2AResponse({
    taskId,
    contextId,
    agentCard: SEARCH_AGENT_CARD,
    latencyMs: 76,
    extraMeta: {
      searchProject: 'ai-assistants-ffcafb',
      searchKibanaUrl: SEARCH_KIBANA_URL,
      retrievalModel: 'ELSER v2',
    },
    artifacts: [
      { artifactId: 'runbooks', name: 'Ops Runbooks', parts: [{ type: 'data', data: runbooks }] },
      { artifactId: 'regions-playbook', name: 'Region Playbook', parts: [{ type: 'data', data: playbook }] },
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
    searchKibanaUrl: SEARCH_KIBANA_URL,
    topRunbookUrl: runbooks.documents[0].url,
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
    searchKibanaUrl: SEARCH_KIBANA_URL,
  });
}
