---
marp: true
theme: default
paginate: true
title: Telco NOC × Elastic — Public Demo Launch
description: Slides for announcing the open-source telco-demo repository
style: |
  section { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  h1 { color: #1d1d1f; }
  h2 { color: #0071e3; }
  strong { color: #1d1d1f; }
  a { color: #0071e3; }
---

# Telco NOC × Elastic
## Open demo — now public on GitHub

**Live demo:** https://telco-demo-sage.vercel.app  
**Repo:** https://github.com/poulsbopete/telco-demo

Elastic Serverless · OpenTelemetry · ML · Search · Security · Workflows

---

# The problem CSP NOCs face

- **Device launches** (e.g. iPhone) spike provisioning, RAN attach, and care volume in hours—not days
- **Signals are siloed** — RAN, core, transport, fraud, and KB runbooks live in different tools
- **Business impact is buried** — P1 count, churn risk, and revenue exposure aren’t on the same screen as telemetry
- **Scale weekends** need **when to surge staffing** vs **when to taper** — not just “CPU is high”

---

# What we built

A **single-pane telco NOC demo** that shows how Elastic Serverless connects:

| Pillar | Demo tab |
|--------|----------|
| Live OTel + region context | **Telemetry** |
| Fault inject + HITL remediation | **Networks** |
| Enterprise Search + care KB | **Search** |
| Petabyte-scale narrative | **Scale** |
| SIEM + fraud + Search AI Lake | **Security** |
| Gen-AI incident loop | **Response** |

---

# Narrative hook — iPhone 17 Pro launch

Simulated **launch-day business metrics** layered on live cluster data:

- **2.4M** pre-orders · **847K** activations in 6h · **340%** provisioning spike
- **ML lifecycle forecast** — peak retail → afternoon tail → evening lull → weekend suburban surge
- **Business KPIs:** gross-add revenue, care load, churn risk if SLA slips
- Hotspot regions (NYC retail, eSIM CDN, midnight PT wave) boost live telemetry

---

# ML signal intelligence

Not just anomaly counts — a **signal funnel**:

**Threshold → ML scored → Correlated → Actionable**

- Domain tags: RAN · Core · Transport · Fraud
- Launch-specific anomalies: provisioning surge, eSIM latency, RAN attach storm, **volume taper forecast**
- Deep links to Discover, Workflows, and Security

---

# Executive outcomes (illustrative)

Designed for **CSP leadership conversations**:

- **~60% fewer P1 incidents** (modeled operating model)
- **MTTR 4.2h → 18m** with Elastic Workflows + A2A federation
- **Streams / retention TCO** callout for observability at telco scale
- **Churn-risk tiles** tied to region SLA and session volume

*Representative narrative — not measured in sandbox data.*

---

# What’s live vs simulated

| Tab | Data |
|-----|------|
| **Telemetry** | Real Elastic Serverless OTel (`logs-*`, ES\|QL) |
| **Networks** | Live OTLP inject + Kibana workflow polling |
| Search, Scale, Security, Response | Rich **simulated** telco narrative + deep links |

Forkers need **their own** Elastic Cloud projects + API keys — see README.

---

# Architecture

```
Browser  →  Vercel (React + serverless /api/*)
              →  ES|QL _query (read-only API key)
              →  Kibana deep links (Observability · Search · Security)
              →  OTLP ingest (Adaptive Networks inject)
```

**Stack:** React 19 · Vite · Tailwind 4 · Recharts · Elastic Workflows YAML

---

# Try it in 5 minutes

1. **Star & fork** → github.com/poulsbopete/telco-demo
2. **Create** a read-only API key on your Observability Serverless project
3. **Deploy** to Vercel (or `cp .env.example .env.local && npm run dev`)
4. Open **Telemetry** tab — confirm `/api/health` is green
5. Walk **launch ML forecast** → **Networks inject** → **Security SIM swap**

Full guide in repo **README → Fork & run your own copy**

---

# Optional — full multi-project setup

| Project | Powers |
|---------|--------|
| Observability Serverless | Telemetry, Networks, dashboards |
| Search Serverless | KB, Agent Builder deep links |
| Security Serverless | SIEM, cases, rules deep links |

Plus [adaptive-networks](https://github.com/poulsbopete/adaptive-networks) bootstrap for live workflow demo.

---

# Why open source it?

- **Reusable** for telco / CSP workshops and customer demos
- **Transparent** — see how ES\|QL, Workflows, and A2A patterns wire together
- **Fork-friendly** — bring your own cluster; simulated tabs work without live data
- **Community** — issues & PRs welcome for new launch scenarios and regions

---

# Call to action

**Live:** https://telco-demo-sage.vercel.app  
**Code:** https://github.com/poulsbopete/telco-demo  
**Slides:** https://poulsbopete.github.io/telco-demo/

Questions · fork · deploy · extend the launch ML story

**Elastic — one platform for telco observability, search, and security**
