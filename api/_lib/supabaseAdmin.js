// Server-side Supabase access using the service_role key.
// NEVER import this file's key into client code — it bypasses Row Level Security entirely.
// Requires env vars SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (Vercel dashboard → env vars).
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kwgpwbpgpxztcndhvixe.supabase.co';

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

// PATCHes rows matching a PostgREST filter query string (e.g. `id=eq.123`).
async function updateRow(table, query, payload) {
  const key = requireServiceKey();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    method: 'PATCH',
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
    throw new Error(`Supabase update of ${table} failed: ${res.status} ${text}`);
  }
}

// Read-only select, used for things like reading back a public counter. Returns [] on any error
// (e.g. table doesn't exist yet) instead of throwing — callers treat a missing value as "0".
async function selectRows(table, query) {
  const key = requireServiceKey();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }
  });
  if (!res.ok) return [];
  return res.json().catch(() => []);
}

// Calls a Postgres function (e.g. an atomic counter increment) via PostgREST's /rpc/ endpoint.
async function rpc(fnName, args) {
  const key = requireServiceKey();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` },
    body: JSON.stringify(args || {})
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Supabase rpc ${fnName} failed: ${res.status} ${text}`);
  }
  return res.json();
}

// Generates a short-lived signed URL for a private Storage object (e.g. a client-only document
// or invoice PDF). Returns null on any failure so callers can respond with a clean 404/403
// instead of leaking Supabase error details.
async function signStorageUrl(bucket, path, expiresIn = 300) {
  const key = requireServiceKey();
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${bucket}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` },
    body: JSON.stringify({ expiresIn })
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (!data || !data.signedURL) return null;
  return `${SUPABASE_URL}/storage/v1${data.signedURL}`;
}

// Sends a magic-link ("passwordless") login email to an existing Supabase Auth user.
// create_user:false so this never silently creates a new auth account for an arbitrary email —
// client accounts are only ever created explicitly via adminCreateUser (see inviteClient flow).
async function sendMagicLink(email, redirectTo) {
  const key = requireServiceKey();
  const res = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` },
    body: JSON.stringify({ email, create_user: false, options: { email_redirect_to: redirectTo } })
  });
  // Supabase returns 200 even for unknown emails when create_user:false — treat any non-2xx as a
  // real failure, but never surface *which* emails exist to the caller (see portal-request-link.js).
  return res.ok;
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

module.exports = { SUPABASE_URL, insertRow, updateRow, selectRows, rpc, signStorageUrl, sendMagicLink, getUserFromToken, adminCreateUser };
