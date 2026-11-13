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
const LOGO_DARK = 'https://i.imgur.com/xHseJe9.jpeg'; // white wordmark on black

// Palette: black and white, with one green reserved for things that matter (verification, codes).
const GREEN = '#22C27A';
const GREEN_DARK = '#0B7A4B'; // green that reads on white
const FONT = "'Geist', 'Inter', system-ui, sans-serif";

/** True once mounted and above the desktop breakpoint. Starts false so the first paint
 * matches the mobile app, then syncs to the real viewport. */
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

interface PageProps {
  currentUser: ServiceProvider | null;
  onOpenSignUp: () => void;
  onOpenOrgSignUp: () => void;
  onOpenLogin: () => void;
}

const Check: React.FC<{ className?: string; color?: string }> = ({ className = 'w-4 h-4', color = GREEN }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="10" fill={color} />
    <path d="M5.5 10.4l3 3 6-6.4" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Button: React.FC<{ onClick?: () => void; href?: string; variant?: 'solid' | 'green' | 'outline'; children: React.ReactNode }> = ({ onClick, href, variant = 'solid', children }) => {
  const styles = {
    solid: 'bg-white text-black hover:bg-neutral-200',
    green: 'text-black hover:brightness-110',
    outline: 'border border-white/30 text-white hover:border-white hover:bg-white/5',
  }[variant];
  const className = `inline-flex items-center justify-center rounded-full px-6 py-3 text-[15px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${styles}`;
  const style = variant === 'green' ? { background: GREEN } : undefined;
  return href ? (
    <a href={href} style={style} className={className}>{children}</a>
  ) : (
    <button onClick={onClick} style={style} className={className}>{children}</button>
  );
};

const Nav: React.FC<PageProps> = ({ currentUser, onOpenOrgSignUp, onOpenLogin }) => (
  <header className="sticky top-0 z-30 bg-black/85 backdrop-blur border-b border-white/10">
    <div className="max-w-[1200px] mx-auto px-8 h-16 flex items-center justify-between">
      <a href="#top" className="flex items-center"><img src={LOGO_DARK} alt="NikoSoko" className="h-7 w-auto" /></a>
      <nav className="flex items-center gap-8 text-[15px] text-white/70" aria-label="Sections">
        <a href="#who" className="hover:text-white transition">Who it is for</a>
        <a href="#organizations" className="hover:text-white transition">Courses and codes</a>
        <a href="#brands" className="hover:text-white transition">Brands</a>
        <a href="#how" className="hover:text-white transition">How it works</a>
        <a href="#trust" className="hover:text-white transition">Ratings</a>
      </nav>
      <div className="flex items-center gap-3">
        {currentUser ? (
          <span className="text-sm text-white/70">Signed in as {currentUser.name}</span>
        ) : (
          <>
            <button onClick={onOpenLogin} className="text-[15px] text-white/80 hover:text-white px-3 py-2 transition">Log in</button>
            <button onClick={onOpenOrgSignUp} className="rounded-full bg-white text-black text-[15px] font-semibold px-5 py-2 hover:bg-neutral-200 transition">Register your organization</button>
          </>
        )}
      </div>
    </div>
  </header>
);

/** Product visual: what an institution sees when a graduate uses one of its course codes. Clearly marked as an example. */
const ExampleDashboard: React.FC = () => (
  <div className="relative w-full max-w-[440px] mx-auto">
    <div className="rounded-3xl bg-white text-black p-6 shadow-[0_30px_80px_-20px_rgba(34,194,122,0.35)]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center text-lg font-semibold">TI</div>
          <div>
            <p className="font-semibold text-lg leading-tight">Example Technical Institute</p>
            <p className="text-neutral-500 text-sm">Training institution, Ruaka</p>
          </div>
        </div>
        <span className="text-xs text-neutral-400 border border-neutral-200 rounded-full px-2.5 py-1">Example</span>
      </div>

      <p className="mt-6 text-sm font-semibold">Waiting for you to verify</p>
      <div className="mt-3 space-y-3">
        {[
          { who: 'Grace W.', course: 'Hairdressing and beauty', code: 'ETI-H4K2' },
          { who: 'Peter O.', course: 'Electrical installation', code: 'ETI-M2XW' },
        ].map(r => (
          <div key={r.who} className="rounded-2xl border border-neutral-200 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm leading-tight">
                <p className="font-semibold">{r.who}</p>
                <p className="text-neutral-500">{r.course}</p>
              </div>
              <span className="font-mono text-xs font-semibold tracking-widest" style={{ color: GREEN_DARK }}>{r.code}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <span className="flex-1 rounded-full bg-black text-white text-center text-sm font-semibold py-2">Verify</span>
              <span className="flex-1 rounded-full border border-neutral-300 text-center text-sm font-semibold py-2">Decline</span>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="absolute -bottom-5 -left-6 rounded-2xl bg-black border border-white/15 px-4 py-3 text-sm shadow-xl">
      <p className="text-white/60">Course code</p>
      <p className="font-mono font-semibold tracking-widest" style={{ color: GREEN }}>ETI-H4K2</p>
    </div>
  </div>
);

const Hero: React.FC<PageProps> = ({ onOpenOrgSignUp }) => (
  <section id="top" className="bg-black text-white">
    <div className="max-w-[1200px] mx-auto px-8 pt-24 pb-32 grid grid-cols-[1.15fr_1fr] gap-16 items-center">
      <div>
        <h1 className="text-[60px] leading-[1.03] font-semibold tracking-[-0.035em]">
          Give every member, outlet and door a profile customers trust.
        </h1>
        <p className="mt-7 text-xl leading-relaxed text-white/65 max-w-[34rem]">
          Register your sacco, self-help group, service centre, school or business. Vouch for the skilled people you stand behind, and be found by the people near you.
        </p>
        <div className="mt-10 flex items-center gap-4">
          <Button onClick={onOpenOrgSignUp} variant="green">Register your organization</Button>
          <Button href="#brands" variant="outline">Partner as a brand</Button>
        </div>
        <p className="mt-6 text-sm text-white/45">Organizations register here. Skilled individuals join from their phone.</p>
      </div>
      <ExampleDashboard />
    </div>
  </section>
);

const AUDIENCES = [
  {
    title: 'Service centres and outlets',
    lead: 'Put your counter on the map.',
    points: [
      'A page with your place, contact and what you offer',
      'The technicians and staff who work with you, listed under your name',
      'Ratings from real customers',
    ],
    cta: 'Register your outlet',
    action: 'org' as const,
  },
  {
    title: 'Saccos and self-help groups',
    lead: 'Give every member a profile customers believe.',
    points: [
      'One code for your group, shared with members',
      'Members who join with it carry your name as their badge',
      'See how many members are verified through you',
    ],
    cta: 'Register your group',
    action: 'org' as const,
  },
  {
    title: 'Schools and training institutions',
    lead: 'Let graduates prove where they trained.',
    points: [
      'List your courses, each with its own code',
      'When a graduate uses a code, you get a request to verify them',
      'See which courses bring in verified people',
    ],
    cta: 'Register your institution',
    action: 'org' as const,
  },
  {
    title: 'Brands',
    lead: 'Reach the trade you sell to.',
    points: [
      'Pick a skill category, such as hairdressers',
      'Be the welcome for that trade on NikoSoko',
      'Reach verified people, not a crowd',
    ],
    cta: 'See how it works',
    action: 'brands' as const,
  },
];

const Audiences: React.FC<PageProps> = ({ onOpenOrgSignUp }) => (
  <section id="who" className="bg-white text-black">
    <div className="max-w-[1200px] mx-auto px-8 py-28">
      <h2 className="text-[44px] leading-[1.08] font-semibold tracking-[-0.03em] max-w-[42rem]">For the groups and businesses that stand behind skilled people.</h2>
      <div className="mt-16 grid grid-cols-4 gap-5">
        {AUDIENCES.map(a => (
          <div key={a.title} className="rounded-3xl border border-neutral-200 p-7 flex flex-col">
            <h3 className="text-xl font-semibold tracking-tight">{a.title}</h3>
            <p className="mt-3 text-neutral-600 leading-relaxed">{a.lead}</p>
            <ul className="mt-6 space-y-3.5 flex-1">
              {a.points.map(p => (
                <li key={p} className="flex gap-3 text-[15px] leading-snug">
                  <Check className="w-[18px] h-[18px] mt-0.5 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            {a.action === 'brands' ? (
              <a href="#brands" className="mt-8 self-start rounded-full bg-black text-white text-[15px] font-semibold px-6 py-3 hover:bg-neutral-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-black/60">{a.cta}</a>
            ) : (
              <button
                onClick={onOpenOrgSignUp}
                className="mt-8 self-start rounded-full bg-black text-white text-[15px] font-semibold px-6 py-3 hover:bg-neutral-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-black/60"
              >
                {a.cta}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl bg-neutral-100 px-8 py-7 flex items-center justify-between gap-8">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">Are you a skilled person on your own?</h3>
          <p className="mt-2 text-neutral-600 max-w-[38rem] leading-relaxed">Individual profiles are made on a phone. Open nikosoko.com on your phone, confirm your number, and add your sacco, school or course code to get verified.</p>
        </div>
        <span className="shrink-0 rounded-full border border-black px-5 py-2.5 text-[15px] font-semibold">Join on mobile</span>
      </div>
    </div>
  </section>
);

const STEPS = [
  { title: 'Register', body: 'Create your organization on this page. NikoSoko checks it before it can verify anyone.' },
  { title: 'Get your codes', body: 'One code for the organization, and one for every course you list.' },
  { title: 'Share them', body: 'People add your code on their phone when they create their profile.' },
  { title: 'Verify', body: 'Each request lands in your dashboard. Approve the people you know, and they carry your name as their badge.' },
];

const FEATURES = [
  { title: 'A page for your organization', body: 'Your name, place, contact and what you do, with a logo and cover photo.' },
  { title: 'Codes for your members', body: 'A code for the organization and a separate code for each course or group.' },
  { title: 'Verification you control', body: 'Nobody gets the badge with your name until you approve them.' },
  { title: 'See where verified people come from', body: 'Counts for every code, so you know which course or group is bringing people in.' },
  { title: 'Premises on the map', body: 'A page for your building, gate or outlet, so people nearby can find the door.' },
  { title: 'Ratings from real clients', body: 'The people you vouch for are rated by clients who contacted them.' },
];

const COMING = [
  { title: 'Reserve and queue', body: 'Hold a time in advance, or join a queue for first-come services.' },
  { title: 'Pay in the app', body: 'Pay deposits and bills with M-Pesa and keep a record.' },
  { title: 'Membership', body: 'Priority booking and discounts for regular customers.' },
];

const Features: React.FC = () => (
  <section id="features" className="bg-neutral-100 text-black">
    <div className="max-w-[1200px] mx-auto px-8 py-28">
      <h2 className="text-[44px] leading-[1.08] font-semibold tracking-[-0.03em] max-w-[40rem]">What your organization gets.</h2>
      <div className="mt-14 grid grid-cols-3 gap-x-10 gap-y-12">
        {FEATURES.map(f => (
          <div key={f.title}>
            <div className="w-10 h-1 rounded-full" style={{ background: GREEN }} />
            <h3 className="mt-5 text-lg font-semibold tracking-tight">{f.title}</h3>
            <p className="mt-2.5 text-neutral-600 leading-relaxed text-[15px]">{f.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-20 rounded-3xl bg-black text-white p-10">
        <h3 className="text-2xl font-semibold tracking-tight">Coming next</h3>
        <p className="mt-2 text-white/60">These are planned and not live yet.</p>
        <div className="mt-8 grid grid-cols-3 gap-10">
          {COMING.map(c => (
            <div key={c.title}>
              <h4 className="font-semibold">{c.title}</h4>
              <p className="mt-2 text-[15px] text-white/60 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const How: React.FC = () => (
  <section id="how" className="bg-white text-black">
    <div className="max-w-[1200px] mx-auto px-8 py-28">
      <h2 className="text-[44px] leading-[1.08] font-semibold tracking-[-0.03em] max-w-[36rem]">From registering to verified members in four steps</h2>
      <ol className="mt-16 grid grid-cols-4 gap-0 border-t border-neutral-200">
        {STEPS.map((s, i) => (
          <li key={s.title} className="pt-8 pr-8 border-r border-neutral-200 last:border-r-0 pl-0 first:pl-0 [&:not(:first-child)]:pl-8">
            <span className="font-mono text-sm font-semibold" style={{ color: GREEN_DARK }}>{i + 1}</span>
            <h3 className="mt-4 text-xl font-semibold tracking-tight">{s.title}</h3>
            <p className="mt-3 text-neutral-600 leading-relaxed text-[15px]">{s.body}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

const COURSE_EXAMPLE = [
  { name: 'Your institution', code: 'KTTI-4F9R', note: 'Everyone who studied with you', total: true },
  { name: 'Hairdressing and beauty', code: 'KTTI-H4K2', note: 'Graduates of this course' },
  { name: 'Electrical installation', code: 'KTTI-M2XW', note: 'Graduates of this course' },
  { name: 'Plumbing and pipe fitting', code: 'KTTI-Q7NA', note: 'Graduates of this course' },
];

const Organizations: React.FC<PageProps> = ({ onOpenOrgSignUp }) => (
  <section id="organizations" className="bg-neutral-100 text-black">
    <div className="max-w-[1200px] mx-auto px-8 py-28 grid grid-cols-[1fr_1.1fr] gap-20 items-center">
      <div>
        <h2 className="text-[44px] leading-[1.08] font-semibold tracking-[-0.03em]">Your name on every person you vouch for.</h2>
        <p className="mt-6 text-lg text-neutral-600 leading-relaxed max-w-[30rem]">
          Institutions list their courses, and every course gets its own code. When a skilled person adds your code to their profile, the request comes to your dashboard. You check them, and verify them.
        </p>
        <ul className="mt-8 space-y-3 text-[15px]">
          {['Each person can verify through one code only', 'Every course has its own code, so you see where verified people come from', 'Nobody is verified until you approve them', 'Works for saccos, schools, associations and groups'].map(t => (
            <li key={t} className="flex gap-3"><Check className="w-[18px] h-[18px] mt-0.5 shrink-0" /><span>{t}</span></li>
          ))}
        </ul>
        <div className="mt-10">
          <button onClick={onOpenOrgSignUp} className="rounded-full bg-black text-white text-[15px] font-semibold px-7 py-3.5 hover:bg-neutral-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-black/60">Register your organization</button>
        </div>
      </div>

      <div className="rounded-3xl bg-black text-white p-8">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Verification codes</p>
          <span className="text-xs text-white/50 border border-white/20 rounded-full px-2.5 py-1">Example</span>
        </div>
        <div className="mt-6 divide-y divide-white/10">
          {COURSE_EXAMPLE.map(r => (
            <div key={r.code} className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="text-sm text-white/50">{r.note}</p>
              </div>
              <span className="font-mono tracking-widest font-semibold text-[15px]" style={{ color: GREEN }}>{r.code}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const TRADES = ['Hairdressers', 'Barbers', 'Tailors', 'Electricians', 'Mechanics', 'Photographers'];

const Brands: React.FC<PageProps> = ({ onOpenOrgSignUp }) => (
  <section id="brands" className="bg-black text-white">
    <div className="max-w-[1200px] mx-auto px-8 py-28 grid grid-cols-[1fr_1.05fr] gap-20 items-center">
      <div>
        <h2 className="text-[44px] leading-[1.08] font-semibold tracking-[-0.03em]">Be the brand a trade starts with.</h2>
        <p className="mt-6 text-lg text-white/65 leading-relaxed max-w-[32rem]">
          Pick a skill category, for example hairdressers. Your brand becomes the welcome for people joining in that trade, so you reach verified professionals in the work your products are made for.
        </p>
        <ul className="mt-8 space-y-3 text-[15px]">
          {['Choose the trade you want to reach', 'Your brand is the welcome for that trade for a set period', 'Reach people who are verified by their sacco, school or group'].map(t => (
            <li key={t} className="flex gap-3"><Check className="w-[18px] h-[18px] mt-0.5 shrink-0" /><span>{t}</span></li>
          ))}
        </ul>
        <div className="mt-10">
          <Button onClick={onOpenOrgSignUp} variant="green">Register as a brand</Button>
        </div>
        <p className="mt-5 text-sm text-white/45">Brand partnerships are opening with a small group of early partners.</p>
      </div>

      <div className="rounded-3xl bg-white text-black p-8">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Choose a trade</p>
          <span className="text-xs text-neutral-400 border border-neutral-200 rounded-full px-2.5 py-1">Example</span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {TRADES.map((t, i) => (
            <span
              key={t}
              className={`rounded-full px-4 py-2 text-[15px] font-semibold border ${i === 0 ? 'text-black border-transparent' : 'border-neutral-300 text-neutral-700'}`}
              style={i === 0 ? { background: GREEN } : undefined}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="mt-7 rounded-2xl bg-neutral-100 p-5 text-[15px] space-y-3">
          <div className="flex justify-between gap-6"><span className="text-neutral-500">Brand</span><span className="font-semibold text-right">A hair-care brand</span></div>
          <div className="flex justify-between gap-6"><span className="text-neutral-500">Trade</span><span className="font-semibold text-right">Hairdressers</span></div>
          <div className="flex justify-between gap-6"><span className="text-neutral-500">Role</span><span className="font-semibold text-right">The welcome for new hairdressers</span></div>
        </div>
      </div>
    </div>
  </section>
);

const RULES = [
  { title: 'Only real clients rate', body: 'You must confirm your phone number to contact anyone, and only then can you rate them.' },
  { title: 'One rating a day', body: 'Each person can rate a provider once per day, so a score cannot be pumped up in one sitting.' },
  { title: 'No score until there is one', body: 'New providers show as New. We do not invent a starting rating.' },
  { title: 'Your details stay private', body: 'ID numbers and documents are never shown to other users. Locations are shown only roughly.' },
];

const Trust: React.FC = () => (
  <section id="trust" className="bg-white text-black">
    <div className="max-w-[1200px] mx-auto px-8 py-28">
      <h2 className="text-[44px] leading-[1.08] font-semibold tracking-[-0.03em] max-w-[40rem]">Ratings you can believe.</h2>
      <div className="mt-16 grid grid-cols-4 gap-10">
        {RULES.map(r => (
          <div key={r.title}>
            <div className="w-10 h-1 rounded-full" style={{ background: GREEN }} />
            <h3 className="mt-5 text-lg font-semibold tracking-tight">{r.title}</h3>
            <p className="mt-2.5 text-neutral-600 leading-relaxed text-[15px]">{r.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Closing: React.FC<PageProps> = ({ onOpenOrgSignUp, onOpenLogin }) => (
  <section className="bg-black text-white">
    <div className="max-w-[1200px] mx-auto px-8 py-28 text-center">
      <h2 className="text-[52px] leading-[1.05] font-semibold tracking-[-0.035em] max-w-[44rem] mx-auto">Register the group people already trust.</h2>
      <p className="mt-6 text-lg text-white/60 max-w-[34rem] mx-auto">Set up your organization in a few minutes. Skilled individuals join from their phones with your code.</p>
      <div className="mt-10 flex justify-center gap-4">
        <Button onClick={onOpenOrgSignUp} variant="green">Register your organization</Button>
        <Button onClick={onOpenLogin} variant="outline">Log in</Button>
      </div>
    </div>
  </section>
);

const Footer: React.FC = () => (
  <footer className="bg-black text-white/50 border-t border-white/10">
    <div className="max-w-[1200px] mx-auto px-8 py-10 flex items-center justify-between text-sm">
      <img src={LOGO_DARK} alt="NikoSoko" className="h-6 w-auto opacity-80" />
      <p>&copy; NikoSoko, Kenya &middot; nikosoko.com</p>
    </div>
  </footer>
);

const DesktopLandingPage: React.FC<PageProps> = props => (
  <div className="min-h-screen bg-black text-white scroll-smooth" style={{ fontFamily: FONT }}>
    <Nav {...props} />
    <Hero {...props} />
    <Audiences {...props} />
    <Organizations {...props} />
    <Brands {...props} />
    <How />
    <Features />
    <Trust />
    <Closing {...props} />
    <Footer />
  </div>
);

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
