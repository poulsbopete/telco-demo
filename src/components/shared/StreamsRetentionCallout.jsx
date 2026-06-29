import { useMemo, useState } from 'react';
import { Database, Sparkles } from 'lucide-react';
import {
  formatUsd,
  streamsRetentionSavings,
} from '../../lib/executive-outcomes';

export function StreamsRetentionCallout({
  fullRetentionCostMonthly = 1_240_000,
  className = '',
}) {
  const [anomalyBoost, setAnomalyBoost] = useState(true);

  const streams = useMemo(
    () => streamsRetentionSavings({ fullRetentionCostMonthly }),
    [fullRetentionCostMonthly],
  );

  const optimizedCost = anomalyBoost ? streams.optimizedHigh : streams.optimizedLow;
  const savingsPct = anomalyBoost ? streams.savingsHighPct : streams.savingsLowPct;
  const savingsUsd = streams.fullRetentionCostMonthly - optimizedCost;

  return (
    <div className={`rounded-xl border border-elastic-teal/25 bg-gradient-to-br from-elastic-teal/5 to-white overflow-hidden ${className}`}>
      <div className="px-4 py-3 border-b border-elastic-teal/15 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-elastic-dark flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-elastic-teal" />
            Kibana Streams · intelligent retention
          </p>
          <p className="text-[10px] text-elastic-gray mt-1 max-w-xl">
            AI workflows score anomaly and risk to decide full-resolution vs sampled signals —
            device interfaces, routing protocols, subscriber sessions, and service metrics at telco scale.
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wide text-elastic-teal shrink-0">
          TCO lever
        </span>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-white border border-gray-200">
            <p className="text-[10px] text-elastic-gray uppercase">Blanket retention</p>
            <p className="text-lg font-bold text-elastic-dark tabular-nums">
              {formatUsd(streams.fullRetentionCostMonthly)}
              <span className="text-xs font-normal text-elastic-gray">/mo</span>
            </p>
            <p className="text-[10px] text-elastic-gray mt-1">100% full resolution</p>
          </div>
          <div className="p-3 rounded-lg bg-elastic-teal/10 border border-elastic-teal/25">
            <p className="text-[10px] text-elastic-teal uppercase font-semibold">Streams optimized</p>
            <p className="text-lg font-bold text-elastic-teal tabular-nums">
              {formatUsd(optimizedCost)}
              <span className="text-xs font-normal text-elastic-gray">/mo</span>
            </p>
            <p className="text-[10px] text-elastic-gray mt-1">
              {streams.fullResolutionSignalsPct}% full · {streams.sampledSignalsPct}% intelligently sampled
            </p>
          </div>
          <div className="p-3 rounded-lg bg-success/5 border border-success/25">
            <p className="text-[10px] text-success uppercase font-semibold">Estimated savings</p>
            <p className="text-lg font-bold text-success tabular-nums">
              {savingsPct}%
            </p>
            <p className="text-[10px] text-elastic-gray mt-1">
              {formatUsd(savingsUsd)}/mo · ES|QL aggregation for rollups
            </p>
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-elastic-dark cursor-pointer">
          <input
            type="checkbox"
            checked={anomalyBoost}
            onChange={e => setAnomalyBoost(e.target.checked)}
            className="accent-elastic-teal"
          />
          <Database className="w-3.5 h-3.5 text-elastic-teal" />
          Boost retention on anomaly-scored signals (high-cardinality interfaces &amp; sessions)
        </label>

        <p className="text-[10px] text-elastic-gray">
          Illustrative {streams.savingsLowPct}–{streams.savingsHighPct}% storage reduction for high-cardinality telco metrics.
          Pair with Serverless retention pricing below for total TCO narrative.
        </p>
      </div>
    </div>
  );
}

export default StreamsRetentionCallout;
