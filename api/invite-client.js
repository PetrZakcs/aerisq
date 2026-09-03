// Turns a CRM-only `clients` row into a client who can actually log into the portal: creates a
// real Supabase Auth account for their email (no password — portal login is magic-link only),
// links it back onto the clients row via auth_user_id, then sends the first magic link so they
// don't have to separately request one. Callable by any authenticated caller, same trust model
// admin-create-user.js already uses (see SETUP.md for the RLS follow-up that tightens this to
// role='admin' specifically).
const { getUserFromToken, adminCreateUser, updateRow, selectRows, sendMagicLink } = require('./_lib/supabaseAdmin');

const PORTAL_URL = process.env.PORTAL_URL || 'https://aerisq.tech/clients';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  try {
    const authHeader = req.headers.authorization || '';
    const callerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const caller = await getUserFromToken(callerToken);
    if (!caller || !caller.id) {
      res.status(401).json({ error: 'not_authenticated' });
      return;
    }

    const clientId = String((req.body || {}).clientId || '');
    if (!clientId) {
      res.status(400).json({ error: 'invalid_input' });
      return;
    }

    const rows = await selectRows('clients', `id=eq.${encodeURIComponent(clientId)}&select=id,email,auth_user_id`);
    const client = rows[0];
    if (!client) {
      res.status(404).json({ error: 'not_found' });
      return;
    }

    // Already invited: just resend the magic link instead of trying (and failing) to create a
    // second auth account for the same email.
    if (!client.auth_user_id) {
      const created = await adminCreateUser({ email: client.email, emailConfirm: true });
      await updateRow('clients', `id=eq.${encodeURIComponent(clientId)}`, { auth_user_id: created.id });
    }

    const emailSent = await sendMagicLink(client.email, PORTAL_URL);
    if (!emailSent) {
      // The account exists at this point even if the email failed (rate limit, no SMTP
      // configured, etc.) — say so plainly instead of a blanket ok:true so admin.html can show a
      // real error instead of pretending the invite went out.
      res.status(502).json({ error: 'email_send_failed' });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[invite-client] failed', e);
    res.status(500).json({ error: 'server_error', message: String(e.message || e) });
  }
};
