# iPhone 18 Launch Demo — Presenter Walk (~12 min)

**App:** https://telco-demo-sage.vercel.app  
**Slides:** https://telco-demo-sage.vercel.app/slides/  
**Primary tab:** Network Telemetry

## Narrative spine (say this once, repeat at close)

> "Connectivity is commoditizing — Starlink, satellite-to-phone, Apple, eSIM. The long game is changing. But **iPhone 18 launch weekend** is when subscribers decide if you're still *their* carrier. You already sold the upgrade. Observability decides if you keep them."

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

**Skipped (avoid bloat):** full 3-session arc, Gartner/Forrester, Search AI Session 3 preview — unless you're presenting the full series.

---

- Confirm Telemetry tab loads and shows **iPhone 18 Pro Launch** strip.
- Optional: Observability / Security Kibana deep links configured in `.env.local`.
- Keep slides on **Demo story arc** or **Live demo walk** slide visible on second screen.

---

## Act 0 · Bridge (slides only, ~1 min)

**Slide:** THE STRATEGIC CONTEXT

**Say:**

- "Everyone's talking about Starlink phones, direct-to-device satellite, Apple owning the stack."
- "That raises a fair question: *where do carriers still matter?*"
- "Answer: **the moment of truth** — activation, port, trade-in, pickup, first 48 hours."
- "If that breaks, subscribers churn to a rival or disengage. If it works, you defend ARPU and the relationship."
- "This demo shows Elastic connecting **live OTel** to **business impact** for that exact moment."

---

## Act 1 · Stakes (Telemetry tab, ~2 min)

### Step 1 · Launch strip

**Click:** Network Telemetry tab (default)

**Point to:** iPhone 18 Pro Launch banner + business metrics

**Say:**

- "Friday Sept 2026 — iPhone 18 Pro Launch weekend."
- "**847K activations in six hours**, **340% provisioning spike**, **$142M gross-add revenue** in 24 hours."
- "This isn't infrastructure trivia — it's the quarter."

### Step 2 · Live OTel

**Scroll to:** ingestion / live telemetry section

**Say:**

- "This is **real OpenTelemetry** from Elastic Cloud Serverless — not a mock chart."
- "Same OTel agents and collectors you'd run today. **We meet you where you are.**"
- "Logs, metrics, traces — one pipeline for RAN, core, provisioning."

---

## Act 2 · Predict (Telemetry tab, ~2 min)

### Step 3 · ML lifecycle forecast

**Point to:** Launch lifecycle chart / ML forecast windows

**Say:**

- "Static thresholds fire all weekend. ML knows **midnight wave → retail peak → Sunday taper**."
- "Forecast flags the provisioning surge **~2 hours before** threshold alerts — time to staff NYC retail and CDN edge, not the whole network."

### Step 4 · Region hotspots

**Point to:** REG-8847291 (NYC retail), CDN edge, West fiber tiles

**Say:**

- "Three different failure modes — retail RAN attach, eSIM OTA, midnight West-coast wave."
- "One launch event. Region context on every signal."

---

## Act 3 · Business impact (Telemetry tab, ~2 min)

### Step 5 · Business KPI tiles

**Point to:** Churn-risk subs · care load next 4h · revenue next 4h

**Say:**

- "**84K subscribers** flagged churn-risk if activation SLA slips — that's the exec number."
- "Care load **18.4K contacts/hour** when queues back up — fix provisioning, cut repeat calls."
- "**Revenue next 4 hours** tied to the same launch curve NOC sees."
- "This is how you answer 'why should I care' when Starlink and Apple are in the room — **execution at go-live is relationship defense.**"

---

## Act 4 · Act (Networks tab, ~3 min)

### Step 6 · Fault inject + incident flow

**Click:** Adaptive Networks (or Networks) tab

**Say:**

- "iPhone 18 load on transport — inject a fault on launch-scale traffic."
- Watch ML correlate telemetry → workflow / RCA path.
- "4,200 raw alerts → **12** you'd actually act on. Less toil, faster MTTR."

---

## Act 5 · Security (optional, ~30 sec)

### Step 7 · Launch SIM swap

**Click:** Security tab (if time)

**Say:**

- "Launch weekend fraud spikes too — SIM swap surge during high activation volume."
- "Elastic Security on the same platform — primary for fraud, enabling as you mature."

---

## Close (~1 min)

**Return to slides:** Your Elastic era starts now

**Say:**

- "Commoditization is the long game. **Launch execution is how you win today.**"
- "Elastic: **Unify · Open · Predict · Act** — on the OTel you already have."
- "Pilot one hotspot region before Sept 2026. Expand across the data ecosystem."

---

## Slide ↔ demo alignment checklist

| Slide | Demo proof |
|-------|------------|
| THE LAUNCH SHIFT | Step 3 — digital workflows, not RAN-only |
| THE STRATEGIC CONTEXT | Step 5 — exec KPIs + bridge talk track |
| Why Elastic (Unify/Open/Predict/Act) | Steps 2–6 |
| Data ecosystem | Step 2 — OTel ingest; Step 7 — Security enabling |
| Before / after | Step 6 — 4,200 → 12 funnel |
| Personas | Steps 4–5 — NOC regions + exec tiles |

---

## If they push on Starlink / Apple

**Acknowledge:** "Yes — the connectivity layer is under pressure."

**Pivot:** "That's exactly why **launch weekend execution** matters more, not less. When switching gets easier, a bad activation pushes them out the door faster. Elastic gives you one view from eSIM OTA to churn risk before the social posts start."

**Do not:** Claim Elastic solves disintermediation. Claim it protects **subscriber relationship at the highest-stakes moment**.
