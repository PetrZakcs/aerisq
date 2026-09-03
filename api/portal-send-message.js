// Records a message a logged-in client sends from the portal, and mirrors it into Slack
// one-way (portal -> Slack) so the team notices without living in the portal. Replies happen
// back in the portal (admin.html "Messages" section), never from Slack — see SETUP.md.
const { insertRow } = require('./_lib/supabaseAdmin');
const { getCallerClient, assertOwnsProject } = require('./_lib/portalAuth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  try {
    const client = await getCallerClient(req);
    if (!client) {
      res.status(401).json({ error: 'not_authenticated' });
      return;
    }

    const body = req.body || {};
    const projectId = String(body.projectId || '');
    const text = String(body.body || '').trim();
    if (!text || text.length > 4000) {
      res.status(400).json({ error: 'invalid_input' });
      return;
    }

    const project = await assertOwnsProject(client, projectId);
    if (!project) {
      res.status(403).json({ error: 'forbidden' });
      return;
    }

    await insertRow('messages', { project_id: project.id, sender: 'client', body: text });

    // Slack notification is best-effort: a dead/unset webhook must never make the client think
    // their message failed to send, since the row above already saved it.
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `:speech_balloon: *${client.name}* (${project.name}) v portálu:\n>${text}`
          })
        });
      } catch (e) {
        console.error('[portal-send-message] slack notify failed', e);
      }
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[portal-send-message] failed', e);
    res.status(500).json({ error: 'server_error' });
  }
};
