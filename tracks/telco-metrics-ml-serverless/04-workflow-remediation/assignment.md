---
slug: workflow-remediation
id: iyh8sexczjid
type: challenge
title: Close the loop with Workflows
teaser: From ML / alert signal to Elastic Workflow remediation — the telco auto-heal
  story.
notes:
- type: text
  contents: |
    ## Lab 4 — Workflow remediation

    **By the end of this challenge you will:**

    - Open Elastic Workflows in the lab project
    - Relate alert → investigate → remediate to the Telco NOC proactive loop
    - Know how the public Telco NOC demo kicks off a live workflow on Search

    Companion: **[Telco NOC → Response → Proactive → Run + Workflow](https://telco-demo-sage.vercel.app)**

    *Note:* Lab sandbox is Observability; the public demo also kicks off Search-hosted `telco-core-latency-auto-remediation`.
tabs:
- id: xcgzz1laakqc
  title: Demo App
  type: service
  hostname: es3-api
  path: /
  port: 8090
- id: kjlsymeqe8us
  title: Elastic Serverless
  type: service
  hostname: es3-api
  path: /app/workflows
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

# Close the loop with Workflows

Open **Elastic Serverless → Workflows** (tab should land on `/app/workflows`).

---

## 1. Inspect workflows in the lab

1. List available workflows (alert response / investigation / remediation if auto-provisioned)
2. Open one workflow definition — note triggers (manual / alert) and steps
3. If a **Run** / **Test** control is available, execute it and open the **Executions** tab

You are looking for the story: **detect → enrich → act**, not every YAML detail.

---

## 2. Tie back to Telco NOC

In the companion Vercel app:

1. Open **Response**
2. Select **Proactive loop**
3. Click **Run + Workflow** — that calls the Search-hosted remediation workflow used in customer demos

That is the same closed-loop message for telco: metrics + ML detect early; Workflows execute the approved playbook.

---

## 3. Optional — chaos to alert path

From **Demo App / Chaos Controller**, inject a short fault, then in Elastic open **Alerts** and any linked workflow / case. Discuss how Serverless Observability replaces “page a human for every threshold.”

---

## Close the workshop

You have walked:

1. **Telemetry on** — OTel into Serverless
2. **Metrics** — ES|QL + Observability apps
3. **ML** — anomaly / proactive lead time
4. **Workflows** — remediation without tool sprawl

Invite customers to continue in the public demo: [telco-demo-sage.vercel.app](https://telco-demo-sage.vercel.app)

---

✅ **Ready for Check** when you have opened Workflows and can describe detect → remediate for a telco NOC.
