const { insertRow } = require('./_lib/supabaseAdmin');

const EMAIL_RE = /^\S+@\S+\.\S+$/;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  try {
    const body = req.body || {};
    if (body.website_hp) {
      res.status(200).json({ ok: true });
      return;
    }
    const email = String(body.email || '').trim();
    if (!EMAIL_RE.test(email)) {
      res.status(400).json({ error: 'invalid_input' });
      return;
    }

    await insertRow('newsletter_subscribers', {
      email,
      lang: body.lang === 'en' ? 'en' : 'cs'
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[subscribe-newsletter] failed', e);
    res.status(500).json({ error: 'server_error' });
  }
};
