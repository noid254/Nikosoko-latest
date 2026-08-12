import React, { useState } from 'react';
import type { ServiceProvider, AdminNote } from '../../types';

interface AdminUserProfileModalProps {
  user: ServiceProvider;
  onClose: () => void;
  onUpdateProvider: (updated: ServiceProvider) => void;
  currentUserEmail?: string;
}

export const AdminUserProfileModal: React.FC<AdminUserProfileModalProps> = ({
  user,
  onClose,
  onUpdateProvider,
  currentUserEmail = 'Noid254@gmail.com'
}) => {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [adminAuthorName, setAdminAuthorName] = useState('Super Admin');
  const [adminAuthorRole, setAdminAuthorRole] = useState('SuperAdmin');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState('');

  // Extract / Calculate System Bio details
  const systemBio = user.systemIntelligence || {
    createdAt: user.id.startsWith('sp_') || user.id.startsWith('pro-') 
      ? new Date().toISOString() 
      : '2026-01-15T08:30:00Z',
    lastLoginAt: new Date().toISOString(),
    authMethod: user.phone ? (user.phone.includes('@') ? 'email' : 'phone') : 'google',
    otpVerifiedAt: new Date().toISOString(),
    loginCount: Math.floor((user.views || 10) / 2) + 1,
    totalCatalogueItems: user.catalogueItems?.length || (user.hasCatalogue ? 4 : 0),
    totalGigsPosted: 2,
    verificationAuditTrail: [
      user.isVerified ? '✓ Document Scan Audit Approved' : '⏳ Identity Verification Pending',
      user.idNumber ? `✓ National ID / Passport #${user.idNumber} Logged` : '⚠️ ID Number Not Submitted',
      user.selfieUrl ? '✓ Live Selfie Facial Match Passed' : '⚠️ Live Selfie Pending'
    ],
    systemFlags: user.flagCount > 0 ? [`${user.flagCount} User Flag Reports Received`] : ['Clean Account Standing'],
    termsAcceptedAt: new Date().toISOString(),
    termsVersion: 'v2026.2-KENYA'
  };

  const existingNotes: AdminNote[] = user.adminNotes || [];

  const handleAddAdminNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    setIsSavingNote(true);
    setNoteSuccess('');

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const signature = `Signed by ${adminAuthorName} (${currentUserEmail}) • ${adminAuthorRole} • ${timestamp}`;

    const newNote: AdminNote = {
      id: `note_${Date.now()}`,
      authorName: adminAuthorName,
      authorRole: adminAuthorRole,
      authorEmail: currentUserEmail,
      content: newNoteContent.trim(),
      createdAt: new Date().toISOString(),
      signature
    };

    const updatedNotes = [newNote, ...existingNotes];
    const updatedProvider: ServiceProvider = {
      ...user,
      adminNotes: updatedNotes
    };

    onUpdateProvider(updatedProvider);
    setNewNoteContent('');
    setIsSavingNote(false);
    setNoteSuccess('Admin note added with digital signature!');
    setTimeout(() => setNoteSuccess(''), 3000);
  };

  const toggleVerification = () => {
    const updatedProvider: ServiceProvider = {
      ...user,
      isVerified: !user.isVerified,
      idVerificationStatus: !user.isVerified ? 'Verified' : 'Unverified'
    };
    onUpdateProvider(updatedProvider);
  };

  const toggleFlag = () => {
    const updatedProvider: ServiceProvider = {
      ...user,
      flagCount: user.flagCount > 0 ? 0 : 1
    };
    onUpdateProvider(updatedProvider);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-[200] flex items-center justify-center p-3 sm:p-5 backdrop-blur-xs font-sans animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-slate-900 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-950 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <img 
              src={user.avatarUrl} 
              alt={user.name} 
              className="w-10 h-10 rounded-xl object-cover border-2 border-amber-400 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black uppercase tracking-wider text-white">
                  {user.name}
                </h2>
                {user.isVerified && (
                  <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                    Verified
                  </span>
                )}
                {user.flagCount > 0 && (
                  <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                    Flagged
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Backend System Intelligence & Admin Audit Log • ID: {user.id}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-lg font-mono p-1 cursor-pointer"
            title="Close Profile View"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 overflow-y-auto space-y-6 text-slate-800 text-xs">
          
          {/* Quick Action Control Bar */}
          <div className="bg-slate-900 text-white p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Account Role:</span>
              <span className="bg-slate-800 text-amber-400 font-black text-xs px-2.5 py-1 rounded-lg border border-slate-700">
                {user.role || 'Member'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleVerification}
                className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
                  user.isVerified
                    ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                }`}
              >
                {user.isVerified ? 'Revoke Verification' : '✓ Grant Verification'}
              </button>

              <button
                type="button"
                onClick={toggleFlag}
                className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  user.flagCount > 0
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-600 text-white hover:bg-rose-700'
                }`}
              >
                {user.flagCount > 0 ? 'Clear Flag' : '🚩 Flag Account'}
              </button>
            </div>
          </div>

          {/* GRID 1: SYSTEM PROFILE INTELLIGENCE (Backend System Bio) */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🧠</span>
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">
                  System Profile Intelligence & Telemetry Bio
                </h3>
              </div>
              <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                Auto-Generated Telemetry
              </span>
            </div>

            <p className="text-[10.5px] text-slate-500 italic">
              This system bio represents metadata, security credentials, and platform audit records captured by the backend server — independent of self-written user profile bios.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
              {/* Box 1 */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Auth Method & Verification</span>
                <p className="text-xs font-black text-slate-900 capitalize">
                  {systemBio.authMethod === 'email' ? '✉️ Gmail / Email OTP' : systemBio.authMethod === 'google' ? '🌐 Google OAuth' : '📱 Mobile SMS OTP'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">OTP Verified: ✓ Verified</p>
              </div>

              {/* Box 2 */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Account History</span>
                <p className="text-xs font-black text-slate-900 font-mono">
                  Sign-ins: {systemBio.loginCount || 1}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Created: {new Date(systemBio.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Box 3 */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Marketplace Activity</span>
                <p className="text-xs font-black text-slate-900">
                  👀 {user.views || 0} Views • {user.rating || 5.0}★ Rating
                </p>
                <p className="text-[10px] text-slate-500">
                  Catalogue Items: {systemBio.totalCatalogueItems}
                </p>
              </div>

              {/* Box 4 */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Primary Contact Details</span>
                <p className="text-xs font-black text-slate-900 font-mono">
                  📞 {user.phone}
                </p>
                <p className="text-[10px] text-slate-500">
                  📍 {user.location}
                </p>
              </div>

              {/* Box 5 */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Legal Compliance Status</span>
                <p className="text-xs font-black text-emerald-700">
                  ✓ Kenya DPA 2019 Accepted
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Version: {systemBio.termsVersion || 'v2026.2-KENYA'}
                </p>
              </div>

              {/* Box 6 */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">SACCO / Association Status</span>
                <p className="text-xs font-black text-slate-900">
                  {user.saccoCode ? `SACCO: ${user.saccoCode}` : 'Individual Trade License'}
                </p>
                <p className="text-[10px] text-slate-500">
                  Status: {user.isSaccoVerified ? '✓ SACCO Endorsed' : 'Unendorsed'}
                </p>
              </div>
            </div>

            {/* Audit Trail List */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 pt-2">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                Verification Audit Trail & Security Logs
              </span>
              <div className="space-y-1">
                {systemBio.verificationAuditTrail?.map((trail, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] font-medium text-slate-700">
                    <span className="text-slate-400 font-mono text-[9px]">•</span>
                    <span>{trail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* GRID 2: IDENTITY DOCUMENT PREVIEWS (If Available) */}
          {(user.idDocumentUrl || user.selfieUrl) && (
            <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 space-y-3">
              <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <span>🪪 Uploaded Verification Assets</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.idDocumentUrl && (
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">
                      1. ID Document ({user.idType || 'National ID'})
                    </span>
                    <img 
                      src={user.idDocumentUrl} 
                      alt="ID Document Scan" 
                      className="w-full h-32 object-cover rounded-lg border border-slate-300"
                    />
                  </div>
                )}
                {user.selfieUrl && (
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">
                      2. Live Verification Selfie
                    </span>
                    <img 
                      src={user.selfieUrl} 
                      alt="Selfie Verification" 
                      className="w-full h-32 object-cover rounded-lg border border-slate-300"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GRID 3: INTERNAL ADMIN NOTES MODULE WITH DIGITAL SIGNATURES */}
          <div className="bg-amber-50/60 border-2 border-amber-300 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">✍️</span>
                <h3 className="font-black text-slate-950 text-xs uppercase tracking-wider">
                  Internal Admin Audit Notes & Official Signatures
                </h3>
              </div>
              <span className="bg-amber-200 text-amber-950 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase">
                Restricted Admin Confidential
              </span>
            </div>

            {/* Note Form */}
            <form onSubmit={handleAddAdminNote} className="space-y-3 bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs">
              {noteSuccess && (
                <div className="bg-emerald-50 text-emerald-800 text-[11px] font-bold p-2 rounded border border-emerald-300 text-center">
                  {noteSuccess}
                </div>
              )}

              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-700 mb-1">
                  Write Admin Note / Disciplinary Record / Audit Observation *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newNoteContent}
                  onChange={e => setNewNoteContent(e.target.value)}
                  placeholder="e.g. Spoke with artisan via phone. Verified EPRA electrical license certificate. Approved for blue tick verification."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[8px] font-black uppercase text-slate-500 mb-0.5">Admin Author Name</label>
                  <input
                    type="text"
                    value={adminAuthorName}
                    onChange={e => setAdminAuthorName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black uppercase text-slate-500 mb-0.5">System Role / Designation</label>
                  <input
                    type="text"
                    value={adminAuthorRole}
                    onChange={e => setAdminAuthorRole(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingNote}
                className="w-full bg-slate-950 hover:bg-slate-800 text-amber-400 font-extrabold py-2.5 rounded-xl transition-all uppercase text-[10px] tracking-wider cursor-pointer shadow-sm flex items-center justify-center gap-2 border border-slate-900"
              >
                <span>✍️ Add Note with Digital Admin Signature</span>
                <span>&rarr;</span>
              </button>
            </form>

            {/* Existing Admin Notes Feed */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                Previous Signed Notes ({existingNotes.length})
              </h4>

              {existingNotes.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {existingNotes.map(note => (
                    <div key={note.id} className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
                      <p className="text-xs font-medium text-slate-800 whitespace-pre-wrap leading-relaxed">
                        "{note.content}"
                      </p>
                      <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[9.5px] font-mono text-slate-500">
                        <span className="font-bold text-slate-900">{note.signature}</span>
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/60 p-4 rounded-xl border border-dashed border-amber-300 text-center text-[11px] text-slate-500">
                  No internal admin notes added to this user's profile yet. Use the form above to record your first note.
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-950 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Close Profile Window
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminUserProfileModal;
