// Waitlist storage in MongoDB (MongoDB Atlas on Render). A memory store is used by the tests.
//
// signups:  { email, product, lang, channel, source, seq, createdAt }  unique (email, product)
// counters: { _id: product, seq }  gives each new signup an increasing number per product.
// A visitor's position is the number of signups of that product with seq <= theirs.

export async function createStore({ mongoUri, dbName } = {}) {
  if (!mongoUri) return createMemoryStore();
  const { MongoClient } = await import('mongodb');
  const client = new MongoClient(mongoUri, { maxPoolSize: 10, serverSelectionTimeoutMS: 10000 });
  await client.connect();
  const db = client.db(dbName || undefined);
  const signups = db.collection('signups');
  const counters = db.collection('counters');
  await signups.createIndex({ email: 1, product: 1 }, { unique: true });
  await signups.createIndex({ product: 1, seq: 1 });

  const positionOf = (doc) => signups.countDocuments({ product: doc.product, seq: { $lte: doc.seq } });

  return {
    kind: 'mongodb',
    async add(s, product) {
      const existing = await signups.findOne({ email: s.email, product });
      if (existing) return { position: await positionOf(existing), existing: true };
      const c = await counters.findOneAndUpdate({ _id: product }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: 'after' });
      const doc = { email: s.email, product, lang: s.lang, channel: s.channel, source: s.source, seq: c.seq, createdAt: new Date() };
      try {
        await signups.insertOne(doc);
      } catch (e) {
        // Same e-mail submitted twice at the same moment: the other request won, report its row.
        if (e?.code !== 11000) throw e;
        const won = await signups.findOne({ email: s.email, product });
        return { position: await positionOf(won), existing: true };
      }
      return { position: await positionOf(doc), existing: false };
    },
    async counts() {
      const rows = await signups.aggregate([{ $group: { _id: '$product', n: { $sum: 1 } } }]).toArray();
      return Object.fromEntries(rows.map((r) => [r._id, r.n]));
    },
    async all() {
      const rows = await signups.find({}, { sort: { createdAt: 1 } }).toArray();
      return rows.map((r) => ({ id: r._id.toHexString(), email: r.email, product: r.product, lang: r.lang, channel: r.channel, source: r.source, created_at: r.createdAt.toISOString() }));
    },
    ping: () => db.command({ ping: 1 }),
    close: () => client.close(),
  };
}

/** In-memory store with the same behaviour, for tests and for trying the site without a database. */
export function createMemoryStore() {
  const rows = [];
  const seq = {};
  return {
    kind: 'memory',
    async add(s, product) {
      const found = rows.find((r) => r.email === s.email && r.product === product);
      const pos = (r) => rows.filter((x) => x.product === product && x.seq <= r.seq).length;
      if (found) return { position: pos(found), existing: true };
      const r = { id: String(rows.length + 1), ...s, product, seq: (seq[product] = (seq[product] || 0) + 1), created_at: new Date().toISOString() };
      rows.push(r);
      return { position: pos(r), existing: false };
    },
    async counts() {
      return rows.reduce((a, r) => ({ ...a, [r.product]: (a[r.product] || 0) + 1 }), {});
    },
    async all() {
      return rows.map(({ id, email, product, lang, channel, source, created_at }) => ({ id, email, product, lang, channel, source, created_at }));
    },
    ping: async () => undefined,
    close: async () => undefined,
  };
}
