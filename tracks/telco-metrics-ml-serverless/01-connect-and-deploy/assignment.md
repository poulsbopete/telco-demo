---
slug: connect-and-deploy
id: t8wcp4hkisal
type: challenge
title: Connect & confirm Telco NOC telemetry
teaser: Confirm the Telco NOC demo is live and streaming OpenTelemetry into Elastic
  Serverless.
notes:
- type: text
  contents: |
    <iframe src="https://telco-demo-sage.vercel.app/slides/workshop/#1"
      width="100%" height="1400" frameborder="0"
      style="border-radius:8px;display:block;width:100%;min-height:900px;aspect-ratio:16/9;border:0">
    </iframe>
- type: text
  contents: |
    ## Lab 1 — Connect & confirm telemetry

    **What's happening:** Your Elastic Cloud Serverless Observability project is being provisioned and the Telco NOC scenario is launching against it.

    **By the end of this challenge you will:**

    - Confirm the demo platform is healthy and a deployment is running
    - Open Elastic Serverless (pre-authenticated) and see live data
    - Know where metrics, logs, and traces live for later labs

    Companion: **[Telco NOC](https://telco-demo-sage.vercel.app)** · *Setup usually takes 3–4 minutes.*
- type: text
  contents: |
    ## While you wait

    Setup takes a few minutes. Survive the anomaly storm while Elastic provisions:

    <iframe src="https://poulsbopete.github.io/Vampire-Clone/" width="100%" height="800" frameborder="0" allowfullscreen style="border-radius:8px;display:block;"></iframe>
tabs:
- id: ncdab54nan2w
  title: Demo App
  type: service
  hostname: es3-api
  path: /
  port: 8090
- id: rbeejdjul4rd
  title: Chaos Controller
  type: service
  hostname: es3-api
  path: /chaos
  port: 8090
- id: yyfv8abn14os
  title: Elastic Serverless
  type: service
  hostname: es3-api
  path: /app/dashboards#/list?_g=(filters:!(),refreshInterval:(pause:!f,value:30000),time:(from:now-30m,to:now))
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

# Connect & confirm Telco NOC telemetry

Everything was **automatically provisioned** when this lab started — Elastic Cloud project, Telco NOC microservices, and OTLP ingest. Your job is to verify the path is live.

---

## 1. Demo App

Open the **Demo App** tab:

1. Confirm the scenario shows as deployed / running
2. Note service health for mobile core, billing, and portal-style services

Open **Chaos Controller** once — you will use it later when we talk about degradation before ML fires.

---

## 2. Elastic Serverless

Open the **Elastic Serverless** tab (already logged in). Set time range to **Last 15 minutes**, then spot-check:

| Area | What to look for |
|------|------------------|
| **Discover → ES\|QL** | Logs from telco services |
| **Applications → Service inventory** | Distributed traces |
| **Observability → Infrastructure** | Host / cloud metrics |
| **Observability → SLOs** | Auto-created SLOs (if present) |

---

## 3. Why this matters for telco

Telco operators migrating Kubernetes clusters onto OpenTelemetry need one place where **metrics + logs + traces** land without a second silo. Elastic Serverless scales ingest independently of query — the same pattern you will use for ML and workflows next.

---

✅ **Ready for Check** when the Demo App shows a running deployment and you can see recent data in Elastic.

<details>
<summary>Facilitator tip</summary>

If Check fails with “no deployments”, wait 60s for auto-launch, or use Skip / Solve after confirming `curl localhost:8090/health` on the host.

</details>
