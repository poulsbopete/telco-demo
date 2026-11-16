#!/usr/bin/env node
/**
 * Create / open telematics anomaly detection jobs on f74145 and print deep links.
 *
 * Usage:
 *   node scripts/deploy-telematics-ml-jobs.mjs
 *
 * Jobs are tagged with group "telematics" so the Telematics tab ML link can filter:
 *   /app/ml/jobs?_a=(jobs:(queryText:'groups:(telematics)'))
 */

import { config as loadEnv } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { TELEMATICS_SERVICE_NAMES, TELEMATICS_ENVIRONMENT } from '../lib/telematics-services.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

loadEnv({ path: resolve(ROOT, '.env.local') });
loadEnv({ path: resolve(ROOT, '.env.otel-elastic'), override: false });

const ES_URL = (process.env.ES_URL || process.env.ELASTICSEARCH_URL || '').replace(/\/$/, '');
const API_KEY = (
  process.env.ELASTIC_OTEL_API_KEY
  || process.env.ELASTICSEARCH_API_KEY
  || process.env.ES_API_KEY
  || ''
).replace(/^ApiKey\s+/i, '');
const KIBANA_URL = (
  process.env.VITE_KIBANA_URL
  || process.env.KIBANA_URL
  || 'https://elastic-observability-f74145.kb.centralus.azure.elastic.cloud'
).replace(/\/$/, '');

if (!ES_URL || !API_KEY) {
  console.error('Missing ES_URL or API key');
  process.exit(1);
}

const TELEM_SERVICE_FILTER = {
  bool: {
    should: [
      { term: { 'deployment.environment': TELEMATICS_ENVIRONMENT } },
      { terms: { 'service.name': TELEMATICS_SERVICE_NAMES } },
    ],
    minimum_should_match: 1,
  },
};

const JOBS = [
  {
    job_id: 'telematics-trace-errors',
    description:
      'Telematics — anomalous error span counts per service (vehicle-gateway, D2D, streaming-qoe, …).',
    groups: ['telematics', 'iot'],
    analysis_config: {
      bucket_span: '15m',
      detectors: [
        {
          detector_description: 'High error span count per telematics service',
          function: 'high_count',
          partition_field_name: 'service.name',
        },
      ],
      influencers: ['service.name'],
    },
    data_description: { time_field: '@timestamp', time_format: 'epoch_ms' },
    datafeed: {
      indices: ['traces-generic.otel-*'],
      query: {
        bool: {
          must: [
            TELEM_SERVICE_FILTER,
            { term: { 'status.code': 'Error' } },
          ],
        },
      },
    },
  },
  {
    job_id: 'telematics-span-volume',
    description:
      'Telematics — anomalous request/span volume per connected-vehicle service.',
    groups: ['telematics', 'iot'],
    analysis_config: {
      bucket_span: '15m',
      detectors: [
        {
          detector_description: 'Unusual span volume per telematics service',
          function: 'high_count',
          partition_field_name: 'service.name',
        },
      ],
      influencers: ['service.name'],
    },
    data_description: { time_field: '@timestamp', time_format: 'epoch_ms' },
    datafeed: {
      indices: ['traces-generic.otel-*'],
      query: TELEM_SERVICE_FILTER,
    },
  },
  {
    job_id: 'telematics-streaming-qoe',
    description:
      'Telematics — low in-cabin streaming satisfaction (QoE) for streaming-qoe / gateway metrics.',
    groups: ['telematics', 'iot', 'qoe'],
    analysis_config: {
      bucket_span: '15m',
      detectors: [
        {
          detector_description: 'Low streaming satisfaction score',
          function: 'low_mean',
          field_name: 'telematics.streaming.satisfaction',
          partition_field_name: 'service.name',
        },
      ],
      influencers: ['service.name'],
    },
    data_description: { time_field: '@timestamp', time_format: 'epoch_ms' },
    datafeed: {
      indices: ['metrics-generic.otel-*'],
      query: {
        bool: {
          must: [
            TELEM_SERVICE_FILTER,
            { exists: { field: 'telematics.streaming.satisfaction' } },
          ],
        },
      },
    },
  },
  {
    job_id: 'telematics-gateway-tickets',
    description:
      'Telematics — spike in open care tickets / failover pressure on regional IoT gateways.',
    groups: ['telematics', 'iot'],
    analysis_config: {
      bucket_span: '15m',
      detectors: [
        {
          detector_description: 'High open care tickets by gateway',
          function: 'high_mean',
          field_name: 'open_tickets',
          partition_field_name: 'gateway_name',
        },
      ],
      influencers: ['gateway_name', 'region', 'status'],
    },
    data_description: { time_field: '@timestamp', time_format: 'epoch_ms' },
    datafeed: {
      indices: ['telco-demo-iot-gateways'],
      query: { match_all: {} },
    },
  },
];

async function es(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${ES_URL}${path}`, {
    method,
    headers: {
      Authorization: `ApiKey ${API_KEY}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { ok: res.ok, status: res.status, data };
}

async function ensureJob(job) {
  const { datafeed, ...jobBody } = job;
  const putJob = await es(`/_ml/anomaly_detectors/${job.job_id}`, {
    method: 'PUT',
    body: jobBody,
  });
  if (!putJob.ok && !String(putJob.data?.error?.type || '').includes('resource_already_exists')) {
    // Update description/groups if exists
    if (putJob.status === 400 && putJob.data?.error?.type === 'resource_already_exists_exception') {
      console.log(`  job exists: ${job.job_id}`);
    } else {
      throw new Error(`PUT job ${job.job_id}: ${JSON.stringify(putJob.data).slice(0, 400)}`);
    }
  } else if (putJob.ok) {
    console.log(`  created job: ${job.job_id}`);
  }

  const datafeedId = `datafeed-${job.job_id}`;
  const putFeed = await es(`/_ml/datafeeds/${datafeedId}`, {
    method: 'PUT',
    body: {
      job_id: job.job_id,
      indices: datafeed.indices,
      query: datafeed.query,
      scroll_size: 1000,
    },
  });
  if (!putFeed.ok && putFeed.data?.error?.type !== 'resource_already_exists_exception') {
    throw new Error(`PUT datafeed ${datafeedId}: ${JSON.stringify(putFeed.data).slice(0, 400)}`);
  } else if (putFeed.ok) {
    console.log(`  created datafeed: ${datafeedId}`);
  } else {
    console.log(`  datafeed exists: ${datafeedId}`);
  }

  const open = await es(`/_ml/anomaly_detectors/${job.job_id}/_open`, { method: 'POST' });
  if (!open.ok && !String(JSON.stringify(open.data)).includes('already open')) {
    console.warn(`  open warn ${job.job_id}: ${open.status}`);
  }

  const start = await es(`/_ml/datafeeds/${datafeedId}/_start`, {
    method: 'POST',
    body: { start: 'now-7d' },
  });
  if (!start.ok && !String(JSON.stringify(start.data)).includes('already started')) {
    // Some clusters want epoch start
    const start2 = await es(`/_ml/datafeeds/${datafeedId}/_start?start=now-7d`, { method: 'POST' });
    if (!start2.ok) {
      console.warn(`  start warn ${datafeedId}: ${start.status} ${JSON.stringify(start.data).slice(0, 200)}`);
    } else {
      console.log(`  started datafeed: ${datafeedId}`);
    }
  } else if (start.ok) {
    console.log(`  started datafeed: ${datafeedId}`);
  } else {
    console.log(`  datafeed already started: ${datafeedId}`);
  }
}

async function main() {
  console.log(`Deploying ${JOBS.length} telematics ML jobs → ${ES_URL}`);
  for (const job of JOBS) {
    console.log(`\n• ${job.job_id}`);
    await ensureJob(job);
  }

  const ids = JOBS.map((j) => j.job_id);
  const jobsUrl = `${KIBANA_URL}/app/ml/jobs?_a=(jobs:(queryText:'groups:(telematics)'))`;
  const explorerUrl = `${KIBANA_URL}/app/ml/explorer?_g=(ml:(jobIds:!(${ids.join(',')})),time:(from:now-7d,to:now))`;

  console.log('\nDone.');
  console.log(`Jobs (telematics group): ${jobsUrl}`);
  console.log(`Anomaly Explorer: ${explorerUrl}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
