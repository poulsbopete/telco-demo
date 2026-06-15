import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Activity, Database, AlertCircle, ArrowRight, Server,
  RefreshCw, Shield, Zap, Clock, HardDrive, Workflow,
  Loader2, CheckCircle2,
} from 'lucide-react';
import { TimeSeriesChart } from './shared/TimeSeriesChart';
import { DataRetentionPolicy } from './shared/DataRetentionPolicy';
import { CostCalculator } from './CostCalculator';
import { ModuleHeader, DemoBanner, StatCard } from './shared/ModuleHeader';
import {
  generateMetricsSeries,
  generateIngestionStats,
  generateTraceSummary,
} from '../utils/data-generator';
import { formatNumber, formatDailyVolume, traceVolumeFromSpansPerMinute } from '../utils/cost-calculator';
import traces from '../data/sample-traces.json';
import { A2AFederationPanel } from './A2AFederationPanel';
import { WorkflowResolutionPanel } from './WorkflowResolutionPanel';
import { CHECKOUT_INCIDENT } from '../lib/demo-incident';
import {
  runWorkflow,
  simulateElasticSearchA2A,
  simulateElasticSecurityA2A,
} from '../lib/elastic-api';

export function ObservabilityDashboard() {
  const [metrics, setMetrics] = useState(() => generateMetricsSeries(30));
  const [ingestion, setIngestion] = useState(() => generateIngestionStats());
  const [traceSummary, setTraceSummary] = useState(() => generateTraceSummary());
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [drillView, setDrillView] = useState('metrics');
  const [incidentActive, setIncidentActive] = useState(false);
  const [drMode, setDrMode] = useState('primary');
  const [spanHook, setSpanHook] = useState(null);
  const [incidentPhase, setIncidentPhase] = useState('idle'); // idle | running | resolved
  const [workflowRun, setWorkflowRun] = useState(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [a2aAutoRun, setA2aAutoRun] = useState(false);
  const timersRef = useRef([]);

  async function invokeSpanA2A(target) {
    setSpanHook({ target, loading: true });
    try {
      const invoke = target === 'security' ? simulateElasticSecurityA2A : simulateElasticSearchA2A;
      const data = await invoke({ regionId: 'REG-8847291', regionName: 'Acme Global Retail' });
      const summary = data?.response?.result?.artifacts?.find(a => a.artifactId === 'ai-summary')?.parts?.[0]?.text;
      setSpanHook({ target, loading: false, summary });
    } catch {
      setSpanHook(null);
    }
  }

  const refresh = useCallback(() => {
    setMetrics(generateMetricsSeries(30));
    setIngestion(generateIngestionStats());
    setTraceSummary(generateTraceSummary());
  }, []);

  useEffect(() => {
    const interval = setInterval(refresh, 2500);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  function schedule(fn, ms) {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }

  function animateWorkflowSteps(baseRun) {
    const steps = baseRun.steps.map(s => ({ ...s, status: 'pending' }));
    setWorkflowRun({ ...baseRun, steps });

    steps.forEach((_, i) => {
      schedule(() => {
        setWorkflowRun(prev => {
          if (!prev?.steps) return prev;
          const next = prev.steps.map((s, idx) => ({
            ...s,
            status: idx < i ? 'completed' : idx === i ? 'running' : 'pending',
          }));
          return { ...prev, steps: next };
        });
      }, 600 + i * 700);
    });

    schedule(() => {
      setWorkflowRun(prev => ({
        ...prev,
        message: 'Incident resolved — checkout-api SLO recovered',
        steps: prev.steps.map(s => ({ ...s, status: 'completed' })),
      }));
      setIncidentPhase('resolved');
      setIncidentActive(false);
    }, 600 + steps.length * 700 + 800);
  }

  async function startWorkflow() {
    setWorkflowLoading(true);
    try {
      const result = await runWorkflow({
        workflowId: 'wf-core-latency-remediation',
        anomalyId: 'ML-ANOM-001',
        regionId: 'REG-8847291',
      });
      animateWorkflowSteps(result);
    } catch {
      setWorkflowRun({ ok: false, message: 'Workflow failed to start' });
    } finally {
      setWorkflowLoading(false);
    }
  }

  function triggerIncident() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setIncidentPhase('running');
    setWorkflowRun(null);
    setWorkflowLoading(false);
    setA2aAutoRun(false);
    setSpanHook(null);
    setDrillView('metrics');
    setSelectedTrace(traces[0]);

    setIncidentActive(true);
    schedule(() => setDrillView('traces'), 1200);
    schedule(() => setA2aAutoRun(true), 2200);
    schedule(() => setDrillView('logs'), 4200);
    schedule(() => startWorkflow(), 5200);
  }

  function handleMetricClick() {
    if (incidentActive || metrics.some(m => m.latency > 400)) {
      setSelectedTrace(traces[0]);
      setDrillView('traces');
    }
  }

  const activeTrace = selectedTrace || traces[0];
  const kibanaUrl = import.meta.env.VITE_KIBANA_URL;

  return (
    <div>
      <ModuleHeader
        title="Observability at Massive Scale"
        subtitle="OpenTelemetry-native unified metrics, traces, and logs — petabyte-scale with cost efficiency"
        badge="OTel Native"
      >
        <button
          type="button"
          onClick={triggerIncident}
          disabled={incidentPhase === 'running'}
          className="text-sm px-3 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 flex items-center gap-1 disabled:opacity-60"
        >
          <AlertCircle className="w-4 h-4" />
          {incidentPhase === 'running' ? 'Incident in progress…' : incidentPhase === 'resolved' ? 'Replay Incident' : 'Trigger Demo Incident'}
        </button>
        <button
          type="button"
          onClick={() => setDrMode(d => d === 'primary' ? 'failover' : 'primary')}
          className={`text-sm px-3 py-2 rounded-lg flex items-center gap-1 border ${
            drMode === 'failover'
              ? 'bg-success text-white border-success'
              : 'bg-white border-gray-200 text-elastic-dark hover:bg-gray-50'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          DR: {drMode === 'primary' ? 'Datadog Primary' : 'Elastic Failover'}
        </button>
      </ModuleHeader>

      <DemoBanner />

      {incidentPhase === 'running' && (
        <div className="mt-4 p-3 bg-danger/5 border border-danger/20 rounded-lg text-xs text-elastic-dark flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-danger shrink-0" />
          <span>
            <strong className="text-danger">ML anomaly detected</strong>
            {' · '}{CHECKOUT_INCIDENT.traceId} · correlating traces → A2A federation → Elastic Workflow
          </span>
        </div>
      )}

      {incidentPhase === 'resolved' && (
        <div className="mt-4 p-3 bg-success/10 border border-success/30 rounded-lg text-xs text-success flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Resolved by Elastic Workflow — p99 &lt; 250ms, regions REG-8847291 notified
        </div>
      )}

      {drMode === 'failover' && (
        <div className="mt-4 p-3 bg-success/10 border border-success/30 rounded-lg text-sm text-success flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Elastic DR cluster active — queries routing to backup cluster with 1.2s sync latency. Datadog primary unavailable.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <StatCard
          label="Spans/min"
          value={formatNumber(ingestion.spansPerMinute)}
          trend={`1.2B/min · ${formatDailyVolume(traceVolumeFromSpansPerMinute(ingestion.spansPerMinute).tbPerDay)} traces`}
          highlight
        />
        <StatCard
          label="Logs/day"
          value={`${ingestion.logsPerDay.toFixed(1)} PB`}
          trend="2.5–3 PB/day range"
        />
        <StatCard
          label="Metrics/min"
          value={formatNumber(ingestion.metricsPerMinute)}
          trend="500M+ datapoints"
        />
        <StatCard
          label="Query Latency"
          value={`${ingestion.queryLatencyMs}ms`}
          trend="< 1 sec at PB scale"
          highlight
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-elastic-dark flex items-center gap-2">
                <Activity className="w-4 h-4 text-elastic-teal" />
                Golden Signals — Checkout API
              </h3>
              <div className="flex gap-1">
                {['metrics', 'traces', 'logs'].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setDrillView(v)}
                    className={`text-xs px-2 py-1 rounded capitalize ${
                      drillView === v ? 'bg-elastic-teal text-white' : 'bg-gray-100 text-elastic-gray'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {drillView === 'metrics' && (
              <>
                <TimeSeriesChart
                  data={metrics}
                  lines={[
                    { key: 'latency', name: 'Latency (ms)', color: '#0077cc' },
                    { key: 'errorRate', name: 'Error Rate (%)', color: '#bd271e' },
                  ]}
                  height={220}
                  onClick={handleMetricClick}
                />
                <p className="text-xs text-elastic-gray mt-2 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" />
                  Click spike to drill into traces → logs → root cause
                </p>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <TimeSeriesChart
                    data={metrics}
                    lines={[{ key: 'throughput', name: 'Throughput', color: '#00bfb3' }]}
                    height={100}
                  />
                  <TimeSeriesChart
                    data={metrics}
                    lines={[{ key: 'paymentSuccess', name: 'Payment Success %', color: '#017d73' }]}
                    height={100}
                  />
                  <TimeSeriesChart
                    data={metrics}
                    lines={[{ key: 'fraudDetection', name: 'Fraud Detection %', color: '#f5a700' }]}
                    height={100}
                  />
                </div>
              </>
            )}

            {drillView === 'traces' && activeTrace && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-elastic-dark">{activeTrace.trace_id}</p>
                    <p className="text-xs text-elastic-gray">
                      {activeTrace.service} v{activeTrace.version} · {activeTrace.duration_ms}ms · {activeTrace.status}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDrillView('logs')}
                    className="text-xs px-2 py-1 bg-elastic-teal text-white rounded flex items-center gap-1"
                  >
                    View Logs <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-1">
                  {activeTrace.spans.map((span, i) => {
                    const hookTarget = span.name === CHECKOUT_INCIDENT.fraudSpan ? 'security'
                      : span.critical_path ? 'search' : null;
                    return (
                    <div
                      key={i}
                      className={`flex items-center gap-2 p-2 rounded text-xs ${
                        span.critical_path ? 'bg-danger/10 border border-danger/20' : 'bg-gray-50'
                      }`}
                    >
                      <div
                        className="h-2 rounded-full shrink-0"
                        style={{
                          width: `${Math.min(span.duration_ms / 8, 200)}px`,
                          backgroundColor: span.status === 'ERROR' ? '#bd271e' : span.status === 'SKIPPED' ? '#d3dae6' : '#00bfb3',
                        }}
                      />
                      <span className="font-mono flex-1 truncate">{span.name}</span>
                      <span className="text-elastic-gray">{span.duration_ms}ms</span>
                      <span className={`font-semibold ${
                        span.status === 'ERROR' ? 'text-danger' : span.status === 'OK' ? 'text-success' : 'text-elastic-gray'
                      }`}>
                        {span.status}
                      </span>
                      {span.critical_path && (
                        <span className="text-[10px] bg-danger text-white px-1 rounded">CRITICAL PATH</span>
                      )}
                      {hookTarget && activeTrace.trace_id === CHECKOUT_INCIDENT.traceId && (
                        <button type="button" onClick={() => invokeSpanA2A(hookTarget)}
                          className="text-[9px] px-1.5 py-0.5 rounded border border-elastic-teal/40 text-elastic-teal hover:bg-elastic-teal/10 shrink-0">
                          A2A → {hookTarget === 'security' ? 'Sec' : 'Search'}
                        </button>
                      )}
                    </div>
                    );
                  })}
                </div>
                {spanHook?.summary && (
                  <p className="mt-2 p-2 bg-elastic-teal/5 rounded text-[10px] text-elastic-dark border border-elastic-teal/20">
                    <span className="font-semibold text-elastic-teal capitalize">{spanHook.target}: </span>
                    {spanHook.summary}
                  </p>
                )}
                {activeTrace.trace_id === CHECKOUT_INCIDENT.traceId && (
                  <div className="mt-3">
                    <A2AFederationPanel
                      regionId="REG-8847291"
                      regionName="Acme Global Retail"
                      compact
                      autoRun={a2aAutoRun}
                    />
                  </div>
                )}
              </div>
            )}

            {drillView === 'logs' && activeTrace && (
              <div>
                <div className="mb-3 p-3 bg-danger/5 border border-danger/20 rounded-lg">
                  <p className="text-sm font-semibold text-danger">Root Cause Identified</p>
                  <p className="text-xs text-elastic-dark mt-1">{activeTrace.root_cause}</p>
                  <p className="text-xs text-elastic-gray mt-1">
                    {incidentPhase === 'resolved'
                      ? 'Auto-remediated by Elastic Workflow — scale + circuit breaker applied'
                      : 'Correlating via unified metrics → traces → logs → A2A → workflow'}
                  </p>
                </div>
                <div className="space-y-2">
                  {activeTrace.related_logs.map((log, i) => (
                    <div key={i} className="flex gap-2 p-2 bg-gray-50 rounded text-xs font-mono">
                      <span className={`font-bold shrink-0 ${
                        log.level === 'ERROR' ? 'text-danger' : log.level === 'WARN' ? 'text-warning' : 'text-elastic-gray'
                      }`}>
                        {log.level}
                      </span>
                      <span className="text-elastic-gray shrink-0">{log.timestamp.split('T')[1]?.slice(0, 12)}</span>
                      <span className="text-elastic-dark">{log.message}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-elastic-gray">
                  <strong>Legacy eBay logging:</strong> Would require 3 separate systems and ~5 min correlation.
                  <strong className="text-elastic-teal"> Elastic unified:</strong> Single query across logs + traces + metrics.
                </div>
                {(workflowRun || workflowLoading) && (
                  <div className="mt-3">
                    <WorkflowResolutionPanel
                      workflowRun={workflowRun}
                      loading={workflowLoading}
                      compact
                      kibanaUrl={kibanaUrl}
                      workflowId="wf-core-latency-remediation"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {(incidentPhase !== 'idle' || workflowRun) && (
            <div className="bg-white rounded-xl border border-telco-magenta/20 p-4">
              <h3 className="text-sm font-semibold text-elastic-dark flex items-center gap-2 mb-3">
                <Workflow className="w-4 h-4 text-telco-magenta" />
                Elastic Workflow Resolution
              </h3>
              <WorkflowResolutionPanel
                workflowRun={workflowRun}
                loading={workflowLoading}
                kibanaUrl={kibanaUrl}
                workflowId="wf-core-latency-remediation"
              />
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-elastic-dark flex items-center gap-2 mb-3">
                <Server className="w-4 h-4 text-elastic-teal" />
                System Health (650+ Sources)
              </h3>
              <TimeSeriesChart
                data={metrics}
                lines={[
                  { key: 'cpu', name: 'CPU %', color: '#0077cc' },
                  { key: 'memory', name: 'Memory %', color: '#f5a700' },
                ]}
                height={150}
              />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-elastic-dark flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-elastic-teal" />
                Data Pipeline Health
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-elastic-gray">Ingestion Rate</span>
                  <span className="font-semibold text-elastic-dark animate-count">
                    {formatNumber(ingestion.spansPerMinute + ingestion.metricsPerMinute)}/min
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-elastic-gray">Ingestion Lag</span>
                  <span className="font-semibold text-success">{ingestion.ingestionLagMs}ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-elastic-gray">Sources Online</span>
                  <span className="font-semibold text-elastic-dark">{formatNumber(ingestion.sourcesOnline)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-elastic-gray">Active Services</span>
                  <span className="font-semibold text-elastic-dark">{traceSummary.activeServices}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 min-w-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-elastic-dark flex items-center gap-2 mb-3">
              <HardDrive className="w-4 h-4 text-elastic-teal" />
              Serverless Retention Pricing
            </h3>
            <DataRetentionPolicy logsTBPerDay={100} retentionDays={90} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-elastic-dark flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-elastic-teal" />
              OpenTelemetry Integration
            </h3>
            <div className="space-y-2 text-xs text-elastic-gray">
              <div className="flex items-center gap-2 p-2 bg-elastic-teal/5 rounded">
                <Database className="w-4 h-4 text-elastic-teal" />
                Same OTel agent → metrics, traces, logs — no code changes from Datadog
              </div>
              <div className="p-2 bg-gray-50 rounded font-mono text-[10px]">
                OTEL_EXPORTER_OTLP_ENDPOINT=elastic-collector:4317
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 min-w-0">
        <CostCalculator mode="observability" />
      </div>
    </div>
  );
}

export default ObservabilityDashboard;
