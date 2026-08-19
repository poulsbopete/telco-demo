/**
 * Kibana Discover deep links — always ES|QL mode (shared by app + API routes).
 */

function risonQuote(str) {
  if (/^[\w\-.*@]+$/.test(str)) return str;
  return `'${String(str).replace(/'/g, "!'")}'`;
}

function risonEncode(value) {
  if (value === null || value === undefined) return '!n';
  if (value === true) return '!t';
  if (value === false) return '!f';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return risonQuote(value);
  if (Array.isArray(value)) {
    return value.length ? `!(${value.map(risonEncode).join(',')})` : '!()';
  }
  if (typeof value === 'object') {
    return `(${Object.entries(value).map(([k, v]) => `${k}:${risonEncode(v)}`).join(',')})`;
  }
  return String(value);
}

/** Build a Discover URL that opens in ES|QL mode with the given query preloaded */
export function kibanaDiscoverUrl(kibanaBase, { query, timeFrom = 'now-90d', timeTo = 'now' } = {}) {
  const base = (kibanaBase || '').replace(/\/$/, '');
  if (!base || !query) return null;

  const appState = {
    dataSource: { type: 'esql' },
    filters: [],
    interval: 'auto',
    query: { esql: query },
    sort: [],
  };
  const globalState = {
    filters: [],
    refreshInterval: { pause: true, value: 60000 },
    time: { from: timeFrom, to: timeTo },
  };

  const hash = `/?_g=${risonEncode(globalState)}&_a=${risonEncode(appState)}`;
  return `${base}/app/discover#${hash}`;
}
