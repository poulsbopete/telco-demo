import {
  runEsql,
  rowsToObjects,
  getClusterInfo,
  getElasticConfig,
} from '../_lib/elastic.js';
import {
  buildRegionMetrics,
  buildMlAnomalies,
  buildNetworkPipeline,
  enrichLogForTelco,
  buildTraceDrilldown,
  REGIONS,
} from '../_lib/telco-context.js';

const NETWORK_PIPELINE_QUERY = `
FROM logs-generic.otel-default
| WHERE service.name IN ("checkout", "payment", "cart", "checkoutservice", "paymentservice")
| STATS session_count = COUNT(*), errors = COUNT(*) WHERE log.level == "ERROR" OR log.level == "Error"
  BY service.name
| SORT session_count DESC
`.trim();

const RECENT_PAYMENT_ERRORS = `
FROM logs-generic.otel-default
| WHERE service.name IN ("checkout", "payment", "cart")
  AND (log.level == "ERROR" OR log.level == "Error")
| KEEP @timestamp, service.name, log.level, body.text, host.name, trace.id
| SORT @timestamp DESC
| LIMIT 10
`.trim();

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
    const [cluster, pipelineRes, errorsRes] = await Promise.all([
      getClusterInfo(),
      runEsql(NETWORK_PIPELINE_QUERY),
      runEsql(RECENT_PAYMENT_ERRORS),
    ]);

    const pipelineRaw = rowsToObjects(pipelineRes);
    const pipelineStats = pipelineRaw.map(r => ({
      service: r['service.name'],
      session_count: Number(r.session_count) || 0,
      errors: Number(r.errors) || 0,
    }));

    const recentErrors = rowsToObjects(errorsRes).map((r, i) => ({
      timestamp: r['@timestamp'],
      service: r['service.name'],
      level: r['log.level'],
      message: truncate(r['body.text'] || '', 300),
      host: r['host.name'],
      traceId: r['trace.id'],
    }));

    const networkPipeline = buildNetworkPipeline(pipelineStats);
    const regionsMetrics = buildRegionMetrics(pipelineStats);
    const mlAnomalies = buildMlAnomalies({ pipelineStats, regionMetrics: regionsMetrics, recentErrors });

    const totalTxns = pipelineStats.reduce((s, p) => s + p.session_count, 0);
    const totalErrors = pipelineStats.reduce((s, p) => s + p.errors, 0);
    const avgSuccess = regionsMetrics.length
      ? regionsMetrics.reduce((s, m) => s + m.successRate, 0) / regionsMetrics.length
      : 99.9;

    return res.status(200).json({
      ok: true,
      cluster: {
        name: cluster.clusterName,
        version: cluster.version,
        kibanaUrl: cluster.kibanaUrl,
      },
      stats: {
        regionsMonitored: REGIONS.length,
        regionIdsActive: `${REGIONS.length},000+`.replace('8,000+', '12,000+'),
        sessions24h: totalTxns,
        networkSuccessRate: Math.round(avgSuccess * 100) / 100,
        mlAnomaliesOpen: mlAnomalies.filter(a => a.severity !== 'low').length,
        errorCount: totalErrors,
      },
      networkPipeline,
      regions: regionsMetrics,
      mlAnomalies,
      recentErrors: recentErrors.map(enrichLogForTelco),
      primaryAnomaly: mlAnomalies[0],
      traceDrilldown: buildTraceDrilldown(mlAnomalies[0], recentErrors),
      queryTimeMs: Date.now() - start,
      dataSource: 'Telco network core (signaling · provisioning · billing) — live OTel + region enrichment',
    });
  } catch (err) {
    return res.status(502).json({ ok: false, error: err.message });
  }
}

function truncate(s, max) {
  if (!s) return '';
  return s.length > max ? s.slice(0, max) + '…' : s;
}
