import React, { useMemo, useRef, useState } from 'react';
import * as api from '../services/api';
import type { ServiceProvider } from '../types';
import {
  ORG_TYPE_LIST, ORG_TYPES, KENYA_COUNTIES, ORG_DOC_MAX_BYTES, ORG_DOC_MIME, type OrgType,
} from '../utils/orgTypes';

interface Props {
  onClose: () => void;
  onLogin: (data: api.VerifyOtpResponse, phone: string, nickname?: string, fullProfile?: Partial<ServiceProvider>) => void;
  currentUser: ServiceProvider | null;
  initialType?: OrgType;
}

type Step = 'type' | 'phone' | 'otp' | 'details' | 'documents' | 'done';

interface PickedDoc { docType: string; fileName: string; size: number; dataUrl: string; }

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('Could not read that file.'));
    r.readAsDataURL(file);
  });

const formatSize = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(n / 1024)} KB`);

const Field: React.FC<{ label: string; hint?: string; required?: boolean; children: React.ReactNode }> = ({ label, hint, required, children }) => (
  <label className="block">
    <span className="block text-[11px] font-bold text-neutral-700 mb-1">
      {label}{required && <span className="text-red-600"> *</span>}
    </span>
    {children}
    {hint && <span className="block text-[11px] text-neutral-500 mt-1">{hint}</span>}
  </label>
);

const inputCls =
  'w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm text-black bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black placeholder-neutral-400';

const OrgSignupModal: React.FC<Props> = ({ onClose, onLogin, currentUser, initialType }) => {
  const [step, setStep] = useState<Step>(initialType ? (currentUser ? 'details' : 'phone') : 'type');
  const [type, setType] = useState<OrgType | null>(initialType || null);
  const spec = type ? ORG_TYPES[type] : null;

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Account (phone verification)
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState<{ response: api.VerifyOtpResponse; target: string } | null>(null);

  // Organization details - only fields a reviewer actually needs to verify
  // the organization and approve it to confirm members. (displayName,
  // yearRegistered, address, website and memberCount were dropped: none of
  // them affect the verification decision, and the backend already
  // defaults/tolerates their absence - see orgs.ts.)
  const [legalName, setLegalName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [regAuthority, setRegAuthority] = useState('');
  const [extraNumber, setExtraNumber] = useState('');
  const [county, setCounty] = useState('Nairobi');
  const [town, setTown] = useState('');
  const [officialPhone, setOfficialPhone] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');

  // Contact person + documents
  const [contactName, setContactName] = useState(currentUser?.name || '');
  const [contactRole, setContactRole] = useState('');
  const [docs, setDocs] = useState<Record<string, PickedDoc>>({});
  const [authorised, setAuthorised] = useState(false);
  const [terms, setTerms] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Result
  const [result, setResult] = useState<{ code: string; key: string; name: string } | null>(null);
  const [copied, setCopied] = useState('');

  const stepLabels = useMemo(() => {
    const base = currentUser ? ['Type', 'Details', 'Documents'] : ['Type', 'Sign in', 'Details', 'Documents'];
    const idx: Record<Step, number> = currentUser
      ? { type: 0, phone: 0, otp: 0, details: 1, documents: 2, done: 3 }
      : { type: 0, phone: 1, otp: 1, details: 2, documents: 3, done: 4 };
    return { base, current: idx[step] };
  }, [step, currentUser]);

  const fail = (msg: string) => { setError(msg); return false; };

  // ------------------------------------------------------------------ steps
  const chooseType = (t: OrgType) => {
    setType(t);
    setError('');
    setStep(currentUser || verified ? 'details' : 'phone');
  };

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 9) return fail('Enter your 9-digit mobile number, e.g. 712 345 678.');
    setBusy(true); setError('');
    try {
      await api.sendOtp(`254${digits}`);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Could not send the code. Try again.');
    } finally { setBusy(false); }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return fail('Enter the code we sent you.');
    setBusy(true); setError('');
    try {
      const target = `254${phone.replace(/\D/g, '')}`;
      const response = await api.verifyOtp(target, otp);
      setVerified({ response, target });
      if (response.user) setContactName(n => n || response.user!.name);
      setStep('details');
    } catch (err: any) {
      setError(err.message || 'That code is not right.');
    } finally { setBusy(false); }
  };

  const validateDetails = (): boolean => {
    if (!spec) return false;
    if (legalName.trim().length < 3) return fail('Enter the full registered name of the organization.');
    if (regNumber.trim().length < 3) return fail(`Enter the ${spec.regNumberLabel.toLowerCase()}.`);
    if (!regAuthority) return fail('Choose who registered or licenses the organization.');
    if (spec.extraNumberRequired && !extraNumber.trim()) return fail(`Enter the ${spec.extraNumberLabel?.toLowerCase()}.`);
    if (!county) return fail('Choose the county where the organization is based.');
    if (town.trim().length < 2) return fail('Enter the town or area.');
    if (officialPhone.replace(/\D/g, '').length < 9) return fail('Enter an official phone number for the organization.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(officialEmail.trim())) return fail('Enter an official email address.');
    setError('');
    return true;
  };

  const pickFile = async (docType: string, file: File | undefined) => {
    if (!file) return;
    if (!ORG_DOC_MIME.includes(file.type)) return fail('Upload a PDF, JPG or PNG file.');
    if (file.size > ORG_DOC_MAX_BYTES) return fail('That file is over 5 MB. Upload a smaller scan.');
    try {
      const dataUrl = await fileToDataUrl(file);
      setDocs(d => ({ ...d, [docType]: { docType, fileName: file.name, size: file.size, dataUrl } }));
      setError('');
    } catch (err: any) { fail(err.message); }
  };

  const submit = async () => {
    if (!spec || !type) return;
    for (const d of spec.documents.filter(x => x.required)) {
      if (!docs[d.id]) return fail(`Upload: ${d.label}.`);
    }
    if (contactName.trim().length < 3) return fail('Enter the name of the person registering the organization.');
    if (contactRole.trim().length < 2) return fail('Enter that person\'s role in the organization.');
    if (!authorised) return fail('Confirm that you are authorised to register this organization.');
    if (!terms) return fail('Accept the Terms & Kenya Data Protection Act notice to continue.');

    setBusy(true); setError('');
    try {
      // Who owns this registration? An existing account keeps its identity;
      // a brand-new phone gets an organization account made for it.
      const existing = currentUser || verified?.response.user || null;
      const ownerPhone = existing?.phone || verified?.target || '';
      const ownerProviderId = existing?.id || `org_${Date.now()}`;

      const name = legalName.trim();
      const res = await api.registerOrganization({
        orgType: type, legalName, regNumber, regAuthority, extraNumber,
        county, town, officialPhone, officialEmail,
        contactName, contactRole, ownerPhone, ownerProviderId, confirmAuthorised: authorised,
        documents: Object.values(docs).map(d => ({ docType: d.docType, fileName: d.fileName, dataUrl: d.dataUrl })),
      });
      api.saveOrgKey(res.org.id, res.manageKey);
      setResult({ code: res.org.referralCode, key: res.manageKey, name });

      if (verified && !currentUser) {
        if (verified.response.user) {
          onLogin(verified.response, verified.target, verified.response.user.name, verified.response.user);
        } else {
          onLogin(verified.response, verified.target, name, {
            id: ownerProviderId,
            name,
            phone: verified.target,
            service: spec.label,
            category: 'PROFESSIONAL',
            accountType: 'organization',
            saccoCode: res.org.referralCode,
            location: `${town.trim()}, ${county}`,
            about: `${spec.label} registered in ${county}. Verification pending.`,
            isVerified: false,
            isProfileCompleted: true,
          });
        }
      }
      setStep('done');
    } catch (err: any) {
      setError(err.message || 'Could not submit your registration. Please try again.');
    } finally { setBusy(false); }
  };

  const copy = async (what: string, text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(what); setTimeout(() => setCopied(''), 1800); } catch { /* clipboard blocked */ }
  };

  const downloadKey = () => {
    if (!result) return;
    const body = `NikoSoko organization access\n\nOrganization: ${result.name}\nReferral code: ${result.code}\nAccess key: ${result.key}\n\nKeep this file private. The access key lets you confirm members. NikoSoko stores only a scrambled copy, so we cannot show it again - if you lose it, contact NikoSoko support to have a new one issued.\n`;
    const url = URL.createObjectURL(new Blob([body], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'nikosoko-organization-access.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  // ----------------------------------------------------------------- render
  return (
    <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 font-sans" role="dialog" aria-modal="true" aria-label="Register your organization">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        <div className="bg-black text-white px-6 py-4 flex items-start justify-between shrink-0">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">NikoSoko for Organizations</p>
            <h2 className="text-lg font-black leading-tight mt-0.5">
              {step === 'done' ? 'Application received' : 'Register your organization'}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-neutral-400 hover:text-white text-xl leading-none p-1 cursor-pointer">✕</button>
        </div>

        {step !== 'done' && (
          <ol className="flex items-center gap-2 px-6 py-3 border-b border-neutral-200 bg-neutral-50 shrink-0 text-[11px] font-bold overflow-x-auto">
            {stepLabels.base.map((l, i) => (
              <li key={l} className="flex items-center gap-2 shrink-0">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${i < stepLabels.current ? 'bg-emerald-500 text-black' : i === stepLabels.current ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                  {i < stepLabels.current ? '✓' : i + 1}
                </span>
                <span className={i === stepLabels.current ? 'text-black' : 'text-neutral-500'}>{l}</span>
                {i < stepLabels.base.length - 1 && <span className="w-6 h-px bg-neutral-300" />}
              </li>
            ))}
          </ol>
        )}

        <div className="overflow-y-auto flex-1 px-6 py-5">
          {error && (
            <div role="alert" className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-lg px-3 py-2">{error}</div>
          )}

          {/* TYPE */}
          {step === 'type' && (
            <div>
              <p className="text-sm text-neutral-600 mb-4">What kind of organization are you registering? This decides which documents we ask for.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {ORG_TYPE_LIST.map(t => (
                  <button key={t.id} onClick={() => chooseType(t.id)} className="text-left p-4 rounded-xl border border-neutral-300 hover:border-black hover:bg-neutral-50 transition-colors cursor-pointer">
                    <span className="text-2xl">{t.icon}</span>
                    <span className="block text-sm font-black text-black mt-2">{t.label}</span>
                    <span className="block text-xs text-neutral-600 mt-0.5">{t.short}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PHONE */}
          {step === 'phone' && spec && (
            <form onSubmit={sendOtp} className="max-w-sm mx-auto space-y-4">
              <p className="text-sm text-neutral-600">
                Sign in with the phone number of the person registering <strong>{spec.label.toLowerCase()}</strong>. We will text a code to confirm it is you.
              </p>
              <Field label="Your mobile number" required>
                <div className="flex border border-neutral-300 rounded-lg overflow-hidden focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                  <span className="px-3 py-2.5 bg-neutral-100 text-sm font-bold border-r border-neutral-300">+254</span>
                  <input inputMode="numeric" autoFocus value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))} placeholder="712345678" className="flex-1 px-3 py-2.5 text-sm outline-none" />
                </div>
              </Field>
              <button disabled={busy} className="w-full bg-black text-white font-black py-3 rounded-lg text-sm uppercase tracking-wide hover:bg-neutral-800 disabled:bg-neutral-300 cursor-pointer">
                {busy ? 'Sending…' : 'Send code'}
              </button>
              <button type="button" onClick={() => { setStep('type'); setError(''); }} className="w-full text-sm font-bold text-neutral-600 underline cursor-pointer">Back</button>
            </form>
          )}

          {/* OTP */}
          {step === 'otp' && (
            <form onSubmit={verifyOtp} className="max-w-sm mx-auto space-y-4">
              <p className="text-sm text-neutral-600">Enter the code sent to <strong>+254 {phone}</strong>.</p>
              <input inputMode="numeric" autoFocus maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="Code" className={`${inputCls} text-center text-xl font-black tracking-[0.4em]`} />
              <button disabled={busy} className="w-full bg-black text-white font-black py-3 rounded-lg text-sm uppercase tracking-wide hover:bg-neutral-800 disabled:bg-neutral-300 cursor-pointer">
                {busy ? 'Checking…' : 'Verify and continue'}
              </button>
              <button type="button" onClick={() => { setStep('phone'); setOtp(''); setError(''); }} className="w-full text-sm font-bold text-neutral-600 underline cursor-pointer">Change number</button>
            </form>
          )}

          {/* DETAILS */}
          {step === 'details' && spec && (
            <form onSubmit={e => { e.preventDefault(); if (validateDetails()) setStep('documents'); }} className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-xl">{spec.icon}</span>
                <span className="font-black">{spec.label}</span>
                <button type="button" onClick={() => setStep('type')} className="ml-auto text-xs font-bold text-neutral-500 underline cursor-pointer">Change type</button>
              </div>
              {(currentUser || verified?.response.user) && (
                <p className="text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-3 py-2 font-semibold">
                  This phone number already has a NikoSoko account ({(currentUser || verified?.response.user)?.name}). The organization will be linked to it; your personal profile stays as it is.
                </p>
              )}

              <Field label="Full registered name" required hint="Exactly as it appears on your certificate.">
                <input value={legalName} onChange={e => setLegalName(e.target.value)} className={inputCls} placeholder={type === 'sacco' ? 'e.g. Mwalimu Teachers Sacco Society Ltd' : 'Registered name'} autoComplete="organization" />
              </Field>

              <Field label={spec.regNumberLabel} required>
                <input value={regNumber} onChange={e => setRegNumber(e.target.value)} className={`${inputCls} uppercase`} placeholder={spec.regNumberPlaceholder} />
              </Field>

              <Field label="Registered / licensed by" required>
                <select value={regAuthority} onChange={e => setRegAuthority(e.target.value)} className={inputCls}>
                  <option value="">Choose…</option>
                  {spec.authorities.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </Field>

              {spec.extraNumberLabel && (
                <Field label={spec.extraNumberLabel} required={spec.extraNumberRequired}>
                  <input value={extraNumber} onChange={e => setExtraNumber(e.target.value)} className={inputCls} />
                </Field>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="County" required>
                  <select value={county} onChange={e => setCounty(e.target.value)} className={inputCls}>
                    {KENYA_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Town / area" required>
                  <input value={town} onChange={e => setTown(e.target.value)} className={inputCls} placeholder="e.g. Ruaka" />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Official phone" required hint="A number the organization answers, not a personal one.">
                  <input inputMode="tel" value={officialPhone} onChange={e => setOfficialPhone(e.target.value)} className={inputCls} placeholder="0712 345 678" />
                </Field>
                <Field label="Official email" required hint="We may contact this address to confirm your registration.">
                  <input type="email" value={officialEmail} onChange={e => setOfficialEmail(e.target.value)} className={inputCls} placeholder="info@yourorganization.co.ke" />
                </Field>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-black text-white font-black py-3 rounded-lg text-sm uppercase tracking-wide hover:bg-neutral-800 cursor-pointer">Continue to documents</button>
              </div>
            </form>
          )}

          {/* DOCUMENTS */}
          {step === 'documents' && spec && (
            <div className="space-y-5">
              <p className="text-sm text-neutral-600">
                We check every organization against its certificates before it can verify anyone. This is what stops someone pretending to be a Sacco or a college.
                Clear scans or photos of the originals, PDF/JPG/PNG, up to 5 MB each.
              </p>

              {spec.documents.map(d => {
                const picked = docs[d.id];
                return (
                  <div key={d.id} className="border border-neutral-300 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-black">{d.label} {d.required ? <span className="text-red-600">*</span> : <span className="text-xs font-semibold text-neutral-500">(optional)</span>}</p>
                        <p className="text-xs text-neutral-600 mt-0.5">{d.hint}</p>
                      </div>
                      <button type="button" onClick={() => fileRefs.current[d.id]?.click()} className="shrink-0 text-xs font-black border border-black rounded-lg px-3 py-1.5 hover:bg-black hover:text-white transition-colors cursor-pointer">
                        {picked ? 'Replace' : 'Choose file'}
                      </button>
                      <input ref={el => { fileRefs.current[d.id] = el; }} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="hidden" onChange={e => { pickFile(d.id, e.target.files?.[0]); e.target.value = ''; }} />
                    </div>
                    {picked && (
                      <p className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                        <span>✓</span><span className="truncate">{picked.fileName}</span><span className="text-neutral-500 shrink-0">· {formatSize(picked.size)}</span>
                      </p>
                    )}
                  </div>
                );
              })}

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Your full name" required hint="The person registering the organization.">
                  <input value={contactName} onChange={e => setContactName(e.target.value)} className={inputCls} autoComplete="name" />
                </Field>
                <Field label="Your role" required>
                  <input value={contactRole} onChange={e => setContactRole(e.target.value)} className={inputCls} placeholder={type === 'training_centre' ? 'e.g. Principal, Registrar' : 'e.g. Manager, Chairperson'} />
                </Field>
              </div>

              <label className="flex items-start gap-2.5 text-sm text-neutral-800 cursor-pointer">
                <input type="checkbox" checked={authorised} onChange={e => setAuthorised(e.target.checked)} className="mt-1 w-4 h-4 accent-black" />
                <span>I am authorised to register this organization, and the details and documents I have given are genuine. I understand that submitting false documents may lead to a ban and be reported.</span>
              </label>
              <label className="flex items-start gap-2.5 text-sm text-neutral-800 cursor-pointer">
                <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} className="mt-1 w-4 h-4 accent-black" />
                <span>I accept the NikoSoko Terms and agree that NikoSoko may process these documents to verify the organization, in line with the Kenya Data Protection Act, 2019.</span>
              </label>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setStep('details'); setError(''); }} className="px-5 py-3 rounded-lg border border-neutral-300 text-sm font-bold hover:bg-neutral-50 cursor-pointer">Back</button>
                <button type="button" onClick={submit} disabled={busy} className="flex-1 bg-black text-white font-black py-3 rounded-lg text-sm uppercase tracking-wide hover:bg-neutral-800 disabled:bg-neutral-300 cursor-pointer">
                  {busy ? 'Submitting…' : 'Submit for verification'}
                </button>
              </div>
            </div>
          )}

          {/* DONE */}
          {step === 'done' && result && (
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center shrink-0">✓</span>
                <div>
                  <p className="text-base font-black text-black">Thank you — {result.name} is under review.</p>
                  <p className="text-sm text-neutral-600 mt-1">
                    A NikoSoko reviewer will check your certificates. Your referral code is already reserved but stays <strong>inactive</strong> until you are approved; people who try it before then will be told you are still being verified.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border-2 border-black p-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-neutral-500">Your referral code</p>
                <div className="flex items-center justify-between gap-3 mt-1">
                  <span className="text-2xl font-black font-mono tracking-wider">{result.code}</span>
                  <button onClick={() => copy('code', result.code)} className="text-xs font-black border border-black rounded-lg px-3 py-1.5 hover:bg-black hover:text-white cursor-pointer">{copied === 'code' ? 'Copied' : 'Copy'}</button>
                </div>
                <p className="text-xs text-neutral-600 mt-2">Once approved, give this to your {type === 'training_centre' ? 'students and graduates' : type === 'company' ? 'partners and staff' : 'members'}. They add it, with their {spec?.memberNumberLabel.toLowerCase()}, in the NikoSoko app to get verified. You then confirm each person.</p>
              </div>

              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-amber-800">Your organization access key — shown once</p>
                <div className="flex items-center justify-between gap-3 mt-1">
                  <span className="text-sm font-black font-mono break-all">{result.key}</span>
                  <button onClick={() => copy('key', result.key)} className="shrink-0 text-xs font-black border border-amber-800 text-amber-900 rounded-lg px-3 py-1.5 hover:bg-amber-900 hover:text-white cursor-pointer">{copied === 'key' ? 'Copied' : 'Copy'}</button>
                </div>
                <p className="text-xs text-amber-900 mt-2">You need this key to confirm members. We keep only a scrambled copy, so we cannot show it again. It is saved on this device; download a copy to keep somewhere safe.</p>
                <button onClick={downloadKey} className="mt-3 text-xs font-black bg-amber-900 text-white rounded-lg px-4 py-2 hover:bg-amber-950 cursor-pointer">Download access details</button>
              </div>

              <ol className="text-sm text-neutral-700 space-y-1.5 list-decimal pl-5">
                <li>We review your documents, usually within a few working days.</li>
                <li>We may call or email your official contacts to confirm.</li>
                <li>When approved, your code goes live and you can confirm members from the NikoSoko app.</li>
              </ol>

              <button onClick={onClose} className="w-full bg-black text-white font-black py-3 rounded-lg text-sm uppercase tracking-wide hover:bg-neutral-800 cursor-pointer">Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrgSignupModal;
