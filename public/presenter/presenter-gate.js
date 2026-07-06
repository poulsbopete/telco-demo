/** Dev fallback when Vercel middleware is not active (npm run dev). */
(async () => {
  try {
    const res = await fetch('/api/presenter-auth', { credentials: 'same-origin' });
    if (res.ok) return;
  } catch {
    return;
  }
  const redirect = encodeURIComponent(location.pathname + location.search);
  location.replace(`/presenter/login.html?redirect=${redirect}`);
})();
