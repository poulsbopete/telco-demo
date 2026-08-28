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
  .uc-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 0.35em; }
  .uc {
    background: rgba(255,255,255,.04);
    border: 1px solid #2a2a2e;
    border-radius: 10px;
    padding: 9px 10px;
    font-size: 0.52em;
    color: #9a9aa0;
    line-height: 1.35;
  }
  .uc b { display: block; color: #00bfb3; font-size: 1.05em; margin-bottom: 0.2em; }
  .uc.now {
    background: rgba(0,113,227,.1);
    border-color: #0071e3;
  }
  .uc.now b { color: #0071e3; }
  .section-label {
    font-size: 0.48em;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: #9a9aa0;
    margin: 0.35em 0 0.2em;
  }
  .section-label.now { color: #0071e3; }
  .section-label.next { color: #00bfb3; }
---

<!-- _class: lead -->

<span class="kicker">T-MOBILE · SITE DR</span>

# Today: not Tier-1 · one DC · no HA

## Not a Magenta core system yet — DR is the unlock

<div class="gap">
  <b>Current issue</b>
  Elastic is <strong>not a core / Tier-1 app</strong> today: <strong>transaction data only</strong>, <strong>one DC (Polaris)</strong>, no Titan peer, no HA Site DR. Ahead: <strong>full-fledged T-Mobile data</strong>, <strong>ML-based decisions</strong>, and <strong>closed-loop automation</strong> — Magenta can’t run that on a single-DC footprint. Snapshots are restore, not Tier-1 continuity.
</div>

<p>Still useful today on transaction data — <strong>real-time ops dashboards</strong>, search, and investigation. Warm dual-feed across <strong>Polaris</strong> and <strong>Titan</strong> makes Elastic a <strong>Tier-1</strong> Magenta system ready for full data, ML, and closed loop — two options at <strong>roughly the same cost</strong>.</p>

---

<span class="kicker">T-MOBILE · TIER-1 WITH WARM HA</span>

# Make Elastic a Magenta Tier-1 app

<p class="subhead">Today: transactions. Next: <strong>full Magenta data</strong>, <strong>ML-based decisions</strong>, and <strong>closed-loop automation</strong>. Build Tier-1 warm HA now — before automation depends on it.</p>

<div class="today">
  <b>Today · the issue</b>
  <strong>Transaction data only</strong> · not Tier-1 · <strong>one DC (Polaris)</strong> · no HA. Next: <strong>full T-Mobile data</strong> → <strong>ML decisions</strong> → <strong>closed-loop automation</strong> — Magenta won’t put that on a single-DC, non-core system.
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
    Same Polaris + Titan data plane, plus an ops cluster for <strong>ML / alerting / UI</strong> via CCS — <strong>touchless automated failover</strong> when Magenta runs ML decisions and <strong>closed-loop automation</strong>.
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

<div class="callout"><strong>Talk track:</strong> Transactions today; next <strong>full T-Mobile data</strong>, <strong>ML-based decisions</strong>, and <strong>closed-loop automation</strong>. Magenta won’t call Elastic <strong>Tier-1</strong> while it’s one DC · no HA. These two warm paths cost about the same; Option 2 keeps <strong>ML and closed loop</strong> on Cluster 3 with <strong>touchless failover</strong> — DR sized for automation that can’t go dark.</div>

<div class="slide-foot"><span>T-Mobile · Polaris &amp; Titan</span><span>Transactions now · ML + closed loop next</span></div>

---

<span class="kicker">T-MOBILE · TODAY + NEXT</span>

# Useful now · powerful next

<p class="subhead">Transaction data already delivers ops value. Tier-1 warm HA protects that today — and the Magenta use cases that follow.</p>

<p class="section-label now">USEFUL TODAY · TRANSACTION DATA</p>
<div class="uc-grid">
  <div class="uc now"><b>Real-time ops dashboards</b>Live transaction health for operations scenarios — NOC and ops see what’s failing now, not in a batch report</div>
  <div class="uc now"><b>Search &amp; investigate</b>ES|QL / Discover on the same stream — drill from a dashboard spike to the offending transaction in seconds</div>
  <div class="uc now"><b>Alerting on what you have</b>Threshold and anomaly alerts on indexed transactions — early signal before full Magenta data lands</div>
</div>

<p class="section-label next">NEXT · FULL T-MOBILE DATA + ML + CLOSED LOOP</p>
<div class="uc-grid">
  <div class="uc"><b>Closed-loop fault act</b>RAN / core / transport → ML correlate → auto remediate</div>
  <div class="uc"><b>Activation &amp; eSIM SLA</b>Provisioning, SM-DP+, region hotspots — protect launch weekends</div>
  <div class="uc"><b>Capacity &amp; surge forecast</b>ML predicts traffic and care load ahead of the spike</div>
  <div class="uc"><b>Cross-domain RCA</b>Digital · core · RAN · care in one query — minutes not hours</div>
  <div class="uc"><b>Care + NOC + exec one view</b>Triage, churn-risk, revenue — same indexed stream</div>
  <div class="uc"><b>SIM-swap &amp; fraud SIEM</b>Security detections and cases on the same lake as ops</div>
</div>

<div class="callout"><strong>Talk track:</strong> Don’t wait for full Magenta data to get value — <strong>real-time dashboards and ops investigation</strong> work on transactions today. Build Tier-1 warm HA now so those ops views — and tomorrow’s closed loop — don’t go dark on a Polaris outage.</div>

<div class="slide-foot"><span>T-Mobile · today + next</span><span>Ops dashboards now · closed loop next</span></div>

---

<span class="kicker">T-MOBILE · CLOSE</span>

# What Magenta is buying

<p class="subhead">From <strong>transaction data</strong> to <strong>full T-Mobile data</strong>, <strong>ML-based decisions</strong>, and <strong>closed-loop automation</strong> — Tier-1 warm HA Magenta can trust as a core system.</p>

<div class="pillar-grid">
  <div class="pillar"><b>Useful today</b>Real-time ops dashboards · search · alerts on transactions</div>
  <div class="pillar"><b>Option 1 or 2 · same band</b>Two DCs, or three + CCS so ops/ML stay up</div>
  <div class="pillar"><b>Powerful next</b>Full Magenta data → ML → closed-loop automation</div>
  <div class="pillar"><b>Cost-capped warmth</b>1d hot + frozen — not a Polaris hot mirror</div>
</div>

<div class="callout"><strong>Close:</strong> Magenta already gets value from <strong>real-time ops dashboards</strong> on transaction data — but Elastic is still <strong>one DC · not Tier-1</strong>. Warm dual-feed (two clusters or three with CCS at <strong>roughly the same cost</strong>) protects today’s ops views and makes Elastic Tier-1 before <strong>full T-Mobile data</strong>, <strong>ML decisions</strong>, and <strong>closed-loop automation</strong> go live. Option 2 keeps that loop <strong>touchless</strong> on Cluster 3.</div>

<div class="slide-foot"><span>Elastic × T-Mobile · Site DR</span><span>Ops value today · Tier-1 for what’s next</span></div>
