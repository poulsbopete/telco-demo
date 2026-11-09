/** Data sources for the Telematics tab — otel-demo OpenTelemetry + Prometheus pipeline */

export const TELEMATICS_TELEMETRY_SOURCES = [
  {
    id: 'otel-logs',
    label: 'OpenTelemetry logs',
    detail: 'Gateway + direct-to-device ingest remapped from otel-demo checkout · payment · cart services',
    destination: 'logs-generic.otel-default',
  },
  {
    id: 'otel-traces',
    label: 'OpenTelemetry traces',
    detail: 'APM service maps and failover path latency — same OTLP pipeline',
    destination: 'traces-apm.*',
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
  'Correlate regional gateways and next-gen direct-to-device sessions on the same otel-demo cluster — OpenTelemetry + Prometheus, with alerts that open tickets and steer failover when hubs degrade.';
