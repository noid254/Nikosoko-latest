import React, { useEffect, useState } from 'react';
import { q } from '../../services/qaribuApi';
import { Shell, SignInPrompt, Card, Field, Btn, Tabs, Err, copy } from './ui';
import MyPlaces from './MyPlaces';
import type { Place } from './MyPlaces';

interface Pass {
  id: string; visitorName: string; visitorPhone: string; purpose: string; hostLabel: string; code: string;
  state: 'waiting' | 'arrived' | 'left' | 'expired' | 'cancelled'; expiresAt: string; link: string; smsLink: string; whatsappLink: string; text: string;
}

const STATE_LABEL: Record<string, string> = { waiting: 'Waiting', arrived: 'Arrived', left: 'Left', expired: 'Expired', cancelled: 'Cancelled' };

const QaribuGate: React.FC<{ isAuthenticated: boolean; onSignIn: () => void; onBack: () => void }> = ({ isAuthenticated, onSignIn, onBack }) => {
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [pid, setPid] = useState('');
  const [tab, setTab] = useState('Invite');
  const [showPlaces, setShowPlaces] = useState(false);
  const [passes, setPasses] = useState<Pass[]>([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [issued, setIssued] = useState<Pass | null>(null);
  const [f, setF] = useState({ visitorName: '', visitorPhone: '', purpose: '' });
  const [code, setCode] = useState('');
  const [found, setFound] = useState<Pass | null>(null);
  const [copied, setCopied] = useState(false);

  const place = places?.find(p => p.id === pid);
  const canHost = !!place && ['owner', 'manager', 'caretaker', 'tenant'].includes(place.role || '');
  const canGate = !!place && ['owner', 'manager', 'gateman'].includes(place.role || '');

  const loadPlaces = () => q<Place[]>('/places').then(ps => { setPlaces(ps); setPid(cur => (ps.some(p => p.id === cur) ? cur : ps[0]?.id || '')); }).catch(e => setErr(e.message));
  useEffect(() => { if (isAuthenticated) loadPlaces(); }, [isAuthenticated]);

  const loadPasses = () => pid && q<Pass[]>(`/places/${pid}/passes`).then(setPasses).catch(() => {});
  useEffect(() => { setIssued(null); setFound(null); if (place?.gatepass) loadPasses(); setTab(canHost ? 'Invite' : 'Gate'); }, [pid, places]);

  const act = async (fn: () => Promise<any>) => { setBusy(true); setErr(''); try { await fn(); } catch (e: any) { setErr(e.message); } finally { setBusy(false); } };

  return (
    <Shell title="Qaribu · Gate pass" onBack={onBack}>
      {!isAuthenticated ? <SignInPrompt what="gate pass" onSignIn={onSignIn} /> : places === null ? <p className="text-neutral-500">Loading…</p> : (
        <>
          <Tabs tabs={['Gate pass', 'Places']} value={showPlaces || places.length === 0 ? 'Places' : 'Gate pass'} onChange={t => setShowPlaces(t === 'Places')} />
          {(showPlaces || places.length === 0) ? (
            <>
              {places.length === 0 && <p className="text-sm text-neutral-600 mb-3">Add the estate, building, school or business you manage. Then you can invite visitors, add your guard and list vacancies.</p>}
              <MyPlaces onChanged={loadPlaces} onOpenGate={() => setShowPlaces(false)} />
            </>
          ) : (
            <>
          {places.length > 1 && (
            <select value={pid} onChange={e => setPid(e.target.value)} className="w-full mb-3 rounded-xl border border-neutral-300 bg-white px-3.5 py-3 font-bold">
              {places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          {places.length === 1 && <p className="font-black text-xl mb-3">{place?.name}</p>}
          <Err msg={err} />

          {place && !place.gatepass ? (
            <Card><p className="font-black">Gate pass is off for {place.name}</p>
              <p className="text-sm text-neutral-600 mt-1">{place.role === 'owner' ? 'Switch it on under Places.' : 'The owner needs to switch it on.'}</p>
              <Btn tone="green" className="mt-3" onClick={() => setShowPlaces(true)}>Open Places</Btn></Card>
          ) : (
            <>
              <Tabs tabs={[...(canHost ? ['Invite', 'Expected'] : []), ...(canGate ? ['Gate'] : [])]} value={tab} onChange={t => { setTab(t); if (t === 'Expected') loadPasses(); }} />

              {tab === 'Invite' && (issued ? (
                <Card>
                  <p className="text-xs font-black uppercase tracking-wider text-neutral-500">Pass for {issued.visitorName}</p>
                  <p className="text-5xl font-black tracking-[0.12em] text-center my-4">{issued.code}</p>
                  <p className="text-sm text-neutral-600 text-center">Valid for 24 hours, works once. Send the link so they can show it at the gate.</p>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <a href={issued.smsLink} className="text-center px-4 py-3 rounded-xl font-black text-sm bg-black text-white">Send by SMS</a>
                    <a href={issued.whatsappLink} target="_blank" rel="noreferrer" className="text-center px-4 py-3 rounded-xl font-black text-sm text-black" style={{ background: '#22C27A' }}>WhatsApp</a>
                  </div>
                  <Btn tone="line" className="w-full mt-2" onClick={async () => { setCopied(await copy(issued.text)); setTimeout(() => setCopied(false), 1500); }}>{copied ? 'Copied' : 'Copy message'}</Btn>
                  <Btn tone="line" className="w-full mt-2" onClick={() => { setIssued(null); setF({ visitorName: '', visitorPhone: '', purpose: '' }); }}>Invite someone else</Btn>
                </Card>
              ) : (
                <Card>
                  <Field label="Visitor name" value={f.visitorName} onChange={e => setF({ ...f, visitorName: e.target.value })} />
                  <Field label="Visitor phone" inputMode="tel" value={f.visitorPhone} onChange={e => setF({ ...f, visitorPhone: e.target.value })} placeholder="0712345678" />
                  <Field label="Reason for visit" value={f.purpose} onChange={e => setF({ ...f, purpose: e.target.value })} placeholder="Delivery, family, repairs…" />
                  <Btn tone="green" className="w-full mt-4" disabled={busy} onClick={() => act(async () => { setIssued(await q<Pass>(`/places/${pid}/passes`, 'POST', f)); loadPasses(); })}>Create pass</Btn>
                  <p className="text-xs text-neutral-500 mt-3">We don't send the SMS for you yet. After creating the pass you tap Send, and it opens your own messages or WhatsApp with the invite ready.</p>
                </Card>
              ))}

              {tab === 'Expected' && (
                <>
                  {passes.length === 0 && <p className="text-neutral-500 text-sm">No passes in the last 48 hours.</p>}
                  {passes.map(p => (
                    <Card key={p.id} className="mb-2">
                      <div className="flex justify-between items-start">
                        <div><p className="font-black">{p.visitorName}</p><p className="text-xs text-neutral-500">{p.purpose} · host {p.hostLabel}</p></div>
                        <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full" style={{ background: p.state === 'waiting' ? '#22C27A' : '#e5e5e5' }}>{STATE_LABEL[p.state]}</span>
                      </div>
                      <p className="mt-1 text-sm">Code <b className="tracking-wider">{p.code}</b></p>
                      {p.state === 'waiting' && <button className="mt-2 text-xs font-bold text-red-700 cursor-pointer" onClick={() => act(async () => { await q(`/passes/${p.id}/cancel`, 'POST'); await loadPasses(); })}>Cancel pass</button>}
                    </Card>
                  ))}
                </>
              )}

              {tab === 'Gate' && (
                <>
                  <Card>
                    <Field label="Visitor's 6-digit code" inputMode="numeric" value={code} onChange={e => setCode(e.target.value)} placeholder="482 913" />
                    <Btn tone="dark" className="w-full mt-3" disabled={busy || !code} onClick={() => act(async () => { setFound(await q<Pass>(`/places/${pid}/verify`, 'POST', { code })); })}>Check pass</Btn>
                  </Card>
                  {found && (
                    <Card className="mt-3">
                      <p className="font-black text-lg">{found.visitorName}</p>
                      <p className="text-sm text-neutral-600">Visiting {found.hostLabel} · {found.purpose}</p>
                      <p className="mt-2 font-black" style={{ color: found.state === 'waiting' ? '#0a8f55' : '#b00020' }}>{found.state === 'waiting' ? 'Valid pass' : `Cannot admit: ${STATE_LABEL[found.state].toLowerCase()}`}</p>
                      {found.state === 'waiting' && <Btn tone="green" className="w-full mt-3" disabled={busy} onClick={() => act(async () => { await q(`/passes/${found.id}/admit`, 'POST'); setFound({ ...found, state: 'arrived' }); setCode(''); loadPasses(); })}>Admit</Btn>}
                      {found.state === 'arrived' && <Btn tone="line" className="w-full mt-3" onClick={() => act(async () => { await q(`/passes/${found.id}/leave`, 'POST'); setFound({ ...found, state: 'left' }); loadPasses(); })}>Check out</Btn>}
                    </Card>
                  )}
                  {passes.some(p => p.state === 'arrived') && <p className="text-xs font-black uppercase tracking-wider text-neutral-500 mt-5 mb-2">Inside now</p>}
                  {passes.filter(p => p.state === 'arrived').map(p => (
                    <Card key={p.id} className="mb-2 flex justify-between items-center"><span><b>{p.visitorName}</b> <span className="text-xs text-neutral-500">for {p.hostLabel}</span></span>
                      <Btn tone="line" onClick={() => act(async () => { await q(`/passes/${p.id}/leave`, 'POST'); loadPasses(); })}>Check out</Btn></Card>
                  ))}
                </>
              )}
            </>
          )}
            </>
          )}
        </>
      )}
    </Shell>
  );
};

export default QaribuGate;
