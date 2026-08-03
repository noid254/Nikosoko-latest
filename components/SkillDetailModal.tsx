import React, { useState } from 'react';
import { OrgDetailModal } from './OrgDetailModal';

export interface SkillDetailItem {
  id?: string;
  skillTitle: string;
  category?: string;
  certificationName?: string;
  issuingSchool?: string;
  yearObtained?: string;
  licenseNumber?: string;
  hourlyRate?: number;
  currency?: string;
  rateType?: string;
  description?: string;
  capacities?: string[];
  portfolioImages?: string[];
  certificateImageUrl?: string;
  providerName?: string;
  providerAvatar?: string;
  rating?: number;
  reviewsCount?: number;
}

interface SkillDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: SkillDetailItem | null;
  onBookOrContact?: () => void;
}

const DEFAULT_PORTFOLIO_IMAGES = [
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'
];

export const SkillDetailModal: React.FC<SkillDetailModalProps> = ({
  isOpen,
  onClose,
  skill,
  onBookOrContact
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [showOrgModal, setShowOrgModal] = useState(false);

  if (!isOpen || !skill) return null;

  const title = skill.skillTitle || 'Specialized Skill';
  const titleLower = title.toLowerCase();
  
  // Check if this is a rental/service item or a certified trade
  const isRentalOrUncertified = 
    titleLower.includes('bike') || 
    titleLower.includes('rental') || 
    titleLower.includes('hire') || 
    titleLower.includes('scooter') || 
    titleLower.includes('gear') ||
    (skill.certificationName || '').toLowerCase().includes('rated') ||
    (skill.certificationName || '').toLowerCase().includes('customer service');

  // Defaults based on type
  const certName = skill.certificationName || (
    titleLower.includes('driver') || titleLower.includes('taxi')
      ? 'PSV Driving Badge & Chauffeur License'
      : 'NITA Certified Qualification'
  );

  const school = skill.issuingSchool || (
    titleLower.includes('driver') || titleLower.includes('taxi')
      ? 'NTSA & AA Driving School of Kenya'
      : 'National Industrial Training Authority (NITA)'
  );

  const year = skill.yearObtained || '2024';
  const licenseNo = skill.licenseNumber || (
    titleLower.includes('driver') || titleLower.includes('taxi') ? 'NTSA/PSV/2024/9910' : 'KMTC/2024/8812'
  );

  const rating = skill.rating || 4.9;
  const reviewsCount = skill.reviewsCount || 84;
  const description = skill.description || 'Verified service with quality execution, prompt delivery and field safety compliance.';
  const rate = skill.hourlyRate ? `${skill.currency || 'KES'} ${skill.hourlyRate.toLocaleString()} / ${skill.rateType || 'hour'}` : 'Rate on inquiry';
  
  const portfolio = skill.portfolioImages && skill.portfolioImages.length > 0 ? skill.portfolioImages : DEFAULT_PORTFOLIO_IMAGES;

  return (
    <>
      <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in font-sans">
        <div className="bg-white border border-black rounded-xl shadow-xl w-full max-w-sm flex flex-col max-h-[85vh] overflow-hidden">
          
          {/* Minimal Black Header */}
          <div className="bg-black text-white px-3.5 py-2.5 flex items-center justify-between shrink-0 border-b border-neutral-800">
            <div className="min-w-0 pr-2">
              <span className="text-[8.5px] font-bold uppercase tracking-widest text-neutral-400 block leading-tight">
                {isRentalOrUncertified ? 'Rated Service & Rental' : 'Skill & Certification'}
              </span>
              <h2 className="text-xs font-black text-white truncate uppercase tracking-wide">{title}</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-neutral-400 hover:text-white font-mono text-sm font-bold p-1 cursor-pointer shrink-0"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Modal Content - Small, Organized & Minimal */}
          <div className="p-3.5 overflow-y-auto space-y-3 text-neutral-900 flex-1 text-xs">
            
            {/* Header Title & Rate */}
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-dashed border-black">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-xs text-black leading-tight">{title}</h3>
                  <span className="bg-black text-white text-[8px] font-black px-1.5 py-0.2 rounded uppercase">
                    {isRentalOrUncertified ? 'Rated Skill' : 'Verified Cert'}
                  </span>
                </div>
                {skill.providerName && (
                  <p className="text-[10px] text-neutral-500 font-medium mt-0.5">
                    Provider: <span className="text-black font-bold">{skill.providerName}</span>
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-black text-black block">{rate}</span>
              </div>
            </div>

            {/* IF RATED SKILL (e.g. Bike Rental): Customer Service & Ratings Card */}
            {isRentalOrUncertified ? (
              <div className="p-2.5 bg-neutral-50 border border-black rounded-lg space-y-1.5">
                <div className="flex justify-between items-center text-[8.5px] font-black text-neutral-500 uppercase tracking-wider">
                  <span>Customer Service Rating</span>
                  <span className="text-black font-mono font-bold">★ {rating} / 5.0</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-black">Customer Care & Quality Rating</p>
                    <p className="text-[10px] text-neutral-600 font-medium">{reviewsCount}+ Verified Client Feedback Ratings</p>
                  </div>
                  <span className="text-[9px] font-mono text-black font-bold bg-white px-2 py-0.5 rounded border border-neutral-300 shrink-0">
                    Safety Checked
                  </span>
                </div>

                <div className="p-1.5 bg-white rounded border border-dashed border-neutral-300 text-[9.5px] text-neutral-700 flex items-center justify-between font-bold">
                  <span>🚴 Smooth Dispatch & Rental Service</span>
                  <span className="text-emerald-700 font-mono">100% On-time</span>
                </div>
              </div>
            ) : (
              /* IF FORMAL CERTIFIED SKILL (e.g. Taxi Driver, Lab Tech): Cert & Institution Card */
              <div className="p-2.5 bg-neutral-50 border border-black rounded-lg space-y-1.5">
                <div className="flex justify-between items-center text-[8.5px] font-black text-neutral-500 uppercase tracking-wider">
                  <span>Certification & Institution</span>
                  <span className="text-black font-mono">Class of {year}</span>
                </div>

                <div>
                  <p className="text-xs font-black text-black">{certName}</p>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <p className="text-[10.5px] font-bold text-neutral-700">{school}</p>
                    <span className="text-[8.5px] font-mono text-black font-bold bg-white px-1.5 py-0.5 rounded border border-neutral-300 shrink-0">
                      Lic #{licenseNo}
                    </span>
                  </div>
                </div>

                {/* Clickable Org Offer Link */}
                <button
                  type="button"
                  onClick={() => setShowOrgModal(true)}
                  className="w-full mt-1 py-1.5 px-2 bg-black text-white hover:bg-neutral-800 rounded font-bold text-[9.5px] uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer group active:scale-98"
                >
                  <span className="flex items-center gap-1">
                    <span>🏢</span>
                    <span>Read About {school.split(' ')[0]} & See Offers</span>
                  </span>
                  <span className="text-xs font-mono group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                </button>
              </div>
            )}

            {/* Experience / Description */}
            {description && (
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Overview & Details
                </span>
                <p className="text-[11px] text-neutral-800 leading-relaxed font-normal bg-white p-2 rounded-lg border border-dashed border-neutral-300">
                  {description}
                </p>
              </div>
            )}

            {/* Interactive Work / Equipment Gallery */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                  {isRentalOrUncertified ? 'Equipment & Service Gallery' : 'Work Gallery'} ({portfolio.length})
                </span>
                <span className="text-[9px] text-neutral-500 font-medium">Tap to enlarge</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {portfolio.map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImageIndex(i)}
                    className="aspect-square rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 relative hover:border-black transition-all cursor-pointer group"
                  >
                    <img 
                      src={imgUrl} 
                      alt={`Sample ${i + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-150"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer CTAs */}
          <div className="p-2.5 bg-neutral-50 border-t border-neutral-200 shrink-0 flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-white text-neutral-700 hover:text-black border border-neutral-300 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
            >
              Close
            </button>
            {onBookOrContact && (
              <button
                onClick={() => {
                  onClose();
                  onBookOrContact();
                }}
                className="flex-1 py-2 bg-black text-white hover:bg-neutral-800 font-black text-[10px] uppercase tracking-wider rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
              >
                {isRentalOrUncertified ? 'Rent / Book Service →' : 'Book Skill →'}
              </button>
            )}
          </div>
        </div>

        {/* Lightbox Modal for Gallery Enlargement */}
        {activeImageIndex !== null && (
          <div 
            className="fixed inset-0 z-[160] bg-black/90 flex flex-col items-center justify-center p-4"
            onClick={() => setActiveImageIndex(null)}
          >
            <div className="relative max-w-lg w-full max-h-[80vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
              <img 
                src={portfolio[activeImageIndex]} 
                alt="Enlarged work sample" 
                className="max-w-full max-h-[70vh] rounded-lg border border-neutral-700 shadow-2xl object-contain"
              />
              <div className="flex justify-between items-center w-full mt-3 px-2 text-white text-xs">
                <span className="font-mono text-[10px] text-neutral-400">
                  Sample {activeImageIndex + 1} of {portfolio.length}
                </span>
                <button 
                  onClick={() => setActiveImageIndex(null)}
                  className="bg-white text-black font-extrabold text-[10px] px-3 py-1 rounded uppercase cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Certifying Organization Modal */}
      <OrgDetailModal
        isOpen={showOrgModal}
        onClose={() => setShowOrgModal(false)}
        orgName={school}
        fullSkillCert={{
          certificationName: certName,
          issuingSchool: school,
          yearObtained: year,
          licenseNumber: licenseNo
        }}
      />
    </>
  );
};

export default SkillDetailModal;
