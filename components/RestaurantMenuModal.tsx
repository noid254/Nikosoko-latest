
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { ServiceProvider, MenuItem, MenuBundle } from '../types';

interface RestaurantMenuModalProps {
    provider: ServiceProvider;
    onClose: () => void;
    isOwner?: boolean;
    onUpdateProvider?: (updatedProvider: ServiceProvider) => void;
}

// --- Icons ---
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const MinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>;
const ChevronDown = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const ShoppingBagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;

interface CartItem {
    item: MenuItem | MenuBundle;
    quantity: number;
    isBundle: boolean;
}

const MenuItemRow: React.FC<{ item: MenuItem; onAdd: () => void }> = ({ item, onAdd }) => (
    <div className="flex gap-4 p-4 bg-white border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors group cursor-pointer" onClick={onAdd}>
        <div className="flex-1 space-y-1">
            <h4 className="font-bold text-gray-800 text-base">{item.name}</h4>
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
            <div className="flex items-center gap-2 pt-2">
                <span className="text-sm font-bold text-brand-navy">Ksh {item.price}</span>
                {item.isVegetarian && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">V</span>}
                {item.isSpicy && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">Hot</span>}
            </div>
        </div>
        <div className="w-24 h-24 rounded-xl overflow-hidden relative shadow-sm flex-shrink-0 bg-gray-200">
            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            <button 
                onClick={(e) => { e.stopPropagation(); onAdd(); }} 
                className="absolute bottom-1 right-1 bg-white text-brand-navy p-1.5 rounded-lg shadow-md active:scale-90 transition-transform"
            >
                <PlusIcon />
            </button>
        </div>
    </div>
);

const BundleCard: React.FC<{ bundle: MenuBundle; onAdd: () => void }> = ({ bundle, onAdd }) => (
    <div className="min-w-[280px] w-[280px] snap-center bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-md transition-all" onClick={onAdd}>
        <div className="h-36 relative overflow-hidden">
            <img src={bundle.imageUrl} alt={bundle.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute top-2 right-2 bg-brand-gold text-brand-navy text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                SAVE {Math.round(((bundle.originalPrice - bundle.price) / bundle.originalPrice) * 100)}%
            </div>
        </div>
        <div className="p-3">
            <h4 className="font-bold text-gray-900 text-base mb-1">{bundle.title}</h4>
            <p className="text-xs text-gray-500 line-clamp-1 mb-2">{bundle.description}</p>
            <div className="flex justify-between items-center">
                <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-brand-navy">Ksh {bundle.price}</span>
                    <span className="text-xs text-gray-400 line-through decoration-red-400">Ksh {bundle.originalPrice}</span>
                </div>
                <button className="bg-gray-100 p-1.5 rounded-full text-brand-navy hover:bg-brand-navy hover:text-white transition-colors">
                    <PlusIcon />
                </button>
            </div>
        </div>
    </div>
);

const RestaurantMenuModal: React.FC<RestaurantMenuModalProps> = ({ provider, onClose }) => {
    const menu = provider.menu || [];
    const bundles = provider.bundles || [];
    
    // Group menu items by category
    const groupedMenu = useMemo(() => {
        const groups: Record<string, MenuItem[]> = {};
        menu.forEach(item => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        });
        return groups;
    }, [menu]);

    const categories = Object.keys(groupedMenu);
    
    const [activeCategory, setActiveCategory] = useState<string>(categories[0] || '');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [scrollOpacity, setScrollOpacity] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // --- Interactive Scroll Logic ---
    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        // 1. Header Opacity Effect
        const scrollTop = container.scrollTop;
        const opacity = Math.min(scrollTop / 150, 1);
        setScrollOpacity(opacity);

        // 2. Scroll Spy for Active Category
        let currentCat = activeCategory;
        const offset = 180;

        for (const cat of categories) {
            const el = document.getElementById(`cat-${cat}`);
            if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.top <= offset + 50 && rect.bottom >= offset) {
                    currentCat = cat;
                }
            }
        }
        if (currentCat !== activeCategory) {
            setActiveCategory(currentCat);
            const navBtn = document.getElementById(`nav-btn-${currentCat}`);
            navBtn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    };

    const scrollToCategory = (cat: string) => {
        setActiveCategory(cat);
        const el = document.getElementById(`cat-${cat}`);
        const container = scrollContainerRef.current;
        
        if (el && container) {
            const headerOffset = 160; 
            const elementPosition = el.getBoundingClientRect().top;
            const offsetPosition = elementPosition + container.scrollTop - headerOffset;

            container.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    const addToCart = (item: MenuItem | MenuBundle, isBundle: boolean) => {
        setCart(prev => {
            const existing = prev.find(c => c.item.id === item.id && c.isBundle === isBundle);
            if (existing) {
                return prev.map(c => c.item.id === item.id && c.isBundle === isBundle ? { ...c, quantity: c.quantity + 1 } : c);
            }
            return [...prev, { item, quantity: 1, isBundle }];
        });
    };

    const updateQuantity = (item: MenuItem | MenuBundle, isBundle: boolean, delta: number) => {
        setCart(prev => prev.map(c => {
            if (c.item.id === item.id && c.isBundle === isBundle) {
                return { ...c, quantity: Math.max(0, c.quantity + delta) };
            }
            return c;
        }).filter(c => c.quantity > 0));
    };

    const cartTotal = cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);
    const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

    const handleCheckout = () => {
        const message = `New Order for ${provider.name}:\n\n` + 
            cart.map(c => `${c.quantity}x ${'name' in c.item ? c.item.name : c.item.title} - Ksh ${c.item.price * c.quantity}`).join('\n') +
            `\n\nTotal: Ksh ${cartTotal.toLocaleString()}`;
        
        window.open(`https://wa.me/${provider.phone}?text=${encodeURIComponent(message)}`, '_blank');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col font-sans animate-fade-in">
            {/* --- Dynamic Header --- */}
            <div className="fixed top-0 left-0 right-0 z-20 pointer-events-none">
                <div 
                    className="absolute inset-0 h-28 bg-white shadow-sm transition-opacity duration-200 pointer-events-auto"
                    style={{ opacity: scrollOpacity }}
                ></div>
                
                <div className="relative flex justify-between items-center p-4 h-20 pointer-events-auto">
                    <button onClick={onClose} className={`p-2 rounded-full transition-colors ${scrollOpacity > 0.5 ? 'bg-gray-100 text-gray-800' : 'bg-black/30 text-white backdrop-blur-md'}`}>
                        <BackIcon />
                    </button>
                    <div className={`transition-opacity duration-300 transform ${scrollOpacity > 0.8 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                        <h2 className="font-bold text-lg text-gray-900 truncate max-w-[200px]">{provider.name}</h2>
                    </div>
                    <div className="flex gap-2">
                        <button className={`p-2 rounded-full transition-colors ${scrollOpacity > 0.5 ? 'bg-gray-100 text-gray-800' : 'bg-black/30 text-white backdrop-blur-md'}`}>
                            <SearchIcon />
                        </button>
                    </div>
                </div>

                <div className={`absolute top-20 left-0 right-0 bg-white border-b border-gray-100 pointer-events-auto transition-all duration-300 ${scrollOpacity > 0.9 ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 py-3">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                id={`nav-btn-${cat}`}
                                onClick={() => scrollToCategory(cat)}
                                className={`text-sm font-bold whitespace-nowrap transition-colors ${activeCategory === cat ? 'text-brand-navy border-b-2 border-brand-navy pb-1' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- Scrollable Content --- */}
            <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto pb-32 no-scrollbar scroll-smooth" 
                onScroll={handleScroll}
            >
                {/* Hero Section */}
                <div className="relative h-72 w-full">
                    <img 
                        src={provider.coverImageUrl} 
                        alt={provider.name} 
                        className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30"></div>
                    <div className="absolute bottom-0 left-0 p-5 w-full pb-8">
                        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2 font-serif shadow-white drop-shadow-sm">{provider.name}</h1>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700 font-medium">
                            <span className="flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded text-xs font-bold shadow-sm">
                                <StarIcon /> {provider.rating.toFixed(1)}
                            </span>
                            <span>•</span>
                            <span className="text-gray-600">{provider.location}</span>
                            <span>•</span>
                            <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">Open Now</span>
                        </div>
                    </div>
                </div>

                {/* Inline Category Navigation (Visible initially) */}
                <div className="sticky top-0 z-10 bg-white pt-2 pb-2 shadow-sm">
                     <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 py-2">
                        {categories.map(cat => (
                            <button 
                                key={cat} 
                                onClick={() => scrollToCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-brand-navy text-white shadow-md transform scale-105' : 'bg-gray-100 text-gray-600'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bundles Section */}
                {bundles.length > 0 && (
                    <div className="pt-6 pb-2 pl-5 bg-white">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Featured Bundles</h3>
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 pr-5 snap-x">
                            {bundles.map(bundle => (
                                <BundleCard key={bundle.id} bundle={bundle} onAdd={() => addToCart(bundle, true)} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Menu Items List - Grouped & Anchored */}
                <div className="bg-white min-h-[50vh]">
                    {categories.map(cat => (
                        <div key={cat} id={`cat-${cat}`} className="pb-4">
                            <div className="px-5 py-4 bg-gray-50 border-y border-gray-100">
                                <h3 className="text-lg font-extrabold text-gray-800 uppercase tracking-wide">{cat}</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {groupedMenu[cat].map(item => (
                                    <MenuItemRow key={item.id} item={item} onAdd={() => addToCart(item, false)} />
                                ))}
                            </div>
                        </div>
                    ))}
                    {menu.length === 0 && (
                        <div className="text-center py-10 text-gray-500">No menu items available.</div>
                    )}
                </div>
            </div>

            {/* --- Floating Cart Bar --- */}
            {cart.length > 0 && (
                <div className={`fixed bottom-0 left-0 right-0 bg-white shadow-[0_-5px_30px_rgba(0,0,0,0.15)] z-30 transition-all duration-300 ease-out ${isCartOpen ? 'h-[80vh] rounded-t-3xl' : 'h-24'}`}>
                    
                    {!isCartOpen && (
                        <div className="p-4 h-full flex items-center justify-center animate-slide-in-up">
                            <button 
                                onClick={() => setIsCartOpen(true)}
                                className="w-full max-w-md bg-brand-navy text-white rounded-2xl p-4 shadow-lg flex justify-between items-center active:scale-95 transition-transform"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-brand-gold text-brand-navy w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                        {cartCount}
                                    </div>
                                    <span className="font-bold text-sm">View Order</span>
                                </div>
                                <span className="font-bold text-lg">Ksh {cartTotal.toLocaleString()}</span>
                            </button>
                        </div>
                    )}

                    {isCartOpen && (
                        <div className="flex flex-col h-full">
                            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-3xl">
                                <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                                    <ShoppingBagIcon /> Your Order
                                </h3>
                                <button onClick={() => setIsCartOpen(false)} className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:bg-gray-100">
                                    <ChevronDown />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                {cart.map((cartItem, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-brand-gold/30 bg-brand-gold/10 text-brand-navy rounded text-sm font-bold">
                                                {cartItem.quantity}x
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-800 text-sm truncate">{'name' in cartItem.item ? cartItem.item.name : cartItem.item.title}</p>
                                                <p className="text-xs text-gray-500">Ksh {cartItem.item.price}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                            <button onClick={() => updateQuantity(cartItem.item, cartItem.isBundle, -1)} className="w-8 h-8 flex items-center justify-center text-gray-600 bg-white rounded shadow-sm hover:text-red-500"><MinusIcon /></button>
                                            <button onClick={() => updateQuantity(cartItem.item, cartItem.isBundle, 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 bg-white rounded shadow-sm hover:text-green-500"><PlusIcon /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 pb-8">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-gray-500 font-medium">Total Amount</span>
                                    <span className="text-3xl font-extrabold text-brand-navy">Ksh {cartTotal.toLocaleString()}</span>
                                </div>
                                <button 
                                    onClick={handleCheckout} 
                                    className="w-full bg-[#25D366] text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-[#128C7E] transition active:scale-95 flex justify-center items-center gap-3"
                                >
                                    <span>Checkout on WhatsApp</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.456l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.474 1.039-1.04 3.833 3.855-1.017z" /></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RestaurantMenuModal;
