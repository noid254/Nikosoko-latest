import React, { useState, useMemo } from 'react';
import type { ServiceProvider, CatalogueItem, CurrentPage } from '../types';
import ServiceCard from './ServiceCard';
import CatalogueItemDetailModal from './CatalogueItemDetailModal';
import OrgDetailModal from './OrgDetailModal';

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-black fill-current" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

interface NikoSokoProps {
    providers: ServiceProvider[];
    catalogueItems?: CatalogueItem[];
    onSelectProvider: (p: ServiceProvider) => void;
    searchTerm: string;
    setSearchTerm: (t: string) => void;
    onBack: () => void;
    onMessagesClick: () => void;
    hasNewMessages: boolean;
    onNavigate: (p: CurrentPage) => void;
    currentUser: ServiceProvider | null;
    onViewSacco?: (p: ServiceProvider) => void;
    isAuthenticated?: boolean;
    onAuthClick?: () => void;
    onInitiateContact?: (provider: ServiceProvider) => boolean;
    onBookProvider?: (provider: ServiceProvider) => void;
}

interface HighlightCategory {
    id: string;
    title: string;
    keyword: string;
    icon: string;
    bgClass: string;
    activeClass: string;
}

const HIGHLIGHT_CATEGORIES: HighlightCategory[] = [
    { id: 'boda', title: 'Boda', keyword: 'boda', icon: '🛵', bgClass: 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100', activeClass: 'bg-amber-500 text-black border-amber-600 font-black shadow-md' },
    { id: 'taxi', title: 'Taxi', keyword: 'taxi', icon: '🚕', bgClass: 'bg-yellow-50 text-yellow-900 border-yellow-300 hover:bg-yellow-100', activeClass: 'bg-yellow-400 text-black border-yellow-500 font-black shadow-md' },
    { id: 'electrician', title: 'Electrician', keyword: 'electric', icon: '⚡', bgClass: 'bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100', activeClass: 'bg-blue-600 text-white border-blue-700 font-black shadow-md' },
    { id: 'plumber', title: 'Plumber', keyword: 'plumb', icon: '🚰', bgClass: 'bg-sky-50 text-sky-900 border-sky-300 hover:bg-sky-100', activeClass: 'bg-sky-500 text-white border-sky-600 font-black shadow-md' },
    { id: 'refills', title: 'Gas & Water', keyword: 'refill', icon: '💧', bgClass: 'bg-cyan-50 text-cyan-900 border-cyan-300 hover:bg-cyan-100', activeClass: 'bg-cyan-600 text-white border-cyan-700 font-black shadow-md' },
    { id: 'tv', title: 'TV Mounting', keyword: 'tv', icon: '📺', bgClass: 'bg-indigo-50 text-indigo-900 border-indigo-300 hover:bg-indigo-100', activeClass: 'bg-indigo-600 text-white border-indigo-700 font-black shadow-md' },
    { id: 'braiding', title: 'Braiding', keyword: 'braid', icon: '💇‍♀️', bgClass: 'bg-pink-50 text-pink-900 border-pink-300 hover:bg-pink-100', activeClass: 'bg-pink-500 text-white border-pink-600 font-black shadow-md' },
    { id: 'cleaner', title: 'Cleaning', keyword: 'clean', icon: '🧹', bgClass: 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100', activeClass: 'bg-emerald-600 text-white border-emerald-700 font-black shadow-md' },
    { id: 'mechanic', title: 'Mechanic & Tech', keyword: 'repair', icon: '🧰', bgClass: 'bg-orange-50 text-orange-900 border-orange-300 hover:bg-orange-100', activeClass: 'bg-orange-500 text-white border-orange-600 font-black shadow-md' },
    { id: 'courier', title: 'Delivery', keyword: 'deliver', icon: '📦', bgClass: 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100', activeClass: 'bg-purple-600 text-white border-purple-700 font-black shadow-md' },
    { id: 'solar', title: 'Solar', keyword: 'solar', icon: '☀️', bgClass: 'bg-lime-50 text-lime-900 border-lime-300 hover:bg-lime-100', activeClass: 'bg-lime-500 text-black border-lime-600 font-black shadow-md' },
    { id: 'tutoring', title: 'Tutoring', keyword: 'tutor', icon: '📚', bgClass: 'bg-teal-50 text-teal-900 border-teal-300 hover:bg-teal-100', activeClass: 'bg-teal-600 text-white border-teal-700 font-black shadow-md' }
];

const NikoSoko: React.FC<NikoSokoProps> = ({ 
    providers, catalogueItems = [], onSelectProvider, searchTerm, setSearchTerm, onBack, onMessagesClick, 
    hasNewMessages, onNavigate, currentUser, onViewSacco, isAuthenticated = false, onAuthClick, onInitiateContact, onBookProvider
}) => {
    const [activeTab, setActiveTab] = useState<'pros' | 'services'>('pros');
    const [localSearch, setLocalSearch] = useState(searchTerm || '');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedCatalogueItem, setSelectedCatalogueItem] = useState<CatalogueItem | null>(null);
    const [selectedOrgModal, setSelectedOrgModal] = useState<{ orgName: string; cert?: any } | null>(null);

    const handleCategoryClick = (cat: HighlightCategory) => {
        if (selectedCategory === cat.id) {
            setSelectedCategory(null);
            setLocalSearch('');
            setSearchTerm('');
        } else {
            setSelectedCategory(cat.id);
            setLocalSearch(cat.title);
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

    // Filtered nearby professionals
    const filteredAndSortedProviders = useMemo(() => {
        let result = [...providers].filter(p => p.category !== 'PERSONAL' && !p.premiseId);
        const activeQuery = (searchTerm || localSearch).toLowerCase().trim();

        if (activeQuery) {
            result = result.filter(p => {
                const nameMatch = p.name.toLowerCase().includes(activeQuery);
                const serviceMatch = p.service.toLowerCase().includes(activeQuery);
                const locationMatch = p.location.toLowerCase().includes(activeQuery);
                const aboutMatch = (p.about || '').toLowerCase().includes(activeQuery);
                const categoryMatch = (p.category || '').toLowerCase().includes(activeQuery);
                const skillMatch = p.skills?.some(s => 
                    (s.skillTitle || s.name || '').toLowerCase().includes(activeQuery) ||
                    (s.category || '').toLowerCase().includes(activeQuery) ||
                    (s.description || '').toLowerCase().includes(activeQuery)
                );
                return nameMatch || serviceMatch || locationMatch || aboutMatch || categoryMatch || skillMatch;
            });
        }
        
        return result.sort((a, b) => {
            const aSacco = a.isSaccoVerified || a.saccoMember?.status === 'Confirmed' ? 1 : 0;
            const bSacco = b.isSaccoVerified || b.saccoMember?.status === 'Confirmed' ? 1 : 0;
            if (bSacco !== aSacco) return bSacco - aSacco;
            return a.distanceKm - b.distanceKm;
        });
    }, [providers, searchTerm, localSearch]);

    // Filtered service listings (catalogue items - strictly services offered by professionals)
    const filteredAndSortedServices = useMemo(() => {
        let result = catalogueItems.filter(item => item.category !== 'Product');
        const activeQuery = (searchTerm || localSearch).toLowerCase().trim();

        if (activeQuery) {
            result = result.filter(item => {
                const provider = providers.find(p => p.id === item.providerId);
                const titleMatch = item.title.toLowerCase().includes(activeQuery);
                const categoryMatch = (item.category || '').toLowerCase().includes(activeQuery);
                const descMatch = (item.description || '').toLowerCase().includes(activeQuery);
                const priceMatch = (item.price || '').toLowerCase().includes(activeQuery);
                const providerMatch = provider ? (
                    provider.name.toLowerCase().includes(activeQuery) ||
                    provider.location.toLowerCase().includes(activeQuery) ||
                    provider.service.toLowerCase().includes(activeQuery)
                ) : false;

                return titleMatch || categoryMatch || descMatch || priceMatch || providerMatch;
            });
        }

        return result;
    }, [catalogueItems, providers, searchTerm, localSearch]);

    const activeItemProvider = selectedCatalogueItem 
        ? providers.find(p => p.id === selectedCatalogueItem.providerId) || null 
        : null;

    return (
        <div className="w-full max-w-md mx-auto bg-white min-h-screen font-sans pb-20 relative border-x border-gray-200">
            {/* MINIMALIST HEADER - STRICT BLACK & WHITE */}
            <header className="bg-black text-white pt-6 pb-6 px-4 border-b border-gray-800">
                <div className="flex justify-between items-center">
                    <button 
                        onClick={onBack} 
                        aria-label="Open Menu"
                        className="p-1 -ml-1 text-white hover:text-gray-300 transition-colors flex items-center justify-center"
                    >
                        <MenuIcon />
                    </button>

                    <div className="text-center cursor-pointer" onClick={() => { setLocalSearch(''); setSearchTerm(''); setSelectedCategory(null); }}>
                        <h1 className="text-xl font-black uppercase tracking-[0.25em] text-white leading-none">NIKOSOKO</h1>
                        <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-gray-400 mt-1">Neighborhood Skilled Marketplace</p>
                    </div>

                    {(() => {
                        const isUnread = hasNewMessages || Boolean(currentUser && !currentUser.isProfileCompleted);
                        return (
                            <button 
                                onClick={onMessagesClick} 
                                aria-label="Notifications"
                                className="p-1 -mr-1 text-white hover:text-gray-300 transition-colors relative flex items-center justify-center"
                            >
                                <BellIcon />
                                {isUnread && <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full"></div>}
                            </button>
                        );
                    })()}
                </div>
            </header>

            {/* MINIMALIST SEARCH BAR */}
            <div className="px-3 pt-3 pb-2 bg-white border-b border-gray-200">
                <div className="bg-gray-50 border border-gray-300 flex items-center px-3 py-1.5 transition-colors focus-within:border-black">
                    <SearchIcon />
                    <input 
                        className="w-full bg-transparent outline-none text-xs text-black placeholder-gray-500 font-medium ml-2 h-7" 
                        placeholder="Search electrician, boda, TV mount, water, gas..."
                        value={localSearch}
                        onChange={handleSearchChange}
                    />
                    {localSearch && (
                        <button 
                            onClick={() => {
                                setLocalSearch('');
                                setSearchTerm('');
                                setSelectedCategory(null);
                            }}
                            className="text-xs font-bold text-gray-500 hover:text-black px-1"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* QUICK FILTERS - MINIMAL MONOCHROME PILLS WITH SCROLL AFFORDANCE */}
                <div className="relative flex items-center pt-2">
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pr-8 py-0.5 w-full scroll-smooth">
                        {HIGHLIGHT_CATEGORIES.map(cat => {
                            const isSelected = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat)}
                                    className={`px-3 py-1.5 border rounded-full text-[10.5px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap active:scale-95 cursor-pointer shadow-xs ${
                                        isSelected 
                                            ? cat.activeClass 
                                            : cat.bgClass
                                    }`}
                                >
                                    <span className="text-sm leading-none">{cat.icon}</span>
                                    <span>{cat.title}</span>
                                </button>
                            );
                        })}
                    </div>
                    {/* Right Fade Gradient Scroll Indicator */}
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none flex items-center justify-end pr-0.5 z-10">
                        <span className="text-gray-400 font-bold text-[10px] animate-pulse">→</span>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT HEADER WITH FULL-WIDTH TOGGLE SWITCH */}
            <main className="px-3 pt-4">
                {/* HEADER TITLE, FULL-WIDTH TOGGLE SWITCH & SUBTITLE */}
                <div className="pb-3 border-b border-dashed border-gray-200 mb-3 space-y-2">
                    {/* FULL-WIDTH TOGGLE BUTTONS WITH ICONS & COUNTS */}
                    <div className="flex w-full border border-black p-0.5 bg-white shadow-2xs">
                        <button
                            onClick={() => setActiveTab('pros')}
                            className={`flex-1 py-2 text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                activeTab === 'pros'
                                    ? 'bg-black text-white'
                                    : 'bg-white text-black hover:bg-gray-100'
                            }`}
                            title="Browse verified local professionals"
                        >
                            <span>👤</span>
                            <span>Pros</span>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border ${
                                activeTab === 'pros' ? 'border-white/30 bg-white/20 text-white' : 'border-gray-200 bg-gray-50 text-black'
                            }`}>
                                {filteredAndSortedProviders.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('services')}
                            className={`flex-1 py-2 text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                activeTab === 'services'
                                    ? 'bg-black text-white'
                                    : 'bg-white text-black hover:bg-gray-100'
                            }`}
                            title="Browse fixed-price services & catalog items"
                        >
                            <span>🛠️</span>
                            <span>Services</span>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border ${
                                activeTab === 'services' ? 'border-white/30 bg-white/20 text-white' : 'border-gray-200 bg-gray-50 text-black'
                            }`}>
                                {filteredAndSortedServices.length}
                            </span>
                        </button>
                    </div>

                    {/* HELPER SUBTITLE */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black uppercase tracking-wider text-black">
                            {activeTab === 'pros' ? 'Nearby Professionals' : 'Service Listings'}
                        </h2>
                        <p className="text-[10px] text-gray-500 font-medium truncate">
                            {activeTab === 'pros' 
                                ? '👤 Profiles & skilled experts' 
                                : '🛠️ Fixed-price packages'}
                        </p>
                    </div>
                </div>

                {/* TAB CONTENTS */}
                {activeTab === 'pros' ? (
                    /* NEARBY PROS GRID */
                    <div>
                        <div className="grid grid-cols-2 gap-2.5">
                            {filteredAndSortedProviders.map(provider => (
                                <ServiceCard 
                                    key={provider.id} 
                                    provider={provider} 
                                    searchTerm={localSearch || searchTerm}
                                    onClick={() => onSelectProvider(provider)} 
                                    onViewSacco={onViewSacco}
                                    onViewOrg={(orgName, cert) => setSelectedOrgModal({ orgName, cert })}
                                />
                            ))}
                        </div>

                        {filteredAndSortedProviders.length === 0 && (
                            <div className="py-12 text-center text-gray-500 border border-dashed border-gray-300 p-4 mt-2">
                                <p className="font-bold text-xs text-black uppercase tracking-wider">No professionals found</p>
                                <p className="text-[10px] text-gray-500 mt-1">Try another search keyword or clear filters.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* SERVICE LISTINGS GRID - LISTINGS MADE BY PROFESSIONALS */
                    <div>
                        <div className="grid grid-cols-2 gap-2.5">
                            {filteredAndSortedServices.map(item => {
                                const provider = providers.find(p => p.id === item.providerId);
                                const photo = item.imageUrls?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=400';
                                const isSaccoMember = provider?.isSaccoVerified || provider?.saccoMember?.status === 'Confirmed' || provider?.saccoMember?.status === 'Approved';
                                const saccoName = provider?.saccoMember?.saccoName || 'Sacco Member';

                                return (
                                    <div 
                                        key={item.id}
                                        onClick={() => setSelectedCatalogueItem(item)}
                                        className="bg-white border border-gray-200 hover:border-black cursor-pointer group transition-all flex flex-col justify-between overflow-hidden relative z-0"
                                    >
                                        <div className="relative h-28 bg-gray-100 overflow-hidden border-b border-gray-200 flex-shrink-0 z-0">
                                            <img 
                                                src={photo} 
                                                alt={item.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=400';
                                                }}
                                            />
                                            <div className="absolute top-1.5 left-1.5 bg-black text-white text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 z-10 max-w-[100px] truncate">
                                                {item.category || 'Service'}
                                            </div>

                                            {/* Distance/Proximity Badge in Black space and green text */}
                                            {provider && (
                                                <div className="absolute bottom-1.5 left-1.5 bg-black text-emerald-400 font-mono text-[8.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 z-10 border border-emerald-500/30">
                                                    {provider.distanceKm}km away
                                                </div>
                                            )}

                                            {/* Online Indicator Badge on Thumbnail */}
                                            {Boolean(provider?.isOnline) && (
                                                <div className="absolute bottom-1.5 right-1.5 bg-black text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 flex items-center gap-1 z-10 border border-emerald-500/30">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                                    <span>ONLINE</span>
                                                </div>
                                            )}

                                            {/* BADGE PRIORITY RULE: Sacco Preferred Over Verified */}
                                            {isSaccoMember ? (
                                                <div className="absolute top-1.5 right-1.5 bg-black text-white text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 border border-white/20 z-10">
                                                    ● {saccoName}
                                                </div>
                                            ) : item.isVerified ? (
                                                <div className="absolute top-1.5 right-1.5 bg-blue-600 text-white w-5 h-5 rounded-full font-bold text-xs flex items-center justify-center border border-white shadow-xs z-10">
                                                    ✓
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="p-2.5 space-y-1 flex-1 flex flex-col justify-between bg-white relative z-0">
                                            <div>
                                                <div className="text-[8.5px] font-extrabold uppercase tracking-widest text-gray-400 flex items-center gap-1 mb-0.5">
                                                    <span className="w-1 h-1 rounded-full bg-gray-400 inline-block"></span>
                                                    <span className="truncate">{item.category || 'Service Listing'}</span>
                                                </div>

                                                <div className="flex justify-between items-start gap-1">
                                                    <h3 className="font-bold text-xs text-black leading-snug line-clamp-2 break-words flex-1">{item.title}</h3>
                                                    {provider && (
                                                        <div className="flex items-center gap-0.5 text-[9px] font-mono font-bold text-black border border-gray-200 px-1 py-0.5 bg-gray-50 flex-shrink-0">
                                                            <StarIcon />
                                                            <span>{provider.rating ? provider.rating.toFixed(1) : '5.0'}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-[9.5px] text-gray-500 line-clamp-2 break-words leading-tight mt-1">{item.description}</p>
                                            </div>

                                            <div className="pt-2 mt-auto border-t border-dashed border-gray-200 flex items-center justify-between min-w-0">
                                                {provider ? (
                                                    <div className="min-w-0 pr-1 flex-1">
                                                        <span className="text-[9.5px] font-bold text-black truncate flex items-center gap-1 min-w-0">
                                                            <span className="truncate">{provider.name}</span>
                                                            {(provider.isVerified || item.isVerified) && (
                                                                <svg className="w-3.5 h-3.5 text-blue-500 inline-block flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                                                </svg>
                                                            )}
                                                            <span className="text-gray-600 font-mono text-[8.5px] font-bold flex-shrink-0">⭐ {provider.rating ? provider.rating.toFixed(1) : '5.0'}</span>
                                                        </span>
                                                        <span className="text-[8.5px] text-gray-600 truncate block">{provider.location} • <span className="font-mono font-bold text-black">{provider.distanceKm}km away</span></span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[9px] text-gray-400">Professional Service</span>
                                                )}
                                                <span className="text-[10px] font-black text-black font-mono flex-shrink-0 ml-1">
                                                    {item.price}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {filteredAndSortedServices.length === 0 && (
                            <div className="py-12 text-center text-gray-500 border border-dashed border-gray-300 p-4 mt-2">
                                <p className="font-bold text-xs text-black uppercase tracking-wider">No service listings found</p>
                                <p className="text-[10px] text-gray-500 mt-1">Try another search keyword or switch to Pros tab.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* FLOATING BUTTON PROMPTING USERS TO SELL A SERVICE */}
            <div className="fixed bottom-6 right-4 z-40">
                <button
                    onClick={() => {
                        if (!isAuthenticated) {
                            if (onAuthClick) onAuthClick();
                        } else {
                            onNavigate('sellService');
                        }
                    }}
                    className="bg-black hover:bg-gray-900 text-white font-black text-xs uppercase tracking-wider px-4 py-3 rounded-full shadow-2xl border border-gray-700 flex items-center gap-2 transition-all active:scale-95 cursor-pointer group"
                    title="List & Sell a Service on NikoSoko"
                >
                    <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm leading-none group-hover:scale-110 transition-transform">+</span>
                    <span>SELL A SERVICE</span>
                </button>
            </div>

            {/* SERVICE ITEM DETAIL MODAL */}
            {selectedCatalogueItem && (
                <CatalogueItemDetailModal
                    item={selectedCatalogueItem}
                    onClose={() => setSelectedCatalogueItem(null)}
                    provider={activeItemProvider}
                    isAuthenticated={isAuthenticated}
                    onAuthClick={onAuthClick || (() => {})}
                    onInitiateContact={onInitiateContact || (() => true)}
                />
            )}

            <OrgDetailModal
                isOpen={Boolean(selectedOrgModal)}
                onClose={() => setSelectedOrgModal(null)}
                orgName={selectedOrgModal?.orgName}
                fullSkillCert={selectedOrgModal?.cert ? {
                    certificationName: selectedOrgModal.cert.certificationName,
                    issuingSchool: selectedOrgModal.cert.issuingSchool,
                    yearObtained: selectedOrgModal.cert.yearObtained,
                    licenseNumber: selectedOrgModal.cert.licenseNumber
                } : undefined}
            />
        </div>
    );
};

export default NikoSoko;
