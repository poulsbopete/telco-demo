---
marp: true
theme: default
paginate: true
size: 16:9
title: Elastic Observability for Telco
description: Executive narrative — OTel, ML, and business-aware NOC at CSP scale
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

# Elastic Observability for Telco

## OpenTelemetry · ML · business-aware NOC at CSP scale

**Live demo:** telco-demo-sage.vercel.app

*Today's focus: Observability — the demo also includes Security & Search tabs for reference.*

---

# Why observability breaks on launch day

CSP NOCs don't fail on steady state — they fail on **events**:

- **Device launches** — provisioning, eSIM OTA, and RAN attach spike in hours
- **Regional hotspots** — flagship stores, CDN edges, midnight time zones
- **Cross-domain signals** — RAN, core, transport, and provisioning in different tools
- **Static thresholds** — alert storms when volume curves aren't normal

*You need telemetry that carries **region, SLA, and business context** — not just CPU.*

---

# What NOC teams actually need to see

| Question | Observability answer |
|----------|-------------------|
| Where is pain concentrated? | **Region-aware** logs, metrics, traces |
| Is this launch or infrastructure? | **ML-scored** anomalies + launch lifecycle forecast |
| What happens in the next 4 hours? | Surge / taper prediction · care & capacity planning |
| What's the business exposure? | Churn risk, gross-add revenue, SLA breach impact |
| How fast can we fix it? | ES\|QL drill-down · Workflows · correlated RCA |

Elastic Observability connects **signals to decisions**.

---

# OpenTelemetry-native, telco-shaped

- **One agent, three pillars** — metrics, traces, logs from signaling, core, RAN, transport
- **Elastic Serverless** — petabyte ingest without running clusters
- **ES\|QL** — investigate across `logs-*`, `metrics-*`, `traces-*` without rehydration
- **Region enrichment** — every signal tagged with market, store tier, and SLA context
- **Kibana deep links** — Discover, APM, dashboards, workflow executions

*Same OTel pipeline the industry is standardizing on — with telco-scale retention and query.*

---

# ML signal intelligence — not another alert storm

**Signal funnel:** Threshold → ML scored → Correlated → Actionable

- **Domain tags** — RAN · Core · Transport · Provisioning on every anomaly
- **Launch lifecycle forecast** — peak retail → afternoon tail → weekend suburban surge
- **Noise suppression** — duplicate alerts collapsed; NOC sees what matters
- **Business KPIs on the same screen** — activations/min, care load, churn risk if SLA slips

*ML tells you **when to surge staffing** and **when to taper** — not just that error rate went up.*

---

# Launch weekend — the observability story

**iPhone 17 Pro launch** (demo narrative on live Serverless data):

| Signal | What observability shows |
|--------|-------------------------|
| **847K** activations / 6h | Live OTel volume by region |
| **340%** provisioning spike | ML anomaly + correlated traces/logs |
| Hotspot regions | NYC retail · eSIM CDN · midnight PT wave |
| ML forecast | Taper in ~2h · second wave Sat 10 AM |

**Gross-add revenue · care load next 4h · churn risk** — on the Telemetry tab.

---

# Adaptive Networks — observe, detect, remediate

End-to-end **observability-driven** incident loop (live in demo):

1. **Break** — transport fault injected via OTLP (logs + metrics)
2. **Detect** — alert rule on correlated ingest · ML scores the pattern
3. **Remediate** — Elastic Workflow · RCA · optional HITL · auto-fix

Incident flow ties **OTel → alert → workflow → resolution** in one narrative.

*This is observability that **closes the loop** — not tickets in a separate tool.*

---

# Observability at scale — TCO and retention

Telco ingest is measured in **petabytes**, not gigabytes:

- **Streams** — tiered retention without losing queryability
- **40–70% storage savings** vs. full-fidelity hot retention (illustrative model)
- **Unified telemetry** — no duplicate agents for metrics vs. logs vs. traces
- **Serverless pricing** — scale with launch weekends, return to baseline after

The **Scale** tab in the demo walks the volume, cost, and retention story.

---

# Outcomes NOC and engineering leaders track

*Illustrative operating model — representative of Elastic telco observability deployments*

| Metric | Before → After |
|--------|----------------|
| **P1 incidents** | Baseline → **~60% reduction** (ML + suppression) |
| **MTTR** | 4.2 hours → **18 minutes** (correlated RCA + workflows) |
| **Alert noise** | Launch-day storms → **actionable signal funnel** |
| **Observability TCO** | Hot-only retention → **Streams tiering** |

Telemetry tied to **SLA, churn, and revenue** — not just infrastructure health.

---

# Demo walkthrough — observability focus

| Tab | Today's path |
|-----|----------------|
| **Telemetry** | Live OTel · regions · ML forecast · business KPIs |
| **Networks** | OTLP fault inject · incident flow · workflow |
| **Scale** | Petabyte ingest · Streams TCO · unified OTel |

*Security, Search, and Response tabs are in the app for reference — covered separately.*

**Start here:** telco-demo-sage.vercel.app → **Telemetry**

---

<!-- _class: lead -->

# Elastic Observability for Telco

## See the launch · predict the curve · fix before churn

**Demo:** telco-demo-sage.vercel.app/slides/  
**App:** telco-demo-sage.vercel.app

Let's open **Telemetry** and walk the launch scenario.
