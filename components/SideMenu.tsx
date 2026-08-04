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
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/80 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ZapIcon = () => (
  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H9m4 0V7m0 0h4m-4 0H9" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  onNavigate,
  currentUser,
  isSuperAdmin,
  onLogout,
  onOpenCompleteSignUp,
  onUpdateUser
}) => {
  const isOnline = Boolean(currentUser?.isOnline);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  // Side menu is strictly available only for logged-in users
  if (!isOpen || !currentUser) return null;

  const handleToggleAvailability = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    if (!isOnline) {
      setShowLocationPrompt(true);
    } else {
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

  // Only profiles signed up as org/sacco account can see Org Console (like super admin sees admin console)
  const isOrgAccount = Boolean(
    currentUser && (
      currentUser.accountType === 'organization' ||
      currentUser.saccoCode ||
      currentUser.saccoMember
    )
  );

  return (
    <div className="fixed inset-0 z-[110] flex font-sans">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity duration-200" 
        onClick={onClose}
      />
      
      {/* Drawer Panel - Minimalist Clean Theme */}
      <div className="relative w-[260px] sm:w-[280px] bg-white h-full shadow-2xl flex flex-col animate-slide-in-left select-none overflow-hidden">
        
        {/* Black Header - Same Drop/Height as NIKOSOKO Hero Banner (min-h-[160px]) */}
        <div className="bg-black text-white p-4 min-h-[160px] flex flex-col justify-between shrink-0 border-b border-neutral-800">
          <div className="flex items-center justify-between w-full">
            <div 
              onClick={() => {
                onNavigate('profile');
                onClose();
              }}
              className="relative group cursor-pointer flex items-center gap-2.5 min-w-0"
            >
              <div className="relative shrink-0">
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.name} 
                  className="w-12 h-12 rounded-full object-cover border border-neutral-700 shadow-xs transition-transform group-hover:scale-105" 
                />
                <span 
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-black ${
                    isOnline ? 'bg-emerald-400' : 'bg-neutral-500'
                  }`}
                  title={isOnline ? 'Live' : 'Offline'}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-xs text-white truncate group-hover:text-neutral-300 transition-colors">
                  {currentUser.name}
                </h2>
                <p className="text-[10px] text-neutral-400 font-normal truncate">
                  {currentUser.service || currentUser.phone || 'Provider'}
                </p>
              </div>
            </div>

            {/* Close drawer button */}
            <button 
              onClick={onClose} 
              className="p-1 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer text-neutral-400 hover:text-white shrink-0"
            >
              <XIcon />
            </button>
          </div>

          {/* Status & Toggle Pill */}
          <div className="flex items-center justify-between text-[10.5px] pt-2 border-t border-neutral-800/80 w-full">
            <span className="text-neutral-300 font-normal flex items-center gap-1.5 truncate pr-2">
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
              <span className="truncate">{isOnline ? (currentUser.location || 'Ruaka, Kiambu') : 'Offline'}</span>
            </span>
            <button
              type="button"
              onClick={handleToggleAvailability}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer shrink-0 ${
                isOnline 
                  ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-700' 
                  : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-xs'
              }`}
            >
              {isOnline ? 'Go offline' : 'Go live!'}
            </button>
          </div>
        </div>

        {/* Navigation List - Clean & Spacious Minimalist */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          
          {/* Skill Hub */}
          <button
            type="button"
            onClick={() => {
              onNavigate('skill_id');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-neutral-800 hover:text-black hover:bg-neutral-100 active:bg-neutral-200 rounded-xl transition-colors cursor-pointer text-left"
          >
            <span className="shrink-0 opacity-80">
              <ZapIcon />
            </span>
            <span className="text-xs font-semibold leading-none">$kill Hub</span>
          </button>

          {/* Saved Contacts */}
          <button
            type="button"
            onClick={() => {
              onNavigate('mycontacts');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-neutral-800 hover:text-black hover:bg-neutral-100 active:bg-neutral-200 rounded-xl transition-colors cursor-pointer text-left"
          >
            <span className="shrink-0 opacity-80">
              <UsersIcon />
            </span>
            <span className="text-xs font-semibold leading-none">Saved Contacts</span>
          </button>

          {/* Complete Skill Setup Notice (if incomplete profile) */}
          {!currentUser.isProfileCompleted && (
            <button
              type="button"
              onClick={() => {
                onOpenCompleteSignUp?.();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-neutral-50 hover:bg-neutral-100 text-black rounded-xl transition-colors cursor-pointer text-left border border-neutral-200 my-1"
            >
              <div className="flex items-center gap-2.5">
                <span className="shrink-0 opacity-80">
                  <DocumentIcon />
                </span>
                <div>
                  <span className="text-xs font-semibold block leading-none">Complete Skill Profile</span>
                  <span className="text-[9.5px] text-neutral-500 font-normal">Setup rates & details</span>
                </div>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
            </button>
          )}

          {/* Consoles Section (Only if Org or SuperAdmin) */}
          {(isOrgAccount || isSuperAdmin) && (
            <>
              <div className="my-2 border-t border-neutral-100" />
              <div className="px-3 pt-1 pb-0.5">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-neutral-400">
                  Management
                </span>
              </div>
            </>
          )}

          {/* Org Console (Only visible to org/sacco accounts) */}
          {isOrgAccount && (
            <button
              type="button"
              onClick={() => {
                onNavigate('sacco_dashboard');
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-neutral-800 hover:text-black hover:bg-neutral-100 active:bg-neutral-200 rounded-xl transition-colors cursor-pointer text-left"
            >
              <span className="shrink-0 opacity-80">
                <BuildingIcon />
              </span>
              <span className="text-xs font-semibold leading-none">Org Console</span>
            </button>
          )}

          {/* Admin Console (Only visible to Super Admin) */}
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => {
                onNavigate('admin');
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-neutral-800 hover:text-black hover:bg-neutral-100 active:bg-neutral-200 rounded-xl transition-colors cursor-pointer text-left"
            >
              <span className="shrink-0 opacity-80">
                <ShieldIcon />
              </span>
              <span className="text-xs font-semibold leading-none">Admin Console</span>
            </button>
          )}
        </div>

        {/* Footer: Sign Out Button Only */}
        <div className="p-2.5 border-t border-neutral-200 bg-white shrink-0">
          <button
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 hover:text-black rounded-xl transition-colors cursor-pointer font-semibold text-xs border border-neutral-200"
          >
            <LogoutIcon />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Location Modal */}
      {currentUser && (
        <LocationPromptModal 
          isOpen={showLocationPrompt}
          onClose={() => setShowLocationPrompt(false)}
          currentLocation={currentUser.location}
          onConfirm={handleConfirmLocation}
        />
      )}

      <style>{`
        @keyframes slide-in-left {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default SideMenu;
