import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen, Bot, ExternalLink, Loader2, Play, RefreshCw, Workflow,
} from 'lucide-react';
import { IncidentResponseDiagram } from './IncidentResponseDiagram';
import { ModuleHeader } from './shared/ModuleHeader';
import { P1IncidentCounter } from './shared/P1IncidentCounter';
import {
  LOOPS,
  SCENARIOS,
  nodesForLoop,
} from '../lib/incident-response/architecture';
import {
  elasticWorkflowUrl,
  getSearchKibanaUrl,
  kibanaO11yDashboardUrl,
  kibanaSearchDiscoverUrl,
} from '../lib/elastic-api';

const LOOP_ORDER = ['reactive', 'proactive', 'knowledge'];

export function IncidentResponseDemo() {
  const [activeLoop, setActiveLoop] = useState('reactive');
  const [phase, setPhase] = useState('idle');
  const [stepIndex, setStepIndex] = useState(-1);
  const [completedNodes, setCompletedNodes] = useState(new Set());
  const [log, setLog] = useState([]);

  const scenario = SCENARIOS[activeLoop];
  const loopMeta = LOOPS[activeLoop];
  const kibanaUrl = import.meta.env.VITE_KIBANA_URL;
  const searchKibanaUrl = getSearchKibanaUrl();
  const o11yDashboardUrl = kibanaO11yDashboardUrl(kibanaUrl);
  const searchUrl = kibanaSearchDiscoverUrl(searchKibanaUrl);
  const workflowsUrl = elasticWorkflowUrl(kibanaUrl);

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
  }

  function selectLoop(loopId) {
    setActiveLoop(loopId);
    reset();
  }

  function runSimulation() {
    setCompletedNodes(new Set());
    setLog([]);
    setPhase('running');
    setStepIndex(-1);
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
                </li>
              ))}
            </ul>
          )}
          {phase === 'done' && (
            <>
              <div className="mt-3 p-3 rounded-lg bg-success/5 border border-success/20 text-sm text-elastic-dark">
                <strong>Outcome:</strong> {scenario.outcome}
              </div>
              <P1IncidentCounter
                compact
                context={
                  activeLoop === 'reactive'
                    ? 'Reactive loop — subscriber status in <90s, outage churn risk contained'
                    : activeLoop === 'proactive'
                      ? 'Proactive loop — degradation resolved before customer-facing P1'
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
                Kibana alerting + Elastic Workflows · cases and counters in observability · early warnings in the NOC console.
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
