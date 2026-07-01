import { IPHONE_LAUNCH } from '../../lib/iphone-launch-event';

export function LaunchEventStrip({ launchEvent, className = '' }) {
  const event = launchEvent || IPHONE_LAUNCH;
  const m = event.metrics || IPHONE_LAUNCH.metrics;

  return (
    <div className={`py-4 border-y border-[#d2d2d7]/60 ${className}`}>
      <p className="text-[12px] text-[#86868b] uppercase tracking-wide">{event.tagline || IPHONE_LAUNCH.tagline}</p>
      <p className="text-[17px] font-semibold text-[#1d1d1f] mt-1">{event.eventName || IPHONE_LAUNCH.eventName}</p>
      <p className="text-[13px] text-[#86868b] mt-2">
        {(m.activationsFirst6h / 1_000_000).toFixed(2)}M activations · {(m.preOrders24h / 1_000_000).toFixed(1)}M pre-orders ·{' '}
        {m.provisioningSpikePct}% provisioning spike · {(m.esimDownloadsPerMin / 1000).toFixed(0)}K eSIM OTA/min
      </p>
    </div>
  );
}

export default LaunchEventStrip;
