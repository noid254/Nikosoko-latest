import React, { useRef, useState } from 'react';
import type { ServiceProvider } from '../types';
import { uploadImageToStorage } from '../services/firebase';
import { redeemReferralCode, ensureReferralCodes } from '../services/api';
import { KENYAN_ESTATES } from '../utils/geoLocations';

type Kind = 'individual' | 'organization';

interface Props {
  kind: Kind;
  currentUser: ServiceProvider;
  /** Saves part of the profile. Called after every step so nothing is lost if the person stops. */
  onSave: (patch: Partial<ServiceProvider>) => Promise<void>;
  onClose: () => void;
  onOpenDashboard?: () => void;
}

const GREEN = '#22C27A';

const CATEGORIES = [
  { value: 'PERSONAL', label: 'Personal services' },
  { value: 'TRADE', label: 'Technical trade and repairs' },
  { value: 'PROFESSIONAL', label: 'Professional consulting' },
  { value: 'CREATIVE', label: 'Creative and design' },
  { value: 'HOME', label: 'Home and estate' },
  { value: 'EVENT', label: 'Events and production' },
];

const RATE_TYPES = [
  { value: 'per hour', label: 'Per hour' },
  { value: 'per day', label: 'Per day' },
  { value: 'per task', label: 'Per task' },
  { value: 'per piece work', label: 'Piece work' },
];

const ORG_TYPES = [
  'Sacco or transport group',
  'School or training institution',
  'Association or self-help group',
  'Service centre or outlet',
  'Premise (estate, building or gate)',
  'Brand or company',
  'Business or company',
];

const ID_TYPES = ['National ID', 'Passport', 'Alien Card', 'Driving License'] as const;

const STEPS: Record<Kind, { title: string; help: string }[]> = {
  individual: [
    { title: 'About you', help: 'Start with the basics. You can change all of this later.' },
    { title: 'Your work', help: 'Tell people what you do and what you charge. Skip anything you are not sure about yet.' },
    { title: 'Where you work', help: 'People are shown professionals closest to them.' },
    { title: 'Get verified', help: 'Add a code from your sacco, school or course to get the Verified badge. You can also add your ID for review.' },
    { title: 'Photos', help: 'Last step. A clear photo of your face helps people trust you.' },
  ],
  organization: [
    { title: 'Your organization', help: 'The name people will see.' },
    { title: 'Contact and place', help: 'How members and customers reach you.' },
    { title: 'About you', help: 'A few lines on what the organization does and who it is for.' },
    { title: 'Logo and cover', help: 'Last step. You can add these later.' },
  ],
};

const field = 'w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-3 text-[15px] text-black placeholder-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black';

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <label className="block">
    <span className="block text-sm font-semibold text-black mb-1.5">{label}</span>
    {children}
    {hint && <span className="block text-xs text-neutral-500 mt-1.5">{hint}</span>}
  </label>
);

const PhotoPicker: React.FC<{ label: string; hint?: string; preview: string; round?: boolean; onPick: (f: File, url: string) => void }> = ({ label, hint, preview, round, onPick }) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <span className="block text-sm font-semibold text-black mb-1.5">{label}</span>
      <div className="flex items-center gap-4">
        <div className={`w-20 h-20 shrink-0 border border-neutral-300 bg-neutral-100 overflow-hidden flex items-center justify-center ${round ? 'rounded-full' : 'rounded-lg'}`}>
          {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : <span className="text-xs text-neutral-400">None yet</span>}
        </div>
        <button type="button" onClick={() => ref.current?.click()} className="rounded-full border border-black px-4 py-2 text-sm font-semibold hover:bg-neutral-100">
          {preview ? 'Change photo' : 'Choose photo'}
        </button>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) onPick(f, URL.createObjectURL(f));
          }}
        />
      </div>
      {hint && <span className="block text-xs text-neutral-500 mt-1.5">{hint}</span>}
    </div>
  );
};

const RegistrationFlow: React.FC<Props> = ({ kind, currentUser, onSave, onClose, onOpenDashboard }) => {
  const steps = STEPS[kind];
  const isStub = (n?: string) => !n || /^User \d+$/.test(n);
  const startAt = Math.min(Math.max(currentUser.registrationStep || 0, 0), steps.length - 1);

  const [step, setStep] = useState(startAt);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);
  const [orgCode, setOrgCode] = useState('');
  const [copied, setCopied] = useState(false);

  const [v, setV] = useState({
    name: isStub(currentUser.name) ? '' : currentUser.name,
    service: currentUser.service === 'General Trades Professional' ? '' : (currentUser.service || ''),
    category: currentUser.category && currentUser.category !== 'GENERAL' ? currentUser.category : 'PERSONAL',
    about: currentUser.about === 'New member on NikoSoko.' ? '' : (currentUser.about || ''),
    rate: currentUser.hourlyRate ? String(currentUser.hourlyRate) : '',
    rateType: (currentUser.rateType || 'per hour') as string,
    location: currentUser.location && currentUser.location !== 'Nairobi, Kenya' ? currentUser.location : '',
    code: '',
    idType: 'National ID' as string,
    idNumber: '',
    orgType: ORG_TYPES.includes(currentUser.service) ? currentUser.service : ORG_TYPES[0],
    regNo: currentUser.saccoDetails?.registrationNo || '',
    phone: currentUser.saccoDetails?.contactPhone || currentUser.phone || '',
    rules: currentUser.saccoDetails?.rulesAndBenefits || '',
  });
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setError(''); setNote('');
    setV(prev => ({ ...prev, [k]: e.target.value }));
  };

  const [avatar, setAvatar] = useState<{ file: File | null; url: string }>({ file: null, url: /ui-avatars|unsplash/.test(currentUser.avatarUrl || '') ? '' : (currentUser.avatarUrl || '') });
  const [cover, setCover] = useState<{ file: File | null; url: string }>({ file: null, url: /unsplash/.test(currentUser.coverImageUrl || '') ? '' : (currentUser.coverImageUrl || '') });
  const [idDoc, setIdDoc] = useState<{ file: File | null; url: string }>({ file: null, url: '' });
  const [selfie, setSelfie] = useState<{ file: File | null; url: string }>({ file: null, url: '' });

  const total = steps.length;
  const last = step === total - 1;

  const upload = async (f: { file: File | null }, path: string) =>
    f.file ? uploadImageToStorage(f.file, `users/${currentUser.id}/${path}_${Date.now()}`) : undefined;

  /** Builds what this step should save. Empty answers are left out so we never wipe earlier answers. */
  const buildPatch = async (): Promise<Partial<ServiceProvider>> => {
    const p: Partial<ServiceProvider> = {};
    const put = <K extends keyof ServiceProvider>(key: K, val: ServiceProvider[K] | '' | undefined) => {
      if (val !== '' && val !== undefined) p[key] = val as ServiceProvider[K];
    };

    if (kind === 'individual') {
      if (step === 0) { put('name', v.name.trim()); put('service', v.service.trim()); put('category', v.category); }
      if (step === 1) {
        put('about', v.about.trim());
        const rate = parseFloat(v.rate.replace(/,/g, ''));
        if (!isNaN(rate)) { p.hourlyRate = rate; p.rateType = v.rateType as ServiceProvider['rateType']; }
      }
      if (step === 2) put('location', v.location.trim());
      if (step === 3) {
        if (v.idNumber.trim()) {
          p.idType = v.idType as ServiceProvider['idType'];
          p.idNumber = v.idNumber.trim();
          p.idVerificationStatus = 'Pending';
          p.idSubmitted = true;
        }
      }
      if (step === 4) {
        const [a, d, s] = await Promise.all([upload(avatar, 'avatar'), upload(idDoc, 'id'), upload(selfie, 'selfie')]);
        put('avatarUrl', a);
        if (d) { p.idDocumentUrl = d; p.idSubmitted = true; p.idVerificationStatus = 'Pending'; }
        put('selfieUrl', s);
      }
    } else {
      if (step === 0) {
        put('name', v.name.trim());
        p.service = v.orgType;
        p.category = 'ASSOCIATION';
        p.accountType = 'organization';
        p.saccoDetails = { ...(currentUser.saccoDetails || {}), registrationNo: v.regNo.trim() };
      }
      if (step === 1) {
        put('location', v.location.trim());
        p.saccoDetails = { ...(currentUser.saccoDetails || {}), contactPhone: v.phone.trim(), location: v.location.trim() };
      }
      if (step === 2) {
        put('about', v.about.trim());
        p.saccoDetails = { ...(currentUser.saccoDetails || {}), description: v.about.trim(), rulesAndBenefits: v.rules.trim() };
      }
      if (step === 3) {
        const [a, c] = await Promise.all([upload(avatar, 'logo'), upload(cover, 'cover')]);
        put('avatarUrl', a);
        put('coverImageUrl', c);
      }
    }
    return p;
  };

  const advance = async (save: boolean) => {
    setBusy(true); setError(''); setNote('');
    try {
      let patch: Partial<ServiceProvider> = {};
      if (save) {
        patch = await buildPatch();

        // A code from an organization or course sends a request to join it. The person is verified only when the
        // organization approves them; the server sets the badge then, never this screen.
        if (kind === 'individual' && step === 3 && v.code.trim()) {
          const res = await redeemReferralCode(v.code.trim(), currentUser.id);
          if ('error' in res) { setError(res.error); setBusy(false); return; }
          setNote(`Request sent to ${res.orgName}${res.courseTitle ? ` (${res.courseTitle})` : ''}. You get the Verified badge once they approve you.`);
        }
      }
      const next = Math.min(step + 1, total - 1);
      await onSave({
        ...patch,
        accountType: kind,
        registrationStep: last ? total - 1 : next,
        ...(last ? { isProfileCompleted: true } : {}),
      });

      if (last) {
        if (kind === 'organization') {
          const codes = await ensureReferralCodes(currentUser.id, []);
          setOrgCode(codes.find(c => c.kind === 'organization')?.code || '');
        }
        setDone(true);
      } else {
        setStep(next);
        window.scrollTo({ top: 0 });
      }
    } catch (e: any) {
      setError(e?.message || 'That did not save. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // ---------- Finished ----------
  if (done) {
    return (
      <div className="fixed inset-0 z-[90] bg-white overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-black text-2xl font-bold" style={{ background: GREEN }}>✓</div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">{kind === 'organization' ? 'Your organization is set up' : 'Your profile is saved'}</h1>
          <p className="mt-3 text-neutral-600">You can change anything later from your profile.</p>

          {kind === 'organization' && !orgCode && (
            <div className="mt-8 rounded-2xl bg-neutral-100 p-6 text-left">
              <p className="text-sm font-semibold text-neutral-900">Your organization code is on its way</p>
              <p className="text-sm text-neutral-600 mt-2">NikoSoko checks every organization before it can verify members. Once you are approved, your code appears in your dashboard.</p>
            </div>
          )}
          {kind === 'organization' && orgCode && (
            <div className="mt-8 rounded-2xl bg-black text-white p-6 text-left">
              <p className="text-sm text-white/70">Your organization code</p>
              <p className="font-mono text-3xl font-bold tracking-widest mt-1" style={{ color: GREEN }}>{orgCode}</p>
              <p className="text-sm text-white/70 mt-3">Give this to your members. When they enter it at signup they get the Verified badge with your name beside it. Each course you add gets its own code in your dashboard.</p>
              <button onClick={() => copy(orgCode)} className="mt-4 rounded-full bg-white text-black px-5 py-2 text-sm font-semibold">{copied ? 'Copied' : 'Copy code'}</button>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3">
            {kind === 'organization' && onOpenDashboard && (
              <button onClick={() => { onClose(); onOpenDashboard(); }} className="rounded-full bg-black text-white py-3.5 font-semibold">Open your dashboard</button>
            )}
            <button onClick={onClose} className={`rounded-full py-3.5 font-semibold ${kind === 'organization' ? 'border border-black' : 'bg-black text-white'}`}>Go to the app</button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Steps ----------
  const meta = steps[step];
  return (
    <div className="fixed inset-0 z-[90] bg-white overflow-y-auto" role="dialog" aria-modal="true" aria-label={kind === 'organization' ? 'Register your organization' : 'Create your profile'}>
      <div className="max-w-xl mx-auto px-6 pt-6 pb-16">
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500">{kind === 'organization' ? 'Register your organization' : 'Create your profile'}</p>
          <button onClick={onClose} className="text-sm font-semibold underline">Finish later</button>
        </div>

        <div className="mt-5" aria-label={`Step ${step + 1} of ${total}`}>
          <div className="h-1.5 rounded-full bg-neutral-200 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${((step + 1) / total) * 100}%`, background: GREEN }} />
          </div>
          <p className="text-xs text-neutral-500 mt-2">Step {step + 1} of {total}</p>
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">{meta.title}</h1>
        <p className="mt-2 text-neutral-600 leading-relaxed">{meta.help}</p>

        <div className="mt-8 space-y-6">
          {/* ----- Individual ----- */}
          {kind === 'individual' && step === 0 && (
            <>
              <Field label="Your name"><input className={field} value={v.name} onChange={set('name')} placeholder="e.g. Jane Wanjiku" autoComplete="name" /></Field>
              <Field label="What do you do?" hint="For example electrician, tailor, driver, tutor."><input className={field} value={v.service} onChange={set('service')} placeholder="e.g. Electrician" /></Field>
              <Field label="Type of work">
                <select className={field} value={v.category} onChange={set('category')}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </Field>
            </>
          )}
          {kind === 'individual' && step === 1 && (
            <>
              <Field label="About your work" hint="Two or three lines about your experience."><textarea className={field} rows={4} value={v.about} onChange={set('about')} placeholder="e.g. 8 years wiring homes and shops in Ruaka." /></Field>
              <Field label="Your rate (KES)"><input className={field} inputMode="numeric" value={v.rate} onChange={set('rate')} placeholder="e.g. 1500" /></Field>
              <Field label="Charged">
                <select className={field} value={v.rateType} onChange={set('rateType')}>
                  {RATE_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </Field>
            </>
          )}
          {kind === 'individual' && step === 2 && (
            <Field label="Area or estate" hint="Start typing and pick the closest match.">
              <input className={field} list="estates" value={v.location} onChange={set('location')} placeholder="e.g. Ruaka, Kiambu" />
              <datalist id="estates">{KENYAN_ESTATES.map(e => <option key={e.name} value={`${e.name}, ${e.county}`} />)}</datalist>
            </Field>
          )}
          {kind === 'individual' && step === 3 && (
            <>
              <Field label="Sacco, school or course code" hint="Ask your organization for it. It looks like KCSA-7K2M.">
                <input className={`${field} font-mono uppercase tracking-widest`} value={v.code} onChange={e => { setError(''); setV(p => ({ ...p, code: e.target.value.toUpperCase() })); }} placeholder="e.g. KCSA-7K2M" />
              </Field>
              <Field label="ID type">
                <select className={field} value={v.idType} onChange={set('idType')}>{ID_TYPES.map(t => <option key={t}>{t}</option>)}</select>
              </Field>
              <Field label="ID number" hint="Private. Other people never see it.">
                <input className={field} value={v.idNumber} onChange={set('idNumber')} inputMode="text" autoComplete="off" />
              </Field>
            </>
          )}
          {kind === 'individual' && step === 4 && (
            <>
              <PhotoPicker label="Profile photo" round preview={avatar.url} onPick={(file, url) => setAvatar({ file, url })} />
              <PhotoPicker label="Photo of your ID (optional)" hint="Private. Only used to check your identity." preview={idDoc.url} onPick={(file, url) => setIdDoc({ file, url })} />
              <PhotoPicker label="Selfie holding your ID (optional)" hint="Private. Only used to check your identity." preview={selfie.url} onPick={(file, url) => setSelfie({ file, url })} />
            </>
          )}

          {/* ----- Organization ----- */}
          {kind === 'organization' && step === 0 && (
            <>
              <Field label="Organization name"><input className={field} value={v.name} onChange={set('name')} placeholder="e.g. Ruaka Matatu Sacco" /></Field>
              <Field label="Type of organization">
                <select className={field} value={v.orgType} onChange={set('orgType')}>{ORG_TYPES.map(t => <option key={t}>{t}</option>)}</select>
              </Field>
              <Field label="Registration number" hint="Optional for now."><input className={field} value={v.regNo} onChange={set('regNo')} placeholder="e.g. CS/1234" /></Field>
            </>
          )}
          {kind === 'organization' && step === 1 && (
            <>
              <Field label="Contact phone"><input className={field} type="tel" value={v.phone} onChange={set('phone')} placeholder="e.g. 0712 345 678" /></Field>
              <Field label="Area or town" hint="Start typing and pick the closest match.">
                <input className={field} list="estates" value={v.location} onChange={set('location')} placeholder="e.g. Ruaka, Kiambu" />
                <datalist id="estates">{KENYAN_ESTATES.map(e => <option key={e.name} value={`${e.name}, ${e.county}`} />)}</datalist>
              </Field>
            </>
          )}
          {kind === 'organization' && step === 2 && (
            <>
              <Field label="What does the organization do?"><textarea className={field} rows={4} value={v.about} onChange={set('about')} placeholder="e.g. A sacco for matatu owners and drivers in Ruaka." /></Field>
              <Field label="What do members get?" hint="Optional. For example training, savings, or a code of conduct."><textarea className={field} rows={3} value={v.rules} onChange={set('rules')} /></Field>
            </>
          )}
          {kind === 'organization' && step === 3 && (
            <>
              <PhotoPicker label="Logo" round preview={avatar.url} onPick={(file, url) => setAvatar({ file, url })} />
              <PhotoPicker label="Cover photo (optional)" preview={cover.url} onPick={(file, url) => setCover({ file, url })} />
              <p className="text-sm text-neutral-600 rounded-lg bg-neutral-100 p-4">When you save, your organization code is created. Share it with members so they can get verified through you.</p>
            </>
          )}
        </div>

        {note && <p className="mt-6 text-sm font-semibold" style={{ color: '#0B7A4B' }} role="status">{note}</p>}
        {error && <p className="mt-6 text-sm text-red-600" role="alert">{error}</p>}

        <div className="mt-10 space-y-3">
          <button
            onClick={() => advance(true)}
            disabled={busy}
            className="w-full rounded-full bg-black text-white py-4 text-base font-semibold hover:bg-neutral-800 disabled:bg-neutral-400"
          >
            {busy ? 'Saving…' : last ? 'Save and finish' : 'Save and continue'}
          </button>
          <div className="flex items-center justify-between">
            <button onClick={() => { setError(''); setStep(s => Math.max(0, s - 1)); }} disabled={step === 0 || busy} className="text-sm font-semibold underline disabled:opacity-30">Back</button>
            <button onClick={() => advance(false)} disabled={busy} className="text-sm font-semibold underline">{last ? 'Skip and finish' : 'Skip for now'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationFlow;
