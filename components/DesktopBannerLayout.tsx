import React from 'react';
import { ServiceProvider } from '../types';

interface DesktopBannerLayoutProps {
  brandingConfig?: { heroBannerUrl?: string; appIconUrl?: string };
  children: React.ReactNode;
  currentUser: ServiceProvider | null;
  onOpenSignUp: () => void;
  onOpenLogin: () => void;
}

const DESKTOP_BREAKPOINT = '(min-width: 1024px)';
const LOGO_DARK = 'https://i.imgur.com/xHseJe9.jpeg'; // white wordmark on black - use on dark backgrounds
const LOGO_LIGHT = 'https://i.imgur.com/XLZLQYS.jpeg'; // black wordmark on white - use on light backgrounds

/** True once mounted and above the desktop breakpoint. Starts false so
 * server/first-paint output matches the mobile app (no flash of the
 * landing page on phones), then syncs to the real viewport on mount. */
function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia(DESKTOP_BREAKPOINT);
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isDesktop;
}

// Stock photography below is pulled from the same Unsplash photo IDs already
// live elsewhere in this app (verified working, category-matched via
// Tukosoko.tsx's CATEGORY_PHOTO_PRESETS) so nothing here depends on an
// unverified image URL. All of it is placeholder stock and swappable later.
const AUDIENCES = [
  {
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600',
    title: 'Individuals & Professionals',
    desc: 'Create a free profile, list what you do, and get discovered by clients near you — anywhere in Kenya.',
    cta: 'Create Free Account',
  },
  {
    photo: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600',
    title: 'Small Businesses',
    desc: 'Run a plumbing crew, salon, or repair shop? List your team and let NikoSoko bring you nearby jobs.',
    cta: 'List Your Business',
  },
  {
    photo: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=600',
    title: 'Schools & Institutions',
    desc: 'TVET colleges and trade schools can verify their trainees directly on the platform — verified graduates get hired faster.',
    cta: 'Partner Your School',
  },
  {
    photo: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=600',
    title: 'Big Companies & Brands',
    desc: 'Partner with NikoSoko as a recruitment and quality platform. A paint brand, for example, can certify NikoSoko painters as official installers — growing reach while every job is done right.',
    cta: 'Become a Brand Partner',
  },
];

const SERVICE_CATEGORIES = [
  { photo: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=500', label: 'Electrical' },
  { photo: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=500', label: 'Plumbing' },
  { photo: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?q=80&w=500', label: 'Braiding & Beauty' },
  { photo: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?q=80&w=500', label: 'Water Delivery' },
  { photo: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=500', label: 'Gas Refill' },
  { photo: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=500', label: 'TV Mounting' },
];

const PARTNER_PLACEHOLDERS = ['Paint Brand', 'Solar Co.', 'TVET College', 'Building Materials', 'Insurance Partner', 'Logistics Co.'];

const VALUE_PROPS = [
  { icon: '🛠️', title: 'Monetize Any Skill', desc: 'TV mounting, gas delivery, plumbing, electrical, braiding & more.' },
  { icon: '💸', title: '0% Commission', desc: 'Keep 100% of your money, paid directly via M-Pesa or cash.' },
  { icon: '📍', title: 'Hyperlocal Discovery', desc: 'Get discovered by nearby customers searching for your skills in real time.' },
  { icon: '🛡️', title: 'Sacco & ID Verified', desc: 'Build trust with verified badges, door profiles & digital gate passes.' },
];

const HOW_IT_WORKS = [
  { step: '1', title: 'Create your account', desc: 'Sign up here on the website — it only takes a minute.' },
  { step: '2', title: 'Open NikoSoko on your phone', desc: 'Visit nikosoko.com in your phone’s browser and log in with the same details.' },
  { step: '3', title: 'Find or offer services', desc: 'Searching for professionals, booking, and chat all happen in the mobile app.' },
];

/** Stylized phone mockup echoing the real mobile home screen (black header,
 * wordmark hero band, overlapping search bar, category pills, card grid) -
 * built in CSS, not a literal screenshot. */
const PhoneMockup: React.FC = () => (
  <div className="relative w-[230px] shrink-0 mx-auto">
    <div className="relative rounded-[2.2rem] border-[6px] border-zinc-800 bg-black shadow-2xl overflow-hidden aspect-[9/19]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-b-2xl z-20" />
      <div className="absolute inset-0 flex flex-col bg-white">
        <div className="bg-black px-3 pt-5 pb-2 flex items-center justify-between">
          <div className="w-3 h-2.5 flex flex-col justify-between">
            <span className="h-[1.5px] bg-white/70 rounded-full" />
            <span className="h-[1.5px] bg-white/70 rounded-full" />
            <span className="h-[1.5px] bg-white/70 rounded-full" />
          </div>
          <span className="text-white text-[7px] font-bold">📍 Nairobi CBD</span>
          <div className="w-2.5 h-2.5 rounded-full border border-white/50" />
        </div>
        <div className="bg-black pt-2 pb-5 flex items-center justify-center">
          <img src={LOGO_DARK} alt="" className="h-4 object-contain opacity-95" />
        </div>
        <div className="-mt-3 px-3 relative z-10">
          <div className="bg-white border border-gray-200 rounded-lg h-5 shadow-sm" />
        </div>
        <div className="flex gap-1 px-3 mt-2">
          {['⚡', '🚰', '🛵', '🧹'].map((e, i) => (
            <span key={i} className="text-[8px] bg-gray-100 rounded-full px-1.5 py-0.5">{e}</span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1.5 px-3 mt-2.5">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
              <div className="h-8 bg-gray-200" />
              <div className="p-1 space-y-0.5">
                <div className="h-1 w-3/4 bg-gray-300 rounded-full" />
                <div className="h-1 w-1/2 bg-emerald-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="absolute -right-5 top-10 bg-white text-black text-[10px] font-black px-2.5 py-1.5 rounded-xl shadow-xl flex items-center gap-1.5 border border-gray-100">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Live in Nairobi
    </div>
  </div>
);

const DesktopLandingPage: React.FC<{
  currentUser: ServiceProvider | null;
  onOpenSignUp: () => void;
  onOpenLogin: () => void;
}> = ({ currentUser, onOpenSignUp, onOpenLogin }) => {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* NAV */}
      <header className="relative z-20 flex items-center justify-between px-8 xl:px-16 py-6 border-b border-white/10">
        <div className="w-28 aspect-[5/2] overflow-hidden">
          <img src={LOGO_DARK} alt="NikoSoko" className="w-full h-full object-cover object-center select-none" />
        </div>
        <div className="flex items-center gap-3">
          {!currentUser && (
            <button onClick={onOpenLogin} className="text-sm font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer px-3 py-2">
              Sign In
            </button>
          )}
          <button
            onClick={currentUser ? onOpenLogin : onOpenSignUp}
            className="bg-white hover:bg-zinc-200 text-black font-black text-sm px-5 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            {currentUser ? 'My Account' : 'Sign Up Free'}
          </button>
        </div>
      </header>

      {/* HERO - photographic backdrop, dark overlay, phone mockup floating on top */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=1600')" }}
        />
        <div className="absolute inset-0 bg-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />

        <div className="relative z-10 max-w-6xl mx-auto px-8 xl:px-16 pt-16 pb-20">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Kenya's Hyperlocal Service &amp; Skill Marketplace
              </div>

              <h1 className="mt-6 text-4xl xl:text-5xl font-black tracking-tight leading-tight">
                Find Skilled Help Nearby,<br />
                or <span className="text-emerald-400">Get Hired</span> For What You Do Best.
              </h1>

              <p className="mt-5 text-zinc-300 text-base leading-relaxed font-medium max-w-xl mx-auto lg:mx-0">
                NikoSoko connects Kenyan households, small businesses, schools and enterprise brands with
                verified local artisans, technicians, and service providers. Sign up free — everyone is
                welcome, from individuals to institutions.
              </p>

              <div className="mt-8 flex items-center justify-center lg:justify-start gap-3">
                <button
                  onClick={currentUser ? onOpenLogin : onOpenSignUp}
                  className="bg-white hover:bg-zinc-200 text-black font-black py-3.5 px-7 rounded-xl text-sm uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                >
                  {currentUser ? 'Manage My Account' : 'Create Free Account'}
                </button>
                {!currentUser && (
                  <button
                    onClick={onOpenLogin}
                    className="bg-white/5 hover:bg-white/10 border border-white/20 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all cursor-pointer"
                  >
                    Sign In
                  </button>
                )}
              </div>

              <div className="mt-6 flex items-center justify-center lg:justify-start gap-4 text-[11px] text-zinc-400 font-semibold">
                <span>🇰🇪 Built for Kenya</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span>Paid via M-Pesa</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span>0% Commission</span>
              </div>
            </div>

            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* BUILT FOR EVERYONE */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 xl:px-16 py-20">
        <h2 className="text-center text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Built For Everyone</h2>
        <p className="text-center text-zinc-400 text-sm max-w-xl mx-auto mb-10">
          Whether you're one person with a toolkit or an enterprise brand — there's a place for you on NikoSoko.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {AUDIENCES.map(a => (
            <div key={a.title} className="rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden flex flex-col">
              <div className="h-28 overflow-hidden">
                <img src={a.photo} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-sm font-black text-white">{a.title}</h3>
                <p className="text-[12.5px] text-zinc-400 mt-2 leading-relaxed flex-1">{a.desc}</p>
                <button
                  onClick={currentUser ? onOpenLogin : onOpenSignUp}
                  className="mt-4 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer text-left flex items-center gap-1"
                >
                  {a.cta} <span>&rarr;</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES TRADED ON THE PLATFORM */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 xl:px-16 pb-20">
        <h2 className="text-center text-xs font-black uppercase tracking-widest text-zinc-500 mb-10">Services Traded On NikoSoko</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {SERVICE_CATEGORIES.map(s => (
            <div key={s.label} className="relative rounded-xl overflow-hidden aspect-square group">
              <img src={s.photo} alt={s.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <span className="absolute bottom-2 left-2 right-2 text-[11px] font-bold text-white leading-tight">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PARTNERS */}
      <section className="relative z-10 bg-zinc-950 border-y border-white/10 py-16">
        <div className="max-w-6xl mx-auto px-8 xl:px-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Brand &amp; Institution Partners</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Companies and institutions partner with NikoSoko to train, certify, and recruit skilled
              professionals — ensuring products are installed and maintained correctly while growing reach
              across Kenya.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {PARTNER_PLACEHOLDERS.map(p => (
              <div key={p} className="aspect-[3/2] rounded-xl border border-dashed border-white/15 bg-white/5 flex items-center justify-center text-center px-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">{p}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] text-zinc-600 mt-4">Placeholder partner slots — replace with real logos as partnerships are confirmed.</p>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 xl:px-16 py-20">
        <h2 className="text-center text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">Why NikoSoko</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VALUE_PROPS.map(v => (
            <div key={v.title} className="p-5 rounded-2xl bg-zinc-900 border border-white/10">
              <span className="inline-flex text-xl p-2 rounded-xl bg-white/5">{v.icon}</span>
              <h4 className="text-sm font-bold text-white mt-3">{v.title}</h4>
              <p className="text-[13px] text-zinc-400 mt-1 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 max-w-3xl mx-auto px-8 xl:px-16 pb-20">
        <h2 className="text-center text-xs font-black uppercase tracking-widest text-zinc-500 mb-8">Getting Started</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map(s => (
            <div key={s.step} className="text-center">
              <div className="w-9 h-9 mx-auto rounded-full bg-emerald-500 text-black font-black flex items-center justify-center text-sm">
                {s.step}
              </div>
              <h4 className="text-sm font-bold text-white mt-3">{s.title}</h4>
              <p className="text-[13px] text-zinc-400 mt-1 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LIGHT CTA BAND - inverse (dark-on-white) logo lives here */}
      <section className="relative z-10 bg-white text-black py-16">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <div className="w-32 aspect-[6/1] overflow-hidden mx-auto mb-6">
            <img src={LOGO_LIGHT} alt="NikoSoko" className="w-full h-full object-cover object-center select-none" />
          </div>
          <h2 className="text-2xl xl:text-3xl font-black tracking-tight">Ready to join Kenya's hyperlocal marketplace?</h2>
          <p className="mt-3 text-gray-600 text-sm max-w-lg mx-auto">
            Individuals, small businesses, schools, and big brands all start the same way — one free account.
          </p>
          <button
            onClick={currentUser ? onOpenLogin : onOpenSignUp}
            className="mt-6 bg-black hover:bg-zinc-800 text-white font-black py-3.5 px-8 rounded-xl text-sm uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
          >
            {currentUser ? 'Manage My Account' : 'Create Free Account'}
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 px-8 xl:px-16 py-6 flex items-center justify-between text-[11px] text-zinc-500 font-semibold">
        <span>© NikoSoko Marketplace Platform</span>
        <span>Hyperlocal Service &amp; Skill Network — Kenya</span>
      </footer>
    </div>
  );
};

const DesktopBannerLayout: React.FC<DesktopBannerLayoutProps> = ({
  children,
  currentUser,
  onOpenSignUp,
  onOpenLogin,
}) => {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return <DesktopLandingPage currentUser={currentUser} onOpenSignUp={onOpenSignUp} onOpenLogin={onOpenLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-start overflow-y-auto">
      <div className="w-full max-w-md min-h-screen bg-white shadow-2xl relative flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default DesktopBannerLayout;
