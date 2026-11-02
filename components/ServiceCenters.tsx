import React, { useMemo, useState } from 'react';
import type { ServiceProvider, CatalogueItem } from '../types';
import { providerText, itemText, matches } from '../utils/taxonomy';
import FilterBar from './FilterBar';

interface Props {
  providers: ServiceProvider[];
  catalogueItems: CatalogueItem[];
  onSelectProvider: (p: ServiceProvider) => void;
  onInitiateContact: (p: ServiceProvider) => boolean;
  onBack: () => void;
}

const GREEN = '#22C27A';

// Service centers are the registered outlets (organizations) that offer services. The filter is the same
// parent/child bar as the Marketplace, matched against the outlet's own services and catalogue.
const ServiceCenters: React.FC<Props> = ({ providers, catalogueItems, onSelectProvider, onInitiateContact, onBack }) => {
  const [parent, setParent] = useState<string | null>(null);
  const [child, setChild] = useState<string | null>(null);
  const [q, setQ] = useState('');

  const centers = useMemo(() => {
    const textFor = (p: ServiceProvider) =>
      [providerText(p), ...catalogueItems.filter(i => i.providerId === p.id).map(i => itemText(i, p))].join(' ');
    return providers
      .filter(p => p.accountType === 'organization')
      .map(p => ({ p, text: textFor(p), n: catalogueItems.filter(i => i.providerId === p.id).length }))
      .sort((a, b) => (a.p.distanceKm ?? 1e9) - (b.p.distanceKm ?? 1e9) || a.p.name.localeCompare(b.p.name));
  }, [providers, catalogueItems]);

  const shown = centers.filter(c => {
    const term = q.trim().toLowerCase();
    return matches(c.text, parent, child) && (!term || c.text.includes(term) || c.p.name.toLowerCase().includes(term) || (c.p.location || '').toLowerCase().includes(term));
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-black text-white px-3 py-2.5 flex items-center gap-2 sticky top-0 z-30">
        <button onClick={onBack} aria-label="Back" className="p-1.5 cursor-pointer">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search service centers"
          className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm placeholder-white/50 outline-none" />
      </header>
      <FilterBar parent={parent} child={child} onParent={setParent} onChild={setChild} />

      <main className="px-3 py-3 pb-24 space-y-2.5">
        <p className="text-xs text-neutral-500">{shown.length} registered {shown.length === 1 ? 'outlet' : 'outlets'}{parent ? ` for ${child || parent}` : ''}</p>
        {shown.length === 0 && <p className="text-center text-neutral-500 text-sm py-16">No registered outlets match this filter yet.</p>}
        {shown.map(({ p, n }) => (
          <div key={p.id} className="bg-white border border-neutral-200 rounded-2xl p-3.5 flex gap-3">
            <button onClick={() => onSelectProvider(p)} className="shrink-0 cursor-pointer">
              {p.avatarUrl ? <img src={p.avatarUrl} alt="" className="h-14 w-14 rounded-xl object-cover" /> : <div className="h-14 w-14 rounded-xl bg-black text-white grid place-items-center font-black">{p.name.slice(0, 1)}</div>}
            </button>
            <div className="min-w-0 flex-1">
              <button onClick={() => onSelectProvider(p)} className="text-left cursor-pointer">
                <p className="font-black leading-tight">{p.name} {p.isVerified && <span style={{ color: GREEN }} title="Verified">✓</span>}</p>
                <p className="text-xs text-neutral-500 mt-0.5 truncate">{p.service || p.category}{p.location ? ` · ${p.location}` : ''}{p.distanceKm !== undefined ? ` · ${p.distanceKm.toFixed(1)} km` : ''}</p>
              </button>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => onInitiateContact(p)} className="px-3 py-1.5 rounded-lg text-xs font-black text-black cursor-pointer" style={{ background: GREEN }}>Contact</button>
                <button onClick={() => onSelectProvider(p)} className="px-3 py-1.5 rounded-lg text-xs font-black border border-neutral-300 cursor-pointer">View{n ? ` · ${n} listing${n > 1 ? 's' : ''}` : ''}</button>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default ServiceCenters;
