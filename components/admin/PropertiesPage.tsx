
import React, { useState } from 'react';
import type { Premise } from '../../types';

interface PropertiesPageProps {
    premises: Premise[];
    onUpdatePremise: (premise: Premise) => void;
    onDeletePremise?: (id: string) => void;
}

const PropertiesPage: React.FC<PropertiesPageProps> = ({ premises, onUpdatePremise, onDeletePremise }) => {
    const [filter, setFilter] = useState<'All' | 'Pending' | 'Verified'>('Pending');

    const filteredPremises = premises.filter(p => {
        if (filter === 'All') return true;
        return p.verificationStatus === filter;
    });

    const handleVerify = (premise: Premise) => {
        onUpdatePremise({ ...premise, verificationStatus: 'Verified' });
    };

    const handleReject = (premise: Premise) => {
        if(confirm("Reject this property? This will mark it as rejected.")) {
             onUpdatePremise({ ...premise, verificationStatus: 'Rejected' });
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Property Verification</h2>
                    <p className="text-sm text-gray-500">Review and approve property listings.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['Pending', 'Verified', 'All'].map(f => (
                        <button 
                            key={f} 
                            onClick={() => setFilter(f as any)} 
                            className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${filter === f ? 'bg-white text-brand-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {filteredPremises.map(p => (
                    <div key={p.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-xl bg-white items-start sm:items-center shadow-sm hover:shadow-md transition-shadow">
                        <img src={p.bannerImageUrl} alt={p.name} className="w-full sm:w-32 h-24 object-cover rounded-lg bg-gray-200" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-gray-900 text-lg truncate">{p.name}</h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${p.verificationStatus === 'Verified' ? 'bg-green-100 text-green-700' : p.verificationStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                    {p.verificationStatus}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{p.location} • {p.type}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>Manager ID: <span className="font-mono bg-gray-100 px-1 rounded">{p.buildingManagerId}</span></span>
                                <span>•</span>
                                <span>{p.vacancies.length} Vacancies</span>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 mt-2 sm:mt-0">
                            {p.verificationStatus === 'Pending' && (
                                <>
                                    <button onClick={() => handleReject(p)} className="flex-1 sm:flex-none px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 border border-red-200">Reject</button>
                                    <button onClick={() => handleVerify(p)} className="flex-1 sm:flex-none px-6 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 shadow-md">Approve</button>
                                </>
                            )}
                            {p.verificationStatus === 'Verified' && (
                                 <button onClick={() => handleReject(p)} className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 border border-gray-200">Revoke Verification</button>
                            )}
                            {p.verificationStatus === 'Rejected' && (
                                 <button onClick={() => handleVerify(p)} className="flex-1 sm:flex-none px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 border border-blue-200">Re-evaluate</button>
                            )}
                        </div>
                    </div>
                ))}
                {filteredPremises.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500 font-medium">No properties found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertiesPage;
