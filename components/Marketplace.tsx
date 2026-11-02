import React, { useMemo, useState } from 'react';
import type { CatalogueItem, ServiceProvider } from '../types';
import { TAXONOMY, itemText, providerText, matches } from '../utils/taxonomy';
import CatalogueItemDetailModal from './CatalogueItemDetailModal';

interface Props {
  providers: ServiceProvider[];
  catalogueItems: CatalogueItem[];
  isAuthenticated: boolean;
  onAuthClick: () => void;
  onInitiateContact: (p: ServiceProvider) => boolean;
  onSelectProvider: (p: ServiceProvider) => void;
  onBack: () => void;
}

interface Tile {
  key: string; kind: 'item' | 'provider'; title: string; sub: string; price: string; image: string;
  text: string; distance?: number; item?: CatalogueItem; provider?: ServiceProvider; tall: boolean;
}

const GREEN = '#22C27A';
const hash = (s: string) => Array.from(s).reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

const Marketplace: React.FC<Props> = ({ providers, catalogueItems, isAuthenticated, onAuthClick, onInitiateContact, onSelectProvider, onBack }) => {
  const [parent, setParent] = useState<string | null>(null);
  const [child, setChild] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<CatalogueItem | null>(null);

  const byId = useMemo(() => new Map(providers.map(p => [p.id, p])), [providers]);

  const tiles = useMemo<Tile[]>(() => {
    const out: Tile[] = [];
    const withItems = new Set<string>();
    for (const it of catalogueItems) {
      const p = byId.get(it.providerId);
      if (!p) continue;
      withItems.add(p.id);
      out.push({
        key: `i-${it.id}`, kind: 'item', title: it.title, sub: p.name, price: it.price || '', image: it.imageUrls?.[0] || p.coverImageUrl || p.avatarUrl || '',
        text: itemText(it, p), distance: p.distanceKm, item: it, provider: p, tall: hash(it.id) % 3 === 0,
      });
    }
    for (const p of providers) {
      if (withItems.has(p.id) || !p.service) continue;
      out.push({
        key: `p-${p.id}`, kind: 'provider', title: p.service, sub: p.name, price: p.hourlyRate ? `KES ${p.hourlyRate}/hr` : '', image: p.coverImageUrl || p.avatarUrl || '',
        text: providerText(p), distance: p.distanceKm, provider: p, tall: hash(p.id) % 3 === 1,
      });
    }
    return out.sort((a, b) => (a.distance ?? 1e9) - (b.distance ?? 1e9) || hash(a.key) - hash(b.key));
  }, [catalogueItems, providers, byId]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return tiles.filter(t => matches(t.text, parent, child) && (!term || t.text.includes(term) || t.title.toLowerCase().includes(term) || t.sub.toLowerCase().includes(term)));
  }, [tiles, parent, child, q]);

  const pickParent = (label: string) => {
    if (parent === label) { setParent(null); setChild(null); } else { setParent(label); setChild(null); }
  };

  const onTile = (t: Tile) => (t.item ? setOpen(t.item) : t.provider && onSelectProvider(t.provider));

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-black text-white px-3 py-2.5 flex items-center gap-2 sticky top-0 z-30">
        <button onClick={onBack} aria-label="Back" className="p-1.5 cursor-pointer">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <input
          value={q} onChange={e => setQ(e.target.value)} placeholder="Search services and products"
          className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm placeholder-white/50 outline-none"
        />
      </header>

      {/* One scrolling line: PARENT, then (when opened) its children, then the next PARENT. */}
      <nav className="sticky top-[52px] z-20 bg-white border-b border-gray-200 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 px-3 py-2.5 w-max">
          <button onClick={() => { setParent(null); setChild(null); }}
            className={`text-[11px] font-black tracking-wider px-3 py-1.5 rounded-full border cursor-pointer ${!parent ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-600'}`}>ALL</button>
          {TAXONOMY.map(p => (
            <React.Fragment key={p.label}>
              <button onClick={() => pickParent(p.label)}
                className={`text-[11px] font-black tracking-wider px-3 py-1.5 rounded-full border whitespace-nowrap cursor-pointer ${parent === p.label ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-800'}`}>
                {p.label}
              </button>
              {parent === p.label && p.children.map(c => (
                <button key={c.label} onClick={() => setChild(child === c.label ? null : c.label)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer border"
                  style={child === c.label ? { background: GREEN, borderColor: GREEN, color: '#000' } : { borderColor: '#d1d5db', color: '#374151' }}>
                  {c.label}
                </button>
              ))}
            </React.Fragment>
          ))}
        </div>
      </nav>

      <main className="px-1.5 pt-1.5 pb-24">
        {shown.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-20 px-6">Nothing listed here yet. Try another filter, or be the first to list it.</p>
        ) : (
          <div className="columns-2 gap-1.5">
            {shown.map(t => (
              <button key={t.key} onClick={() => onTile(t)} className="relative block w-full mb-1.5 break-inside-avoid overflow-hidden rounded-lg bg-gray-100 cursor-pointer text-left">
                <div className={t.tall ? 'aspect-[3/4]' : 'aspect-square'}>
                  {t.image ? <img src={t.image} alt={t.title} loading="lazy" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-neutral-200" />}
                </div>
                <span className="absolute top-1.5 left-1.5 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/70 text-white">
                  {t.kind === 'item' ? 'Listing' : 'Service'}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-2 pt-8 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <p className="text-[13px] font-bold leading-tight line-clamp-2">{t.title}</p>
                  <p className="text-[11px] text-white/75 mt-0.5 truncate">{t.sub}{t.distance !== undefined ? ` · ${t.distance.toFixed(1)} km` : ''}</p>
                  {t.price && <p className="text-[11px] font-black mt-0.5" style={{ color: GREEN }}>{t.price}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {open && (
        <CatalogueItemDetailModal
          item={open} onClose={() => setOpen(null)} provider={byId.get(open.providerId) || null}
          isAuthenticated={isAuthenticated} onAuthClick={onAuthClick} onInitiateContact={onInitiateContact}
          onViewProfile={p => { setOpen(null); onSelectProvider(p); }}
        />
      )}
    </div>
  );
};

export default Marketplace;
