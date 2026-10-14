import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

export const isProd = process.env.NODE_ENV === 'production';

let secret = process.env.SESSION_SECRET || '';
if (!secret) {
  if (isProd) {
    throw new Error('SESSION_SECRET must be set when NODE_ENV=production');
  }
  secret = crypto.randomBytes(32).toString('hex');
  console.warn('[auth] SESSION_SECRET is not set. Using a random per-boot secret; all sessions reset on restart.');
}

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const sign = (body: string) => crypto.createHmac('sha256', secret).update(body).digest('base64url');

/** Issue a signed session token: base64url(payload).signature */
export function signToken(sub: string): string {
  const body = Buffer.from(JSON.stringify({ sub, exp: Date.now() + TOKEN_TTL_MS })).toString('base64url');
  return `${body}.${sign(body)}`;
}

/** Returns the subject (provider id) if the token is genuine and unexpired. */
export function verifyToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (typeof payload.sub !== 'string' || typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    return payload.sub;
  } catch {
    return null;
  }
}

export interface AuthInfo {
  sub: string;
  role: string;
  isAdmin: boolean;
}

const bearer = (req: Request): string | null => {
  const h = req.headers.authorization;
  return h && h.startsWith('Bearer ') ? h.slice(7).trim() : null;
};

export const getAuth = (req: Request): AuthInfo | null => (req as any).auth || null;

/**
 * Builds the auth middlewares. The role is always read fresh from the database,
 * never from the token, so demoting an admin takes effect immediately.
 */
export function createAuth(getRole: (providerId: string) => string | null) {
  const attach = (req: Request) => {
    const sub = verifyToken(bearer(req));
    if (!sub) return null;
    const role = getRole(sub);
    if (role === null) return null; // account no longer exists
    const info: AuthInfo = { sub, role, isAdmin: role === 'SuperAdmin' };
    (req as any).auth = info;
    return info;
  };

  const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
    attach(req);
    next();
  };

  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!attach(req)) return res.status(401).json({ error: 'Sign in required' });
    next();
  };

  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const info = attach(req);
    if (!info) return res.status(401).json({ error: 'Sign in required' });
    if (!info.isAdmin) return res.status(403).json({ error: 'Admin access required' });
    next();
  };

  return { optionalAuth, requireAuth, requireAdmin };
}

// --- Minimal in-memory rate limiter (per process) ---
const hits = new Map<string, number[]>();

/** Returns true if the action is allowed, false if the limit is exceeded. */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter(t => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
