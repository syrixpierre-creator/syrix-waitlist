import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const SESSION_HOURS = 12;

/**
 * Admin sign-in for /syrixadmin: one e-mail (ADMIN_EMAIL) and one password (ADMIN_PASSWORD, kept in the
 * host's secret settings, never in the code). Sessions are HMAC-signed cookies, so no session store is needed.
 */
export function createAdminAuth({ email, password, secret, secure }) {
  const enabled = Boolean(email && password && password.length >= 12);
  const key = secret || randomBytes(32).toString('hex');
  // Compare password hashes, not strings, so timing does not leak the length or content.
  const salt = randomBytes(16);
  const expected = enabled ? scryptSync(password, salt, 32) : null;

  const sign = (payload) => createHmac('sha256', key).update(payload).digest('base64url');
  const issue = () => {
    const exp = Date.now() + SESSION_HOURS * 3600 * 1000;
    const payload = `${email}|${exp}`;
    return `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`;
  };
  const verify = (cookie) => {
    if (!cookie) return false;
    const [b64, mac] = cookie.split('.');
    if (!b64 || !mac) return false;
    const payload = Buffer.from(b64, 'base64url').toString();
    const good = sign(payload);
    if (mac.length !== good.length || !timingSafeEqual(Buffer.from(mac), Buffer.from(good))) return false;
    const [who, exp] = payload.split('|');
    return who === email && Number(exp) > Date.now();
  };

  return {
    enabled,
    email,
    checkCredentials(e, p) {
      if (!enabled || typeof e !== 'string' || typeof p !== 'string' || p.length > 200) return false;
      const okEmail = e.trim().toLowerCase() === email.toLowerCase();
      const okPass = timingSafeEqual(scryptSync(p, salt, 32), expected);
      return okEmail && okPass;
    },
    cookie: (value, maxAge) =>
      `wl_admin=${value}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? '; Secure' : ''}`,
    issue,
    verify,
    maxAge: SESSION_HOURS * 3600,
  };
}

export const readCookie = (req, name) =>
  (req.headers.cookie || '').split(';').map((s) => s.trim()).find((s) => s.startsWith(`${name}=`))?.slice(name.length + 1) ?? null;
