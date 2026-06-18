import { assertDemoAuth } from '../_lib/adaptive-networks-elastic.js';
import { injectFaultLogs } from '../_lib/adaptive-networks-otlp.js';

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
    const channel = Number(body?.channel);
    if (![1, 2, 3, 4].includes(channel)) {
      return res.status(400).json({ error: 'channel must be 1-4' });
    }

    const result = await injectFaultLogs(channel);
    const injectedAt = new Date().toISOString();

    return res.status(200).json({
      ok: true,
      channel: result.channel,
      errorType: result.errorType,
      logsSent: result.logsSent,
      metricsSent: result.metricsSent,
      injectedAt,
      message:
        'OTel logs and metrics sent to otel-demo (logs.otel.adaptive-networks + metrics-*). '
        + 'Hybrid RCA also correlates otel-demo Prometheus-backed service metrics. '
        + 'Kibana alert rules evaluate every ~60s, then the Network Incident Response workflow runs.',
    });
  } catch (err) {
    const status = err.message === 'Unauthorized' ? 401 : 500;
    return res.status(status).json({ error: err.message });
  }
}
