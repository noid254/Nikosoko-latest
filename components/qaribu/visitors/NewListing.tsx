import React, { useEffect, useRef, useState } from 'react';
import * as api from '../../../services/visitorsApi';
import Camera from '../Camera';
import { fieldClass } from './shared';

// A new vacancy in one short screen: take the photos, name it, give the rent and the bedrooms, publish.
// Everything else (deposit, bathrooms, features, a date, notes) waits under "More details" and is optional.
// The photos are kept on the phone while the form is filled, then sent when the listing is published.

const SLOTS = ['The outside', 'The main room', 'The bedroom', 'The bathroom'];
const GUIDE = [...SLOTS, 'The kitchen', 'The view or the compound', 'The balcony or the entrance', 'Anything else worth showing'];
const BEDS: { label: string; value: string }[] = [
  { label: 'Studio', value: '0' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4+', value: '4' },
];
const KINDS = ['Bedsitter', 'One bedroom', 'Two bedroom', 'Three bedroom', 'House', 'Shop', 'Office', 'Godown'];
const FEATURES = ['Water included', 'Parking', 'Security', 'Balcony', 'Wi-Fi', 'Furnished', 'Backup power', 'Own meter', 'Near the stage', 'Pets allowed'];
const MAX_FEATURES = 6;

interface Shot { blob: Blob; url: string; }

interface Props {
  premise: api.Membership;
  onClose: () => void;
  // The vacancy exists. leftover is how many of its photos did not go up (0 when all did), so the parent can open its photos.
  onDone: (vacancyId: string, leftover: number) => void;
}

const NewListing: React.FC<Props> = ({ premise, onClose, onDone }) => {
  const [shots, setShots] = useState<Shot[]>([]);
  const [title, setTitle] = useState('');
  const [rent, setRent] = useState('');
  const [beds, setBeds] = useState('');
  const [more, setMore] = useState(false);
  const [deposit, setDeposit] = useState('');
  const [baths, setBaths] = useState('');
  const [kind, setKind] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [from, setFrom] = useState('');
  const [notes, setNotes] = useState('');
  const [camera, setCamera] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const urls = useRef<string[]>([]);

  // Free the picture previews when the screen closes.
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const needed = 0; // photos are optional — publish is gated on title only
  const ready = title.trim().length > 0 && !busy;

  const addShot = async (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    urls.current.push(url);
    setShots((list) => (list.length >= api.MAX_VACANCY_PHOTOS ? list : [...list, { blob, url }]));
  };

  const publish = async () => {
    if (!ready) return;
    setBusy(true);
    setError('');
    let id = '';
    try {
      setProgress('Saving the listing…');
      const added = await api.addVacancy(premise.slug, { title: title.trim(), type: kind, rent, deposit, bedrooms: beds, bathrooms: baths, features, available_from: from, notes });
      id = added.id;
      let sent = 0;
      for (const shot of shots) {
        setProgress(`Sending photo ${sent + 1} of ${shots.length}…`);
        await api.uploadVacancyPhoto(premise.slug, id, shot.blob);
        sent++;
      }
      onDone(id, 0);
    } catch (err: any) {
      if (id) {
        // The listing is saved; some photos did not go. The photos screen opens on it to finish.
        onDone(id, Math.max(1, api.MIN_VACANCY_PHOTOS));
      } else {
        setError(err.message || 'Could not save the listing.');
        setBusy(false);
        setProgress('');
      }
    }
  };

  const tiles = Math.max(SLOTS.length, shots.length);
  return (
    <div className="fixed inset-0 z-40 bg-gray-50 overflow-y-auto" role="dialog" aria-label="New vacancy">
      <div className="bg-brand-navy text-white px-4 py-3 flex items-center sticky top-0 z-10">
        <button onClick={onClose} disabled={busy} className="mr-3 text-xl" aria-label="Close" data-testid="new-listing-close">&larr;</button>
        <h2 className="text-lg font-bold flex-1">New vacancy</h2>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4 pb-28">
        {error && <p data-testid="new-listing-error" className="bg-red-50 text-red-700 text-sm rounded-lg p-3 text-center">{error}</p>}

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">1. Photos <span className="normal-case font-normal text-gray-400">(optional)</span></h3>
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800">
              {shots.length > 0 ? `${shots.length} added` : 'None yet'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: tiles }).map((_, i) => {
              const shot = shots[i];
              return shot ? (
                <div key={shot.url} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                  <img src={shot.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button disabled={busy} onClick={() => setShots((l) => l.filter((_, j) => j !== i))} aria-label="Remove photo" className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-sm leading-none">×</button>
                </div>
              ) : (
                <button key={`slot-${i}`} type="button" disabled={busy} onClick={() => setCamera(true)} className="aspect-[4/3] rounded-lg border-2 border-dashed border-gray-300 text-gray-500 text-xs font-semibold flex flex-col items-center justify-center gap-1 active-scale">
                  <span className="text-2xl leading-none">+</span>
                  {SLOTS[i]}
                </button>
              );
            })}
          </div>
          {shots.length < api.MAX_VACANCY_PHOTOS && (
            <button type="button" disabled={busy} onClick={() => setCamera(true)} data-testid="new-listing-camera" className="w-full bg-brand-gold text-brand-navy font-bold py-3 rounded-lg active-scale">
              {shots.length === 0 ? 'Take photos' : 'Take more photos'}
            </button>
          )}
        </section>

        <section className="bg-white rounded-xl shadow p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">2. The basics</h3>
          <div>
            <label htmlFor="nlTitle" className="block text-sm font-medium text-gray-700">Name</label>
            <input id="nlTitle" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="House 4" autoComplete="off" className={fieldClass} />
          </div>
          <div>
            <label htmlFor="nlRent" className="block text-sm font-medium text-gray-700">Rent a month <span className="text-gray-400">(KES)</span></label>
            <input id="nlRent" value={rent} onChange={(e) => setRent(e.target.value)} inputMode="numeric" placeholder="15000" className={fieldClass} />
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700">Bedrooms</p>
            <div className="mt-2 flex gap-2">
              {BEDS.map((b) => (
                <button key={b.value} type="button" aria-pressed={beds === b.value} onClick={() => setBeds(beds === b.value ? '' : b.value)} className={`flex-1 text-sm font-semibold rounded-lg py-2 border ${beds === b.value ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white text-gray-700 border-gray-300'}`}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow">
          <button type="button" onClick={() => setMore(!more)} aria-expanded={more} className="w-full flex items-center justify-between p-4 text-sm font-semibold text-gray-700">
            <span>More details <span className="font-normal text-gray-400">(optional)</span></span>
            <span aria-hidden>{more ? '−' : '+'}</span>
          </button>
          {more && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="nlDeposit" className="block text-sm font-medium text-gray-700">Deposit</label>
                  <input id="nlDeposit" value={deposit} onChange={(e) => setDeposit(e.target.value)} inputMode="numeric" placeholder="15000" className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="nlBaths" className="block text-sm font-medium text-gray-700">Bathrooms</label>
                  <input id="nlBaths" value={baths} onChange={(e) => setBaths(e.target.value)} inputMode="numeric" placeholder="1" className={fieldClass} />
                </div>
              </div>
              <div>
                <label htmlFor="nlKind" className="block text-sm font-medium text-gray-700">Kind</label>
                <input id="nlKind" list="nlKinds" value={kind} onChange={(e) => setKind(e.target.value)} maxLength={40} placeholder="Bedsitter" className={fieldClass} />
                <datalist id="nlKinds">{KINDS.map((k) => <option key={k} value={k} />)}</datalist>
              </div>
              <div>
                <p className="block text-sm font-medium text-gray-700">What it has <span className="text-gray-400">(up to {MAX_FEATURES})</span></p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {FEATURES.map((f) => {
                    const on = features.includes(f);
                    return (
                      <button key={f} type="button" aria-pressed={on} disabled={!on && features.length >= MAX_FEATURES} onClick={() => setFeatures(on ? features.filter((x) => x !== f) : [...features, f])} className={`text-xs font-semibold rounded-full px-3 py-1.5 border disabled:opacity-40 ${on ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white text-gray-700 border-gray-300'}`}>
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label htmlFor="nlFrom" className="block text-sm font-medium text-gray-700">Available from <span className="text-gray-400">(empty if vacant now)</span></label>
                <input id="nlFrom" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={fieldClass} />
              </div>
              <div>
                <label htmlFor="nlNotes" className="block text-sm font-medium text-gray-700">Notes</label>
                <input id="nlNotes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={200} placeholder="Ground floor, own meter" className={fieldClass} />
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          <button type="button" onClick={publish} disabled={!ready} data-testid="new-listing-publish" className="w-full bg-brand-navy text-white font-bold py-3 rounded-lg active-scale disabled:opacity-40">
            {busy ? progress || 'Publishing…' : 'Publish vacancy'}
          </button>
          {!busy && !ready && (
            <p className="text-xs text-gray-500 text-center mt-2">Give it a name to publish.</p>
          )}
        </div>
      </div>

      {camera && (
        <Camera
          title="Photos of the vacancy"
          needed={api.MIN_VACANCY_PHOTOS}
          alreadyHave={shots.length}
          hint={(n) => GUIDE[n % GUIDE.length]!}
          onClose={() => setCamera(false)}
          onShot={addShot}
        />
      )}
    </div>
  );
};

export default NewListing;
