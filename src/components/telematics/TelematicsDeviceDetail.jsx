import { X } from 'lucide-react';
import { formatCount } from '../../lib/telematics-fleet';
import { kibanaDiscoverUrl, kibanaTelematicsDashboardUrl, buildTelematicsGatewayDiscoverEsql } from '../../lib/elastic-api';

const STATUS_STYLE = {
  healthy: 'text-success',
  degraded: 'text-warning',
  offline: 'text-danger',
};

export function TelematicsDeviceDetail({ gateway, onClose, kibanaUrl }) {
  if (!gateway) return null;

  const discoverUrl = kibanaDiscoverUrl(kibanaUrl, { query: buildTelematicsGatewayDiscoverEsql(gateway) });
  const dashboardUrl = kibanaTelematicsDashboardUrl(kibanaUrl);

  return (
    <div className="surface-card p-5 h-full flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[#86868b]">IoT gateway</p>
          <h3 className="text-[17px] font-semibold text-[#1d1d1f] mt-0.5">{gateway.name}</h3>
          <p className="text-[13px] text-[#86868b]">{gateway.city}, {gateway.country} · {gateway.region}</p>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f5f5f7] text-[#86868b]" aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Status', value: gateway.status, className: STATUS_STYLE[gateway.status] },
          { label: 'Network', value: gateway.networkType },
          { label: 'Connected vehicles', value: formatCount(gateway.connectedVehicles) },
          { label: 'Active SIMs', value: formatCount(gateway.activeSims) },
          { label: 'Messages / min', value: formatCount(gateway.messagesPerMin) },
          { label: 'Avg latency', value: `${gateway.avgLatencyMs} ms` },
          { label: 'Packet loss', value: `${gateway.packetLossPct}%` },
          { label: 'Last seen', value: gateway.status === 'offline' ? `${gateway.lastSeenSec}s ago` : `${gateway.lastSeenSec}s` },
        ].map(item => (
          <div key={item.label} className="rounded-xl bg-[#f5f5f7] p-3">
            <p className="text-[11px] text-[#86868b]">{item.label}</p>
            <p className={`text-[15px] font-semibold mt-0.5 capitalize ${item.className || 'text-[#1d1d1f]'}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="text-[13px] text-[#86868b] space-y-2 flex-1">
        <p>
          <span className="text-[#1d1d1f] font-medium">Firmware</span> {gateway.firmwareVersion}
        </p>
        <p>
          Ingest path: vehicle OBD / telematics unit → {gateway.networkType} → regional gateway →
          Kafka → OpenTelemetry Collector → Elasticsearch (logs + traces) and Prometheus scrape (metrics).
          ML jobs watch message-rate and latency anomalies per region.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-[#e8e8ed]">
        {discoverUrl && (
          <a
            href={discoverUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-[#0071e3] hover:underline"
          >
            Open gateway logs in Discover
          </a>
        )}
        {dashboardUrl && (
          <a
            href={dashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-[#0071e3] hover:underline"
          >
            Telematics dashboard
          </a>
        )}
      </div>
    </div>
  );
}

export default TelematicsDeviceDetail;
