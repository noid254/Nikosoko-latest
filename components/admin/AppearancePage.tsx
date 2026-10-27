import React, { useState } from 'react';
import type { AppBrandingConfig } from '../../types';

interface AppearancePageProps {
  brandingConfig?: AppBrandingConfig;
  onSaveBrandingConfig?: (config: AppBrandingConfig) => void;
}

const DEFAULT_BRANDING: AppBrandingConfig = {
  appName: 'NikoSoko',
  tagline: "Kenya's Premier Hyperlocal Service & Business Marketplace",
  appIconUrl: 'https://nikosoko.com/images/nikosoko-icon.jpg',
  faviconUrl: 'https://nikosoko.com/images/nikosoko-favicon.jpg',
  heroBannerUrl: 'https://nikosoko.com/images/nikosoko-hero-banner-white.jpg',
  heroTitle: 'NIKOSOKO',
  heroSubtitle: 'Neighborhood Skilled Marketplace',
  primaryColor: '#F59E0B',
  supportPhone: '+254 723 119 356',
  supportEmail: 'support@nikosoko.com'
};

const AppearancePage: React.FC<AppearancePageProps> = ({
  brandingConfig = DEFAULT_BRANDING,
  onSaveBrandingConfig
}) => {
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Local Branding Form State
  const [branding, setBranding] = useState<AppBrandingConfig>({
    ...DEFAULT_BRANDING,
    ...brandingConfig
  });

  const showNotification = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 3000);
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

  const inputClass = "w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500";

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
            App Branding
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Update the app name, icon, hero banner and support contacts.
          </p>
        </div>
      </div>

      {/* Save Toast Notification */}
      {saveSuccess && (
        <div className="bg-emerald-600 text-white p-3 rounded-xl font-bold text-xs shadow-md animate-fade-in flex items-center justify-between">
          <span>✓ {saveSuccess}</span>
          <button onClick={() => setSaveSuccess(null)} className="text-white hover:text-emerald-200">✕</button>
        </div>
      )}

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
    </div>
  );
};

export default AppearancePage;
