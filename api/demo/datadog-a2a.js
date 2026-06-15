import { simulateA2ACall, getAgentCards } from '../_lib/datadog-a2a.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, agents: getAgentCards() });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  // Simulate network latency for demo realism
  await new Promise(r => setTimeout(r, 250 + Math.random() * 150));

  const result = simulateA2ACall({
    regionId: body.regionId || 'REG-8847291',
    regionName: body.regionName || 'Acme Global Retail',
    service: body.service || 'checkout-api',
    taskType: body.taskType || 'investigate_latency',
  });

  return res.status(200).json(result);
}
