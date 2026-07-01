import { useMemo } from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { TimeSeriesChart } from './TimeSeriesChart';
import {
  IPHONE_LAUNCH,
  buildLaunchBusinessForecast,
  buildLaunchVolumeSeries,
} from '../../lib/iphone-launch-event';

function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function TrendIcon({ trend }) {
  if (trend === 'surge' || trend === 'peak') return <TrendingUp className="w-3.5 h-3.5 text-[#008009]" />;
  if (trend === 'slowdown') return <TrendingDown className="w-3.5 h-3.5 text-[#bf4800]" />;
  return <Minus className="w-3.5 h-3.5 text-[#86868b]" />;
}

function trendLabel(trend) {
  if (trend === 'peak') return 'Peak';
  if (trend === 'surge') return 'Surge';
  if (trend === 'slowdown') return 'Slowdown';
  return 'Steady';
}

export function LaunchBusinessMetrics({ launchEvent, compact = false, className = '' }) {
  const event = launchEvent || IPHONE_LAUNCH;
  const m = event.metrics || IPHONE_LAUNCH.metrics;
  const forecast = event.businessForecast || buildLaunchBusinessForecast();
  const volumeSeries = useMemo(
    () => event.volumeSeries || buildLaunchVolumeSeries(compact ? 18 : 24, 0),
    [event.volumeSeries, compact],
  );

  const { currentPhase, nextPhase, mlOutlook, business } = forecast;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="py-4 border-y border-[#d2d2d7]/60">
        <p className="text-[12px] text-[#86868b] uppercase tracking-wide">{event.tagline || IPHONE_LAUNCH.tagline}</p>
        <p className="text-[17px] font-semibold text-[#1d1d1f] mt-1">{event.eventName || IPHONE_LAUNCH.eventName}</p>
        <p className="text-[13px] text-[#86868b] mt-2">
          ML outlook: {mlOutlook.summary}
        </p>
      </div>

      <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'} gap-4`}>
        <div className="surface-card p-4">
          <p className="text-[12px] text-[#86868b]">Gross-add revenue (24h)</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">{business.grossAddRevenue24h}</p>
          <p className="text-[11px] text-[#86868b] mt-1">{business.upgradeAttachRatePct}% upgrade attach</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-[12px] text-[#86868b]">Activations next 4h (ML)</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">{formatCount(business.projectedActivationsNext4h)}</p>
          <p className="text-[11px] text-[#86868b] mt-1">{formatCount(currentPhase.activationsPerMin)}/min now</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-[12px] text-[#86868b]">Care load next 4h</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">{formatCount(business.projectedCareContactsNext4h)}</p>
          <p className="text-[11px] text-[#86868b] mt-1">Est. cost {business.careCostNext4h}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-[12px] text-[#86868b]">Churn risk if SLA slips</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">{formatCount(business.churnRiskSubs)}</p>
          <p className="text-[11px] text-[#86868b] mt-1">subs · ${business.arpuUsd} ARPU/mo</p>
        </div>
      </div>

      <div className="surface-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-[17px] font-semibold text-[#1d1d1f]">Launch volume forecast</h3>
            <p className="text-[13px] text-[#86868b] mt-1">
              Activations/min · actual vs Elastic ML forecast · when to staff up or scale down
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] text-[#86868b]">Now · {currentPhase.label}</p>
            <p className="text-[13px] font-medium text-[#1d1d1f] flex items-center justify-end gap-1 mt-0.5">
              <TrendIcon trend={currentPhase.trend} />
              {trendLabel(currentPhase.trend)}
            </p>
          </div>
        </div>

        <TimeSeriesChart
          data={volumeSeries}
          height={compact ? 160 : 200}
          type="line"
          lines={[
            { key: 'activationsPerMin', name: 'Actual', color: '#1d1d1f' },
            { key: 'mlForecast', name: 'ML forecast', color: '#0071e3' },
            { key: 'baseline', name: 'Baseline', color: '#86868b' },
          ]}
        />

        <div className="mt-4 p-3 rounded-2xl bg-[#f5f5f7] text-[12px] text-[#1d1d1f]">
          <strong>Next shift:</strong> {nextPhase.label} ({nextPhase.window}) ·{' '}
          {trendLabel(nextPhase.trend)} expected in ~{mlOutlook.hoursToNextTrend}h ·{' '}
          {(nextPhase.activationsPerMin / 1000).toFixed(1)}K activations/min ·{' '}
          ML confidence {(mlOutlook.confidence * 100).toFixed(0)}%
        </div>
      </div>

      {!compact && (
        <div className="surface-card p-5">
          <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">Launch lifecycle · surge &amp; slowdown windows</h3>
          <div className="space-y-2">
            {forecast.phases.map(phase => {
              const active = phase.id === currentPhase.id;
              return (
                <div
                  key={phase.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-2xl ${
                    active ? 'bg-[#0071e3]/8 ring-1 ring-[#0071e3]/25' : 'bg-[#f5f5f7]'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:w-44 shrink-0">
                    <TrendIcon trend={phase.trend} />
                    <span className="text-[12px] font-medium text-[#1d1d1f]">{trendLabel(phase.trend)}</span>
                    {active && <span className="text-[10px] text-[#0071e3] font-semibold">NOW</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#1d1d1f]">{phase.label}</p>
                    <p className="text-[11px] text-[#86868b]">{phase.window} · {phase.businessNote}</p>
                  </div>
                  <div className="text-right shrink-0 tabular-nums">
                    <p className="text-[13px] font-semibold text-[#1d1d1f]">
                      {(phase.activationsPerMin / 1000).toFixed(1)}K/min
                    </p>
                    <p className="text-[10px] text-[#86868b]">
                      care {(phase.careContactsPerHour / 1000).toFixed(1)}K/hr
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-[11px] text-[#86868b]">
        Illustrative launch model · {mlOutlook.model} · pre-orders {(m.preOrders24h / 1_000_000).toFixed(1)}M ·
        trade-in conversion {business.tradeInConversionPct}%
      </p>
    </div>
  );
}

/** @deprecated Use LaunchBusinessMetrics for full panel */
export function LaunchEventStrip(props) {
  return <LaunchBusinessMetrics {...props} compact />;
}

export default LaunchBusinessMetrics;
