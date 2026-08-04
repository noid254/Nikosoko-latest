
import React, { useState, useMemo, useEffect } from 'react';
import type { ServiceProvider, SpecialBanner, CurrentPage } from '../types';
import ServiceCard from './ServiceCard';
import OrgDetailModal from './OrgDetailModal';

// --- Icons ---
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

const QUICK_ACTIONS = [
    { id: 'boda', label: 'Boda Boda', icon: '🏍️', category: 'TRANSPORT', search: 'boda' },
    { id: 'taxi', label: 'Taxi', icon: '🚕', category: 'TRANSPORT', search: 'taxi' },
    { id: 'delivery', label: 'Delivery', icon: '📦', category: 'TRANSPORT', search: 'delivery' },
];

const serviceFilters = {
    HOME: {
        title: 'Home Services',
        subtitle: 'Plumbers, Electricians, Cleaners & more.',
        bannerUrl: 'https://images.unsplash.com/photo-1581578731117-104f2a863726?q=80&w=800',
        children: ['All', 'Electrician', 'Plumber', 'Cleaner', 'Repair']
    },
    TRANSPORT: {
        title: 'Moving Around',
        subtitle: 'Taxi, Boda Boda, Logistics & Delivery.',
        bannerUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800',
        children: ['All', 'Boda Boda', 'Taxi', 'Courier', 'Movers']
    },
    EDUCATION: {
        title: 'Learn & Grow',
        subtitle: 'Tutors, Trainers, and Institutions.',
        bannerUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800',
        children: ['All', 'Tutors', 'Schools', 'Training']
    },
    HEALTH: {
        title: 'Wellness',
        subtitle: 'Fitness, Medical, and Personal Care.',
        bannerUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800',
        children: ['All', 'Gym', 'Nurse', 'Doctor']
    },
    PROFESSIONAL: {
        title: 'Professional Services',
        subtitle: 'Legal, Tech, Finance & Admin.',
        bannerUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800',
        children: ['All', 'Tech', 'Legal', 'Finance']
    }
};

type ParentCategory = keyof typeof serviceFilters;

interface ServiceMarketplaceProps {
    providers: ServiceProvider[];
    specialBanners: SpecialBanner[];
    onSelectProvider: (provider: ServiceProvider) => void;
    onBack: () => void;
    onMessagesClick: () => void;
    hasNewMessages: boolean;
    onNavigate: (page: CurrentPage) => void;
}

const ServiceMarketplace: React.FC<ServiceMarketplaceProps> = ({ providers, specialBanners, onSelectProvider, onBack, onMessagesClick, hasNewMessages, onNavigate }) => {
    const [selectedOrgModal, setSelectedOrgModal] = useState<{ orgName: string; cert?: any } | null>(null);
    const [activeParent, setActiveParent] = useState<ParentCategory>('HOME');
    const [activeChild, setActiveChild] = useState<string>('All');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    
    const handleParentClick = (parent: ParentCategory) => {
        setActiveParent(parent);
        setActiveChild('All');
    };
    
    const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
        setActiveParent('TRANSPORT');
        setActiveChild('All');
        setSearchTerm(action.search);
        setIsSearchActive(true);
    };
    
    const BellIcon: React.FC<{ hasNotification: boolean }> = ({ hasNotification }) => (
        <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            {hasNewMessages && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></div>}
        </div>
    );

    const categoryKeywords: Record<ParentCategory, string[]> = {
        HOME: ['home', 'house', 'electrician', 'plumber', 'clean', 'repair', 'fix'],
        TRANSPORT: ['transport', 'taxi', 'boda', 'courier', 'move', 'deliver'],
        EDUCATION: ['education', 'school', 'tutor', 'teach', 'train', 'college'],
        HEALTH: ['health', 'doctor', 'nurse', 'gym', 'fitness', 'care'],
        PROFESSIONAL: ['legal', 'law', 'tech', 'web', 'finance', 'admin', 'office']
    };

    const displayedProviders = useMemo(() => {
        let baseProviders = providers.filter(p => 
            (p.accountType === 'individual' || p.category !== 'RESTAURANT') &&
            p.category !== 'PERSONAL' &&
            p.category !== 'RESIDENT' &&
            !p.service.toLowerCase().includes('resident')
        ); 
        
        let parentFiltered = baseProviders.filter(p => {
             const searchString = `${p.service.toLowerCase()} ${p.category.toLowerCase()}`;
             return categoryKeywords[activeParent].some(keyword => searchString.includes(keyword));
        });

        let childFiltered = parentFiltered;
        if (activeChild !== 'All') {
             childFiltered = parentFiltered.filter(p => 
                p.service.toLowerCase().includes(activeChild.toLowerCase().replace(/s$/, '')) || 
                p.category.toLowerCase().includes(activeChild.toLowerCase())
             );
        }

        const filtered = searchTerm
            ? childFiltered.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.service.toLowerCase().includes(searchTerm.toLowerCase())
            ) : childFiltered;

        return filtered.sort((a, b) => a.distanceKm - b.distanceKm);
    }, [providers, activeParent, activeChild, searchTerm]);

    const bannerData = useMemo(() => {
        const matchingAdminBanner = specialBanners.find(banner => banner.targetCategory === activeParent);
        if (matchingAdminBanner) {
             return { type: 'admin', imageUrl: matchingAdminBanner.imageUrl };
        }
        
        const potentialFeatures = displayedProviders.filter(p => p.rating >= 4.5 && p.coverImageUrl);
        if (potentialFeatures.length > 0) {
            const provider = potentialFeatures[currentBannerIndex % potentialFeatures.length];
            return {
                type: 'carousel',
                imageUrl: provider.coverImageUrl,
                title: provider.name,
                subtitle: provider.service,
                providerId: provider.id
            };
        }
        return { type: 'static', ...serviceFilters[activeParent] };
    }, [activeParent, specialBanners, displayedProviders, currentBannerIndex]);
    
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBannerIndex(prev => prev + 1);
        }, 5000);
        return () => clearInterval(timer);
    }, []);
    
    const parentCategories = Object.keys(serviceFilters) as ParentCategory[];
    
    let bannerImageUrl: string;
    let bannerContent: React.ReactNode;
    let currentKey: string | number = activeParent;

    if (bannerData.type === 'admin') {
        bannerImageUrl = bannerData.imageUrl!;
        bannerContent = (
            <>
                <h2 className="text-3xl font-bold font-serif leading-tight">Top Pros</h2>
                <p className="mt-1 opacity-90 text-base">Verified experts ready to help.</p>
            </>
        );
    } else if (bannerData.type === 'carousel') {
        bannerImageUrl = bannerData.imageUrl!;
        currentKey = bannerData.providerId!;
        const provider = providers.find(p => p.id === bannerData.providerId);
        bannerContent = (
            <div onClick={() => provider && onSelectProvider(provider)} className="cursor-pointer">
                 <h1 className="text-3xl font-bold font-serif truncate px-4">{bannerData.title}</h1>
                 <p className="mt-2 text-lg font-bold text-brand-gold">{bannerData.subtitle}</p>
                 <p className="text-[10px] bg-white/20 px-2 py-1 rounded-full inline-block mt-2 backdrop-blur-sm">Top Rated Pro</p>
            </div>
        );
    } else {
        const staticData = bannerData as typeof serviceFilters[ParentCategory] & { type: 'static' };
        bannerImageUrl = staticData.bannerUrl;
        bannerContent = (
             <>
                <h1 className="text-4xl font-bold font-serif">{staticData.title}</h1>
                <p className="mt-2 max-w-sm text-base opacity-90">{staticData.subtitle}</p>
            </>
        );
    }
    
    const filterControls = (
         <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {parentCategories.map(parent => (
                <React.Fragment key={parent}>
                    <button 
                        onClick={() => handleParentClick(parent)}
                        className={`flex-shrink-0 px-5 py-2.5 text-sm font-bold rounded-full transition-all duration-200 shadow-md ${activeParent === parent ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`}
                    >
                        {parent}
                    </button>
                    {activeParent === parent && serviceFilters[parent].children.map(child => (
                        <button
                            key={child}
                            onClick={() => setActiveChild(child)}
                            className={`flex-shrink-0 px-4 py-1.5 text-xs font-semibold rounded-full capitalize transition-colors ${activeChild === child ? 'bg-slate-400 text-white' : 'bg-slate-200 text-slate-600'}`}
                        >
                            {child}
                        </button>
                    ))}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            {isSearchActive && (
                <div className="sticky top-0 z-30 bg-white shadow-md p-4 animate-fade-in-down">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="relative flex-grow">
                             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                <SearchIcon />
                            </div>
                            <input
                                type="text"
                                placeholder="Search for services..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full py-2 pl-10 pr-4 text-sm rounded-full bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                autoFocus
                            />
                        </div>
                        <button onClick={() => { setIsSearchActive(false); setSearchTerm(''); }} className="text-sm font-semibold text-slate-600 flex-shrink-0">
                            Cancel
                        </button>
                    </div>
                    {filterControls}
                </div>
            )}
            
            {!isSearchActive && (
                <>
                    <div className="relative w-full h-[640px] shadow-lg">
                        <img src={bannerImageUrl} key={currentKey} alt="Nikosoko Banner" className="absolute inset-0 w-full h-full object-cover animate-fade-in" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20"></div>
                        
                        <header className="absolute top-0 left-0 right-0 pt-3.5 px-3.5 flex justify-between items-center text-white z-10">
                            <button onClick={onBack} className="p-1 -ml-1 text-white hover:text-white/80 active:scale-90 transition-all"><BackIcon /></button>
                            <span className="font-bold tracking-widest text-sm uppercase">Services Hub</span>
                            <div className="flex items-center gap-4">
                                <button onClick={() => setIsSearchActive(true)}><SearchIcon /></button>
                                <button onClick={onMessagesClick}><BellIcon hasNotification={hasNewMessages} /></button>
                            </div>
                        </header>

                        <div className="relative h-full flex flex-col items-center justify-end text-center text-white p-4 pb-8">
                            <div key={currentKey} className="animate-fade-in">
                               {bannerContent}
                            </div>
                        </div>
                    </div>

                    <div className="px-5 mt-6 mb-4">
                        <div className="flex justify-between gap-3">
                            {QUICK_ACTIONS.map(action => (
                                <button 
                                    key={action.id}
                                    onClick={() => handleQuickAction(action)}
                                    className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-2 hover:bg-brand-gold/10 hover:border-brand-gold transition-all active:scale-95"
                                >
                                    <span className="text-2xl">{action.icon}</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 relative z-10">
                        {filterControls}
                    </div>
                </>
            )}

            <main className="px-4 pb-24">
                 <h2 className="text-center font-serif font-bold text-2xl text-slate-800 my-4">
                    {activeChild === 'All' ? `All ${activeParent}` : `${activeChild}s Nearby`}
                </h2>
                {displayedProviders.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in">
                        {displayedProviders.map(provider => (
                            <ServiceCard 
                                key={provider.id} 
                                provider={provider} 
                                onClick={() => onSelectProvider(provider)} 
                                onViewOrg={(orgName, cert) => setSelectedOrgModal({ orgName, cert })}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-500">
                        <p>No providers found matching your criteria.</p>
                    </div>
                )}
            </main>

            {/* FLOATING BUTTON PROMPTING USERS TO SELL A SERVICE */}
            <div className="fixed bottom-6 right-4 z-40">
                <button
                    onClick={() => onNavigate('sellService')}
                    className="bg-black hover:bg-gray-900 text-white font-black text-xs uppercase tracking-wider px-4 py-3 rounded-full shadow-2xl border border-gray-700 flex items-center gap-2 transition-all active:scale-95 cursor-pointer group"
                    title="List & Sell a Service"
                >
                    <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm leading-none group-hover:scale-110 transition-transform">+</span>
                    <span>SELL A SERVICE</span>
                </button>
            </div>

            <OrgDetailModal
                isOpen={Boolean(selectedOrgModal)}
                onClose={() => setSelectedOrgModal(null)}
                orgName={selectedOrgModal?.orgName}
                fullSkillCert={selectedOrgModal?.cert ? {
                    certificationName: selectedOrgModal.cert.certificationName,
                    issuingSchool: selectedOrgModal.cert.issuingSchool,
                    yearObtained: selectedOrgModal.cert.yearObtained,
                    licenseNumber: selectedOrgModal.cert.licenseNumber
                } : undefined}
            />
        </div>
    );
};

export default ServiceMarketplace;
