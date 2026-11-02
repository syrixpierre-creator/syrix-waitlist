import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { getLang, t, type Key } from '../i18n';
import { SyrixLogo, WhaRiseLogo } from './brand';

type Product = 'syrix-chat' | 'wharise';
type Result = { product: Product; position: number; existing: boolean };
const NAMES: Record<Product, string> = { 'syrix-chat': 'SYRIX CHAT', wharise: 'WhaRise' };
const KNOWN_ERRORS = new Set(['err.invalid_email', 'err.no_product', 'err.invalid_channel', 'err.rate_limited']);

/** The real waitlist form: posts to /api/waitlist and shows the position returned by the server. */
export default function WaitlistForm({ id }: { id?: string }) {
  const [email, setEmail] = useState('');
  const [products, setProducts] = useState<Product[]>(['syrix-chat', 'wharise']);
  const [channel, setChannel] = useState('');
  const [website, setWebsite] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Result[] | null>(null);

  const toggle = (p: Product) => setProducts((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (products.length === 0) return setError(t('err.no_product'));
    setBusy(true);
    try {
      const source = new URLSearchParams(location.search).get('utm_source') || undefined;
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, products, lang: getLang(), channel: products.includes('wharise') ? channel : '', website, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'generic');
      setResults(data.results);
    } catch (err) {
      const key = `err.${(err as Error).message}`;
      setError(t(KNOWN_ERRORS.has(key) ? (key as Key) : 'err.generic'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="form" id={id}>
      <AnimatePresence mode="wait" initial={false}>
        {results ? (
          <motion.div key="done" className="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <motion.div className="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 16 }}>
              <Check size={32} strokeWidth={3} />
            </motion.div>
            <h3>{t('form.done')}</h3>
            {results.map((r) => (
              <p key={r.product}>{t(r.existing ? 'form.already' : 'form.position', { n: r.position, p: NAMES[r.product] })}</p>
            ))}
            <button className="again" onClick={() => { setResults(null); setEmail(''); setChannel(''); }}>{t('form.again')}</button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }} noValidate>
            <label className="hp" aria-hidden="true">
              Website <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </label>
            <input className="field" type="email" required autoComplete="email" inputMode="email" placeholder={t('form.email')} aria-label={t('form.email')} value={email} onChange={(e) => setEmail(e.target.value)} />
            <p className="pick-label">{t('form.pick')}</p>
            <div className="picks">
              {(['syrix-chat', 'wharise'] as Product[]).map((p) => (
                <button key={p} type="button" className={`pick ${p === 'wharise' ? 'wr' : 'syrix'}`} aria-pressed={products.includes(p)} onClick={() => toggle(p)}>
                  <span className="logo">{p === 'wharise' ? <WhaRiseLogo size={34} /> : <SyrixLogo size={34} />}</span>
                  {NAMES[p]}
                  <span className="check">{products.includes(p) && <Check size={14} strokeWidth={3.5} color={p === 'wharise' ? '#04140a' : '#fff'} />}</span>
                </button>
              ))}
            </div>
            <AnimatePresence initial={false}>
              {products.includes('wharise') && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                  <p className="pick-label">{t('form.channel')}</p>
                  <input className="field" type="url" inputMode="url" placeholder={t('form.channelPh')} aria-label={t('form.channel')} value={channel} onChange={(e) => setChannel(e.target.value)} />
                </motion.div>
              )}
            </AnimatePresence>
            <button className="btn btn-primary" disabled={busy}>
              {busy ? <><Loader2 size={18} className="spin" />{t('form.sending')}</> : <>{t('form.submit')}<ArrowRight size={18} /></>}
            </button>
            {error && <p className="err" role="alert">{error}</p>}
            <p className="hint">{t('form.privacy')}</p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
