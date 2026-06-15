import { runEsql, rowsToObjects, buildLogSearchQuery, getElasticConfig } from '../_lib/elastic.js';
import { enrichLogForTelco } from '../_lib/telco-context.js';

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

  const config = getElasticConfig();
  if (!config.ok) {
    return res.status(503).json({ ok: false, error: config.error });
  }

  const { service, level, q, regionId, limit } = req.query;
  const searchText = regionId ? `${regionId} ${q || ''}`.trim() : q;

  try {
    const paymentService = service || '';
    const query = buildLogSearchQuery({
      service: paymentService,
      level: level || '',
      text: searchText || '',
      limit: limit || 25,
      paymentOnly: !paymentService,
    });

    const start = Date.now();
    const result = await runEsql(query);
    const logs = rowsToObjects(result).map((r, i) =>
      enrichLogForTelco({
        timestamp: r['@timestamp'],
        service: r['service.name'],
        level: r['log.level'],
        message: truncate(r['body.text'] || r.message || '', 500),
        host: r['host.name'],
        traceId: r['trace.id'],
      }, i)
    );

    return res.status(200).json({
      ok: true,
      logs,
      count: logs.length,
      queryTimeMs: Date.now() - start,
      esql: query,
    });
  } catch (err) {
    return res.status(502).json({ ok: false, error: err.message });
  }
}

function truncate(s, max) {
  if (!s) return '';
  return s.length > max ? s.slice(0, max) + '…' : s;
}
