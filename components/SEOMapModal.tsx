import React from 'react';
import type { CurrentPage } from '../types';

interface SEOMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: CurrentPage) => void;
}

export const SEOMapModal: React.FC<SEOMapModalProps> = ({ isOpen, onClose, onNavigate }) => {
  if (!isOpen) return null;

  const tradedProfessions = [
    { title: 'TV Mounting & Bracket Fitting', category: 'Home Utility', rate: 'Ksh 1,500', keywords: 'wall drilling, bracket, cable trunking' },
    { title: 'LPG Cooking Gas Delivery & Leak Check', category: 'Energy & Gas', rate: 'Ksh 1,300', keywords: '6kg, 13kg, regulator inspection' },
    { title: 'Pure Drinking Water Refill (20L)', category: 'Home Utility', rate: 'Ksh 250', keywords: 'dispenser bottle, doorstep delivery' },
    { title: 'Plumbing & Drainage Unclogging', category: 'Construction & Repair', rate: 'Ksh 1,000/hr', keywords: 'pipe burst, sink, water tank' },
    { title: 'Electrical Wiring & Circuit Diagnostics', category: 'Electrical & Power', rate: 'Ksh 1,200/hr', keywords: 'tokens, socket repair, lighting' },
    { title: 'Knotless Hair Braiding & Dreadlocks', category: 'Beauty & Wellness', rate: 'Ksh 2,000', keywords: 'mobile salon, hair extensions' },
    { title: 'Solar Panel Installation & Inverters', category: 'Renewable Energy', rate: 'Ksh 3,500', keywords: 'clean energy, battery backup' },
    { title: 'Furniture Carpentry & Repairs', category: 'Artisan Woodwork', rate: 'Ksh 1,500', keywords: 'sofa repair, wardrobe, door locks' },
    { title: 'Maths & Science Private Tuition', category: 'Education', rate: 'Ksh 800/hr', keywords: 'CBC curriculum, high school tuition' },
    { title: 'Auto Mechanic & OBD Engine Scan', category: 'Automotive', rate: 'Ksh 2,500', keywords: 'car diagnostics, oil change, brake pads' },
    { title: 'Metal Fabrication & Gate Welding', category: 'Metals & Welding', rate: 'Ksh 2,000/day', keywords: 'security grills, structural welding' }
  ];

  const saccoOrganizations = [
    { name: 'Stima Sacco', regNo: 'REG-SOC/2024/0981', code: 'SACCO-STIMA', location: 'Nairobi HQ' },
    { name: 'Sheria Professionals Sacco', regNo: 'REG-SOC/2025/1102', code: 'SACCO-SHERIA', location: 'Westlands, Kenya' },
    { name: 'Westlands Artisan Cooperative', regNo: 'REG-SOC/2023/0411', code: 'SACCO-WESTLANDS', location: 'Nairobi Westlands' }
  ];

  return (
    <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 font-sans animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-gray-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 via-blue-950 to-brand-navy p-4 text-white flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-2 bg-white/10 rounded-2xl">🗺️</span>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Platform SEO Map & Service Index
              </h2>
              <p className="text-[10.5px] text-blue-200 font-medium">
                Search engine discoverable index of traded professions, rate cards, and Saccos
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-300 hover:text-white font-black p-1 text-lg cursor-pointer transition-transform active:scale-90"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-5 overflow-y-auto custom-scrollbar text-black text-xs">
          
          {/* Search Engine Robots Index Banner */}
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <div>
                <span className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                  Search Engine XML Sitemap Active
                </span>
                <span className="text-[10px] text-emerald-800 font-semibold block">
                  Indexed for Googlebot, Bingbot & Schema.org crawlers at <code className="bg-emerald-100 px-1 rounded font-mono">/sitemap.xml</code>
                </span>
              </div>
            </div>
            <a 
              href="/sitemap.xml" 
              target="_blank" 
              rel="noreferrer" 
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-xl flex-shrink-0 transition-all cursor-pointer shadow-xs"
            >
              Open XML Sitemap
            </a>
          </div>

          {/* Traded Service Rate Cards Index */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
              <h3 className="font-black text-xs uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                <span>🛒</span> Traded Professions & Rate Cards ({tradedProfessions.length})
              </h3>
              <button 
                onClick={() => {
                  onClose();
                  onNavigate('tukosoko');
                }}
                className="text-[10px] font-black text-amber-600 hover:text-amber-800 uppercase tracking-wider underline cursor-pointer"
              >
                View Live Tukosoko &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tradedProfessions.map((item, idx) => (
                <div key={idx} className="p-2.5 bg-gray-50 rounded-2xl border border-gray-200 hover:border-blue-300 transition-all space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    <span className="text-xs font-black text-emerald-700">{item.rate}</span>
                  </div>
                  <h4 className="font-black text-xs text-gray-900">{item.title}</h4>
                  <p className="text-[10px] text-gray-500 font-medium">Keywords: {item.keywords}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sacco Directory Index */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
              <h3 className="font-black text-xs uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                <span>🏢</span> Verified Sacco & Org Directory
              </h3>
              <button 
                onClick={() => {
                  onClose();
                  onNavigate('sacco_dashboard');
                }}
                className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-wider underline cursor-pointer"
              >
                Go to Sacco Portal &rarr;
              </button>
            </div>

            <div className="space-y-2">
              {saccoOrganizations.map((sacco, idx) => (
                <div key={idx} className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg p-1.5 bg-blue-100 rounded-xl">🛡️</span>
                    <div>
                      <h4 className="font-black text-xs text-blue-950">{sacco.name}</h4>
                      <p className="text-[10px] text-gray-600 font-medium">Reg: {sacco.regNo} • {sacco.location}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-black text-blue-800 bg-blue-100 px-2 py-1 rounded-lg">
                    {sacco.code}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-600 font-bold">
          <span>NikoSoko SEO Engine v2.0</span>
          <button 
            onClick={onClose}
            className="bg-gray-900 text-white font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider hover:bg-black transition-all cursor-pointer"
          >
            Close Index
          </button>
        </div>

      </div>
    </div>
  );
};

export default SEOMapModal;
