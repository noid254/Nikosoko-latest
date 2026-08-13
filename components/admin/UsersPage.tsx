import React, { useState, useMemo } from 'react';
import type { ServiceProvider, AdminNote } from '../../types';
import AdminUserProfileModal from './AdminUserProfileModal';

interface UsersPageProps {
  providers: ServiceProvider[];
  onViewProvider: (provider: ServiceProvider) => void;
  onUpdateProvider: (provider: ServiceProvider) => void;
  onDeleteProvider: (id: string) => void;
  isSuperAdmin?: boolean;
}

const UsersPage: React.FC<UsersPageProps> = ({
  providers,
  onViewProvider,
  onUpdateProvider,
  onDeleteProvider,
  isSuperAdmin = true,
}) => {
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState<'All' | 'Verified' | 'Unverified' | 'Suspended'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'views' | 'rating' | 'name'>('views');
  const [selectedAdminUser, setSelectedAdminUser] = useState<ServiceProvider | null>(null);

  // Suspension Modal State
  const [suspendingUser, setSuspendingUser] = useState<ServiceProvider | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [suspensionError, setSuspensionError] = useState('');

  const filteredProviders = useMemo(() => {
    const result = providers.filter(p => {
      const isSuspendedOrFlagged = p.isSuspended || (p.flagCount || 0) > 0;
      const matchesFilter =
        userFilter === 'All' ||
        (userFilter === 'Verified' && p.isVerified) ||
        (userFilter === 'Unverified' && !p.isVerified) ||
        (userFilter === 'Suspended' && isSuspendedOrFlagged);
      const matchesSearch =
        p.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        p.service.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        p.phone.includes(userSearchTerm) ||
        p.location.toLowerCase().includes(userSearchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    return result.sort((a, b) => {
      if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b.id.localeCompare(a.id); // newest
    });
  }, [providers, userSearchTerm, userFilter, sortBy]);

  const handleRoleChange = (provider: ServiceProvider, newRole: string) => {
    const updated = { ...provider, role: newRole as any };
    onUpdateProvider(updated);
  };

  const toggleVerification = (provider: ServiceProvider) => {
    onUpdateProvider({ ...provider, isVerified: !provider.isVerified });
  };

  const initiateSuspend = (provider: ServiceProvider) => {
    setSuspendingUser(provider);
    setSuspensionReason('');
    setSuspensionError('');
  };

  const handleConfirmSuspension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendingUser) return;
    if (!suspensionReason.trim()) {
      setSuspensionError('A valid note/reason for suspension is required.');
      return;
    }

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newNote: AdminNote = {
      id: `suspend_note_${Date.now()}`,
      authorName: isSuperAdmin ? 'Super Admin' : 'Admin',
      authorRole: isSuperAdmin ? 'SuperAdmin' : 'Admin',
      authorEmail: 'Noid254@gmail.com',
      content: `🛑 ACCOUNT SUSPENDED & FLAGGED:\nReason: "${suspensionReason.trim()}"`,
      createdAt: new Date().toISOString(),
      signature: `Signed by Admin (Noid254@gmail.com) on ${timestamp}`
    };

    const updatedProvider: ServiceProvider = {
      ...suspendingUser,
      isSuspended: true,
      flagCount: (suspendingUser.flagCount || 0) + 1,
      suspendedReason: suspensionReason.trim(),
      suspendedBy: isSuperAdmin ? 'Super Admin' : 'Admin',
      suspendedAt: new Date().toISOString(),
      adminNotes: [newNote, ...(suspendingUser.adminNotes || [])]
    };

    onUpdateProvider(updatedProvider);
    setSuspendingUser(null);
    setSuspensionReason('');
  };

  const handleUnsuspend = (provider: ServiceProvider) => {
    if (!isSuperAdmin) {
      alert('🔒 Permission Denied: Only a Super Admin can unflag or unsuspend an account.');
      return;
    }

    if (!window.confirm(`Are you sure you want to unsuspend and unflag ${provider.name}'s account?`)) return;

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newNote: AdminNote = {
      id: `unsuspend_note_${Date.now()}`,
      authorName: 'Super Admin',
      authorRole: 'SuperAdmin',
      authorEmail: 'Noid254@gmail.com',
      content: '✅ ACCOUNT UNSUSPENDED & UNFLAGGED BY SUPER ADMIN.',
      createdAt: new Date().toISOString(),
      signature: `Signed by Super Admin (Noid254@gmail.com) on ${timestamp}`
    };

    const updatedProvider: ServiceProvider = {
      ...provider,
      isSuspended: false,
      flagCount: 0,
      suspendedReason: undefined,
      suspendedBy: undefined,
      suspendedAt: undefined,
      adminNotes: [newNote, ...(provider.adminNotes || [])]
    };

    onUpdateProvider(updatedProvider);
  };

  const counts = useMemo(() => ({
    all: providers.length,
    verified: providers.filter(p => p.isVerified).length,
    unverified: providers.filter(p => !p.isVerified).length,
    suspended: providers.filter(p => p.isSuspended || (p.flagCount || 0) > 0).length,
  }), [providers]);

  return (
    <div className="space-y-6 font-sans relative">
      {/* Admin Profile Intelligence & Notes Modal */}
      {selectedAdminUser && (
        <AdminUserProfileModal
          user={selectedAdminUser}
          onClose={() => setSelectedAdminUser(null)}
          onUpdateProvider={(updated) => {
            onUpdateProvider(updated);
            setSelectedAdminUser(updated);
          }}
          currentUserEmail="Noid254@gmail.com"
        />
      )}

      {/* SUSPENSION REASON MODAL */}
      {suspendingUser && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-rose-300 shadow-2xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600 font-black text-base">
                <span>🛑 Suspend & Flag Account</span>
              </div>
              <button onClick={() => setSuspendingUser(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-950 font-medium space-y-1">
              <p className="font-bold">Warning: Suspending {suspendingUser.name}</p>
              <p>Suspended accounts are hidden from public view/search and blocked from platform access. **Only a Super Admin can lift this suspension.**</p>
            </div>

            <form onSubmit={handleConfirmSuspension} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Reason / Note for Suspension <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide explicit reasons for suspending this account (e.g. fraudulent activity, unresolved disputes, violation of terms)..."
                  value={suspensionReason}
                  onChange={e => {
                    setSuspensionReason(e.target.value);
                    setSuspensionError('');
                  }}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-200 focus:border-rose-600 rounded-xl text-xs font-semibold text-slate-900 outline-none"
                />
                {suspensionError && <p className="text-rose-600 text-[11px] font-bold mt-1">{suspensionError}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSuspendingUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-md"
                >
                  Confirm Account Suspension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header & Quick Filter Pills */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>👥 User & Service Provider Registry</span>
              <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-0.5 rounded-full font-bold">{filteredProviders.length} Users</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage accounts, suspend/flag accounts with notes, inspect intelligence bios & issue verification badges.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['All', 'Verified', 'Unverified', 'Suspended'] as const).map(f => (
              <button
                key={f}
                onClick={() => setUserFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  userFilter === f
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f} ({f === 'All' ? counts.all : f === 'Verified' ? counts.verified : f === 'Unverified' ? counts.unverified : counts.suspended})
              </button>
            ))}
          </div>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col md:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-3 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search by name, service, location, or phone number..."
              value={userSearchTerm}
              onChange={e => setUserSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-500 uppercase shrink-0">Sort By:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 rounded-xl text-xs font-black text-slate-800 outline-none cursor-pointer"
            >
              <option value="views">Most Viewed</option>
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Grid / Data Table */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Service & Category</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Engagement</th>
                <th className="py-3 px-4">Status & Verification</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProviders.map(user => {
                const disputeCount = user.ratingDisputes?.length || 0;
                const isSuspended = user.isSuspended || (user.flagCount || 0) > 0;
                return (
                  <tr 
                    key={user.id} 
                    onClick={() => setSelectedAdminUser(user)}
                    className={`transition-colors cursor-pointer group ${
                      isSuspended ? 'bg-rose-50/50 hover:bg-rose-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* User Details */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
                          />
                          <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            isSuspended ? 'bg-rose-600' : user.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}></span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {user.name}
                            </p>
                            {isSuspended && (
                              <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase" title={user.suspendedReason || 'Account suspended'}>
                                🛑 Suspended / Flagged
                              </span>
                            )}
                            {disputeCount > 0 && (
                              <span className="bg-amber-400 text-slate-950 text-[8.5px] font-black px-1.5 py-0.2 rounded uppercase border border-amber-500">
                                ⚖️ {disputeCount} Cases
                              </span>
                            )}
                            {user.adminNotes && user.adminNotes.length > 0 && (
                              <span className="bg-amber-100 text-amber-900 text-[8.5px] font-bold px-1.5 py-0.2 rounded uppercase border border-amber-300">
                                ✍️ {user.adminNotes.length} Notes
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">📞 {user.phone} • 📍 {user.location}</p>
                          {isSuspended && user.suspendedReason && (
                            <p className="text-[10px] text-rose-700 font-semibold mt-0.5 bg-rose-100 px-1.5 py-0.5 rounded">
                              Reason: {user.suspendedReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Service & Category */}
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">
                        {user.service}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{user.category || 'General Service'}</p>
                    </td>

                    {/* Role Selector */}
                    <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                      <select
                        value={user.role || 'Member'}
                        onChange={e => handleRoleChange(user, e.target.value)}
                        className="bg-slate-50 border border-slate-300 text-[11px] font-black uppercase text-slate-800 px-2.5 py-1 rounded-lg outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                      >
                        <option value="Member">Member</option>
                        <option value="Provider">Provider</option>
                        <option value="Staff">Staff / Admin</option>
                        <option value="BuildingManager">Building Manager</option>
                        <option value="Gateman">Gateman</option>
                      </select>
                    </td>

                    {/* Engagement (Views & Rating) */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        👀 {user.views || 0}
                      </span>
                      <div className="text-[10px] font-extrabold text-amber-600 mt-0.5">
                        ★ {user.rating || '5.0'}
                      </div>
                    </td>

                    {/* Verification Status */}
                    <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => toggleVerification(user)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                          user.isVerified
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                        }`}
                      >
                        {user.isVerified ? '✓ Verified' : 'Unverified'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedAdminUser(user)}
                          className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-black px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                        >
                          🧠 Bio
                        </button>

                        {/* SUSPEND / UNSUSPEND BUTTON */}
                        {isSuspended ? (
                          <button
                            onClick={() => handleUnsuspend(user)}
                            disabled={!isSuperAdmin}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              isSuperAdmin
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                            title={!isSuperAdmin ? 'Only a Super Admin can unsuspend accounts' : 'Unsuspend Account'}
                          >
                            {isSuperAdmin ? '✓ Unsuspend' : '🔒 SuperAdmin Only'}
                          </button>
                        ) : (
                          <button
                            onClick={() => initiateSuspend(user)}
                            className="bg-rose-100 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            🛑 Suspend / Flag
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (window.confirm(`Permanently remove ${user.name} from the system registry?`)) {
                              onDeleteProvider(user.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredProviders.map(user => {
            const isSuspended = user.isSuspended || (user.flagCount || 0) > 0;
            return (
              <div key={user.id} className={`p-4 space-y-3 ${isSuspended ? 'bg-rose-50/60' : ''}`}>
                <div className="flex items-center gap-3">
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 cursor-pointer" 
                    onClick={() => setSelectedAdminUser(user)}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate flex items-center gap-1.5" onClick={() => setSelectedAdminUser(user)}>
                      {user.name}
                      {isSuspended && <span className="text-[8px] bg-rose-600 text-white px-1 rounded">SUSPENDED</span>}
                    </h4>
                    <p className="text-xs text-slate-500">{user.service} • {user.phone}</p>
                    {isSuspended && user.suspendedReason && (
                      <p className="text-[10px] text-rose-700 mt-0.5">Note: {user.suspendedReason}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedAdminUser(user)}
                    className="bg-slate-900 text-amber-400 font-bold text-[10px] px-2.5 py-1 rounded-lg"
                  >
                    View Bio & Notes
                  </button>
                  {isSuspended ? (
                    <button
                      onClick={() => handleUnsuspend(user)}
                      disabled={!isSuperAdmin}
                      className={`px-3 py-1 rounded-full font-bold text-[10px] ${
                        isSuperAdmin ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isSuperAdmin ? 'Unsuspend' : '🔒 SuperAdmin'}
                    </button>
                  ) : (
                    <button
                      onClick={() => initiateSuspend(user)}
                      className="bg-rose-600 text-white px-3 py-1 rounded-full font-bold text-[10px]"
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredProviders.length === 0 && (
          <div className="py-20 text-center text-slate-400 space-y-2">
            <div className="text-4xl">🔍</div>
            <p className="font-bold text-sm text-slate-700">No users found matching your filter parameters.</p>
            <p className="text-xs">Try clearing search terms or selecting 'All' status filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
