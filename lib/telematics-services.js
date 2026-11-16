/**
 * Telematics APM / OTLP service catalog — names customers see in Service inventory.
 * Injected via scripts/inject-telematics-otlp.mjs onto f74145.
 */

export const TELEMATICS_ENVIRONMENT = 'telematics';

export const TELEMATICS_APM_SERVICES = [
  {
    name: 'vehicle-gateway',
    label: 'Vehicle Gateway (OBD/CAN)',
    transaction: 'POST /v1/obd/ingest',
    latencyMs: [40, 180],
    errorRate: 0.02,
  },
  {
    name: 'direct-to-device',
    label: 'Direct-to-Device (eSIM / 5G SA)',
    transaction: 'POST /v1/d2d/session',
    latencyMs: [25, 95],
    errorRate: 0.015,
  },
  {
    name: 'fleet-provisioning',
    label: 'Fleet Provisioning',
    transaction: 'POST /v1/fleet/activate',
    latencyMs: [80, 320],
    errorRate: 0.03,
  },
  {
    name: 'subscription-billing',
    label: 'Subscription & Billing',
    transaction: 'POST /v1/billing/rateplan',
    latencyMs: [60, 220],
    errorRate: 0.025,
  },
  {
    name: 'telematics-event-bus',
    label: 'Telematics Event Bus',
    transaction: 'PUBLISH telematics.events',
    latencyMs: [8, 45],
    errorRate: 0.01,
  },
  {
    name: 'driver-portal',
    label: 'Driver Portal',
    transaction: 'GET /portal/fleet',
    latencyMs: [50, 160],
    errorRate: 0.02,
  },
  {
    name: 'anomaly-detection',
    label: 'Anomaly Detection',
    transaction: 'POST /v1/ml/score',
    latencyMs: [90, 280],
    errorRate: 0.04,
  },
  {
    name: 'streaming-qoe',
    label: 'In-Cabin Streaming QoE',
    transaction: 'GET /v1/stream/session',
    latencyMs: [30, 400],
    errorRate: 0.06,
  },
];

export const TELEMATICS_SERVICE_NAMES = TELEMATICS_APM_SERVICES.map((s) => s.name);

/** KQL for APM service inventory filter */
export function telematicsApmKuery() {
  return TELEMATICS_SERVICE_NAMES.map((n) => `service.name : "${n}"`).join(' or ');
}
