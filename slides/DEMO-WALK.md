# iPhone 18 Launch Demo — Presenter Walk (~12 min)

**App:** https://telco-demo-sage.vercel.app  
**Slides:** https://telco-demo-sage.vercel.app/slides/  
**Landscape reference:** [2026 telco landscape](/presenter/view.html?doc=landscape)  
**Primary tab:** Telemetry

**Tone (Garrett):** Keep urgency and proof — lead with empathy. Frame gaps as industry-wide and solvable together, not as failures in the room. We're building partnerships, not winning arguments.

## Slide deck (10 slides)

| # | Slide | Role |
|---|-------|------|
| 1 | When the launch picture doesn't connect | Open · set stakes |
| 2 | The launch shift | Problem · 3 structural gaps |
| 3 | iPhone 18 at stake | Metrics · anchor line |
| 4 | 2026 telco reality | D2D/Starlink · boardroom · bridge to demo |
| 5 | Why Elastic | Unify · Open · Predict · Act |
| 6 | Data ingestion | Schemaless ingest · logs · metrics · traces · paths in |
| 7 | Fragmented → connected | MTTR · sprawl costs · 4,200 → 12 |
| 8 | Live demo | 7-step walk · switch to app here |
| 9 | Agentic observability | 4-step ladder · what's next after unify |
| 10 | Close | Unify · Open · Predict · Act · analyst recognition · together |

*Removed from slides (detail lives in this script + TELCO-LANDSCAPE-2026-REFERENCE.md): agenda, five dimensions, Observability Labs stats grid, partner playbook table, Search AI speed, personas, three questions, separate story-arc slide.*

## Narrative spine (say this once, repeat at close)

> "Connectivity is commoditizing — tri-carrier D2D vs Starlink, Apple, eSIM. **2026 boardrooms** care about EBITDA, OpEx reset, and M&A integration — not another point tool. But **iPhone 18 launch weekend** is when subscribers decide if you're still *their* carrier. You already sold the upgrade. **Connected observability** helps you deliver on that promise."

---

## What we borrowed from Session 2 · Observability

| Session 2 component | Where it lives now |
|---------------------|-------------------|
| Opening · visibility gap on launch | Slide 1 |
| THE STARTING POINT · visibility gap | Folded into slide 2 subhead |
| THE STRUCTURAL SHIFT | Slide 2 · three launch shifts |
| Five telecom dimensions | DEMO-WALK talk track · landscape reference |
| Observability Labs research (96/97/71/80) | Slide 3 one-liner · full stats in reference doc |
| MTTR symptom · 20 min → seconds | Slide 7 |
| Three questions | Ask verbally before demo · not on slides |
| Telefónica proof | Slide 7 |
| Agentic observability ladder | Slide 9 · *Engineering the Future of Agentic Observability* deck |

**2026 Telco Landscape:** slide 4 (strategic + boardroom merged). Partner playbook · Search AI · personas → reference doc + Acts below.

---

## Before you start

- Confirm Telemetry tab loads and shows **iPhone 18 Pro Launch** strip.
- Optional: Observability / Security Kibana deep links configured in `.env.local`.
- Keep slides on **Live demo** (slide 8) visible on second screen during the app walk.
- Skim **[2026 telco landscape](/presenter/view.html?doc=landscape)** — pick one carrier hook (Verizon OpEx, AT&T cyber-finance, T-Mobile 8M migration) for the room.

---

## Act 0 · Bridge (slides only, ~2 min)

**Slide:** 2026 telco reality (slide 4) · optional skim slide 5 (Why Elastic)

**Say — strategic context:**

- "Big Three formed a **tri-carrier D2D joint venture** — defensive play against **Starlink Mobile, 9 million subscribers**."
- "Apple and eSIM make switching easier. The long game is multi-transport."
- "Near-term battle: **subscriber execution** — activation, port, trade-in, first 48 hours."
- "Same pattern as **8 million plan migrations** at T-Mobile — if portals slip, churn follows."

**Say — boardroom (pick 2 of 4 on slide):**

- "**EBITDA ~35%**, flat ARPU, OpEx reset — boards prioritize what cuts cost or prevents penalties."
- "**Recent M&A** — Frankenstein stacks need federated visibility, not rip-and-replace."
- "**Techco pivot** — private 5G, AI transport; Elastic as co-innovation engine for their enterprise clients."
- "**CISA 72-hour**, FCC **$2,500/call** KYC, **4-year retention** — launch SLA slips hit churn *and* compliance surface."

**Say — partner playbook (30 sec, optional — not on slides):**

- "ES|QL → disclosure windows. Searchable Snapshots → retention without hot-storage blowout. OTel → terrestrial + satellite without lock-in. ML → SLA before penalties."

**Transition to demo:**

- "This demo shows Elastic connecting **live OTel** to **business impact** for iPhone 18 launch — the exec chain NOC needs in one view."

**Optional — slide 6 (Data ingestion, ~30 sec):**

- "**Schemaless ingest** — no warehouse preload. OTel from core and provisioning lands as-is; new launch-weekend fields appear without a schema project."
- "Four signal types in one tier: **logs**, **metrics** (infra + **log-derived**), **traces**, and **business KPIs** — activations, churn-risk, revenue."
- "Ingest from **OTel, agents, Kafka, cloud APIs, syslog** — same platform you'll see in the live demo and Security tab."

---

## Act 1 · Stakes (Telemetry tab, ~2 min)

### Step 1 · Launch strip

**Click:** Telemetry tab (default)

**Point to:** iPhone 18 Pro Launch banner + business metrics

**Say:**

- "Friday Sept 2026 — iPhone 18 Pro Launch weekend."
- "**847K activations in six hours**, **340% provisioning spike**, **$142M gross-add revenue** in 24 hours."
- "This isn't infrastructure trivia — it's the quarter. CFO language: gross-add ARPU at national scale."

### Step 2 · Live OTel

**Scroll to:** ingestion / live telemetry section

**Say:**

- "This is **real OpenTelemetry** from Elastic Cloud Serverless — not a mock chart."
- "Same OTel agents and collectors you'd run today — **terrestrial and D2D** on one pipeline. **We meet you where you are.**"
- "Logs, metrics, traces — one indexed stream for RAN, core, provisioning. Index once — SecOps, SRE, compliance query the same data."

---

## Act 2 · Predict (Telemetry tab, ~2 min)

### Step 3 · ML lifecycle forecast

**Point to:** Launch lifecycle chart / ML forecast windows

**Say:**

- "Static thresholds fire all weekend. ML knows **midnight wave → retail peak → Sunday taper**."
- "Forecast flags the provisioning surge **~2 hours before** threshold alerts — time to staff NYC retail and CDN edge, not the whole network."
- "For lean NOC teams post-OpEx reset — force multiplier, not headcount."

### Step 4 · Region hotspots

**Point to:** REG-8847291 (NYC retail), CDN edge, West fiber tiles

**Say:**

- "Three different failure modes — retail RAN attach, eSIM OTA, midnight West-coast wave."
- "One launch event. Region context on every signal."
- "Post-M&A: same pattern across acquired footprints — federated visibility, one launch playbook."

---

## Act 3 · Business impact (Telemetry tab, ~2 min)

### Step 5 · Business KPI tiles

**Point to:** Churn-risk subs · care load next 4h · revenue next 4h

**Say:**

- "**84K subscribers** flagged churn-risk if activation SLA slips — that's the exec number."
- "Care load **18.4K contacts/hour** when queues back up — fix provisioning, cut repeat calls."
- "**Revenue next 4 hours** tied to the same launch curve NOC sees."
- "When Starlink and Apple are in the room: **execution at go-live is relationship defense** — and it protects EBITDA when care cost spikes."

---

## Act 4 · Act (Networks tab, ~3 min)

### Step 6 · Fault inject + incident flow

**Click:** Networks tab

**Say:**

- "iPhone 18 load on transport — inject a fault on launch-scale traffic."
- Watch ML correlate telemetry → workflow / RCA path.
- "4,200 raw alerts → **12** you'd actually act on. Less toil, faster MTTR — critical when NOC headcount is down 15%."

---

## Act 5 · Security (optional, ~30 sec)

### Step 7 · Launch SIM swap

**Click:** Security tab (if time)

**Say:**

- "Launch weekend fraud spikes too — SIM swap surge during high activation volume."
- "Elastic Security on the **same platform** — KYC audit trail, 10DLC campaign context, fraud correlation."
- "Primary for fraud, enabling as you mature — one data foundation."

---

## Close (~1 min)

**Optional bridge (slide 9, ~30 sec)** — after demo, before close:

- "What you just saw is **connected telemetry** — unify, predict, act on launch weekend."
- "The next evolution is **agentic intelligence**: AI that investigates in plain language and recommends fixes with guardrails — not more dashboards."
- "Metric surges can be security signals too — one context for SRE and SOC during peak activation."
- "Pilot one hotspot region now; expand to agentic remediation as your team is ready."

**Return to slides:** Your Elastic era starts now (slide 10)

**Say:**

- "Commoditization and D2D are the long game. **Launch execution is where you earn trust today.**"
- "Elastic: **Unify · Open · Predict · Act** — and a path to **agentic** remediation on the OTel you already have."
- "**Analyst-validated platform:** Gartner **Leader** in Observability; Gartner **Visionary** in SIEM; Forrester **Leader** in Security Analytics; IDC **Leader** in XDR — one Search AI foundation for launch weekend and beyond."
- "**Engineering telecom resilience together** — pilot one hotspot region before Sept 2026. Quantify churn-risk and alert reduction — then expand across the data ecosystem."

---

## Slide ↔ demo alignment checklist

| Slide | Demo proof |
|-------|------------|
| Launch shift (slide 2) | Step 3 — digital workflows, not RAN-only |
| iPhone 18 at stake (slide 3) | Step 1 — launch strip metrics |
| 2026 telco reality (slide 4) | Step 5 — exec KPIs + bridge talk track |
| Why Elastic (slide 5) | Steps 2–6 · Unify/Open/Predict/Act |
| Data ingestion (slide 6) | Step 2 OTel · log-derived metrics · Step 7 Security feeds |
| Fragmented → connected (slide 7) | Step 6 — 4,200 → 12 narrative · sprawl costs talk track |
| Agentic observability (slide 9) | Post-demo bridge · A2A / workflow / Agent Builder in app |

---

## If they push on Starlink / Apple

**Acknowledge:** "Yes — the connectivity layer is under pressure. Starlink has 9M+ subs; Big Three responded with a D2D JV."

**Pivot:** "That's exactly why **launch weekend execution** matters more, not less. When switching gets easier, a rough activation makes leaving easier too. Elastic gives you one view from eSIM OTA to **84K churn-risk** — so your team can respond before frustration shows up in care queues and social feeds."

**Do not:** Claim Elastic solves disintermediation. Claim it helps **protect the subscriber relationship at the highest-stakes moment** and **supports EBITDA goals** via consolidation and storage efficiency.

---

## CFO / CISO quick hooks (by carrier)

| Carrier | Lead with |
|---------|-----------|
| **Verizon** | $5B OpEx mandate · integration synergies · tool consolidation · Searchable Snapshots for absorbed data |
| **AT&T** | Biry cyber-finance lens · acquisition cross-cluster search · $250B buildout telemetry surge · Dynamic Defense |
| **T-Mobile** | 8M plan migration churn parallel · Mint/Ultra integration · T-Satellite + D2D — one OTel layer, negligible satellite OpEx |
