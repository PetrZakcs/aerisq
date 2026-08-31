// Vercel Routing Middleware — routes portal.aerisq.tech's root request to portal.html.
//
// Why this exists instead of the host-conditioned rule that used to live in vercel.json's
// `rewrites`: a request to "/" always matches the literal index.html file first — Vercel checks
// for a real static file/API route match *before* applying `rewrites`, regardless of any `has`
// host condition on the rule (same class of precedence issue already documented in SETUP.md's
// 21. 8. 2026 routing fix, just triggered by a different cause this time). A `rewrites` entry can
// therefore never win against index.html at "/". Routing Middleware runs earlier than that static
// resolution, so it's the only mechanism that can actually override it.
//
// CommonJS (require/module.exports), matching every other server file in this project
// (api/*.js) — the `proxy.entrypoint` path must end in .js or .ts (Vercel CLI rejects .mjs), and
// @vercel/functions supports require() directly, so there's no need to touch package.json's
// module type (which would risk breaking the CommonJS api/*.js functions).
const { rewrite, next } = require('@vercel/functions');

module.exports = function proxy(request) {
  const url = new URL(request.url);
  const host = request.headers.get('host') || '';
  // Gated on pathname here too, not just via `config.matcher` below — local testing showed the
  // matcher isn't reliably honored for a CommonJS entrypoint, so this must not assume it fired
  // only for "/". Without this check every asset (support.js, favicon.png, /api/*) under
  // portal.aerisq.tech would get redirected into portal.html along with the real page.
  if (host === 'portal.aerisq.tech' && url.pathname === '/') {
    return rewrite(new URL('/portal.html', request.url));
  }
  return next();
};

module.exports.config = {
  matcher: '/'
};
