import React, { useEffect, useState } from 'react';
import { q } from '../../services/qaribuApi';
import { Card, Field, Btn, Err, copy } from './ui';

export interface Place {
  id: string; name: string; kind: string; area: string; about: string; gatepass: boolean; role: string | null;
  guardLink?: string; pageLink: string;
  members: { phone: string; name: string; role: string }[];
  vacancies: { id: string; title: string; rent: string; note: string; status: string; confirmedAt: string }[];
}

// Lives inside the Gate pass screen (Places tab). `onChanged` tells the parent to reload its place list.
const MyPlaces: React.FC<{ onChanged?: () => void; onOpenGate?: () => void }> = ({ onChanged, onOpenGate }) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', kind: 'residential', area: '', about: '' });
  const [open, setOpen] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const load = () => q<Place[]>('/places').then(ps => { setPlaces(ps); onChanged?.(); }).catch(e => setErr(e.message));
  useEffect(() => { load(); }, []);

  const run = async (fn: () => Promise<any>) => { setBusy(true); setErr(''); try { await fn(); await load(); } catch (e: any) { setErr(e.message); } finally { setBusy(false); } };
  const flash = (m: string) => { setNote(m); setTimeout(() => setNote(''), 2000); };

  return (
    <>
      {true && (
        <>
          <Err msg={err} />
          {note && <p className="mb-3 text-sm font-bold text-emerald-700">{note}</p>}
          {places.length === 0 && !adding && <Card><p className="font-bold">No places yet</p><p className="text-sm text-neutral-600 mt-1">Add the estate, building, school or business you manage. You can then invite visitors with a gate pass and list vacancies.</p></Card>}

          {places.map(p => (
            <Card key={p.id} className="mb-3">
              <button className="w-full text-left cursor-pointer" onClick={() => setOpen(open === p.id ? null : p.id)}>
                <div className="flex items-center justify-between">
                  <div><p className="font-black text-lg leading-tight">{p.name}</p><p className="text-xs text-neutral-500">{p.area || p.kind} · you are {p.role}</p></div>
                  <span className="text-xs font-black px-2 py-1 rounded-full" style={{ background: p.gatepass ? '#22C27A' : '#e5e5e5' }}>{p.gatepass ? 'GATE PASS ON' : 'GATE PASS OFF'}</span>
                </div>
              </button>

              {open === p.id && (
                <div className="mt-4 border-t border-neutral-200 pt-4">
                  {p.role === 'owner' && (
                    <Btn tone={p.gatepass ? 'line' : 'green'} disabled={busy} onClick={() => run(() => q(`/places/${p.id}/gatepass`, 'POST', { enabled: !p.gatepass }))}>
                      {p.gatepass ? 'Switch gate pass off' : 'Switch gate pass on'}
                    </Btn>
                  )}
                  {p.gatepass && onOpenGate && <Btn tone="dark" className="ml-2" onClick={onOpenGate}>Invite visitors</Btn>}

                  <div className="mt-4 text-sm">
                    <p className="font-black text-xs uppercase tracking-wider text-neutral-500">Place page (put the QR sticker here)</p>
                    <button className="underline break-all text-left cursor-pointer" onClick={async () => flash((await copy(p.pageLink)) ? 'Link copied' : p.pageLink)}>{p.pageLink}</button>
                    {p.guardLink && (<>
                      <p className="font-black text-xs uppercase tracking-wider text-neutral-500 mt-3">Guard link (give only to your guard)</p>
                      <button className="underline break-all text-left cursor-pointer" onClick={async () => flash((await copy(p.guardLink!)) ? 'Guard link copied' : p.guardLink!)}>{p.guardLink}</button>
                    </>)}
                  </div>

                  <p className="font-black text-xs uppercase tracking-wider text-neutral-500 mt-5">Team</p>
                  {p.members.length === 0 && <p className="text-sm text-neutral-500">Just you so far.</p>}
                  {p.members.map(m => (
                    <div key={m.phone} className="flex items-center justify-between py-1.5 text-sm">
                      <span><b>{m.name || `0${m.phone}`}</b> · {m.role}</span>
                      {(p.role === 'owner' || p.role === 'manager') && <button className="text-red-700 font-bold cursor-pointer" onClick={() => run(() => q(`/places/${p.id}/members/${m.phone}`, 'DELETE'))}>Remove</button>}
                    </div>
                  ))}
                  {(p.role === 'owner' || p.role === 'manager') && <AddMember onAdd={(b) => run(() => q(`/places/${p.id}/members`, 'POST', b))} />}

                  <p className="font-black text-xs uppercase tracking-wider text-neutral-500 mt-5">Vacancies</p>
                  {p.vacancies.length === 0 && <p className="text-sm text-neutral-500">None listed.</p>}
                  {p.vacancies.map(v => (
                    <div key={v.id} className="py-2 border-b border-neutral-100 text-sm">
                      <b>{v.title}</b> {v.rent && <span>· {v.rent}</span>} {v.status === 'filled' && <span className="font-black text-neutral-500">FILLED</span>}
                      <div className="flex gap-3 mt-1 text-xs font-bold">
                        <button className="cursor-pointer" onClick={() => run(() => q(`/vacancies/${v.id}`, 'POST', { action: 'confirm' }))}>Still open</button>
                        <button className="cursor-pointer" onClick={() => run(() => q(`/vacancies/${v.id}`, 'POST', { action: 'fill' }))}>Mark filled</button>
                        <button className="text-red-700 cursor-pointer" onClick={() => run(() => q(`/vacancies/${v.id}`, 'POST', { action: 'remove' }))}>Remove</button>
                      </div>
                    </div>
                  ))}
                  {['owner', 'manager', 'caretaker'].includes(p.role || '') && <AddVacancy onAdd={(b) => run(() => q(`/places/${p.id}/vacancies`, 'POST', b))} />}
                </div>
              )}
            </Card>
          ))}

          {adding ? (
            <Card>
              <p className="font-black">Add a place</p>
              <Field label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Greenview Apartments" />
              <label className="block mt-3"><span className="text-[11px] font-black uppercase tracking-wider text-neutral-500">Kind</span>
                <select value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value })} className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-3 text-base">
                  {['residential', 'commercial', 'school', 'office', 'sacco', 'other'].map(k => <option key={k}>{k}</option>)}
                </select></label>
              <Field label="Area" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} placeholder="Ruaka" />
              <Field label="About (optional)" value={form.about} onChange={e => setForm({ ...form, about: e.target.value })} />
              <div className="mt-4 flex gap-2">
                <Btn tone="green" disabled={busy} onClick={() => run(async () => { await q('/places', 'POST', form); setAdding(false); setForm({ name: '', kind: 'residential', area: '', about: '' }); })}>Save place</Btn>
                <Btn tone="line" onClick={() => setAdding(false)}>Cancel</Btn>
              </div>
            </Card>
          ) : <Btn tone="dark" className="w-full" onClick={() => setAdding(true)}>+ Add a place</Btn>}
        </>
      )}
    </>
  );
};

const AddMember: React.FC<{ onAdd: (b: any) => void }> = ({ onAdd }) => {
  const [b, setB] = useState({ name: '', phone: '', role: 'gateman' });
  return (
    <div className="mt-2">
      <Field label="Name" value={b.name} onChange={e => setB({ ...b, name: e.target.value })} />
      <Field label="Phone" inputMode="tel" value={b.phone} onChange={e => setB({ ...b, phone: e.target.value })} placeholder="0712345678" />
      <select value={b.role} onChange={e => setB({ ...b, role: e.target.value })} className="mt-3 w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-3">
        {['gateman', 'caretaker', 'manager', 'tenant'].map(r => <option key={r}>{r}</option>)}
      </select>
      <Btn tone="line" className="mt-3" onClick={() => { onAdd(b); setB({ name: '', phone: '', role: 'gateman' }); }}>Add person</Btn>
    </div>
  );
};

const AddVacancy: React.FC<{ onAdd: (b: any) => void }> = ({ onAdd }) => {
  const [b, setB] = useState({ title: '', rent: '', note: '' });
  return (
    <div className="mt-2">
      <Field label="Vacancy" value={b.title} onChange={e => setB({ ...b, title: e.target.value })} placeholder="2 bedroom, 3rd floor" />
      <Field label="Rent" value={b.rent} onChange={e => setB({ ...b, rent: e.target.value })} placeholder="KES 25,000" />
      <Field label="Note" value={b.note} onChange={e => setB({ ...b, note: e.target.value })} />
      <Btn tone="line" className="mt-3" onClick={() => { onAdd(b); setB({ title: '', rent: '', note: '' }); }}>List vacancy</Btn>
    </div>
  );
};

export default MyPlaces;
