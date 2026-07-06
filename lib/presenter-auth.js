export const COOKIE_NAME = 'presenter_auth';

export function getPresenterPassword() {
  return process.env.PRESENTER_PASSWORD || 'elastic';
}

export function getPresenterToken() {
  return process.env.PRESENTER_AUTH_TOKEN || 'telco-presenter-elastic';
}

export function cookieIsValid(value) {
  return typeof value === 'string' && value === getPresenterToken();
}

export function buildAuthCookie() {
  const token = getPresenterToken();
  const secure = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=604800',
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function buildClearCookie() {
  const secure = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  const parts = [`${COOKIE_NAME}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    out[key] = decodeURIComponent(val);
  }
  return out;
}
