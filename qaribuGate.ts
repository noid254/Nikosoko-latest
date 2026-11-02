// Qaribu gate pass, premises and vacancies on Nikosoko's database. The routes and answers have the same shapes as
// the Qaribu platform's, so the Qaribu screens run unchanged. Rules kept from Qaribu:
//  - a pass is single use, lasts 24 hours, and the guard page limits wrong codes;
//  - the visitor's ID is written down only by the gateman, is stored write-only and is never sent back;
//  - what a person may do follows their role on the premise, checked again on every call.
import { Deps, tok, code6, fmtCode, now, base, page, esc, urlencoded, runAll } from './qaribuShared';

const HOST_ROLES = ['owner', 'manager', 'caretaker', 'tenant'];
const VACANCY_ROLES = ['owner', 'manager', 'caretaker'];
const GATE_ROLES = ['owner', 'manager', 'gateman'];
const ASSIGNABLE: Record<string, string[]> = { owner: ['manager', 'caretaker', 'tenant', 'gateman'], manager: ['caretaker', 'tenant', 'gateman'] };
const PASS_HOURS = 24;
const STALE_DAYS = 14;

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'premise';

export function registerQaribuGate(d: Deps) {
  const { app, requireAuth, queryAll, queryOne, runSql, last9 } = d;

  runAll(runSql, `
    CREATE TABLE IF NOT EXISTS qb_places (id TEXT PRIMARY KEY, ownerPhone TEXT, ownerName TEXT, name TEXT, kind TEXT, area TEXT, about TEXT,
      gatepass INTEGER DEFAULT 0, guardToken TEXT, createdAt TEXT);
    CREATE TABLE IF NOT EXISTS qb_members (placeId TEXT, phone TEXT, name TEXT, role TEXT, PRIMARY KEY (placeId, phone));
    CREATE TABLE IF NOT EXISTS qb_vacancies (id TEXT PRIMARY KEY, placeId TEXT, title TEXT, rent TEXT, note TEXT, status TEXT DEFAULT 'open', confirmedAt TEXT);
    CREATE TABLE IF NOT EXISTS qb_passes (id TEXT PRIMARY KEY, placeId TEXT, hostPhone TEXT, hostLabel TEXT, visitorName TEXT, visitorPhone TEXT,
      purpose TEXT, code TEXT, token TEXT, status TEXT DEFAULT 'waiting', expiresAt TEXT, arrivedAt TEXT, leftAt TEXT, admittedBy TEXT, createdAt TEXT);
    CREATE TABLE IF NOT EXISTS qb_waiting (id TEXT PRIMARY KEY, placeId TEXT, name TEXT, phone TEXT, lookingFor TEXT, since TEXT, told INTEGER DEFAULT 0);
  `);
  // Columns added after the first release. Each is tried on its own; one that exists already is skipped.
  for (const col of [
    'ALTER TABLE qb_places ADD COLUMN slug TEXT', 'ALTER TABLE qb_places ADD COLUMN county TEXT', 'ALTER TABLE qb_places ADD COLUMN tagline TEXT',
    'ALTER TABLE qb_places ADD COLUMN logTimes INTEGER DEFAULT 0', 'ALTER TABLE qb_places ADD COLUMN listed INTEGER DEFAULT 1',
    'ALTER TABLE qb_members ADD COLUMN id TEXT', 'ALTER TABLE qb_members ADD COLUMN since TEXT',
    'ALTER TABLE qb_vacancies ADD COLUMN vtype TEXT', 'ALTER TABLE qb_vacancies ADD COLUMN availableFrom TEXT',
    'ALTER TABLE qb_passes ADD COLUMN idNumber TEXT',
  ]) { try { runSql(col); } catch (_) { /* already there */ } }

  const uniqueSlug = (name: string) => {
    const b = slugify(name); let s = b;
    while (queryOne('SELECT 1 AS x FROM qb_places WHERE slug = ?', [s])) s = `${b}-${tok().slice(0, 3).toLowerCase().replace(/[^a-z0-9]/g, 'x')}`;
    return s;
  };
  // Places made in the first release have no slug, and team rows no id.
  queryAll("SELECT id, name FROM qb_places WHERE slug IS NULL OR slug = ''").forEach((p: any) => runSql('UPDATE qb_places SET slug = ? WHERE id = ?', [uniqueSlug(p.name || 'premise'), p.id]));
  queryAll('SELECT placeId, phone FROM qb_members WHERE id IS NULL').forEach((m: any) => runSql('UPDATE qb_members SET id = ?, since = ? WHERE placeId = ? AND phone = ?', [`tm-${tok()}`, now(), m.placeId, m.phone]));

  const me = (req: any): string => req.auth.phone;
  const place = (slug: string) => queryOne('SELECT * FROM qb_places WHERE slug = ? OR id = ?', [slug, slug]);
  const rolesOf = (pl: any, phone: string): string[] => {
    const r: string[] = [];
    if (pl.ownerPhone === phone) r.push('owner');
    const m = queryOne('SELECT role FROM qb_members WHERE placeId = ? AND phone = ?', [pl.id, phone]);
    if (m && !r.includes(m.role)) r.push(m.role);
    return r;
  };
  const has = (roles: string[], allowed: string[]) => roles.some(r => allowed.includes(r));
  const assignable = (roles: string[]) => Array.from(new Set(roles.flatMap(r => ASSIGNABLE[r] || [])));
  const links = (slug: string, req: any) => ({ page: `${base(req)}/q/${slug}`, sticker: `${base(req)}/q/${slug}/sticker`, qr: `${base(req)}/q/${slug}/qr.svg` });
  const err = (res: any, code: number, error: string) => res.status(code).json({ error, message: error });

  // Loads a premise and the caller's roles, or answers with the refusal. `allowed` lists the roles that may do the job.
  const guard = (req: any, res: any, allowed: string[]) => {
    const pl = place(req.params.slug);
    if (!pl) { err(res, 404, 'That premise was not found.'); return null; }
    const roles = rolesOf(pl, me(req));
    if (!has(roles, allowed)) { err(res, 403, 'Your role on this premise does not allow that.'); return null; }
    return { pl, roles };
  };

  // ---------- Who am I, and where do I belong ----------
  const accountOf = (req: any) => {
    const row = queryOne('SELECT id, name, phone FROM providers WHERE id = ?', [req.auth.sub]);
    return { id: req.auth.sub, phone: `+254${req.auth.phone}`, name: /^User \d+$/.test(row?.name || '') ? '' : row?.name || '' };
  };
  const membershipOf = (pl: any, roles: string[]) => ({
    slug: pl.slug, name: pl.name, roles, gate_pass_enabled: !!pl.gatepass, log_times: !!pl.logTimes,
    can_invite: has(roles, HOST_ROLES), can_manage: has(roles, ['owner', 'manager']), can_manage_vacancies: has(roles, VACANCY_ROLES),
    can_run_gate: has(roles, GATE_ROLES), assignable_roles: assignable(roles),
  });
  const myPlaces = (phone: string) => queryAll('SELECT * FROM qb_places WHERE ownerPhone = ? OR id IN (SELECT placeId FROM qb_members WHERE phone = ?) ORDER BY createdAt', [phone, phone]);

  app.get('/api/qaribu/me', requireAuth, (req: any, res: any) => {
    const account = accountOf(req);
    const memberships = myPlaces(me(req)).map((pl: any) => membershipOf(pl, rolesOf(pl, me(req))));
    res.json({ account, profile: { id: account.id, name: account.name, visibility: 'public' }, premises: [], memberships });
  });

  app.put('/api/qaribu/me/profile', requireAuth, (req: any, res: any) => {
    const name = String(req.body?.name || '').trim().slice(0, 80);
    if (!name) return err(res, 400, 'Enter your name.');
    runSql('UPDATE providers SET name = ? WHERE id = ?', [name, req.auth.sub]);
    try {
      const row = queryOne('SELECT rawData FROM providers WHERE id = ?', [req.auth.sub]);
      if (row?.rawData) runSql('UPDATE providers SET rawData = ? WHERE id = ?', [JSON.stringify({ ...JSON.parse(row.rawData), name }), req.auth.sub]);
    } catch (_) { /* the name column is already saved */ }
    const account = accountOf(req);
    res.json({ account, profile: { id: account.id, name: account.name, visibility: 'public' } });
  });

  // ---------- Premise sign-up ----------
  app.post('/api/qaribu/premises', requireAuth, (req: any, res: any) => {
    const b = req.body || {};
    const name = String(b.name || '').trim().slice(0, 80);
    if (!name) return err(res, 400, 'Give the premise a name.');
    const id = `pl-${tok()}`; const slug = uniqueSlug(name);
    runSql(`INSERT INTO qb_places (id, ownerPhone, ownerName, name, kind, area, county, tagline, about, gatepass, logTimes, listed, guardToken, slug, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, me(req), accountOf(req).name, name, 'premise', String(b.area || '').slice(0, 80), String(b.county || '').slice(0, 60), String(b.tagline || '').slice(0, 120),
       String(b.about || '').slice(0, 500), 0, 0, b.listed === false ? 0 : 1, tok() + tok(), slug, now()]);
    res.json({ slug, links: links(slug, req) });
  });

  // ---------- Expected visitors and invites ----------
  const passState = (p: any): 'waiting' | 'arrived' | 'left' | 'expired' | 'cancelled' => {
    if (p.status === 'cancelled') return 'cancelled';
    if (p.status === 'arrived') return p.leftAt ? 'left' : 'arrived';
    return new Date(p.expiresAt).getTime() <= Date.now() ? 'expired' : 'waiting';
  };
  const gateState = (p: any): 'valid' | 'used' | 'expired' | 'unavailable' => {
    const s = passState(p);
    return s === 'waiting' ? 'valid' : s === 'arrived' || s === 'left' ? 'used' : s === 'expired' ? 'expired' : 'unavailable';
  };
  const passRow = (p: any, logTimes: boolean) => ({
    id: p.id, visitor_name: p.visitorName, visitor_phone: p.visitorPhone, purpose: p.purpose, host_label: p.hostLabel, status: passState(p),
    key: passState(p) === 'waiting' ? fmtCode(p.code) : null, created_at: p.createdAt, expires_at: p.expiresAt,
    arrived_at: logTimes ? p.arrivedAt : null, left_at: logTimes ? p.leftAt : null,
  });

  app.get('/api/qaribu/host/passes', requireAuth, (req: any, res: any) => {
    req.params.slug = String(req.query.premise || '');
    const g = guard(req, res, HOST_ROLES); if (!g) return;
    const all = has(g.roles, ['owner', 'manager']);
    const since = new Date(Date.now() - 48 * 3600_000).toISOString();
    const rows = queryAll(`SELECT * FROM qb_passes WHERE placeId = ? AND createdAt > ? ${all ? '' : 'AND hostPhone = ?'} ORDER BY createdAt DESC LIMIT 100`, all ? [g.pl.id, since] : [g.pl.id, since, me(req)]);
    res.json({ premise: { slug: g.pl.slug, name: g.pl.name, log_times: !!g.pl.logTimes }, passes: rows.map((p: any) => passRow(p, !!g.pl.logTimes)) });
  });

  app.post('/api/qaribu/host/passes', requireAuth, (req: any, res: any) => {
    req.params.slug = String(req.body?.premise || '');
    const g = guard(req, res, HOST_ROLES); if (!g) return;
    if (!g.pl.gatepass) return err(res, 400, 'Gate pass is switched off for this premise.');
    const visitorName = String(req.body.visitor_name || '').trim().slice(0, 60);
    const nine = last9(req.body.visitor_phone);
    const purpose = String(req.body.purpose || '').trim().slice(0, 100);
    if (!visitorName || !/^[17]\d{8}$/.test(nine) || !purpose) return err(res, 400, "Enter the visitor's name, a Kenyan mobile number and the reason for the visit.");
    const recent = queryOne('SELECT COUNT(*) AS n FROM qb_passes WHERE hostPhone = ? AND createdAt > ?', [me(req), new Date(Date.now() - 3600_000).toISOString()]);
    if (recent && recent.n >= 30) return err(res, 429, 'Too many invitations in the last hour. Try again later.');
    const hostLabel = String(req.body.host_label || accountOf(req).name || '').trim().slice(0, 60);
    const p = { id: `ps-${tok()}`, code: code6(), token: tok(), expiresAt: new Date(Date.now() + PASS_HOURS * 3600_000).toISOString(), createdAt: now() };
    runSql(`INSERT INTO qb_passes (id, placeId, hostPhone, hostLabel, visitorName, visitorPhone, purpose, code, token, status, expiresAt, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [p.id, g.pl.id, me(req), hostLabel, visitorName, `254${nine}`, purpose, p.code, p.token, 'waiting', p.expiresAt, p.createdAt]);
    const url = `${base(req)}/g/${p.token}`;
    const message = `Hi ${visitorName}, ${hostLabel || 'your host'} has invited you to ${g.pl.name}. Your gate key is ${fmtCode(p.code)}. Open your pass: ${url}`;
    res.json({ id: p.id, sms: 'not_configured', pass_url: url, key: fmtCode(p.code), expires_at: p.expiresAt, visitor_phone: `+254${nine}`, message,
      sms_link: `sms:+254${nine}?body=${encodeURIComponent(message)}`, whatsapp_link: `https://wa.me/254${nine}?text=${encodeURIComponent(message)}` });
  });

  // ---------- Manage: gate pass switch, guard link, team ----------
  const teamOf = (pl: any) => [
    { id: 'owner', phone: `+254${pl.ownerPhone}`, name: pl.ownerName || '', role: 'owner', since: pl.createdAt },
    ...queryAll('SELECT id, phone, name, role, since FROM qb_members WHERE placeId = ? ORDER BY since', [pl.id]).map((m: any) => ({ id: m.id, phone: `+254${m.phone}`, name: m.name || '', role: m.role, since: m.since })),
  ];
  const managed = (pl: any, roles: string[], req: any) => ({
    premise: { slug: pl.slug, name: pl.name }, gate_pass: { enabled: !!pl.gatepass, log_times: !!pl.logTimes },
    guard_link: pl.gatepass ? `${base(req)}/v/${pl.guardToken}` : null, assignable_roles: assignable(roles), team: teamOf(pl),
  });

  app.get('/api/qaribu/manage/:slug', requireAuth, (req: any, res: any) => {
    const g = guard(req, res, ['owner', 'manager']); if (!g) return;
    res.json(managed(g.pl, g.roles, req));
  });
  app.put('/api/qaribu/manage/:slug/gate-pass', requireAuth, (req: any, res: any) => {
    const g = guard(req, res, ['owner', 'manager']); if (!g) return;
    if (typeof req.body?.enabled === 'boolean') runSql('UPDATE qb_places SET gatepass = ? WHERE id = ?', [req.body.enabled ? 1 : 0, g.pl.id]);
    if (typeof req.body?.log_times === 'boolean') runSql('UPDATE qb_places SET logTimes = ? WHERE id = ?', [req.body.log_times ? 1 : 0, g.pl.id]);
    res.json(managed(place(g.pl.id), g.roles, req).gate_pass);
  });
  app.post('/api/qaribu/manage/:slug/guard-link/rotate', requireAuth, (req: any, res: any) => {
    const g = guard(req, res, ['owner', 'manager']); if (!g) return;
    const t = tok() + tok();
    runSql('UPDATE qb_places SET guardToken = ? WHERE id = ?', [t, g.pl.id]);
    res.json({ guard_link: `${base(req)}/v/${t}` });
  });
  app.post('/api/qaribu/manage/:slug/team', requireAuth, (req: any, res: any) => {
    const g = guard(req, res, ['owner', 'manager']); if (!g) return;
    const role = String(req.body?.role || ''); const nine = last9(req.body?.phone);
    if (!assignable(g.roles).includes(role)) return err(res, 403, 'You cannot give that role.');
    if (!/^[17]\d{8}$/.test(nine)) return err(res, 400, 'Enter a Kenyan mobile number: 9 digits starting with 7 or 1.');
    if (nine === g.pl.ownerPhone) return err(res, 400, 'That is the owner of this premise.');
    const m = { id: `tm-${tok()}`, phone: nine, name: String(req.body?.name || '').trim().slice(0, 80), role, since: now() };
    runSql('INSERT OR REPLACE INTO qb_members (placeId, phone, name, role, id, since) VALUES (?,?,?,?,?,?)', [g.pl.id, m.phone, m.name, m.role, m.id, m.since]);
    res.json({ ...m, phone: `+254${nine}` });
  });
  app.delete('/api/qaribu/manage/:slug/team/:id', requireAuth, (req: any, res: any) => {
    const g = guard(req, res, ['owner', 'manager']); if (!g) return;
    const m = queryOne('SELECT * FROM qb_members WHERE placeId = ? AND id = ?', [g.pl.id, req.params.id]);
    if (!m) return err(res, 404, 'That person is not on the team.');
    if (!assignable(g.roles).includes(m.role)) return err(res, 403, 'You cannot remove that role.');
    runSql('DELETE FROM qb_members WHERE placeId = ? AND id = ?', [g.pl.id, m.id]);
    res.json({ ok: true });
  });

  // ---------- Vacancies and the waiting list ----------
  const vacancyItem = (v: any) => {
    const confirmed = new Date(v.confirmedAt).getTime();
    const from = v.availableFrom || null;
    const rent = parseInt(String(v.rent || '').replace(/\D/g, ''), 10);
    return { id: v.id, title: v.title, type: v.vtype || '', rent: Number.isFinite(rent) ? rent : null, available_from: from, notes: v.note || '',
      confirmed_at: v.confirmedAt, shown_on_page: v.status === 'open' && Date.now() - confirmed < STALE_DAYS * 86400_000,
      timing: from && new Date(from).getTime() > Date.now() ? 'upcoming' : 'now' };
  };
  const waitingItem = (w: any, pl: any, req: any) => {
    const text = `Hi ${w.name || ''}, a vacancy has opened at ${pl.name}. See it here: ${base(req)}/q/${pl.slug}`;
    return { id: w.id, name: w.name || '', phone: `+${w.phone}`, looking_for: w.lookingFor || '', since: w.since,
      sms_link: `sms:+${w.phone}?body=${encodeURIComponent(text)}`, whatsapp_link: `https://wa.me/${w.phone}?text=${encodeURIComponent(text)}` };
  };
  const vacancyFields = (b: any) => ({
    title: String(b?.title || '').trim().slice(0, 80), type: String(b?.type || '').trim().slice(0, 40), rent: String(b?.rent || '').replace(/\D/g, '').slice(0, 9),
    from: /^\d{4}-\d{2}-\d{2}$/.test(String(b?.available_from || '')) ? String(b.available_from) : null, notes: String(b?.notes || '').trim().slice(0, 200),
  });

  app.get('/api/qaribu/vacancies/:slug', requireAuth, (req: any, res: any) => {
    const g = guard(req, res, VACANCY_ROLES); if (!g) return;
    res.json({
      premise: { slug: g.pl.slug, name: g.pl.name }, links: links(g.pl.slug, req),
      vacancies: queryAll("SELECT * FROM qb_vacancies WHERE placeId = ? AND status = 'open' ORDER BY confirmedAt DESC", [g.pl.id]).map(vacancyItem),
      waiting: queryAll('SELECT * FROM qb_waiting WHERE placeId = ? AND told = 0 ORDER BY since', [g.pl.id]).map((w: any) => waitingItem(w, g.pl, req)),
      message: `A vacancy has opened at ${g.pl.name}. See it here: ${base(req)}/q/${g.pl.slug}`,
    });
  });
  app.post('/api/qaribu/vacancies/:slug', requireAuth, (req: any, res: any) => {
    const g = guard(req, res, VACANCY_ROLES); if (!g) return;
    const f = vacancyFields(req.body);
    if (!f.title) return err(res, 400, 'Give the vacancy a name.');
    const id = `vc-${tok()}`;
    runSql('INSERT INTO qb_vacancies (id, placeId, title, rent, note, status, confirmedAt, vtype, availableFrom) VALUES (?,?,?,?,?,?,?,?,?)', [id, g.pl.id, f.title, f.rent, f.notes, 'open', now(), f.type, f.from]);
    res.json(vacancyItem(queryOne('SELECT * FROM qb_vacancies WHERE id = ?', [id])));
  });
  const vacancyOf = (req: any, res: any) => {
    const g = guard(req, res, VACANCY_ROLES); if (!g) return null;
    const v = queryOne('SELECT * FROM qb_vacancies WHERE id = ? AND placeId = ?', [req.params.id, g.pl.id]);
    if (!v) { err(res, 404, 'That vacancy was not found.'); return null; }
    return v;
  };
  app.put('/api/qaribu/vacancies/:slug/:id', requireAuth, (req: any, res: any) => {
    const v = vacancyOf(req, res); if (!v) return;
    const f = vacancyFields(req.body);
    if (!f.title) return err(res, 400, 'Give the vacancy a name.');
    runSql('UPDATE qb_vacancies SET title = ?, vtype = ?, rent = ?, availableFrom = ?, note = ?, confirmedAt = ? WHERE id = ?', [f.title, f.type, f.rent, f.from, f.notes, now(), v.id]);
    res.json(vacancyItem(queryOne('SELECT * FROM qb_vacancies WHERE id = ?', [v.id])));
  });
  app.post('/api/qaribu/vacancies/:slug/:id/confirm', requireAuth, (req: any, res: any) => {
    const v = vacancyOf(req, res); if (!v) return;
    runSql('UPDATE qb_vacancies SET confirmedAt = ? WHERE id = ?', [now(), v.id]);
    res.json(vacancyItem(queryOne('SELECT * FROM qb_vacancies WHERE id = ?', [v.id])));
  });
  app.delete('/api/qaribu/vacancies/:slug/:id', requireAuth, (req: any, res: any) => {
    const v = vacancyOf(req, res); if (!v) return;
    runSql('DELETE FROM qb_vacancies WHERE id = ?', [v.id]);
    res.json({ ok: true });
  });
  app.post('/api/qaribu/vacancies/:slug/waiting/:id/told', requireAuth, (req: any, res: any) => {
    const g = guard(req, res, VACANCY_ROLES); if (!g) return;
    runSql('UPDATE qb_waiting SET told = 1 WHERE id = ? AND placeId = ?', [req.params.id, g.pl.id]);
    res.json({ ok: true });
  });
  app.delete('/api/qaribu/vacancies/:slug/waiting/:id', requireAuth, (req: any, res: any) => {
    const g = guard(req, res, VACANCY_ROLES); if (!g) return;
    runSql('DELETE FROM qb_waiting WHERE id = ? AND placeId = ?', [req.params.id, g.pl.id]);
    res.json({ ok: true });
  });

  // ---------- The gate: check, admit with the ID, check out ----------
  const fails = new Map<string, number[]>();
  const tooMany = (k: string) => (fails.get(k) || []).filter(t => Date.now() - t < 600_000).length >= 6;
  const noteFail = (k: string) => fails.set(k, [...(fails.get(k) || []).filter(t => Date.now() - t < 600_000), Date.now()]);
  const findPass = (placeId: string, raw: any, key: string): { pass?: any; error?: string } => {
    if (tooMany(key)) return { error: 'Too many wrong keys. Wait ten minutes and try again.' };
    const code = String(raw || '').replace(/\D/g, '');
    const p = code.length === 6 ? queryOne('SELECT * FROM qb_passes WHERE placeId = ? AND code = ? ORDER BY createdAt DESC', [placeId, code]) : null;
    if (!p) { noteFail(key); return { error: 'No pass matches that key.' }; }
    return { pass: p };
  };
  const visitor = (p: any) => ({ name: p.visitorName, purpose: p.purpose, host_label: p.hostLabel, expires_at: p.expiresAt });
  const validId = (s: any) => /^[A-Za-z0-9]{5,15}$/.test(String(s || '').replace(/[\s-]/g, ''));
  const admit = (p: any, by: string, id: string) => {
    if (passState(p) !== 'waiting') return false;
    runSql("UPDATE qb_passes SET status = 'arrived', arrivedAt = ?, admittedBy = ?, idNumber = ? WHERE id = ?", [now(), by, String(id).replace(/[\s-]/g, '').toUpperCase(), p.id]);
    return true;
  };

  app.get('/api/qaribu/gate/:slug', requireAuth, (req: any, res: any) => {
    const g = guard(req, res, GATE_ROLES); if (!g) return;
    const inside = g.pl.logTimes
      ? queryAll("SELECT * FROM qb_passes WHERE placeId = ? AND status = 'arrived' AND leftAt IS NULL ORDER BY arrivedAt DESC", [g.pl.id])
          .map((p: any) => ({ id: p.id, visitor_name: p.visitorName, purpose: p.purpose, host_label: p.hostLabel, arrived_at: p.arrivedAt }))
      : null;
    res.json({ premise: { slug: g.pl.slug, name: g.pl.name, log_times: !!g.pl.logTimes }, inside });
  });
  app.post('/api/qaribu/gate/:slug/check', requireAuth, (req: any, res: any) => {
    const g = guard(req, res, GATE_ROLES); if (!g) return;
    const r = findPass(g.pl.id, req.body?.code, `u:${me(req)}`);
    if (r.error) return err(res, 400, r.error);
    const state = gateState(r.pass);
    res.json({ state, can_admit: state === 'valid', visitor: visitor(r.pass) });
  });
  app.post('/api/qaribu/gate/:slug/admit', requireAuth, (req: any, res: any) => {
    const g = guard(req, res, GATE_ROLES); if (!g) return;
    if (!validId(req.body?.id_number)) return err(res, 400, "Enter the visitor's ID number (letters and digits, 5 to 15 characters).");
    const r = findPass(g.pl.id, req.body?.code, `u:${me(req)}`);
    if (r.error) return err(res, 400, r.error);
    const ok = admit(r.pass, me(req), req.body.id_number);
    res.json({ admitted: ok, state: ok ? 'used' : gateState(r.pass), visitor: visitor(r.pass) });
  });
  app.post('/api/qaribu/gate/:slug/checkout', requireAuth, (req: any, res: any) => {
    const g = guard(req, res, GATE_ROLES); if (!g) return;
    const p = queryOne('SELECT * FROM qb_passes WHERE id = ? AND placeId = ?', [String(req.body?.visitor || ''), g.pl.id]);
    if (!p) return err(res, 404, 'That visitor was not found.');
    if (p.status === 'arrived' && !p.leftAt) runSql('UPDATE qb_passes SET leftAt = ? WHERE id = ?', [now(), p.id]);
    res.json({ ok: true, visitor_name: p.visitorName });
  });

  // ---------- Pages opened from a link: no account, no scripts ----------
  app.get('/g/:token', (req: any, res: any) => {
    const p = queryOne('SELECT * FROM qb_passes WHERE token = ?', [req.params.token]);
    const pl = p && queryOne('SELECT name FROM qb_places WHERE id = ?', [p.placeId]);
    res.set('Cache-Control', 'no-store');
    if (!p) return res.status(404).send(page('Pass', '<h1>Pass not found</h1><p>Ask your host to send a new one.</p>'));
    const s = gateState(p);
    res.send(page('Gate pass', s === 'valid'
      ? `<small>Gate pass</small><h1>${esc(pl?.name)}</h1><p>Hello ${esc(p.visitorName)}. ${esc(p.hostLabel)} is expecting you.</p><div class="code">${fmtCode(p.code)}</div><p>Show this key to the guard. It works once and expires at ${esc(new Date(p.expiresAt).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }))}.</p><p><small>The guard will ask for your ID.</small></p>`
      : `<h1>This pass cannot be used</h1><p>It has been ${s === 'used' ? 'used already' : s === 'expired' ? 'let to expire' : 'cancelled'}. Ask your host for a new one.</p>`));
  });

  const guardPlace = (gt: string) => queryOne('SELECT * FROM qb_places WHERE guardToken = ? AND gatepass = 1', [gt]);
  const guardForm = (pl: any, extra = '') => page('Guard', `<small>Guard check</small><h1>${esc(pl.name)}</h1>${extra}<form method="post"><input name="code" inputmode="numeric" autocomplete="off" placeholder="6-digit key" required><button>Check key</button></form>`);
  app.get('/v/:gt', (req: any, res: any) => {
    res.set('Cache-Control', 'no-store');
    const pl = guardPlace(req.params.gt);
    res.status(pl ? 200 : 404).send(pl ? guardForm(pl) : page('Guard', '<h1>Link not valid</h1><p>Ask the premise manager for the current guard link.</p>'));
  });
  app.post('/v/:gt', urlencoded, (req: any, res: any) => {
    res.set('Cache-Control', 'no-store');
    const pl = guardPlace(req.params.gt);
    if (!pl) return res.status(404).send(page('Guard', '<h1>Link not valid</h1>'));
    const r = findPass(pl.id, req.body?.code, `g:${req.params.gt}`);
    if (r.error) return res.send(guardForm(pl, `<p class="bad">${esc(r.error)}</p>`));
    const p = r.pass; const s = gateState(p);
    if (req.body?.admit === p.id) {
      if (!validId(req.body?.id)) return res.send(guardForm(pl, '<p class="bad">Enter the visitor\'s ID number to admit them.</p>'));
      return res.send(guardForm(pl, admit(p, 'guard link', req.body.id) ? `<p class="ok">${esc(p.visitorName)} admitted.</p>` : '<p class="bad">That pass can no longer be used.</p>'));
    }
    if (s !== 'valid') return res.send(guardForm(pl, `<p class="bad">Pass ${s === 'used' ? 'already used' : s === 'expired' ? 'expired' : 'not valid'}.</p>`));
    res.send(page('Guard', `<small>Valid pass</small><h1>${esc(p.visitorName)}</h1><p>Visiting ${esc(p.hostLabel)}</p><p>Reason: ${esc(p.purpose)}</p>
      <form method="post"><input type="hidden" name="code" value="${esc(p.code)}"><input type="hidden" name="admit" value="${esc(p.id)}"><input name="id" autocomplete="off" placeholder="Visitor's ID number" required><button>Admit</button></form>`));
  });

  // The premise page a sticker opens: vacancies, or a form to be told of the next one.
  app.get('/q/:slug', (req: any, res: any) => {
    const pl = place(req.params.slug);
    res.set('Cache-Control', 'no-store');
    if (!pl) return res.status(404).send(page('Premise', '<h1>Premise not found</h1>'));
    const vs = queryAll("SELECT * FROM qb_vacancies WHERE placeId = ? AND status = 'open' ORDER BY confirmedAt DESC", [pl.id]).map(vacancyItem).filter(v => v.shown_on_page);
    const list = vs.length
      ? '<h3>Vacancies</h3>' + vs.map(v => `<p><b>${esc(v.title)}</b>${v.type ? ` · ${esc(v.type)}` : ''}${v.rent ? ` · KES ${v.rent.toLocaleString('en-KE')}/month` : ''}<br><small>${v.timing === 'upcoming' ? `Available from ${esc(v.available_from)}` : 'Vacant now'}${v.notes ? ` · ${esc(v.notes)}` : ''}</small></p>`).join('')
      : `<h3>No vacancy right now</h3><p>Leave your number and we will tell you when one opens.</p>
         <form method="post" action="/q/${esc(pl.slug)}/alert"><input name="name" placeholder="Your name"><input name="phone" inputmode="tel" placeholder="0712345678" required><input name="looking" placeholder="Looking for (e.g. bedsitter)"><button>Tell me</button></form>`;
    res.send(page(pl.name, `<h1>${esc(pl.name)}</h1><p>${esc([pl.area, pl.county].filter(Boolean).join(', '))}</p>${pl.tagline ? `<p>${esc(pl.tagline)}</p>` : ''}${pl.about ? `<p>${esc(pl.about)}</p>` : ''}${req.query.told ? '<p class="ok">Thanks. We will tell you.</p>' : ''}${list}`));
  });
  app.post('/q/:slug/alert', urlencoded, (req: any, res: any) => {
    const pl = place(req.params.slug);
    if (!pl) return res.status(404).send(page('Premise', '<h1>Premise not found</h1>'));
    const nine = last9(req.body?.phone);
    if (!/^[17]\d{8}$/.test(nine)) return res.status(400).send(page(pl.name, '<h1>Check the number</h1><p class="bad">Enter a Kenyan mobile number, like 0712345678.</p><p><a href="javascript:history.back()">Go back</a></p>'));
    if (!queryOne('SELECT 1 AS x FROM qb_waiting WHERE placeId = ? AND phone = ? AND told = 0', [pl.id, `254${nine}`]))
      runSql('INSERT INTO qb_waiting (id, placeId, name, phone, lookingFor, since, told) VALUES (?,?,?,?,?,?,0)', [`wt-${tok()}`, pl.id, String(req.body?.name || '').trim().slice(0, 60), `254${nine}`, String(req.body?.looking || '').trim().slice(0, 60), now()]);
    res.redirect(303, `/q/${pl.slug}?told=1`);
  });
  app.get('/q/:slug/qr.svg', async (req: any, res: any) => {
    const pl = place(req.params.slug);
    if (!pl) return res.status(404).end();
    try {
      const QR: any = await import('qrcode');
      const svg = await (QR.default || QR).toString(`${base(req)}/q/${pl.slug}`, { type: 'svg', margin: 1, width: 360 });
      res.set({ 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' }).send(svg);
    } catch (_) {
      res.status(503).type('text').send('QR drawing is not installed on the server yet. Run npm install and restart.');
    }
  });
  app.get('/q/:slug/sticker', (req: any, res: any) => {
    const pl = place(req.params.slug);
    if (!pl) return res.status(404).send(page('Premise', '<h1>Premise not found</h1>'));
    res.set('Cache-Control', 'no-store').send(page(`${pl.name} sticker`, `<h1 style="text-align:center">${esc(pl.name)}</h1><img src="/q/${esc(pl.slug)}/qr.svg" alt="QR code" style="width:100%;max-width:320px;display:block;margin:12px auto;border:0;padding:0"><p style="text-align:center"><b>Scan for vacancies and updates</b></p><p style="text-align:center"><small>${esc(base(req))}/q/${esc(pl.slug)}</small></p>`));
  });
}
