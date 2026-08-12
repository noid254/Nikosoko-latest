import React from 'react';
import type { CatalogueItem, ServiceProvider } from '../types';

interface CatalogueItemDetailModalProps {
  item: CatalogueItem;
  onClose: () => void;
  provider: ServiceProvider | null;
  isAuthenticated: boolean;
  onAuthClick: () => void;
  onInitiateContact: (provider: ServiceProvider) => boolean;
}

const CallIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.456l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.474 1.039-1.04 3.833 3.855-1.017z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const CatalogueItemDetailModal: React.FC<CatalogueItemDetailModalProps> = ({ item, onClose, provider, isAuthenticated, onAuthClick, onInitiateContact }) => {
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);

  const handleCall = () => {
    if (!provider) return;
    if (!isAuthenticated) {
        onAuthClick();
    } else {
        if (onInitiateContact(provider)) {
            window.location.href = `tel:${provider.phone}`;
        }
    }
  }

  const handleWhatsApp = () => {
    if (!provider || !provider.whatsapp) return;
    if (!isAuthenticated) {
        onAuthClick();
    } else {
        if (onInitiateContact(provider)) {
            window.open(`https://wa.me/${provider.whatsapp}`, '_blank');
        }
    }
  }

  const images = item.imageUrls && item.imageUrls.length > 0 
    ? item.imageUrls.slice(0, 6) 
    : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800'];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex justify-center items-end sm:items-center z-50 animate-fade-in p-0 sm:p-4" onClick={onClose}>
      <div 
        className="bg-gray-50 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md h-[92vh] sm:h-[88vh] flex flex-col animate-slide-in-up overflow-hidden relative border border-gray-200" 
        onClick={e => e.stopPropagation()}
      >
        {/* STICKY TOP HEADER WITH BACK & CANCEL VIEW BUTTONS */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 z-30 shadow-2xs">
          <button 
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-black text-gray-900 bg-gray-100 hover:bg-black hover:text-white px-3 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
            title="Go Back"
          >
            <span className="text-sm">←</span>
            <span>Back</span>
          </button>
          
          <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
            Product Description
          </span>

          <button 
            onClick={onClose}
            className="text-xs font-bold text-gray-600 hover:text-black bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
            title="Close"
          >
            Close ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
            {/* MAIN WORK PHOTO DISPLAY WITH BADGE */}
            <div className="relative w-full h-72 bg-gray-900 group">
                <img 
                    src={images[activeImageIndex] || images[0]} 
                    alt={`${item.title} work photo ${activeImageIndex + 1}`} 
                    className="w-full h-full object-cover transition-all duration-300" 
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800';
                    }}
                />
                
                {/* PHOTO COUNTER BADGE */}
                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-white/20 shadow-md">
                    <span>📷</span>
                    <span>Photo {activeImageIndex + 1} of {images.length}</span>
                </div>

                {/* NAVIGATION ARROWS */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => setActiveImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center font-bold text-base hover:bg-black transition cursor-pointer shadow-md"
                        >
                            ‹
                        </button>
                        <button
                            onClick={() => setActiveImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center font-bold text-base hover:bg-black transition cursor-pointer shadow-md"
                        >
                            ›
                        </button>
                    </>
                )}
            </div>

            {/* UP TO 6 THUMBNAIL STRIP */}
            {images.length > 1 && (
                <div className="bg-gray-900 px-4 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-gray-800">
                    {images.map((imgUrl, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                                activeImageIndex === idx 
                                    ? 'border-amber-400 scale-105 shadow-md' 
                                    : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                        >
                            <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                            {activeImageIndex === idx && (
                                <div className="absolute inset-0 border border-amber-400 rounded-lg pointer-events-none"></div>
                            )}
                        </button>
                    ))}
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-auto flex-shrink-0">
                        Gallery ({images.length}/6)
                    </span>
                </div>
            )}

            {/* E-COMMERCE PRODUCT DESCRIPTION CONTENT */}
            <div className="p-4 space-y-4">
              {/* Category & Badge Row */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black text-brand-gold uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  {item.category || 'Service Listing'}
                </span>

                {item.isVerified ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[9.5px] font-black px-2.5 py-1 rounded-md flex items-center gap-1 border border-emerald-300">
                    <span>✓</span> Verified Listing
                  </span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-800 text-[9.5px] font-black px-2.5 py-1 rounded-md border border-yellow-300">
                    Neighborhood Verified
                  </span>
                )}
              </div>

              {/* Title & Price PDP Banner */}
              <div className="space-y-1">
                <h1 className="text-xl font-extrabold text-gray-900 leading-snug">{item.title}</h1>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-2xl font-black text-brand-navy font-mono">{item.price}</span>
                  {item.discountInfo && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {item.discountInfo}
                    </span>
                  )}
                </div>
              </div>

              {/* Product Spec Highlights Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {item.duration && (
                  <div className="p-2.5 bg-white rounded-xl border border-gray-200 flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <ClockIcon />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Turnaround / Duration</p>
                      <p className="font-extrabold text-gray-900 text-[11px]">{item.duration}</p>
                    </div>
                  </div>
                )}

                {item.serialNumber && (
                  <div className="p-2.5 bg-white rounded-xl border border-gray-200 flex items-center gap-2">
                    <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg shrink-0 text-xs font-mono font-bold">
                      #
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Serial Ref</p>
                      <p className="font-mono text-gray-900 text-[11px] font-bold">{item.serialNumber}</p>
                    </div>
                  </div>
                )}

                <div className="p-2.5 bg-white rounded-xl border border-gray-200 flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 text-xs font-bold">
                    🛡️
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Buyer Guarantee</p>
                    <p className="font-extrabold text-gray-900 text-[11px]">NikoSoko Protected</p>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-gray-200 flex items-center gap-2">
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg shrink-0 text-xs font-bold">
                    ⚡
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Availability</p>
                    <p className="font-extrabold text-gray-900 text-[11px]">In Stock / Direct Hire</p>
                  </div>
                </div>
              </div>

              {/* Service Verification Banner */}
              <div className={`p-3 rounded-xl text-xs ${item.isVerified ? 'bg-emerald-50/90 border border-emerald-200 text-emerald-900' : 'bg-amber-50/90 border border-amber-200 text-amber-900'}`}>
                <p className="font-bold flex items-center gap-1.5">
                  <span>{item.isVerified ? '✓' : 'ℹ️'}</span>
                  <span>
                    {item.isVerified
                        ? "Verified Service Listing: Provider credentials & work history verified."
                        : "Neighborhood Listing: Contact provider directly to confirm appointment & scope."
                    }
                  </span>
                </p>
              </div>

              {/* Seller / Provider Card */}
              {provider && (
                  <div className="pt-2">
                      <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">Sold & Fulfilled By</p>
                      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                          <div className="flex items-center gap-2.5">
                              <img src={provider.avatarUrl} alt={provider.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                              <div>
                                  <p className="text-xs font-black text-black flex items-center gap-1">
                                      <span>{provider.name}</span>
                                      {(provider.isVerified || item.isVerified) && (
                                          <svg className="w-4 h-4 text-blue-500 inline-block flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                          </svg>
                                      )}
                                      <span className="text-gray-700 font-mono text-xs font-bold">⭐ {provider.rating ? provider.rating.toFixed(1) : '5.0'}</span>
                                  </p>
                                  <p className="text-[10.5px] text-gray-500 font-medium">{provider.service} • {provider.location}</p>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* Detailed Description */}
              <div className="pt-3 border-t border-gray-200 space-y-1.5">
                  <h2 className="text-xs font-black uppercase text-gray-500 tracking-wider">Product / Service Overview</h2>
                  <p className="text-xs text-gray-800 leading-relaxed bg-white p-3.5 rounded-xl border border-gray-200 whitespace-pre-line font-medium">
                    {item.description}
                  </p>
              </div>

              {item.externalLink && (
                  <div className="pt-2">
                      <a href={item.externalLink} target="_blank" rel="noopener noreferrer" className="block w-full bg-emerald-600 text-white font-extrabold py-3 px-4 rounded-xl text-center text-xs uppercase tracking-wider transition-colors hover:bg-emerald-700 active-scale shadow-md">
                          Visit External Resource / Course Page &rarr;
                      </a>
                  </div>
              )}
            </div>
        </div>

        {/* E-COMMERCE STICKY BOTTOM BAR WITH CALL / WHATSAPP / CLOSE */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center gap-2 z-30">
          <button 
            onClick={onClose} 
            className="py-3.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer active:scale-95 shrink-0"
            title="Close"
          >
            Close
          </button>
          
          {provider?.phone && (
              <button onClick={handleCall} className="flex-1 bg-gray-900 text-white font-black py-3.5 px-3 rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider active-scale cursor-pointer shadow-md">
                  <CallIcon /> Call
              </button>
          )}
          {provider?.whatsapp && (
              <button onClick={handleWhatsApp} className="flex-1 bg-brand-navy text-white font-black py-3.5 px-3 rounded-xl hover:opacity-90 transition-colors flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider active-scale cursor-pointer shadow-md">
                  <WhatsAppIcon /> WhatsApp
              </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogueItemDetailModal;