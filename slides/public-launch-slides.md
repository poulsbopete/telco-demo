---
marp: true
theme: default
paginate: true
size: 16:9
title: Why Elastic for Telco
description: Executive narrative — one platform for CSP observability, security, and search
style: |
  section {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    background: linear-gradient(165deg, #fbfbfd 0%, #ffffff 55%, #f5f5f7 100%);
    color: #1d1d1f;
    padding: 48px 56px;
  }
  section.lead {
    text-align: center;
    justify-content: center;
  }
  section.lead h1 {
    font-size: 2.4em;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 0.2em;
  }
  section.lead h2 {
    font-size: 1.35em;
    font-weight: 500;
    color: #86868b;
    border: none;
  }
  h1 { color: #1d1d1f; font-size: 1.75em; font-weight: 700; letter-spacing: -0.02em; }
  h2 { color: #0071e3; font-size: 1.1em; font-weight: 600; margin-top: 0; }
  strong { color: #1d1d1f; }
  em { color: #86868b; font-style: normal; }
  ul { line-height: 1.55; }
  li { margin-bottom: 0.35em; }
  table { font-size: 0.82em; margin-top: 0.5em; }
  th { background: #0071e3; color: #fff; }
  td { background: #fff; }
  blockquote { border-left: 4px solid #0071e3; background: rgba(0,113,227,0.08); padding: 0.5em 1em; font-size: 0.9em; }
  footer { color: #86868b; font-size: 0.55em; }
  section::after { color: #86868b; }
---

<!-- _class: lead -->

# Why Elastic for Telco

## One platform for NOC, security, and customer care at CSP scale

**Observability · Security · Search · ML · Workflows**

telco-demo-sage.vercel.app

---

# Telco operations run on events, not averages

CSPs face **burst workloads** that standard monitoring was never designed for:

- **Device launches** — millions of activations, eSIM OTA, and provisioning spikes in hours
- **Regional SLA pressure** — RAN attach, core latency, and transport faults hit revenue immediately
- **Care surges** — contact volume tracks launch curves, not CPU graphs
- **Fraud windows** — SIM swap and account takeover spike on launch weekends

*The NOC needs business context, not another dashboard.*

---

# The cost of tool fragmentation

| Today (typical) | Impact |
|-----------------|--------|
| Separate observability, SIEM, and KB tools | Slow correlation · longer MTTR |
| Static thresholds | Alert storms on launch day |
| Metrics without subscriber context | Can't prioritize by churn or revenue |
| Manual runbook hunts | Care and NOC out of sync |

**Result:** P1 noise, 4+ hour MTTR, and subscribers at risk when SLAs slip.

---

# Elastic — built for telco-scale complexity

**One searchable platform** across logs, metrics, traces, and security events:

| Pillar | Telco use case |
|--------|----------------|
| **Observability** | OTel ingest · ES\|QL · region-aware telemetry |
| **Security** | SIEM · UBA · fraud · multi-year Search AI Lake |
| **Search** | Runbooks · care KB · Agent Builder |
| **ML** | Anomaly scoring · launch forecasting · signal funnel |
| **Workflows** | Automated remediation · HITL · A2A federation |

Serverless on Elastic Cloud — no cluster ops at petabyte scale.

---

# Observability that speaks NOC language

- **OpenTelemetry-native** — signaling, provisioning, RAN, core, transport in one view
- **Region context on every signal** — tie telemetry to markets, stores, and SLA tiers
- **ES\|QL at scale** — ad-hoc investigation without rehydrating cold tiers
- **Deep links to Kibana** — Discover, APM, dashboards, and workflow executions

*See infrastructure **and** business impact on the same screen.*

---

# ML that predicts surge and slowdown

Elastic ML goes beyond “something broke”:

**Signal funnel:** Threshold → ML scored → Correlated → Actionable

- **Launch lifecycle forecast** — when activations peak, taper, and resurge (weekend suburban wave)
- **Business KPIs** — gross-add revenue, care load, churn risk if SLA slips
- **Domain tagging** — RAN · Core · Transport · Fraud on every anomaly
- **Noise suppression** — fewer P1s, more actionable incidents

*Staff up before the spike — scale down when ML says taper.*

---

# Security without a separate SOC stack

- **Unified SIEM** on the same data model as observability
- **Launch fraud patterns** — SIM swap surge, credential abuse, entity analytics
- **Search AI Lake** — investigate years of security data without cold-tier rehydration
- **Cases, rules, and response** — from alert to remediation in one Kibana workspace

*Correlate a provisioning anomaly with a fraud alert in minutes, not days.*

---

# Enterprise Search for care and runbooks

- **Semantic KB** — ELSER-powered retrieval for device launch, activation, trade-in
- **Agent Builder** — AI agents that pull runbooks and policy in the care flow
- **A2A federation** — orchestrator calls Search + Security in one incident thread
- **Care deflection** — resolve launch-day contacts before they become churn

*Every NOC playbook and care script searchable in milliseconds.*

---

# Automated response — break, detect, remediate

**Adaptive Networks** pattern (live in demo):

1. Inject transport fault via OTLP
2. Alert rule fires on correlated logs + metrics
3. Elastic Workflow runs RCA, opens case, remediates
4. Human-in-the-loop for high-severity · auto-fix for low

**A2A federation** across metrics, Security, and Search — one incident narrative.

---

# Business outcomes CSP leaders care about

*Illustrative operating model — representative of Elastic telco deployments*

| Metric | Before → After |
|--------|----------------|
| **P1 incidents** | Baseline → **~60% reduction** |
| **MTTR** | 4.2 hours → **18 minutes** (workflow + ML) |
| **Observability TCO** | Streams retention → **40–70% storage savings** |
| **Customer impact** | Region SLA + churn-risk prioritization |

Elastic connects telemetry to **revenue, churn, and care cost**.

---

# Proof point — iPhone launch weekend

Demo narrative layered on **live Elastic Serverless** data:

- **2.4M** pre-orders · **847K** activations in 6h · **340%** provisioning spike
- ML forecast: retail peak → afternoon tail → evening lull → Saturday suburban surge
- Hotspot regions: flagship retail, eSIM CDN edge, midnight PT wave
- Executive tiles: gross-add revenue, care load next 4h, churn risk if SLA slips

**Live demo:** telco-demo-sage.vercel.app

---

# See it live — six integrated modules

| Tab | What it shows |
|-----|---------------|
| **Telemetry** | Live OTel + region drill-down + ML signal intelligence |
| **Networks** | Fault inject · workflow · incident flow |
| **Search** | Care KB + semantic retrieval |
| **Scale** | Petabyte observability narrative |
| **Security** | SIEM · fraud · Search AI Lake |
| **Response** | Gen-AI incident loop |

Open **Telemetry** and **Networks** for live cluster data.

---

<!-- _class: lead -->

# Elastic for Telco

## Observability · Security · Search — one platform, CSP scale

**Demo:** telco-demo-sage.vercel.app  
**Repo:** github.com/poulsbopete/telco-demo

Let's walk the launch scenario together.
