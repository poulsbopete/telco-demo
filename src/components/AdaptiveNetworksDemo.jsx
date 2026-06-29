import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExternalLink, GitBranch, Loader2, Radio, Workflow } from 'lucide-react';
import { IncidentFlowChart } from './IncidentFlowChart';
import { ModuleHeader } from './shared/ModuleHeader';
import { P1IncidentCounter } from './shared/P1IncidentCounter';
import { FAULT_CHANNELS, INCIDENT_STEPS } from '../lib/adaptive-networks/channels';
import { TELEMETRY_INGEST_SUMMARY, TELEMETRY_SOURCES } from '../lib/adaptive-networks/telemetry';
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
        title="Adaptive Networks"
        subtitle="Router/switch fault injection · Agent Builder RCA · HITL remediation on otel-demo"
        badge="Live"
      >
        {o11yDashboardUrl && (
          <a href={o11yDashboardUrl} target="_blank" rel="noopener noreferrer"
            className="text-sm px-3 py-2 border border-telco-magenta/40 text-telco-magenta rounded-lg flex items-center gap-1 hover:bg-telco-magenta/5">
            <ExternalLink className="w-4 h-4" /> Dashboard
          </a>
        )}
        {discoverUrl && (
          <a href={discoverUrl} target="_blank" rel="noopener noreferrer"
            className="text-sm px-3 py-2 bg-elastic-teal text-white rounded-lg flex items-center gap-1 hover:bg-elastic-teal/90">
            <ExternalLink className="w-4 h-4" /> Discover
          </a>
        )}
        {workflowsUrl && (
          <a href={workflowsUrl} target="_blank" rel="noopener noreferrer"
            className="text-sm px-3 py-2 border border-gray-200 rounded-lg flex items-center gap-1 hover:bg-gray-50 text-elastic-dark">
            <Workflow className="w-4 h-4" /> Workflows
          </a>
        )}
        {casesUrl && (
          <a href={casesUrl} target="_blank" rel="noopener noreferrer"
            className="text-sm px-3 py-2 border border-gray-200 rounded-lg flex items-center gap-1 hover:bg-gray-50 text-elastic-dark">
            <GitBranch className="w-4 h-4" /> Cases
          </a>
        )}
      </ModuleHeader>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-widest text-elastic-teal mb-1">
          Elastic Observability · Agent Builder · Workflows
        </p>
        <p className="text-sm text-elastic-gray max-w-3xl leading-relaxed mb-3">
          Inject a simulated router or switch fault via <strong className="text-elastic-dark">OTLP logs and metrics</strong>,
          then watch the real <strong className="text-elastic-dark">Network Incident Response</strong> workflow correlate
          telemetry with otel-demo <strong className="text-elastic-dark">Prometheus</strong> service metrics.
        </p>
        {config && (
          <p className="text-xs text-elastic-gray mb-4">
            Kibana:{' '}
            <a href={config.kibanaUrl} target="_blank" rel="noopener noreferrer" className="text-elastic-teal hover:underline">
              {config.kibanaUrl.replace('https://', '')}
            </a>
            {' · '}Alert interval {config.alertIntervalHint}
            {!config.otlpConfigured && (
              <span className="text-amber-600"> · OTLP_ENDPOINT not configured — inject disabled</span>
            )}
          </p>
        )}

        <div className="rounded-xl border border-gray-200 bg-elastic-light p-3 mb-5">
          <p className="text-xs text-elastic-gray mb-3">{TELEMETRY_INGEST_SUMMARY}</p>
          <div className="grid sm:grid-cols-3 gap-2">
            {TELEMETRY_SOURCES.map(source => (
              <div key={source.id} className="rounded-lg border border-gray-200 bg-white p-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wide text-elastic-teal">{source.label}</span>
                <p className="text-[11px] text-elastic-gray mt-1 leading-snug">{source.detail}</p>
                <code className="text-[10px] text-telco-magenta block mt-1">{source.destination}</code>
                <span className="text-[10px] text-elastic-gray block mt-1">{source.examples}</span>
              </div>
            ))}
          </div>
        </div>

        <section className="rounded-xl border border-gray-200 bg-white p-4 mb-4">
          <h2 className="text-sm font-semibold text-elastic-dark mb-3">1 · Choose a network fault</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FAULT_CHANNELS.map(fault => (
              <button
                key={fault.channel}
                type="button"
                onClick={() => inject(fault.channel)}
                disabled={phase === 'injecting'}
                className={`text-left rounded-xl border p-3 transition-all disabled:opacity-50 ${
                  selected === fault.channel
                    ? 'border-elastic-teal ring-1 ring-elastic-teal/40 bg-elastic-teal/5'
                    : 'border-gray-200 hover:border-elastic-teal/40 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-bold text-telco-magenta">CH{String(fault.channel).padStart(2, '0')}</span>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                    fault.severity === 'high' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
                  }`}>{fault.severity}</span>
                  {fault.severity === 'high' && (
                    <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 ml-auto">
                      HITL approval
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-elastic-dark">{fault.name}</h3>
                <p className="text-[11px] text-elastic-gray mt-1 leading-snug">{fault.description}</p>
                <code className="text-[10px] text-telco-magenta mt-2 block">{fault.errorType}</code>
              </button>
            ))}
          </div>

          <div className="mt-4">
            <IncidentFlowChart fault={selectedFault ?? null} phase={phase} workflowStep={activeWorkflowStep} />
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-elastic-dark mb-3">2 · Workflow progress</h2>

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
