import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DOMAIN_LABELS } from '../../lib/ml-signal-intelligence';

function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

function DomainBadge({ domain }) {
  const label = DOMAIN_LABELS[domain] || domain;
  return (
    <span className="text-[11px] text-[#86868b]">{label}</span>
  );
}

function SignalFunnel({ funnel }) {
  const steps = [
    { label: 'Threshold', value: funnel.rawThresholdAlerts },
    { label: 'ML scored', value: funnel.mlScored },
    { label: 'Correlated', value: funnel.correlatedActionable },
    { label: 'Actionable', value: funnel.actionableNow },
  ];

  return (
    <div className="py-4 border-y border-[#d2d2d7]/60">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[12px] text-[#86868b]">Signal filtering</p>
        <p className="text-[12px] text-[#1d1d1f] font-medium">−{funnel.noiseReductionPct}% noise</p>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {steps.map(step => (
          <div key={step.label} className="text-center">
            <p className="text-[21px] font-semibold tracking-tight text-[#1d1d1f] tabular-nums">
              {formatCount(step.value)}
            </p>
            <p className="text-[11px] text-[#86868b] mt-1">{step.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MlSignalIntelligence({
  intelligence,
  anomalies = [],
  selectedAnomalyId,
  onSelectAnomaly,
  compact = false,
  showFunnel = true,
  showJobs = false,
  showSuppressed = false,
  showAnomalies = true,
  className = '',
}) {
  const [suppressedOpen, setSuppressedOpen] = useState(false);

  if (!intelligence) return null;

  const { funnel, mlJobs, suppressedExamples, correlationWindow, proactiveAvgLeadMin } = intelligence;

  return (
    <div className={`${className}`}>
      <div className="mb-1">
        <h3 className="text-[17px] font-semibold text-[#1d1d1f]">ML anomalies</h3>
        <p className="text-[13px] text-[#86868b] mt-1">
          {correlationWindow} · ~{proactiveAvgLeadMin}m lead time
        </p>
      </div>

      {showFunnel && <SignalFunnel funnel={funnel} />}

      {showJobs && mlJobs?.length > 0 && (
        <div className="flex flex-wrap gap-2 py-3">
          {mlJobs.slice(0, compact ? 3 : 5).map(job => (
            <span key={job.id} className="text-[11px] text-[#86868b]">
              {job.label}
              {job.lastScore != null && ` · ${(job.lastScore * 100).toFixed(0)}`}
            </span>
          ))}
        </div>
      )}

      {showAnomalies && anomalies.length > 0 && (
        <div className={`space-y-2 ${showFunnel ? 'pt-4' : 'pt-2'}`}>
          {anomalies.map(a => {
            const selected = selectedAnomalyId === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => onSelectAnomaly?.(a)}
                className={`w-full text-left p-4 rounded-2xl transition-colors ${
                  selected
                    ? 'bg-[#0071e3]/8 ring-1 ring-[#0071e3]/30'
                    : 'bg-[#f5f5f7] hover:bg-[#ebebed]'
                } ${onSelectAnomaly ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <DomainBadge domain={a.domain} />
                      {a.status === 'watching' && (
                        <span className="text-[11px] text-[#86868b]">· watching</span>
                      )}
                    </div>
                    <p className="text-[14px] font-medium text-[#1d1d1f]">{a.title}</p>
                    <p className="text-[12px] text-[#86868b] mt-1">{a.regionName}</p>
                  </div>
                  <span className="text-[17px] font-semibold tabular-nums text-[#1d1d1f] shrink-0">
                    {(a.mlScore * 100).toFixed(0)}
                  </span>
                </div>
                <p className="text-[12px] text-[#86868b] mt-2 line-clamp-2">{a.signal}</p>
              </button>
            );
          })}
        </div>
      )}

      {showSuppressed && suppressedExamples?.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setSuppressedOpen(v => !v)}
            className="w-full py-2 flex items-center justify-between text-[12px] text-[#86868b] hover:text-[#1d1d1f]"
          >
            <span>{formatCount(funnel.suppressedNoise)} suppressed alerts</span>
            {suppressedOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {suppressedOpen && (
            <ul className="space-y-2 pt-2">
              {suppressedExamples.map(ex => (
                <li key={ex.reason} className="flex justify-between gap-3 text-[12px] text-[#86868b]">
                  <span>{ex.reason}</span>
                  <span className="shrink-0 tabular-nums">{ex.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default MlSignalIntelligence;
