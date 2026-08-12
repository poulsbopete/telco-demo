---
slug: ml-anomalies
id: 7ewidddbdgrt
type: challenge
title: Investigate ML anomalies
teaser: See how Elastic ML surfaces telco degradation before customer tickets spike.
notes:
- type: text
  contents: |
    ## Lab 3 — ML anomalies

    **By the end of this challenge you will:**

    - Find Machine Learning / anomaly context in Observability
    - Relate anomaly scores to proactive lead time for a NOC
    - Connect ML signal intelligence to the Telco NOC Response story

    Companion: **[Telco NOC → Response](https://telco-demo-sage.vercel.app)** (Proactive loop)
- type: text
  contents: |
    ## Why ML for telco metrics

    Threshold alerts create noise. Elastic ML learns baselines on your metrics/logs and scores unusual behavior — the same pattern used in Telco NOC for **proactive** loops (agent-detected anomalies → operations console / workflow).
tabs:
- id: bvvat0vdlsnh
  title: Demo App
  type: service
  hostname: es3-api
  path: /
  port: 8090
- id: mvzxvvfylfkb
  title: Chaos Controller
  type: service
  hostname: es3-api
  path: /chaos
  port: 8090
- id: yujctyjxy2hl
  title: Elastic Serverless
  type: service
  hostname: es3-api
  path: /app/ml
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

# Investigate ML anomalies

Open the **Elastic Serverless** tab (defaults toward Machine Learning).

---

## 1. Find ML in the product

Navigate to **Machine Learning** (or **Observability → Anomaly detection** / AIOps, depending on the build):

1. List any anomaly detection jobs or results available in this lab project
2. Open one job / anomaly explorer view if present
3. Note score, time range, and influenced fields (service, host, region-like labels)

If the lab project has few ML jobs yet, inject a mild fault from **Chaos Controller**, wait 1–2 minutes, then re-check **Alerts** and **Discover** for elevated error rates — that is the raw signal ML learns from.

---

## 2. Map to the Telco NOC story

In the companion app’s **Response** tab, the **Proactive loop** is the customer talk track:

| Step | Elastic capability |
|------|--------------------|
| Agents detect degradation | Metrics + ML anomaly score |
| Early warning to ops | Alerting / cases |
| Auto or assisted fix | Workflows (next lab) |

Key phrase: **proactive lead time** — minutes of warning before care tickets spike.

---

## 3. Optional ES|QL signal check

```esql
FROM logs*
| WHERE severity_text == "ERROR" OR log.level == "ERROR"
| STATS errors = COUNT(*) BY service.name
| SORT errors DESC
| LIMIT 5
```

Compare before/after a chaos toggle if you used one.

---

## Talk track

> “ML isn’t a science project bolted on later — it sits on the same OTel metrics you just queried. We score anomalies, suppress noise, and only promote actionable signals into the NOC workflow.”

---

✅ **Ready for Check** when you can explain where ML / anomalies live in Kibana and how they feed a proactive NOC loop.
