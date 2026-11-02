// Qaribu inside Nikosoko: places, gate pass, receipts, invoices and quotes on Nikosoko's own database.
// It follows Qaribu's rules: a pass is single use and short lived, the guard link is not an account, documents
// are append-only history (no edit route exists; a payment, a cancel or a conversion is an added event).
import crypto from 'crypto';
import express from 'express';

const express_urlencoded = express.urlencoded({ extended: false });

type Deps = {
  app: any; requireAuth: any;
  queryAll: (sql: string, p?: any[]) => any[]; queryOne: (sql: string, p?: any[]) => any; runSql: (sql: string, p?: any[]) => void;
  last9: (s: any) => string;
};

const HOST_ROLES = ['owner', 'manager', 'caretaker', 'tenant'];
const GATE_ROLES = ['owner', 'manager', 'gateman'];
const TEAM_ROLES = ['manager', 'caretaker', 'tenant', 'gateman'];
const PASS_HOURS = 24;
const esc = (s: any) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
const tok = () => crypto.randomBytes(12).toString('base64url');
const code6 = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
const fmtCode = (c: string) => `${c.slice(0, 3)} ${c.slice(3)}`;

export function registerQaribu(d: Deps) {
  const { app, requireAuth, queryAll, queryOne, runSql, last9 } = d;

  // runSql runs one statement at a time, so each table is its own call.
  `
    CREATE TABLE IF NOT EXISTS qb_places (id TEXT PRIMARY KEY, ownerPhone TEXT, ownerName TEXT, name TEXT, kind TEXT, area TEXT, about TEXT,
      gatepass INTEGER DEFAULT 0, guardToken TEXT, createdAt TEXT);
    CREATE TABLE IF NOT EXISTS qb_members (placeId TEXT, phone TEXT, name TEXT, role TEXT, PRIMARY KEY (placeId, phone));
    CREATE TABLE IF NOT EXISTS qb_vacancies (id TEXT PRIMARY KEY, placeId TEXT, title TEXT, rent TEXT, note TEXT, status TEXT DEFAULT 'open', confirmedAt TEXT);
    CREATE TABLE IF NOT EXISTS qb_passes (id TEXT PRIMARY KEY, placeId TEXT, hostPhone TEXT, hostLabel TEXT, visitorName TEXT, visitorPhone TEXT,
      purpose TEXT, code TEXT, token TEXT, status TEXT DEFAULT 'waiting', expiresAt TEXT, arrivedAt TEXT, leftAt TEXT, admittedBy TEXT, createdAt TEXT);
    CREATE TABLE IF NOT EXISTS qb_docs (id TEXT PRIMARY KEY, ownerPhone TEXT, kind TEXT, number TEXT, customerName TEXT, customerPhone TEXT,
      items TEXT, total REAL, paid REAL DEFAULT 0, state TEXT DEFAULT 'open', note TEXT, token TEXT, fromDoc TEXT, createdAt TEXT);
    CREATE TABLE IF NOT EXISTS qb_doc_events (id INTEGER PRIMARY KEY AUTOINCREMENT, docId TEXT, event TEXT, data TEXT, at TEXT);
  `.split(';').map(x => x.trim()).filter(Boolean).forEach(stmt => runSql(stmt));

  const now = () => new Date().toISOString();
  const base = (req: any) => `${req.headers['x-forwarded-proto'] || req.protocol}://${req.get('host')}`;
  const me = (req: any): string => req.auth.phone;
  const roleOf = (placeId: string, phone: string): string | null => {
    const pl = queryOne('SELECT ownerPhone FROM qb_places WHERE id = ?', [placeId]);
    if (!pl) return null;
    if (pl.ownerPhone === phone) return 'owner';
    return queryOne('SELECT role FROM qb_members WHERE placeId = ? AND phone = ?', [placeId, phone])?.role || null;
  };
  const passState = (p: any): 'waiting' | 'arrived' | 'left' | 'expired' | 'cancelled' => {
    if (p.status === 'cancelled') return 'cancelled';
    if (p.status === 'arrived') return p.leftAt ? 'left' : 'arrived';
    return new Date(p.expiresAt).getTime() <= Date.now() ? 'expired' : 'waiting';
  };
  const passOut = (p: any, req: any) => {
    const link = `${base(req)}/g/${p.token}`;
    const place = queryOne('SELECT name FROM qb_places WHERE id = ?', [p.placeId]);
    const text = `Hi ${p.visitorName}, ${p.hostLabel || 'your host'} has invited you to ${place?.name || 'the premises'}. Show this at the gate: ${link}`;
    const num = String(p.visitorPhone || '').replace(/\D/g, '');
    return { id: p.id, placeId: p.placeId, visitorName: p.visitorName, visitorPhone: p.visitorPhone, purpose: p.purpose, hostLabel: p.hostLabel,
      code: fmtCode(p.code), state: passState(p), expiresAt: p.expiresAt, arrivedAt: p.arrivedAt, leftAt: p.leftAt, link,
      smsLink: `sms:${num}?body=${encodeURIComponent(text)}`, whatsappLink: `https://wa.me/${num}?text=${encodeURIComponent(text)}`, text };
  };

  // ---------- Places ----------
  app.get('/api/qaribu/places', requireAuth, (req: any, res: any) => {
    const ph = me(req);
    const rows = queryAll(`SELECT * FROM qb_places WHERE ownerPhone = ? OR id IN (SELECT placeId FROM qb_members WHERE phone = ?) ORDER BY createdAt DESC`, [ph, ph]);
    res.json(rows.map((p: any) => ({
      id: p.id, name: p.name, kind: p.kind, area: p.area, about: p.about, gatepass: !!p.gatepass, role: roleOf(p.id, ph),
      guardLink: p.gatepass && ['owner', 'manager'].includes(roleOf(p.id, ph) || '') ? `${base(req)}/v/${p.guardToken}` : undefined,
      pageLink: `${base(req)}/q/${p.id}`,
      members: queryAll('SELECT phone, name, role FROM qb_members WHERE placeId = ?', [p.id]),
      vacancies: queryAll('SELECT * FROM qb_vacancies WHERE placeId = ? ORDER BY confirmedAt DESC', [p.id]),
    })));
  });

  app.post('/api/qaribu/places', requireAuth, (req: any, res: any) => {
    const name = String(req.body.name || '').trim().slice(0, 80);
    if (!name) return res.status(400).json({ error: 'Give the place a name.' });
    const id = `pl-${tok()}`;
    const owner = queryOne('SELECT name FROM providers WHERE id = ?', [req.auth.sub]);
    runSql('INSERT INTO qb_places (id, ownerPhone, ownerName, name, kind, area, about, gatepass, guardToken, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [id, me(req), owner?.name || '', name, String(req.body.kind || 'residential').slice(0, 30), String(req.body.area || '').slice(0, 80), String(req.body.about || '').slice(0, 400), 0, tok() + tok(), now()]);
    res.json({ id });
  });

  app.post('/api/qaribu/places/:id/gatepass', requireAuth, (req: any, res: any) => {
    if (roleOf(req.params.id, me(req)) !== 'owner') return res.status(403).json({ error: 'Only the owner can switch gate pass on or off.' });
    runSql('UPDATE qb_places SET gatepass = ? WHERE id = ?', [req.body.enabled ? 1 : 0, req.params.id]);
    res.json({ ok: true });
  });

  app.post('/api/qaribu/places/:id/members', requireAuth, (req: any, res: any) => {
    const r = roleOf(req.params.id, me(req));
    if (r !== 'owner' && r !== 'manager') return res.status(403).json({ error: 'Only the owner or a manager can add people.' });
    const phone = last9(req.body.phone); const role = String(req.body.role || '');
    if (phone.length !== 9 || !TEAM_ROLES.includes(role)) return res.status(400).json({ error: 'Enter a phone number and pick a role.' });
    runSql('INSERT OR REPLACE INTO qb_members (placeId, phone, name, role) VALUES (?,?,?,?)', [req.params.id, phone, String(req.body.name || '').slice(0, 60), role]);
    res.json({ ok: true });
  });

  app.delete('/api/qaribu/places/:id/members/:phone', requireAuth, (req: any, res: any) => {
    const r = roleOf(req.params.id, me(req));
    if (r !== 'owner' && r !== 'manager') return res.status(403).json({ error: 'Only the owner or a manager can remove people.' });
    runSql('DELETE FROM qb_members WHERE placeId = ? AND phone = ?', [req.params.id, last9(req.params.phone)]);
    res.json({ ok: true });
  });

  app.post('/api/qaribu/places/:id/vacancies', requireAuth, (req: any, res: any) => {
    if (!['owner', 'manager', 'caretaker'].includes(roleOf(req.params.id, me(req)) || '')) return res.status(403).json({ error: 'Not allowed.' });
    const title = String(req.body.title || '').trim().slice(0, 80);
    if (!title) return res.status(400).json({ error: 'Describe the vacancy.' });
    runSql('INSERT INTO qb_vacancies (id, placeId, title, rent, note, status, confirmedAt) VALUES (?,?,?,?,?,?,?)',
      [`vc-${tok()}`, req.params.id, title, String(req.body.rent || '').slice(0, 40), String(req.body.note || '').slice(0, 200), 'open', now()]);
    res.json({ ok: true });
  });

  app.post('/api/qaribu/vacancies/:id', requireAuth, (req: any, res: any) => {
    const v = queryOne('SELECT * FROM qb_vacancies WHERE id = ?', [req.params.id]);
    if (!v || !['owner', 'manager', 'caretaker'].includes(roleOf(v.placeId, me(req)) || '')) return res.status(403).json({ error: 'Not allowed.' });
    const action = req.body.action;
    if (action === 'confirm') runSql('UPDATE qb_vacancies SET confirmedAt = ? WHERE id = ?', [now(), v.id]);
    else if (action === 'fill') runSql("UPDATE qb_vacancies SET status = 'filled' WHERE id = ?", [v.id]);
    else if (action === 'remove') runSql('DELETE FROM qb_vacancies WHERE id = ?', [v.id]);
    else return res.status(400).json({ error: 'Unknown action.' });
    res.json({ ok: true });
  });

  // ---------- Gate pass ----------
  app.post('/api/qaribu/places/:id/passes', requireAuth, (req: any, res: any) => {
    const ph = me(req); const role = roleOf(req.params.id, ph);
    const place = queryOne('SELECT * FROM qb_places WHERE id = ?', [req.params.id]);
    if (!place || !role || !HOST_ROLES.includes(role)) return res.status(403).json({ error: 'You cannot invite visitors to this place.' });
    if (!place.gatepass) return res.status(400).json({ error: 'Gate pass is not switched on for this place yet.' });
    const visitorName = String(req.body.visitorName || '').trim().slice(0, 60);
    const visitorPhone = last9(req.body.visitorPhone);
    const purpose = String(req.body.purpose || '').trim().slice(0, 100);
    if (!visitorName || visitorPhone.length !== 9 || !purpose) return res.status(400).json({ error: "Enter the visitor's name, phone number and reason for visiting." });
    const recent = queryOne("SELECT COUNT(*) AS n FROM qb_passes WHERE hostPhone = ? AND createdAt > ?", [ph, new Date(Date.now() - 3600_000).toISOString()]);
    if (recent && recent.n >= 30) return res.status(429).json({ error: 'Too many invitations in the last hour. Try again later.' });
    const host = queryOne('SELECT name FROM providers WHERE id = ?', [req.auth.sub]);
    const p = { id: `ps-${tok()}`, placeId: place.id, hostPhone: ph, hostLabel: String(req.body.hostLabel || host?.name || '').slice(0, 60),
      visitorName, visitorPhone: `254${visitorPhone}`, purpose, code: code6(), token: tok(), status: 'waiting',
      expiresAt: new Date(Date.now() + PASS_HOURS * 3600_000).toISOString(), createdAt: now() };
    runSql(`INSERT INTO qb_passes (id, placeId, hostPhone, hostLabel, visitorName, visitorPhone, purpose, code, token, status, expiresAt, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [p.id, p.placeId, p.hostPhone, p.hostLabel, p.visitorName, p.visitorPhone, p.purpose, p.code, p.token, p.status, p.expiresAt, p.createdAt]);
    res.json(passOut(p, req));
  });

  app.get('/api/qaribu/places/:id/passes', requireAuth, (req: any, res: any) => {
    const ph = me(req); const role = roleOf(req.params.id, ph);
    if (!role) return res.status(403).json({ error: 'Not allowed.' });
    const seeAll = GATE_ROLES.includes(role);
    const since = new Date(Date.now() - 48 * 3600_000).toISOString();
    const rows = queryAll(`SELECT * FROM qb_passes WHERE placeId = ? AND createdAt > ? ${seeAll ? '' : 'AND hostPhone = ?'} ORDER BY createdAt DESC LIMIT 100`,
      seeAll ? [req.params.id, since] : [req.params.id, since, ph]);
    res.json(rows.map((p: any) => passOut(p, req)));
  });

  app.post('/api/qaribu/passes/:id/cancel', requireAuth, (req: any, res: any) => {
    const p = queryOne('SELECT * FROM qb_passes WHERE id = ?', [req.params.id]);
    if (!p) return res.status(404).json({ error: 'Pass not found.' });
    const role = roleOf(p.placeId, me(req));
    if (p.hostPhone !== me(req) && role !== 'owner' && role !== 'manager') return res.status(403).json({ error: 'Not allowed.' });
    if (p.status === 'waiting') runSql("UPDATE qb_passes SET status = 'cancelled' WHERE id = ?", [p.id]);
    res.json({ ok: true });
  });

  // Checking a code, from a signed-in gateman/owner/manager or from the guard's shared link.
  const fails = new Map<string, number[]>();
  const tooMany = (key: string) => (fails.get(key) || []).filter(t => Date.now() - t < 600_000).length >= 6;
  const noteFail = (key: string) => fails.set(key, [...(fails.get(key) || []).filter(t => Date.now() - t < 600_000), Date.now()]);

  const lookup = (placeId: string, rawCode: string, key: string) => {
    const code = String(rawCode || '').replace(/[\s-]/g, '');
    if (tooMany(key)) return { error: 'Too many wrong codes. Wait ten minutes.' };
    const p = /^\d{6}$/.test(code) ? queryOne('SELECT * FROM qb_passes WHERE placeId = ? AND code = ?', [placeId, code]) : null;
    if (!p) { noteFail(key); return { error: 'No pass matches that code.' }; }
    return { pass: p };
  };
  const admit = (p: any, by: string) => {
    if (passState(p) !== 'waiting') return false;
    runSql("UPDATE qb_passes SET status = 'arrived', arrivedAt = ?, admittedBy = ? WHERE id = ?", [now(), by, p.id]);
    return true;
  };

  app.post('/api/qaribu/places/:id/verify', requireAuth, (req: any, res: any) => {
    if (!GATE_ROLES.includes(roleOf(req.params.id, me(req)) || '')) return res.status(403).json({ error: 'Only the gateman, manager or owner can check passes.' });
    const r: any = lookup(req.params.id, req.body.code, `u:${me(req)}`);
    if (r.error) return res.status(400).json({ error: r.error });
    res.json({ ...passOut(r.pass, req), host: r.pass.hostLabel });
  });
  app.post('/api/qaribu/passes/:id/admit', requireAuth, (req: any, res: any) => {
    const p = queryOne('SELECT * FROM qb_passes WHERE id = ?', [req.params.id]);
    if (!p || !GATE_ROLES.includes(roleOf(p.placeId, me(req)) || '')) return res.status(403).json({ error: 'Not allowed.' });
    res.json({ ok: admit(p, me(req)) });
  });
  app.post('/api/qaribu/passes/:id/leave', requireAuth, (req: any, res: any) => {
    const p = queryOne('SELECT * FROM qb_passes WHERE id = ?', [req.params.id]);
    if (!p || !GATE_ROLES.includes(roleOf(p.placeId, me(req)) || '')) return res.status(403).json({ error: 'Not allowed.' });
    if (p.status === 'arrived' && !p.leftAt) runSql('UPDATE qb_passes SET leftAt = ? WHERE id = ?', [now(), p.id]);
    res.json({ ok: true });
  });

  // ---------- Pages opened from a link (no account, no scripts) ----------
  const page = (title: string, body: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<style>body{margin:0;font-family:system-ui,sans-serif;background:#000;color:#fff;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:20px}
.c{background:#fff;color:#000;border-radius:20px;padding:28px;max-width:420px;width:100%}h1{margin:0 0 6px;font-size:22px}p{color:#555;margin:6px 0}
.code{font-size:44px;font-weight:800;letter-spacing:.12em;text-align:center;margin:18px 0}.ok{color:#0a8f55;font-weight:700}.bad{color:#b00020;font-weight:700}
input,button{width:100%;box-sizing:border-box;font-size:18px;padding:14px;border-radius:12px;border:1px solid #ccc;margin-top:10px}button{background:#000;color:#22C27A;border:0;font-weight:700}small{color:#888}</style></head><body><div class="c">${body}</div></body></html>`;

  app.get('/g/:token', (req: any, res: any) => {
    const p = queryOne('SELECT * FROM qb_passes WHERE token = ?', [req.params.token]);
    const place = p && queryOne('SELECT name FROM qb_places WHERE id = ?', [p.placeId]);
    if (!p) return res.status(404).send(page('Pass', '<h1>Pass not found</h1><p>Ask your host to send a new one.</p>'));
    const s = passState(p);
    res.set('Cache-Control', 'no-store').send(page('Gate pass', s === 'waiting'
      ? `<small>Gate pass</small><h1>${esc(place?.name)}</h1><p>Hello ${esc(p.visitorName)}. ${esc(p.hostLabel)} is expecting you.</p><div class="code">${fmtCode(p.code)}</div><p>Show this code to the guard. It works once and expires at ${esc(new Date(p.expiresAt).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }))}.</p>`
      : `<h1>This pass cannot be used</h1><p>It has been ${s === 'arrived' || s === 'left' ? 'used already' : s === 'expired' ? 'let to expire' : 'cancelled'}. Ask your host for a new one.</p>`));
  });

  const guardPage = (place: any, extra = '') => page('Guard', `<small>Guard check</small><h1>${esc(place.name)}</h1>${extra}
    <form method="post"><input name="code" inputmode="numeric" autocomplete="off" placeholder="6-digit code" required><button>Check pass</button></form>`);
  app.get('/v/:gt', (req: any, res: any) => {
    const place = queryOne('SELECT * FROM qb_places WHERE guardToken = ? AND gatepass = 1', [req.params.gt]);
    if (!place) return res.status(404).send(page('Guard', '<h1>Link not valid</h1>'));
    res.set('Cache-Control', 'no-store').send(guardPage(place));
  });
  app.post('/v/:gt', express_urlencoded, (req: any, res: any) => {
    const place = queryOne('SELECT * FROM qb_places WHERE guardToken = ? AND gatepass = 1', [req.params.gt]);
    if (!place) return res.status(404).send(page('Guard', '<h1>Link not valid</h1>'));
    res.set('Cache-Control', 'no-store');
    const r: any = lookup(place.id, req.body?.code, `g:${req.params.gt}`);
    if (r.error) return res.send(guardPage(place, `<p class="bad">${esc(r.error)}</p>`));
    const p = r.pass;
    if (req.body?.admit === p.id) {
      return res.send(guardPage(place, admit(p, 'guard link') ? `<p class="ok">${esc(p.visitorName)} admitted.</p>` : '<p class="bad">That pass can no longer be used.</p>'));
    }
    const s = passState(p);
    if (s !== 'waiting') return res.send(guardPage(place, `<p class="bad">Pass ${s === 'arrived' || s === 'left' ? 'already used' : s}.</p>`));
    res.send(page('Guard', `<small>Valid pass</small><h1>${esc(p.visitorName)}</h1><p>Visiting ${esc(p.hostLabel)}</p><p>Reason: ${esc(p.purpose)}</p>
      <form method="post"><input type="hidden" name="code" value="${esc(p.code)}"><input type="hidden" name="admit" value="${esc(p.id)}"><button>Admit</button></form>`));
  });

  // The place page a sticker opens: name, area and open vacancies.
  app.get('/q/:id', (req: any, res: any) => {
    const pl = queryOne('SELECT * FROM qb_places WHERE id = ?', [req.params.id]);
    if (!pl) return res.status(404).send(page('Place', '<h1>Place not found</h1>'));
    const v = queryAll("SELECT * FROM qb_vacancies WHERE placeId = ? AND status = 'open' ORDER BY confirmedAt DESC", [pl.id]);
    res.send(page(pl.name, `<h1>${esc(pl.name)}</h1><p>${esc(pl.area)}</p><p>${esc(pl.about)}</p>${v.length ? '<h3>Vacancies</h3>' + v.map((x: any) => `<p><b>${esc(x.title)}</b> ${esc(x.rent)}<br>${esc(x.note)}</p>`).join('') : '<p>No vacancies right now.</p>'}`));
  });

  // ---------- Receipts, invoices, quotes ----------
  const event = (docId: string, ev: string, data: any = {}) => runSql('INSERT INTO qb_doc_events (docId, event, data, at) VALUES (?,?,?,?)', [docId, ev, JSON.stringify(data), now()]);
  const docOut = (x: any, req: any) => {
    const items = JSON.parse(x.items || '[]');
    return { id: x.id, kind: x.kind, number: x.number, customerName: x.customerName, customerPhone: x.customerPhone, items, total: x.total, paid: x.paid,
      balance: x.kind === 'invoice' ? Math.max(0, x.total - x.paid) : 0, state: x.state, note: x.note, fromDoc: x.fromDoc, createdAt: x.createdAt,
      link: `${base(req)}/d/${x.token}`, events: queryAll('SELECT event, data, at FROM qb_doc_events WHERE docId = ? ORDER BY id', [x.id]).map((e: any) => ({ event: e.event, data: JSON.parse(e.data || '{}'), at: e.at })) };
  };
  const nextNumber = (phone: string, kind: string) => {
    const n = (queryOne('SELECT COUNT(*) AS n FROM qb_docs WHERE ownerPhone = ? AND kind = ?', [phone, kind])?.n || 0) + 1;
    return `${{ receipt: 'R', invoice: 'INV', quote: 'Q' }[kind]}-${String(n).padStart(4, '0')}`;
  };
  const cleanItems = (raw: any): { description: string; qty: number; price: number }[] =>
    (Array.isArray(raw) ? raw : []).slice(0, 50).map((i: any) => ({ description: String(i.description || '').trim().slice(0, 120), qty: Math.max(0, Number(i.qty) || 0), price: Math.max(0, Number(i.price) || 0) }))
      .filter(i => i.description && i.qty > 0);

  app.get('/api/qaribu/documents', requireAuth, (req: any, res: any) => {
    const ph = me(req);
    const q = String(req.query.q || '').trim().toLowerCase();
    const rows = queryAll('SELECT * FROM qb_docs WHERE ownerPhone = ? OR customerPhone = ? ORDER BY createdAt DESC LIMIT 300', [ph, `254${ph}`])
      .filter((x: any) => !q || [x.number, x.customerName, x.customerPhone, x.createdAt].some(v => String(v).toLowerCase().includes(q)));
    res.json(rows.map((x: any) => ({ ...docOut(x, req), mine: x.ownerPhone === ph })));
  });

  app.post('/api/qaribu/documents', requireAuth, (req: any, res: any) => {
    const kind = String(req.body.kind);
    if (!['receipt', 'invoice', 'quote'].includes(kind)) return res.status(400).json({ error: 'Choose receipt, invoice or quote.' });
    const items = cleanItems(req.body.items);
    if (!items.length) return res.status(400).json({ error: 'Add at least one item with a quantity and price.' });
    const customerName = String(req.body.customerName || '').trim().slice(0, 80);
    const cp = last9(req.body.customerPhone);
    if (!customerName) return res.status(400).json({ error: "Enter the customer's name." });
    if (req.body.customerPhone && cp.length !== 9) return res.status(400).json({ error: "That customer phone number doesn't look right." });
    const total = items.reduce((a, i) => a + i.qty * i.price, 0);
    const id = `dc-${tok()}`;
    runSql(`INSERT INTO qb_docs (id, ownerPhone, kind, number, customerName, customerPhone, items, total, paid, state, note, token, fromDoc, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, me(req), kind, nextNumber(me(req), kind), customerName, cp ? `254${cp}` : '', JSON.stringify(items), total, kind === 'receipt' ? total : 0, kind === 'receipt' ? 'paid' : 'open',
       String(req.body.note || '').slice(0, 300), tok(), null, now()]);
    event(id, 'issued');
    res.json(docOut(queryOne('SELECT * FROM qb_docs WHERE id = ?', [id]), req));
  });

  // A payment against an invoice is an added receipt-like event, and the balance follows from it.
  app.post('/api/qaribu/documents/:id/payment', requireAuth, (req: any, res: any) => {
    const x = queryOne('SELECT * FROM qb_docs WHERE id = ? AND ownerPhone = ?', [req.params.id, me(req)]);
    if (!x || x.kind !== 'invoice') return res.status(404).json({ error: 'Invoice not found.' });
    if (x.state === 'cancelled') return res.status(400).json({ error: 'This invoice was cancelled.' });
    const amount = Number(req.body.amount);
    if (!(amount > 0) || amount > x.total - x.paid) return res.status(400).json({ error: `Enter an amount up to ${x.total - x.paid}.` });
    const paid = x.paid + amount;
    runSql('UPDATE qb_docs SET paid = ?, state = ? WHERE id = ?', [paid, paid >= x.total ? 'paid' : 'part-paid', x.id]);
    event(x.id, 'payment', { amount, method: String(req.body.method || 'cash').slice(0, 20) });
    res.json(docOut(queryOne('SELECT * FROM qb_docs WHERE id = ?', [x.id]), req));
  });

  app.post('/api/qaribu/documents/:id/cancel', requireAuth, (req: any, res: any) => {
    const x = queryOne('SELECT * FROM qb_docs WHERE id = ? AND ownerPhone = ?', [req.params.id, me(req)]);
    if (!x || x.kind === 'receipt') return res.status(404).json({ error: 'Only an invoice or quote can be cancelled. A receipt is history.' });
    if (x.paid > 0) return res.status(400).json({ error: 'Payments were taken on this invoice, so it cannot be cancelled.' });
    runSql("UPDATE qb_docs SET state = 'cancelled' WHERE id = ?", [x.id]);
    event(x.id, 'cancelled');
    res.json(docOut(queryOne('SELECT * FROM qb_docs WHERE id = ?', [x.id]), req));
  });

  app.post('/api/qaribu/documents/:id/to-invoice', requireAuth, (req: any, res: any) => {
    const x = queryOne('SELECT * FROM qb_docs WHERE id = ? AND ownerPhone = ?', [req.params.id, me(req)]);
    if (!x || x.kind !== 'quote' || x.state !== 'open') return res.status(400).json({ error: 'Only an open quote can become an invoice.' });
    const id = `dc-${tok()}`;
    runSql(`INSERT INTO qb_docs (id, ownerPhone, kind, number, customerName, customerPhone, items, total, paid, state, note, token, fromDoc, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, x.ownerPhone, 'invoice', nextNumber(x.ownerPhone, 'invoice'), x.customerName, x.customerPhone, x.items, x.total, 0, 'open', x.note, tok(), x.id, now()]);
    runSql("UPDATE qb_docs SET state = 'invoiced' WHERE id = ?", [x.id]);
    event(x.id, 'invoiced', { invoice: id }); event(id, 'issued', { from: x.number });
    res.json(docOut(queryOne('SELECT * FROM qb_docs WHERE id = ?', [id]), req));
  });

  // The link a customer opens: a read-only view, no account needed.
  app.get('/d/:token', (req: any, res: any) => {
    const x = queryOne('SELECT * FROM qb_docs WHERE token = ?', [req.params.token]);
    if (!x) return res.status(404).send(page('Document', '<h1>Document not found</h1>'));
    const o = docOut(x, req);
    const seller = queryOne('SELECT name FROM providers WHERE substr(replace(phone, " ", ""), -9) = ?', [x.ownerPhone])?.name || '';
    res.set('Cache-Control', 'no-store').send(page(o.number, `<small>${esc(o.kind.toUpperCase())} ${esc(o.number)}</small><h1>${esc(seller || 'Nikosoko')}</h1><p>For ${esc(o.customerName)} · ${esc(new Date(o.createdAt).toLocaleDateString('en-KE'))}</p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0">${o.items.map((i: any) => `<tr><td>${esc(i.description)}<br><small>${i.qty} × ${i.price}</small></td><td style="text-align:right">${(i.qty * i.price).toLocaleString('en-KE')}</td></tr>`).join('')}</table>
      <p><b>Total KES ${o.total.toLocaleString('en-KE')}</b></p>${o.kind === 'invoice' ? `<p>Paid ${o.paid.toLocaleString('en-KE')} · Balance <b>${o.balance.toLocaleString('en-KE')}</b></p>` : ''}
      <p class="${o.state === 'cancelled' ? 'bad' : 'ok'}">${esc(o.state)}</p>${o.note ? `<p>${esc(o.note)}</p>` : ''}`));
  });
}
