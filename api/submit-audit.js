const { insertRow } = require('./_lib/supabaseAdmin');

const EMAIL_RE = /^\S+@\S+\.\S+$/;

// Caps a ROI number to a sane range instead of trusting whatever the client sent — these are
// display/sort data in admin, not used in any calculation server-side, but a client can send
// arbitrary JSON regardless of what the sliders on the page allow.
function safeInt(value, max) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.min(n, max);
}

// The step-3 qualifying answers arrive as a plain { questionKey: 'chosen option label' } object —
// keep only string keys/values, cap the count and each string's length, so a malformed or
// malicious payload can't smuggle nested objects or huge strings into the jsonb column.
function safeQualification(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const out = {};
  let count = 0;
  for (const [k, v] of Object.entries(value)) {
    if (count >= 10) break;
    if (typeof k !== 'string' || typeof v !== 'string') continue;
    out[k.slice(0, 100)] = v.slice(0, 200);
    count++;
  }
  return count > 0 ? out : null;
}

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

    await insertRow('audit_requests', {
      name,
      email,
      company: String(body.company || '').slice(0, 300),
      phone: String(body.phone || '').slice(0, 100),
      website: String(body.website || '').slice(0, 300),
      problem: String(body.problem || '').slice(0, 4000),
      focus: String(body.focus || '').slice(0, 100),
      budget: String(body.budget || '').slice(0, 100),
      lang: body.lang === 'en' ? 'en' : 'cs',
      qualification: safeQualification(body.qualification),
      roi_employees: safeInt(body.roiEmployees, 100000),
      roi_hours_per_week: safeInt(body.roiHoursPerWeek, 168),
      roi_saved_hours_monthly: safeInt(body.roiSavedHoursMonthly, 1000000),
      roi_saved_yearly: safeInt(body.roiSavedYearly, 1000000000)
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[submit-audit] failed', e);
    res.status(500).json({ error: 'server_error' });
  }
};
