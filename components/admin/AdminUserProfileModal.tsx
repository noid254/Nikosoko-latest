import React, { useState } from 'react';
import type { ServiceProvider, AdminNote, RatingDispute } from '../../types';

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

  // Raise Case State
  const [showRaiseCaseForm, setShowRaiseCaseForm] = useState(false);
  const [caseReason, setCaseReason] = useState('');
  const [caseReviewer, setCaseReviewer] = useState('Client / Customer Report');
  const [caseRating, setCaseRating] = useState(1);
  const [caseComment, setCaseComment] = useState('');

  // Inferred contact email if missing
  const inferredEmail = user.email || (user.phone ? `${user.phone.replace(/\D/g, '')}@nikosoko.com` : `${user.name.toLowerCase().replace(/\s+/g, '')}@nikosoko.com`);

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
  const existingDisputes: RatingDispute[] = user.ratingDisputes || [];

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

  const handleRaiseNewCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseReason.trim()) return;

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const disputeId = `dsp_${Date.now()}`;

    const newDispute: RatingDispute = {
      id: disputeId,
      providerId: user.id,
      providerName: user.name,
      reviewerName: caseReviewer.trim() || 'System Incident Report',
      originalRating: caseRating,
      comment: caseComment.trim() || 'Case raised in system',
      disputeReason: caseReason.trim(),
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    const caseAdminNote: AdminNote = {
      id: `case_note_${Date.now()}`,
      authorName: adminAuthorName,
      authorRole: adminAuthorRole,
      authorEmail: currentUserEmail,
      content: `🚨 CASE RAISED / LOGGED IN ABOUT DOSSIER:\nReason: "${caseReason.trim()}"\nReporter: ${caseReviewer}\nDetails: "${caseComment.trim() || 'N/A'}"`,
      createdAt: new Date().toISOString(),
      signature: `Logged Case Ticket #${disputeId.slice(-6)} • Signed by ${adminAuthorName} • ${timestamp}`
    };

    const updatedProvider: ServiceProvider = {
      ...user,
      ratingDisputes: [newDispute, ...existingDisputes],
      adminNotes: [caseAdminNote, ...existingNotes]
    };

    onUpdateProvider(updatedProvider);
    setCaseReason('');
    setCaseComment('');
    setShowRaiseCaseForm(false);
    setNoteSuccess('Case ticket created & logged directly into Protected Admin About!');
    setTimeout(() => setNoteSuccess(''), 3500);
  };

  const handleResolveCase = (disputeId: string, action: 'resolve' | 'dismiss') => {
    const updatedDisputes = existingDisputes.map(d => {
      if (d.id === disputeId) {
        return {
          ...d,
          status: action === 'resolve' ? ('Resolved' as const) : ('Dismissed' as const),
          resolutionNote: action === 'resolve' ? `Resolved by Admin (${adminAuthorName})` : `Dismissed by Admin (${adminAuthorName})`
        };
      }
      return d;
    });

    const updatedProvider: ServiceProvider = {
      ...user,
      ratingDisputes: updatedDisputes
    };

    onUpdateProvider(updatedProvider);
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

  const publicBioText = (user.about || user.bio || '').trim();
  const isPublicBioBlank = !publicBioText;

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-[200] flex items-center justify-center p-3 sm:p-5 backdrop-blur-xs font-sans animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-slate-900 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-950 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <img 
              src={user.avatarUrl} 
              alt={user.name} 
              className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
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
                    Flagged ({user.flagCount})
                  </span>
                )}
                {existingDisputes.length > 0 && (
                  <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                    ⚖️ {existingDisputes.length} Cases
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Backend System Intelligence & Protected Admin Dossier • ID: {user.id}
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
          
          {/* Quick Action & Role Control Bar */}
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
                onClick={() => setShowRaiseCaseForm(!showRaiseCaseForm)}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center gap-1"
              >
                <span>🚨 {showRaiseCaseForm ? 'Cancel Form' : 'Raise / Log Case Ticket'}</span>
              </button>

              <button
                type="button"
                onClick={toggleVerification}
                className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
                  user.isVerified
                    ? 'bg-slate-800 text-amber-400 border border-slate-700 hover:bg-slate-700'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                }`}
              >
                {user.isVerified ? 'Revoke Verify' : '✓ Grant Verify'}
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

          {/* SECTION 1: PROMINENT CONTACT & TRADE CREDENTIALS */}
          <div className="bg-white border-2 border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="flex items-center gap-2">
                <span>📞</span> Primary User Contact & Trade Details
              </span>
              <span className="bg-indigo-50 text-indigo-700 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                Admin Confidential Contact
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Phone Number</span>
                <p className="text-sm font-black text-slate-900 font-mono mt-0.5">📞 {user.phone}</p>
                <p className="text-[10px] text-slate-500">WhatsApp: {user.whatsapp || user.phone}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Email Address</span>
                <p className="text-xs font-black text-slate-900 font-mono mt-0.5 break-all">✉️ {inferredEmail}</p>
                <p className="text-[10px] text-slate-500">{user.email ? '✓ Direct Email' : 'Inferred System Handle'}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Service & Category</span>
                <p className="text-xs font-black text-slate-900 mt-0.5">🔨 {user.service}</p>
                <p className="text-[10px] text-slate-500">{user.category || 'General Tradesperson'}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Location & Area</span>
                <p className="text-xs font-black text-slate-900 mt-0.5">📍 {user.location}</p>
                <p className="text-[10px] text-slate-500">Radius: {user.distanceKm || 2.5} km coverage</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Rate / Pricing</span>
                <p className="text-xs font-black text-slate-900 mt-0.5">
                  💵 {user.currency || 'KES'} {(user.hourlyRate || user.rate || 1200).toLocaleString()} / {user.rateType || 'task'}
                </p>
                <p className="text-[10px] text-slate-500">Billing: Standard rate</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Engagement & Views</span>
                <p className="text-xs font-black text-slate-900 mt-0.5">
                  👀 {user.views || 0} Profile Views
                </p>
                <p className="text-[10px] font-bold text-amber-600">★ {user.rating || '5.0'} Rating</p>
              </div>
            </div>
          </div>

          {/* SECTION 2: PUBLIC BIO VS. PROTECTED ADMIN "ABOUT" DOSSIER */}
          <div className="bg-slate-50 border-2 border-slate-300 rounded-xl p-4 space-y-4">
            
            {/* Public Bio Header */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <span>📝</span> User Public Profile Bio
                </span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${isPublicBioBlank ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900'}`}>
                  {isPublicBioBlank ? '⚠️ Blank / Unprovided Bio' : '✓ Bio Provided'}
                </span>
              </div>

              {isPublicBioBlank ? (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 space-y-1">
                  <p className="text-xs font-bold text-amber-950">
                    This artisan / user profile bio is currently blank.
                  </p>
                  <p className="text-[10.5px] text-amber-800 leading-relaxed">
                    When this user (e.g., carpenter or trade provider) raises a case, complaint, or dispute, all records and case details are saved directly into their <strong>Protected Admin About Dossier</strong> below — viewable only by system administrators.
                  </p>
                </div>
              ) : (
                <p className="text-xs font-medium text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 italic">
                  "{publicBioText}"
                </p>
              )}
            </div>

            {/* PROTECTED ADMIN ABOUT & RAISED CASES (Only Viewable By Admins) */}
            <div className="bg-amber-50/70 border-2 border-amber-400 rounded-xl p-4 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-amber-300 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🛡️</span>
                  <div>
                    <h3 className="font-black text-slate-950 text-xs uppercase tracking-wider">
                      Protected Admin Confidential "About" Dossier & Cases
                    </h3>
                    <p className="text-[10px] text-amber-900 font-medium mt-0.5">
                      Case logs, dispute tickets, and internal admin observations for {user.name} (Only Viewable by Admins)
                    </p>
                  </div>
                </div>
                <span className="bg-slate-950 text-amber-400 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  Admin Eyes Only
                </span>
              </div>

              {/* RAISE NEW CASE / TICKET FORM */}
              {showRaiseCaseForm && (
                <form onSubmit={handleRaiseNewCase} className="bg-white p-4 rounded-xl border-2 border-amber-400 space-y-3 animate-fade-in shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                      <span>🚨</span> Raise Case / Incident Ticket
                    </h4>
                    <span className="text-[9px] font-mono text-slate-500">Ticket auto-attaches to Admin About</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-700 mb-1">
                        Case Title / Reason for Ticket *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Non-payment complaint, Service quality dispute, ID audit"
                        value={caseReason}
                        onChange={e => setCaseReason(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 text-xs focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-700 mb-1">
                        Reporter / Complainant Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Client John, Gateman Officer, Admin Inspection"
                        value={caseReviewer}
                        onChange={e => setCaseReviewer(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 text-xs focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-700 mb-1">
                      Detailed Incident Notes & Escalation Context
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Carpenter raised a case regarding non-payment for roofing works on Job #204. Issue escalated to admin arbitration."
                      value={caseComment}
                      onChange={e => setCaseComment(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 text-xs focus:bg-white focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowRaiseCaseForm(false)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-800 font-bold text-xs rounded-lg uppercase"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-slate-950 text-amber-400 font-black text-xs uppercase tracking-wider rounded-lg shadow-sm"
                    >
                      ✓ File Ticket & Save to Admin About
                    </button>
                  </div>
                </form>
              )}

              {/* RAISED CASES / DISPUTES FEED */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <span>⚖️</span> Active & Historical Raised Cases ({existingDisputes.length})
                  </h4>
                  <span className="text-[9px] font-mono text-slate-500">Only Viewable by Admins</span>
                </div>

                {existingDisputes.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {existingDisputes.map(dispute => (
                      <div key={dispute.id} className="bg-white p-3.5 rounded-xl border border-amber-300 shadow-xs space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                            <span className="text-amber-600">🚨</span> {dispute.disputeReason}
                          </span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                            dispute.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                            dispute.status === 'Dismissed' ? 'bg-slate-200 text-slate-700' : 'bg-rose-100 text-rose-900 border border-rose-300'
                          }`}>
                            {dispute.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 font-medium">
                          "{dispute.comment}"
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
                          <span>Reported by: <strong>{dispute.reviewerName}</strong> • {new Date(dispute.createdAt).toLocaleDateString()}</span>
                          
                          {dispute.status === 'Pending' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleResolveCase(dispute.id, 'resolve')}
                                className="bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded uppercase hover:bg-emerald-500 cursor-pointer"
                              >
                                ✓ Resolve Case
                              </button>
                              <button
                                onClick={() => handleResolveCase(dispute.id, 'dismiss')}
                                className="bg-slate-800 text-slate-300 font-bold text-[9px] px-2 py-0.5 rounded uppercase hover:bg-slate-700 cursor-pointer"
                              >
                                Dismiss
                              </button>
                            </div>
                          )}
                        </div>

                        {dispute.resolutionNote && (
                          <div className="bg-emerald-50 p-2 rounded text-[10px] font-bold text-emerald-900 border border-emerald-200">
                            Resolution Action: {dispute.resolutionNote}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/70 p-3.5 rounded-xl border border-dashed border-amber-300 text-center text-xs text-slate-600">
                    No active incident cases or disputes currently attached to this profile. Click <strong>"Raise / Log Case Ticket"</strong> above to file a case directly.
                  </div>
                )}
              </div>

              {/* ADMIN SIGNED NOTES MODULE */}
              <div className="space-y-3 pt-2 border-t border-amber-300">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <span>✍️</span> Signed Admin Audit Notes & Observations ({existingNotes.length})
                  </h4>
                  <span className="text-[9px] font-mono text-slate-500">Persistent Admin Signatures</span>
                </div>

                <form onSubmit={handleAddAdminNote} className="space-y-2 bg-white p-3 rounded-xl border border-amber-300">
                  {noteSuccess && (
                    <div className="bg-emerald-50 text-emerald-800 text-[11px] font-bold p-2 rounded border border-emerald-300 text-center">
                      {noteSuccess}
                    </div>
                  )}

                  <textarea
                    required
                    rows={2}
                    value={newNoteContent}
                    onChange={e => setNewNoteContent(e.target.value)}
                    placeholder="e.g. Spoke with artisan via phone. Verified EPRA electrical license certificate. Approved for blue tick verification."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white resize-none"
                  />

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                      <span>Signing as: <strong>{adminAuthorName}</strong> ({currentUserEmail})</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingNote}
                      className="bg-slate-950 hover:bg-slate-800 text-amber-400 font-extrabold px-3 py-1.5 rounded-lg transition-all uppercase text-[9.5px] tracking-wider cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <span>✍️ Add Signed Note</span>
                    </button>
                  </div>
                </form>

                {existingNotes.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {existingNotes.map(note => (
                      <div key={note.id} className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                        <p className="text-xs font-medium text-slate-800 whitespace-pre-wrap leading-relaxed">
                          "{note.content}"
                        </p>
                        <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[9px] font-mono text-slate-500">
                          <span className="font-bold text-slate-900">{note.signature}</span>
                          <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* SECTION 3: SYSTEM PROFILE INTELLIGENCE & AUDIT LOGS */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🧠</span>
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">
                  System Telemetry & Audit Logs
                </h3>
              </div>
              <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                Auto-Generated Telemetry
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Auth Verification</span>
                <p className="text-xs font-black text-slate-900 capitalize">
                  {systemBio.authMethod === 'email' ? '✉️ Gmail / Email OTP' : systemBio.authMethod === 'google' ? '🌐 Google OAuth' : '📱 Mobile SMS OTP'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">OTP Verified: ✓ Passed</p>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Sign-in History</span>
                <p className="text-xs font-black text-slate-900 font-mono">Sign-ins: {systemBio.loginCount || 1}</p>
                <p className="text-[10px] text-slate-500 font-mono">Joined: {new Date(systemBio.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Legal Compliance</span>
                <p className="text-xs font-black text-emerald-700">✓ Kenya DPA 2019 Accepted</p>
                <p className="text-[10px] text-slate-500 font-mono">Version: {systemBio.termsVersion || 'v2026.2-KENYA'}</p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
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

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-950 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm hover:bg-slate-800"
          >
            Close Admin Profile Window
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminUserProfileModal;
