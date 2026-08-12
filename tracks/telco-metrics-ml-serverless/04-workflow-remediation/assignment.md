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
    <iframe src="https://telco-demo-sage.vercel.app/slides/workshop/#4"
      width="100%" height="1400" frameborder="0"
      style="border-radius:8px;display:block;width:100%;min-height:900px;aspect-ratio:16/9;border:0">
    </iframe>
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

Open the **Elastic Serverless** tab — your **Serverless Observability** project. It should land on **Workflows**.

---

## 1. Inspect workflows

1. List available workflows (alert response / investigation / remediation if present)
2. Open one workflow definition — note triggers (manual / alert) and steps
3. If a **Run** / **Test** control is available, execute it and open the **Executions** tab

You are looking for the story: **detect → enrich → act**, not every YAML detail.

---

## 2. Tie back to Telco NOC

In the companion app ([telco-demo-sage.vercel.app](https://telco-demo-sage.vercel.app)):

1. Open **Response**
2. Select **Proactive loop**
3. Click **Run + Workflow** to see a live remediation kickoff from the demo

That is the closed-loop message: metrics + ML detect early; Workflows execute the approved playbook.

---

## 3. Optional — chaos to alert path

From **Demo App / Chaos Controller**, inject a short fault, then in Observability open **Alerts** and any linked workflow / case.

---

## Close the workshop

You have walked:

1. **Telemetry on** — OTel into Serverless Observability
2. **Metrics** — ES|QL + Observability apps
3. **ML** — anomaly / proactive lead time
4. **Workflows** — remediation without tool sprawl

Continue exploring in the public demo: [telco-demo-sage.vercel.app](https://telco-demo-sage.vercel.app)

---

✅ **Ready for Check** when you have opened Workflows and can describe detect → remediate for a telco NOC.
