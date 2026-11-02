import { fileURLToPath } from 'node:url';
import { createApp } from './app.mjs';
import { createStore } from './store.mjs';
import { createMailer } from './mail.mjs';
import { createAdminAuth } from './auth.mjs';

const env = process.env;
const adminAuth = createAdminAuth({
  email: env.ADMIN_EMAIL || 'syrixcompany@gmail.com',
  password: env.ADMIN_PASSWORD,
  secret: env.SESSION_SECRET,
  secure: env.NODE_ENV === 'production',
});
if (!adminAuth.enabled) console.warn('ADMIN_PASSWORD is not set (12 characters minimum): /syrixadmin sign-in is disabled.');
if (env.NODE_ENV === 'production' && adminAuth.enabled && !env.SESSION_SECRET) console.warn('SESSION_SECRET is not set: admin sessions end on every restart.');
if (!env.MONGODB_URI) {
  if (env.NODE_ENV === 'production') throw new Error('MONGODB_URI is required in production.');
  console.warn('MONGODB_URI is not set: signups are kept in memory and lost on restart.');
}
const store = await createStore({ mongoUri: env.MONGODB_URI, dbName: env.MONGODB_DB });
const app = createApp({
  store,
  adminToken: env.ADMIN_TOKEN,
  adminAuth,
  mailer: await createMailer(env),
  staticDir: fileURLToPath(new URL('../dist', import.meta.url)),
  trustProxy: env.TRUST_PROXY ? (Number(env.TRUST_PROXY) || env.TRUST_PROXY) : false,
  allowedOrigins: (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean),
});
const port = Number(env.PORT || 8080);
app.listen(port, '0.0.0.0', () => console.log(`waitlist on :${port} (${store.kind})`));
