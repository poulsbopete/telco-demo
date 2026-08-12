# Telco Metrics + ML (Instruqt)

Track source for **Telco Metrics + ML on Elastic Serverless**.

| | |
|--|--|
| **Manage** | https://play.instruqt.com/manage/elastic/tracks/telco-metrics-ml-serverless |
| **Play** | https://play.instruqt.com/elastic/invite/qsme5bol62ec |
| **Push** | `./scripts/instruqt-track-push.sh` or `cd tracks/telco-metrics-ml-serverless && instruqt track push --force` |

## Challenges

1. Connect & confirm Telco NOC telemetry  
2. Explore telco metrics with ES|QL  
3. Investigate ML anomalies  
4. Close the loop with Workflows  

## After first publish

1. In Instruqt UI → track → **Invites** → create invite  
2. Set `VITE_INSTRUQT_URL=https://play.instruqt.com/elastic/invite/<id>` on Vercel (Production)  
3. Redeploy Telco NOC so the **Workshop** nav link uses the invite  

Sandbox uses `es3-api` + `scenario_id=claro` (telco NOC microservices) from `elastic-launch-demo`.
