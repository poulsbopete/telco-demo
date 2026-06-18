import { useState, useEffect, useCallback } from 'react';
import {
  Activity, AlertCircle, ArrowRight, Bot, CheckCircle2, ExternalLink,
  RefreshCw, Search, Store, Workflow, XCircle, Zap, Brain, GitBranch, ChevronRight,
} from 'lucide-react';
import {
  fetchHealth,
  fetchTelcoOverview,
  fetchRegionDetail,
  searchLogs,
  runWorkflow,
  kibanaDiscoverUrl,
  kibanaO11yDashboardUrl,
  TELCO_DISCOVER_ESQL,
  formatCount,
} from '../lib/elastic-api';
import { ModuleHeader, StatCard } from './shared/ModuleHeader';
import { RegionDetailPanel } from './RegionDetailPanel';
import { A2AFederationPanel } from './A2AFederationPanel';
import { ElasticWorkflowLink } from './ElasticWorkflowLink';
import { LogDetailPanel, LogRowButton } from './LogDetailPanel';

export function LiveElasticDemo() {
  const [health, setHealth] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [drillView, setDrillView] = useState('metrics');
  const [workflowRun, setWorkflowRun] = useState(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [regionFilter, setRegionFilter] = useState('');
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [regionDetail, setRegionDetail] = useState(null);
  const [regionDetailLoading, setRegionDetailLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthResult, overviewResult] = await Promise.allSettled([
        fetchHealth(),
        fetchTelcoOverview(),
      ]);

      if (healthResult.status === 'fulfilled') setHealth(healthResult.value);
      else setHealth({ ok: false, connected: false });

      if (overviewResult.status === 'fulfilled') {
        setData(overviewResult.value);
        setSelectedAnomaly(prev => prev || overviewResult.value.primaryAnomaly);
        setLastRefresh(new Date());
        setError(null);
      } else {
        setData(null);
        setError(overviewResult.reason?.message || 'Failed to load Telco observability data');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load]);

  async function handleRegionClick(regionId) {
    setSelectedRegionId(regionId);
    setRegionFilter(regionId);
    setSelectedLog(null);
    setRegionDetailLoading(true);
    setRegionDetail(null);
    setWorkflowRun(null);
    setDrillView('metrics');

    // Select matching anomaly if any
    const matchingAnomaly = data?.mlAnomalies?.find(a => a.regionId === regionId);
    if (matchingAnomaly) setSelectedAnomaly(matchingAnomaly);

    try {
      const detail = await fetchRegionDetail(regionId);
      setRegionDetail(detail);
      if (detail.primaryAnomaly) setSelectedAnomaly(detail.primaryAnomaly);
    } catch (err) {
      setRegionDetail({ error: err.message });
    } finally {
      setRegionDetailLoading(false);
    }

    // Also load logs in background
    try {
      const result = await searchLogs({ regionId, limit: 10 });
      setSearchResults(result);
    } catch {
      /* optional */
    }
  }

  function handleBackToRegions() {
    setSelectedRegionId(null);
    setRegionDetail(null);
    setRegionFilter('');
  }

  async function handleRegionSearch(regionId) {
    await handleRegionClick(regionId);
  }

  async function handleRunWorkflowForAnomaly(anomaly) {
    if (!anomaly) return;
    setSelectedAnomaly(anomaly);
    setWorkflowLoading(true);
    try {
      const result = await runWorkflow({
        workflowId: anomaly.workflowId,
        anomalyId: anomaly.id,
        regionId: anomaly.regionId,
      });
      setWorkflowRun(result);
    } catch (err) {
      setWorkflowRun({ ok: false, error: err.message });
    } finally {
      setWorkflowLoading(false);
    }
  }

  async function handleRunWorkflow() {
    await handleRunWorkflowForAnomaly(selectedAnomaly);
  }

  const kibanaUrl = health?.kibanaUrl || import.meta.env.VITE_KIBANA_URL;
  const discoverUrl = kibanaDiscoverUrl(kibanaUrl, { query: TELCO_DISCOVER_ESQL });
  const o11yDashboardUrl = kibanaO11yDashboardUrl(kibanaUrl);
  const trace = data?.traceDrilldown;
  const anomaly = selectedAnomaly || data?.primaryAnomaly;

  return (
    <div>
      <ModuleHeader
        title="Telco Business Telemetry"
        subtitle="Business-relevant metrics, traces & logs — OpenTelemetry enriched with regionID to connect pipeline signals to revenue, SLAs, and Elastic Workflows remediation"
        badge="Live · regionID context"
      >
        <button type="button" onClick={load} disabled={loading}
          className="text-sm px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
        {o11yDashboardUrl && (
          <a href={o11yDashboardUrl} target="_blank" rel="noopener noreferrer"
            className="text-sm px-3 py-2 border border-telco-magenta/40 text-telco-magenta rounded-lg flex items-center gap-1 hover:bg-telco-magenta/5">
            <ExternalLink className="w-4 h-4" /> Dashboard
          </a>
        )}
        {discoverUrl && (
          <a href={discoverUrl} target="_blank" rel="noopener noreferrer"
            className="text-sm px-3 py-2 bg-elastic-teal text-white rounded-lg flex items-center gap-1">
            <ExternalLink className="w-4 h-4" /> Kibana Discover
          </a>
        )}
      </ModuleHeader>

      <div className={`mt-4 p-4 rounded-xl border flex items-start gap-3 ${
        health?.connected ? 'bg-success/5 border-success/30' : 'bg-danger/5 border-danger/30'
      }`}>
        {health?.connected ? <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />}
        <div>
          <p className="font-semibold text-sm text-elastic-dark">
            {health?.connected ? `Elastic Serverless · ${health.cluster?.name}` : 'Not connected'}
          </p>
          <p className="text-xs text-elastic-gray mt-1">
            Raw OTel from checkout · cart · payment — enriched with regionID so ops sees business impact, not just infra
            {lastRefresh && ` · ${lastRefresh.toLocaleTimeString()}`}
            {data?.queryTimeMs && ` · ${data.queryTimeMs}ms`}
          </p>
        </div>
      </div>

      {error && !data && (
        <p className="mt-4 text-sm text-danger">{error}</p>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <StatCard label="Regions Monitored" value="12K+" trend="business context on OTel" highlight kibanaUrl={kibanaUrl} kibanaSection="discover" />
            <StatCard label="Sessions (24h)" value={formatCount(data.stats.sessions24h)} trend="signaling · provisioning · billing" kibanaUrl={kibanaUrl} kibanaSection="discover" />
            <StatCard label="Network Success" value={`${data.stats.networkSuccessRate}%`} trend="Across region tiers" highlight kibanaUrl={kibanaUrl} kibanaSection="discover" />
            <StatCard label="ML Anomalies" value={data.stats.mlAnomaliesOpen} trend="Elastic ML + AIOps" kibanaUrl={kibanaUrl} kibanaSection="discover" />
          </div>

          <div className="grid lg:grid-cols-3 gap-4 mt-4">
            {/* Network regions */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-elastic-dark flex items-center gap-2 mb-3">
                <Store className="w-4 h-4 text-telco-magenta" /> Top Regions by Volume
              </h3>
              <div className="space-y-2 max-h-[320px] overflow-y-auto">
                {data.regions?.map(m => (
                  <button key={m.regionId} type="button" onClick={() => handleRegionClick(m.regionId)}
                    className={`w-full text-left p-2 rounded-lg border transition-all group ${
                      selectedRegionId === m.regionId ? 'border-telco-magenta bg-telco-magenta/5 ring-1 ring-telco-magenta/30' : 'border-gray-100 hover:border-telco-magenta/40 hover:bg-gray-50'
                    }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-elastic-dark">{m.name}</p>
                        <p className="text-[10px] font-mono text-telco-magenta">{m.regionId}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-elastic-gray">{m.tier}</span>
                        <ChevronRight className={`w-3 h-3 text-elastic-gray group-hover:text-telco-magenta transition-colors ${
                          selectedRegionId === m.regionId ? 'text-telco-magenta' : ''
                        }`} />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-1 text-[10px] text-elastic-gray">
                      <span>{formatCount(m.sessions24h)} sessions</span>
                      <span className={m.successRate < 99.7 ? 'text-warning' : 'text-success'}>{m.successRate}%</span>
                      <span>{m.p99LatencyMs}ms p99</span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-elastic-gray mt-2 text-center">Click a region for full detail</p>
            </div>

            {/* Network core pipeline */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-elastic-dark flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-elastic-teal" /> Network Core Pipeline (live)
              </h3>
              <div className="space-y-3">
                {data.networkPipeline?.map(p => (
                  <div key={p.service}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-elastic-dark">{p.telcoService}</span>
                      <span className="text-elastic-gray">{formatCount(p.sessionCount)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-elastic-teal rounded-full"
                        style={{ width: `${(p.sessionCount / (data.networkPipeline[0]?.sessionCount || 1)) * 100}%` }} />
                    </div>
                    {p.errors > 0 && (
                      <p className="text-[10px] text-danger mt-0.5">{p.errors} errors ({p.errorRate}%)</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex gap-1">
                {['metrics', 'traces', 'logs'].map(v => (
                  <button key={v} type="button" onClick={() => setDrillView(v)}
                    className={`text-xs px-2 py-1 rounded capitalize ${
                      drillView === v ? 'bg-telco-magenta text-white' : 'bg-gray-100 text-elastic-gray'
                    }`}>{v}</button>
                ))}
              </div>
            </div>

            {/* ML Anomalies */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-elastic-dark flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-warning" /> ML-Detected Anomalies
              </h3>
              <div className="space-y-2">
                {data.mlAnomalies?.map(a => (
                  <button key={a.id} type="button" onClick={() => { setSelectedAnomaly(a); setWorkflowRun(null); }}
                    className={`w-full text-left p-3 rounded-lg border ${
                      selectedAnomaly?.id === a.id ? 'border-warning bg-warning/5 ring-1 ring-warning/30' : 'border-gray-100 hover:bg-gray-50'
                    }`}>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium text-elastic-dark">{a.title}</span>
                      <span className={`text-xs font-bold ${
                        a.severity === 'critical' ? 'text-danger' : a.severity === 'high' ? 'text-warning' : 'text-elastic-gray'
                      }`}>{(a.mlScore * 100).toFixed(0)}</span>
                    </div>
                    <p className="text-[10px] text-elastic-gray mt-1">{a.regionId} · {a.regionName}</p>
                    <p className="text-[10px] text-elastic-dark mt-1 line-clamp-2">{a.signal}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Region detail drill-down */}
          {selectedRegionId && (
            <RegionDetailPanel
              detail={regionDetail?.error ? null : regionDetail}
              loading={regionDetailLoading}
              drillView={drillView}
              onDrillViewChange={setDrillView}
              onBack={handleBackToRegions}
              onSelectAnomaly={(a) => { setSelectedAnomaly(a); setWorkflowRun(null); }}
              onRunWorkflow={handleRunWorkflowForAnomaly}
              workflowRun={workflowRun}
              workflowLoading={workflowLoading}
              kibanaUrl={kibanaUrl}
            />
          )}
          {regionDetail?.error && (
            <p className="mt-4 text-sm text-danger">{regionDetail.error}</p>
          )}

          {/* Cross-project A2A federation */}
          <div className="mt-4">
            <A2AFederationPanel
              regionId={selectedRegionId || anomaly?.regionId || 'REG-8847291'}
              regionName={data.regions?.find(m => m.regionId === (selectedRegionId || anomaly?.regionId))?.name || 'Metro East 5G'}
            />
          </div>

          {/* Drill-down + Workflow */}
          <div className="grid lg:grid-cols-2 gap-4 mt-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-elastic-dark flex items-center gap-2 mb-3">
                <GitBranch className="w-4 h-4 text-elastic-teal" />
                Unified Troubleshooting — {anomaly?.regionId}
              </h3>

              {drillView === 'metrics' && anomaly && (
                <div className="space-y-2 text-sm">
                  <p className="text-xs text-elastic-gray">ML signal: {anomaly.signal}</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-gray-50 rounded text-center">
                      <p className="text-lg font-bold text-danger">420ms</p>
                      <p className="text-[10px] text-elastic-gray">p99 latency</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded text-center">
                      <p className="text-lg font-bold text-warning">2.1%</p>
                      <p className="text-[10px] text-elastic-gray">error rate</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded text-center">
                      <p className="text-lg font-bold text-elastic-dark">{formatCount(anomaly.correlatedTraces)}</p>
                      <p className="text-[10px] text-elastic-gray">spans</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setDrillView('traces')}
                    className="text-xs text-elastic-teal flex items-center gap-1 mt-2">
                    Drill into traces <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {drillView === 'traces' && trace && (
                <div>
                  <p className="text-xs font-mono text-elastic-gray mb-2">{trace.traceId}</p>
                  <div className="space-y-1">
                    {trace.spans.map((s, i) => (
                      <div key={i} className={`flex items-center gap-2 p-2 rounded text-xs ${
                        s.critical ? 'bg-danger/10 border border-danger/20' : 'bg-gray-50'
                      }`}>
                        <div className="h-2 rounded-full shrink-0" style={{
                          width: `${Math.min(s.durationMs / 8, 120)}px`,
                          backgroundColor: s.status === 'ERROR' ? '#bd271e' : '#00bfb3',
                        }} />
                        <span className="flex-1 truncate">{s.name}</span>
                        <span className="text-elastic-gray">{s.durationMs}ms</span>
                        {s.critical && <span className="text-[9px] bg-danger text-white px-1 rounded">CRITICAL</span>}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setDrillView('logs')}
                    className="text-xs text-elastic-teal flex items-center gap-1 mt-2">
                    View correlated logs <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {drillView === 'logs' && trace && (
                <div>
                  <div className="p-2 bg-danger/5 border border-danger/20 rounded mb-2">
                    <p className="text-xs font-semibold text-danger">Root Cause</p>
                    <p className="text-xs text-elastic-dark mt-1">{trace.rootCause}</p>
                  </div>
                  {trace.logs.map((log, i) => (
                    <div key={i} className="flex gap-2 p-2 bg-gray-50 rounded text-xs font-mono mb-1">
                      <span className={`font-bold ${log.level === 'ERROR' ? 'text-danger' : log.level === 'WARN' ? 'text-warning' : 'text-elastic-gray'}`}>
                        {log.level}
                      </span>
                      <span className="text-elastic-dark">{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Elastic Workflows */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold text-elastic-dark flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-telco-magenta" /> Elastic Workflows — AI Resolution
                </h3>
                {(workflowRun || anomaly) && (
                  <ElasticWorkflowLink
                    kibanaUrl={kibanaUrl}
                    workflowId={workflowRun?.kibanaWorkflowId || anomaly?.workflowId}
                    executionId={workflowRun?.kibanaExecutionId}
                    href={workflowRun?.kibanaExecutionUrl || workflowRun?.kibanaWorkflowUrl}
                  />
                )}
              </div>

              {anomaly && !workflowRun && (
                <div className="mb-4 p-3 bg-telco-magenta/5 rounded-lg border border-telco-magenta/20">
                  <p className="text-xs font-medium text-telco-magenta">{anomaly.title}</p>
                  <p className="text-[10px] text-elastic-gray mt-1">
                    Workflow: <code className="bg-white px-1 rounded">{anomaly.workflowId}</code>
                  </p>
                  <button type="button" onClick={handleRunWorkflow} disabled={workflowLoading}
                    className="mt-3 w-full py-2 bg-telco-magenta text-white text-sm rounded-lg hover:bg-telco-magenta/90 disabled:opacity-50 flex items-center justify-center gap-2">
                    <Bot className="w-4 h-4" />
                    {workflowLoading ? 'Starting workflow…' : 'Run Elastic Workflow + AI Agent'}
                  </button>
                </div>
              )}

              {workflowRun && (
                <div>
                  {workflowRun.kibanaExecutionId && (
                    <div className="mb-3 p-3 bg-success/5 border border-success/20 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="text-xs text-success font-medium">
                        Live execution · {workflowRun.kibanaExecutionId.slice(0, 8)}…
                      </p>
                      <ElasticWorkflowLink
                        kibanaUrl={kibanaUrl}
                        workflowId={workflowRun.kibanaWorkflowId}
                        executionId={workflowRun.kibanaExecutionId}
                        href={workflowRun.kibanaExecutionUrl}
                        label="View execution"
                        className="text-xs px-2.5 py-1.5 bg-success text-white rounded-lg inline-flex items-center gap-1 hover:bg-success/90 shrink-0"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-success" />
                    <p className="text-sm font-medium text-success">{workflowRun.message}</p>
                  </div>
                  {workflowRun.aiSummary && (
                    <div className="p-3 bg-elastic-teal/5 border border-elastic-teal/20 rounded-lg mb-3">
                      <p className="text-[10px] font-semibold text-elastic-teal uppercase mb-1">AI Agent Analysis</p>
                      <p className="text-xs text-elastic-dark">{workflowRun.aiSummary}</p>
                    </div>
                  )}
                  {workflowRun.kibanaRunError && (
                    <p className="text-xs text-warning mb-3">{workflowRun.kibanaRunError}</p>
                  )}
                  <div className="space-y-2">
                    {workflowRun.steps?.map(step => (
                      <div key={step.id} className="flex items-start gap-2 text-xs">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                          step.status === 'completed' ? 'bg-success text-white' :
                          step.status === 'running' ? 'bg-telco-magenta text-white animate-pulse' : 'bg-gray-200 text-elastic-gray'
                        }`}>{step.id}</span>
                        <div>
                          <p className="font-medium text-elastic-dark">{step.name}</p>
                          <p className="text-elastic-gray">{step.detail}</p>
                          <span className="text-[10px] text-elastic-teal">{step.tool}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-elastic-gray mt-3">
                    Est. resolution: {workflowRun.estimatedResolutionMin} min · No human escalation required
                  </p>
                </div>
              )}

              {!workflowRun && !anomaly && (
                <p className="text-sm text-elastic-gray">Select an ML anomaly to trigger Elastic Workflow resolution.</p>
              )}
            </div>
          </div>

          {/* Region logs + errors */}
          <div className="grid lg:grid-cols-2 gap-4 mt-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-elastic-dark flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-danger" /> Payment Errors (live logs)
              </h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-elastic-gray border-b">
                    <th className="pb-2">regionID</th>
                    <th className="pb-2">Service</th>
                    <th className="pb-2">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentErrors?.slice(0, 5).map((row, i) => (
                    <tr key={i}
                      onClick={() => setSelectedLog(row)}
                      className="border-b border-gray-50 cursor-pointer hover:bg-elastic-teal/5 group">
                      <td className="py-2 font-mono">
                        <button type="button"
                          onClick={(e) => { e.stopPropagation(); handleRegionClick(row.regionId); }}
                          className="text-telco-magenta hover:underline">
                          {row.regionId}
                        </button>
                      </td>
                      <td className="py-2">{row.telcoService}</td>
                      <td className="py-2 truncate max-w-[200px] group-hover:text-elastic-dark">
                        {row.message || '—'}
                        <ChevronRight className="w-3 h-3 inline ml-1 text-elastic-gray group-hover:text-elastic-teal" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-elastic-dark flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-elastic-teal" /> Logs by regionID
              </h3>
              {regionFilter && (
                <p className="text-xs text-elastic-gray mb-2">Filtering: <strong>{regionFilter}</strong></p>
              )}
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {(searchResults?.logs || data.recentErrors?.slice(0, 4))?.map((log, i) => (
                  <LogRowButton key={`${log.timestamp}-${log.traceId}-${i}`} log={log} onClick={setSelectedLog} />
                ))}
              </div>
            </div>
          </div>

          {selectedLog && (
            <LogDetailPanel
              log={selectedLog}
              kibanaUrl={kibanaUrl}
              onClose={() => setSelectedLog(null)}
              onRegionClick={handleRegionClick}
            />
          )}
        </>
      )}
    </div>
  );
}

export default LiveElasticDemo;
