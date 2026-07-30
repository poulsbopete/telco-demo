import { useEffect, useMemo, useState } from 'react';
import {
  Bot, ExternalLink, Loader2, Play, RefreshCw, Workflow,
} from 'lucide-react';
import { IncidentResponseDiagram } from './IncidentResponseDiagram';
import { ModuleHeader } from './shared/ModuleHeader';
import { ElasticDeepLinks } from './shared/ElasticDeepLinks';
import { P1IncidentCounter } from './shared/P1IncidentCounter';
import {
  LOOPS,
  SCENARIOS,
  nodesForLoop,
} from '../lib/incident-response/architecture';
import {
  elasticWorkflowUrl,
  getSearchKibanaUrl,
  kibanaDiscoverUrl,
  kibanaO11yDashboardUrl,
  runWorkflow,
  TELCO_DISCOVER_ESQL,
} from '../lib/elastic-api';

const LOOP_ORDER = ['reactive', 'proactive', 'knowledge'];
/** Proactive loop maps to Kibana alerting + Elastic Workflows on Search. */
const WORKFLOW_LOOP = 'proactive';

export function IncidentResponseDemo() {
  const [activeLoop, setActiveLoop] = useState('reactive');
  const [phase, setPhase] = useState('idle');
  const [stepIndex, setStepIndex] = useState(-1);
  const [completedNodes, setCompletedNodes] = useState(new Set());
  const [log, setLog] = useState([]);
  const [workflowRun, setWorkflowRun] = useState(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);

  const scenario = SCENARIOS[activeLoop];
  const loopMeta = LOOPS[activeLoop];
  const kibanaUrl = import.meta.env.VITE_KIBANA_URL;
  const searchKibanaUrl = getSearchKibanaUrl();
  const o11yDashboardUrl = kibanaO11yDashboardUrl(kibanaUrl);
  const discoverUrl = kibanaDiscoverUrl(kibanaUrl, { query: TELCO_DISCOVER_ESQL });
  // Knowledge / runbook workflows live on Search (ai-assistants), not O11Y
  const workflowsUrl = elasticWorkflowUrl(searchKibanaUrl, {
    workflowId: 'telco-core-latency-auto-remediation',
  });
  const executionUrl = workflowRun?.kibanaExecutionUrl || workflowRun?.kibanaWorkflowUrl || workflowsUrl;

  const activeNode = stepIndex >= 0 ? scenario.steps[stepIndex]?.node : null;

  const loopStats = useMemo(() => ({
    reactive: { sla: '< 90s', channel: 'Customer care API' },
    proactive: { sla: '< 5 min', channel: 'Operations console' },
    knowledge: { sla: 'Continuous', channel: 'Searchable runbooks' },
  }), []);

  useEffect(() => {
    if (phase !== 'running') return undefined;

    const steps = scenario.steps;
    const nextIndex = stepIndex + 1;
    if (nextIndex >= steps.length) {
      setPhase('done');
      return undefined;
    }

    const timer = setTimeout(() => {
      const step = steps[nextIndex];
      setCompletedNodes(prev => new Set([...prev, step.node]));
      setLog(prev => [
        { loop: activeLoop, node: step.node, detail: step.detail, ts: Date.now() },
        ...prev,
      ].slice(0, 12));
      setStepIndex(nextIndex);
    }, stepIndex < 0 ? 400 : 1200);

    return () => clearTimeout(timer);
  }, [phase, stepIndex, scenario.steps, activeLoop]);

  function reset() {
    setPhase('idle');
    setStepIndex(-1);
    setCompletedNodes(new Set());
    setLog([]);
    setWorkflowRun(null);
    setWorkflowLoading(false);
  }

  function selectLoop(loopId) {
    setActiveLoop(loopId);
    reset();
  }

  async function kickOffWorkflow() {
    setWorkflowLoading(true);
    try {
      const result = await runWorkflow({
        workflowId: 'wf-core-latency-remediation',
        anomalyId: 'IR-PROACTIVE-001',
        regionId: 'REG-8847291',
      });
      setWorkflowRun(result);
      setLog(prev => [
        {
          loop: WORKFLOW_LOOP,
          node: 'orchestrator',
          detail: result?.kibanaExecutionId
            ? `Elastic Workflow started — execution ${String(result.kibanaExecutionId).slice(0, 8)}…`
            : result?.kibanaRunError
              ? `Workflow trigger attempted — ${result.kibanaRunError}`
              : result?.message || 'Elastic Workflow triggered from proactive loop.',
          ts: Date.now(),
          href: result?.kibanaExecutionUrl || result?.kibanaWorkflowUrl || null,
        },
        ...prev,
      ].slice(0, 12));
    } catch (err) {
      setWorkflowRun({ ok: false, error: err.message });
      setLog(prev => [
        {
          loop: WORKFLOW_LOOP,
          node: 'orchestrator',
          detail: `Workflow trigger failed — ${err.message}`,
          ts: Date.now(),
        },
        ...prev,
      ].slice(0, 12));
    } finally {
      setWorkflowLoading(false);
    }
  }

  function runSimulation() {
    setCompletedNodes(new Set());
    setLog([]);
    setWorkflowRun(null);
    setPhase('running');
    setStepIndex(-1);
    if (activeLoop === WORKFLOW_LOOP) {
      void kickOffWorkflow();
    }
  }

  const highlightedCount = nodesForLoop(activeLoop).size;

  return (
    <div>
      <ModuleHeader
        title="Incident response"
        subtitle="Reactive, proactive, and knowledge loops on Elastic Serverless."
      >
        <button type="button" onClick={reset} className="btn-quiet flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4" /> Reset
        </button>
        <ElasticDeepLinks
          links={[
            { href: workflowsUrl, label: 'Workflows', primary: true },
            { href: o11yDashboardUrl, label: 'Dashboard' },
            { href: discoverUrl, label: 'Discover' },
          ]}
        />
      </ModuleHeader>

      <div className="grid lg:grid-cols-3 gap-2 mb-4">
        {LOOP_ORDER.map(loopId => {
          const loop = LOOPS[loopId];
          const selected = activeLoop === loopId;
          return (
            <button
              key={loopId}
              type="button"
              onClick={() => selectLoop(loopId)}
              className={`text-left rounded-xl border p-3 transition-all ${
                selected ? 'ring-2 bg-white shadow-sm' : 'bg-white/70 hover:bg-white border-gray-200'
              }`}
              style={{ borderColor: selected ? loop.color : undefined, ringColor: selected ? loop.color : undefined }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: loop.color }} />
                <span className="text-sm font-semibold text-elastic-dark">{loop.label}</span>
              </div>
              <p className="text-xs text-elastic-gray leading-snug">{loop.description}</p>
              <p className="text-[10px] text-elastic-gray mt-2">
                SLA target: <strong className="text-elastic-dark">{loopStats[loopId].sla}</strong>
                {' · '}{loopStats[loopId].channel}
                {loopId === WORKFLOW_LOOP && (
                  <span className="ml-1 text-elastic-teal font-semibold">· kicks off Workflow</span>
                )}
              </p>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-elastic-teal mb-1">
              Scenario · {loopMeta.label}
            </p>
            <h3 className="text-base font-semibold text-elastic-dark">{scenario.title}</h3>
            <p className="text-sm text-elastic-gray mt-1">{scenario.trigger}</p>
          </div>
          <button
            type="button"
            onClick={runSimulation}
            disabled={phase === 'running'}
            className="shrink-0 text-sm px-4 py-2 rounded-lg text-white flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: loopMeta.color }}
          >
            {phase === 'running'
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Running…</>
              : activeLoop === WORKFLOW_LOOP
                ? <><Workflow className="w-4 h-4" /> Run + Workflow</>
                : <><Play className="w-4 h-4" /> Run simulation</>}
          </button>
        </div>

        <IncidentResponseDiagram
          activeLoop={activeLoop}
          activeNode={activeNode}
          completedNodes={completedNodes}
        />

        <p className="text-xs text-elastic-gray mt-3">
          Highlighting <strong className="text-elastic-dark">{highlightedCount}</strong> components in the{' '}
          <span style={{ color: loopMeta.color }}>{loopMeta.label.toLowerCase()}</span>.
          Names are generic — no production customer identifiers.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-elastic-dark flex items-center gap-2 mb-3">
            <Bot className="w-4 h-4 text-elastic-teal" />
            Simulation log
          </h3>
          {log.length === 0 ? (
            <p className="text-sm text-elastic-gray">Select a loop and run the simulation to trace the flow.</p>
          ) : (
            <ul className="space-y-2">
              {log.map(entry => (
                <li key={entry.ts} className="text-xs border-b border-gray-100 pb-2 last:border-0">
                  <span
                    className="font-semibold uppercase tracking-wide text-[10px]"
                    style={{ color: LOOPS[entry.loop]?.color }}
                  >
                    {LOOPS[entry.loop]?.label}
                  </span>
                  <p className="text-elastic-dark font-medium mt-0.5">{entry.detail}</p>
                  {entry.href && (
                    <a
                      href={entry.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-elastic-teal mt-1 hover:underline"
                    >
                      Open execution <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
          {workflowLoading && (
            <p className="text-xs text-elastic-gray mt-2 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Starting Elastic Workflow on Search…
            </p>
          )}
          {phase === 'done' && (
            <>
              <div className="mt-3 p-3 rounded-lg bg-success/5 border border-success/20 text-sm text-elastic-dark">
                <strong>Outcome:</strong> {scenario.outcome}
                {activeLoop === WORKFLOW_LOOP && executionUrl && (
                  <a
                    href={executionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-elastic-teal hover:underline"
                  >
                    <Workflow className="w-3.5 h-3.5" />
                    {workflowRun?.kibanaExecutionId ? 'View live workflow execution' : 'Open workflow in Elastic'}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <P1IncidentCounter
                compact
                context={
                  activeLoop === 'reactive'
                    ? 'Reactive loop — subscriber status in <90s, outage churn risk contained'
                    : activeLoop === 'proactive'
                      ? 'Proactive loop — Elastic Workflow auto-remediation started before customer-facing P1'
                      : 'Knowledge loop — faster resolution on repeat incidents'
                }
                showMttr={activeLoop !== 'knowledge'}
                className="mt-3"
              />
            </>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-elastic-light p-4">
          <h3 className="text-sm font-semibold text-elastic-dark mb-3">Elastic mapping (conceptual)</h3>
          <dl className="space-y-3 text-xs">
            <div>
              <dt className="font-semibold text-elastic-teal">Reactive loop</dt>
              <dd className="text-elastic-gray mt-0.5">
                OTel traces + logs on otel-demo · subscriber context in session cache · status via workflow webhook.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-elastic-teal">Proactive loop</dt>
              <dd className="text-elastic-gray mt-0.5">
                Kibana alerting + Elastic Workflows on Search · Run simulation starts{' '}
                <code className="text-[10px]">telco-core-latency-auto-remediation</code> · cases and counters in observability.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-elastic-teal">Knowledge loop</dt>
              <dd className="text-elastic-gray mt-0.5">
                Gen-AI metrics → triage queue · operator notes → runbooks in Enterprise Search · orchestrator retrieval on next incident.
              </dd>
            </div>
          </dl>
          <p className="text-[10px] text-elastic-gray mt-4 leading-relaxed">
            This tab illustrates a reference architecture for telco incident response. Component labels are intentionally
            anonymized for demo and pre-sales use.
          </p>
        </section>
      </div>
    </div>
  );
}

export default IncidentResponseDemo;
