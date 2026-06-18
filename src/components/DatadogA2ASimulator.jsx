import { useState } from 'react';
import {
  ArrowRight, Bot, CheckCircle2, Loader2, Radio, Server, Zap,
} from 'lucide-react';
import { formatCount, simulateDatadogA2A } from '../lib/elastic-api';

const METRICS_COLOR = '#6b2c91';

export function DatadogA2ASimulator({ regionId, regionName, onComplete, compact = false }) {
  const [phase, setPhase] = useState('idle'); // idle | running | done
  const [a2aData, setA2aData] = useState(null);
  const [visibleStep, setVisibleStep] = useState(0);
  const [error, setError] = useState(null);

  async function runA2A() {
    setPhase('running');
    setA2aData(null);
    setVisibleStep(0);
    setError(null);

    const steps = ['discover', 'send', 'wait', 'receive', 'synthesize'];
    for (let i = 0; i < steps.length - 1; i++) {
      setVisibleStep(i);
      await new Promise(r => setTimeout(r, 350));
    }

    try {
      const data = await simulateDatadogA2A({ regionId, regionName, taskType: 'investigate_latency' });
      if (!data.ok) throw new Error(data.error || 'A2A call failed');
      setA2aData(data);
      setVisibleStep(steps.length - 1);
      setPhase('done');
      onComplete?.(data);
    } catch (err) {
      setError(err.message);
      setPhase('idle');
    }
  }

  const metrics = a2aData?.response?.result?.artifacts?.find(a => a.artifactId === 'metrics-bundle')?.parts?.[0]?.data;
  const traces = a2aData?.response?.result?.artifacts?.find(a => a.artifactId === 'traces-bundle')?.parts?.[0]?.data;
  const summary = a2aData?.response?.result?.artifacts?.find(a => a.artifactId === 'ai-summary')?.parts?.[0]?.text;

  if (compact && phase === 'idle' && !a2aData) {
    return (
      <button type="button" onClick={runA2A}
        className="w-full py-2 border-2 border-dashed rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors"
        style={{ borderColor: METRICS_COLOR, color: METRICS_COLOR }}>
        <Radio className="w-4 h-4" />
        Query external metrics via A2A
      </button>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden" style={{ borderColor: `${METRICS_COLOR}40` }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: `${METRICS_COLOR}10` }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: METRICS_COLOR }}>M</div>
          <div>
            <p className="text-sm font-semibold text-elastic-dark">External Metrics A2A Call</p>
            <p className="text-[10px] text-elastic-gray">Google Agent2Agent Protocol v0.2 · existing metrics stack</p>
          </div>
        </div>
        {phase === 'idle' && (
          <button type="button" onClick={runA2A}
            className="text-xs px-3 py-1.5 text-white rounded-lg flex items-center gap-1"
            style={{ backgroundColor: METRICS_COLOR }}>
            <Radio className="w-3 h-3" /> Invoke A2A
          </button>
        )}
        {phase === 'running' && (
          <span className="text-xs flex items-center gap-1" style={{ color: METRICS_COLOR }}>
            <Loader2 className="w-3 h-3 animate-spin" /> Delegating…
          </span>
        )}
        {phase === 'done' && (
          <span className="text-xs text-success flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {a2aData?.timing?.a2aRoundTripMs}ms
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {error && <p className="text-xs text-danger">{error}</p>}

        {/* Agent flow */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-elastic-teal/10 text-elastic-teal">
            <Bot className="w-3 h-3" /> Elastic Agent
          </div>
          <ArrowRight className="w-3 h-3 text-elastic-gray" />
          <span className="text-[10px] text-elastic-gray font-mono">A2A message/send</span>
          <ArrowRight className="w-3 h-3 text-elastic-gray" />
          <div className="flex items-center gap-1 px-2 py-1 rounded text-white" style={{ backgroundColor: METRICS_COLOR }}>
            <Server className="w-3 h-3" /> Metrics Agent
          </div>
        </div>

        {phase === 'running' && (
          <div className="space-y-1 text-[10px] text-elastic-gray font-mono">
            {['Discovering Agent Card…', 'Sending tasks/send…', 'Querying metrics + traces…', 'Receiving artifacts…'].map((s, i) => (
              <p key={s} className={visibleStep >= i ? 'text-elastic-dark' : 'opacity-40'}>
                {visibleStep > i ? '✓' : visibleStep === i ? '→' : '·'} {s}
              </p>
            ))}
          </div>
        )}

        {a2aData && (
          <>
            {/* Request snippet */}
            <div className="bg-gray-900 rounded-lg p-3 text-[10px] font-mono text-green-400 overflow-x-auto">
              <p className="text-gray-500 mb-1">// A2A Request</p>
              <p>{a2aData.request.method} → {a2aData.request.metadata.to.name}</p>
              <p className="text-gray-300 mt-1 truncate">{a2aData.request.params.message.parts[0].text}</p>
            </div>

            {/* Metrics from external agent */}
            {metrics && (
              <div>
                <p className="text-xs font-semibold text-elastic-dark mb-2">External Metrics (15m)</p>
                <div className="grid grid-cols-2 gap-2">
                  {metrics.series.slice(0, 4).map(m => (
                    <div key={m.metric} className="p-2 bg-gray-50 rounded text-[10px]">
                      <p className="text-elastic-gray truncate">{m.metric.split('.').slice(-2).join('.')}</p>
                      <p className="font-bold text-elastic-dark">{m.value}{m.unit === 'percent' ? '%' : m.unit === 'ms' ? 'ms' : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Traces from external agent */}
            {traces && (
              <div>
                <p className="text-xs font-semibold text-elastic-dark mb-2">
                  External APM — {formatCount(traces.count)} traces
                </p>
                {traces.traces.slice(0, 2).map(t => (
                  <div key={t.trace_id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-[10px] mb-1">
                    <span className={`font-bold ${t.status === 'error' ? 'text-danger' : 'text-success'}`}>{t.status}</span>
                    <span className="flex-1 truncate font-mono">{t.resource}</span>
                    <span className="text-elastic-gray">{t.duration_ms}ms</span>
                  </div>
                ))}
                {traces.slowest_span && (
                  <p className="text-[10px] text-danger mt-1">
                    Critical path: {traces.slowest_span.name} ({traces.slowest_span.duration_ms}ms)
                  </p>
                )}
              </div>
            )}

            {/* External agent summary */}
            {summary && (
              <div className="p-3 rounded-lg border" style={{ backgroundColor: `${METRICS_COLOR}08`, borderColor: `${METRICS_COLOR}30` }}>
                <p className="text-[10px] font-semibold mb-1" style={{ color: METRICS_COLOR }}>Metrics Agent Response</p>
                <p className="text-xs text-elastic-dark">{summary}</p>
              </div>
            )}

            {/* Elastic synthesis */}
            {a2aData.elasticSynthesis && (
              <div className="p-3 bg-elastic-teal/5 border border-elastic-teal/20 rounded-lg">
                <p className="text-[10px] font-semibold text-elastic-teal flex items-center gap-1 mb-1">
                  <Zap className="w-3 h-3" /> Elastic Agent — Unified Synthesis
                </p>
                <p className="text-xs text-elastic-dark">{a2aData.elasticSynthesis.summary}</p>
                <p className="text-[10px] text-elastic-gray mt-1">{a2aData.elasticSynthesis.nextStep}</p>
              </div>
            )}

            <p className="text-[10px] text-elastic-gray italic">{a2aData.narrative}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default DatadogA2ASimulator;
