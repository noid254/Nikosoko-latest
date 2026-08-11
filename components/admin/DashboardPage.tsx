import React, { useMemo } from 'react';
import type { ServiceProvider } from '../../types';
import type { AdminPage } from '../SuperAdminDashboard';

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0012 12a5.995 5.995 0 00-3-5.197M15 21a9 9 0 00-3-5.197" />
  </svg>
);

const UserPlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const PhoneCallIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const CheckBadgeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface DashboardPageProps {
  providers: ServiceProvider[];
  onSwitchPage: (page: AdminPage) => void;
  onViewProvider?: (provider: ServiceProvider) => void;
  onUpdateProvider?: (provider: ServiceProvider) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  providers,
  onSwitchPage,
  onViewProvider,
  onUpdateProvider,
}) => {
  // Compute analytics numbers dynamically from real data
  const totalUsersCount = providers.length;
  const unverifiedCount = useMemo(() => providers.filter(p => !p.isVerified).length, [providers]);
  const totalViewsCount = useMemo(() => providers.reduce((sum, p) => sum + (p.views || 0), 0), [providers]);

  // Sort most viewed users
  const mostViewedUsers = useMemo(() => {
    return [...providers].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6);
  }, [providers]);

  // Recent / New Users (assuming last elements or reverse order)
  const newUsers = useMemo(() => {
    return [...providers].reverse().slice(0, 6);
  }, [providers]);

  const toggleVerification = (provider: ServiceProvider, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateProvider) {
      onUpdateProvider({ ...provider, isVerified: !provider.isVerified });
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Top PC Executive Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Control Center • High Contrast Edition</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black mt-1 text-white tracking-tight">System Registry & Performance</h1>
          <p className="text-slate-300 text-sm mt-1">Real-time stats on registered users, profile view counts, verification pipeline & CTA activity.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSwitchPage('Users')}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Manage All Users ({totalUsersCount})
          </button>
          <button
            onClick={() => onSwitchPage('Broadcast')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
          >
            📢 Broadcast Message
          </button>
        </div>
      </div>

      {/* KPI Cards (High Contrast Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => onSwitchPage('Users')}
          className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">Total Users</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{totalUsersCount}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <UsersIcon />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Active Registry</span>
            <span className="text-slate-400 font-medium">Click for list &rarr;</span>
          </div>
        </div>

        <div
          onClick={() => onSwitchPage('Users')}
          className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">New Sign-ups</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{newUsers.length}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              <UserPlusIcon />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full">Recent Registrations</span>
            <span className="text-slate-400 font-medium">Inspect &rarr;</span>
          </div>
        </div>

        <div
          onClick={() => onSwitchPage('Analytics')}
          className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">Total Profile Views</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{(totalViewsCount || 0).toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <EyeIcon />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full">+14% view traffic</span>
            <span className="text-slate-400 font-medium">Analytics &rarr;</span>
          </div>
        </div>

        <div
          onClick={() => onSwitchPage('Users')}
          className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm hover:border-rose-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">Pending Verify</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{unverifiedCount}</h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <PhoneCallIcon />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full">Action Required</span>
            <span className="text-slate-400 font-medium">Review &rarr;</span>
          </div>
        </div>
      </div>

      {/* Main Desktop 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: New Users & Recent Sign-ups */}
        <div className="lg:col-span-7 bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>👤 New Users & Recent Sign-ups</span>
                  <span className="bg-slate-100 text-slate-800 text-xs px-2 py-0.5 rounded-full font-bold">{newUsers.length} Users</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Most recent user registrations across all categories.</p>
              </div>
              <button
                onClick={() => onSwitchPage('Users')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
              >
                View Full Registry &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 bg-slate-50">
                    <th className="py-2.5 px-3">User / Provider</th>
                    <th className="py-2.5 px-3">Service / Role</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {newUsers.map(user => (
                    <tr
                      key={user.id}
                      onClick={() => onViewProvider && onViewProvider(user)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{user.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{user.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">{user.service}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{user.role || 'Member'}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-600 text-[11px]">{user.location}</td>
                      <td className="py-3 px-3">
                        {user.isVerified ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <CheckBadgeIcon /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => toggleVerification(user, e)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            user.isVerified
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          {user.isVerified ? 'Unverify' : 'Verify Now'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
            <span>Showing recent user sign-ups</span>
            <button
              onClick={() => onSwitchPage('Users')}
              className="font-bold text-slate-700 hover:text-black cursor-pointer"
            >
              Manage Roles & Permissions &rarr;
            </button>
          </div>
        </div>

        {/* Right: Most Viewed Users & Service Providers */}
        <div className="lg:col-span-5 bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>🔥 Most Viewed Profiles</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Top performing service providers ranked by views.</p>
              </div>
              <button
                onClick={() => onSwitchPage('Analytics')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
              >
                Full Analytics &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {mostViewedUsers.map((provider, index) => {
                const maxViews = mostViewedUsers[0]?.views || 1;
                const percentage = Math.round(((provider.views || 0) / maxViews) * 100);

                return (
                  <div
                    key={provider.id}
                    onClick={() => onViewProvider && onViewProvider(provider)}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-black text-slate-400 text-sm w-4 text-center shrink-0">#{index + 1}</span>
                        <img
                          src={provider.avatarUrl}
                          alt={provider.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-300 shadow-xs shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-900 text-xs truncate group-hover:text-indigo-600 transition-colors">
                            {provider.name}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">{provider.service} • {provider.location}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-black text-slate-900 text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
                          👀 {provider.views || 0} views
                        </span>
                        <div className="text-[10px] font-bold text-amber-600 mt-1">★ {provider.rating}</div>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="mt-2.5 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Ranked by profile click engagement</span>
            <button
              onClick={() => onSwitchPage('Analytics')}
              className="font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              Export Traffic Data &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
