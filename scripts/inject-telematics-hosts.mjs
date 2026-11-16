#!/usr/bin/env node
/**
 * Inject IoT automobile host metrics via OTLP → f74145 Infrastructure Hosts.
 *
 * Uses hostmetricsreceiver.otel dataset fields the Hosts UI expects:
 *   system.cpu.utilization (state), system.cpu.load_average.*, system.memory.*, etc.
 *
 * Usage:
 *   node scripts/inject-telematics-hosts.mjs
 *   node scripts/inject-telematics-hosts.mjs --minutes 60
 */

import { config as loadEnv } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { TELEMATICS_GATEWAY_LOCATIONS } from '../src/lib/telematics-fleet.js';
import { TELEMATICS_ENVIRONMENT } from '../lib/telematics-services.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

loadEnv({ path: resolve(ROOT, '.env.local') });
loadEnv({ path: resolve(ROOT, '.env.otel-elastic'), override: false });

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return fallback;
}

const MINUTES = Number(arg('minutes', '90'));
const STEP_MS = 60_000; // 1 sample / min / host

const OTLP_ENDPOINT = (
  process.env.OTLP_ENDPOINT
  || process.env.ELASTIC_OTLP_ENDPOINT
  || process.env.OTEL_EXPORTER_OTLP_ENDPOINT
  || ''
).replace(/\/$/, '').replace(/:443$/, '');

const API_KEY = (
  process.env.ELASTIC_OTEL_API_KEY
  || process.env.ELASTICSEARCH_API_KEY
  || process.env.ES_API_KEY
  || ''
).replace(/^ApiKey\s+/i, '');

if (!OTLP_ENDPOINT || !API_KEY) {
  console.error('Missing OTLP_ENDPOINT or API key');
  process.exit(1);
}

function formatAttrs(attrs) {
  return Object.entries(attrs).map(([key, value]) => ({
    key,
    value:
      typeof value === 'boolean'
        ? { boolValue: value }
        : typeof value === 'number' && Number.isInteger(value)
          ? { intValue: value }
          : typeof value === 'number'
            ? { doubleValue: value }
            : { stringValue: String(value) },
  }));
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function hostId(gw) {
  return `iot-${gw.id.replace(/^gw-/, '')}`;
}

function buildResource(gw) {
  return {
    attributes: formatAttrs({
      'service.name': 'iot-automobile-host',
      'service.namespace': 'telematics',
      'deployment.environment': TELEMATICS_ENVIRONMENT,
      'host.name': hostId(gw),
      'host.id': hostId(gw),
      'host.type': 'iot-gateway',
      'host.architecture': 'arm64',
      'os.type': 'linux',
      'cloud.provider': 'azure',
      'cloud.region': gw.region === 'Americas' ? 'eastus' : gw.region === 'EMEA' ? 'westeurope' : 'southeastasia',
      'telemetry.sdk.language': 'nodejs',
      'telemetry.sdk.name': 'opentelemetry',
      'data_stream.type': 'metrics',
      // Elastic appends ".otel" → hostmetricsreceiver.otel (Hosts UI entity filter)
      'data_stream.dataset': 'hostmetricsreceiver',
      'data_stream.namespace': 'default',
      'telematics.gateway_name': gw.name,
      'telematics.city': gw.city,
      'telematics.region': gw.region,
    }),
  };
}

function gauge(name, value, attrs = {}, timeUnixNano) {
  return {
    name,
    unit: '1',
    gauge: {
      dataPoints: [{
        timeUnixNano,
        asDouble: value,
        attributes: formatAttrs(attrs),
      }],
    },
  };
}

function sum(name, value, attrs = {}, timeUnixNano) {
  return {
    name,
    unit: 'By',
    sum: {
      aggregationTemporality: 2, // cumulative
      isMonotonic: false,
      dataPoints: [{
        timeUnixNano,
        asDouble: value,
        attributes: formatAttrs(attrs),
      }],
    },
  };
}

function hostMetricsAt(gw, offsetMs, seed) {
  const t = String((Date.now() - offsetMs) * 1_000_000);
  const cores = 4 + (seed % 5); // 4–8
  const busy = rand(0.12, gw.statusHint === 'degraded' ? 0.92 : 0.55);
  const idle = Math.max(0.05, 1 - busy - 0.08);
  const user = busy * 0.65;
  const system = busy * 0.25;
  const wait = busy * 0.1;
  const memTotal = 16 * 1024 ** 3;
  const memUsedPct = rand(0.35, gw.statusHint === 'degraded' ? 0.88 : 0.7);
  const memUsed = memTotal * memUsedPct;
  const memCached = memTotal * 0.12;
  const memFree = memTotal - memUsed - memCached;
  const load1 = cores * rand(0.2, gw.statusHint === 'degraded' ? 1.4 : 0.75);
  const diskTotal = 256 * 1024 ** 3;
  const diskUsedPct = rand(0.4, 0.75);

  return [
    gauge('system.cpu.logical.count', cores, {}, t),
    gauge('system.cpu.utilization', user, { state: 'user', cpu: 'cpu0' }, t),
    gauge('system.cpu.utilization', system, { state: 'system', cpu: 'cpu0' }, t),
    gauge('system.cpu.utilization', idle, { state: 'idle', cpu: 'cpu0' }, t),
    gauge('system.cpu.utilization', wait, { state: 'wait', cpu: 'cpu0' }, t),
    gauge('system.cpu.utilization', 0.01, { state: 'interrupt', cpu: 'cpu0' }, t),
    gauge('system.cpu.utilization', 0.005, { state: 'softirq', cpu: 'cpu0' }, t),
    gauge('system.cpu.utilization', 0.002, { state: 'nice', cpu: 'cpu0' }, t),
    gauge('system.cpu.utilization', 0.001, { state: 'steal', cpu: 'cpu0' }, t),
    gauge('system.cpu.load_average.1m', load1, {}, t),
    gauge('system.cpu.load_average.5m', load1 * 0.9, {}, t),
    gauge('system.cpu.load_average.15m', load1 * 0.8, {}, t),
    sum('system.memory.usage', memUsed, { state: 'used' }, t),
    sum('system.memory.usage', memFree, { state: 'free' }, t),
    sum('system.memory.usage', memCached, { state: 'cached' }, t),
    sum('system.memory.usage', memTotal * 0.04, { state: 'buffered' }, t),
    sum('system.memory.usage', memTotal * 0.02, { state: 'slab_reclaimable' }, t),
    sum('system.memory.usage', memTotal * 0.01, { state: 'slab_unreclaimable' }, t),
    gauge('system.memory.utilization', memUsedPct, { state: 'used' }, t),
    gauge('system.memory.utilization', memFree / memTotal, { state: 'free' }, t),
    gauge('system.memory.utilization', 0.04, { state: 'buffered' }, t),
    gauge('system.memory.utilization', 0.02, { state: 'slab_reclaimable' }, t),
    gauge('system.memory.utilization', 0.01, { state: 'slab_unreclaimable' }, t),
    sum('system.filesystem.usage', diskTotal * diskUsedPct, { state: 'used', mountpoint: '/', device: '/dev/nvme0n1p1', type: 'ext4', mode: 'rw' }, t),
    sum('system.filesystem.usage', diskTotal * (1 - diskUsedPct), { state: 'free', mountpoint: '/', device: '/dev/nvme0n1p1', type: 'ext4', mode: 'rw' }, t),
    gauge('system.filesystem.utilization', diskUsedPct, { mountpoint: '/', device: '/dev/nvme0n1p1', type: 'ext4', mode: 'rw' }, t),
    sum('system.network.io', rand(1e6, 8e7), { device: 'eth0', direction: 'receive' }, t),
    sum('system.network.io', rand(5e5, 4e7), { device: 'eth0', direction: 'transmit' }, t),
  ];
}

async function postMetrics(resourceMetrics) {
  const res = await fetch(`${OTLP_ENDPOINT}/v1/metrics`, {
    method: 'POST',
    headers: {
      Authorization: `ApiKey ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resourceMetrics }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OTLP metrics failed (${res.status}): ${text.slice(0, 400)}`);
  }
}

async function main() {
  // Prefer a representative regional set so Hosts isn't empty noise
  const hosts = TELEMATICS_GATEWAY_LOCATIONS.slice(0, 12).map((gw, i) => ({
    ...gw,
    statusHint: i % 7 === 0 ? 'degraded' : 'healthy',
  }));

  const samples = Math.max(15, Math.floor(MINUTES));
  console.log(`Injecting ${hosts.length} IoT automobile hosts × ${samples} samples → ${OTLP_ENDPOINT}`);

  for (const gw of hosts) {
    const batches = [];
    for (let i = 0; i < samples; i += 1) {
      const offsetMs = (samples - 1 - i) * STEP_MS;
      batches.push({
        resource: buildResource(gw),
        scopeMetrics: [{
          scope: {
            name: 'github.com/open-telemetry/opentelemetry-collector-contrib/receiver/hostmetricsreceiver',
            version: '0.100.0',
          },
          metrics: hostMetricsAt(gw, offsetMs, i + gw.id.length),
        }],
      });
    }

    // Send in chunks of 10 resourceMetrics to avoid huge payloads
    for (let i = 0; i < batches.length; i += 10) {
      await postMetrics(batches.slice(i, i + 10));
    }
    console.log(`  ✓ ${hostId(gw)} · ${gw.city} · ${samples} samples`);
  }

  console.log('\nDone.');
  console.log(
    `Hosts: https://elastic-observability-f74145.kb.centralus.azure.elastic.cloud/app/metrics/hosts?hostKuery=host.name%20:%20iot-*&dateRange=(from:now-2h,to:now)`,
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
