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

const Button: React.FC<{ onClick: () => void; variant?: 'solid' | 'green' | 'outline'; children: React.ReactNode }> = ({ onClick, variant = 'solid', children }) => {
  const styles = {
    solid: 'bg-white text-black hover:bg-neutral-200',
    green: 'text-black hover:brightness-110',
    outline: 'border border-white/30 text-white hover:border-white hover:bg-white/5',
  }[variant];
  return (
    <button
      onClick={onClick}
      style={variant === 'green' ? { background: GREEN } : undefined}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-[15px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${styles}`}
    >
      {children}
    </button>
  );
};

const Nav: React.FC<PageProps> = ({ currentUser, onOpenSignUp, onOpenLogin }) => (
  <header className="sticky top-0 z-30 bg-black/85 backdrop-blur border-b border-white/10">
    <div className="max-w-[1200px] mx-auto px-8 h-16 flex items-center justify-between">
      <a href="#top" className="flex items-center"><img src={LOGO_DARK} alt="NikoSoko" className="h-7 w-auto" /></a>
      <nav className="flex items-center gap-8 text-[15px] text-white/70" aria-label="Sections">
        <a href="#who" className="hover:text-white transition">Who it is for</a>
        <a href="#how" className="hover:text-white transition">How it works</a>
        <a href="#organizations" className="hover:text-white transition">For organizations</a>
        <a href="#trust" className="hover:text-white transition">Ratings</a>
      </nav>
      <div className="flex items-center gap-3">
        {currentUser ? (
          <span className="text-sm text-white/70">Signed in as {currentUser.name}</span>
        ) : (
          <>
            <button onClick={onOpenLogin} className="text-[15px] text-white/80 hover:text-white px-3 py-2 transition">Log in</button>
            <button onClick={onOpenSignUp} className="rounded-full bg-white text-black text-[15px] font-semibold px-5 py-2 hover:bg-neutral-200 transition">Sign up</button>
          </>
        )}
      </div>
    </div>
  </header>
);

/** Product visual: a profile as customers see it. Clearly marked as an example. */
const ExampleProfile: React.FC = () => (
  <div className="relative w-full max-w-[420px] mx-auto">
    <div className="rounded-3xl bg-white text-black p-6 shadow-[0_30px_80px_-20px_rgba(34,194,122,0.35)]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-lg font-semibold">JK</div>
          <div>
            <p className="font-semibold text-lg leading-tight">James K.</p>
            <p className="text-neutral-500 text-sm">Electrician, Ruaka</p>
          </div>
        </div>
        <span className="text-xs text-neutral-400 border border-neutral-200 rounded-full px-2.5 py-1">Example</span>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-neutral-200 px-4 py-3">
        <Check className="w-5 h-5" />
        <div className="text-sm leading-tight">
          <p className="font-semibold">Verified by Ruaka Matatu Sacco</p>
          <p className="text-neutral-500">Joined with the sacco's code</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-neutral-100 px-4 py-3">
          <p className="text-neutral-500">Rating</p>
          <p className="font-semibold mt-0.5">Average of client ratings</p>
        </div>
        <div className="rounded-2xl bg-neutral-100 px-4 py-3">
          <p className="text-neutral-500">Distance</p>
          <p className="font-semibold mt-0.5">Shown from where you are</p>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <div className="flex-1 rounded-full bg-black text-white text-center text-sm font-semibold py-3">Call</div>
        <div className="flex-1 rounded-full border border-neutral-300 text-center text-sm font-semibold py-3">WhatsApp</div>
      </div>
    </div>
    <div className="absolute -bottom-5 -left-6 rounded-2xl bg-black border border-white/15 px-4 py-3 text-sm shadow-xl">
      <p className="text-white/60">Sacco code</p>
      <p className="font-mono font-semibold tracking-widest" style={{ color: GREEN }}>RTMS-7K2M</p>
    </div>
  </div>
);

const Hero: React.FC<PageProps> = ({ onOpenSignUp, onOpenOrgSignUp }) => (
  <section id="top" className="bg-black text-white">
    <div className="max-w-[1200px] mx-auto px-8 pt-24 pb-32 grid grid-cols-[1.15fr_1fr] gap-16 items-center">
      <div>
        <h1 className="text-[64px] leading-[1.02] font-semibold tracking-[-0.035em]">
          Hire skilled people you can actually check.
        </h1>
        <p className="mt-7 text-xl leading-relaxed text-white/65 max-w-[34rem]">
          NikoSoko lists electricians, drivers, tailors, tutors and more near you. Each one is linked to the sacco, school or group that vouches for them, and rated by real clients.
        </p>
        <div className="mt-10 flex items-center gap-4">
          <Button onClick={onOpenSignUp} variant="green">Find a professional</Button>
          <Button onClick={onOpenOrgSignUp} variant="outline">Register your organization</Button>
        </div>
        <p className="mt-6 text-sm text-white/45">Sign in with your phone number.</p>
      </div>
      <ExampleProfile />
    </div>
  </section>
);

const AUDIENCES = [
  {
    title: 'Common mwananchi',
    lead: 'Find someone you can trust, close to home.',
    points: [
      'See who vouches for a person before you call',
      'Ratings come only from clients who contacted them',
      'Sorted by how near they are to you',
    ],
    cta: 'Find a professional',
    action: 'signup' as const,
  },
  {
    title: 'Transport saccos and trade groups',
    lead: 'Give every member a profile customers believe.',
    points: [
      'One code for your sacco, shared with members',
      'Members who join with it carry your name as their badge',
      'See how many members are verified through you',
    ],
    cta: 'Register your sacco',
    action: 'org' as const,
  },
  {
    title: 'Schools and training institutions',
    lead: 'Let graduates prove where they trained.',
    points: [
      'A separate code for every course you list',
      'Graduates show the course and your institution on their profile',
      'See which courses bring in verified people',
    ],
    cta: 'Register your institution',
    action: 'org' as const,
  },
];

const Audiences: React.FC<PageProps> = ({ onOpenSignUp, onOpenOrgSignUp }) => (
  <section id="who" className="bg-white text-black">
    <div className="max-w-[1200px] mx-auto px-8 py-28">
      <h2 className="text-[44px] leading-[1.08] font-semibold tracking-[-0.03em] max-w-[40rem]">One platform for the people who hire, and the groups that vouch.</h2>
      <div className="mt-16 grid grid-cols-3 gap-6">
        {AUDIENCES.map(a => (
          <div key={a.title} className="rounded-3xl border border-neutral-200 p-8 flex flex-col">
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
            <button
              onClick={a.action === 'org' ? onOpenOrgSignUp : onOpenSignUp}
              className="mt-8 self-start rounded-full bg-black text-white text-[15px] font-semibold px-6 py-3 hover:bg-neutral-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-black/60"
            >
              {a.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const STEPS = [
  { title: 'An organization joins', body: 'A sacco, school or trade group registers and receives its own code. A school gets a further code for each course it lists.' },
  { title: 'Members verify with the code', body: 'When a driver, graduate or tradesperson signs up, they enter the code. The Verified badge appears on their profile with the organization named beside it.' },
  { title: 'Customers search and contact', body: 'People nearby find them by service and distance. To call or message, the customer confirms their phone number with a one-time code.' },
  { title: 'Clients rate what happened', body: 'After contact, the client rates the job. The score on the profile is the plain average of those ratings.' },
];

const How: React.FC = () => (
  <section id="how" className="bg-black text-white">
    <div className="max-w-[1200px] mx-auto px-8 py-28">
      <h2 className="text-[44px] leading-[1.08] font-semibold tracking-[-0.03em] max-w-[36rem]">How it works</h2>
      <ol className="mt-16 grid grid-cols-4 gap-0 border-t border-white/15">
        {STEPS.map((s, i) => (
          <li key={s.title} className="pt-8 pr-8 border-r border-white/10 last:border-r-0 pl-0 first:pl-0 [&:not(:first-child)]:pl-8">
            <span className="font-mono text-sm" style={{ color: GREEN }}>{i + 1}</span>
            <h3 className="mt-4 text-xl font-semibold tracking-tight">{s.title}</h3>
            <p className="mt-3 text-white/60 leading-relaxed text-[15px]">{s.body}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

const COURSE_EXAMPLE = [
  { name: 'Your institution', code: 'KTTI-4F9R', note: 'Everyone who studied with you', total: true },
  { name: 'Electrical installation', code: 'KTTI-M2XW', note: 'Graduates of this course' },
  { name: 'Solar fitting', code: 'KTTI-8CHD', note: 'Graduates of this course' },
  { name: 'Plumbing and pipe fitting', code: 'KTTI-Q7NA', note: 'Graduates of this course' },
];

const Organizations: React.FC<PageProps> = ({ onOpenOrgSignUp }) => (
  <section id="organizations" className="bg-neutral-100 text-black">
    <div className="max-w-[1200px] mx-auto px-8 py-28 grid grid-cols-[1fr_1.1fr] gap-20 items-center">
      <div>
        <h2 className="text-[44px] leading-[1.08] font-semibold tracking-[-0.03em]">Your name on every member you vouch for.</h2>
        <p className="mt-6 text-lg text-neutral-600 leading-relaxed max-w-[30rem]">
          Register once and NikoSoko issues your organization code. List a course and it gets its own code. Hand the right code to the right people, and your dashboard shows how many have verified with each.
        </p>
        <ul className="mt-8 space-y-3 text-[15px]">
          {['Each person can verify through one code only', 'Every course has its own code, so you see where verified people come from', 'Works for saccos, schools, associations and groups'].map(t => (
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

const Closing: React.FC<PageProps> = ({ onOpenSignUp, onOpenOrgSignUp }) => (
  <section className="bg-black text-white">
    <div className="max-w-[1200px] mx-auto px-8 py-28 text-center">
      <h2 className="text-[52px] leading-[1.05] font-semibold tracking-[-0.035em] max-w-[44rem] mx-auto">Start with the people near you.</h2>
      <p className="mt-6 text-lg text-white/60 max-w-[32rem] mx-auto">Create a free account in a minute, or register the group that vouches for its members.</p>
      <div className="mt-10 flex justify-center gap-4">
        <Button onClick={onOpenSignUp} variant="green">Create a free account</Button>
        <Button onClick={onOpenOrgSignUp} variant="outline">Register your organization</Button>
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
    <How />
    <Organizations {...props} />
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
