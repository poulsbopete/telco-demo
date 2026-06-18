import {
  assertDemoAuth,
  canResumeHitlApproval,
  getWorkflowExecution,
  resumeWorkflowExecution,
} from '../_lib/adaptive-networks-elastic.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-demo-secret');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    assertDemoAuth(req);
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    const executionId = body?.executionId;
    const approved = body?.approved;
    const notes = body?.notes;
    const justification = body?.justification;

    if (!executionId) {
      return res.status(400).json({ error: 'executionId required' });
    }
    if (typeof approved !== 'boolean') {
      return res.status(400).json({ error: 'approved must be a boolean' });
    }

    const detail = await getWorkflowExecution(executionId);

    if (!canResumeHitlApproval(detail)) {
      return res.status(409).json({ error: 'Execution is not waiting for human approval at hitl_approval' });
    }

    const input = {
      approved,
      notes: notes?.trim() || undefined,
      justification:
        justification?.trim()
        || (approved ? 'Approved via Adaptive Networks demo UI' : 'Rejected via Adaptive Networks demo UI'),
    };

    const result = await resumeWorkflowExecution(executionId, input);

    return res.status(200).json({
      ok: true,
      approved: input.approved,
      executionId: result.executionId,
      message: result.message,
    });
  } catch (err) {
    const status = err.message === 'Unauthorized' ? 401 : 500;
    return res.status(status).json({ error: err.message });
  }
}
