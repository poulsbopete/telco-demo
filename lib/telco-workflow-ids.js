/**
 * Demo workflow IDs (anomaly templates) → registered Kibana Workflows slug.
 * Only telco-core-latency-auto-remediation is bootstrapped today; all demo links resolve there.
 */

export const TELCO_CORE_WORKFLOW_SLUG = 'telco-core-latency-auto-remediation';

export function getKibanaCoreWorkflowId() {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_KIBANA_CORE_WORKFLOW_ID) {
      return import.meta.env.VITE_KIBANA_CORE_WORKFLOW_ID;
    }
  } catch {
    // Node / non-Vite
  }
  if (typeof process !== 'undefined' && process.env) {
    return (
      process.env.KIBANA_CORE_WORKFLOW_ID
      || process.env.VITE_KIBANA_CORE_WORKFLOW_ID
      || TELCO_CORE_WORKFLOW_SLUG
    );
  }
  return TELCO_CORE_WORKFLOW_SLUG;
}

const DEMO_WORKFLOW_SLUGS = {
  'wf-core-latency-remediation': () => getKibanaCoreWorkflowId(),
  'wf-provisioning-error-triage': () => getKibanaCoreWorkflowId(),
  'wf-billing-failure-investigate': () => getKibanaCoreWorkflowId(),
  'wf-security-incident-response': () => getKibanaCoreWorkflowId(),
};

/** Map simulated demo workflow id to a real Kibana workflow slug/id. */
export function resolveElasticWorkflowId(workflowId) {
  const fallback = getKibanaCoreWorkflowId();
  if (!workflowId) return fallback;

  const mapper = DEMO_WORKFLOW_SLUGS[workflowId];
  if (mapper) return mapper();

  // Any other wf-* id from demo templates → registered telco workflow
  if (String(workflowId).startsWith('wf-')) return fallback;

  return workflowId;
}
