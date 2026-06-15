/** Shared checkout incident context — aligned with sample-traces.json & Observability dashboard */
export const CHECKOUT_INCIDENT = {
  traceId: 'trace-checkout-001',
  service: 'checkout-api',
  version: '2.3.1',
  durationMs: 847,
  criticalSpan: 'db.query',
  criticalSpanMs: 612,
  fraudSpan: 'fraud.check',
  fraudSpanMs: 89,
  rootCause: 'Database connection pool exhaustion causing 612ms query latency',
  poolConnections: { active: 48, max: 50 },
  cartId: 'CRT-8847291',
  errorLog: 'Connection pool exhausted: max 50 connections reached',
};

export function checkoutPrompt(regionId, regionName) {
  return `${CHECKOUT_INCIDENT.traceId} · ${CHECKOUT_INCIDENT.service} v${CHECKOUT_INCIDENT.version} · ${CHECKOUT_INCIDENT.durationMs}ms ERROR · regions ${regionId} (${regionName})`;
}
