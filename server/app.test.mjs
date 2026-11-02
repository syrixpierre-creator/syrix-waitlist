import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './app.mjs';
import { createStore } from './store.mjs';
import { parseSignup } from './validate.mjs';

async function boot() {
  const store = await createStore({ sqlitePath: ':memory:' });
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
