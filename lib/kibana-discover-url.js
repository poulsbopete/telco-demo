/**
 * Kibana Discover deep links — always ES|QL mode (shared by app + API routes).
 *
 * New Discover uses tabs; without _tab=(tabId:new) the link opens the user's last
 * KQL/data-view session instead of ES|QL. ES|QL strings use %20 for spaces so Kibana
 * parses the rison app state reliably.
 */

import rison from 'rison';

/** Kibana share-link encoding for ES|QL query text inside rison strings */
function encodeEsqlForDiscoverUrl(esql) {
  return String(esql || '').replace(/ /g, '%20');
}

/** Build a Discover URL that opens in ES|QL mode with the given query preloaded */
export function kibanaDiscoverUrl(kibanaBase, { query, timeFrom = 'now-90d', timeTo = 'now' } = {}) {
  const base = (kibanaBase || '').replace(/\/$/, '');
  if (!base || !query) return null;

  const appState = {
    dataSource: { type: 'esql' },
    filters: [],
    interval: 'auto',
    query: { esql: encodeEsqlForDiscoverUrl(query) },
    sort: [],
  };
  const globalState = {
    filters: [],
    refreshInterval: { pause: true, value: 60000 },
    time: { from: timeFrom, to: timeTo },
  };
  const tabState = {
    tabId: 'new',
    tabLabel: 'ES|QL',
  };

  const hash = `/?_g=${rison.encode(globalState)}&_a=${rison.encode(appState)}&_tab=${rison.encode(tabState)}`;
  return `${base}/app/discover#${hash}`;
}
