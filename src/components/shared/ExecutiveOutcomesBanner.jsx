import {
  computeP1Outcomes,
  EXECUTIVE_DISCLAIMER,
  streamsRetentionSavings,
} from '../../lib/executive-outcomes';

const METRICS = [
  { id: 'p1', label: 'P1 incidents', key: 'p1' },
  { id: 'mttr', label: 'MTTR', key: 'mttr' },
  { id: 'tco', label: 'Observability TCO', key: 'tco' },
  { id: 'churn', label: 'Customer impact', key: 'churn' },
];

export function ExecutiveOutcomesBanner({ compact = false, className = '' }) {
  const p1 = computeP1Outcomes();
  const streams = streamsRetentionSavings();

  const values = {
    p1: `${p1.reductionPct}% fewer per month`,
    mttr: `${p1.mttrBeforeHours}h → ${p1.mttrAfterMinutes}m`,
    tco: `${streams.savingsLowPct}–${streams.savingsHighPct}% storage savings`,
    churn: 'Prioritized by region and SLA',
  };

  return (
    <div className={`pt-6 ${className}`}>
      <p className="text-[12px] text-[#86868b] mb-6 max-w-xl">{EXECUTIVE_DISCLAIMER}</p>
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-8 ${compact ? '' : 'md:gap-10'}`}>
        {METRICS.map(metric => (
          <div key={metric.id}>
            <p className="text-[12px] text-[#86868b]">{metric.label}</p>
            <p className="text-[21px] font-semibold tracking-tight text-[#1d1d1f] mt-1">
              {values[metric.key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExecutiveOutcomesBanner;
