import { ELASTIC_ORCHESTRATOR_AGENT } from '../_lib/a2a-common.js';
import { CHECKOUT_INCIDENT } from '../_lib/demo-incident.js';
import { simulateA2ACall, DATADOG_AGENT_CARD } from '../_lib/datadog-a2a.js';
import { simulateSecurityA2ACall, SECURITY_AGENT_CARD } from '../_lib/elastic-security-a2a.js';
import { simulateSearchA2ACall, SEARCH_AGENT_CARD } from '../_lib/elastic-search-a2a.js';

const TARGETS = {
  datadog: { simulate: simulateA2ACall, card: DATADOG_AGENT_CARD, defaultTask: 'investigate_latency' },
  security: { simulate: simulateSecurityA2ACall, card: SECURITY_AGENT_CARD, defaultTask: 'correlate_incident' },
  search: { simulate: simulateSearchA2ACall, card: SEARCH_AGENT_CARD, defaultTask: 'fetch_runbooks' },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      orchestrator: ELASTIC_ORCHESTRATOR_AGENT,
      federatedAgents: {
        datadog: DATADOG_AGENT_CARD,
        security: SECURITY_AGENT_CARD,
        search: SEARCH_AGENT_CARD,
      },
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const regionId = body.regionId || 'REG-8847291';
  const regionName = body.regionName || 'Acme Global Retail';
  const targets = Array.isArray(body.targets) && body.targets.length
    ? body.targets.filter(t => TARGETS[t])
    : ['datadog', 'security', 'search'];

  await new Promise(r => setTimeout(r, 280 + Math.random() * 120));

  const calls = {};
  for (const target of targets) {
    const cfg = TARGETS[target];
    calls[target] = cfg.simulate({
      regionId,
      regionName,
      taskType: body.taskTypes?.[target] || cfg.defaultTask,
    });
  }

  const totalMs = Object.values(calls).reduce((sum, c) => sum + (c.timing?.totalMs || 0), 0);

  return res.status(200).json({
    ok: true,
    federationId: `fed-${Date.now().toString(36)}`,
    regionId,
    regionName,
    targets,
    calls,
    orchestratorSynthesis: {
      agent: ELASTIC_ORCHESTRATOR_AGENT.name,
      summary: `${CHECKOUT_INCIDENT.traceId}: Datadog p99 + pool · Security fraud.check cleared · Search runbook loaded.`,
      nextStep: 'Execute remediation workflow',
    },
    timing: { parallelRoundTripMs: totalMs, agentCount: targets.length },
    narrative: 'A2A v0.2 federation across Datadog, Security, and Search — one incident thread.',
  });
}
