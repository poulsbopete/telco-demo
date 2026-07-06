const COOKIE_NAME = 'presenter_auth';
const AUTH_TOKEN = process.env.PRESENTER_AUTH_TOKEN || 'telco-presenter-elastic';

const PUBLIC_PATHS = new Set([
  '/presenter/login.html',
  '/presenter/presenter.css',
  '/presenter/presenter-gate.js',
]);

function readCookie(request, name) {
  const header = request.headers.get('cookie');
  if (!header) return undefined;

  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key === name) return decodeURIComponent(part.slice(idx + 1).trim());
  }

  return undefined;
}

export default function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (!path.startsWith('/presenter')) {
    return;
  }

  if (PUBLIC_PATHS.has(path)) {
    return;
  }

  if (readCookie(request, COOKIE_NAME) === AUTH_TOKEN) {
    return;
  }

  const login = new URL('/presenter/login.html', request.url);
  login.searchParams.set('redirect', path + url.search);
  return Response.redirect(login, 302);
}

export const config = {
  matcher: ['/presenter', '/presenter/:path*'],
};
