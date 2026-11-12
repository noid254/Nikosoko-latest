import React, { useEffect, useState } from 'react';
import { markQaribuUsed } from '../../../services/qaribuPrefetch';
import * as api from '../../../services/assetsApi';

interface AssetsHubProps {
  isAuthenticated: boolean;
  onSignIn: () => void;
  onBack: () => void;
}

type TabKey = 'mine' | 'add' | 'check';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'mine', label: 'My assets' },
  { key: 'add', label: 'Add' },
  { key: 'check', label: 'Check' },
];

const EVENT_LABEL: Record<string, string> = {
  registered: 'Registered by you',
  claimed_from_receipt: 'Claimed from a receipt',
  transferred: 'Transferred',
};

const day = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { dateStyle: 'medium', timeZone: 'Africa/Nairobi' });

const Badge: React.FC<{ verified: boolean }> = ({ verified }) =>
  verified ? (
    <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5">✓ Verified</span>
  ) : (
    <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200 rounded-full px-2 py-0.5">Unverified</span>
  );

// The things a person owns, from the Qaribu asset ledger: phones, tools and machines by serial number, and vehicles
// (motorbikes, delivery vans, cars) by registration plate. One owner per serial, and a history that cannot be changed.
const AssetsHub: React.FC<AssetsHubProps> = ({ isAuthenticated, onSignIn, onBack }) => {
  const [tab, setTab] = useState<TabKey>('mine');
  const [assets, setAssets] = useState<api.Asset[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [open, setOpen] = useState<api.Asset | null>(null);

  const load = () => {
    setLoadError('');
    api
      .getMyAssets()
      .then((r) => setAssets(r.assets))
      .catch((err: Error) => setLoadError(err.message));
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    markQaribuUsed();
    load();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white px-4 py-4 flex items-center">
        <button onClick={onBack} className="mr-3 text-xl" aria-label="Back">&larr;</button>
        <h1 className="text-lg font-bold">My Assets</h1>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {!isAuthenticated && (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-700 mb-4">Sign in to register what you own — your motorbike, van, tools and machines — and check an item before you buy it.</p>
            <button onClick={onSignIn} className="w-full bg-brand-gold text-brand-navy font-bold py-2 px-4 rounded-lg active-scale">Sign in</button>
          </div>
        )}

        {isAuthenticated && (
          <>
            <div className="flex gap-1 bg-gray-200 rounded-lg p-1" role="tablist">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-1 text-sm font-semibold py-2 rounded-md ${tab === t.key ? 'bg-white text-brand-navy shadow' : 'text-gray-600'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'mine' && (
              <MyAssets assets={assets} error={loadError} onOpen={setOpen} onAdd={() => setTab('add')} onRetry={load} />
            )}
            {tab === 'add' && (
              <AddAsset
                onAdded={(a) => {
                  setAssets((prev) => [a, ...(prev ?? [])]);
                  setTab('mine');
                }}
              />
            )}
            {tab === 'check' && <CheckSerial />}
          </>
        )}
      </div>

      {open && <AssetDetail asset={open} onClose={() => setOpen(null)} />}
    </div>
  );
};

const MyAssets: React.FC<{ assets: api.Asset[] | null; error: string; onOpen: (a: api.Asset) => void; onAdd: () => void; onRetry: () => void }> = ({ assets, error, onOpen, onAdd, onRetry }) => {
  if (error)
    return (
      <div className="text-center space-y-2">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={onRetry} className="text-sm font-semibold text-brand-navy underline">Try again</button>
      </div>
    );
  if (!assets) return <p className="text-center text-gray-500">Loading…</p>;
  if (assets.length === 0)
    return (
      <div className="bg-white rounded-xl shadow p-6 text-center space-y-3">
        <p className="font-semibold text-gray-800">Nothing registered yet</p>
        <p className="text-sm text-gray-600">Add your motorbike, delivery van, tools or phone. Each item is tied to you by its serial number or plate, so you can prove it is yours.</p>
        <button onClick={onAdd} className="w-full bg-brand-gold text-brand-navy font-bold py-2 px-4 rounded-lg active-scale">Add an asset</button>
      </div>
    );
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">Items registered to you. Tap one to see its history.</p>
      {assets.map((a) => (
        <button key={a.id} onClick={() => onOpen(a)} className="w-full text-left bg-white rounded-xl shadow-sm p-4 flex items-start justify-between gap-3 active-scale">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{api.kindLabel(a.kind)}</p>
            <p className="font-semibold text-gray-900 truncate">{a.name}</p>
            {(a.make_model || a.year) && <p className="text-xs text-gray-600 truncate">{[a.make_model, a.year].filter(Boolean).join(' · ')}</p>}
            <p className="text-xs text-gray-500 font-mono mt-1">{a.kind === 'vehicle' ? 'Plate ' : 'SN '}{a.serial}</p>
          </div>
          <Badge verified={a.verification === 'verified'} />
        </button>
      ))}
    </div>
  );
};

const AddAsset: React.FC<{ onAdded: (a: api.Asset) => void }> = ({ onAdded }) => {
  const [kind, setKind] = useState<api.AssetKind>('vehicle');
  const [name, setName] = useState('');
  const [makeModel, setMakeModel] = useState('');
  const [year, setYear] = useState('');
  const [serial, setSerial] = useState('');
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isVehicle = kind === 'vehicle';
  const ready = name.trim().length >= 2 && serial.trim().length >= 3 && consent && !busy;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError('');
    api
      .registerAsset({ kind, name, make_model: makeModel, year, serial, notes, consent_show_name: consent })
      .then((r) => onAdded(r.asset))
      .catch((err: Error) => setError(err.message))
      .finally(() => setBusy(false));
  };

  const field = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy';

  return (
    <form onSubmit={submit} className="bg-white rounded-xl shadow p-4 space-y-3">
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-2">What is it?</p>
        <div className="grid grid-cols-2 gap-2">
          {api.KINDS.map((k) => (
            <button
              key={k.key}
              type="button"
              aria-pressed={kind === k.key}
              onClick={() => setKind(k.key)}
              className={`text-left rounded-lg border p-2 ${kind === k.key ? 'border-brand-navy bg-brand-navy text-white' : 'border-gray-200 text-gray-700'}`}
            >
              <span className="block text-sm font-semibold">{k.label}</span>
              <span className={`block text-[11px] ${kind === k.key ? 'text-white/80' : 'text-gray-500'}`}>{k.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-gray-800">Name</span>
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder={isVehicle ? 'e.g. Delivery van' : 'e.g. Hammer drill'} />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-gray-800">{isVehicle ? 'Registration plate' : 'Serial number'}</span>
        <input className={`${field} font-mono uppercase`} value={serial} onChange={(e) => setSerial(e.target.value)} maxLength={48} placeholder={isVehicle ? 'e.g. KMFA 123B' : 'As printed on the item'} />
      </label>

      <div className="grid grid-cols-3 gap-2">
        <label className="block col-span-2">
          <span className="text-sm font-semibold text-gray-800">Make and model</span>
          <input className={field} value={makeModel} onChange={(e) => setMakeModel(e.target.value)} maxLength={80} placeholder={isVehicle ? 'e.g. Toyota Probox' : 'Optional'} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-gray-800">Year</span>
          <input className={field} value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" placeholder="2021" />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-gray-800">Notes</span>
        <textarea className={field} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} placeholder="Optional: colour, chassis number, where you bought it" />
      </label>

      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>Show my name or nickname to people who check this {isVehicle ? 'plate' : 'serial number'}, so they know it is mine.</span>
      </label>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button type="submit" disabled={!ready} className="w-full bg-brand-gold text-brand-navy font-bold py-2 px-4 rounded-lg active-scale disabled:opacity-50">
        {busy ? 'Registering…' : 'Register'}
      </button>
      <p className="text-[11px] text-gray-500">Items you add yourself show as unverified. Items claimed from a Qaribu receipt with their serial number get the tick.</p>
    </form>
  );
};

const CheckSerial: React.FC = () => {
  const [serial, setSerial] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<api.OwnershipCheck | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (serial.trim().length < 3 || busy) return;
    setBusy(true);
    setError('');
    setResult(null);
    api
      .checkSerial(serial)
      .then(setResult)
      .catch((err: Error) => setError(err.message))
      .finally(() => setBusy(false));
  };

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="bg-white rounded-xl shadow p-4 space-y-3">
        <p className="text-sm text-gray-700">Buying a used motorbike, phone or machine? Check its serial number or plate first.</p>
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-navy"
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
          maxLength={48}
          placeholder="Serial number or plate"
        />
        <button type="submit" disabled={serial.trim().length < 3 || busy} className="w-full bg-brand-navy text-white font-bold py-2 px-4 rounded-lg active-scale disabled:opacity-50">
          {busy ? 'Checking…' : 'Check'}
        </button>
      </form>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      {result && !result.registered && (
        <div className="bg-white rounded-xl shadow p-4 text-sm text-gray-700">
          <p className="font-semibold text-gray-900">Not registered on Qaribu</p>
          <p className="mt-1">Nobody has registered this item. Ask the seller for a Qaribu receipt with the serial number, so it comes to you with the tick.</p>
        </div>
      )}
      {result?.registered &&
        result.matches.map((m, i) => (
          <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">Registered: {m.name}</p>
              <Badge verified={m.verified} />
            </div>
            <p>{api.kindLabel(m.kind)} · registered since {day(m.since)}</p>
            <p>Owner: {m.owner || 'not shown'}</p>
            <p className="text-xs">If the seller is not this owner, ask them to transfer it to you on Qaribu before you pay.</p>
          </div>
        ))}
    </div>
  );
};

const AssetDetail: React.FC<{ asset: api.Asset; onClose: () => void }> = ({ asset, onClose }) => {
  const [history, setHistory] = useState<api.AssetEvent[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getAsset(asset.id)
      .then((r) => setHistory(r.history))
      .catch((err: Error) => setError(err.message));
  }, [asset.id]);

  const who = (e: api.AssetEvent) => {
    if (e.event === 'claimed_from_receipt') return [e.shop_name, e.receipt_number && `receipt ${e.receipt_number}`].filter(Boolean).join(', ');
    if (e.event === 'transferred') return `From ${e.from || '—'} to ${e.to || '—'}`;
    return '';
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{api.kindLabel(asset.kind)}</p>
            <h2 className="text-lg font-bold text-gray-900">{asset.name}</h2>
            {(asset.make_model || asset.year) && <p className="text-sm text-gray-600">{[asset.make_model, asset.year].filter(Boolean).join(' · ')}</p>}
          </div>
          <button onClick={onClose} className="text-gray-500 text-xl leading-none" aria-label="Close">&times;</button>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500">{asset.kind === 'vehicle' ? 'Registration plate' : 'Serial number'}</p>
            <p className="font-mono font-semibold text-gray-900">{asset.serial}</p>
          </div>
          <Badge verified={asset.verification === 'verified'} />
        </div>
        {asset.notes && <p className="text-sm text-gray-700">{asset.notes}</p>}
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">History</p>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {!history && !error && <p className="text-sm text-gray-500">Loading…</p>}
          {history && (
            <ol className="space-y-2">
              {history.map((e, i) => (
                <li key={i} className="border-l-2 border-gray-200 pl-3">
                  <p className="text-sm font-medium text-gray-900">{EVENT_LABEL[e.event] ?? e.event.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-500">{day(e.at)}{who(e) ? ` · ${who(e)}` : ''}</p>
                </li>
              ))}
            </ol>
          )}
          <p className="text-[11px] text-gray-500 mt-3">The history cannot be edited or deleted.</p>
        </div>
      </div>
    </div>
  );
};

export default AssetsHub;
