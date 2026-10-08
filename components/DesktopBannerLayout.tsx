import React from 'react';
import { ServiceProvider } from '../types';

interface DesktopBannerLayoutProps {
  brandingConfig?: { heroBannerUrl?: string; appIconUrl?: string };
  children: React.ReactNode;
  currentUser: ServiceProvider | null;
  onOpenSignUp: () => void;
  onOpenOrgSignUp: () => void;
  onOpenLogin: () => void;
}

const DESKTOP_BREAKPOINT = '(min-width: 1024px)';
const LOGO_DARK = 'https://i.imgur.com/xHseJe9.jpeg'; // white wordmark on black - use on dark backgrounds
const LOGO_LIGHT = 'https://i.imgur.com/XLZLQYS.jpeg'; // black wordmark on white - use on light backgrounds
const CARD_PHOTO = '/nikosoko-card.jpg'; // photo of the physical NFC business card (served from /public)

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

type LandingRoute = 'home' | 'organizations';
const ORG_HASH = '#/organizations';

/** Tiny hash router so the organizations page is linkable/shareable
 * (nikosoko.com/#/organizations) without touching the app's own routing. */
function useLandingRoute(): LandingRoute {
  const read = (): LandingRoute => (window.location.hash === ORG_HASH ? 'organizations' : 'home');
  const [route, setRoute] = React.useState<LandingRoute>(read);

  React.useEffect(() => {
    const onHash = () => {
      setRoute(read());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return route;
}

// Stock photography below is pulled from the same Unsplash photo IDs already
// live elsewhere in this app (verified working, category-matched via
// Tukosoko.tsx's CATEGORY_PHOTO_PRESETS) so nothing here depends on an
// unverified image URL. All of it is placeholder stock and swappable later.
const PHOTO = {
  hero: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=1600',
  individual: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600',
  trades: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600',
  school: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=600',
  team: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=600',
  electrical: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600',
  beauty: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?q=80&w=600',
};

const AUDIENCES = [
  {
    photo: PHOTO.individual,
    tag: 'Earn',
    title: 'Individuals & Professionals',
    desc: 'Get your digital business card, get discovered, hired, paid and rated — and level up into the pro everyone asks for.',
    cta: 'Create Free Account',
    action: 'user' as const,
  },
  {
    photo: PHOTO.beauty,
    tag: 'Hire',
    title: 'Households & Clients',
    desc: 'Tap a card or search nearby. See real ratings and verified badges before you call, book or pay.',
    cta: 'Find Someone Near You',
    action: 'user' as const,
  },
  {
    photo: PHOTO.trades,
    tag: 'Grow',
    title: 'Small Businesses & Crews',
    desc: 'Run a plumbing crew, salon or repair shop? Put your whole team on one profile and win nearby jobs.',
    cta: 'List Your Business',
    action: 'user' as const,
  },
  {
    photo: PHOTO.team,
    tag: 'Verify',
    title: 'Saccos & Self-Help Groups',
    desc: 'Vouch for your members. A Sacco or registered group badge tells clients this person is known and accountable.',
    cta: 'Verify Your Members',
    action: 'org' as const,
  },
  {
    photo: PHOTO.school,
    tag: 'Certify',
    title: 'Training Centres & TVETs',
    desc: 'Verify academic history and documents, and list your courses on Skill Hub so graduates get hired faster.',
    cta: 'Partner Your School',
    action: 'org' as const,
  },
  {
    photo: PHOTO.electrical,
    tag: 'Partner',
    title: 'Brands & Companies',
    desc: 'Certify NikoSoko professionals as official installers — a paint or solar brand grows reach while every job is done right.',
    cta: 'Become a Brand Partner',
    action: 'org' as const,
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

const CARD_STEPS = [
  { icon: '📲', title: 'Tap', desc: 'Hold your phone to the card, or scan the QR. Your profile opens instantly — no app, no typing.' },
  { icon: '💾', title: 'Save', desc: 'One tap saves your number to their contacts, so you are never lost in a chat history.' },
  { icon: '⭐', title: 'Rate', desc: 'After the job, the client taps to rate you. Every rating is tied to a real interaction.' },
  { icon: '🚀', title: 'Level up', desc: 'Ratings and verifications build your level, putting you at the top when people search.' },
];

const LADDER = [
  { icon: '🔍', title: 'Discovered', desc: 'Nearby clients find you by skill and location.' },
  { icon: '🤝', title: 'Hired', desc: 'Book you straight from your card or profile.' },
  { icon: '💸', title: 'Paid', desc: 'M-Pesa or cash. 0% commission — it is all yours.' },
  { icon: '⭐', title: 'Rated', desc: 'Honest ratings from real clients build trust.' },
  { icon: '🏅', title: 'Levelled up', desc: 'Higher level, more demand, better rates.' },
];

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

const PARTNER_PLACEHOLDERS = ['Paint Brand', 'Solar Co.', 'TVET College', 'Building Materials', 'Insurance Partner', 'Logistics Co.'];

const LIVE_EVENTS = [
  { icon: '💾', text: 'Number saved', sub: 'Tap on the card — 2s ago' },
  { icon: '⭐', text: 'New 5-star rating', sub: '"Neat work, on time."' },
  { icon: '🤝', text: 'You were hired', sub: 'Wiring job · KES 4,500' },
  { icon: '🏅', text: 'Level up!', sub: 'You reached Level 3' },
];

const Stars: React.FC<{ n?: number; className?: string }> = ({ n = 5, className = '' }) => (
  <span className={`inline-flex gap-px text-amber-400 ${className}`} aria-hidden="true">
    {Array.from({ length: n }).map((_, i) => <span key={i}>★</span>)}
  </span>
);

/** Phone mockup showing what a NikoSoko professional's digital card looks
 * like when someone taps it: avatar, trade, rating, level, save/call and a
 * tap-to-rate row. Built in CSS - illustrative sample data, not a screenshot. */
const CardPhone: React.FC = () => {
  const [ev, setEv] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setEv(i => (i + 1) % LIVE_EVENTS.length), 3000);
    return () => clearInterval(t);
  }, []);
  const live = LIVE_EVENTS[ev];

  return (
    <div className="relative w-[250px] shrink-0 mx-auto">
      <div className="relative rounded-[2.4rem] border-[6px] border-zinc-800 bg-black shadow-2xl shadow-emerald-500/10 overflow-hidden aspect-[9/19]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-b-2xl z-20" />
        <div className="absolute inset-0 flex flex-col bg-zinc-950">
          <div className="pt-6 pb-3 flex justify-center border-b border-white/5">
            <img src={LOGO_DARK} alt="" className="h-4 object-contain opacity-95" />
          </div>

          <div className="px-3.5 pt-4 flex flex-col items-center text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-white font-black text-xl">PO</div>
              <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-zinc-950 text-[10px] text-black font-black flex items-center justify-center">✓</span>
            </div>
            <p className="mt-2 text-white text-[12px] font-black">Peter Otieno</p>
            <p className="text-zinc-400 text-[9px] font-semibold">Electrician · Ruaka, Kiambu</p>
            <div className="mt-1 flex items-center gap-1 text-[9px]">
              <Stars className="text-[10px]" />
              <span className="text-white font-black">4.9</span>
              <span className="text-zinc-500">(128)</span>
            </div>
            <div className="mt-2 flex gap-1">
              <span className="text-[8px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">LEVEL 3</span>
              <span className="text-[8px] font-black bg-white/5 text-zinc-300 border border-white/10 px-1.5 py-0.5 rounded-full">NITA verified</span>
            </div>
          </div>

          <div className="px-3.5 mt-3 grid grid-cols-2 gap-1.5">
            <div className="bg-white text-black rounded-lg py-1.5 text-center text-[9px] font-black">📞 Call</div>
            <div className="bg-emerald-500 text-black rounded-lg py-1.5 text-center text-[9px] font-black">💾 Save number</div>
          </div>

          <div className="px-3.5 mt-3">
            <div className="rounded-xl bg-white/5 border border-white/10 p-2.5 text-center">
              <p className="text-[8px] uppercase tracking-widest text-zinc-500 font-black">Tap to rate</p>
              <div className="mt-1 text-[15px] flex justify-center gap-0.5 text-amber-400">
                {[0, 1, 2, 3, 4].map(i => (
                  <span key={i} className="nk-star" style={{ animationDelay: `${i * 0.15}s` }}>★</span>
                ))}
              </div>
            </div>
          </div>

          <div className="px-3.5 mt-3 grid grid-cols-3 gap-1.5">
            {[PHOTO.electrical, PHOTO.trades, PHOTO.team].map((src, i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden bg-zinc-800">
                <img src={src} alt="" className="w-full h-full object-cover opacity-90" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NFC tap rings */}
      <div className="absolute -left-6 top-24 w-10 h-10 flex items-center justify-center pointer-events-none">
        <span className="absolute inset-0 rounded-full border border-emerald-400/70 nk-wave" />
        <span className="absolute inset-0 rounded-full border border-emerald-400/70 nk-wave-2" />
        <span className="relative text-emerald-400 text-sm">📡</span>
      </div>

      {/* Rotating live event */}
      <div key={ev} className="nk-pop absolute -right-12 bottom-24 bg-white text-black px-3 py-2 rounded-xl shadow-xl border border-gray-100 flex items-center gap-2 w-48">
        <span className="text-lg">{live.icon}</span>
        <div className="min-w-0">
          <p className="text-[11px] font-black leading-tight">{live.text}</p>
          <p className="text-[9px] text-gray-500 font-semibold truncate">{live.sub}</p>
        </div>
      </div>
    </div>
  );
};

/** The physical card, as a photo, with a pulsing NFC badge. */
const CardPhotoFrame: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl ${className}`}>
    <img src={CARD_PHOTO} alt="A NikoSoko digital business card held in a café" className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
      <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-emerald-400/40 nk-wave" />
        <span className="relative w-9 h-9 rounded-full bg-emerald-500 text-black flex items-center justify-center text-sm font-black">📡</span>
      </div>
      <p className="text-white text-xs font-bold leading-snug">Tap to view &amp; save the number. Tap again to rate.</p>
    </div>
  </div>
);

const SectionTitle: React.FC<{ eyebrow: string; title: React.ReactNode; sub?: string }> = ({ eyebrow, title, sub }) => (
  <div className="text-center max-w-2xl mx-auto mb-10">
    <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">{eyebrow}</h2>
    <p className="text-2xl xl:text-3xl font-black tracking-tight text-white leading-tight">{title}</p>
    {sub && <p className="mt-3 text-zinc-400 text-sm leading-relaxed">{sub}</p>}
  </div>
);

interface PageProps {
  currentUser: ServiceProvider | null;
  onOpenSignUp: () => void;
  onOpenOrgSignUp: () => void;
  onOpenLogin: () => void;
}

const Nav: React.FC<PageProps & { route: LandingRoute }> = ({ currentUser, onOpenSignUp, onOpenLogin, route }) => (
  <header className="sticky top-0 z-30 flex items-center justify-between px-8 xl:px-16 py-4 border-b border-white/10 bg-black/85 backdrop-blur">
    <a href="#/" className="w-28 aspect-[5/2] overflow-hidden block">
      <img src={LOGO_DARK} alt="NikoSoko" className="w-full h-full object-cover object-center select-none" />
    </a>
    <nav className="flex items-center gap-1 text-sm font-bold">
      <a href="#/" className={`px-3 py-2 rounded-lg transition-colors ${route === 'home' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}>
        Individuals
      </a>
      <a href={ORG_HASH} className={`px-3 py-2 rounded-lg transition-colors ${route === 'organizations' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}>
        Organizations
      </a>
    </nav>
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
);

const Footer: React.FC = () => (
  <footer className="relative z-10 border-t border-white/10 px-8 xl:px-16 py-6 flex items-center justify-between text-[11px] text-zinc-500 font-semibold">
    <span>© NikoSoko Marketplace Platform</span>
    <span className="flex items-center gap-4">
      <a href="#/" className="hover:text-white transition-colors">Individuals</a>
      <a href={ORG_HASH} className="hover:text-white transition-colors">Organizations</a>
      <span>Hyperlocal Service &amp; Skill Network — Kenya</span>
    </span>
  </footer>
);

// ---------------------------------------------------------------- HOME ----

const HomePage: React.FC<PageProps> = ({ currentUser, onOpenSignUp, onOpenOrgSignUp, onOpenLogin }) => {
  const userCta = currentUser ? onOpenLogin : onOpenSignUp;
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${PHOTO.hero}')` }} />
        <div className="absolute inset-0 bg-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />

        <div className="relative z-10 max-w-6xl mx-auto px-8 xl:px-16 pt-16 pb-24">
          <div className="flex flex-col lg:flex-row items-center gap-14">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Kenya's Hyperlocal Service &amp; Skill Marketplace
              </div>

              <h1 className="mt-6 text-4xl xl:text-5xl font-black tracking-tight leading-tight">
                Your skill. Your card.<br />
                <span className="text-emerald-400">Your reputation.</span>
              </h1>

              <p className="mt-5 text-zinc-300 text-base leading-relaxed font-medium max-w-xl mx-auto lg:mx-0">
                Sign up and get a digital business card people can tap to save your number and rate your work.
                Get discovered, hired, paid and rated — and watch your level, and your demand, grow.
              </p>

              <div className="mt-8 flex items-center justify-center lg:justify-start gap-3">
                <button
                  onClick={userCta}
                  className="bg-white hover:bg-zinc-200 text-black font-black py-3.5 px-7 rounded-xl text-sm uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                >
                  {currentUser ? 'Manage My Account' : 'Get My Card Free'}
                </button>
                <a
                  href={ORG_HASH}
                  className="bg-white/5 hover:bg-white/10 border border-white/20 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all"
                >
                  I'm an Organization
                </a>
              </div>

              <div className="mt-6 flex items-center justify-center lg:justify-start gap-4 text-[11px] text-zinc-400 font-semibold">
                <span>🇰🇪 Built for Kenya</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span>Paid via M-Pesa</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span>0% Commission</span>
              </div>
            </div>

            {/* Phone + physical card composite */}
            <div className="relative w-[400px] h-[500px] shrink-0 hidden lg:block">
              <div className="absolute left-0 top-6 z-10 nk-float" style={{ ['--nk-rot' as any]: '0deg' }}>
                <CardPhone />
              </div>
              <div
                className="absolute right-0 bottom-0 z-20 w-[210px] rounded-2xl overflow-hidden border border-white/15 shadow-2xl nk-float-slow"
                style={{ ['--nk-rot' as any]: '6deg' }}
              >
                <img src={CARD_PHOTO} alt="NikoSoko NFC business card" className="w-full h-[250px] object-cover object-[50%_62%]" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2.5">
                  <p className="text-[10px] font-black text-white">The NikoSoko card</p>
                  <p className="text-[9px] text-zinc-300 font-semibold">Tap · Save · Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE CARD */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 xl:px-16 py-24">
        <SectionTitle
          eyebrow="The NikoSoko Card"
          title={<>A business card that <span className="text-emerald-400">works for you</span> after you leave the room.</>}
          sub="Hand someone your card and they get your whole profile — number, work, ratings — in one tap."
        />
        <div className="grid lg:grid-cols-5 gap-10 items-center">
          <CardPhotoFrame className="lg:col-span-2 aspect-[3/4]" />
          <div className="lg:col-span-3 grid sm:grid-cols-2 gap-4">
            {CARD_STEPS.map((s, i) => (
              <div key={s.title} className="p-5 rounded-2xl bg-zinc-900 border border-white/10 hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="inline-flex text-xl p-2 rounded-xl bg-white/5">{s.icon}</span>
                  <span className="text-xs font-black text-zinc-600">0{i + 1}</span>
                </div>
                <h3 className="text-base font-black text-white mt-3">{s.title}</h3>
                <p className="text-[13px] text-zinc-400 mt-1.5 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GROWTH LADDER */}
      <section className="relative z-10 bg-zinc-950 border-y border-white/10 py-20">
        <div className="max-w-6xl mx-auto px-8 xl:px-16">
          <SectionTitle
            eyebrow="How you grow"
            title="Every job makes the next one easier to win."
            sub="Your ratings and verifications build your level and your skill record. A higher level means more demand and more professional work."
          />
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
            {LADDER.map((l, i) => (
              <div key={l.title} className="relative p-5 rounded-2xl bg-zinc-900 border border-white/10 text-center" style={{ marginTop: `${(4 - i) * 6}px` }}>
                <span className="inline-flex text-2xl">{l.icon}</span>
                <h3 className="text-sm font-black text-white mt-2">{l.title}</h3>
                <p className="text-[12px] text-zinc-400 mt-1 leading-relaxed">{l.desc}</p>
                {i < LADDER.length - 1 && <span className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 text-emerald-500 z-10 font-black">›</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUILT FOR EVERYONE */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 xl:px-16 py-24">
        <SectionTitle
          eyebrow="Built for everyone"
          title="One platform. Everyone who hires, trains or vouches for skill."
          sub="Whether you're one person with a toolkit or an institution with a thousand graduates, there's a place for you."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {AUDIENCES.map(a => (
            <div key={a.title} className="group rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden flex flex-col hover:border-white/25 transition-colors">
              <div className="h-36 overflow-hidden relative">
                <img src={a.photo} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider bg-black/70 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-full">{a.tag}</span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-sm font-black text-white">{a.title}</h3>
                <p className="text-[12.5px] text-zinc-400 mt-2 leading-relaxed flex-1">{a.desc}</p>
                {a.action === 'org' ? (
                  <a href={ORG_HASH} className="mt-4 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
                    {a.cta} <span>&rarr;</span>
                  </a>
                ) : (
                  <button onClick={userCta} className="mt-4 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer text-left flex items-center gap-1">
                    {a.cta} <span>&rarr;</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 xl:px-16 pb-24">
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

      {/* ORGANIZATIONS TEASER */}
      <section className="relative z-10 bg-zinc-950 border-y border-white/10 py-20">
        <div className="max-w-6xl mx-auto px-8 xl:px-16 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">For organizations</h2>
            <p className="text-2xl xl:text-3xl font-black tracking-tight leading-tight">Trust travels further when someone credible vouches for it.</p>
            <p className="mt-4 text-zinc-400 text-sm leading-relaxed">
              Saccos and registered self-help groups can verify their members. Vocational training centres can verify academic
              history and documents, and list their courses on Skill Hub. Verified people get hired faster — and your
              organization's name builds with them.
            </p>
            <div className="mt-7 flex gap-3">
              <a href={ORG_HASH} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 px-6 rounded-xl text-sm transition-all active:scale-95">
                Explore for organizations
              </a>
              <button onClick={onOpenOrgSignUp} className="bg-white/5 hover:bg-white/10 border border-white/20 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all cursor-pointer">
                Sign up your organization
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {PARTNER_PLACEHOLDERS.map(p => (
              <div key={p} className="aspect-[3/2] rounded-xl border border-dashed border-white/15 bg-white/5 flex items-center justify-center text-center px-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">{p}</span>
              </div>
            ))}
          </div>
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
              <div className="w-9 h-9 mx-auto rounded-full bg-emerald-500 text-black font-black flex items-center justify-center text-sm">{s.step}</div>
              <h4 className="text-sm font-bold text-white mt-3">{s.title}</h4>
              <p className="text-[13px] text-zinc-400 mt-1 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <CtaBand
        title="Ready to get your NikoSoko card?"
        sub="Individuals, small businesses, schools and big brands all start the same way — one free account."
        label={currentUser ? 'Manage My Account' : 'Create Free Account'}
        onClick={userCta}
      />
    </>
  );
};

const CtaBand: React.FC<{ title: string; sub: string; label: string; onClick: () => void }> = ({ title, sub, label, onClick }) => (
  <section className="relative z-10 bg-white text-black py-16">
    <div className="max-w-3xl mx-auto px-8 text-center">
      <div className="w-32 aspect-[6/1] overflow-hidden mx-auto mb-6">
        <img src={LOGO_LIGHT} alt="NikoSoko" className="w-full h-full object-cover object-center select-none" />
      </div>
      <h2 className="text-2xl xl:text-3xl font-black tracking-tight">{title}</h2>
      <p className="mt-3 text-gray-600 text-sm max-w-lg mx-auto">{sub}</p>
      <button
        onClick={onClick}
        className="mt-6 bg-black hover:bg-zinc-800 text-white font-black py-3.5 px-8 rounded-xl text-sm uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
      >
        {label}
      </button>
    </div>
  </section>
);

// ------------------------------------------------------- ORGANIZATIONS ----

const ORG_TYPES = [
  {
    id: 'sacco',
    icon: '🤝',
    photo: PHOTO.team,
    title: 'Saccos & Self-Help Groups',
    lead: 'Turn your membership into a trust badge.',
    points: [
      'Verify your registered members so clients see a "Verified by [your Sacco]" badge on their card.',
      'Show your group\'s registration number and member count on your organization profile.',
      'Members you vouch for are trusted faster — and your group\'s name grows with their reputation.',
    ],
  },
  {
    id: 'training',
    icon: '🎓',
    photo: PHOTO.school,
    title: 'Vocational & Training Centres',
    lead: 'Prove what your graduates have learned.',
    points: [
      'Verify academic history and documents — certificates, trade test grades and licences — against your records.',
      'Verified graduates carry your institution\'s name on their card, so employers and clients can trust it.',
      'List the courses you offer and their availability on Skill Hub, where people looking to upskill will find them.',
    ],
  },
  {
    id: 'brand',
    icon: '🏷️',
    photo: PHOTO.electrical,
    title: 'Brands & Companies',
    lead: 'Get your products installed properly.',
    points: [
      'Certify NikoSoko professionals as official installers or approved partners.',
      'Reach skilled people near every customer, across Kenya.',
      'Every job a certified pro does reflects well on your brand.',
    ],
  },
];

const ORG_STEPS = [
  { step: '1', title: 'Register your organization', desc: 'Sign up with your registration number so we know who you are.' },
  { step: '2', title: 'Get verified as an institution', desc: 'We confirm your organization before you can vouch for anyone.' },
  { step: '3', title: 'Verify people & list courses', desc: 'Approve members or graduates, and publish your courses to Skill Hub.' },
];

/** Illustrative verification queue - sample data, shows the idea. */
const VerificationPreview: React.FC = () => {
  const rows = [
    { name: 'Grace Wambui', note: 'Member since 2021 · Sacco No. 0412', state: 'Verified' },
    { name: 'John Kamau', note: 'Certificate in Electrical Installation', state: 'Verified' },
    { name: 'Mary Atieno', note: 'Trade test Grade II · documents uploaded', state: 'Pending' },
  ];
  return (
    <div className="rounded-3xl bg-zinc-900 border border-white/10 p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-black text-white">Verification queue</p>
        <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Sample</span>
      </div>
      <div className="space-y-2.5">
        {rows.map(r => (
          <div key={r.name} className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center text-[11px] font-black text-white shrink-0">
              {r.name.split(' ').map(w => w[0]).join('')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-white">{r.name}</p>
              <p className="text-[11px] text-zinc-500 truncate">{r.note}</p>
            </div>
            {r.state === 'Verified' ? (
              <span className="text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-full">✓ Verified</span>
            ) : (
              <span className="text-[10px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-full">Review</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-center gap-3">
        <span className="text-lg">🎓</span>
        <p className="text-[11px] text-zinc-300 font-semibold leading-snug">
          <span className="text-white font-black">Skill Hub:</span> Electrical Installation — intake open · 12 seats
        </p>
      </div>
    </div>
  );
};

const OrganizationsPage: React.FC<PageProps> = ({ currentUser, onOpenOrgSignUp, onOpenLogin }) => (
  <>
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${PHOTO.school}')` }} />
      <div className="absolute inset-0 bg-black/85" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
      <div className="relative z-10 max-w-6xl mx-auto px-8 xl:px-16 pt-16 pb-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            NikoSoko for Organizations
          </div>
          <h1 className="mt-6 text-4xl xl:text-5xl font-black tracking-tight leading-tight">
            Vouch for skill.<br /><span className="text-emerald-400">Build trust at scale.</span>
          </h1>
          <p className="mt-5 text-zinc-300 text-base leading-relaxed font-medium max-w-xl">
            Saccos, self-help groups and training centres give people something they can't buy: credibility.
            Verify your members and graduates on NikoSoko, and list your courses on Skill Hub.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button onClick={onOpenOrgSignUp} className="bg-white hover:bg-zinc-200 text-black font-black py-3.5 px-7 rounded-xl text-sm uppercase tracking-wider transition-all active:scale-95 cursor-pointer">
              Sign Up Your Organization
            </button>
            {!currentUser && (
              <button onClick={onOpenLogin} className="bg-white/5 hover:bg-white/10 border border-white/20 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all cursor-pointer">
                Organization Sign In
              </button>
            )}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-[11px] text-zinc-400 font-semibold">
            <span>🤝 Saccos</span><span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span>👥 Self-help groups</span><span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span>🎓 Training centres</span><span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span>🏷️ Brands</span>
          </div>
        </div>
        <div className="nk-float" style={{ ['--nk-rot' as any]: '0deg' }}>
          <VerificationPreview />
        </div>
      </div>
    </section>

    {/* ORG TYPES */}
    <section className="relative z-10 max-w-6xl mx-auto px-8 xl:px-16 py-24">
      <SectionTitle
        eyebrow="Who it's for"
        title="Three ways organizations make skilled people more trusted."
      />
      <div className="space-y-6">
        {ORG_TYPES.map((o, i) => (
          <div key={o.id} className={`grid lg:grid-cols-5 gap-0 rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 ${i % 2 ? 'lg:[direction:rtl]' : ''}`}>
            <div className="lg:col-span-2 h-56 lg:h-auto relative [direction:ltr]">
              <img src={o.photo} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="absolute bottom-4 left-4 text-3xl">{o.icon}</span>
            </div>
            <div className="lg:col-span-3 p-8 [direction:ltr]">
              <h3 className="text-xl font-black text-white">{o.title}</h3>
              <p className="text-emerald-400 text-sm font-bold mt-1">{o.lead}</p>
              <ul className="mt-5 space-y-3">
                {o.points.map(p => (
                  <li key={p} className="flex gap-3 text-[13.5px] text-zinc-300 leading-relaxed">
                    <span className="mt-0.5 w-4 h-4 shrink-0 rounded-full bg-emerald-500 text-black text-[10px] font-black flex items-center justify-center">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* SKILL HUB */}
    <section className="relative z-10 bg-zinc-950 border-y border-white/10 py-20">
      <div className="max-w-6xl mx-auto px-8 xl:px-16 grid lg:grid-cols-2 gap-12 items-center">
        <CardPhotoFrame className="aspect-[4/5] max-h-[520px]" />
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">Skill Hub</h2>
          <p className="text-2xl xl:text-3xl font-black tracking-tight leading-tight">Verified on your records. Visible on their card.</p>
          <p className="mt-4 text-zinc-400 text-sm leading-relaxed">
            When you verify someone, it shows on their NikoSoko card — the card they hand to clients. A graduate's
            certificate, a member's Sacco standing: all one tap away, backed by your name. And the courses you list on
            Skill Hub let the next learner find you.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              ['📄', 'Documents', 'Certificates, trade tests, licences'],
              ['🏫', 'Academic history', 'Confirm enrolment and completion'],
              ['📚', 'Course listings', 'Publish courses and intakes'],
              ['🔐', 'Your decision', 'Nothing is verified without your approval'],
            ].map(([ic, t, d]) => (
              <div key={t} className="p-4 rounded-xl bg-zinc-900 border border-white/10">
                <span className="text-lg">{ic}</span>
                <p className="text-sm font-black text-white mt-1">{t}</p>
                <p className="text-[12px] text-zinc-400 mt-0.5">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* STEPS */}
    <section className="relative z-10 max-w-3xl mx-auto px-8 xl:px-16 py-20">
      <h2 className="text-center text-xs font-black uppercase tracking-widest text-zinc-500 mb-8">Getting your organization started</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {ORG_STEPS.map(s => (
          <div key={s.step} className="text-center">
            <div className="w-9 h-9 mx-auto rounded-full bg-emerald-500 text-black font-black flex items-center justify-center text-sm">{s.step}</div>
            <h4 className="text-sm font-bold text-white mt-3">{s.title}</h4>
            <p className="text-[13px] text-zinc-400 mt-1 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>

    <CtaBand
      title="Bring your organization onto NikoSoko."
      sub="Register once, then start verifying the people and skills you stand behind."
      label="Sign Up Your Organization"
      onClick={onOpenOrgSignUp}
    />
  </>
);

// ---------------------------------------------------------------- SHELL ----

const DesktopLandingPage: React.FC<PageProps> = props => {
  const route = useLandingRoute();
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Nav {...props} route={route} />
      {route === 'organizations' ? <OrganizationsPage {...props} /> : <HomePage {...props} />}
      <Footer />
    </div>
  );
};

const DesktopBannerLayout: React.FC<DesktopBannerLayoutProps> = ({
  children,
  currentUser,
  onOpenSignUp,
  onOpenOrgSignUp,
  onOpenLogin,
}) => {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <DesktopLandingPage
        currentUser={currentUser}
        onOpenSignUp={onOpenSignUp}
        onOpenOrgSignUp={onOpenOrgSignUp}
        onOpenLogin={onOpenLogin}
      />
    );
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
