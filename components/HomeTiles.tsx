import React from 'react';
import type { CurrentPage } from '../types';

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const Icons = {
  qaribu: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" {...stroke}>
      <rect x="3" y="3" width="7" height="7" rx="1.2" /><rect x="14" y="3" width="7" height="7" rx="1.2" />
      <rect x="3" y="14" width="7" height="7" rx="1.2" /><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
    </svg>
  ),
  invoice: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" {...stroke}>
      <path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h7M9 17h7M9 9h2" />
    </svg>
  ),
  market: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" {...stroke}>
      <path d="M4 9l1.5-5h13L20 9M4 9h16M4 9v11h16V9M9 20v-6h6v6" />
    </svg>
  ),
  places: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" {...stroke}>
      <path d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
};

const TILES = [
  { key: 'qaribu', label: 'Qaribu', hint: 'Gate pass, places and visitors', icon: Icons.qaribu, page: 'qaribu_gate' },
  { key: 'invoice', label: 'My Invoice', hint: 'Receipts, invoices, quotes', icon: Icons.invoice, page: 'my_invoice' },
  { key: 'market', label: 'Marketplace', hint: 'Services and products near you', icon: Icons.market, page: 'marketplace' },
  { key: 'places', label: 'Service Centers', hint: 'Registered outlets near you', icon: Icons.places, page: 'service_centers' },
] as const;

const HomeTiles: React.FC<{ onNavigate: (p: CurrentPage) => void }> = ({ onNavigate }) => {
  return (
    <div className="grid grid-cols-2 gap-3 pb-4">
      {TILES.map(t => (
        <button
          key={t.key}
          onClick={() => onNavigate(t.page as CurrentPage)}
          className="rounded-2xl bg-black text-white p-4 text-left flex flex-col gap-3 active:scale-[0.98] transition cursor-pointer"
        >
          <span className="text-[#22C27A]">{t.icon}</span>
          <span>
            <span className="block text-base font-black tracking-tight">{t.label}</span>
            <span className="block text-[11px] text-white/60 mt-0.5 leading-snug">{t.hint}</span>
          </span>
        </button>
      ))}
    </div>
  );
};

export default HomeTiles;
