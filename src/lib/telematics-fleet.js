const GATEWAYS = [
  { id: 'gw-us-east', name: 'Northeast hub', city: 'New York', country: 'US', latitude: 40.7128, longitude: -74.006, region: 'Americas' },
  { id: 'gw-us-west', name: 'West coast hub', city: 'San Francisco', country: 'US', latitude: 37.7749, longitude: -122.4194, region: 'Americas' },
  { id: 'gw-us-south', name: 'Gulf fleet hub', city: 'Houston', country: 'US', latitude: 29.7604, longitude: -95.3698, region: 'Americas' },
  { id: 'gw-ca-central', name: 'Canada central', city: 'Toronto', country: 'CA', latitude: 43.6532, longitude: -79.3832, region: 'Americas' },
  { id: 'gw-br-sp', name: 'São Paulo IoT edge', city: 'São Paulo', country: 'BR', latitude: -23.5505, longitude: -46.6333, region: 'Americas' },
  { id: 'gw-mx-cdmx', name: 'Mexico City gateway', city: 'Mexico City', country: 'MX', latitude: 19.4326, longitude: -99.1332, region: 'Americas' },
  { id: 'gw-uk-lon', name: 'London telematics PoP', city: 'London', country: 'UK', latitude: 51.5074, longitude: -0.1278, region: 'EMEA' },
  { id: 'gw-de-fra', name: 'Frankfurt automotive core', city: 'Frankfurt', country: 'DE', latitude: 50.1109, longitude: 8.6821, region: 'EMEA' },
  { id: 'gw-fr-par', name: 'Paris connected fleet', city: 'Paris', country: 'FR', latitude: 48.8566, longitude: 2.3522, region: 'EMEA' },
  { id: 'gw-es-mad', name: 'Madrid mobility hub', city: 'Madrid', country: 'ES', latitude: 40.4168, longitude: -3.7038, region: 'EMEA' },
  { id: 'gw-it-mil', name: 'Milan OEM gateway', city: 'Milan', country: 'IT', latitude: 45.4642, longitude: 9.19, region: 'EMEA' },
  { id: 'gw-se-sto', name: 'Stockholm EV telemetry', city: 'Stockholm', country: 'SE', latitude: 59.3293, longitude: 18.0686, region: 'EMEA' },
  { id: 'gw-za-jnb', name: 'Johannesburg fleet edge', city: 'Johannesburg', country: 'ZA', latitude: -26.2041, longitude: 28.0473, region: 'EMEA' },
  { id: 'gw-ae-dxb', name: 'Dubai logistics IoT', city: 'Dubai', country: 'AE', latitude: 25.2048, longitude: 55.2708, region: 'EMEA' },
  { id: 'gw-in-bom', name: 'Mumbai telematics', city: 'Mumbai', country: 'IN', latitude: 19.076, longitude: 72.8777, region: 'APAC' },
  { id: 'gw-in-del', name: 'Delhi connected vehicles', city: 'New Delhi', country: 'IN', latitude: 28.6139, longitude: 77.209, region: 'APAC' },
  { id: 'gw-jp-tyo', name: 'Tokyo automotive edge', city: 'Tokyo', country: 'JP', latitude: 35.6762, longitude: 139.6503, region: 'APAC' },
  { id: 'gw-kr-seo', name: 'Seoul V2X hub', city: 'Seoul', country: 'KR', latitude: 37.5665, longitude: 126.978, region: 'APAC' },
  { id: 'gw-cn-sh', name: 'Shanghai OEM gateway', city: 'Shanghai', country: 'CN', latitude: 31.2304, longitude: 121.4737, region: 'APAC' },
  { id: 'gw-sg-sin', name: 'Singapore maritime IoT', city: 'Singapore', country: 'SG', latitude: 1.3521, longitude: 103.8198, region: 'APAC' },
  { id: 'gw-au-syd', name: 'Sydney fleet PoP', city: 'Sydney', country: 'AU', latitude: -33.8688, longitude: 151.2093, region: 'APAC' },
  { id: 'gw-nz-akl', name: 'Auckland logistics', city: 'Auckland', country: 'NZ', latitude: -36.8485, longitude: 174.7633, region: 'APAC' },
];

/** Static gateway locations for Elastic map index (deploy script) */
export const TELEMATICS_GATEWAY_LOCATIONS = GATEWAYS;

const NETWORK_TYPES = ['5G SA', '5G NSA', 'LTE-M', 'NB-IoT'];
function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function seededRandom(seed, min, max) {
  const x = Math.sin(seed) * 10000;
  const r = x - Math.floor(x);
  return min + r * (max - min);
}

export function buildFleetSnapshot() {
  const now = Date.now();
  const gateways = GATEWAYS.map((gw, i) => {
    const seed = hashSeed(gw.id) + Math.floor(now / 30000);
    const roll = seededRandom(seed, 0, 1);
    const status = roll > 0.92 ? 'offline' : roll > 0.78 ? 'degraded' : 'healthy';
    const connectedVehicles = Math.round(seededRandom(seed + 1, 1200, 48000));
    const activeSims = Math.round(connectedVehicles * seededRandom(seed + 2, 0.85, 1.05));
    const messagesPerMin = Math.round(seededRandom(seed + 3, 800, 42000));
    const avgLatencyMs = Math.round(seededRandom(seed + 4, status === 'degraded' ? 180 : 45, status === 'degraded' ? 420 : 120));
    const packetLossPct = Number(seededRandom(seed + 5, status === 'offline' ? 8 : 0.01, status === 'degraded' ? 2.5 : 0.4).toFixed(2));

    // Next-gen IoT: share of sessions on direct-to-device (eSIM / 5G SA) vs regional gateway
    const baseD2dShare = seededRandom(seed + 8, 0.08, 0.28);
    const failoverActive = status !== 'healthy';
    const d2dShare = Number(Math.min(0.85, baseD2dShare + (failoverActive ? 0.35 : 0)).toFixed(2));
    const d2dSessions = Math.round(connectedVehicles * d2dShare);
    const gatewayRouted = connectedVehicles - d2dSessions;

    const streamingDropPct = Number(
      seededRandom(
        seed + 9,
        status === 'offline' ? 6 : status === 'degraded' ? 2.5 : 0.2,
        status === 'offline' ? 18 : status === 'degraded' ? 9 : 1.8,
      ).toFixed(1),
    );
    const streamingSatisfaction = Number(
      Math.max(
        1.5,
        seededRandom(seed + 10, 4.4, 4.9) - streamingDropPct * 0.12 - (failoverActive ? 0.35 : 0),
      ).toFixed(2),
    );

    const openTickets =
      status === 'offline'
        ? Math.round(seededRandom(seed + 11, 2, 6))
        : status === 'degraded'
          ? Math.round(seededRandom(seed + 11, 1, 3))
          : streamingDropPct > 4
            ? 1
            : 0;

    const ticketReason =
      status === 'offline'
        ? 'Gateway offline — failover to D2D + care ticket'
        : status === 'degraded'
          ? 'Latency SLA breach — partial D2D steer'
          : streamingDropPct > 4
            ? 'In-cabin streaming QoE drop — satisfaction risk'
            : null;

    return {
      ...gw,
      status,
      networkType: NETWORK_TYPES[i % NETWORK_TYPES.length],
      connectedVehicles,
      activeSims,
      messagesPerMin,
      avgLatencyMs,
      packetLossPct,
      firmwareVersion: `v${2 + (i % 3)}.${4 + (i % 5)}.${Math.floor(seededRandom(seed + 6, 0, 20))}`,
      lastSeenSec: status === 'offline' ? Math.round(seededRandom(seed + 7, 120, 900)) : Math.round(seededRandom(seed + 7, 2, 45)),
      d2dShare,
      d2dSessions,
      gatewayRouted,
      failoverActive,
      connectivityPath: failoverActive ? 'direct-to-device' : 'hybrid',
      streamingDropPct,
      streamingSatisfaction,
      openTickets,
      ticketReason,
    };
  });

  const totalVehicles = gateways.reduce((s, g) => s + g.connectedVehicles, 0);
  const totalMessages = gateways.reduce((s, g) => s + g.messagesPerMin, 0);
  const degraded = gateways.filter(g => g.status === 'degraded').length;
  const offline = gateways.filter(g => g.status === 'offline').length;
  const avgLatency = Math.round(
    gateways.filter(g => g.status !== 'offline').reduce((s, g) => s + g.avgLatencyMs, 0)
      / Math.max(1, gateways.length - offline),
  );
  const d2dSessions = gateways.reduce((s, g) => s + g.d2dSessions, 0);
  const openTickets = gateways.reduce((s, g) => s + g.openTickets, 0);
  const activeFailovers = gateways.filter(g => g.failoverActive).length;
  const avgSatisfaction = Number(
    (
      gateways.reduce((s, g) => s + g.streamingSatisfaction, 0) / Math.max(1, gateways.length)
    ).toFixed(2),
  );
  const incidents = gateways
    .filter(g => g.openTickets > 0)
    .map(g => ({
      id: `inc-${g.id}`,
      gatewayId: g.id,
      name: g.name,
      city: g.city,
      region: g.region,
      status: g.status,
      tickets: g.openTickets,
      reason: g.ticketReason,
      d2dSessions: g.d2dSessions,
      streamingSatisfaction: g.streamingSatisfaction,
      streamingDropPct: g.streamingDropPct,
      failoverActive: g.failoverActive,
    }))
    .sort((a, b) => b.tickets - a.tickets || a.streamingSatisfaction - b.streamingSatisfaction);

  return {
    generatedAt: new Date(now).toISOString(),
    summary: {
      gatewayCount: gateways.length,
      totalVehicles,
      messagesPerMin: totalMessages,
      avgLatencyMs: avgLatency,
      degradedGateways: degraded,
      offlineGateways: offline,
      d2dSessions,
      d2dSharePct: Number(((d2dSessions / Math.max(1, totalVehicles)) * 100).toFixed(1)),
      openTickets,
      activeFailovers,
      avgStreamingSatisfaction: avgSatisfaction,
    },
    incidents,
    gateways,
  };
}

export function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}
