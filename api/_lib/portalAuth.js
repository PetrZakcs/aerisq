// Shared authorization check for client-portal endpoints (portal-send-message, portal-document-url).
// Both need the same thing: "is the caller a logged-in client, and do they actually own this
// project?" — centralized here so the ownership check can't drift between endpoints.
const { getUserFromToken, selectRows } = require('./supabaseAdmin');

// Returns the caller's `clients` row if the bearer token belongs to a known, linked client
// account, or null otherwise. Never throws — callers should treat null as 401/403.
async function getCallerClient(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const user = await getUserFromToken(token);
  if (!user || !user.id) return null;

  const rows = await selectRows('clients', `auth_user_id=eq.${encodeURIComponent(user.id)}&select=id,name,email,status`);
  const client = rows[0];
  if (!client || client.status !== 'active') return null;
  return client;
}

// Confirms `projectId` belongs to `client.id`. Returns the project row (so callers can reuse
// e.g. its phase/offer fields) or null if it doesn't belong to this client / doesn't exist.
async function assertOwnsProject(client, projectId) {
  if (!projectId) return null;
  const rows = await selectRows(
    'projects',
    `id=eq.${encodeURIComponent(projectId)}&client_id=eq.${encodeURIComponent(client.id)}&select=*`
  );
  return rows[0] || null;
}

module.exports = { getCallerClient, assertOwnsProject };
