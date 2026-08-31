// Backs the live "Agent dnes zpracoval N dotazů" counter on the interactive sector demos.
// GET  ?sector=hospitality       -> current count, for the initial page load.
// POST { sector: 'hospitality' } -> atomically increments and returns the new count.
//
// Requires a one-time Supabase setup step (SQL editor) — see SETUP.md for the exact statements.
// Increment goes through a Postgres function (rpc/increment_demo_stat) instead of a
// read-then-write from this function, specifically so concurrent demo completions under ad
// traffic can't silently lose an increment to a race condition.
const { selectRows, rpc } = require('./_lib/supabaseAdmin');

module.exports = async (req, res) => {
  try {
    const sector = String(
      req.method === 'GET' ? (req.query || {}).sector : (req.body || {}).sector || ''
    ).slice(0, 60);
    if (!sector) {
      res.status(400).json({ error: 'missing_sector' });
      return;
    }

    if (req.method === 'GET') {
      const rows = await selectRows('demo_stats', `sector=eq.${encodeURIComponent(sector)}&select=completions`);
      res.status(200).json({ count: rows[0]?.completions || 0 });
      return;
    }

    if (req.method === 'POST') {
      const count = await rpc('increment_demo_stat', { p_sector: sector });
      res.status(200).json({ count });
      return;
    }

    res.status(405).json({ error: 'method_not_allowed' });
  } catch (e) {
    console.error('[demo-stat] failed', e);
    // The live counter is a nice-to-have, not core to the lead-capture flow — fail soft with a
    // 200/zero rather than surfacing an error state in the demo UI over a missing table/function.
    res.status(200).json({ count: 0 });
  }
};
