import { getPublicConfig, resolveIncidentWorkflowId } from '../_lib/adaptive-networks-elastic.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const config = getPublicConfig();
    if (!config.workflowId) {
      try {
        config.workflowId = await resolveIncidentWorkflowId();
      } catch {
        // Workflow not deployed yet — UI falls back to /app/workflows library
      }
    }
    return res.status(200).json(config);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
