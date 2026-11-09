import { lazy, Suspense, useEffect, useState } from 'react';
import {
  Loader2,
  RefreshCw,
  Radio,
  Ticket,
  Tv,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { ModuleHeader, StatCard } from './shared/ModuleHeader';
import { ElasticDeepLinks } from './shared/ElasticDeepLinks';
import { TelematicsDeviceDetail } from './telematics/TelematicsDeviceDetail';
import { buildFleetSnapshot, formatCount } from '../lib/telematics-fleet';
import {
  TELEMATICS_USE_CASES,
  TELEMATICS_FAILOVER_STEPS,
  TELEMATICS_CONNECTIVITY_PATHS,
} from '../lib/telematics-scenarios';
import {
  kibanaDiscoverUrl,
  kibanaTelematicsDashboardUrl,
  kibanaApmServicesUrl,
  kibanaMetricsExplorerUrl,
  kibanaMlAnomaliesUrl,
  kibanaO11yOverviewUrl,
  getOtelDemoKibanaUrl,
  OTEL_DEMO_KIBANA_URL,
  buildTelematicsPipelineDiscoverEsql,
} from '../lib/elastic-api';
import { TELEMATICS_TELEMETRY_SOURCES, TELEMATICS_TELEMETRY_SUMMARY } from '../lib/telematics-telemetry';

const TelematicsWorldMap = lazy(() => import('./telematics/TelematicsWorldMap'));

const STATUS_LEGEND = [
  { status: 'healthy', label: 'Healthy', color: '#008009' },
  { status: 'degraded', label: 'Degraded', color: '#bf4800' },
  { status: 'offline', label: 'Offline', color: '#cc0000' },
];

const STATUS_STYLE_INLINE = {
  healthy: 'text-success',
  degraded: 'text-warning',
  offline: 'text-danger',
};

const USE_CASE_ICON = {
  'failover-d2d': Radio,
  'ticket-on-drop': Ticket,
  'streaming-qoe': Tv,
};

export function AutomobileTelematicsDemo() {
  const [fleet, setFleet] = useState(() => buildFleetSnapshot());
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const kibanaUrl = getOtelDemoKibanaUrl();
  const discoverUrl = kibanaDiscoverUrl(kibanaUrl, { query: buildTelematicsPipelineDiscoverEsql() });
  const dashboardUrl = kibanaTelematicsDashboardUrl(kibanaUrl);
  const apmUrl = kibanaApmServicesUrl(kibanaUrl);
  const metricsUrl = kibanaMetricsExplorerUrl(kibanaUrl);
  const mlUrl = kibanaMlAnomaliesUrl(kibanaUrl);
  const o11yUrl = kibanaO11yOverviewUrl(kibanaUrl);

  const kibanaLinks = [
    { href: dashboardUrl, label: 'Dashboard', primary: true, title: 'Automotive telematics dashboard on otel-demo' },
    { href: discoverUrl, label: 'Discover' },
    { href: apmUrl, label: 'APM' },
    { href: metricsUrl, label: 'Metrics' },
    { href: mlUrl, label: 'ML' },
    { href: o11yUrl, label: 'Overview' },
  ];

  function refresh() {
    setLoading(true);
    setFleet(buildFleetSnapshot());
    setTimeout(() => setLoading(false), 400);
  }

  useEffect(() => {
    const interval = setInterval(() => setFleet(buildFleetSnapshot()), 30000);
    return () => clearInterval(interval);
  }, []);

  const { summary, gateways, incidents } = fleet;

  function selectIncident(incident) {
    const gw = gateways.find(g => g.id === incident.gatewayId);
    if (gw) setSelected(gw);
  }

  return (
    <div>
      <ModuleHeader
        title="Automobile telematics & IoT"
        subtitle="Regional gateways plus next-gen direct-to-device — failover, auto-tickets on drops, and in-cabin streaming satisfaction from OpenTelemetry and Prometheus on Elastic Serverless (otel-demo)."
        badge="Live · Gateway + D2D · otel-demo"
      >
        <button type="button" onClick={refresh} disabled={loading} className="btn-quiet flex items-center gap-1.5">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
        <ElasticDeepLinks links={kibanaLinks} />
      </ModuleHeader>

      <div className="surface-card p-4 mb-6 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[12px] text-[#86868b]">Elastic Serverless · Observability</p>
            <p className="text-[14px] font-medium text-[#1d1d1f] mt-0.5">
              {kibanaUrl.replace('https://', '')}
            </p>
            <p className="text-[13px] text-[#86868b] mt-2 leading-relaxed max-w-2xl">
              {TELEMATICS_TELEMETRY_SUMMARY}
            </p>
          </div>
          <a
            href={dashboardUrl || OTEL_DEMO_KIBANA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-center text-[13px] shrink-0 self-start"
          >
            Open telematics dashboard
          </a>
        </div>

        <div className="flex flex-wrap gap-2 pt-1 border-t border-[#e8e8ed]">
          {TELEMATICS_TELEMETRY_SOURCES.map(source => (
            <span
              key={source.id}
              title={`${source.detail} → ${source.destination}`}
              className="inline-flex items-center rounded-full border border-[#d2d2d7] bg-[#f5f5f7] px-3 py-1 text-[11px] font-medium text-[#1d1d1f]"
            >
              {source.label}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-[#86868b] leading-relaxed -mt-1">
          Fleet map in-app · Kibana drill-downs use the same otel-demo indices (OTLP + Prometheus scrape)
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <StatCard
          label="Connected vehicles"
          value={formatCount(summary.totalVehicles)}
          trend={`${summary.gatewayCount} regional gateways`}
          kibanaUrl={kibanaUrl}
          kibanaSection="telematics-dashboard"
        />
        <StatCard
          label="Telemetry messages / min"
          value={formatCount(summary.messagesPerMin)}
          trend="OpenTelemetry logs · Prometheus metrics"
          highlight
          kibanaUrl={kibanaUrl}
          kibanaSection="discover"
        />
        <StatCard
          label="Avg gateway latency"
          value={summary.avgLatencyMs}
          unit="ms"
          trend={`${summary.degradedGateways} degraded · ${summary.offlineGateways} offline`}
          kibanaUrl={kibanaUrl}
        />
        <StatCard
          label="Active regions"
          value={4}
          trend="Americas · EMEA · APAC · edge PoPs"
          kibanaUrl={kibanaUrl}
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Direct-to-device sessions"
          value={formatCount(summary.d2dSessions)}
          trend={`${summary.d2dSharePct}% of fleet · eSIM / 5G SA`}
          highlight
          kibanaUrl={kibanaUrl}
          kibanaSection="telematics-dashboard"
        />
        <StatCard
          label="Active failovers"
          value={summary.activeFailovers}
          trend="Gateway degrade → D2D steer"
          kibanaUrl={kibanaUrl}
        />
        <StatCard
          label="Open care tickets"
          value={summary.openTickets}
          trend="Auto-opened on drop / SLA breach"
          kibanaUrl={kibanaUrl}
        />
        <StatCard
          label="Streaming satisfaction"
          value={summary.avgStreamingSatisfaction}
          unit="/5"
          trend="In-cabin QoE · drop-correlated"
          kibanaUrl={kibanaUrl}
        />
      </div>

      <section className="mb-10">
        <p className="section-eyebrow mb-2">Next-gen IoT use cases</p>
        <h2 className="text-[22px] md:text-[24px] font-semibold tracking-tight text-[#1d1d1f] mb-4">
          Tickets, failover, and streaming QoE
        </h2>
        <div className="grid md:grid-cols-3 gap-3">
          {TELEMATICS_USE_CASES.map(uc => {
            const Icon = USE_CASE_ICON[uc.id] || Zap;
            return (
              <div key={uc.id} className="surface-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0071e3]/10">
                    <Icon className="w-4 h-4 text-[#0071e3]" />
                  </span>
                  <p className="text-[15px] font-semibold text-[#1d1d1f]">{uc.title}</p>
                </div>
                <p className="text-[12px] text-[#86868b] mb-1">
                  <span className="font-medium text-[#1d1d1f]">Trigger</span> · {uc.trigger}
                </p>
                <p className="text-[13px] text-[#86868b] leading-relaxed mb-3">{uc.action}</p>
                <p className="text-[12px] text-[#0071e3] leading-snug">{uc.elastic}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-10">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 surface-card p-5 md:p-6">
            <p className="section-eyebrow mb-2">Connectivity paths</p>
            <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">Gateway vs direct to device</h3>
            <ul className="space-y-4">
              {TELEMATICS_CONNECTIVITY_PATHS.map(path => (
                <li key={path.id} className="flex gap-3">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-[#0071e3] shrink-0" />
                  <div>
                    <p className="text-[14px] font-semibold text-[#1d1d1f]">{path.label}</p>
                    <p className="text-[13px] text-[#86868b] leading-relaxed mt-0.5">{path.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 surface-card p-5 md:p-6">
            <p className="section-eyebrow mb-2">Failover clock</p>
            <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">Drop → detect → D2D → ticket</h3>
            <ol className="space-y-0">
              {TELEMATICS_FAILOVER_STEPS.map((step, i) => (
                <li key={step.t} className="relative flex gap-4 pb-5 last:pb-0">
                  {i < TELEMATICS_FAILOVER_STEPS.length - 1 && (
                    <span className="absolute left-[11px] top-6 bottom-0 w-px bg-[#d2d2d7]" aria-hidden />
                  )}
                  <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0071e3]/10 text-[11px] font-semibold text-[#0071e3]">
                    {i + 1}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-[11px] font-semibold tabular-nums text-[#86868b]">{step.t}</span>
                      <span className="text-[14px] font-semibold text-[#1d1d1f]">{step.label}</span>
                    </div>
                    <p className="mt-0.5 text-[13px] text-[#86868b] leading-relaxed">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {incidents.length > 0 && (
        <section className="mb-8">
          <div className="flex items-end justify-between gap-4 mb-3">
            <div>
              <p className="section-eyebrow mb-1">Live incidents</p>
              <h2 className="text-[18px] font-semibold text-[#1d1d1f]">
                Tickets & QoE risks · click to inspect gateway
              </h2>
            </div>
            <p className="text-[12px] text-[#86868b] hidden sm:block">{incidents.length} active</p>
          </div>
          <div className="surface-card divide-y divide-[#e8e8ed]">
            {incidents.slice(0, 5).map(inc => (
              <button
                key={inc.id}
                type="button"
                onClick={() => selectIncident(inc)}
                className="w-full text-left px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 hover:bg-[#fafafa] transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-[#1d1d1f]">
                    {inc.name}
                    <span className="font-normal text-[#86868b]"> · {inc.city}</span>
                  </p>
                  <p className="text-[12px] text-[#86868b] mt-0.5 leading-snug">{inc.reason}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[12px] shrink-0">
                  <span className={`capitalize font-medium ${STATUS_STYLE_INLINE[inc.status]}`}>{inc.status}</span>
                  <span className="text-[#bf4800] font-medium">{inc.tickets} ticket{inc.tickets === 1 ? '' : 's'}</span>
                  <span className="text-[#86868b]">QoE {inc.streamingSatisfaction}/5</span>
                  <span className="text-[#86868b]">D2D {formatCount(inc.d2dSessions)}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#86868b] hidden sm:inline" />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-3 text-[12px] text-[#86868b]">
        {STATUS_LEGEND.map(item => (
          <span key={item.status} className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
        <span className="ml-auto hidden sm:inline">Click a gateway for path, tickets, and streaming QoE</span>
      </div>

      <div className={`grid gap-4 ${selected ? 'lg:grid-cols-2' : ''}`}>
        <div className={`surface-card overflow-hidden ${selected ? 'min-h-[420px]' : 'min-h-[480px]'}`}>
          <Suspense
            fallback={(
              <div className="h-[480px] flex items-center justify-center text-[#86868b] gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading map…
              </div>
            )}
          >
            <div className={selected ? 'h-[420px]' : 'h-[480px]'}>
              <TelematicsWorldMap
                gateways={gateways}
                selectedId={selected?.id}
                onSelect={setSelected}
              />
            </div>
          </Suspense>
        </div>

        {selected && (
          <TelematicsDeviceDetail
            gateway={selected}
            onClose={() => setSelected(null)}
            kibanaUrl={kibanaUrl}
          />
        )}
      </div>
    </div>
  );
}

export default AutomobileTelematicsDemo;
