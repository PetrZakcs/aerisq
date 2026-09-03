const crypto = require('crypto');
const { insertRow } = require('./_lib/supabaseAdmin');

// Calendly's webhook payload arrives as raw JSON that MUST be verified byte-for-byte against its
// signature before parsing — Vercel's default body parser would already have re-serialized it by
// the time req.body exists, which can silently break the signature check, so we read the raw
// stream ourselves and turn off the default parser via the exported `config` below.
module.exports.config = { api: { bodyParser: false } };

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

// Calendly signs webhooks as `Calendly-Webhook-Signature: t=<unix ts>,v1=<hex hmac>`, where the
// hmac is SHA-256 of `${t}.${rawBody}` keyed with the signing secret shown once when the webhook
// subscription is created (see SETUP.md). Rejects anything older than 5 minutes to block replay
// of a captured request.
function verifySignature(rawBody, header, signingKey) {
  if (!header || !signingKey) return false;
  const parts = Object.fromEntries(header.split(',').map(p => p.split('=')));
  const t = parts.t, v1 = parts.v1;
  if (!t || !v1) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const expected = crypto.createHmac('sha256', signingKey).update(`${t}.${rawBody}`).digest('hex');
  const expectedBuf = Buffer.from(expected, 'hex');
  const gotBuf = Buffer.from(v1, 'hex');
  if (expectedBuf.length !== gotBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, gotBuf);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  try {
    const rawBody = await readRawBody(req);
    const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
    if (!verifySignature(rawBody, req.headers['calendly-webhook-signature'], signingKey)) {
      res.status(401).json({ error: 'invalid_signature' });
      return;
    }

    const body = JSON.parse(rawBody);
    // We only subscribe to invitee.created (see SETUP.md) — anything else is ignored rather than
    // rejected, so widening the subscription later doesn't start erroring on events we don't store.
    if (body.event !== 'invitee.created') {
      res.status(200).json({ ok: true, ignored: body.event });
      return;
    }

    const payload = body.payload || {};
    const tracking = payload.tracking || {};

    await insertRow('bookings', {
      invitee_name: String(payload.name || '').slice(0, 300),
      invitee_email: String(payload.email || '').slice(0, 300),
      service: String(tracking.utm_campaign || '').slice(0, 100),
      calendly_event_uri: String(payload.event || '').slice(0, 500),
      calendly_invitee_uri: String(payload.uri || '').slice(0, 500)
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[calendly-webhook] failed', e);
    // Calendly retries a failed delivery with backoff — 500 (not a swallowed 200) so a transient
    // failure (or the bookings table not existing yet, before SETUP.md's migration has run) gets
    // a real second attempt instead of the booking silently never arriving.
    res.status(500).json({ error: 'server_error' });
  }
};
