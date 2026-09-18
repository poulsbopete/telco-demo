# Email draft — reply to Jian Yao (Erickson)

**To:** Jian Yao  
**Subject:** Re: Wholesale ML — runtime fields, dashboard UX, silent failure / pattern change

---

Hi Jian,

Thank you for the clear write-up and for sharing `monitor_wholesale_rateplan_highcount_v2` plus `example4test.xlsx`. We reviewed both against the three points from the sync. Below is how we see Elastic supporting each item, and a concrete path we can pilot together.

### 1) Runtime fields in anomaly detection + Discover drill-down

We agree with your approach. Datafeed `runtime_mappings` are the right place for Wholesale-only extraction (your job already filters to `brand=WHOLESALE`, `operation=FTC`, `logtype=northbound` and pulls `rateplan` / `partnerId` from `fullrequest`, and `apic` from `messageid`). The live job shows this scales well (~32M processed records, healthy model memory).

The Discover “runtime field not found” issue is expected with the current setup: those scripts exist on the **datafeed only**. Anomaly Explorer drill-down opens a **Kibana data view** that does not define the same fields.

**Recommended fix (no Logstash / no pipeline package):**

1. Mirror the same Painless scripts for `rateplan`, `partnerId`, and `apic` on the data view used by Discover (or as index runtime fields if many jobs share them).
2. Point the job’s Discover custom URL at that data view, passing only detector/influencer entities (`$partnerId$`, `$rateplan$`, `$apic$`, `$earliest$`, `$latest$`).

That keeps Wholesale-specific logic out of ingest while making drill-down and dashboard filters work.

### 2) Consolidate heatmap / single metric / filters / alerts

Anomaly Explorer and Single Metric Viewer remain useful for deep analysis, but operators should work from one board.

We recommend a single Kibana dashboard that includes:

- Anomaly swim lane for `monitor_wholesale_rateplan_highcount_v2` (and any new silent-pattern job)
- Single-metric / expected-vs-actual view
- Controls for `partnerId`, `rateplan`, `apic` (and later `feature` / `speed`)
- Alert summary / management for the ML rules
- A Discover panel or custom URL into the same data view (with mirrored runtime fields)

ML alert and Anomaly Explorer custom URLs should deep-link **back to this dashboard** (time + entity), not only to Anomaly Explorer.

### 3) Silent failure / data pattern change detection

Your example is the high-value case: transaction **SUCCESS**, but payload content drifts (e.g. feature `2412001` expected `thr128kbps`, observed `thr16kbps`) so subscribers feel degradation while status monitoring stays green.

**What the current job covers today:** volume / rate anomalies for FTC rateplan activity (`high_count` by partner / APIC / rateplan). That is valuable and should stay.

**What it does not cover yet:** content fields inside feature JSON (`feature`, `tierName`, `speed`). Those appear in `example4test.xlsx` under `featureadd` / `featureupdate`, but are not extracted by the live job.

**How Elastic ML / AIOps can detect this (additive job, not a replacement):**

| Approach | Use when |
|----------|----------|
| `rare` by `speed`, partition by `feature` (+ `tierName` / `partnerId`) | Unusual speed appears for a feature/tier that has a stable history |
| `high_count` on `silent_pattern_deviation=true` | You have (or can build) an expected feature→tier→speed map for priority contracts |
| AIOps / ES\|QL `CHANGE_POINT` on % of a given speed | Confirm *when* the pattern stepped |
| Categorization on selected payload fragments | Broader unknown pattern families |

One nuance from `example4test.xlsx`: for feature `2412001` alone, speeds in the sample are multi-modal (`thr256kbps`, `capped`, `notifyonly`, `thr128kbps`, …). So “always thr128kbps” is likely true for a **specific partner / plan / tier contract**, not globally. For the pilot we should either:

- partition on `feature` + `tierName` (and optionally `partnerId`), or  
- start from a small golden map of expected speeds for the contracts you care about most.

### Proposed next steps

1. **This week (Point 1):** Mirror `rateplan` / `partnerId` / `apic` onto the Discover data view used by the existing job’s custom URL; validate Anomaly Explorer → Discover no longer errors.
2. **Follow-on (Point 2):** Build one Wholesale NOC dashboard (swim lane + controls + alerts + Discover) wired to that data view.
3. **Pilot (Point 3):** Add runtime extraction for `feature` / `tierName` / `speed` from feature JSON; stand up a silent-pattern job (`rare` / deviation `high_count`, 15m or 1h); optionally validate change-point on % deviant SUCCESS events for `2412001`.

Happy to run a working session with you (and NOC stakeholders if useful) to implement (1) on the live job first, then scope the silent-pattern pilot against a short list of features/contracts.

Thanks again for the excellent examples — they make the path very concrete.

Best regards,  
Pete

---

*Internal refs (not for email): `docs/erickson-wholesale/README.md`, demo NOC board on otel-demo, `scripts/npe-ml-silent-pattern-job.example.json`*
