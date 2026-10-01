import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileSearch,
  Gauge,
  Layers,
  Search,
  Zap,
} from 'lucide-react';
import { ModuleHeader, StatCard } from './shared/ModuleHeader';
import { getOtelDemoKibanaUrl } from '../lib/elastic-api';

const NOC_DASHBOARD_ID = 'npe-noc-silent-failures';

function silentFailureDashboardUrl(kibanaBase) {
  const base = (kibanaBase || getOtelDemoKibanaUrl()).replace(/\/$/, '');
  return `${base}/app/dashboards#/view/${NOC_DASHBOARD_ID}?_g=(time:(from:now-7d,to:now))`;
}

const LOG_STEPS = [
  { t: '0–2 h', label: 'Subscribers complain', detail: 'Care tickets: “service feels slower” — outer txn still SUCCESS' },
  { t: '2–8 h', label: 'Export & grep', detail: 'Pull fullRequest / fullResponse; brittle regex per Wholesale segment' },
  { t: '8–24 h', label: 'Correlate partners', detail: 'Join partnerID, feature, tier, speed across tools and spreadsheets' },
  { t: '24–48 h', label: 'Root cause found', detail: 'Pattern drift confirmed — thr128kbps → thr16kbps on feature 2412001' },
];

const METRICS_STEPS = [
  { t: '0–15 m', label: 'Signal emits', detail: 'SUCCESS volume + feature/speed fields (runtime or mapped) stream continuously' },
  { t: '15–60 m', label: 'ML / change point', detail: 'rare(speed)|partition(feature) or high_count on deviation vs golden map' },
  { t: '< 2 h', label: 'NOC board alert', detail: 'Swim lane + partner drill-down; filter by partnerID without log spelunking' },
  { t: 'Same shift', label: 'Remediate', detail: 'Confirm payload pattern, roll back config / fix downstream — before churn spikes' },
];

const COMPARISON = [
  {
    dimension: 'Time to detect',
    logs: '24–48 hours (often after care volume rises)',
    metrics: 'Minutes to a few hours (bucket span 15m–1h)',
  },
  {
    dimension: 'Signal type',
    logs: 'Raw payloads; ERROR codes miss SUCCESS-path failures',
    metrics: 'Counts, rates, categorical rarity, pattern deviation flags',
  },
  {
    dimension: 'Wholesale params',
    logs: 'Logstash / template / pipeline lead time per segment',
    metrics: 'Runtime fields on under 10% of events; mirror on data view for Discover',
  },
  {
    dimension: 'Drill-down',
    logs: 'Manual Discover queries; fields often missing from exports',
    metrics: 'Dashboard filter by partnerID · feature · speed; custom URLs from ML',
  },
  {
    dimension: 'Scale',
    logs: 'Full-text search over multi-GB payloads per hunt',
    metrics: 'Pre-aggregated series; job already proven at tens of millions of records',
  },
  {
    dimension: 'False calm',
    logs: 'Green status hides throttle / NAP / dual-provisioning drift',
    metrics: 'Models “normal” content patterns even when status = SUCCESS',
  },
];

const USE_CASES = [
  {
    title: 'Throttle speed drift',
    example: 'feature 2412001 · expected thr128kbps · observed thr16kbps',
    why: 'Provisioning returns SUCCESS; subscribers feel degradation.',
  },
  {
    title: 'Subsystem silent fail',
    example: 'Outer SUCCESS · napstatus FAILED / noncorefailed',
    why: 'Wire looks healthy; non-core path never completed.',
  },
  {
    title: 'Rateplan volume spike',
    example: 'high_count by partnerId / rateplan (existing Wholesale job)',
    why: 'Complements content jobs — catch unusual FTC change rates fast.',
  },
];

export function SilentFailuresDemo() {
  const [mode, setMode] = useState('metrics');
  const kibanaUrl = getOtelDemoKibanaUrl();
  const dashUrl = useMemo(() => silentFailureDashboardUrl(kibanaUrl), [kibanaUrl]);
  const steps = mode === 'metrics' ? METRICS_STEPS : LOG_STEPS;

  return (
    <div className="space-y-12 md:space-y-16">
      <ModuleHeader
        badge="Wholesale · NPE"
        title="Silent failure detection"
        subtitle="Catch SUCCESS-path pattern drift with metrics and ML in hours — not 24–48 hours of log archaeology after care tickets pile up."
      >
        <a
          href={dashUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] text-white text-[14px] font-medium px-5 py-2.5 hover:bg-[#333] transition-colors"
        >
          Open NOC board
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>
      </ModuleHeader>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Log-hunt MTTD" value="24–48" unit="h" trend="Typical today for payload pattern issues" highlight={false} />
        <StatCard label="Metrics / ML MTTD" value="< 2" unit="h" trend="15m–1h buckets + alerting" highlight />
        <StatCard label="Care lead time saved" value="1–2" unit="days" trend="Before subscribers feel lasting impact" highlight />
        <StatCard label="Events needing extract" value="< 10" unit="%" trend="Wholesale-only runtime fields — no Logstash wait" highlight={false} />
      </section>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <p className="section-eyebrow mb-2">Detection path</p>
            <h2 className="text-[24px] md:text-[28px] font-semibold tracking-tight text-[#1d1d1f]">
              Same incident · two clocks
            </h2>
          </div>
          <div className="flex rounded-full border border-[#d2d2d7] p-1 bg-white shrink-0">
            <button
              type="button"
              onClick={() => setMode('logs')}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                mode === 'logs' ? 'bg-[#1d1d1f] text-white' : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              Log parsing
            </button>
            <button
              type="button"
              onClick={() => setMode('metrics')}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                mode === 'metrics' ? 'bg-[#1d1d1f] text-white' : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              Metrics + ML
            </button>
          </div>
        </div>

        <div className="surface-card p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            {mode === 'metrics' ? (
              <Gauge className="w-5 h-5 text-[#0071e3]" />
            ) : (
              <FileSearch className="w-5 h-5 text-[#bf4800]" />
            )}
            <p className="text-[15px] font-semibold text-[#1d1d1f]">
              {mode === 'metrics' ? 'Metrics & anomaly detection' : 'Traditional log parsing'}
            </p>
            <span
              className={`ml-auto text-[12px] font-semibold tabular-nums ${
                mode === 'metrics' ? 'text-[#008009]' : 'text-[#bf4800]'
              }`}
            >
              {mode === 'metrics' ? 'Hours' : '24–48 hours'}
            </span>
          </div>

          <ol className="space-y-0">
            {steps.map((step, i) => (
              <li key={step.t} className="relative flex gap-4 md:gap-6 pb-8 last:pb-0">
                {i < steps.length - 1 && (
                  <span
                    className="absolute left-[15px] top-8 bottom-0 w-px bg-[#d2d2d7]"
                    aria-hidden
                  />
                )}
                <span
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                    mode === 'metrics'
                      ? 'bg-[#0071e3]/10 text-[#0071e3]'
                      : 'bg-[#bf4800]/10 text-[#bf4800]'
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-[12px] font-semibold tabular-nums text-[#86868b]">{step.t}</span>
                    <span className="text-[15px] font-semibold text-[#1d1d1f]">{step.label}</span>
                  </div>
                  <p className="mt-1 text-[14px] text-[#86868b] leading-relaxed">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section>
        <p className="section-eyebrow mb-2">Why metrics win</p>
        <h2 className="text-[24px] md:text-[28px] font-semibold tracking-tight text-[#1d1d1f] mb-6">
          Log hunting vs continuous pattern signals
        </h2>
        <div className="surface-card overflow-x-auto">
          <table className="w-full text-left text-[13px] min-w-[640px]">
            <thead>
              <tr className="border-b border-[#d2d2d7]">
                <th className="py-3.5 px-5 font-semibold text-[#86868b] w-[22%]">Dimension</th>
                <th className="py-3.5 px-5 font-semibold text-[#bf4800]">
                  <span className="inline-flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" /> Log parsing
                  </span>
                </th>
                <th className="py-3.5 px-5 font-semibold text-[#0071e3]">
                  <span className="inline-flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Metrics + ML
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.dimension} className="border-b border-[#d2d2d7]/70 last:border-0">
                  <td className="py-3.5 px-5 font-semibold text-[#1d1d1f] align-top">{row.dimension}</td>
                  <td className="py-3.5 px-5 text-[#86868b] align-top leading-snug">{row.logs}</td>
                  <td className="py-3.5 px-5 text-[#1d1d1f] align-top leading-snug">{row.metrics}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <p className="section-eyebrow mb-2">Patterns metrics catch</p>
        <h2 className="text-[24px] md:text-[28px] font-semibold tracking-tight text-[#1d1d1f] mb-3">
          Silent failures status monitoring never sees
        </h2>
        <p className="section-lead mb-6 max-w-2xl">
          The transaction completes successfully from a system perspective. End subscribers still feel wrong speed,
          missing NAP registration, or unexpected rateplan churn — exactly the Jian Yao / Erickson Wholesale examples.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {USE_CASES.map((uc) => (
            <div key={uc.title} className="surface-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-[#bf4800]" />
                <h3 className="text-[15px] font-semibold text-[#1d1d1f]">{uc.title}</h3>
              </div>
              <p className="text-[12px] font-mono text-[#0071e3] leading-snug mb-3">{uc.example}</p>
              <p className="text-[13px] text-[#86868b] leading-relaxed">{uc.why}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-[#0071e3]" />
              <p className="text-[12px] font-semibold uppercase tracking-wide text-[#86868b]">Operator outcome</p>
            </div>
            <h2 className="text-[22px] md:text-[26px] font-semibold tracking-tight text-[#1d1d1f]">
              From complaint-driven forensics to shift-left detection
            </h2>
            <ul className="mt-4 space-y-2.5">
              {[
                'Keep volume jobs (e.g. Wholesale rateplan high_count) for traffic anomalies',
                'Add content jobs: rare speed by feature/tier · deviation from expected map',
                'Mirror runtime fields on the Discover data view so ML → Discover drill-down works',
                'One NOC dashboard: swim lane, partner map, pattern drift, click-to-filter partnerID',
              ].map((item) => (
                <li key={item} className="flex gap-2.5 text-[14px] text-[#1d1d1f] leading-snug">
                  <CheckCircle2 className="w-4 h-4 text-[#008009] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="shrink-0 flex flex-col gap-3 w-full md:w-[240px]">
            <a
              href={dashUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0071e3] text-white text-[14px] font-medium px-5 py-3 hover:bg-[#0077ed] transition-colors"
            >
              View silent-failure NOC
              <ArrowRight className="w-4 h-4" />
            </a>
            <p className="text-[12px] text-[#86868b] text-center md:text-left leading-relaxed">
              Live demo board on otel-demo · Last 7 days synthetic Wholesale patterns
            </p>
          </div>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <div className="surface-card p-5 flex gap-3">
          <Clock className="w-5 h-5 text-[#bf4800] shrink-0 mt-0.5" />
          <div>
            <p className="text-[15px] font-semibold text-[#1d1d1f]">Why logs take a day or two</p>
            <p className="mt-1.5 text-[13px] text-[#86868b] leading-relaxed">
              Payload fragments differ by segment; parsing belongs in Wholesale-specific scripts, not every ingest
              path. Teams wait on tickets, then reconstruct timelines from multi-GB Discover exports.
            </p>
          </div>
        </div>
        <div className="surface-card p-5 flex gap-3">
          <Layers className="w-5 h-5 text-[#0071e3] shrink-0 mt-0.5" />
          <div>
            <p className="text-[15px] font-semibold text-[#1d1d1f]">Why metrics close the gap</p>
            <p className="mt-1.5 text-[13px] text-[#86868b] leading-relaxed">
              Extract once into fields the model can learn (feature, tierName, speed, partnerID). Alert on rarity and
              rate — then filter the same dashboard the NOC already watches.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SilentFailuresDemo;
