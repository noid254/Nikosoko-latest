// The Qaribu platform API as Nikosoko's screens need it: sign-in, who I am, the professionals listed, and bookings. The platform keeps
// the data; this file only asks for it and shapes it like the records the screens already use.

import type { Booking, ServiceProvider } from '../types';
import { PLATFORM_URL } from './backend';

const TOKEN_KEY = 'authToken';
const token = () => localStorage.getItem(TOKEN_KEY);

export class PlatformError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

const SAYINGS: Record<string, string> = {
    invalid_phone: 'Enter a valid phone number, such as 0712345678.',
    invalid_code: 'That code is not right. Check it and try again.',
    too_many_requests: 'Too many tries. Wait a few minutes and try again.',
    too_many_attempts: 'Too many tries. Wait a few minutes and try again.',
    sign_in_unavailable: 'Sign-in is not available right now.',
    sign_in_required: 'Sign in to continue.',
};

async function call<T = any>(path: string, init: RequestInit = {}): Promise<T> {
    const t = token();
    const response = await fetch(`${PLATFORM_URL}${path}`, {
        ...init,
        headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}), ...(init.headers ?? {}) },
        cache: 'no-store',
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new PlatformError(response.status, data.message || SAYINGS[data.error] || `Something went wrong (${response.status}).`);
    return data as T;
}

// --- Sign-in: a phone number and a one-time code, checked by the server ---
const phoneOnly = (target: string) => {
    if (String(target).includes('@')) throw new PlatformError(400, 'Sign in with your phone number.');
    return String(target).trim();
};

export const requestCode = (target: string) => call('/auth/otp/request', { method: 'POST', body: JSON.stringify({ phone: phoneOnly(target) }) });
export const verifyCode = (target: string, code: string): Promise<{ token: string }> =>
    call('/auth/otp/verify', { method: 'POST', body: JSON.stringify({ phone: phoneOnly(target), code }) });

// --- The professionals ---
const RATE_TYPES: ServiceProvider['rateType'][] = ['per hour', 'per day', 'per task', 'per month', 'per piece work', 'per km', 'per sqm', 'per cbm', 'per appearance'];
const rateType = (per: string): ServiceProvider['rateType'] => (RATE_TYPES as string[]).includes(per) ? (per as ServiceProvider['rateType']) : 'per task';
// Call and WhatsApp stay off a listing until the platform can pass a number on without publishing it.
const publicButtons = (b: string[]) => b.filter((x): x is 'book' | 'catalogue' => x === 'book' || x === 'catalogue');

interface Listed {
    id: string;
    name: string;
    tagline: string;
    about: string;
    area: string;
    county: string;
    category: string;
    rate: { amount: number; per: string };
    hasCover: boolean;
    verified: boolean;
    buttons: string[];
    skills: { title: string; category: string }[];
}

const skillsOf = (id: string, skills: { title: string; category: string }[]) =>
    skills.map((s, i) => ({ id: `${id}-${i}`, name: s.title, skillTitle: s.title, category: s.category, isVerified: false }));

export const getProfessionals = async (): Promise<ServiceProvider[]> => {
    const data = await call<{ items: Listed[] }>('/professionals');
    return data.items.map((p) => ({
        id: p.id,
        name: p.name,
        phone: '',
        service: p.tagline,
        avatarUrl: `${PLATFORM_URL}/professionals/${p.id}/photo`,
        coverImageUrl: p.hasCover ? `${PLATFORM_URL}/professionals/${p.id}/cover` : '',
        rating: 0,
        distanceKm: 0,
        hourlyRate: p.rate.amount,
        rateType: rateType(p.rate.per),
        currency: 'KES',
        isVerified: p.verified,
        about: p.about,
        works: [],
        category: p.category || 'OTHER',
        location: [p.area, p.county].filter(Boolean).join(', '),
        isOnline: false,
        accountType: 'individual',
        flagCount: 0,
        views: 0,
        cta: publicButtons(p.buttons),
        skills: skillsOf(p.id, p.skills),
    } as ServiceProvider));
};

// The signed-in person, shaped as the screens' own record. Their id is their person profile's id, which is also the id other people
// book, so "is this booking for me" is a plain comparison.
export const getMyProvider = async (): Promise<ServiceProvider> => {
    const me = await call<{ account: { phone: string; name: string | null }; profile: { id: string; name: string } | null }>('/me');
    const sid = await call<any>('/me/skill-id');
    const s = sid.skill_id;
    const id = me.profile?.id ?? '';
    return {
        id,
        name: me.profile?.name ?? me.account.name ?? '',
        phone: me.account.phone,
        service: s?.tagline ?? '',
        avatarUrl: sid.me?.has_photo ? `${PLATFORM_URL}/professionals/${id}/photo` : '',
        coverImageUrl: '',
        rating: 0,
        distanceKm: 0,
        hourlyRate: s?.rate?.amount ?? 0,
        rateType: rateType(s?.rate?.per ?? ''),
        currency: 'KES',
        isVerified: sid.level === 'verified',
        about: s?.about ?? '',
        works: [],
        category: s?.category || 'OTHER',
        location: [s?.area, s?.county].filter(Boolean).join(', '),
        isOnline: false,
        accountType: 'individual',
        flagCount: 0,
        views: 0,
        cta: publicButtons(s?.buttons ?? []),
        skills: skillsOf(id, s?.skills ?? []),
    } as ServiceProvider;
};

// --- Bookings ---
interface PlatformBooking {
    id: string;
    role: 'client' | 'provider';
    providerId: string;
    providerName: string;
    providerService: string;
    providerAvatar: string;
    clientId: string;
    clientName: string;
    clientPhone: string;
    date: string;
    time: string;
    serviceTitle: string;
    notes: string;
    status: Booking['status'];
    paymentStatus: Booking['paymentStatus'];
    minBookingFee: number;
    paidDepositAmount: number;
    cancellationReason: string;
    cancelledBy: string;
    createdAt: string;
    updatedAt: string;
}

const asBooking = (b: PlatformBooking): Booking => ({
    id: b.id,
    role: b.role,
    providerId: b.providerId,
    providerName: b.providerName,
    providerAvatar: b.providerAvatar ? `${PLATFORM_URL}${b.providerAvatar}` : undefined,
    providerService: b.providerService,
    clientId: b.clientId,
    clientName: b.clientName,
    clientPhone: b.clientPhone,
    date: b.date,
    time: b.time,
    serviceTitle: b.serviceTitle,
    minBookingFee: b.minBookingFee,
    paidDepositAmount: b.paidDepositAmount,
    paymentStatus: b.paymentStatus,
    status: b.status,
    notes: b.notes,
    cancellationReason: b.cancellationReason || undefined,
    cancelledBy: (b.cancelledBy || undefined) as Booking['cancelledBy'],
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
});

// Both the bookings I asked for and the ones asked of me, each marked with its role.
export const listBookings = async (): Promise<Booking[]> => {
    const [mine, received] = await Promise.all([call<{ items: PlatformBooking[] }>('/me/bookings?side=mine'), call<{ items: PlatformBooking[] }>('/me/bookings?side=received')]);
    return [...mine.items, ...received.items].map(asBooking);
};

export const makeBooking = async (input: { providerId: string; date: string; time: string; serviceTitle?: string; notes?: string }): Promise<Booking> =>
    asBooking(await call<PlatformBooking>('/bookings', { method: 'POST', body: JSON.stringify({ professional_id: input.providerId, date: input.date, time: input.time, service_title: input.serviceTitle, notes: input.notes }) }));

export const changeBooking = async (id: string, action: 'confirm' | 'decline' | 'complete' | 'cancel' | 'reschedule', body: { reason?: string; date?: string; time?: string } = {}): Promise<Booking> =>
    asBooking(await call<PlatformBooking>(`/bookings/${encodeURIComponent(id)}/${action}`, { method: 'POST', body: JSON.stringify(body) }));
