import React, { useState } from 'react';
import type { ServiceProvider } from '../types';

export interface SavedContactItem {
  providerId: string;
  label?: string;
  savedAt: string;
}

interface MyContactsViewProps {
  savedContactsMap: Record<string, SavedContactItem>;
  providers: ServiceProvider[];
  onSelectContact: (contact: ServiceProvider) => void;
  onUpdateLabel: (providerId: string, label: string) => void;
  onRemoveContact: (providerId: string) => void;
  onBack: () => void;
  onInitiateContact?: (provider: ServiceProvider) => void;
}

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const TagIcon = () => (
  <svg className="w-3 h-3 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a1 1 0 01.707.293l7 7a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A1 1 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const MyContactsView: React.FC<MyContactsViewProps> = ({
  savedContactsMap,
  providers,
  onSelectContact,
  onUpdateLabel,
  onRemoveContact,
  onBack,
  onInitiateContact
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
  const [labelInput, setLabelInput] = useState('');

  // Resolve saved provider objects
  const savedItems = Object.values(savedContactsMap);
  const savedProviders = savedItems
    .map(item => {
      const provider = providers.find(p => p.id === item.providerId);
      if (!provider) return null;
      return {
        provider,
        label: item.label || '',
        savedAt: item.savedAt
      };
    })
    .filter((item): item is { provider: ServiceProvider; label: string; savedAt: string } => item !== null);

  // Search filter
  const filteredContacts = savedProviders.filter(({ provider, label }) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    return (
      provider.name.toLowerCase().includes(query) ||
      (provider.service || '').toLowerCase().includes(query) ||
      (provider.category || '').toLowerCase().includes(query) ||
      (provider.location || '').toLowerCase().includes(query) ||
      label.toLowerCase().includes(query)
    );
  });

  const handleStartEditingLabel = (providerId: string, currentLabel: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProviderId(providerId);
    setLabelInput(currentLabel);
  };

  const handleSaveLabel = (providerId: string) => {
    onUpdateLabel(providerId, labelInput.trim());
    setEditingProviderId(null);
    setLabelInput('');
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white min-h-screen flex flex-col font-sans pb-20 border-x border-neutral-100">
      {/* Phonebook Header - Clean Minimalist */}
      <header className="px-3.5 py-3 bg-black text-white shadow-xs flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={onBack} 
            className="p-1 rounded-full hover:bg-neutral-800 transition-colors text-white cursor-pointer"
          >
            <BackIcon />
          </button>
          <div>
            <h1 className="text-xs font-bold tracking-tight text-white uppercase">Saved Contacts</h1>
            <p className="text-[10px] text-neutral-400 font-normal">
              Phonebook Directory ({savedProviders.length})
            </p>
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
          {savedProviders.length}
        </div>
      </header>

      <main className="p-3 flex-1 space-y-2.5">
        {/* Search Input */}
        {savedProviders.length > 0 && (
          <div className="relative">
            <SearchIcon />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search phonebook contacts..."
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 focus:border-black rounded-xl text-xs text-black outline-none transition placeholder-neutral-400 font-normal"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Compact Phonebook Contact List */}
        {filteredContacts.length > 0 ? (
          <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
            {filteredContacts.map(({ provider, label }) => {
              const isEditing = editingProviderId === provider.id;
              const serviceName = (provider.service || provider.category || 'Skill Expert').toLowerCase();
              const ratingVal = provider.rating || 4.7;
              const distanceVal = provider.distanceKm || 0.2;
              const isOnline = Boolean(provider.isOnline);

              return (
                <div 
                  key={provider.id} 
                  className="p-2.5 hover:bg-neutral-50/80 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2.5">
                    {/* Thumbnail & Info */}
                    <div 
                      onClick={() => onSelectContact(provider)}
                      className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer group"
                    >
                      {/* Avatar with Online Status Radio Button */}
                      <div className="relative shrink-0">
                        <img 
                          src={provider.avatarUrl} 
                          alt={provider.name} 
                          className="w-9 h-9 rounded-full object-cover border border-neutral-200 group-hover:border-black transition-colors"
                        />
                        {/* Radio button indicator */}
                        <div 
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white flex items-center justify-center ${
                            isOnline ? 'bg-emerald-500' : 'bg-neutral-300'
                          }`}
                          title={isOnline ? 'Online now' : 'Offline'}
                        >
                          {isOnline && <div className="w-1 h-1 bg-white rounded-full animate-ping" />}
                        </div>
                      </div>

                      {/* Main Contact Line & Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-xs text-neutral-900 truncate group-hover:text-black">
                            {provider.name}
                          </h3>
                          {provider.isVerified && (
                            <span className="text-blue-600 text-[10px] font-bold" title="Verified">✓</span>
                          )}
                        </div>

                        {/* Format e.g. "carpenter • ★ 4.7 • 0.2km away" */}
                        <p className="text-[11px] text-neutral-500 truncate leading-tight">
                          <span className="capitalize">{serviceName}</span>
                          <span className="mx-1 text-neutral-300">•</span>
                          <span className="text-amber-600 font-medium">★ {ratingVal}</span>
                          <span className="mx-1 text-neutral-300">•</span>
                          <span>{distanceVal}km away</span>
                        </p>
                      </div>
                    </div>

                    {/* Right Side: Online Radio Tag & Quick Controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Online Radio Badge */}
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${
                        isOnline 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-neutral-50 text-neutral-400 border-neutral-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                        {isOnline ? 'Live' : 'Offline'}
                      </span>

                      {/* Call Action Button */}
                      {provider.phone && (
                        <a
                          href={`tel:${provider.phone}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onInitiateContact?.(provider);
                          }}
                          className="p-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-black transition-colors cursor-pointer"
                          title="Call"
                        >
                          <PhoneIcon />
                        </a>
                      )}

                      {/* View Arrow */}
                      <button
                        onClick={() => onSelectContact(provider)}
                        className="p-1 hover:bg-neutral-100 rounded-lg cursor-pointer"
                        title="View Profile"
                      >
                        <ChevronRightIcon />
                      </button>

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveContact(provider.id);
                        }}
                        className="p-1 text-neutral-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove Contact"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>

                  {/* Custom Label Section */}
                  <div className="pl-11 pr-1 flex items-center justify-between text-[10.5px]">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 w-full pt-1">
                        <input
                          type="text"
                          value={labelInput}
                          onChange={(e) => setLabelInput(e.target.value)}
                          placeholder="e.g. My Electrician"
                          className="flex-1 px-2 py-1 bg-neutral-50 border border-neutral-300 focus:border-black rounded-md text-[11px] text-black outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveLabel(provider.id);
                          }}
                        />
                        <button
                          onClick={() => handleSaveLabel(provider.id)}
                          className="bg-black text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingProviderId(null)}
                          className="text-[10px] font-medium text-neutral-400 hover:text-black cursor-pointer px-1"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1 text-neutral-600 truncate">
                          <TagIcon />
                          {label ? (
                            <span className="font-medium bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 text-neutral-800">
                              {label}
                            </span>
                          ) : (
                            <span className="text-neutral-400 italic font-normal">No label set</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => handleStartEditingLabel(provider.id, label, e)}
                          className="text-[10px] font-medium text-neutral-500 hover:text-black hover:underline cursor-pointer"
                        >
                          {label ? 'Edit' : '+ Label'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : savedProviders.length > 0 ? (
          <div className="text-center py-8 text-neutral-400 bg-white p-4 rounded-xl border border-neutral-200">
            <p className="text-xs font-medium text-neutral-600">No contacts match "{searchTerm}"</p>
            <button 
              onClick={() => setSearchTerm('')} 
              className="mt-1 text-xs font-semibold text-black underline cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-neutral-200 p-5 space-y-2.5">
            <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-lg text-neutral-500">
              🔖
            </div>
            <h3 className="text-xs font-bold uppercase text-black">Empty Phonebook</h3>
            <p className="text-[11px] text-neutral-500 font-normal max-w-xs mx-auto leading-relaxed">
              When viewing profiles on $kill Hub, click "Save Contact" to build your personal phonebook list.
            </p>
            <button
              onClick={onBack}
              className="inline-block bg-black text-white font-semibold px-4 py-2 rounded-xl text-xs uppercase tracking-wider hover:bg-neutral-800 shadow-xs cursor-pointer transition-all active:scale-95"
            >
              Explore $kill Hub &rarr;
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyContactsView;
