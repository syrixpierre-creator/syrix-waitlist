import express from 'express';
import { parseSignup, PRODUCTS } from './validate.mjs';
import { readCookie } from './auth.mjs';

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

export function createApp({ store, adminToken, adminAuth = null, mailer = null, staticDir = null, trustProxy = false, allowedOrigins = [] }) {
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

  // Admin access: the /syrixadmin session cookie, or the ADMIN_TOKEN bearer token for scripts.
  const admin = (req, res, next) => {
    if (adminAuth?.verify(readCookie(req, 'wl_admin'))) return next();
    const token = (req.headers.authorization || '').replace(/^Bearer /, '') || req.query.token;
    if (adminToken && token === adminToken) return next();
    res.status(401).json({ error: 'unauthorized' });
  };
  app.post('/api/admin/login', rateLimit(5, 15 * 60 * 1000), express.json({ limit: '2kb' }), (req, res) => {
    if (!adminAuth?.enabled) return res.status(503).json({ error: 'admin_not_configured' });
    if (!adminAuth.checkCredentials(req.body?.email, req.body?.password)) return res.status(401).json({ error: 'bad_credentials' });
    res.set('Set-Cookie', adminAuth.cookie(adminAuth.issue(), adminAuth.maxAge)).json({ ok: true, email: adminAuth.email });
  });
  app.post('/api/admin/logout', (_req, res) => res.set('Set-Cookie', adminAuth ? adminAuth.cookie('', 0) : 'wl_admin=; Path=/api/admin; Max-Age=0').json({ ok: true }));
  app.get('/api/admin/me', admin, (_req, res) => res.json({ email: adminAuth?.email ?? null }));
  app.get('/api/admin/stats', admin, async (_req, res) =>
    res.json({ counts: { ...Object.fromEntries(PRODUCTS.map((p) => [p, 0])), ...(await store.counts()) }, daily: await store.daily(30) }));
  app.get('/api/admin/signups', admin, async (req, res) => {
    const product = PRODUCTS.includes(req.query.product) ? req.query.product : undefined;
    const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
    const page = Math.max(1, Math.min(10000, Number(req.query.page) || 1));
    res.json({ page, limit: 50, ...(await store.list({ product, q, page, limit: 50 })) });
  });
  app.delete('/api/admin/signups/:id', admin, async (req, res) => {
    const ok = await store.remove(String(req.params.id).slice(0, 40));
    res.status(ok ? 200 : 404).json({ ok });
  });
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
