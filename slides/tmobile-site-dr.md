---
marp: true
theme: default
paginate: true
size: 16:9
title: T-Mobile · Site Disaster Recovery — Business Value
description: Leave one-DC Polaris behind — warm Polaris & Titan HA options without hot-tier overages
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
  .opt {
    background: rgba(255,255,255,.04);
    border: 1px solid #2a2a2e;
    border-radius: 12px;
    padding: 11px 12px;
    font-size: 0.58em;
    color: #9a9aa0;
    line-height: 1.35;
  }
  .opt.pick {
    background: rgba(0,191,179,.08);
    border-color: #00bfb3;
  }
  .opt .tag {
    display: inline-block;
    font-size: 0.85em;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #e20074;
    margin-bottom: 0.35em;
  }
  .opt.pick .tag { color: #00bfb3; }
  .opt b { display: block; color: #fff; font-size: 1.08em; margin-bottom: 0.25em; }
  .opt .same {
    margin-top: 0.45em;
    padding-top: 0.4em;
    border-top: 1px solid #2a2a2e;
    color: #00bfb3;
    font-weight: 700;
    font-size: 0.95em;
  }
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
  .gap {
    background: rgba(191,72,0,.12);
    border: 1px solid #bf4800;
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 0.62em;
    color: #9a9aa0;
    margin: 0.55em auto 0;
    max-width: 38rem;
    text-align: left;
  }
  .gap b { color: #fec514; display: block; margin-bottom: 0.2em; font-size: 1.05em; }
  .today {
    background: rgba(191,72,0,.1);
    border: 1px solid #bf4800;
    border-radius: 10px;
    padding: 9px 11px;
    font-size: 0.58em;
    color: #9a9aa0;
    margin-bottom: 0.35em;
  }
  .today b { display: block; color: #bf4800; font-size: 1.05em; margin-bottom: 0.15em; }
---

<!-- _class: lead -->

<span class="kicker">T-MOBILE · SITE DR</span>

# Today: one DC · no HA Site DR

## Deployed only in Polaris — Magenta needs a second live path

<div class="gap">
  <b>Current issue</b>
  Observability is <strong>deployed in one data center only (Polaris)</strong>. No Titan peer, no highly available Site DR. A Polaris DC event means <strong>blind NOC / care / exec views</strong> — restore from snapshots is not high availability.
</div>

<p>Two warm options across <strong>Polaris</strong> and <strong>Titan</strong> close that gap at <strong>roughly the same cost</strong> — without standing up a second full hot-tier estate.</p>

---

<span class="kicker">T-MOBILE · CLOSE THE HA GAP</span>

# From single-site risk to warm HA

<p class="subhead">Close today’s <strong>single-DC · no HA</strong> gap. Both options stay warm (Titan <strong>1 day hot · rest frozen</strong>). Cost is comparable — the delta is automation.</p>

<div class="today">
  <b>Today · the issue</b>
  <strong>One data center only (Polaris)</strong> — no Titan deployment, no highly available Site DR. Polaris loss → hours of blind ops until restore. Not Magenta-grade continuity.
</div>

<div class="cols">
  <div class="opt">
    <span class="tag">OPTION 1</span>
    <b>Two clusters · two data centers</b>
    Polaris + Titan dual ingest. Operators choose which site is live and cut over deliberately when a DC fails.
    <div class="same">≈ same cost as Option 2</div>
  </div>
  <div class="opt pick">
    <span class="tag">OPTION 2</span>
    <b>Three clusters · CCS on Cluster 3</b>
    Same Polaris + Titan data plane, plus an ops cluster for ML / alerting / UI via CCS — <strong>touchless automated failover</strong>.
    <div class="same">≈ same cost as Option 1</div>
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
  <div class="dc"><b>Polaris</b>Ingest · transform · data</div>
  <div class="dc"><b>Titan</b>Parity · <strong>1d hot · rest frozen</strong></div>
  <div class="ops"><b>Ops · Cluster 3</b>ML · alert · dashboards · CCS</div>
</div>

<div class="callout"><strong>Talk track:</strong> Today Magenta is <strong>in one DC only</strong> with <strong>no HA Site DR</strong>. These two paths cost about the same; Option 2 spends that band to <strong>remove human cutover</strong> — not to buy another hot mirror.</div>

<div class="slide-foot"><span>T-Mobile · Polaris &amp; Titan</span><span>One DC today · close HA · ≈ same cost</span></div>

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

<p class="subhead">Leave <strong>one-DC-only</strong> behind — continuity engineered so DR is not the next OpEx surprise.</p>

<div class="pillar-grid">
  <div class="pillar"><b>Second DC · real HA</b>Titan peer path — not restore-from-snapshot as “DR”</div>
  <div class="pillar"><b>Option 1 or 2 · same band</b>Two DCs, or three + CCS for touchless failover</div>
  <div class="pillar"><b>Complete after failover</b>Same logical view for NOC and exec dashboards</div>
  <div class="pillar"><b>Cost-capped warmth</b>1d hot + frozen — not a Polaris hot mirror</div>
</div>

<div class="callout"><strong>Close:</strong> Magenta today is <strong>deployed in one data center only</strong> with <strong>no HA Site DR</strong>. Two clusters or three with CCS — <strong>roughly the same cost</strong> — put Titan online and close that gap. Option 2 buys <strong>touchless automated failover</strong>, not another hot estate. Fund warm dual-feed — not a full hot mirror.</div>

<div class="slide-foot"><span>Elastic × T-Mobile · Site DR</span><span>Leave one-DC behind · warm HA</span></div>
