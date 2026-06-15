import { A2AFederationPanel } from './A2AFederationPanel';
import { ElasticWorkflowLink } from './ElasticWorkflowLink';
import { LogDetailPanel, LogRowButton } from './LogDetailPanel';
import { TimeSeriesChart } from './shared/TimeSeriesChart';
import { useState } from 'react';
import {
  Activity, AlertCircle, ArrowLeft, Bot, Brain, ExternalLink,
  GitBranch, Shield, Workflow, Zap,
} from 'lucide-react';
import { formatCount, kibanaDiscoverUrl, TELCO_DISCOVER_ESQL } from '../lib/elastic-api';

export function RegionDetailPanel({
  detail,
  loading,
  drillView,
  onDrillViewChange,
  onBack,
  onSelectAnomaly,
  onRunWorkflow,
  workflowRun,
  workflowLoading,
  kibanaUrl,
}) {
  const [selectedLog, setSelectedLog] = useState(null);

  if (loading) {
    return (
      <div className="mt-4 bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-elastic-gray">
        Loading regions detail…
      </div>
    );
  }

  if (!detail) return null;

  const m = detail.region;
  const anomaly = detail.primaryAnomaly;
  const trace = detail.traceDrilldown;
  const chartData = detail.hourlyTrend?.map(h => ({
    time: h.label,
    sessions: h.sessions,
    p99Ms: h.p99Ms,
  })) || [];

  const kibanaRegionUrl = kibanaDiscoverUrl(kibanaUrl, { query: TELCO_DISCOVER_ESQL });

  return (
    <div className="mt-4 bg-white rounded-xl border-2 border-telco-magenta/30 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-telco-magenta/5 border-b border-telco-magenta/20 px-4 py-4">
        <button type="button" onClick={onBack}
          className="text-xs text-telco-magenta flex items-center gap-1 mb-3 hover:underline">
          <ArrowLeft className="w-3 h-3" /> Back to all regions
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-elastic-dark">{m.name}</h3>
            <p className="text-sm font-mono text-telco-magenta">{m.regionId}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-telco-magenta/10 text-telco-magenta font-medium">{m.tier}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-elastic-gray">{m.market}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-elastic-gray">{m.segment}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                detail.slo?.status === 'healthy' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
              }`}>
                SLO {detail.slo?.current}% / {detail.slo?.target}%
              </span>
            </div>
          </div>
          {kibanaRegionUrl && (
            <a href={kibanaRegionUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs px-3 py-2 bg-elastic-teal text-white rounded-lg flex items-center gap-1 shrink-0">
              <ExternalLink className="w-3 h-3" /> View in Kibana
            </a>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Sessions (24h)', value: formatCount(m.sessions24h), link: kibanaRegionUrl },
            { label: 'Bandwidth', value: `${m.bandwidthGbps} Gbps`, link: kibanaRegionUrl },
            { label: 'Success Rate', value: `${m.successRate}%`, warn: m.successRate < 99.7, link: kibanaRegionUrl },
            { label: 'p99 Latency', value: `${m.p99LatencyMs}ms`, warn: m.p99LatencyMs > 300, link: kibanaRegionUrl },
            { label: 'Errors', value: formatCount(m.errorCount), warn: m.errorCount > 0, link: kibanaRegionUrl },
          ].map(k => (
            <div key={k.label} className="p-3 rounded-lg bg-gray-50 border border-gray-100 relative">
              {k.link && (
                <a href={k.link} target="_blank" rel="noopener noreferrer" className="absolute top-2 right-2 text-elastic-gray hover:text-elastic-teal">
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <p className="text-[10px] text-elastic-gray uppercase">{k.label}</p>
              <p className={`text-lg font-bold mt-1 ${k.warn ? 'text-warning' : 'text-elastic-dark'}`}>{k.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Hourly trend */}
          <div className="border border-gray-100 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-elastic-dark flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-elastic-teal" /> Session Volume (12h)
            </h4>
            <TimeSeriesChart
              data={chartData}
              lines={[{ key: 'sessions', name: 'Sessions', color: '#e20074' }]}
              height={140}
            />
          </div>

          {/* Service breakdown */}
          <div className="border border-gray-100 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-elastic-dark mb-3">Pipeline by Service</h4>
            <div className="space-y-2">
              {detail.serviceBreakdown?.map(s => (
                <div key={s.service}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{s.service}</span>
                    <span className="text-elastic-gray">{formatCount(s.sessions)} · {s.successRate}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-telco-magenta rounded-full"
                      style={{ width: `${(s.sessions / (detail.serviceBreakdown[0]?.sessions || 1)) * 100}%` }} />
                  </div>
                  {s.errors > 0 && <p className="text-[10px] text-danger mt-0.5">{s.errors} errors · p99 {s.p99Ms}ms</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ML Anomalies for regions */}
        {detail.anomalies?.length > 0 && (
          <div className="border border-warning/30 bg-warning/5 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-elastic-dark flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-warning" /> ML Anomalies for this Region
            </h4>
            <div className="space-y-2">
              {detail.anomalies.map(a => (
                <button key={a.id} type="button" onClick={() => onSelectAnomaly(a)}
                  className="w-full text-left p-3 bg-white rounded-lg border border-gray-100 hover:border-warning/50">
                  <div className="flex justify-between">
                    <span className="text-xs font-medium">{a.title}</span>
                    <span className="text-xs font-bold text-warning">{(a.mlScore * 100).toFixed(0)}</span>
                  </div>
                  <p className="text-[10px] text-elastic-gray mt-1">{a.signal}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Unified troubleshooting */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="border border-gray-100 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-elastic-dark flex items-center gap-2 mb-3">
              <GitBranch className="w-4 h-4 text-elastic-teal" />
              Traces & Logs — {m.regionId}
            </h4>
            <div className="flex gap-1 mb-3">
              {['metrics', 'traces', 'logs'].map(v => (
                <button key={v} type="button" onClick={() => onDrillViewChange(v)}
                  className={`text-xs px-2 py-1 rounded capitalize ${
                    drillView === v ? 'bg-telco-magenta text-white' : 'bg-gray-100 text-elastic-gray'
                  }`}>{v}</button>
              ))}
            </div>

            {drillView === 'metrics' && (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-lg font-bold text-elastic-dark">{m.p99LatencyMs}ms</p>
                  <p className="text-[10px] text-elastic-gray">p99</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-lg font-bold text-warning">{(100 - m.successRate).toFixed(2)}%</p>
                  <p className="text-[10px] text-elastic-gray">error rate</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-lg font-bold text-elastic-dark">{formatCount(anomaly?.correlatedTraces || 847)}</p>
                  <p className="text-[10px] text-elastic-gray">spans</p>
                </div>
              </div>
            )}

            {drillView === 'traces' && trace && (
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-elastic-gray mb-2">{trace.traceId}</p>
                {trace.spans.map((s, i) => (
                  <div key={i} className={`flex items-center gap-2 p-2 rounded text-xs ${
                    s.critical ? 'bg-danger/10 border border-danger/20' : 'bg-gray-50'
                  }`}>
                    <div className="h-2 rounded-full shrink-0" style={{
                      width: `${Math.min(s.durationMs / 8, 100)}px`,
                      backgroundColor: s.status === 'ERROR' ? '#bd271e' : '#00bfb3',
                    }} />
                    <span className="flex-1 truncate">{s.name}</span>
                    <span className="text-elastic-gray">{s.durationMs}ms</span>
                  </div>
                ))}
              </div>
            )}

            {drillView === 'logs' && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {detail.logs?.map((log, i) => (
                  <LogRowButton key={`${log.timestamp}-${log.traceId}-${i}`} log={log} onClick={setSelectedLog} />
                ))}
              </div>
            )}
          </div>

          {/* Recent transactions + workflow */}
          <div className="space-y-4">
            <div className="border border-gray-100 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-elastic-dark mb-3">Recent Sessions</h4>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-elastic-gray border-b">
                    <th className="pb-2">Session ID</th>
                    <th className="pb-2">Bandwidth</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.recentSessions?.map(txn => (
                    <tr key={txn.sessionId} className="border-b border-gray-50">
                      <td className="py-1.5 font-mono text-[10px]">{txn.sessionId}</td>
                      <td className="py-1.5">{txn.bandwidthMbps} Mbps</td>
                      <td className={`py-1.5 font-medium ${txn.status === 'active' ? 'text-success' : 'text-danger'}`}>
                        {txn.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {anomaly && (
              <div className="space-y-3">
                <A2AFederationPanel
                  regionId={m.regionId}
                  regionName={m.name}
                  compact
                />
                <div className="border border-telco-magenta/20 bg-telco-magenta/5 rounded-lg p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-sm font-semibold text-telco-magenta flex items-center gap-2">
                    <Workflow className="w-4 h-4" /> Elastic Workflow
                  </h4>
                  <ElasticWorkflowLink
                    kibanaUrl={kibanaUrl}
                    workflowId={workflowRun?.kibanaWorkflowId || anomaly?.workflowId}
                    executionId={workflowRun?.kibanaExecutionId}
                    href={workflowRun?.kibanaExecutionUrl || workflowRun?.kibanaWorkflowUrl}
                  />
                </div>
                {!workflowRun ? (
                  <button type="button" onClick={() => onRunWorkflow(anomaly)} disabled={workflowLoading}
                    className="w-full py-2 bg-telco-magenta text-white text-sm rounded-lg flex items-center justify-center gap-2 disabled:opacity-50">
                    <Bot className="w-4 h-4" />
                    {workflowLoading ? 'Starting…' : 'Run AI Resolution Workflow'}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-success flex items-center gap-1"><Zap className="w-3 h-3" /> {workflowRun.message}</p>
                    {workflowRun.aiSummary && (
                      <p className="text-[10px] text-elastic-dark bg-white p-2 rounded">{workflowRun.aiSummary}</p>
                    )}
                  </div>
                )}
              </div>
              </div>
            )}
          </div>
        </div>

        {selectedLog && (
          <LogDetailPanel
            log={selectedLog}
            kibanaUrl={kibanaUrl}
            onClose={() => setSelectedLog(null)}
          />
        )}

        {/* SLO footer */}
        <div className="flex items-center gap-2 text-xs text-elastic-gray pt-2 border-t border-gray-100">
          <Shield className="w-3 h-3" />
          Error budget remaining: {detail.slo?.errorBudgetRemaining}% · Query {detail.queryTimeMs}ms
        </div>
      </div>
    </div>
  );
}

export default RegionDetailPanel;
