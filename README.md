# Telco NOC × Elastic Serverless Demo

Interactive telco network operations demo showcasing Elastic Stack across **Network Telemetry**, **Enterprise Search**, **Observability**, and **Security Analytics**.

The **Network Telemetry** tab connects to **Elastic Cloud Serverless** (`otel-demo-a5630c`) and queries real OpenTelemetry data via ES|QL. Other tabs use simulated telco narrative data. Every widget includes deep links to Kibana Discover, Security, or Workflows.

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
| `VITE_KIBANA_URL` | Same Kibana URL (for "Open in Kibana" deep links) |

Copy from `.env.example` — **never commit real keys**.

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
         →  Kibana deep links (VITE_KIBANA_URL — no secrets in browser)
```

## Local development

```bash
cp .env.example .env.local
# Edit .env.local with ES_URL and ES_API_KEY

npm install
npm run dev        # Vite (5173) + local API (3001)
```

Open http://localhost:5173 → **Network Telemetry** tab.

## API routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/health` | GET | Cluster connectivity check |
| `/api/demo/telco-overview` | GET | Live telco dashboard (network core, regions, anomalies) |
| `/api/demo/region?regionId=` | GET | Region drill-down |
| `/api/demo/logs` | GET | Log search (`?q=&service=&level=&regionId=`) |
| `/api/demo/workflow` | GET/POST | Workflow template + trigger Kibana run |
| `/api/esql` | POST | Read-only ES|QL proxy `{ "query": "FROM ..." }` |

## Demo modules

| Tab | Data source |
|-----|-------------|
| **Network Telemetry** | Real Elastic Serverless OTel logs |
| Enterprise Search | Simulated ELSER + rules engine |
| Observability | Simulated telco-scale metrics/traces |
| Elastic Security | Simulated SIEM alerts + workflows |

## Deep links

All widgets link to Kibana Serverless:

- **Discover** — ES|QL queries scoped to network core services
- **Security** — Alerts, cases, rules, entity analytics
- **Workflows** — 5G core latency auto-remediation

## Tech stack

- React 19 + Vite + Tailwind CSS 4
- Vercel serverless functions (API proxy)
- Elastic ES|QL (`POST /_query`)
- Recharts + Lucide icons
