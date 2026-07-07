/**
 * ES|QL for Kibana Discover deep links — maps OTel demo service names to telco labels.
 * Underlying cluster still uses checkout/cart/payment; EVAL renames for NOC-facing views.
 */

export const TELCO_OTEL_INDEX = 'logs-generic.otel-default';

export const TELCO_OTEL_SERVICE_FILTER =
  'service.name IN ("checkout", "payment", "cart", "checkoutservice", "paymentservice", "frauddetectionservice", "frontend-web", "kafka")';

export const TELCO_SERVICE_EVAL = [
  '| EVAL telco_service = CASE(',
  'service.name == "checkout" OR service.name == "checkoutservice", "Core Signaling (5G AMF/SMF)",',
  'service.name == "payment" OR service.name == "paymentservice", "Billing & Charging",',
  'service.name == "cart", "Service Provisioning",',
  'service.name == "frauddetectionservice", "Fraud & Abuse Detection",',
  'service.name == "frontend-web", "Customer Self-Care Portal",',
  'service.name == "kafka", "Network Event Bus",',
  'COALESCE(service.name, "Unknown"))',
].join(' ');

export function escapeEsql(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/** Default header / core pipeline — volume by telco service */
export function buildTelcoPipelineDiscoverEsql() {
  return [
    `FROM ${TELCO_OTEL_INDEX}`,
    `| WHERE ${TELCO_OTEL_SERVICE_FILTER}`,
    TELCO_SERVICE_EVAL,
    '| STATS volume = COUNT(*), errors = COUNT(*) WHERE log.level IN ("ERROR", "Error", "WARN", "Warning") BY telco_service',
    '| EVAL error_rate_pct = ROUND(errors * 100.0 / volume, 3)',
    '| SORT volume DESC',
    '| LIMIT 10',
  ].join(' ');
}

/** Region context — optional regionId scopes to REG-* in log body */
export function buildTelcoRegionsDiscoverEsql(regionId) {
  const filters = [TELCO_OTEL_SERVICE_FILTER];
  if (regionId) {
    const rid = escapeEsql(regionId);
    filters.push(`(body.text LIKE "*regionID=${rid}*" OR body.text LIKE "*${rid}*")`);
  } else {
    filters.push('(body.text LIKE "*regionID=*" OR body.text LIKE "*REG-*" OR host.name LIKE "*amf*" OR host.name LIKE "*smf*")');
  }

  return [
    `FROM ${TELCO_OTEL_INDEX}`,
    `| WHERE ${filters.join(' AND ')}`,
    TELCO_SERVICE_EVAL,
    '| KEEP @timestamp, telco_service, log.level, body.text, host.name, trace.id',
    '| SORT @timestamp DESC',
    '| LIMIT 50',
  ].join(' ');
}

/** Trace-correlated logs for troubleshooting */
export function buildTelcoTracesDiscoverEsql({ traceId, regionId } = {}) {
  const filters = [TELCO_OTEL_SERVICE_FILTER, 'trace.id IS NOT NULL'];
  if (traceId) filters.push(`trace.id == "${escapeEsql(traceId)}"`);
  if (regionId) filters.push(`body.text LIKE "*${escapeEsql(regionId)}*"`);

  return [
    `FROM ${TELCO_OTEL_INDEX}`,
    `| WHERE ${filters.join(' AND ')}`,
    TELCO_SERVICE_EVAL,
    '| KEEP @timestamp, telco_service, log.level, body.text, trace.id, host.name',
    '| SORT @timestamp DESC',
    '| LIMIT 50',
  ].join(' ');
}

/** iPhone 18 launch — provisioning, eSIM, activation signals */
export function buildTelcoLaunchDiscoverEsql() {
  return [
    `FROM ${TELCO_OTEL_INDEX}`,
    `| WHERE ${TELCO_OTEL_SERVICE_FILTER} AND (body.text LIKE "*iPhone*" OR body.text LIKE "*eSIM*" OR body.text LIKE "*provisioning*" OR body.text LIKE "*launch*" OR body.text LIKE "*SM-DP*" OR body.text LIKE "*activation*")`,
    TELCO_SERVICE_EVAL,
    '| KEEP @timestamp, telco_service, log.level, body.text, trace.id',
    '| SORT @timestamp DESC',
    '| LIMIT 50',
  ].join(' ');
}

/** API pipeline stats (same services filter as live overview) */
export function buildTelcoNetworkPipelineStatsEsql() {
  return [
    `FROM ${TELCO_OTEL_INDEX}`,
    `| WHERE ${TELCO_OTEL_SERVICE_FILTER}`,
    '| STATS session_count = COUNT(*), errors = COUNT(*) WHERE log.level == "ERROR" OR log.level == "Error" BY service.name',
    '| SORT session_count DESC',
  ].join(' ');
}

export function buildTelcoRecentErrorsEsql() {
  return [
    `FROM ${TELCO_OTEL_INDEX}`,
    `| WHERE ${TELCO_OTEL_SERVICE_FILTER} AND (log.level == "ERROR" OR log.level == "Error")`,
    '| KEEP @timestamp, service.name, log.level, body.text, host.name, trace.id',
    '| SORT @timestamp DESC',
    '| LIMIT 10',
  ].join(' ');
}
