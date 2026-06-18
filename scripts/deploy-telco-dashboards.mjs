#!/usr/bin/env node
/**
 * Deploy Telco NOC Vega dashboards to a Kibana Serverless project via the import API.
 *
 * Usage:
 *   npm run deploy:dashboard:observability
 *   npm run deploy:dashboard:search
 *   npm run deploy:dashboard:security
 *
 * Credentials (first match wins):
 *   observability — .env.local ES_API_KEY + VITE_KIBANA_URL
 *   search        — telco-agent/.env KIBANA_API_KEY + KIBANA_BASE_URL (or env overrides)
 *   security      — SECURITY_KIBANA_API_KEY + VITE_SECURITY_KIBANA_URL (or env overrides)
 */

import { randomUUID } from 'crypto';
import { config as loadEnv } from 'dotenv';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

loadEnv({ path: resolve(ROOT, '.env.local') });

const TARGET = process.argv[2];

if (TARGET === 'search' && existsSync(resolve(ROOT, '../telco-agent/.env'))) {
  loadEnv({ path: resolve(ROOT, '../telco-agent/.env'), override: true });
}

const TARGET_DEFAULTS = {
  observability: {
    kibanaUrl: process.env.VITE_KIBANA_URL || process.env.KIBANA_URL,
    apiKey: process.env.ES_API_KEY,
  },
  search: {
    kibanaUrl: process.env.KIBANA_BASE_URL || process.env.VITE_SEARCH_KIBANA_URL || process.env.SEARCH_KIBANA_URL,
    apiKey: process.env.KIBANA_API_KEY || process.env.SEARCH_KIBANA_API_KEY,
  },
  security: {
    kibanaUrl: process.env.VITE_SECURITY_KIBANA_URL || process.env.SECURITY_KIBANA_URL,
    apiKey: process.env.SECURITY_KIBANA_API_KEY || process.env.SECURITY_ES_API_KEY,
  },
};

const defaults = TARGET_DEFAULTS[TARGET] || {};
const KIBANA_URL = (defaults.kibanaUrl || '').replace(/\/$/, '');
const API_KEY = defaults.apiKey || '';

if (!TARGET || !['observability', 'search', 'security'].includes(TARGET)) {
  console.error('Usage: KIBANA_URL=... KIBANA_API_KEY=... node scripts/deploy-telco-dashboards.mjs <observability|search|security>');
  process.exit(1);
}

if (!KIBANA_URL || !API_KEY) {
  console.error('Missing KIBANA_URL or KIBANA_API_KEY / ES_API_KEY');
  process.exit(1);
}

function vegaSpec(spec) {
  return JSON.stringify(spec, null, 2);
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
        params: { spec: vegaSpec(spec) },
        aggs: [],
      }),
      uiStateJSON: '{}',
      description: 'Telco NOC demo — created by scripts/deploy-telco-dashboards.mjs',
      kibanaSavedObjectMeta: { searchSourceJSON: '{}' },
    },
    references: [],
  };
}

function buildDashboard(id, title, description, panels, timeFrom = 'now-7d', timeTo = 'now') {
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
      timeFrom,
      timeTo,
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

const ES_QL = {
  '%type%': 'esql',
  '%context%': true,
  '%timefield%': '@timestamp',
};

/** Dashboard time range — required when %timefield% is set on Vega ES|QL data sources */
const ES_QL_TIME_WHERE = '| WHERE @timestamp >= ?_tstart AND @timestamp <= ?_tend';

const TARGETS = {
  observability: {
    dashboardId: 'telco-demo-network-telemetry',
    title: 'Telco NOC — Network Telemetry',
    description: '5G core OTel logs, service volume, errors, and Adaptive Networks fault injection (otel-demo).',
    visualizations: [
      {
        id: 'telco-o11y-log-volume',
        title: 'OTel Log Volume Over Time',
        spec: {
          $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
          title: 'OTel Log Volume Over Time',
          data: {
            url: {
              ...ES_QL,
              query: `FROM logs-generic.otel-default
| STATS count = COUNT(*) BY bucket = BUCKET(@timestamp, 75, ?_tstart, ?_tend)
| SORT bucket ASC`,
            },
          },
          mark: { type: 'area', line: true, opacity: 0.35 },
          encoding: {
            x: { field: 'bucket', type: 'temporal', title: 'Time' },
            y: { field: 'count', type: 'quantitative', title: 'Log events' },
            tooltip: [
              { field: 'bucket', type: 'temporal', title: 'Time' },
              { field: 'count', type: 'quantitative', title: 'Events' },
            ],
          },
        },
        layout: { x: 0, y: 0, w: 48, h: 12 },
      },
      {
        id: 'telco-o11y-top-services',
        title: 'Top Services by Log Volume',
        spec: {
          $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
          title: 'Top Services by Log Volume',
          data: {
            url: {
              ...ES_QL,
              query: `FROM logs-generic.otel-default
${ES_QL_TIME_WHERE}
| STATS volume = COUNT(*) BY service = \`service.name\`
| SORT volume DESC
| LIMIT 10`,
            },
          },
          mark: 'bar',
          encoding: {
            y: { field: 'service', type: 'nominal', sort: '-x', title: 'Service' },
            x: { field: 'volume', type: 'quantitative', title: 'Events' },
            color: { field: 'volume', type: 'quantitative', legend: null, scale: { scheme: 'blues' } },
          },
        },
        layout: { x: 0, y: 12, w: 24, h: 12 },
      },
      {
        id: 'telco-o11y-errors',
        title: 'Errors & Warnings Over Time',
        spec: {
          $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
          title: 'Errors & Warnings Over Time',
          data: {
            url: {
              ...ES_QL,
              query: `FROM logs-generic.otel-default
| WHERE log.level IN ("ERROR", "Error", "WARN", "Warning")
| STATS errors = COUNT(*) BY bucket = BUCKET(@timestamp, 75, ?_tstart, ?_tend)
| SORT bucket ASC`,
            },
          },
          mark: { type: 'line', point: true },
          encoding: {
            x: { field: 'bucket', type: 'temporal', title: 'Time' },
            y: { field: 'errors', type: 'quantitative', title: 'Events' },
            color: { value: '#00bfb3' },
          },
        },
        layout: { x: 24, y: 12, w: 24, h: 12 },
      },
      {
        id: 'telco-o11y-adaptive-faults',
        title: 'Adaptive Networks Fault Types',
        spec: {
          $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
          title: 'Adaptive Networks Fault Types',
          data: {
            url: {
              ...ES_QL,
              query: `FROM logs.otel.adaptive-networks*
| WHERE @timestamp >= ?_tstart AND @timestamp <= ?_tend AND severity_text == "ERROR"
| EVAL fault = CASE(
    body.text LIKE "*SW_MATM*", "MAC Flap",
    body.text LIKE "*SPANTREE*", "STP",
    body.text LIKE "*BGP-3*", "BGP",
    body.text LIKE "*INTF-4*", "Interface",
    "Other")
| STATS errors = COUNT(*) BY fault
| SORT errors DESC
| LIMIT 10`,
            },
          },
          mark: 'bar',
          encoding: {
            y: { field: 'fault', type: 'nominal', sort: '-x', title: 'Fault type' },
            x: { field: 'errors', type: 'quantitative', title: 'Events' },
            color: { value: '#00bfb3' },
          },
        },
        layout: { x: 0, y: 24, w: 48, h: 12 },
      },
    ],
  },
  search: {
    dashboardId: 'telco-demo-enterprise-search',
    title: 'Telco NOC — Enterprise Search',
    description: 'telco-tmobile-kb knowledge base coverage for IVR/chat deflection (ai-assistants).',
    timeFrom: 'now-365d',
    visualizations: [
      {
        id: 'telco-search-total-articles',
        title: 'KB Articles',
        spec: {
          $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
          title: 'KB Articles',
          data: {
            url: {
              '%type%': 'esql',
              '%context%': false,
              query: 'FROM telco-tmobile-kb | STATS `Articles` = COUNT(*)',
            },
          },
          mark: { type: 'text', fontSize: 48, fontWeight: 'bold', color: '#e20074' },
          encoding: {
            text: { field: 'Articles', type: 'quantitative' },
          },
          view: { stroke: null },
        },
        layout: { x: 0, y: 0, w: 12, h: 8 },
      },
      {
        id: 'telco-search-by-carrier',
        title: 'Articles by Carrier',
        spec: {
          $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
          title: 'Articles by Carrier',
          data: {
            url: {
              '%type%': 'esql',
              '%context%': false,
              query: `FROM telco-tmobile-kb
| STATS articles = COUNT(*) BY carrier
| SORT articles DESC`,
            },
          },
          mark: 'arc',
          encoding: {
            theta: { field: 'articles', type: 'quantitative' },
            color: { field: 'carrier', type: 'nominal', title: 'Carrier' },
          },
        },
        layout: { x: 12, y: 0, w: 16, h: 12 },
      },
      {
        id: 'telco-search-by-section',
        title: 'Top KB Sections',
        spec: {
          $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
          title: 'Top KB Sections',
          data: {
            url: {
              '%type%': 'esql',
              '%context%': false,
              query: `FROM telco-tmobile-kb
| STATS articles = COUNT(*) BY section
| SORT articles DESC
| LIMIT 12`,
            },
          },
          mark: 'bar',
          encoding: {
            y: { field: 'section', type: 'nominal', sort: '-x', title: 'Section' },
            x: { field: 'articles', type: 'quantitative', title: 'Articles' },
            color: { value: '#00bfb3' },
          },
        },
        layout: { x: 28, y: 0, w: 20, h: 12 },
      },
      {
        id: 'telco-search-recent-titles',
        title: 'Recent KB Articles',
        spec: {
          $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
          title: 'Recent KB Articles',
          data: {
            url: {
              '%type%': 'esql',
              '%context%': false,
              query: `FROM telco-tmobile-kb
| SORT fetched_at DESC
| KEEP title, carrier, section, url
| LIMIT 15`,
            },
          },
          mark: { type: 'text', align: 'left', baseline: 'middle', dx: 3 },
          encoding: {
            y: { field: 'title', type: 'ordinal', sort: null, title: null, axis: null },
            text: { field: 'title', type: 'nominal' },
          },
          view: { stroke: null },
        },
        layout: { x: 0, y: 12, w: 48, h: 14 },
      },
    ],
  },
  security: {
    dashboardId: 'telco-demo-elastic-security',
    title: 'Telco NOC — Elastic Security',
    description: 'SIEM alert posture, severity mix, and investigation timeline (my-security-project).',
    visualizations: [
      {
        id: 'telco-sec-open-alerts',
        title: 'Open Security Alerts',
        spec: {
          $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
          title: 'Open Security Alerts',
          data: {
            url: {
              ...ES_QL,
              query: `FROM .alerts-security.alerts-default
| WHERE kibana.alert.workflow_status == "open"
| STATS \`Open Alerts\` = COUNT(*)`,
            },
          },
          mark: { type: 'text', fontSize: 48, fontWeight: 'bold', color: '#bd271e' },
          encoding: { text: { field: 'Open Alerts', type: 'quantitative' } },
          view: { stroke: null },
        },
        layout: { x: 0, y: 0, w: 12, h: 8 },
      },
      {
        id: 'telco-sec-by-severity',
        title: 'Alerts by Severity',
        spec: {
          $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
          title: 'Alerts by Severity',
          data: {
            url: {
              ...ES_QL,
              query: `FROM .alerts-security.alerts-default
| STATS alerts = COUNT(*) BY \`Severity\` = kibana.alert.severity
| SORT alerts DESC`,
            },
          },
          mark: 'bar',
          encoding: {
            x: { field: 'Severity', type: 'nominal', title: 'Severity' },
            y: { field: 'alerts', type: 'quantitative', title: 'Alerts' },
            color: {
              field: 'Severity',
              type: 'nominal',
              scale: {
                domain: ['low', 'medium', 'high', 'critical'],
                range: ['#54b399', '#f5a700', '#f66', '#bd271e'],
              },
            },
          },
        },
        layout: { x: 12, y: 0, w: 18, h: 12 },
      },
      {
        id: 'telco-sec-over-time',
        title: 'Security Alerts Over Time',
        spec: {
          $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
          title: 'Security Alerts Over Time',
          data: {
            url: {
              ...ES_QL,
              query: `FROM .alerts-security.alerts-default
| STATS alerts = COUNT(*) BY bucket = BUCKET(@timestamp, 75, ?_tstart, ?_tend)
| SORT bucket ASC`,
            },
          },
          mark: { type: 'area', line: true, opacity: 0.4, color: '#bd271e' },
          encoding: {
            x: { field: 'bucket', type: 'temporal', title: 'Time' },
            y: { field: 'alerts', type: 'quantitative', title: 'Alerts' },
          },
        },
        layout: { x: 30, y: 0, w: 18, h: 12 },
      },
      {
        id: 'telco-sec-top-rules',
        title: 'Top Detection Rules',
        spec: {
          $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
          title: 'Top Detection Rules',
          data: {
            url: {
              ...ES_QL,
              query: `FROM .alerts-security.alerts-default
| STATS alerts = COUNT(*) BY \`Rule\` = kibana.alert.rule.name
| SORT alerts DESC
| LIMIT 10`,
            },
          },
          mark: 'bar',
          encoding: {
            y: { field: 'Rule', type: 'nominal', sort: '-x', title: 'Rule' },
            x: { field: 'alerts', type: 'quantitative', title: 'Alerts' },
            color: { value: '#00bfb3' },
          },
        },
        layout: { x: 0, y: 12, w: 48, h: 14 },
      },
    ],
  },
};

async function importObjects(objects) {
  const ndjson = objects.map(obj => JSON.stringify(obj)).join('\n');
  const blob = new Blob([ndjson], { type: 'application/x-ndjson' });
  const form = new FormData();
  form.append('file', blob, 'telco-dashboard.ndjson');

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
    const errors = data.errors?.map(e => e.error?.message || JSON.stringify(e)).join('; ');
    throw new Error(errors || data.message || `Import failed (${res.status})`);
  }
  return data;
}

async function main() {
  const cfg = TARGETS[TARGET];
  const objects = [
    ...cfg.visualizations.map(v => buildVisualization(v.id, v.title, v.spec)),
    buildDashboard(
      cfg.dashboardId,
      cfg.title,
      cfg.description,
      cfg.visualizations.map(v => ({ vizId: v.id, ...v.layout })),
      cfg.timeFrom || 'now-7d',
      cfg.timeTo || 'now',
    ),
  ];

  console.log(`Deploying ${cfg.title} to ${KIBANA_URL} (${objects.length} saved objects)...`);
  const result = await importObjects(objects);
  console.log(`Imported ${result.successCount} objects.`);
  console.log(`Dashboard URL: ${KIBANA_URL}/app/dashboards#/view/${cfg.dashboardId}`);
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
