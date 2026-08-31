// Captures the contact left at the end of an interactive sector demo (e.g. the hospitality
// "try the agent" demo) — same shape and honeypot pattern as submit-audit.js, but a separate
// table (demo_leads) so these two lead sources stay distinguishable in Supabase.
const { insertRow } = require('./_lib/supabaseAdmin');

const EMAIL_RE = /^\S+@\S+\.\S+$/;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  try {
    const body = req.body || {};
    // Honeypot: real visitors never fill this hidden field; bots that auto-fill every input will.
    if (body.demoHp) {
      res.status(200).json({ ok: true }); // pretend success, drop silently
      return;
    }
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    if (!name || !EMAIL_RE.test(email)) {
      res.status(400).json({ error: 'invalid_input' });
      return;
    }

    await insertRow('demo_leads', {
      name,
      email,
      phone: String(body.phone || '').slice(0, 100),
      company: String(body.company || '').slice(0, 300),
      sector: String(body.sector || '').slice(0, 60),
      scenario: String(body.scenario || '').slice(0, 60),
      lang: body.lang === 'en' ? 'en' : 'cs',
      utm_source: String(body.utmSource || '').slice(0, 200),
      utm_medium: String(body.utmMedium || '').slice(0, 200),
      utm_campaign: String(body.utmCampaign || '').slice(0, 200)
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[submit-demo-lead] failed', e);
    res.status(500).json({ error: 'server_error' });
  }
};
