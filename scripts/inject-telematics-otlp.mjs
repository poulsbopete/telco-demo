#!/usr/bin/env node
/**
 * Inject telematics APM services (traces + logs + metrics) via OTLP → f74145.
 *
 * Usage:
 *   node scripts/inject-telematics-otlp.mjs
 *   node scripts/inject-telematics-otlp.mjs --minutes 30 --rate 8
 *
 * Credentials (first match):
 *   OTLP_ENDPOINT / ELASTIC_OTLP_ENDPOINT / OTEL_EXPORTER_OTLP_ENDPOINT
 *   ES_API_KEY / ELASTICSEARCH_API_KEY / ELASTIC_OTEL_API_KEY
 */

import { config as loadEnv } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';
import {
  TELEMATICS_APM_SERVICES,
  TELEMATICS_ENVIRONMENT,
} from '../lib/telematics-services.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

loadEnv({ path: resolve(ROOT, '.env.local') });
loadEnv({ path: resolve(ROOT, '.env.otel-elastic'), override: false });

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return fallback;
}

const MINUTES = Number(arg('minutes', '45'));
const RATE = Number(arg('rate', '6')); // spans per service per minute (approx)

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
  console.error('Missing OTLP_ENDPOINT or API key (.env.local / .env.otel-elastic)');
  process.exit(1);
}

function hexId(bytes) {
  return randomBytes(bytes).toString('hex');
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

function randBetween([min, max]) {
  return min + Math.random() * (max - min);
}

function buildResource(serviceName, streamType) {
  return {
    attributes: formatAttrs({
      'service.name': serviceName,
      'service.namespace': 'telematics',
      'deployment.environment': TELEMATICS_ENVIRONMENT,
      'telemetry.sdk.language': 'nodejs',
      'telemetry.sdk.name': 'opentelemetry',
      'telemetry.sdk.version': '1.0.0',
      'cloud.provider': 'azure',
      'cloud.region': 'centralus',
      'data_stream.type': streamType,
      'data_stream.dataset': 'generic',
      'data_stream.namespace': 'default',
      ...(streamType === 'logs' ? { 'elasticsearch.index': 'logs.otel' } : {}),
    }),
  };
}

function buildSpan(service, offsetMs) {
  const start = Date.now() - offsetMs;
  const durationMs = Math.round(randBetween(service.latencyMs));
  const isError = Math.random() < service.errorRate;
  const statusCode = isError ? (Math.random() < 0.5 ? 500 : 503) : 200;

  return {
    traceId: hexId(16),
    spanId: hexId(8),
    name: service.transaction,
    kind: 2, // SERVER
    startTimeUnixNano: String(start * 1_000_000),
    endTimeUnixNano: String((start + durationMs) * 1_000_000),
    attributes: formatAttrs({
      'http.request.method': service.transaction.startsWith('GET') ? 'GET' : 'POST',
      'http.response.status_code': statusCode,
      'url.path': service.transaction.replace(/^(GET|POST|PUBLISH)\s+/, ''),
      'telematics.subsystem': service.label,
      'telematics.demo': true,
    }),
    status: {
      code: isError ? 2 : 1,
      ...(isError ? { message: 'telematics path error' } : {}),
    },
  };
}

function buildLog(service, offsetMs) {
  const isError = Math.random() < service.errorRate;
  return {
    timeUnixNano: String((Date.now() - offsetMs) * 1_000_000),
    severityText: isError ? 'ERROR' : 'INFO',
    severityNumber: isError ? 17 : 9,
    body: {
      stringValue: isError
        ? `${service.label}: path degraded — failover candidate`
        : `${service.label}: ${service.transaction} ok`,
    },
    attributes: formatAttrs({
      'telematics.subsystem': service.label,
      'telematics.demo': true,
      'http.response.status_code': isError ? 503 : 200,
    }),
  };
}

function buildMetrics(service) {
  const now = String(Date.now() * 1_000_000);
  return [
    {
      name: 'telematics.messages.per_min',
      unit: '1',
      gauge: {
        dataPoints: [{ timeUnixNano: now, asDouble: Math.round(randBetween([800, 42000])) }],
      },
    },
    {
      name: 'telematics.latency.ms',
      unit: 'ms',
      gauge: {
        dataPoints: [{ timeUnixNano: now, asDouble: Math.round(randBetween(service.latencyMs)) }],
      },
    },
    {
      name: 'telematics.streaming.satisfaction',
      unit: '1',
      gauge: {
        dataPoints: [{
          timeUnixNano: now,
          asDouble: Number(randBetween(
            service.name === 'streaming-qoe' ? [3.2, 4.6] : [4.2, 4.9],
          ).toFixed(2)),
        }],
      },
    },
  ];
}

async function postOtlp(path, body) {
  const res = await fetch(`${OTLP_ENDPOINT}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `ApiKey ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${path} failed (${res.status}): ${text.slice(0, 400)}`);
  }
}

async function injectService(service) {
  const spanCount = Math.max(12, Math.round(MINUTES * RATE));
  const spans = Array.from({ length: spanCount }, (_, i) => {
    const offsetMs = Math.floor((i / spanCount) * MINUTES * 60_000);
    return buildSpan(service, offsetMs);
  });
  const logs = Array.from({ length: Math.max(8, Math.round(spanCount / 3)) }, (_, i) => {
    const offsetMs = Math.floor((i / Math.max(1, spanCount / 3)) * MINUTES * 60_000);
    return buildLog(service, offsetMs);
  });

  await postOtlp('/v1/traces', {
    resourceSpans: [{
      resource: buildResource(service.name, 'traces'),
      scopeSpans: [{ scope: { name: 'telematics-demo' }, spans }],
    }],
  });

  await postOtlp('/v1/logs', {
    resourceLogs: [{
      resource: buildResource(service.name, 'logs'),
      scopeLogs: [{ scope: { name: 'telematics-demo' }, logRecords: logs }],
    }],
  });

  await postOtlp('/v1/metrics', {
    resourceMetrics: [{
      resource: buildResource(service.name, 'metrics'),
      scopeMetrics: [{ scope: { name: 'telematics-demo' }, metrics: buildMetrics(service) }],
    }],
  });

  return { service: service.name, spans: spans.length, logs: logs.length };
}

async function main() {
  console.log(`Injecting ${TELEMATICS_APM_SERVICES.length} telematics services → ${OTLP_ENDPOINT}`);
  console.log(`Window ~${MINUTES}m · ~${RATE} spans/min/service · env=${TELEMATICS_ENVIRONMENT}`);

  const results = [];
  for (const service of TELEMATICS_APM_SERVICES) {
    const r = await injectService(service);
    results.push(r);
    console.log(`  ✓ ${r.service} · ${r.spans} spans · ${r.logs} logs`);
  }

  const totalSpans = results.reduce((s, r) => s + r.spans, 0);
  console.log(`\nDone · ${totalSpans} spans across ${results.length} services`);
  console.log(
    `APM: https://elastic-observability-f74145.kb.centralus.azure.elastic.cloud/app/apm/services?environment=${TELEMATICS_ENVIRONMENT}&rangeFrom=now-24h&rangeTo=now`,
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
