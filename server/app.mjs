import express from 'express';
import { parseSignup, PRODUCTS } from './validate.mjs';

/** Small fixed-window rate limiter kept in memory (one instance per process). */
function rateLimit(max, windowMs) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    const h = hits.get(key);
    if (!h || now - h.start > windowMs) hits.set(key, { start: now, n: 1 });
    else if (++h.n > max) return res.status(429).json({ error: 'rate_limited' });
    if (hits.size > 50000) hits.clear();
    next();
  };
}

export function createApp({ store, adminToken, mailer = null, staticDir = null, trustProxy = false, allowedOrigins = [] }) {
  const app = express();
  app.disable('x-powered-by');
  if (trustProxy) app.set('trust proxy', trustProxy);
  app.use((req, res, next) => {
    res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'DENY' });
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.set({ 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', Vary: 'Origin' });
      if (req.method === 'OPTIONS') return res.sendStatus(204);
    }
    next();
  });

  app.get('/api/health', async (_req, res) => {
    try {
      await store.ping();
      res.json({ ok: true, storage: store.kind });
    } catch {
      res.status(503).json({ ok: false, storage: store.kind });
    }
  });

  app.post('/api/waitlist', rateLimit(8, 10 * 60 * 1000), express.json({ limit: '8kb' }), async (req, res) => {
    const parsed = parseSignup(req.body);
    if (!parsed.ok) {
      // A bot that filled the honeypot gets a normal-looking answer and nothing is stored.
      if (parsed.code === 'spam') return res.json({ ok: true, results: [] });
      return res.status(400).json({ error: parsed.code });
    }
    try {
      const results = [];
      for (const product of parsed.value.products) results.push({ product, ...(await store.add(parsed.value, product)) });
      if (mailer && results.some((r) => !r.existing)) mailer(parsed.value.email, parsed.value.lang, results).catch((e) => console.error('mail', e.message));
      res.json({ ok: true, results });
    } catch (e) {
      console.error('waitlist', e);
      res.status(500).json({ error: 'server_error' });
    }
  });

  const admin = (req, res, next) => {
    const token = (req.headers.authorization || '').replace(/^Bearer /, '') || req.query.token;
    if (!adminToken || token !== adminToken) return res.status(401).json({ error: 'unauthorized' });
    next();
  };
  app.get('/api/admin/stats', admin, async (_req, res) => res.json({ counts: { ...Object.fromEntries(PRODUCTS.map((p) => [p, 0])), ...(await store.counts()) } }));
  app.get('/api/admin/export.csv', admin, async (_req, res) => {
    const rows = await store.all();
    const esc = (v) => (v == null ? '' : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
    const head = 'id,email,product,lang,channel,source,created_at';
    res.type('text/csv').set('Content-Disposition', 'attachment; filename="waitlist.csv"');
    res.send([head, ...rows.map((r) => [r.id, r.email, r.product, r.lang, r.channel, r.source, r.created_at].map(esc).join(','))].join('\n'));
  });

  if (staticDir) {
    app.use(express.static(staticDir, { maxAge: '1h', setHeaders: (res, path) => { if (/\/assets\//.test(path)) res.set('Cache-Control', 'public, max-age=31536000, immutable'); } }));
    app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile('index.html', { root: staticDir }));
  }
  return app;
}
