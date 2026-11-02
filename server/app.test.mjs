import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './app.mjs';
import { createStore } from './store.mjs';
// Uses the in-memory store; set TEST_MONGODB_URI to run the same tests against a real MongoDB
// (each test gets its own wltest_* database).
const newStore = () => createStore({ mongoUri: process.env.TEST_MONGODB_URI, dbName: `wltest_${Math.random().toString(36).slice(2, 10)}` });
import { parseSignup } from './validate.mjs';

async function boot() {
  const store = await newStore();
  const app = createApp({ store, adminToken: 'secret' });
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  return { base, close: () => { server.close(); store.close(); } };
}
const post = (base, body) => fetch(`${base}/api/waitlist`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

test('validation', () => {
  assert.equal(parseSignup({ email: 'bad', products: ['wharise'] }).code, 'invalid_email');
  assert.equal(parseSignup({ email: 'a@b.co', products: ['other'] }).code, 'no_product');
  assert.equal(parseSignup({ email: 'a@b.co', products: ['wharise'], website: 'x' }).code, 'spam');
  assert.equal(parseSignup({ email: 'a@b.co', products: ['wharise'], channel: 'https://evil.example' }).code, 'invalid_channel');
  const ok = parseSignup({ email: ' A@B.CO ', products: ['wharise', 'wharise', 'syrix-chat'], lang: 'fr' });
  assert.deepEqual(ok.value.products, ['wharise', 'syrix-chat']);
  assert.equal(ok.value.email, 'a@b.co');
  assert.equal(ok.value.lang, 'fr');
});

test('signup, positions, dedupe, honeypot, admin', async () => {
  const { base, close } = await boot();
  try {
    let r = await (await post(base, { email: 'one@x.io', products: ['syrix-chat', 'wharise'] })).json();
    assert.deepEqual(r.results.map((x) => [x.product, x.position, x.existing]), [['syrix-chat', 1, false], ['wharise', 1, false]]);
    r = await (await post(base, { email: 'two@x.io', products: ['wharise'] })).json();
    assert.equal(r.results[0].position, 2);
    r = await (await post(base, { email: 'ONE@x.io', products: ['wharise'] })).json();
    assert.deepEqual([r.results[0].position, r.results[0].existing], [1, true]);
    r = await (await post(base, { email: 'bot@x.io', products: ['wharise'], website: 'spam' })).json();
    assert.deepEqual(r.results, []);
    assert.equal((await post(base, { email: 'nope', products: ['wharise'] })).status, 400);
    assert.equal((await fetch(`${base}/api/admin/stats`)).status, 401);
    const stats = await (await fetch(`${base}/api/admin/stats`, { headers: { authorization: 'Bearer secret' } })).json();
    assert.deepEqual(stats.counts, { 'syrix-chat': 1, wharise: 2 });
    const csv = await (await fetch(`${base}/api/admin/export.csv?token=secret`)).text();
    assert.equal(csv.trim().split('\n').length, 4);
  } finally {
    close();
  }
});

test('rate limit', async () => {
  const { base, close } = await boot();
  try {
    let last;
    for (let i = 0; i < 9; i++) last = await post(base, { email: `u${i}@x.io`, products: ['wharise'] });
    assert.equal(last.status, 429);
  } finally {
    close();
  }
});

test('admin sign-in, list, delete', async () => {
  const { createAdminAuth } = await import('./auth.mjs');
  const store = await newStore();
  const adminAuth = createAdminAuth({ email: 'syrixcompany@gmail.com', password: 'correct horse battery', secret: 's3cret' });
  const server = createApp({ store, adminAuth }).listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  const json = (path, body, cookie) => fetch(base + path, { method: body ? 'POST' : 'GET', headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) }, body: body ? JSON.stringify(body) : undefined });
  try {
    await post(base, { email: 'a@x.io', products: ['wharise'] });
    await post(base, { email: 'b@x.io', products: ['syrix-chat', 'wharise'] });
    assert.equal((await json('/api/admin/signups')).status, 401);
    assert.equal((await json('/api/admin/login', { email: 'syrixcompany@gmail.com', password: 'wrong password!' })).status, 401);
    assert.equal((await json('/api/admin/login', { email: 'other@gmail.com', password: 'correct horse battery' })).status, 401);
    const ok = await json('/api/admin/login', { email: 'SyrixCompany@gmail.com', password: 'correct horse battery' });
    assert.equal(ok.status, 200);
    const setCookie = ok.headers.get('set-cookie');
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /SameSite=Strict/);
    const cookie = setCookie.split(';')[0];
    assert.equal((await json('/api/admin/me', null, cookie)).status, 200);
    assert.equal((await json('/api/admin/me', null, cookie.replace(/.$/, (c) => (c === 'A' ? 'B' : 'A')))).status, 401);
    const list = await (await json('/api/admin/signups?product=wharise', null, cookie)).json();
    assert.equal(list.total, 2);
    const searched = await (await json('/api/admin/signups?q=b@x', null, cookie)).json();
    assert.equal(searched.total, 2);
    const del = await fetch(`${base}/api/admin/signups/${list.rows[0].id}`, { method: 'DELETE', headers: { cookie } });
    assert.equal(del.status, 200);
    const stats = await (await json('/api/admin/stats', null, cookie)).json();
    assert.equal(stats.counts.wharise, 1);
    assert.ok(Array.isArray(stats.daily));
  } finally {
    server.close();
    await store.close();
  }
});
