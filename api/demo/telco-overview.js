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
  buildLaunchEventSummary,
} from '../_lib/telco-context.js';
import {
  buildTelcoNetworkPipelineStatsEsql,
  buildTelcoRecentErrorsEsql,
} from '../../lib/telco-discover-esql.js';
import {
  enrichMlAnomalies,
  buildMlSignalIntelligence,
} from '../_lib/ml-signal-intelligence.js';

const NETWORK_PIPELINE_QUERY = buildTelcoNetworkPipelineStatsEsql();

const RECENT_PAYMENT_ERRORS = buildTelcoRecentErrorsEsql();

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
    const mlAnomaliesRaw = buildMlAnomalies({ pipelineStats, regionMetrics: regionsMetrics, recentErrors });
    const mlAnomalies = enrichMlAnomalies(mlAnomaliesRaw);
    const mlSignalIntelligence = buildMlSignalIntelligence({ mlAnomalies, pipelineStats });

    const totalTxns = pipelineStats.reduce((s, p) => s + p.session_count, 0);
    const totalErrors = pipelineStats.reduce((s, p) => s + p.errors, 0);
    const avgSuccess = regionsMetrics.length
      ? regionsMetrics.reduce((s, m) => s + m.successRate, 0) / regionsMetrics.length
      : 99.9;

    const launchEvent = buildLaunchEventSummary();
    const { businessForecast } = launchEvent;

    return res.status(200).json({
      ok: true,
      launchEvent,
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
        mlAnomaliesOpen: mlAnomalies.filter(a => a.status === 'actionable').length,
        mlWatching: mlAnomalies.filter(a => a.status === 'watching').length,
        alertsSuppressed24h: mlSignalIntelligence.funnel.suppressedNoise,
        errorCount: totalErrors,
        iphoneActivations6h: launchEvent.metrics.activationsFirst6h,
        iphonePreOrders24h: launchEvent.metrics.preOrders24h,
        launchGrossAddRevenue24h: businessForecast?.business?.grossAddRevenue24hUsd,
        launchActivationsPerMinNow: businessForecast?.currentPhase?.activationsPerMin,
        launchMlNextTrend: businessForecast?.mlOutlook?.nextTrend,
        launchMlHoursToNextTrend: businessForecast?.mlOutlook?.hoursToNextTrend,
        launchChurnRiskSubs: businessForecast?.business?.churnRiskSubs,
      },
      networkPipeline,
      regions: regionsMetrics,
      mlAnomalies,
      mlSignalIntelligence,
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
