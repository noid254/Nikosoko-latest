import React, { useState, useMemo, useEffect } from 'react';
import type { ServiceProvider, CurrentPage } from '../types';
import ServiceCard from './ServiceCard';

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

interface NikoSokoProps {
    providers: ServiceProvider[];
    onSelectProvider: (p: ServiceProvider) => void;
    searchTerm: string;
    setSearchTerm: (t: string) => void;
    onBack: () => void;
    onMessagesClick: () => void;
    hasNewMessages: boolean;
    onNavigate: (p: CurrentPage) => void;
    currentUser: ServiceProvider | null;
}

interface HighlightCategory {
    id: string;
    title: string;
    icon: string;
    keyword: string;
    activeBg: string;
    badgeBg: string;
}

const HIGHLIGHT_CATEGORIES: HighlightCategory[] = [
    { id: 'boda', title: '1. Boda', icon: '🏍️', keyword: 'boda', activeBg: 'bg-amber-500 text-white border-amber-500', badgeBg: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 'taxi', title: '2. Taxi', icon: '🚕', keyword: 'taxi', activeBg: 'bg-blue-600 text-white border-blue-600', badgeBg: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'electrician', title: '3. Electrician', icon: '⚡', keyword: 'electrician', activeBg: 'bg-emerald-600 text-white border-emerald-600', badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'plumber', title: 'Plumber', icon: '🔧', keyword: 'plumber', activeBg: 'bg-cyan-600 text-white border-cyan-600', badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    { id: 'cleaner', title: 'Cleaner', icon: '🧹', keyword: 'cleaning', activeBg: 'bg-purple-600 text-white border-purple-600', badgeBg: 'bg-purple-50 text-purple-700 border-purple-200' },
    { id: 'mechanic', title: 'Mechanic', icon: '🛠️', keyword: 'mechanic', activeBg: 'bg-rose-600 text-white border-rose-600', badgeBg: 'bg-rose-50 text-rose-700 border-rose-200' },
    { id: 'courier', title: 'Delivery', icon: '📦', keyword: 'delivery', activeBg: 'bg-indigo-600 text-white border-indigo-600', badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
];

const NikoSoko: React.FC<NikoSokoProps> = ({ 
    providers, onSelectProvider, searchTerm, setSearchTerm, onBack, onMessagesClick, 
    hasNewMessages, onNavigate, currentUser 
}) => {
    const [localSearch, setLocalSearch] = useState(searchTerm || '');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const handleCategoryClick = (cat: HighlightCategory) => {
        if (selectedCategory === cat.id) {
            setSelectedCategory(null);
            setLocalSearch('');
            setSearchTerm('');
        } else {
            setSelectedCategory(cat.id);
            setLocalSearch(cat.title.replace(/^[0-9]+\.\s*/, ''));
            setSearchTerm(cat.keyword);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalSearch(val);
        setSearchTerm(val);
        if (!val) {
            setSelectedCategory(null);
        }
    };

    // Sorted nearby providers from closest distance
    const filteredAndSortedProviders = useMemo(() => {
        let result = [...providers].filter(p => p.category !== 'PERSONAL' && !p.premiseId);
        
        const activeQuery = (searchTerm || localSearch).toLowerCase().trim();

        if (activeQuery) {
            result = result.filter(p => {
                const nameMatch = p.name.toLowerCase().includes(activeQuery);
                const serviceMatch = p.service.toLowerCase().includes(activeQuery);
                const locationMatch = p.location.toLowerCase().includes(activeQuery);
                const aboutMatch = (p.about || '').toLowerCase().includes(activeQuery);
                const skillMatch = p.skills?.some(s => 
                    (s.skillTitle || s.name || '').toLowerCase().includes(activeQuery) ||
                    (s.category || '').toLowerCase().includes(activeQuery) ||
                    (s.description || '').toLowerCase().includes(activeQuery)
                );
                return nameMatch || serviceMatch || locationMatch || aboutMatch || skillMatch;
            });
        }
        
        // Always sort from closest distance
        return result.sort((a, b) => a.distanceKm - b.distanceKm);
    }, [providers, searchTerm, localSearch]);

    return (
        <div className="w-full max-w-md mx-auto bg-gray-50/50 min-h-screen font-sans pb-20 relative overflow-x-hidden border-x border-gray-200/80">
            {/* HERO BANNER - MATTE BLACK (Expanded like SideMenu Header) */}
            <header className="relative bg-black text-white pt-8 pb-16 px-5 rounded-b-md shadow-2xl overflow-hidden border-b border-white/10">
                {/* Subtle Ambient Background Lighting */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Top Nav: Burger Menu, Logo, Bell */}
                <div className="flex justify-between items-center relative z-10">
                    {/* Cornered Burger Menu Button */}
                    <button 
                        onClick={onBack} 
                        aria-label="Open Menu"
                        className="p-1.5 -ml-1.5 text-white/90 hover:text-white transition-all active:scale-90 flex items-center justify-center flex-shrink-0"
                    >
                        <MenuIcon />
                    </button>

                    {/* Branding Logo & Subtext */}
                    <div className="text-center cursor-pointer space-y-1 px-2" onClick={() => { setLocalSearch(''); setSearchTerm(''); setSelectedCategory(null); }}>
                        <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-white leading-none italic">NIKOSOKO</h1>
                        <p className="text-[8px] font-extrabold uppercase tracking-[0.3em] text-gray-300">Neighborhood Marketplace</p>
                    </div>

                    {/* Cornered Bell Button */}
                    {(() => {
                        const isUnread = hasNewMessages || Boolean(currentUser && !currentUser.isProfileCompleted);
                        return (
                            <button 
                                onClick={onMessagesClick} 
                                aria-label="Notifications"
                                className="p-1.5 -mr-1.5 text-white/90 hover:text-white transition-all active:scale-90 relative flex items-center justify-center flex-shrink-0"
                            >
                                <BellIcon />
                                {isUnread && <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-rose-500 border border-black rounded-full animate-ping"></div>}
                                {isUnread && <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-rose-500 border border-black rounded-full"></div>}
                            </button>
                        );
                    })()}
                </div>

                {/* Extended Tagline & Live Stats Bar in Hero */}
                <div className="mt-5 text-center relative z-10 flex flex-col items-center justify-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-400 border border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Hyperlocal Skill & Service Hub
                    </span>
                </div>
            </header>

            {/* FLOATING SEARCH BAR OVERLAPPING HALF HERO & HALF BODY */}
            <div className="-mt-6 px-4 relative z-20">
                <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 flex items-center transition-all">
                    <div className="flex-1 flex items-center px-2.5 gap-2">
                        <SearchIcon />
                        <input 
                            className="w-full bg-transparent outline-none text-xs text-black placeholder-gray-400 font-medium h-9" 
                            placeholder="Search Boda, Taxi, Electrician, Plumber..."
                            value={localSearch}
                            onChange={handleSearchChange}
                        />
                    </div>
                    {localSearch && (
                        <button 
                            onClick={() => {
                                setLocalSearch('');
                                setSearchTerm('');
                                setSelectedCategory(null);
                            }}
                            className="text-xs font-bold text-gray-400 hover:text-black px-2 py-1"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* ON-DEMAND SERVICE HIGHLIGHTS - POPPING COLOR PILLS */}
            <section className="px-3.5 mt-3">
                <div className="flex justify-between items-center mb-2 px-0.5">
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-500">On-Demand Services</h3>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Nearby</span>
                </div>
                
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {HIGHLIGHT_CATEGORIES.map(cat => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all flex-shrink-0 active:scale-95 shadow-2xs ${
                                    isSelected 
                                        ? cat.activeBg
                                        : 'bg-white text-gray-800 border-gray-200/80 hover:bg-gray-100/80'
                                }`}
                            >
                                <span className="text-xs">{cat.icon}</span>
                                <span className="whitespace-nowrap tracking-tight">{cat.title}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* DISCOVER NEARBY GRID - Listed from closest distance */}
            <main className="px-3.5 mt-3">
                <div className="flex justify-between items-center mb-2.5 px-0.5">
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-wider text-black">
                            {localSearch ? `Results for "${localSearch}"` : 'Nearby Professionals'}
                        </h2>
                    </div>
                    <span className="text-[9px] font-bold text-gray-500 bg-gray-200/60 px-2 py-0.5 rounded-full">
                        {filteredAndSortedProviders.length} nearby
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                    {filteredAndSortedProviders.map(provider => (
                        <ServiceCard 
                            key={provider.id} 
                            provider={provider} 
                            searchTerm={localSearch || searchTerm}
                            onClick={() => onSelectProvider(provider)} 
                        />
                    ))}
                </div>

                {filteredAndSortedProviders.length === 0 && (
                    <div className="py-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100 mt-2 p-4 shadow-2xs">
                        <div className="text-3xl mb-2">🔍</div>
                        <p className="font-bold text-xs text-black">No nearby professionals found</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Try another search or clear your filter.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default NikoSoko;
