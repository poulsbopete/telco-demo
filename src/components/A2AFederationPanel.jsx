import { useState, useEffect } from 'react';
import {
  Bot, CheckCircle2, ExternalLink, Loader2, Network, Radio, Search, Shield, Server,
} from 'lucide-react';
import { CHECKOUT_INCIDENT } from '../lib/demo-incident';
import { FEDERATION_ARCHITECTURE } from '../utils/cost-calculator';
import {
  simulateA2AFederation,
  simulateDatadogA2A,
  simulateElasticSearchA2A,
  simulateElasticSecurityA2A,
  getSearchKibanaUrl,
  kibanaSearchHomeUrl,
  getSecurityKibanaUrl,
  kibanaSecurityUrl,
} from '../lib/elastic-api';

const AGENTS = {
  metrics: { label: 'Metrics', icon: Server, color: '#6b2c91', invoke: simulateDatadogA2A, taskType: 'investigate_latency' },
  security: { label: 'Security', icon: Shield, color: '#E04E39', invoke: simulateElasticSecurityA2A, taskType: 'correlate_incident' },
  search: { label: 'Search', icon: Search, color: '#0077CC', invoke: simulateElasticSearchA2A, taskType: 'fetch_runbooks' },
};

function securityCasesUrl(data) {
  const caseBundle = data?.response?.result?.artifacts?.find(a => a.artifactId === 'case-bundle')?.parts?.[0]?.data;
  return caseBundle?.kibanaUrl || data?.elasticSynthesis?.casesUrl || kibanaSecurityUrl(getSecurityKibanaUrl(), 'cases');
}

function runbookUrl(data) {
  const runbooks = data?.response?.result?.artifacts?.find(a => a.artifactId === 'runbooks')?.parts?.[0]?.data;
  return runbooks?.documents?.[0]?.url || data?.elasticSynthesis?.topRunbookUrl || null;
}

function headline(target, data) {
  const text = data?.response?.result?.artifacts?.find(a => a.artifactId === 'ai-summary')?.parts?.[0]?.text;
  if (text) return text.length > 120 ? `${text.slice(0, 117)}…` : text;
  return null;
}

function AgentChip({ target, data, active, onClick, disabled }) {
  const cfg = AGENTS[target];
  const Icon = cfg.icon;
  const done = Boolean(data);

  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="flex-1 min-w-0 p-2 rounded-lg border text-left disabled:opacity-50 transition-colors"
      style={{ borderColor: done || active ? cfg.color : '#e5e7eb', backgroundColor: done ? `${cfg.color}08` : 'white' }}>
      <div className="flex items-center gap-1 mb-1">
        <Icon className="w-3 h-3 shrink-0" style={{ color: cfg.color }} />
        <span className="text-[10px] font-semibold truncate" style={{ color: cfg.color }}>{cfg.label}</span>
        {active && <Loader2 className="w-3 h-3 animate-spin ml-auto" style={{ color: cfg.color }} />}
        {done && !active && <CheckCircle2 className="w-3 h-3 text-success ml-auto" />}
      </div>
      {done ? (
        <p className="text-[10px] text-elastic-dark line-clamp-2">{headline(target, data)}</p>
      ) : (
        <p className="text-[10px] text-elastic-gray">A2A message/send</p>
      )}
    </button>
  );
}

export function A2AFederationPanel({ regionId, regionName, compact = false, autoRun = false, onComplete }) {
  const [phase, setPhase] = useState('idle');
  const [activeTarget, setActiveTarget] = useState(null);
  const [results, setResults] = useState({});
  const [synthesis, setSynthesis] = useState(null);
  const [error, setError] = useState(null);

  async function invokeAll() {
    setPhase('running');
    setError(null);
    setResults({});
    setSynthesis(null);
    try {
      const data = await simulateA2AFederation({ regionId, regionName });
      if (!data.ok) throw new Error(data.error || 'Federation failed');
      setResults(data.calls || {});
      setSynthesis(data.orchestratorSynthesis);
      setPhase('done');
      onComplete?.(data);
    } catch (err) {
      setError(err.message);
      setPhase('idle');
    }
  }

  async function invokeTarget(target) {
    const cfg = AGENTS[target];
    setActiveTarget(target);
    setPhase('running');
    setError(null);
    try {
      const data = await cfg.invoke({ regionId, regionName, taskType: cfg.taskType });
      if (!data.ok) throw new Error(data.error || 'A2A failed');
      setResults(prev => ({ ...prev, [target]: data }));
      setPhase('done');
      onComplete?.({ target, data });
    } catch (err) {
      setError(err.message);
      setPhase('idle');
    } finally {
      setActiveTarget(null);
    }
  }

  useEffect(() => {
    if (autoRun && phase === 'idle' && !Object.keys(results).length) {
      invokeAll();
    }
  }, [autoRun]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasResults = Object.keys(results).length > 0;
  const searchKibanaUrl = getSearchKibanaUrl();
  const searchHomeLink = kibanaSearchHomeUrl(searchKibanaUrl);
  const securityAlertsLink = kibanaSecurityUrl(getSecurityKibanaUrl(), 'alerts');
  const topRunbookLink = runbookUrl(results.search);
  const securityCaseLink = securityCasesUrl(results.security);

  return (
    <div className={`border border-elastic-teal/25 rounded-xl overflow-hidden ${compact ? '' : 'bg-white'}`}>
      <div className={`px-3 py-2 flex items-center justify-between gap-2 ${compact ? 'bg-elastic-teal/5' : 'border-b border-gray-100'}`}>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-elastic-dark flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-elastic-teal shrink-0" />
            A2A Federation
            <span className="font-mono font-normal text-elastic-gray truncate">{CHECKOUT_INCIDENT.traceId}</span>
          </p>
        </div>
        {phase !== 'running' && (
          <div className="flex items-center gap-2 shrink-0">
            {securityAlertsLink && (
              <a
                href={securityAlertsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] px-2 py-1 rounded border border-danger/30 text-danger hover:bg-danger/10 flex items-center gap-1"
              >
                Security <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {searchHomeLink && (
              <a
                href={searchHomeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] px-2 py-1 rounded border border-elastic-teal/30 text-elastic-teal hover:bg-elastic-teal/10 flex items-center gap-1"
              >
                Search <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button type="button" onClick={invokeAll}
              className="text-[10px] px-2 py-1 bg-elastic-teal text-white rounded flex items-center gap-1">
              <Radio className="w-3 h-3" /> {hasResults ? 'Re-run' : 'Invoke all'}
            </button>
          </div>
        )}
        {phase === 'running' && !activeTarget && (
          <Loader2 className="w-4 h-4 animate-spin text-elastic-teal shrink-0" />
        )}
      </div>

      <div className="p-3 space-y-2">
        {error && <p className="text-[10px] text-danger">{error}</p>}

        <div className="flex gap-2">
          {Object.keys(AGENTS).map(target => (
            <AgentChip
              key={target}
              target={target}
              data={results[target]}
              active={activeTarget === target}
              disabled={phase === 'running'}
              onClick={() => invokeTarget(target)}
            />
          ))}
        </div>

        {synthesis && (
          <div className="p-2 bg-elastic-teal/5 rounded-lg text-[10px]">
            <p className="font-semibold text-elastic-teal flex items-center gap-1 mb-0.5">
              <Bot className="w-3 h-3" /> Orchestrator
            </p>
            <p className="text-elastic-dark">{synthesis.summary}</p>
          </div>
        )}

        {topRunbookLink && (
          <a
            href={topRunbookLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-elastic-teal hover:underline flex items-center gap-1"
          >
            Open top runbook in Search <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {securityCaseLink && (
          <a
            href={securityCaseLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-danger hover:underline flex items-center gap-1"
          >
            Open SOC case in Security <ExternalLink className="w-3 h-3" />
          </a>
        )}

        <p className="text-[10px] text-elastic-gray leading-relaxed pt-1 border-t border-gray-100">
          <strong className="text-elastic-dark">Why A2A:</strong> {FEDERATION_ARCHITECTURE.todayDetail}
          {' '}CCS Self-Managed ↔ Serverless ({FEDERATION_ARCHITECTURE.ccsRoadmapEta}) is not available for this pattern today.
        </p>
      </div>
    </div>
  );
}

export default A2AFederationPanel;
