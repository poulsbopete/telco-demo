#!/usr/bin/env node
/**
 * Deploy NPE silent-failure / partnerID Vega dashboard to otel-demo Kibana.
 * Uses Saved Objects _import (works on Serverless; CRUD create often does not).
 */
import { config as loadEnv } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
loadEnv({ path: resolve(ROOT, '.env.local') });

const KIBANA_URL = (process.env.VITE_KIBANA_URL || process.env.KIBANA_URL || '').replace(/\/$/, '');
const API_KEY = process.env.KIBANA_API_KEY || process.env.ES_API_KEY || '';

if (!KIBANA_URL || !API_KEY) {
  console.error('Missing KIBANA_URL / ES_API_KEY');
  process.exit(1);
}

function buildVisualization(id, title, spec) {
  return {
    type: 'visualization',
    id,
    attributes: {
      title,
      visState: JSON.stringify({
        title,
        type: 'vega',
        params: { spec: JSON.stringify(spec, null, 2) },
        aggs: [],
      }),
      uiStateJSON: '{}',
      description: 'NPE synthetic silent-failure / partnerID',
      kibanaSavedObjectMeta: { searchSourceJSON: '{}' },
    },
    references: [],
  };
}

function buildDashboard(id, title, description, panels) {
  const references = panels.map((panel, i) => ({
    id: panel.vizId,
    name: `panel_${i}`,
    type: 'visualization',
  }));
  const panelsJSON = panels.map((panel, i) => ({
    version: '8.18.0',
    type: 'visualization',
    gridData: { x: panel.x, y: panel.y, w: panel.w, h: panel.h, i: String(i + 1) },
    panelIndex: String(i + 1),
    panelRefName: `panel_${i}`,
    embeddableConfig: { hidePanelTitles: false },
  }));
  return {
    type: 'dashboard',
    id,
    attributes: {
      title,
      description,
      panelsJSON: JSON.stringify(panelsJSON),
      optionsJSON: JSON.stringify({
        useMargins: true,
        syncColors: true,
        syncTooltips: true,
        syncCursor: true,
      }),
      timeRestore: true,
      timeFrom: 'now-7d',
      timeTo: 'now',
      kibanaSavedObjectMeta: {
        searchSourceJSON: JSON.stringify({
          query: { language: 'kuery', query: '' },
          filter: [],
        }),
      },
    },
    references,
  };
}

const heatmap = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: 'Silent failures · faceted by partnerID (15m buckets)',
  data: {
    url: {
      '%type%': 'esql',
      '%context%': true,
      query: `FROM npe-synthetic-transaction-details
| WHERE @timestamp >= ?_tstart AND @timestamp <= ?_tend
| STATS
    silent_count = COUNT(*) WHERE silent_failure == true,
    total = COUNT(*)
  BY partnerID, partner_name, bucket = BUCKET(@timestamp, 15 minutes)
| EVAL silent_rate = CASE(total > 0, silent_count * 1.0 / total, 0)
| EVAL facet_label = CONCAT(partner_name, " (", partnerID, ")")
| SORT partnerID, bucket`,
    },
  },
  // Dense strip heatmaps — one facet per partner (name + ID)
  facet: {
    field: 'facet_label',
    type: 'nominal',
    columns: 5,
    sort: { op: 'sum', field: 'silent_count', order: 'descending' },
    header: {
      labelFontSize: 10,
      labelFontWeight: 'bold',
      title: 'Partner',
      titleFontSize: 12,
      labelLimit: 160,
    },
  },
  spec: {
    width: 145,
    height: 36,
    mark: {
      type: 'rect',
      tooltip: true,
      stroke: '#050816',
      strokeWidth: 0.25,
    },
    encoding: {
      x: {
        field: 'bucket',
        type: 'temporal',
        title: null,
        axis: {
          format: '%m/%d %H:%M',
          labelAngle: -40,
          labelFontSize: 7,
          tickCount: 6,
          grid: false,
        },
      },
      y: {
        field: 'band',
        type: 'nominal',
        title: null,
        axis: null,
        scale: { domain: ['silent'] },
      },
      color: {
        field: 'silent_count',
        type: 'quantitative',
        title: 'Silent',
        scale: { scheme: 'blues', zero: true },
        legend: { orient: 'bottom', titleFontSize: 10, labelFontSize: 9 },
      },
      tooltip: [
        { field: 'partnerID', type: 'nominal', title: 'partnerID' },
        { field: 'bucket', type: 'temporal', title: 'Bucket', format: '%Y-%m-%d %H:%M' },
        { field: 'silent_count', type: 'quantitative', title: 'Silent failures' },
        { field: 'total', type: 'quantitative', title: 'Total txns' },
        { field: 'silent_rate', type: 'quantitative', title: 'Silent rate', format: '.0%' },
      ],
    },
    transform: [{ calculate: "'silent'", as: 'band' }],
  },
  resolve: { scale: { x: 'shared', color: 'shared' } },
  config: {
    view: { stroke: '#2a2a2e' },
    facet: { spacing: 6 },
  },
};

const bars = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: 'Silent failure count by partnerID',
  data: {
    url: {
      '%context%': true,
      '%timefield%': '@timestamp',
      index: 'npe-synthetic-transaction-details',
    },
    format: { property: 'hits.hits' },
  },
  transform: [
    { calculate: "datum._source.partnerID", as: 'partnerID' },
    { calculate: 'datum._source.silent_failure', as: 'silent_failure' },
    { filter: 'datum.silent_failure == true' },
  ],
  mark: { type: 'bar', tooltip: true },
  encoding: {
    y: { field: 'partnerID', type: 'nominal', sort: '-x', title: 'partnerID' },
    x: { aggregate: 'count', type: 'quantitative', title: 'Silent failures' },
    color: { value: '#e20074' },
  },
};

const scatter = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: 'Partner record_score — anomalies (score ≥ 75)',
  data: {
    url: {
      '%context%': true,
      '%timefield%': '@timestamp',
      index: 'npe-synthetic-ml-anomalies',
    },
    format: { property: 'hits.hits' },
  },
  transform: [
    { calculate: "datum._source.partnerID", as: 'partnerID' },
    { calculate: 'datum._source.record_score', as: 'record_score' },
    { calculate: 'datum._source.actual[0]', as: 'actual' },
    { calculate: 'datum._source.typical[0]', as: 'typical' },
    { calculate: "toDate(datum._source['@timestamp'])", as: 'time' },
    { calculate: "datum.record_score >= 75 ? 'anomaly' : 'normal'", as: 'band' },
  ],
  mark: { type: 'circle', opacity: 0.7, size: 50, tooltip: true },
  encoding: {
    x: { field: 'time', type: 'temporal', title: 'Time' },
    y: { field: 'actual', type: 'quantitative', title: 'Record count' },
    color: {
      field: 'band',
      type: 'nominal',
      scale: { domain: ['normal', 'anomaly'], range: ['#0071e3', '#e7664c'] },
      title: 'Band',
    },
    tooltip: [
      { field: 'partnerID' },
      { field: 'actual', type: 'quantitative' },
      { field: 'typical', type: 'quantitative' },
      { field: 'record_score', type: 'quantitative' },
    ],
  },
};

async function importObjects(objects) {
  const ndjson = objects.map((obj) => JSON.stringify(obj)).join('\n');
  const form = new FormData();
  form.append('file', new Blob([ndjson], { type: 'application/x-ndjson' }), 'npe-silent.ndjson');

  const res = await fetch(`${KIBANA_URL}/api/saved_objects/_import?overwrite=true`, {
    method: 'POST',
    headers: {
      Authorization: `ApiKey ${API_KEY}`,
      'kbn-xsrf': 'true',
    },
    body: form,
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    const errors = data.errors?.map((e) => e.error?.message || JSON.stringify(e)).join('; ');
    throw new Error(errors || data.message || `Import failed (${res.status})`);
  }
  return data;
}

const viz = [
  {
    id: 'npe-silent-fail-heatmap',
    title: 'Silent failures heatmap — faceted by partnerID',
    spec: heatmap,
    layout: { x: 0, y: 0, w: 48, h: 28 },
  },
  {
    id: 'npe-silent-fail-by-partner',
    title: 'Silent failures by partnerID',
    spec: bars,
    layout: { x: 0, y: 28, w: 24, h: 14 },
  },
  {
    id: 'npe-partner-anomaly-scatter',
    title: 'Partner record_score anomalies',
    spec: scatter,
    layout: { x: 24, y: 28, w: 24, h: 14 },
  },
];

const objects = [
  ...viz.map((v) => buildVisualization(v.id, v.title, v.spec)),
  buildDashboard(
    'npe-silent-failures-partner',
    'NPE Silent Failures · partnerID',
    'Synthetic silent failures: outer SUCCESS but NAP/non-core failed. Indices npe-synthetic-*.',
    viz.map((v) => ({ vizId: v.id, ...v.layout })),
  ),
];

console.log(`Deploying to ${KIBANA_URL}...`);
const result = await importObjects(objects);
console.log(`Imported ${result.successCount} objects.`);
console.log(
  `Dashboard URL: ${KIBANA_URL}/app/dashboards#/view/npe-silent-failures-partner?_g=(time:(from:now-7d,to:now))`,
);
