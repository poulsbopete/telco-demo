---
marp: true
theme: default
paginate: true
size: 16:9
title: T-Mobile · Site Disaster Recovery — Business Value
description: Executive Site DR for T-Mobile — Polaris & Titan, warm failover, and cost-aware continuity
style: |
  section {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    background: #050816;
    color: #f5f5f7;
    padding: 36px 48px 28px;
    font-size: 22px;
  }
  section.lead { text-align: center; justify-content: center; }
  section.lead h1 { font-size: 2.05em; font-weight: 700; letter-spacing: -0.03em; margin: 0; color: #fff; }
  section.lead h2 { color: #00bfb3; font-size: 0.92em; font-weight: 600; margin: 0.5em 0 0; }
  section.lead p { color: #9a9aa0; font-size: 0.92em; margin-top: 1em; max-width: 38rem; margin-left: auto; margin-right: auto; }
  h1 { font-size: 1.35em; font-weight: 700; margin: 0 0 0.35em; letter-spacing: -0.02em; color: #fff; line-height: 1.25; }
  p { color: #9a9aa0; }
  strong { color: #fff; }
  ul { margin: 0.25em 0; line-height: 1.42; font-size: 0.78em; color: #9a9aa0; }
  li { margin: 0.12em 0; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; margin-top: 0.35em; }
  .cols-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 0.45em; }
  .stat-row { display: flex; gap: 12px; margin-top: 0.45em; }
  .stat { flex: 1; background: rgba(255,255,255,.04); border: 1px solid #2a2a2e; border-radius: 14px; padding: 12px 14px; text-align: center; }
  .stat b { display: block; font-size: 1.1em; color: #00bfb3; margin-bottom: 0.25em; }
  .stat span { font-size: 0.6em; color: #9a9aa0; line-height: 1.35; display: block; }
  .callout { background: #0071e3; color: #fff; border-radius: 14px; padding: 12px 16px; font-size: 0.74em; margin-top: 0.55em; }
  .callout strong { color: #fff; }
  .pillar { background: rgba(255,255,255,.04); border: 1px solid #2a2a2e; border-radius: 12px; padding: 12px 14px; font-size: 0.7em; color: #9a9aa0; }
  .pillar b { display: block; color: #00bfb3; font-size: 1.05em; margin-bottom: 0.2em; }
  .pillar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 0.4em; }
  .dc { background: rgba(226,0,116,.08); border: 1px solid rgba(226,0,116,.45); border-radius: 12px; padding: 12px 14px; font-size: 0.68em; color: #9a9aa0; text-align: center; }
  .dc b { display: block; color: #e20074; font-size: 1.15em; margin-bottom: 0.25em; }
  .ops { background: rgba(0,191,179,.08); border: 1px solid #00bfb3; border-radius: 12px; padding: 12px 14px; font-size: 0.68em; color: #9a9aa0; text-align: center; }
  .ops b { display: block; color: #00bfb3; font-size: 1.15em; margin-bottom: 0.25em; }
  .kicker {
    display: inline-block;
    background: #e20074;
    color: #fff;
    font-size: 0.52em;
    font-weight: 700;
    letter-spacing: 0.06em;
    padding: 4px 10px;
    margin-bottom: 0.5em;
  }
  .subhead { color: #9a9aa0; font-size: 0.72em; line-height: 1.45; margin: 0.4em 0 0.8em; max-width: 92%; }
  .subhead strong { color: #fff; }
  .slide-foot {
    position: absolute; bottom: 22px; left: 48px; right: 48px;
    border-top: 2px solid #e20074;
    padding-top: 8px;
    font-size: 0.52em;
    color: #9a9aa0;
    display: flex; justify-content: space-between;
  }
  .bridge-box { border: 1px solid #00bfb3; background: rgba(0,191,179,.06); border-radius: 10px; padding: 14px 16px; font-size: 0.7em; }
  .bridge-box h3 { color: #fff; font-size: 1.05em; margin: 0 0 0.35em; }
  .bridge-box p { color: #9a9aa0; margin: 0; line-height: 1.4; }
  .flow { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 0.6em 0 0.2em; font-size: 0.62em; color: #9a9aa0; flex-wrap: wrap; }
  .flow span { background: rgba(255,255,255,.06); border: 1px solid #2a2a2e; border-radius: 8px; padding: 6px 10px; color: #fff; }
  .flow em { font-style: normal; color: #e20074; font-weight: 700; }
---

<!-- _class: lead -->

<span class="kicker">T-MOBILE · SITE DR</span>

# Failover across Polaris &amp; Titan

## A Magenta decision — not a weekend restore

<p>When a data center fails during launch or a plan migration surge, the question is not “can we rebuild?” — it is “can <strong>Polaris</strong> and <strong>Titan</strong> keep Un-carrier promises visible, prove what happened, and keep serving?”</p>

---

<span class="kicker">T-MOBILE · STAKES</span>

# What a site outage really costs

<p class="subhead">RPO/RTO matter to architects. Leadership cares about <strong>trust, Magenta growth, and evidence</strong> across Polaris and Titan.</p>

<div class="stat-row">
  <div class="stat"><b>Un-carrier trust</b><span>Activation and care fail in public on launch weekend</span></div>
  <div class="stat"><b>Gross-add at risk</b><span>Churn and plan-migration decisions freeze without live signal</span></div>
  <div class="stat"><b>Board / audit proof</b><span>Deliberate failover between DCs — not hope</span></div>
  <div class="stat"><b>Blind Magenta ops</b><span>Lost telemetry = no root cause across terrestrial + T-Satellite</span></div>
</div>

<div class="callout"><strong>Bottom line:</strong> A cold Titan that takes hours to become useful is an outage with extra steps — during the moments T-Mobile is most visible.</div>

<div class="slide-foot"><span>T-Mobile · Polaris &amp; Titan</span><span>Protect the relationship at the highest-stakes moment</span></div>

---

<span class="kicker">T-MOBILE · DESIGN</span>

# Architecture that protects the business

<p class="subhead">Same design as the Site DR working session — framed for outcomes, not plumbing.</p>

<div class="flow">
  <span>Kafka</span> →
  <span>Logstash ×4</span> →
  <span><em>Polaris</em> Cluster 1</span>
  <span>+</span>
  <span>Logstash ×4</span> →
  <span><em>Titan</em> Cluster 2</span>
</div>

<div class="cols-3">
  <div class="dc"><b>Polaris</b>Ingest · transform · data<br/>Hot / warm / cold as today</div>
  <div class="dc"><b>Titan</b>Full parity · dual ingest<br/>1 day hot · rest frozen</div>
  <div class="ops"><b>Ops · Cluster 3</b>ML · alerting · dashboards<br/>CCS into Polaris / Titan · users land here</div>
</div>

<ul>
  <li><strong>Data plane:</strong> Polaris and Titan dual-fed for parity — ingest &amp; transforms only</li>
  <li><strong>Ops plane:</strong> Cluster 3 owns ML, alerting, and user dashboards (not on the DC ingest boxes)</li>
  <li><strong>Must:</strong> Shared snapshot repository between Polaris and Titan — corruption undo under every path</li>
</ul>

<div class="slide-foot"><span>T-Mobile · Site DR design</span><span>Dual ingest · ops CCS · snapshots required</span></div>

---

<span class="kicker">T-MOBILE · CLOSE</span>

# What leadership is buying

<p class="subhead">Four outcomes — Polaris / Titan architecture exists to deliver these.</p>

<div class="pillar-grid">
  <div class="pillar"><b>Cutover in minutes</b>Warm Titan already indexing — failover is routing, not rebuild</div>
  <div class="pillar"><b>Complete after failover</b>Same logical view so NOC and exec dashboards stay truthful</div>
  <div class="pillar"><b>Corruption undo</b>Shared snapshots — only reliable reverse when a bad change hit both DCs</div>
  <div class="pillar"><b>Cost-aware warmth</b>Full lookback on Titan without mirroring Polaris hot-tier spend</div>
</div>

<div class="callout"><strong>Close:</strong> Agree in business language — “seconds of loss vs hours of blind ops” — then fund dual ingest (± ops cluster) with the mandatory snapshot repo between Polaris and Titan.</div>

<div class="slide-foot"><span>Elastic × T-Mobile · Site DR</span><span>Outcomes first · Polaris &amp; Titan second</span></div>
