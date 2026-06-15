import { simulateSecurityA2ACall, SECURITY_AGENT_CARD } from '../_lib/elastic-security-a2a.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, agent: SECURITY_AGENT_CARD });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  await new Promise(r => setTimeout(r, 200 + Math.random() * 120));

  const result = simulateSecurityA2ACall({
    regionId: body.regionId || body.alertId || 'SEC-ALERT',
    regionName: body.regionName || body.userName || 'Telco SOC',
    taskType: body.taskType || 'correlate_incident',
    alertId: body.alertId,
    threatType: body.threatType,
    hostName: body.hostName,
    userName: body.userName,
  });

  return res.status(200).json(result);
}
