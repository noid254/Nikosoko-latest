import React, { useState, useMemo, useEffect } from 'react';
import type { CatalogueItem, ServiceProvider, CurrentPage } from '../types';

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

const TukosokoItemCard: React.FC<{
    item: CatalogueItem;
    provider?: ServiceProvider;
    onClick: () => void;
}> = ({ item, provider, onClick }) => {
    return (
        <div onClick={onClick} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer group hover:shadow-md transition-shadow">
            <div className="relative h-32 bg-gray-50">
                <img src={item.imageUrls[0]} alt={item.title} className="w-full h-full object-cover" />
                {item.isVerified && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1 shadow-sm text-[8px] font-black uppercase tracking-widest px-2">
                        Verified
                    </div>
                )}
            </div>
            <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
                <div>
                    <h3 className="font-bold text-gray-800 text-xs truncate group-hover:underline leading-tight">{item.title}</h3>
                    <p className="text-brand-navy font-black text-[11px] mt-1">{item.price}</p>
                </div>
                {provider && (
                    <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-gray-100">
                        <img src={provider.shopDetails?.logo || provider.avatarUrl} alt={provider.name} className="w-5 h-5 rounded-full object-cover border" />
                        <p className="text-[10px] text-gray-500 font-bold truncate flex-1 uppercase tracking-tight">{provider.shopDetails?.name || provider.name}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

interface TukosokoProps {
    items: CatalogueItem[];
    providers: ServiceProvider[];
    onSelectProvider: (provider: ServiceProvider) => void;
    onBack: () => void;
    onMessagesClick: () => void;
    hasNewMessages: boolean;
    onNavigate: (page: CurrentPage) => void;
}

const Tukosoko: React.FC<TukosokoProps> = ({ 
    items, providers, onSelectProvider, onBack, onMessagesClick, 
    hasNewMessages, onNavigate 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [shuffledProducts, setShuffledProducts] = useState<CatalogueItem[]>([]);
    
    const providerMap = useMemo(() => new Map(providers.map(p => [p.id, p])), [providers]);

    // Shuffle products randomly when Tukosoko is clicked (mounted)
    useEffect(() => {
        // Filter for items that are products/for sale
        const products = items.filter(i => 
            i.category === 'Product' || 
            i.category === 'For Sale' || 
            !i.category
        );
        // Shuffle randomly
        const shuffled = [...products].sort(() => Math.random() - 0.5);
        setShuffledProducts(shuffled);
    }, [items]);

    const filtered = useMemo(() => {
        if (!searchTerm) return shuffledProducts;
        const t = searchTerm.toLowerCase();
        return shuffledProducts.filter(item => {
            const provider = providerMap.get(item.providerId);
            const shopName = provider?.shopDetails?.name || provider?.name || '';
            return item.title.toLowerCase().includes(t) || 
                   item.description.toLowerCase().includes(t) ||
                   shopName.toLowerCase().includes(t);
        });
    }, [shuffledProducts, searchTerm, providerMap]);

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-24 max-w-md mx-auto border-x border-gray-100">
            {/* Minimal Sticky Top Header */}
            <header className="p-6 flex justify-between items-center border-b border-gray-100 bg-white sticky top-0 z-40">
                <button onClick={onBack} className="p-3 bg-gray-50 rounded-2xl text-gray-700 hover:bg-gray-100 transition-colors">
                    <BackIcon />
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-black text-brand-navy tracking-tight uppercase leading-none">Tukosoko</h1>
                    <p className="text-[9px] font-black tracking-widest text-gray-400 uppercase mt-0.5">Randomized Discoveries</p>
                </div>
                <button onClick={onMessagesClick} className="p-3 bg-gray-50 rounded-2xl text-gray-700 hover:bg-gray-100 transition-colors relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {hasNewMessages && <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full"></div>}
                </button>
            </header>

            {/* Marketplace Search */}
            <div className="px-6 py-4 bg-white border-b border-gray-100">
                <div className="bg-gray-50 rounded-2xl flex items-center p-2 border border-gray-100 focus-within:border-brand-navy focus-within:bg-white transition-all">
                    <div className="flex-grow flex items-center px-3 gap-3">
                        <SearchIcon />
                        <input 
                            className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 font-semibold h-10" 
                            placeholder="Search products or shops..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')} 
                            className="text-xs font-bold text-gray-400 hover:text-gray-600 px-2"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Random Feed */}
            <main className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-lg font-black text-brand-navy uppercase tracking-tight">
                            {searchTerm ? 'Search Results' : 'Neighborhood Discoveries'}
                        </h2>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            {searchTerm ? 'Found matching products' : 'Products listed by local vendors'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {filtered.map(item => {
                        const provider = providerMap.get(item.providerId);
                        return (
                            <TukosokoItemCard 
                                key={item.id} 
                                item={item} 
                                provider={provider} 
                                onClick={() => {
                                    if (provider) {
                                        onSelectProvider(provider);
                                    }
                                }} 
                            />
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="py-20 text-center text-gray-400 bg-white rounded-3xl border border-gray-100 mt-4">
                        <div className="text-5xl mb-4">🛒</div>
                        <p className="font-black text-xs uppercase tracking-widest">No products found</p>
                        <p className="text-[10px] mt-1">Try another keyword or wait for sellers to post.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Tukosoko;
