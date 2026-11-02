// Vercel serverless entry: every /api/* request is rewritten here (see vercel.json). Requires DATABASE_URL.
import { createApp } from '../server/app.mjs';
import { createStore } from '../server/store.mjs';
import { createMailer } from '../server/mail.mjs';

const env = process.env;
if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required on Vercel (SQLite files are not persistent there).');
const store = await createStore({ databaseUrl: env.DATABASE_URL });
export default createApp({ store, adminToken: env.ADMIN_TOKEN, mailer: await createMailer(env), trustProxy: true });
