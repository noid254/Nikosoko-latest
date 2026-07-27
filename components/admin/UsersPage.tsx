
import React, { useState, useMemo } from 'react';
import type { ServiceProvider } from '../../types';

interface UsersPageProps {
    providers: ServiceProvider[];
    onViewProvider: (provider: ServiceProvider) => void;
    onUpdateProvider: (provider: ServiceProvider) => void;
    onDeleteProvider: (id: string) => void;
}

const UsersPage: React.FC<UsersPageProps> = ({ providers, onViewProvider, onUpdateProvider, onDeleteProvider }) => {
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [userFilter, setUserFilter] = useState<'All' | 'Verified' | 'Unverified' | 'Flagged'>('All');

    const filteredProviders = useMemo(() => {
        return providers.filter(p => {
            const matchesFilter = 
                userFilter === 'All' || 
                (userFilter === 'Verified' && p.isVerified) || 
                (userFilter === 'Unverified' && !p.isVerified) ||
                (userFilter === 'Flagged' && (p.flagCount || 0) > 0);
            const matchesSearch = p.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || p.service.toLowerCase().includes(userSearchTerm.toLowerCase()) || p.phone.includes(userSearchTerm);
            return matchesFilter && matchesSearch;
        });
    }, [providers, userSearchTerm, userFilter]);

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

    return (
        <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-800">Global Registry Control</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <input 
                        type="text" 
                        placeholder="Search by name, service or phone..." 
                        value={userSearchTerm} 
                        onChange={e => setUserSearchTerm(e.target.value)} 
                        className="flex-grow p-3 border rounded-xl bg-gray-50 focus:bg-white transition-all text-sm outline-none focus:ring-2 focus:ring-brand-gold"
                    />
                    <select 
                        value={userFilter} 
                        onChange={e => setUserFilter(e.target.value as any)} 
                        className="p-3 border rounded-xl bg-white text-sm font-bold text-gray-700 outline-none"
                    >
                        <option value="All">All Status</option>
                        <option value="Verified">Verified Only</option>
                        <option value="Unverified">Unverified Only</option>
                        <option value="Flagged">Flagged Only</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {filteredProviders.map(p => (
                    <div key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-brand-gold transition-all group">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="relative">
                                <img src={p.avatarUrl} className="w-14 h-14 rounded-2xl object-cover shadow-sm" alt={p.name} />
                                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${p.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-black text-brand-navy truncate uppercase tracking-tight italic">{p.name}</p>
                                    {p.isVerified && <span className="text-blue-500 text-sm">✓</span>}
                                    {(p.flagCount || 0) > 0 && <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded font-black uppercase">Flagged</span>}
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <span>{p.service}</span>
                                    <span>•</span>
                                    <span>{p.phone}</span>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-[9px] font-black text-gray-300 uppercase">System Role:</span>
                                    <select 
                                        value={p.role || 'Member'} 
                                        onChange={(e) => handleRoleChange(p, e.target.value)}
                                        className="bg-white border border-gray-200 text-[9px] font-black uppercase px-2 py-1 rounded-md outline-none"
                                    >
                                        <option value="Member">Member</option>
                                        <option value="Staff">Staff / Admin</option>
                                        <option value="BuildingManager">Building Manager</option>
                                        <option value="Gateman">Gateman</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4 sm:mt-0 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                            <button 
                                onClick={() => toggleVerification(p)} 
                                className={`flex-1 sm:flex-none text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all border ${p.isVerified ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-white text-gray-400 border-gray-100 hover:bg-blue-50 hover:text-blue-600'}`}
                            >
                                {p.isVerified ? 'Verified' : 'Verify'}
                            </button>
                            <button 
                                onClick={() => toggleFlag(p)} 
                                className={`flex-1 sm:flex-none text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all border ${(p.flagCount || 0) > 0 ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-400 border-gray-100 hover:bg-red-50 hover:text-red-600'}`}
                            >
                                Flag
                            </button>
                            <button 
                                onClick={() => {if(window.confirm(`Permanently remove ${p.name} from the registry?`)) onDeleteProvider(p.id)}} 
                                className="p-2.5 bg-gray-100 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    </div>
                ))}
                {filteredProviders.length === 0 && (
                    <div className="py-24 text-center opacity-30 flex flex-col items-center">
                        <div className="p-12 bg-gray-50 rounded-full mb-6 ring-1 ring-black/5">🔍</div>
                        <p className="font-black text-xs uppercase tracking-[0.3em]">Registry Empty</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Try adjusting your filters</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersPage;
