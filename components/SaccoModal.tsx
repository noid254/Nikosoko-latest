import React from 'react';
import type { ServiceProvider, SaccoMembership } from '../types';

interface SaccoModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: ServiceProvider | null;
  saccoOrg?: ServiceProvider | null;
}

const SaccoModal: React.FC<SaccoModalProps> = ({ isOpen, onClose, provider, saccoOrg }) => {
  if (!isOpen || !provider) return null;

  const saccoMember: SaccoMembership | undefined = provider.saccoMember;
  const saccoName = saccoMember?.saccoName || saccoOrg?.name || 'Utumishi Sacco';
  const saccoCode = saccoMember?.saccoCode || saccoOrg?.saccoCode || 'SACCO-UTUMISHI';
  const location = saccoOrg?.location || provider.location || 'Nairobi, Kenya';
  const description = saccoOrg?.saccoDetails?.description || saccoOrg?.about || `Registered, audited Sacco organization for verified professionals in ${location}.`;
  const regNo = saccoOrg?.saccoDetails?.registrationNo || 'REG-SOC/2024/0981';
  const membersCount = saccoOrg?.saccoDetails?.totalMembers || 142;
  const contactPhone = saccoOrg?.saccoDetails?.contactPhone || saccoOrg?.phone || provider.phone;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 font-sans animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-scale-up z-10 flex flex-col max-h-[90vh]">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-5 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-15 text-8xl font-black pointer-events-none">
            💙
          </div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold transition-all"
          >
            ✕
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border border-white/20">
              <span>💙</span> SACCO VERIFIED
            </span>
            <span className="bg-emerald-400 text-black px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
              ✓ Active Member
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight text-white leading-snug">
            Member of {saccoName}
          </h2>
          <p className="text-xs text-blue-100 font-medium mt-1 opacity-90">
            Verified Service Professional Association
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-gray-800">
          
          {/* Member Card Summary */}
          <div className="flex items-center gap-3 p-3 bg-blue-50/70 border border-blue-100 rounded-2xl">
            <img 
              src={provider.avatarUrl} 
              alt={provider.name} 
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-600 shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-sm text-gray-900 truncate">{provider.name}</h3>
              <p className="text-xs text-blue-800 font-bold truncate">{provider.service}</p>
              <span className="inline-block mt-0.5 text-[10px] text-gray-500 font-semibold">
                Member ID: <strong className="text-gray-800 font-bold">{saccoCode}</strong>
              </span>
            </div>
          </div>

          {/* Sacco Public Profile Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Organization Public Profile
            </h4>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-2.5 text-xs">
              <div className="flex justify-between items-center border-b border-gray-200/60 pb-2">
                <span className="text-gray-500 font-semibold">Sacco Name</span>
                <span className="font-black text-gray-900 text-right">{saccoName}</span>
              </div>

              <div className="flex justify-between items-center border-b border-gray-200/60 pb-2">
                <span className="text-gray-500 font-semibold">Reg Code / No.</span>
                <span className="font-mono font-bold text-blue-700">{regNo}</span>
              </div>

              <div className="flex justify-between items-center border-b border-gray-200/60 pb-2">
                <span className="text-gray-500 font-semibold">Base Location</span>
                <span className="font-bold text-gray-800">{location}</span>
              </div>

              <div className="flex justify-between items-center border-b border-gray-200/60 pb-2">
                <span className="text-gray-500 font-semibold">Verified Active Members</span>
                <span className="bg-blue-100 text-blue-900 font-black px-2 py-0.5 rounded-md text-[11px]">
                  {membersCount} Members
                </span>
              </div>

              <div className="pt-1">
                <span className="text-gray-500 font-semibold block mb-1">About Sacco & Standards</span>
                <p className="text-gray-700 leading-relaxed bg-white p-2.5 rounded-xl border border-gray-200 font-medium text-[11px]">
                  {description}
                </p>
              </div>
            </div>
          </div>

          {/* Trust Guarantee Note */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5">
            <span className="text-base flex-shrink-0 mt-0.5">🛡️</span>
            <div className="text-[11px] text-amber-900 leading-snug">
              <strong className="font-black block text-amber-950 uppercase text-[10px] tracking-wider mb-0.5">Sacco Audit Guarantee</strong>
              As a verified Sacco member, work performed is backed by Sacco executive quality dispute resolution and community accountability standards.
            </div>
          </div>

          {/* Sacco Roster Management Note */}
          <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-start gap-2 text-[10.5px] text-blue-900 leading-snug">
            <span className="text-base flex-shrink-0">⚙️</span>
            <div>
              <strong className="font-bold block text-blue-950 uppercase text-[9.5px] tracking-wider mb-0.5">Sacco Administration & Roster Management</strong>
              To add or remove persons from a Sacco, log into the <strong>Sacco & Org Portal</strong> tab on the side menu.
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2">
          {contactPhone && (
            <a 
              href={`tel:${contactPhone}`} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider text-center transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>📞</span> Contact Secretariat
            </a>
          )}
          <button 
            onClick={onClose}
            className="flex-1 bg-black hover:bg-gray-800 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaccoModal;
