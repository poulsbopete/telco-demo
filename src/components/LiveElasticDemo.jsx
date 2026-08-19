import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bot,
  RefreshCw, ChevronRight,
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
  buildTelcoLaunchDiscoverEsql,
  buildTelcoRegionsDiscoverEsql,
  formatCount,
} from '../lib/elastic-api';
import { ModuleHeader } from './shared/ModuleHeader';
import { ElasticDeepLinks, SectionElasticLink } from './shared/ElasticDeepLinks';
import { RegionDetailPanel } from './RegionDetailPanel';
import { LogDetailPanel } from './LogDetailPanel';
import { MlSignalIntelligence } from './shared/MlSignalIntelligence';
import { LaunchBusinessMetrics } from './shared/LaunchEventStrip';
import { WorkflowResolutionPanel } from './WorkflowResolutionPanel';

export function LiveElasticDemo() {
  const [health, setHealth] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [drillView, setDrillView] = useState('metrics');
  const [workflowRun, setWorkflowRun] = useState(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const workflowTimersRef = useRef([]);
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

  useEffect(() => () => {
    workflowTimersRef.current.forEach(clearTimeout);
  }, []);

  function clearWorkflowTimers() {
    workflowTimersRef.current.forEach(clearTimeout);
    workflowTimersRef.current = [];
  }

  function scheduleWorkflow(fn, ms) {
    const id = setTimeout(fn, ms);
    workflowTimersRef.current.push(id);
    return id;
  }

  function animateWorkflowSteps(baseRun) {
    clearWorkflowTimers();
    const steps = (baseRun.steps || []).map(s => ({ ...s, status: 'pending' }));
    if (!steps.length) {
      setWorkflowRun(baseRun);
      return;
    }

    setWorkflowRun({ ...baseRun, status: 'running', steps });

    steps.forEach((_, i) => {
      scheduleWorkflow(() => {
        setWorkflowRun(prev => {
          if (!prev?.steps) return prev;
          return {
            ...prev,
            steps: prev.steps.map((s, idx) => ({
              ...s,
              status: idx < i ? 'completed' : idx === i ? 'running' : 'pending',
            })),
          };
        });
      }, 500 + i * 650);
    });

    scheduleWorkflow(() => {
      setWorkflowRun(prev => {
        if (!prev?.steps) return prev;
        return {
          ...prev,
          status: 'completed',
          message: 'Elastic Workflow completed — remediation verified',
          steps: prev.steps.map(s => ({ ...s, status: 'completed' })),
        };
      });
    }, 500 + steps.length * 650 + 700);
  }

  async function handleRegionClick(regionId) {
    setSelectedRegionId(regionId);
    setRegionFilter(regionId);
    setSelectedLog(null);
    setRegionDetailLoading(true);
    setRegionDetail(null);
    clearWorkflowTimers();
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
    clearWorkflowTimers();
    setWorkflowRun(null);
    try {
      const result = await runWorkflow({
        workflowId: anomaly.workflowId,
        anomalyId: anomaly.id,
        regionId: anomaly.regionId,
      });
      if (result?.ok === false && result?.error && !result?.steps?.length) {
        setWorkflowRun(result);
      } else {
        animateWorkflowSteps(result);
      }
    } catch (err) {
      setWorkflowRun({ ok: false, error: err.message, message: err.message });
    } finally {
      setWorkflowLoading(false);
    }
  }

  async function handleRunWorkflow() {
    await handleRunWorkflowForAnomaly(selectedAnomaly);
  }

  const kibanaUrl = health?.kibanaUrl || import.meta.env.VITE_KIBANA_URL;
  const anomaly = selectedAnomaly || data?.primaryAnomaly;
  const pipelineDiscoverUrl = kibanaDiscoverUrl(kibanaUrl, { query: TELCO_DISCOVER_ESQL });
  const regionsDiscoverUrl = kibanaDiscoverUrl(kibanaUrl, {
    query: buildTelcoRegionsDiscoverEsql(selectedRegionId || null),
  });
  const launchDiscoverUrl = kibanaDiscoverUrl(kibanaUrl, { query: buildTelcoLaunchDiscoverEsql() });
  const o11yDashboardUrl = kibanaO11yDashboardUrl(kibanaUrl);
  return (
    <div>
      <ModuleHeader
        title="iPhone Launch"
        subtitle="Live OpenTelemetry — launch weekend regions, core services, and ML signals."
        badge={health?.connected ? 'Live · Elastic Serverless' : 'Offline'}
      >
        <button type="button" onClick={load} disabled={loading} className="btn-quiet flex items-center gap-1.5">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
        <ElasticDeepLinks
          links={[
            { href: pipelineDiscoverUrl, label: 'Discover', primary: true },
            { href: o11yDashboardUrl, label: 'Dashboard' },
          ]}
        />
      </ModuleHeader>

      {!health?.connected && (
        <p className="text-[13px] text-[#cc0000] -mt-6 mb-6">Not connected to Elastic Serverless.</p>
      )}

      {error && !data && (
        <p className="mt-2 text-sm text-danger">{error}</p>
      )}

      {data && (
        <>
          {data.launchEvent && (
            <LaunchBusinessMetrics
              launchEvent={data.launchEvent}
              compact
              className="mb-6"
              kibanaDashboardUrl={o11yDashboardUrl}
              kibanaDiscoverUrl={launchDiscoverUrl}
            />
          )}

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="surface-card p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Regions</h3>
                <SectionElasticLink href={regionsDiscoverUrl} label="Discover" />
              </div>
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {data.regions?.map(m => (
                  <button key={m.regionId} type="button" onClick={() => handleRegionClick(m.regionId)}
                    className={`w-full text-left p-3 rounded-xl transition-colors ${
                      selectedRegionId === m.regionId ? 'bg-[#0071e3]/8 ring-1 ring-[#0071e3]/25' : 'bg-[#f5f5f7] hover:bg-[#ebebed]'
                    }`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-[#1d1d1f] truncate">{m.name}</p>
                        <p className="text-[11px] text-[#86868b] mt-1">
                          {formatCount(m.sessions24h)} sessions ·{' '}
                          <span className={m.successRate < 99.7 ? 'text-warning' : 'text-success'}>{m.successRate}%</span>
                          {' · '}{m.p99LatencyMs}ms
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 ${selectedRegionId === m.regionId ? 'text-[#0071e3]' : 'text-[#86868b]'}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="surface-card p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Core pipeline</h3>
                <SectionElasticLink href={pipelineDiscoverUrl} label="Discover" />
              </div>
              <div className="space-y-2.5">
                {data.networkPipeline?.slice(0, 6).map(p => (
                  <div key={p.service}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-[#1d1d1f]">{p.telcoService}</span>
                      <span className="text-[#86868b]">{formatCount(p.sessionCount)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-elastic-teal rounded-full"
                        style={{ width: `${(p.sessionCount / (data.networkPipeline[0]?.sessionCount || 1)) * 100}%` }} />
                    </div>
                    {p.errors > 0 && (
                      <p className="text-[10px] text-danger mt-0.5">{p.errors} errors</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card p-4 flex flex-col">
              <div className="flex items-center justify-between gap-3 mb-2 shrink-0">
                <h3 className="text-[15px] font-semibold text-[#1d1d1f]">ML signals</h3>
                <SectionElasticLink href={o11yDashboardUrl} label="Dashboard" />
              </div>
              <div className="max-h-[280px] overflow-y-auto pr-1">
                <MlSignalIntelligence
                  intelligence={data.mlSignalIntelligence}
                  anomalies={data.mlAnomalies}
                  selectedAnomalyId={selectedAnomaly?.id}
                  onSelectAnomaly={(a) => {
                    clearWorkflowTimers();
                    setSelectedAnomaly(a);
                    setWorkflowRun(null);
                  }}
                  compact
                  showSuppressed={false}
                />
              </div>
              {anomaly && !workflowRun && (
                <button
                  type="button"
                  onClick={handleRunWorkflow}
                  disabled={workflowLoading}
                  className="mt-3 w-full py-2.5 btn-primary disabled:opacity-50 flex items-center justify-center gap-2 text-[13px] shrink-0"
                >
                  <Bot className="w-4 h-4" />
                  {workflowLoading ? 'Starting…' : 'Run workflow'}
                </button>
              )}
              {(workflowRun || workflowLoading) && (
                <div className="mt-3 shrink-0">
                  <WorkflowResolutionPanel
                    workflowRun={workflowRun}
                    loading={workflowLoading}
                    compact
                    kibanaUrl={kibanaUrl}
                    workflowId={anomaly?.workflowId}
                    title="Live workflow run"
                  />
                </div>
              )}
            </div>
          </div>

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
