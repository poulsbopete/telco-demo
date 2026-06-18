import { FAULT_CHANNELS } from '../../src/lib/adaptive-networks/channels.js';

const OTLP_ENDPOINT = process.env.OTLP_ENDPOINT?.replace(/\/$/, '') ?? '';
const ES_API_KEY = process.env.ES_API_KEY || process.env.ELASTICSEARCH_API_KEY || '';

const INTERFACES = [
  'GigabitEthernet0/0/0',
  'GigabitEthernet0/0/1',
  'TenGigabitEthernet1/0/1',
  'Vlan100',
];

function formatAttrs(attrs) {
  return Object.entries(attrs).map(([key, value]) => ({
    key,
    value:
      typeof value === 'boolean'
        ? { boolValue: value }
        : typeof value === 'number'
          ? { doubleValue: value }
          : { stringValue: String(value) },
  }));
}

function randMac() {
  const arr = new Uint8Array(6);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join(':');
}

function faultMessage(channel) {
  const iface = INTERFACES[channel % INTERFACES.length];
  switch (channel) {
    case 1:
      return `%SW_MATM-4-MACFLAP_NOTIF: Host ${randMac()} in vlan 133 is flapping between port GigabitEthernet0/0/0 and port TenGigabitEthernet1/0/1, 18 moves in 120s`;
    case 2:
      return `%SPANTREE-2-TOPO_CHANGE: Topology Change received on VLAN 100 instance 0 from bridge aabb.ccdd.eeff via port ${iface}, 12 TCN BPDUs in 45s`;
    case 3:
      return `%BGP-3-NOTIFICATION: Neighbor 10.0.0.42 (AS 64512) sent NOTIFICATION 4/0 (Hold Timer Expired), 7 transitions in 120s, last state Idle`;
    case 4:
      return `%INTF-4-INPUTERR-SPIKE: Interface ${iface} input errors 240 crc_errors 35 threshold exceeded in 60s`;
    default:
      throw new Error(`Unknown channel ${channel}`);
  }
}

function buildResource(streamType = 'logs') {
  return {
    attributes: formatAttrs({
      'service.name': 'network-controller',
      'service.namespace': 'adaptive-networks',
      'deployment.environment': 'adaptive-networks',
      'host.name': 'network-controller-core-sw01',
      'cloud.provider': 'aws',
      'cloud.region': 'us-east-1',
      'telemetry.sdk.language': 'nodejs',
      'telemetry.sdk.name': 'opentelemetry',
      'data_stream.type': streamType,
      'data_stream.dataset': 'generic',
      'data_stream.namespace': 'default',
      ...(streamType === 'logs' ? { 'elasticsearch.index': 'logs.otel' } : {}),
    }),
  };
}

function buildGauge(name, value, unit = '') {
  const dp = {
    timeUnixNano: String(Date.now() * 1_000_000),
    asDouble: value,
  };
  const metric = { name, gauge: { dataPoints: [dp] } };
  if (unit) metric.unit = unit;
  return metric;
}

function faultMetrics(channel) {
  switch (channel) {
    case 1:
      return [buildGauge('network.interface.in_errors', 180, 'errors')];
    case 2:
      return [buildGauge('network.stp.topology_changes', 24, 'changes')];
    case 3:
      return [buildGauge('network.bgp.peers_established', 1, 'peers')];
    case 4:
      return [
        buildGauge('network.interface.in_errors', 420, 'errors'),
        buildGauge('network.interface.crc_errors', 85, 'errors'),
      ];
    default:
      return [];
  }
}

function buildLogRecord(channel, message, offsetMs = 0) {
  const ch = FAULT_CHANNELS.find(c => c.channel === channel);
  return {
    timeUnixNano: String((Date.now() + offsetMs) * 1_000_000),
    severityText: 'ERROR',
    severityNumber: 17,
    body: { stringValue: message },
    attributes: formatAttrs({
      'ops.mission_id': 'adaptive-networks',
      'system.subsystem': 'network_core',
      'system.status': 'CRITICAL',
      'error.type': ch.errorType,
      'chaos.channel': channel,
      'chaos.fault_type': ch.name,
      'exception.type': ch.errorType,
      'exception.message': message,
    }),
  };
}

export async function injectFaultLogs(channel, burst = 6) {
  if (!OTLP_ENDPOINT || !ES_API_KEY) {
    throw new Error('OTLP_ENDPOINT and ES_API_KEY must be configured');
  }
  const ch = FAULT_CHANNELS.find(c => c.channel === channel);
  if (!ch) throw new Error(`Unknown channel ${channel}`);

  const message = faultMessage(channel);
  const records = Array.from({ length: burst }, (_, i) => buildLogRecord(channel, message, i));
  const logsPayload = {
    resourceLogs: [{
      resource: buildResource('logs'),
      scopeLogs: [{ scope: { name: 'adaptive-networks-demo' }, logRecords: records }],
    }],
  };

  const headers = {
    Authorization: `ApiKey ${ES_API_KEY}`,
    'Content-Type': 'application/json',
  };

  const logsRes = await fetch(`${OTLP_ENDPOINT}/v1/logs`, {
    method: 'POST',
    headers,
    body: JSON.stringify(logsPayload),
  });

  if (!logsRes.ok) {
    const text = await logsRes.text();
    throw new Error(`OTLP log ingest failed (${logsRes.status}): ${text.slice(0, 300)}`);
  }

  const metrics = faultMetrics(channel);
  let metricsSent = 0;
  if (metrics.length) {
    const metricsPayload = {
      resourceMetrics: [{
        resource: buildResource('metrics'),
        scopeMetrics: [{ scope: { name: 'adaptive-networks-demo' }, metrics }],
      }],
    };
    const metricsRes = await fetch(`${OTLP_ENDPOINT}/v1/metrics`, {
      method: 'POST',
      headers,
      body: JSON.stringify(metricsPayload),
    });
    if (!metricsRes.ok) {
      const text = await metricsRes.text();
      throw new Error(`OTLP metrics ingest failed (${metricsRes.status}): ${text.slice(0, 300)}`);
    }
    metricsSent = metrics.length;
  }

  return { logsSent: burst, metricsSent, errorType: ch.errorType, channel };
}
