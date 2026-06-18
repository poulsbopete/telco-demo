/**
 * Local dev API server — mirrors Vercel /api routes.
 * Run alongside Vite: npm run dev
 */
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import health from '../api/health.js';
import overview from '../api/demo/overview.js';
import telcoOverview from '../api/demo/telco-overview.js';
import logs from '../api/demo/logs.js';
import region from '../api/demo/region.js';
import datadogA2a from '../api/demo/datadog-a2a.js';
import elasticSecurityA2a from '../api/demo/elastic-security-a2a.js';
import elasticSearchA2a from '../api/demo/elastic-search-a2a.js';
import a2aFederation from '../api/demo/a2a-federation.js';
import workflow from '../api/demo/workflow.js';
import esql from '../api/esql.js';
import anConfig from '../api/adaptive-networks/config.js';
import anChannels from '../api/adaptive-networks/channels.js';
import anInject from '../api/adaptive-networks/inject.js';
import anExecutions from '../api/adaptive-networks/executions.js';
import anResume from '../api/adaptive-networks/resume.js';

config({ path: '.env.local' });
config({ path: '.env' });

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());

function mount(path, handler) {
  app.all(path, (req, res) => handler(req, res));
}

mount('/api/health', health);
mount('/api/demo/overview', overview);
mount('/api/demo/telco-overview', telcoOverview);
mount('/api/demo/region', region);
mount('/api/demo/datadog-a2a', datadogA2a);
mount('/api/demo/elastic-security-a2a', elasticSecurityA2a);
mount('/api/demo/elastic-search-a2a', elasticSearchA2a);
mount('/api/demo/a2a-federation', a2aFederation);
mount('/api/demo/logs', logs);
mount('/api/demo/workflow', workflow);
mount('/api/esql', esql);
mount('/api/adaptive-networks/config', anConfig);
mount('/api/adaptive-networks/channels', anChannels);
mount('/api/adaptive-networks/inject', anInject);
mount('/api/adaptive-networks/executions', anExecutions);
mount('/api/adaptive-networks/resume', anResume);

app.listen(PORT, () => {
  console.log(`[dev-api] http://localhost:${PORT}/api/health`);
});
