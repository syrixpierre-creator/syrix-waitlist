export const PRODUCTS = ['syrix-chat', 'wharise'];
export const LANGS = ['en', 'fr'];

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,63}$/;

export const normalizeEmail = (v) => String(v ?? '').trim().toLowerCase();

/** Validates a waitlist request body. Returns { ok, value } or { ok: false, code }. */
export function parseSignup(body) {
  if (!body || typeof body !== 'object') return { ok: false, code: 'invalid_body' };
  // Honeypot: real people never fill this hidden field.
  if (typeof body.website === 'string' && body.website.trim() !== '') return { ok: false, code: 'spam' };
  const email = normalizeEmail(body.email);
  if (email.length > 254 || !EMAIL.test(email)) return { ok: false, code: 'invalid_email' };
  const products = [...new Set(Array.isArray(body.products) ? body.products : [])].filter((p) => PRODUCTS.includes(p));
  if (products.length === 0) return { ok: false, code: 'no_product' };
  const lang = LANGS.includes(body.lang) ? body.lang : 'en';
  let channel = typeof body.channel === 'string' ? body.channel.trim().slice(0, 300) : '';
  if (channel && !/^https:\/\/(www\.)?whatsapp\.com\/channel\/[A-Za-z0-9]+/.test(channel)) return { ok: false, code: 'invalid_channel' };
  const source = typeof body.source === 'string' ? body.source.trim().slice(0, 80) : '';
  return { ok: true, value: { email, products, lang, channel: channel || null, source: source || null } };
}
