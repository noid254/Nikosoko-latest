import React, { useState, useMemo } from 'react';
import type { ServiceProvider, CatalogueItem, CurrentPage, SpecialBanner, AppBrandingConfig, Coordinates } from '../types';
import { normalizeSkills } from '../utils/skills';
import { recalculateProvidersDistances, findNearestEstate } from '../utils/geoLocations';
import ServiceCard from './ServiceCard';
import CatalogueItemDetailModal from './CatalogueItemDetailModal';
import OrgDetailModal from './OrgDetailModal';

const MenuIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4 text-white' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const SearchIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4 text-gray-400' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PinIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
  </svg>
);

const UserIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.5-1.632z" />
  </svg>
);

const WrenchIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.164-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26" />
  </svg>
);

const BellIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4 text-white' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

interface NikoSokoProps {
    providers: ServiceProvider[];
    catalogueItems?: CatalogueItem[];
    specialBanners?: SpecialBanner[];
    brandingConfig?: AppBrandingConfig;
    onSelectProvider: (p: ServiceProvider) => void;
    searchTerm: string;
    setSearchTerm: (t: string) => void;
    onBack: () => void;
    onMessagesClick: () => void;
    hasNewMessages: boolean;
    onNavigate: (p: CurrentPage) => void;
    currentUser: ServiceProvider | null;
    guestCoords?: Coordinates;
    onViewSacco?: (p: ServiceProvider) => void;
    isAuthenticated?: boolean;
    onAuthClick?: () => void;
    onInitiateContact?: (provider: ServiceProvider) => boolean;
    onBookProvider?: (provider: ServiceProvider) => void;
}

interface HighlightCategory {
    id: string;
    title: string;
    keyword: string;
    icon: string;
}

const HIGHLIGHT_CATEGORIES: HighlightCategory[] = [
    { id: 'boda', title: 'Boda', keyword: 'boda', icon: '🛵' },
    { id: 'taxi', title: 'Taxi', keyword: 'taxi', icon: '🚕' },
    { id: 'electrician', title: 'Electrician', keyword: 'electric', icon: '⚡' },
    { id: 'plumber', title: 'Plumber', keyword: 'plumb', icon: '🚰' },
    { id: 'refills', title: 'Gas & Water', keyword: 'refill', icon: '💧' },
    { id: 'tv', title: 'TV Mounting', keyword: 'tv', icon: '📺' },
    { id: 'braiding', title: 'Braiding', keyword: 'braid', icon: '💇‍♀️' },
    { id: 'cleaner', title: 'Cleaning', keyword: 'clean', icon: '🧹' },
    { id: 'mechanic', title: 'Mechanic & Tech', keyword: 'repair', icon: '🧰' },
    { id: 'courier', title: 'Delivery', keyword: 'deliver', icon: '📦' },
    { id: 'solar', title: 'Solar', keyword: 'solar', icon: '☀️' },
    { id: 'tutoring', title: 'Tutoring', keyword: 'tutor', icon: '📚' }
];

const NikoSoko: React.FC<NikoSokoProps> = ({ 
    providers, catalogueItems = [], specialBanners = [], brandingConfig, onSelectProvider, searchTerm, setSearchTerm, onBack, onMessagesClick,
    hasNewMessages, onNavigate, currentUser, guestCoords, onViewSacco, isAuthenticated = false, onAuthClick, onInitiateContact, onBookProvider
}) => {
    const [activeTab, setActiveTab] = useState<'pros' | 'services'>('pros');
    const [localSearch, setLocalSearch] = useState(searchTerm || '');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedCatalogueItem, setSelectedCatalogueItem] = useState<CatalogueItem | null>(null);
    const [selectedOrgModal, setSelectedOrgModal] = useState<{ orgName: string; cert?: any } | null>(null);

    // Location and Distance Sync State (syncs with user profile or default)
    const [userHubLocation, setUserHubLocation] = useState<string>(
        currentUser?.location || 'Ruaka, Kiambu County'
    );
    const [userHubCoords, setUserHubCoords] = useState<Coordinates | undefined>(undefined);

    // Sync when current user location updates
    React.useEffect(() => {
        if (currentUser?.location) {
            setUserHubLocation(currentUser.location);
        }
    }, [currentUser?.location]);

    React.useEffect(() => {
        const lat = typeof currentUser?.latitude === 'number' ? currentUser.latitude : guestCoords?.lat;
        const lng = typeof currentUser?.longitude === 'number' ? currentUser.longitude : guestCoords?.lng;
        if (typeof lat === 'number' && typeof lng === 'number') {
            setUserHubCoords({ lat, lng });
            const nearest = findNearestEstate(lat, lng);
            setUserHubLocation(nearest.displayName);
        }
    }, [currentUser?.latitude, currentUser?.longitude, guestCoords?.lat, guestCoords?.lng]);

    // Dynamically recalculate distances for all providers based on the user's active location
    const providersWithDistances = useMemo(() => {
        return recalculateProvidersDistances(providers, userHubLocation, userHubCoords);
    }, [providers, userHubLocation, userHubCoords]);

    const handleCategoryClick = (cat: HighlightCategory) => {
        if (selectedCategory === cat.id) {
            setSelectedCategory(null);
            setLocalSearch('');
            setSearchTerm('');
        } else {
            setSelectedCategory(cat.id);
            setLocalSearch(cat.title);
            setSearchTerm(cat.keyword);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalSearch(val);
        setSearchTerm(val);
        if (!val) {
            setSelectedCategory(null);
        }
    };

    // Filtered nearby professionals with dynamically recalculated distances
    const filteredAndSortedProviders = useMemo(() => {
        let result = [...providersWithDistances].filter(p => p.category !== 'PERSONAL' && !p.premiseId);
        const activeQuery = (searchTerm || localSearch).toLowerCase().trim();

        if (activeQuery) {
            result = result.filter(p => {
                const nameMatch = p.name.toLowerCase().includes(activeQuery);
                const serviceMatch = p.service.toLowerCase().includes(activeQuery);
                const locationMatch = p.location.toLowerCase().includes(activeQuery);
                const aboutMatch = (p.about || '').toLowerCase().includes(activeQuery);
                const categoryMatch = (p.category || '').toLowerCase().includes(activeQuery);
                const skillMatch = normalizeSkills(p.skills).some(s => 
                    (s.skillTitle || s.name || '').toLowerCase().includes(activeQuery) ||
                    (s.category || '').toLowerCase().includes(activeQuery) ||
                    (s.description || '').toLowerCase().includes(activeQuery)
                );
                return nameMatch || serviceMatch || locationMatch || aboutMatch || categoryMatch || skillMatch;
            });
        }
        
        return result.sort((a, b) => {
            const aSacco = a.isSaccoVerified || a.saccoMember?.status === 'Confirmed' ? 1 : 0;
            const bSacco = b.isSaccoVerified || b.saccoMember?.status === 'Confirmed' ? 1 : 0;
            if (bSacco !== aSacco) return bSacco - aSacco;
            return a.distanceKm - b.distanceKm;
        });
    }, [providersWithDistances, searchTerm, localSearch]);

    // Filtered service listings (catalogue items - strictly services offered by professionals)
    const filteredAndSortedServices = useMemo(() => {
        let result = catalogueItems.filter(item => item.category !== 'Product');
        const activeQuery = (searchTerm || localSearch).toLowerCase().trim();

        if (activeQuery) {
            result = result.filter(item => {
                const provider = providers.find(p => p.id === item.providerId);
                const titleMatch = item.title.toLowerCase().includes(activeQuery);
                const categoryMatch = (item.category || '').toLowerCase().includes(activeQuery);
                const descMatch = (item.description || '').toLowerCase().includes(activeQuery);
                const priceMatch = (item.price || '').toLowerCase().includes(activeQuery);
                const providerMatch = provider ? (
                    provider.name.toLowerCase().includes(activeQuery) ||
                    provider.location.toLowerCase().includes(activeQuery) ||
                    provider.service.toLowerCase().includes(activeQuery)
                ) : false;

                return titleMatch || categoryMatch || descMatch || priceMatch || providerMatch;
            });
        }

        return result;
    }, [catalogueItems, providers, searchTerm, localSearch]);

    const activeItemProvider = selectedCatalogueItem 
        ? providers.find(p => p.id === selectedCatalogueItem.providerId) || null 
        : null;

    // DYNAMIC TARGETED HEADER HERO BANNER ENGINE
    const targetedHeaderBanner = useMemo(() => {
        if (!specialBanners || specialBanners.length === 0) return null;

        const candidates = specialBanners.filter(banner => {
            // 1. Date range filter
            if (banner.startDate && new Date(banner.startDate).getTime() > Date.now()) return false;
            if (banner.endDate && new Date(banner.endDate).getTime() < Date.now()) return false;

            // 2. User Role Segment Filter
            if (banner.targetRole && banner.targetRole !== 'all') {
                if (banner.targetRole === 'guest' && currentUser) return false;
                if (banner.targetRole === 'provider' && (!currentUser || currentUser.role !== 'Provider')) return false;
                if (banner.targetRole === 'client' && (!currentUser || currentUser.role !== 'Member')) return false;
            }

            // 3. Location / Area Targeting Filter
            if (banner.targetLocation && banner.targetLocation.trim() !== '') {
                const locTarget = banner.targetLocation.toLowerCase().trim();
                const userLoc = (currentUser?.location || '').toLowerCase();
                const searchLoc = (localSearch || '').toLowerCase();
                const selCategory = (selectedCategory || '').toLowerCase();

                const matchesUserLoc = userLoc.includes(locTarget) || locTarget.includes(userLoc);
                const matchesSearchLoc = searchLoc.includes(locTarget);
                const matchesCategoryLoc = selCategory.includes(locTarget);

                if (!matchesUserLoc && !matchesSearchLoc && !matchesCategoryLoc && locTarget !== 'all') {
                    return false;
                }
            }

            // 4. Profession / Category Targeting Filter
            if (banner.targetCategory && banner.targetCategory.trim() !== '') {
                const catTarget = banner.targetCategory.toLowerCase().trim();
                const userProf = ((currentUser as any)?.profession || currentUser?.service || currentUser?.category || '').toLowerCase();
                const activeCat = (selectedCategory || '').toLowerCase();
                const searchTxt = (localSearch || '').toLowerCase();

                const matchesUserProf = userProf.includes(catTarget) || catTarget.includes(userProf);
                const matchesSelectedCat = activeCat.includes(catTarget) || catTarget.includes(activeCat);
                const matchesSearchTxt = searchTxt.includes(catTarget);

                if (!matchesUserProf && !matchesSelectedCat && !matchesSearchTxt && catTarget !== 'all') {
                    return false;
                }
            }

            // 5. Min Rating Filter
            if (banner.minRating && banner.minRating > 0) {
                const userRating = currentUser?.rating || 0;
                if (userRating < banner.minRating) return false;
            }

            // 6. Member Tenure / Time of Joining Filter
            if (banner.targetJoiningTenure && banner.targetJoiningTenure !== 'all') {
                const joinedAt = (currentUser as any)?.createdAt ? new Date((currentUser as any).createdAt).getTime() : Date.now();
                const daysSinceJoining = (Date.now() - joinedAt) / (1000 * 60 * 60 * 24);

                if (banner.targetJoiningTenure === 'new_members' && daysSinceJoining > 30 && currentUser) {
                    return false;
                }
                if (banner.targetJoiningTenure === 'tenured' && daysSinceJoining <= 30) {
                    return false;
                }
            }

            // 7. Verified Profile Filter
            if (banner.isVerifiedTarget !== undefined) {
                if (banner.isVerifiedTarget && !currentUser?.isVerified) return false;
                if (!banner.isVerifiedTarget && currentUser?.isVerified) return false;
            }

            return true;
        });

        if (candidates.length === 0) return null;

        // Sort candidates by priority descending
        candidates.sort((a, b) => (b.priority || 1) - (a.priority || 1));
        return candidates[0];
    }, [specialBanners, currentUser, selectedCategory, localSearch]);

    const handleBannerClick = (banner: SpecialBanner) => {
        if (banner.actionUrl) {
            if (banner.actionUrl.startsWith('http')) {
                window.open(banner.actionUrl, '_blank');
            } else if (banner.actionUrl.startsWith('/')) {
                const route = banner.actionUrl.replace('/', '') as CurrentPage;
                onNavigate(route);
            } else {
                setLocalSearch(banner.actionUrl);
            }
        } else if (banner.targetCategory) {
            setSelectedCategory(banner.targetCategory);
        } else if (banner.targetLocation) {
            setLocalSearch(banner.targetLocation);
        }
    };

    const [isChangingLocation, setIsChangingLocation] = useState(false);
    const [customLocInput, setCustomLocInput] = useState('');

    const POPULAR_LOCATIONS = [
        'Ruaka, Kiambu',
        'Nairobi CBD',
        'Kasarani, Nairobi',
        'Westlands, Nairobi',
        'Kilimani, Nairobi',
        'Industrial Area, Nairobi',
        'Roysambu, Nairobi',
        'Karen, Nairobi',
        'Thika Town'
    ];

    const handleSelectLocation = (loc: string) => {
        setUserHubLocation(loc);
        setIsChangingLocation(false);
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white min-h-screen font-sans pb-20 relative border-x border-gray-200">
            {/* STICKY TOP BAR - hamburger, location pin (between icons, single line), bell */}
            <header className="bg-black text-white px-3 py-2.5 flex items-center justify-between gap-2 sticky top-0 z-30">
                <button
                    onClick={onBack}
                    aria-label="Open Menu"
                    className="p-1.5 text-white hover:text-gray-300 transition-colors flex items-center justify-center rounded-lg hover:bg-white/10 cursor-pointer shrink-0"
                >
                    <MenuIcon className="h-5 w-5 text-white" />
                </button>

                <button
                    onClick={() => setIsChangingLocation(!isChangingLocation)}
                    className="flex items-center gap-1 min-w-0 px-2.5 py-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                    <PinIcon className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="text-xs font-bold truncate max-w-[130px]">{userHubLocation}</span>
                    <ChevronDownIcon className={`h-3 w-3 text-white/50 shrink-0 transition-transform duration-200 ${isChangingLocation ? 'rotate-180' : ''}`} />
                </button>

                {/* Notification Bell Button */}
                {(() => {
                    const isUnread = hasNewMessages || Boolean(currentUser && !currentUser.isProfileCompleted);
                    return (
                        <button
                            onClick={onMessagesClick}
                            aria-label="Notifications"
                            className="relative p-1.5 text-white hover:text-gray-300 transition-colors flex items-center justify-center rounded-lg hover:bg-white/10 cursor-pointer shrink-0"
                        >
                            <BellIcon className="h-5 w-5 text-white" />
                            {isUnread && <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
                        </button>
                    );
                })()}
            </header>

            {/* Quick Location Switcher Dropdown */}
            {isChangingLocation && (
                <div className="bg-white border-b border-gray-200 px-3 py-2.5 space-y-2">
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Select your location to see accurate travel distances:</p>
                    <div className="flex flex-wrap gap-1.5">
                        {POPULAR_LOCATIONS.map(loc => (
                            <button
                                key={loc}
                                onClick={() => handleSelectLocation(loc)}
                                className={`px-2 py-1 text-[10px] font-bold rounded border transition-all cursor-pointer ${
                                    userHubLocation.toLowerCase().includes(loc.split(',')[0].toLowerCase())
                                        ? 'bg-amber-500 text-black border-amber-600 font-black'
                                        : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                                }`}
                            >
                                {loc}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-1.5 pt-1">
                        <input
                            type="text"
                            placeholder="Or enter specific estate (e.g. Kasarani, Karen)..."
                            value={customLocInput}
                            onChange={(e) => setCustomLocInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && customLocInput.trim()) {
                                    handleSelectLocation(customLocInput.trim());
                                    setCustomLocInput('');
                                }
                            }}
                            className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-xs text-black placeholder-gray-400 outline-none focus:border-black"
                        />
                        <button
                            onClick={() => {
                                if (customLocInput.trim()) {
                                    handleSelectLocation(customLocInput.trim());
                                    setCustomLocInput('');
                                }
                            }}
                            className="px-3 py-1 bg-black text-white text-[10.5px] font-bold uppercase rounded cursor-pointer"
                        >
                            Set
                        </button>
                    </div>
                </div>
            )}

            {/* HERO BANNER - branded wordmark on black, search bar overlapping the bottom edge */}
            {/* min-h matches the SideMenu black header (min-h-[160px]) so the two black
                blocks drop to the same depth; the slack lands under the wordmark. */}
            <div className="relative bg-brand-navy px-6 pt-6 pb-8 min-h-[160px]">
                {/* Source artwork is a square 1408x1408 file with a lot of black
                    padding around the wordmark; crop to just that band via
                    object-cover so the visible logo actually fills the width. */}
                <div
                    className="w-[65%] mx-auto aspect-[9/2] overflow-hidden cursor-pointer"
                    onClick={() => { setLocalSearch(''); setSearchTerm(''); setSelectedCategory(null); }}
                >
                    <img
                        src="https://i.imgur.com/YzrNOe1.jpeg"
                        alt="NikoSoko - Nearby, Skilled and Ready"
                        className="w-full h-full object-cover object-center select-none"
                    />
                </div>
                <div className="absolute left-6 right-6 -bottom-5">
                    <div className="bg-white border border-gray-200 shadow-lg rounded-xl flex items-center px-3 py-2 transition-colors focus-within:border-black">
                        <SearchIcon />
                        <input
                            className="w-full bg-transparent outline-none text-xs text-black placeholder-gray-500 font-medium ml-2 h-7"
                            placeholder="Search electrician, boda, TV mount, water, gas..."
                            value={localSearch}
                            onChange={handleSearchChange}
                        />
                        {localSearch && (
                            <button
                                onClick={() => {
                                    setLocalSearch('');
                                    setSearchTerm('');
                                    setSelectedCategory(null);
                                }}
                                aria-label="Clear search"
                                className="text-gray-400 hover:text-black p-1 -mr-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
                            >
                                <CloseIcon className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* QUICK FILTERS - MINIMAL MONOCHROME PILLS WITH SCROLL AFFORDANCE */}
            {/* pt-7 clears the search bar card overlapping down from the hero above */}
            <div className="px-3 pt-7 pb-2 bg-white">
                <div className="relative flex items-center">
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pr-8 py-0.5 w-full scroll-smooth">
                        {HIGHLIGHT_CATEGORIES.map(cat => {
                            const isSelected = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat)}
                                    className={`px-3 py-1.5 border rounded-full text-[10.5px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap active:scale-95 cursor-pointer ${
                                        isSelected
                                            ? 'bg-black text-white border-black shadow-sm'
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="text-sm leading-none">{cat.icon}</span>
                                    <span>{cat.title}</span>
                                </button>
                            );
                        })}
                    </div>
                    {/* Right Fade Gradient Scroll Indicator */}
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10" />
                </div>
            </div>

            {/* PROMO BANNER - TOP PROVIDERS SPOTLIGHT */}
            {brandingConfig?.heroBannerUrl && (
                <div className="px-3 pt-3">
                    <div className="relative rounded-2xl overflow-hidden shadow-md h-36">
                        <img src={brandingConfig.heroBannerUrl} alt="NikoSoko - Top providers near you" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                        <div className="relative z-10 h-full flex flex-col justify-center px-4 max-w-[70%]">
                            <h3 className="text-white font-black text-base leading-tight">Top Pros Near You</h3>
                            <p className="text-white/90 text-[11px] font-medium mt-1 leading-snug">Discover the highest-rated verified professionals in your area</p>
                            <button onClick={() => setActiveTab("pros")} className="mt-2.5 self-start bg-white text-black text-[10.5px] font-black uppercase tracking-wide px-3.5 py-1.5 rounded-full active:scale-95 transition-transform">Explore Now</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT HEADER WITH FULL-WIDTH TOGGLE SWITCH */}
            <main className="px-3 pt-4">
                {/* HEADER TITLE, FULL-WIDTH TOGGLE SWITCH & SUBTITLE */}
                <div className="pb-4 border-b border-gray-200 mb-4">
                    {/* SEGMENTED TOGGLE WITH ICONS & COUNTS */}
                    <div className="flex w-full border border-black rounded-xl p-1 bg-white gap-1">
                        <button
                            onClick={() => setActiveTab('pros')}
                            className={`flex-1 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                activeTab === 'pros'
                                    ? 'bg-black text-white'
                                    : 'text-black hover:bg-gray-100'
                            }`}
                            title="Browse verified local professionals"
                        >
                            <UserIcon className="h-3.5 w-3.5" />
                            <span>Pros</span>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                                activeTab === 'pros' ? 'bg-white/20 text-white' : 'bg-gray-100 text-black'
                            }`}>
                                {filteredAndSortedProviders.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('services')}
                            className={`flex-1 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                activeTab === 'services'
                                    ? 'bg-black text-white'
                                    : 'text-black hover:bg-gray-100'
                            }`}
                            title="Browse fixed-price services & catalog items"
                        >
                            <WrenchIcon className="h-3.5 w-3.5" />
                            <span>Services</span>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                                activeTab === 'services' ? 'bg-white/20 text-white' : 'bg-gray-100 text-black'
                            }`}>
                                {filteredAndSortedServices.length}
                            </span>
                        </button>
                    </div>

                    {/* HELPER SUBTITLE */}
                    <p className="text-[11px] text-gray-500 font-medium mt-2.5 px-0.5">
                        {activeTab === 'pros'
                            ? 'Verified profiles and skilled experts near you'
                            : 'Fixed-price packages from local providers'}
                    </p>
                </div>

                {/* TAB CONTENTS */}
                {activeTab === 'pros' ? (
                    /* NEARBY PROS GRID */
                    <div>
                        <div className="grid grid-cols-2 gap-2.5">
                            {filteredAndSortedProviders.map(provider => (
                                <ServiceCard 
                                    key={provider.id} 
                                    provider={provider} 
                                    cardType="professional"
                                    searchTerm={localSearch || searchTerm}
                                    onClick={() => onSelectProvider(provider)} 
                                    onViewSacco={onViewSacco}
                                    onViewOrg={(orgName, cert) => setSelectedOrgModal({ orgName, cert })}
                                />
                            ))}
                        </div>

                        {filteredAndSortedProviders.length === 0 && (
                            <div className="py-12 text-center text-gray-500 border border-dashed border-gray-300 p-4 mt-2">
                                <p className="font-bold text-xs text-black uppercase tracking-wider">No professionals found</p>
                                <p className="text-[10px] text-gray-500 mt-1">Try another search keyword or clear filters.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* SERVICE LISTINGS GRID - LISTINGS MADE BY PROFESSIONALS */
                    <div>
                        <div className="grid grid-cols-2 gap-2.5">
                            {filteredAndSortedServices.map((item, idx) => {
                                const provider = providersWithDistances.find(p => p.id === item.providerId);
                                const photo = item.imageUrls?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=400';

                                return (
                                    <ServiceCard 
                                        key={item.id ? `item_${item.id}_${idx}` : `item_${idx}`}
                                        provider={provider || {
                                            id: item.providerId || `p_${idx}`,
                                            name: 'Artisan Specialist',
                                            phone: '',
                                            service: item.title,
                                            avatarUrl: photo,
                                            coverImageUrl: photo,
                                            rating: 5.0,
                                            distanceKm: 4,
                                            hourlyRate: 0,
                                            rateType: 'per day',
                                            currency: 'KES',
                                            isVerified: Boolean(item.isVerified),
                                            about: item.description,
                                            works: item.imageUrls || [],
                                            category: item.category || 'Trade Service',
                                            location: 'Nairobi',
                                            isOnline: false,
                                            accountType: 'individual',
                                            flagCount: 0,
                                            views: 10,
                                            cta: ['call', 'chat']
                                        }}
                                        cardType="service"
                                        serviceTitle={item.title}
                                        serviceImage={photo}
                                        servicePrice={item.price}
                                        serviceDescription={item.description}
                                        serviceCategory={item.category}
                                        isItemVerified={item.isVerified}
                                        onClick={() => setSelectedCatalogueItem(item)} 
                                        onViewSacco={onViewSacco}
                                        onViewOrg={(orgName, cert) => setSelectedOrgModal({ orgName, cert })}
                                    />
                                );
                            })}
                        </div>

                        {filteredAndSortedServices.length === 0 && (
                            <div className="py-12 text-center text-gray-500 border border-dashed border-gray-300 p-4 mt-2">
                                <p className="font-bold text-xs text-black uppercase tracking-wider">No service listings found</p>
                                <p className="text-[10px] text-gray-500 mt-1">Try another search keyword or switch to Pros tab.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* FLOATING BUTTON PROMPTING USERS TO SELL A SERVICE */}
            <div className="fixed bottom-6 right-4 z-40">
                <button
                    onClick={() => {
                        if (!isAuthenticated) {
                            if (onAuthClick) onAuthClick();
                        } else {
                            onNavigate('sellService');
                        }
                    }}
                    className="bg-black hover:bg-gray-900 text-white font-black text-xs uppercase tracking-wider px-4 py-3 rounded-full shadow-2xl border border-gray-700 flex items-center gap-2 transition-all active:scale-95 cursor-pointer group"
                    title="List & Sell a Service on NikoSoko"
                >
                    <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                        <PlusIcon className="h-3 w-3" />
                    </span>
                    <span>Sell a Service</span>
                </button>
            </div>

            {/* SERVICE ITEM DETAIL MODAL */}
            {selectedCatalogueItem && (
                <CatalogueItemDetailModal
                    item={selectedCatalogueItem}
                    onClose={() => setSelectedCatalogueItem(null)}
                    provider={activeItemProvider}
                    isAuthenticated={isAuthenticated}
                    onAuthClick={onAuthClick || (() => {})}
                    onInitiateContact={onInitiateContact || (() => true)}
                    onViewProfile={(p) => { setSelectedCatalogueItem(null); onSelectProvider(p); }}
                />
            )}

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

export default NikoSoko;
