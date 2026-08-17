// Server-side Supabase access using the service_role key.
// NEVER import this file's key into client code — it bypasses Row Level Security entirely.
// Requires env vars SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (Vercel dashboard → env vars).
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://multgoxlzarxexeeapuo.supabase.co';

function requireServiceKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in the environment.');
  return key;
}

async function insertRow(table, payload) {
  const key = requireServiceKey();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Supabase insert into ${table} failed: ${res.status} ${text}`);
  }
}

// Verifies a user's Supabase access_token and returns the auth user, or null if invalid.
async function getUserFromToken(accessToken) {
  if (!accessToken) return null;
  const anonKey = process.env.SUPABASE_ANON_KEY || '';
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) return null;
  return res.json();
}

async function adminCreateUser({ email, password, emailConfirm = true }) {
  const key = requireServiceKey();
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify({ email, password, email_confirm: emailConfirm })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.msg || data?.message || `Supabase admin createUser failed: ${res.status}`);
  }
  return data;
}

module.exports = { SUPABASE_URL, insertRow, getUserFromToken, adminCreateUser };
