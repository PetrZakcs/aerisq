const { verifyTurnstile, clientIp } = require('./_lib/turnstile');
const { insertRow } = require('./_lib/supabaseAdmin');

const EMAIL_RE = /^\S+@\S+\.\S+$/;
// The CV file itself is uploaded directly from the browser to Supabase Storage (see uploadCvFile
// in index.html) — Vercel Serverless Functions cap request bodies at 4.5 MB, which is too tight
// for base64-encoded PDFs, so we don't proxy the file bytes here. Lock down the `cvs` bucket's
// allowed MIME types / size limit in the Supabase dashboard (see SETUP.md) since that upload still
// goes out on the anon key.
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
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const cvLink = String(body.cvLink || '').trim();
    if (!name || !EMAIL_RE.test(email) || !cvLink) {
      res.status(400).json({ error: 'invalid_input' });
      return;
    }
    // Only accept CV links pointing at our own Supabase storage bucket or a URL the applicant typed —
    // both are already free-text-ish, so just cap the length defensively.
    if (cvLink.length > 2000) {
      res.status(400).json({ error: 'invalid_input' });
      return;
    }

    const verify = await verifyTurnstile(body.turnstileToken, clientIp(req));
    if (!verify.success) {
      res.status(403).json({ error: 'bot_check_failed' });
      return;
    }

    await insertRow('applications', {
      name,
      email,
      linkedin: String(body.linkedin || '').slice(0, 500),
      cv_link: cvLink,
      role_interest: String(body.roleInterest || '').slice(0, 200),
      comp_expectation: String(body.compExpectation || '').slice(0, 200),
      why_us: String(body.whyUs || '').slice(0, 4000),
      message: String(body.message || '').slice(0, 4000),
      lang: body.lang === 'en' ? 'en' : 'cs'
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[submit-application] failed', e);
    res.status(500).json({ error: 'server_error' });
  }
};
