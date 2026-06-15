#!/usr/bin/env node
/**
 * One-time bootstrap: create Telco Checkout Latency workflow in Kibana Serverless.
 * Usage: npm run bootstrap:workflow
 * Requires KIBANA_URL + ES_API_KEY in .env.local (or env).
 */
import { config } from 'dotenv';
import { ensureTelcoCheckoutWorkflow, findTelcoCheckoutWorkflow, kibanaWorkflowAppUrl } from '../api/_lib/kibana-workflows.js';

config({ path: '.env.local' });
config({ path: '.env' });

const existing = await findTelcoCheckoutWorkflow();
if (existing?.id) {
  console.log('✅ Workflow already exists');
  console.log('   Name:', existing.name);
  console.log('   ID:', existing.id);
  console.log('   URL:', kibanaWorkflowAppUrl(process.env.KIBANA_URL, { workflowId: existing.id }));
  process.exit(0);
}

const created = await ensureTelcoCheckoutWorkflow();
if (created?.id) {
  console.log('✅ Created workflow in Kibana');
  console.log('   Name:', created.name);
  console.log('   ID:', created.id);
  console.log('   URL:', kibanaWorkflowAppUrl(process.env.KIBANA_URL, { workflowId: created.id }));
  console.log('\nOptional: set KIBANA_CORE_WORKFLOW_ID=' + created.id + ' in Vercel env');
} else {
  console.error('❌ Failed to create workflow');
  console.error('   ', created?.error || created);
  console.error('\nEnsure ES_API_KEY has workflowsManagement:create on Kibana.');
  process.exit(1);
}
