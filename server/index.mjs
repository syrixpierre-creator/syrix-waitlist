import { fileURLToPath } from 'node:url';
import { createApp } from './app.mjs';
import { createStore } from './store.mjs';
import { createMailer } from './mail.mjs';

const env = process.env;
if (!env.ADMIN_TOKEN) console.warn('ADMIN_TOKEN is not set: /api/admin/* is disabled.');
const store = await createStore({ databaseUrl: env.DATABASE_URL, sqlitePath: env.SQLITE_PATH || 'data/waitlist.db' });
const app = createApp({
  store,
  adminToken: env.ADMIN_TOKEN,
  mailer: await createMailer(env),
  staticDir: fileURLToPath(new URL('../dist', import.meta.url)),
  trustProxy: env.TRUST_PROXY ? (Number(env.TRUST_PROXY) || env.TRUST_PROXY) : false,
  allowedOrigins: (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean),
});
const port = Number(env.PORT || 8080);
app.listen(port, () => console.log(`waitlist on :${port} (${store.kind})`));
