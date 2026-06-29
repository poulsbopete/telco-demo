import { ArrowRight, CheckCircle2, TrendingDown } from 'lucide-react';
import { computeP1Outcomes } from '../../lib/executive-outcomes';

export function P1IncidentCounter({
  compact = false,
  context = 'Self-healing workflow completed',
  showMttr = true,
  className = '',
}) {
  const p1 = computeP1Outcomes();
  const resolved = true;

  if (!resolved) return null;

  return (
    <div className={`rounded-lg border border-success/30 bg-success/5 overflow-hidden ${className}`}>
      <div className="px-3 py-2 bg-success/10 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-success flex items-center gap-1.5">
          <TrendingDown className="w-3.5 h-3.5" />
          P1 incident impact · illustrative
        </p>
        <span className="text-[10px] text-success flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Modeled reduction
        </span>
      </div>

      <div className={`${compact ? 'p-3' : 'p-4'} space-y-3`}>
        <p className="text-[10px] text-elastic-gray">{context}</p>

        <div className="flex items-center justify-center gap-3">
          <div className="text-center">
            <p className="text-[10px] uppercase text-elastic-gray">Before</p>
            <p className={`font-bold text-danger tabular-nums ${compact ? 'text-xl' : 'text-2xl'}`}>
              {p1.baseline}
            </p>
            <p className="text-[10px] text-elastic-gray">P1 / month</p>
          </div>

          <ArrowRight className="w-5 h-5 text-success shrink-0" />

          <div className="text-center">
            <p className="text-[10px] uppercase text-elastic-gray">After</p>
            <p className={`font-bold text-success tabular-nums ${compact ? 'text-xl' : 'text-2xl'}`}>
              {p1.after}
            </p>
            <p className="text-[10px] text-elastic-gray">P1 / month</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 rounded bg-white border border-success/20">
            <p className="text-lg font-bold text-success tabular-nums">−{p1.reductionPct}%</p>
            <p className="text-[10px] text-elastic-gray">{p1.prevented} incidents prevented</p>
          </div>
          {showMttr && (
            <div className="p-2 rounded bg-white border border-elastic-teal/20">
              <p className="text-lg font-bold text-elastic-teal tabular-nums">
                {p1.mttrBeforeHours}h → {p1.mttrAfterMinutes}m
              </p>
              <p className="text-[10px] text-elastic-gray">MTTR with AI workflows</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default P1IncidentCounter;
