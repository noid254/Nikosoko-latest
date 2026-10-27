import React, { useEffect, useState } from 'react';
import type { HeroBanner } from '../../types';
import { getHeroBanners, saveHeroBanner, deleteHeroBanner } from '../../services/api';
import { uploadImageToStorage } from '../../services/firebase';
import { KENYAN_ESTATES } from '../../utils/geoLocations';

const EMPTY = { title: '', subtitle: '', imageUrl: '', area: '', latitude: '', longitude: '', radiusKm: '5' };

const BannersPage: React.FC = () => {
    const [banners, setBanners] = useState<HeroBanner[]>([]);
    const [form, setForm] = useState({ ...EMPTY });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const load = () => getHeroBanners(true).then(setBanners);
    useEffect(() => { load(); }, []);

    const pickArea = (name: string) => {
        const estate = KENYAN_ESTATES.find(e => e.name === name);
        setForm(f => estate
            ? { ...f, area: estate.name, latitude: String(estate.lat), longitude: String(estate.lng) }
            : { ...f, area: '', latitude: '', longitude: '' });
    };

    const onFile = async (file?: File) => {
        if (!file) return;
        setBusy(true); setError('');
        try {
            const url = await uploadImageToStorage(file, `banners/${Date.now()}`);
            setForm(f => ({ ...f, imageUrl: url }));
        } catch { setError('The image did not upload. Try a smaller file.'); }
        setBusy(false);
    };

    const publish = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || !form.imageUrl) { setError('Add a headline and an image.'); return; }
        setBusy(true); setError('');
        const ok = await saveHeroBanner({
            title: form.title.trim(), subtitle: form.subtitle.trim(), imageUrl: form.imageUrl, area: form.area,
            latitude: form.latitude === '' ? null : Number(form.latitude),
            longitude: form.longitude === '' ? null : Number(form.longitude),
            radiusKm: Number(form.radiusKm) || 5,
        });
        setBusy(false);
        if (!ok) { setError('The banner was not saved. Check your connection and try again.'); return; }
        setForm({ ...EMPTY }); load();
    };

    const toggle = async (b: HeroBanner) => { await saveHeroBanner({ ...b, isActive: !(b.isActive === 1 || b.isActive === true) }); load(); };
    const remove = async (b: HeroBanner) => { if (window.confirm(`Delete "${b.title}"?`)) { await deleteHeroBanner(b.id); load(); } };

    const field = 'w-full rounded-md border border-[#D9DFDA] bg-white px-3 py-2 text-sm text-[#14211C] focus:outline-none focus:ring-2 focus:ring-[#0E6B4F]/30 focus:border-[#0E6B4F]';

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6 items-start">
            <form onSubmit={publish} className="bg-white border border-[#E3E7E3] rounded-xl p-6 space-y-4">
                <div>
                    <h3 className="text-base font-semibold text-[#14211C]">New location banner</h3>
                    <p className="text-sm text-[#5F6E66] mt-1">Shown on the home screen to people near the chosen area. A banner with no area shows to everyone else.</p>
                </div>
                <label className="block text-sm font-medium text-[#14211C]">Headline
                    <input className={`${field} mt-1`} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Weekend near Karura Forest" />
                </label>
                <label className="block text-sm font-medium text-[#14211C]">Supporting line
                    <input className={`${field} mt-1`} value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder="Trusted pros a short ride from the trails" />
                </label>
                <label className="block text-sm font-medium text-[#14211C]">Area
                    <select className={`${field} mt-1`} value={form.area} onChange={e => pickArea(e.target.value)}>
                        <option value="">Everyone (no area)</option>
                        {KENYAN_ESTATES.map(e => <option key={e.name} value={e.name}>{e.name}, {e.county}</option>)}
                    </select>
                </label>
                {form.area && (
                    <label className="block text-sm font-medium text-[#14211C]">Show within (km)
                        <input type="number" min={1} max={100} className={`${field} mt-1`} value={form.radiusKm} onChange={e => setForm({ ...form, radiusKm: e.target.value })} />
                    </label>
                )}
                <div>
                    <p className="text-sm font-medium text-[#14211C] mb-1">Image</p>
                    {form.imageUrl && <img src={form.imageUrl} alt="" className="w-full h-32 object-cover rounded-md mb-2 border border-[#E3E7E3]" />}
                    <input type="file" accept="image/*" onChange={e => onFile(e.target.files?.[0])} className="text-sm text-[#5F6E66]" />
                </div>
                {error && <p className="text-sm text-[#B42318]" role="alert">{error}</p>}
                <button disabled={busy} className="w-full rounded-md bg-[#0E6B4F] hover:bg-[#0B5740] disabled:opacity-60 text-white text-sm font-semibold py-2.5 transition-colors">
                    {busy ? 'Working…' : 'Publish banner'}
                </button>
            </form>

            <div className="bg-white border border-[#E3E7E3] rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E3E7E3]">
                    <h3 className="text-base font-semibold text-[#14211C]">Live and paused banners</h3>
                </div>
                {banners.length === 0 ? (
                    <p className="px-6 py-10 text-sm text-[#5F6E66]">No banners yet. Create your first one for an area like Ruaka or Karura.</p>
                ) : (
                    <ul className="divide-y divide-[#E3E7E3]">
                        {banners.map(b => {
                            const active = b.isActive === 1 || b.isActive === true;
                            return (
                                <li key={b.id} className="flex items-center gap-4 px-6 py-4">
                                    <img src={b.imageUrl} alt="" className="w-28 h-16 object-cover rounded-md border border-[#E3E7E3]" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-[#14211C] truncate">{b.title}</p>
                                        <p className="text-sm text-[#5F6E66] truncate">{b.area ? `${b.area}, within ${b.radiusKm || 5} km` : 'Everyone'}</p>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${active ? 'bg-[#E4F3EC] text-[#0B5740]' : 'bg-[#EEF0EE] text-[#5F6E66]'}`}>{active ? 'Live' : 'Paused'}</span>
                                    <button onClick={() => toggle(b)} className="text-sm text-[#14211C] hover:underline">{active ? 'Pause' : 'Resume'}</button>
                                    <button onClick={() => remove(b)} className="text-sm text-[#B42318] hover:underline">Delete</button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default BannersPage;
