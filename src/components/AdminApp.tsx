import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Download, Loader2, LogOut, Search, Trash2 } from 'lucide-react';
import { setLang, t, useLang } from '../i18n';
import { SyrixLogo, WhaRiseLogo } from './brand';

type Product = 'syrix-chat' | 'wharise';
type Row = { id: string; email: string; product: Product; lang: string; channel: string | null; source: string | null; created_at: string };
type Stats = { counts: Record<Product, number>; daily: { day: string; product: Product; n: number }[] };
const NAMES: Record<Product, string> = { 'syrix-chat': 'SYRIX CHAT', wharise: 'WhaRise' };
const COLORS: Record<Product, string> = { 'syrix-chat': 'var(--syrix)', wharise: 'var(--wr)' };

const api = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(path, { credentials: 'same-origin', ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'error'), { status: res.status });
  return data as T;
};

function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState('syrixcompany@gmail.com');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      onDone();
    } catch (err) {
      const status = (err as { status?: number }).status;
      setError(status === 503 ? t('admin.notConfigured') : status === 429 ? t('admin.tooMany') : t('admin.bad'));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="admin-login">
      <motion.form className="form" onSubmit={submit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="brand" style={{ marginBottom: 18 }}><SyrixLogo size={34} />{t('admin.title')}</div>
        <input className="field" type="email" autoComplete="username" aria-label={t('admin.email')} placeholder={t('admin.email')} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="field" style={{ marginTop: 10 }} type="password" autoComplete="current-password" aria-label={t('admin.password')} placeholder={t('admin.password')} value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn btn-primary" disabled={busy || !password}>{busy ? <Loader2 size={18} className="spin" /> : t('admin.signIn')}</button>
        {error && <p className="err" role="alert">{error}</p>}
      </motion.form>
    </div>
  );
}

function Chart({ daily }: { daily: Stats['daily'] }) {
  const days = useMemo(() => Array.from({ length: 30 }, (_, i) => new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10)), []);
  const by = (d: string, p: Product) => daily.find((x) => x.day === d && x.product === p)?.n ?? 0;
  const max = Math.max(1, ...days.map((d) => by(d, 'syrix-chat') + by(d, 'wharise')));
  return (
    <div className="chart" role="img" aria-label={t('admin.last30')}>
      {days.map((d) => {
        const a = by(d, 'syrix-chat'), b = by(d, 'wharise');
        return (
          <div key={d} className="col" title={`${d} · SYRIX CHAT ${a} · WhaRise ${b}`}>
            <span style={{ height: `${(b / max) * 100}%`, background: COLORS.wharise }} />
            <span style={{ height: `${(a / max) * 100}%`, background: COLORS['syrix-chat'] }} />
          </div>
        );
      })}
    </div>
  );
}

function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [product, setProduct] = useState<'' | Product>('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page), ...(product ? { product } : {}), ...(q.trim() ? { q: q.trim() } : {}) });
    try {
      const [s, l] = await Promise.all([api<Stats>('/api/admin/stats'), api<{ rows: Row[]; total: number }>(`/api/admin/signups?${qs}`)]);
      setStats(s);
      setRows(l.rows);
      setTotal(l.total);
    } catch (err) {
      if ((err as { status?: number }).status === 401) onSignOut();
    } finally {
      setLoading(false);
    }
  }, [page, product, q, onSignOut]);

  useEffect(() => {
    const id = setTimeout(() => void load(), q ? 250 : 0);
    return () => clearTimeout(id);
  }, [load, q]);

  const remove = async (r: Row) => {
    if (!window.confirm(t('admin.deleteConfirm', { email: r.email, app: NAMES[r.product] }))) return;
    await api(`/api/admin/signups/${r.id}`, { method: 'DELETE' });
    void load();
  };
  const signOut = async () => {
    await api('/api/admin/logout', { method: 'POST' }).catch(() => undefined);
    onSignOut();
  };
  const pages = Math.max(1, Math.ceil(total / 50));
  const sum = stats ? stats.counts['syrix-chat'] + stats.counts.wharise : 0;

  return (
    <div className="wrap admin">
      <div className="admin-top">
        <div className="brand"><SyrixLogo size={32} />{t('admin.title')}</div>
        <span className="spacer" />
        <a className="btn btn-ghost" href="/api/admin/export.csv"><Download size={16} />{t('admin.export')}</a>
        <button className="btn btn-ghost" onClick={signOut}><LogOut size={16} />{t('admin.signOut')}</button>
      </div>

      <div className="stat-grid">
        {[
          [t('admin.total'), sum, null],
          ['SYRIX CHAT', stats?.counts['syrix-chat'] ?? 0, <SyrixLogo key="s" size={26} />],
          ['WhaRise', stats?.counts.wharise ?? 0, <WhaRiseLogo key="w" size={26} />],
        ].map(([label, n, logo], i) => (
          <motion.div key={String(label)} className="stat" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className="stat-label">{logo}{label}</div>
            <div className="stat-n">{Number(n).toLocaleString()}</div>
          </motion.div>
        ))}
      </div>

      {stats && (
        <div className="panel">
          <div className="panel-h">{t('admin.last30')}</div>
          <Chart daily={stats.daily} />
        </div>
      )}

      <div className="panel">
        <div className="filters">
          <label className="search"><Search size={16} /><input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={t('admin.search')} /></label>
          <select value={product} onChange={(e) => { setProduct(e.target.value as '' | Product); setPage(1); }} aria-label={t('admin.colApp')}>
            <option value="">{t('admin.all')}</option>
            <option value="syrix-chat">SYRIX CHAT</option>
            <option value="wharise">WhaRise</option>
          </select>
          {loading && <Loader2 size={18} className="spin" />}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('admin.colEmail')}</th><th>{t('admin.colApp')}</th><th>{t('admin.colLang')}</th><th>{t('admin.colChannel')}</th><th>{t('admin.colSource')}</th><th>{t('admin.colDate')}</th><th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.email}</td>
                  <td><span className="badge" style={{ color: COLORS[r.product], borderColor: COLORS[r.product] }}>{NAMES[r.product]}</span></td>
                  <td>{r.lang.toUpperCase()}</td>
                  <td>{r.channel ? <a href={r.channel} target="_blank" rel="noopener noreferrer">{r.channel.replace('https://whatsapp.com/channel/', '…/')}</a> : '—'}</td>
                  <td>{r.source || '—'}</td>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                  <td><button className="icon-btn" onClick={() => remove(r)} aria-label={t('admin.delete')} title={t('admin.delete')}><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && rows.length === 0 && <p className="empty">{t('admin.empty')}</p>}
        </div>
        <div className="pager">
          <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>{t('admin.prev')}</button>
          <span>{t('admin.page', { p: page, n: pages })}</span>
          <button className="btn btn-ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>{t('admin.next')}</button>
        </div>
      </div>
    </div>
  );
}

/** /syrixadmin: sign-in for syrixcompany@gmail.com, then counts, daily chart, searchable list, delete and CSV export. */
export default function AdminApp() {
  const lang = useLang();
  const [state, setState] = useState<'checking' | 'out' | 'in'>('checking');
  useEffect(() => {
    document.title = t('admin.title');
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    api('/api/admin/me').then(() => setState('in')).catch(() => setState('out'));
    return () => meta.remove();
  }, [lang]);
  return (
    <main className="admin-root">
      <div className="lang admin-lang" role="group" aria-label="Language">
        <button aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
        <button aria-pressed={lang === 'fr'} onClick={() => setLang('fr')}>FR</button>
      </div>
      {state === 'checking' && <div className="admin-login"><Loader2 className="spin" /></div>}
      {state === 'out' && <Login onDone={() => setState('in')} />}
      {state === 'in' && <Dashboard onSignOut={() => setState('out')} />}
    </main>
  );
}
