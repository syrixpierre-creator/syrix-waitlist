import { fileURLToPath } from 'node:url';
import { createApp } from './app.mjs';
import { createStore } from './store.mjs';
import { createMailer } from './mail.mjs';

const env = process.env;
if (!env.ADMIN_TOKEN) console.warn('ADMIN_TOKEN is not set: /api/admin/* is disabled.');
if (!env.MONGODB_URI) {
  if (env.NODE_ENV === 'production') throw new Error('MONGODB_URI is required in production.');
  console.warn('MONGODB_URI is not set: signups are kept in memory and lost on restart.');
}
const store = await createStore({ mongoUri: env.MONGODB_URI, dbName: env.MONGODB_DB });
const app = createApp({
  store,
  adminToken: env.ADMIN_TOKEN,
  mailer: await createMailer(env),
  staticDir: fileURLToPath(new URL('../dist', import.meta.url)),
  trustProxy: env.TRUST_PROXY ? (Number(env.TRUST_PROXY) || env.TRUST_PROXY) : false,
  allowedOrigins: (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean),
});
const port = Number(env.PORT || 8080);
app.listen(port, '0.0.0.0', () => console.log(`waitlist on :${port} (${store.kind})`));
