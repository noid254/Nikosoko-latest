import React, { useState, useRef } from 'react';
import type { CatalogueItem } from '../types';

interface CreateProductPostViewProps {
    onBack: () => void;
    onSave: (item: Omit<CatalogueItem, 'id' | 'providerId'>) => void;
}

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;

const CreateProductPostView: React.FC<CreateProductPostViewProps> = ({ onBack, onSave }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [serialNumber, setSerialNumber] = useState('');
    const [hasReceipt, setHasReceipt] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const maxImages = 6;
    const totalSteps = 4;

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

    const handleFinalSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!title.trim()) {
            alert("Please enter a service title.");
            return;
        }
        if (!price || Number(price) <= 0) {
            alert("Please enter a valid price amount.");
            return;
        }
        onSave({
            title,
            category: 'Service',
            price: `Ksh ${parseInt(price, 10).toLocaleString()}`,
            description: description || 'Professional service listing',
            imageUrls: imagePreviews.length > 0 ? imagePreviews : ['https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=800'],
            serialNumber: serialNumber || undefined,
            isVerified: hasReceipt,
        });
    };

    const nextStep = () => {
        if (currentStep === 1 && !title.trim()) {
            alert("Please enter a service title.");
            return;
        }
        if (currentStep === 2 && (!price || Number(price) <= 0)) {
            alert("Please enter a valid service rate.");
            return;
        }
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        } else {
            onBack();
        }
    };

    return (
        <div className="w-full max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col font-sans pb-24 border-x border-gray-100 relative">
            {/* Header & Progress Indicator */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-2xs">
                <div className="w-full bg-gray-100 h-1.5 overflow-hidden">
                    <div 
                        className="bg-brand-navy h-full transition-all duration-300 ease-out" 
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                </div>
                <div className="p-3 flex items-center justify-between">
                    <button onClick={prevStep} className="p-2 bg-gray-50 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-1.5 text-xs font-black cursor-pointer">
                        <BackIcon />
                        <span>{currentStep === 1 ? 'Back' : 'Previous'}</span>
                    </button>
                    <div className="text-center">
                        <span className="text-[9.5px] font-black tracking-widest text-amber-600 uppercase">Step {currentStep} of {totalSteps}</span>
                        <h1 className="text-xs font-black text-brand-navy uppercase tracking-tight leading-none mt-0.5">Post Skill Listing</h1>
                    </div>
                    <div className="w-14 flex justify-end">
                        <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                            {Math.round((currentStep / totalSteps) * 100)}%
                        </span>
                    </div>
                </div>

                {/* Step Dots */}
                <div className="flex items-center justify-center gap-1.5 pb-2 border-t border-gray-50 pt-1 px-3">
                    {[1, 2, 3, 4].map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => { if (s <= currentStep) setCurrentStep(s); }}
                            className={`h-2 rounded-full transition-all cursor-pointer ${
                                s === currentStep ? 'w-6 bg-brand-navy' : s < currentStep ? 'w-2 bg-amber-400' : 'w-2 bg-gray-200'
                            }`}
                        />
                    ))}
                </div>
            </header>

            <main className="flex-1 p-4 flex flex-col justify-between space-y-4">
                
                {/* STEP 1: TITLE */}
                {currentStep === 1 && (
                    <div className="space-y-4 animate-fade-in flex-1">
                        <div className="bg-gradient-to-br from-brand-navy to-slate-900 text-white p-4 rounded-2xl shadow-sm">
                            <h2 className="text-xs font-black uppercase text-amber-400">Step 1: Service Title</h2>
                            <p className="text-xs text-gray-300 mt-1 font-medium">What skill or service are you providing to clients?</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3">
                            <label className="text-xs font-black uppercase text-gray-800 block">Service Title *</label>
                            <input 
                                value={title} 
                                onChange={e => setTitle(e.target.value)} 
                                type="text" 
                                placeholder="e.g. Electrical Repair, Maths Lessons, Doorstep Key Cutting" 
                                className="w-full p-3.5 border-2 border-gray-200 focus:border-brand-navy rounded-2xl bg-gray-50 focus:bg-white text-xs font-bold text-gray-900 outline-none transition" 
                                required
                            />
                        </div>
                    </div>
                )}

                {/* STEP 2: PRICING */}
                {currentStep === 2 && (
                    <div className="space-y-4 animate-fade-in flex-1">
                        <div className="bg-gradient-to-br from-brand-navy to-slate-900 text-white p-4 rounded-2xl shadow-sm">
                            <h2 className="text-xs font-black uppercase text-amber-400">Step 2: Pricing & Rate</h2>
                            <p className="text-xs text-gray-300 mt-1 font-medium">How much do you charge for this service?</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3">
                            <label className="text-xs font-black uppercase text-gray-800 block">Service Fee / Rate (Ksh) *</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-black text-sm">Ksh</span>
                                <input 
                                    value={price} 
                                    onChange={e => setPrice(e.target.value)} 
                                    type="number" 
                                    placeholder="500" 
                                    className="w-full py-3.5 pl-14 pr-4 border-2 border-gray-200 focus:border-brand-navy rounded-2xl bg-gray-50 focus:bg-white text-base font-black text-gray-900 outline-none transition" 
                                    required
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: DESCRIPTION & CERTIFICATION */}
                {currentStep === 3 && (
                    <div className="space-y-4 animate-fade-in flex-1">
                        <div className="bg-gradient-to-br from-brand-navy to-slate-900 text-white p-4 rounded-2xl shadow-sm">
                            <h2 className="text-xs font-black uppercase text-amber-400">Step 3: Details & Qualification</h2>
                            <p className="text-xs text-gray-300 mt-1 font-medium">Describe what is included and any relevant certification.</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-4">
                            <div>
                                <label className="text-xs font-black uppercase text-gray-800 mb-1 block">Description</label>
                                <textarea 
                                    value={description} 
                                    onChange={e => setDescription(e.target.value)} 
                                    placeholder="Provide clear details on tools brought, service area, and qualifications..." 
                                    rows={4} 
                                    className="w-full p-3 border-2 border-gray-200 focus:border-brand-navy rounded-2xl bg-gray-50 focus:bg-white text-xs font-medium text-gray-900 outline-none transition resize-none"
                                />
                            </div>

                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                                <label className="text-xs font-bold text-gray-800 block">Skill Certification (Optional)</label>
                                <input 
                                    value={serialNumber} 
                                    onChange={e => setSerialNumber(e.target.value)} 
                                    type="text" 
                                    placeholder="Certificate / Registration Number" 
                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none" 
                                />
                                <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={hasReceipt} 
                                        onChange={e => setHasReceipt(e.target.checked)} 
                                        className="h-4 w-4 rounded text-brand-navy focus:ring-brand-navy" 
                                    />
                                    <span className="text-[11px] text-gray-700 font-semibold">I hold verified skill qualifications for this service</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: PHOTOS & SUBMIT */}
                {currentStep === 4 && (
                    <div className="space-y-4 animate-fade-in flex-1">
                        <div className="bg-gradient-to-br from-brand-navy to-slate-900 text-white p-4 rounded-2xl shadow-sm">
                            <h2 className="text-xs font-black uppercase text-amber-400">Step 4: Service Photos & Save</h2>
                            <p className="text-xs text-gray-300 mt-1 font-medium">Upload work photos to complete your listing.</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3">
                            <label className="text-xs font-black uppercase text-gray-800 block">Work Photos (up to {maxImages})</label>
                            <div className="grid grid-cols-3 gap-2">
                                {imagePreviews.map((src, index) => (
                                    <div key={index} className="relative aspect-square">
                                        <img src={src} className="w-full h-full object-cover rounded-xl border" alt={`preview ${index}`}/>
                                        <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">&times;</button>
                                    </div>
                                ))}
                                {imagePreviews.length < maxImages && (
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer">
                                        <span className="text-2xl">+</span>
                                    </button>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                        </div>
                    </div>
                )}

                {/* Bottom Navigation Footer */}
                <div className="pt-3 border-t border-gray-200 bg-white sticky bottom-0 p-3 -mx-4 -mb-4 rounded-t-2xl shadow-lg flex items-center gap-2">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                        >
                            ← Back
                        </button>
                    )}

                    {currentStep < totalSteps ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="flex-2 bg-brand-navy hover:bg-black text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                            <span>Next Step</span>
                            <span>➔</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => handleFinalSubmit()}
                            className="flex-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                            <span>🚀 Save Service Listing</span>
                        </button>
                    )}
                </div>

            </main>
        </div>
    );
};

export default CreateProductPostView;
