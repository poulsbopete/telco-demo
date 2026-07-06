# iPhone 18 Launch Demo — Presenter Walk (~12 min)

**App:** https://telco-demo-sage.vercel.app  
**Slides:** https://telco-demo-sage.vercel.app/slides/  
**Landscape reference:** [TELCO-LANDSCAPE-2026-REFERENCE.md](./TELCO-LANDSCAPE-2026-REFERENCE.md)  
**Primary tab:** Network Telemetry

## Narrative spine (say this once, repeat at close)

> "Connectivity is commoditizing — tri-carrier D2D vs Starlink, Apple, eSIM. **2026 boardrooms** care about EBITDA, OpEx reset, and M&A integration — not another point tool. But **iPhone 18 launch weekend** is when subscribers decide if you're still *their* carrier. You already sold the upgrade. Observability decides if you keep them."

---

## What we borrowed from Session 2 · Observability

| Session 2 component | Our adaptation |
|---------------------|----------------|
| Opening · "network cannot see itself" | Lead slide |
| THE STARTING POINT · visibility gap | Dark slide after Agenda |
| THE STRUCTURAL SHIFT | THE LAUNCH SHIFT (iPhone 18) |
| Five telecom dimensions | Customer impact window → iPhone 18 |
| Observability Labs research (96/97/71/80) | Launch challenge slide |
| MTTR symptom · 20 min → seconds | Fragmented vs connected slide |
| Three questions | Pre-demo slide |
| Telefónica proof | Before/after + personas |

**Added from 2026 Telco Landscape:** THE STRATEGIC CONTEXT (D2D JV, Starlink 9M+), 2026 BOARDROOM (four realities), Partner playbook slide.

**Skipped (avoid bloat):** full 3-session arc, Gartner/Forrester, Search AI Session 3 preview — unless you're presenting the full series.

---

## Before you start

- Confirm Telemetry tab loads and shows **iPhone 18 Pro Launch** strip.
- Optional: Observability / Security Kibana deep links configured in `.env.local`.
- Keep slides on **Demo story arc** or **Live demo walk** slide visible on second screen.
- Skim **TELCO-LANDSCAPE-2026-REFERENCE.md** — pick one carrier hook (Verizon OpEx, AT&T Lumen, T-Mobile 8M migration) for the room.

---

## Act 0 · Bridge (slides only, ~2 min)

**Slides:** THE STRATEGIC CONTEXT → 2026 BOARDROOM → (optional) Partner playbook

**Say — strategic context:**

- "Big Three formed a **tri-carrier D2D joint venture** — defensive play against **Starlink Mobile, 9 million subscribers**."
- "Apple and eSIM make switching easier. The long game is multi-transport."
- "Near-term battle: **subscriber execution** — activation, port, trade-in, first 48 hours."
- "Same pattern as **8 million plan migrations** at T-Mobile — if portals slip, churn follows."

**Say — boardroom (pick 2 of 4):**

- "**EBITDA ~35%**, flat ARPU, OpEx reset — projects that don't cut cost or prevent penalties get delayed."
- "**Frontier $20B**, **Lumen $5.75B** — Frankenstein stacks need federated visibility, not rip-and-replace."
- "**Techco pivot** — private 5G, AI transport; Elastic as co-innovation engine for their enterprise clients."
- "**CISA 72-hour**, FCC **$2,500/call** KYC, **4-year retention** — launch SLA slips hit churn *and* compliance surface."

**Say — partner playbook (30 sec, optional):**

- "ES|QL → disclosure windows. Searchable Snapshots → retention without hot-storage blowout. OTel → terrestrial + satellite without lock-in. ML → SLA before penalties."

**Transition to demo:**

- "This demo shows Elastic connecting **live OTel** to **business impact** for iPhone 18 launch — the exec chain NOC needs in one view."

---

## Act 1 · Stakes (Telemetry tab, ~2 min)

### Step 1 · Launch strip

**Click:** Network Telemetry tab (default)

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
- "Post-M&A: same pattern across acquired Frontier/Lumen footprints — federated visibility, one launch playbook."

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

**Click:** Adaptive Networks (or Networks) tab

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

**Return to slides:** Your Elastic era starts now

**Say:**

- "Commoditization and D2D are the long game. **Launch execution is how you win today.**"
- "Elastic: **Unify · Open · Predict · Act** — vendor consolidation on the OTel you already have."
- "Pilot one hotspot region before Sept 2026. Quantify churn-risk and alert reduction — then expand across the data ecosystem."

---

## Slide ↔ demo alignment checklist

| Slide | Demo proof |
|-------|------------|
| THE LAUNCH SHIFT | Step 3 — digital workflows, not RAN-only |
| THE STRATEGIC CONTEXT | Step 5 — exec KPIs + D2D/Starlink bridge |
| 2026 BOARDROOM | Act 0 talk track; Steps 2–5 — OpEx, M&A, compliance |
| Partner playbook | Step 2 — OTel once; Step 7 — Security; Step 5 — ML/SLA |
| Why Elastic (Unify/Open/Predict/Act) | Steps 2–6 |
| Data ecosystem | Step 2 — OTel ingest; Step 7 — Security enabling |
| Before / after | Step 6 — 4,200 → 12 funnel |
| Personas | Steps 4–5 — NOC regions + exec tiles |

---

## If they push on Starlink / Apple

**Acknowledge:** "Yes — the connectivity layer is under pressure. Starlink has 9M+ subs; Big Three responded with a D2D JV."

**Pivot:** "That's exactly why **launch weekend execution** matters more, not less. When switching gets easier, a bad activation pushes them out the door faster. Elastic gives you one view from eSIM OTA to **84K churn-risk** before the social posts start."

**Do not:** Claim Elastic solves disintermediation. Claim it protects **subscriber relationship at the highest-stakes moment** and **defends EBITDA** via consolidation and storage efficiency.

---

## CFO / CISO quick hooks (by carrier)

| Carrier | Lead with |
|---------|-----------|
| **Verizon** | $5B OpEx mandate · Frontier $500M synergies · tool consolidation · Searchable Snapshots for absorbed data |
| **AT&T** | Biry cyber-finance lens · Lumen cross-cluster search · $250B buildout telemetry surge · Dynamic Defense |
| **T-Mobile** | 8M plan migration churn parallel · Mint/Ultra integration · T-Satellite + D2D — one OTel layer, negligible satellite OpEx |
