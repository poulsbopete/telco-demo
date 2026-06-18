export const TELEMETRY_SOURCES = [
  {
    id: 'otel-logs',
    label: 'OTel logs',
    detail: 'Cisco-style syslog mnemonics from network-controller',
    destination: 'logs.otel.adaptive-networks',
    examples: 'SW_MATM · SPANTREE · BGP-3 · INTF-4',
  },
  {
    id: 'otel-metrics',
    label: 'OTel metrics',
    detail: 'SNMP-style gauges exported via OTLP /v1/metrics',
    destination: 'metrics-* · generic.otel',
    examples: 'network.interface.in_errors · network.bgp.peers_established',
  },
  {
    id: 'prometheus',
    label: 'Prometheus metrics',
    detail: 'otel-demo shop + K8s scrape targets (hybrid correlation)',
    destination: 'metrics-apm.app.* · metrics-k8sclusterreceiver.otel-default',
    examples: 'Microservice SLOs · pod CPU/memory · cluster health',
  },
];

export const TELEMETRY_INGEST_SUMMARY =
  'Fault inject sends OTel logs and metrics to Elastic Cloud; alerts and RCA also correlate otel-demo Prometheus-backed service metrics.';
