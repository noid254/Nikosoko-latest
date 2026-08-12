import React, { useState, useMemo } from 'react';
import type { ServiceProvider } from '../../types';
import AdminUserProfileModal from './AdminUserProfileModal';

interface UsersPageProps {
  providers: ServiceProvider[];
  onViewProvider: (provider: ServiceProvider) => void;
  onUpdateProvider: (provider: ServiceProvider) => void;
  onDeleteProvider: (id: string) => void;
}

const UsersPage: React.FC<UsersPageProps> = ({
  providers,
  onViewProvider,
  onUpdateProvider,
  onDeleteProvider,
}) => {
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState<'All' | 'Verified' | 'Unverified' | 'Flagged'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'views' | 'rating' | 'name'>('views');
  const [selectedAdminUser, setSelectedAdminUser] = useState<ServiceProvider | null>(null);

  const filteredProviders = useMemo(() => {
    const result = providers.filter(p => {
      const matchesFilter =
        userFilter === 'All' ||
        (userFilter === 'Verified' && p.isVerified) ||
        (userFilter === 'Unverified' && !p.isVerified) ||
        (userFilter === 'Flagged' && (p.flagCount || 0) > 0);
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

  const toggleFlag = (provider: ServiceProvider) => {
    const currentFlags = provider.flagCount || 0;
    onUpdateProvider({ ...provider, flagCount: currentFlags > 0 ? 0 : 1 });
  };

  const counts = useMemo(() => ({
    all: providers.length,
    verified: providers.filter(p => p.isVerified).length,
    unverified: providers.filter(p => !p.isVerified).length,
    flagged: providers.filter(p => (p.flagCount || 0) > 0).length,
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

      {/* Header & Quick Filter Pills */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>👥 User & Service Provider Registry</span>
              <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-0.5 rounded-full font-bold">{filteredProviders.length} Users</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage accounts, view system intelligence bios, attach signed admin notes & issue verification badges.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['All', 'Verified', 'Unverified', 'Flagged'] as const).map(f => (
              <button
                key={f}
                onClick={() => setUserFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  userFilter === f
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f} ({f === 'All' ? counts.all : f === 'Verified' ? counts.verified : f === 'Unverified' ? counts.unverified : counts.flagged})
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
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProviders.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  {/* User Details */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs cursor-pointer"
                          onClick={() => setSelectedAdminUser(user)}
                        />
                        <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${user.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p
                            onClick={() => setSelectedAdminUser(user)}
                            className="font-black text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                          >
                            {user.name}
                          </p>
                          {(user.flagCount || 0) > 0 && (
                            <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase">Flagged</span>
                          )}
                          {user.adminNotes && user.adminNotes.length > 0 && (
                            <span className="bg-amber-100 text-amber-900 text-[8.5px] font-bold px-1.5 py-0.2 rounded uppercase border border-amber-300" title={`${user.adminNotes.length} Admin Notes Attached`}>
                              ✍️ {user.adminNotes.length} Notes
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">📞 {user.phone} • 📍 {user.location}</p>
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
                  <td className="py-3.5 px-4">
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
                  <td className="py-3.5 px-4">
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
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedAdminUser(user)}
                        className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-black px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        🧠 View Bio & Notes
                      </button>
                      <button
                        onClick={() => toggleFlag(user)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          (user.flagCount || 0) > 0
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600'
                        }`}
                      >
                        {(user.flagCount || 0) > 0 ? 'Unflag' : 'Flag'}
                      </button>
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredProviders.map(user => (
            <div key={user.id} className="p-4 space-y-3">
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
                    {user.adminNotes && user.adminNotes.length > 0 && (
                      <span className="text-[8px] bg-amber-200 text-amber-900 px-1 rounded">✍️ {user.adminNotes.length}</span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-500">{user.service} • {user.phone}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedAdminUser(user)}
                  className="bg-slate-900 text-amber-400 font-bold text-[10px] px-2.5 py-1 rounded-lg"
                >
                  View Bio & Notes
                </button>
                <button
                  onClick={() => toggleVerification(user)}
                  className={`px-3 py-1 rounded-full font-bold text-[10px] ${
                    user.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {user.isVerified ? 'Verified' : 'Verify'}
                </button>
              </div>
            </div>
          ))}
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
