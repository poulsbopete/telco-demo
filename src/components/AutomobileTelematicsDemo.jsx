import { lazy, Suspense, useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { ModuleHeader, StatCard } from './shared/ModuleHeader';
import { ElasticDeepLinks } from './shared/ElasticDeepLinks';
import { TelematicsDeviceDetail } from './telematics/TelematicsDeviceDetail';
import { buildFleetSnapshot, formatCount } from '../lib/telematics-fleet';
import {
  kibanaDiscoverUrl,
  kibanaTelematicsDashboardUrl,
  kibanaApmServicesUrl,
  kibanaMetricsExplorerUrl,
  kibanaMlAnomaliesUrl,
  kibanaO11yOverviewUrl,
  getOtelDemoKibanaUrl,
  OTEL_DEMO_KIBANA_URL,
  TELCO_DISCOVER_ESQL,
} from '../lib/elastic-api';

const TelematicsWorldMap = lazy(() => import('./telematics/TelematicsWorldMap'));

const STATUS_LEGEND = [
  { status: 'healthy', label: 'Healthy', color: '#008009' },
  { status: 'degraded', label: 'Degraded', color: '#bf4800' },
  { status: 'offline', label: 'Offline', color: '#cc0000' },
];

export function AutomobileTelematicsDemo() {
  const [fleet, setFleet] = useState(() => buildFleetSnapshot());
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const kibanaUrl = getOtelDemoKibanaUrl();
  const discoverUrl = kibanaDiscoverUrl(kibanaUrl, { query: TELCO_DISCOVER_ESQL });
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

  const { summary, gateways } = fleet;

  return (
    <div>
      <ModuleHeader
        title="Automobile telematics & IoT"
        subtitle="Worldwide connected-vehicle gateways — live ingest, latency, and fleet health on Elastic Serverless (otel-demo)."
        badge="Live · otel-demo"
      >
        <button type="button" onClick={refresh} disabled={loading} className="btn-quiet flex items-center gap-1.5">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
        <ElasticDeepLinks links={kibanaLinks} />
      </ModuleHeader>

      <div className="surface-card p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-[12px] text-[#86868b]">Elastic Serverless · Observability</p>
          <p className="text-[14px] font-medium text-[#1d1d1f] mt-0.5">
            {kibanaUrl.replace('https://', '')}
          </p>
          <p className="text-[12px] text-[#86868b] mt-1">
            Fleet map in-app · dashboards and drill-downs open in otel-demo Kibana
          </p>
        </div>
        <a
          href={dashboardUrl || OTEL_DEMO_KIBANA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-center text-[13px] shrink-0"
        >
          Open telematics dashboard
        </a>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
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
          trend="OBD · CAN · GPS · diagnostics"
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

      <div className="flex flex-wrap items-center gap-4 mb-3 text-[12px] text-[#86868b]">
        {STATUS_LEGEND.map(item => (
          <span key={item.status} className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
        <span className="ml-auto hidden sm:inline">Click a gateway for regional detail</span>
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
