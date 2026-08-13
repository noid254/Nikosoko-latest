import React from 'react';
import type { ServiceProvider } from '../types';
import { normalizeSkills } from '../utils/skills';

const StarIcon: React.FC<{ className?: string }> = ({ className = "w-3 h-3" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
    </svg>
);

const rateSuffix: Record<ServiceProvider['rateType'], string> = {
    'per hour': 'hr', 'per day': 'day', 'per task': 'task', 'per month': 'mo', 'per piece work': 'item', 'per km': 'km', 'per sqm': 'm²', 'per cbm': 'm³', 'per appearance': 'show'
};

const DEFAULT_FALLBACK_SERVICE_IMAGE = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600';
const DEFAULT_FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400';

export interface ServiceCardProps {
    provider: ServiceProvider;
    onClick: () => void;
    searchTerm?: string;
    onViewSacco?: (provider: ServiceProvider) => void;
    onViewOrg?: (orgName: string, cert?: any) => void;
    /**
     * 'professional' = Professional Profile thumbnail:
     * - Shows profile image of the professional
     * - Profession / Qualification in BOLD
     * - Real name in small letters (where category was)
     * 
     * 'service' = Service Listing thumbnail:
     * - Shows image of the service offered
     * - Name of the service is BOLD
     * - Name of the provider is in small letters
     */
    cardType?: 'professional' | 'service';
    serviceTitle?: string;
    serviceImage?: string;
    servicePrice?: string;
    serviceDescription?: string;
    serviceCategory?: string;
    isItemVerified?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
    provider, 
    onClick, 
    searchTerm, 
    onViewSacco, 
    onViewOrg,
    cardType = 'professional',
    serviceTitle,
    serviceImage,
    servicePrice,
    serviceDescription,
    serviceCategory,
    isItemVerified
}) => {
    const activeQuery = (searchTerm || '').toLowerCase().trim();
    const normalizedSkills = normalizeSkills(provider?.skills);
    const matchedSkill = normalizedSkills.find(s => {
        if (!activeQuery) return false;
        const title = (s.skillTitle || s.name || '').toLowerCase();
        const cat = (s.category || '').toLowerCase();
        const desc = (s.description || '').toLowerCase();
        const cert = (s.certificationName || '').toLowerCase();
        return title.includes(activeQuery) || cat.includes(activeQuery) || desc.includes(activeQuery) || cert.includes(activeQuery);
    }) || normalizedSkills[0];

    // Verification check: Blue if verified, Gray if unverified
    const isVerified = Boolean(
        provider?.isVerified || 
        provider?.idVerificationStatus === 'Verified' || 
        matchedSkill?.isVerified ||
        isItemVerified
    );

    // SACCO Membership
    const isSaccoConfirmed = Boolean(provider?.isSaccoVerified || provider?.saccoMember?.status === 'Confirmed' || provider?.saccoMember?.status === 'Approved');
    const saccoName = provider?.saccoMember?.saccoName || 'Sacco Member';

    // Distance display: e.g. "4 Km away"
    const distanceDisplay = provider?.distanceKm ? `${provider.distanceKm} Km away` : '4 Km away';

    // Real name formatted
    const realName = provider?.name ? provider.name.toLowerCase() : 'artisan';

    // Image logic depending on card type
    const isProfessionalProfile = cardType === 'professional';

    // Professional profile picture vs Service image
    const professionalImage = provider?.avatarUrl || provider?.selfieUrl || DEFAULT_FALLBACK_AVATAR;
    const rawServiceImages = [serviceImage, provider?.coverImageUrl, ...(provider?.works || [])].filter(Boolean) as string[];
    const serviceOfferedImage = rawServiceImages.length > 0 ? rawServiceImages[0] : DEFAULT_FALLBACK_SERVICE_IMAGE;

    const displayImage = isProfessionalProfile ? professionalImage : serviceOfferedImage;

    // Titles & details based on thumbnail type
    const displayProfession = matchedSkill?.certificationName || matchedSkill?.skillTitle || provider?.service || 'Professional Artisan';
    const displayServiceTitle = serviceTitle || matchedSkill?.skillTitle || provider?.service || 'Skilled Service';
    const displayDesc = serviceDescription || matchedSkill?.description || provider?.about || provider?.service || '';
    const displayRate = matchedSkill?.hourlyRate || provider?.hourlyRate || 0;
    const displayCurrency = matchedSkill?.currency || provider?.currency || 'KES';
    const displayCategory = serviceCategory || matchedSkill?.category || provider?.category || 'Trade Service';

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = isProfessionalProfile ? DEFAULT_FALLBACK_AVATAR : DEFAULT_FALLBACK_SERVICE_IMAGE;
    };

    return (
        <div 
            onClick={onClick} 
            className="bg-white cursor-pointer w-full group transition-all duration-150 flex flex-col border border-gray-200 hover:border-black rounded-none shadow-2xs hover:shadow-xs active:scale-[0.99] overflow-hidden relative z-0"
        >
            {/* THUMBNAIL PICTURE & OVERLAY BADGES */}
            <div className="relative h-28 bg-gray-100 flex-shrink-0 border-b border-gray-200 overflow-hidden z-0">
                <img 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                    src={displayImage} 
                    alt={isProfessionalProfile ? `${provider?.name} Profile` : displayServiceTitle} 
                    onError={handleImageError}
                />

                {/* DISTANCE BADGE (e.g. 4 Km away) */}
                <div className="absolute bottom-1.5 left-1.5 bg-black text-emerald-400 font-mono text-[8.5px] px-1.5 py-0.5 font-bold uppercase tracking-wider z-10 border border-emerald-500/30">
                    {distanceDisplay}
                </div>

                {/* ONLINE INDICATOR BADGE */}
                {Boolean(provider?.isOnline) && (
                    <div className="absolute bottom-1.5 right-1.5 bg-black text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 flex items-center gap-1 z-10 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>ONLINE</span>
                    </div>
                )}

                {/* TOP LEFT: SACCO BADGE */}
                {isSaccoConfirmed && (
                    <div className="absolute top-1.5 left-1.5 z-10">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onViewSacco && provider) onViewSacco(provider);
                            }}
                            className="bg-black text-white text-[8px] px-2 py-0.5 font-bold uppercase tracking-wider flex items-center gap-1 border border-white/20 active:scale-95 transition-transform cursor-pointer"
                            title={`Member of ${saccoName}`}
                        >
                            <span>●</span>
                            <span className="truncate max-w-[85px]">{saccoName}</span>
                        </button>
                    </div>
                )}

                {/* TOP RIGHT: CHECK MARK (BLUE OR GRAY) */}
                <div className="absolute top-1.5 right-1.5 z-10">
                    {isVerified ? (
                        <div 
                            className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center border border-white shadow-xs"
                            title="Verified / Accredited"
                        >
                            ✓
                        </div>
                    ) : (
                        <div 
                            className="w-5 h-5 rounded-full bg-gray-400 text-white font-black text-xs flex items-center justify-center border border-white shadow-xs"
                            title="Unverified / Pending"
                        >
                            ✓
                        </div>
                    )}
                </div>
            </div>
            
            {/* CONTENT DETAILS & HIERARCHY */}
            <div className="p-2.5 space-y-1 flex-1 flex flex-col justify-between bg-white relative z-0">
                <div>
                    {/* WHERE CARD CATEGORY WAS: REAL NAME IN SMALL DETAILS (e.g. mwangi kinyua) */}
                    <div className="flex items-center justify-between gap-1 mb-0.5 min-w-0">
                        <div className="text-[10px] font-normal text-gray-500 lowercase tracking-tight truncate flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-gray-400 inline-block shrink-0"></span>
                            <span className="truncate font-medium">{realName}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-[9px] text-gray-400 uppercase tracking-widest truncate">{displayCategory}</span>
                        </div>
                    </div>

                    {/* MAIN TITLE & RATING SCORE */}
                    <div className="flex justify-between items-start gap-1">
                        {/* TYPE 1 (Professional Profile): Profession/Qualification in BOLD */}
                        {/* TYPE 2 (Service Listing): Service Title in BOLD */}
                        <h3 className="font-bold text-xs text-black leading-snug line-clamp-2 break-words flex-1">
                            {isProfessionalProfile ? displayProfession : displayServiceTitle}
                        </h3>

                        <div className="flex items-center gap-0.5 text-[9px] font-mono font-bold text-black border border-gray-200 px-1 py-0.5 bg-gray-50 flex-shrink-0">
                            <StarIcon className="text-black" />
                            <span>{provider?.rating ? provider.rating.toFixed(1) : '5.0'}</span>
                        </div>
                    </div>

                    {/* QUALIFICATION / SUBTITLE / DESCRIPTION */}
                    <p className="text-[10px] text-gray-500 font-normal line-clamp-2 break-words leading-tight mt-1">
                        {displayDesc}
                    </p>
                </div>

                {/* BOTTOM METRICS / QUALIFICATION / PRICING */}
                <div className="pt-2 mt-auto flex flex-col gap-1 border-t border-dashed border-gray-200">
                    <div className="flex items-center justify-between min-w-0">
                        {/* Qualification badge / institution */}
                        <div className="flex items-center gap-1 min-w-0 flex-1 truncate">
                            {matchedSkill?.issuingSchool ? (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onViewOrg) {
                                            onViewOrg(matchedSkill.issuingSchool || 'Accredited Institution', matchedSkill);
                                        }
                                    }}
                                    className="text-[8px] font-black uppercase text-black bg-neutral-100 hover:bg-black hover:text-white px-1.5 py-0.2 rounded border border-neutral-300 transition-colors flex items-center gap-0.5 cursor-pointer truncate max-w-full"
                                    title={`View ${matchedSkill.issuingSchool} profile`}
                                >
                                    <span>🏢 {matchedSkill.issuingSchool}</span>
                                </button>
                            ) : (
                                <span className="text-[8.5px] font-medium text-gray-600 truncate">
                                    {provider?.location || 'Nairobi County'}
                                </span>
                            )}
                        </div>

                        {/* Price / Rate display */}
                        {servicePrice ? (
                            <span className="text-[10px] font-bold text-black font-mono flex-shrink-0 ml-1">
                                {servicePrice}
                            </span>
                        ) : displayRate > 0 ? (
                            <p className="text-[10px] font-bold text-black font-mono flex-shrink-0 ml-1">
                                {displayCurrency} {(displayRate || 0).toLocaleString()}
                                <span className="text-[8px] text-gray-500 font-normal ml-0.5">
                                    /{rateSuffix[provider?.rateType || 'per day'] || 'day'}
                                </span>
                            </p>
                        ) : (
                            <p className="text-[8.5px] font-bold text-black uppercase tracking-wider flex-shrink-0 ml-1">
                                On Request
                            </p>
                        )}
                    </div>

                    {/* Sacco affiliation line */}
                    {isSaccoConfirmed && (
                        <p className="text-[8.5px] text-gray-500 font-medium truncate">
                            a member of{' '}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onViewSacco && provider) onViewSacco(provider);
                                }}
                                className="font-bold text-black underline hover:bg-black hover:text-white px-0.5 transition-colors cursor-pointer"
                                title={`View ${saccoName} profile`}
                            >
                                {saccoName}
                            </button>
                            {' '}sacco
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;
