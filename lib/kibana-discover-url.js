/**
 * Kibana Discover deep links — always ES|QL mode (shared by app + API routes).
 *
 * Matches Discover app locator output (see kibana discover app_locator.test.ts):
 *   _a=(dataSource:(type:esql),query:(esql:'FROM%20logs%20|%20LIMIT%2010'))
 *   &_tab=(tabId:new,tabLabel:'ES%7CQL')
 *
 * New Discover uses tabs; without _tab=(tabId:new) the link opens the user's last
 * KQL/data-view session instead of ES|QL. Spaces must be %20 inside the rison-quoted
 * ES|QL string; a bare pipe in tabLabel must be quoted/encoded or the hash truncates.
 */

import rison from 'rison';

/** Kibana stores ES|QL with spaces as %20 inside a rison-quoted string */
function encodeEsqlQuery(query) {
  const normalized = String(query).replace(/\s+/g, ' ').trim().replace(/ /g, '%20');
  // Force a quoted rison string — npm rison leaves %20+| sequences unquoted otherwise
  return `'${normalized.replace(/'/g, "!'")}'`;
}

function encodeTabLabel(label) {
  const normalized = String(label).replace(/ /g, '%20').replace(/\|/g, '%7C');
  return `'${normalized.replace(/'/g, "!'")}'`;
}

/** Build a Discover URL that opens in ES|QL mode with the given query preloaded */
export function kibanaDiscoverUrl(kibanaBase, { query, timeFrom = 'now-90d', timeTo = 'now', tabLabel = 'ES|QL' } = {}) {
  const base = (kibanaBase || '').replace(/\/$/, '');
  if (!base || !query) return null;

  const globalState = {
    filters: [],
    refreshInterval: { pause: true, value: 60000 },
    time: { from: timeFrom, to: timeTo },
  };

  // Lean app state — mirrors Discover locator for aggregate (ES|QL) queries
  const appStateRison = `(dataSource:(type:esql),query:(esql:${encodeEsqlQuery(query)}))`;
  const tabStateRison = `(tabId:new,tabLabel:${encodeTabLabel(tabLabel)})`;
  const globalRison = rison.encode(globalState);

  const hash = `/?_g=${globalRison}&_a=${appStateRison}&_tab=${tabStateRison}`;
  return `${base}/app/discover#${hash}`;
}
