
import React, { useState, useMemo } from 'react';
import type { ServiceProvider, CurrentPage, Premise } from '../types';

interface MyPlacesProps {
    providers: ServiceProvider[];
    premises: Premise[];
    onSelectProvider: (provider: ServiceProvider) => void;
    onSelectPremise?: (premise: Premise) => void;
    onNavigate: (page: CurrentPage) => void;
    onInitiateContact: (provider: ServiceProvider) => boolean;
    onBack: () => void;
}

const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>;

// Expanded and refined categories with child menus
const PLACES_FILTERS: Record<string, { label: string; icon: string; children: string[] }> = {
    RESIDENTIAL: { 
        label: 'Residential', 
        icon: '🏠', 
        children: ['All', 'To Let', 'Short Stay', 'Estates', 'For Sale'] 
    },
    COMMERCIAL: { 
        label: 'Commercial', 
        icon: '🏢', 
        children: ['All', 'To Lease', 'Offices', 'Business Parks', 'Coworking'] 
    },
    HEALTH: { 
        label: 'Health & Wellness', 
        icon: '🏥', 
        children: ['All', 'Hospitals', 'Clinics', 'Gyms', 'Spas'] 
    },
    SPORTS: { 
        label: 'Sports', 
        icon: '⚽', 
        children: ['All', 'Turfs', 'Stadiums', 'Clubs'] 
    },
    ENTERTAINMENT: { 
        label: 'Entertainment', 
        icon: '🍿', 
        children: ['All', 'Malls', 'Cinemas', 'Parks', 'Clubs'] 
    },
    RETAIL: { 
        label: 'Shopping', 
        icon: '🛍️', 
        children: ['All', 'Supermarkets', 'Markets', 'Boutiques'] 
    }
};

type ParentFilter = keyof typeof PLACES_FILTERS;

interface UnifiedPlace {
    id: string;
    kind: 'Premise' | 'Unit';
    name: string;
    images: string[];
    location: string;
    tagline: string;
    category: string;
    subCategory?: string;
    price?: string;
    rating?: number;
    data: Premise | ServiceProvider;
}

const PlaceCard: React.FC<{ place: UnifiedPlace, onClick: () => void }> = ({ place, onClick }) => {
    return (
        <div onClick={onClick} className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm group hover:shadow-xl transition-all cursor-pointer flex flex-col">
            <div className="relative aspect-[16/11] w-full bg-gray-200 overflow-hidden">
                <img 
                    src={place.images[0]} 
                    alt={place.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                {place.price && (
                    <div className="absolute bottom-4 right-4 bg-brand-navy text-white text-[10px] font-black px-4 py-2 rounded-2xl shadow-lg">
                        {place.price}
                    </div>
                )}
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-black text-brand-navy text-base leading-tight truncate mb-1 italic uppercase tracking-tight">{place.name}</h3>
                <div className="flex items-center gap-1.5 mb-4">
                    <div className="w-1 h-1 bg-brand-gold rounded-full"></div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">{place.location}</p>
                </div>
                
                <div className="mt-auto pt-4 border-t border-dashed border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Explore Profile &rarr;</span>
                    {place.rating !== undefined && place.rating > 0 && (
                        <div className="flex items-center gap-1">
                            <span className="text-yellow-400 text-xs">★</span>
                            <span className="text-[10px] font-black text-gray-600">{place.rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MyPlaces: React.FC<MyPlacesProps> = ({ premises, providers, onSelectPremise, onSelectProvider, onBack }) => {
    const [activeParent, setActiveParent] = useState<ParentFilter>('RESIDENTIAL');
    const [activeChild, setActiveChild] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState('');

    const unifiedPlaces: UnifiedPlace[] = useMemo(() => {
        const places: UnifiedPlace[] = [];
        
        premises.forEach(p => {
            places.push({
                id: p.id,
                kind: 'Premise',
                name: p.name,
                images: p.galleryImages?.length ? p.galleryImages : [p.bannerImageUrl],
                location: p.location || 'Nairobi',
                tagline: p.tagline || p.type || 'Property',
                category: (p.type?.toUpperCase() === 'MIXED' ? 'COMMERCIAL' : p.type?.toUpperCase()) || 'COMMERCIAL',
                subCategory: p.type, 
                data: p
            });
        });

        providers.forEach(p => {
            if (p.premiseId) return; // Skip tenants, we want landing pages or standalone units
            
            const cat = p.category?.toUpperCase();
            if (['HOSPITALITY', 'HEALTH', 'EDUCATION', 'ENTERTAINMENT', 'RETAIL'].includes(cat)) {
                places.push({
                    id: p.id,
                    kind: 'Unit',
                    name: p.name,
                    images: p.works?.length ? p.works : [p.coverImageUrl],
                    location: p.location,
                    tagline: p.service,
                    category: cat,
                    subCategory: p.service,
                    rating: p.rating,
                    price: p.hourlyRate > 0 ? `${p.currency} ${p.hourlyRate}` : undefined,
                    data: p
                });
            }
        });

        return places;
    }, [premises, providers]);

    const filteredPlaces = useMemo(() => {
        let results = unifiedPlaces;
        
        // Filter by Parent
        results = results.filter(p => p.category === activeParent);

        // Filter by Child (Sub-logic)
        if (activeChild !== 'All') {
            const childTerm = activeChild.toLowerCase();
            results = results.filter(p => {
                const searchStr = `${p.name} ${p.tagline} ${p.subCategory}`.toLowerCase();
                return searchStr.includes(childTerm);
            });
        }

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            results = results.filter(p => p.name.toLowerCase().includes(lowerTerm) || p.location?.toLowerCase().includes(lowerTerm));
        }

        return results;
    }, [unifiedPlaces, activeParent, activeChild, searchTerm]);

    return (
        <div className="bg-white min-h-full font-sans flex flex-col">
            <header className="px-6 pt-6 pb-2 space-y-6 sticky top-0 bg-white z-30 shadow-sm border-b border-gray-50">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-3 -ml-3 text-gray-900 bg-gray-50 rounded-2xl active:scale-90"><BackIcon /></button>
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            placeholder="Search properties..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-[24px] shadow-inner focus:bg-white focus:ring-2 focus:ring-brand-gold outline-none text-sm font-medium transition-all"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"><SearchIcon /></div>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {(Object.keys(PLACES_FILTERS) as ParentFilter[]).map(key => {
                        const config = PLACES_FILTERS[key];
                        const isActive = activeParent === key;
                        return (
                            <button 
                                key={key} 
                                onClick={() => { setActiveParent(key); setActiveChild('All'); }}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl flex-shrink-0 transition-all font-black text-[10px] uppercase tracking-widest border-2 ${isActive ? 'bg-brand-navy text-white border-brand-navy shadow-lg' : 'bg-white text-gray-400 border-gray-50 hover:bg-gray-50'}`}
                            >
                                <span className="text-base">{config.icon}</span> {config.label}
                            </button>
                        );
                    })}
                </div>

                {/* Sub-menu (Children) */}
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 border-t border-gray-50 pt-3">
                    {PLACES_FILTERS[activeParent].children.map(child => (
                        <button
                            key={child}
                            onClick={() => setActiveChild(child)}
                            className={`flex-shrink-0 text-[11px] font-black uppercase tracking-[0.1em] transition-colors ${activeChild === child ? 'text-brand-gold underline underline-offset-8 decoration-2' : 'text-gray-400'}`}
                        >
                            {child}
                        </button>
                    ))}
                </div>
            </header>

            <main className="px-6 py-8 flex-1">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-brand-navy italic uppercase tracking-tighter leading-none">{activeParent.toLowerCase()}</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-2">Verified Neighborhood Registry</p>
                    </div>
                    <div className="bg-gray-100 px-3 py-1.5 rounded-xl">
                        <span className="text-[9px] font-black text-brand-navy uppercase tracking-widest">{filteredPlaces.length} results</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-32">
                    {filteredPlaces.map(place => (
                        <PlaceCard 
                            key={`${place.kind}-${place.id}`} 
                            place={place} 
                            onClick={() => place.kind === 'Premise' ? onSelectPremise?.(place.data as Premise) : onSelectProvider(place.data as ServiceProvider)}
                        />
                    ))}
                    {filteredPlaces.length === 0 && (
                        <div className="col-span-full py-20 text-center space-y-4 opacity-30">
                            <div className="text-6xl">🏢</div>
                            <p className="font-black text-xs uppercase tracking-widest">No listings found in this category</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyPlaces;
