// Qaribu inside Nikosoko. Gate pass, premises, vacancies, receipts, invoices and quotes are not re-made here: they run on the
// Qaribu platform (qaribu-platform, the same server's other app), so they behave exactly as there. This module only carries
// the app's calls across:
//  1. the person is signed in to Nikosoko (phone proved by Nikosoko's own SMS code), checked by requireAuth;
//  2. the platform is asked for that phone's Qaribu session (POST /auth/bridge, guarded by the shared BRIDGE_SECRET);
//  3. the call is forwarded to the platform with that session. The secret and the session never reach the browser.
import http from 'http';
import https from 'https';

type Deps = { app: any; requireAuth: any };

const TARGET = new URL(process.env.QARIBU_API_URL || 'http://127.0.0.1:3100');
const lib = TARGET.protocol === 'https:' ? https : http;
const sessions = new Map<string, { token: string; until: number }>();
// Calls that arrive together (a screen asks for several things at once) share one request for the session.
const pending = new Map<string, Promise<string>>();
// Keep the connection to the platform open between calls instead of opening a new one each time.
const agent = new (lib as typeof http).Agent({ keepAlive: true, maxSockets: 32 });

const once = (opts: http.RequestOptions, body?: Buffer | string): Promise<{ status: number; text: string }> =>
  new Promise((resolve, reject) => {
    const r = lib.request({ host: TARGET.hostname, port: TARGET.port || (TARGET.protocol === 'https:' ? 443 : 80), agent, ...opts }, res => {
      const chunks: Buffer[] = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode || 502, text: Buffer.concat(chunks).toString('utf8') }));
    });
    r.setTimeout(20000, () => r.destroy(new Error('timeout')));
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });

// The Qaribu session for a phone (last 9 digits), kept until shortly before it expires.
function sessionFor(phone9: string): Promise<string> {
  const hit = sessions.get(phone9);
  if (hit && hit.until > Date.now()) return Promise.resolve(hit.token);
  const waiting = pending.get(phone9);
  if (waiting) return waiting;
  const fresh = newSession(phone9).finally(() => pending.delete(phone9));
  pending.set(phone9, fresh);
  return fresh;
}

async function newSession(phone9: string): Promise<string> {
  const secret = process.env.BRIDGE_SECRET || '';
  if (secret.length < 32) throw Object.assign(new Error('Qaribu is not connected yet. The server needs its BRIDGE_SECRET.'), { status: 503 });
  const payload = JSON.stringify({ phone: `+254${phone9}` });
  const r = await once({ method: 'POST', path: '/auth/bridge', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload), 'X-Bridge-Secret': secret } }, payload);
  const data = (() => { try { return JSON.parse(r.text); } catch { return {}; } })();
  if (r.status !== 200 || !data.token) console.warn(`[qaribu] session request refused: the platform answered ${r.status} ${String(data.error || '').slice(0, 80)}`);
  if (r.status !== 200 || !data.token) throw Object.assign(new Error('Qaribu could not sign you in right now. Try again in a moment.'), { status: 502 });
  sessions.set(phone9, { token: data.token, until: Math.min(Date.parse(data.expires_at) - 10 * 60 * 1000, Date.now() + 11 * 3600_000) });
  return data.token;
}

export function registerQaribuBridge({ app, requireAuth }: Deps) {
  app.use('/api/qaribu', requireAuth, async (req: any, res: any) => {
    const started = Date.now();
    // Say so in the log when a call is slow, with only the start of the path (no ids, no query), so the cause can be found.
    res.on('finish', () => {
      const ms = Date.now() - started;
      if (ms > 1500) console.warn(`[qaribu] slow ${req.method} ${String(req.originalUrl || '').split('?')[0].split('/').slice(0, 4).join('/')} ${res.statusCode} ${ms}ms`);
    });
    try {
      const token = await sessionFor(req.auth.phone);
      // A JSON body was already read by the app's parser; anything else (a logo or letterhead picture) is still a stream.
      const parsed = req.is('application/json') ? Buffer.from(JSON.stringify(req.body ?? {})) : null;
      const headers: Record<string, string | number> = { Authorization: `Bearer ${token}`, Accept: String(req.headers.accept || '*/*') };
      if (req.headers['content-type']) headers['Content-Type'] = String(req.headers['content-type']);
      if (parsed) headers['Content-Length'] = parsed.length;
      else if (req.headers['content-length']) headers['Content-Length'] = String(req.headers['content-length']);

      const upstream = lib.request({ host: TARGET.hostname, port: TARGET.port || (TARGET.protocol === 'https:' ? 443 : 80), method: req.method, path: req.url, headers, agent }, up => {
        const out: Record<string, string> = {};
        for (const h of ['content-type', 'cache-control', 'content-disposition']) if (up.headers[h]) out[h] = String(up.headers[h]);
        if (up.statusCode === 401) sessions.delete(req.auth.phone);
        res.writeHead(up.statusCode || 502, out);
        up.pipe(res);
      });
      upstream.setTimeout(30000, () => upstream.destroy(new Error('timeout')));
      upstream.on('error', (err: any) => { console.warn(`[qaribu] platform not reachable: ${err?.code || err?.message}`); if (!res.headersSent) res.status(502).json({ error: 'Qaribu is not answering right now. Try again in a moment.' }); else res.end(); });
      if (parsed) upstream.end(parsed);
      else if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'DELETE') upstream.end();
      else req.pipe(upstream);
    } catch (e: any) {
      res.status(e.status || 502).json({ error: e.message, message: e.message });
    }
  });
}
