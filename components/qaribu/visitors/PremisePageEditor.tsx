import React, { useEffect, useState } from 'react';
import * as api from '../../../services/visitorsApi';
import Camera from '../Camera';
import { fieldClass, primaryButton } from './shared';

interface Words { tagline: string; about: string; area: string; contact_phone: string; whatsapp: string; }

const GALLERY_GUIDE = ['The gate and the front', 'The compound', 'A typical house or unit', 'The stairs or corridor', 'Parking or the play area', 'The view', 'The water point or tank', 'Anything else worth showing'];

// What the page shows people who scan the sticker: the cover photo, the name over it, the Call, Chat and Book buttons,
// a short bio and photos of the premise. For the owner and the manager. Photos come from the camera only.
const PremisePageEditor: React.FC<{ premise: api.Membership }> = ({ premise }) => {
  const [page, setPage] = useState<api.PremisePage | null>(null);
  const [words, setWords] = useState<Words | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [camera, setCamera] = useState<'' | 'cover' | 'gallery'>('');
  const [confirmRemove, setConfirmRemove] = useState('');

  const apply = (p: api.PremisePage) => {
    setPage((old) => ({ ...(old ?? {}), ...p }));
    setWords((w) => w ?? { tagline: p.tagline, about: p.about, area: p.area, contact_phone: p.contact_phone, whatsapp: p.whatsapp });
  };

  useEffect(() => {
    api
      .getPremisePage(premise.slug)
      .then(apply)
      .catch((err: Error) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [premise.slug]);

  if (!page || !words) return <p className="text-center text-gray-500">{error || 'Loading…'}</p>;

  const changed = (patch: Partial<Words>) => setWords({ ...words, ...patch });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const saved = await api.savePremisePage(premise.slug, words);
      setPage({ ...page, ...saved });
      setWords({ tagline: saved.tagline, about: saved.about, area: saved.area, contact_phone: saved.contact_phone, whatsapp: saved.whatsapp });
      setNotice('Saved. Your page is up to date.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (ref: string) => {
    setBusy(true);
    setError('');
    try {
      setPage({ ...page, ...(await api.deletePremisePicture(premise.slug, ref)) });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
      setConfirmRemove('');
    }
  };

  // The page is only as good as these. Each is a small step, in the order people notice them.
  const steps = [
    { done: !!page.cover, label: 'Cover photo' },
    { done: !!words.about.trim(), label: 'Short bio' },
    { done: !!words.contact_phone.trim(), label: 'Call number' },
    { done: page.gallery.length >= 3, label: '3 photos of the premise' },
  ];
  const ready = steps.filter((s) => s.done).length;

  return (
    <div className="space-y-4">
      {error && <p data-testid="page-error" className="bg-red-50 text-red-700 text-sm rounded-lg p-3 text-center">{error}</p>}
      {notice && <p data-testid="page-notice" className="bg-green-50 text-green-800 text-sm rounded-lg p-3 text-center">{notice}</p>}

      <section className="bg-white rounded-xl shadow overflow-hidden">
        <div className="relative h-44 bg-gradient-to-br from-brand-navy to-gray-700">
          {page.cover && <img src={page.cover} alt="Cover photo of the premise page" className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <p className="text-xl font-bold leading-tight">{premise.name}</p>
            {(words.tagline || words.area) && <p className="text-sm text-white/85">{words.tagline || words.area}</p>}
          </div>
        </div>
        <div className="p-4 flex gap-2">
          <button type="button" disabled={busy} onClick={() => setCamera('cover')} data-testid="take-cover" className="flex-1 bg-brand-gold text-brand-navy font-bold py-2.5 rounded-lg active-scale">
            {page.cover ? 'Retake cover photo' : 'Take cover photo'}
          </button>
          {page.cover && page.cover_ref && (
            <button type="button" disabled={busy} onClick={() => remove(page.cover_ref!)} className="px-4 font-semibold rounded-lg border border-gray-300 text-gray-700">Remove</button>
          )}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Make your page shine</h2>
          <span className="text-xs font-semibold text-gray-500">{ready} of {steps.length}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {steps.map((s) => (
            <span key={s.label} className={`text-xs font-semibold rounded-full px-3 py-1.5 text-center ${s.done ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
              {s.done ? '✓ ' : ''}{s.label}
            </span>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Photos of the premise ({page.gallery.length} of {api.MAX_GALLERY})</h2>
        </div>
        {page.gallery.length === 0 && <p className="text-sm text-gray-500">Show visitors where they are coming: the gate, the compound, the buildings.</p>}
        <div className="grid grid-cols-3 gap-2">
          {page.gallery.map((g) => (
            <div key={g.ref} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img src={g.url} alt="Premise photo" className="w-full h-full object-cover" />
              {confirmRemove === g.ref ? (
                <button disabled={busy} onClick={() => remove(g.ref)} className="absolute inset-x-1 bottom-1 bg-red-600 text-white text-xs font-bold rounded py-1">Remove</button>
              ) : (
                <button disabled={busy} onClick={() => setConfirmRemove(g.ref)} aria-label="Remove photo" className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-sm leading-none">×</button>
              )}
            </div>
          ))}
        </div>
        <button type="button" disabled={busy || page.gallery.length >= api.MAX_GALLERY} onClick={() => setCamera('gallery')} data-testid="take-gallery" className={primaryButton}>
          {page.gallery.length >= api.MAX_GALLERY ? 'Gallery is full' : 'Take photos'}
        </button>
      </section>

      <form onSubmit={save} className="bg-white rounded-xl shadow p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Words and numbers</h2>
        <div>
          <label htmlFor="pgTagline" className="block text-sm font-medium text-gray-700">One line under the name</label>
          <input id="pgTagline" value={words.tagline} onChange={(e) => changed({ tagline: e.target.value })} maxLength={120} placeholder="Safe, quiet homes near the stage" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="pgArea" className="block text-sm font-medium text-gray-700">Area</label>
          <input id="pgArea" value={words.area} onChange={(e) => changed({ area: e.target.value })} maxLength={60} placeholder="Kilimani" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="pgAbout" className="block text-sm font-medium text-gray-700">Short bio <span className="text-gray-400">({words.about.length}/600)</span></label>
          <textarea id="pgAbout" rows={4} value={words.about} onChange={(e) => changed({ about: e.target.value })} maxLength={600} placeholder="What makes this place good to live, work or visit. Security, water, how far to the main road." className={`${fieldClass} resize-none`} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="pgCall" className="block text-sm font-medium text-gray-700">Call number</label>
            <input id="pgCall" type="tel" inputMode="tel" value={words.contact_phone} onChange={(e) => changed({ contact_phone: e.target.value })} maxLength={20} placeholder="0712 345 678" className={fieldClass} />
          </div>
          <div>
            <label htmlFor="pgChat" className="block text-sm font-medium text-gray-700">Chat (WhatsApp)</label>
            <input id="pgChat" type="tel" inputMode="tel" value={words.whatsapp} onChange={(e) => changed({ whatsapp: e.target.value })} maxLength={20} placeholder="0712 345 678" className={fieldClass} />
          </div>
        </div>
        <p className="text-xs text-gray-500">The Call and Chat buttons show on your page only for the numbers you fill in. Visitors who tap Book a viewing leave their number and you see them under Vacancies.</p>
        <button type="submit" disabled={busy} className={primaryButton}>Save</button>
      </form>

      {page.links && (
        <a href={page.links.page} target="_blank" rel="noopener noreferrer" data-testid="view-page" className="block text-center bg-brand-navy text-white font-bold py-3 rounded-lg active-scale">
          See your page as visitors do
        </a>
      )}

      {camera === 'cover' && (
        <Camera
          title="Cover photo"
          single
          onClose={() => setCamera('')}
          onShot={async (photo) => {
            setPage({ ...page, ...(await api.uploadPremisePicture(premise.slug, 'cover', photo)) });
          }}
        />
      )}
      {camera === 'gallery' && (
        <Camera
          title="Photos of the premise"
          alreadyHave={page.gallery.length}
          hint={(n) => GALLERY_GUIDE[n % GALLERY_GUIDE.length]!}
          onClose={() => setCamera('')}
          onShot={async (photo) => {
            setPage({ ...page, ...(await api.uploadPremisePicture(premise.slug, 'gallery', photo)) });
          }}
        />
      )}
    </div>
  );
};

export default PremisePageEditor;
