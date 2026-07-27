
import React, { useState, useMemo } from 'react';
import type { Premise, ServiceProvider, UnitKey, CatalogueItem, MenuItem } from '../types';

interface VacancyDetailModalProps {
    vacancy: UnitKey;
    onClose: () => void;
    onInquire: (msg: string) => void;
}

const VacancyDetailModal: React.FC<VacancyDetailModalProps> = ({ vacancy, onClose, onInquire }) => {
    const [message, setMessage] = useState('');
    const [activeImg, setActiveImg] = useState(0);
    const [sent, setSent] = useState(false);

    const handleSend = () => {
        if (!message.trim()) return;
        onInquire(message);
        setSent(true);
        setTimeout(onClose, 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white animate-slide-up overflow-hidden lg:max-w-md lg:mx-auto lg:shadow-2xl">
            {/* Gallery Section */}
            <div className="relative h-2/5 bg-gray-100">
                <div className="flex h-full w-full overflow-x-auto snap-x snap-mandatory no-scrollbar" onScroll={(e) => {
                    const scrollLeft = (e.target as HTMLDivElement).scrollLeft;
                    const width = (e.target as HTMLDivElement).clientWidth;
                    setActiveImg(Math.round(scrollLeft / width));
                }}>
                    {vacancy.images?.map((img, i) => (
                        <img key={i} src={img} className="w-full h-full object-cover flex-shrink-0 snap-center" alt="" />
                    ))}
                    {(!vacancy.images || vacancy.images.length === 0) && (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                           <span className="text-[10px] font-black uppercase tracking-widest">No listing photos</span>
                        </div>
                    )}
                </div>
                
                <button onClick={onClose} className="absolute top-6 left-6 p-2.5 bg-black/20 backdrop-blur-xl rounded-2xl text-white border border-white/10 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {vacancy.images && vacancy.images.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {vacancy.images.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all ${activeImg === i ? 'w-6 bg-brand-gold' : 'w-1.5 bg-white/40'}`}></div>
                        ))}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50 rounded-t-[40px] -mt-10 relative z-10">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-brand-gold/20 text-brand-gold text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">#{vacancy.unitNumber}</span>
                            <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest leading-none">• {vacancy.floor} Floor</span>
                        </div>
                        <h2 className="text-3xl font-black text-brand-navy italic uppercase tracking-tighter leading-tight bg-gradient-to-r from-brand-navy to-brand-navy/60 bg-clip-text text-transparent">
                            {vacancy.configuration}
                        </h2>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-brand-navy tracking-tighter">Ksh {vacancy.rentAmount?.toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Per Month</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col items-center">
                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Area</span>
                        <span className="text-xs font-black text-brand-navy">{vacancy.size} SQFT</span>
                    </div>
                    <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col items-center">
                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Type</span>
                        <span className="text-xs font-black text-brand-navy uppercase truncate">{vacancy.type}</span>
                    </div>
                    <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col items-center">
                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Status</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <span className="text-xs font-black text-brand-navy uppercase">Active</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-brand-navy uppercase tracking-[0.2em] ml-1">The Space</h4>
                    <p className="text-sm text-gray-500 leading-relaxed bg-white p-6 rounded-[32px] border border-gray-100 shadow-inner italic">
                        {vacancy.description || "This premium space offers modern finishes and an ideal layout for professional use or luxury living. Contact management for a physical viewing and lease details."}
                    </p>
                </div>

                {vacancy.amenities && vacancy.amenities.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-brand-navy uppercase tracking-[0.2em] ml-1">Amenities</h4>
                        <div className="flex flex-wrap gap-2">
                            {vacancy.amenities.map((a, i) => (
                                <span key={i} className="px-4 py-2 bg-brand-navy text-white text-[9px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-brand-navy/10">{a}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Inquiry Form */}
                <div className="bg-brand-navy p-8 rounded-[40px] space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="relative">
                        <h4 className="text-brand-gold text-[10px] font-black uppercase tracking-[0.3em] mb-2">Interested?</h4>
                        <p className="text-white font-bold text-lg italic tracking-tight mb-6">Leave a message for the building manager.</p>
                        
                        {sent ? (
                            <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-3xl text-center">
                                <p className="text-green-400 font-black text-sm uppercase tracking-widest">Message Sent! &check;</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <textarea 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="I'm interested in this unit. Can I schedule a viewing?"
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 text-white text-sm outline-none focus:border-brand-gold transition-all h-32 resize-none placeholder-white/20"
                                />
                                <button 
                                    onClick={handleSend}
                                    className="w-full bg-brand-gold text-brand-navy font-black py-4 rounded-[20px] shadow-xl uppercase text-[10px] tracking-widest transition-all"
                                >
                                    Send Inquiry
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface PremisePublicViewProps {
    premise: Premise;
    tenants: ServiceProvider[];
    catalogueItems: CatalogueItem[];
    onBack: () => void;
    onSelectProvider: (provider: ServiceProvider) => void;
    onViewDoor?: (unit: UnitKey, tenant?: ServiceProvider) => void;
}

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.456l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.474 1.039-1.04 3.833 3.855-1.017z" /></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const CheckBadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L9.19 2.5a1 1 0 00-.7.3L6.3 5M12 2l2.81.5a1 1 0 01.7.3l2.19 2.2M6.3 5l-.5 2.81a1 1 0 00.3.7l2.2 2.19M17.7 5l.5 2.81a1 1 0 01-.3.7l-2.2 2.19M8.3 10.7a1 1 0 01-1.3-.1l-1.6-1.6 1.2-1.2 1.6 1.6z" /></svg>;

const PremisePublicView: React.FC<PremisePublicViewProps> = ({ premise, tenants, catalogueItems, onBack, onSelectProvider, onViewDoor }) => {
    const [activeTab, setActiveTab] = useState<'home' | 'directory' | 'vacancies' | 'gallery'>('home');
    const [selectedVacancy, setSelectedVacancy] = useState<UnitKey | null>(null);

    // Indexing Data from Tenants
    const allOffers = useMemo(() => {
        const tenantIds = new Set(tenants.map(t => t.id));
        return catalogueItems.filter(item => tenantIds.has(item.providerId));
    }, [tenants, catalogueItems]);

    const diningHighlights = useMemo(() => {
        const items: { item: MenuItem; tenant: ServiceProvider }[] = [];
        tenants.forEach(t => {
            if (t.category === 'RESTAURANT' || t.menu?.length) {
                t.menu?.forEach(m => items.push({ item: m, tenant: t }));
            }
        });
        // Sort to show items with images first
        return items.sort((a,b) => (b.item.images?.length || 0) - (a.item.images?.length || 0)).slice(0, 4);
    }, [tenants]);

    const featuredTenants = useMemo(() => {
        return [...tenants].sort((a, b) => b.rating - a.rating).slice(0, 6);
    }, [tenants]);

    const topEvents = useMemo(() => {
        // Mocked event aggregation (could be from tenants or global)
        return [
            { id: 'ev1', title: 'Friday Jazz Night', date: 'Fri, 20:00', host: 'Gourmet Bistro', image: 'https://images.unsplash.com/photo-1514525253361-bee8718a300c?q=80&w=400' },
            { id: 'ev2', title: 'Tech Meetup 2024', date: 'Sat, 10:00', host: 'Gizmo Hub', image: 'https://images.unsplash.com/photo-1540575861501-7ad05823c951?q=80&w=400' },
        ];
    }, []);

    const handleViewUnit = (tenant: ServiceProvider) => {
        onViewDoor?.({ 
            id: tenant.id, 
            unitNumber: tenant.unit || '?', 
            floor: tenant.floor || '', 
            type: 'Commercial', 
            status: 'Occupied', 
            configuration: tenant.service,
            size: 'N/A'
        }, tenant);
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            {/* Header / Dynamic Banner */}
            <div className="relative h-[440px] bg-brand-navy overflow-hidden">
                <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full w-full">
                    {[premise.bannerImageUrl, ...(premise.galleryImages || [])].map((img, i) => (
                        <img key={i} src={img} className="w-full h-full object-cover flex-shrink-0 snap-center opacity-80" alt="" />
                    ))}
                </div>
                <div className="absolute inset-0 bg-black/20"></div>
                
                <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
                    <button onClick={onBack} className="p-2.5 bg-white/10 backdrop-blur-xl rounded-2xl text-white hover:bg-white/20 border border-white/20 transition">
                        <BackIcon />
                    </button>
                    {premise.verificationStatus === 'Verified' && (
                        <div className="bg-brand-gold backdrop-blur-md px-3 py-1.5 rounded-xl text-brand-navy text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl">
                            <CheckBadgeIcon />
                            Verified
                        </div>
                    )}
                </div>

                <div className="absolute bottom-10 left-6 right-6 space-y-5">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 bg-white rounded-md shadow-2xl p-1.5 flex-shrink-0 border-2 border-white/20 relative group overflow-hidden">
                            <img src={premise.logoUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200'} className="w-full h-full object-contain group-hover:scale-105 transition-transform" alt="" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter italic leading-[0.9] drop-shadow-lg">{premise.name}</h1>
                            <div className="flex items-center gap-2 text-white/90 mt-2">
                                <MapPinIcon />
                                <p className="text-[9px] font-black uppercase tracking-[0.2em]">{premise.location}</p>
                            </div>
                        </div>
                    </div>

                    {/* Pro CTAs */}
                    <div className="flex gap-2">
                        <button className="flex-1 bg-white/10 backdrop-blur-xl border border-white/10 text-white rounded-xl py-3 flex flex-col items-center justify-center gap-1 hover:bg-white/20 transition-all group">
                            <PhoneIcon />
                            <span className="text-[7px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 italic">Call Office</span>
                        </button>
                        <button className="flex-1 bg-white text-brand-navy rounded-xl py-3 flex flex-col items-center justify-center gap-1 shadow-xl hover:bg-brand-gold transition-all group">
                            <WhatsAppIcon />
                            <span className="text-[7px] font-black uppercase tracking-widest italic">WhatsApp</span>
                        </button>
                        <button className="flex-1 bg-white/10 backdrop-blur-xl border border-white/10 text-white rounded-xl py-3 flex flex-col items-center justify-center gap-1 hover:bg-white/20 transition-all group">
                            <MailIcon />
                            <span className="text-[7px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 italic">Email Us</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Sticky Discovery Navigation */}
            <div className="flex justify-center border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-30 px-6 pt-2 overflow-x-auto no-scrollbar shadow-sm">
                {[
                    { id: 'home', label: premise.type === 'Commercial' ? 'Commercial Hub' : 'The Vibe' },
                    { id: 'directory', label: 'Directory' },
                    { id: 'vacancies', label: `Inventory (${premise.vacancies.filter(v => v.isListed !== false).length})` },
                    { id: 'gallery', label: 'Lifestyle' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-5 pb-4 pt-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative flex-shrink-0 ${activeTab === tab.id ? 'text-brand-navy scale-110' : 'text-gray-300'}`}
                    >
                        {tab.label}
                        {activeTab === tab.id && <div className="absolute bottom-0 left-4 right-4 h-1 bg-brand-gold rounded-t-full shadow-[0_-2px_10px_rgba(6,193,103,0.4)]"></div>}
                    </button>
                ))}
            </div>

            <main className="p-6 max-w-lg mx-auto w-full pb-32 space-y-12 relative">
                
                {activeTab === 'home' && (
                    <div className="space-y-12 animate-fade-in">
                        {/* Commercial Hub - Top Picks Highlight */}
                        {premise.type === 'Commercial' && (
                            <section className="space-y-6">
                                <div className="flex justify-between items-end px-2">
                                    <div>
                                        <h3 className="text-xl font-black text-brand-navy uppercase tracking-tighter italic leading-none">Hub Highlights</h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Tenant Spotlights & Events</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    {topEvents.map(event => (
                                        <div key={event.id} className="relative aspect-[16/9] rounded-[40px] overflow-hidden group shadow-xl">
                                            <img src={event.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                                            <div className="absolute bottom-8 left-8 right-8">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="bg-brand-gold text-brand-navy text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{event.date}</span>
                                                    <span className="text-white/60 text-[8px] font-black uppercase tracking-widest">Hosted by {event.host}</span>
                                                </div>
                                                <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">{event.title}</h4>
                                            </div>
                                            <button className="absolute top-8 right-8 w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-2xl hover:bg-brand-gold hover:text-brand-navy transition-all">
                                                &rarr;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Premise Story */}
                        <section className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold/5 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-125"></div>
                            <h3 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.3em] mb-4">Our Premise Portfolio</h3>
                            <p className="text-sm text-gray-500 leading-relaxed font-medium italic">{premise.about}</p>
                            <div className="flex gap-4 mt-10 overflow-x-auto no-scrollbar">
                                {premise.amenities.map(a => (
                                    <div key={a.name} className="flex flex-col items-center gap-3 flex-shrink-0 group/icon">
                                        <div className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center border border-gray-100 shadow-inner group-hover/icon:bg-brand-gold group-hover/icon:border-brand-gold transition-all duration-300">
                                            <span className="text-xl grayscale group-hover/icon:grayscale-0">💎</span>
                                        </div>
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest group-hover/icon:text-brand-navy">{a.name}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Dining Discovery */}
                        {diningHighlights.length > 0 && (
                            <section className="space-y-6">
                                <div className="flex justify-between items-end px-2">
                                    <div>
                                        <h3 className="text-xl font-black text-brand-navy uppercase tracking-tighter italic leading-none">Fresh Bites</h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Available at the hour</p>
                                    </div>
                                    <button onClick={() => setActiveTab('directory')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Full Menu</button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {diningHighlights.map((h, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => handleViewUnit(h.tenant)}
                                            className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm group transition-all cursor-pointer"
                                        >
                                            <div className="h-32 bg-gray-200 relative">
                                                <img src={h.item.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                                <div className="absolute top-2 left-2 bg-brand-gold/90 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[9px] font-black text-brand-navy shadow-sm">
                                                    Ksh {h.item.price}
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h4 className="font-bold text-brand-navy text-xs truncate uppercase tracking-tight">{h.item.name}</h4>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <span className="text-[8px] text-gray-400 font-black uppercase truncate">{h.tenant.name}</span>
                                                    <div className="w-1 h-1 bg-brand-gold rounded-full"></div>
                                                    <span className="text-[8px] text-brand-gold font-black">UNIT {h.tenant.unit}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Special Offers */}
                        {allOffers.length > 0 && (
                            <section className="space-y-6">
                                <div className="flex justify-between items-end px-2">
                                    <div>
                                        <h3 className="text-xl font-black text-brand-navy uppercase tracking-tighter italic leading-none">Today's Deals</h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Exclusive Premise Perks</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
                                    {allOffers.map(offer => (
                                        <div 
                                            key={offer.id} 
                                            onClick={() => {
                                                const t = tenants.find(t => t.id === offer.providerId);
                                                if (t) handleViewUnit(t);
                                            }}
                                            className="w-48 flex-shrink-0 bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm transition-all cursor-pointer hover:shadow-md"
                                        >
                                            <div className="h-28 bg-gray-200 relative">
                                                <img src={offer.imageUrls[0]} className="w-full h-full object-cover" alt="" />
                                                <div className="absolute bottom-2 right-2 bg-brand-gold text-brand-navy px-3 py-1 rounded-full text-[9px] font-black shadow-lg">
                                                    OFFER
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h4 className="font-bold text-brand-navy text-xs truncate uppercase tracking-tight">{offer.title}</h4>
                                                <p className="text-[10px] font-black text-blue-600 mt-1">{offer.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Top Rated Neighbors */}
                        <section className="space-y-6">
                            <div className="flex justify-between items-end px-2">
                                <div>
                                    <h3 className="text-xl font-black text-brand-navy uppercase tracking-tighter italic leading-none">The Community</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Top-Rated Neighbors</p>
                                </div>
                                <button onClick={() => setActiveTab('directory')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Full Registry</button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {featuredTenants.map(tenant => (
                                    <div 
                                        key={tenant.id} 
                                        onClick={() => handleViewUnit(tenant)}
                                        className="bg-white p-4 rounded-[32px] border border-gray-100 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all cursor-pointer"
                                    >
                                        <div className="relative mb-3">
                                            <img src={tenant.avatarUrl} className="w-16 h-16 rounded-[20px] object-cover border-2 border-gray-50 shadow-inner" alt="" />
                                            <div className="absolute -bottom-2 -right-2 bg-white px-1.5 py-0.5 rounded-lg shadow-md flex items-center gap-0.5">
                                                <StarIcon />
                                                <span className="text-[9px] font-black text-gray-600">{tenant.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <h4 className="font-black text-brand-navy text-[11px] truncate w-full uppercase tracking-tight">{tenant.name}</h4>
                                        <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">UNIT {tenant.unit}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'directory' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="space-y-3">
                            {tenants.map(tenant => (
                                <div 
                                    key={tenant.id} 
                                    className="bg-white rounded-[32px] border border-gray-100 p-5 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                                    onClick={() => handleViewUnit(tenant)}
                                >
                                    <div className="flex items-center gap-5 flex-1 min-w-0">
                                        <div className="w-14 h-14 rounded-[22px] overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0 shadow-inner">
                                            <img src={tenant.avatarUrl} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-black text-brand-navy text-sm truncate uppercase tracking-tight italic">{tenant.name}</h4>
                                                <span className="text-[9px] font-black text-brand-gold px-2 py-0.5 rounded-full border border-brand-gold/20">#{tenant.unit}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate">{tenant.service}</p>
                                                <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded-lg">
                                                    <StarIcon />
                                                    <span className="text-[9px] font-black text-gray-600">{tenant.rating.toFixed(1)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 ml-4">
                                        <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${tenant.isOnline ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                    </div>
                                </div>
                            ))}
                            {tenants.length === 0 && (
                                <div className="py-24 text-center opacity-20">
                                    <p className="font-black text-xs uppercase tracking-[0.4em]">Empty Registry</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'vacancies' && (
                    <div className="space-y-4 animate-fade-in">
                        {premise.vacancies.filter(v => v.isListed !== false).map(v => (
                            <div 
                                key={v.id} 
                                onClick={() => setSelectedVacancy(v)}
                                className="bg-white overflow-hidden rounded-[40px] border border-gray-100 shadow-sm flex flex-col gap-0 group hover:shadow-xl transition-all cursor-pointer"
                            >
                                {v.images && v.images.length > 0 && (
                                    <div className="relative h-64 bg-gray-100">
                                        <img src={v.images[0]} className="w-full h-full object-cover" />
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/20">
                                            <p className="text-[10px] font-black text-brand-navy uppercase tracking-widest">Ksh {v.rentAmount?.toLocaleString()}</p>
                                        </div>
                                        {v.images.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                                                +{v.images.length - 1} Photos
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="p-8 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] mb-2">{v.type} • {v.floor} Floor</p>
                                            <h3 className="text-xl font-black text-brand-navy italic uppercase tracking-tighter leading-none">{v.configuration}</h3>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center font-black shadow-inner">
                                            <span className="text-[6px] text-gray-300">DOOR</span>
                                            <span className="text-lg text-brand-navy italic">{v.unitNumber}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                            <span>{v.size} SQFT</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                            <span>{v.type}</span>
                                        </div>
                                    </div>

                                    {v.description && (
                                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 italic">{v.description}</p>
                                    )}

                                    {v.amenities && v.amenities.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {v.amenities.map((a, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-gray-50 text-gray-400 text-[8px] font-black uppercase tracking-widest rounded-lg border border-gray-100">{a}</span>
                                            ))}
                                        </div>
                                    )}

                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedVacancy(v);
                                        }}
                                        className="w-full bg-brand-navy text-white text-[9px] font-black py-4 rounded-2xl uppercase tracking-[0.2em] shadow-lg transition-all group-hover:bg-brand-gold group-hover:text-brand-navy"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                        {premise.vacancies.filter(v => v.isListed !== false).length === 0 && (
                            <div className="py-24 text-center bg-white rounded-[40px] border border-dashed border-gray-100 opacity-40">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-navy italic">Fully Occupied</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'gallery' && (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in">
                        {[premise.bannerImageUrl, ...(premise.galleryImages || [])].map((img, i) => (
                            <div key={i} className="aspect-[4/3] rounded-[32px] overflow-hidden border border-gray-100 shadow-sm group">
                                <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Vacancy Detail Modal */}
            {selectedVacancy && (
                <VacancyDetailModal 
                    vacancy={selectedVacancy}
                    onClose={() => setSelectedVacancy(null)}
                    onInquire={(msg) => {
                        console.log('Inquiry for unit:', selectedVacancy.unitNumber, 'Message:', msg);
                    }}
                />
            )}
        </div>
    );
};

export default PremisePublicView;
