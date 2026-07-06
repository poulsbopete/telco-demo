---
marp: true
theme: default
paginate: true
size: 16:9
title: Elastic Observability — iPhone 18 Launch
description: Telco launch observability webinar — Why Elastic, data ecosystem, iPhone 18 launch event demo
style: |
  section {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    background: #fbfbfd;
    color: #1d1d1f;
    padding: 38px 50px;
    font-size: 22px;
  }
  section.lead { text-align: center; justify-content: center; }
  section.lead h1 { font-size: 2.1em; font-weight: 700; letter-spacing: -0.03em; margin: 0; }
  section.lead p { color: #86868b; font-size: 0.95em; margin-top: 1em; }
  h1 { font-size: 1.5em; font-weight: 700; margin: 0 0 0.35em; letter-spacing: -0.02em; }
  h2 { color: #0071e3; font-size: 0.92em; font-weight: 600; margin: 0 0 0.45em; }
  ul { margin: 0.25em 0; line-height: 1.42; font-size: 0.8em; }
  li { margin: 0.12em 0; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: center; margin-top: 0.35em; }
  .stat-row { display: flex; gap: 12px; margin-top: 0.45em; }
  .stat { flex: 1; background: #fff; border: 1px solid #d2d2d7; border-radius: 14px; padding: 12px 14px; text-align: center; }
  .stat b { display: block; font-size: 1.45em; color: #0071e3; }
  .stat span { font-size: 0.62em; color: #86868b; }
  .callout { background: #0071e3; color: #fff; border-radius: 14px; padding: 12px 16px; font-size: 0.76em; margin-top: 0.45em; }
  .callout-green { background: #008009; color: #fff; border-radius: 14px; padding: 12px 16px; font-size: 0.76em; margin-top: 0.45em; }
  .muted { color: #86868b; font-size: 0.7em; }
  .pillar { background: #fff; border: 1px solid #d2d2d7; border-radius: 12px; padding: 9px 11px; font-size: 0.7em; }
  .pillar b { display: block; color: #0071e3; font-size: 1.05em; margin-bottom: 0.15em; }
  .pillar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 0.4em; }
  .agenda { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 0.5em; font-size: 0.78em; }
  .agenda div { background: #fff; border-left: 4px solid #0071e3; border-radius: 8px; padding: 10px 12px; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
  .agenda b { color: #0071e3; }
  .persona-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.68em; margin-top: 0.35em; }
  .persona { background: #fff; border: 1px solid #d2d2d7; border-radius: 10px; padding: 8px 10px; }
  .persona b { color: #0071e3; display: block; margin-bottom: 0.15em; }
  svg text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  section.dark {
    background: #050816;
    color: #f5f5f7;
    padding: 36px 48px 28px;
  }
  section.dark h1 { color: #fff; font-size: 1.35em; line-height: 1.25; margin-top: 0.15em; margin-bottom: 0; }
  section.dark h2 { color: #fff; font-size: 1.35em; line-height: 1.25; font-weight: 700; margin: 0 0 0.35em; letter-spacing: -0.02em; }
  section.dark .kicker {
    display: inline-block;
    background: #00bfb3;
    color: #050816;
    font-size: 0.52em;
    font-weight: 700;
    letter-spacing: 0.06em;
    padding: 4px 10px;
    margin-bottom: 0.5em;
  }
  section.dark .subhead { color: #9a9aa0; font-size: 0.72em; line-height: 1.45; margin: 0.4em 0 0.8em; max-width: 92%; }
  section.dark .shift-list { margin-top: 0.35em; }
  section.dark .shift-item {
    display: grid;
    grid-template-columns: 52px 1fr;
    gap: 14px;
    align-items: start;
    margin-bottom: 0.55em;
    font-size: 0.68em;
    line-height: 1.4;
  }
  section.dark .shift-num {
    width: 52px; height: 52px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.35em; font-weight: 700; color: #fff;
  }
  section.dark .shift-num.n1 { background: #e8478b; }
  section.dark .shift-num.n2 { background: #fec514; color: #1d1d1f; }
  section.dark .shift-num.n3 { background: #0071e3; }
  section.dark .shift-item b { display: block; color: #fff; font-size: 1.05em; margin-bottom: 0.2em; }
  section.dark .shift-item span { color: #9a9aa0; }
  section.dark .slide-foot {
    position: absolute; bottom: 22px; left: 48px; right: 48px;
    border-top: 2px solid #00bfb3;
    padding-top: 8px;
    font-size: 0.52em;
    color: #9a9aa0;
    display: flex; justify-content: space-between;
  }
  section.dark .cite { font-size: 0.58em; color: #6e6e73; margin-top: 0.2em; }
  section.dark .ecosystem-panel { font-size: 0.72em; line-height: 1.45; }
  section.dark .ecosystem-panel b { color: #fff; }
  section.dark .ecosystem-panel li { color: #9a9aa0; }
  section.dark .ecosystem-img {
    background: #fff;
    border-radius: 10px;
    padding: 10px;
    line-height: 0;
  }
  section.dark .ecosystem-img img { width: 100%; height: auto; display: block; }
---

<!-- _class: lead -->

# Elastic Observability
## iPhone 18 Launch Event · Sept 2026

**Unlock launch-weekend value from the OTel data you already collect**

telco-demo-sage.vercel.app

---

# Agenda

**Today: get more value from telco data you're already collecting — through the iPhone 18 launch lens.**

<div class="agenda">
  <div><b>1 · Why Elastic</b><br/>Search AI Platform · meet you where you are</div>
  <div><b>2 · Data ecosystem</b><br/>Primary &amp; enabling roles across your stack</div>
  <div><b>3 · iPhone 18 launch event</b><br/>The 72-hour surge · business stakes · demo walk</div>
  <div><b>4 · Outcomes</b><br/>Less NOC toil · higher CSAT · protected revenue</div>
</div>

<p class="muted">Modeled on Elastic Telecom webinar narrative · use case = iPhone 18 Pro Launch weekend</p>

---

<!-- _class: dark -->

<span class="kicker">THE LAUNCH SHIFT</span>

# iPhone 18 launch is a software event.
## Your observability architecture hasn't caught up.

<p class="subhead">Not a failure of tooling or teams. A mismatch between how launch traffic actually flows — eSIM, provisioning, retail, care — and how each layer is watched in isolation.</p>

<div class="shift-list">
  <div class="shift-item">
    <div class="shift-num n1">01</div>
    <div><b>Activations are digital workflows — not a single RAN attach</b><span>iPhone 18 turns on through eSIM OTA downloads, provisioning queues, SM-DP+ profiles, and billing triggers. SNMP-era monitoring can't trace a subscriber across those boundaries when 124K profiles/min hit the edge.</span></div>
  </div>
  <div class="shift-item">
    <div class="shift-num n2">02</div>
    <div><b>Launch day spans retail, CDN, core, and care — not one NOC view</b><span>Midnight West-coast wave, NYC flagship pickup, national CDN restore — failures originate in regions your core dashboard never sees. Launch is a continuum; your tools still mirror org silos.</span></div>
  </div>
  <div class="shift-item">
    <div class="shift-num n3">03</div>
    <div><b>Every layer emits telemetry. Almost none of it correlates by design.</b><span>OTel logs, metrics, traces, NetFlow, care CRM, retail POS — different pipelines, different teams, different alert thresholds. On iPhone 18 weekend, 4,200 raw alerts become noise without a unified launch context.</span></div>
  </div>
</div>

<div class="slide-foot"><span>elastic.co | Elastic Observability</span><span>iPhone 18 Launch · Sept 2026</span></div>

---

# The iPhone 18 launch challenge

**Failing to unify launch telemetry is competitive disadvantage — not just NOC noise.**

<div class="cols">

<div>

✖ **Siloed data** — RAN, core, provisioning, care in separate tools  
✖ **Overwhelming alerts** — 4,200 raw events · static thresholds  
✖ **Impaired decisions** — war rooms on false P1s during the surge  
✖ **Poor customer experience** — "activation stuck" · 18.4K care contacts/hr  
✖ **Decreased resilience** — 84K subs at churn risk if SLA slips

</div>

<div>

<div class="stat-row" style="flex-direction:column">
  <div class="stat"><b>2.4M</b><span>iPhone 18 pre-orders · 24h</span></div>
  <div class="stat"><b>$142M</b><span>gross-add revenue · first 24h</span></div>
  <div class="stat"><b>847K</b><span>activations · first 6 hours</span></div>
</div>

</div>

</div>

<p class="callout"><strong>Bottom line:</strong> You already sold the upgrades. Launch weekend decides whether you keep them.</p>

---

# Why Elastic?

**One platform to see the whole launch — without ripping out what you run today.**

<div class="pillar-grid">
  <div class="pillar"><b>Unify</b>Logs, metrics, traces &amp; security — RAN, core, provisioning &amp; care together</div>
  <div class="pillar"><b>Open</b>OTel-native · same agents &amp; collectors · meet you where you are</div>
  <div class="pillar"><b>Predict</b>ML lifecycle forecast &amp; ES\|QL — see the surge before static alerts</div>
  <div class="pillar"><b>Act</b>Workflows &amp; Serverless scale — correlated RCA in minutes</div>
</div>

<svg viewBox="0 0 620 88" width="100%" style="margin-top:8px">
  <rect x="0" y="6" width="120" height="72" rx="10" fill="#f5f5f7" stroke="#d2d2d7"/>
  <text x="60" y="28" text-anchor="middle" fill="#86868b" font-size="8" font-weight="600">Tool sprawl</text>
  <text x="60" y="44" text-anchor="middle" fill="#1d1d1f" font-size="7.5">Siloed RAN · Core · Care</text>
  <text x="60" y="58" text-anchor="middle" fill="#bf4800" font-size="7.5">Can't see one launch event</text>
  <path d="M128 42 H152" stroke="#0071e3" stroke-width="2" marker-end="url(#w1)"/>
  <rect x="158" y="6" width="250" height="72" rx="10" fill="#0071e3" fill-opacity="0.08" stroke="#0071e3"/>
  <text x="283" y="26" text-anchor="middle" fill="#1d1d1f" font-size="9" font-weight="700">Elastic Search AI Platform</text>
  <text x="283" y="42" text-anchor="middle" fill="#86868b" font-size="7.5">Observability · Security · Elasticsearch</text>
  <text x="283" y="58" text-anchor="middle" fill="#1d1d1f" font-size="7.5">Milliseconds · not minutes</text>
  <path d="M414 42 H438" stroke="#008009" stroke-width="2" marker-end="url(#w2)"/>
  <rect x="444" y="6" width="176" height="72" rx="10" fill="#008009" fill-opacity="0.08" stroke="#008009"/>
  <text x="532" y="28" text-anchor="middle" fill="#008009" font-size="8" font-weight="600">iPhone 18 outcomes</text>
  <text x="532" y="44" text-anchor="middle" fill="#1d1d1f" font-size="7.5">Less toil · higher CSAT</text>
  <text x="532" y="58" text-anchor="middle" fill="#1d1d1f" font-size="7.5">Revenue &amp; upgrades protected</text>
  <defs>
    <marker id="w1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#0071e3"/></marker>
    <marker id="w2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#008009"/></marker>
  </defs>
</svg>

---

# Search AI Platform · built for speed

**The other path — warehouse, lake, lakehouse — wasn't built for launch-second decisions.**

<div class="cols">

<div>

| Architecture | Response | Launch fit |
|---|---|---|
| Data warehouse | 10s of seconds | Too slow for NOC |
| Lakehouse | Seconds | Inconsistent |
| Data lake | Minutes | Dashboard timeouts |
| **Search AI Lake** | **Milliseconds** | **iPhone 18 surge** |

Pure **OpenTelemetry** — no proprietary layers compromising portability.

</div>

<div>

<svg viewBox="0 0 280 175" width="100%">
  <text x="0" y="14" fill="#86868b" font-size="9" font-weight="600">Query response · launch weekend</text>
  <rect x="0" y="28" width="55" height="120" rx="6" fill="#f5f5f7" stroke="#d2d2d7"/>
  <text x="27" y="50" text-anchor="middle" fill="#86868b" font-size="7" transform="rotate(-90 27 50)">Warehouse</text>
  <rect x="62" y="48" width="55" height="100" rx="6" fill="#f5f5f7" stroke="#d2d2d7"/>
  <text x="89" y="50" text-anchor="middle" fill="#86868b" font-size="7" transform="rotate(-90 89 50)">Lakehouse</text>
  <rect x="124" y="68" width="55" height="80" rx="6" fill="#f5f5f7" stroke="#d2d2d7"/>
  <text x="151" y="50" text-anchor="middle" fill="#86868b" font-size="7" transform="rotate(-90 151 50)">Data lake</text>
  <rect x="186" y="108" width="55" height="40" rx="6" fill="#0071e3"/>
  <text x="213" y="50" text-anchor="middle" fill="#0071e3" font-size="7" font-weight="700" transform="rotate(-90 213 50)">Search AI</text>
  <line x1="0" y1="158" x2="250" y2="158" stroke="#d2d2d7"/>
  <text x="0" y="172" fill="#86868b" font-size="7">Slow →</text>
  <text x="210" y="172" fill="#0071e3" font-size="7" font-weight="600">Fast</text>
</svg>

</div>

</div>

---

# One platform · two solutions · build anything

<div class="cols">

<div>

**Search AI Platform** — ingestion through action on one stack:

- **Ingestion** → OTel logs, metrics, traces from RAN · core · provisioning
- **Search AI Lake** → correlate iPhone 18 launch signals at scale
- **AI analysis** → ML lifecycle forecast · anomaly detection
- **Workflow automation** → incident RCA · less manual toil

**Out-of-the-box:** Observability · Security · Elasticsearch

</div>

<div>

<svg viewBox="0 0 280 200" width="100%">
  <rect x="90" y="70" width="100" height="60" rx="10" fill="#0071e3" fill-opacity="0.12" stroke="#0071e3" stroke-width="2"/>
  <text x="140" y="94" text-anchor="middle" fill="#1d1d1f" font-size="9" font-weight="700">Search AI</text>
  <text x="140" y="108" text-anchor="middle" fill="#1d1d1f" font-size="9" font-weight="700">Platform</text>
  <rect x="10" y="10" width="72" height="34" rx="8" fill="#fff" stroke="#d2d2d7"/>
  <text x="46" y="30" text-anchor="middle" fill="#1d1d1f" font-size="8" font-weight="600">Ingestion</text>
  <rect x="198" y="10" width="72" height="34" rx="8" fill="#fff" stroke="#d2d2d7"/>
  <text x="234" y="30" text-anchor="middle" fill="#1d1d1f" font-size="8" font-weight="600">AI analysis</text>
  <rect x="10" y="156" width="72" height="34" rx="8" fill="#fff" stroke="#d2d2d7"/>
  <text x="46" y="176" text-anchor="middle" fill="#1d1d1f" font-size="8" font-weight="600">ES|QL search</text>
  <rect x="198" y="156" width="72" height="34" rx="8" fill="#fff" stroke="#d2d2d7"/>
  <text x="234" y="176" text-anchor="middle" fill="#1d1d1f" font-size="8" font-weight="600">Workflows</text>
  <line x1="82" y1="27" x2="98" y2="80" stroke="#0071e3"/>
  <line x1="198" y1="27" x2="182" y2="80" stroke="#0071e3"/>
  <line x1="82" y1="173" x2="98" y2="120" stroke="#0071e3"/>
  <line x1="198" y1="173" x2="182" y2="120" stroke="#0071e3"/>
  <rect x="18" y="78" width="64" height="44" rx="8" fill="#008009" fill-opacity="0.1" stroke="#008009"/>
  <text x="50" y="96" text-anchor="middle" fill="#008009" font-size="7" font-weight="600">Observability</text>
  <text x="50" y="108" text-anchor="middle" fill="#008009" font-size="7" font-weight="600">Security · ES</text>
</svg>

</div>

</div>

<p class="muted">Start with Observability for iPhone 18 · Security enables launch fraud · Search powers care KB.</p>

---

<!-- _class: dark -->

<span class="kicker">DATA ECOSYSTEM</span>

# Elastic primary &amp; enabling roles across your launch stack

<p class="subhead">Meet you where you are today — then scale Observability, Security, and Search across the iPhone 18 launch data ecosystem.</p>

<div class="cols">

<div class="ecosystem-img">

![width:100%](/slides/assets/elastic-data-ecosystem.png)

</div>

<div class="ecosystem-panel">

**Think in layers**

- **Foundation:** OTel signals · network context · SLA oversight
- **Mature:** curated launch data · ML forecast · region hotspots
- **Advanced:** automated RCA · business KPI tiles · experimentation

**iPhone 18 mapping**

- O11Y **primary** on ingest &amp; ML forecast
- Elasticsearch **primary** on ES\|QL &amp; log search
- Security **enabling** on SIM swap · launch fraud

</div>

</div>

<div class="slide-foot"><span>elastic.co | Elastic Observability</span><span>Data Ecosystem · iPhone 18</span></div>

---

# We meet you where you are today

**No rip-and-replace before Sept 2026.** Pilot one hotspot region · expand across the ecosystem.

<div class="cols">

<div>

**Traditional:** siloed NOC tools · static alerts · 6-hour bridge calls  
**Future:** composable · Serverless · OTel-native · ML-driven

- Same **OTel agents** &amp; collectors you run today
- **Siloed dashboards stay** while Elastic unifies launch context
- Start **launch-weekend visibility** → grow into workflows &amp; ML

</div>

<div>

<svg viewBox="0 0 300 165" width="100%">
  <rect x="0" y="20" width="88" height="120" rx="10" fill="#fff" stroke="#d2d2d7"/>
  <text x="44" y="42" text-anchor="middle" fill="#1d1d1f" font-size="9" font-weight="600">Where you are</text>
  <text x="44" y="62" text-anchor="middle" fill="#86868b" font-size="8">Legacy NOC · Point APM</text>
  <text x="44" y="78" text-anchor="middle" fill="#86868b" font-size="8">Siloed logs · OTel in flight</text>
  <path d="M98 80 H112" stroke="#0071e3" stroke-width="2" marker-end="url(#m1)"/>
  <rect x="118" y="45" width="64" height="70" rx="10" fill="#0071e3" fill-opacity="0.1" stroke="#0071e3"/>
  <text x="150" y="68" text-anchor="middle" fill="#0071e3" font-size="8" font-weight="700">Elastic</text>
  <text x="150" y="82" text-anchor="middle" fill="#0071e3" font-size="8" font-weight="700">meets you</text>
  <text x="150" y="98" text-anchor="middle" fill="#86868b" font-size="7">Ingest · unify · ML</text>
  <path d="M192 80 H206" stroke="#008009" stroke-width="2" marker-end="url(#m2)"/>
  <rect x="212" y="20" width="88" height="120" rx="10" fill="#008009" fill-opacity="0.08" stroke="#008009"/>
  <text x="256" y="42" text-anchor="middle" fill="#1d1d1f" font-size="9" font-weight="600">iPhone 18 ready</text>
  <text x="256" y="62" text-anchor="middle" fill="#86868b" font-size="8">Launch forecast</text>
  <text x="256" y="78" text-anchor="middle" fill="#86868b" font-size="8">Region hotspots · RCA</text>
  <text x="256" y="94" text-anchor="middle" fill="#86868b" font-size="8">Care + NOC unified</text>
  <text x="256" y="118" text-anchor="middle" fill="#008009" font-size="8" font-weight="600">Sept 2026</text>
  <defs>
    <marker id="m1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#0071e3"/></marker>
    <marker id="m2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#008009"/></marker>
  </defs>
</svg>

</div>

</div>

---

# Real use case · iPhone 18 Launch Event

**The 72-hour surge — midnight drop · retail pickup · Sunday taper**

<div class="cols">

<div>

**Fri 12 AM** — eSIM OTA · restore CDN · 124K profiles/min  
**Fri 8–11 AM** — retail pickup · RAN attach · flagship stores  
**Sat–Sun** — provisioning taper · care backlog · trade-in queues

Each phase breaks a **different layer** — subscribers only see *"my iPhone 18 won't activate."*

</div>

<div>

<svg viewBox="0 0 320 175" width="100%">
  <text x="8" y="14" fill="#86868b" font-size="9" font-weight="600">Activation curve · launch weekend</text>
  <line x1="24" y1="145" x2="300" y2="145" stroke="#d2d2d7"/>
  <line x1="24" y1="28" x2="24" y2="145" stroke="#d2d2d7"/>
  <path d="M24 135 C 60 130, 80 115, 100 85 S 140 32, 170 25 S 220 48, 250 95 S 280 125, 300 133" fill="none" stroke="#0071e3" stroke-width="3"/>
  <path d="M24 135 C 60 133, 90 120, 120 90 S 160 42, 190 37 S 230 52, 260 100" fill="none" stroke="#86868b" stroke-width="2" stroke-dasharray="4 3"/>
  <circle cx="170" cy="25" r="5" fill="#bf4800"/>
  <text x="178" y="29" fill="#bf4800" font-size="8" font-weight="600">14.2K/min</text>
  <text x="230" y="18" fill="#0071e3" font-size="7">ML forecast</text>
</svg>

</div>

</div>

<div class="stat-row">
  <div class="stat"><b>340%</b><span>provisioning spike</span></div>
  <div class="stat"><b>~2.3h</b><span>ML taper forecast</span></div>
  <div class="stat"><b>3 regions</b><span>NYC · CDN · West fiber</span></div>
</div>

---

# Before &amp; after · iPhone 18 activation

**Comcast-style outcome story — applied to device launch weekend**

<div class="cols">

<div>

**Before Elastic**
- Siloed RAN · core · care dashboards
- 4,200 raw alerts · war room fatigue
- Activation SLA slips · 84K churn-risk subs
- 18.4K care contacts/hr · social escalation

</div>

<div>

**After Elastic (demo model)**
- One OTel pipeline · ML lifecycle forecast
- 4,200 → **12** actionable incidents
- Provisioning surge flagged **2h early**
- NOC + care share the same launch picture

</div>

</div>

<svg viewBox="0 0 620 72" width="100%" style="margin-top:6px">
  <rect x="0" y="8" width="280" height="56" rx="10" fill="#bf4800" fill-opacity="0.08" stroke="#bf4800"/>
  <text x="140" y="30" text-anchor="middle" fill="#bf4800" font-size="9" font-weight="700">BEFORE · siloed tools</text>
  <text x="140" y="48" text-anchor="middle" fill="#1d1d1f" font-size="8">Slow MTTR · lost upgrades · high care cost</text>
  <path d="M292 36 H328" stroke="#0071e3" stroke-width="2" marker-end="url(#ba)"/>
  <text x="310" y="28" text-anchor="middle" fill="#0071e3" font-size="7" font-weight="700">Elastic</text>
  <rect x="340" y="8" width="280" height="56" rx="10" fill="#008009" fill-opacity="0.08" stroke="#008009"/>
  <text x="480" y="30" text-anchor="middle" fill="#008009" font-size="9" font-weight="700">AFTER · unified launch view</text>
  <text x="480" y="48" text-anchor="middle" fill="#1d1d1f" font-size="8">Predict surge · act early · protect CSAT</text>
  <defs><marker id="ba" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#0071e3"/></marker></defs>
</svg>

---

# Personas · value from iPhone 18 launch observability

**Everyone sees the same launch event — different outcomes per role**

<div class="persona-grid">
  <div class="persona"><b>NOC / SRE</b>↓ MTTR · ML-scored alerts · region hotspots · SLA delivery</div>
  <div class="persona"><b>Care / CX</b>↓ repeat contacts · queue-aware guides · CSAT protection</div>
  <div class="persona"><b>Network ops</b>340% spike expected · taper forecast · staff the right regions</div>
  <div class="persona"><b>Executives</b>$142M revenue · 84K churn risk · tool consolidation &amp; TCO</div>
</div>

<div class="stat-row" style="margin-top:10px">
  <div class="stat"><b>65%</b><span>MTTX improvement · Elastic customers</span></div>
  <div class="stat"><b>10×</b><span>MTTR · telecom case studies</span></div>
  <div class="stat"><b>25%</b><span>TCO reduction · platform consolidation</span></div>
</div>

<p class="muted">Telecom benchmarks from Elastic customer outcomes · iPhone 18 demo quantifies launch-specific impact</p>

---

# Less NOC toil · signal funnel

<svg viewBox="0 0 620 125" width="100%">
  <rect x="0" y="15" width="110" height="85" rx="12" fill="#f5f5f7" stroke="#d2d2d7"/>
  <text x="55" y="42" text-anchor="middle" fill="#86868b" font-size="9" font-weight="600">Static alerts</text>
  <text x="55" y="68" text-anchor="middle" fill="#1d1d1f" font-size="18" font-weight="700">4,200</text>
  <path d="M115 58 H145" stroke="#0071e3" stroke-width="2" marker-end="url(#f1)"/>
  <rect x="150" y="15" width="110" height="85" rx="12" fill="#0071e3" fill-opacity="0.08" stroke="#0071e3"/>
  <text x="205" y="42" text-anchor="middle" fill="#0071e3" font-size="9" font-weight="600">ML scored</text>
  <text x="205" y="68" text-anchor="middle" fill="#1d1d1f" font-size="18" font-weight="700">340</text>
  <path d="M265 58 H295" stroke="#0071e3" stroke-width="2" marker-end="url(#f1)"/>
  <rect x="300" y="15" width="110" height="85" rx="12" fill="#0071e3" fill-opacity="0.12" stroke="#0071e3"/>
  <text x="355" y="42" text-anchor="middle" fill="#0071e3" font-size="9" font-weight="600">Correlated</text>
  <text x="355" y="68" text-anchor="middle" fill="#1d1d1f" font-size="18" font-weight="700">48</text>
  <path d="M415 58 H445" stroke="#008009" stroke-width="2" marker-end="url(#f2)"/>
  <rect x="450" y="15" width="110" height="85" rx="12" fill="#008009" fill-opacity="0.1" stroke="#008009"/>
  <text x="505" y="42" text-anchor="middle" fill="#008009" font-size="9" font-weight="600">You act on</text>
  <text x="505" y="68" text-anchor="middle" fill="#1d1d1f" font-size="18" font-weight="700">12</text>
  <text x="310" y="112" text-anchor="middle" fill="#86868b" font-size="8">NOC acts on launch context — not pager fatigue · iPhone 18 weekend</text>
  <defs>
    <marker id="f1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#0071e3"/></marker>
    <marker id="f2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#008009"/></marker>
  </defs>
</svg>

---

# Live demo · iPhone 18 Pro Launch

<div class="stat-row">
  <div class="stat"><b>847K</b><span>activations · first 6h</span></div>
  <div class="stat"><b>340%</b><span>provisioning spike</span></div>
  <div class="stat"><b>ML</b><span>lifecycle forecast · surge &amp; taper</span></div>
  <div class="stat"><b>OTel</b><span>live Serverless telemetry</span></div>
</div>

<p class="callout"><strong>Walk:</strong> Telemetry → iPhone 18 ML lifecycle → region hotspots · Networks → fault inject on launch load</p>

<p class="muted">telco-demo-sage.vercel.app → <strong>Telemetry</strong> · same OTel agents you run today</p>

---

<!-- _class: lead -->

# Your Elastic era starts now

## iPhone 18 launch · Sept 2026

**Why Elastic: Unify · Open · Predict · Act**

**We meet you where you are · proof in the demo**

telco-demo-sage.vercel.app
