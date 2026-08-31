// Sends a Supabase magic-link login email to a client. Same shape/honeypot pattern as the other
// public forms (submit-audit.js etc.), but this one deliberately returns { ok: true } in EVERY
// case — including "this email isn't a client" and "email send failed" — so the portal login
// screen never leaks which addresses are registered clients (see sendMagicLink in supabaseAdmin.js).
const { sendMagicLink } = require('./_lib/supabaseAdmin');

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const PORTAL_URL = process.env.PORTAL_URL || 'https://aerisq.tech/clients';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  try {
    const body = req.body || {};
    if (body.portalHp) {
      res.status(200).json({ ok: true });
      return;
    }
    const email = String(body.email || '').trim();
    if (!EMAIL_RE.test(email)) {
      res.status(400).json({ error: 'invalid_input' });
      return;
    }

    await sendMagicLink(email, PORTAL_URL);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[portal-request-link] failed', e);
    // Fail soft here too, for the same "don't leak which emails exist" reason.
    res.status(200).json({ ok: true });
  }
};
