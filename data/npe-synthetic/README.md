# NPE synthetic data (silent failures)

Generated from field shapes in `~/Downloads/mapping.json` (NPE proclog / transaction details).

**Not loaded to otel-demo / public demo.** Load only to your NPE serverless project.

## Files

| File | Purpose |
|------|---------|
| `npe_proclog_synthetic.ndjson` | Wire logs with NPC-style XML payloads |
| `npe_transaction_details_synthetic.ndjson` | Subsystem statuses (`napstatus`, `noncorefailed`, …) |
| `ml_anomalies_partner_synthetic.ndjson` | Partner × time `record_score` for heatmaps |
| `partner_lookup.ndjson` | partnerID → name, tier, region, channel, NOC owner |
| `bulk_*.ndjson` | Ready for Elasticsearch `_bulk` |

Partner attributes are also **denormalized** onto proclog / transaction / ML docs (`partner_name`, `partner_tier`, …) so NOC panels don’t need a join at query time.

## Silent failure definition (synthetic)

Two SUCCESS-path failure modes:

1. **Subsystem silent fail** — outer call **SUCCESS** (`status` / `transactionstatus`) but **NAP / non-core failed** (`napstatus=FAILED`, `noncorefailed=true`); payload flags `napAsScore=false`, `dualProvisioningFlag=OFF`
2. **Pattern change (Jian Yao)** — end-to-end **SUCCESS**, but provisioning JSON in `fullrequest`/`fullresponse` drifts: feature `2412001` expected `speed=thr128kbps`, observed `thr16kbps` (`silent_pattern_deviation=true`)

Helper fields (not in production mapping): `silent_failure`, `synthetic_scenario`, `partnerID`, `feature`, `tierName`, `speed`, `silent_pattern_deviation`  
Mapped stand-ins: `clientid` / `routingid` = partner id

Pilot ML job shape: `scripts/npe-ml-silent-pattern-job.example.json` (`rare` by `speed`, partition `feature`, 15m bucket).

## Regenerate

```bash
python3 scripts/generate-npe-synthetic-data.py
```

## Bulk load (your cluster)

```bash
export ES_URL="https://YOUR-NPE-PROJECT.es....elastic.cloud"
export ES_API_KEY="..."

for f in bulk_npe_proclog bulk_npe_transaction_details bulk_ml_anomalies_partner; do
  curl -s -H "Authorization: ApiKey $ES_API_KEY" \
    -H "Content-Type: application/x-ndjson" \
    --data-binary @"data/npe-synthetic/${f}.ndjson" \
    "$ES_URL/_bulk?pretty" | head
done
```

Then create data views on:

- `npe-synthetic-proclog`
- `npe-synthetic-transaction-details`
- `npe-synthetic-ml-anomalies`
