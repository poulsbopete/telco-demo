/** Data sources for the Telematics tab — otel-demo OpenTelemetry + Prometheus pipeline */

export const TELEMATICS_TELEMETRY_SOURCES = [
  {
    id: 'otel-logs',
    label: 'OpenTelemetry logs',
    detail: 'Gateway ingest remapped from otel-demo checkout · payment · cart services',
    destination: 'logs-generic.otel-default',
  },
  {
    id: 'otel-traces',
    label: 'OpenTelemetry traces',
    detail: 'APM service maps and latency — same OTLP pipeline',
    destination: 'traces-apm.*',
  },
  {
    id: 'prometheus',
    label: 'Prometheus metrics',
    detail: 'Open-source scrape targets — K8s + otel-demo shop workloads',
    destination: 'metrics-* · metrics-apm.app.*',
  },
];

export const TELEMATICS_TELEMETRY_SUMMARY =
  'Kibana dashboards, Discover ES|QL, APM, and Metrics Explorer correlate OpenTelemetry and Prometheus on the same otel-demo cluster — no proprietary agent lock-in.';
