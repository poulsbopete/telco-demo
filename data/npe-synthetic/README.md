# NPE synthetic data (silent failures)

Generated from field shapes in `~/Downloads/mapping.json` (NPE proclog / transaction details).

**Not loaded to otel-demo / public demo.** Load only to your NPE serverless project.

## Files

| File | Purpose |
|------|---------|
| `npe_proclog_synthetic.ndjson` | Wire logs with NPC-style XML payloads |
| `npe_transaction_details_synthetic.ndjson` | Subsystem statuses (`napstatus`, `noncorefailed`, …) |
| `ml_anomalies_partner_synthetic.ndjson` | Partner × time `record_score` for heatmaps |
| `bulk_*.ndjson` | Ready for Elasticsearch `_bulk` |

## Silent failure definition (synthetic)

- Outer call **SUCCESS** (`status` / `transactionstatus`)
- But **NAP / non-core failed** (`napstatus=FAILED`, `noncorefailed=true`)
- Payload flags: `napAsScore=false`, `dualProvisioningFlag=OFF`

Helper fields (not in production mapping): `silent_failure`, `synthetic_scenario`, `partnerID`  
Mapped stand-ins: `clientid` / `routingid` = partner id

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
