---
marp: true
theme: default
paginate: true
size: 16:9
title: T-Mobile · Site Disaster Recovery — Business Value
description: Elevate Elastic to Magenta Tier-1 — leave one-DC Polaris behind with warm Polaris & Titan HA
style: |
  section {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    background: #050816;
    color: #f5f5f7;
    padding: 28px 40px 22px;
    font-size: 22px;
  }
  section.lead { text-align: center; justify-content: center; }
  section.lead h1 { font-size: 1.85em; font-weight: 700; letter-spacing: -0.03em; margin: 0; color: #fff; }
  section.lead h2 { color: #00bfb3; font-size: 0.78em; font-weight: 600; margin: 0.4em 0 0; }
  h1 { font-size: 1.35em; font-weight: 700; margin: 0 0 0.15em; letter-spacing: -0.02em; color: #fff; line-height: 1.15; }
  p { color: #9a9aa0; }
  strong { color: #fff; }
  .kicker {
    display: inline-block;
    background: #e20074;
    color: #fff;
    font-size: 0.45em;
    font-weight: 700;
    letter-spacing: 0.06em;
    padding: 3px 9px;
    margin-bottom: 0.35em;
  }
  .sub { color: #9a9aa0; font-size: 0.62em; margin: 0.15em 0 0.55em; }
  .sub strong { color: #fff; }
  .slide-foot {
    position: absolute; bottom: 16px; left: 40px; right: 40px;
    border-top: 2px solid #e20074;
    padding-top: 5px;
    font-size: 0.45em;
    color: #9a9aa0;
    display: flex; justify-content: space-between;
  }
  .viz { display: flex; justify-content: center; margin: 0.4em 0 0.2em; }
  .viz svg { width: 100%; max-width: 920px; height: auto; }
  .split { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 0.4em; align-items: stretch; }
  .panel {
    background: rgba(255,255,255,.03);
    border: 1px solid #2a2a2e;
    border-radius: 14px;
    padding: 14px 14px 12px;
    text-align: center;
  }
  .panel.pick { border-color: #00bfb3; background: rgba(0,191,179,.07); }
  .panel .tag {
    display: inline-block;
    font-size: 0.48em;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: #e20074;
    margin-bottom: 0.35em;
  }
  .panel.pick .tag { color: #00bfb3; }
  .panel h3 { margin: 0 0 0.35em; font-size: 0.78em; color: #fff; font-weight: 700; }
  .panel p { margin: 0; font-size: 0.52em; line-height: 1.35; color: #9a9aa0; }
  .panel .eq {
    margin-top: 0.55em;
    font-size: 0.52em;
    font-weight: 700;
    color: #00bfb3;
  }
  .panel svg { width: 100%; max-width: 360px; height: auto; margin: 0.2em auto 0.45em; display: block; }
  .tiles { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 0.25em; }
  .tile {
    background: rgba(255,255,255,.03);
    border: 1px solid #2a2a2e;
    border-radius: 14px;
    padding: 14px 12px 12px;
    text-align: center;
  }
  .tile.now { border-color: #0071e3; background: rgba(0,113,227,.08); }
  .tile.next { border-color: #00bfb3; background: rgba(0,191,179,.07); }
  .tile .ico { width: 52px; height: 52px; margin: 0 auto 0.45em; }
  .tile b { display: block; font-size: 0.62em; color: #fff; margin-bottom: 0.2em; }
  .tile span { display: block; font-size: 0.48em; color: #9a9aa0; line-height: 1.3; }
  .journey {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 0.7em 0 0.5em;
    flex-wrap: wrap;
  }
  .jstep {
    background: rgba(255,255,255,.04);
    border: 1px solid #2a2a2e;
    border-radius: 12px;
    padding: 12px 16px;
    text-align: center;
    min-width: 120px;
  }
  .jstep b { display: block; font-size: 0.58em; color: #fff; }
  .jstep span { display: block; font-size: 0.44em; color: #9a9aa0; margin-top: 0.15em; }
  .jstep.magenta { border-color: rgba(226,0,116,.55); }
  .jstep.magenta b { color: #e20074; }
  .jstep.blue { border-color: #0071e3; }
  .jstep.blue b { color: #0071e3; }
  .jstep.teal { border-color: #00bfb3; }
  .jstep.teal b { color: #00bfb3; }
  .jarrow { color: #e20074; font-size: 1.1em; font-weight: 700; }
  .one-liner {
    text-align: center;
    font-size: 0.72em;
    color: #fff;
    margin-top: 0.35em;
    line-height: 1.35;
  }
  .one-liner em { font-style: normal; color: #00bfb3; }
  .pain-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 14px;
    margin: 0.7em auto 0;
    max-width: 820px;
  }
  .pain {
    background: rgba(191,72,0,.12);
    border: 1px solid #bf4800;
    border-radius: 14px;
    padding: 16px 12px;
    text-align: center;
  }
  .pain .ico { width: 48px; height: 48px; margin: 0 auto 0.4em; }
  .pain b { display: block; font-size: 0.68em; color: #fec514; margin-bottom: 0.15em; }
  .pain span { display: block; font-size: 0.5em; color: #9a9aa0; line-height: 1.3; }
  .lead-note {
    color: #9a9aa0;
    font-size: 0.58em;
    line-height: 1.4;
    max-width: 42rem;
    margin: 0.75em auto 0;
  }
  .lead-note strong { color: #fff; }
  .note {
    margin-top: 0.45em;
    padding: 8px 12px;
    background: rgba(0,113,227,.15);
    border-left: 3px solid #0071e3;
    border-radius: 0 8px 8px 0;
    font-size: 0.52em;
    color: #c8c8cc;
    line-height: 1.35;
  }
  .note strong { color: #fff; }
  .section-label {
    font-size: 0.46em;
    font-weight: 700;
    letter-spacing: 0.06em;
    margin: 0.15em 0 0.35em;
  }
  .section-label.now { color: #0071e3; }
  .section-label.next { color: #00bfb3; margin-top: 0.55em; }
  .arch {
    margin: 0.35em auto 0.25em;
    max-width: 860px;
  }
  .arch svg { width: 100%; height: auto; display: block; }
  .bullets {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    margin-top: 0.35em;
  }
  .bullet {
    background: rgba(255,255,255,.03);
    border: 1px solid #2a2a2e;
    border-radius: 12px;
    padding: 10px 12px;
    font-size: 0.5em;
    color: #9a9aa0;
    line-height: 1.35;
  }
  .bullet b { display: block; color: #00bfb3; font-size: 1.05em; margin-bottom: 0.15em; }
---

<!-- _class: lead -->

<span class="kicker">T-MOBILE · SITE DR</span>

# One DC. Not Tier-1. No HA.

## Transactions today · Magenta Tier-1 tomorrow

<div class="pain-row">
  <div class="pain">
    <svg class="ico" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="14" y="10" width="20" height="28" rx="3" stroke="#bf4800" stroke-width="2"/>
      <circle cx="24" cy="34" r="2" fill="#fec514"/>
      <path d="M10 42h28" stroke="#bf4800" stroke-width="2" stroke-linecap="round"/>
    </svg>
    <b>One data center</b>
    <span>Polaris only — no Titan peer</span>
  </div>
  <div class="pain">
    <svg class="ico" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="14" stroke="#bf4800" stroke-width="2"/>
      <path d="M16 24h16M24 16v16" stroke="#fec514" stroke-width="2" stroke-linecap="round"/>
      <path d="M8 8l32 32" stroke="#bf4800" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
    <b>Not a core system</b>
    <span>Not Magenta Tier-1 yet</span>
  </div>
  <div class="pain">
    <svg class="ico" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 8l14 8v10c0 9-6 14-14 16-8-2-14-7-14-16V16l14-8z" stroke="#bf4800" stroke-width="2"/>
      <path d="M24 20v8M24 32h.01" stroke="#fec514" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
    <b>No HA Site DR</b>
    <span>Restore ≠ high availability</span>
  </div>
</div>

<p class="lead-note">Elastic already delivers value on <strong>transaction data</strong> — real-time ops dashboards and investigation — but Magenta won’t treat it as <strong>Tier-1</strong> on a single-DC footprint. Ahead: <strong>full T-Mobile data</strong>, <strong>ML-based decisions</strong>, and <strong>closed-loop automation</strong>.</p>

---

<span class="kicker">RECOMMENDED · WARM HA + CCS</span>

# Three clusters · touchless failover

<p class="sub">Polaris + Titan dual ingest (Titan <strong>1 day hot · rest frozen</strong>) plus an ops cluster for ML, alerting, and UI via CCS — Tier-1 ready without a second hot estate.</p>

<div class="arch">
  <svg viewBox="0 0 860 200" fill="none" aria-hidden="true">
    <rect x="20" y="70" width="70" height="50" rx="10" fill="rgba(255,255,255,.06)" stroke="#2a2a2e" stroke-width="2"/>
    <text x="55" y="100" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="sans-serif">Kafka</text>
    <path d="M96 95h28" stroke="#fff" stroke-width="2"/>
    <polygon points="128,95 120,90 120,100" fill="#fff"/>
    <rect x="140" y="50" width="160" height="90" rx="12" fill="rgba(226,0,116,.12)" stroke="#e20074" stroke-width="2"/>
    <text x="220" y="88" text-anchor="middle" fill="#e20074" font-size="18" font-weight="700" font-family="sans-serif">Polaris</text>
    <text x="220" y="112" text-anchor="middle" fill="#9a9aa0" font-size="13" font-family="sans-serif">Ingest · transform · data</text>
    <path d="M308 95h28" stroke="#fff" stroke-width="2"/>
    <polygon points="340,95 332,90 332,100" fill="#fff"/>
    <text x="324" y="78" text-anchor="middle" fill="#9a9aa0" font-size="11" font-family="sans-serif">+</text>
    <rect x="350" y="50" width="160" height="90" rx="12" fill="rgba(226,0,116,.12)" stroke="#e20074" stroke-width="2"/>
    <text x="430" y="88" text-anchor="middle" fill="#e20074" font-size="18" font-weight="700" font-family="sans-serif">Titan</text>
    <text x="430" y="112" text-anchor="middle" fill="#9a9aa0" font-size="13" font-family="sans-serif">1d hot · rest frozen</text>
    <path d="M518 95h28" stroke="#fff" stroke-width="2"/>
    <polygon points="550,95 542,90 542,100" fill="#fff"/>
    <rect x="560" y="35" width="200" height="120" rx="12" fill="rgba(0,191,179,.12)" stroke="#00bfb3" stroke-width="2"/>
    <text x="660" y="78" text-anchor="middle" fill="#00bfb3" font-size="18" font-weight="700" font-family="sans-serif">Ops Cluster 3</text>
    <text x="660" y="104" text-anchor="middle" fill="#9a9aa0" font-size="13" font-family="sans-serif">ML · alerting · dashboards</text>
    <text x="660" y="126" text-anchor="middle" fill="#9a9aa0" font-size="13" font-family="sans-serif">CCS · touchless failover</text>
    <text x="780" y="175" text-anchor="middle" fill="#00bfb3" font-size="12" font-weight="700" font-family="sans-serif">Users &amp; automation land here</text>
  </svg>
</div>

<div class="bullets">
  <div class="bullet"><b>Warm dual-feed</b>Kafka into Polaris and Titan — no second event bus, no idle museum DR</div>
  <div class="bullet"><b>Cost-capped Titan</b>1 day hot, remainder frozen — lookback without mirroring Polaris hot spend</div>
  <div class="bullet"><b>Touchless ops plane</b>ML, alerts, and UI on Cluster 3 via CCS — stays up when a data DC fails</div>
</div>

<div class="note"><strong>Avoid:</strong> a full hot mirror of Polaris on Titan. This design buys <strong>touchless automated failover</strong> and Tier-1 continuity — not another hot estate.</div>

<div class="slide-foot"><span>T-Mobile · Polaris &amp; Titan + Ops</span><span>Warm HA · CCS · touchless</span></div>

---

<span class="kicker">TODAY + NEXT</span>

# Value now · outcomes next

<p class="sub">Don’t wait for full Magenta data to get value — then size Tier-1 warm HA for what’s coming.</p>

<p class="section-label now">USEFUL TODAY · TRANSACTION DATA</p>
<div class="tiles">
  <div class="tile now">
    <svg class="ico" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <rect x="6" y="10" width="40" height="28" rx="4" stroke="#0071e3" stroke-width="2"/>
      <path d="M14 36v4h24v-4" stroke="#0071e3" stroke-width="2"/>
      <path d="M14 22h8M14 28h16" stroke="#0071e3" stroke-width="2" stroke-linecap="round"/>
      <circle cx="36" cy="24" r="5" fill="rgba(0,113,227,.25)" stroke="#0071e3" stroke-width="1.5"/>
    </svg>
    <b>Real-time ops dashboards</b>
    <span>Live transaction health for NOC and ops — see what’s failing now, not in a batch report</span>
  </div>
  <div class="tile now">
    <svg class="ico" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="12" stroke="#0071e3" stroke-width="2"/>
      <path d="M33 33l8 8" stroke="#0071e3" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
    <b>Search &amp; investigate</b>
    <span>ES|QL / Discover — drill from a dashboard spike to the offending transaction in seconds</span>
  </div>
  <div class="tile now">
    <svg class="ico" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <path d="M26 8v8M26 36v8M8 26h8M36 26h8" stroke="#0071e3" stroke-width="2" stroke-linecap="round"/>
      <circle cx="26" cy="26" r="10" stroke="#0071e3" stroke-width="2"/>
      <circle cx="26" cy="26" r="3" fill="#0071e3"/>
    </svg>
    <b>Alerting today</b>
    <span>Threshold and anomaly alerts on indexed transactions — early signal before full data lands</span>
  </div>
</div>

<p class="section-label next">NEXT · FULL T-MOBILE DATA · ML · CLOSED LOOP</p>
<div class="tiles">
  <div class="tile next">
    <svg class="ico" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <path d="M10 36c8-2 10-14 16-14s8 12 16 14" stroke="#00bfb3" stroke-width="2" stroke-linecap="round"/>
      <circle cx="14" cy="36" r="3" fill="#00bfb3"/>
      <circle cx="26" cy="22" r="3" fill="#00bfb3"/>
      <circle cx="38" cy="36" r="3" fill="#00bfb3"/>
      <path d="M38 28l4-8 4 2" stroke="#00bfb3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <b>Closed-loop automation</b>
    <span>Detect RAN / core / transport faults → ML correlate → auto remediate</span>
  </div>
  <div class="tile next">
    <svg class="ico" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <rect x="10" y="14" width="32" height="24" rx="4" stroke="#00bfb3" stroke-width="2"/>
      <path d="M18 26h16M18 32h10" stroke="#00bfb3" stroke-width="2" stroke-linecap="round"/>
      <circle cx="36" cy="18" r="6" fill="#050816" stroke="#00bfb3" stroke-width="2"/>
      <path d="M36 15v6M33 18h6" stroke="#00bfb3" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <b>Full Magenta data + ML</b>
    <span>ML-based decisions on T-Mobile’s full estate — not transactions alone</span>
  </div>
  <div class="tile next">
    <svg class="ico" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <circle cx="18" cy="20" r="7" stroke="#00bfb3" stroke-width="2"/>
      <circle cx="34" cy="20" r="7" stroke="#00bfb3" stroke-width="2"/>
      <circle cx="26" cy="34" r="7" stroke="#00bfb3" stroke-width="2"/>
      <path d="M24 22l-2 6M28 22l2 6M22 20h8" stroke="#00bfb3" stroke-width="1.5"/>
    </svg>
    <b>RCA · eSIM SLA · fraud</b>
    <span>Cross-domain RCA, activation SLA, SIM-swap SIEM on one lake</span>
  </div>
</div>

<div class="slide-foot"><span>T-Mobile · today + next</span><span>Ops value now · closed loop next</span></div>

---

<span class="kicker">T-MOBILE · CLOSE</span>

# Make Elastic Magenta Tier-1

<p class="sub">Protect today’s ops value. Build the warm HA footprint Magenta needs before full data, ML, and closed loop go live.</p>

<div class="journey">
  <div class="jstep blue">
    <b>Today</b>
    <span>Transactions · ops dashboards</span>
  </div>
  <span class="jarrow">→</span>
  <div class="jstep magenta">
    <b>Warm HA + CCS</b>
    <span>Polaris + Titan + Ops Cluster 3</span>
  </div>
  <span class="jarrow">→</span>
  <div class="jstep teal">
    <b>Tier-1</b>
    <span>Full data · ML · closed loop</span>
  </div>
</div>

<div class="viz">
  <svg viewBox="0 0 720 150" fill="none" aria-hidden="true">
    <rect x="30" y="30" width="160" height="90" rx="12" fill="rgba(226,0,116,.1)" stroke="#e20074" stroke-width="2"/>
    <text x="110" y="70" text-anchor="middle" fill="#e20074" font-size="18" font-weight="700" font-family="sans-serif">Polaris</text>
    <text x="110" y="94" text-anchor="middle" fill="#9a9aa0" font-size="13" font-family="sans-serif">Data plane</text>
    <rect x="240" y="30" width="160" height="90" rx="12" fill="rgba(226,0,116,.1)" stroke="#e20074" stroke-width="2"/>
    <text x="320" y="70" text-anchor="middle" fill="#e20074" font-size="18" font-weight="700" font-family="sans-serif">Titan</text>
    <text x="320" y="94" text-anchor="middle" fill="#9a9aa0" font-size="13" font-family="sans-serif">1d hot · frozen</text>
    <rect x="450" y="20" width="220" height="110" rx="12" fill="rgba(0,191,179,.1)" stroke="#00bfb3" stroke-width="2"/>
    <text x="560" y="62" text-anchor="middle" fill="#00bfb3" font-size="18" font-weight="700" font-family="sans-serif">Ops Cluster 3</text>
    <text x="560" y="88" text-anchor="middle" fill="#9a9aa0" font-size="13" font-family="sans-serif">ML · alert · CCS</text>
    <text x="560" y="108" text-anchor="middle" fill="#9a9aa0" font-size="13" font-family="sans-serif">Touchless failover</text>
    <path d="M200 75h30M410 75h30" stroke="#fff" stroke-width="2"/>
    <polygon points="228,75 220,70 220,80" fill="#fff"/>
    <polygon points="438,75 430,70 430,80" fill="#fff"/>
  </svg>
</div>

<div class="note"><strong>Close:</strong> Fund warm dual-feed + CCS — not a hot mirror. Ops Cluster 3 keeps <strong>dashboards, ML, and closed-loop automation</strong> touchless when a data DC fails.</div>

<div class="slide-foot"><span>Elastic × T-Mobile · Site DR</span><span>Ops value today · Tier-1 for what’s next</span></div>
