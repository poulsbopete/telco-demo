import { X, Ticket, Radio, Tv } from 'lucide-react';
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
  const pathLabel = gateway.failoverActive
    ? 'Direct to device (failover)'
    : 'Hybrid · gateway + D2D';

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

      <div className="space-y-3 mb-4">
        <div className="rounded-xl border border-[#e8e8ed] p-3">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-3.5 h-3.5 text-[#0071e3]" />
            <p className="text-[12px] font-semibold text-[#1d1d1f]">Connectivity path</p>
          </div>
          <p className="text-[13px] text-[#1d1d1f] font-medium">{pathLabel}</p>
          <p className="text-[12px] text-[#86868b] mt-1">
            Gateway-routed {formatCount(gateway.gatewayRouted)} · D2D {formatCount(gateway.d2dSessions)} (
            {Math.round(gateway.d2dShare * 100)}%)
          </p>
        </div>

        <div className="rounded-xl border border-[#e8e8ed] p-3">
          <div className="flex items-center gap-2 mb-2">
            <Tv className="w-3.5 h-3.5 text-[#0071e3]" />
            <p className="text-[12px] font-semibold text-[#1d1d1f]">In-cabin streaming</p>
          </div>
          <p className="text-[13px] text-[#1d1d1f]">
            Satisfaction <span className="font-semibold">{gateway.streamingSatisfaction}</span>
            <span className="text-[#86868b]"> / 5</span>
            <span className="text-[#86868b]"> · </span>
            Drop rate <span className="font-semibold">{gateway.streamingDropPct}%</span>
          </p>
        </div>

        {gateway.openTickets > 0 && (
          <div className="rounded-xl border border-[#f5d0c5] bg-[#fff8f5] p-3">
            <div className="flex items-center gap-2 mb-1">
              <Ticket className="w-3.5 h-3.5 text-[#bf4800]" />
              <p className="text-[12px] font-semibold text-[#bf4800]">
                {gateway.openTickets} open ticket{gateway.openTickets === 1 ? '' : 's'}
              </p>
            </div>
            <p className="text-[12px] text-[#86868b] leading-snug">{gateway.ticketReason}</p>
          </div>
        )}
      </div>

      <div className="text-[13px] text-[#86868b] space-y-2 flex-1">
        <p>
          <span className="text-[#1d1d1f] font-medium">Firmware</span> {gateway.firmwareVersion}
        </p>
        <p>
          Primary path: vehicle OBD → {gateway.networkType} → regional gateway → Kafka → OpenTelemetry /
          Prometheus. On degrade or offline, eligible SIMs fail over to direct-to-device (eSIM / 5G SA edge)
          and care tickets open with gateway + QoE context.
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
