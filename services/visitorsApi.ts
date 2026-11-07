// Client for the Qaribu gate pass and premise routes on this server (see qaribuGate.ts). The functions and types
// are the same as in the Qaribu app, so its screens run here unchanged.
// The platform answers with error codes; these are the plain messages the Qaribu app shows for them.
const ERROR_TEXT: Record<string, string> = {
    sign_in_unavailable: 'Sign-in is not available right now.',
    invalid_phone: 'Enter a valid phone number.',
    too_many_requests: 'Too many tries. Wait a few minutes and try again.',
    too_many_invites: 'You have sent a lot of invites. Wait a while and try again.',
    invalid_code: 'That code is not right, or it has expired.',
    sign_in_required: 'Please sign in again.',
    premise_not_found: 'That premise was not found.',
    not_allowed: 'Your role does not allow that.',
    gate_pass_off: 'Gate pass is switched off for this premise.',
    pass_not_found: 'No pass found for that code.',
    not_checked_in: 'That visitor is not checked in.',
    too_many_attempts: 'Too many wrong codes. Wait a few minutes, then try again.',
    brand_kit_required: 'Set up your brand kit first: your business name, address and phone.',
    too_many_receipts: 'You have issued a lot of receipts. Wait a while and try again.',
};

export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }

const call = async (path: string, options: RequestInit = {}, contentType = 'application/json') => {
  const response = await fetch(`/api/qaribu${path}`, { ...options, headers: { 'Content-Type': contentType }, cache: 'no-store', signal: AbortSignal.timeout(25000) }).catch((e: any) => {
    throw new ApiError(0, e?.name === 'TimeoutError' ? 'Qaribu is taking too long to answer. Check your connection and try again.' : 'Could not reach Nikosoko. Check your connection and try again.');
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(response.status, data.message || ERROR_TEXT[data.error] || data.error || `Something went wrong (${response.status}).`);
  return data;
};

interface Account { id: string; phone: string; name: string; }

export interface HostPremise { id: string; slug: string; name: string; role: string; log_times: boolean; }

// One premise the account belongs to, and what its role (or roles) lets them do there. The server checks the
// role again on every call; these flags only decide which screens to offer.
export interface Membership {
    slug: string;
    name: string;
    roles: string[];
    gate_pass_enabled: boolean;
    log_times: boolean;
    can_invite: boolean;
    can_manage: boolean;
    can_manage_vacancies: boolean;
    can_run_gate: boolean;
    assignable_roles: string[];
}

// The person profile: the Nikosoko lens on this same account. A name is all it needs.
export interface PersonProfile { id: string; name: string; visibility: string; }

export interface Me { account: Account; profile: PersonProfile | null; premises: HostPremise[]; memberships: Membership[]; }

// The last answer, kept in memory so the screen can open at once and refresh behind itself.
let meCache: Me | null = null;
export const peekMe = (): Me | null => meCache;
export const clearMeCache = (): void => { meCache = null; };
export const getMe = (): Promise<Me> => call('/me').then((me: Me) => (meCache = me));

export const setMyName = (name: string): Promise<{ account: Account; profile: PersonProfile | null }> =>
    call('/me/profile', { method: 'PUT', body: JSON.stringify({ name }) });

// How the invite SMS went: Qaribu sent it, the provider refused it, or SMS is not set up on the server.
export type SmsStatus = 'sent' | 'failed' | 'not_configured';

export interface CreatedInvite {
    id: string;
    sms: SmsStatus;
    pass_url: string;
    key: string;
    expires_at: string;
    visitor_phone: string;
    message: string;
    sms_link: string;
    whatsapp_link: string;
}

export type VisitStatus = 'waiting' | 'arrived' | 'left' | 'expired' | 'cancelled';

export interface PassRow {
    id: string;
    visitor_name: string;
    visitor_phone: string;
    purpose: string;
    host_label: string;
    mine: boolean; // false: another host's visitor, shown to an owner or manager only after the code was used
    status: VisitStatus;
    key: string | null; // only while the pass can still be used
    created_at: string;
    expires_at: string | null;
    arrived_at: string | null; // check-in and check-out times only when the premise records them
    left_at: string | null;
}

// The host's own expected visitors for one premise. An owner or manager also gets other hosts' visits, but only once the
// code was used at the gate, as a record (no phone number).
export const getPasses = (premise: string): Promise<{ premise: { slug: string; name: string; log_times: boolean }; passes: PassRow[] }> =>
    call(`/host/passes?premise=${encodeURIComponent(premise)}`);

// The host's gate pass invite. The visitor's ID is never part of it; the gateman records it at the gate.
export const createInvite = (input: {
    premise: string;
    visitor_name: string;
    visitor_phone: string;
    purpose: string;
    host_label?: string;
}): Promise<CreatedInvite> => call('/host/passes', { method: 'POST', body: JSON.stringify(input) });

// --- Premise owners and managers ---
export interface TeamMember { id: string; phone: string; name: string; role: string; since: string; }

export interface ManagedPremise {
    premise: { slug: string; name: string };
    gate_pass: { enabled: boolean; log_times: boolean };
    guard_link: string | null; // a shared secret link for a gate phone; replace it if the phone is lost
    assignable_roles: string[];
    team: TeamMember[];
}

const premisePath = (slug: string) => `/manage/${encodeURIComponent(slug)}`;

export const getManaged = (slug: string): Promise<ManagedPremise> => call(premisePath(slug));

export const setGatePass = (slug: string, change: { enabled?: boolean; log_times?: boolean }) =>
    call(`${premisePath(slug)}/gate-pass`, { method: 'PUT', body: JSON.stringify(change) });

export const rotateGuardLink = (slug: string): Promise<{ guard_link: string }> =>
    call(`${premisePath(slug)}/guard-link/rotate`, { method: 'POST', body: '{}' });

export const addTeamMember = (slug: string, member: { phone: string; name?: string; role: string }): Promise<TeamMember> =>
    call(`${premisePath(slug)}/team`, { method: 'POST', body: JSON.stringify(member) });

export const removeTeamMember = (slug: string, id: string): Promise<{ ok: boolean }> =>
    call(`${premisePath(slug)}/team/${encodeURIComponent(id)}`, { method: 'DELETE' });

// --- Premise sign-up: register a premise and get its page and sticker straight away ---
export interface PremiseLinks { page: string; sticker: string; qr: string; }

export const registerMyPremise = (details: {
    name: string;
    area?: string;
    county?: string;
    tagline?: string;
    about?: string;
    listed?: boolean;
}): Promise<{ slug: string; links: PremiseLinks }> => call('/premises', { method: 'POST', body: JSON.stringify(details) });

// --- Vacancies and the people waiting to hear about them (owner, manager, caretaker) ---
export interface VacancyItem {
    id: string;
    title: string;
    type: string;
    rent: number | null;
    available_from: string | null;
    notes: string;
    confirmed_at: string;
    shown_on_page: boolean; // hidden from the public page when not confirmed in the last 14 days
    timing: 'now' | 'upcoming';
    bedrooms: number | null;
    bathrooms: number | null;
    deposit: number | null;
    features: string[];
    photos: string[]; // addresses of the photos, in order
    photo_refs: string[]; // their names, for removing one
    photos_needed: number; // how many more photos before the public page shows it
}

export interface WaitingPerson {
    id: string;
    name: string;
    phone: string;
    looking_for: string;
    since: string;
    sms_link: string | null;
    whatsapp_link: string | null;
}

export interface VacanciesView {
    premise: { slug: string; name: string };
    links: PremiseLinks | null;
    vacancies: VacancyItem[];
    waiting: WaitingPerson[];
    message: string | null; // what to send the people waiting once a vacancy opens
}

export interface VacancyFields {
    title: string;
    type?: string;
    rent?: string;
    available_from?: string;
    notes?: string;
    bedrooms?: string;
    bathrooms?: string;
    deposit?: string;
    features?: string[];
}

const vacPath = (slug: string) => `/vacancies/${encodeURIComponent(slug)}`;

export const getVacancies = (slug: string): Promise<VacanciesView> => call(vacPath(slug));
export const addVacancy = (slug: string, fields: VacancyFields): Promise<VacancyItem> =>
    call(vacPath(slug), { method: 'POST', body: JSON.stringify(fields) });
export const updateVacancy = (slug: string, id: string, fields: VacancyFields): Promise<VacancyItem> =>
    call(`${vacPath(slug)}/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(fields) });
export const confirmVacancy = (slug: string, id: string): Promise<VacancyItem> =>
    call(`${vacPath(slug)}/${encodeURIComponent(id)}/confirm`, { method: 'POST', body: '{}' });
export const removeVacancy = (slug: string, id: string): Promise<{ ok: boolean }> =>
    call(`${vacPath(slug)}/${encodeURIComponent(id)}`, { method: 'DELETE' });
export const markWaitingTold = (slug: string, id: string): Promise<{ ok: boolean }> =>
    call(`${vacPath(slug)}/waiting/${encodeURIComponent(id)}/told`, { method: 'POST', body: '{}' });
export const removeWaiting = (slug: string, id: string): Promise<{ ok: boolean }> =>
    call(`${vacPath(slug)}/waiting/${encodeURIComponent(id)}`, { method: 'DELETE' });

// --- The gateman, signed in: verify a pass, admit with the ID they read from the visitor's ID, check out ---
export interface GateVisitor { name: string; purpose: string; host_label: string; expires_at: string | null; }
export type PassState = 'valid' | 'used' | 'expired' | 'unavailable';
export interface InsideVisitor { id: string; visitor_name: string; purpose: string; host_label: string; arrived_at: string; }

export const getGate = (slug: string): Promise<{ premise: { slug: string; name: string; log_times: boolean }; inside: InsideVisitor[] | null }> =>
    call(`/gate/${encodeURIComponent(slug)}`);

export const gateCheck = (slug: string, code: string): Promise<{ state: PassState; can_admit: boolean; visitor: GateVisitor }> =>
    call(`/gate/${encodeURIComponent(slug)}/check`, { method: 'POST', body: JSON.stringify({ code }) });

export const gateAdmit = (slug: string, code: string, idNumber: string): Promise<{ admitted: boolean; state: PassState; visitor: GateVisitor }> =>
    call(`/gate/${encodeURIComponent(slug)}/admit`, { method: 'POST', body: JSON.stringify({ code, id_number: idNumber }) });

export const gateCheckout = (slug: string, visitor: string): Promise<{ ok: boolean; visitor_name: string }> =>
    call(`/gate/${encodeURIComponent(slug)}/checkout`, { method: 'POST', body: JSON.stringify({ visitor }) });



// --- The premise's page: words, numbers and photos, and photos of a vacancy (owner and manager; vacancies also the caretaker) ---
export interface PremisePage {
    premise?: { slug: string; name: string };
    links?: PremiseLinks | null;
    tagline: string;
    about: string;
    area: string;
    contact_phone: string;
    whatsapp: string;
    cover: string | null; // address of the cover photo
    cover_ref: string | null;
    gallery: { ref: string; url: string }[];
}

export const MAX_GALLERY = 8;
export const MIN_VACANCY_PHOTOS = 4;
export const MAX_VACANCY_PHOTOS = 10;

export const getPremisePage = (slug: string): Promise<PremisePage> => call(`${premisePath(slug)}/page`);
export const savePremisePage = (slug: string, fields: { tagline: string; about: string; area: string; contact_phone: string; whatsapp: string }): Promise<PremisePage> =>
    call(`${premisePath(slug)}/page`, { method: 'PUT', body: JSON.stringify(fields) });
// A photo from the in-app camera: as 'cover' replaces the header photo, as 'gallery' adds to the premise's photos.
export const uploadPremisePicture = (slug: string, as: 'cover' | 'gallery', photo: Blob): Promise<PremisePage> =>
    call(`${premisePath(slug)}/pictures?as=${as}`, { method: 'POST', body: photo }, 'image/jpeg');
export const deletePremisePicture = (slug: string, ref: string): Promise<PremisePage> =>
    call(`${premisePath(slug)}/pictures/${encodeURIComponent(ref)}`, { method: 'DELETE' });
export const uploadVacancyPhoto = (slug: string, id: string, photo: Blob): Promise<VacancyItem> =>
    call(`${vacPath(slug)}/${encodeURIComponent(id)}/photos`, { method: 'POST', body: photo }, 'image/jpeg');
export const deleteVacancyPhoto = (slug: string, id: string, ref: string): Promise<VacancyItem> =>
    call(`${vacPath(slug)}/${encodeURIComponent(id)}/photos/${encodeURIComponent(ref)}`, { method: 'DELETE' });
