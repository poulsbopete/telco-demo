# Telco NOC × Elastic Serverless Demo

Interactive telco network operations demo showcasing Elastic Stack across **Network Telemetry**, **Enterprise Search**, **Observability**, and **Security Analytics**.

The **Network Telemetry** tab connects to **Elastic Cloud Serverless** (`otel-demo-a5630c`) and queries real OpenTelemetry data via ES|QL. Other tabs use simulated telco narrative data. Observability and Adaptive Networks deep links target **otel-demo** Kibana; **Enterprise Search** links target `ai-assistants-ffcafb`; **Elastic Security** links target `my-security-project-b0679b`.

## Deploy to Vercel

### 1. Create a read-only API key

In [Elastic Cloud](https://cloud.elastic.co) → **otel-demo** project → **Management** → **API keys**:

- Scope to read `logs-*`, `metrics-*`, `traces-*`
- Restrict to `_query` and cluster info where supported

### 2. Configure environment variables

In Vercel → Project → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `ES_URL` | `https://otel-demo-a5630c.es.us-east-1.aws.elastic.cloud` |
| `ES_API_KEY` | Your base64 API key (`id:secret`) |
| `KIBANA_URL` | `https://otel-demo-a5630c.kb.us-east-1.aws.elastic.cloud` |
| `VITE_KIBANA_URL` | otel-demo Kibana (Discover, Workflows — observability & adaptive networks) |
| `VITE_SEARCH_KIBANA_URL` | `https://ai-assistants-ffcafb.kb.us-east-1.aws.elastic.cloud` (Search, Agent Builder) |
| `VITE_SECURITY_KIBANA_URL` | `https://my-security-project-b0679b.kb.us-central1.gcp.elastic.cloud` (SIEM, Cases, Rules) |
| `OTLP_ENDPOINT` | `https://otel-demo-a5630c.ingest.us-east-1.aws.elastic.cloud` (Adaptive Networks inject) |

Copy from `.env.example` — **never commit real keys**.

### Adaptive Networks bootstrap

The **Adaptive Networks** tab requires the incident workflow and alert rules deployed to otel-demo. Run once from the [adaptive-networks](https://github.com/poulsbopete/adaptive-networks) repo:

```bash
cd /path/to/adaptive-networks && ./scripts/deploy.sh
```

Then optionally set `INCIDENT_WORKFLOW_ID` in Vercel if auto-discovery fails.

### 3. Deploy

```bash
npm i -g vercel   # if needed
vercel login
vercel --prod
```

Or connect `git@github.com:poulsbopete/telco-demo.git` in the Vercel dashboard.

### Architecture

```
Browser  →  Vercel CDN (static React app)
         →  /api/* serverless functions  →  Elastic Serverless ES|QL (_query)
         →  Kibana deep links (VITE_KIBANA_URL — o11y; VITE_SEARCH_KIBANA_URL — search; VITE_SECURITY_KIBANA_URL — security)
```

## Local development

```bash
cp .env.example .env.local
# Edit .env.local with ES_URL and ES_API_KEY

npm install
npm run dev        # Vite (5173) + local API (3001)
```

Open http://localhost:5173 → **Network Telemetry** tab.

## Kibana dashboards (Telco NOC)

Vega + ES|QL dashboards are deployed with `scripts/deploy-telco-dashboards.mjs` (uses the Kibana import API — Serverless-compatible).

| Project | Dashboard | URL |
|---------|-----------|-----|
| **otel-demo** (Observability) | Telco NOC — Network Telemetry | https://otel-demo-a5630c.kb.us-east-1.aws.elastic.cloud/app/dashboards#/view/telco-demo-network-telemetry |
| **ai-assistants** (Search) | Telco NOC — Enterprise Search | https://ai-assistants-ffcafb.kb.us-east-1.aws.elastic.cloud/app/dashboards#/view/telco-demo-enterprise-search |
| **my-security-project** (Security) | Telco NOC — Elastic Security | https://my-security-project-b0679b.kb.us-central1.gcp.elastic.cloud/app/dashboards#/view/telco-demo-elastic-security |

Redeploy after changing panels:

```bash
npm run deploy:dashboard:observability   # uses .env.local (otel-demo)
npm run deploy:dashboard:search        # uses telco-agent/.env (ai-assistants)
npm run deploy:dashboard:security      # requires SECURITY_KIBANA_API_KEY in .env.local
```

For Security, create an API key in **my-security-project** Kibana → Stack Management → API keys, then add to `.env.local`:

```bash
SECURITY_KIBANA_API_KEY=<your-security-api-key>
```

The demo UI links to these dashboards from each tab header (**Dashboard** button).

## API routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/health` | GET | Cluster connectivity check |
| `/api/demo/telco-overview` | GET | Live telco dashboard (network core, regions, anomalies) |
| `/api/demo/region?regionId=` | GET | Region drill-down |
| `/api/demo/logs` | GET | Log search (`?q=&service=&level=&regionId=`) |
| `/api/demo/workflow` | GET/POST | Workflow template + trigger Kibana run |
| `/api/adaptive-networks/inject` | POST | Inject network fault via OTLP |
| `/api/adaptive-networks/executions` | GET | Poll Kibana workflow executions |
| `/api/adaptive-networks/resume` | POST | HITL approve/reject remediation |
| `/api/esql` | POST | Read-only ES|QL proxy `{ "query": "FROM ..." }` |

## Demo modules

| Tab | Data source |
|-----|-------------|
| **Network Telemetry** | Real Elastic Serverless OTel logs |
| **Adaptive Networks** | Live OTLP fault inject + Kibana workflow polling + HITL |
| Enterprise Search | Simulated ELSER + rules engine |
| Observability | Simulated telco-scale metrics/traces |
| Elastic Security | Simulated SIEM alerts + workflows |

## Deep links

Widgets link to the matching Serverless Kibana project:

- **Discover / Workflows** — otel-demo observability cluster
- **Dashboard** — Telco NOC Vega dashboards (per tab)
- **Security** — Alerts, cases, rules on my-security-project
- **Search** — Agent Builder and telco-tmobile-kb on ai-assistants

## Tech stack

- React 19 + Vite + Tailwind CSS 4
- Vercel serverless functions (API proxy)
- Elastic ES|QL (`POST /_query`)
- Recharts + Lucide icons
