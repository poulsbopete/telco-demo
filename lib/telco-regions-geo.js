/**
 * Telco network region geo coordinates — used for Kibana map panels (ES|QL EVAL).
 * Maps regionID tokens in OTel log body.text to lat/lon for iPhone launch / NOC views.
 */

import { TELCO_OTEL_INDEX } from './telco-discover-esql.js';

export const TELCO_REGION_GEO = [
  { regionId: 'REG-8847291', name: 'Metro East 5G', latitude: 40.7128, longitude: -74.006, market: 'US-East' },
  { regionId: 'REG-4421098', name: 'West Fiber Backbone', latitude: 37.7749, longitude: -122.4194, market: 'US-West' },
  { regionId: 'REG-7710234', name: 'Central IoT Hub', latitude: 32.7767, longitude: -96.797, market: 'US-Central' },
  { regionId: 'REG-3301847', name: 'APAC Roaming Gateway', latitude: 1.3521, longitude: 103.8198, market: 'APAC' },
  { regionId: 'REG-5590021', name: 'Northeast Fixed Wireless', latitude: 42.3601, longitude: -71.0589, market: 'US-Northeast' },
  { regionId: 'REG-2209876', name: 'EU Edge Compute', latitude: 50.1109, longitude: 8.6821, market: 'EU-West' },
  { regionId: 'REG-6610453', name: 'South Enterprise MPLS', latitude: 33.749, longitude: -84.388, market: 'US-South' },
  { regionId: 'REG-1187632', name: 'National CDN Edge', latitude: 41.8781, longitude: -87.6298, market: 'US-National' },
];

export const TELEMATICS_GATEWAY_INDEX = 'telco-demo-iot-gateways';

function regionIdEval() {
  const lines = TELCO_REGION_GEO.map(r => `body.text LIKE "*${r.regionId}*", "${r.regionId}"`);
  lines.push('"Unknown"');
  return `CASE(\n    ${lines.join(',\n    ')}\n  )`;
}

function regionFieldEval(accessor, fallback) {
  const lines = TELCO_REGION_GEO.map(r => `region_id == "${r.regionId}", ${accessor(r)}`);
  lines.push(String(fallback));
  return `CASE(\n    ${lines.join(',\n    ')}\n  )`;
}

/** ES|QL — aggregate OTel log volume by network region with geo coordinates */
export function buildTelcoRegionMapEsql() {
  return [
    `FROM ${TELCO_OTEL_INDEX}`,
    '| WHERE @timestamp >= ?_tstart AND @timestamp <= ?_tend',
    '| WHERE body.text LIKE "*REG-*"',
    `| EVAL region_id = ${regionIdEval()}`,
    `| EVAL region_name = ${regionFieldEval(r => `"${r.name}"`, '"Unknown"')}`,
    `| EVAL latitude = ${regionFieldEval(r => String(r.latitude), '0.0')}`,
    `| EVAL longitude = ${regionFieldEval(r => String(r.longitude), '0.0')}`,
    '| WHERE region_id != "Unknown"',
    '| STATS volume = COUNT(*), errors = COUNT(*) WHERE log.level IN ("ERROR", "Error") BY region_id, region_name, latitude, longitude',
    '| SORT volume DESC',
  ].join('\n');
}

/** ES|QL — IoT gateway fleet map (index seeded by deploy script) */
export function buildTelematicsGatewayMapEsql() {
  return [
    `FROM ${TELEMATICS_GATEWAY_INDEX}`,
    '| KEEP gateway_id, gateway_name, city, country, region, latitude, longitude, connected_vehicles, messages_per_min, status',
    '| SORT connected_vehicles DESC',
    '| LIMIT 100',
  ].join('\n');
}
