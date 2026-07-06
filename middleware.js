import { COOKIE_NAME, cookieIsValid } from './lib/presenter-auth.js';

const PUBLIC_PATHS = new Set([
  '/presenter/login.html',
  '/presenter/presenter.css',
  '/presenter/presenter-gate.js',
]);

export default function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (!path.startsWith('/presenter')) {
    return;
  }

  if (PUBLIC_PATHS.has(path)) {
    return;
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (cookieIsValid(token)) {
    return;
  }

  const login = new URL('/presenter/login.html', request.url);
  login.searchParams.set('redirect', path + url.search);
  return Response.redirect(login, 302);
}

export const config = {
  matcher: ['/presenter', '/presenter/:path*'],
};
