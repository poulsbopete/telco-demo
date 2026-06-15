import { runEsql, rowsToObjects, assertReadOnlyQuery, getElasticConfig } from './_lib/elastic.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const config = getElasticConfig();
  if (!config.ok) {
    return res.status(503).json({ ok: false, error: config.error });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const query = body?.query;
  if (!query) {
    return res.status(400).json({ ok: false, error: 'Missing query in request body' });
  }

  try {
    const safeQuery = assertReadOnlyQuery(query);
    const result = await runEsql(safeQuery);
    const rows = rowsToObjects(result);

    return res.status(200).json({
      ok: true,
      columns: result.columns,
      rows,
      count: rows.length,
      queryTimeMs: result.tookMs,
      esTookMs: result.esTookMs,
    });
  } catch (err) {
    return res.status(400).json({ ok: false, error: err.message });
  }
}
