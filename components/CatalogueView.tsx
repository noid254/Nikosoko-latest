import React, { useState, useRef, useMemo } from 'react';
import type { CatalogueItem, CatalogueCategory, ServiceProvider, ShopDetails } from '../types';
import CatalogueItemDetailModal from './CatalogueItemDetailModal';

interface CatalogueViewProps {
    items: CatalogueItem[];
    onUpdateItems: (items: CatalogueItem[]) => void;
    currentUser: ServiceProvider | null;
    onUpdateUser: (user: ServiceProvider) => void;
    isAuthenticated: boolean;
    onAuthClick: () => void;
    onInitiateContact: (provider: ServiceProvider) => boolean;
    onBack: () => void;
    viewingProvider?: ServiceProvider | null;
}

// --- Icons ---
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.002l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>;

const CatalogueCard: React.FC<{item: CatalogueItem, onClick: () => void}> = ({ item, onClick }) => (
    <div onClick={onClick} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer group hover:shadow-md transition-shadow">
        <img src={item.imageUrls[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400'} alt={item.title} className="w-full h-32 object-cover" />
        <div className="p-3">
            <h3 className="font-bold text-gray-800 text-xs truncate group-hover:underline leading-tight">{item.title}</h3>
            <p className="text-brand-navy font-black text-[10px] mt-1.5">{item.price}</p>
        </div>
    </div>
);

const ShopDetailsModal: React.FC<{ 
    details: ShopDetails | undefined; 
    onSave: (details: ShopDetails) => void; 
    onCancel: () => void 
}> = ({ details, onSave, onCancel }) => {
    const [logo, setLogo] = useState(details?.logo || '');
    const [name, setName] = useState(details?.name || '');
    const [address, setAddress] = useState(details?.address || '');
    const [operatingHours, setOperatingHours] = useState(details?.operatingHours || '');
    const [paymentMode, setPaymentMode] = useState(details?.paymentMode || '');
    const [website, setWebsite] = useState(details?.website || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/75 flex justify-center items-center z-[130] p-4">
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-sm space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
                <h2 className="text-lg font-black text-brand-navy uppercase tracking-tight text-center">Edit Shop Details</h2>
                
                <div className="space-y-3">
                    <div className="flex flex-col items-center gap-2">
                        {logo ? (
                            <img src={logo} className="w-16 h-16 rounded-full object-cover border-2 border-brand-gold shadow-sm" alt="Logo preview" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs uppercase">No Logo</div>
                        )}
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()} 
                            className="text-[10px] font-black uppercase text-brand-navy tracking-wider"
                        >
                            Upload Shop Logo
                        </button>
                        <input type="file" ref={fileInputRef} accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </div>

                    <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Shop / Business Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="e.g. James Plumbers Ltd" className="w-full p-2 border rounded-xl text-sm font-bold bg-gray-50 focus:bg-white outline-none" />
                    </div>

                    <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Street Address</label>
                        <input value={address} onChange={e => setAddress(e.target.value)} type="text" placeholder="e.g. Lenana Road, Westlands" className="w-full p-2 border rounded-xl text-sm font-bold bg-gray-50 focus:bg-white outline-none" />
                    </div>

                    <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Operating Hours</label>
                        <input value={operatingHours} onChange={e => setOperatingHours(e.target.value)} type="text" placeholder="e.g. Mon-Sat: 8 AM - 6 PM" className="w-full p-2 border rounded-xl text-sm font-bold bg-gray-50 focus:bg-white outline-none" />
                    </div>

                    <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Mode of Payment</label>
                        <input value={paymentMode} onChange={e => setPaymentMode(e.target.value)} type="text" placeholder="e.g. Cash, M-Pesa, Card" className="w-full p-2 border rounded-xl text-sm font-bold bg-gray-50 focus:bg-white outline-none" />
                    </div>

                    <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Website URL</label>
                        <input value={website} onChange={e => setWebsite(e.target.value)} type="text" placeholder="e.g. https://mybusiness.com" className="w-full p-2 border rounded-xl text-sm font-bold bg-gray-50 focus:bg-white outline-none" />
                    </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button onClick={onCancel} className="flex-1 py-3 bg-gray-100 text-gray-400 font-black text-[10px] uppercase tracking-widest rounded-xl">Cancel</button>
                    <button 
                        onClick={() => onSave({ logo, name, address, operatingHours, paymentMode, website })} 
                        className="flex-1 bg-brand-navy text-white font-black py-3 rounded-xl shadow-md uppercase text-[10px] tracking-widest active:scale-95"
                    >
                        Save Shop
                    </button>
                </div>
            </div>
        </div>
    );
};

const CatalogueFormModal: React.FC<{ onSave: (item: Omit<CatalogueItem, 'id' | 'providerId'>) => void, onCancel: () => void }> = ({ onSave, onCancel }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<CatalogueCategory>('Product');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [duration, setDuration] = useState('');
    const [discountInfo, setDiscountInfo] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const categories: CatalogueCategory[] = ['Product', 'Service', 'Professional Service', 'For Rent', 'For Sale'];
    const maxImages = ['For Rent', 'For Sale'].includes(category) ? 5 : 3;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;
        
        const filesToRead = Array.from(files).slice(0, maxImages - imagePreviews.length);
        filesToRead.forEach((file: File) => {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string]);
            reader.readAsDataURL(file);
        });
    };
    
    const removeImage = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!title || !price || !description) {
            alert("Please fill title, price, and description.");
            return;
        }
        onSave({
            title, category, price, description,
            imageUrls: imagePreviews.length > 0 ? imagePreviews : [`https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400`],
            duration: category === 'Professional Service' ? duration : undefined,
            discountInfo: category === 'Professional Service' ? discountInfo : undefined,
            isVerified: false,
        });
    };
    
    const inputClass = "w-full p-2 border rounded-xl text-gray-900 placeholder-gray-400 bg-white text-sm font-bold";

    return (
        <div className="fixed inset-0 bg-black/75 flex justify-center items-center z-[130] p-4" onClick={onCancel}>
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-black text-brand-navy uppercase tracking-tight text-center">Add product / item</h2>
                <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-2 no-scrollbar">
                    <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Title</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="Item Name" className={inputClass}/>
                    </div>
                    <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value as CatalogueCategory)} className={inputClass}>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Price</label>
                        <input value={price} onChange={e => setPrice(e.target.value)} type="text" placeholder="e.g. Ksh 5,000" className={inputClass}/>
                    </div>
                    <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Product Details" rows={3} className={inputClass}/>
                    </div>
                    
                    {category === 'Professional Service' && (
                        <>
                            <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Duration</label>
                                <input value={duration} onChange={e => setDuration(e.target.value)} type="text" placeholder="Duration (e.g., 7 hours total)" className={inputClass}/>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Discount Info</label>
                                <input value={discountInfo} onChange={e => setDiscountInfo(e.target.value)} type="text" placeholder="Discount Info (e.g., 30% off)" className={inputClass}/>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">Images (up to {maxImages})</label>
                        <div className="grid grid-cols-3 gap-2">
                            {imagePreviews.map((src, index) => (
                                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border">
                                    <img src={src} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                    <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">&times;</button>
                                </div>
                            ))}
                            {imagePreviews.length < maxImages && (
                                <button onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                </button>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                    </div>
                </div>
                <div className="flex gap-2 pt-2 border-t">
                    <button onClick={onCancel} className="flex-1 bg-gray-100 font-black py-3 rounded-xl text-gray-400 text-[10px] uppercase tracking-widest">Cancel</button>
                    <button onClick={handleSave} className="flex-1 bg-brand-navy text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest shadow-md">Save Item</button>
                </div>
            </div>
        </div>
    );
};

const ShareCatalogueModal: React.FC<{ catalogueUrl: string; onClose: () => void }> = ({ catalogueUrl, onClose }) => (
    <div className="fixed inset-0 bg-black/75 flex justify-center items-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-xs space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-black text-center text-brand-navy uppercase tracking-tight">Share Your Catalogue</h2>
            <div className="flex justify-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(catalogueUrl)}`} alt="Catalogue QR Code" className="w-40 h-40 rounded-lg mix-blend-multiply"/>
            </div>
            <p className="text-[9px] text-gray-400 text-center font-bold uppercase tracking-wider">Scan this code to view and share your public catalogue page.</p>
            <button onClick={onClose} className="w-full bg-brand-navy text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest">Done</button>
        </div>
    </div>
);

const CatalogueView: React.FC<CatalogueViewProps> = ({ 
    items, onUpdateItems, currentUser, onUpdateUser, isAuthenticated, 
    onAuthClick, onInitiateContact, onBack, viewingProvider 
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isEditingShop, setIsEditingShop] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CatalogueItem | null>(null);
    const [activeFilter, setActiveFilter] = useState<CatalogueCategory | 'All'>('All');
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const activeProvider = viewingProvider || currentUser;
    if (!activeProvider) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <div className="text-center">
                    <p className="text-sm font-bold text-gray-400">Loading catalog...</p>
                </div>
            </div>
        );
    }

    const isOwnerOfActiveProvider = currentUser?.id === activeProvider.id;
    const catalogueUrl = `https://nikosoko.app/catalogue/${activeProvider.id}`;
    
    const handleSaveItem = (item: Omit<CatalogueItem, 'id' | 'providerId'>) => {
        if (!currentUser?.id) return;
        const newItem: CatalogueItem = { id: Date.now().toString(), providerId: currentUser.id, ...item };
        onUpdateItems([...items, newItem]);
        setIsAdding(false);
    };

    const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && currentUser) {
            const reader = new FileReader();
            reader.onloadend = () => onUpdateUser({ ...currentUser, catalogueBannerUrl: reader.result as string });
            reader.readAsDataURL(file);
        }
    };

    const handleSaveShopDetails = (details: ShopDetails) => {
        if (!currentUser) return;
        onUpdateUser({
            ...currentUser,
            shopDetails: details
        });
        setIsEditingShop(false);
    };
    
    const filteredItems = useMemo(() => {
        if (activeFilter === 'All') return items;
        return items.filter(item => item.category === activeFilter);
    }, [items, activeFilter]);
    
    const filterOptions: (CatalogueCategory | 'All')[] = ['All', 'Product', 'Service', 'Professional Service', 'For Rent', 'For Sale'];

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-24 relative overflow-x-hidden max-w-md mx-auto border-x border-gray-100">
            <input type="file" ref={bannerInputRef} onChange={handleBannerChange} accept="image/*" className="hidden" />

            {/* Banner Section */}
            <div className="relative w-full h-44 shadow-sm group">
                <img 
                    src={activeProvider.catalogueBannerUrl || activeProvider.coverImageUrl || 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=800'} 
                    alt="Catalogue Banner" 
                    className="absolute inset-0 w-full h-full object-cover" 
                />
                {isOwnerOfActiveProvider && (
                    <button 
                        onClick={() => bannerInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] uppercase font-black tracking-widest transition-opacity"
                    >
                        Change Banner
                    </button>
                )}
                <header className="absolute top-0 left-0 right-0 pt-4 px-4 flex justify-between items-center text-white z-10">
                    <button onClick={onBack} className="p-2 bg-black/40 text-white rounded-full hover:bg-black transition-colors"><BackIcon /></button>
                    <span className="font-black tracking-widest text-[10px] uppercase bg-black/40 px-3 py-1 rounded-full">{activeProvider.accountType === 'organization' ? 'COURSES' : 'CATALOGUE'}</span>
                    {items.length > 0 ? (
                        <button onClick={() => setIsShareModalOpen(true)} className="p-2 bg-black/40 text-white rounded-full hover:bg-black transition-colors"><ShareIcon /></button>
                    ) : <div className="w-8" />}
                </header>
            </div>

            {/* Shop Details Header Block - REQUIRED */}
            <div className="px-4 -mt-10 relative z-10">
                <div className="bg-white rounded-md border border-gray-100 shadow-xl p-5 space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-brand-gold flex-shrink-0 bg-gray-100 shadow-sm">
                            <img src={activeProvider.shopDetails?.logo || activeProvider.avatarUrl} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-black text-brand-navy truncate uppercase tracking-tight">{activeProvider.shopDetails?.name || activeProvider.name}</h2>
                                {isOwnerOfActiveProvider && (
                                    <button 
                                        onClick={() => setIsEditingShop(true)} 
                                        className="text-[9px] font-black text-brand-navy bg-brand-gold/20 px-2 py-1 rounded-lg hover:bg-brand-gold hover:text-brand-navy transition-colors"
                                    >
                                        Edit Shop
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 font-bold uppercase mt-0.5">{activeProvider.service}</p>
                            <p className="text-[9px] text-gray-400 font-black tracking-widest uppercase mt-0.5">{activeProvider.location}</p>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-3 text-[11px] text-gray-600">
                        <div className="flex items-center gap-2">
                            <span className="text-base">📍</span>
                            <div className="min-w-0">
                                <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest leading-none">Address</p>
                                <p className="font-bold text-gray-800 truncate mt-0.5">{activeProvider.shopDetails?.address || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-base">🕒</span>
                            <div className="min-w-0">
                                <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest leading-none">Hours</p>
                                <p className="font-bold text-gray-800 truncate mt-0.5">{activeProvider.shopDetails?.operatingHours || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-base">💳</span>
                            <div className="min-w-0">
                                <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest leading-none">Payment</p>
                                <p className="font-bold text-gray-800 truncate mt-0.5">{activeProvider.shopDetails?.paymentMode || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-base">🌐</span>
                            <div className="min-w-0">
                                <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest leading-none">Website</p>
                                {activeProvider.shopDetails?.website ? (
                                    <a href={activeProvider.shopDetails.website} target="_blank" rel="noreferrer" className="font-bold text-blue-600 hover:underline truncate block mt-0.5 text-[10px]">{activeProvider.shopDetails.website.replace(/^https?:\/\//, '')}</a>
                                ) : (
                                    <p className="font-bold text-gray-400 mt-0.5 text-[10px]">N/A</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtering Controls */}
            <div className="p-4 mt-2">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {filterOptions.map(filter => (
                        <button 
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`flex-shrink-0 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-full border transition-all ${
                                activeFilter === filter 
                                    ? 'bg-brand-navy text-white border-brand-navy shadow-md' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Item Grid - REQUIRED PRODUCTS BELOW */}
            <main className="px-4 pb-24">
                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {filteredItems.map(item => (
                            <CatalogueCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7s0 4 8 4 8-4 8-4" /></svg>
                        <h3 className="mt-2 text-xs font-black uppercase text-gray-400 tracking-wider">Empty Collection</h3>
                        {isOwnerOfActiveProvider && <p className="mt-1 text-[10px] text-gray-400">Tap the '+' button below to add your first item.</p>}
                    </div>
                )}
            </main>

            {/* Modals & FAB */}
            {isEditingShop && <ShopDetailsModal details={activeProvider.shopDetails} onSave={handleSaveShopDetails} onCancel={() => setIsEditingShop(false)} />}
            {isShareModalOpen && <ShareCatalogueModal catalogueUrl={catalogueUrl} onClose={() => setIsShareModalOpen(false)} />}
            {selectedItem && (
                <CatalogueItemDetailModal 
                    item={selectedItem} 
                    onClose={() => setSelectedItem(null)} 
                    provider={activeProvider} 
                    isAuthenticated={isAuthenticated} 
                    onAuthClick={onAuthClick} 
                    onInitiateContact={onInitiateContact} 
                />
            )}
            {isAdding && <CatalogueFormModal onSave={handleSaveItem} onCancel={() => setIsAdding(false)} />}
            
            {isOwnerOfActiveProvider && (
                <button onClick={() => setIsAdding(true)} className="fixed bottom-6 right-6 bg-brand-navy text-white rounded-full p-4 shadow-xl z-30 hover:bg-black transition-transform active:scale-90">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </button>
            )}
        </div>
    );
};

export default CatalogueView;
