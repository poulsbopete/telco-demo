import { AlertTriangle, ShieldCheck, TrendingDown, Users } from 'lucide-react';
import {
  estimateChurnRisk,
  formatSubscriberCount,
  formatUsd,
} from '../../lib/executive-outcomes';

const SEVERITY_STYLE = {
  high: {
    border: 'border-danger/30',
    bg: 'bg-danger/5',
    badge: 'bg-danger/10 text-danger',
    icon: AlertTriangle,
  },
  medium: {
    border: 'border-warning/30',
    bg: 'bg-warning/5',
    badge: 'bg-warning/10 text-warning',
    icon: AlertTriangle,
  },
  low: {
    border: 'border-success/30',
    bg: 'bg-success/5',
    badge: 'bg-success/10 text-success',
    icon: ShieldCheck,
  },
};

export function ChurnRiskTile({
  sessions24h,
  successRate,
  sloStatus,
  sloCurrent,
  sloTarget,
  tier,
  regionName,
  regionId,
  compact = false,
  className = '',
}) {
  const risk = estimateChurnRisk({
    sessions24h,
    successRate,
    sloStatus,
    sloCurrent,
    sloTarget,
    tier,
    regionName,
    regionId,
  });

  const style = SEVERITY_STYLE[risk.severity];
  const Icon = style.icon;

  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} overflow-hidden ${className}`}>
      <div className="px-3 py-2 flex items-center justify-between gap-2 border-b border-black/5">
        <p className="text-xs font-semibold text-elastic-dark flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-telco-magenta" />
          Subscriber churn risk · customer impact
        </p>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${style.badge}`}>
          {risk.severity} exposure
        </span>
      </div>

      <div className={`${compact ? 'p-3' : 'p-4'} space-y-3`}>
        <p className="text-[10px] text-elastic-gray">
          {regionName}
          {regionId && (
            <>
              {' · '}
              <span className="font-mono text-telco-magenta">{regionId}</span>
            </>
          )}
          {' · '}Prioritize remediation where subscriber and revenue impact is highest.
        </p>

        {risk.severity === 'low' ? (
          <div className="flex items-start gap-2 text-xs text-success">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              SLO within target — ~{formatSubscriberCount(risk.activeSubs)} active subscribers monitored.
              Proactive ML + workflows help prevent churn before SLA breach.
            </span>
          </div>
        ) : (
          <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'} gap-2`}>
            <div className="p-2.5 rounded-lg bg-white border border-gray-100">
              <p className="text-[10px] text-elastic-gray uppercase">At risk</p>
              <p className="text-lg font-bold text-danger tabular-nums">
                {formatSubscriberCount(risk.subscribersAtRisk)}
              </p>
              <p className="text-[10px] text-elastic-gray">enterprise & premium subs</p>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-gray-100">
              <p className="text-[10px] text-elastic-gray uppercase">Churn delta</p>
              <p className="text-lg font-bold text-warning tabular-nums">+{risk.churnDeltaPct}%</p>
              <p className="text-[10px] text-elastic-gray">if unresolved 24h</p>
            </div>
            {!compact && (
              <div className="p-2.5 rounded-lg bg-white border border-gray-100 sm:col-span-1 col-span-2">
                <p className="text-[10px] text-elastic-gray uppercase">Revenue exposure</p>
                <p className="text-lg font-bold text-elastic-dark tabular-nums">
                  {formatUsd(risk.monthlyExposureUsd)}
                </p>
                <p className="text-[10px] text-elastic-gray">monthly ARPU at risk</p>
              </div>
            )}
          </div>
        )}

        {risk.severity !== 'low' && (
          <p className="text-[10px] text-elastic-dark flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-success" />
            Self-healing workflows + impact-based prioritization reduce churn-driving outages before care escalation.
          </p>
        )}

        <p className="text-[10px] text-elastic-gray flex items-start gap-1">
          <Icon className="w-3 h-3 shrink-0 mt-0.5" />
          Illustrative model — ties network SLA signals to subscriber segments for executive prioritization.
        </p>
      </div>
    </div>
  );
}

export default ChurnRiskTile;
