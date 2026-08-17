// Verifies a Cloudflare Turnstile token server-side.
// Requires env var TURNSTILE_SECRET_KEY (Vercel dashboard → Project → Settings → Environment Variables).
// If TURNSTILE_SECRET_KEY is not set, verification is skipped with a warning — lets the app keep
// working before Turnstile is configured, but you should set the key before relying on this in production.
async function verifyTurnstile(token, remoteIp) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn('[turnstile] TURNSTILE_SECRET_KEY not set — skipping bot-check. Configure it in Vercel env vars.');
    return { success: true, skipped: true };
  }
  if (!token || typeof token !== 'string') {
    return { success: false, error: 'missing-token' };
  }
  try {
    const body = new URLSearchParams();
    body.set('secret', secret);
    body.set('response', token);
    if (remoteIp) body.set('remoteip', remoteIp);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
    const data = await res.json();
    return { success: !!data.success, error: data['error-codes']?.join(',') };
  } catch (e) {
    console.error('[turnstile] verify request failed', e);
    return { success: false, error: 'verify-request-failed' };
  }
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || '';
}

module.exports = { verifyTurnstile, clientIp };
