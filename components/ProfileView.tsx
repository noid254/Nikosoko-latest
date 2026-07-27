import React, { useState, useRef } from 'react';
import type { ServiceProvider, Document, CurrentPage } from '../types';

interface ProfileViewProps {
  profileData: ServiceProvider;
  isOwner: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  currentUserPhone: string | undefined;
  onBack: () => void;
  onLogout: () => void;
  onUpdate: (updatedProfile: ServiceProvider) => void;
  onDelete: (providerId: string) => void;
  onContactClick: () => void;
  onInitiateContact: (provider: ServiceProvider) => boolean;
  savedContacts: string[];
  onToggleSaveContact: (providerId: string) => void;
  catalogueItems?: any[];
  onBook: (provider: ServiceProvider) => void;
  onJoin: (provider: ServiceProvider) => void;
  isFlaggedByUser: boolean;
  onFlag: (reason: string) => void;
  allDocuments: Document[];
  onViewDocument: (doc: Document) => void;
  onViewCatalogue?: (provider: ServiceProvider) => void;
  onNavigate?: (page: CurrentPage) => void;
}

const StarIcon = ({ className = "w-5 h-5" }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>;
const LocationIcon = ({ className = "w-5 h-5" }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>;
const RateIcon = ({ className = "w-5 h-5" }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 004 0V7.151c.22.071.412.164.567.267l1.11-1.11a.5.5 0 00-1.11-1.11l-1.11 1.11a2.5 2.5 0 00-3.476 0l-1.11-1.11a.5.5 0 00-1.11 1.11l1.11 1.11zM11 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"></path></svg>;
const VerifiedIcon = ({ className = "w-5 h-5", onClick }: any) => <svg onClick={onClick} className={`${className} ${onClick ? 'cursor-pointer' : ''}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>;
const SettingsIcon = ({ onClick }: any) => <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 cursor-pointer"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.09a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>;

const CallIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.456l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.474 1.039-1.04 3.833 3.855-1.017z" /></svg>;
const BookmarkIcon = ({ filled }: { filled: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>;
const CatalogueIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7s0 4 8 4 8-4 8-4" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const rateSuffix: Record<ServiceProvider['rateType'], string> = {
    'per hour': 'hr', 'per day': 'day', 'per task': 'task', 'per month': 'mo', 'per piece work': 'item', 'per km': 'km', 'per sqm': 'm²', 'per cbm': 'm³', 'per appearance': 'show'
};

const ProfileView: React.FC<ProfileViewProps> = ({ 
    profileData, isOwner, isAuthenticated, onBack, onLogout, onUpdate, 
    onContactClick, onInitiateContact, savedContacts, onToggleSaveContact, 
    catalogueItems, onBook, onViewDocument, onViewCatalogue, onNavigate, onFlag, allDocuments = []
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [galleryTab, setGalleryTab] = useState<'skills' | 'works' | 'qr'>('skills');
    
    // Flag Modal state
    const [showFlagModal, setShowFlagModal] = useState(false);
    const [flagCategory, setFlagCategory] = useState('Inappropriate content / service');
    const [flagReasonText, setFlagReasonText] = useState('');
    
    // Batch Update State (Camera Only)
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [batchImages, setBatchImages] = useState<string[]>([]);
    const [batchDesc, setBatchDesc] = useState('');
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Edit State (Strict 280 char limit)
    const [editName, setEditName] = useState(profileData.name);
    const [editService, setEditService] = useState(profileData.service);
    const [editAbout, setEditAbout] = useState(profileData.about || '');
    const [editAvatarUrl, setEditAvatarUrl] = useState(profileData.avatarUrl);
    const [editCoverImageUrl, setEditCoverImageUrl] = useState(profileData.coverImageUrl || '');
    const [editButtons, setEditButtons] = useState<('call' | 'book' | 'chat' | 'whatsapp' | 'catalogue' | 'location' | 'document')[]>(
        (profileData.selectedProfileButtons?.length ? profileData.selectedProfileButtons : ['call', 'book', 'chat']) as any
    );

    const avatarFileInputRef = useRef<HTMLInputElement>(null);
    const coverFileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) setEditAvatarUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) setEditCoverImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const displayName = profileData.name || 'Guest User';
    const displayId = (displayName && profileData.id) ? `${displayName.split(' ')[0].toUpperCase()}-${profileData.id.slice(0,4)}` : 'ID-N/A';

    const handleCall = () => {
        if (!isAuthenticated) onContactClick();
        else if (onInitiateContact(profileData)) window.location.href = `tel:${profileData.phone}`;
    };

    const handleWhatsApp = () => {
        if (!isAuthenticated) onContactClick();
        else if (profileData.whatsapp && onInitiateContact(profileData)) window.open(`https://wa.me/${profileData.whatsapp}`, '_blank');
        else if (onInitiateContact(profileData)) window.open(`https://wa.me/${profileData.phone}`, '_blank');
    };
    
    const handleBook = () => {
        if (!isAuthenticated) onContactClick();
        else if (onInitiateContact(profileData)) onBook(profileData);
    };

    const handleUpdateProfile = () => {
        onUpdate({
            ...profileData,
            name: editName,
            service: editService,
            avatarUrl: editAvatarUrl || profileData.avatarUrl,
            coverImageUrl: editCoverImageUrl || profileData.coverImageUrl,
            about: editAbout.slice(0, 280),
            selectedProfileButtons: editButtons
        });
        setIsEditing(false);
    };

    const handleBatchCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        
        Array.from(files).forEach((file: File) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBatchImages(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const saveBatch = () => {
        if (batchImages.length === 0) return;
        const updatedWorks = [...(profileData.works || []), ...batchImages];
        const updatedAbout = batchDesc 
            ? `${batchDesc}\n\n${editAbout}`.slice(0, 280) 
            : editAbout;
        
        onUpdate({
            ...profileData,
            works: updatedWorks,
            about: updatedAbout
        });
        
        setBatchImages([]);
        setBatchDesc('');
        setShowBatchModal(false);
    };

    const ctaConfig: Record<string, { label: string; icon: React.ReactNode; action: () => void }> = {
        call: { label: 'Call', icon: <CallIcon />, action: handleCall },
        book: { label: 'Book', icon: <CalendarIcon />, action: handleBook },
        chat: { label: 'Chat', icon: <WhatsAppIcon />, action: handleWhatsApp },
        whatsapp: { label: 'WhatsApp', icon: <WhatsAppIcon />, action: handleWhatsApp },
        location: {
            label: 'Location',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
            action: () => alert(`Location: ${profileData.location}`)
        },
        document: {
            label: 'Doc',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
            action: () => {
                if (allDocuments && allDocuments.length > 0 && onViewDocument) {
                    onViewDocument(allDocuments[0]);
                } else {
                    alert('No credential documents available yet.');
                }
            }
        }
    };

    const activeButtons = profileData.selectedProfileButtons && profileData.selectedProfileButtons.length > 0
        ? profileData.selectedProfileButtons
        : ['call', 'book', 'chat'];

    const skillsList = (profileData.skills && profileData.skills.length > 0) ? profileData.skills : [
        {
            id: 'sk-default',
            skillTitle: profileData.service,
            category: 'Service Skill',
            certificationName: 'Accredited Skill Certificate',
            issuingSchool: 'Verified Provider',
            yearObtained: '2023',
            hourlyRate: profileData.hourlyRate,
            currency: profileData.currency || 'KES',
            description: profileData.about || 'Specialized professional service provider with verified neighborhood feedback.'
        }
    ];

    return (
        <div className="w-full max-w-md mx-auto bg-gray-50 h-screen flex flex-col overflow-hidden font-sans relative">
            {/* Flag / Report Modal */}
            {showFlagModal && (
                <div className="fixed inset-0 bg-black/85 z-[120] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4 border border-gray-100">
                        <div className="text-center">
                            <h2 className="text-lg font-black text-red-600 uppercase tracking-tight flex items-center justify-center gap-2">
                                <span>🚩</span> Flag Profile
                            </h2>
                            <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">
                                Report inappropriate profile or inaccurate info
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-black text-gray-600 uppercase tracking-wider mb-1">Reason Category</label>
                                <select 
                                    value={flagCategory} 
                                    onChange={(e) => setFlagCategory(e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white outline-none"
                                >
                                    <option value="Inappropriate content / service">Inappropriate content / service</option>
                                    <option value="Unresponsive / Wrong contact info">Unresponsive / Wrong contact info</option>
                                    <option value="Spam or Scam activity">Spam or Scam activity</option>
                                    <option value="Unprofessional behavior">Unprofessional behavior</option>
                                    <option value="Other reason">Other reason</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-600 uppercase tracking-wider mb-1">Write Reason for Flagging</label>
                                <textarea 
                                    value={flagReasonText}
                                    onChange={(e) => setFlagReasonText(e.target.value)}
                                    placeholder="Provide detailed reason for flagging this profile..."
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium h-24 focus:bg-white outline-none resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button 
                                onClick={() => setShowFlagModal(false)} 
                                className="flex-1 py-3 bg-gray-100 text-gray-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    const fullReason = flagReasonText.trim() 
                                        ? `${flagCategory}: ${flagReasonText.trim()}`
                                        : flagCategory;
                                    if (onFlag) onFlag(fullReason);
                                    setShowFlagModal(false);
                                    setFlagReasonText('');
                                    alert("Thank you! Your flag report has been submitted.");
                                }} 
                                className="flex-1 bg-red-600 text-white font-black py-3 rounded-xl shadow-md uppercase text-[10px] tracking-widest active:scale-95 hover:bg-red-700"
                            >
                                Submit Flag
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Batch Update Modal (Camera Only) */}
            {showBatchModal && (
                <div className="fixed inset-0 bg-black/85 z-[120] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
                        <div className="text-center">
                            <h2 className="text-lg font-black text-brand-navy uppercase tracking-tight">Update Works</h2>
                            <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">Camera Capture Only</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                {batchImages.map((img, i) => (
                                    <div key={i} className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 relative">
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                        <button onClick={() => setBatchImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">&times;</button>
                                    </div>
                                ))}
                                <button 
                                    onClick={() => cameraInputRef.current?.click()}
                                    className="w-16 h-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:bg-white transition-all flex-shrink-0"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                                    <span className="text-[7px] font-black uppercase mt-1">Capture</span>
                                </button>
                                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={handleBatchCameraCapture} />
                            </div>
                            
                            <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Work Description</label>
                                <textarea 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold h-20 focus:bg-white outline-none" 
                                    placeholder="Briefly describe these works..."
                                    value={batchDesc}
                                    onChange={e => setBatchDesc(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button onClick={() => setShowBatchModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-400 font-black text-[10px] uppercase tracking-widest rounded-xl">Cancel</button>
                            <button onClick={saveBatch} className="flex-1 bg-brand-navy text-white font-black py-3 rounded-xl shadow-md uppercase text-[10px] tracking-widest active:scale-95">Post Update</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden File Inputs for Avatar & Cover Image Upload */}
            <input 
                type="file" 
                ref={avatarFileInputRef} 
                onChange={handleAvatarUpload} 
                accept="image/*" 
                className="hidden" 
            />
            <input 
                type="file" 
                ref={coverFileInputRef} 
                onChange={handleCoverUpload} 
                accept="image/*" 
                className="hidden" 
            />

            {/* Main Scrollable Profile Container */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative">
                {/* Profile Header Cover Image & Actions */}
                <div className="relative">
                    <div className="h-28 bg-gray-300 overflow-hidden relative group">
                        <img src={isEditing ? editCoverImageUrl : (profileData.coverImageUrl || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=800')} alt="Cover" className="w-full h-full object-cover" />
                        {isOwner && (
                            <button 
                                type="button"
                                onClick={() => {
                                    setIsEditing(true);
                                    coverFileInputRef.current?.click();
                                }}
                                className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white px-2.5 py-1 rounded-full shadow-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 backdrop-blur-xs transition-all active:scale-95"
                                title="Change Header Banner"
                            >
                                <EditIcon />
                                <span>Cover</span>
                            </button>
                        )}
                    </div>
                    <button onClick={onBack} className="absolute top-3 left-3 bg-black/50 text-white rounded-full p-2 z-10 hover:bg-black transition-colors"><BackIcon /></button>
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                        {!isOwner && (
                            <div className="flex items-center gap-1.5">
                                <button 
                                    onClick={() => onToggleSaveContact(profileData.id)} 
                                    className={`font-black px-3 py-1.5 rounded-full shadow-md transition-all flex items-center gap-1.5 text-[10px] uppercase tracking-wider backdrop-blur-md border active:scale-95 ${
                                        savedContacts.includes(profileData.id) 
                                            ? 'bg-amber-400 text-black border-amber-300 font-black' 
                                            : 'bg-white/90 text-black border-white hover:bg-white'
                                    }`}
                                >
                                    <BookmarkIcon filled={savedContacts.includes(profileData.id)} />
                                    <span>{savedContacts.includes(profileData.id) ? 'Saved' : 'Save'}</span>
                                </button>
                                <button 
                                    onClick={() => setShowFlagModal(true)} 
                                    className="font-black px-2.5 py-1.5 rounded-full shadow-md transition-all flex items-center gap-1 text-[10px] uppercase tracking-wider bg-red-600/90 text-white hover:bg-red-700 border border-red-500 backdrop-blur-md active:scale-95"
                                    title="Flag or Report Profile"
                                >
                                    <span>🚩</span>
                                </button>
                            </div>
                        )}
                        {isOwner && (
                            <div className="relative flex items-center gap-2">
                                <button 
                                    onClick={() => setIsEditing(!isEditing)} 
                                    className={`rounded-full px-3 py-1.5 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md transition-all active:scale-95 ${
                                        isEditing ? 'bg-black text-white' : 'bg-white/90 text-black hover:bg-white'
                                    }`}
                                    title={isEditing ? 'Done Editing' : 'Edit Profile'}
                                >
                                    <EditIcon />
                                    <span>{isEditing ? 'Editing' : 'Edit'}</span>
                                </button>
                                <button onClick={() => setShowMenu(p => !p)} className="bg-white/90 rounded-full p-2 text-black hover:bg-white shadow-md"><SettingsIcon /></button>
                                {showMenu && (
                                    <div className="absolute right-0 top-11 mt-1 w-40 bg-white rounded-xl shadow-xl z-[60] border border-gray-100 overflow-hidden">
                                        <button onClick={onLogout} className="block px-4 py-3 text-xs text-red-600 w-full text-left font-black uppercase tracking-wider hover:bg-red-50">Logout</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {/* Avatar with Camera/Pen Upload Badge */}
                    <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white bg-gray-200 shadow-md overflow-hidden z-20 group">
                        <img className="object-cover w-full h-full" src={isEditing ? editAvatarUrl : profileData.avatarUrl} alt={displayName} />
                        {isOwner && (
                            <button 
                                type="button"
                                onClick={() => {
                                    setIsEditing(true);
                                    avatarFileInputRef.current?.click();
                                }}
                                className="absolute inset-0 bg-black/50 hover:bg-black/70 text-white flex flex-col items-center justify-center text-[8px] font-black uppercase tracking-wider transition-all"
                                title="Change Profile Avatar"
                            >
                                <CameraIcon />
                                <span>Avatar</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Profile Identity Info (Inline Editing) */}
                <div className="pt-11 px-4 text-center">
                    {isEditing ? (
                        <div className="space-y-2 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs text-left animate-fade-in">
                            <div>
                                <label className="flex items-center justify-between text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">
                                    <span>Your Name / Display Title</span>
                                    <span className="text-gray-400">✏️</span>
                                </label>
                                <input 
                                    value={editName} 
                                    onChange={e => setEditName(e.target.value)} 
                                    className="w-full p-2 text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-black" 
                                    placeholder="Enter Your Name" 
                                />
                            </div>
                            <div>
                                <label className="flex items-center justify-between text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">
                                    <span>Service Title / Profession</span>
                                    <span className="text-gray-400">✏️</span>
                                </label>
                                <input 
                                    value={editService} 
                                    onChange={e => setEditService(e.target.value)} 
                                    className="w-full p-2 text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-black" 
                                    placeholder="e.g. Electrician, Plumbing, Barber" 
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <div className="flex items-center justify-center gap-1.5">
                                <h1 className="text-xl font-black text-black">{isOwner ? `$KILL ID: ${displayId}` : displayName}</h1>
                                {profileData.isVerified && <VerifiedIcon className="w-5 h-5 text-black" />}
                                {isOwner && (
                                    <button 
                                        onClick={() => setIsEditing(true)} 
                                        className="text-gray-400 hover:text-black p-1 transition-colors"
                                        title="Edit Name"
                                    >
                                        <EditIcon />
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center justify-center gap-1 text-xs font-semibold text-gray-600">
                                <span>{profileData.service}</span>
                                {isOwner && (
                                    <button 
                                        onClick={() => setIsEditing(true)} 
                                        className="text-gray-400 hover:text-black p-0.5 transition-colors"
                                        title="Edit Service"
                                    >
                                        <EditIcon />
                                    </button>
                                )}
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{profileData.location}</p>

                            {/* $kill Dashboard Quick Shortcut for Owner */}
                            {isOwner && onNavigate && (
                                <div className="pt-2">
                                    <button 
                                        onClick={() => onNavigate('skill_id')}
                                        className="w-full bg-black text-white p-3 rounded-2xl flex items-center justify-between shadow-md hover:bg-gray-900 transition-all active:scale-95"
                                    >
                                        <div className="flex items-center gap-2.5 text-left">
                                            <span className="text-xl p-1 bg-white/20 rounded-xl">⚡</span>
                                            <div>
                                                <span className="text-xs font-black uppercase tracking-wider block leading-tight">$kill Dashboard</span>
                                                <span className="text-[9px] text-gray-300 font-semibold block">Manage certifications, daily rates & PDPs</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black uppercase bg-white text-black px-3 py-1.5 rounded-xl">Open &rarr;</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Quick stats / Rating Row */}
                <div className="mt-3 flex justify-around items-center text-gray-600 border-t border-b border-gray-100 py-2 bg-white shadow-xs">
                    <div className="text-center"><div className="flex items-center justify-center gap-0.5"><StarIcon className="w-3.5 h-3.5 text-yellow-500" /><span className="font-bold text-xs text-brand-navy">{profileData.rating.toFixed(1)}</span></div><p className="text-[8px] uppercase font-black text-gray-400 mt-0.5">Rating</p></div>
                    <div className="text-center"><div className="flex items-center justify-center gap-0.5"><LocationIcon className="w-3.5 h-3.5 text-red-500" /><span className="font-bold text-xs text-brand-navy">{profileData.distanceKm}km</span></div><p className="text-[8px] uppercase font-black text-gray-400 mt-0.5">Dist.</p></div>
                    <div className="text-center"><div className="flex items-center justify-center gap-0.5"><RateIcon className="w-3.5 h-3.5 text-green-500" /><span className="font-bold text-xs text-brand-navy">{profileData.currency}{profileData.hourlyRate}/{rateSuffix[profileData.rateType]}</span></div><p className="text-[8px] uppercase font-black text-gray-400 mt-0.5">Rate</p></div>
                </div>

                {/* Profile CTA Buttons Section */}
                <div className="px-4 pt-3">
                    {isEditing ? (
                        <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs space-y-2">
                            <label className="flex items-center justify-between text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                <span>Profile CTA Buttons (Select up to 3)</span>
                                <span className="text-gray-400">✏️</span>
                            </label>
                            <div className="grid grid-cols-3 gap-1.5">
                                {['call', 'book', 'chat', 'whatsapp', 'location', 'document'].map((btn) => {
                                    const isChecked = editButtons.includes(btn as any);
                                    const isDisabled = !isChecked && editButtons.length >= 3;
                                    return (
                                        <button
                                            key={btn}
                                            type="button"
                                            disabled={isDisabled}
                                            onClick={() => {
                                                if (isChecked) {
                                                    setEditButtons(editButtons.filter(b => b !== btn));
                                                } else {
                                                    if (editButtons.length < 3) {
                                                        setEditButtons([...editButtons, btn as any]);
                                                    }
                                                }
                                            }}
                                            className={`py-2 px-2 rounded-xl border text-center font-bold text-[9px] uppercase transition-all ${
                                                isChecked 
                                                    ? 'bg-black text-white border-black shadow-xs' 
                                                    : isDisabled 
                                                        ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed' 
                                                        : 'bg-gray-50 text-black border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            {btn}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            {activeButtons.map(btnKey => {
                                const config = ctaConfig[btnKey];
                                if (!config) return null;
                                return (
                                    <button 
                                        key={btnKey} 
                                        onClick={config.action} 
                                        className="flex-1 font-black py-3 px-3 rounded-xl bg-brand-navy text-white hover:bg-black transition flex items-center justify-center gap-1.5 text-[9.5px] uppercase tracking-wider shadow-md active:scale-95"
                                    >
                                        {config.icon}
                                        <span>{config.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* About / Bio Section */}
                <div id="gallery-section" className="p-4 mt-2">
                    <div className="flex justify-between items-center mb-2 ml-1">
                        <div className="flex items-center gap-1.5">
                            <h3 className="font-black text-[9px] uppercase tracking-widest text-gray-400">About / Bio</h3>
                            {isOwner && (
                                <button 
                                    onClick={() => setIsEditing(!isEditing)} 
                                    className="text-gray-400 hover:text-black p-0.5 transition-colors" 
                                    title="Edit Bio"
                                >
                                    <EditIcon />
                                </button>
                            )}
                        </div>
                        {isEditing && (
                            <span className={`text-[9px] font-bold ${editAbout.length > 280 ? 'text-red-500' : 'text-gray-400'}`}>
                                {editAbout.length}/280
                            </span>
                        )}
                    </div>
                    
                    {isEditing ? (
                        <div className="space-y-2">
                            <div className="relative">
                                <textarea 
                                    value={editAbout} 
                                    onChange={e => setEditAbout(e.target.value)} 
                                    className={`w-full p-3.5 text-sm font-medium text-gray-800 leading-relaxed bg-white rounded-2xl border outline-none shadow-xs ${editAbout.length > 280 ? 'border-red-500' : 'border-gray-300 focus:border-black'}`} 
                                    rows={4}
                                    placeholder="Write your bio or service summary (Max 280 characters)..."
                                    maxLength={280}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="relative group">
                            <p className="text-sm text-gray-700 leading-relaxed bg-white p-4 rounded-2xl shadow-xs border border-gray-100">
                                {profileData.about || 'Welcome to my profile! Feel free to reach out.'}
                            </p>
                            {isOwner && (
                                <button 
                                    onClick={() => setIsEditing(true)} 
                                    className="absolute top-2 right-2 bg-gray-50 hover:bg-gray-200 text-gray-600 hover:text-black p-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-gray-200"
                                    title="Edit Bio"
                                >
                                    <EditIcon />
                                </button>
                            )}
                        </div>
                    )}
                    
                    {/* Tabs ($kills / Works / QR ID) */}
                    <div className="border-b border-gray-100 mt-6 flex justify-between items-end">
                        <div className="flex gap-4">
                            <button onClick={() => setGalleryTab('skills')} className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${galleryTab === 'skills' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}>$kills</button>
                            <button onClick={() => setGalleryTab('works')} className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${galleryTab === 'works' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}>Works</button>
                            <button onClick={() => setGalleryTab('qr')} className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${galleryTab === 'qr' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}>QR ID</button>
                        </div>
                        {isOwner && galleryTab === 'works' && (
                            <button onClick={() => setShowBatchModal(true)} className="mb-3 p-2 bg-black text-white rounded-xl shadow-sm hover:bg-gray-800 transition-colors">
                                <PlusIcon />
                            </button>
                        )}
                    </div>

                    <div className="mt-4 pb-20">
                        {galleryTab === 'skills' && (
                            <div className="space-y-3">
                                {skillsList.map((sk: any, idx: number) => (
                                    <div key={sk.id || idx} className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <h4 className="font-black text-xs text-black">{sk.skillTitle || sk.name || profileData.service}</h4>
                                                    <span className="bg-black text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">Verified</span>
                                                </div>
                                                {(sk.certificationName || sk.issuingSchool) && (
                                                    <p className="text-[9px] font-bold text-gray-500 mt-0.5">
                                                        {sk.certificationName} • {sk.issuingSchool} {sk.yearObtained ? '(' + sk.yearObtained + ')' : ''}
                                                    </p>
                                                )}
                                            </div>
                                            {sk.hourlyRate > 0 && (
                                                <div className="text-right flex-shrink-0">
                                                    <span className="text-xs font-black text-black block">{sk.currency || 'KES'} {sk.hourlyRate.toLocaleString()}</span>
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase">Per {sk.rateType || 'hour'}</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-600 font-medium leading-relaxed bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                            {sk.description || profileData.about}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {galleryTab === 'works' && (
                            <div className="grid grid-cols-3 gap-2">
                                {(profileData.works || []).map((w, i) => <img key={i} src={w} className="aspect-square object-cover rounded-xl bg-gray-200" alt="" />)}
                                {(profileData.works || []).length === 0 && (
                                    <div className="col-span-3 py-10 text-center text-gray-300">
                                        <p className="text-[10px] font-black uppercase tracking-widest">No work samples captured</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {galleryTab === 'qr' && (
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 flex flex-col items-center justify-center shadow-inner">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PROFILE:${profileData.id}`} className="w-40 h-40 mix-blend-multiply" alt="QR Code" />
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6">Scan to verify credentials</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Action Bar when Editing is Active */}
            {isEditing && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-black/95 text-white backdrop-blur-md px-4 py-3 rounded-full shadow-2xl border border-white/20 flex items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-200">Editing Mode</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            type="button" 
                            onClick={() => {
                                setEditName(profileData.name);
                                setEditService(profileData.service);
                                setEditAbout(profileData.about || '');
                                setEditAvatarUrl(profileData.avatarUrl);
                                setEditCoverImageUrl(profileData.coverImageUrl || '');
                                setEditButtons((profileData.selectedProfileButtons?.length ? profileData.selectedProfileButtons : ['call', 'book', 'chat']) as any);
                                setIsEditing(false);
                            }}
                            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-[10px] font-black uppercase tracking-wider rounded-full transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            onClick={handleUpdateProfile}
                            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] font-black uppercase tracking-wider rounded-full transition-all shadow-md active:scale-95 flex items-center gap-1 font-bold"
                        >
                            <span>✓ Save All</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;

export default ProfileView;
