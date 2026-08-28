---
marp: true
theme: default
paginate: true
size: 16:9
title: T-Mobile · Site Disaster Recovery — Business Value
description: Cost-efficient Site DR for T-Mobile — Polaris & Titan without hot-tier overages
style: |
  section {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    background: #050816;
    color: #f5f5f7;
    padding: 36px 48px 28px;
    font-size: 22px;
  }
  section.lead { text-align: center; justify-content: center; }
  section.lead h1 { font-size: 2em; font-weight: 700; letter-spacing: -0.03em; margin: 0; color: #fff; }
  section.lead h2 { color: #00bfb3; font-size: 0.92em; font-weight: 600; margin: 0.5em 0 0; }
  section.lead p { color: #9a9aa0; font-size: 0.9em; margin-top: 1em; max-width: 40rem; margin-left: auto; margin-right: auto; }
  h1 { font-size: 1.3em; font-weight: 700; margin: 0 0 0.35em; letter-spacing: -0.02em; color: #fff; line-height: 1.25; }
  p { color: #9a9aa0; }
  strong { color: #fff; }
  ul { margin: 0.25em 0; line-height: 1.42; font-size: 0.76em; color: #9a9aa0; }
  li { margin: 0.12em 0; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; margin-top: 0.35em; }
  .cols-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 0.4em; }
  .stat-row { display: flex; gap: 10px; margin-top: 0.4em; }
  .stat { flex: 1; background: rgba(255,255,255,.04); border: 1px solid #2a2a2e; border-radius: 14px; padding: 11px 12px; text-align: center; }
  .stat b { display: block; font-size: 1.05em; color: #00bfb3; margin-bottom: 0.2em; }
  .stat span { font-size: 0.58em; color: #9a9aa0; line-height: 1.35; display: block; }
  .callout { background: #0071e3; color: #fff; border-radius: 14px; padding: 12px 16px; font-size: 0.72em; margin-top: 0.5em; }
  .callout strong { color: #fff; }
  .pillar { background: rgba(255,255,255,.04); border: 1px solid #2a2a2e; border-radius: 12px; padding: 11px 13px; font-size: 0.68em; color: #9a9aa0; }
  .pillar b { display: block; color: #00bfb3; font-size: 1.05em; margin-bottom: 0.2em; }
  .pillar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 0.35em; }
  .dc { background: rgba(226,0,116,.08); border: 1px solid rgba(226,0,116,.45); border-radius: 12px; padding: 11px 12px; font-size: 0.65em; color: #9a9aa0; text-align: center; }
  .dc b { display: block; color: #e20074; font-size: 1.1em; margin-bottom: 0.2em; }
  .ops { background: rgba(0,191,179,.08); border: 1px solid #00bfb3; border-radius: 12px; padding: 11px 12px; font-size: 0.65em; color: #9a9aa0; text-align: center; }
  .ops b { display: block; color: #00bfb3; font-size: 1.1em; margin-bottom: 0.2em; }
  .cost { background: rgba(0,191,179,.06); border: 1px solid #00bfb3; border-radius: 12px; padding: 11px 13px; font-size: 0.68em; color: #9a9aa0; }
  .cost b { display: block; color: #00bfb3; font-size: 1.05em; margin-bottom: 0.2em; }
  .avoid { background: rgba(191,72,0,.1); border: 1px solid #bf4800; border-radius: 12px; padding: 11px 13px; font-size: 0.68em; color: #9a9aa0; }
  .avoid b { display: block; color: #bf4800; font-size: 1.05em; margin-bottom: 0.2em; }
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
  .subhead { color: #9a9aa0; font-size: 0.7em; line-height: 1.45; margin: 0.35em 0 0.7em; max-width: 94%; }
  .subhead strong { color: #fff; }
  .slide-foot {
    position: absolute; bottom: 22px; left: 48px; right: 48px;
    border-top: 2px solid #e20074;
    padding-top: 8px;
    font-size: 0.52em;
    color: #9a9aa0;
    display: flex; justify-content: space-between;
  }
  .flow { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 0.45em 0 0.15em; font-size: 0.58em; color: #9a9aa0; flex-wrap: wrap; }
  .flow span { background: rgba(255,255,255,.06); border: 1px solid #2a2a2e; border-radius: 8px; padding: 5px 9px; color: #fff; }
  .flow em { font-style: normal; color: #e20074; font-weight: 700; }
---

<!-- _class: lead -->

<span class="kicker">T-MOBILE · SITE DR</span>

# Warm DR without cost overages

## Polaris &amp; Titan — designed for Magenta economics

<p>T-Mobile is right to worry about DR spend. This design buys <strong>deliberate failover</strong> across <strong>Polaris</strong> and <strong>Titan</strong> without a second full hot-tier estate — cost levers are built in, not bolted on later.</p>

---

<span class="kicker">T-MOBILE · THE TRADE</span>

# Outage cost vs DR overage risk

<p class="subhead">The wrong answer is a museum DR. The expensive answer is mirroring Polaris hot storage on Titan. We chose a third path.</p>

<div class="cols">
  <div class="avoid">
    <b>What we avoid</b>
    Full hot-tier mirror of Polaris on Titan · idle “museum” standby that still burns OpEx · CCR amplify when transforms must write · ML/alerting duplicated on every ingest cluster
  </div>
  <div class="cost">
    <b>What we keep warm</b>
    Dual ingest for parity · Titan searchable with <strong>1 day hot, remainder frozen</strong> · ops Cluster 3 for ML/alerting/UI · shared snapshots for corruption undo
  </div>
</div>

<div class="stat-row" style="margin-top:0.65em">
  <div class="stat"><b>Un-carrier trust</b><span>Launch &amp; care stay visible</span></div>
  <div class="stat"><b>Gross-add protected</b><span>No blind ops mid-migration</span></div>
  <div class="stat"><b>Board-ready failover</b><span>Routing change — not rebuild</span></div>
  <div class="stat"><b>Spend controlled</b><span>Warm without hot overage</span></div>
</div>

<div class="slide-foot"><span>T-Mobile · Polaris &amp; Titan</span><span>Continuity without a second hot estate</span></div>

---

<span class="kicker">T-MOBILE · COST LEVERS</span>

# How we made Titan cost-efficient

<p class="subhead">Same Polaris / Titan architecture — every lever exists to stop DR from becoming an overage.</p>

<div class="flow">
  <span>Kafka</span> →
  <span><em>Polaris</em></span>
  <span>+</span>
  <span><em>Titan</em></span>
  <span>→</span>
  <span>Ops Cluster 3 (CCS)</span>
</div>

<div class="cols-3">
  <div class="dc"><b>Polaris</b>Production data plane<br/>Hot / warm / cold as today</div>
  <div class="dc"><b>Titan</b>Full parity · dual ingest<br/><strong>1 day hot · rest frozen</strong></div>
  <div class="ops"><b>Ops · Cluster 3</b>ML · alerting · dashboards<br/>Not duplicated on ingest DCs</div>
</div>

<div class="pillar-grid" style="margin-top:0.55em">
  <div class="pillar"><b>Frozen, not deleted</b>Keep Titan lookback — move older data to frozen instead of paying hot forever</div>
  <div class="pillar"><b>One Kafka</b>Event bus stays primary-side — no second bus to fund and operate</div>
  <div class="pillar"><b>Ops off the data plane</b>ML / alerting / users on Cluster 3 — avoid doubling that spend on Polaris and Titan</div>
  <div class="pillar"><b>Snapshots once</b>Shared object storage — required undo without a third full cluster copy</div>
</div>

<div class="slide-foot"><span>T-Mobile · cost-efficient DR</span><span>Warm Titan · frozen lookback · shared snapshots</span></div>

---

<span class="kicker">T-MOBILE · CLOSE</span>

# What Magenta is buying

<p class="subhead">Continuity and evidence — engineered so DR does not become the next OpEx surprise.</p>

<div class="pillar-grid">
  <div class="pillar"><b>Cutover in minutes</b>Warm Titan already indexing — failover is routing, not rebuild</div>
  <div class="pillar"><b>Complete after failover</b>Same logical view for NOC and exec dashboards</div>
  <div class="pillar"><b>Corruption undo</b>Shared snapshots between Polaris and Titan</div>
  <div class="pillar"><b>Cost-capped warmth</b>Full lookback without mirroring Polaris hot-tier spend</div>
</div>

<div class="callout"><strong>Close:</strong> Dual ingest costs more than a single site — by design. Titan’s <strong>1 day hot + frozen remainder</strong>, shared snapshots, and ops on Cluster 3 are how we keep that delta from becoming an overage. Agree on “seconds of loss vs hours of blind ops,” then fund this path — not a full hot mirror.</div>

<div class="slide-foot"><span>Elastic × T-Mobile · Site DR</span><span>As cost-efficient as warm DR allows</span></div>
