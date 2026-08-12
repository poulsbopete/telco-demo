---
slug: explore-metrics
id: pbylde3l8lqu
type: challenge
title: Explore telco metrics with ES|QL
teaser: Query live OpenTelemetry metrics — latency, errors, and regional signal quality
  stories.
notes:
- type: text
  contents: |
    ## Lab 2 — Explore metrics

    **By the end of this challenge you will:**

    - Run ES|QL against metrics and logs from the Telco NOC scenario
    - Locate latency / error patterns that matter to a CSP NOC
    - Connect metrics views to the service / host story in Observability

    Companion demo: **[Telco NOC](https://telco-demo-sage.vercel.app)** (Telemetry tab)
- type: text
  contents: |
    ## Metrics + OTel for telco

    Elastic stores OTel metrics alongside logs and traces. For a T-Mobile / CSP conversation, lead with:

    1. **Unified query** — ES|QL across signals (no PromQL-only silo)
    2. **Cardinality-aware** — Streams and shaping for high-cardinality labels
    3. **Same store for ML** — anomaly detection runs on the metrics you just queried
tabs:
- id: 90wi8jilrwlr
  title: Demo App
  type: service
  hostname: es3-api
  path: /
  port: 8090
- id: le2vcyb1ynay
  title: Elastic Serverless
  type: service
  hostname: es3-api
  path: /app/discover
  port: 8080
  custom_request_headers:
  - key: Content-Security-Policy
    value: 'script-src ''self'' https://kibana.estccdn.com; worker-src blob: ''self'';
      style-src ''unsafe-inline'' ''self'' https://kibana.estccdn.com; style-src-elem
      ''unsafe-inline'' ''self'' https://kibana.estccdn.com'
  custom_response_headers:
  - key: Content-Security-Policy
    value: 'script-src ''self'' https://kibana.estccdn.com; worker-src blob: ''self'';
      style-src ''unsafe-inline'' ''self'' https://kibana.estccdn.com; style-src-elem
      ''unsafe-inline'' ''self'' https://kibana.estccdn.com'
difficulty: basic
timelimit: 0
enhanced_loading: null
---

# Explore telco metrics with ES|QL

Use the **Elastic Serverless** tab. Prefer **Discover → ES|QL**. Set time to **Last 15 minutes**.

---

## 1. Service error counts (logs as a metric story)

```esql
FROM logs*
| WHERE severity_text == "ERROR" OR log.level == "ERROR"
| STATS errors = COUNT(*) BY service.name
| SORT errors DESC
| LIMIT 10
```

Note which telco services (mobile core, billing, portal, etc.) show up. This is the same language you will use for alert rules.

---

## 2. Time-series style aggregation

Try a bucketed view (adjust field names if your data uses OTel conventions):

```esql
FROM logs*
| WHERE @timestamp > NOW() - 15 minutes
| STATS count = COUNT(*) BY BUCKET(@timestamp, 1 minute), service.name
| SORT @timestamp ASC
```

---

## 3. Infrastructure / metrics apps

In the left nav open:

- **Observability → Infrastructure** — host / cloud metrics for the simulated providers
- **Applications → Service inventory** — latency and throughput for microservices

Optional: open any auto-created **Dashboard** from the home list and filter to the last 30 minutes.

---

## Talk track (for T-Mobile / CSP)

> “We’re not asking you to rip Prometheus tomorrow. Start by landing OTel metrics next to traces and logs in Serverless — then layer ML on the same data. One store, one query language, one remediation path.”

---

✅ **Ready for Check** when you have run at least one ES|QL query and opened Infrastructure or Service inventory.
