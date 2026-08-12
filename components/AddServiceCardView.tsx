import React, { useState, useRef, useMemo } from 'react';
import type { ServiceProvider, Document, CurrentPage } from '../types';

interface AddServiceCardViewProps {
    onBack: () => void;
    onSave: (
        profileData: Omit<ServiceProvider, 'id' | 'name' | 'phone' | 'avatarUrl' | 'whatsapp' | 'flagCount' | 'views' | 'coverImageUrl' | 'isVerified' | 'cta' | 'linkedAssetId'>, 
        name: string,
        avatar: string | null,
        referralCode: string,
        cta: ServiceProvider['cta'],
        linkedAssetId: string | undefined,
    ) => void;
    categories: string[];
    currentUser: Partial<ServiceProvider> | null;
    myAssets: Document[];
    onNavigate: (page: CurrentPage) => void;
}

const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const UserGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const AcademicCapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>;

const FormInput: React.FC<{
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    isTextarea?: boolean;
    readOnly?: boolean;
    maxLength?: number;
}> = ({ label, value, onChange, isTextarea = false, readOnly = false, placeholder, maxLength }) => {
    return (
        <div className="relative border-b border-gray-200 py-3">
            <div className="flex justify-between items-center mb-1">
                <label className="block text-xs text-gray-400 font-medium">{label}</label>
                {maxLength && <span className="text-[10px] font-bold text-gray-300">{value.length}/{maxLength}</span>}
            </div>
            {isTextarea ? (
                 <textarea
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    maxLength={maxLength}
                    className="w-full text-base text-gray-900 bg-transparent focus:outline-none resize-none placeholder-gray-300"
                    rows={4}
                    placeholder={placeholder}
                />
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    className="w-full text-base text-gray-900 bg-transparent focus:outline-none placeholder-gray-300"
                />
            )}
        </div>
    );
};

type AccountTypeOption = {
    id: string;
    label: string;
    icon: React.ReactNode;
    type: 'individual' | 'organization';
    nameLabel: string;
    serviceLabel: string;
};

const ACCOUNT_TYPES: AccountTypeOption[] = [
    { id: 'professional', label: 'Professional', icon: <UserIcon />, type: 'individual', nameLabel: 'Your Full Name', serviceLabel: 'Your Profession / Service' },
    { id: 'business', label: 'Business', icon: <BuildingIcon />, type: 'organization', nameLabel: 'Business Name', serviceLabel: 'Business Type / Service' },
    { id: 'organization', label: 'Organization / Sacco', icon: <UserGroupIcon />, type: 'organization', nameLabel: 'Organization Name', serviceLabel: 'Organization Type' },
    { id: 'institution', label: 'Institution', icon: <AcademicCapIcon />, type: 'organization', nameLabel: 'Institution Name', serviceLabel: 'Institution Type' },
];

const AddServiceCardView: React.FC<AddServiceCardViewProps> = ({ onBack, onSave, categories, currentUser, myAssets, onNavigate }) => {
    const [selectedType, setSelectedType] = useState<AccountTypeOption | null>(null);
    
    // Form State
    const [name, setName] = useState(currentUser?.name || '');
    const [phone, setPhone] = useState(currentUser?.phone || '');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [service, setService] = useState('');
    const [charge, setCharge] = useState('');
    const [rateType, setRateType] = useState<ServiceProvider['rateType']>('per hour');
    const [location, setLocation] = useState('');
    const [about, setAbout] = useState('');
    const [category, setCategory] = useState(categories[0] || 'TRANSPORT');
    const [customCategory, setCustomCategory] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [ctas, setCtas] = useState<ServiceProvider['cta']>([]);
    const [linkedAssetId, setLinkedAssetId] = useState<string>('');
    const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
    const [idImage, setIdImage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const portfolioInputRef = useRef<HTMLInputElement>(null);
    const idInputRef = useRef<HTMLInputElement>(null);

    const TRANSPORT_CATEGORIES = ['TRANSPORT', 'Movers', 'Courier', 'Boda Boda', 'Taxi'];
    const requiresAsset = useMemo(() => TRANSPORT_CATEGORIES.some(c => service.toLowerCase().includes(c.toLowerCase())), [service]);

    const handleImageUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePortfolioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            Array.from(files).forEach((file: File) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPortfolioImages(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleIdUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setIdImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCtaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        const ctaValue = value as ServiceProvider['cta'][number];
        
        setCtas(prev => {
            if (checked) {
                if (prev.length < 2) {
                    return [...prev, ctaValue];
                }
                return prev; 
            } else {
                return prev.filter(c => c !== ctaValue);
            }
        });
    }

    const handleSubmit = () => {
        if (!selectedType) return;

        const finalCategory = category === 'other' ? customCategory : category;

        if (!name || !service || !phone || !charge || !location || !about || !finalCategory) {
            alert("Please fill in all fields including your Phone Number to create your listing.");
            return;
        }
        if (ctas.length === 0) {
            alert("Please select at least one Call to Action button.");
            return;
        }
        if (requiresAsset && !linkedAssetId) {
            alert("This service requires you to link a registered asset. Please select one from the list.");
            return;
        }
        const hourlyRate = parseInt(charge, 10) || 0;
        const profileData = {
            service,
            phone: phone.trim(),
            location,
            rating: 0, 
            distanceKm: Math.round(Math.random() * 5 * 10)/10, 
            hourlyRate,
            rateType,
            currency: 'Ksh',
            about: about.slice(0, 280),
            works: portfolioImages, 
            category: finalCategory,
            isOnline: true,
            accountType: selectedType.type,
        };
        onSave(profileData, name, avatarPreview, referralCode, ctas, linkedAssetId || undefined);
    };

    const ctaOptions: {value: ServiceProvider['cta'][number], label: string}[] = [
        {value: 'call', label: 'Call'},
        {value: 'whatsapp', label: 'WhatsApp'},
        {value: 'book', label: 'Book'},
    ];

    if (!selectedType) {
        return (
            <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
                <header className="p-4 flex items-center justify-between bg-white shadow-sm sticky top-0 z-10">
                    <button onClick={onBack} className="text-sm font-semibold text-gray-600 bg-gray-200 px-3 py-1 rounded-lg">Exit</button>
                    <h1 className="text-lg font-bold text-brand-navy">Select Account Type</h1>
                    <div className="w-8"></div>
                </header>
                <main className="p-6 flex-1 flex flex-col justify-center max-w-sm mx-auto w-full space-y-4">
                    <p className="text-center text-gray-500 mb-2">Choose the profile that best describes you.</p>
                    {ACCOUNT_TYPES.map(type => (
                        <button
                            key={type.id}
                            onClick={() => setSelectedType(type)}
                            className="bg-white p-5 rounded-2xl shadow-sm border-2 border-transparent hover:border-brand-gold hover:shadow-md transition-all flex items-center text-left gap-4"
                        >
                            <div className="bg-blue-50 text-brand-navy p-3 rounded-full">
                                {type.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">{type.label}</h3>
                                <p className="text-xs text-gray-500 mt-1">For {type.type === 'individual' ? 'individuals' : 'organizations'}</p>
                            </div>
                        </button>
                    ))}
                </main>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
            <header className="p-4 bg-white shadow-sm sticky top-0 z-10 flex items-center justify-between">
                <button onClick={() => setSelectedType(null)} className="text-gray-600 font-semibold text-sm">
                    &larr; Back
                </button>
                <h1 className="text-lg font-bold text-gray-800">Create {selectedType.label} Profile</h1>
                <div className="w-8"></div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 max-w-lg mx-auto w-full">
                <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
                    
                    <div className="flex flex-col items-center">
                        <div onClick={handleImageUploadClick} className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden relative group">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs text-gray-400 font-bold text-center p-2">Upload Photo/Logo</span>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>

                    <FormInput label={selectedType.nameLabel} value={name} onChange={e => setName(e.target.value)} />
                    <FormInput label="Phone Number (Mobile / M-Pesa) *" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 0712345678 or 254712345678" />
                    <FormInput label={selectedType.serviceLabel} value={service} onChange={e => setService(e.target.value)} placeholder="e.g. Electrician, Bakery, Sacco..." />
                    
                    <div>
                        <label className="block text-xs text-gray-400 font-medium mb-1">Category</label>
                        <select 
                            value={category} 
                            onChange={e => setCategory(e.target.value)}
                            className="w-full text-base text-gray-900 bg-transparent focus:outline-none border-b border-gray-200 py-3"
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            <option value="other">Other (Specify)</option>
                        </select>
                        {category === 'other' && (
                            <input 
                                type="text" 
                                value={customCategory} 
                                onChange={e => setCustomCategory(e.target.value)} 
                                placeholder="Enter Category"
                                className="w-full text-base text-gray-900 bg-transparent focus:outline-none border-b border-gray-200 py-3 mt-2 placeholder-gray-300"
                            />
                        )}
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <FormInput label="Charge / Price (Ksh)" value={charge} onChange={e => setCharge(e.target.value)} placeholder="0" />
                        </div>
                        <div className="w-1/3 pt-1">
                            <label className="block text-xs text-gray-400 font-medium mb-1">Per</label>
                            <select 
                                value={rateType} 
                                onChange={e => setRateType(e.target.value as ServiceProvider['rateType'])}
                                className="w-full text-base text-gray-900 bg-transparent focus:outline-none border-b border-gray-200 py-3"
                            >
                                <option value="per hour">Hour</option>
                                <option value="per day">Day</option>
                                <option value="per task">Task</option>
                                <option value="per month">Month</option>
                                <option value="per piece work">Piece</option>
                                <option value="per km">Km</option>
                            </select>
                        </div>
                    </div>

                    <FormInput label="Location / Base" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Westlands, Nairobi" />
                    
                    <FormInput 
                        label="About (Bio)" 
                        value={about} 
                        onChange={e => setAbout(e.target.value.slice(0, 280))} 
                        placeholder="Describe your experience and services..." 
                        isTextarea 
                        maxLength={280}
                    />

                    <div>
                        <label className="block text-xs text-gray-400 font-medium mb-2">Portfolio / Work Images</label>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {portfolioImages.map((src, i) => (
                                <div key={i} className="relative flex-shrink-0 w-20 h-20">
                                    <img src={src} className="w-full h-full object-cover rounded-lg" />
                                    <button onClick={() => setPortfolioImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">&times;</button>
                                </div>
                            ))}
                            <button onClick={() => portfolioInputRef.current?.click()} className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xl font-bold flex-shrink-0 hover:bg-gray-50 transition">+</button>
                        </div>
                        <input type="file" ref={portfolioInputRef} multiple onChange={handlePortfolioChange} accept="image/*" capture="environment" className="hidden" />
                    </div>

                    {requiresAsset && (
                        <div>
                            <label className="block text-xs text-gray-400 font-medium mb-2">Link Registered Vehicle</label>
                            {myAssets.length > 0 ? (
                                <select 
                                    value={linkedAssetId} 
                                    onChange={e => setLinkedAssetId(e.target.value)}
                                    className="w-full text-base text-gray-900 bg-white border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                                >
                                    <option value="">-- Select Asset --</option>
                                    {myAssets.map(asset => (
                                        <option key={asset.id} value={asset.id}>
                                            {asset.registrationNumber} - {asset.model}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">
                                    No registered vehicles found. Please register your vehicle in your profile settings.
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs text-gray-400 font-medium mb-2">Action Buttons (Select up to 2)</label>
                        <div className="grid grid-cols-2 gap-2">
                            {ctaOptions.map(option => (
                                <label key={option.value} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${ctas.includes(option.value) ? 'border-brand-navy bg-blue-50' : 'border-gray-200'}`}>
                                    <input 
                                        type="checkbox" 
                                        value={option.value} 
                                        checked={ctas.includes(option.value)}
                                        onChange={handleCtaChange}
                                        disabled={!ctas.includes(option.value) && ctas.length >= 2}
                                        className="text-brand-navy focus:ring-brand-gold mr-2"
                                    />
                                    <span className="text-sm font-medium text-gray-800">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <FormInput label="Referral Code (Optional)" value={referralCode} onChange={e => setReferralCode(e.target.value)} placeholder="Enter code if you have one" />

                    <div className="border-t pt-4">
                        <label className="block text-xs text-gray-400 font-medium mb-2">Upload ID / Business Permit (For Verification)</label>
                        <div className="flex items-center gap-4">
                            <button onClick={() => idInputRef.current?.click()} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300">Choose File</button>
                            <span className="text-xs text-gray-500">{idImage ? 'File Selected' : 'No file chosen'}</span>
                            <input type="file" ref={idInputRef} onChange={handleIdUpload} className="hidden" accept="image/*" capture="environment" />
                        </div>
                    </div>

                    <button 
                        onClick={handleSubmit} 
                        className="w-full bg-brand-navy text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 transition active:scale-95 mt-4"
                    >
                        Create Profile
                    </button>
                </div>
            </main>
        </div>
    );
};

export default AddServiceCardView;