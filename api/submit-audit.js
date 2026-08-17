const { verifyTurnstile, clientIp } = require('./_lib/turnstile');
const { insertRow } = require('./_lib/supabaseAdmin');

const EMAIL_RE = /^\S+@\S+\.\S+$/;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  try {
    const body = req.body || {};
    // Honeypot: real users never fill this hidden field; bots that auto-fill every input will.
    if (body.website_hp) {
      res.status(200).json({ ok: true }); // pretend success, drop silently
      return;
    }
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    if (!name || !EMAIL_RE.test(email)) {
      res.status(400).json({ error: 'invalid_input' });
      return;
    }

    const verify = await verifyTurnstile(body.turnstileToken, clientIp(req));
    if (!verify.success) {
      res.status(403).json({ error: 'bot_check_failed' });
      return;
    }

    await insertRow('audit_requests', {
      name,
      email,
      company: String(body.company || '').slice(0, 300),
      phone: String(body.phone || '').slice(0, 100),
      website: String(body.website || '').slice(0, 300),
      team_size: String(body.teamSize || '').slice(0, 100),
      problem: String(body.problem || '').slice(0, 4000),
      focus: String(body.focus || '').slice(0, 100),
      budget: String(body.budget || '').slice(0, 100),
      lang: body.lang === 'en' ? 'en' : 'cs'
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[submit-audit] failed', e);
    res.status(500).json({ error: 'server_error' });
  }
};
