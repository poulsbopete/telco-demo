import { useMemo, useState } from 'react';
import { calculateServerlessRetentionCost } from '../../utils/cost-calculator';

function formatVolume(tb) {
  if (tb >= 1024) return `${(tb / 1024).toFixed(1)} PB`;
  return `${tb.toFixed(1)} TB`;
}

export function DataRetentionPolicy({
  logsTBPerDay = 100,
  retentionDays: initialRetentionDays = 90,
  metricsPerMinute = 500,
  spansPerMinute = 1200,
}) {
  const [retentionDays, setRetentionDays] = useState(initialRetentionDays);

  const estimate = useMemo(
    () => calculateServerlessRetentionCost({
      logsTBPerDay,
      retentionDays,
      metricsPerMinute: metricsPerMinute * 1_000_000,
      spansPerMinute: spansPerMinute * 1_000_000,
      tier: 'complete',
    }),
    [logsTBPerDay, retentionDays, metricsPerMinute, spansPerMinute],
  );

  const rows = [
    {
      label: 'Ingest',
      detail: `${formatVolume(estimate.ingestGBPerMonth / 1024)} / 30 days · logs, metrics & traces`,
      rate: `$${estimate.ingestRate}/GB ingested`,
      cost: estimate.ingestCostMonthly,
    },
    {
      label: 'Retention',
      detail: `${formatVolume(estimate.storedTB)} stored · Search AI Lake`,
      rate: `$${estimate.retentionRate}/GB retained / mo`,
      cost: estimate.retentionCostMonthly,
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs text-elastic-gray leading-relaxed">
        <strong className="text-elastic-dark">{estimate.tier}</strong> — unified, searchable retention.
        No hot, warm, or cold tiers; you pay for what you ingest and what you keep.
      </p>

      <div>
        <label className="text-xs text-elastic-gray">
          Retention window: <strong>{retentionDays} days</strong>
        </label>
        <input
          type="range"
          min={7}
          max={365}
          value={retentionDays}
          onChange={e => setRetentionDays(Number(e.target.value))}
          className="w-full accent-elastic-teal mt-1"
        />
      </div>

      <div className="space-y-2">
        {rows.map(row => (
          <div key={row.label} className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-sm text-elastic-dark">{row.label}</p>
                <p className="text-xs text-elastic-gray mt-0.5">{row.detail}</p>
                <p className="text-[10px] text-elastic-teal mt-1">{row.rate}</p>
              </div>
              <p className="text-sm font-semibold text-elastic-dark shrink-0 tabular-nums">
                ${row.cost.toLocaleString()}<span className="text-[10px] font-normal text-elastic-gray">/mo</span>
              </p>
            </div>
          </div>
        ))}

        <div className="p-3 rounded-lg bg-elastic-teal/5 border border-elastic-teal/20 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-elastic-dark">Estimated total</p>
          <p className="text-base font-bold text-elastic-teal tabular-nums">
            ${estimate.totalMonthly.toLocaleString()}<span className="text-xs font-normal text-elastic-gray">/mo</span>
          </p>
        </div>
      </div>

      <p className="text-[10px] text-elastic-gray">
        {estimate.sourceNote}. Effective {estimate.pricingEffective}. Reference pricing from{' '}
        <a
          href={estimate.pricingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-elastic-teal hover:underline"
        >
          Elastic Observability Serverless
        </a>
        . Egress: 50 GB/mo free, then $0.05/GB. Volume estimates assume logs TB/day plus metrics/traces overhead; not an official quote.
      </p>
    </div>
  );
}

export default DataRetentionPolicy;
