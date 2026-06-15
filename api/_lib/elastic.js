/**
 * Server-side Elasticsearch client for Vercel API routes.
 * Credentials stay in env vars — never exposed to the browser.
 */

const BLOCKED = /\b(DROP|DELETE|UPDATE|INSERT|CREATE|TRUNCATE|ALTER|REINDEX|SHARD)\b/i;

export function getElasticConfig() {
  const url = process.env.ES_URL || process.env.ELASTICSEARCH_URL;
  const apiKey = process.env.ES_API_KEY || process.env.ELASTICSEARCH_API_KEY;
  const kibanaUrl = process.env.KIBANA_URL || process.env.VITE_KIBANA_URL;

  if (!url || !apiKey) {
    return { ok: false, error: 'Missing ES_URL and ES_API_KEY environment variables' };
  }

  return {
    ok: true,
    url: url.replace(/\/$/, ''),
    apiKey,
    kibanaUrl: kibanaUrl || url.replace('.es.', '.kb.').replace(/:\d+$/, ''),
  };
}

export function assertReadOnlyQuery(query) {
  if (!query || typeof query !== 'string') {
    throw new Error('Query string is required');
  }
  const trimmed = query.trim();
  if (!trimmed.toUpperCase().startsWith('FROM')) {
    throw new Error('Only ES|QL queries starting with FROM are allowed');
  }
  if (BLOCKED.test(trimmed)) {
    throw new Error('Write operations are not permitted');
  }
  if (trimmed.length > 4000) {
    throw new Error('Query too long');
  }
  return trimmed;
}

export async function runEsql(query, { signal } = {}) {
  const config = getElasticConfig();
  if (!config.ok) throw new Error(config.error);

  const safeQuery = assertReadOnlyQuery(query);
  const start = Date.now();

  const response = await fetch(`${config.url}/_query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `ApiKey ${config.apiKey}`,
    },
    body: JSON.stringify({ query: safeQuery }),
    signal,
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const reason = body?.error?.reason || body?.error?.type || response.statusText;
    throw new Error(reason || `Elasticsearch error ${response.status}`);
  }

  return {
    columns: body.columns?.map(c => c.name) || [],
    values: body.values || [],
    tookMs: Date.now() - start,
    esTookMs: body.took,
  };
}

export function rowsToObjects(result) {
  const { columns, values } = result;
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

export async function getClusterInfo() {
  const config = getElasticConfig();
  if (!config.ok) throw new Error(config.error);

  const response = await fetch(`${config.url}`, {
    headers: { Authorization: `ApiKey ${config.apiKey}` },
  });

  if (!response.ok) throw new Error(`Cluster unreachable (${response.status})`);
  const body = await response.json();

  return {
    clusterName: body.cluster_name,
    version: body.version?.number,
    tagline: body.tagline,
    kibanaUrl: config.kibanaUrl,
  };
}

export const QUERIES = {
  overview: `
FROM logs-generic.otel-default
| STATS total = COUNT(*), errors = COUNT(*) WHERE log.level == "ERROR" OR log.level == "Error"
| LIMIT 1
`.trim(),

  services: `
FROM logs-generic.otel-default
| STATS count = COUNT(*) BY service.name
| WHERE service.name IS NOT NULL
| SORT count DESC
| LIMIT 12
`.trim(),

  logLevels: `
FROM logs*,-logstash*,filebeat-*
| STATS count = COUNT(*) BY log.level
| WHERE log.level IS NOT NULL
| SORT count DESC
| LIMIT 8
`.trim(),

  recentErrors: `
FROM logs-generic.otel-default
| WHERE log.level == "ERROR" OR log.level == "Error"
| KEEP @timestamp, service.name, log.level, body.text, host.name, trace.id
| SORT @timestamp DESC
| LIMIT 15
`.trim(),

  dataStreams: `
FROM logs-generic.otel-default
| STATS count = COUNT(*)
| LIMIT 1
`.trim(),
};

export function buildLogSearchQuery({ service, level, text, limit = 25, paymentOnly = false }) {
  const filters = [];
  if (paymentOnly) {
    filters.push('service.name IN ("checkout", "payment", "cart", "checkoutservice", "paymentservice")');
  }
  if (service) filters.push(`service.name == "${service.replace(/"/g, '')}"`);
  if (level) filters.push(`log.level == "${level.replace(/"/g, '')}"`);
  if (text) {
    const escaped = text.replace(/"/g, '').slice(0, 100);
    filters.push(`(body.text LIKE "*${escaped}*" OR message LIKE "*${escaped}*")`);
  }

  const where = filters.length ? `| WHERE ${filters.join(' AND ')}` : '';

  return `
FROM logs-generic.otel-default
${where}
| KEEP @timestamp, service.name, log.level, body.text, message, host.name, trace.id
| SORT @timestamp DESC
| LIMIT ${Math.min(Number(limit) || 25, 50)}
`.trim();
}
