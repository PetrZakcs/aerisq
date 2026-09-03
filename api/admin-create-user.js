const { getUserFromToken, adminCreateUser, insertRow } = require('./_lib/supabaseAdmin');

// Creates a real Supabase Auth user (so the new team member can actually log in) and mirrors
// them into team_members. Only callable by a caller who already holds a valid Supabase session —
// pass the admin's own access_token in the Authorization header (the client already keeps this in
// state.session.access_token after loginWithPassword()).
//
// NOTE: this checks the caller is a *known, authenticated Supabase user*, but does not yet check a
// `role` column against Supabase itself (team_members isn't gated by real auth today — see SETUP.md
// for the Supabase RLS policies you should add so only rows where role='admin' can call this).
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

    const body = req.body || {};
    const fullName = String(body.fullName || '').trim();
    const email = String(body.email || '').trim();
    const password = String(body.password || '');
    const role = ['admin', 'editor', 'viewer'].includes(body.role) ? body.role : 'admin';

    if (!fullName || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
      res.status(400).json({ error: 'invalid_input', message: 'Full name, valid email, and a password of at least 8 characters are required.' });
      return;
    }

    const created = await adminCreateUser({ email, password });
    await insertRow('team_members', {
      id: created.id,
      full_name: fullName,
      email,
      role
    });

    res.status(200).json({ ok: true, id: created.id });
  } catch (e) {
    console.error('[admin-create-user] failed', e);
    res.status(500).json({ error: 'server_error', message: String(e.message || e) });
  }
};
