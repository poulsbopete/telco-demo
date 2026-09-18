# Erickson artifacts: wholesale rateplan job + example4test.xlsx

Source files from Jian Yao (Erickson):

- `monitor_wholesale_rateplan_highcount_v2.job.json` (copied here)
- `~/Downloads/example4test.xlsx` (1,000 sample rows; not committed — 762KB)

## What the live job does today

| Setting | Value |
|---------|--------|
| Job | `monitor_wholesale_rateplan_highcount_v2` |
| Index | `npe_proclog_idx` |
| Filter | `brand=WHOLESALE`, `operation=FTC`, `logtype=northbound` |
| Bucket span | **1h** (not 15m) |
| Detectors | 4× `high_count` — by partnerId / apic / rateplan×partnerId / rateplan×apic |
| Influencers | `partnerId`, `rateplan`, `apic` |
| Scale | ~31.8M processed records, model ~10MB / 128MB limit, state **opened** |

### Runtime fields (Wholesale-only extraction)

All three are parsed from `_source` in the datafeed only:

1. **`rateplan`** — substring after `"paramName" : "RATEPLAN"` → `paramValue` in `fullrequest`
2. **`partnerId`** — same pattern for `"partnerId"`
3. **`apic`** — `messageid.splitOnToken('-')[2]` (e.g. `WHOLESALE-PRODPL-UMSD-…` → `UMSD`)

This matches Jian’s Point 1 rationale perfectly: segment-specific, &lt;10% of traffic after filters, no Logstash. It also explains Discover drill-down breakage — these fields are **not** on the data view / mapping.

## What example4test.xlsx is

Sheet `examples4test`: **1,000** rows that look like a Discover export **after** the same extractionsions, plus richer feature columns Erickson already materializes offline for analysis:

| Column | Role vs job |
|--------|-------------|
| `fullrequest` | Source payload for runtime scripts |
| `Rateplan`, `partnerId`, `apic` | Same entities the job models (verified: RATEPLAN extract matches sheet 0 mismatches) |
| `operation` | FTC 700 / ACT 230 / ICH 70 — job filters to **FTC only** |
| `featureadd` / `featureupdate` / … | Nested feature JSON (where silent-pattern fields live) |
| `messageid` | Source for `apic` |

Top partners in sample: `117` (437), `20428`, `10034`, `144`. Top APICs: `UMSD` (676), `ACT`, `CHS`.

### Feature 2412001 in the sample (silent-failure signal)

34 rows mention `2412001`. Real tier/speed combinations appear in feature JSON, e.g.:

```json
{
  "feature": "2412001",
  "bucketSize": "15360",
  "tiers": [
    { "tierName": "tier3", "threshold": "12288", "behaviour": "throttle", "speed": "notifyonly" },
    { "tierName": "tier4", "threshold": "15360", "behaviour": "throttle", "speed": "thr128kbps" }
  ]
}
```

Also observed for 2412001: `speed=capped` on `tier4`. So the spreadsheet **validates** Jian’s Point 3 shape — content lives under feature arrays, not error codes — and shows more than one “normal” speed (`thr128kbps`, `capped`, `notifyonly`) depending on tier.

## Gap analysis

| Need | Covered by current job? |
|------|-------------------------|
| Spike in FTC rateplan changes per partner / APIC | **Yes** — `high_count` |
| Unusual rateplan mix for a partner | **Partially** — by `rateplan` partition |
| Discover filter/drill on `rateplan` / `partnerId` / `apic` | **No** — runtime only on datafeed |
| Single dashboard (heatmap + metric + filters + alerts) | **No** — Anomaly Explorer / SMV today |
| Silent pattern: feature 2412001 tier/speed drift on SUCCESS | **No** — job never extracts `feature` / `tierName` / `speed` |

### Important nuance from the sample

For feature `2412001`, speeds in this 1k-row extract are **not** a single constant:

| speed | count (near 2412001) |
|-------|----------------------|
| thr256kbps | 20 |
| capped | 19 |
| notifyonly | 11 |
| thr512kbps | 5 |
| thr128kbps | 2 |
| Default | 2 |

So Jian’s “always thr128kbps” story may be true for a specific partner/plan/tier contract, but globally `rare(speed)|partition(feature)` alone will learn multi-modal normals. Prefer **partition on `feature` + `tierName` (and/or partnerId)**, or a deterministic `expected_speed` lookup for the contracts they care about, then `high_count` on deviations.

## Recommended next jobs (additive, not replace)

Keep `monitor_wholesale_rateplan_highcount_v2` for volume.

Add a **content / silent-pattern** job (15m or 1h) with new runtime fields over `featureadd` / `featureupdate` / `fullrequest` JSON:

- `feature`, `tierName`, `speed` (and optionally `feature|tier|speed` composite)
- Detectors: `rare` by `speed` partition `feature` (and/or `high_count` where speed ≠ expected for feature+tier)
- Influencers: `partnerId`, `rateplan`, `apic` (reuse existing scripts)
- **Mirror all runtime fields on the Kibana data view** used by custom URLs → fixes Point 1 drill-down
- Embed swim lane + controls on one NOC dashboard → Point 2

## Demo alignment

Synthetic `npe-synthetic-*` already has `feature` / `speed` / `silent_pattern_deviation`. Next refinement: use Erickson speed vocabulary (`thr128kbps`, `thr16kbps`, `capped`, `notifyonly`) and FTC+WHOLESALE-shaped `fullrequest` param blocks so the pilot job JSON matches production scripts.
