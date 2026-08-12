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

Open the **Elastic Serverless** tab — your **Serverless Observability** project. It opens on the **Machine Learning** overview.

You should see three groups of cards: **Analyze your data**, **Surface insights**, and **Visualize your data**.

---

## 1. Orient on the ML overview

From this page:

1. Under **Analyze your data → Anomaly detection**, click **Manage jobs** — note whether any jobs exist yet (a new lab project may be empty)
2. Click **Open anomaly explorer** to see the explorer UI (even with no jobs, you learn where scores and influencers show up)
3. Under **Surface insights**, open one AIOps path that works on live OTel data without a pre-built job:
   - **Log rate analysis** → **Explain changes**, or
   - **Log pattern analysis** → **Find patterns**, or
   - **Change point detection** → **Find changes**

These AIOps labs are the fastest way to surface unusual log/metric behavior on the telemetry already streaming into this project.

---

## 2. Optional — create a signal to analyze

If the views look quiet, inject a mild fault from **Chaos Controller**, wait 1–2 minutes, then re-run **Log rate analysis** or check **Alerts** / **Discover** for elevated errors — that is the raw signal ML and AIOps learn from.

---

## 3. Map to the Telco NOC story

In the companion app’s **Response** tab, the **Proactive loop** shows the end-to-end path:

| Step | Elastic capability |
|------|--------------------|
| Agents detect degradation | Metrics + ML / AIOps signal |
| Early warning to ops | Alerting / cases |
| Auto or assisted fix | Workflows (next lab) |

Key phrase: **proactive lead time** — minutes of warning before care tickets spike.

---

## 4. Optional ES|QL signal check

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

✅ **Ready for Check** when you have opened the ML overview, tried Anomaly explorer or an AIOps lab, and can explain how that signal feeds a proactive NOC loop.
