
import React, { useState } from 'react';
import type { UnitKey, ServiceProvider, Premise, CatalogueItem, UnitDetails } from '../types';
import RestaurantMenuModal from './RestaurantMenuModal';

interface DoorProfileProps {
    unit: UnitKey;
    premise: Premise;
    tenant?: ServiceProvider;
    onBack: () => void;
    onContactHost: (type: 'call' | 'whatsapp') => void;
    onBookHost?: (tenant: ServiceProvider) => void;
    isAuthenticated: boolean;
    onAuthClick: () => void;
    onInitiateContact: (provider: ServiceProvider) => boolean;
    catalogueItems?: CatalogueItem[];
    isKeyHolder?: boolean;
    onUpdateDetails?: (details: Partial<UnitDetails>) => void;
}

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.456l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.474 1.039-1.04 3.833 3.855-1.017z" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const BookmarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>;
const MenuBookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const ShoppingBagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const StarIcon = () => <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>;

const DoorProfile: React.FC<DoorProfileProps> = ({ unit, premise, tenant, onBack, onContactHost, onBookHost, isAuthenticated, onAuthClick, onInitiateContact, catalogueItems = [], isKeyHolder, onUpdateDetails }) => {
    const [activeTab, setActiveTab] = useState<'works' | 'qr'>('works');
    const [selectedItem, setSelectedItem] = useState<CatalogueItem | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    const [editStatus, setEditStatus] = useState<UnitDetails['availabilityStatus']>(tenant?.unitDetails?.availabilityStatus || 'Available');
    const [editAbout, setEditAbout] = useState(tenant?.about || '');

    const bannerImage = tenant?.coverImageUrl || premise.bannerImageUrl;
    const works = tenant?.works || [];
    const status = tenant?.unitDetails?.availabilityStatus || 'Available';

    const handleSaveEdits = () => {
        onUpdateDetails?.({
            availabilityStatus: editStatus,
            doorNote: editAbout,
            type: 'Business'
        });
        setIsEditing(false);
    };

    const ctaConfig: Record<string, { label: string; icon: React.ReactNode; action: () => void, primary?: boolean }> = {
        call: { label: 'Call', icon: <PhoneIcon />, action: () => onContactHost('call') },
        whatsapp: { label: 'WhatsApp', icon: <WhatsAppIcon />, action: () => onContactHost('whatsapp'), primary: true },
        book: { 
            label: 'Book', 
            icon: <CalendarIcon />, 
            action: () => {
                if (tenant && onBookHost) {
                    onBookHost(tenant);
                } else {
                    onContactHost('whatsapp');
                }
            }, 
            primary: true 
        },
        menu: { label: 'Menu', icon: <MenuBookIcon />, action: () => setShowMenu(true), primary: true },
    };

    return (
        <div className="w-full max-w-sm mx-auto bg-gray-50 h-screen flex flex-col overflow-hidden font-sans relative">
            {showMenu && tenant && (
                <RestaurantMenuModal 
                    provider={tenant} 
                    onClose={() => setShowMenu(false)} 
                />
            )}

            {/* Header / Banner */}
            <div className="relative flex-shrink-0">
                <div className="h-44 bg-gray-300 overflow-hidden">
                    <img src={bannerImage} alt="Cover" className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                <button onClick={onBack} className="absolute top-4 left-4 bg-black/50 text-white rounded-full p-2 z-10 active:scale-90 transition-transform">
                    <BackIcon />
                </button>
                
                <div className="absolute top-4 right-4 flex gap-2">
                    {isKeyHolder && (
                        <button onClick={() => setIsEditing(!isEditing)} className="bg-white/90 p-2 rounded-full text-brand-navy shadow-lg active:scale-90 transition-transform">
                            <EditIcon />
                        </button>
                    )}
                </div>

                <div className="absolute bottom-4 left-6 right-6">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-brand-gold text-brand-navy text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">UNIT {unit.unitNumber}</span>
                        <div className={`w-2 h-2 rounded-full ${status === 'Available' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></div>
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter truncate">{tenant?.name || `Unit ${unit.unitNumber}`}</h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
                <div className="px-6 pt-6">
                    {isEditing ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Availability</label>
                                    <select 
                                        value={editStatus} 
                                        onChange={e => setEditStatus(e.target.value as any)}
                                        className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-brand-navy border border-gray-100 outline-none"
                                    >
                                        <option value="Available">Open</option>
                                        <option value="Busy">Busy</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Bio</label>
                                    <textarea 
                                        value={editAbout} 
                                        onChange={e => setEditAbout(e.target.value)}
                                        className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-brand-navy border border-gray-100 h-32 resize-none outline-none"
                                        placeholder="Business description..."
                                    />
                                </div>
                                <button 
                                    onClick={handleSaveEdits}
                                    className="w-full bg-brand-navy text-white font-black py-4 rounded-2xl shadow-xl uppercase text-xs tracking-widest active:scale-95 transition-all"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <h2 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-1">{tenant?.service || 'Unit Tenant'}</h2>
                            <p className="text-gray-400 text-xs uppercase tracking-widest">{premise.name}</p>
                        </div>
                    )}
                </div>

                {!isEditing && (
                    <>
                        <div className="mt-6 flex justify-around items-center border-t border-b border-gray-100 py-4 bg-white/50">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <StarIcon />
                                    <span className="font-black text-brand-navy text-sm">{(tenant?.rating || 0).toFixed(1)}</span>
                                </div>
                                <p className="text-[9px] uppercase font-bold text-gray-400 tracking-widest mt-0.5">Rating</p>
                            </div>
                            <div className="text-center">
                                <span className="font-black text-brand-navy text-sm">#{unit.unitNumber}</span>
                                <p className="text-[9px] uppercase font-bold text-gray-400 tracking-widest mt-0.5">Unit</p>
                            </div>
                            <div className="text-center">
                                <span className="font-black text-brand-navy text-sm">{unit.floor}</span>
                                <p className="text-[9px] uppercase font-bold text-gray-400 tracking-widest mt-0.5">Floor</p>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="px-6 pt-6 flex flex-wrap gap-3">
                            {(tenant?.cta || ['call', 'whatsapp']).map(key => {
                                const c = ctaConfig[key];
                                if (!c) return null;
                                return (
                                    <button 
                                        key={key} 
                                        onClick={c.action} 
                                        className={`flex-1 min-w-[120px] font-black py-4 px-4 rounded-2xl transition flex items-center justify-center gap-2 active:scale-95 text-[10px] uppercase tracking-widest ${c.primary ? 'bg-brand-gold text-brand-navy shadow-lg' : 'bg-brand-navy text-white shadow-lg'}`}
                                    >
                                        {c.icon} {c.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="px-6 pt-8 space-y-6">
                            <div>
                                <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-3 ml-1">About</h3>
                                <p className="text-sm text-gray-600 leading-relaxed bg-white p-5 rounded-[28px] shadow-sm border border-gray-50">
                                    {tenant?.about || `Professional business unit operating at ${premise.name}. Contact us for details about our services and offerings.`}
                                </p>
                            </div>

                            <div className="border-b border-gray-100 flex gap-6">
                                <button onClick={() => setActiveTab('works')} className={`pb-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'works' ? 'border-brand-navy text-brand-navy' : 'border-transparent text-gray-400'}`}>Listings</button>
                                <button onClick={() => setActiveTab('qr')} className={`pb-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'qr' ? 'border-brand-navy text-brand-navy' : 'border-transparent text-gray-400'}`}>QR Code</button>
                            </div>

                            <div className="animate-fade-in pb-12">
                                {activeTab === 'works' && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {works.map((w, i) => <img key={i} src={w} className="aspect-square object-cover rounded-xl bg-gray-200" alt="" />)}
                                        {works.length === 0 && (
                                            <div className="col-span-3 py-10 text-center text-gray-300">
                                                <p className="text-[10px] font-black uppercase tracking-widest">No images captured</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {activeTab === 'qr' && (
                                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 flex flex-col items-center justify-center shadow-inner">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PROFILE:${tenant?.id || unit.id}`} className="w-40 h-40 mix-blend-multiply" alt="QR" />
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6">Unit Registry Authentication</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DoorProfile;
