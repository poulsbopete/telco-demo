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
    padding: 32px 44px 26px;
    font-size: 21px;
  }
  section.lead { text-align: center; justify-content: center; }
  section.lead h1 { font-size: 1.95em; font-weight: 700; letter-spacing: -0.03em; margin: 0; color: #fff; }
  section.lead h2 { color: #00bfb3; font-size: 0.88em; font-weight: 600; margin: 0.45em 0 0; }
  section.lead p { color: #9a9aa0; font-size: 0.86em; margin-top: 0.85em; max-width: 40rem; margin-left: auto; margin-right: auto; }
  h1 { font-size: 1.22em; font-weight: 700; margin: 0 0 0.25em; letter-spacing: -0.02em; color: #fff; line-height: 1.2; }
  p { color: #9a9aa0; }
  strong { color: #fff; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; margin-top: 0.3em; }
  .cols-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 0.3em; }
  .stat-row { display: flex; gap: 8px; margin-top: 0.35em; }
  .stat { flex: 1; background: rgba(255,255,255,.04); border: 1px solid #2a2a2e; border-radius: 12px; padding: 9px 10px; text-align: center; }
  .stat b { display: block; font-size: 0.95em; color: #00bfb3; margin-bottom: 0.15em; }
  .stat span { font-size: 0.52em; color: #9a9aa0; line-height: 1.3; display: block; }
  .callout { background: #0071e3; color: #fff; border-radius: 12px; padding: 10px 14px; font-size: 0.66em; margin-top: 0.4em; }
  .callout strong { color: #fff; }
  .pillar { background: rgba(255,255,255,.04); border: 1px solid #2a2a2e; border-radius: 10px; padding: 9px 11px; font-size: 0.62em; color: #9a9aa0; }
  .pillar b { display: block; color: #00bfb3; font-size: 1.02em; margin-bottom: 0.15em; }
  .pillar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 0.3em; }
  .dc { background: rgba(226,0,116,.08); border: 1px solid rgba(226,0,116,.45); border-radius: 10px; padding: 9px 10px; font-size: 0.58em; color: #9a9aa0; text-align: center; }
  .dc b { display: block; color: #e20074; font-size: 1.08em; margin-bottom: 0.15em; }
  .ops { background: rgba(0,191,179,.08); border: 1px solid #00bfb3; border-radius: 10px; padding: 9px 10px; font-size: 0.58em; color: #9a9aa0; text-align: center; }
  .ops b { display: block; color: #00bfb3; font-size: 1.08em; margin-bottom: 0.15em; }
  .cost { background: rgba(0,191,179,.06); border: 1px solid #00bfb3; border-radius: 10px; padding: 9px 11px; font-size: 0.62em; color: #9a9aa0; }
  .cost b { display: block; color: #00bfb3; font-size: 1.02em; margin-bottom: 0.15em; }
  .avoid { background: rgba(191,72,0,.1); border: 1px solid #bf4800; border-radius: 10px; padding: 9px 11px; font-size: 0.62em; color: #9a9aa0; }
  .avoid b { display: block; color: #bf4800; font-size: 1.02em; margin-bottom: 0.15em; }
  .kicker {
    display: inline-block;
    background: #e20074;
    color: #fff;
    font-size: 0.48em;
    font-weight: 700;
    letter-spacing: 0.06em;
    padding: 3px 9px;
    margin-bottom: 0.4em;
  }
  .subhead { color: #9a9aa0; font-size: 0.64em; line-height: 1.4; margin: 0.25em 0 0.5em; max-width: 94%; }
  .subhead strong { color: #fff; }
  .slide-foot {
    position: absolute; bottom: 18px; left: 44px; right: 44px;
    border-top: 2px solid #e20074;
    padding-top: 6px;
    font-size: 0.48em;
    color: #9a9aa0;
    display: flex; justify-content: space-between;
  }
  .flow { display: flex; align-items: center; justify-content: center; gap: 6px; margin: 0.3em 0 0.1em; font-size: 0.52em; color: #9a9aa0; flex-wrap: wrap; }
  .flow span { background: rgba(255,255,255,.06); border: 1px solid #2a2a2e; border-radius: 7px; padding: 4px 8px; color: #fff; }
  .flow em { font-style: normal; color: #e20074; font-weight: 700; }
  .big-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 0.25em; }
  .big {
    background: linear-gradient(165deg, rgba(0,191,179,.12), rgba(255,255,255,.03));
    border: 1px solid #2a2a2e;
    border-radius: 12px;
    padding: 10px 8px 9px;
    text-align: center;
  }
  .big .n {
    display: block;
    font-size: 1.45em;
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1;
    color: #00bfb3;
    margin-bottom: 0.18em;
  }
  .big .n.magenta { color: #e20074; }
  .big .n.blue { color: #0071e3; }
  .big .n.warn { color: #fec514; }
  .big .l { display: block; font-size: 0.48em; font-weight: 700; color: #fff; margin-bottom: 0.12em; }
  .big .d { display: block; font-size: 0.44em; color: #9a9aa0; line-height: 1.3; }
  .analyst-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 7px; margin-top: 0.35em; }
  .analyst-badge { background: rgba(255,255,255,.04); border: 1px solid #2a2a2e; border-radius: 9px; padding: 7px 8px; font-size: 0.46em; line-height: 1.3; text-align: left; }
  .analyst-badge b { display: block; color: #00bfb3; margin-bottom: 0.1em; }
  .analyst-badge span { color: #9a9aa0; }
  .bar-row { margin-top: 0.3em; }
  .bar-item { margin-bottom: 0.28em; }
  .bar-item .meta { display: flex; justify-content: space-between; font-size: 0.5em; margin-bottom: 0.15em; }
  .bar-item .meta b { color: #fff; }
  .bar-item .meta span { color: #00bfb3; font-weight: 700; }
  .bar-track { height: 8px; border-radius: 999px; background: rgba(255,255,255,.08); overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #e20074, #00bfb3); }
---

<!-- _class: lead -->

<span class="kicker">T-MOBILE · SITE DR</span>

# Warm DR without cost overages

## Polaris &amp; Titan — Magenta economics built in

<p>T-Mobile is right to worry about DR spend. This design buys <strong>deliberate failover</strong> across <strong>Polaris</strong> and <strong>Titan</strong> without a second full hot-tier estate — cost levers are built in, not bolted on later.</p>

---

<span class="kicker">T-MOBILE · TRADE + DESIGN</span>

# Continuity without a second hot estate

<p class="subhead">Avoid a museum DR <em>and</em> a Polaris hot mirror. Dual-feed both DCs; put spend where it protects Magenta.</p>

<div class="cols">
  <div class="avoid">
    <b>Avoid</b>
    Full hot mirror on Titan · idle museum standby · CCR amplify when transforms must write · ML/alerting on every ingest cluster
  </div>
  <div class="cost">
    <b>Keep warm</b>
    Dual ingest · Titan <strong>1 day hot, rest frozen</strong> · ops Cluster 3 for ML/alerting/UI · shared snapshots
  </div>
</div>

<div class="flow">
  <span>Kafka</span> →
  <span><em>Polaris</em></span>
  <span>+</span>
  <span><em>Titan</em></span>
  <span>→</span>
  <span>Ops Cluster 3 (CCS)</span>
</div>

<div class="cols-3">
  <div class="dc"><b>Polaris</b>Ingest · transform · data<br/>Hot / warm / cold as today</div>
  <div class="dc"><b>Titan</b>Full parity · dual ingest<br/><strong>1 day hot · rest frozen</strong></div>
  <div class="ops"><b>Ops · Cluster 3</b>ML · alerting · dashboards<br/>Users land here via CCS</div>
</div>

<div class="stat-row">
  <div class="stat"><b>Frozen, not deleted</b><span>Lookback without hot forever</span></div>
  <div class="stat"><b>One Kafka</b><span>No second event bus</span></div>
  <div class="stat"><b>Ops off data plane</b><span>Don’t double ML/alert spend</span></div>
  <div class="stat"><b>Snapshots once</b><span>Shared undo, not a 3rd copy</span></div>
</div>

<div class="slide-foot"><span>T-Mobile · Polaris &amp; Titan</span><span>Warm · deliberate · cost-capped</span></div>

---

<span class="kicker">ELASTIC BY THE NUMBERS</span>

# Proof for Magenta economics

<p class="subhead">Scale, storage savings, and analyst validation — why this path is credible without overage.</p>

<div class="big-grid">
  <div class="big">
    <span class="n magenta">50%+</span>
    <span class="l">Fortune 500</span>
    <span class="d">Choose Elastic</span>
  </div>
  <div class="big">
    <span class="n">50–75%</span>
    <span class="l">Storage savings</span>
    <span class="d">Snapshots / frozen vs all-hot</span>
  </div>
  <div class="big">
    <span class="n blue">80%</span>
    <span class="l">RCA reduction</span>
    <span class="d">Telefónica Germany</span>
  </div>
  <div class="big">
    <span class="n warn">1</span>
    <span class="l">Query language</span>
    <span class="d">ES|QL — board to engineer</span>
  </div>
</div>

<div class="bar-row">
  <div class="bar-item">
    <div class="meta"><b>Hot-tier mirror of Polaris on Titan</b><span>Cost risk ↑↑</span></div>
    <div class="bar-track"><div class="bar-fill" style="width:92%"></div></div>
  </div>
  <div class="bar-item">
    <div class="meta"><b>This design · 1d hot + frozen + shared snapshots</b><span>Cost capped</span></div>
    <div class="bar-track"><div class="bar-fill" style="width:38%"></div></div>
  </div>
</div>

<div class="analyst-row">
  <div class="analyst-badge"><b>Gartner®</b><span><strong>Leader</strong> — Observability (2025)</span></div>
  <div class="analyst-badge"><b>Gartner®</b><span><strong>Visionary</strong> — SIEM (2025)</span></div>
  <div class="analyst-badge"><b>Forrester</b><span><strong>Leader</strong> — Sec Analytics Q2’25</span></div>
  <div class="analyst-badge"><b>IDC</b><span><strong>Leader</strong> — XDR (2025)</span></div>
</div>

<div class="slide-foot"><span>Elastic by the numbers</span><span>Analyst recognition · storage economics · telco proof</span></div>

---

<span class="kicker">T-MOBILE · CLOSE</span>

# What Magenta is buying

<p class="subhead">Continuity and evidence — engineered so DR is not the next OpEx surprise.</p>

<div class="pillar-grid">
  <div class="pillar"><b>Cutover in minutes</b>Warm Titan already indexing — failover is routing</div>
  <div class="pillar"><b>Complete after failover</b>Same logical view for NOC and exec dashboards</div>
  <div class="pillar"><b>Corruption undo</b>Shared snapshots between Polaris and Titan</div>
  <div class="pillar"><b>Cost-capped warmth</b>Full lookback without mirroring Polaris hot spend</div>
</div>

<div class="callout"><strong>Close:</strong> Dual ingest costs more than one site — by design. Titan’s <strong>1 day hot + frozen remainder</strong>, shared snapshots, and ops on Cluster 3 keep that delta from becoming an overage. Agree on “seconds of loss vs hours of blind ops,” then fund this path — not a full hot mirror.</div>

<div class="slide-foot"><span>Elastic × T-Mobile · Site DR</span><span>As cost-efficient as warm DR allows</span></div>
