import { runEsql, rowsToObjects, getClusterInfo, getElasticConfig } from '../_lib/elastic.js';
import {
  buildRegionMetrics,
  buildMlAnomalies,
  buildNetworkPipeline,
  enrichLogForTelco,
  buildRegionDetail,
  REGIONS,
} from '../_lib/telco-context.js';
import { enrichMlAnomalies, buildMlSignalIntelligence } from '../_lib/ml-signal-intelligence.js';

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
| LIMIT 20
`.trim();

async function loadBaseData() {
  const [cluster, pipelineRes, errorsRes] = await Promise.all([
    getClusterInfo(),
    runEsql(NETWORK_PIPELINE_QUERY),
    runEsql(RECENT_PAYMENT_ERRORS),
  ]);

  const pipelineStats = rowsToObjects(pipelineRes).map(r => ({
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
  const mlAnomaliesRaw = buildMlAnomalies({ pipelineStats, regionMetrics: regionsMetrics, recentErrors });
  const mlAnomalies = enrichMlAnomalies(mlAnomaliesRaw);

  return { cluster, pipelineStats, recentErrors, networkPipeline, regionsMetrics, mlAnomalies };
}

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

  const regionId = req.query?.regionId;
  if (!regionId) {
    return res.status(400).json({ ok: false, error: 'regionId query parameter required' });
  }

  if (!REGIONS.some(m => m.regionId === regionId)) {
    return res.status(404).json({ ok: false, error: 'Region not found' });
  }

  const start = Date.now();

  try {
    const base = await loadBaseData();
    const detail = buildRegionDetail(regionId, base);
    const regionAnomalies = base.mlAnomalies.filter(a => a.regionId === regionId);
    const mlSignalIntelligence = buildMlSignalIntelligence({
      mlAnomalies: regionAnomalies.length ? regionAnomalies : base.mlAnomalies,
      pipelineStats: base.pipelineStats,
    });

    return res.status(200).json({
      ok: true,
      cluster: {
        name: base.cluster.clusterName,
        kibanaUrl: base.cluster.kibanaUrl,
      },
      ...detail,
      mlSignalIntelligence,
      queryTimeMs: Date.now() - start,
    });
  } catch (err) {
    return res.status(502).json({ ok: false, error: err.message });
  }
}

function truncate(s, max) {
  if (!s) return '';
  return s.length > max ? s.slice(0, max) + '…' : s;
}
