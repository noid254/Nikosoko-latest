import React, { useState } from 'react';
import type { SpecialBanner, AppBrandingConfig, AppFeatureConfig } from '../../types';

interface AppearancePageProps {
  categories: string[];
  specialBanners: SpecialBanner[];
  onAddBanner: (banner: Omit<SpecialBanner, 'id'>) => void;
  onDeleteBanner: (bannerId: string) => void;
  brandingConfig?: AppBrandingConfig;
  onSaveBrandingConfig?: (config: AppBrandingConfig) => void;
  featureConfig?: AppFeatureConfig;
  onSaveFeatureConfig?: (config: AppFeatureConfig) => void;
}

const DEFAULT_BRANDING: AppBrandingConfig = {
  appName: 'NikoSoko',
  tagline: "Kenya's Premier Hyperlocal Service & Business Marketplace",
  appIconUrl: '',
  faviconUrl: '',
  heroBannerUrl: '',
  heroTitle: 'NIKOSOKO',
  heroSubtitle: 'Neighborhood Skilled Marketplace',
  primaryColor: '#F59E0B',
  supportPhone: '+254 723 119 356',
  supportEmail: 'support@nikosoko.com'
};

const DEFAULT_FEATURES: AppFeatureConfig = {
  enableTimeline: true,
  enableQaRibuGatePass: true,
  enableGigs: true,
  enableEvents: true,
  enableSaccos: true,
  enableAssetVerification: true,
  enableCourses: true,
  enableCatalogue: true
};

const AppearancePage: React.FC<AppearancePageProps> = ({
  categories,
  specialBanners,
  onAddBanner,
  onDeleteBanner,
  brandingConfig = DEFAULT_BRANDING,
  onSaveBrandingConfig,
  featureConfig = DEFAULT_FEATURES,
  onSaveFeatureConfig
}) => {
  const [activeTab, setActiveTab] = useState<'banners' | 'branding' | 'features'>('banners');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Local Branding Form State
  const [branding, setBranding] = useState<AppBrandingConfig>({
    ...DEFAULT_BRANDING,
    ...brandingConfig
  });

  // Local Feature Flags State
  const [features, setFeatures] = useState<AppFeatureConfig>({
    ...DEFAULT_FEATURES,
    ...featureConfig
  });

  // New Banner Form State
  const [newBanner, setNewBanner] = useState<Omit<SpecialBanner, 'id'>>({
    title: '',
    subtitle: '',
    imageUrl: '',
    badgeText: '',
    actionUrl: '',
    targetCategory: '',
    targetLocation: '',
    targetAgeGroup: 'All',
    minRating: undefined,
    targetService: '',
    isOnlineTarget: undefined,
    isVerifiedTarget: undefined,
    targetReferralCode: '',
    targetJoiningTenure: 'all',
    targetRole: 'all',
    isHeaderHero: true,
    priority: 1,
    startDate: '',
    endDate: '',
    isGlobalHero: true
  });

  const showNotification = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleAddBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.imageUrl) {
      alert('Banner image is required.');
      return;
    }
    
    // Clean up empty fields
    const bannerToAdd = Object.fromEntries(
      Object.entries(newBanner).filter(([, value]) => value !== '' && value !== undefined)
    );
    
    onAddBanner(bannerToAdd as Omit<SpecialBanner, 'id'>);
    showNotification('Hero Banner added successfully!');

    // Reset Form
    setNewBanner({
      title: '',
      subtitle: '',
      imageUrl: '',
      badgeText: '',
      actionUrl: '',
      targetCategory: '',
      targetLocation: '',
      targetAgeGroup: 'All',
      minRating: undefined,
      targetService: '',
      isOnlineTarget: undefined,
      isVerifiedTarget: undefined,
      targetReferralCode: '',
      targetJoiningTenure: 'all',
      targetRole: 'all',
      isHeaderHero: true,
      priority: 1,
      startDate: '',
      endDate: '',
      isGlobalHero: true
    });
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveBrandingConfig) {
      onSaveBrandingConfig(branding);
    } else {
      try {
        localStorage.setItem('nikosoko_branding_config', JSON.stringify(branding));
      } catch (err) {
        console.error(err);
      }
    }
    showNotification('Branding & Assets updated successfully!');
  };

  const handleSaveFeatures = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveFeatureConfig) {
      onSaveFeatureConfig(features);
    } else {
      try {
        localStorage.setItem('nikosoko_feature_config', JSON.stringify(features));
      } catch (err) {
        console.error(err);
      }
    }
    showNotification('Platform Feature Flags updated successfully!');
  };

  const inputClass = "w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500";
  const selectClass = "w-full p-2.5 border border-slate-300 rounded-lg bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500";

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
              Admin Control
            </span>
            <span className="text-xs text-slate-400 font-mono">v1.2</span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white mt-1">
            Platform Appearance, Branding & Features
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Upload targeted hero banners, update app icon/branding, and toggle live app modules.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('banners')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'banners' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            🎨 Hero Banners ({specialBanners.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('branding')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'branding' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            🌟 Branding & Logos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'features' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Feature Flags
          </button>
        </div>
      </div>

      {/* Save Toast Notification */}
      {saveSuccess && (
        <div className="bg-emerald-600 text-white p-3 rounded-xl font-bold text-xs shadow-md animate-fade-in flex items-center justify-between">
          <span>✓ {saveSuccess}</span>
          <button onClick={() => setSaveSuccess(null)} className="text-white hover:text-emerald-200">✕</button>
        </div>
      )}

      {/* SUB-TAB 1: HERO BANNERS & TARGETED CAMPAIGNS */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          {/* Create Banner Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  Upload & Target Hero Banner
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Add global hero banners or target specific categories, locations, age groups, or provider ratings.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Targeting Engine Active
              </span>
            </div>

            <form onSubmit={handleAddBannerSubmit} className="space-y-4">
              {/* Row 1: Image Upload & Live Card Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700">
                    1. Upload Banner Image (High Resolution)*
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required={!newBanner.imageUrl}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (reader.result) {
                            setNewBanner(p => ({ ...p, imageUrl: reader.result as string }));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className={inputClass}
                  />
                  <p className="text-[10px] text-slate-500">
                    Recommended ratio: 16:9 or 3:1 (Width 1200px x Height 400px). Supports JPG, PNG, WEBP.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-700 uppercase mb-1">
                        Banner Headline / Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ⚡ Mega Weekend Sale"
                        value={newBanner.title || ''}
                        onChange={e => setNewBanner(p => ({ ...p, title: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-700 uppercase mb-1">
                        Subtitle / Offer Callout
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Up to 30% off top verified plumbers"
                        value={newBanner.subtitle || ''}
                        onChange={e => setNewBanner(p => ({ ...p, subtitle: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Banner Live Mobile Preview */}
                <div className="space-y-1.5">
                  <label className="block text-[9.5px] font-black uppercase tracking-wider text-slate-700">
                    Live Mobile Card Preview
                  </label>
                  <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-xs bg-slate-900 aspect-21/9 min-h-[110px] flex items-end p-3">
                    {newBanner.imageUrl ? (
                      <img src={newBanner.imageUrl} alt="Banner Preview" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center p-2 text-center">
                        <span className="text-xl">🖼️</span>
                        <span className="text-[9px] font-bold text-slate-400">Upload Image to Preview</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Floating Badge */}
                    <span className="absolute top-2 left-2 bg-amber-400 text-slate-950 font-black text-[8px] px-2 py-0.5 rounded uppercase tracking-wider shadow-xs">
                      {newBanner.badgeText || 'FEATURED'}
                    </span>

                    <div className="relative z-10 text-white w-full">
                      <h4 className="font-extrabold text-xs leading-tight drop-shadow-md truncate">
                        {newBanner.title || 'Your Banner Title Here'}
                      </h4>
                      <p className="text-[9px] text-slate-200 line-clamp-1 drop-shadow-xs">
                        {newBanner.subtitle || 'Your subtitle callout text goes here'}
                      </p>
                    </div>
                  </div>
                  {newBanner.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setNewBanner(p => ({ ...p, imageUrl: '' }))}
                      className="text-[10px] font-bold text-rose-600 hover:underline block text-right w-full"
                    >
                      Clear Image
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: Targeting Criteria Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-1">
                  2. Audience Targeting Parameters (Optional)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-700 uppercase mb-1">
                      Target Area / Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nairobi, Eldoret, Westlands"
                      value={newBanner.targetLocation || ''}
                      onChange={e => setNewBanner(p => ({ ...p, targetLocation: e.target.value }))}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-700 uppercase mb-1">
                      Target Profession / Category
                    </label>
                    <select
                      value={newBanner.targetCategory || ''}
                      onChange={e => setNewBanner(p => ({ ...p, targetCategory: e.target.value }))}
                      className={selectClass}
                    >
                      <option value="">All Professions / Categories</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-700 uppercase mb-1">
                      Min User / Provider Rating
                    </label>
                    <select
                      value={newBanner.minRating || ''}
                      onChange={e => setNewBanner(p => ({ ...p, minRating: e.target.value ? Number(e.target.value) : undefined }))}
                      className={selectClass}
                    >
                      <option value="">Any Rating (0 - 5 ★)</option>
                      <option value="4.5">4.5+ Rating (Top Tier)</option>
                      <option value="4.0">4.0+ Rating (Highly Rated)</option>
                      <option value="3.5">3.5+ Rating</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-700 uppercase mb-1">
                      Member Joining Tenure
                    </label>
                    <select
                      value={newBanner.targetJoiningTenure || 'all'}
                      onChange={e => setNewBanner(p => ({ ...p, targetJoiningTenure: e.target.value as any }))}
                      className={selectClass}
                    >
                      <option value="all">All Members (New & Existing)</option>
                      <option value="new_members">New Members (Joined &lt;30 Days)</option>
                      <option value="tenured">Tenured Members (Joined &gt;30 Days)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-700 uppercase mb-1">
                      Target User Role / Segment
                    </label>
                    <select
                      value={newBanner.targetRole || 'all'}
                      onChange={e => setNewBanner(p => ({ ...p, targetRole: e.target.value as any }))}
                      className={selectClass}
                    >
                      <option value="all">All Users (Browsers & Members)</option>
                      <option value="provider">Skilled Artisans & Service Pros</option>
                      <option value="client">Clients & Service Seekers</option>
                      <option value="guest">Guests / Unauthenticated</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-700 uppercase mb-1">
                      Target Age Demographic
                    </label>
                    <select
                      value={newBanner.targetAgeGroup || 'All'}
                      onChange={e => setNewBanner(p => ({ ...p, targetAgeGroup: e.target.value as any }))}
                      className={selectClass}
                    >
                      <option value="All">All Ages</option>
                      <option value="18-24">18 - 24 Years</option>
                      <option value="25-34">25 - 34 Years</option>
                      <option value="35-50">35 - 50 Years</option>
                      <option value="50+">50+ Years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-700 uppercase mb-1">
                      Target Service Keyword
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Electrician, Plumbing, Boda"
                      value={newBanner.targetService || ''}
                      onChange={e => setNewBanner(p => ({ ...p, targetService: e.target.value }))}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-700 uppercase mb-1">
                      Display Priority (1 - 100)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="e.g. 10 (Higher = Preferred)"
                      value={newBanner.priority || 1}
                      onChange={e => setNewBanner(p => ({ ...p, priority: Number(e.target.value) }))}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Action Link, Dates & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-bold text-slate-700 uppercase mb-1">
                    Action URL / CTA Link
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /gigs or /tukosoko or https://..."
                    value={newBanner.actionUrl || ''}
                    onChange={e => setNewBanner(p => ({ ...p, actionUrl: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-700 uppercase mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PROMO"
                    value={newBanner.badgeText || ''}
                    onChange={e => setNewBanner(p => ({ ...p, badgeText: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-700 uppercase mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newBanner.startDate || ''}
                    onChange={e => setNewBanner(p => ({ ...p, startDate: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-700 uppercase mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newBanner.endDate || ''}
                    onChange={e => setNewBanner(p => ({ ...p, endDate: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold py-3 rounded-xl transition-all uppercase text-xs tracking-wider cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <span>➕ Publish Hero Banner</span>
                <span>&rarr;</span>
              </button>
            </form>
          </div>

          {/* Active Banners List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                Active Hero Banners ({specialBanners.length})
              </h3>
              <span className="text-xs text-slate-500 font-bold">
                Displayed in home carousel & search results
              </span>
            </div>

            <div className="space-y-3">
              {specialBanners.map((banner, idx) => (
                <div
                  key={banner.id || idx}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 gap-3 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title || 'Hero Banner'}
                      className="w-24 h-14 rounded-lg object-cover border border-slate-300 shrink-0 bg-slate-900"
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {banner.badgeText && (
                          <span className="bg-amber-400 text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded uppercase">
                            {banner.badgeText}
                          </span>
                        )}
                        <h4 className="font-extrabold text-xs text-slate-900 truncate">
                          {banner.title || `Hero Banner #${idx + 1}`}
                        </h4>
                      </div>

                      {banner.subtitle && (
                        <p className="text-[11px] text-slate-600 line-clamp-1">{banner.subtitle}</p>
                      )}

                      {/* Targeting Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {banner.targetLocation && (
                          <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded">
                            📍 Area: {banner.targetLocation}
                          </span>
                        )}
                        {banner.targetCategory && (
                          <span className="bg-blue-100 text-blue-800 text-[8px] font-black px-1.5 py-0.5 rounded">
                            🛠️ Prof: {banner.targetCategory}
                          </span>
                        )}
                        {banner.minRating && (
                          <span className="bg-amber-100 text-amber-900 text-[8px] font-black px-1.5 py-0.5 rounded">
                            ★ {banner.minRating}+ Rating
                          </span>
                        )}
                        {banner.targetJoiningTenure && banner.targetJoiningTenure !== 'all' && (
                          <span className="bg-indigo-100 text-indigo-800 text-[8px] font-black px-1.5 py-0.5 rounded">
                            ⏱️ {banner.targetJoiningTenure === 'new_members' ? 'New Members (<30d)' : 'Tenured Members (>30d)'}
                          </span>
                        )}
                        {banner.targetRole && banner.targetRole !== 'all' && (
                          <span className="bg-cyan-100 text-cyan-900 text-[8px] font-black px-1.5 py-0.5 rounded">
                            👤 Segment: {banner.targetRole.toUpperCase()}
                          </span>
                        )}
                        {banner.targetAgeGroup && banner.targetAgeGroup !== 'All' && (
                          <span className="bg-purple-100 text-purple-800 text-[8px] font-black px-1.5 py-0.5 rounded">
                            Age: {banner.targetAgeGroup}
                          </span>
                        )}
                        {banner.priority && banner.priority > 1 && (
                          <span className="bg-slate-200 text-slate-800 text-[8px] font-black px-1.5 py-0.5 rounded">
                            Priority: P{banner.priority}
                          </span>
                        )}
                        {!banner.targetCategory && !banner.targetLocation && (!banner.targetJoiningTenure || banner.targetJoiningTenure === 'all') && (
                          <span className="bg-slate-200 text-slate-700 text-[8px] font-black px-1.5 py-0.5 rounded">
                            🌐 Global (All Users)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => onDeleteBanner(banner.id)}
                      className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition-all uppercase tracking-wider cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {specialBanners.length === 0 && (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <span className="text-2xl">🖼️</span>
                  <p className="text-xs font-bold text-slate-500 mt-1">No special hero banners published yet.</p>
                  <p className="text-[10px] text-slate-400">Use the form above to upload your first targeted campaign banner.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BRANDING & LOGOS */}
      {activeTab === 'branding' && (
        <form onSubmit={handleSaveBranding} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
              App Branding, Logos & Metadata
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Customize the platform name, logo icons, favicon, tagline, and contact credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* App Icon Upload */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700">
                Platform App Icon (Square Logo)
              </label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md border border-slate-300 shrink-0 overflow-hidden">
                  {branding.appIconUrl ? (
                    <img src={branding.appIconUrl} alt="App Icon" className="w-full h-full object-cover" />
                  ) : (
                    '👑'
                  )}
                </div>
                <div className="space-y-1.5 flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (reader.result) {
                            setBranding(p => ({ ...p, appIconUrl: reader.result as string }));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className={inputClass}
                  />
                  <span className="text-[9px] text-slate-500 block">
                    Recommended: 512x512 PNG/SVG with transparent or solid canvas.
                  </span>
                </div>
              </div>
            </div>

            {/* Favicon Upload */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700">
                Browser Favicon (Tab Icon)
              </label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-lg shadow-xs border border-slate-300 shrink-0 overflow-hidden">
                  {branding.faviconUrl ? (
                    <img src={branding.faviconUrl} alt="Favicon" className="w-full h-full object-cover" />
                  ) : (
                    '🇰🇪'
                  )}
                </div>
                <div className="space-y-1.5 flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (reader.result) {
                            setBranding(p => ({ ...p, faviconUrl: reader.result as string }));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className={inputClass}
                  />
                  <span className="text-[9px] text-slate-500 block">
                    Recommended: 32x32 ICO or PNG.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Text & Header Settings */}
          <div className="md:col-span-2 bg-black text-white p-3 rounded-xl border border-slate-800 flex items-center justify-between mb-1">
            <div>
              <span className="text-xs font-black uppercase tracking-wider block">Top Hero Header Banner Settings</span>
              <span className="text-[9.5px] text-slate-300">Customize the top main marketplace banner box (Title, Tagline, Background Image)</span>
            </div>
            <span className="text-lg">🖼️</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                Top Hero Header Title *
              </label>
              <input
                type="text"
                required
                value={branding.heroTitle || branding.appName}
                onChange={e => setBranding(p => ({ ...p, appName: e.target.value, heroTitle: e.target.value }))}
                className={inputClass}
                placeholder="e.g. NIKOSOKO"
              />
              <span className="text-[9px] text-slate-500 block mt-1">Main title inside top hero banner box.</span>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                Top Hero Header Subtitle / Tagline
              </label>
              <input
                type="text"
                value={branding.heroSubtitle || branding.tagline}
                onChange={e => setBranding(p => ({ ...p, tagline: e.target.value, heroSubtitle: e.target.value }))}
                className={inputClass}
                placeholder="e.g. NEIGHBORHOOD SKILLED MARKETPLACE"
              />
              <span className="text-[9px] text-slate-500 block mt-1">Subtitle text under main title in top hero banner box.</span>
            </div>

            <div className="md:col-span-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700">
                Top Hero Header Background Image
              </label>
              <div className="flex items-center gap-3">
                {branding.heroBannerUrl ? (
                  <div className="relative shrink-0">
                    <img src={branding.heroBannerUrl} alt="Top Hero Banner Background" className="w-24 h-14 object-cover rounded-lg border border-slate-300 shadow-xs" />
                    <button
                      type="button"
                      onClick={() => setBranding(p => ({ ...p, heroBannerUrl: '' }))}
                      className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center cursor-pointer shadow-xs hover:bg-red-700"
                      title="Remove background image"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-14 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center text-[9.5px] text-slate-500 font-bold shrink-0">
                    Solid Black
                  </div>
                )}
                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (reader.result) {
                            setBranding(p => ({ ...p, heroBannerUrl: reader.result as string }));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className={inputClass}
                  />
                  <span className="text-[9px] text-slate-500 block">
                    Upload custom image to set as the background for the top hero header box.
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                Support Phone Line
              </label>
              <input
                type="text"
                value={branding.supportPhone || ''}
                onChange={e => setBranding(p => ({ ...p, supportPhone: e.target.value }))}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={branding.supportEmail || ''}
                onChange={e => setBranding(p => ({ ...p, supportEmail: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          {/* Primary Accent Color Palette */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700">
              Primary Theme Accent Color
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { name: 'Amber Gold', hex: '#F59E0B' },
                { name: 'Emerald Kenya', hex: '#10B981' },
                { name: 'Royal Indigo', hex: '#6366F1' },
                { name: 'Crimson Red', hex: '#EF4444' },
                { name: 'Obsidian Black', hex: '#0F172A' }
              ].map(c => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setBranding(p => ({ ...p, primaryColor: c.hex }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    branding.primaryColor === c.hex ? 'border-black ring-2 ring-black bg-white shadow-xs' : 'border-slate-300 bg-white hover:bg-slate-100'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-400" style={{ backgroundColor: c.hex }} />
                  <span>{c.name}</span>
                </button>
              ))}

              <div className="flex items-center gap-2 pl-2 border-l border-slate-300">
                <span className="text-xs font-bold text-slate-600">Custom Hex:</span>
                <input
                  type="color"
                  value={branding.primaryColor || '#F59E0B'}
                  onChange={e => setBranding(p => ({ ...p, primaryColor: e.target.value }))}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold py-3 rounded-xl transition-all uppercase text-xs tracking-wider cursor-pointer shadow-md"
          >
            💾 Save Branding Settings
          </button>
        </form>
      )}

      {/* SUB-TAB 3: FEATURE FLAGS */}
      {activeTab === 'features' && (
        <form onSubmit={handleSaveFeatures} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
              Live Platform Feature Modules
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Enable or disable specific sections and tools in real-time across the app.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[
              {
                id: 'enableTimeline',
                title: '📱 Community Timeline Feed',
                desc: 'Allows users and providers to publish timeline updates, work photos, and product posts.',
                val: features.enableTimeline
              },
              {
                id: 'enableQaRibuGatePass',
                title: '🚪 QA-Ribu Gate Pass & Visitor Check-In',
                desc: 'Digital gate passes, visitor check-ins, gateman access control, and premise logs.',
                val: features.enableQaRibuGatePass
              },
              {
                id: 'enableGigs',
                title: '💼 Gigs & Task Marketplace',
                desc: 'Allows clients to post custom jobs/gigs and providers to apply with quotes.',
                val: features.enableGigs
              },
              {
                id: 'enableEvents',
                title: '🎟️ Events & Ticket Passes',
                desc: 'Event listings, ticket purchasing, and QR code gate validation.',
                val: features.enableEvents
              },
              {
                id: 'enableSaccos',
                title: '🚐 Sacco & Transport Hub',
                desc: 'Registered matatu/bus Sacco directories, driver memberships, and vehicle verification.',
                val: features.enableSaccos
              },
              {
                id: 'enableAssetVerification',
                title: '🛡️ Asset & Identity Verification',
                desc: 'Serial number registration, ID upload verification, and ownership checks.',
                val: features.enableAssetVerification
              },
              {
                id: 'enableCourses',
                title: '📚 Courses & Skill Academy',
                desc: 'Masterclasses, skill badges, and certified provider training modules.',
                val: features.enableCourses
              },
              {
                id: 'enableCatalogue',
                title: '🛒 Business Catalogues & Menus',
                desc: 'Digital product storefronts, restaurant menus, and direct item ordering.',
                val: features.enableCatalogue
              }
            ].map(item => (
              <label
                key={item.id}
                className={`p-4 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
                  item.val ? 'bg-amber-50/50 border-amber-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.val}
                  onChange={e => setFeatures(p => ({ ...p, [item.id]: e.target.checked }))}
                  className="mt-1 w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <span className="block text-xs font-black text-slate-900">{item.title}</span>
                  <span className="block text-[10.5px] text-slate-600 leading-tight">{item.desc}</span>
                </div>
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold py-3 rounded-xl transition-all uppercase text-xs tracking-wider cursor-pointer shadow-md"
          >
            ⚡ Save Feature Flags
          </button>
        </form>
      )}
    </div>
  );
};

export default AppearancePage;
