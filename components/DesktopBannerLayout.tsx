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

const VALUE_PROPS = [
  { icon: '🛠️', iconBg: 'bg-amber-400/10', title: 'Monetize Any Skill', desc: 'TV mounting, gas delivery, plumbing, electrical, braiding & more.' },
  { icon: '💸', iconBg: 'bg-emerald-400/10', title: '0% Commission', desc: 'Keep 100% of your money, paid directly via M-Pesa or cash.' },
  { icon: '📍', iconBg: 'bg-blue-400/10', title: 'Hyperlocal Discovery', desc: 'Get discovered by nearby customers searching for your skills in real time.' },
  { icon: '🛡️', iconBg: 'bg-purple-400/10', title: 'Sacco & ID Verified', desc: 'Build trust with verified badges, door profiles & digital gate passes.' },
];

const HOW_IT_WORKS = [
  { step: '1', title: 'Create your account', desc: 'Sign up here on the website — it only takes a minute.' },
  { step: '2', title: 'Open NikoSoko on your phone', desc: 'Visit nikosoko.com in your phone’s browser and log in with the same details.' },
  { step: '3', title: 'Find or offer services', desc: 'Searching for professionals, booking, and chat all happen in the mobile app.' },
];

const DesktopLandingPage: React.FC<{
  currentUser: ServiceProvider | null;
  onOpenSignUp: () => void;
  onOpenLogin: () => void;
}> = ({ currentUser, onOpenSignUp, onOpenLogin }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Glow accents */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* NAV */}
      <header className="relative z-10 flex items-center justify-between px-8 xl:px-16 py-6 border-b border-slate-800/80">
        {/* Source artwork is a square 1408x1408 file with heavy black padding
            around the wordmark; crop to just that band via object-cover,
            same technique used for the mobile hero (NikoSoko.tsx). */}
        <div className="w-32 aspect-[9/2] overflow-hidden">
          <img
            src="https://i.imgur.com/4wjCdrs.jpeg"
            alt="NikoSoko"
            className="w-full h-full object-cover object-center select-none"
          />
        </div>
        <div className="flex items-center gap-3">
          {!currentUser && (
            <button onClick={onOpenLogin} className="text-sm font-bold text-slate-300 hover:text-white transition-colors cursor-pointer px-3 py-2">
              Sign In
            </button>
          )}
          <button
            onClick={currentUser ? onOpenLogin : onOpenSignUp}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm px-5 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            {currentUser ? 'My Account' : 'Sign Up Free'}
          </button>
        </div>
      </header>

      {/* HERO */}
      <main className="relative z-10 max-w-5xl mx-auto px-8 xl:px-16 pt-16 pb-20 text-center">
        <div className="w-72 xl:w-80 aspect-[9/2] overflow-hidden mx-auto">
          <img
            src="https://i.imgur.com/4wjCdrs.jpeg"
            alt="NikoSoko"
            className="w-full h-full object-cover object-center select-none"
          />
        </div>

        <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
          <span>⚡</span> Nearby, Skilled and Ready
        </div>

        <h1 className="mt-6 text-4xl xl:text-5xl font-black tracking-tight leading-tight">
          Kenya's Marketplace for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-teal-200">
            Skilled Local Professionals
          </span>
        </h1>

        <p className="mt-5 text-slate-300 text-base leading-relaxed font-medium max-w-2xl mx-auto">
          Join thousands of artisans, technicians, and service providers on NikoSoko. Create your profile,
          list your rates, and get booked by nearby clients with zero commission.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={currentUser ? onOpenLogin : onOpenSignUp}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3.5 px-7 rounded-xl text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            {currentUser ? 'Manage My Account' : '🚀 Create Free Account'}
          </button>
          {!currentUser && (
            <button
              onClick={onOpenLogin}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Desktop <-> phone hand-off explainer */}
        <div className="mt-14 max-w-2xl mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-left flex items-start gap-4">
          <span className="text-3xl shrink-0">📱</span>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wide">Built for your phone</h3>
            <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
              Searching for professionals, browsing services, and booking all happen in the NikoSoko mobile
              app — that part isn't available here on desktop. Create your account on this page, then open{' '}
              <span className="text-amber-300 font-bold">nikosoko.com</span> on your phone and log in with the
              same details to get started.
            </p>
          </div>
        </div>
      </main>

      {/* VALUE PROPS */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 xl:px-16 pb-20">
        <h2 className="text-center text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Why NikoSoko</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VALUE_PROPS.map(v => (
            <div key={v.title} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className={`inline-flex text-xl p-2 rounded-xl ${v.iconBg}`}>{v.icon}</span>
              <h4 className="text-sm font-bold text-white mt-3">{v.title}</h4>
              <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 max-w-3xl mx-auto px-8 xl:px-16 pb-24">
        <h2 className="text-center text-xs font-black uppercase tracking-widest text-slate-500 mb-8">Getting Started</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map(s => (
            <div key={s.step} className="text-center">
              <div className="w-9 h-9 mx-auto rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm">
                {s.step}
              </div>
              <h4 className="text-sm font-bold text-white mt-3">{s.title}</h4>
              <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-800/80 px-8 xl:px-16 py-6 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
        <span>© NikoSoko Marketplace Platform</span>
        <span>Hyperlocal Trade Network</span>
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
