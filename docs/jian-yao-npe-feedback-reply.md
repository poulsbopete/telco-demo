# Reply draft — Jian Yao (Erickson) NPE feedback

Thanks Jian — this is exactly the right framing. Short answers to the three points:

## 1. Runtime fields + Discover drill-down

Agree that datafeed `runtime_mappings` are appropriate for Wholesale-only extraction (<10% of events; 15m bucket span is fine). The Discover “field not found” error happens because those scripts live on the **datafeed only** — Anomaly Explorer’s drill-down opens a **data view** that does not define them.

**Fix (no Logstash):** mirror the same Painless scripts onto the Kibana data view used by the job’s Discover custom URL (or put them on the index runtime mapping / a Wholesale-filtered transform if many jobs share them). Custom URLs should target that data view and only pass detector/influencer entities (`feature`, `speed`, `partnerID`, …).

## 2. Single-pane UX

We can consolidate heatmap (swim lane), single-metric, filters/controls, and alert management onto one Kibana dashboard, with custom URLs / alert deep-links pointing back to that board instead of only Anomaly Explorer. Once runtime fields are on the data view, dashboard controls can filter them directly.

## 3. Silent failure / pattern change (feature 2412001)

Your `thr128kbps` → `thr16kbps` example on a SUCCESS transaction is a strong ML use case:

| Approach | What it catches |
|----------|-----------------|
| `rare` by `speed`, partition `feature` | Unexpected speed for a long-stable feature |
| `high_count` on known deviations | Spike when we have a feature→expected-speed map |
| AIOps / ES\|QL `CHANGE_POINT` | When the % of `thr16kbps` stepped |
| Categorization on payload fragments | Broader unknown pattern families |

We have a pilot job shape and synthetic SUCCESS payloads with this exact drift ready to walk through on the demo cluster. After reviewing `monitor_wholesale_rateplan_highcount_v2` + `example4test.xlsx`: your live job already proves runtime extraction at scale (~32M records); the gap is content fields (`feature` / `tierName` / `speed`) and data-view mirroring for Discover. Note: in the 1k sample, 2412001 is multi-modal (`thr256kbps`, `capped`, `notifyonly`, …) — partition by feature+tier (and/or partner) or use a golden expected-speed map for the contracts you care about.

Happy to schedule a working session to (a) mirror one Wholesale runtime field set onto the Discover data view, and (b) stand up the rare(speed)|partition(feature) pilot against a sample of production-shaped SUCCESS events.
