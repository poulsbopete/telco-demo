import {
  executionDeepLink,
  getWorkflowExecution,
  isExecutionWaitingForHitl,
  listWorkflowExecutions,
  resolveIncidentWorkflowId,
} from '../_lib/adaptive-networks-elastic.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const since = req.query?.since;
    const workflowId = req.query?.workflowId || (await resolveIncidentWorkflowId());

    const list = await listWorkflowExecutions(workflowId, 1, 15);
    let results = list.results ?? [];

    if (since) {
      const sinceMs = Date.parse(since);
      results = results.filter(r => r.startedAt && Date.parse(r.startedAt) >= sinceMs - 120_000);
    }

    const enriched = await Promise.all(
      results.slice(0, 5).map(async item => {
        const detail = await getWorkflowExecution(item.id);
        return {
          id: detail.id,
          workflowId: detail.workflowId,
          status: detail.status,
          startedAt: detail.startedAt,
          finishedAt: detail.finishedAt,
          currentNodeId: detail.currentNodeId,
          workflowName: detail.workflowDefinition?.name,
          stepExecutions: (detail.stepExecutions ?? []).map(s => ({
            stepId: s.stepId,
            stepType: s.stepType,
            status: s.status,
            executionTimeMs: s.executionTimeMs,
          })),
          kibanaUrl: executionDeepLink(detail.id, detail.workflowId, detail.spaceId ?? 'default'),
          waitingForHuman: isExecutionWaitingForHitl(detail),
        };
      }),
    );

    return res.status(200).json({
      workflowId,
      total: list.total,
      executions: enriched,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
