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

---

<span class="kicker">TWO OPTIONS · SAME COST BAND</span>

# Warm HA — pick automation level

<p class="sub">Both keep Titan <strong>1 day hot · rest frozen</strong>. Cost is comparable. Option 2 adds touchless failover.</p>

<div class="split">
  <div class="panel">
    <span class="tag">OPTION 1</span>
    <h3>Two clusters · two DCs</h3>
    <svg viewBox="0 0 320 120" fill="none" aria-hidden="true">
      <rect x="20" y="28" width="110" height="64" rx="10" fill="rgba(226,0,116,.12)" stroke="#e20074" stroke-width="2"/>
      <text x="75" y="58" text-anchor="middle" fill="#e20074" font-size="14" font-weight="700" font-family="sans-serif">Polaris</text>
      <text x="75" y="76" text-anchor="middle" fill="#9a9aa0" font-size="11" font-family="sans-serif">Primary DC</text>
      <rect x="190" y="28" width="110" height="64" rx="10" fill="rgba(226,0,116,.12)" stroke="#e20074" stroke-width="2"/>
      <text x="245" y="58" text-anchor="middle" fill="#e20074" font-size="14" font-weight="700" font-family="sans-serif">Titan</text>
      <text x="245" y="76" text-anchor="middle" fill="#9a9aa0" font-size="11" font-family="sans-serif">Warm peer</text>
      <path d="M136 60h48" stroke="#fff" stroke-width="2" stroke-dasharray="4 3"/>
      <circle cx="160" cy="60" r="10" fill="#050816" stroke="#fff" stroke-width="1.5"/>
      <text x="160" y="64" text-anchor="middle" fill="#fff" font-size="10" font-family="sans-serif">+</text>
    </svg>
    <p>Dual ingest. Operators cut over when a DC fails.</p>
    <div class="eq">≈ same cost as Option 2</div>
  </div>
  <div class="panel pick">
    <span class="tag">OPTION 2</span>
    <h3>Three clusters · CCS</h3>
    <svg viewBox="0 0 320 120" fill="none" aria-hidden="true">
      <rect x="8" y="38" width="88" height="52" rx="8" fill="rgba(226,0,116,.12)" stroke="#e20074" stroke-width="2"/>
      <text x="52" y="62" text-anchor="middle" fill="#e20074" font-size="12" font-weight="700" font-family="sans-serif">Polaris</text>
      <text x="52" y="78" text-anchor="middle" fill="#9a9aa0" font-size="10" font-family="sans-serif">Data</text>
      <rect x="116" y="38" width="88" height="52" rx="8" fill="rgba(226,0,116,.12)" stroke="#e20074" stroke-width="2"/>
      <text x="160" y="62" text-anchor="middle" fill="#e20074" font-size="12" font-weight="700" font-family="sans-serif">Titan</text>
      <text x="160" y="78" text-anchor="middle" fill="#9a9aa0" font-size="10" font-family="sans-serif">Warm</text>
      <rect x="224" y="28" width="88" height="72" rx="8" fill="rgba(0,191,179,.12)" stroke="#00bfb3" stroke-width="2"/>
      <text x="268" y="52" text-anchor="middle" fill="#00bfb3" font-size="12" font-weight="700" font-family="sans-serif">Ops 3</text>
      <text x="268" y="70" text-anchor="middle" fill="#9a9aa0" font-size="10" font-family="sans-serif">ML · CCS</text>
      <text x="268" y="86" text-anchor="middle" fill="#9a9aa0" font-size="10" font-family="sans-serif">UI · Alert</text>
      <path d="M100 64h12M208 64h12" stroke="#fff" stroke-width="1.5"/>
    </svg>
    <p>Same data plane + ops cluster for <strong>touchless</strong> failover.</p>
    <div class="eq">≈ same cost as Option 1</div>
  </div>
</div>

<div class="slide-foot"><span>T-Mobile · Polaris &amp; Titan</span><span>Warm HA · cost-capped</span></div>

---

<span class="kicker">TODAY + NEXT</span>

# Value now · outcomes next

<p class="sub"><strong>Useful today</strong> on transaction data. <strong>Next</strong>: full Magenta data, ML decisions, closed-loop automation.</p>

<div class="tiles">
  <div class="tile now">
    <svg class="ico" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <rect x="6" y="10" width="40" height="28" rx="4" stroke="#0071e3" stroke-width="2"/>
      <path d="M14 36v4h24v-4" stroke="#0071e3" stroke-width="2"/>
      <path d="M14 22h8M14 28h16" stroke="#0071e3" stroke-width="2" stroke-linecap="round"/>
      <circle cx="36" cy="24" r="5" fill="rgba(0,113,227,.25)" stroke="#0071e3" stroke-width="1.5"/>
    </svg>
    <b>Real-time ops dashboards</b>
    <span>Live transaction health in ops scenarios</span>
  </div>
  <div class="tile now">
    <svg class="ico" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="12" stroke="#0071e3" stroke-width="2"/>
      <path d="M33 33l8 8" stroke="#0071e3" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
    <b>Search &amp; investigate</b>
    <span>Dashboard spike → transaction in seconds</span>
  </div>
  <div class="tile now">
    <svg class="ico" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <path d="M26 8v8M26 36v8M8 26h8M36 26h8" stroke="#0071e3" stroke-width="2" stroke-linecap="round"/>
      <circle cx="26" cy="26" r="10" stroke="#0071e3" stroke-width="2"/>
      <circle cx="26" cy="26" r="3" fill="#0071e3"/>
    </svg>
    <b>Alerting today</b>
    <span>Signals on the data you already have</span>
  </div>
</div>

<div class="tiles" style="margin-top:12px">
  <div class="tile next">
    <svg class="ico" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <path d="M10 36c8-2 10-14 16-14s8 12 16 14" stroke="#00bfb3" stroke-width="2" stroke-linecap="round"/>
      <circle cx="14" cy="36" r="3" fill="#00bfb3"/>
      <circle cx="26" cy="22" r="3" fill="#00bfb3"/>
      <circle cx="38" cy="36" r="3" fill="#00bfb3"/>
      <path d="M38 28l4-8 4 2" stroke="#00bfb3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <b>Closed-loop automation</b>
    <span>Detect → ML → remediate</span>
  </div>
  <div class="tile next">
    <svg class="ico" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <rect x="10" y="14" width="32" height="24" rx="4" stroke="#00bfb3" stroke-width="2"/>
      <path d="M18 26h16M18 32h10" stroke="#00bfb3" stroke-width="2" stroke-linecap="round"/>
      <circle cx="36" cy="18" r="6" fill="#050816" stroke="#00bfb3" stroke-width="2"/>
      <path d="M36 15v6M33 18h6" stroke="#00bfb3" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <b>Full Magenta data + ML</b>
    <span>Decisions on T-Mobile’s full estate</span>
  </div>
  <div class="tile next">
    <svg class="ico" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <circle cx="18" cy="20" r="7" stroke="#00bfb3" stroke-width="2"/>
      <circle cx="34" cy="20" r="7" stroke="#00bfb3" stroke-width="2"/>
      <circle cx="26" cy="34" r="7" stroke="#00bfb3" stroke-width="2"/>
      <path d="M24 22l-2 6M28 22l2 6M22 20h8" stroke="#00bfb3" stroke-width="1.5"/>
    </svg>
    <b>RCA · SLA · fraud</b>
    <span>Cross-domain ops, eSIM, SIEM on one lake</span>
  </div>
</div>

<div class="slide-foot"><span>T-Mobile · today + next</span><span>Ops value now · closed loop next</span></div>

---

<span class="kicker">T-MOBILE · CLOSE</span>

# Make Elastic Magenta Tier-1

<div class="journey">
  <div class="jstep blue">
    <b>Today</b>
    <span>Transactions · ops dashboards</span>
  </div>
  <span class="jarrow">→</span>
  <div class="jstep magenta">
    <b>Warm HA</b>
    <span>Polaris + Titan · 2 or 3 clusters</span>
  </div>
  <span class="jarrow">→</span>
  <div class="jstep teal">
    <b>Tier-1</b>
    <span>Full data · ML · closed loop</span>
  </div>
</div>

<div class="viz">
  <svg viewBox="0 0 880 160" fill="none" aria-hidden="true">
    <rect x="40" y="40" width="160" height="90" rx="12" fill="rgba(226,0,116,.1)" stroke="#e20074" stroke-width="2"/>
    <text x="120" y="78" text-anchor="middle" fill="#e20074" font-size="18" font-weight="700" font-family="sans-serif">Polaris</text>
    <text x="120" y="102" text-anchor="middle" fill="#9a9aa0" font-size="13" font-family="sans-serif">Data plane</text>
    <rect x="260" y="40" width="160" height="90" rx="12" fill="rgba(226,0,116,.1)" stroke="#e20074" stroke-width="2"/>
    <text x="340" y="78" text-anchor="middle" fill="#e20074" font-size="18" font-weight="700" font-family="sans-serif">Titan</text>
    <text x="340" y="102" text-anchor="middle" fill="#9a9aa0" font-size="13" font-family="sans-serif">1d hot · frozen</text>
    <rect x="480" y="30" width="180" height="110" rx="12" fill="rgba(0,191,179,.1)" stroke="#00bfb3" stroke-width="2"/>
    <text x="570" y="72" text-anchor="middle" fill="#00bfb3" font-size="18" font-weight="700" font-family="sans-serif">Ops Cluster 3</text>
    <text x="570" y="98" text-anchor="middle" fill="#9a9aa0" font-size="13" font-family="sans-serif">ML · alert · CCS</text>
    <text x="570" y="118" text-anchor="middle" fill="#9a9aa0" font-size="13" font-family="sans-serif">Touchless failover</text>
    <path d="M210 85h40M430 85h40" stroke="#fff" stroke-width="2"/>
    <polygon points="248,85 240,80 240,90" fill="#fff"/>
    <polygon points="468,85 460,80 460,90" fill="#fff"/>
    <text x="780" y="78" text-anchor="middle" fill="#fff" font-size="16" font-weight="700" font-family="sans-serif">≈ same</text>
    <text x="780" y="100" text-anchor="middle" fill="#00bfb3" font-size="16" font-weight="700" font-family="sans-serif">cost band</text>
    <path d="M680 85h40" stroke="#2a2a2e" stroke-width="2" stroke-dasharray="4 3"/>
  </svg>
</div>

<p class="one-liner">Protect <strong>today’s dashboards</strong>. Fund warm dual-feed — not a hot mirror. <em>Option 2</em> keeps ML and closed loop up.</p>

<div class="slide-foot"><span>Elastic × T-Mobile · Site DR</span><span>Clear · warm · Tier-1 ready</span></div>
