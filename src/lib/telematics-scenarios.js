/** Next-gen IoT / telematics demo narratives for the Telematics tab */

export const TELEMATICS_CONNECTIVITY_PATHS = [
  {
    id: 'gateway',
    label: 'Regional gateway',
    detail: 'Vehicle OBD → RAN → regional hub → Kafka → OTLP / Prometheus',
  },
  {
    id: 'direct-to-device',
    label: 'Direct to device',
    detail: 'eSIM / 5G SA session to cloud edge — bypasses regional gateway when hub degrades',
  },
];

export const TELEMATICS_USE_CASES = [
  {
    id: 'failover-d2d',
    title: 'Failover to direct-to-device',
    trigger: 'Gateway degraded or offline',
    action: 'Steer sessions to eSIM D2D path; keep critical telematics alive',
    elastic: 'Alert on gateway latency / packet loss → workflow remediates routing',
    severity: 'p2',
  },
  {
    id: 'ticket-on-drop',
    title: 'Auto-open care ticket',
    trigger: 'Connection drop > SLA or offline > 2 min',
    action: 'Open ServiceNow / care ticket with gateway, VIN cohort, and last telemetry',
    elastic: 'Watcher / Kibana alert → connector creates ticket with ES|QL context',
    severity: 'p1',
  },
  {
    id: 'streaming-qoe',
    title: 'In-cabin streaming QoE',
    trigger: 'Stream rebuffer / bitrate collapse',
    action: 'Correlate QoE drop with RAN + gateway health; protect satisfaction score',
    elastic: 'Prometheus stream metrics + OTel logs; ML on satisfaction / drop rate',
    severity: 'p2',
  },
];

export const TELEMATICS_FAILOVER_STEPS = [
  { t: '0–30 s', label: 'Signal', detail: 'Gateway latency spike or heartbeat miss on regional hub' },
  { t: '30–90 s', label: 'Detect', detail: 'Alert fires; ES|QL confirms packet loss and vehicle cohort impact' },
  { t: '1–3 m', label: 'Failover', detail: 'Policy moves eligible SIMs to direct-to-device (5G SA / eSIM edge)' },
  { t: 'Same window', label: 'Ticket', detail: 'Care ticket opened with gateway ID, region, and streaming QoE delta' },
];
