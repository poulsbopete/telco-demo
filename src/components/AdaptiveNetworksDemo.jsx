import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExternalLink, GitBranch, Loader2, Radio, Workflow } from 'lucide-react';
import { IncidentFlowChart } from './IncidentFlowChart';
import { ModuleHeader } from './shared/ModuleHeader';
import { ElasticDeepLinks, SectionElasticLink } from './shared/ElasticDeepLinks';
import { P1IncidentCounter } from './shared/P1IncidentCounter';
import { MlSignalIntelligence } from './shared/MlSignalIntelligence';
import { FAULT_CHANNELS, INCIDENT_STEPS } from '../lib/adaptive-networks/channels';
import { buildDemoMlSignalIntelligence } from '../lib/ml-signal-intelligence';
import { LaunchEventStrip } from './shared/LaunchEventStrip';
import { IPHONE_LAUNCH } from '../lib/iphone-launch-event';
import {
  fetchAdaptiveNetworksConfig,
  injectNetworkFault,
  pollAdaptiveExecutions,
  resumeAdaptiveExecution,
  kibanaDiscoverUrl,
  kibanaAdaptiveCasesUrl,
  kibanaO11yDashboardUrl,
  elasticWorkflowUrl,
  ADAPTIVE_DISCOVER_ESQL,
} from '../lib/elastic-api';

function statusClass(status) {
  if (status === 'completed') return 'text-success font-semibold capitalize';
  if (status === 'failed') return 'text-danger font-semibold capitalize';
  if (status === 'running') return 'text-amber-600 font-semibold capitalize';
  if (status === 'waiting_for_input') return 'text-amber-600 font-semibold capitalize';
  return 'text-elastic-gray capitalize';
}

const TIMELINE = [
  ['injecting', 'Inject logs'],
  ['waiting', 'Alert fires (~60s)'],
  ['running', 'Workflow runs'],
  ['hitl', 'Human approval'],
  ['done', 'Complete'],
];

export function AdaptiveNetworksDemo() {
  const kibanaUrl = import.meta.env.VITE_KIBANA_URL;
  const [config, setConfig] = useState(null);
  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState('idle');
  const [message, setMessage] = useState('');
  const [injectedAt, setInjectedAt] = useState(null);
  const [execution, setExecution] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  const [hitlNotes, setHitlNotes] = useState('');
  const [hitlSubmitting, setHitlSubmitting] = useState(false);

  useEffect(() => {
    fetchAdaptiveNetworksConfig()
      .then(setConfig)
      .catch(() => setConfig(null));
  }, []);

  const pollExecutions = useCallback(async since => {
    const data = await pollAdaptiveExecutions(since);
    return data.executions ?? [];
  }, []);

  useEffect(() => {
    if (!injectedAt || phase === 'idle' || phase === 'error' || phase === 'done') return;

    const interval = setInterval(async () => {
      try {
        setPollCount(c => c + 1);
        const executions = await pollExecutions(injectedAt);
        if (!executions.length) {
          setPhase('waiting');
          setMessage(
            `Fault logs ingested. Waiting for Kibana alert rule evaluation (runs every ~60s, 5m lookback window)… (${Math.max(0, pollCount) * 3}s elapsed)`,
          );
          return;
        }

        const latest = executions[0];
        setExecution(latest);

        if (latest.waitingForHuman) {
          setPhase('hitl');
          setMessage('Workflow paused — approve or reject remediation below.');
        } else if (latest.status === 'completed') {
          setPhase('done');
          setMessage('Workflow completed successfully.');
        } else if (latest.status === 'failed') {
          setPhase('error');
          setMessage('Workflow failed — open Kibana for details.');
        } else {
          setPhase('running');
          setMessage('Elastic workflow is running…');
        }
      } catch (err) {
        setPhase('error');
        setMessage(err.message || 'Polling error');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [injectedAt, phase, pollExecutions, pollCount]);

  async function inject(channel) {
    setSelected(channel);
    setPhase('injecting');
    setMessage('Sending OTel logs + metrics to otel-demo…');
    setExecution(null);
    setPollCount(0);
    setHitlNotes('');
    setHitlSubmitting(false);

    try {
      const data = await injectNetworkFault(channel);
      setInjectedAt(data.injectedAt);
      setPhase('waiting');
      setMessage(data.message);
    } catch (err) {
      setPhase('error');
      setMessage(err.message || 'Inject failed');
    }
  }

  async function submitHitlApproval(approved) {
    if (!execution || hitlSubmitting) return;

    setHitlSubmitting(true);
    setMessage(approved ? 'Submitting approval…' : 'Submitting rejection…');

    try {
      await resumeAdaptiveExecution(execution.id, { approved, notes: hitlNotes || undefined });
      setPhase('running');
      setMessage(
        approved
          ? 'Approved — workflow resuming remediation…'
          : 'Rejected — workflow will skip remediation and close the case.',
      );
      setHitlNotes('');
    } catch (err) {
      setMessage(err.message || 'Approval failed');
    } finally {
      setHitlSubmitting(false);
    }
  }

  const selectedFault = useMemo(
    () => FAULT_CHANNELS.find(c => c.channel === selected),
    [selected],
  );

  const adaptiveMlIntelligence = useMemo(
    () => buildDemoMlSignalIntelligence([
      {
        id: 'ML-ADAPTIVE-001',
        type: 'transport_degradation',
        title: selectedFault?.name || 'Network transport fault',
        mlScore: selectedFault?.severity === 'high' ? 0.92 : 0.86,
        severity: selectedFault?.severity === 'high' ? 'high' : 'medium',
        domain: 'transport',
        mlJobId: 'transport-link-loss-v1',
        regionId: 'REG-4421098',
        regionName: 'West Fiber Backbone',
        signal: selectedFault?.description || 'ML job flagged pre-customer degradation pattern',
        priorityScore: selectedFault?.severity === 'high' ? 92 : 78,
        proactiveLeadMin: selectedFault?.severity === 'high' ? 14 : 28,
        suppressedDuplicates: 34,
        status: 'actionable',
        correlatedDomains: ['transport', 'core'],
      },
    ]),
    [selectedFault],
  );

  const activeWorkflowStep = useMemo(() => {
    if (!execution) return undefined;
    const steps = execution.stepExecutions ?? [];
    const running = steps.find(s => s.status === 'running');
    if (running) return running.stepId;
    if (execution.currentNodeId) return execution.currentNodeId;
    const lastDone = [...steps].reverse().find(s => s.status === 'completed');
    return lastDone?.stepId;
  }, [execution]);

  const awaitingHitl =
    selectedFault?.severity === 'high'
    && Boolean(execution?.waitingForHuman || phase === 'hitl');

  const hitlPending =
    selectedFault?.severity === 'high'
    && Boolean(execution)
    && phase === 'running'
    && !awaitingHitl;

  const discoverUrl = kibanaDiscoverUrl(kibanaUrl || config?.kibanaUrl, { query: ADAPTIVE_DISCOVER_ESQL });
  const o11yDashboardUrl = kibanaO11yDashboardUrl(kibanaUrl || config?.kibanaUrl);
  const casesUrl = kibanaAdaptiveCasesUrl(kibanaUrl || config?.kibanaUrl);
  const workflowsUrl = useMemo(() => {
    const base = kibanaUrl || config?.kibanaUrl;
    if (!base) return null;
    if (execution?.workflowId) {
      return elasticWorkflowUrl(base, {
        workflowId: execution.workflowId,
        executionId: execution.id,
      });
    }
    if (config?.workflowId) {
      return elasticWorkflowUrl(base, { workflowId: config.workflowId });
    }
    return elasticWorkflowUrl(base);
  }, [kibanaUrl, config, execution]);

  function tlActive(key) {
    return (
      phase === key
      || (awaitingHitl && key === 'hitl')
      || (phase === 'running' && key === 'waiting')
      || (phase === 'done' && ['running', 'waiting', 'injecting'].includes(key))
    );
  }

  return (
    <div>
      <ModuleHeader
        title="Adaptive networks"
        subtitle="Inject a transport or routing fault and watch ML correlate telemetry before remediation runs."
        badge="Live"
      >
        <ElasticDeepLinks
          links={[
            { href: discoverUrl, label: 'Discover', primary: true },
            { href: o11yDashboardUrl, label: 'Dashboard' },
            { href: casesUrl, label: 'Cases' },
            { href: workflowsUrl, label: 'Workflows' },
          ]}
        />
      </ModuleHeader>

      <LaunchEventStrip className="mb-8" />

      <div className="surface-card p-6 sm:p-8">
        <p className="section-lead mb-6">
          {IPHONE_LAUNCH.eventName} load on transport — inject a fault and watch ML correlate telemetry before remediation runs.
        </p>
        {config && (
          <p className="text-[13px] text-[#86868b] mb-8">
            <a href={config.kibanaUrl} target="_blank" rel="noopener noreferrer" className="text-[#0071e3] hover:underline">
              {config.kibanaUrl.replace('https://', '')}
            </a>
            {!config.otlpConfigured && ' · OTLP not configured'}
          </p>
        )}

        <section className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-[21px] font-semibold text-[#1d1d1f]">Choose a fault</h2>
            <SectionElasticLink href={discoverUrl} label="Discover · transport logs" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FAULT_CHANNELS.map(fault => (
              <button
                key={fault.channel}
                type="button"
                onClick={() => inject(fault.channel)}
                disabled={phase === 'injecting'}
                className={`text-left rounded-2xl p-4 transition-colors disabled:opacity-50 ${
                  selected === fault.channel
                    ? 'bg-[#0071e3]/8 ring-1 ring-[#0071e3]/25'
                    : 'bg-[#f5f5f7] hover:bg-[#ebebed]'
                }`}
              >
                <p className="text-[12px] text-[#86868b] capitalize">{fault.severity}</p>
                <h3 className="text-[15px] font-medium text-[#1d1d1f] mt-1">{fault.name}</h3>
                <p className="text-[13px] text-[#86868b] mt-2 leading-snug">{fault.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-4">
            <IncidentFlowChart fault={selectedFault ?? null} phase={phase} workflowStep={activeWorkflowStep} />
          </div>

          {selectedFault && phase !== 'idle' && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <MlSignalIntelligence
                intelligence={adaptiveMlIntelligence}
                anomalies={adaptiveMlIntelligence ? [{
                  id: 'ML-ADAPTIVE-001',
                  type: 'transport_degradation',
                  title: selectedFault.name,
                  mlScore: selectedFault.severity === 'high' ? 0.92 : 0.86,
                  severity: selectedFault.severity === 'high' ? 'high' : 'medium',
                  domain: 'transport',
                  mlJobId: 'transport-link-loss-v1',
                  regionId: 'REG-4421098',
                  regionName: 'West Fiber Backbone',
                  signal: selectedFault.description,
                  priorityScore: selectedFault.severity === 'high' ? 92 : 78,
                  proactiveLeadMin: selectedFault.severity === 'high' ? 14 : 28,
                  suppressedDuplicates: 34,
                  status: 'actionable',
                  correlatedDomains: ['transport', 'core'],
                }] : []}
                compact
                showFunnel
                showJobs={false}
                showSuppressed={false}
                showAnomalies
              />
            </div>
          )}
        </section>

        <section className="pt-8 border-t border-[#d2d2d7]/60">
          <h2 className="text-[21px] font-semibold text-[#1d1d1f] mb-4">Workflow</h2>

          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
            {TIMELINE.map(([key, label]) => (
              <div key={key} className={`flex items-center gap-1.5 text-xs ${tlActive(key) ? 'text-elastic-dark font-semibold' : 'text-elastic-gray'}`}>
                <span className={`w-2 h-2 rounded-full ${tlActive(key) ? (key === 'done' && phase === 'done' ? 'bg-success' : 'bg-elastic-teal') : 'bg-gray-300'}`} />
                {label}
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-elastic-light border border-gray-200 px-3 py-2.5 text-sm text-elastic-dark">
            <strong>Status:</strong> {message || 'Select a fault to begin.'}
            {pollCount > 0 && phase === 'waiting' && (
              <span className="text-elastic-gray"> · polling ({pollCount})</span>
            )}
            {phase === 'injecting' && <Loader2 className="inline w-3.5 h-3.5 ml-2 animate-spin text-elastic-teal" />}
          </div>

          {selectedFault && (
            <p className="text-xs text-elastic-gray mt-3">
              {selectedFault.severity === 'high'
                ? 'High severity: workflow pauses at waitForInput — approve or reject remediation in this UI.'
                : 'Low severity: workflow auto-remediates after Agent Builder RCA.'}
            </p>
          )}

          {hitlPending && (
            <div className="mt-3 text-xs text-elastic-gray border border-dashed border-elastic-teal/30 rounded-lg px-3 py-2 bg-elastic-teal/5">
              RCA and case creation in progress — <strong className="text-elastic-dark">Approve / Reject</strong> buttons appear when the workflow reaches human approval.
            </div>
          )}

          {awaitingHitl && execution && (
            <div className="mt-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
              <h4 className="text-sm font-semibold text-amber-800 mb-2">Human approval required</h4>
              <p className="text-xs text-elastic-gray mb-3">
                Critical fault on <strong className="text-elastic-dark">{selectedFault?.name ?? 'this incident'}</strong>. Remediation (
                <code className="text-telco-magenta">{selectedFault?.remediationAction}</code>) will not run until you approve.
              </p>
              <label className="block text-xs text-elastic-gray mb-3">
                <span className="block mb-1">Reviewer notes (optional)</span>
                <textarea
                  rows={2}
                  value={hitlNotes}
                  onChange={e => setHitlNotes(e.target.value)}
                  placeholder="e.g. Verified with NOC — safe to reset STP on VLAN 100"
                  disabled={hitlSubmitting}
                  className="w-full rounded-lg border border-gray-200 bg-white text-elastic-dark text-sm px-2 py-1.5 resize-y focus:outline-none focus:ring-2 focus:ring-elastic-teal/30"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => submitHitlApproval(true)} disabled={hitlSubmitting}
                  className="text-xs px-3 py-2 rounded-lg bg-success text-white font-semibold disabled:opacity-50">
                  {hitlSubmitting ? 'Submitting…' : 'Approve remediation'}
                </button>
                <button type="button" onClick={() => submitHitlApproval(false)} disabled={hitlSubmitting}
                  className="text-xs px-3 py-2 rounded-lg border border-danger text-danger font-semibold disabled:opacity-50">
                  Reject
                </button>
                <a href={execution.kibanaUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs px-3 py-2 rounded-lg border border-gray-200 text-elastic-gray flex items-center gap-1 ml-auto hover:bg-gray-50">
                  <ExternalLink className="w-3 h-3" /> View in Kibana
                </a>
              </div>
            </div>
          )}

          {execution && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap justify-between gap-3 items-start">
                <div>
                  <h3 className="text-sm font-semibold text-elastic-dark">Execution {execution.id.slice(0, 8)}…</h3>
                  <p className="text-xs mt-1">
                    <span className={statusClass(execution.status)}>{execution.status}</span>
                    {execution.startedAt && (
                      <span className="text-elastic-gray"> · started {new Date(execution.startedAt).toLocaleTimeString()}</span>
                    )}
                  </p>
                </div>
                <a href={execution.kibanaUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded-lg bg-elastic-teal text-white flex items-center gap-1 hover:bg-elastic-teal/90">
                  <ExternalLink className="w-3 h-3" /> View execution
                </a>
              </div>

              <ul className="mt-3 space-y-1">
                {(execution.stepExecutions ?? []).map(step => (
                  <li key={`${step.stepId}-${step.status}`}
                    className="grid grid-cols-[90px_1fr_auto_auto] gap-2 items-center text-[11px] py-1 border-b border-gray-100">
                    <span className={statusClass(step.status)}>{step.status}</span>
                    <code className="text-telco-magenta">{step.stepId}</code>
                    <span className="text-elastic-gray">{step.stepType}</span>
                    {step.executionTimeMs != null && (
                      <span className="text-elastic-gray">{step.executionTimeMs}ms</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {phase === 'done' && (
            <P1IncidentCounter
              compact
              context={
                selectedFault?.severity === 'high'
                  ? 'HITL-approved network remediation completed — P1 volume modeled down'
                  : 'Auto-remediation completed — transport fault cleared without NOC escalation'
              }
              className="mt-4"
            />
          )}

          {!execution && phase === 'waiting' && (
            <ul className="mt-4 grid sm:grid-cols-2 gap-1.5">
              {INCIDENT_STEPS.map(step => (
                <li key={step} className="text-[11px] text-elastic-gray flex items-center gap-2">
                  <Radio className="w-3 h-3 text-elastic-teal" /> {step}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdaptiveNetworksDemo;
