/** Generic incident-response architecture — anonymized demo model (no customer-specific names). */

export const LOOPS = {
  reactive: {
    id: 'reactive',
    label: 'Reactive loop',
    color: '#017d73',
    description: 'Subscriber-initiated diagnostics — status returned to the customer channel.',
  },
  proactive: {
    id: 'proactive',
    label: 'Proactive loop',
    color: '#0077cc',
    description: 'Agent-detected anomalies — early warnings routed to the operations console.',
  },
  knowledge: {
    id: 'knowledge',
    label: 'Knowledge loop',
    color: '#6b2c91',
    description: 'Telemetry and triage feed runbooks back into the searchable knowledge base.',
  },
};

export const NODES = {
  consumer: { id: 'consumer', label: 'Consumer segment', layer: 'channels' },
  business: { id: 'business', label: 'Business segment', layer: 'channels' },
  enterprise: { id: 'enterprise', label: 'Enterprise segment', layer: 'channels' },
  agentCluster: { id: 'agentCluster', label: 'Monitoring agents', layer: 'agents' },
  eventBus: { id: 'eventBus', label: 'Event bus', layer: 'core' },
  orchestrator: { id: 'orchestrator', label: 'Diagnostic orchestrator', layer: 'core' },
  sessionCache: { id: 'sessionCache', label: 'Session cache', layer: 'data' },
  caseStore: { id: 'caseStore', label: 'Case store', layer: 'data' },
  counterRegistry: { id: 'counterRegistry', label: 'Counter registry', layer: 'data' },
  diagnosticArchive: { id: 'diagnosticArchive', label: 'Diagnostic archive', layer: 'data' },
  infrastructure: { id: 'infrastructure', label: 'Network infrastructure', layer: 'infra' },
  opsConsole: { id: 'opsConsole', label: 'Operations console', layer: 'ops' },
  nocTeam: { id: 'nocTeam', label: 'NOC team', layer: 'ops' },
  telemetryHub: { id: 'telemetryHub', label: 'Telemetry hub', layer: 'telemetry' },
  observabilityFeed: { id: 'observabilityFeed', label: 'Observability feed', layer: 'telemetry' },
  incidentNotes: { id: 'incidentNotes', label: 'Incident notes', layer: 'knowledge' },
  runbookDraft: { id: 'runbookDraft', label: 'Runbook draft', layer: 'knowledge' },
  knowledgeBase: { id: 'knowledgeBase', label: 'Knowledge base', layer: 'knowledge' },
};

export const LOOP_PATHS = {
  reactive: [
    { from: 'consumer', to: 'eventBus', label: 'Diagnostic request' },
    { from: 'business', to: 'eventBus', label: 'Diagnostic request' },
    { from: 'enterprise', to: 'eventBus', label: 'Diagnostic request' },
    { from: 'eventBus', to: 'orchestrator', label: 'Queued work item' },
    { from: 'orchestrator', to: 'infrastructure', label: 'Live checks' },
    { from: 'orchestrator', to: 'sessionCache', label: 'Session state' },
    { from: 'orchestrator', to: 'consumer', label: 'Customer status update' },
  ],
  proactive: [
    { from: 'agentCluster', to: 'eventBus', label: 'Anomaly signal' },
    { from: 'eventBus', to: 'orchestrator', label: 'Correlate context' },
    { from: 'orchestrator', to: 'caseStore', label: 'Open case context' },
    { from: 'orchestrator', to: 'counterRegistry', label: 'Increment counters' },
    { from: 'orchestrator', to: 'opsConsole', label: 'Early warning report' },
    { from: 'opsConsole', to: 'nocTeam', label: 'Operator review' },
  ],
  knowledge: [
    { from: 'observabilityFeed', to: 'telemetryHub', label: 'Gen-AI metrics' },
    { from: 'telemetryHub', to: 'opsConsole', label: 'Unclassified triage queue' },
    { from: 'opsConsole', to: 'incidentNotes', label: 'Operator notes' },
    { from: 'incidentNotes', to: 'runbookDraft', label: 'Structure draft' },
    { from: 'runbookDraft', to: 'knowledgeBase', label: 'Publish runbook' },
    { from: 'orchestrator', to: 'diagnosticArchive', label: 'Archive outcome' },
    { from: 'knowledgeBase', to: 'orchestrator', label: 'Grounded retrieval' },
  ],
};

export const SCENARIOS = {
  reactive: {
    title: 'Subscriber line-quality complaint',
    trigger: 'Business segment reports intermittent voice drops in one metro.',
    outcome: 'Orchestrator validates RAN metrics, returns a status card to the care channel in under 90 seconds.',
    steps: [
      { node: 'business', detail: 'Care portal submits a structured diagnostic request.' },
      { node: 'eventBus', detail: 'Request normalized and placed on the incident event bus.' },
      { node: 'orchestrator', detail: 'Orchestrator pulls recent traces and session context.' },
      { node: 'sessionCache', detail: 'Active subscriber session cached for correlation.' },
      { node: 'infrastructure', detail: 'Synthetic checks against edge and transport paths.' },
      { node: 'orchestrator', detail: 'Root cause classified as localized congestion.' },
      { node: 'business', detail: 'Status update posted back to the subscriber channel.' },
    ],
  },
  proactive: {
    title: 'Agent-detected transport degradation',
    trigger: 'Monitoring agents observe elevated packet loss on a core link.',
    outcome: 'Early warning lands in the operations console before customer tickets spike.',
    steps: [
      { node: 'agentCluster', detail: 'Three agents agree on an anomaly score above threshold.' },
      { node: 'eventBus', detail: 'Correlated signal published to the shared bus.' },
      { node: 'orchestrator', detail: 'Orchestrator enriches with topology and recent changes.' },
      { node: 'caseStore', detail: 'Draft operations case opened with severity context.' },
      { node: 'counterRegistry', detail: 'Regional counter incremented for SLA tracking.' },
      { node: 'opsConsole', detail: 'Early warning report rendered for shift lead.' },
      { node: 'nocTeam', detail: 'Operator acknowledges and schedules mitigation window.' },
    ],
  },
  knowledge: {
    title: 'Runbook enrichment from triage',
    trigger: 'Unclassified pattern appears repeatedly in the telemetry hub.',
    outcome: 'Operator-authored notes become a published runbook consumed by the orchestrator.',
    steps: [
      { node: 'observabilityFeed', detail: 'Observability pipeline streams Gen-AI usage metrics.' },
      { node: 'telemetryHub', detail: 'Hub surfaces an unclassified issue cluster.' },
      { node: 'opsConsole', detail: 'Triage queue assigned to on-call engineer.' },
      { node: 'incidentNotes', detail: 'Engineer captures remediation steps as raw notes.' },
      { node: 'runbookDraft', detail: 'Notes structured into a draft runbook template.' },
      { node: 'knowledgeBase', detail: 'Runbook published to the searchable knowledge index.' },
      { node: 'orchestrator', detail: 'Next incident retrieval grounds on the new runbook.' },
      { node: 'diagnosticArchive', detail: 'Outcome archived for audit and model tuning.' },
    ],
  },
};

export function nodesForLoop(loopId) {
  const path = LOOP_PATHS[loopId] ?? [];
  const ids = new Set();
  path.forEach(edge => {
    ids.add(edge.from);
    ids.add(edge.to);
  });
  return ids;
}
