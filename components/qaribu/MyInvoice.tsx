import React, { useEffect, useState } from 'react';
import { q } from '../../services/qaribuApi';
import { Shell, SignInPrompt, Card, Field, Btn, Tabs, Err, copy } from './ui';

interface Doc {
  id: string; kind: 'receipt' | 'invoice' | 'quote'; number: string; customerName: string; customerPhone: string;
  items: { description: string; qty: number; price: number }[]; total: number; paid: number; balance: number; state: string; note: string;
  createdAt: string; link: string; mine: boolean; fromDoc: string | null; events: { event: string; data: any; at: string }[];
}
const kes = (n: number) => `KES ${Math.round(n).toLocaleString('en-KE')}`;
const blank = () => ({ kind: 'invoice', customerName: '', customerPhone: '', note: '', items: [{ description: '', qty: 1, price: 0 }] });

const MyInvoice: React.FC<{ isAuthenticated: boolean; onSignIn: () => void; onBack: () => void }> = ({ isAuthenticated, onSignIn, onBack }) => {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<any>(blank());
  const [open, setOpen] = useState<string | null>(null);
  const [pay, setPay] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => q<Doc[]>(`/documents${search ? `?q=${encodeURIComponent(search)}` : ''}`).then(setDocs).catch(e => setErr(e.message));
  useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated, search]);
  const act = async (fn: () => Promise<any>) => { setBusy(true); setErr(''); try { await fn(); await load(); } catch (e: any) { setErr(e.message); } finally { setBusy(false); } };

  const shown = docs.filter(d => tab === 'All' || d.kind === tab.toLowerCase().replace(/s$/, ''));
  const total = form.items.reduce((a: number, i: any) => a + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
  const setItem = (idx: number, patch: any) => setForm({ ...form, items: form.items.map((it: any, i: number) => (i === idx ? { ...it, ...patch } : it)) });

  return (
    <Shell title="My Invoice" onBack={onBack}>
      {!isAuthenticated ? <SignInPrompt what="My Invoice" onSignIn={onSignIn} /> : creating ? (
        <Card>
          <p className="font-black text-lg">New document</p>
          <div className="grid grid-cols-3 gap-1 p-1 mt-3 rounded-xl bg-neutral-200">
            {['receipt', 'invoice', 'quote'].map(k => (
              <button key={k} onClick={() => setForm({ ...form, kind: k })} className={`py-2 rounded-lg text-xs font-black uppercase cursor-pointer ${form.kind === k ? 'bg-black text-white' : 'text-neutral-600'}`}>{k}</button>
            ))}
          </div>
          <Field label="Customer name" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} />
          <Field label="Customer phone (optional)" inputMode="tel" value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} placeholder="0712345678" />
          <p className="text-[11px] font-black uppercase tracking-wider text-neutral-500 mt-4">Items</p>
          {form.items.map((it: any, i: number) => (
            <div key={i} className="mt-2 p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <input value={it.description} onChange={e => setItem(i, { description: e.target.value })} placeholder="What was sold or done" className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5" />
              <div className="flex gap-2 mt-2">
                <input type="number" min="1" value={it.qty} onChange={e => setItem(i, { qty: e.target.value })} className="w-20 rounded-lg border border-neutral-300 bg-white px-3 py-2.5" aria-label="Quantity" />
                <input type="number" min="0" value={it.price || ''} onChange={e => setItem(i, { price: e.target.value })} placeholder="Price each" className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2.5" />
                {form.items.length > 1 && <button className="px-3 text-red-700 font-black cursor-pointer" onClick={() => setForm({ ...form, items: form.items.filter((_: any, j: number) => j !== i) })}>×</button>}
              </div>
            </div>
          ))}
          <button className="mt-2 text-sm font-black underline cursor-pointer" onClick={() => setForm({ ...form, items: [...form.items, { description: '', qty: 1, price: 0 }] })}>+ Add an item</button>
          <Field label="Note (optional)" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
          <p className="mt-4 text-xl font-black">Total {kes(total)}</p>
          <p className="text-xs text-neutral-500 mt-1">{form.kind === 'receipt' ? 'A receipt is proof of payment and cannot be edited afterwards.' : form.kind === 'invoice' ? 'You can record payments against it later.' : 'You can turn an accepted quote into an invoice.'}</p>
          <Err msg={err} />
          <div className="flex gap-2 mt-4">
            <Btn tone="green" disabled={busy} onClick={() => act(async () => { const d = await q<Doc>('/documents', 'POST', form); setCreating(false); setForm(blank()); setOpen(d.id); })}>Issue {form.kind}</Btn>
            <Btn tone="line" onClick={() => { setCreating(false); setErr(''); }}>Cancel</Btn>
          </div>
        </Card>
      ) : (
        <>
          <Btn tone="green" className="w-full mb-3" onClick={() => setCreating(true)}>+ New receipt, invoice or quote</Btn>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, number or phone" className="w-full mb-3 rounded-xl border border-neutral-300 bg-white px-3.5 py-3" />
          <Tabs tabs={['All', 'Receipts', 'Invoices', 'Quotes']} value={tab} onChange={setTab} />
          <Err msg={err} />
          {msg && <p className="text-sm font-bold text-emerald-700 mb-2">{msg}</p>}
          {shown.length === 0 && <p className="text-neutral-500 text-sm text-center py-10">Nothing here yet.</p>}
          {shown.map(d => (
            <Card key={d.id} className="mb-2">
              <button className="w-full text-left cursor-pointer" onClick={() => { setOpen(open === d.id ? null : d.id); setPay(''); }}>
                <div className="flex justify-between items-start">
                  <div><p className="font-black">{d.number} <span className="text-xs font-bold text-neutral-500 uppercase">{d.kind}</span></p><p className="text-sm text-neutral-600">{d.customerName}{!d.mine && ' (from a seller)'}</p></div>
                  <div className="text-right"><p className="font-black">{kes(d.total)}</p><p className="text-[10px] font-black uppercase" style={{ color: d.state === 'cancelled' ? '#b00020' : d.state === 'paid' ? '#0a8f55' : '#555' }}>{d.state}</p></div>
                </div>
              </button>
              {open === d.id && (
                <div className="mt-3 pt-3 border-t border-neutral-200 text-sm">
                  {d.items.map((it, i) => <div key={i} className="flex justify-between py-0.5"><span>{it.description} <span className="text-neutral-500">× {it.qty}</span></span><span>{kes(it.qty * it.price)}</span></div>)}
                  {d.kind === 'invoice' && <p className="mt-2">Paid {kes(d.paid)} · Balance <b>{kes(d.balance)}</b></p>}
                  {d.note && <p className="mt-2 text-neutral-600">{d.note}</p>}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Btn tone="line" onClick={async () => { setMsg((await copy(d.link)) ? 'Link copied. Anyone with it can view this document.' : d.link); setTimeout(() => setMsg(''), 3000); }}>Copy link</Btn>
                    <a className="px-4 py-3 rounded-xl font-black text-sm text-black" style={{ background: '#22C27A' }} target="_blank" rel="noreferrer"
                       href={`https://wa.me/${d.customerPhone}?text=${encodeURIComponent(`${d.kind} ${d.number} from me: ${d.link}`)}`}>WhatsApp</a>
                    {d.mine && d.kind === 'quote' && d.state === 'open' && <Btn tone="dark" disabled={busy} onClick={() => act(() => q(`/documents/${d.id}/to-invoice`, 'POST'))}>Make invoice</Btn>}
                    {d.mine && d.kind !== 'receipt' && d.paid === 0 && d.state === 'open' && <Btn tone="line" disabled={busy} onClick={() => act(() => q(`/documents/${d.id}/cancel`, 'POST'))}>Cancel</Btn>}
                  </div>
                  {d.mine && d.kind === 'invoice' && d.balance > 0 && d.state !== 'cancelled' && (
                    <div className="flex gap-2 mt-3">
                      <input type="number" value={pay} onChange={e => setPay(e.target.value)} placeholder={`Amount (up to ${d.balance})`} className="flex-1 rounded-xl border border-neutral-300 bg-white px-3 py-3" />
                      <Btn tone="green" disabled={busy || !pay} onClick={() => act(async () => { await q(`/documents/${d.id}/payment`, 'POST', { amount: Number(pay) }); setPay(''); })}>Record payment</Btn>
                    </div>
                  )}
                  <p className="text-[11px] font-black uppercase tracking-wider text-neutral-500 mt-4">History</p>
                  {d.events.map((e, i) => <p key={i} className="text-xs text-neutral-600">{new Date(e.at).toLocaleString('en-KE')} · {e.event}{e.data?.amount ? ` ${kes(e.data.amount)}` : ''}</p>)}
                </div>
              )}
            </Card>
          ))}
        </>
      )}
    </Shell>
  );
};

export default MyInvoice;
