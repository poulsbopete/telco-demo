---
marp: true
theme: default
paginate: true
size: 16:9
title: T-Mobile · Site Disaster Recovery — Business Value
description: Executive Site DR outcomes for T-Mobile — warm failover, trust, and cost-aware continuity
style: |
  section {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    background: #050816;
    color: #f5f5f7;
    padding: 36px 48px 28px;
    font-size: 22px;
  }
  section.lead { text-align: center; justify-content: center; }
  section.lead h1 { font-size: 2.1em; font-weight: 700; letter-spacing: -0.03em; margin: 0; color: #fff; }
  section.lead h2 { color: #00bfb3; font-size: 0.92em; font-weight: 600; margin: 0.5em 0 0; }
  section.lead p { color: #9a9aa0; font-size: 0.95em; margin-top: 1em; max-width: 36rem; margin-left: auto; margin-right: auto; }
  h1 { font-size: 1.35em; font-weight: 700; margin: 0 0 0.35em; letter-spacing: -0.02em; color: #fff; line-height: 1.25; }
  p { color: #9a9aa0; }
  strong { color: #fff; }
  ul { margin: 0.25em 0; line-height: 1.42; font-size: 0.8em; color: #9a9aa0; }
  li { margin: 0.12em 0; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; margin-top: 0.35em; }
  .stat-row { display: flex; gap: 12px; margin-top: 0.45em; }
  .stat { flex: 1; background: rgba(255,255,255,.04); border: 1px solid #2a2a2e; border-radius: 14px; padding: 12px 14px; text-align: center; }
  .stat b { display: block; font-size: 1.15em; color: #00bfb3; margin-bottom: 0.25em; }
  .stat span { font-size: 0.62em; color: #9a9aa0; line-height: 1.35; display: block; }
  .callout { background: #0071e3; color: #fff; border-radius: 14px; padding: 12px 16px; font-size: 0.76em; margin-top: 0.55em; }
  .callout strong { color: #fff; }
  .pillar { background: rgba(255,255,255,.04); border: 1px solid #2a2a2e; border-radius: 12px; padding: 12px 14px; font-size: 0.72em; color: #9a9aa0; }
  .pillar b { display: block; color: #00bfb3; font-size: 1.05em; margin-bottom: 0.2em; }
  .pillar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 0.4em; }
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
  .bridge-box { border: 1px solid #00bfb3; background: rgba(0,191,179,.06); border-radius: 10px; padding: 14px 16px; font-size: 0.72em; }
  .bridge-box h3 { color: #fff; font-size: 1.05em; margin: 0 0 0.35em; }
  .bridge-box p { color: #9a9aa0; margin: 0; line-height: 1.4; }
---

<!-- _class: lead -->

<span class="kicker">T-MOBILE · SITE DR</span>

# Failover is a Magenta decision

## Not a weekend restore project

<p>When a site fails during launch or a plan migration surge, the question is not “can we rebuild?” — it is “can we keep Un-carrier promises visible, prove what happened, and keep serving?”</p>

---

<span class="kicker">T-MOBILE · STAKES</span>

# What a site outage really costs

<p class="subhead">RPO/RTO matter to architects. Leadership cares about <strong>trust, Magenta growth, and evidence</strong>.</p>

<div class="stat-row">
  <div class="stat"><b>Un-carrier trust</b><span>Activation and care fail in public on launch weekend</span></div>
  <div class="stat"><b>Gross-add at risk</b><span>Churn and plan-migration decisions freeze without live signal</span></div>
  <div class="stat"><b>Board / audit proof</b><span>Deliberate failover — not hope — when asked “what if?”</span></div>
  <div class="stat"><b>Blind Magenta ops</b><span>Lost telemetry = no root cause across terrestrial + T-Satellite</span></div>
</div>

<div class="callout"><strong>Bottom line:</strong> A cold DR that takes hours to become useful is an outage with extra steps — during the moments T-Mobile is most visible.</div>

<div class="slide-foot"><span>T-Mobile · Site DR</span><span>Protect the relationship at the highest-stakes moment</span></div>

---

<span class="kicker">T-MOBILE · OUTCOMES</span>

# What leadership is buying

<p class="subhead">Four outcomes — architecture exists to deliver these, not the other way around.</p>

<div class="pillar-grid">
  <div class="pillar"><b>Cutover in minutes</b>Warm secondary already indexing — failover is routing, not rebuild</div>
  <div class="pillar"><b>Complete after failover</b>Same logical view so NOC and exec dashboards stay truthful</div>
  <div class="pillar"><b>Corruption undo</b>Shared snapshots — the only reliable reverse when a bad change hit both sides</div>
  <div class="pillar"><b>Cost-aware warmth</b>Full lookback without full hot-tier spend — e.g. 1 day hot, rest frozen</div>
</div>

<div class="callout"><strong>Talk track:</strong> “We are not asking for a museum DR. We are asking for a standby that already works — and a proven undo button.”</div>

<div class="slide-foot"><span>T-Mobile · Site DR</span><span>Warm · deliberate · recoverable · affordable</span></div>

---

<span class="kicker">T-MOBILE · CLOSE</span>

# One decision for the executive

<p class="subhead">Align on how long Magenta can afford to be blind — then fund the <strong>must-haves</strong> under every path.</p>

<div class="cols">
  <div>
    <ul>
      <li><strong>Business ask:</strong> Survive a site loss without losing the launch or migration narrative</li>
      <li><strong>Operating ask:</strong> Failover is a controlled change, not an all-hands scramble</li>
      <li><strong>Non-negotiable:</strong> Shared snapshot repository — missing today</li>
      <li><strong>Cost lever:</strong> Warm DR data without mirroring every hot tier</li>
    </ul>
  </div>
  <div>
    <div class="bridge-box">
      <h3>Close the room</h3>
      <p><strong>Agree in business language:</strong> “seconds of loss vs hours of blind ops.”</p>
      <p style="margin-top:0.55em"><strong>Then:</strong> choose dual ingest (± ops cluster) or CCR based on that promise — snapshots under every path.</p>
    </div>
  </div>
</div>

<div class="slide-foot"><span>Elastic × T-Mobile · Site DR</span><span>Outcomes first · architecture second</span></div>
