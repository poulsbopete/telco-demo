---
slug: ml-anomalies
id: 7ewidddbdgrt
type: challenge
title: Investigate ML anomalies
teaser: See how Elastic ML and AIOps surface telco degradation before customer tickets
  spike.
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
  path: /app/ml/aiops/log_rate_analysis
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

Open the **Elastic Serverless** tab — your **Serverless Observability** project. It opens on **Machine Learning → AIOps Labs → Log rate analysis**.

> **Note:** Classic **Anomaly detection → Single metric viewer** may show empty service dropdowns in a fresh lab (APM rollup partitions take time to fill). Use **AIOps Labs** below — they run on the live OTel logs already in this project.

---

## 1. Log rate analysis (primary)

On **Log rate analysis**:

1. Select a **logs** data view (for example anything matching `logs*` / OTel logs)
2. Set time to **Last 15 minutes** (or Last 1 hour if the chart is quiet)
3. Click **Explain changes** / run the analysis when a spike or dip is visible on the histogram
4. Review which fields and values explain the rate change (service name, severity, host, etc.)

That is ML-assisted investigation on the same telemetry you queried with ES|QL — no pre-trained job required.

---

## 2. Optional — create a clearer spike

From **Chaos Controller**, inject a mild fault, wait 1–2 minutes, then re-run **Log rate analysis** (or open **Log pattern analysis** / **Change point detection** from the ML left nav under **AIOps labs**).

---

## 3. Optional — glance at Anomaly detection

From the ML left nav open **Anomaly detection → Manage jobs**. You may see an APM transaction job (for example `apm-telco-transaction-metrics`). If **Single metric viewer** still lists no services, skip it for now — AIOps is the reliable path in this lab.

---

## 4. Map to the Telco NOC story

In the companion app’s **Response** tab, the **Proactive loop** shows the end-to-end path:

| Step | Elastic capability |
|------|--------------------|
| Agents detect degradation | Metrics + ML / AIOps signal |
| Early warning to ops | Alerting / cases |
| Auto or assisted fix | Workflows (next lab) |

Key phrase: **proactive lead time** — minutes of warning before care tickets spike.

---

## Key takeaway

> “ML isn’t a science project bolted on later — it sits on the same OTel data you just queried. AIOps and anomaly detection promote unusual signals so the NOC can act before tickets spike.”

---

✅ **Ready for Check** when you have run **Log rate analysis** (or another AIOps lab) on live logs and can explain how that signal feeds a proactive NOC loop.
