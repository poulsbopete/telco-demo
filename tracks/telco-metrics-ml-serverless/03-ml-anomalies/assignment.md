---
slug: ml-anomalies
id: 7ewidddbdgrt
type: challenge
title: Investigate ML anomalies
teaser: See how Elastic ML surfaces telco degradation before customer tickets spike.
notes:
- type: text
  contents: |
    <iframe src="https://telco-demo-sage.vercel.app/slides/workshop/#3"
      width="100%" height="1400" frameborder="0"
      style="border-radius:8px;display:block;width:100%;min-height:900px;aspect-ratio:16/9;border:0">
    </iframe>
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

Open the **Elastic Serverless** tab — that is your **Serverless Observability** project (already logged in). It lands on Machine Learning.

---

## 1. Explore ML in Observability

In the left navigation, open **Machine Learning**:

1. List any anomaly detection jobs or results available in this project
2. Open one job / Anomaly Explorer view if present
3. Note score, time range, and influenced fields (service, host, region-like labels)

If few ML jobs are present yet, inject a mild fault from **Chaos Controller**, wait 1–2 minutes, then re-check **Alerts** and **Discover** for elevated error rates — that is the raw signal ML learns from.

---

## 2. Map to the Telco NOC story

In the companion app’s **Response** tab, the **Proactive loop** shows the end-to-end path:

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

## Key takeaway

> “ML isn’t a science project bolted on later — it sits on the same OTel metrics you just queried. We score anomalies, suppress noise, and only promote actionable signals into the NOC workflow.”

---

✅ **Ready for Check** when you can explain where ML / anomalies live in Kibana and how they feed a proactive NOC loop.
