// Receipts, invoices and quotes (Qaribu documents) on Nikosoko's database.
import { Deps, tok, now, base, page, esc, runAll } from './qaribuShared';

export function registerQaribuDocs(d: Deps) {
  const { app, requireAuth, queryAll, queryOne, runSql, last9 } = d;
  const me = (req: any): string => req.auth.phone;

  runAll(runSql, `
    CREATE TABLE IF NOT EXISTS qb_docs (id TEXT PRIMARY KEY, ownerPhone TEXT, kind TEXT, number TEXT, customerName TEXT, customerPhone TEXT,
      items TEXT, total REAL, paid REAL DEFAULT 0, state TEXT DEFAULT 'open', note TEXT, token TEXT, fromDoc TEXT, createdAt TEXT);
    CREATE TABLE IF NOT EXISTS qb_doc_events (id INTEGER PRIMARY KEY AUTOINCREMENT, docId TEXT, event TEXT, data TEXT, at TEXT);
  `);

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
