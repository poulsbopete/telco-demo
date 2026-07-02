---
marp: true
theme: default
paginate: true
size: 16:9
title: Elastic Observability — Mobile Launch
description: Reduce NOC toil, churn, and improve CSAT during major device launches
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
  .muted { color: #86868b; font-size: 0.72em; }
  svg text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
---

<!-- _class: lead -->

# Elastic Observability
## Major mobile launches without the NOC fire drill

**Less toil · lower churn · higher CSAT**

telco-demo-sage.vercel.app → **Telemetry**

---

# Launch day hits in hours, not weeks

<div class="cols">

<div>

- **Millions of activations** — provisioning, eSIM OTA, RAN attach
- **Regional hotspots** — retail, CDN, midnight waves
- **Care & NOC spike together** — same event, different tools
- **Static alerts** → pager fatigue when curves aren't normal

</div>

<div>

<svg viewBox="0 0 320 180" width="100%">
  <text x="8" y="16" fill="#86868b" font-size="10" font-weight="600">Launch-day activation curve</text>
  <line x1="24" y1="150" x2="300" y2="150" stroke="#d2d2d7" stroke-width="1"/>
  <line x1="24" y1="30" x2="24" y2="150" stroke="#d2d2d7" stroke-width="1"/>
  <path d="M24 140 C 60 135, 80 120, 100 90 S 140 35, 170 28 S 220 50, 250 100 S 280 130, 300 138" fill="none" stroke="#0071e3" stroke-width="3"/>
  <path d="M24 140 C 60 138, 90 125, 120 95 S 160 45, 190 40 S 230 55, 260 105" fill="none" stroke="#86868b" stroke-width="2" stroke-dasharray="4 3"/>
  <circle cx="170" cy="28" r="5" fill="#bf4800"/>
  <text x="178" y="32" fill="#bf4800" font-size="9" font-weight="600">Peak</text>
  <text x="24" y="168" fill="#86868b" font-size="8">12 AM</text>
  <text x="155" y="168" fill="#86868b" font-size="8">Noon</text>
  <text x="268" y="168" fill="#86868b" font-size="8">Sun</text>
  <text x="230" y="22" fill="#0071e3" font-size="8">ML forecast</text>
  <text x="230" y="32" fill="#86868b" font-size="8">— — threshold</text>
</svg>

</div>

</div>

<p class="muted">Without lifecycle context, teams over-staff early and miss the second wave.</p>

---

# What launches cost when observability lags

<div class="stat-row">
  <div class="stat"><b>↑ Toil</b><span>Alert storms · manual correlation · war-room fatigue</span></div>
  <div class="stat"><b>↑ Churn</b><span>SLA slips on activation · queues · failed provisioning</span></div>
  <div class="stat"><b>↓ CSAT</b><span>Long care holds · repeat contacts · social escalation</span></div>
</div>

<svg viewBox="0 0 520 100" width="100%" style="margin-top:12px">
  <rect x="0" y="10" width="150" height="70" rx="10" fill="#fff" stroke="#d2d2d7"/>
  <text x="75" y="35" text-anchor="middle" fill="#1d1d1f" font-size="11" font-weight="600">Siloed tools</text>
  <text x="75" y="55" text-anchor="middle" fill="#86868b" font-size="9">RAN · Core · Care</text>
  <text x="75" y="70" text-anchor="middle" fill="#bf4800" font-size="9">Slow MTTR</text>
  <path d="M160 45 H200" stroke="#86868b" marker-end="url(#arr)"/>
  <rect x="210" y="10" width="150" height="70" rx="10" fill="#0071e3" fill-opacity="0.08" stroke="#0071e3"/>
  <text x="285" y="35" text-anchor="middle" fill="#1d1d1f" font-size="11" font-weight="600">Elastic O11Y</text>
  <text x="285" y="55" text-anchor="middle" fill="#86868b" font-size="9">One view · ML · region</text>
  <text x="285" y="70" text-anchor="middle" fill="#008009" font-size="9">Act before churn</text>
  <path d="M370 45 H410" stroke="#86868b"/>
  <rect x="420" y="10" width="90" height="70" rx="10" fill="#008009" fill-opacity="0.1" stroke="#008009"/>
  <text x="465" y="42" text-anchor="middle" fill="#008009" font-size="10" font-weight="600">CSAT</text>
  <text x="465" y="58" text-anchor="middle" fill="#008009" font-size="10" font-weight="600">protected</text>
  <defs><marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#86868b"/></marker></defs>
</svg>

---

# Why Elastic for launch observability

<div class="cols">

<div>

**One OTel pipeline** — logs, metrics, traces  
**Region context** on every signal  
**ES\|QL** — investigate without rehydration  
**ML lifecycle forecast** — surge vs taper  
**Workflows** — correlated RCA, less manual toil

</div>

<div>

<svg viewBox="0 0 280 200" width="100%">
  <circle cx="140" cy="100" r="52" fill="#0071e3" fill-opacity="0.12" stroke="#0071e3" stroke-width="2"/>
  <text x="140" y="96" text-anchor="middle" fill="#1d1d1f" font-size="11" font-weight="700">Elastic</text>
  <text x="140" y="112" text-anchor="middle" fill="#1d1d1f" font-size="11" font-weight="700">Observability</text>
  <rect x="18" y="18" width="72" height="36" rx="8" fill="#fff" stroke="#d2d2d7"/>
  <text x="54" y="40" text-anchor="middle" fill="#1d1d1f" font-size="9" font-weight="600">OTel ingest</text>
  <rect x="190" y="18" width="72" height="36" rx="8" fill="#fff" stroke="#d2d2d7"/>
  <text x="226" y="40" text-anchor="middle" fill="#1d1d1f" font-size="9" font-weight="600">ML forecast</text>
  <rect x="18" y="146" width="72" height="36" rx="8" fill="#fff" stroke="#d2d2d7"/>
  <text x="54" y="168" text-anchor="middle" fill="#1d1d1f" font-size="9" font-weight="600">ES|QL</text>
  <rect x="190" y="146" width="72" height="36" rx="8" fill="#fff" stroke="#d2d2d7"/>
  <text x="226" y="168" text-anchor="middle" fill="#1d1d1f" font-size="9" font-weight="600">Workflows</text>
  <line x1="90" y1="36" x2="100" y2="75" stroke="#0071e3" stroke-width="1.5"/>
  <line x1="190" y1="36" x2="180" y2="75" stroke="#0071e3" stroke-width="1.5"/>
  <line x1="90" y1="164" x2="105" y2="125" stroke="#0071e3" stroke-width="1.5"/>
  <line x1="190" y1="164" x2="175" y2="125" stroke="#0071e3" stroke-width="1.5"/>
</svg>

</div>

</div>

---

# Cut NOC toil — signal funnel

<svg viewBox="0 0 620 130" width="100%">
  <rect x="0" y="20" width="110" height="90" rx="12" fill="#f5f5f7" stroke="#d2d2d7"/>
  <text x="55" y="52" text-anchor="middle" fill="#86868b" font-size="10" font-weight="600">Threshold</text>
  <text x="55" y="72" text-anchor="middle" fill="#1d1d1f" font-size="18" font-weight="700">4,200</text>
  <text x="55" y="88" text-anchor="middle" fill="#86868b" font-size="8">raw alerts</text>
  <path d="M115 65 H145" stroke="#0071e3" stroke-width="2" marker-end="url(#a2)"/>
  <rect x="150" y="20" width="110" height="90" rx="12" fill="#0071e3" fill-opacity="0.08" stroke="#0071e3"/>
  <text x="205" y="52" text-anchor="middle" fill="#0071e3" font-size="10" font-weight="600">ML scored</text>
  <text x="205" y="72" text-anchor="middle" fill="#1d1d1f" font-size="18" font-weight="700">340</text>
  <path d="M265 65 H295" stroke="#0071e3" stroke-width="2" marker-end="url(#a2)"/>
  <rect x="300" y="20" width="110" height="90" rx="12" fill="#0071e3" fill-opacity="0.12" stroke="#0071e3"/>
  <text x="355" y="52" text-anchor="middle" fill="#0071e3" font-size="10" font-weight="600">Correlated</text>
  <text x="355" y="72" text-anchor="middle" fill="#1d1d1f" font-size="18" font-weight="700">48</text>
  <path d="M415 65 H445" stroke="#008009" stroke-width="2" marker-end="url(#a3)"/>
  <rect x="450" y="20" width="110" height="90" rx="12" fill="#008009" fill-opacity="0.1" stroke="#008009"/>
  <text x="505" y="52" text-anchor="middle" fill="#008009" font-size="10" font-weight="600">Actionable</text>
  <text x="505" y="72" text-anchor="middle" fill="#1d1d1f" font-size="18" font-weight="700">12</text>
  <text x="310" y="118" text-anchor="middle" fill="#86868b" font-size="9">~60% fewer P1-class incidents · illustrative model</text>
  <defs>
    <marker id="a2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#0071e3"/></marker>
    <marker id="a3" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#008009"/></marker>
  </defs>
</svg>

<p class="muted">Domain tags: RAN · Core · Transport · Provisioning — NOC acts on launch context, not noise.</p>

---

# Protect CSAT · reduce churn

<div class="cols">

<div>

**Before SLA slips:**
- ML flags provisioning surge **2h early**
- Staff to hotspot regions, not entire network
- Workflows remediate transport/core issues

**Business tiles in demo:**
- Churn-risk subs if SLA misses
- Care load next 4h · gross-add revenue

</div>

<div>

<svg viewBox="0 0 280 185" width="100%">
  <text x="0" y="14" fill="#86868b" font-size="10" font-weight="600">Launch outcome loop</text>
  <rect x="0" y="28" width="120" height="44" rx="10" fill="#0071e3" fill-opacity="0.1" stroke="#0071e3"/>
  <text x="60" y="48" text-anchor="middle" fill="#1d1d1f" font-size="9" font-weight="600">Fast activation</text>
  <text x="60" y="62" text-anchor="middle" fill="#86868b" font-size="8">OTel + ML watch</text>
  <rect x="160" y="28" width="120" height="44" rx="10" fill="#008009" fill-opacity="0.1" stroke="#008009"/>
  <text x="220" y="48" text-anchor="middle" fill="#1d1d1f" font-size="9" font-weight="600">Higher CSAT</text>
  <text x="220" y="62" text-anchor="middle" fill="#86868b" font-size="8">fewer care repeats</text>
  <rect x="0" y="118" width="120" height="44" rx="10" fill="#bf4800" fill-opacity="0.08" stroke="#bf4800"/>
  <text x="60" y="138" text-anchor="middle" fill="#1d1d1f" font-size="9" font-weight="600">SLA slip</text>
  <text x="60" y="152" text-anchor="middle" fill="#86868b" font-size="8">without O11Y</text>
  <rect x="160" y="118" width="120" height="44" rx="10" fill="#bf4800" fill-opacity="0.15" stroke="#bf4800"/>
  <text x="220" y="138" text-anchor="middle" fill="#1d1d1f" font-size="9" font-weight="600">Churn risk</text>
  <text x="220" y="152" text-anchor="middle" fill="#86868b" font-size="8">84K subs · demo</text>
  <path d="M60 72 V95 H220 V118" fill="none" stroke="#008009" stroke-width="2"/>
  <path d="M60 72 V95 H60 V118" fill="none" stroke="#bf4800" stroke-width="2" stroke-dasharray="4 3"/>
  <text x="140" y="92" text-anchor="middle" fill="#0071e3" font-size="8" font-weight="600">Elastic breaks the red path</text>
</svg>

</div>

</div>

---

# iPhone launch demo · live OTel

<div class="stat-row">
  <div class="stat"><b>847K</b><span>activations / 6h</span></div>
  <div class="stat"><b>340%</b><span>provisioning spike</span></div>
  <div class="stat"><b>~2.3h</b><span>ML taper forecast</span></div>
  <div class="stat"><b>$142M</b><span>gross-add revenue 24h</span></div>
</div>

<p class="callout"><strong>Walk:</strong> Telemetry → launch ML forecast → region hotspots · Networks → fault inject &amp; incident flow</p>

<p class="muted">Live Serverless OTel on Telemetry &amp; Networks tabs · telco-demo-sage.vercel.app</p>

---

<!-- _class: lead -->

# Launch with confidence

## Predict the curve · cut toil · keep subscribers happy

**Slides:** telco-demo-sage.vercel.app/slides/  
**Demo:** telco-demo-sage.vercel.app → **Telemetry**
