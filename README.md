# Telco NOC × Elastic Serverless Demo

[![Public repo](https://img.shields.io/badge/GitHub-public-0071e3)](https://github.com/poulsbopete/telco-demo)

Interactive telco network operations demo showcasing Elastic Stack across **Network Telemetry**, **Enterprise Search**, **Observability**, and **Security Analytics**.

**Live demo:** https://telco-demo-sage.vercel.app  
**Launch slides:** https://telco-demo-sage.vercel.app/slides/  
**GitHub Pages (when build succeeds):** https://poulsbopete.github.io/telco-demo/  
**Slide source:** [slides/public-launch-slides.md](./slides/public-launch-slides.md) · rebuild with `npm run build:slides`

The **Network Telemetry** tab connects to **Elastic Cloud Serverless** and queries real OpenTelemetry data via ES|QL. Other tabs use simulated telco narrative data (iPhone launch, ML forecasts, executive KPIs). Observability and Adaptive Networks deep links target your **Observability** Kibana project; **Enterprise Search** and **Elastic Security** tabs link to separate Serverless projects when configured.

---

## Fork & run your own copy

The repo is public so you can fork, deploy, and point the demo at **your** Elastic Cloud projects.

### 1. Fork and clone

```bash
git clone https://github.com/YOUR_USER/telco-demo.git
cd telco-demo
npm install
```

### 2. Create Elastic credentials

In [Elastic Cloud](https://cloud.elastic.co), create at least one **Observability Serverless** project (or use an existing OTel cluster).

**Minimum for the Telemetry tab:**

1. Project → **Management** → **API keys**
2. Create a key scoped to **read** `logs-*`, `metrics-*`, `traces-*` (and `_query` / cluster info)
3. Copy the base64 `id:secret` string

**Recommended for full deep links:**

| Serverless project | Env vars | Powers |
|--------------------|----------|--------|
| Observability | `ES_URL`, `ES_API_KEY`, `KIBANA_URL`, `VITE_KIBANA_URL` | Telemetry, Networks, workflow links |
| Search | `VITE_SEARCH_KIBANA_URL` | Search tab, Agent Builder links |
| Security | `VITE_SECURITY_KIBANA_URL` | Security tab, SIEM / cases links |

Optional: `OTLP_ENDPOINT` + same API key for **Adaptive Networks** fault inject. See [adaptive-networks](https://github.com/poulsbopete/adaptive-networks) to bootstrap the incident workflow.

### 3. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local — replace YOUR-* placeholders with your endpoints and API key
```

**Never commit `.env.local` or real keys.** The tracked `.env.example` uses placeholders only.

### 4. Run locally

```bash
npm run dev        # Vite :5173 + API :3001
```

Open http://localhost:5173 → **Telemetry**. Confirm **Connected** (green) via `/api/health`.

Tabs **Search**, **Scale**, **Security**, and **Response** work without live Elastic data—they use simulated telco narrative. Deep links open your Kibana URLs when `VITE_*_KIBANA_URL` is set.

### 5. Deploy your fork (Vercel)

```bash
npm i -g vercel   # if needed
vercel login
vercel link       # link to your fork
vercel --prod
```

In Vercel → **Settings → Environment Variables**, add the same variables as `.env.local` (especially `ES_URL`, `ES_API_KEY`, `VITE_KIBANA_URL`). Redeploy after saving.

Or connect the GitHub repo in the Vercel dashboard for automatic deploys on push.

### Quick troubleshooting

| Symptom | Fix |
|---------|-----|
| Blank page after deploy | Hard refresh (`Cmd+Shift+R`) — stale JS bundle after redeploy |
| “Not connected to Elastic Serverless” | Check `ES_URL` + `ES_API_KEY` in Vercel env; hit `/api/health` |
| Adaptive Networks idle | Set `OTLP_ENDPOINT`; run adaptive-networks `deploy.sh`; optional `INCIDENT_WORKFLOW_ID` |
| Security dashboard deploy fails | Add `SECURITY_KIBANA_API_KEY` to `.env.local` (see below) |

---

## Deploy to Vercel (reference stack)

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

Copy from `.env.example` and substitute your values — **never commit real keys**.

Reference deployment (maintainer demo) uses:

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
