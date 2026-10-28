import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// ---------- Signed login tokens (HMAC-SHA256) ----------

function loadSecret(): string {
  const fromEnv = process.env.TOKEN_SECRET;
  if (fromEnv && fromEnv.length >= 24) return fromEnv;
  const file = path.join(process.cwd(), '.token_secret');
  try {
    const saved = fs.readFileSync(file, 'utf8').trim();
    if (saved.length >= 32) return saved;
  } catch (_) {}
  const fresh = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(file, fresh, { mode: 0o600 });
  return fresh;
}

const SECRET = loadSecret();
const b64url = (b: Buffer | string) => Buffer.from(b).toString('base64url');

export interface TokenPayload {
  sub: string;                 // provider id
  phone: string;               // last 9 digits
  role: string;
  amr: 'sms' | 'totp';         // how the person proved who they are
  exp: number;                 // ms since epoch
}

export function signToken(p: Omit<TokenPayload, 'exp'>, ttlMs: number): string {
  const body = b64url(JSON.stringify({ ...p, exp: Date.now() + ttlMs }));
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyToken(token: string): TokenPayload | null {
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TokenPayload;
    return p.exp > Date.now() ? p : null;
  } catch { return null; }
}

// ---------- Authenticator app codes (TOTP, RFC 6238) ----------

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buf: Buffer): string {
  let bits = 0, val = 0, out = '';
  for (const byte of buf) {
    val = (val << 8) | byte; bits += 8;
    while (bits >= 5) { out += B32[(val >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += B32[(val << (5 - bits)) & 31];
  return out;
}

export function base32Decode(s: string): Buffer {
  let bits = 0, val = 0;
  const out: number[] = [];
  for (const c of s.toUpperCase().replace(/[^A-Z2-7]/g, '')) {
    val = (val << 5) | B32.indexOf(c); bits += 5;
    if (bits >= 8) { out.push((val >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(out);
}

export const newTotpSecret = () => base32Encode(crypto.randomBytes(20));

export function hotp(secret: Buffer, counter: number, digits = 6): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = crypto.createHmac('sha1', secret).update(msg).digest();
  const o = h[h.length - 1] & 15;
  const n = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 10 ** digits).padStart(digits, '0');
}

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

/** Returns the matched 30-second step, or null. Accepts one step either side for clock drift,
 * and refuses any step at or before lastStep so a code cannot be used twice. */
export function checkTotp(secretB32: string, code: string, lastStep: number, now = Date.now()): number | null {
  const clean = String(code || '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(clean)) return null;
  const secret = base32Decode(secretB32);
  const current = Math.floor(now / 30000);
  for (const step of [current - 1, current, current + 1]) {
    if (step > lastStep && safeEqual(hotp(secret, step), clean)) return step;
  }
  return null;
}

export const otpauthUrl = (secretB32: string, label: string) =>
  `otpauth://totp/NikoSoko:${encodeURIComponent(label)}?secret=${secretB32}&issuer=NikoSoko&algorithm=SHA1&digits=6&period=30`;

// ---------- Backup codes ----------

const BACKUP_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function newBackupCodes(n = 8): string[] {
  return Array.from({ length: n }, () => {
    const pick = () => Array.from({ length: 4 }, () => BACKUP_CHARS[crypto.randomInt(BACKUP_CHARS.length)]).join('');
    return `${pick()}-${pick()}`;
  });
}
export const hashBackupCode = (c: string) => crypto.createHash('sha256').update(c.toUpperCase().replace(/[^A-Z0-9]/g, '')).digest('hex');

// ---------- Attempt limiter (per key, in memory) ----------

const attempts = new Map<string, { n: number; resetAt: number }>();
export function tooManyAttempts(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || rec.resetAt < now) { attempts.set(key, { n: 1, resetAt: now + windowMs }); return false; }
  rec.n += 1;
  return rec.n > max;
}
export const clearAttempts = (key: string) => attempts.delete(key);
