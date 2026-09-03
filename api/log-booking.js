// Free-tier-compatible substitute for a Calendly webhook (which needs a paid Calendly plan):
// called from index.html's onCalendlyMessage once Calendly's own booking page posts
// `calendly.event_scheduled` back to whichever window/tab opened or embedded it — i.e. only once
// a visitor actually finishes booking, not just clicks through. We don't get the invitee's name or
// email this way (Calendly only sends the service tag we already know client-side, not invitee
// details), so this just logs which service a completed booking belongs to; api/calendly-webhook.js
// remains the richer alternative if this account is ever upgraded to a plan with webhooks.
const { insertRow } = require('./_lib/supabaseAdmin');

const ALLOWED_SERVICES = new Set([
  'hospitality', 'realestate', 'offering_ai', 'offering_mvp', 'offering_enterprise',
  'offering_training', 'audit_wizard', 'unknown'
]);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  try {
    const body = req.body || {};
    const service = ALLOWED_SERVICES.has(body.service) ? body.service : 'unknown';

    await insertRow('bookings', {
      service,
      invitee_name: null,
      invitee_email: null
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[log-booking] failed', e);
    res.status(500).json({ error: 'server_error' });
  }
};
