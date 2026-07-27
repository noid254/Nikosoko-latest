
import React, { useState, useRef } from 'react';
import type { BusinessAssets as BusinessAssetsType, ServiceProvider } from '../types';

interface MerchTemplate {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    logoSize: string;
    logoTop: string;
    logoLeft: string;
}

const MERCH_TEMPLATES: MerchTemplate[] = [
    { id: 'tshirt-white', name: 'T-Shirt', price: 1200, imageUrl: 'https://i.imgur.com/27b1H2g.png', logoSize: 'w-10 h-10', logoTop: 'top-[35%]', logoLeft: 'left-[45%]' },
    { id: 'mug-white', name: 'Coffee Mug', price: 800, imageUrl: 'https://i.imgur.com/kFLT3P5.png', logoSize: 'w-8 h-8', logoTop: 'top-[45%]', logoLeft: 'left-[40%]' },
    { id: 'cap-black', name: 'Baseball Cap', price: 1000, imageUrl: 'https://i.imgur.com/p1v7Lqj.png', logoSize: 'w-6 h-6', logoTop: 'top-[30%]', logoLeft: 'left-[50%]' },
    { id: 'hoodie-gray', name: 'Hoodie', price: 2500, imageUrl: 'https://i.imgur.com/79z9S9E.png', logoSize: 'w-12 h-12', logoTop: 'top-[35%]', logoLeft: 'left-[48%]' },
];

const BrandKitView: React.FC<{
    assets: BusinessAssetsType;
    currentUser: Partial<ServiceProvider> | null;
    onSave: (assets: BusinessAssetsType) => void;
    onBack: () => void;
}> = ({ assets, currentUser, onSave, onBack }) => {
    const [view, setView] = useState<'dashboard' | 'merch'>('dashboard');
    const [name, setName] = useState(assets.name);
    const [tagline, setTagline] = useState(assets.tagline || '');
    const [logo, setLogo] = useState(assets.logo);
    const [address, setAddress] = useState(assets.address);
    const [email, setEmail] = useState(assets.email || '');
    const [phone, setPhone] = useState(assets.phone || '');
    const [about, setAbout] = useState(assets.about || '');
    const [primaryColor, setPrimaryColor] = useState(assets.colors?.primary ?? '#1A2B48');
    
    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        onSave({ 
            name, 
            tagline, 
            address, 
            logo, 
            email, 
            phone, 
            about,
            colors: { primary: primaryColor, secondary: '#F59E0B' } 
        });
        alert("Brand kit updated!");
    };

    const labelClass = "block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1";
    const inputClass = "w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-brand-navy focus:ring-2 focus:ring-brand-gold outline-none transition-all placeholder-gray-300";

    return (
        <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
            <header className="p-4 bg-white shadow-sm flex items-center gap-4 sticky top-0 z-10 border-b border-gray-100">
                <button onClick={onBack} className="p-2 text-gray-400 hover:text-brand-navy">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-xl font-black text-brand-navy uppercase tracking-tight italic">Brand Manager</h1>
            </header>

            <div className="flex bg-white p-1 mx-5 mt-5 rounded-2xl border border-gray-100 shadow-sm">
                {(['dashboard', 'merch'] as const).map(v => (
                    <button 
                        key={v}
                        onClick={() => setView(v)}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${view === v ? 'bg-brand-navy text-white shadow-lg' : 'text-gray-400'}`}
                    >
                        {v === 'dashboard' ? 'Identity' : 'Merch Preview'}
                    </button>
                ))}
            </div>

            <main className="p-5 flex-1 overflow-y-auto no-scrollbar pb-24">
                {view === 'dashboard' && (
                    <div className="bg-white p-6 rounded-[40px] shadow-sm space-y-8 animate-fade-in border border-gray-100">
                        <div>
                            <label className={labelClass}>Company Logo</label>
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shadow-inner">
                                    {logo ? <img src={logo} className="w-full h-full object-contain p-2" alt="Logo" /> : <span className="text-3xl">🏢</span>}
                                </div>
                                <button onClick={() => logoInputRef.current?.click()} className="text-[10px] font-black uppercase tracking-widest bg-gray-100 px-5 py-3 rounded-xl hover:bg-gray-200 transition-colors">Change Image</button>
                                <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const r = new FileReader();
                                        r.onloadend = () => setLogo(r.result as string);
                                        r.readAsDataURL(file);
                                    }
                                }} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className={labelClass}>Business Name</label>
                                <input value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Official business name" />
                            </div>

                            <div>
                                <label className={labelClass}>Tagline</label>
                                <input value={tagline} onChange={e => setTagline(e.target.value)} className={inputClass} placeholder="Company slogan or motto" />
                            </div>

                            <div>
                                <label className={labelClass}>Business Email</label>
                                <input value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="info@company.com" type="email" />
                            </div>

                            <div>
                                <label className={labelClass}>Business Phone</label>
                                <input value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="+254 722 000 000" type="tel" />
                            </div>

                            <div>
                                <label className={labelClass}>Official Address</label>
                                <textarea value={address} onChange={e => setAddress(e.target.value)} className={`${inputClass} leading-relaxed`} placeholder="Main Street, Nairobi" rows={2} />
                            </div>

                            <div>
                                <label className={labelClass}>About Section (Margin Bottom)</label>
                                <textarea value={about} onChange={e => setAbout(e.target.value)} className={`${inputClass} leading-relaxed`} placeholder="Brief company history or description..." rows={3} />
                            </div>

                            <div>
                                <label className={labelClass}>Brand Color</label>
                                <div className="flex gap-3">
                                    <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-14 h-14 rounded-2xl cursor-pointer border-none bg-transparent" />
                                    <input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className={`${inputClass} flex-1 font-mono uppercase`} />
                                </div>
                            </div>
                        </div>

                        <button onClick={handleSave} className="w-full bg-brand-navy text-white font-black py-5 rounded-3xl shadow-2xl text-xs uppercase tracking-[0.2em] active:scale-95 transition-all mt-4 border border-white/10">Save Brand Details</button>
                    </div>
                )}

                {view === 'merch' && (
                    <div className="grid grid-cols-2 gap-5 animate-fade-in">
                        {MERCH_TEMPLATES.map(t => (
                            <div key={t.id} className="bg-white rounded-[32px] p-3 border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                                <div className="aspect-square bg-gray-50 rounded-[24px] flex items-center justify-center p-6 relative overflow-hidden shadow-inner">
                                    <img src={t.imageUrl} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" alt="" />
                                    {logo && (
                                        <div 
                                            className={`absolute ${t.logoSize} pointer-events-none mix-blend-multiply opacity-75 ${t.logoTop} ${t.logoLeft}`} 
                                            style={{ transform: 'translate(-50%, -50%) rotate(-5deg)' }}
                                        >
                                            <img src={logo} className="w-full h-full object-contain" alt="Logo preview" />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 px-2 pb-2">
                                    <h3 className="font-bold text-xs text-brand-navy truncate">{t.name}</h3>
                                    <p className="text-[10px] font-black text-brand-gold mt-1">Ksh {t.price.toLocaleString()}</p>
                                    <div className="flex gap-2 mt-4">
                                        <button className="flex-1 bg-brand-navy text-white text-[9px] font-black py-2.5 rounded-xl uppercase tracking-widest active:scale-95">Order</button>
                                        <button className="bg-gray-100 p-2.5 rounded-xl text-gray-500 hover:bg-gray-200 transition-colors"><span className="text-[10px]">🛒</span></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default BrandKitView;
