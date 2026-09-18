#!/usr/bin/env node
/**
 * Deploy NOC-style silent-failure dashboard with partnerID lookup enrichment.
 * Top offenders by partner name/tier/region — otel-demo Kibana.
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

const ES_QL = { '%type%': 'esql', '%context%': true };
const TIME = '| WHERE @timestamp >= ?_tstart AND @timestamp <= ?_tend';

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
      description: 'NPE NOC silent-failure / partner lookup',
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

async function importObjects(objects) {
  const ndjson = objects.map((obj) => JSON.stringify(obj)).join('\n');
  const form = new FormData();
  form.append('file', new Blob([ndjson], { type: 'application/x-ndjson' }), 'npe-noc.ndjson');
  const res = await fetch(`${KIBANA_URL}/api/saved_objects/_import?overwrite=true`, {
    method: 'POST',
    headers: { Authorization: `ApiKey ${API_KEY}`, 'kbn-xsrf': 'true' },
    body: form,
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    const errors = data.errors?.map((e) => e.error?.message || JSON.stringify(e)).join('; ');
    throw new Error(errors || data.message || `Import failed (${res.status})`);
  }
  return data;
}

const kpiSilent = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: 'Silent failures (window)',
  data: {
    url: {
      ...ES_QL,
      query: `FROM npe-synthetic-transaction-details
${TIME}
| STATS silent = COUNT(*) WHERE silent_failure == true, total = COUNT(*)
| EVAL silent_rate = CASE(total > 0, silent * 1.0 / total, 0)`,
    },
  },
  layer: [
    {
      mark: { type: 'text', align: 'center', baseline: 'middle', fontSize: 42, fontWeight: 'bold', color: '#e20074' },
      encoding: { text: { field: 'silent', type: 'quantitative' } },
    },
    {
      mark: { type: 'text', align: 'center', baseline: 'top', dy: 28, fontSize: 13, color: '#9a9aa0' },
      encoding: {
        text: { field: 'silent_rate', type: 'quantitative', format: '.1%' },
      },
      transform: [{ calculate: "'rate ' + format(datum.silent_rate, '.1%')", as: 'label' }],
    },
  ],
  config: { view: { stroke: null } },
};

// Simpler KPI text for Vega-Lite without fragile dual layer
const kpiSilentSimple = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: 'Silent failures',
  data: {
    url: {
      ...ES_QL,
      query: `FROM npe-synthetic-transaction-details
${TIME}
| STATS silent = COUNT(*) WHERE silent_failure == true`,
    },
  },
  mark: { type: 'text', align: 'center', baseline: 'middle', fontSize: 48, fontWeight: 'bold', color: '#e20074' },
  encoding: { text: { field: 'silent', type: 'quantitative' } },
  config: { view: { stroke: null } },
};

const kpiPartners = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: 'Offending partners',
  data: {
    url: {
      ...ES_QL,
      query: `FROM npe-synthetic-transaction-details
${TIME}
| WHERE silent_failure == true
| STATS c = COUNT(*) BY partnerID
| STATS offenders = COUNT(*)`,
    },
  },
  mark: { type: 'text', align: 'center', baseline: 'middle', fontSize: 48, fontWeight: 'bold', color: '#fec514' },
  encoding: { text: { field: 'offenders', type: 'quantitative' } },
  config: { view: { stroke: null } },
};

const kpiHard = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: 'Hard failures',
  data: {
    url: {
      ...ES_QL,
      query: `FROM npe-synthetic-transaction-details
${TIME}
| WHERE synthetic_scenario == "hard_fail"
| STATS hard = COUNT(*)`,
    },
  },
  mark: { type: 'text', align: 'center', baseline: 'middle', fontSize: 48, fontWeight: 'bold', color: '#bf4800' },
  encoding: { text: { field: 'hard', type: 'quantitative' } },
  config: { view: { stroke: null } },
};

const kpiPattern = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: 'Pattern drift (SUCCESS + wrong speed)',
  data: {
    url: {
      ...ES_QL,
      query: `FROM npe-synthetic-transaction-details
${TIME}
| WHERE silent_pattern_deviation == true
| STATS drifted = COUNT(*)`,
    },
  },
  mark: { type: 'text', align: 'center', baseline: 'middle', fontSize: 48, fontWeight: 'bold', color: '#0071e3' },
  encoding: { text: { field: 'drifted', type: 'quantitative' } },
  config: { view: { stroke: null } },
};

const patternByFeatureSpeed = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: 'Silent pattern change — feature × speed (Jian Yao example)',
  data: {
    url: {
      ...ES_QL,
      query: `FROM npe-synthetic-transaction-details
${TIME}
| WHERE status == "SUCCESS" AND feature IS NOT NULL AND speed IS NOT NULL
| STATS txn = COUNT(*), drifted = COUNT(*) WHERE silent_pattern_deviation == true
  BY feature, speed, tierName
| EVAL label = CONCAT(feature, " · ", speed)
| SORT drifted DESC, txn DESC
| LIMIT 12`,
    },
  },
  mark: { type: 'bar', tooltip: true, cornerRadiusEnd: 2 },
  encoding: {
    y: {
      field: 'label',
      type: 'nominal',
      sort: '-x',
      title: null,
      axis: { labelLimit: 220, labelFontSize: 11 },
    },
    x: { field: 'txn', type: 'quantitative', title: 'SUCCESS txns' },
    color: {
      field: 'drifted',
      type: 'quantitative',
      title: 'Drifted',
      scale: { range: ['#d2d2d7', '#e20074'] },
    },
    tooltip: [
      { field: 'feature', title: 'feature' },
      { field: 'speed', title: 'speed' },
      { field: 'tierName', title: 'tier' },
      { field: 'txn', type: 'quantitative', title: 'SUCCESS txns' },
      { field: 'drifted', type: 'quantitative', title: 'Pattern deviations' },
    ],
  },
  autosize: 'none',
  height: { step: 26 },
  config: { view: { stroke: null }, axis: { grid: false } },
};

const topOffenders = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: 'Top offenders — silent failures by partner',
  data: {
    url: {
      ...ES_QL,
      query: `FROM npe-synthetic-transaction-details
${TIME}
| WHERE silent_failure == true
| STATS silent_count = COUNT(*) BY partnerID, partner_name, partner_tier, partner_region, partner_owner
| SORT silent_count DESC
| LIMIT 10
| EVAL label = CONCAT(partner_name, " (", partnerID, ")")`,
    },
  },
  mark: { type: 'bar', tooltip: true, cornerRadiusEnd: 2 },
  encoding: {
    y: {
      field: 'label',
      type: 'nominal',
      sort: '-x',
      title: null,
      axis: { labelLimit: 280, labelFontSize: 11 },
    },
    x: { field: 'silent_count', type: 'quantitative', title: 'Silent failures' },
    color: {
      field: 'partner_tier',
      type: 'nominal',
      title: 'Tier',
      scale: {
        domain: ['Platinum', 'Gold', 'Silver', 'Bronze', 'Unknown'],
        range: ['#e20074', '#0071e3', '#00bfb3', '#fec514', '#9a9aa0'],
      },
    },
    tooltip: [
      { field: 'partnerID', title: 'partnerID' },
      { field: 'partner_name', title: 'Name' },
      { field: 'partner_tier', title: 'Tier' },
      { field: 'partner_region', title: 'Region' },
      { field: 'partner_owner', title: 'NOC owner' },
      { field: 'silent_count', type: 'quantitative', title: 'Silent failures' },
    ],
  },
  // Kibana enables autosize by default; keep step height with autosize none
  autosize: 'none',
  height: { step: 28 },
  config: { view: { stroke: null }, axis: { grid: false } },
};

const offendersTable = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: 'Offender board — partner lookup + silent rate',
  data: {
    url: {
      ...ES_QL,
      query: `FROM npe-synthetic-transaction-details
${TIME}
| STATS
    silent_count = COUNT(*) WHERE silent_failure == true,
    total = COUNT(*)
  BY partnerID, partner_name, partner_tier, partner_region, partner_channel, partner_owner
| EVAL silent_rate = CASE(total > 0, silent_count * 1.0 / total, 0)
| WHERE silent_count > 0
| SORT silent_count DESC
| LIMIT 15`,
    },
  },
  transform: [
    { calculate: "format(datum.silent_rate, '.0%')", as: 'rate_pct' },
    {
      calculate:
        "datum.partnerID + '  |  ' + datum.partner_name + '  |  ' + datum.partner_tier + '  |  ' + datum.partner_region + '  |  ' + datum.partner_owner + '  |  silent=' + toString(datum.silent_count) + '  rate=' + datum.rate_pct",
      as: 'row',
    },
  ],
  mark: { type: 'text', align: 'left', baseline: 'middle', fontSize: 12, font: 'Menlo, monospace', color: '#1d1d1f' },
  encoding: {
    y: { field: 'row', type: 'nominal', sort: { field: 'silent_count', order: 'descending' }, axis: null },
    text: { field: 'row', type: 'nominal' },
  },
  autosize: 'none',
  height: { step: 22 },
  config: { view: { stroke: null } },
};

// Cleaner table-like bars for region
const byRegion = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: 'Silent failures by partner region',
  data: {
    url: {
      ...ES_QL,
      query: `FROM npe-synthetic-transaction-details
${TIME}
| WHERE silent_failure == true
| STATS silent_count = COUNT(*) BY partner_region
| SORT silent_count DESC`,
    },
  },
  mark: { type: 'bar', tooltip: true },
  encoding: {
    x: { field: 'partner_region', type: 'nominal', title: 'Region', sort: '-y' },
    y: { field: 'silent_count', type: 'quantitative', title: 'Silent failures' },
    color: { value: '#0071e3' },
    tooltip: [
      { field: 'partner_region' },
      { field: 'silent_count', type: 'quantitative' },
    ],
  },
  config: { view: { stroke: null } },
};

const trend = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: 'Silent failure trend (1h)',
  data: {
    url: {
      ...ES_QL,
      query: `FROM npe-synthetic-transaction-details
${TIME}
| STATS silent_count = COUNT(*) WHERE silent_failure == true
  BY bucket = BUCKET(@timestamp, 1 hour)
| SORT bucket`,
    },
  },
  mark: { type: 'area', line: true, opacity: 0.35, color: '#e20074', tooltip: true },
  encoding: {
    x: { field: 'bucket', type: 'temporal', title: 'Time' },
    y: { field: 'silent_count', type: 'quantitative', title: 'Silent failures' },
    tooltip: [
      { field: 'bucket', type: 'temporal' },
      { field: 'silent_count', type: 'quantitative' },
    ],
  },
  config: { view: { stroke: null } },
};

const lookupPanel = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: 'Partner lookup table (partnerID → name / tier / region / NOC)',
  data: {
    url: {
      '%type%': 'esql',
      '%context%': false,
      query: `FROM npe-synthetic-partner-lookup
| KEEP partnerID, partner_name, partner_tier, partner_region, partner_channel, partner_owner
| SORT partner_name
| LIMIT 30`,
    },
  },
  transform: [
    {
      calculate:
        "datum.partnerID + '   ' + datum.partner_name + '   [' + datum.partner_tier + ']   ' + datum.partner_region + ' / ' + datum.partner_channel + '   → ' + datum.partner_owner",
      as: 'row',
    },
  ],
  mark: { type: 'text', align: 'left', baseline: 'middle', fontSize: 11, font: 'Menlo, monospace', color: '#1d1d1f' },
  encoding: {
    y: { field: 'row', type: 'nominal', sort: 'ascending', axis: null },
    text: { field: 'row', type: 'nominal' },
  },
  autosize: 'none',
  height: { step: 18 },
  config: { view: { stroke: null } },
};

const partnerRegionMap = {
  $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
  title: 'Silent failures by partnerID · mapped by region',
  config: {
    view: { stroke: null },
    kibana: {
      type: 'map',
      latitude: 39.5,
      longitude: -98.0,
      zoom: 3.4,
      minZoom: 2,
      maxZoom: 10,
      scrollWheelZoom: false,
      zoomControl: true,
      emsTileServiceId: 'road_map_desaturated',
      delayRepaint: true,
    },
  },
  data: {
    url: {
      ...ES_QL,
      query: `FROM npe-synthetic-transaction-details
${TIME}
| WHERE silent_failure == true
| STATS
    silent_count = COUNT(*),
    latitude = MAX(latitude),
    longitude = MAX(longitude)
  BY partnerID, partner_name, partner_region, partner_tier, partner_owner
| WHERE latitude IS NOT NULL AND longitude IS NOT NULL
| SORT silent_count DESC`,
    },
  },
  mark: {
    type: 'circle',
    opacity: 0.88,
    stroke: 'white',
    strokeWidth: 1.2,
    tooltip: true,
  },
  encoding: {
    longitude: { field: 'longitude', type: 'quantitative' },
    latitude: { field: 'latitude', type: 'quantitative' },
    size: {
      field: 'silent_count',
      type: 'quantitative',
      scale: { range: [140, 1100] },
      legend: { title: 'Silent failures' },
    },
    color: {
      field: 'partner_region',
      type: 'nominal',
      title: 'Region',
      legend: { orient: 'bottom', columns: 4 },
    },
    tooltip: [
      { field: 'partnerID', type: 'nominal', title: 'partnerID' },
      { field: 'partner_name', type: 'nominal', title: 'Partner' },
      { field: 'partner_region', type: 'nominal', title: 'Region' },
      { field: 'partner_tier', type: 'nominal', title: 'Tier' },
      { field: 'partner_owner', type: 'nominal', title: 'NOC owner' },
      { field: 'silent_count', type: 'quantitative', title: 'Silent failures' },
      { field: 'latitude', type: 'quantitative', title: 'Lat', format: '.2f' },
      { field: 'longitude', type: 'quantitative', title: 'Lon', format: '.2f' },
    ],
  },
};

const viz = [
  { id: 'npe-noc-kpi-silent', title: 'KPI · Silent failures', spec: kpiSilentSimple, layout: { x: 0, y: 0, w: 12, h: 6 } },
  { id: 'npe-noc-kpi-offenders', title: 'KPI · Offending partners', spec: kpiPartners, layout: { x: 12, y: 0, w: 12, h: 6 } },
  { id: 'npe-noc-kpi-hard', title: 'KPI · Hard failures', spec: kpiHard, layout: { x: 24, y: 0, w: 12, h: 6 } },
  { id: 'npe-noc-kpi-pattern', title: 'KPI · Pattern drift', spec: kpiPattern, layout: { x: 36, y: 0, w: 12, h: 6 } },
  { id: 'npe-noc-partner-map', title: 'Partner map by region', spec: partnerRegionMap, layout: { x: 0, y: 6, w: 48, h: 16 } },
  { id: 'npe-noc-pattern-feature-speed', title: 'Pattern change · feature × speed', spec: patternByFeatureSpeed, layout: { x: 0, y: 22, w: 24, h: 14 } },
  { id: 'npe-noc-top-offenders', title: 'Top offenders', spec: topOffenders, layout: { x: 24, y: 22, w: 24, h: 14 } },
  { id: 'npe-noc-by-region', title: 'By region', spec: byRegion, layout: { x: 0, y: 36, w: 24, h: 8 } },
  { id: 'npe-noc-trend', title: 'Trend', spec: trend, layout: { x: 24, y: 36, w: 24, h: 8 } },
  { id: 'npe-noc-offender-board', title: 'Offender board', spec: offendersTable, layout: { x: 0, y: 44, w: 48, h: 12 } },
  { id: 'npe-noc-partner-lookup', title: 'Partner lookup', spec: lookupPanel, layout: { x: 0, y: 56, w: 48, h: 14 } },
];

const objects = [
  ...viz.map((v) => buildVisualization(v.id, v.title, v.spec)),
  buildDashboard(
    'npe-noc-silent-failures',
    'NPE NOC · Silent Failures & Top Offenders',
    'NOC board: silent failures, Jian Yao pattern drift (feature×speed), partnerID lookup + regional map.',
    viz.map((v) => ({ vizId: v.id, ...v.layout })),
  ),
];

console.log(`Deploying NOC dashboard to ${KIBANA_URL}...`);
const result = await importObjects(objects);
console.log(`Imported ${result.successCount} objects.`);
console.log(
  `Dashboard URL: ${KIBANA_URL}/app/dashboards#/view/npe-noc-silent-failures?_g=(time:(from:now-7d,to:now))`,
);

// silence unused
void kpiSilent;
