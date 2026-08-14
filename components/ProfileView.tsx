import React, { useState, useRef } from 'react';
import type { ServiceProvider, Document, CurrentPage, Coordinates } from '../types';
import { normalizeSkills } from '../utils/skills';
import { uploadImageToStorage, saveUserProfileToFirestore } from '../services/firebase';
import { resolveLocationCoordinates, recordLocationCheckIn, getLocalCheckInLogs } from '../utils/geoLocations';
import LocationPromptModal from './LocationPromptModal';
import SkillDetailModal from './SkillDetailModal';
import OrgDetailModal from './OrgDetailModal';
import SEOHead from './SEOHead';

const DEFAULT_PROFILE_COVER = 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=800';

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
  onUpdateCatalogueItem?: (item: any) => void;
  onDeleteCatalogueItem?: (itemId: string) => void;
  onBook: (provider: ServiceProvider) => void;
  onJoin: (provider: ServiceProvider) => void;
  isFlaggedByUser: boolean;
  onFlag: (reason: string) => void;
  allDocuments: Document[];
  onViewDocument: (doc: Document) => void;
  onViewCatalogue?: (provider: ServiceProvider) => void;
  onNavigate?: (page: CurrentPage) => void;
  onViewSaccoModal?: (provider: ServiceProvider) => void;
  onApproveSaccoMember?: (orgId: string, userId: string) => void;
  onRejectSaccoMember?: (orgId: string, userId: string) => void;
  onDisputeRating?: (providerId: string, reviewerName: string, rating: number, comment: string, disputeReason: string) => void;
  onResolveDispute?: (saccoId: string, disputeId: string, action: 'resolve' | 'dismiss') => void;
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
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

const rateSuffix: Record<ServiceProvider['rateType'], string> = {
    'per hour': 'hr', 'per day': 'day', 'per task': 'task', 'per month': 'mo', 'per piece work': 'item', 'per km': 'km', 'per sqm': 'm²', 'per cbm': 'm³', 'per appearance': 'show'
};

const ProfileView: React.FC<ProfileViewProps> = ({ 
    profileData, isOwner, isAuthenticated, onBack, onLogout, onUpdate, 
    onContactClick, onInitiateContact, savedContacts, onToggleSaveContact, 
    catalogueItems, onUpdateCatalogueItem, onDeleteCatalogueItem, onBook, onViewDocument, onViewCatalogue, onNavigate, onViewSaccoModal, onFlag, allDocuments = [],
    onApproveSaccoMember, onRejectSaccoMember, onDisputeRating, onResolveDispute
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [galleryTab, setGalleryTab] = useState<'skills' | 'works' | 'qr'>('skills');
    
    // Sacco Dispute Modal State
    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [disputeReason, setDisputeReason] = useState('');
    
    // Flag Modal state
    const [showFlagModal, setShowFlagModal] = useState(false);
    const [flagCategory, setFlagCategory] = useState('Inappropriate content / service');
    const [flagReasonText, setFlagReasonText] = useState('');

    // Location Prompt Modal State for Available for Hire Status Toggle
    const [showLocationPrompt, setShowLocationPrompt] = useState(false);

    // Selected Skill for Detail Modal
    const [selectedSkillForModal, setSelectedSkillForModal] = useState<any>(null);
    const [selectedOrgModal, setSelectedOrgModal] = useState<{ orgName: string; cert?: any } | null>(null);

    const handleToggleOnlineStatus = () => {
        if (!profileData.isOnline) {
            // Require location update before going Available for Hire
            setShowLocationPrompt(true);
        } else {
            // Go offline
            onUpdate({ ...profileData, isOnline: false });
        }
    };

    const handleConfirmLocationPrompt = (newLocation: string, coords?: Coordinates) => {
        const resolved = resolveLocationCoordinates(newLocation, coords);
        const updatedProfile: ServiceProvider = {
            ...profileData,
            isOnline: true,
            location: newLocation,
            latitude: coords?.lat || resolved.lat,
            longitude: coords?.lng || resolved.lng,
            lastCheckInAt: new Date().toISOString(),
            lastCheckInLocation: resolved.estateName
        };

        // Record check-in log on backend and local registry
        recordLocationCheckIn(
            profileData,
            newLocation,
            coords || { lat: resolved.lat, lng: resolved.lng },
            'live_status',
            `User checked in at ${newLocation} and went Live`
        ).catch(() => {});

        onUpdate(updatedProfile);
        setShowLocationPrompt(false);
    };

    // Editing Listing (Catalogue Item) State
    const [editingCatalogueItem, setEditingCatalogueItem] = useState<any | null>(null);

    // Editing Skill Rate Card State
    const [editingSkillItem, setEditingSkillItem] = useState<{
        id?: string;
        skillTitle: string;
        hourlyRate: number | string;
        rateType: ServiceProvider['rateType'];
        description: string;
        certificationName?: string;
        issuingSchool?: string;
        yearObtained?: string;
        isNew?: boolean;
    } | null>(null);

    const handleSaveCatalogueListing = () => {
        if (!editingCatalogueItem || !onUpdateCatalogueItem) return;
        onUpdateCatalogueItem(editingCatalogueItem);
        setEditingCatalogueItem(null);
    };

    const handleDeleteCatalogueListing = (itemId: string) => {
        if (window.confirm("Are you sure you want to delete this service listing?")) {
            if (onDeleteCatalogueItem) {
                onDeleteCatalogueItem(itemId);
            }
        }
    };

    const handleSaveSkillCard = () => {
        if (!editingSkillItem) return;
        const currentSkills = normalizeSkills(profileData.skills);
        
        let updatedSkills: any[];
        if (editingSkillItem.isNew) {
            const newSk = {
                id: `sk_${Date.now()}`,
                skillTitle: editingSkillItem.skillTitle || profileData.service || 'Service Skill',
                category: 'Service Skill',
                hourlyRate: Number(editingSkillItem.hourlyRate) || 0,
                rateType: editingSkillItem.rateType || 'per hour',
                currency: profileData.currency || 'KES',
                description: editingSkillItem.description || '',
                certificationName: editingSkillItem.certificationName || '',
                issuingSchool: editingSkillItem.issuingSchool || '',
                yearObtained: editingSkillItem.yearObtained || new Date().getFullYear().toString()
            };
            updatedSkills = [newSk, ...currentSkills];
        } else {
            updatedSkills = currentSkills.map(s => (s.id === editingSkillItem.id || (!s.id && currentSkills.length === 1)) ? {
                ...s,
                skillTitle: editingSkillItem.skillTitle,
                hourlyRate: Number(editingSkillItem.hourlyRate) || 0,
                rateType: editingSkillItem.rateType,
                description: editingSkillItem.description,
                certificationName: editingSkillItem.certificationName,
                issuingSchool: editingSkillItem.issuingSchool,
                yearObtained: editingSkillItem.yearObtained
            } : s);
            if (!currentSkills.some(s => s.id === editingSkillItem.id) && currentSkills.length === 0) {
                updatedSkills = [{
                    id: `sk_${Date.now()}`,
                    skillTitle: editingSkillItem.skillTitle,
                    category: 'Service Skill',
                    hourlyRate: Number(editingSkillItem.hourlyRate) || 0,
                    rateType: editingSkillItem.rateType,
                    currency: profileData.currency || 'KES',
                    description: editingSkillItem.description,
                    certificationName: editingSkillItem.certificationName,
                    issuingSchool: editingSkillItem.issuingSchool,
                    yearObtained: editingSkillItem.yearObtained
                }];
            }
        }

        onUpdate({
            ...profileData,
            skills: updatedSkills
        });
        setEditingSkillItem(null);
    };

    const handleDeleteSkillCard = (skillId: string) => {
        if (!window.confirm("Are you sure you want to delete this skill rating card?")) return;
        const currentSkills = normalizeSkills(profileData.skills);
        const updatedSkills = currentSkills.filter(s => s.id !== skillId);
        onUpdate({
            ...profileData,
            skills: updatedSkills
        });
    };
    
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
    const [editCoverImageUrl, setEditCoverImageUrl] = useState(profileData.coverImageUrl || DEFAULT_PROFILE_COVER);
    const [editButtons, setEditButtons] = useState<('call' | 'book' | 'chat' | 'whatsapp' | 'catalogue' | 'location' | 'document')[]>(
        (profileData.selectedProfileButtons?.length ? profileData.selectedProfileButtons : ['call', 'book', 'chat']) as any
    );

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [isUploadingImages, setIsUploadingImages] = useState(false);

    const avatarFileInputRef = useRef<HTMLInputElement>(null);
    const coverFileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) setEditAvatarUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCoverFile(file);
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

    const handleUpdateProfile = async () => {
        setIsUploadingImages(true);
        try {
            let finalAvatarUrl = profileData.avatarUrl;
            let finalCoverImageUrl = profileData.coverImageUrl || DEFAULT_PROFILE_COVER;

            // 1. Upload Avatar File/Data URL to Firebase Storage if changed
            if (avatarFile) {
                finalAvatarUrl = await uploadImageToStorage(
                    avatarFile,
                    `users/${profileData.id}/avatar_${Date.now()}`
                );
            } else if (editAvatarUrl && editAvatarUrl.startsWith('data:')) {
                finalAvatarUrl = await uploadImageToStorage(
                    editAvatarUrl,
                    `users/${profileData.id}/avatar_${Date.now()}`
                );
            } else if (editAvatarUrl) {
                finalAvatarUrl = editAvatarUrl;
            }

            // 2. Upload Cover Image File/Data URL to Firebase Storage if changed
            if (coverFile) {
                finalCoverImageUrl = await uploadImageToStorage(
                    coverFile,
                    `users/${profileData.id}/cover_${Date.now()}`
                );
            } else if (editCoverImageUrl && editCoverImageUrl.startsWith('data:')) {
                finalCoverImageUrl = await uploadImageToStorage(
                    editCoverImageUrl,
                    `users/${profileData.id}/cover_${Date.now()}`
                );
            } else if (editCoverImageUrl) {
                finalCoverImageUrl = editCoverImageUrl;
            }

            const updatedProfile: ServiceProvider = {
                ...profileData,
                name: editName,
                service: editService,
                avatarUrl: finalAvatarUrl,
                coverImageUrl: finalCoverImageUrl,
                about: editAbout.slice(0, 280),
                selectedProfileButtons: editButtons
            };

            // 3. Save directly into user document in Cloud Firestore (non-blocking)
            saveUserProfileToFirestore(profileData.id, updatedProfile).catch(console.error);

            // 4. Update application state
            onUpdate(updatedProfile);
            setIsEditing(false);
            setAvatarFile(null);
            setCoverFile(null);
        } catch (err) {
            console.error("Error updating profile images or saving:", err);
            alert("An error occurred while saving profile changes. Please try again.");
        } finally {
            setIsUploadingImages(false);
        }
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

    const normalizedProfileSkills = normalizeSkills(profileData.skills);
    const skillsList = normalizedProfileSkills.length > 0 ? normalizedProfileSkills : [
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
                {/* STICKY E-COMMERCE TOP BAR WITH BACK BUTTON */}
                <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-3 py-2 flex items-center justify-between shadow-2xs">
                    <button 
                        onClick={onBack} 
                        className="flex items-center gap-1.5 text-xs font-black text-gray-900 bg-gray-100 hover:bg-black hover:text-white px-3 py-1.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-2xs"
                        title="Back to Service Listings"
                    >
                        <span className="text-sm font-bold">←</span>
                        <span>Back to Services</span>
                    </button>
                    <div className="flex items-center gap-1.5">
                        <button 
                            onClick={onBack}
                            className="text-[10.5px] font-bold text-gray-600 hover:text-black bg-gray-100 hover:bg-gray-200 border border-gray-200 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95"
                            title="Close View"
                        >
                            Close ✕
                        </button>
                    </div>
                </div>

                {/* Profile Header Cover Image & Actions */}
                <div className="relative">
                    <div className="h-28 bg-gray-300 overflow-hidden relative group">
                        <img src={isEditing ? (editCoverImageUrl || DEFAULT_PROFILE_COVER) : (profileData.coverImageUrl || DEFAULT_PROFILE_COVER)} alt="Cover" className="w-full h-full object-cover" />
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
                                {!savedContacts.includes(profileData.id) && (
                                    <button 
                                        onClick={() => onToggleSaveContact(profileData.id)} 
                                        className="font-black px-3.5 py-1.5 rounded-full shadow-md transition-all flex items-center gap-1.5 text-[10px] uppercase tracking-wider bg-black text-white hover:bg-neutral-800 border border-black active:scale-95 cursor-pointer"
                                        title="Save Contact to Phonebook"
                                    >
                                        <BookmarkIcon filled={false} />
                                        <span>Save Contact</span>
                                    </button>
                                )}
                                <button 
                                    onClick={() => setShowFlagModal(true)} 
                                    className="font-black px-2.5 py-1.5 rounded-full shadow-md transition-all flex items-center gap-1 text-[10px] uppercase tracking-wider bg-red-600/90 text-white hover:bg-red-700 border border-red-500 backdrop-blur-md active:scale-95 cursor-pointer"
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
                    {/* Avatar with Camera/Pen Upload Badge & Online Status Indicator Dot */}
                    <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 z-20">
                        <div className="w-20 h-20 rounded-full border-4 border-white bg-gray-200 shadow-md overflow-hidden relative group">
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

                        {/* Avatar Thumbnail Online Indicator Dot */}
                        {profileData.isOnline && (
                            <button
                                type="button"
                                onClick={isOwner ? handleToggleOnlineStatus : undefined}
                                className={`absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full z-30 shadow-xs flex items-center justify-center ${isOwner ? 'cursor-pointer hover:scale-110' : ''}`}
                                title={isOwner ? "Online (Click to toggle)" : "Online Now"}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
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
                                <h1 className="text-xl font-black text-black">{isOwner ? `SKILL ID: ${displayId}` : displayName}</h1>
                                {(() => {
                                    const isSaccoConfirmed = profileData.isSaccoVerified || profileData.saccoMember?.status === 'Confirmed' || profileData.saccoMember?.status === 'Approved';
                                    if (!isSaccoConfirmed && profileData.isVerified) {
                                        return <VerifiedIcon className="w-5 h-5 text-blue-500" />;
                                    }
                                    return null;
                                })()}
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

                            {/* Sacco Badge or Green Certified Badge */}
                            {(() => {
                                const isSaccoConfirmed = profileData.isSaccoVerified || profileData.saccoMember?.status === 'Confirmed' || profileData.saccoMember?.status === 'Approved';
                                const saccoName = profileData.saccoMember?.saccoName || 'Sacco Member';
                                return (
                                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                                        {isSaccoConfirmed ? (
                                            <div className="flex items-center gap-1 text-[11px] font-bold text-black bg-white border border-black px-3 py-0.5 shadow-2xs">
                                                <span>a member of</span>
                                                <button 
                                                    onClick={() => {
                                                        if (onViewSaccoModal) {
                                                            onViewSaccoModal(profileData);
                                                        } else {
                                                            alert(`Member of ${saccoName}`);
                                                        }
                                                    }}
                                                    className="font-black text-black underline hover:bg-black hover:text-white px-1 transition-colors cursor-pointer"
                                                    title="Click to view Sacco & Organization Profile"
                                                >
                                                    {saccoName}
                                                </button>
                                            </div>
                                        ) : profileData.isVerified ? (
                                            <span className="bg-emerald-600 text-white text-[9.5px] font-bold px-2.5 py-0.5 uppercase tracking-wider flex items-center gap-1 border border-emerald-500 shadow-2xs">
                                                <span>✓</span>
                                                <span>VERIFIED</span>
                                            </span>
                                        ) : profileData.saccoMember?.status === 'Pending' ? (
                                            <span className="bg-white border border-gray-400 text-gray-800 text-[9.5px] font-bold px-2.5 py-0.5 uppercase tracking-wider flex items-center gap-1">
                                                <span>Sacco Verification Pending</span>
                                            </span>
                                        ) : null}


                                    </div>
                                );
                            })()}



                            <div className="flex items-center justify-center gap-1 text-xs font-semibold text-gray-600 pt-1">
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
                    <div className="text-center"><div className="flex items-center justify-center gap-0.5"><LocationIcon className="w-3.5 h-3.5 text-red-500" /><span className="font-bold text-xs text-brand-navy">{typeof profileData.distanceKm === 'number' ? `${profileData.distanceKm.toFixed(1)}km` : 'Nearby'}</span></div><p className="text-[8px] uppercase font-black text-gray-400 mt-0.5">Dist.</p></div>
                    <div className="text-center"><div className="flex items-center justify-center gap-0.5"><RateIcon className="w-3.5 h-3.5 text-green-500" /><span className="font-bold text-xs text-brand-navy">{profileData.currency}{profileData.hourlyRate}/{rateSuffix[profileData.rateType]}</span></div><p className="text-[8px] uppercase font-black text-gray-400 mt-0.5">Rate</p></div>
                </div>

                {/* Sacco Member Boost & Rating Dispute Banner */}
                {(() => {
                    const isSaccoConfirmed = profileData.isSaccoVerified || profileData.saccoMember?.status === 'Confirmed' || profileData.saccoMember?.status === 'Approved';
                    if (!isSaccoConfirmed) return null;
                    return (
                        <div className="mx-4 mt-3 bg-blue-50/90 border border-blue-200 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-2xs">
                            <div className="flex items-center gap-2.5 text-left">
                                <span className="text-xl p-1.5 bg-blue-600 text-white rounded-xl shadow-xs">💙</span>
                                <div>
                                    <span className="text-xs font-black text-blue-950 uppercase tracking-wider block leading-tight">Sacco Member (+0.3 Rating Boost)</span>
                                    <span className="text-[9.5px] text-blue-800 font-semibold block mt-0.5">Confirmed member of {profileData.saccoMember?.saccoName || 'Registered Sacco'}. Rating disputes audited by Sacco.</span>
                                </div>
                            </div>
                            {!isOwner && onDisputeRating && (
                                <button
                                    onClick={() => setShowDisputeModal(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[9px] uppercase px-3 py-2 rounded-xl shadow-sm transition-colors flex-shrink-0"
                                >
                                    ⚖️ Dispute Rating
                                </button>
                            )}
                        </div>
                    );
                })()}

                {/* Sacco Organization Shortcut (Only for profile owner) */}
                {isOwner && profileData.accountType === 'organization' && onNavigate && (
                    <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl shadow-lg border border-blue-500/30 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl p-2 bg-white/10 rounded-2xl">🏢</span>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-blue-200">
                                    Sacco & Organization Portal
                                </h3>
                                <p className="text-[10px] text-gray-300">
                                    Add/remove members, approve requests & update public Sacco profile.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => onNavigate('sacco_dashboard')}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider px-3 py-2 rounded-xl shadow-md active:scale-95 transition-all flex-shrink-0"
                        >
                            Open Dashboard &rarr;
                        </button>
                    </div>
                )}

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
                        <div className="grid grid-cols-3 gap-2 w-full">
                            {['call', 'book', 'chat'].map(btnKey => {
                                const config = ctaConfig[btnKey];
                                if (!config) return null;
                                return (
                                    <button 
                                        key={btnKey} 
                                        onClick={config.action} 
                                        className="w-full font-black py-3 px-2 rounded-xl bg-brand-navy text-white hover:bg-black transition flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider shadow-md active:scale-95 cursor-pointer"
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
                    
                    {/* Tabs ($kills / Listings / QR ID) */}
                    <div className="border-b border-gray-100 mt-6 flex justify-between items-end">
                        <div className="flex gap-4">
                            <button onClick={() => setGalleryTab('skills')} className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${galleryTab === 'skills' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}>$kills</button>
                            <button onClick={() => setGalleryTab('works')} className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${galleryTab === 'works' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}>Listings</button>
                            <button onClick={() => setGalleryTab('qr')} className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${galleryTab === 'qr' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}>QR ID</button>
                        </div>
                        {isOwner && galleryTab === 'works' && (
                            <button 
                              onClick={() => onNavigate ? onNavigate('sellService') : setShowBatchModal(true)} 
                              className="mb-3 px-3 py-1.5 bg-brand-navy text-white text-[10px] font-black uppercase rounded-xl shadow-xs hover:bg-black transition-colors flex items-center gap-1"
                              title="List a new service for sale"
                            >
                              <span>+ Sell Service</span>
                            </button>
                        )}
                    </div>

                    <div className="mt-4 pb-20">
                        {galleryTab === 'skills' && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between pb-1">
                                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                                        Skill Rate Cards & Offerings ({skillsList.length})
                                    </h3>
                                    {isOwner && (
                                        <button 
                                            onClick={() => setEditingSkillItem({
                                                isNew: true,
                                                skillTitle: profileData.service || '',
                                                hourlyRate: profileData.hourlyRate || 500,
                                                rateType: profileData.rateType || 'per hour',
                                                description: '',
                                                certificationName: '',
                                                issuingSchool: '',
                                                yearObtained: new Date().getFullYear().toString()
                                            })}
                                            className="text-[10px] text-brand-navy font-bold hover:underline flex items-center gap-1 bg-brand-navy/10 px-2 py-1 rounded-lg"
                                        >
                                            + Add Skill Rate Card
                                        </button>
                                    )}
                                </div>
                                {skillsList.map((sk: any, idx: number) => (
                                    <div 
                                        key={sk.id || idx} 
                                        onClick={() => setSelectedSkillForModal({
                                            ...sk,
                                            skillTitle: sk.skillTitle || sk.name || profileData.service,
                                            providerName: profileData.name,
                                            providerAvatar: profileData.avatarUrl,
                                            hourlyRate: sk.hourlyRate || profileData.hourlyRate
                                        })}
                                        className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs hover:border-black transition-all space-y-2 cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <h4 className="font-black text-xs text-black group-hover:underline">{sk.skillTitle || sk.name || profileData.service}</h4>
                                                    <span className="bg-black text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">Verified</span>
                                                </div>
                                                {(sk.certificationName || sk.issuingSchool) && (
                                                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                                        <span className="text-[10px] font-extrabold text-black">
                                                            {sk.certificationName || 'Certified Competency'}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedOrgModal({
                                                                    orgName: sk.issuingSchool || 'Accredited Institution',
                                                                    cert: sk
                                                                });
                                                            }}
                                                            className="text-[8.5px] font-black uppercase text-black bg-neutral-100 hover:bg-black hover:text-white px-1.5 py-0.5 rounded border border-neutral-300 transition-colors flex items-center gap-0.5 cursor-pointer"
                                                            title="Click to view certifying organization profile & offers"
                                                        >
                                                            <span>🏢 {sk.issuingSchool || 'NITA'} ({sk.yearObtained || '2024'})</span>
                                                            <span>&rarr;</span>
                                                        </button>
                                                        {sk.licenseNumber && (
                                                            <span className="text-[8.5px] font-mono font-bold text-neutral-600 bg-neutral-50 px-1 py-0.2 rounded border border-neutral-200">
                                                                Lic #{sk.licenseNumber}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {sk.hourlyRate > 0 && (
                                                <div className="text-right flex-shrink-0">
                                                    <span className="text-xs font-black text-black block">{sk.currency || 'KES'} {(sk.hourlyRate || 0).toLocaleString()}</span>
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase">Per {sk.rateType || 'hour'}</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-600 font-medium leading-relaxed bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                            {sk.description || profileData.about}
                                        </p>
                                        
                                        <div className="flex items-center justify-between pt-1 text-[10px] font-bold text-black border-t border-dashed border-gray-100">
                                            <span className="text-gray-500 group-hover:text-black transition-colors flex items-center gap-1">
                                                <span>⚡ Tap for certification, scope & work samples &rarr;</span>
                                            </span>
                                            {isOwner && (
                                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => setEditingSkillItem({
                                                            id: sk.id || `sk_${idx}`,
                                                            skillTitle: sk.skillTitle || sk.name || profileData.service,
                                                            hourlyRate: sk.hourlyRate || 0,
                                                            rateType: sk.rateType || 'per hour',
                                                            description: sk.description || '',
                                                            certificationName: sk.certificationName || '',
                                                            issuingSchool: sk.issuingSchool || '',
                                                            yearObtained: sk.yearObtained || ''
                                                        })}
                                                        className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <EditIcon /> <span>Edit</span>
                                                    </button>
                                                    {skillsList.length > 1 && (
                                                        <button
                                                            onClick={() => handleDeleteSkillCard(sk.id || `sk_${idx}`)}
                                                            className="text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <TrashIcon /> <span>Delete</span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {galleryTab === 'works' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                                        Services Listed for Sale ({ (catalogueItems || []).length })
                                    </h3>
                                    {isOwner && (
                                        <button 
                                            onClick={() => onNavigate && onNavigate('sellService')}
                                            className="text-[10px] text-brand-navy font-bold hover:underline"
                                        >
                                            + Add Service Listing
                                        </button>
                                    )}
                                </div>

                                {/* Listed Catalogue / Service Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {(catalogueItems || []).map((item: any) => (
                                        <div key={item.id} className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col justify-between p-3 space-y-2">
                                            <div className="flex gap-3 items-center">
                                                <img 
                                                    src={item.imageUrls?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300'} 
                                                    alt={item.title} 
                                                    className="w-16 h-16 rounded-xl object-cover bg-gray-100 border border-gray-100 flex-shrink-0"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <span className="bg-brand-navy/10 text-brand-navy text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase truncate">
                                                            {item.category}
                                                        </span>
                                                        {item.isVerified ? (
                                                            <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                                                ✓ Verified
                                                            </span>
                                                        ) : (
                                                            <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded-md">
                                                                ⏳ Pending Admin
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 className="font-extrabold text-xs text-gray-900 mt-1 leading-snug line-clamp-1">
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-xs font-black text-brand-navy mt-0.5">
                                                        {item.price}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-gray-600 line-clamp-2 font-medium bg-gray-50 p-2 rounded-xl">
                                                {item.description}
                                            </p>

                                            {isOwner && (
                                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                                                    <button
                                                        onClick={() => setEditingCatalogueItem({ ...item })}
                                                        className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg flex items-center gap-1"
                                                    >
                                                        <EditIcon /> <span>Edit Listing</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCatalogueListing(item.id)}
                                                        className="text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg flex items-center gap-1"
                                                    >
                                                        <TrashIcon /> <span>Delete</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {(catalogueItems || []).length === 0 && (
                                        <div className="col-span-full py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-4 space-y-2">
                                            <span className="text-2xl">🛍️</span>
                                            <p className="text-xs font-bold text-gray-700">No active service listings published</p>
                                            <p className="text-[10px] text-gray-500 max-w-xs mx-auto">
                                                {isOwner 
                                                    ? "Publish your skill rate card (e.g. Maths Tuition at Ksh 200/hr or TV Mounting) to appear on Tukosoko."
                                                    : "This provider has not added specific service rate cards yet."}
                                            </p>
                                            {isOwner && (
                                                <button
                                                    onClick={() => onNavigate && onNavigate('sellService')}
                                                    className="mt-2 bg-brand-navy text-white text-xs font-black px-4 py-2 rounded-xl uppercase tracking-wider hover:bg-black transition-colors"
                                                >
                                                    🚀 List Service for Sale
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Work Portfolio Photos */}
                                {(profileData.works || []).length > 0 && (
                                    <div className="pt-3 border-t border-gray-100 space-y-2">
                                        <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                            Work Portfolio & Photo Gallery
                                        </h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(profileData.works || []).map((w, i) => (
                                                <img key={i} src={w} className="aspect-square object-cover rounded-xl bg-gray-200 border border-gray-100" alt="" />
                                            ))}
                                        </div>
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
                                setEditCoverImageUrl(profileData.coverImageUrl || DEFAULT_PROFILE_COVER);
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

            {/* Sacco Rating Dispute Modal */}
            {showDisputeModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <div>
                                <h3 className="text-base font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                                    <span>⚖️</span> File Rating Dispute via Sacco
                                </h3>
                                <p className="text-[10px] text-gray-500 font-bold">
                                    Submit audit request to {profileData.saccoMember?.saccoName || 'Registered Sacco'}
                                </p>
                            </div>
                            <button onClick={() => setShowDisputeModal(false)} className="text-gray-400 hover:text-black font-bold text-xl">&times;</button>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-600 tracking-wider block">
                                Reason for Rating Dispute:
                            </label>
                            <textarea
                                value={disputeReason}
                                onChange={e => setDisputeReason(e.target.value)}
                                placeholder="Explain why this rating or review is inaccurate or disputed (e.g. Unfair rating due to client cancellation or delayed parts delivery)..."
                                rows={4}
                                className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setShowDisputeModal(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (!disputeReason.trim()) return;
                                    if (onDisputeRating) {
                                        onDisputeRating(profileData.id, 'User / Client', profileData.rating, 'Customer Review', disputeReason.trim());
                                    }
                                    setShowDisputeModal(false);
                                    setDisputeReason('');
                                    alert(`Dispute ticket submitted to ${profileData.saccoMember?.saccoName || 'Sacco Executive Committee'} for audit.`);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 shadow-md"
                            >
                                Submit Dispute Ticket
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Service Listing Modal */}
            {editingCatalogueItem && (
                <div className="fixed inset-0 bg-black/80 z-[120] flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <div>
                                <h3 className="text-base font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                                    <span>✏️</span> Edit Service Listing
                                </h3>
                                <p className="text-[10px] text-gray-500 font-bold">Update service details listed on Tukosoko marketplace</p>
                            </div>
                            <button onClick={() => setEditingCatalogueItem(null)} className="text-gray-400 hover:text-black font-bold text-xl">&times;</button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-600 tracking-wider block mb-1">Listing Title</label>
                                <input 
                                    type="text"
                                    value={editingCatalogueItem.title || ''}
                                    onChange={e => setEditingCatalogueItem({ ...editingCatalogueItem, title: e.target.value })}
                                    className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-600 tracking-wider block mb-1">Category</label>
                                <input 
                                    type="text"
                                    value={editingCatalogueItem.category || ''}
                                    onChange={e => setEditingCatalogueItem({ ...editingCatalogueItem, category: e.target.value })}
                                    className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-600 tracking-wider block mb-1">Price / Rate (e.g. Ksh 500 per hr)</label>
                                <input 
                                    type="text"
                                    value={editingCatalogueItem.price || ''}
                                    onChange={e => setEditingCatalogueItem({ ...editingCatalogueItem, price: e.target.value })}
                                    className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-600 tracking-wider block mb-1">Description</label>
                                <textarea 
                                    rows={3}
                                    value={editingCatalogueItem.description || ''}
                                    onChange={e => setEditingCatalogueItem({ ...editingCatalogueItem, description: e.target.value })}
                                    className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white focus:outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-600 tracking-wider block mb-1">Image URL</label>
                                <input 
                                    type="text"
                                    value={editingCatalogueItem.imageUrls?.[0] || ''}
                                    onChange={e => setEditingCatalogueItem({ 
                                        ...editingCatalogueItem, 
                                        imageUrls: [e.target.value] 
                                    })}
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                            <button
                                onClick={() => setEditingCatalogueItem(null)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveCatalogueListing}
                                className="px-4 py-2 bg-brand-navy text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black shadow-md"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit / Add Skill Rate Card Modal */}
            {editingSkillItem && (
                <div className="fixed inset-0 bg-black/80 z-[120] flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <div>
                                <h3 className="text-base font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                                    <span>🎯</span> {editingSkillItem.isNew ? 'Add Skill Rate Card' : 'Edit Skill Rate Card'}
                                </h3>
                                <p className="text-[10px] text-gray-500 font-bold">Configure skill details and pricing visible on your profile</p>
                            </div>
                            <button onClick={() => setEditingSkillItem(null)} className="text-gray-400 hover:text-black font-bold text-xl">&times;</button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-600 tracking-wider block mb-1">Skill Title / Offering</label>
                                <input 
                                    type="text"
                                    value={editingSkillItem.skillTitle || ''}
                                    onChange={e => setEditingSkillItem({ ...editingSkillItem, skillTitle: e.target.value })}
                                    placeholder="e.g. Electrical Installation, Hair Braiding"
                                    className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white focus:outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-600 tracking-wider block mb-1">Rate (KES)</label>
                                    <input 
                                        type="number"
                                        value={editingSkillItem.hourlyRate || ''}
                                        onChange={e => setEditingSkillItem({ ...editingSkillItem, hourlyRate: e.target.value })}
                                        placeholder="500"
                                        className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-600 tracking-wider block mb-1">Rate Unit</label>
                                    <select
                                        value={editingSkillItem.rateType || 'per hour'}
                                        onChange={e => setEditingSkillItem({ ...editingSkillItem, rateType: e.target.value as any })}
                                        className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white focus:outline-none"
                                    >
                                        <option value="per hour">per hour</option>
                                        <option value="per day">per day</option>
                                        <option value="per task">per task</option>
                                        <option value="per month">per month</option>
                                        <option value="per piece work">per item</option>
                                        <option value="per km">per km</option>
                                        <option value="per sqm">per m²</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-600 tracking-wider block mb-1">Skill Description / Scope</label>
                                <textarea 
                                    rows={3}
                                    value={editingSkillItem.description || ''}
                                    onChange={e => setEditingSkillItem({ ...editingSkillItem, description: e.target.value })}
                                    placeholder="Describe what is included in this service..."
                                    className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white focus:outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-600 tracking-wider block mb-1">Certification Name (Optional)</label>
                                <input 
                                    type="text"
                                    value={editingSkillItem.certificationName || ''}
                                    onChange={e => setEditingSkillItem({ ...editingSkillItem, certificationName: e.target.value })}
                                    placeholder="e.g. EPRA Class T3 License"
                                    className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white focus:outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-600 tracking-wider block mb-1">Issuing Body / Institution</label>
                                    <input 
                                        type="text"
                                        value={editingSkillItem.issuingSchool || ''}
                                        onChange={e => setEditingSkillItem({ ...editingSkillItem, issuingSchool: e.target.value })}
                                        placeholder="e.g. NITA / TVET"
                                        className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-600 tracking-wider block mb-1">Year Obtained</label>
                                    <input 
                                        type="text"
                                        value={editingSkillItem.yearObtained || ''}
                                        onChange={e => setEditingSkillItem({ ...editingSkillItem, yearObtained: e.target.value })}
                                        placeholder="2022"
                                        className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                            <button
                                onClick={() => setEditingSkillItem(null)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveSkillCard}
                                className="px-4 py-2 bg-brand-navy text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black shadow-md"
                            >
                                Save Skill Rate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <SEOHead provider={profileData} />

            <LocationPromptModal 
                isOpen={showLocationPrompt}
                onClose={() => setShowLocationPrompt(false)}
                currentLocation={profileData.location}
                onConfirm={handleConfirmLocationPrompt}
            />

            <SkillDetailModal 
                isOpen={Boolean(selectedSkillForModal)}
                onClose={() => setSelectedSkillForModal(null)}
                skill={selectedSkillForModal}
                onBookOrContact={() => onBook(profileData)}
            />

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

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>;

export default ProfileView;
