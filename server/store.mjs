// Waitlist storage: PostgreSQL when DATABASE_URL is set (needed on Vercel), SQLite file otherwise.
const SCHEMA = `
CREATE TABLE IF NOT EXISTS signups (
  id ${'%ID%'},
  email TEXT NOT NULL,
  product TEXT NOT NULL,
  lang TEXT NOT NULL,
  channel TEXT,
  source TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (email, product)
)`;

export async function createStore({ databaseUrl, sqlitePath = 'data/waitlist.db' } = {}) {
  if (databaseUrl) {
    const { default: pg } = await import('pg');
    const pool = new pg.Pool({ connectionString: databaseUrl, max: 5, ssl: /sslmode=require|neon\.tech|supabase/.test(databaseUrl) ? { rejectUnauthorized: false } : undefined });
    await pool.query(SCHEMA.replace('%ID%', 'BIGSERIAL PRIMARY KEY'));
    return {
      kind: 'postgres',
      async add(s, product) {
        const ins = await pool.query(
          `INSERT INTO signups (email, product, lang, channel, source, created_at) VALUES ($1,$2,$3,$4,$5,$6)
           ON CONFLICT (email, product) DO NOTHING RETURNING id`,
          [s.email, product, s.lang, s.channel, s.source, new Date().toISOString()],
        );
        const row = ins.rows[0] ?? (await pool.query('SELECT id FROM signups WHERE email=$1 AND product=$2', [s.email, product])).rows[0];
        const pos = await pool.query('SELECT COUNT(*)::int AS n FROM signups WHERE product=$1 AND id <= $2', [product, row.id]);
        return { position: pos.rows[0].n, existing: ins.rows.length === 0 };
      },
      async counts() {
        const r = await pool.query('SELECT product, COUNT(*)::int AS n FROM signups GROUP BY product');
        return Object.fromEntries(r.rows.map((x) => [x.product, x.n]));
      },
      async all() {
        return (await pool.query('SELECT id, email, product, lang, channel, source, created_at FROM signups ORDER BY id')).rows;
      },
      close: () => pool.end(),
    };
  }

  const { default: Database } = await import('better-sqlite3');
  if (sqlitePath !== ':memory:') {
    const { mkdirSync } = await import('node:fs');
    const { dirname } = await import('node:path');
    mkdirSync(dirname(sqlitePath), { recursive: true });
  }
  const db = new Database(sqlitePath);
  db.pragma('journal_mode = WAL');
  db.exec(SCHEMA.replace('%ID%', 'INTEGER PRIMARY KEY AUTOINCREMENT'));
  const insert = db.prepare('INSERT OR IGNORE INTO signups (email, product, lang, channel, source, created_at) VALUES (?,?,?,?,?,?)');
  const find = db.prepare('SELECT id FROM signups WHERE email=? AND product=?');
  const position = db.prepare('SELECT COUNT(*) AS n FROM signups WHERE product=? AND id <= ?');
  return {
    kind: 'sqlite',
    async add(s, product) {
      const r = insert.run(s.email, product, s.lang, s.channel, s.source, new Date().toISOString());
      const id = find.get(s.email, product).id;
      return { position: position.get(product, id).n, existing: r.changes === 0 };
    },
    async counts() {
      return Object.fromEntries(db.prepare('SELECT product, COUNT(*) AS n FROM signups GROUP BY product').all().map((x) => [x.product, x.n]));
    },
    async all() {
      return db.prepare('SELECT id, email, product, lang, channel, source, created_at FROM signups ORDER BY id').all();
    },
    close: async () => db.close(),
  };
}
