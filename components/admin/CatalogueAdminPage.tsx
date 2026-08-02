import React, { useState } from 'react';
import type { CatalogueItem, ServiceProvider } from '../../types';

interface CatalogueAdminPageProps {
  catalogueItems: CatalogueItem[];
  providers: ServiceProvider[];
  onVerifyItem: (itemId: string, isVerified: boolean) => void;
  onDeleteItem?: (itemId: string) => void;
}

export const CatalogueAdminPage: React.FC<CatalogueAdminPageProps> = ({
  catalogueItems,
  providers,
  onVerifyItem,
  onDeleteItem
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = catalogueItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'pending') return matchesSearch && !item.isVerified;
    if (filterStatus === 'verified') return matchesSearch && item.isVerified;
    return matchesSearch;
  });

  const getProvider = (providerId: string) => {
    return providers.find(p => p.id === providerId);
  };

  const pendingCount = catalogueItems.filter(i => !i.isVerified).length;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-navy via-slate-900 to-black text-white p-4 rounded-2xl shadow-sm border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🛍️</span>
            <h2 className="font-black text-sm uppercase tracking-wide text-amber-400">Tukosoko Service Catalogue Verification</h2>
          </div>
          <p className="text-xs text-gray-300 font-medium mt-0.5">
            Review and verify service cards submitted by professionals and teachers across the platform.
          </p>
        </div>

        <div className="bg-amber-500/20 border border-amber-400/40 px-3 py-1.5 rounded-xl text-center">
          <span className="text-[10px] uppercase font-bold text-amber-300 block">Pending Verification</span>
          <span className="text-lg font-black text-amber-400">{pendingCount} Items</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-center bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterStatus === 'all' ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({catalogueItems.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
              filterStatus === 'pending' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            ⏳ Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('verified')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterStatus === 'verified' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            ✓ Verified ({catalogueItems.length - pendingCount})
          </button>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by title or category..."
          className="w-full sm:w-64 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-brand-navy"
        />
      </div>

      {/* List of Catalogue Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredItems.map((item) => {
          const provider = getProvider(item.providerId);
          return (
            <div 
              key={item.id} 
              className={`bg-white p-3.5 rounded-2xl border shadow-2xs space-y-3 flex flex-col justify-between transition-all ${
                !item.isVerified ? 'border-amber-300 ring-1 ring-amber-200' : 'border-gray-200'
              }`}
            >
              <div className="flex gap-3 items-start">
                <img
                  src={item.imageUrls?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300'}
                  alt={item.title}
                  className="w-20 h-20 rounded-xl object-cover border border-gray-100 bg-gray-50 flex-shrink-0"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="bg-brand-navy/10 text-brand-navy text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                      {item.category}
                    </span>
                    {item.isVerified ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-2 py-0.5 rounded-md">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-2 py-0.5 rounded-md animate-pulse">
                        ⏳ Pending Admin Verification
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-xs text-gray-900 leading-snug truncate">
                    {item.title}
                  </h3>

                  <p className="text-xs font-black text-brand-navy">
                    {item.price}
                  </p>

                  {provider && (
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <img src={provider.avatarUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                      <span className="text-[10px] text-gray-600 font-semibold truncate">{provider.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[10px] text-gray-600 font-medium bg-gray-50 p-2 rounded-xl line-clamp-2">
                {item.description}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                {item.isVerified ? (
                  <button
                    onClick={() => onVerifyItem(item.id, false)}
                    className="flex-1 bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 text-xs font-bold py-1.5 rounded-xl transition-colors"
                  >
                    Set to Unverified
                  </button>
                ) : (
                  <button
                    onClick={() => onVerifyItem(item.id, true)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-1.5 rounded-xl shadow-xs transition-colors uppercase tracking-wider"
                  >
                    ✓ Approve & Verify Service
                  </button>
                )}

                {onDeleteItem && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
                        onDeleteItem(item.id);
                      }
                    }}
                    className="px-3 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 text-xs font-bold py-1.5 rounded-xl transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-6">
            <span className="text-3xl">📦</span>
            <p className="text-xs font-bold text-gray-700 mt-2">No service catalogue items match your filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogueAdminPage;
