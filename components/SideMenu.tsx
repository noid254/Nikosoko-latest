import React, { useState } from 'react';
import type { ServiceProvider, CurrentPage } from '../types';
import LocationPromptModal from './LocationPromptModal';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: CurrentPage | 'profile' | 'login' | 'skill_id') => void;
  currentUser: ServiceProvider | null;
  isSuperAdmin: boolean;
  onLogout: () => void;
  onOpenCompleteSignUp?: () => void;
  onOpenSEOMap?: () => void;
  onUpdateUser?: (updated: ServiceProvider) => void;
}

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onNavigate, currentUser, isSuperAdmin, onLogout, onOpenCompleteSignUp, onOpenSEOMap, onUpdateUser }) => {
    const isOnline = Boolean(currentUser?.isOnline);
    const [showLocationPrompt, setShowLocationPrompt] = useState(false);
    const [showSaccoNotice, setShowSaccoNotice] = useState(false);

    if (!isOpen) return null;

    const handleToggleAvailability = () => {
        if (!currentUser) return;
        if (!isOnline) {
            // Require location update before going Available for Hire
            setShowLocationPrompt(true);
        } else {
            // Go offline
            onUpdateUser?.({
                ...currentUser,
                isOnline: false
            });
        }
    };

    const handleConfirmLocation = (newLocation: string) => {
        if (!currentUser) return;
        onUpdateUser?.({
            ...currentUser,
            isOnline: true,
            location: newLocation
        });
        setShowLocationPrompt(false);
    };

    const hasCatalogueActive = Boolean(currentUser?.hasCatalogue || (currentUser?.catalogueItems && currentUser.catalogueItems.length > 0));

    const isSaccoAuthorized = Boolean(
        currentUser && (
            currentUser.accountType === 'organization' ||
            currentUser.saccoCode ||
            currentUser.saccoMember ||
            currentUser.phone === '+254700000000' ||
            isSuperAdmin
        )
    );

    const baseNavItems: { label: string; page: CurrentPage | 'profile' | 'skill_id'; icon: string; description: string }[] = [
        { label: 'NikoSoko', page: 'home', icon: '🏪', description: 'Find & connect with nearby skilled professionals & service listings' },
        { label: '$kill Hub', page: 'skill_id', icon: '⚡', description: 'Add skills, verify, view demand heatmaps & upgrade skills' },
    ];

    if (isSaccoAuthorized) {
        baseNavItems.push({ 
            label: 'Sacco & Org Portal', 
            page: 'sacco_dashboard' as const, 
            icon: '🏢', 
            description: 'Security vetting, member approvals, services & courses' 
        });
    }

    baseNavItems.push({ 
        label: 'Saved Contacts', 
        page: 'mycontacts' as const, 
        icon: '👥', 
        description: 'Saved service contacts' 
    });

    const navItems = baseNavItems;

    return (
        <div className="fixed inset-0 z-[110] flex font-sans">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
            
            <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col border-r border-black animate-slide-in-left">
                
                {/* Header with NIKOSOKO Logo */}
                <div className="p-6 bg-black text-white border-b border-gray-800">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-white text-black font-black flex items-center justify-center text-lg shadow-sm">
                                N
                            </div>
                            <div>
                                <h1 className="text-xl font-black uppercase tracking-widest text-white leading-none">NIKOSOKO</h1>
                                <p className="text-[8.5px] font-bold text-gray-300 tracking-tight mt-1">Find & connect with nearby skilled professionals</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1"><XIcon /></button>
                    </div>

                    {currentUser ? (
                        <div className="mt-4 pt-4 border-t border-gray-800 space-y-3">
                            <div 
                                onClick={() => {
                                    onNavigate('profile');
                                    onClose();
                                }}
                                className="flex items-center gap-3 p-2.5 bg-white/10 rounded-2xl hover:bg-white/20 transition-all cursor-pointer border border-white/10"
                            >
                                <img src={currentUser.avatarUrl} className="w-11 h-11 rounded-full border-2 border-white object-cover shadow-sm" alt="" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <h2 className="font-black truncate text-xs text-white">{currentUser.name}</h2>
                                        <span className="text-[9px] bg-amber-400 text-black font-black px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                                            ★ {currentUser.rating ? currentUser.rating.toFixed(1) : '5.0'}
                                        </span>
                                    </div>
                                    <p className="text-[9px] text-gray-300 truncate uppercase font-semibold mt-0.5">{currentUser.service}</p>
                                    <p className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">Tap to Edit Profile</p>
                                </div>
                                <span className="text-xs font-black text-white p-1 bg-white/10 rounded-full">&rarr;</span>
                            </div>
                            
                            <div className="flex items-center justify-between px-1">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Available For Hire</span>
                                    <span className="text-[8px] font-bold text-amber-400 truncate max-w-[150px]">
                                        {isOnline ? `📍 ${currentUser?.location || 'Live Location'}` : 'Offline (Requires Location Update)'}
                                    </span>
                                </div>
                                <button 
                                    onClick={handleToggleAvailability}
                                    title={isOnline ? "Click to go Offline" : "Click to update location and go Available for Hire"}
                                    className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${isOnline ? 'bg-emerald-400' : 'bg-gray-700'}`}
                                >
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-black rounded-full transition-transform ${isOnline ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </button>
                            </div>

                            <LocationPromptModal 
                                isOpen={showLocationPrompt}
                                onClose={() => setShowLocationPrompt(false)}
                                currentLocation={currentUser?.location}
                                onConfirm={handleConfirmLocation}
                            />
                        </div>
                    ) : (
                        <div className="py-2">
                            <button onClick={() => { onNavigate('login'); onClose(); }} className="w-full bg-white text-black font-black py-2.5 rounded-xl text-xs uppercase tracking-widest shadow-md">Sign In / Register</button>
                        </div>
                    )}
                </div>

                {/* Complete Sign Up Button Card if User profile is not completed */}
                {currentUser && !currentUser.isProfileCompleted && (
                    <div className="p-3 bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-500 border-b border-amber-600 text-black shadow-inner">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                                <span className="text-lg">📄</span>
                                <span className="text-[10px] font-black uppercase tracking-wider text-black">Skill Profile Setup</span>
                            </div>
                            {!currentUser.isProfileCompleted && (
                                <span className="bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase animate-pulse">
                                    Incomplete
                                </span>
                            )}
                        </div>
                        <p className="text-[9px] font-extrabold text-black/80 leading-tight mb-2">
                            {currentUser.isProfileCompleted 
                                ? 'Update your rates, operating hours & action buttons anytime.' 
                                : 'Complete your full Skill Profile PDF to list custom rates, get verified & receive bookings.'}
                        </p>
                        <button
                            onClick={() => {
                                onOpenCompleteSignUp?.();
                                onClose();
                            }}
                            className="w-full bg-black text-amber-400 font-black py-2 rounded-xl text-xs uppercase tracking-wider hover:bg-gray-900 transition-all shadow-md active:scale-95 flex items-center justify-center gap-1"
                        >
                            <span>Complete Sign Up</span>
                            <span>→</span>
                        </button>
                    </div>
                )}

                {/* Navigation Menu List */}
                <div className="flex-1 overflow-y-auto py-3 px-3 custom-scrollbar divide-y divide-gray-100">
                    <div className="space-y-1 pb-3">
                        {navItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => {
                                    if (item.page === 'sacco_dashboard') {
                                        if (currentUser?.accountType === 'organization' || currentUser?.saccoCode || currentUser?.saccoMember) {
                                            onNavigate('sacco_dashboard');
                                            onClose();
                                        } else {
                                            setShowSaccoNotice(true);
                                        }
                                    } else {
                                        onNavigate(item.page);
                                        onClose();
                                    }
                                }}
                                className="w-full flex items-start gap-3 p-3 text-black hover:bg-gray-100 rounded-2xl transition-all group text-left border border-transparent hover:border-gray-200"
                            >
                                <span className="text-lg p-2 bg-gray-50 rounded-xl group-hover:bg-black group-hover:text-white transition-colors">{item.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs font-black tracking-tight text-black block">{item.label}</span>
                                    <span className="text-[9px] text-gray-500 font-medium block truncate leading-tight mt-0.5">{item.description}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {isSuperAdmin && (
                        <div className="pt-3">
                            <button
                                onClick={() => { onNavigate('admin'); onClose(); }}
                                className="w-full flex items-center gap-3 p-3 text-black bg-gray-100 rounded-2xl hover:bg-black hover:text-white transition-all text-left"
                            >
                                <span className="text-lg">🛡️</span>
                                <div>
                                    <span className="text-xs font-black uppercase tracking-widest block">Admin Console</span>
                                    <span className="text-[8px] opacity-70 uppercase tracking-widest block">System Management</span>
                                </div>
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
                    {currentUser ? (
                         <button onClick={() => { onLogout(); onClose(); }} className="w-full py-2.5 text-xs font-black uppercase tracking-widest text-black border-2 border-black rounded-xl hover:bg-black hover:text-white transition-all">
                             Sign Out
                         </button>
                    ) : (
                         <button onClick={() => { onNavigate('login'); onClose(); }} className="w-full py-2.5 text-xs font-black uppercase tracking-widest text-black bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-all">
                             Sign In / Register (SMS OTP)
                         </button>
                    )}
                </div>
            </div>

            {/* Sacco Portal Info / Gate Modal for Individual accounts */}
            {showSaccoNotice && (
                <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 text-black shadow-2xl border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl p-2 bg-blue-100 rounded-2xl">🏢</span>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">
                                        Sacco & Org Portal
                                    </h3>
                                    <p className="text-[10px] text-blue-600 font-extrabold uppercase">
                                        For Registered Organizations & Schools
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowSaccoNotice(false)} 
                                className="text-gray-400 hover:text-black font-black p-1 text-base cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl space-y-2 text-xs">
                            <p className="text-gray-800 font-bold leading-relaxed">
                                The Sacco & Organization Portal is designed for users who signed up with a <strong>Sacco Registration No.</strong> and selected <strong>Organization Account Type</strong> (Saccos, Vocational Schools, Cooperatives).
                            </p>
                            <div className="pt-1 space-y-1.5">
                                <div className="flex items-start gap-1.5 text-[11px] font-semibold text-gray-700">
                                    <span className="text-blue-600 font-black">🛡️</span>
                                    <span><strong>Security Vetting:</strong> Multi-layer manual approval step for member professionals.</span>
                                </div>
                                <div className="flex items-start gap-1.5 text-[11px] font-semibold text-gray-700">
                                    <span className="text-blue-600 font-black">🛒</span>
                                    <span><strong>Sell Offerings:</strong> List organization services & vocational courses for sale on Tukosoko.</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-1">
                            <button
                                onClick={() => {
                                    setShowSaccoNotice(false);
                                    onClose();
                                    onNavigate('sacco_dashboard');
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-2xl text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer"
                            >
                                View Public Sacco Directory &rarr;
                            </button>

                            <button
                                onClick={() => {
                                    setShowSaccoNotice(false);
                                    onClose();
                                    if (onOpenCompleteSignUp) {
                                        onOpenCompleteSignUp();
                                    } else {
                                        onNavigate('login');
                                    }
                                }}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-black py-2.5 rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                            >
                                Register / Switch to Organization
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes slide-in-left {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-left {
                    animation: slide-in-left 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default SideMenu;
