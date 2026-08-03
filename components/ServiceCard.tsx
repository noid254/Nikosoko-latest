import React from 'react';
import type { ServiceProvider } from '../types';

const StarIcon: React.FC<{ className?: string }> = ({ className = "w-3 h-3" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
    </svg>
);

const rateSuffix: Record<ServiceProvider['rateType'], string> = {
    'per hour': 'hr', 'per day': 'day', 'per task': 'task', 'per month': 'mo', 'per piece work': 'item', 'per km': 'km', 'per sqm': 'm²', 'per cbm': 'm³', 'per appearance': 'show'
};

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600';

interface ServiceCardProps {
    provider: ServiceProvider;
    onClick: () => void;
    searchTerm?: string;
    onViewSacco?: (provider: ServiceProvider) => void;
    onViewOrg?: (orgName: string, cert?: any) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ provider, onClick, searchTerm, onViewSacco, onViewOrg }) => {
    const rawImages = [provider.coverImageUrl, ...(provider.works || [])].filter(Boolean);
    const images = rawImages.length > 0 ? rawImages : [DEFAULT_FALLBACK_IMAGE];

    const activeQuery = (searchTerm || '').toLowerCase().trim();
    const matchedSkill = provider.skills?.find(s => {
        if (!activeQuery) return false;
        const title = (s.skillTitle || s.name || '').toLowerCase();
        const cat = (s.category || '').toLowerCase();
        const desc = (s.description || '').toLowerCase();
        const cert = (s.certificationName || '').toLowerCase();
        return title.includes(activeQuery) || cat.includes(activeQuery) || desc.includes(activeQuery) || cert.includes(activeQuery);
    }) || provider.skills?.[0];

    const categoryName = matchedSkill?.category || provider.category || provider.service || 'Skilled Service';
    const displayTitle = matchedSkill?.skillTitle || matchedSkill?.name || provider.service;
    const displayDesc = matchedSkill?.description || provider.about || provider.service;
    const displayRate = matchedSkill?.hourlyRate || provider.hourlyRate;
    const displayCurrency = matchedSkill?.currency || provider.currency || 'KES';

    // BADGE PRIORITY RULE: Sacco member is preferred over certified. Never show both.
    const isSaccoConfirmed = provider.isSaccoVerified || provider.saccoMember?.status === 'Confirmed' || provider.saccoMember?.status === 'Approved';
    const saccoName = provider.saccoMember?.saccoName || 'Sacco Member';

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
    };

    return (
        <div 
            onClick={onClick} 
            className="bg-white cursor-pointer w-full group transition-all duration-150 flex flex-col border border-gray-200 hover:border-black rounded-none shadow-2xs hover:shadow-xs active:scale-[0.99] overflow-hidden relative z-0"
        >
            {/* Image / Work Cover */}
            <div className="relative h-28 bg-gray-100 flex-shrink-0 border-b border-gray-200 overflow-hidden z-0">
                <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar w-full h-full">
                    {images.map((img, index) => (
                        <img 
                            key={index}
                            className="w-full h-full object-cover flex-shrink-0 snap-center" 
                            src={img} 
                            alt={`${provider.service} ${index + 1}`} 
                            onError={handleImageError}
                        />
                    ))}
                </div>

                {/* Distance/Proximity Badge: Black background with green text e.g. '0.1km away' */}
                <div className="absolute bottom-1.5 left-1.5 bg-black text-emerald-400 font-mono text-[8.5px] px-1.5 py-0.5 font-bold uppercase tracking-wider z-10 border border-emerald-500/30">
                    {provider.distanceKm}km away
                </div>

                {/* Online Indicator Badge */}
                {Boolean(provider.isOnline) && (
                    <div className="absolute bottom-1.5 right-1.5 bg-black text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 flex items-center gap-1 z-10 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>ONLINE</span>
                    </div>
                )}

                {/* Top Left: Sacco Badge */}
                {isSaccoConfirmed ? (
                    <div className="absolute top-1.5 left-1.5 z-10">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onViewSacco) onViewSacco(provider);
                            }}
                            className="bg-black text-white text-[8px] px-2 py-0.5 font-bold uppercase tracking-wider flex items-center gap-1 border border-white/20 active:scale-95 transition-transform cursor-pointer"
                            title={`Member of ${saccoName}`}
                        >
                            <span>●</span>
                            <span className="truncate max-w-[90px]">{saccoName}</span>
                        </button>
                    </div>
                ) : (
                    /* Category Label Badge on Top Left if no Sacco */
                    <div className="absolute top-1.5 left-1.5 z-10 bg-black/80 backdrop-blur-xs text-white text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 border border-white/20 max-w-[100px] truncate">
                        {categoryName}
                    </div>
                )}

                {/* Top Right: Verification Badge */}
                {(matchedSkill || provider.isVerified) && (
                    <div className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center border border-white shadow-xs">
                        ✓
                    </div>
                )}
            </div>
            
            {/* Content Details */}
            <div className="p-2.5 space-y-1 flex-1 flex flex-col justify-between bg-white relative z-0">
                <div>
                    {/* Category Context Indicator */}
                    <div className="text-[8.5px] font-extrabold uppercase tracking-widest text-gray-400 flex items-center gap-1 mb-0.5">
                        <span className="w-1 h-1 rounded-full bg-gray-400 inline-block"></span>
                        <span className="truncate">{categoryName}</span>
                    </div>

                    <div className="flex justify-between items-start gap-1">
                        <h3 className="font-bold text-xs text-black leading-snug line-clamp-2 break-words flex-1">
                            {displayTitle}
                        </h3>
                        <div className="flex items-center gap-0.5 text-[9px] font-mono font-bold text-black border border-gray-200 px-1 py-0.5 bg-gray-50 flex-shrink-0">
                            <StarIcon className="text-black" />
                            <span>{provider.rating.toFixed(1)}</span>
                        </div>
                    </div>

                    <p className="text-[10px] text-gray-500 font-normal line-clamp-2 break-words leading-tight mt-1">
                        {displayDesc}
                    </p>
                </div>

                <div className="pt-2 mt-auto flex flex-col gap-1 border-t border-dashed border-gray-200">
                    <div className="flex items-center justify-between min-w-0">
                        <span className="text-[10px] font-bold text-black truncate flex items-center gap-1 min-w-0 flex-1">
                            <span className="truncate">{provider.name}</span>
                            {(provider.isVerified || matchedSkill) && (
                                <svg className="w-3.5 h-3.5 text-blue-500 inline-block flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                </svg>
                            )}
                            <span className="text-gray-600 font-mono text-[9px] font-bold flex-shrink-0">⭐ {provider.rating ? provider.rating.toFixed(1) : '5.0'}</span>
                        </span>
                        {displayRate > 0 ? (
                            <p className="text-[10px] font-bold text-black font-mono flex-shrink-0 ml-1">
                                {displayCurrency} {displayRate.toLocaleString()}
                                <span className="text-[8px] text-gray-500 font-normal ml-0.5">/{rateSuffix[provider.rateType] || 'hr'}</span>
                            </p>
                        ) : (
                            <p className="text-[8.5px] font-bold text-black uppercase tracking-wider flex-shrink-0 ml-1">On Request</p>
                        )}
                    </div>
                    {matchedSkill?.issuingSchool ? (
                        <div className="flex items-center gap-1 flex-wrap">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onViewOrg) {
                                        onViewOrg(matchedSkill.issuingSchool || 'Accredited Institution', matchedSkill);
                                    }
                                }}
                                className="text-[8px] font-black uppercase text-black bg-neutral-100 hover:bg-black hover:text-white px-1.5 py-0.2 rounded border border-neutral-300 transition-colors flex items-center gap-0.5 cursor-pointer truncate max-w-full"
                                title={`View ${matchedSkill.issuingSchool} profile & offers`}
                            >
                                <span>🏢 {matchedSkill.issuingSchool}</span>
                                <span>&rarr;</span>
                            </button>
                        </div>
                    ) : (matchedSkill?.certificationName?.toLowerCase().includes('rated') || displayTitle.toLowerCase().includes('bike')) ? (
                        <div className="flex items-center gap-1">
                            <span className="text-[8px] font-bold uppercase text-neutral-600 bg-neutral-100 px-1.5 py-0.2 rounded border border-neutral-200">
                                ⭐ Customer Service Rated
                            </span>
                        </div>
                    ) : null}

                    {isSaccoConfirmed && (
                        <p className="text-[8.5px] text-gray-500 font-medium truncate">
                            a member of{' '}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onViewSacco) onViewSacco(provider);
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
