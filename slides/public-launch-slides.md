---
marp: true
theme: default
paginate: true
size: 16:9
title: Elastic Observability — iPhone 18 Launch
description: Why Elastic for telco launch observability — unified, open, intelligent, launch-scale — iPhone 18 proof point
style: |
  section {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    background: #fbfbfd;
    color: #1d1d1f;
    padding: 40px 52px;
    font-size: 22px;
  }
  section.lead { text-align: center; justify-content: center; }
  section.lead h1 { font-size: 2.2em; font-weight: 700; letter-spacing: -0.03em; margin: 0; }
  section.lead p { color: #86868b; font-size: 0.95em; margin-top: 1em; }
  h1 { font-size: 1.55em; font-weight: 700; margin: 0 0 0.35em; letter-spacing: -0.02em; }
  h2 { color: #0071e3; font-size: 0.95em; font-weight: 600; margin: 0 0 0.5em; }
  ul { margin: 0.3em 0; line-height: 1.45; font-size: 0.82em; }
  li { margin: 0.15em 0; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: center; margin-top: 0.4em; }
  .stat-row { display: flex; gap: 14px; margin-top: 0.5em; }
  .stat { flex: 1; background: #fff; border: 1px solid #d2d2d7; border-radius: 14px; padding: 14px 16px; text-align: center; }
  .stat b { display: block; font-size: 1.5em; color: #0071e3; }
  .stat span { font-size: 0.65em; color: #86868b; }
  .callout { background: #0071e3; color: #fff; border-radius: 14px; padding: 14px 18px; font-size: 0.78em; margin-top: 0.5em; }
  .callout-green { background: #008009; color: #fff; border-radius: 14px; padding: 14px 18px; font-size: 0.78em; margin-top: 0.5em; }
  .muted { color: #86868b; font-size: 0.72em; }
  .pillar { background: #fff; border: 1px solid #d2d2d7; border-radius: 12px; padding: 10px 12px; font-size: 0.72em; }
  .pillar b { display: block; color: #0071e3; font-size: 1.05em; margin-bottom: 0.2em; }
  .pillar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 0.5em; }
  svg text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
---

<!-- _class: lead -->

# iPhone 18 launch is coming
## Why Elastic? · Sept 2026 · one weekend decides the quarter

**$142M gross-add revenue · 847K activations in 6 hours · 84K subs at churn risk if you miss SLA**

telco-demo-sage.vercel.app → **Telemetry**

---

# Why Elastic?

**One platform to see the whole launch — telemetry, ML, and business impact — without ripping out what you run today.**

<div class="pillar-grid">
  <div class="pillar"><b>Unify</b>Logs, metrics, traces &amp; security in one view — RAN, core, provisioning &amp; care together</div>
  <div class="pillar"><b>Open</b>OTel-native · same agents &amp; collectors · meet you where you are today</div>
  <div class="pillar"><b>Predict</b>ML lifecycle forecast &amp; ES\|QL — see the iPhone 18 surge before static alerts fire</div>
  <div class="pillar"><b>Act</b>Workflows &amp; Serverless scale — correlated RCA in minutes, not a 6-hour bridge call</div>
</div>

<svg viewBox="0 0 620 95" width="100%" style="margin-top:10px">
  <rect x="0" y="8" width="130" height="78" rx="10" fill="#f5f5f7" stroke="#d2d2d7"/>
  <text x="65" y="30" text-anchor="middle" fill="#86868b" font-size="9" font-weight="600">Tool sprawl today</text>
  <text x="65" y="48" text-anchor="middle" fill="#1d1d1f" font-size="8">Separate RAN · Core · Care</text>
  <text x="65" y="62" text-anchor="middle" fill="#1d1d1f" font-size="8">Static thresholds · slow RCA</text>
  <text x="65" y="76" text-anchor="middle" fill="#bf4800" font-size="8">Can't see iPhone 18 as one event</text>
  <path d="M140 47 H168" stroke="#0071e3" stroke-width="2.5" marker-end="url(#why)"/>
  <text x="154" y="40" text-anchor="middle" fill="#0071e3" font-size="8" font-weight="700">Why</text>
  <text x="154" y="58" text-anchor="middle" fill="#0071e3" font-size="8" font-weight="700">Elastic</text>
  <rect x="178" y="8" width="264" height="78" rx="10" fill="#0071e3" fill-opacity="0.08" stroke="#0071e3" stroke-width="2"/>
  <text x="310" y="28" text-anchor="middle" fill="#1d1d1f" font-size="10" font-weight="700">Elastic Observability</text>
  <text x="310" y="44" text-anchor="middle" fill="#86868b" font-size="8">Unify · Open · Predict · Act</text>
  <text x="220" y="62" text-anchor="middle" fill="#1d1d1f" font-size="8">OTel ingest</text>
  <text x="310" y="62" text-anchor="middle" fill="#1d1d1f" font-size="8">ML + ES|QL</text>
  <text x="400" y="62" text-anchor="middle" fill="#1d1d1f" font-size="8">Workflows</text>
  <text x="310" y="78" text-anchor="middle" fill="#0071e3" font-size="8" font-weight="600">One launch picture</text>
  <path d="M450 47 H478" stroke="#008009" stroke-width="2.5" marker-end="url(#out)"/>
  <rect x="488" y="8" width="130" height="78" rx="10" fill="#008009" fill-opacity="0.08" stroke="#008009"/>
  <text x="553" y="30" text-anchor="middle" fill="#008009" font-size="9" font-weight="600">Business outcomes</text>
  <text x="553" y="48" text-anchor="middle" fill="#1d1d1f" font-size="8">Less NOC toil</text>
  <text x="553" y="62" text-anchor="middle" fill="#1d1d1f" font-size="8">Higher CSAT · lower churn</text>
  <text x="553" y="76" text-anchor="middle" fill="#1d1d1f" font-size="8">$142M revenue protected</text>
  <defs>
    <marker id="why" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#0071e3"/></marker>
    <marker id="out" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#008009"/></marker>
  </defs>
</svg>

<p class="callout"><strong>Why Elastic vs. more point tools?</strong> Launch weekend needs correlation across domains — not another dashboard that only sees one layer.</p>

---

# Elastic across your launch data ecosystem

**Primary &amp; enabling roles — Elastic meets you where you are and scales with iPhone 18 launch complexity.**

<svg viewBox="0 0 720 310" width="100%">
  <!-- Wedge backgrounds: 5 domains, 3 rings each -->
  <!-- Network telemetry · blue -->
  <path d="M 95 268 A 55 55 0 0 1 131 218 L 191 178 A 115 115 0 0 0 95 268 Z" fill="#5b9bd5" fill-opacity="0.35"/>
  <path d="M 131 218 A 115 115 0 0 1 191 178 L 251 138 A 175 175 0 0 0 131 218 Z" fill="#5b9bd5" fill-opacity="0.55"/>
  <path d="M 191 178 A 175 175 0 0 1 251 138 L 270 105 A 175 175 0 0 0 191 178 Z" fill="#5b9bd5"/>
  <!-- Ingest & access · orange -->
  <path d="M 131 218 A 55 55 0 0 1 185 185 L 225 145 A 115 115 0 0 0 131 218 Z" fill="#ed7d31" fill-opacity="0.35"/>
  <path d="M 185 185 A 115 115 0 0 1 225 145 L 265 105 A 175 175 0 0 0 185 185 Z" fill="#ed7d31" fill-opacity="0.55"/>
  <path d="M 225 145 A 175 175 0 0 1 265 105 L 270 105 A 175 175 0 0 0 225 145 Z" fill="#ed7d31"/>
  <!-- Analytics & ML · red -->
  <path d="M 185 185 A 55 55 0 0 1 225 175 L 265 135 A 115 115 0 0 0 185 185 Z" fill="#c0504d" fill-opacity="0.35"/>
  <path d="M 225 175 A 115 115 0 0 1 265 135 L 305 95 A 175 175 0 0 0 225 175 Z" fill="#c0504d" fill-opacity="0.55"/>
  <path d="M 265 135 A 175 175 0 0 1 305 95 L 315 95 A 175 175 0 0 0 265 135 Z" fill="#c0504d"/>
  <!-- Ops & automation · purple -->
  <path d="M 225 175 A 55 55 0 0 1 265 185 L 305 145 A 115 115 0 0 0 225 175 Z" fill="#7030a0" fill-opacity="0.35"/>
  <path d="M 265 185 A 115 115 0 0 1 305 145 L 345 105 A 175 175 0 0 0 265 185 Z" fill="#7030a0" fill-opacity="0.55"/>
  <path d="M 305 145 A 175 175 0 0 1 345 105 L 365 105 A 175 175 0 0 0 305 145 Z" fill="#7030a0"/>
  <!-- Launch insight · navy -->
  <path d="M 265 185 A 55 55 0 0 1 319 218 L 359 178 A 115 115 0 0 0 265 185 Z" fill="#1f4e79" fill-opacity="0.35"/>
  <path d="M 319 218 A 115 115 0 0 1 359 178 L 399 138 A 175 175 0 0 0 319 218 Z" fill="#1f4e79" fill-opacity="0.55"/>
  <path d="M 359 178 A 175 175 0 0 1 399 138 L 445 268 A 175 175 0 0 0 359 178 Z" fill="#1f4e79"/>

  <!-- Inner foundation core -->
  <path d="M 95 268 A 55 55 0 0 1 445 268 L 270 268 Z" fill="#f5f5f7" stroke="#d2d2d7"/>
  <text x="270" y="252" text-anchor="middle" fill="#86868b" font-size="7" font-weight="600">LAUNCH FOUNDATION</text>
  <text x="130" y="262" text-anchor="middle" fill="#1d1d1f" font-size="6">OTel</text>
  <text x="195" y="262" text-anchor="middle" fill="#1d1d1f" font-size="6">Network</text>
  <text x="270" y="262" text-anchor="middle" fill="#1d1d1f" font-size="6">ML</text>
  <text x="345" y="262" text-anchor="middle" fill="#1d1d1f" font-size="6">SLA</text>
  <text x="410" y="262" text-anchor="middle" fill="#1d1d1f" font-size="6">Subscriber</text>

  <!-- Wedge titles (outer arc) -->
  <text x="155" y="118" fill="#fff" font-size="8" font-weight="700" transform="rotate(-55 155 118)">Network telemetry</text>
  <text x="248" y="72" fill="#fff" font-size="8" font-weight="700" transform="rotate(-18 248 72)">Ingest &amp; access</text>
  <text x="295" y="58" fill="#fff" font-size="8" font-weight="700">Analytics &amp; ML</text>
  <text x="340" y="72" fill="#fff" font-size="8" font-weight="700" transform="rotate(18 340 72)">Ops &amp; automation</text>
  <text x="395" y="118" fill="#fff" font-size="8" font-weight="700" transform="rotate(55 395 118)">Launch insight</text>

  <!-- Ring labels · iPhone 18 examples -->
  <text x="168" y="198" fill="#1d1d1f" font-size="6.5">RAN · Core logs</text>
  <text x="168" y="168" fill="#1d1d1f" font-size="6.5">Integrated traces</text>
  <text x="168" y="138" fill="#1d1d1f" font-size="6.5">OTel metrics</text>
  <text x="248" y="168" fill="#1d1d1f" font-size="6.5">NOC · Care access</text>
  <text x="248" y="138" fill="#1d1d1f" font-size="6.5">OTel collectors</text>
  <text x="295" y="138" fill="#1d1d1f" font-size="6.5">Launch forecast</text>
  <text x="295" y="118" fill="#1d1d1f" font-size="6.5">ES|QL · anomalies</text>
  <text x="340" y="168" fill="#1d1d1f" font-size="6.5">Workflows · RCA</text>
  <text x="340" y="138" fill="#1d1d1f" font-size="6.5">Alert routing</text>
  <text x="395" y="168" fill="#1d1d1f" font-size="6.5">Region hotspots</text>
  <text x="395" y="138" fill="#1d1d1f" font-size="6.5">Revenue · CSAT</text>

  <!-- Primary role markers (blue dots) -->
  <circle cx="175" cy="155" r="5" fill="#0071e3"/><circle cx="175" cy="155" r="2.5" fill="#fff"/>
  <circle cx="255" cy="125" r="5" fill="#0071e3"/><circle cx="255" cy="125" r="2.5" fill="#fff"/>
  <circle cx="300" cy="105" r="5" fill="#0071e3"/><circle cx="300" cy="105" r="2.5" fill="#fff"/>
  <circle cx="345" cy="125" r="5" fill="#0071e3"/><circle cx="345" cy="125" r="2.5" fill="#fff"/>
  <circle cx="390" cy="155" r="5" fill="#0071e3"/><circle cx="390" cy="155" r="2.5" fill="#fff"/>
  <!-- Enabling role markers (grey) -->
  <circle cx="210" cy="175" r="5" fill="#b0b0b5" fill-opacity="0.8"/>
  <circle cx="320" cy="175" r="5" fill="#b0b0b5" fill-opacity="0.8"/>
  <circle cx="275" cy="145" r="5" fill="#b0b0b5" fill-opacity="0.8"/>

  <!-- Product icons on foundation row -->
  <rect x="108" y="274" width="3" height="8" fill="#e8478b"/><rect x="112" y="276" width="3" height="6" fill="#0071e3"/>
  <rect x="118" y="275" width="8" height="2" fill="#fec514"/><rect x="118" y="278" width="8" height="2" fill="#fec514"/><rect x="118" y="281" width="8" height="2" fill="#fec514"/>
  <rect x="178" y="274" width="3" height="8" fill="#e8478b"/><rect x="182" y="276" width="3" height="6" fill="#0071e3"/>
  <rect x="188" y="275" width="8" height="2" fill="#fec514"/><rect x="188" y="278" width="8" height="2" fill="#fec514"/>
  <path d="M 258 274 L 262 282 L 266 274 Z" fill="#00bfb3"/>
  <rect x="328" y="274" width="3" height="8" fill="#e8478b"/><rect x="332" y="276" width="3" height="6" fill="#0071e3"/>
  <path d="M 398 274 L 402 282 L 406 274 Z" fill="#00bfb3"/>

  <!-- Legend -->
  <rect x="490" y="20" width="215" height="268" rx="12" fill="#fff" stroke="#d2d2d7"/>
  <text x="598" y="42" text-anchor="middle" fill="#1d1d1f" font-size="10" font-weight="700">Key</text>
  <circle cx="508" cy="62" r="5" fill="#0071e3"/><circle cx="508" cy="62" r="2.5" fill="#fff"/>
  <text x="522" y="65" fill="#1d1d1f" font-size="8">Elastic primary role</text>
  <circle cx="508" cy="82" r="5" fill="#b0b0b5"/>
  <text x="522" y="85" fill="#1d1d1f" font-size="8">Elastic enabling role</text>
  <rect x="504" y="98" width="3" height="8" fill="#e8478b"/><rect x="508" y="100" width="3" height="6" fill="#0071e3"/>
  <text x="522" y="106" fill="#1d1d1f" font-size="8">Elastic Observability</text>
  <rect x="504" y="118" width="10" height="2" fill="#fec514"/><rect x="504" y="121" width="10" height="2" fill="#fec514"/><rect x="504" y="124" width="10" height="2" fill="#fec514"/>
  <text x="522" y="124" fill="#1d1d1f" font-size="8">Elasticsearch</text>
  <path d="M 504 136 L 508 144 L 512 136 Z" fill="#00bfb3"/>
  <text x="522" y="142" fill="#1d1d1f" font-size="8">Elastic Security</text>
  <line x1="500" y1="156" x2="695" y2="156" stroke="#d2d2d7"/>
  <text x="598" y="172" text-anchor="middle" fill="#0071e3" font-size="8" font-weight="700">iPhone 18 launch mapping</text>
  <text x="505" y="188" fill="#1d1d1f" font-size="7.5">• O11Y primary on OTel ingest &amp; ML forecast</text>
  <text x="505" y="202" fill="#1d1d1f" font-size="7.5">• Elasticsearch primary on log search &amp; ES|QL</text>
  <text x="505" y="216" fill="#1d1d1f" font-size="7.5">• Security enabling on launch fraud · SIM swap</text>
  <text x="505" y="230" fill="#1d1d1f" font-size="7.5">• Start with one wedge · expand before Sept 2026</text>
  <text x="505" y="252" fill="#86868b" font-size="7">Meet you where you are — no rip-and-replace</text>
  <text x="505" y="268" fill="#86868b" font-size="7">Scale across the full launch data ecosystem</text>
</svg>

<p class="muted">Adapted from Elastic data-ecosystem model · Observability leads iPhone 18 launch · Security &amp; Search enable as you grow.</p>

---

# Why you should care · iPhone 18

**iPhone 18 is not a normal traffic spike** — it's the year's biggest revenue and reputation event.

<div class="stat-row">
  <div class="stat"><b>2.4M</b><span>iPhone 18 pre-orders in 24h</span></div>
  <div class="stat"><b>124K/min</b><span>eSIM OTA downloads at peak</span></div>
  <div class="stat"><b>18.4K/hr</b><span>care contacts when queues back up</span></div>
</div>

- **Revenue:** iPhone 18 / Pro / Pro Max / Air gross adds hit in **hours**, not weeks
- **Brand:** "Activation stuck" tweets spread faster than your war room forms
- **Ops:** Midnight drop → retail pickup → Sunday taper — **three different failure modes**

<p class="callout"><strong>Bottom line:</strong> If provisioning slips on launch weekend, you don't just miss SLAs — you lose upgrades you already sold.</p>

---

# The iPhone 18 weekend in 72 hours

<div class="cols">

<div>

**Fri 12 AM** — West-coast midnight wave · eSIM + restore CDN  
**Fri 8–11 AM** — Retail pickup · RAN attach on flagship stores  
**Sat–Sun** — Provisioning taper · care backlog · trade-in queues

Each phase breaks a **different layer** (transport, core, RAN, care) — but subscribers only see **"my iPhone 18 won't activate."**

</div>

<div>

<svg viewBox="0 0 320 180" width="100%">
  <text x="8" y="16" fill="#86868b" font-size="10" font-weight="600">iPhone 18 activation curve · launch weekend</text>
  <line x1="24" y1="150" x2="300" y2="150" stroke="#d2d2d7" stroke-width="1"/>
  <line x1="24" y1="30" x2="24" y2="150" stroke="#d2d2d7" stroke-width="1"/>
  <path d="M24 140 C 60 135, 80 120, 100 90 S 140 35, 170 28 S 220 50, 250 100 S 280 130, 300 138" fill="none" stroke="#0071e3" stroke-width="3"/>
  <path d="M24 140 C 60 138, 90 125, 120 95 S 160 45, 190 40 S 230 55, 260 105" fill="none" stroke="#86868b" stroke-width="2" stroke-dasharray="4 3"/>
  <circle cx="170" cy="28" r="5" fill="#bf4800"/>
  <text x="178" y="32" fill="#bf4800" font-size="9" font-weight="600">14.2K/min peak</text>
  <text x="24" y="168" fill="#86868b" font-size="8">Fri 12 AM</text>
  <text x="155" y="168" fill="#86868b" font-size="8">Retail open</text>
  <text x="268" y="168" fill="#86868b" font-size="8">Sun taper</text>
  <text x="230" y="22" fill="#0071e3" font-size="8">ML forecast</text>
  <text x="230" y="32" fill="#86868b" font-size="8">— — static threshold</text>
</svg>

</div>

</div>

<p class="muted">The gap isn't your team — it's that siloed tools can't see iPhone 18 as one launch event. Elastic unifies without starting over.</p>

---

# What iPhone 18 costs without the right observability

<div class="stat-row">
  <div class="stat"><b>↑ Toil</b><span>4,200 raw alerts → war room on a false P1</span></div>
  <div class="stat"><b>↑ Churn</b><span>84K subs at risk if activation SLA slips</span></div>
  <div class="stat"><b>↓ CSAT</b><span>18K care contacts/hr · repeat "still stuck" calls</span></div>
</div>

<svg viewBox="0 0 520 100" width="100%" style="margin-top:12px">
  <rect x="0" y="10" width="150" height="70" rx="10" fill="#fff" stroke="#d2d2d7"/>
  <text x="75" y="32" text-anchor="middle" fill="#1d1d1f" font-size="10" font-weight="600">Siloed dashboards</text>
  <text x="75" y="50" text-anchor="middle" fill="#86868b" font-size="9">RAN · Core · Care</text>
  <text x="75" y="68" text-anchor="middle" fill="#bf4800" font-size="9">Slow MTTR · lost revenue</text>
  <path d="M160 45 H200" stroke="#86868b" marker-end="url(#arr)"/>
  <rect x="210" y="10" width="150" height="70" rx="10" fill="#0071e3" fill-opacity="0.08" stroke="#0071e3"/>
  <text x="285" y="32" text-anchor="middle" fill="#1d1d1f" font-size="10" font-weight="600">Elastic + iPhone 18 context</text>
  <text x="285" y="50" text-anchor="middle" fill="#86868b" font-size="9">OTel · ML · region · ES|QL</text>
  <text x="285" y="68" text-anchor="middle" fill="#008009" font-size="9">Fix before subscribers churn</text>
  <path d="M370 45 H410" stroke="#86868b"/>
  <rect x="420" y="10" width="90" height="70" rx="10" fill="#008009" fill-opacity="0.1" stroke="#008009"/>
  <text x="465" y="42" text-anchor="middle" fill="#008009" font-size="10" font-weight="600">CSAT</text>
  <text x="465" y="58" text-anchor="middle" fill="#008009" font-size="10" font-weight="600">protected</text>
  <defs><marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#86868b"/></marker></defs>
</svg>

---

# We meet you where you are today

**No rip-and-replace before iPhone 18.** Elastic layers launch intelligence on the stack you already run.

<div class="cols">

<div>

- **Same OTel pipelines** — keep your agents, collectors, and instrumentation
- **Siloed tools stay** — RAN, core, care dashboards don't disappear overnight
- **Your timeline** — pilot one hotspot region now, expand before Sept 2026
- **Your maturity** — start with launch-weekend visibility, grow into ML & workflows

</div>

<div>

<svg viewBox="0 0 300 185" width="100%">
  <text x="0" y="14" fill="#86868b" font-size="10" font-weight="600">Today → launch-ready</text>
  <rect x="0" y="28" width="88" height="130" rx="10" fill="#fff" stroke="#d2d2d7"/>
  <text x="44" y="50" text-anchor="middle" fill="#1d1d1f" font-size="9" font-weight="600">Where you are</text>
  <text x="44" y="68" text-anchor="middle" fill="#86868b" font-size="8">Legacy NOC</text>
  <text x="44" y="82" text-anchor="middle" fill="#86868b" font-size="8">Point APM</text>
  <text x="44" y="96" text-anchor="middle" fill="#86868b" font-size="8">Siloed logs</text>
  <text x="44" y="118" text-anchor="middle" fill="#86868b" font-size="8">Static alerts</text>
  <text x="44" y="142" text-anchor="middle" fill="#86868b" font-size="8">OTel in flight</text>
  <path d="M98 93 H112" stroke="#0071e3" stroke-width="2" marker-end="url(#meet)"/>
  <rect x="118" y="48" width="64" height="90" rx="10" fill="#0071e3" fill-opacity="0.1" stroke="#0071e3"/>
  <text x="150" y="72" text-anchor="middle" fill="#0071e3" font-size="8" font-weight="700">Elastic</text>
  <text x="150" y="86" text-anchor="middle" fill="#0071e3" font-size="8" font-weight="700">meets you</text>
  <text x="150" y="104" text-anchor="middle" fill="#86868b" font-size="7">Ingest · unify</text>
  <text x="150" y="116" text-anchor="middle" fill="#86868b" font-size="7">ML · ES|QL</text>
  <text x="150" y="128" text-anchor="middle" fill="#86868b" font-size="7">Workflows</text>
  <path d="M192 93 H206" stroke="#008009" stroke-width="2" marker-end="url(#ready)"/>
  <rect x="212" y="28" width="88" height="130" rx="10" fill="#008009" fill-opacity="0.08" stroke="#008009"/>
  <text x="256" y="50" text-anchor="middle" fill="#1d1d1f" font-size="9" font-weight="600">iPhone 18 ready</text>
  <text x="256" y="72" text-anchor="middle" fill="#86868b" font-size="8">Launch forecast</text>
  <text x="256" y="86" text-anchor="middle" fill="#86868b" font-size="8">Region hotspots</text>
  <text x="256" y="100" text-anchor="middle" fill="#86868b" font-size="8">Correlated RCA</text>
  <text x="256" y="114" text-anchor="middle" fill="#86868b" font-size="8">Care + NOC view</text>
  <text x="256" y="136" text-anchor="middle" fill="#008009" font-size="8" font-weight="600">Sept 2026</text>
  <defs>
    <marker id="meet" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#0071e3"/></marker>
    <marker id="ready" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#008009"/></marker>
  </defs>
</svg>

</div>

</div>

<p class="callout-green"><strong>You don't need a perfect observability stack today.</strong> You need a path to iPhone 18 launch weekend — Elastic meets you there.</p>

---

# iPhone 18 puts Elastic to the test

**Each pillar maps to a real launch failure mode:**

<div class="cols">

<div>

| Pillar | iPhone 18 weekend |
|--------|---------------------|
| **Unify** | eSIM OTA + provisioning queue + retail RAN in one trace |
| **Open** | Same OTel agents — no re-instrumentation before Sept 2026 |
| **Predict** | ML flags 340% provisioning surge **2h early** |
| **Act** | Workflows correlate transport → core → cut 4,200 alerts to 12 |

</div>

<div>

<svg viewBox="0 0 280 200" width="100%">
  <circle cx="140" cy="100" r="48" fill="#0071e3" fill-opacity="0.15" stroke="#0071e3" stroke-width="2"/>
  <text x="140" y="96" text-anchor="middle" fill="#1d1d1f" font-size="10" font-weight="700">Why Elastic</text>
  <text x="140" y="110" text-anchor="middle" fill="#1d1d1f" font-size="9">iPhone 18 launch</text>
  <rect x="10" y="14" width="68" height="32" rx="7" fill="#fff" stroke="#0071e3"/>
  <text x="44" y="34" text-anchor="middle" fill="#0071e3" font-size="8" font-weight="600">Unify</text>
  <rect x="202" y="14" width="68" height="32" rx="7" fill="#fff" stroke="#0071e3"/>
  <text x="236" y="34" text-anchor="middle" fill="#0071e3" font-size="8" font-weight="600">Open</text>
  <rect x="10" y="154" width="68" height="32" rx="7" fill="#fff" stroke="#0071e3"/>
  <text x="44" y="174" text-anchor="middle" fill="#0071e3" font-size="8" font-weight="600">Predict</text>
  <rect x="202" y="154" width="68" height="32" rx="7" fill="#fff" stroke="#0071e3"/>
  <text x="236" y="174" text-anchor="middle" fill="#0071e3" font-size="8" font-weight="600">Act</text>
  <line x1="78" y1="30" x2="105" y2="70" stroke="#0071e3" stroke-width="1.5"/>
  <line x1="202" y1="30" x2="175" y2="70" stroke="#0071e3" stroke-width="1.5"/>
  <line x1="78" y1="170" x2="105" y2="130" stroke="#0071e3" stroke-width="1.5"/>
  <line x1="202" y1="170" x2="175" y2="130" stroke="#0071e3" stroke-width="1.5"/>
  <text x="140" y="132" text-anchor="middle" fill="#86868b" font-size="7">eSIM · RAN · care · revenue</text>
</svg>

</div>

</div>

<p class="muted">iPhone 18 is the proof point — not a separate product story. Elastic is how you survive launch weekend.</p>

---

# Less NOC toil on iPhone 18 launch day

<svg viewBox="0 0 620 130" width="100%">
  <rect x="0" y="20" width="110" height="90" rx="12" fill="#f5f5f7" stroke="#d2d2d7"/>
  <text x="55" y="48" text-anchor="middle" fill="#86868b" font-size="9" font-weight="600">Static alerts</text>
  <text x="55" y="72" text-anchor="middle" fill="#1d1d1f" font-size="18" font-weight="700">4,200</text>
  <text x="55" y="88" text-anchor="middle" fill="#86868b" font-size="8">iPhone 18 weekend</text>
  <path d="M115 65 H145" stroke="#0071e3" stroke-width="2" marker-end="url(#a2)"/>
  <rect x="150" y="20" width="110" height="90" rx="12" fill="#0071e3" fill-opacity="0.08" stroke="#0071e3"/>
  <text x="205" y="48" text-anchor="middle" fill="#0071e3" font-size="9" font-weight="600">ML scored</text>
  <text x="205" y="72" text-anchor="middle" fill="#1d1d1f" font-size="18" font-weight="700">340</text>
  <path d="M265 65 H295" stroke="#0071e3" stroke-width="2" marker-end="url(#a2)"/>
  <rect x="300" y="20" width="110" height="90" rx="12" fill="#0071e3" fill-opacity="0.12" stroke="#0071e3"/>
  <text x="355" y="48" text-anchor="middle" fill="#0071e3" font-size="9" font-weight="600">Correlated</text>
  <text x="355" y="72" text-anchor="middle" fill="#1d1d1f" font-size="18" font-weight="700">48</text>
  <path d="M415 65 H445" stroke="#008009" stroke-width="2" marker-end="url(#a3)"/>
  <rect x="450" y="20" width="110" height="90" rx="12" fill="#008009" fill-opacity="0.1" stroke="#008009"/>
  <text x="505" y="48" text-anchor="middle" fill="#008009" font-size="9" font-weight="600">You act on</text>
  <text x="505" y="72" text-anchor="middle" fill="#1d1d1f" font-size="18" font-weight="700">12</text>
  <text x="310" y="118" text-anchor="middle" fill="#86868b" font-size="9">NOC works launch context — not pager fatigue · illustrative model</text>
  <defs>
    <marker id="a2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#0071e3"/></marker>
    <marker id="a3" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#008009"/></marker>
  </defs>
</svg>

<p class="muted">340% provisioning spike is expected on iPhone 18 — ML tells you which 12 incidents actually threaten activation SLA.</p>

---

# Protect iPhone 18 revenue · CSAT · upgrades

<div class="cols">

<div>

**Why executives care:**

- **$142M** gross-add revenue in the first 24h — every hour of downtime is measurable
- **84K subs** flagged churn-risk if activation SLA misses
- **Care cost** scales with queue depth — fix provisioning, cut repeat contacts

**Elastic gives NOC and care the same launch picture** before the social posts start.

</div>

<div>

<svg viewBox="0 0 280 185" width="100%">
  <text x="0" y="14" fill="#86868b" font-size="10" font-weight="600">iPhone 18 outcome loop</text>
  <rect x="0" y="28" width="120" height="44" rx="10" fill="#0071e3" fill-opacity="0.1" stroke="#0071e3"/>
  <text x="60" y="48" text-anchor="middle" fill="#1d1d1f" font-size="9" font-weight="600">Fast iPhone 18</text>
  <text x="60" y="62" text-anchor="middle" fill="#86868b" font-size="8">activation · eSIM · pickup</text>
  <rect x="160" y="28" width="120" height="44" rx="10" fill="#008009" fill-opacity="0.1" stroke="#008009"/>
  <text x="220" y="48" text-anchor="middle" fill="#1d1d1f" font-size="9" font-weight="600">Higher CSAT</text>
  <text x="220" y="62" text-anchor="middle" fill="#86868b" font-size="8">fewer care repeats</text>
  <rect x="0" y="118" width="120" height="44" rx="10" fill="#bf4800" fill-opacity="0.08" stroke="#bf4800"/>
  <text x="60" y="138" text-anchor="middle" fill="#1d1d1f" font-size="9" font-weight="600">Provisioning slip</text>
  <text x="60" y="152" text-anchor="middle" fill="#86868b" font-size="8">"still activating…"</text>
  <rect x="160" y="118" width="120" height="44" rx="10" fill="#bf4800" fill-opacity="0.15" stroke="#bf4800"/>
  <text x="220" y="138" text-anchor="middle" fill="#1d1d1f" font-size="9" font-weight="600">Churn · upgrades lost</text>
  <text x="220" y="152" text-anchor="middle" fill="#86868b" font-size="8">84K subs · demo</text>
  <path d="M60 72 V95 H220 V118" fill="none" stroke="#008009" stroke-width="2"/>
  <path d="M60 72 V95 H60 V118" fill="none" stroke="#bf4800" stroke-width="2" stroke-dasharray="4 3"/>
  <text x="140" y="92" text-anchor="middle" fill="#0071e3" font-size="8" font-weight="600">Elastic breaks the red path</text>
</svg>

</div>

</div>

---

# Live demo · iPhone 18 Pro Launch

<div class="stat-row">
  <div class="stat"><b>847K</b><span>activations · first 6h</span></div>
  <div class="stat"><b>340%</b><span>provisioning spike</span></div>
  <div class="stat"><b>~2.3h</b><span>ML taper forecast</span></div>
  <div class="stat"><b>3 regions</b><span>NYC retail · CDN · West fiber</span></div>
</div>

<p class="callout"><strong>Walk:</strong> Your OTel data today → iPhone 18 ML lifecycle → region hotspots · Networks → fault inject on launch load</p>

<p class="muted">Same agents you run now · live Serverless OTel · telco-demo-sage.vercel.app → <strong>Telemetry</strong></p>

---

<!-- _class: lead -->

# Launch iPhone 18 with confidence

## Why Elastic: Unify · Open · Predict · Act

**We meet you where you are · iPhone 18 proof in the demo**

telco-demo-sage.vercel.app → **Telemetry** · telco-demo-sage.vercel.app/slides/
