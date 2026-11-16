/**
 * Kibana Discover deep links — always ES|QL mode (shared by app + API routes).
 *
 * Matches Discover app locator + setStateToKbnUrl:
 *   1. rison-encode state with literal spaces in the ES|QL string
 *   2. replace spaces with %20 in the encoded rison (pctEncodeSpaces)
 *   3. open a new tab labeled "Discover" (not "ES|QL") with dataSource.type=esql
 *
 * Keep queries short — very long ES|QL in the hash can truncate `_a` so Kibana
 * keeps classic/KQL mode while still applying `_tab` (looks like an ES|QL tab
 * that still shows "Query in ES|QL").
 */

import rison from 'rison';

/** Rison-encode then pct-encode spaces like Kibana setStateToKbnUrl */
function encodeKbnState(state) {
  return rison.encode(state).replace(/ /g, '%20');
}

/**
 * Build a Discover URL that opens in ES|QL mode with the given query preloaded.
 * @param {string} kibanaBase
 * @param {{ query: string, timeFrom?: string, timeTo?: string, tabLabel?: string }} opts
 */
export function kibanaDiscoverUrl(
  kibanaBase,
  { query, timeFrom = 'now-90d', timeTo = 'now', tabLabel = 'Discover' } = {},
) {
  const base = (kibanaBase || '').replace(/\/$/, '');
  if (!base || !query) return null;

  // Prefer a compact single-line query for URL safety
  const esql = String(query).replace(/\s+/g, ' ').trim();

  const globalState = {
    filters: [],
    refreshInterval: { pause: true, value: 60000 },
    time: { from: timeFrom, to: timeTo },
  };

  const appState = {
    dataSource: { type: 'esql' },
    query: { esql },
  };

  const tabState = {
    tabId: 'new',
    tabLabel,
  };

  // Order matches Discover locator tests: _a then _tab (with _g for time)
  const hash = `/?_g=${encodeKbnState(globalState)}&_a=${encodeKbnState(appState)}&_tab=${encodeKbnState(tabState)}`;
  return `${base}/app/discover#${hash}`;
}
