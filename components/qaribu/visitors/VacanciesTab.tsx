import React, { useEffect, useState } from 'react';
import * as api from '../../../services/visitorsApi';
import Camera from '../Camera';
import { fieldClass, primaryButton } from './shared';

const KINDS = ['Bedsitter', 'One bedroom', 'Two bedroom', 'Three bedroom', 'House', 'Shop', 'Office', 'Godown'];

const daysSince = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
const confirmedText = (iso: string) => {
  const d = daysSince(iso);
  return d === 0 ? 'confirmed today' : d === 1 ? 'confirmed 1 day ago' : `confirmed ${d} days ago`;
};
const longDate = (ymd: string) => new Date(`${ymd}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

interface Form { title: string; type: string; rent: string; deposit: string; bedrooms: string; bathrooms: string; features: string[]; available_from: string; notes: string; }
const EMPTY: Form = { title: '', type: '', rent: '', deposit: '', bedrooms: '', bathrooms: '', features: [], available_from: '', notes: '' };

const FEATURES = ['Water included', 'Parking', 'Security', 'Balcony', 'Wi-Fi', 'Furnished', 'Backup power', 'Own meter', 'Near the stage', 'Pets allowed'];
const MAX_FEATURES = 6;
// What to photograph, in the order a renter wants to see it.
const PHOTO_GUIDE = ['The outside, from the front', 'The main room', 'The bedroom', 'The bathroom', 'The kitchen', 'The view or the compound', 'The balcony or the entrance', 'Anything else worth showing'];

const kes = (n: number) => `KES ${n.toLocaleString('en-US')}`;

// The premise's page, its vacancies, and the people who asked to hear about the next one. For the owner, the
// manager and the caretaker. A vacancy not confirmed for 14 days drops off the public page until it is
// confirmed again, so "Still vacant" is the button that matters.
const VacanciesTab: React.FC<{ premise: api.Membership }> = ({ premise }) => {
  const [data, setData] = useState<api.VacanciesView | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY);
  const [editing, setEditing] = useState('');
  const [confirmRemove, setConfirmRemove] = useState('');
  const [copied, setCopied] = useState(false);
  const [photosFor, setPhotosFor] = useState(''); // the vacancy whose photos are open
  const [camera, setCamera] = useState(false);
  const [confirmPhoto, setConfirmPhoto] = useState('');

  const load = () =>
    api
      .getVacancies(premise.slug)
      .then(setData)
      .catch((err: Error) => setError(err.message));

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [premise.slug]);

  // Runs one change, shows the result, and reloads. A refused change shows the server's own explanation.
  const act = async (work: () => Promise<unknown>, done: string) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await work();
      setNotice(done);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
      setConfirmRemove('');
    }
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const fields: api.VacancyFields = { ...form };
    void act(
      async () => {
        if (editing) {
          await api.updateVacancy(premise.slug, editing, fields);
        } else {
          // A new vacancy needs its photos next: open them at once, so it can go on the page.
          const added = await api.addVacancy(premise.slug, fields);
          setPhotosFor(added.id);
        }
        setForm(EMPTY);
        setEditing('');
      },
      editing ? 'Saved.' : 'Added. Now add its photos: four are needed before it shows on your page.',
    );
  };

  const startEdit = (v: api.VacancyItem) => {
    setEditing(v.id);
    setForm({
      title: v.title,
      type: v.type === 'Unit' ? '' : v.type,
      rent: v.rent === null ? '' : String(v.rent),
      deposit: v.deposit === null ? '' : String(v.deposit),
      bedrooms: v.bedrooms === null ? '' : String(v.bedrooms),
      bathrooms: v.bathrooms === null ? '' : String(v.bathrooms),
      features: v.features,
      available_from: v.available_from ?? '',
      notes: v.notes,
    });
    setNotice('');
    setError('');
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setError('Could not copy. Select the link and copy it by hand.');
    }
  };

  if (!data) return <p className="text-center text-gray-500">{error || 'Loading…'}</p>;

  return (
    <div className="space-y-4">
      {error && <p data-testid="vacancies-error" className="bg-red-50 text-red-700 text-sm rounded-lg p-3 text-center">{error}</p>}
      {notice && <p data-testid="vacancies-notice" className="bg-green-50 text-green-800 text-sm rounded-lg p-3 text-center">{notice}</p>}

      {data.links && (
        <section className="bg-white rounded-xl shadow p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Your premise page</h2>
          <div className="flex items-center gap-4">
            <img src={data.links.qr} alt="QR code for the premise page" className="w-24 h-24 shrink-0" />
            <div className="min-w-0 space-y-2">
              <input readOnly value={data.links.page} aria-label="Premise page link" data-testid="page-link" className={`${fieldClass} text-xs`} onFocus={(e) => e.currentTarget.select()} />
              <div className="flex gap-2 text-sm">
                <a href={data.links.page} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Open page</a>
                <a href={data.links.sticker} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Sticker to print</a>
                <button onClick={() => copy(data.links!.page)} className="text-blue-600 hover:underline">{copied ? 'Copied' : 'Copy link'}</button>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Vacancies ({data.vacancies.length})</h2>
        {data.vacancies.length === 0 && <p className="text-sm text-gray-500">No vacancies yet. Your page tells visitors so, and invites them to leave a number.</p>}
        {data.vacancies.map((v) => (
          <div key={v.id} data-testid="vacancy-row" className="bg-white rounded-xl shadow overflow-hidden">
            <button type="button" onClick={() => setPhotosFor(v.id)} className="relative block w-full aspect-[16/9] bg-gray-100" aria-label={`Photos of ${v.title}`}>
              {v.photos[0] ? (
                <img src={v.photos[0]} alt="" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-500">No photos yet. Tap to take them.</span>
              )}
              <span className="absolute right-2 bottom-2 bg-black/65 text-white text-xs rounded-full px-2 py-0.5">{v.photos.length} photo{v.photos.length === 1 ? '' : 's'}</span>
            </button>
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-extrabold text-green-700">{v.rent !== null ? <>{kes(v.rent)} <span className="text-xs font-medium text-gray-500">a month</span></> : 'No rent set'}</p>
                  <p className="font-semibold text-gray-900">
                    {v.title}
                    {v.type !== 'Unit' && <span className="ml-2 text-xs font-normal bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{v.type}</span>}
                  </p>
                  <p className="text-sm text-gray-700">
                    {[v.bedrooms !== null ? (v.bedrooms === 0 ? 'Studio' : `${v.bedrooms} bed${v.bedrooms === 1 ? '' : 's'}`) : '', v.bathrooms !== null ? `${v.bathrooms} bath${v.bathrooms === 1 ? '' : 's'}` : '', v.deposit !== null ? `Deposit ${kes(v.deposit)}` : '']
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  <p className="text-sm text-gray-700">{v.timing === 'upcoming' && v.available_from ? `Available from ${longDate(v.available_from)}` : 'Available now'}</p>
                  {v.notes && <p className="text-xs text-gray-500">{v.notes}</p>}
                </div>
                <span className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${v.photos_needed > 0 ? 'bg-amber-100 text-amber-800' : v.shown_on_page ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                  {v.photos_needed > 0 ? `Add ${v.photos_needed} more photo${v.photos_needed === 1 ? '' : 's'}` : v.shown_on_page ? 'On the page' : 'Hidden: confirm it'}
                </span>
              </div>
              {v.features.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {v.features.map((f) => <span key={f} className="text-xs border border-gray-200 text-gray-600 rounded-full px-2 py-0.5">{f}</span>)}
                </div>
              )}
              <p className="text-xs text-gray-500">{confirmedText(v.confirmed_at)}</p>
              <div className="flex gap-2 flex-wrap">
                <button disabled={busy} onClick={() => act(() => api.confirmVacancy(premise.slug, v.id), `${v.title} is confirmed. It stays on the page for 14 days.`)} className="text-sm font-semibold bg-brand-gold text-brand-navy py-1.5 px-3 rounded-lg">
                  Still vacant
                </button>
                <button disabled={busy} onClick={() => setPhotosFor(v.id)} className="text-sm font-semibold border border-gray-300 text-gray-700 py-1.5 px-3 rounded-lg">Photos</button>
                <button disabled={busy} onClick={() => startEdit(v)} className="text-sm font-semibold border border-gray-300 text-gray-700 py-1.5 px-3 rounded-lg">Edit</button>
                {confirmRemove === v.id ? (
                  <button disabled={busy} onClick={() => act(() => api.removeVacancy(premise.slug, v.id), `${v.title} was taken down.`)} className="text-sm font-semibold bg-red-600 text-white py-1.5 px-3 rounded-lg">
                    Take down now
                  </button>
                ) : (
                  <button disabled={busy} onClick={() => setConfirmRemove(v.id)} className="text-sm font-semibold border border-red-300 text-red-700 py-1.5 px-3 rounded-lg">Take down</button>
                )}
              </div>
            </div>
          </div>
        ))}

        <form onSubmit={save} className="bg-white rounded-xl shadow p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">{editing ? 'Edit vacancy' : 'Add a vacancy'}</h3>
          <div>
            <label htmlFor="vacTitle" className="block text-sm font-medium text-gray-700">Name</label>
            <input id="vacTitle" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={80} placeholder="House 4" className={fieldClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="vacType" className="block text-sm font-medium text-gray-700">Kind <span className="text-gray-400">(optional)</span></label>
              <input id="vacType" list="vacKinds" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} maxLength={40} placeholder="Bedsitter" className={fieldClass} />
              <datalist id="vacKinds">{KINDS.map((k) => <option key={k} value={k} />)}</datalist>
            </div>
            <div>
              <label htmlFor="vacRent" className="block text-sm font-medium text-gray-700">Rent a month <span className="text-gray-400">(KES)</span></label>
              <input id="vacRent" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} inputMode="numeric" placeholder="15000" className={fieldClass} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="vacBeds" className="block text-sm font-medium text-gray-700">Beds</label>
              <input id="vacBeds" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} inputMode="numeric" placeholder="2" className={fieldClass} />
            </div>
            <div>
              <label htmlFor="vacBaths" className="block text-sm font-medium text-gray-700">Baths</label>
              <input id="vacBaths" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} inputMode="numeric" placeholder="1" className={fieldClass} />
            </div>
            <div>
              <label htmlFor="vacDeposit" className="block text-sm font-medium text-gray-700">Deposit</label>
              <input id="vacDeposit" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} inputMode="numeric" placeholder="15000" className={fieldClass} />
            </div>
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700">What it has <span className="text-gray-400">(up to {MAX_FEATURES})</span></p>
            <div className="mt-2 flex flex-wrap gap-2">
              {FEATURES.map((f) => {
                const on = form.features.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={on}
                    disabled={!on && form.features.length >= MAX_FEATURES}
                    onClick={() => setForm({ ...form, features: on ? form.features.filter((x) => x !== f) : [...form.features, f] })}
                    className={`text-xs font-semibold rounded-full px-3 py-1.5 border disabled:opacity-40 ${on ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white text-gray-700 border-gray-300'}`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label htmlFor="vacFrom" className="block text-sm font-medium text-gray-700">Available from <span className="text-gray-400">(leave empty if it is vacant now)</span></label>
            <input id="vacFrom" type="date" value={form.available_from} onChange={(e) => setForm({ ...form, available_from: e.target.value })} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="vacNotes" className="block text-sm font-medium text-gray-700">Notes <span className="text-gray-400">(optional)</span></label>
            <input id="vacNotes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={200} placeholder="Ground floor, own meter" className={fieldClass} />
          </div>
          <button type="submit" disabled={busy} className={primaryButton}>{editing ? 'Save changes' : 'Add vacancy and take photos'}</button>
          {editing && (
            <button type="button" onClick={() => { setEditing(''); setForm(EMPTY); }} className="block w-full text-center text-sm text-blue-600 hover:underline">Cancel</button>
          )}
        </form>
      </section>

      <section className="bg-white rounded-xl shadow p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Waiting for a vacancy ({data.waiting.length})</h2>
        {data.waiting.length === 0 && <p className="text-sm text-gray-500">Nobody yet. When your page has no vacancy, visitors can leave a number to hear about the next one.</p>}
        {data.waiting.length > 0 && data.message && (
          <p className="text-xs text-gray-500">When a vacancy opens, send them: <span className="text-gray-700">“{data.message}”</span></p>
        )}
        {data.waiting.map((w) => (
          <div key={w.id} data-testid="waiting-row" className="border-t border-gray-100 pt-3 space-y-2">
            <p className="font-semibold text-gray-900">{w.name || w.phone}</p>
            <p className="text-xs text-gray-500">{w.phone}{w.looking_for ? ` · looking for ${w.looking_for}` : ''}</p>
            <div className="flex gap-2 flex-wrap">
              {w.sms_link && <a href={w.sms_link} className="text-sm font-semibold bg-brand-gold text-brand-navy py-1.5 px-3 rounded-lg">SMS</a>}
              {w.whatsapp_link && <a href={w.whatsapp_link} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold bg-green-600 text-white py-1.5 px-3 rounded-lg">WhatsApp</a>}
              <button disabled={busy} onClick={() => act(() => api.markWaitingTold(premise.slug, w.id), `${w.name || w.phone} marked as told.`)} className="text-sm font-semibold border border-gray-300 text-gray-700 py-1.5 px-3 rounded-lg">Mark told</button>
              <button disabled={busy} onClick={() => act(() => api.removeWaiting(premise.slug, w.id), 'Removed from the list.')} className="text-sm font-semibold border border-red-300 text-red-700 py-1.5 px-3 rounded-lg">Remove</button>
            </div>
          </div>
        ))}
      </section>

      {photosFor && (() => {
        const v = data.vacancies.find((x) => x.id === photosFor);
        if (!v) return null;
        return (
          <div className="fixed inset-0 z-40 bg-gray-50 overflow-y-auto" role="dialog" aria-label={`Photos of ${v.title}`}>
            <div className="bg-brand-navy text-white px-4 py-3 flex items-center sticky top-0 z-10">
              <button onClick={() => { setPhotosFor(''); setConfirmPhoto(''); }} className="mr-3 text-xl" aria-label="Close photos" data-testid="photos-close">&larr;</button>
              <h2 className="text-lg font-bold flex-1 truncate">{v.title}: photos</h2>
            </div>
            <div className="max-w-md mx-auto p-4 space-y-4">
              {error && <p className="bg-red-50 text-red-700 text-sm rounded-lg p-3 text-center">{error}</p>}
              <p className={`text-sm rounded-lg p-3 text-center font-semibold ${v.photos_needed > 0 ? 'bg-amber-50 text-amber-800' : 'bg-green-50 text-green-800'}`}>
                {v.photos_needed > 0
                  ? `Take ${v.photos_needed} more photo${v.photos_needed === 1 ? '' : 's'}. A listing needs at least ${api.MIN_VACANCY_PHOTOS} before it shows on your page.`
                  : `Ready. ${v.photos.length} photos, and up to ${api.MAX_VACANCY_PHOTOS} are allowed.`}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {v.photo_refs.map((ref, i) => (
                  <div key={ref} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                    <img src={v.photos[i]} alt={`${v.title}, photo ${i + 1}`} className="w-full h-full object-cover" />
                    {i === 0 && <span className="absolute left-1 top-1 text-[10px] font-bold bg-brand-gold text-brand-navy rounded-full px-2 py-0.5">First</span>}
                    {confirmPhoto === ref ? (
                      <button disabled={busy} onClick={() => act(async () => { await api.deleteVacancyPhoto(premise.slug, v.id, ref); setConfirmPhoto(''); }, 'Photo removed.')} className="absolute inset-x-1 bottom-1 bg-red-600 text-white text-xs font-bold rounded py-1">Remove</button>
                    ) : (
                      <button disabled={busy} onClick={() => setConfirmPhoto(ref)} aria-label="Remove photo" className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-sm leading-none">×</button>
                    )}
                  </div>
                ))}
              </div>
              {v.photos.length < api.MAX_VACANCY_PHOTOS && (
                <button type="button" onClick={() => setCamera(true)} data-testid="take-vacancy-photos" className={primaryButton}>
                  {v.photos.length === 0 ? 'Take photos' : 'Take more photos'}
                </button>
              )}
              <button type="button" onClick={() => setPhotosFor('')} className="block w-full text-center text-sm text-blue-600 hover:underline">Done</button>
            </div>
            {camera && (
              <Camera
                title={`${v.title}: photos`}
                needed={api.MIN_VACANCY_PHOTOS}
                alreadyHave={v.photos.length}
                hint={(n) => PHOTO_GUIDE[n % PHOTO_GUIDE.length]!}
                onClose={() => { setCamera(false); void load(); }}
                onShot={async (photo) => {
                  const updated = await api.uploadVacancyPhoto(premise.slug, v.id, photo);
                  setData((d) => (d ? { ...d, vacancies: d.vacancies.map((x) => (x.id === updated.id ? updated : x)) } : d));
                }}
              />
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default VacanciesTab;
