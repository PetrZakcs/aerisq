// Vercel Routing Middleware — routes /clients and portal.aerisq.tech requests to portal.html.
const { rewrite, next } = require('@vercel/functions');

module.exports = function proxy(request) {
  const url = new URL(request.url);
  const host = request.headers.get('host') || '';
  if (url.pathname === '/clients' || url.pathname.startsWith('/clients/') || url.pathname === '/portal' || url.pathname.startsWith('/portal/')) {
    return rewrite(new URL('/portal.html', request.url));
  }
  if (host === 'portal.aerisq.tech' && url.pathname === '/') {
    return rewrite(new URL('/portal.html', request.url));
  }
  return next();
};

module.exports.config = {
  matcher: ['/', '/clients', '/clients/:path*', '/portal', '/portal/:path*']
};
