
import React, { useState, useRef } from 'react';
import type { Document } from '../types';

interface RegisterAssetViewProps {
    onBack: () => void;
    onSave: (doc: Omit<Document, 'id'>) => void;
}

const ASSET_TYPES = ['Laptop', 'Camera', 'Bicycle', 'Smartphone', 'Other'] as const;

const RegisterAssetView: React.FC<RegisterAssetViewProps> = ({ onBack, onSave }) => {
    const [method, setMethod] = useState<'receipt' | 'manual'>('receipt');
    const [assetType, setAssetType] = useState<typeof ASSET_TYPES[number]>('Laptop');
    const [model, setModel] = useState('');
    const [serial, setSerial] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [price, setPrice] = useState('');
    const [condition, setCondition] = useState<'New' | 'Used'>('New');
    const [sellerContact, setSellerContact] = useState('');
    const [images, setImages] = useState<string[]>([]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImages(prev => [...prev, reader.result as string].slice(0, 4));
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!model || !serial || !sellerContact) {
            alert("Model, Serial Number, and Seller Contact are required.");
            return;
        }

        const newAsset: Omit<Document, 'id'> = {
            type: 'Receipt',
            number: serial,
            issuerName: 'Manual Entry',
            date: new Date().toISOString(),
            amount: parseFloat(price) || 0,
            currency: 'Ksh',
            paymentStatus: 'Paid',
            isAsset: true,
            verificationStatus: 'Pending',
            assetType: assetType as any,
            model,
            registrationNumber: serial,
            purchaseDate,
            purchasePrice: parseFloat(price) || 0,
            condition,
            sellerContact,
            productImages: images,
            items: [{ description: model, quantity: 1, price: parseFloat(price) || 0, serial }]
        };

        onSave(newAsset);
        alert("Registration submitted! App will send a verification SMS link to the seller contact provided.");
    };

    const inputClass = "w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-gold outline-none transition-all placeholder-gray-300";
    const labelClass = "block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1";

    return (
        <div className="bg-gray-100 min-h-screen font-sans flex flex-col">
            <header className="p-4 bg-white shadow-sm flex items-center gap-4 sticky top-0 z-10 border-b border-gray-100">
                <button onClick={onBack} className="text-gray-600 hover:text-gray-900 active:scale-90 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-xl font-black text-brand-navy uppercase tracking-tight">Register Asset</h1>
            </header>

            <main className="p-5 flex-1 overflow-y-auto no-scrollbar pb-24">
                <div className="bg-white p-6 rounded-3xl shadow-sm space-y-8">
                    
                    <div className="flex bg-gray-100 p-1 rounded-2xl">
                        {(['receipt', 'manual'] as const).map(m => (
                            <button 
                                key={m}
                                onClick={() => setMethod(m)}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${method === m ? 'bg-white text-brand-navy shadow-sm' : 'text-gray-400'}`}
                            >
                                {m === 'receipt' ? 'Upload Receipt' : 'Manual Entry'}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <label className={labelClass}>Asset Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                {ASSET_TYPES.map(t => (
                                    <button 
                                        key={t}
                                        type="button"
                                        onClick={() => setAssetType(t)}
                                        className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${assetType === t ? 'bg-brand-navy text-white border-brand-navy shadow-md' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Model Details</label>
                            <input value={model} onChange={e => setModel(e.target.value)} placeholder="e.g. MacBook Pro M3" className={inputClass} />
                        </div>

                        <div>
                            <label className={labelClass}>Serial Number / IMEI</label>
                            <input value={serial} onChange={e => setSerial(e.target.value)} placeholder="Unique ID on the device" className={inputClass} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Date Bought</label>
                                <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Price (Ksh)</label>
                                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className={inputClass} />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Seller WhatsApp/Phone</label>
                            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-gold">
                                <span className="pl-4 text-sm font-bold text-gray-400">+254</span>
                                <input value={sellerContact} onChange={e => setSellerContact(e.target.value)} placeholder="722 000 000" className="w-full p-4 bg-transparent outline-none text-sm font-bold text-brand-navy" />
                            </div>
                            <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest mt-2 ml-1">SMS link will be sent here for verification</p>
                        </div>

                        <div>
                            <label className={labelClass}>Condition</label>
                            <div className="flex gap-2">
                                {(['New', 'Used'] as const).map(c => (
                                    <button 
                                        key={c}
                                        type="button"
                                        onClick={() => setCondition(c)}
                                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${condition === c ? 'bg-brand-navy text-white border-brand-navy' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Device Photos</label>
                            <div className="flex gap-2">
                                {images.map((src, i) => (
                                    <div key={i} className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200">
                                        <img src={src} className="w-full h-full object-cover" alt="" />
                                    </div>
                                ))}
                                {images.length < 4 && (
                                    <button 
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-14 h-14 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-300"
                                    >
                                        +
                                    </button>
                                )}
                            </div>
                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>

                        <button 
                            onClick={handleSubmit}
                            className="w-full bg-brand-navy text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-[0.2em] mt-4"
                        >
                            Register & Notify Seller
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RegisterAssetView;
