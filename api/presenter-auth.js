import {
  COOKIE_NAME,
  buildAuthCookie,
  buildClearCookie,
  cookieIsValid,
  getPresenterPassword,
  parseCookies,
} from '../lib/presenter-auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const cookies = parseCookies(req.headers.cookie || '');

  if (req.method === 'GET') {
    const authed = cookieIsValid(cookies[COOKIE_NAME]);
    return res.status(authed ? 200 : 401).json({ ok: authed, authed });
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const password = body.password ?? '';

    if (password !== getPresenterPassword()) {
      return res.status(401).json({ ok: false, error: 'Invalid password' });
    }

    res.setHeader('Set-Cookie', buildAuthCookie());
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', buildClearCookie());
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
