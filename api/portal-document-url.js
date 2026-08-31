// Returns a short-lived signed URL for a document, after verifying the caller (client or team
// member) actually owns the project it belongs to. Replaces the old pattern of storing a public
// storage.../object/public/documents/... link directly on the row — the `documents` bucket is
// private now (see SETUP.md), so a bare file_url is useless without going through here.
//
// Called from both portal.html (client) and admin.html (staff) — staff auth is "any logged-in
// team_members row" (same trust level admin.html already assumes elsewhere), client auth is
// "owns the project" via getCallerClient/assertOwnsProject.
const { selectRows, signStorageUrl, getUserFromToken } = require('./_lib/supabaseAdmin');
const { getCallerClient, assertOwnsProject } = require('./_lib/portalAuth');

const DOCUMENTS_BUCKET = 'documents';

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  try {
    const documentId = String((req.query || {}).documentId || '');
    if (!documentId) {
      res.status(400).json({ error: 'missing_document_id' });
      return;
    }

    const docs = await selectRows('documents', `id=eq.${encodeURIComponent(documentId)}&select=*`);
    const doc = docs[0];
    if (!doc || !doc.storage_path) {
      res.status(404).json({ error: 'not_found' });
      return;
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    // A team member (any authenticated Supabase user, matching the trust level the rest of
    // admin.html already relies on) may always fetch a signed URL.
    const staffUser = await getUserFromToken(token);
    let authorized = !!(staffUser && staffUser.id);

    // Otherwise, this must be a client who owns the document's project.
    if (!authorized) {
      const client = await getCallerClient(req);
      const project = client ? await assertOwnsProject(client, doc.project_id) : null;
      authorized = !!project;
    }

    if (!authorized) {
      res.status(403).json({ error: 'forbidden' });
      return;
    }

    const url = await signStorageUrl(DOCUMENTS_BUCKET, doc.storage_path, 300);
    if (!url) {
      res.status(500).json({ error: 'sign_failed' });
      return;
    }
    res.status(200).json({ url });
  } catch (e) {
    console.error('[portal-document-url] failed', e);
    res.status(500).json({ error: 'server_error' });
  }
};
