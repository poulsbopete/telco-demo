import { TrendingDown, Clock, HardDrive, Users } from 'lucide-react';
import {
  computeP1Outcomes,
  EXECUTIVE_DISCLAIMER,
  streamsRetentionSavings,
} from '../../lib/executive-outcomes';

const TILES = [
  {
    id: 'p1',
    icon: TrendingDown,
    label: 'P1 incidents',
    accent: 'text-success',
    bg: 'bg-success/5 border-success/20',
  },
  {
    id: 'mttr',
    icon: Clock,
    label: 'MTTR',
    accent: 'text-elastic-teal',
    bg: 'bg-elastic-teal/5 border-elastic-teal/20',
  },
  {
    id: 'tco',
    icon: HardDrive,
    label: 'Observability TCO',
    accent: 'text-elastic-teal',
    bg: 'bg-elastic-teal/5 border-elastic-teal/20',
  },
  {
    id: 'churn',
    icon: Users,
    label: 'Churn protection',
    accent: 'text-telco-magenta',
    bg: 'bg-telco-magenta/5 border-telco-magenta/20',
  },
];

export function ExecutiveOutcomesBanner({ compact = false, className = '' }) {
  const p1 = computeP1Outcomes();
  const streams = streamsRetentionSavings();

  const values = {
    p1: `${p1.reductionPct}% fewer P1/mo`,
    mttr: `${p1.mttrBeforeHours}h → ${p1.mttrAfterMinutes}m`,
    tco: `${streams.savingsLowPct}–${streams.savingsHighPct}% storage savings`,
    churn: 'Impact-prioritized ops',
  };

  const details = {
    p1: `${p1.baseline} → ${p1.after} incidents · self-healing workflows`,
    mttr: 'AI agents + declarative remediation',
    tco: 'Streams sampling · ES|QL aggregation',
    churn: 'regionID · SLA · subscriber segments',
  };

  return (
    <div className={`rounded-xl border border-gray-200 bg-gradient-to-r from-white to-elastic-light/80 ${className}`}>
      <div className={`px-4 ${compact ? 'py-3' : 'py-4'} border-b border-gray-100`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-telco-magenta">
              Executive outcomes
            </p>
            {!compact && (
              <p className="text-sm text-elastic-dark mt-0.5 font-medium">
                AI-powered observability for communications service providers
              </p>
            )}
          </div>
          <p className="text-[10px] text-elastic-gray max-w-md">{EXECUTIVE_DISCLAIMER}</p>
        </div>
      </div>

      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-2 ${compact ? 'p-3' : 'p-4'}`}>
        {TILES.map(tile => {
          const Icon = tile.icon;
          return (
            <div key={tile.id} className={`rounded-lg border p-3 ${tile.bg}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-3.5 h-3.5 ${tile.accent}`} />
                <p className="text-[10px] font-semibold uppercase tracking-wide text-elastic-gray">{tile.label}</p>
              </div>
              <p className={`text-sm font-bold text-elastic-dark ${compact ? '' : 'text-base'}`}>
                {values[tile.id]}
              </p>
              <p className="text-[10px] text-elastic-gray mt-1 leading-snug">{details[tile.id]}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ExecutiveOutcomesBanner;
