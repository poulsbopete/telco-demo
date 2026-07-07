import { WORKFLOW_TEMPLATES } from '../_lib/telco-context.js';
import { runTelcoCheckoutWorkflow, kibanaWorkflowAppUrl } from '../_lib/kibana-workflows.js';
import { getKibanaCoreWorkflowId } from '../../lib/telco-workflow-ids.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const workflowId = req.query?.workflowId || body?.workflowId || 'wf-core-latency-remediation';
  const template = WORKFLOW_TEMPLATES[workflowId];

  if (!template) {
    return res.status(404).json({ ok: false, error: 'Workflow not found' });
  }

  if (req.method === 'GET' && req.query?.bootstrap === '1') {
    const { findTelcoCheckoutWorkflow, kibanaWorkflowAppUrl } = await import('../_lib/kibana-workflows.js');
    const wf = await findTelcoCheckoutWorkflow();
    const kibanaUrl = process.env.KIBANA_URL || process.env.VITE_KIBANA_URL;
    return res.status(200).json({
      ok: true,
      registered: Boolean(wf?.id),
      workflow: wf ? { id: wf.id, name: wf.name } : null,
      kibanaWorkflowUrl: wf?.id ? kibanaWorkflowAppUrl(kibanaUrl, { workflowId: wf.id }) : kibanaWorkflowAppUrl(kibanaUrl),
    });
  }

  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, workflowId, ...template });
  }

  if (req.method === 'POST') {
    const anomalyId = body?.anomalyId || body?.alertId || 'ML-ANOM-001';
    const steps = template.steps.map((step, i) => ({
      ...step,
      status: i < 4 ? 'completed' : i === 4 ? 'running' : 'pending',
    }));

    const executionId = `exec-${Date.now().toString(36)}`;
    const regionId = body?.regionId || body?.alertId || 'REG-8847291';
    const traceId = body?.traceId || body?.alertId || 'trace-checkout-001';
    const threatType = body?.threatType || template.trigger;
    const hostName = body?.hostName || 'unknown-host';
    const isSecurityWorkflow = workflowId === 'wf-security-incident-response';

    let kibana = null;
    if (WORKFLOW_TEMPLATES[workflowId]) {
      kibana = await runTelcoCheckoutWorkflow({
        regionId,
        traceId: isSecurityWorkflow ? `sec-${traceId}` : traceId,
      });
    }

    const kibanaStarted = Boolean(kibana?.kibanaExecutionId);
    let message = 'Elastic Workflow resolution started — federated A2A to metrics, Security, and Search complete';
    let aiSummary = 'Cross-project A2A: external metrics confirm DB pool exhaustion; Security cleared compromise; Search loaded runbooks for regionID ' + regionId + '. Executing remediation.';

    if (isSecurityWorkflow) {
      message = kibanaStarted
        ? `Elastic Security Workflow started for ${threatType} on ${hostName}`
        : `Security response workflow triggered for ${threatType} on ${hostName}`;
      aiSummary = `SIEM alert enriched · threat intel clear · Kibana Case linked · Elastic Defend isolation queued for ${hostName}. Orchestrated via Kibana Workflows (replaces standalone SOAR/PagerDuty routing).`;
    } else if (kibanaStarted) {
      message = 'Elastic Workflow execution started — view the live run in Executions';
    } else if (kibana?.runError) {
      message = `Demo resolution started — workflow run failed: ${kibana.runError}`;
    } else if (kibana?.linked) {
      message = 'Elastic Workflow triggered — open Executions to view the run';
    } else if (kibana?.error) {
      message = `Demo resolution started — ${kibana.error}`;
    }

    const kibanaUrl = process.env.KIBANA_URL || process.env.VITE_KIBANA_URL;
    const fallbackWorkflowUrl = kibanaWorkflowAppUrl(kibanaUrl, {
      workflowId: getKibanaCoreWorkflowId(),
    });

    return res.status(200).json({
      ok: true,
      workflowId,
      executionId: kibana?.kibanaExecutionId || executionId,
      name: template.name,
      anomalyId,
      alertId: body?.alertId || null,
      threatType: body?.threatType || null,
      hostName,
      status: 'running',
      message,
      steps,
      aiSummary,
      estimatedResolutionMin: isSecurityWorkflow ? 8 : 4,
      executedAt: new Date().toISOString(),
      kibanaWorkflowId: kibana?.kibanaWorkflowId || getKibanaCoreWorkflowId(),
      kibanaWorkflowName: kibana?.kibanaWorkflowName || template.name,
      kibanaWorkflowUrl: kibana?.kibanaWorkflowUrl || fallbackWorkflowUrl,
      kibanaExecutionId: kibana?.kibanaExecutionId || null,
      kibanaExecutionUrl: kibana?.kibanaExecutionUrl || null,
      kibanaLinked: Boolean(kibana?.linked),
      kibanaRunError: kibana?.runError || null,
      kibanaNote: kibana?.linked ? null : (kibana?.error || 'Run npm run bootstrap:workflow to register the remediation workflow'),
    });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
