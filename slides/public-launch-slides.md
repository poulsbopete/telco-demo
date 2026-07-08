---
marp: true
theme: default
paginate: true
size: 16:9
title: Elastic Observability — iPhone 18 Launch
description: Telco launch observability — iPhone 18 launch demo
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
  section.lead p { color: #9a9aa0; font-size: 0.95em; margin-top: 1em; }
  h1 { font-size: 1.35em; font-weight: 700; margin: 0 0 0.35em; letter-spacing: -0.02em; color: #fff; line-height: 1.25; }
  h2 { color: #fff; font-size: 1.35em; line-height: 1.25; font-weight: 700; margin: 0 0 0.35em; letter-spacing: -0.02em; }
  p { color: #9a9aa0; }
  strong { color: #fff; }
  ul { margin: 0.25em 0; line-height: 1.42; font-size: 0.8em; color: #9a9aa0; }
  li { margin: 0.12em 0; }
  table { width: 100%; border-collapse: collapse; font-size: 0.68em; margin-top: 0.4em; }
  th { text-align: left; padding: 8px 10px; background: rgba(255,255,255,.06); color: #fff; border-bottom: 1px solid #2a2a2e; }
  td { padding: 8px 10px; border-bottom: 1px solid #2a2a2e; color: #9a9aa0; vertical-align: top; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: center; margin-top: 0.35em; }
  .stat-row { display: flex; gap: 12px; margin-top: 0.45em; }
  .stat { flex: 1; background: rgba(255,255,255,.04); border: 1px solid #2a2a2e; border-radius: 14px; padding: 12px 14px; text-align: center; }
  .stat b { display: block; font-size: 1.45em; color: #00bfb3; }
  .stat span { font-size: 0.62em; color: #9a9aa0; }
  .callout { background: #0071e3; color: #fff; border-radius: 14px; padding: 12px 16px; font-size: 0.76em; margin-top: 0.45em; }
  .callout strong { color: #fff; }
  .muted { color: #6e6e73; font-size: 0.7em; }
  .pillar { background: rgba(255,255,255,.04); border: 1px solid #2a2a2e; border-radius: 12px; padding: 9px 11px; font-size: 0.7em; color: #9a9aa0; }
  .pillar b { display: block; color: #00bfb3; font-size: 1.05em; margin-bottom: 0.15em; }
  .pillar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 0.4em; }
  svg text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .kicker {
    display: inline-block;
    background: #00bfb3;
    color: #050816;
    font-size: 0.52em;
    font-weight: 700;
    letter-spacing: 0.06em;
    padding: 4px 10px;
    margin-bottom: 0.5em;
  }
  .subhead { color: #9a9aa0; font-size: 0.72em; line-height: 1.45; margin: 0.4em 0 0.8em; max-width: 92%; }
  .subhead strong { color: #fff; }
  .shift-list { margin-top: 0.35em; }
  .shift-item {
    display: grid;
    grid-template-columns: 52px 1fr;
    gap: 14px;
    align-items: start;
    margin-bottom: 0.55em;
    font-size: 0.68em;
    line-height: 1.4;
  }
  .shift-num {
    width: 52px; height: 52px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.35em; font-weight: 700; color: #fff;
  }
  .shift-num.n1 { background: #e8478b; }
  .shift-num.n2 { background: #fec514; color: #1d1d1f; }
  .shift-num.n3 { background: #0071e3; }
  .shift-num.n4 { background: #00bfb3; color: #050816; }
  .shift-item b { display: block; color: #fff; font-size: 1.05em; margin-bottom: 0.2em; }
  .shift-item span { color: #9a9aa0; }
  .slide-foot {
    position: absolute; bottom: 22px; left: 48px; right: 48px;
    border-top: 2px solid #00bfb3;
    padding-top: 8px;
    font-size: 0.52em;
    color: #9a9aa0;
    display: flex; justify-content: space-between;
  }
  .ecosystem-panel { font-size: 0.72em; line-height: 1.45; }
  .ecosystem-panel b { color: #fff; }
  .ecosystem-panel li { color: #9a9aa0; }
  .ecosystem-img {
    background: #fff;
    border-radius: 10px;
    padding: 10px;
    line-height: 0;
  }
  .ecosystem-img img { width: 100%; height: auto; display: block; }
  .walk-steps { margin-top: 0.35em; font-size: 0.68em; }
  .walk-step {
    display: grid;
    grid-template-columns: 28px 120px 1fr;
    gap: 8px;
    align-items: start;
    padding: 6px 0;
    border-bottom: 1px solid #2a2a2e;
  }
  .walk-step:last-child { border-bottom: none; }
  .walk-step .num {
    width: 24px; height: 24px; border-radius: 6px;
    background: #0071e3; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.8em; font-weight: 700;
  }
  .walk-step b { color: #fff; }
  .walk-step span { color: #9a9aa0; display: block; margin-top: 0.1em; }
  .analyst-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 1.1em; max-width: 92%; margin-left: auto; margin-right: auto; }
  .analyst-badge { background: rgba(255,255,255,.04); border: 1px solid #2a2a2e; border-radius: 12px; padding: 10px 12px; font-size: 0.58em; line-height: 1.35; text-align: left; }
  .analyst-badge b { display: block; color: #00bfb3; font-size: 1.05em; margin-bottom: 0.2em; }
  .analyst-badge span { color: #9a9aa0; }
  .bridge-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 0.68em; margin-top: 0.4em; }
  .bridge-box { border: 1px solid #2a2a2e; border-radius: 10px; padding: 10px 12px; }
  .bridge-box h3 { color: #fff; font-size: 0.95em; margin: 0 0 0.3em; }
  .bridge-box p { color: #9a9aa0; margin: 0; line-height: 1.4; font-size: 0.95em; }
  .bridge-box.risk { border-color: #bf4800; background: rgba(191,72,0,.08); }
  .bridge-box.win { border-color: #00bfb3; background: rgba(0,191,179,.06); }
  .board-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.62em; margin-top: 0.4em; }
  .board-item { background: rgba(255,255,255,.04); border: 1px solid #2a2a2e; border-radius: 8px; padding: 8px 10px; }
  .board-item b { color: #00bfb3; display: block; margin-bottom: 0.15em; }
  .ingest-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 0.62em; margin-top: 0.45em; }
  .ingest-card { background: rgba(255,255,255,.04); border: 1px solid #2a2a2e; border-radius: 10px; padding: 9px 10px; line-height: 1.38; }
  .ingest-card b { color: #fff; display: block; font-size: 1.02em; margin-bottom: 0.2em; }
  .ingest-card span { color: #9a9aa0; }
  .ingest-card.accent { border-color: #00bfb3; background: rgba(0,191,179,.06); }
  .signal-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 0.5em; font-size: 0.6em; }
  .signal-pill { border-radius: 10px; padding: 8px 9px; border: 1px solid #2a2a2e; background: rgba(255,255,255,.03); }
  .signal-pill b { display: block; color: #00bfb3; margin-bottom: 0.15em; }
  .signal-pill span { color: #9a9aa0; line-height: 1.35; display: block; }
  .gap-compare { display: grid; grid-template-columns: 1fr 32px 1fr 1fr; gap: 8px; align-items: center; margin-top: 0.4em; font-size: 0.65em; }
  .gap-box { border-radius: 12px; padding: 12px 10px; text-align: center; }
  .gap-box.before { background: rgba(191,72,0,.12); border: 1px solid #bf4800; }
  .gap-box.after { background: rgba(0,191,179,.08); border: 1px solid #00bfb3; }
  .gap-box.funnel { background: rgba(0,113,227,.08); border: 1px solid #0071e3; }
  .gap-box b { display: block; font-size: 1.6em; margin: 0.1em 0; }
  .gap-box.before b { color: #bf4800; }
  .gap-box.after b { color: #00bfb3; }
  .gap-box.funnel b { color: #0071e3; }
  .gap-box span { color: #9a9aa0; font-size: 0.85em; line-height: 1.3; display: block; }
  code { background: rgba(255,255,255,.08); color: #00bfb3; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
---

<!-- _class: lead -->

# When the launch picture doesn't connect
## iPhone 18 Launch · Observability for US telecom

**Launch weekend spans eSIM, core, RAN, and care — most teams still correlate those signals by hand.**

telco-demo-sage.vercel.app · live demo ~12 min

---

<span class="kicker">THE LAUNCH SHIFT</span>

# iPhone 18 launch is a software event.
## The visibility model many teams inherited wasn't built for it.

<p class="subhead">When activation degrades — how long until NOC knows <em>where in the stack</em> it started? For most teams, still hours. Launch weekend spans eSIM, core, RAN, and care — yet signals often live in separate tools and teams.</p>

<div class="shift-list">
  <div class="shift-item">
    <div class="shift-num n1">01</div>
    <div><b>Digital workflows — not a RAN attach</b><span>eSIM OTA · SM-DP+ · provisioning queues · billing triggers. 124K profiles/min at the edge.</span></div>
  </div>
  <div class="shift-item">
    <div class="shift-num n2">02</div>
    <div><b>One launch · many regions</b><span>Midnight PT wave · NYC pickup · national CDN — failures that don't surface in a single core view.</span></div>
  </div>
  <div class="shift-item">
    <div class="shift-num n3">03</div>
    <div><b>Rich telemetry · limited correlation</b><span>4,200 raw alerts on iPhone 18 weekend. ML helps surface the 12 that truly threaten SLA.</span></div>
  </div>
</div>

<div class="slide-foot"><span>elastic.co | Elastic Observability</span><span>iPhone 18 · Sept 2026</span></div>

---

<span class="kicker">IPHONE 18 AT STAKE</span>

# You already sold the upgrade.
## Launch weekend decides whether you keep them.

<div class="stat-row">
  <div class="stat"><b>847K</b><span>activations · 6 hours</span></div>
  <div class="stat"><b>$142M</b><span>gross-add · 24h</span></div>
  <div class="stat"><b>340%</b><span>provisioning spike</span></div>
  <div class="stat"><b>84K</b><span>churn-risk if SLA slips</span></div>
</div>

<p class="subhead" style="margin-top:0.6em">97% of execs report observability roadblocks despite continued investment. Teams are spending — <strong>the opportunity is connecting signals across the stack.</strong></p>

<p class="callout"><strong>Anchor line:</strong> You already sold the upgrade — launch weekend decides if they stay your subscriber.</p>

---

<span class="kicker">2026 TELCO REALITY</span>

# Connectivity is commoditizing.
## Launch execution is where customer trust is earned.

<p class="subhead">Tri-carrier D2D JV vs <strong>Starlink Mobile (9M+ subs)</strong> · flat ARPU · ~35% EBITDA · OpEx reset · post-merger integration pressure.</p>

<div class="bridge-cols">
  <div class="bridge-box risk">
    <h3>Boardroom pressure</h3>
    <p>Vendor consolidation · federated visibility without rip-and-replace · CISA 72hr · FCC retention — boards prioritize what cuts cost or prevents penalties.</p>
  </div>
  <div class="bridge-box win">
    <h3>Where carriers win · iPhone 18</h3>
    <p>Activation · port · trade-in · pickup in 48 hours. Same pattern as 8M plan migrations — if provisioning slips, churn follows.</p>
  </div>
</div>

<div class="board-grid">
  <div class="board-item"><b>EBITDA &amp; OpEx</b>Wall Street judges ~35% margins — CFO language is consolidation</div>
  <div class="board-item"><b>M&amp;A visibility</b>Cross-cluster search across acquired stacks — no multi-year migration first</div>
  <div class="board-item"><b>Techco pivot</b>Private 5G · edge · AI transport — co-innovation partner on enterprise outcomes</div>
  <div class="board-item"><b>Regulatory clock</b>ES|QL for disclosure · Searchable Snapshots for 4-year retention</div>
</div>

<div class="slide-foot"><span>elastic.co | Elastic Observability</span><span>2026 Telco Landscape</span></div>

---

# Why Elastic?

**Unify · Open · Predict · Act — on the OTel you already run. No rip-and-replace before Sept 2026.**

<div class="pillar-grid">
  <div class="pillar"><b>Unify</b>Logs, metrics, traces &amp; security — RAN, core, provisioning &amp; care</div>
  <div class="pillar"><b>Open</b>Native OTel · terrestrial + D2D · meet you where you are</div>
  <div class="pillar"><b>Predict</b>ML lifecycle forecast · see the surge before static alerts</div>
  <div class="pillar"><b>Act</b>Workflows · 4,200 alerts → 12 actionable · RCA in seconds</div>
</div>

<p class="subhead" style="margin-top:0.5em"><strong>Boardroom:</strong> one indexed stream for NOC triage, exec churn-risk, and Security SIM-swap — vendor consolidation on a Search AI Lake built for millisecond decisions, not warehouse latency.</p>

---

<span class="kicker">DATA INGESTION</span>

# Everything flows in. Nothing waits on a schema.
## Schemaless ingest — index first, shape later with ES\|QL.

<p class="subhead">Elastic accepts <strong>any structure at ingest</strong> — no warehouse preload, no rigid star schema. Fields emerge from OTel, agents, APIs, and syslog; you query across logs, metrics, traces, and business signals in one tier.</p>

<div class="signal-row">
  <div class="signal-pill"><b>Logs</b><span>App &amp; core · RAN/syslog · care transcripts · audit trails</span></div>
  <div class="signal-pill"><b>Metrics</b><span>Infra (CPU, latency) · <strong>log-derived</strong> · custom app counters</span></div>
  <div class="signal-pill"><b>Traces</b><span>OTel spans · service maps · cross-tier correlation</span></div>
  <div class="signal-pill"><b>Business signals</b><span>Activations · churn-risk · revenue KPIs · SLA timers</span></div>
</div>

<div class="ingest-grid">
  <div class="ingest-card accent"><b>OpenTelemetry</b><span>SDKs &amp; collectors — apps, 5G core, SM-DP+, CDN edge (this demo)</span></div>
  <div class="ingest-card"><b>Elastic Agent &amp; Beats</b><span>Hosts · containers · network taps · unified shipper</span></div>
  <div class="ingest-card"><b>Kafka &amp; event bus</b><span>Streaming pipelines · replay · fan-out to analytics</span></div>
  <div class="ingest-card"><b>Cloud-native</b><span>AWS/GCP/Azure metrics &amp; audit · CloudWatch · Pub/Sub</span></div>
  <div class="ingest-card"><b>Syslog &amp; SNMP</b><span>RAN/backhaul · Adaptive Networks fault inject (this demo)</span></div>
  <div class="ingest-card"><b>APIs &amp; bulk</b><span>REST bulk · S3/blob replay · custom ETL · security feeds</span></div>
</div>

<p class="callout" style="margin-top:0.55em"><strong>Schemaless advantage:</strong> launch-weekend spikes bring new fields — provisioning errors, region tags, trace IDs — without a schema migration. <strong>ES\|QL</strong> and runtime fields connect RAN, core, and care in one query.</p>

<div class="slide-foot"><span>elastic.co | Elastic Observability</span><span>Data Ingestion · Schemaless</span></div>

---

# Fragmented → connected

**Long MTTR often traces back to fragmented telemetry.** Telefónica Germany: 80% RCA reduction when signals connect.

<div class="gap-compare">
  <div class="gap-box before">
    <span>DISCONNECTED VIEW</span>
    <b>20 min</b>
    <span>Manual correlation · RAN · core · care</span>
  </div>
  <div style="text-align:center;color:#00bfb3;font-weight:700">→</div>
  <div class="gap-box after">
    <span>ELASTIC O11Y</span>
    <b>&lt;1 min</b>
    <span>Root causes ranked · connected OTel</span>
  </div>
  <div class="gap-box funnel">
    <span>LAUNCH WEEKEND</span>
    <b>12</b>
    <span>Actionable from 4,200 raw alerts</span>
  </div>
</div>

<p class="subhead" style="margin-top:0.5em">Three hidden costs of sprawl: <strong>MTTR penalty</strong> (rotating consoles) · <strong>data drop</strong> (shedding logs under cost pressure) · <strong>persona silos</strong> (SRE vs RAN at peak). NOC · Care · Network ops · Executives — same launch event, different outcomes. Live demo ties OTel to <strong>$142M revenue</strong> and <strong>84K churn-risk</strong>.</p>

---

# Live demo · ~12 minutes

**Open** [telco-demo-sage.vercel.app](https://telco-demo-sage.vercel.app) → **Telemetry** tab

<div class="walk-steps">
  <div class="walk-step"><div class="num">1</div><div><b>Launch strip</b></div><div><span>847K activations · 340% spike · $142M gross-add</span></div></div>
  <div class="walk-step"><div class="num">2</div><div><b>Live OTel</b></div><div><span>Real Serverless data · same agents you run today</span></div></div>
  <div class="walk-step"><div class="num">3</div><div><b>ML lifecycle</b></div><div><span>Surge vs forecast · see the wave ~2h early</span></div></div>
  <div class="walk-step"><div class="num">4</div><div><b>Region hotspots</b></div><div><span>NYC retail · CDN edge · West fiber</span></div></div>
  <div class="walk-step"><div class="num">5</div><div><b>Business KPIs</b></div><div><span>84K churn-risk · care load · revenue next 4h</span></div></div>
  <div class="walk-step"><div class="num">6</div><div><b>Networks</b></div><div><span>Fault inject → ML correlate → workflow</span></div></div>
  <div class="walk-step"><div class="num">7</div><div><b>Security · optional</b></div><div><span>Launch SIM swap · 30 sec</span></div></div>
</div>

<p class="muted"><a href="/presenter/view.html?doc=demo-walk">Full script</a> · <a href="/presenter/view.html?doc=landscape">Landscape reference</a> · <a href="/presenter/">All guides</a></p>

---

<span class="kicker">WHAT'S NEXT</span>

# From connected telemetry to agentic intelligence
## Launch weekend needs data clarity — not more dashboards.

<p class="subhead">Telemetry volume is outpacing human resolution capacity. The next step: systems that <strong>reason across your stack</strong> — with guardrails — surfacing intent, not just symptoms. Metric surges can be security signals too: unify SRE and SOC context before DDoS is misread as congestion.</p>

<div class="shift-list">
  <div class="shift-item">
    <div class="shift-num n1">01</div>
    <div><b>Unified telemetry</b><span>Logs, metrics, traces in one tier — AI handles structure so teams stop building manual pipelines.</span></div>
  </div>
  <div class="shift-item">
    <div class="shift-num n2">02</div>
    <div><b>AI detections</b><span>Anomalies and dependencies mapped before subscribers feel it — the unknown unknowns behind launch spikes.</span></div>
  </div>
  <div class="shift-item">
    <div class="shift-num n3">03</div>
    <div><b>AI investigation</b><span>Root cause in plain language across RAN, core, and care — not another dashboard rotation.</span></div>
  </div>
  <div class="shift-item">
    <div class="shift-num n4">04</div>
    <div><b>Faster resolution</b><span>Agents recommend and execute fixes with deterministic guardrails — from 12 actionable alerts to remediated launch paths.</span></div>
  </div>
</div>

<div class="slide-foot"><span>elastic.co | Elastic Observability</span><span>Agentic Observability · iPhone 18</span></div>

---

<!-- _class: lead -->

# Your Elastic era starts now

## iPhone 18 launch · Sept 2026

**Commoditization is the long game · launch execution is where you earn trust today**

**Unify · Open · Predict · Act · Agentic**

<div class="analyst-row">
  <div class="analyst-badge"><b>Gartner® Magic Quadrant™</b><span><strong>Leader</strong> — Observability Platforms (2025)</span></div>
  <div class="analyst-badge"><b>Gartner® Magic Quadrant™</b><span><strong>Visionary</strong> — Security Information &amp; Event Management (2025)</span></div>
  <div class="analyst-badge"><b>Forrester Wave™</b><span><strong>Leader</strong> — Security Analytics Platforms, Q2 2025</span></div>
  <div class="analyst-badge"><b>IDC MarketScape</b><span><strong>Leader</strong> — Worldwide XDR Software (2025)</span></div>
</div>

Engineering the future of telecom resilience — together

telco-demo-sage.vercel.app → **Telemetry**
