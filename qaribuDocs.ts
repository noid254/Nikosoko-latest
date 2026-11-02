// Qaribu documents on Nikosoko's database: brand kit, receipts, invoices and quotes. Routes and answers have the same shapes
// as the Qaribu platform's, so the Qaribu Documents screens run unchanged. Rules kept from Qaribu:
//  - nothing can be issued until the brand kit is complete (name, address, phone, terms accepted);
//  - a document is history: no route edits or deletes one. A payment adds a linked receipt, a cancel adds a mark, a quote
//    becoming an invoice adds a new document;
//  - a customer's link opens once; after that the customer reads it in the app, signed in with their number.
import express from 'express';
import { Deps, tok, now, base, page, esc, runAll } from './qaribuShared';

const FONTS = [
  { key: '', label: 'Qaribu (clean sans)', stack: "Poppins, system-ui, sans-serif" },
  { key: 'serif', label: 'Classic serif', stack: "Georgia, 'Times New Roman', serif" },
  { key: 'mono', label: 'Typewriter', stack: "'Courier New', ui-monospace, monospace" },
  { key: 'rounded', label: 'Friendly', stack: "'Trebuchet MS', 'Segoe UI', sans-serif" },
];
const DESIGNS = [{ key: 'band', label: 'Band' }, { key: 'plain', label: 'Plain' }, { key: 'centred', label: 'Centred' }];
const PREFIX: Record<string, string> = { receipt: 'R', invoice: 'INV', quote: 'Q' };
const HEX = /^#[0-9a-fA-F]{6}$/;
const LOGO_MAX = 100 * 1024;
const LETTERHEAD_MAX = 250 * 1024;
const money = (n: number) => `KES ${n.toLocaleString('en-KE', { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
const r2 = (n: number) => Math.round(n * 100) / 100;
const num = (s: any) => Number(String(s ?? '').replace(/,/g, '').trim());

export function registerQaribuDocs(d: Deps) {
  const { app, requireAuth, queryAll, queryOne, runSql, last9 } = d;
  const me = (req: any): string => req.auth.phone;

  runAll(runSql, `
    CREATE TABLE IF NOT EXISTS qb_brand (ownerPhone TEXT PRIMARY KEY, business_name TEXT, address TEXT, phone TEXT, email TEXT, tax_pin TEXT, tagline TEXT,
      payment_details TEXT, receipt_note TEXT, terms_accepted_at TEXT, color TEXT, color2 TEXT, font TEXT, design TEXT, logo TEXT, letterhead TEXT);
    CREATE TABLE IF NOT EXISTS qb_documents (id TEXT PRIMARY KEY, uid TEXT, kind TEXT, number TEXT, ownerPhone TEXT, shopName TEXT, customerPhone TEXT, customerName TEXT,
      customerDetails TEXT, items TEXT, subtotal REAL, discount REAL, taxRate REAL, tax REAL, shipping REAL, deposit REAL, total REAL, dueDate TEXT, validUntil TEXT,
      notes TEXT, parentId TEXT, token TEXT, openedAt TEXT, cancelledAt TEXT, cancelReason TEXT, decision TEXT, invoicedId TEXT, createdAt TEXT);
  `);

  const err = (res: any, code: number, error: string) => res.status(code).json({ error, message: error });

  // ---------- Brand kit ----------
  const kitRow = (phone: string) => queryOne('SELECT * FROM qb_brand WHERE ownerPhone = ?', [phone]);
  const kitOut = (phone: string) => {
    const k = kitRow(phone) || {};
    const business_name = k.business_name || '', address = k.address || '', ph = k.phone || `+254${phone}`;
    const design = k.design === 'letterhead' && !k.letterhead ? '' : k.design || '';
    return {
      business_name, address, phone: ph, email: k.email || '', tax_pin: k.tax_pin || '', tagline: k.tagline || '', payment_details: k.payment_details || '',
      receipt_note: k.receipt_note || '', terms_accepted_at: k.terms_accepted_at || '', complete: !!(business_name && address && ph && k.terms_accepted_at),
      color: k.color || '', color2: k.color2 || '', font: k.font || '', has_logo: !!k.logo, has_letterhead: !!k.letterhead, fonts: FONTS, design,
      designs: [...DESIGNS, ...(k.letterhead ? [{ key: 'letterhead', label: 'Your letterhead' }] : [])],
    };
  };
  app.get('/api/qaribu/me/brand-kit', requireAuth, (req: any, res: any) => res.json(kitOut(me(req))));
  app.put('/api/qaribu/me/brand-kit', requireAuth, (req: any, res: any) => {
    const b = req.body || {}; const cur = kitRow(me(req));
    const business_name = String(b.business_name || '').trim().slice(0, 80), address = String(b.address || '').trim().slice(0, 200);
    if (!business_name || !address) return err(res, 400, 'Enter your business name and address.');
    const phone = String(b.phone || '').trim() || `+254${me(req)}`;
    if (!/^[17]\d{8}$/.test(last9(phone))) return err(res, 400, 'Enter a Kenyan mobile number for the business.');
    const terms = cur?.terms_accepted_at || (b.accept_terms ? now() : '');
    if (!terms) return err(res, 400, 'Accept the terms to continue.');
    const color = HEX.test(b.color || '') ? b.color : '', color2 = HEX.test(b.color2 || '') ? b.color2 : '';
    const font = FONTS.some(f => f.key === (b.font || '')) ? (b.font || '') : '';
    const designs = ['band', 'plain', 'centred', ...(cur?.letterhead ? ['letterhead'] : [])];
    const design = designs.includes(b.design) ? b.design : '';
    runSql(`INSERT OR REPLACE INTO qb_brand (ownerPhone, business_name, address, phone, email, tax_pin, tagline, payment_details, receipt_note, terms_accepted_at, color, color2, font, design, logo, letterhead)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [me(req), business_name, address, `+254${last9(phone)}`, String(b.email || '').trim().slice(0, 100), String(b.tax_pin || '').trim().toUpperCase().slice(0, 20), String(b.tagline || '').trim().slice(0, 100),
       String(b.payment_details || '').trim().slice(0, 300), String(b.receipt_note || '').trim().slice(0, 200), terms, color, color2, font, design, cur?.logo || null, cur?.letterhead || null]);
    res.json(kitOut(me(req)));
  });

  const picture = (column: 'logo' | 'letterhead', max: number) => {
    const raw = express.raw({ type: ['image/png', 'image/jpeg'], limit: max + 1024 });
    app.put(`/api/qaribu/me/brand-kit/${column}`, requireAuth, raw, (req: any, res: any) => {
      const buf: Buffer = req.body;
      if (!Buffer.isBuffer(buf) || !buf.length) return err(res, 400, 'Choose a PNG or JPEG picture.');
      if (buf.length > max) return err(res, 413, `That picture is too large. Use one under ${max / 1024} KB.`);
      const type = String(req.headers['content-type']).split(';')[0];
      if (!kitRow(me(req))) runSql('INSERT INTO qb_brand (ownerPhone) VALUES (?)', [me(req)]);
      runSql(`UPDATE qb_brand SET ${column} = ? WHERE ownerPhone = ?`, [`data:${type};base64,${buf.toString('base64')}`, me(req)]);
      res.json(kitOut(me(req)));
    });
    app.get(`/api/qaribu/me/brand-kit/${column}`, requireAuth, (req: any, res: any) => {
      const v: string = kitRow(me(req))?.[column];
      const m = v && /^data:([^;]+);base64,(.*)$/.exec(v);
      if (!m) return res.status(404).end();
      res.set({ 'Content-Type': m[1], 'Cache-Control': 'no-store' }).send(Buffer.from(m[2], 'base64'));
    });
    app.delete(`/api/qaribu/me/brand-kit/${column}`, requireAuth, (req: any, res: any) => {
      runSql(`UPDATE qb_brand SET ${column} = NULL WHERE ownerPhone = ?`, [me(req)]);
      if (column === 'letterhead') runSql("UPDATE qb_brand SET design = '' WHERE ownerPhone = ? AND design = 'letterhead'", [me(req)]);
      res.json(kitOut(me(req)));
    });
  };
  picture('logo', LOGO_MAX); picture('letterhead', LETTERHEAD_MAX);

  // ---------- Issuing ----------
  const cleanLines = (raw: any) => {
    if (!Array.isArray(raw) || !raw.length) return { error: 'Add at least one item.' };
    if (raw.length > 40) return { error: 'A document can have up to 40 items.' };
    const items: any[] = [];
    for (const l of raw) {
      const description = String(l.description || '').trim();
      const qty = num(l.qty), price = num(l.unit_price), serial = String(l.serial || '').trim().slice(0, 40);
      if (description.length < 2 || description.length > 80) return { error: 'Each item needs a description of 2 to 80 letters.' };
      if (!(qty > 0) || !(price > 0)) return { error: `Give "${description}" a quantity and a price above zero.` };
      items.push({ description, qty, unit_price: price, total: r2(qty * price), serial });
    }
    return { items };
  };
  const cleanCustomer = (b: any) => {
    const nine = last9(b.customer_phone);
    return /^[17]\d{8}$/.test(nine) ? { phone: `254${nine}`, name: String(b.customer_name || '').trim().slice(0, 80), details: String(b.customer_details || '').trim().slice(0, 200) } : null;
  };
  const nextNumber = (phone: string, kind: string) => {
    const n = (queryOne('SELECT COUNT(*) AS n FROM qb_documents WHERE ownerPhone = ? AND kind = ?', [phone, kind])?.n || 0) + 1;
    return `${PREFIX[kind]}-${String(n).padStart(4, '0')}`;
  };
  const newUid = () => `QB-${tok().replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase()}`;

  const insertDoc = (o: any) => {
    const id = `dc-${tok()}`;
    runSql(`INSERT INTO qb_documents (id, uid, kind, number, ownerPhone, shopName, customerPhone, customerName, customerDetails, items, subtotal, discount, taxRate, tax, shipping, deposit, total,
            dueDate, validUntil, notes, parentId, token, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, newUid(), o.kind, nextNumber(o.ownerPhone, o.kind), o.ownerPhone, o.shopName, o.customerPhone, o.customerName || '', o.customerDetails || '', JSON.stringify(o.items), o.subtotal, o.discount || 0,
       o.taxRate || 0, o.tax || 0, o.shipping || 0, o.deposit || 0, o.total, o.dueDate || '', o.validUntil || '', o.notes || '', o.parentId || null, tok() + tok(), now()]);
    return queryOne('SELECT * FROM qb_documents WHERE id = ?', [id]);
  };

  const paidOn = (inv: any) => (queryOne('SELECT COALESCE(SUM(total), 0) AS s FROM qb_documents WHERE parentId = ? AND kind = ?', [inv.id, 'receipt'])?.s || 0);
  const balanceOf = (inv: any) => r2(inv.total - inv.deposit - paidOn(inv));
  const sendText = (x: any, req: any) => {
    const url = `${base(req)}/r/${x.token}`;
    const what = x.kind === 'invoice' ? `invoice ${x.number} for ${money(balanceOf(x))}` : x.kind === 'quote' ? `quote ${x.number} for ${money(x.total)}` : `receipt ${x.number} for ${money(x.total)}`;
    const message = `${x.shopName}: ${what}. Open it here: ${url}`;
    return { message, sms_link: `sms:+${x.customerPhone}?body=${encodeURIComponent(message)}`, whatsapp_link: `https://wa.me/${x.customerPhone}?text=${encodeURIComponent(message)}`, url };
  };
  const needKit = (req: any, res: any) => { const k = kitOut(me(req)); if (!k.complete) { err(res, 400, 'Set up your brand kit before you issue documents.'); return null; } return k; };

  app.post('/api/qaribu/receipts', requireAuth, (req: any, res: any) => {
    const kit = needKit(req, res); if (!kit) return;
    const c = cleanCustomer(req.body || {}); if (!c) return err(res, 400, 'Enter a Kenyan mobile number for the customer.');
    const l: any = cleanLines(req.body?.items); if (l.error) return err(res, 400, l.error);
    const total = r2(l.items.reduce((a: number, i: any) => a + i.total, 0));
    const x = insertDoc({ kind: 'receipt', ownerPhone: me(req), shopName: kit.business_name, customerPhone: c.phone, customerName: c.name, items: l.items, subtotal: total, total });
    const t = sendText(x, req);
    res.json({ id: x.id, uid: x.uid, number: x.number, amount: x.total, items: l.items, receipt_url: t.url, customer_phone: `+${x.customerPhone}`, message: t.message, sms_link: t.sms_link, whatsapp_link: t.whatsapp_link });
  });

  const issueFull = (kind: 'invoice' | 'quote') => (req: any, res: any) => {
    const kit = needKit(req, res); if (!kit) return;
    const b = req.body || {};
    const c = cleanCustomer(b); if (!c) return err(res, 400, 'Enter a Kenyan mobile number for the customer.');
    if (!c.name) return err(res, 400, "Enter the customer's name.");
    const l: any = cleanLines(b.items); if (l.error) return err(res, 400, l.error);
    const subtotal = r2(l.items.reduce((a: number, i: any) => a + i.total, 0));
    const discount = b.discount ? num(b.discount) : 0, shipping = b.shipping ? num(b.shipping) : 0, deposit = kind === 'invoice' && b.deposit ? num(b.deposit) : 0;
    const rate = b.tax_rate === undefined || String(b.tax_rate).trim() === '' ? (kit.tax_pin ? 16 : 0) : num(b.tax_rate);
    if ([discount, shipping, deposit, rate].some(n => !Number.isFinite(n) || n < 0)) return err(res, 400, 'Check the discount, tax, shipping and deposit amounts.');
    if (discount > subtotal) return err(res, 400, 'The discount cannot be more than the items add up to.');
    const taxable = r2(subtotal - discount), tax = Math.round((taxable * rate) / 100), total = r2(taxable + tax + shipping);
    if (deposit > total) return err(res, 400, 'The deposit cannot be more than the total.');
    const date = String(kind === 'invoice' ? b.due_date : b.valid_until || '').slice(0, 10);
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return err(res, 400, 'Check the date.');
    const x = insertDoc({ kind, ownerPhone: me(req), shopName: kit.business_name, customerPhone: c.phone, customerName: c.name, customerDetails: c.details, items: l.items, subtotal, discount, taxRate: rate, tax, shipping, deposit,
      total, dueDate: kind === 'invoice' ? date : '', validUntil: kind === 'quote' ? date : '', notes: String(b.notes || '').trim().slice(0, 400) });
    const t = sendText(x, req);
    res.json({ id: x.id, uid: x.uid, kind, number: x.number, amount: x.total, balance_due: kind === 'invoice' ? balanceOf(x) : x.total, date, customer_phone: `+${x.customerPhone}`, message: t.message, sms_link: t.sms_link, whatsapp_link: t.whatsapp_link });
  };
  app.post('/api/qaribu/invoices', requireAuth, issueFull('invoice'));
  app.post('/api/qaribu/quotes', requireAuth, issueFull('quote'));

  // ---------- Payments, cancel, answer a quote, quote to invoice ----------
  const mine = (req: any, res: any, kind?: string) => {
    const x = queryOne('SELECT * FROM qb_documents WHERE id = ? AND ownerPhone = ?', [req.params.id, me(req)]);
    if (!x || (kind && x.kind !== kind)) { err(res, 404, 'That document was not found.'); return null; }
    return x;
  };
  app.post('/api/qaribu/invoices/:id/payments', requireAuth, (req: any, res: any) => {
    const inv = mine(req, res, 'invoice'); if (!inv) return;
    if (inv.cancelledAt) return err(res, 400, 'This invoice was cancelled.');
    const bal = balanceOf(inv);
    if (bal <= 0) return err(res, 400, 'This invoice is already paid in full.');
    const amount = String(req.body?.amount || '').trim() === '' ? bal : r2(num(req.body.amount));
    if (!(amount > 0) || amount > bal) return err(res, 400, `Enter an amount up to ${money(bal)}.`);
    const method = ['cash', 'mpesa', 'bank', 'card', 'other'].includes(req.body?.method) ? req.body.method : 'cash';
    const ref = String(req.body?.reference || '').trim().slice(0, 40);
    const desc = `Payment for invoice ${inv.number} (${method}${ref ? ` ${ref}` : ''})`;
    const rc = insertDoc({ kind: 'receipt', ownerPhone: inv.ownerPhone, shopName: inv.shopName, customerPhone: inv.customerPhone, customerName: inv.customerName, parentId: inv.id,
      items: [{ description: desc, qty: 1, unit_price: amount, total: amount, serial: '' }], subtotal: amount, total: amount });
    const t = sendText(rc, req); const left = balanceOf(inv);
    res.json({ id: rc.id, uid: rc.uid, number: rc.number, amount, invoice_number: inv.number, balance_due: left, paid_in_full: left <= 0, customer_phone: `+${rc.customerPhone}`, message: t.message, sms_link: t.sms_link, whatsapp_link: t.whatsapp_link });
  });
  app.post('/api/qaribu/documents/:id/cancel', requireAuth, (req: any, res: any) => {
    const x = mine(req, res); if (!x) return;
    if (x.kind === 'receipt') return err(res, 400, 'A receipt is history and cannot be cancelled.');
    if (x.cancelledAt) return err(res, 400, 'It is already cancelled.');
    const reason = String(req.body?.reason || '').trim().slice(0, 200);
    if (reason.length < 3) return err(res, 400, 'Say why you are cancelling it.');
    if (x.kind === 'invoice' && (paidOn(x) > 0 || x.deposit > 0)) return err(res, 400, 'Payments were taken on this invoice, so it cannot be cancelled.');
    if (x.kind === 'quote' && x.invoicedId) return err(res, 400, 'This quote was made into an invoice.');
    runSql('UPDATE qb_documents SET cancelledAt = ?, cancelReason = ? WHERE id = ?', [now(), reason, x.id]);
    res.json({ id: x.id, kind: x.kind, number: x.number, cancelled: true, reason });
  });
  app.post('/api/qaribu/documents/:id/respond', requireAuth, (req: any, res: any) => {
    const x = queryOne('SELECT * FROM qb_documents WHERE id = ? AND kind = ? AND customerPhone = ?', [req.params.id, 'quote', `254${me(req)}`]);
    if (!x) return err(res, 404, 'That quote was not found.');
    if (x.cancelledAt || x.invoicedId) return err(res, 400, 'This quote can no longer be answered.');
    if (x.decision) return err(res, 400, 'You have already answered this quote.');
    const decision = req.body?.decision === 'accept' ? 'accepted' : req.body?.decision === 'decline' ? 'declined' : '';
    if (!decision) return err(res, 400, 'Choose accept or decline.');
    runSql('UPDATE qb_documents SET decision = ? WHERE id = ?', [decision, x.id]);
    res.json({ id: x.id, decision });
  });
  app.post('/api/qaribu/quotes/:id/invoice', requireAuth, (req: any, res: any) => {
    const q = mine(req, res, 'quote'); if (!q) return;
    if (q.cancelledAt || q.invoicedId || q.decision === 'declined') return err(res, 400, 'This quote cannot be made into an invoice.');
    const deposit = req.body?.deposit ? num(req.body.deposit) : 0;
    if (!Number.isFinite(deposit) || deposit < 0 || deposit > q.total) return err(res, 400, 'Check the deposit.');
    const due = String(req.body?.due_date || '').slice(0, 10);
    const inv = insertDoc({ kind: 'invoice', ownerPhone: q.ownerPhone, shopName: q.shopName, customerPhone: q.customerPhone, customerName: q.customerName, customerDetails: q.customerDetails,
      items: JSON.parse(q.items), subtotal: q.subtotal, discount: q.discount, taxRate: q.taxRate, tax: q.tax, shipping: q.shipping, deposit, total: q.total, dueDate: due, notes: q.notes, parentId: q.id });
    runSql('UPDATE qb_documents SET invoicedId = ? WHERE id = ?', [inv.id, q.id]);
    const t = sendText(inv, req);
    res.json({ id: inv.id, uid: inv.uid, kind: 'invoice', number: inv.number, amount: inv.total, balance_due: balanceOf(inv), date: due, customer_phone: `+${inv.customerPhone}`, message: t.message, sms_link: t.sms_link, whatsapp_link: t.whatsapp_link });
  });

  // ---------- Lists ----------
  const itemOut = (x: any, req: any, shop: boolean) => {
    const items = JSON.parse(x.items || '[]'); const t = shop ? sendText(x, req) : null;
    return {
      balance_due: x.kind === 'invoice' ? (x.cancelledAt ? null : balanceOf(x)) : null, cancelled: !!x.cancelledAt, invoiced: !!x.invoicedId, decision: x.decision || null, kind: x.kind,
      due_date: x.dueDate || '', valid_until: x.validUntil || '', id: x.id, uid: x.uid, number: x.number, shop_name: x.shopName, amount: x.total, item_count: items.length,
      first_item: items[0]?.description || '', customer_name: x.customerName || '', customer_phone: `+${x.customerPhone}`, issued_at: x.createdAt,
      message: t?.message ?? null, sms_link: t?.sms_link ?? null, whatsapp_link: t?.whatsapp_link ?? null,
    };
  };
  const list = (req: any, shop: boolean, onlyReceipts = false) => {
    const q = String(req.query.q || '').trim().toLowerCase(), from = String(req.query.from || ''), to = String(req.query.to || ''), kind = String(req.query.kind || '');
    const rows = queryAll(`SELECT * FROM qb_documents WHERE ${shop ? 'ownerPhone = ?' : 'customerPhone = ?'} ORDER BY createdAt DESC LIMIT 500`, [shop ? me(req) : `254${me(req)}`]);
    return rows.filter((x: any) =>
      (!onlyReceipts || x.kind === 'receipt') && (!kind || x.kind === kind) && (!from || x.createdAt.slice(0, 10) >= from) && (!to || x.createdAt.slice(0, 10) <= to) &&
      (!q || [x.customerName, x.customerPhone, x.number, x.uid, x.shopName].some(v => String(v || '').toLowerCase().includes(q.replace(/^\+/, '')))))
      .map((x: any) => itemOut(x, req, shop));
  };
  app.get('/api/qaribu/receipts', requireAuth, (req: any, res: any) => res.json({ receipts: list(req, true, true) }));
  app.get('/api/qaribu/me/receipts', requireAuth, (req: any, res: any) => res.json({ receipts: list(req, false, true) }));
  app.get('/api/qaribu/documents', requireAuth, (req: any, res: any) => res.json({ documents: list(req, true) }));
  app.get('/api/qaribu/me/documents', requireAuth, (req: any, res: any) => res.json({ documents: list(req, false) }));

  // ---------- The document as a page ----------
  const render = (x: any): string => {
    const k = kitRow(x.ownerPhone) || {};
    const items = JSON.parse(x.items || '[]');
    const color = HEX.test(k.color || '') ? k.color : '#000000', color2 = HEX.test(k.color2 || '') ? k.color2 : '#06C167';
    const font = (FONTS.find(f => f.key === (k.font || '')) || FONTS[0]).stack;
    const design = k.design === 'letterhead' && k.letterhead ? 'letterhead' : ['plain', 'centred'].includes(k.design) ? k.design : 'band';
    const label = x.kind === 'receipt' ? 'RECEIPT' : x.kind === 'invoice' ? 'INVOICE' : 'QUOTE';
    const bal = x.kind === 'invoice' ? balanceOf(x) : 0;
    const status = x.cancelledAt ? `<p class="st bad">CANCELLED — ${esc(x.cancelReason)}</p>`
      : x.kind === 'invoice' ? (bal <= 0 ? '<p class="st ok">PAID IN FULL</p>' : '')
      : x.kind === 'quote' ? (x.invoicedId ? '<p class="st ok">MADE INTO AN INVOICE</p>' : x.decision ? `<p class="st ${x.decision === 'accepted' ? 'ok' : 'bad'}">${x.decision.toUpperCase()}</p>` : '') : '';
    const head = design === 'letterhead'
      ? `<img class="lh" src="${esc(k.letterhead)}" alt="">`
      : `<div class="head ${design}">${k.logo ? `<img class="logo" src="${esc(k.logo)}" alt="">` : ''}<div><h1>${esc(x.shopName)}</h1>${k.tagline ? `<p>${esc(k.tagline)}</p>` : ''}<p>${esc(k.address)}${k.phone ? ` · ${esc(k.phone)}` : ''}${k.email ? ` · ${esc(k.email)}` : ''}${k.tax_pin ? ` · PIN ${esc(k.tax_pin)}` : ''}</p></div></div>`;
    const rows = items.map((i: any) => `<tr><td>${esc(i.description)}${i.serial ? `<br><small>Serial ${esc(i.serial)}</small>` : ''}</td><td class="r">${i.qty}</td><td class="r">${money(i.unit_price)}</td><td class="r">${money(i.total)}</td></tr>`).join('');
    const totals = x.kind === 'receipt' ? `<tr class="t"><td colspan="3">Total paid</td><td class="r">${money(x.total)}</td></tr>`
      : `<tr><td colspan="3">Subtotal</td><td class="r">${money(x.subtotal)}</td></tr>${x.discount ? `<tr><td colspan="3">Discount</td><td class="r">- ${money(x.discount)}</td></tr>` : ''}${x.tax ? `<tr><td colspan="3">Tax (${x.taxRate}%)</td><td class="r">${money(x.tax)}</td></tr>` : ''}${x.shipping ? `<tr><td colspan="3">Shipping</td><td class="r">${money(x.shipping)}</td></tr>` : ''}<tr class="t"><td colspan="3">Total</td><td class="r">${money(x.total)}</td></tr>${x.kind === 'invoice' ? `${x.deposit ? `<tr><td colspan="3">Deposit paid</td><td class="r">${money(x.deposit)}</td></tr>` : ''}${paidOn(x) ? `<tr><td colspan="3">Payments received</td><td class="r">${money(paidOn(x))}</td></tr>` : ''}<tr class="t"><td colspan="3">Balance due</td><td class="r">${money(bal)}</td></tr>` : ''}`;
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${label} ${esc(x.number)}</title><style>
      body{margin:0;padding:16px;font-family:${font};color:#111;background:#fff;font-size:14px}h1{margin:0;font-size:20px}p{margin:3px 0;color:#444}.head{display:flex;gap:12px;align-items:center;padding:14px;border-radius:12px;background:${color};color:#fff}.head p{color:#ffffffcc}
      .head.plain{background:none;color:#111;border-bottom:2px solid ${color};border-radius:0}.head.plain p{color:#444}.head.centred{flex-direction:column;text-align:center;background:none;color:#111;border-bottom:2px solid ${color2};border-radius:0}.head.centred p{color:#444}
      .logo{max-height:48px;max-width:96px;border-radius:6px;background:#fff}.lh{width:100%;display:block}.meta{display:flex;justify-content:space-between;margin:14px 0 6px}.lbl{font-weight:800;letter-spacing:.08em;color:${color2}}
      table{width:100%;border-collapse:collapse;margin-top:8px}td{padding:7px 4px;border-bottom:1px solid #eee;vertical-align:top}.r{text-align:right;white-space:nowrap}tr.t td{font-weight:800;border-top:2px solid ${color};border-bottom:0}small{color:#777}
      .st{font-weight:800;text-align:center;margin:12px 0}.ok{color:#0a8f55}.bad{color:#b00020}.foot{margin-top:16px;color:#555;font-size:12px;white-space:pre-line}.uid{color:#888;font-size:11px;margin-top:12px}</style></head><body>${head}
      <div class="meta"><div><span class="lbl">${label}</span><p>${esc(x.number)}</p></div><div style="text-align:right"><p>${esc(new Date(x.createdAt).toLocaleDateString('en-KE', { timeZone: 'Africa/Nairobi', dateStyle: 'medium' }))}</p>${x.dueDate ? `<p>Due ${esc(x.dueDate)}</p>` : ''}${x.validUntil ? `<p>Valid until ${esc(x.validUntil)}</p>` : ''}</div></div>
      ${x.customerName || x.customerDetails ? `<p><b>To:</b> ${esc(x.customerName)}${x.customerDetails ? `<br>${esc(x.customerDetails)}` : ''}</p>` : ''}
      <table><tr><td><b>Item</b></td><td class="r"><b>Qty</b></td><td class="r"><b>Price</b></td><td class="r"><b>Amount</b></td></tr>${rows}${totals}</table>${status}
      ${x.notes ? `<p class="foot">${esc(x.notes)}</p>` : ''}${x.kind !== 'receipt' && k.payment_details ? `<p class="foot"><b>How to pay</b>\n${esc(k.payment_details)}</p>` : ''}${x.kind === 'receipt' && k.receipt_note ? `<p class="foot">${esc(k.receipt_note)}</p>` : ''}
      <p class="uid">ID ${esc(x.uid)}</p></body></html>`;
  };

  // Signed in, for the shop or the customer: the page for the app's preview frame. It does not use up the customer's link.
  app.get('/api/qaribu/receipts/:id/page', requireAuth, (req: any, res: any) => {
    const x = queryOne('SELECT * FROM qb_documents WHERE id = ? AND (ownerPhone = ? OR customerPhone = ?)', [req.params.id, me(req), `254${me(req)}`]);
    if (!x) return err(res, 404, 'That document was not found.');
    res.set({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }).send(render(x));
  });
  // The link sent to the customer: it opens once. After that they read it in the app, signed in with their number.
  app.get('/r/:token', (req: any, res: any) => {
    res.set('Cache-Control', 'no-store');
    const x = queryOne('SELECT * FROM qb_documents WHERE token = ?', [req.params.token]);
    if (!x) return res.status(404).send(page('Document', '<h1>Document not found</h1>'));
    if (x.openedAt) return res.send(page('Already opened', `<h1>This link has been opened</h1><p>For your privacy, a document link opens once. Open Nikosoko, sign in with the phone number this was sent to, and find it under My Invoice, Received.</p><p><b>${esc(x.number)}</b> from ${esc(x.shopName)}</p>`));
    runSql('UPDATE qb_documents SET openedAt = ? WHERE id = ?', [now(), x.id]);
    res.type('html').send(render(x));
  });
}
