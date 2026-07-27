import React from 'react';
import type { ServiceProvider } from '../types';

const VerifiedIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
);

const StarIcon: React.FC<{ className?: string }> = ({ className = "w-3 h-3" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
);

const rateSuffix: Record<ServiceProvider['rateType'], string> = {
    'per hour': 'hr', 'per day': 'day', 'per task': 'task', 'per month': 'mo', 'per piece work': 'item', 'per km': 'km', 'per sqm': 'm²', 'per cbm': 'm³', 'per appearance': 'show'
};

interface ServiceCardProps {
    provider: ServiceProvider;
    onClick: () => void;
    searchTerm?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ provider, onClick, searchTerm }) => {
    const images = [provider.coverImageUrl, ...(provider.works || [])].filter(Boolean);

    // Check if any specific skill matches the search query, or pick the primary verified skill
    const activeQuery = (searchTerm || '').toLowerCase().trim();
    const matchedSkill = provider.skills?.find(s => {
        if (!activeQuery) return false;
        const title = (s.skillTitle || s.name || '').toLowerCase();
        const cat = (s.category || '').toLowerCase();
        const desc = (s.description || '').toLowerCase();
        const cert = (s.certificationName || '').toLowerCase();
        return title.includes(activeQuery) || cat.includes(activeQuery) || desc.includes(activeQuery) || cert.includes(activeQuery);
    }) || provider.skills?.[0];

    // Skill title, skill description, and rate override if matched
    const displayTitle = matchedSkill?.skillTitle || matchedSkill?.name || provider.service;
    const displayDesc = matchedSkill?.description || provider.about || provider.service;
    const displayRate = matchedSkill?.hourlyRate || provider.hourlyRate;
    const displayCurrency = matchedSkill?.currency || provider.currency || 'KES';

    return (
        <div 
            onClick={onClick} 
            className="bg-white overflow-hidden cursor-pointer w-full group transition-all duration-200 flex flex-col border border-gray-100 hover:border-gray-300 rounded-2xl shadow-2xs hover:shadow-sm active:scale-[0.98]"
        >
            <div className="relative h-24 bg-gray-100 flex-shrink-0">
                <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar w-full h-full">
                    {images.map((img, index) => (
                        <img 
                            key={index}
                            className="w-full h-full object-cover flex-shrink-0 snap-center" 
                            src={img} 
                            alt={`${provider.service} ${index + 1}`} 
                        />
                    ))}
                </div>

                {provider.isVerified && (
                    <div className="absolute top-1.5 right-1.5 bg-blue-500 text-white rounded-full p-0.5 shadow-xs z-10 pointer-events-none flex items-center justify-center">
                        <VerifiedIcon className="w-3 h-3 text-white" />
                    </div>
                )}
                
                <div className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-xs text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold tracking-wider uppercase z-10">
                    {provider.distanceKm}km
                </div>

                {matchedSkill && (
                    <div className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black tracking-wider uppercase z-10 shadow-xs">
                        ⚡ Certified
                    </div>
                )}
            </div>
            
            <div className="p-2 space-y-1 flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-1">
                    <h3 className="font-bold text-xs text-gray-900 truncate leading-snug flex-1">
                        {displayTitle}
                    </h3>
                    <div className="flex items-center gap-0.5 text-[9px] bg-amber-50 text-amber-800 px-1 py-0.5 rounded-md font-extrabold border border-amber-200/60 flex-shrink-0">
                        <StarIcon className="text-amber-500 fill-amber-500" />
                        <span>{provider.rating.toFixed(1)}</span>
                    </div>
                </div>

                {/* Specific Skill Description / Bio snippet */}
                <p className="text-[9px] text-gray-500 font-normal line-clamp-2 leading-tight">
                    {displayDesc}
                </p>

                <div className="pt-1 mt-auto flex items-center justify-between border-t border-gray-100/80">
                    <span className="text-[9px] font-medium text-gray-400 truncate">{provider.name}</span>
                    {displayRate > 0 ? (
                        <p className="text-[10px] font-black text-gray-900">
                            <span className="text-emerald-600 font-extrabold">{displayCurrency}</span> {displayRate.toLocaleString()}
                            <span className="text-[8px] font-medium text-gray-400 ml-0.5">/{rateSuffix[provider.rateType] || 'hr'}</span>
                        </p>
                    ) : (
                        <p className="text-[8.5px] font-extrabold text-emerald-600 uppercase tracking-wider">On Request</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;