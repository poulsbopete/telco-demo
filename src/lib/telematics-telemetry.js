/** Data sources for the Telematics tab — f74145 OpenTelemetry + Prometheus pipeline */

export const TELEMATICS_TELEMETRY_SOURCES = [
  {
    id: 'otel-logs',
    label: 'OpenTelemetry logs',
    detail: 'vehicle-gateway · direct-to-device · fleet-provisioning · streaming-qoe',
    destination: 'logs-generic.otel-default',
  },
  {
    id: 'otel-traces',
    label: 'OpenTelemetry traces',
    detail: 'APM Service inventory — telematics environment (D2D failover + QoE latency)',
    destination: 'traces-apm.* · environment=telematics',
  },
  {
    id: 'prometheus',
    label: 'Prometheus metrics',
    detail: 'Gateway health, D2D session rate, in-cabin streaming QoE scrape targets',
    destination: 'metrics-* · metrics-apm.app.*',
  },
  {
    id: 'alerting',
    label: 'Alerts → tickets',
    detail: 'Connection drop / QoE breach opens care tickets via Kibana connectors',
    destination: 'Rules · Workflows · ServiceNow',
  },
];

export const TELEMATICS_TELEMETRY_SUMMARY =
  'Correlate regional gateways and next-gen direct-to-device on f74145 — APM services in the telematics environment, OpenTelemetry + Prometheus, with alerts that open tickets and steer failover when hubs degrade.';
