import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { CatalogueItem, ServiceProvider, CurrentPage } from '../types';
import { BookingModal } from './BookingModal';

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CallIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.456l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.474 1.039-1.04 3.833 3.855-1.017z" />
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const SERVICE_CATEGORIES = [
  { id: 'all', label: 'All Services', icon: '⚡' },
  { id: 'Tutoring', label: 'Tutoring & Lessons', icon: '📚' },
  { id: 'Refills', label: 'Refills (Water & Gas)', icon: '💧' },
  { id: 'TV Mounting', label: 'TV Mounting', icon: '📺' },
  { id: 'Key Cutter', label: 'Key Cutter', icon: '🔑' },
  { id: 'Braiding', label: 'Braiding', icon: '💇' },
  { id: 'Electrical', label: 'Electrical', icon: '⚡' },
  { id: 'Plumbing', label: 'Plumbing', icon: '🚰' },
  { id: 'Shoe Repair', label: 'Shoe Repair', icon: '👟' },
];

interface TukosokoItemCardProps {
  item: CatalogueItem;
  provider?: ServiceProvider;
  onClick: () => void;
}

const TukosokoItemCard: React.FC<TukosokoItemCardProps> = ({ item, provider, onClick }) => {
  const photoCount = item.imageUrls?.length || 1;
  const rating = provider?.rating || 4.9;
  const distance = provider?.distanceKm || 0.8;
  const isRefill = item.category?.toLowerCase().includes('water') || item.category?.toLowerCase().includes('gas') || item.category === 'Refills';

  return (
    <div 
      onClick={onClick} 
      className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden cursor-pointer group hover:shadow-md hover:border-gray-200 transition-all flex flex-col justify-between"
    >
      <div className="relative h-28 sm:h-32 bg-gray-100 overflow-hidden">
        <img 
          src={item.imageUrls[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=400'} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        
        {/* Category & Refill Badge */}
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md backdrop-blur-xs text-white ${
            isRefill ? 'bg-emerald-600/90' : 'bg-black/75'
          }`}>
            {isRefill ? '🔄 Refill' : (item.category || 'Service')}
          </span>
        </div>

        {/* Top Right Badges */}
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
          {photoCount > 1 && (
            <span className="bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md">
              📷 {photoCount}
            </span>
          )}
          {item.isVerified && (
            <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-2xs">
              ✓ Verified
            </span>
          )}
        </div>

        {/* Floating Price Tag */}
        <div className="absolute bottom-1.5 left-1.5 bg-white/95 backdrop-blur-xs text-brand-navy font-black text-xs px-2 py-0.5 rounded-lg shadow-2xs border border-gray-100">
          {item.price}
        </div>
      </div>

      <div className="p-2.5 flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-extrabold text-gray-900 text-[11px] line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
            {item.title}
          </h3>
          <p className="text-[9px] text-gray-500 line-clamp-1 mt-1 font-medium leading-tight">
            {item.description}
          </p>
        </div>

        <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
          {provider && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 min-w-0">
                <img 
                  src={provider.shopDetails?.logo || provider.avatarUrl} 
                  alt={provider.name} 
                  className="w-4 h-4 rounded-full object-cover border border-gray-200" 
                />
                <span className="text-[9px] text-gray-700 font-bold truncate max-w-[80px]">
                  {provider.shopDetails?.name || provider.name}
                </span>
              </div>
              <div className="flex items-center gap-0.5 text-[9px] font-bold text-gray-600">
                <StarIcon />
                <span>{rating.toFixed(1)}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[8px] text-gray-400 font-semibold">
            <span>📍 {distance} km away</span>
            <span className="text-blue-600 font-extrabold uppercase tracking-wider group-hover:underline">Order ➔</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* E-Commerce Service Description Detail Modal */
interface ServiceDetailModalProps {
  item: CatalogueItem;
  provider: ServiceProvider | null;
  onClose: () => void;
  isAuthenticated: boolean;
  onAuthClick: () => void;
  onInitiateContact: (provider: ServiceProvider) => boolean;
  onSelectProvider: (provider: ServiceProvider) => void;
  onBookProvider: (provider: ServiceProvider) => void;
}

const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  item,
  provider,
  onClose,
  isAuthenticated,
  onAuthClick,
  onInitiateContact,
  onSelectProvider,
  onBookProvider
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images = item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800'];

  const handleCall = () => {
    if (!provider) return;
    if (!isAuthenticated) {
      onAuthClick();
    } else {
      if (onInitiateContact(provider)) {
        window.location.href = `tel:${provider.phone}`;
      }
    }
  };

  const handleWhatsApp = () => {
    if (!provider) return;
    const phone = provider.whatsapp || provider.phone;
    if (!isAuthenticated) {
      onAuthClick();
    } else {
      if (onInitiateContact(provider)) {
        const text = encodeURIComponent(`Hi ${provider.name}, I am interested in your service: ${item.title} (${item.price}) listed on Tukosoko.`);
        window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
      }
    }
  };

  const handleBook = () => {
    if (!provider) return;
    if (!isAuthenticated) {
      onAuthClick();
    } else {
      if (onInitiateContact(provider)) {
        onBookProvider(provider);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex justify-center items-end sm:items-center z-50 animate-fade-in p-0 sm:p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md h-[92vh] sm:h-[85vh] flex flex-col overflow-hidden animate-slide-in-up border border-gray-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Controls */}
        <div className="p-3 bg-white border-b border-gray-100 flex items-center justify-between relative z-10">
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center font-bold text-sm transition-colors"
          >
            ✕
          </button>
          <div className="text-center">
            <span className="text-[10px] font-black uppercase text-brand-navy tracking-widest block leading-none">Service E-Commerce Detail</span>
            <span className="text-[9px] font-semibold text-gray-400">Tukosoko Neighborhood Catalogue</span>
          </div>
          <div className="w-9 h-9"></div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-28">
          
          {/* Main Photo Gallery */}
          <div className="relative bg-gray-900 h-64 sm:h-72 w-full flex items-center justify-center overflow-hidden">
            <img 
              src={images[activeImageIndex]} 
              alt={item.title} 
              className="w-full h-full object-cover transition-opacity duration-300"
            />

            {/* Photo Index Tag */}
            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow-xs">
              📷 {activeImageIndex + 1} / {images.length}
            </div>

            {/* Verification Badge */}
            {item.isVerified && (
              <div className="absolute top-3 left-3 bg-blue-600 text-white font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                <span>✓ Verified Service</span>
              </div>
            )}

            {/* Next / Previous Controls if multiple photos */}
            {images.length > 1 && (
              <>
                <button 
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-xs text-xs font-bold"
                >
                  ◀
                </button>
                <button 
                  onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-xs text-xs font-bold"
                >
                  ▶
                </button>
              </>
            )}
          </div>

          {/* Thumbnails row */}
          {images.length > 1 && (
            <div className="px-5 flex gap-2 overflow-x-auto no-scrollbar py-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    idx === activeImageIndex ? 'border-brand-navy scale-105 shadow-sm' : 'border-gray-200 opacity-60'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Pricing & Service Info */}
          <div className="px-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md tracking-wider">
                  {item.category || 'Service'}
                </span>
                <h1 className="text-xl font-black text-gray-900 mt-2 leading-snug">{item.title}</h1>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-2xl font-black text-brand-navy block">{item.price}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase">Fixed Rate</span>
              </div>
            </div>

            {/* Service Highlights Box */}
            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base">📍</span>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase">Proximity</p>
                  <p className="font-bold text-gray-800">{provider?.distanceKm || 0.8} km away</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">⏱️</span>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase">Estimated Time</p>
                  <p className="font-bold text-gray-800">{item.duration || '30-45 mins'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">⭐</span>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase">Professional Rating</p>
                  <p className="font-bold text-gray-800">{provider?.rating || 4.9} / 5.0</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">🚚</span>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase">Delivery / Travel</p>
                  <p className="font-bold text-emerald-700">{item.discountInfo || 'Doorstep Service'}</p>
                </div>
              </div>
            </div>

            {/* Full Service Description */}
            <div className="pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 mb-1.5">Service Overview</h3>
              <p className="text-xs text-gray-700 leading-relaxed font-medium bg-white p-3 rounded-2xl border border-gray-100">
                {item.description}
              </p>
            </div>

            {/* Provider Summary Card */}
            {provider && (
              <div className="pt-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 mb-2">Listed By Professional</h3>
                <div 
                  onClick={() => {
                    onClose();
                    onSelectProvider(provider);
                  }}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={provider.avatarUrl} 
                      alt={provider.name} 
                      className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs" 
                    />
                    <div>
                      <h4 className="font-bold text-xs text-gray-900 group-hover:underline">{provider.name}</h4>
                      <p className="text-[10px] text-gray-500 font-semibold">{provider.service}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">{provider.location}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-brand-navy bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-2xs group-hover:bg-brand-navy group-hover:text-white transition-colors">
                    Profile ➔
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="p-4 bg-white border-t border-gray-100 shadow-2xl flex items-center gap-2">
          {provider?.phone && (
            <button 
              onClick={handleCall}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3.5 px-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-xs"
            >
              <CallIcon />
              <span>Call</span>
            </button>
          )}

          {provider?.phone && (
            <button 
              onClick={handleWhatsApp}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-md"
            >
              <WhatsAppIcon />
              <span>WhatsApp</span>
            </button>
          )}

          {provider && (
            <button 
              onClick={handleBook}
              className="flex-1 bg-brand-navy hover:bg-black text-white py-3.5 px-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-md"
            >
              <span>📅 Book</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

interface TukosokoProps {
  items: CatalogueItem[];
  providers: ServiceProvider[];
  currentUser?: ServiceProvider | null;
  onAddCatalogueItem?: (newItem: CatalogueItem) => void;
  onSelectProvider: (provider: ServiceProvider) => void;
  onBack: () => void;
  onMessagesClick: () => void;
  hasNewMessages: boolean;
  onNavigate: (page: CurrentPage) => void;
  isAuthenticated: boolean;
  onAuthClick: () => void;
  onInitiateContact: (provider: ServiceProvider) => boolean;
  onBookProvider: (provider: ServiceProvider) => void;
}

const CATEGORY_PHOTO_PRESETS: Record<string, string[]> = {
  'Tutoring': [
    'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800'
  ],
  'TV Mounting': [
    'https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=800',
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800'
  ],
  'Key Cutter': [
    'https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=800'
  ],
  'Braiding': [
    'https://images.unsplash.com/photo-1560869713-7d0a29430803?q=80&w=800'
  ],
  'Water Refill': [
    'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?q=80&w=800'
  ],
  'Gas Refill': [
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800'
  ],
  'Electrical': [
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800'
  ],
  'Plumbing': [
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=800'
  ],
  'Shoe Repair': [
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800'
  ],
  'Other Service': [
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=800'
  ]
};

interface SellServicePageProps {
  currentUser: ServiceProvider | null;
  onBack: () => void;
  onSubmit: (newItem: CatalogueItem) => void;
  onAuthClick: () => void;
}

const SellServicePage: React.FC<SellServicePageProps> = ({
  currentUser,
  onBack,
  onSubmit,
  onAuthClick
}) => {
  const [category, setCategory] = useState('Tutoring');
  const [title, setTitle] = useState('');
  const [priceAmount, setPriceAmount] = useState('200');
  const [rateUnit, setRateUnit] = useState('/ hour');
  const [duration, setDuration] = useState('1 hour');
  const [description, setDescription] = useState('');
  const [offerNote, setOfferNote] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);

    if (newCat === 'Tutoring' && (!title || title.includes('TV') || title.includes('Key'))) {
      setTitle('Maths Lesson & Exam Coaching');
      setPriceAmount('200');
      setRateUnit('/ hour');
      setDuration('1 hour');
      setDescription('One-on-one mathematics tuition covering algebra, geometry & KCSE exam prep. Flexible online or doorstep home visits.');
      setOfferNote('First trial lesson 50% off');
    } else if (newCat === 'TV Mounting' && (!title || title.includes('Maths'))) {
      setTitle('TV Wall Mounting & Cable Trunking');
      setPriceAmount('1500');
      setRateUnit('fixed');
      setDuration('45 mins');
      setDescription('Professional bracket installation for 32" to 75" TVs including wall drilling & cable concealing.');
      setOfferNote('Free travel within 3km');
    }
  };

  useEffect(() => {
    if (!title) {
      handleCategoryChange('Tutoring');
    }
  }, []);

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setUploadedImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddPresetImage = (presetUrl: string) => {
    if (!uploadedImages.includes(presetUrl)) {
      setUploadedImages(prev => [...prev, presetUrl]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onAuthClick();
      return;
    }

    if (!title.trim() || !priceAmount.trim()) return;

    const formattedPrice = rateUnit === 'fixed' 
      ? `Ksh ${priceAmount}`
      : `Ksh ${priceAmount} ${rateUnit}`;

    const defaultPresets = CATEGORY_PHOTO_PRESETS[category] || CATEGORY_PHOTO_PRESETS['Other Service'];
    const finalImages = uploadedImages.length > 0 ? uploadedImages : [defaultPresets[0]];

    const newItem: CatalogueItem = {
      id: `cat_${Date.now()}`,
      providerId: currentUser.id,
      title: title.trim(),
      category: category,
      description: description.trim() || `${category} service offered by ${currentUser.name}.`,
      price: formattedPrice,
      imageUrls: finalImages,
      isVerified: currentUser.isVerified ?? true,
      duration: duration || '1 hour',
      discountInfo: offerNote.trim() || 'Direct Service Listing'
    };

    onSubmit(newItem);
  };

  const currentPresets = CATEGORY_PHOTO_PRESETS[category] || CATEGORY_PHOTO_PRESETS['Other Service'];
  const activeCoverImage = uploadedImages[0] || currentPresets[0];

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-28 max-w-md mx-auto border-x border-gray-100 relative">
      
      {/* Sticky Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 px-3.5 py-2.5 flex items-center justify-between shadow-2xs">
        <button 
          type="button"
          onClick={onBack}
          className="p-2 bg-gray-50 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-1.5 text-xs font-black"
        >
          <BackIcon />
          <span>Back</span>
        </button>

        <div className="text-center">
          <h1 className="text-sm font-black text-brand-navy tracking-tight uppercase leading-none">Sell Service Card</h1>
          <p className="text-[9px] font-black tracking-widest text-amber-600 uppercase mt-0.5">Publish Skill Rate to Tukosoko</p>
        </div>

        <div className="w-12"></div>
      </header>

      {/* Main Form Page */}
      <main className="p-3.5 space-y-4">

        {/* Hero Card / Explanation Banner */}
        <div className="bg-gradient-to-br from-brand-navy via-slate-900 to-black text-white p-4 rounded-2xl shadow-md border border-gray-800 space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎓</span>
            <div>
              <h2 className="font-black text-xs uppercase tracking-wide text-amber-400">Sell Skills & Doorstep Services</h2>
              <p className="text-[10px] text-gray-300 font-medium leading-snug">
                Signed up as a teacher? Sell Maths lessons at Ksh 200/hr. Electricians, plumbers & key cutters can list doorstep rate packages!
              </p>
            </div>
          </div>
        </div>

        {/* User Profile / Skill ID Badge */}
        {currentUser ? (
          <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.name} 
              className="w-10 h-10 rounded-full object-cover border-2 border-brand-navy shadow-2xs" 
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-gray-900 truncate">{currentUser.name}</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                  ✓ Verified Skill ID
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-semibold truncate">{currentUser.service || 'Professional Service Provider'}</p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-900">Sign in to publish your service card</p>
              <p className="text-[10px] text-amber-700">Connect with your Skill ID profile</p>
            </div>
            <button 
              type="button" 
              onClick={onAuthClick}
              className="bg-brand-navy text-white text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-wider"
            >
              Sign In
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* 1. Category Selector */}
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-700">
              1. Select Service Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'Tutoring', label: 'Tutoring', icon: '📚' },
                { id: 'TV Mounting', label: 'TV Mount', icon: '📺' },
                { id: 'Key Cutter', label: 'Key Cutter', icon: '🔑' },
                { id: 'Braiding', label: 'Braiding', icon: '💇' },
                { id: 'Water Refill', label: 'Water', icon: '💧' },
                { id: 'Gas Refill', label: 'Gas', icon: '⛽' },
                { id: 'Electrical', label: 'Electrical', icon: '⚡' },
                { id: 'Plumbing', label: 'Plumbing', icon: '🚰' },
                { id: 'Shoe Repair', label: 'Shoe Repair', icon: '👟' },
                { id: 'Other Service', label: 'Other', icon: '🛠️' }
              ].map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`p-2 rounded-xl text-[10px] font-extrabold flex flex-col items-center justify-center gap-1 border transition-all ${
                    category === cat.id 
                      ? 'bg-brand-navy text-white border-brand-navy shadow-xs' 
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="truncate w-full text-center">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Service Title */}
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-700">
              2. Service Title *
            </label>
            <input 
              type="text" 
              required 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              placeholder={category === 'Tutoring' ? 'e.g. High School Maths Tuition & Exam Coaching' : 'e.g. TV Wall Mounting Service'}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-brand-navy focus:bg-white"
            />
          </div>

          {/* 3. Rate & Billing Unit */}
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-700">
              3. Rate & Billing Unit *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[9px] font-bold text-gray-500 mb-1 block">Amount (Ksh)</span>
                <input 
                  type="number" 
                  required 
                  value={priceAmount} 
                  onChange={e => setPriceAmount(e.target.value)}
                  placeholder="200"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-black text-gray-900 focus:outline-none focus:border-brand-navy focus:bg-white"
                />
              </div>

              <div>
                <span className="text-[9px] font-bold text-gray-500 mb-1 block">Billing Frequency</span>
                <select 
                  value={rateUnit} 
                  onChange={e => setRateUnit(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-brand-navy focus:bg-white"
                >
                  <option value="/ hour">/ hour</option>
                  <option value="/ lesson">/ lesson</option>
                  <option value="/ session">/ session</option>
                  <option value="/ refill">/ refill</option>
                  <option value="/ job">/ job</option>
                  <option value="/ day">/ day</option>
                  <option value="fixed">Fixed Price</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. Duration & Special Offer */}
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-700">
              4. Duration & Offer Note
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[9px] font-bold text-gray-500 mb-1 block">Est. Duration</span>
                <input 
                  type="text" 
                  value={duration} 
                  onChange={e => setDuration(e.target.value)}
                  placeholder="1 hour"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-brand-navy focus:bg-white"
                />
              </div>

              <div>
                <span className="text-[9px] font-bold text-gray-500 mb-1 block">Special Offer / Discount</span>
                <input 
                  type="text" 
                  value={offerNote} 
                  onChange={e => setOfferNote(e.target.value)}
                  placeholder="e.g. First lesson 50% off"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-brand-navy focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* 5. Description */}
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-700">
              5. Description & Details
            </label>
            <textarea 
              rows={3}
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide clear details on topics covered, tools brought, doorstep service area..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-medium text-gray-900 focus:outline-none focus:border-brand-navy focus:bg-white"
            />
          </div>

          {/* 6. Image Upload from Gallery ONLY */}
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-700">
                6. Service Photos (Upload from Gallery)
              </label>
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {uploadedImages.length} {uploadedImages.length === 1 ? 'photo' : 'photos'} uploaded
              </span>
            </div>

            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              multiple 
              onChange={handleGalleryUpload} 
              className="hidden" 
            />

            {/* Gallery Upload Area */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 hover:border-brand-navy p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 bg-gray-50 hover:bg-blue-50/50 transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 text-brand-navy flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                🖼️
              </div>
              <p className="text-xs font-black text-gray-900">Upload Photo from Gallery</p>
              <p className="text-[9px] text-gray-500 font-semibold">Select 1 or more photos directly from your phone gallery</p>
            </button>

            {/* Uploaded Gallery Photos Grid */}
            {uploadedImages.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[9px] font-extrabold uppercase text-gray-500">Your Gallery Photos:</span>
                <div className="grid grid-cols-3 gap-2">
                  {uploadedImages.map((imgData, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                      <img src={imgData} alt={`Uploaded ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-md hover:bg-red-700 transition-colors"
                        title="Remove image"
                      >
                        ✕
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-brand-navy/90 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md">
                          COVER
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Stock Presets (Quick selection) */}
            <div className="pt-2 border-t border-gray-100 space-y-1.5">
              <span className="text-[9px] font-extrabold uppercase text-gray-400">Or tap to add stock sample photo:</span>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {currentPresets.map((presetUrl, pIdx) => (
                  <button
                    type="button"
                    key={pIdx}
                    onClick={() => handleAddPresetImage(presetUrl)}
                    className="relative w-16 h-14 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 hover:opacity-90 transition-opacity"
                  >
                    <img src={presetUrl} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[7px] font-bold text-center py-0.5">
                      + Add
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* 7. Live Preview Card */}
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-700 block">
              7. Live Marketplace Card Preview
            </span>
            
            <div className="max-w-[220px] mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="relative h-32 bg-gray-100 overflow-hidden">
                <img src={activeCoverImage} alt="" className="w-full h-full object-cover" />
                <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[8px] font-black px-2 py-0.5 rounded-md uppercase">
                  {category}
                </span>
                <span className="absolute bottom-1.5 left-1.5 bg-white text-brand-navy font-black text-xs px-2 py-0.5 rounded-lg border border-gray-100">
                  {rateUnit === 'fixed' ? `Ksh ${priceAmount}` : `Ksh ${priceAmount} ${rateUnit}`}
                </span>
              </div>
              <div className="p-2.5">
                <h3 className="font-extrabold text-gray-900 text-[11px] leading-tight truncate">
                  {title || 'Service Title'}
                </h3>
                <p className="text-[9px] text-gray-500 line-clamp-1 mt-0.5 font-medium">
                  {description || 'Service details...'}
                </p>
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[8px] font-bold text-gray-600">
                  <span>{currentUser?.name || 'Your Name'}</span>
                  <span className="text-blue-600 uppercase">Order ➔</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button 
              type="submit"
              className="w-full bg-brand-navy hover:bg-black text-white py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>🚀 Publish Service Card Live</span>
            </button>
            <button 
              type="button"
              onClick={onBack}
              className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
          </div>

        </form>

      </main>
    </div>
  );
};

interface TukosokoProps {
  items: CatalogueItem[];
  providers: ServiceProvider[];
  currentUser?: ServiceProvider | null;
  initialViewMode?: 'marketplace' | 'sellService';
  onAddCatalogueItem?: (newItem: CatalogueItem) => void;
  onSelectProvider: (provider: ServiceProvider) => void;
  onBack: () => void;
  onMessagesClick: () => void;
  hasNewMessages: boolean;
  onNavigate: (page: CurrentPage) => void;
  isAuthenticated: boolean;
  onAuthClick: () => void;
  onInitiateContact: (provider: ServiceProvider) => boolean;
  onBookProvider: (provider: ServiceProvider) => void;
}

const Tukosoko: React.FC<TukosokoProps> = ({ 
  items, 
  providers, 
  currentUser,
  initialViewMode = 'marketplace',
  onAddCatalogueItem,
  onSelectProvider, 
  onBack, 
  onMessagesClick, 
  hasNewMessages, 
  onNavigate,
  isAuthenticated,
  onAuthClick,
  onInitiateContact,
  onBookProvider
}) => {
  const [viewMode, setViewMode] = useState<'marketplace' | 'sellService'>(initialViewMode);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<CatalogueItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Map providers and inject currentUser as provider if logged in
  const providerMap = useMemo(() => {
    const map = new Map(providers.map(p => [p.id, p]));
    if (currentUser) {
      map.set(currentUser.id, currentUser);
    }
    return map;
  }, [providers, currentUser]);

  // Filter service items - excluding generic non-refill physical products
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Exclude generic physical products (only allow Refills and Services)
      if (item.category === 'Product') return false;

      const matchCategory = selectedCategory === 'all' 
        || item.category === selectedCategory 
        || (selectedCategory === 'TV Mounting' && item.category?.toLowerCase().includes('tv'))
        || (selectedCategory === 'Refills' && (item.category?.toLowerCase().includes('water') || item.category?.toLowerCase().includes('gas')))
        || (selectedCategory === 'Tutoring' && (item.category?.toLowerCase().includes('tutor') || item.category?.toLowerCase().includes('lesson') || item.category?.toLowerCase().includes('teach')));
      
      if (!matchCategory) return false;

      if (!searchTerm) return true;

      const t = searchTerm.toLowerCase();
      const provider = providerMap.get(item.providerId);
      const shopName = provider?.shopDetails?.name || provider?.name || '';

      return (
        item.title.toLowerCase().includes(t) ||
        item.description.toLowerCase().includes(t) ||
        (item.category && item.category.toLowerCase().includes(t)) ||
        shopName.toLowerCase().includes(t)
      );
    });
  }, [items, selectedCategory, searchTerm, providerMap]);

  const handleCreateServiceItem = (newItem: CatalogueItem) => {
    if (onAddCatalogueItem) {
      onAddCatalogueItem(newItem);
    }
    setViewMode('marketplace');
    setSelectedCategory('all');
    setToastMessage(`🎉 Service Card "${newItem.title}" published live on Tukosoko!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // If in sellService viewMode, render full SellServicePage
  if (viewMode === 'sellService') {
    return (
      <SellServicePage
        currentUser={currentUser || null}
        onBack={() => {
          if (initialViewMode === 'sellService') {
            onBack();
          } else {
            setViewMode('marketplace');
          }
        }}
        onSubmit={handleCreateServiceItem}
        onAuthClick={onAuthClick}
      />
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-28 max-w-md mx-auto border-x border-gray-100 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-brand-navy text-white px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 border border-amber-400 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Combined Header & Search Bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs">
        <div className="px-3.5 py-2.5 flex justify-between items-center gap-2">
          <button onClick={onBack} className="p-2 bg-gray-50 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors">
            <BackIcon />
          </button>

          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-sm">🛒</span>
              <h1 className="text-base font-black text-brand-navy tracking-tight uppercase leading-none">Tukosoko</h1>
            </div>
            <p className="text-[8px] font-black tracking-widest text-amber-600 uppercase mt-0.5">Services & Refills For Sale</p>
          </div>

          <button onClick={onMessagesClick} className="p-2 bg-gray-50 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {hasNewMessages && <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>}
          </button>
        </div>

        {/* Compact Search Input */}
        <div className="px-3.5 pb-2.5">
          <div className="bg-gray-50 rounded-xl flex items-center px-2.5 border border-gray-200 focus-within:border-brand-navy focus-within:bg-white transition-all shadow-2xs h-9">
            <SearchIcon />
            <input 
              className="w-full bg-transparent outline-none text-xs text-gray-900 placeholder-gray-400 font-medium px-2" 
              placeholder="Search TV mounting, tutoring, key cutter, braiding, water, gas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 px-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="px-3.5 pb-2.5 overflow-x-auto no-scrollbar flex gap-1.5">
          {SERVICE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
                selectedCategory === cat.id 
                  ? 'bg-brand-navy text-white shadow-2xs' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-xs">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Service Feed Grid */}
      <main className="p-3.5 space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-black text-gray-900 uppercase tracking-tight">
            {searchTerm ? 'Search Results' : selectedCategory === 'all' ? 'Neighborhood Services For Sale' : `${selectedCategory} Listings`}
          </h2>
          <span className="text-[9px] font-black uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
            {filteredItems.length} {filteredItems.length === 1 ? 'service' : 'services'}
          </span>
        </div>

        {/* E-Commerce Product Card Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {filteredItems.map(item => {
            const provider = providerMap.get(item.providerId);
            return (
              <TukosokoItemCard
                key={item.id}
                item={item}
                provider={provider}
                onClick={() => setSelectedItem(item)}
              />
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="py-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100 p-5">
            <div className="text-3xl mb-2">🛠️</div>
            <p className="font-black text-xs uppercase tracking-widest text-gray-700">No services found</p>
            <p className="text-[10px] text-gray-400 mt-1">Try searching for "Maths Lesson", "TV Mounting", "Key Cutter", "Braiding", "Water Refill" or "Gas Refill".</p>
          </div>
        )}
      </main>

      {/* Floating Create Service Card Action Button */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-40">
        <button
          onClick={() => {
            if (!isAuthenticated && !currentUser) {
              onAuthClick();
            } else {
              setViewMode('sellService');
            }
          }}
          className="bg-brand-navy hover:bg-black text-white px-4 py-3 rounded-full shadow-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 border-2 border-amber-400 active:scale-95 transition-transform group"
        >
          <span className="text-base">⚡</span>
          <span>Sell Service</span>
        </button>
      </div>

      {/* Detailed Description Modal */}
      {selectedItem && (
        <ServiceDetailModal
          item={selectedItem}
          provider={providerMap.get(selectedItem.providerId) || null}
          onClose={() => setSelectedItem(null)}
          isAuthenticated={isAuthenticated}
          onAuthClick={onAuthClick}
          onInitiateContact={onInitiateContact}
          onSelectProvider={onSelectProvider}
          onBookProvider={onBookProvider}
        />
      )}

    </div>
  );
};

export default Tukosoko;
