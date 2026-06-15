import { simulateSearchA2ACall, SEARCH_AGENT_CARD } from '../_lib/elastic-search-a2a.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, agent: SEARCH_AGENT_CARD });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  await new Promise(r => setTimeout(r, 180 + Math.random() * 100));

  const result = simulateSearchA2ACall({
    regionId: body.regionId || 'REG-8847291',
    regionName: body.regionName || 'Acme Global Retail',
    taskType: body.taskType || 'fetch_runbooks',
  });

  return res.status(200).json(result);
}
