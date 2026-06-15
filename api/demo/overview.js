import {
  runEsql,
  rowsToObjects,
  QUERIES,
  getClusterInfo,
  getElasticConfig,
} from '../_lib/elastic.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

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

  const start = Date.now();

  try {
    const [cluster, overviewRes, servicesRes, levelsRes, errorsRes] = await Promise.all([
      getClusterInfo(),
      runEsql(QUERIES.overview),
      runEsql(QUERIES.services),
      runEsql(QUERIES.logLevels),
      runEsql(QUERIES.recentErrors),
    ]);

    const overview = rowsToObjects(overviewRes)[0] || {};
    const total = Number(overview.total) || 0;
    const errors = Number(overview.errors) || 0;

    return res.status(200).json({
      ok: true,
      cluster: {
        name: cluster.clusterName,
        version: cluster.version,
        kibanaUrl: cluster.kibanaUrl,
      },
      stats: {
        totalLogs: total,
        errorLogs: errors,
        errorRate: total ? ((errors / total) * 100).toFixed(2) : 0,
      },
      services: rowsToObjects(servicesRes).map(r => ({
        name: r['service.name'] || r.service?.name || 'unknown',
        count: Number(r.count) || 0,
      })),
      logLevels: rowsToObjects(levelsRes).map(r => ({
        level: r['log.level'] || 'unknown',
        count: Number(r.count) || 0,
      })),
      recentErrors: rowsToObjects(errorsRes).map(r => ({
        timestamp: r['@timestamp'],
        service: r['service.name'],
        level: r['log.level'],
        message: truncate(r['body.text'] || r.message || '', 300),
        host: r['host.name'],
        traceId: r['trace.id'],
      })),
      queryTimeMs: Date.now() - start,
      dataSource: 'logs-generic.otel-default (OpenTelemetry Demo)',
    });
  } catch (err) {
    return res.status(502).json({ ok: false, error: err.message });
  }
}

function truncate(s, max) {
  if (!s) return '';
  return s.length > max ? `${s.slice(0, max)}…` : s;
}
