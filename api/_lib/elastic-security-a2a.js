/**
 * Simulates A2A calls to Elastic Security (Serverless Security project).
 * Correlates checkout incidents with SIEM alerts, cases, and threat intel.
 */

import {
  buildA2ARequest,
  buildA2AResponse,
  makeContextId,
  makeTaskId,
  wrapA2AResult,
} from './a2a-common.js';
import { CHECKOUT_INCIDENT, checkoutPrompt } from './demo-incident.js';

export const SECURITY_AGENT_CARD = {
  name: 'elastic-security-soc-agent',
  description: 'Elastic Security AI agent — SIEM detection, endpoint telemetry, cases, and threat intel',
  url: 'https://paypal-security.kb.us-east-1.aws.elastic.cloud/.well-known/agent.json',
  version: '1.2.0',
  project: 'elastic_security',
  provider: 'Elastic N.V.',
  capabilities: { streaming: true, pushNotifications: true },
  skills: [
    { id: 'search_alerts', name: 'Alert Search', description: 'Query .alerts-security.* for open detections' },
    { id: 'enrich_threat_intel', name: 'Threat Intel', description: 'OTX + Mandiant enrichment on IOCs' },
    { id: 'manage_cases', name: 'Case Management', description: 'Open/update SOC cases via Kibana Cases API' },
    { id: 'endpoint_response', name: 'Endpoint Response', description: 'Fleet actions on checkout-api hosts' },
  ],
  authentication: { schemes: ['apiKey', 'oauth2'] },
};

function buildSecurityAlerts(regionId) {
  return {
    source: 'kibana.alerting',
    index: '.alerts-security.alerts-default',
    openCount: 3,
    alerts: [
      {
        id: 'sec-alert-8847291-a',
        rule: 'Unusual API Key Usage — Checkout Service',
        severity: 'medium',
        risk_score: 47,
        regions_id: regionId,
        status: 'open',
        reason: 'Spike in failed auth attempts correlated with checkout latency window',
        entities: ['checkout-api-pod-7', 'svc-checkout-oauth'],
      },
      {
        id: 'sec-alert-8847291-b',
        rule: 'Impossible Travel — Merchant Admin Login',
        severity: 'low',
        risk_score: 21,
        regions_id: regionId,
        status: 'acknowledged',
        reason: 'Admin session from new geo during incident — likely ops team, not attack',
      },
    ],
    relatedSignals: [
      { type: 'fraud.check', span: CHECKOUT_INCIDENT.fraudSpan, duration_ms: CHECKOUT_INCIDENT.fraudSpanMs, status: 'OK' },
      { type: 'authentication_failure', count: 142, window: '15m' },
    ],
  };
}

function buildThreatIntel(regionId) {
  return {
    source: 'elastic.security.threat_intel',
    iocsChecked: 12,
    matches: 0,
    enrichment: {
      checkout_api_ips: ['10.42.18.7', '10.42.18.9'],
      verdict: 'clean',
      note: 'No known C2 or credential-stuffing lists match regions checkout traffic',
    },
    recommendation: 'Treat as performance incident, not compromise — continue O11y remediation path',
  };
}

function buildSecurityCase(regionId, regionName, alertContext = {}) {
  const threat = alertContext.threatType || 'Security alert';
  const host = alertContext.hostName || 'unknown-host';
  const alertId = alertContext.alertId || regionId;
  const slug = String(alertId || regionId).replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-8) || '8847291';
  return {
    source: 'kibana.cases',
    caseId: `CASE-2026-${slug}`,
    title: `${threat} — ${host}${alertContext.userName ? ` (${alertContext.userName})` : ''}`,
    status: 'open',
    assignee: 'soc-tier2@paypal.com',
    tags: ['siem-alert', threat.toLowerCase().replace(/\s+/g, '-'), host, 'elastic-security'],
    timeline: [
      { at: new Date(Date.now() - 2 * 60000).toISOString(), event: `Alert ${alertId} linked from .alerts-security.alerts-default` },
      { at: new Date(Date.now() - 30 * 1000).toISOString(), event: 'Entity Analytics blast radius attached' },
    ],
  };
}

export function simulateSecurityA2ACall({
  regionId = 'REG-8847291',
  regionName = 'Acme Global Retail',
  taskType = 'correlate_incident',
  alertId,
  threatType,
  hostName,
  userName,
} = {}) {
  const taskId = makeTaskId('sec');
  const contextId = makeContextId(regionId);
  const alertContext = { alertId: alertId || regionId, threatType, hostName, userName };

  const prompts = {
    correlate_incident: `${checkoutPrompt(regionId, regionName)} — validate ${CHECKOUT_INCIDENT.fraudSpan} span, return SIEM alerts + threat intel.`,
    hunt_checkout_abuse: `Hunt API abuse on ${CHECKOUT_INCIDENT.traceId} for regions_id:${regionId}.`,
    open_case: `Open Kibana Case for SIEM alert ${alertContext.alertId}: ${threatType || 'detection'} on host ${hostName || 'unknown'} — user ${userName || 'unknown'}.`,
  };

  const request = buildA2ARequest({
    taskId,
    contextId,
    prompt: prompts[taskType] || prompts.correlate_incident,
    toAgent: SECURITY_AGENT_CARD,
    delegation: 'elastic-workflow-orchestrator → elastic-security-soc-agent',
  });

  const alerts = buildSecurityAlerts(regionId);
  const threatIntel = buildThreatIntel(regionId);
  const securityCase = buildSecurityCase(regionId, regionName, alertContext);

  const summaryText = taskType === 'open_case'
    ? `Kibana Case ${securityCase.caseId} opened for ${alertContext.threatType || 'SIEM alert'} on ${alertContext.hostName || 'host'}. Threat intel: 0 IOC matches.`
    : `${CHECKOUT_INCIDENT.fraudSpan} OK (${CHECKOUT_INCIDENT.fraudSpanMs}ms). 0 IOC matches. ${securityCase.caseId} linked — infra incident, not compromise.`;

  const synthesisSummary = taskType === 'open_case'
    ? `Case ${securityCase.caseId} created · ${alertContext.threatType || 'alert'} triage ready`
    : `Security: ${CHECKOUT_INCIDENT.fraudSpan} cleared · ${securityCase.caseId} audit trail · no compromise.`;

  const nextStep = taskType === 'open_case'
    ? 'Run Elastic Workflow for automated response'
    : 'Proceed with O11y remediation';

  const response = buildA2AResponse({
    taskId,
    contextId,
    agentCard: SECURITY_AGENT_CARD,
    latencyMs: taskType === 'open_case' ? 64 : 98,
    extraMeta: { kibanaSpace: 'security', serverlessProject: 'paypal-security-prod' },
    artifacts: [
      { artifactId: 'alerts-bundle', name: 'SIEM Alerts', parts: [{ type: 'data', data: alerts }] },
      { artifactId: 'threat-intel', name: 'Threat Intel', parts: [{ type: 'data', data: threatIntel }] },
      { artifactId: 'case-bundle', name: 'SOC Case', parts: [{ type: 'data', data: securityCase }] },
      {
        artifactId: 'ai-summary',
        name: 'Security Agent Analysis',
        parts: [{ type: 'text', text: summaryText }],
      },
    ],
  });

  const elasticSynthesis = {
    agent: 'elastic-workflow-orchestrator',
    action: taskType === 'open_case' ? 'open_kibana_case' : 'merge_security_context',
    summary: synthesisSummary,
    nextStep,
  };

  return wrapA2AResult({
    target: 'security',
    regionId,
    regionName,
    taskId,
    contextId,
    request,
    response,
    elasticSynthesis,
    timingExtra: { siemQueryMs: 72, caseApiMs: 34 },
    narrative: 'Elastic Security project — federated SOC context via A2A.',
  });
}
