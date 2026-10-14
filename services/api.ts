import { authFetch } from './authFetch';
export { authFetch };
import { API_BASE_URL } from '../config';
import type { ServiceProvider, CatalogueItem, Document, SpecialBanner, InboxMessage, Event, Gig, Ticket, SetupData, UnitDetails, LocationCheckInLog } from '../types';
import { mockProviders, SUPER_ADMIN_PROVIDER, mockCatalogueItems, mockDocuments, mockSpecialBanners, mockInboxMessages, mockEvents, mockGigs, mockTickets, mockCategories } from './mockData';
import { saveUserProfileToFirestore, getUserProfileFromFirestore, getAllUserProfilesFromFirestore } from './firebase';

// --- Database Configuration (LocalStorage & SQLite Mirror) ---
const DB_KEYS = {
    PROVIDERS: 'nikosoko_db_providers',
    PROFILES_INDEX: 'nikosoko_user_profiles_db', // Persistent index by phone/email/id
    CATALOGUE: 'nikosoko_db_catalogue',
    DOCUMENTS: 'nikosoko_db_documents',
    BANNERS: 'nikosoko_db_banners',
    MESSAGES: 'nikosoko_db_messages',
    GIGS: 'nikosoko_db_gigs',
    EVENTS: 'nikosoko_db_events',
    TICKETS: 'nikosoko_db_tickets',
    CATEGORIES: 'nikosoko_db_categories'
};

// Helper for persistent user profiles registry
const getPersistentProfilesIndex = (): Record<string, ServiceProvider> => {
    try {
        const item = localStorage.getItem(DB_KEYS.PROFILES_INDEX);
        return item ? JSON.parse(item) : {};
    } catch {
        return {};
    }
};

const saveToProfilesIndex = (provider: ServiceProvider) => {
    if (!provider || !provider.id) return;
    try {
        const index = getPersistentProfilesIndex();
        index[provider.id] = provider;
        if (provider.phone) {
            const cleanPhone = provider.phone.replace(/\D/g, '');
            if (cleanPhone) index[`phone_${cleanPhone}`] = provider;
        }
        localStorage.setItem(DB_KEYS.PROFILES_INDEX, JSON.stringify(index));
    } catch (e) {
        console.error('Failed to save to persistent profiles index:', e);
    }
};

// Initialize DB with seed data
const initDB = async () => {
    if (typeof window === 'undefined') return;
    
    // Seed helper
    const seed = (key: string, data: any[]) => {
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(data));
        }
    };

    seed(DB_KEYS.PROVIDERS, mockProviders);
    seed(DB_KEYS.CATALOGUE, mockCatalogueItems);
    seed(DB_KEYS.DOCUMENTS, mockDocuments);
    seed(DB_KEYS.BANNERS, mockSpecialBanners);
    seed(DB_KEYS.MESSAGES, mockInboxMessages);
    seed(DB_KEYS.GIGS, mockGigs);
    seed(DB_KEYS.EVENTS, mockEvents);
    seed(DB_KEYS.TICKETS, mockTickets);
    seed(DB_KEYS.CATEGORIES, mockCategories);

    // Merge persistent user profiles index into providers list so NO created profiles are ever lost
    try {
        const index = getPersistentProfilesIndex();
        const storedProviders: ServiceProvider[] = JSON.parse(localStorage.getItem(DB_KEYS.PROVIDERS) || '[]');
        const map = new Map<string, ServiceProvider>();
        
        // Add existing providers
        storedProviders.forEach(p => map.set(p.id, p));
        
        // Overlay index profiles
        Object.values(index).forEach(p => {
            if (p && p.id) map.set(p.id, p);
        });

        // Ensure super admin exists
        map.set(SUPER_ADMIN_PROVIDER.id, {
            ...SUPER_ADMIN_PROVIDER,
            ...map.get(SUPER_ADMIN_PROVIDER.id)
        });

        const unifiedList = Array.from(map.values());
        localStorage.setItem(DB_KEYS.PROVIDERS, JSON.stringify(unifiedList));
    } catch (e) {
        console.error('Error during initDB profile preservation:', e);
    }

    // Attempt sync with SQLite backend server
    try {
        const res = await authFetch('/api/providers');
        if (res.ok) {
            const sqliteProviders: ServiceProvider[] = await res.json();
            if (sqliteProviders && sqliteProviders.length > 0) {
                const local = getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
                const map = new Map<string, ServiceProvider>();
                local.forEach(p => map.set(p.id, p));
                sqliteProviders.forEach(p => {
                    map.set(p.id, p);
                    saveToProfilesIndex(p);
                });
                saveTable(DB_KEYS.PROVIDERS, Array.from(map.values()));
            }
        }
    } catch {
        // Fallback to local storage if API server starting up
    }
};

// Run initialization
initDB();

// --- Generic DB Helpers ---
const getTable = <T>(key: string): T[] => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : [];
    } catch (e) {
        console.error(`Error reading ${key} from DB`, e);
        return [];
    }
};

const saveTable = <T>(key: string, data: T[]) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Error saving ${key} to DB`, e);
    }
};

const delay = (ms: number = 200) => new Promise(res => setTimeout(res, ms));

// --- Auth Token Helpers ---
export const getToken = (): string | null => localStorage.getItem('authToken');
export const setToken = (token: string): void => localStorage.setItem('authToken', token);
export const clearToken = (): void => localStorage.removeItem('authToken');

// --- Auth API ---
// OTP codes are created and checked only on the server. The client never generates or validates one.
export const sendOtp = async (target: string): Promise<{ success: boolean; devCode?: string; message: string }> => {
    const cleanTarget = String(target).trim().toLowerCase();
    const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: cleanTarget })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error || 'Could not send the verification code. Please try again.');
    }
    return {
        success: true,
        // The server only returns this in local development when no SMS provider is configured.
        devCode: data.devCode,
        message: data.message || `Verification code sent to ${target}`
    };
};

export interface VerifyOtpResponse {
    success: boolean;
    user: ServiceProvider | null;
    isSuperAdmin: boolean;
    token: string;
}

export const verifyOtp = async (target: string, otp: string): Promise<VerifyOtpResponse> => {
    const cleanTarget = String(target).trim().toLowerCase();
    const trimmedOtp = String(otp || '').trim();
    if (trimmedOtp.length < 4) {
        throw new Error('Please enter a valid OTP verification code.');
    }

    const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: cleanTarget, code: trimmedOtp })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.token) {
        throw new Error(data.error || 'Incorrect OTP verification code. Please enter the valid code sent to your phone.');
    }

    const user: ServiceProvider | null = data.provider || null;
    if (user) saveToProfilesIndex(user);
    setToken(data.token);

    return {
        success: true,
        user,
        // Admin status comes from the server's record of the account, never from a phone number in the client.
        isSuperAdmin: user?.role === 'SuperAdmin',
        token: data.token
    };
};

export const getMyProfile = async (): Promise<ServiceProvider> => {
    if (!getToken()) throw new Error('Not signed in');
    const res = await authFetch('/api/auth/me');
    if (!res.ok) throw new Error('No valid session');
    const user: ServiceProvider = await res.json();
    saveToProfilesIndex(user);
    return user;
};

// --- Data Fetching (GET) ---
export const getProviders = async (): Promise<ServiceProvider[]> => {
    try {
        const res = await authFetch('/api/providers');
        if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
                data.forEach((p: ServiceProvider) => saveToProfilesIndex(p));
                saveTable(DB_KEYS.PROVIDERS, data);
                return data;
            }
        }
    } catch {
        // Fallback to local
    }
    return getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
};

export const getEvents = async (): Promise<Event[]> => {
    await delay(100);
    return getTable<Event>(DB_KEYS.EVENTS);
};

export const getGigs = async (): Promise<Gig[]> => {
    try {
        const res = await authFetch('/api/gigs');
        if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
                saveTable(DB_KEYS.GIGS, data);
                return data;
            }
        }
    } catch {
        // Fallback
    }
    return getTable<Gig>(DB_KEYS.GIGS);
};

export const getCatalogueItems = async (): Promise<CatalogueItem[]> => {
    try {
        const res = await authFetch('/api/catalogue');
        if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
                saveTable(DB_KEYS.CATALOGUE, data);
                return data;
            }
        }
    } catch {
        // Fallback
    }
    return getTable<CatalogueItem>(DB_KEYS.CATALOGUE);
};

export const getDocuments = async (): Promise<Document[]> => {
    await delay(100);
    return getTable<Document>(DB_KEYS.DOCUMENTS);
};

export const getSpecialBanners = async (): Promise<SpecialBanner[]> => {
    try {
        const res = await authFetch('/api/banners');
        if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
                saveTable(DB_KEYS.BANNERS, data);
                return data;
            }
        }
    } catch {
        // Fallback
    }
    return getTable<SpecialBanner>(DB_KEYS.BANNERS);
};

export const getInboxMessages = async (): Promise<InboxMessage[]> => {
    try {
        const res = await authFetch('/api/messages');
        if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
                saveTable(DB_KEYS.MESSAGES, data);
                return data;
            }
        }
    } catch {
        // Fallback
    }
    return getTable<InboxMessage>(DB_KEYS.MESSAGES);
};

export const addInboxMessage = async (messageData: Omit<InboxMessage, 'id'>): Promise<InboxMessage> => {
    const newMessage: InboxMessage = {
        ...messageData,
        id: Date.now() * 1000 + Math.floor(Math.random() * 1000)
    };
    
    try {
        await authFetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMessage)
        });
    } catch {
        // Local fallback
    }

    const messages = getTable<InboxMessage>(DB_KEYS.MESSAGES);
    messages.unshift(newMessage);
    saveTable(DB_KEYS.MESSAGES, messages);
    return newMessage;
};

export const getCategories = async (): Promise<string[]> => {
    await delay(100);
    return getTable<string>(DB_KEYS.CATEGORIES);
};

export const getTickets = async (): Promise<Ticket[]> => {
    await delay(100);
    return getTable<Ticket>(DB_KEYS.TICKETS);
};

// --- Data Creation (POST) ---
export const createProvider = async (providerData: Omit<ServiceProvider, 'id'>): Promise<ServiceProvider> => {
    const newProvider: ServiceProvider = {
        ...providerData,
        id: `sp_${Date.now()}`,
    };

    saveToProfilesIndex(newProvider);

    try {
        await authFetch('/api/providers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProvider)
        });
    } catch {
        // Fallback
    }

    const providers = getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
    providers.push(newProvider);
    saveTable(DB_KEYS.PROVIDERS, providers);
    return newProvider;
};

export const addEvent = async (eventData: Omit<Event, 'id'>): Promise<Event> => {
    await delay(100);
    const events = getTable<Event>(DB_KEYS.EVENTS);
    const newEvent: Event = { ...eventData, id: `ev_${Date.now()}` };
    events.push(newEvent);
    saveTable(DB_KEYS.EVENTS, events);
    return newEvent;
};

export const createGig = async (gigData: Omit<Gig, 'id' | 'providerId'>): Promise<Gig> => {
    const newGig: Gig = { ...gigData, id: `gig_${Date.now()}`, providerId: 'pro-001' };
    try {
        await authFetch('/api/gigs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newGig)
        });
    } catch {
        // Fallback
    }

    const gigs = getTable<Gig>(DB_KEYS.GIGS);
    gigs.unshift(newGig);
    saveTable(DB_KEYS.GIGS, gigs);
    return newGig;
};
    
export const addDocument = async (docData: Omit<Document, 'id'>): Promise<Document> => {
    await delay(100);
    const docs = getTable<Document>(DB_KEYS.DOCUMENTS);
    const newDoc: Document = { ...docData, id: `doc_${Date.now()}` };
    docs.push(newDoc);
    saveTable(DB_KEYS.DOCUMENTS, docs);
    return newDoc;
};

export const updateDocument = async (updatedDoc: Document): Promise<Document> => {
    await delay(100);
    const docs = getTable<Document>(DB_KEYS.DOCUMENTS);
    const index = docs.findIndex(d => d.id === updatedDoc.id);
    if (index !== -1) {
        docs[index] = updatedDoc;
        saveTable(DB_KEYS.DOCUMENTS, docs);
    }
    return updatedDoc;
};

export const searchAssetBySerialOrReg = async (identifier: string): Promise<Document | null> => {
    await delay(100);
    const docs = getTable<Document>(DB_KEYS.DOCUMENTS);
    const match = docs.find(d => {
        const docAny = d as any;
        return (docAny.serialNumber && docAny.serialNumber.toLowerCase() === identifier.toLowerCase()) ||
               (docAny.registrationNumber && docAny.registrationNumber.toLowerCase() === identifier.toLowerCase()) ||
               d.id === identifier;
    });
    return match || null;
};

// --- Data Modification (PUT) ---
export const updateProvider = async (updatedProvider: ServiceProvider): Promise<ServiceProvider> => {
    saveToProfilesIndex(updatedProvider);

    try {
        await authFetch(`/api/providers/${updatedProvider.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProvider)
        });
    } catch {
        // Fallback
    }

    if (updatedProvider.id) {
        await saveUserProfileToFirestore(updatedProvider.id, updatedProvider).catch(() => {});
    }

    const providers = getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
    const index = providers.findIndex(p => p.id === updatedProvider.id);
    if (index > -1) {
        providers[index] = updatedProvider;
    } else {
        providers.push(updatedProvider);
    }
    saveTable(DB_KEYS.PROVIDERS, providers);
    return updatedProvider;
};

export const updateCatalogueItem = async (updatedItem: CatalogueItem): Promise<CatalogueItem> => {
    try {
        await authFetch('/api/catalogue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedItem)
        });
    } catch {
        // Fallback
    }

    const items = getTable<CatalogueItem>(DB_KEYS.CATALOGUE);
    const index = items.findIndex(i => i.id === updatedItem.id);
    if (index > -1) {
        items[index] = updatedItem;
        saveTable(DB_KEYS.CATALOGUE, items);
    }
    return updatedItem;
};
export const addCatalogueItem = async (newItem: CatalogueItem): Promise<CatalogueItem> => {
    try {
        await authFetch('/api/catalogue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem)
        });
    } catch (e) {
        console.error('Failed to save catalogue item to server:', e);
    }
    const items = getTable<CatalogueItem>(DB_KEYS.CATALOGUE);
    const index = items.findIndex(i => i.id === newItem.id);
    if (index > -1) {
        items[index] = newItem;
    } else {
        items.unshift(newItem);
    }
    saveTable(DB_KEYS.CATALOGUE, items);
    return newItem;
};

export const deleteCatalogueItem = async (id: string): Promise<void> => {
    try {
        await authFetch(`/api/catalogue/${id}`, { method: 'DELETE' });
    } catch {
        // Fallback
    }
    const items = getTable<CatalogueItem>(DB_KEYS.CATALOGUE);
    const filtered = items.filter(i => i.id !== id);
    saveTable(DB_KEYS.CATALOGUE, filtered);
};

export const deleteProvider = async (id: string): Promise<void> => {
    try {
        await authFetch(`/api/providers/${id}`, { method: 'DELETE' });
    } catch {
        // Fallback
    }
    const providers = getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
    const filtered = providers.filter(p => p.id !== id);
    saveTable(DB_KEYS.PROVIDERS, filtered);
};

// --- Location Check-in & Distance API Services ---

export const recordLocationCheckIn = async (data: Partial<LocationCheckInLog> & { providerId?: string }): Promise<{ success: boolean; log: LocationCheckInLog; resolvedCoords?: any }> => {
    try {
        const res = await authFetch('/api/locations/checkin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            return await res.json();
        }
    } catch (e) {
        console.warn('API recordLocationCheckIn failed, logging locally:', e);
    }

    const fallbackLog: LocationCheckInLog = {
        id: `chk_${Date.now()}`,
        userId: data.userId || data.providerId || 'guest',
        userName: data.userName || 'User',
        userPhone: data.userPhone || '',
        userRole: data.userRole || 'Member',
        locationName: data.locationName || 'Ruaka, Kiambu County',
        estateName: data.estateName || 'Ruaka',
        county: data.county || 'Kiambu County',
        latitude: data.latitude || -1.2065,
        longitude: data.longitude || 36.7767,
        accuracyMeters: data.accuracyMeters || 10,
        checkInType: data.checkInType || 'manual_update',
        timestamp: new Date().toISOString(),
        isActive: true
    };
    return { success: true, log: fallbackLog };
};

export const getLocationCheckInLogs = async (query?: { userId?: string; location?: string; limit?: number }): Promise<LocationCheckInLog[]> => {
    try {
        const params = new URLSearchParams();
        if (query?.userId) params.append('userId', query.userId);
        if (query?.location) params.append('location', query.location);
        if (query?.limit) params.append('limit', String(query.limit));

        const res = await authFetch(`/api/locations/logs?${params.toString()}`);
        if (res.ok) {
            return await res.json();
        }
    } catch (e) {
        console.warn('API getLocationCheckInLogs failed:', e);
    }
    return [];
};

export const getCalculatedDistance = async (
    from: string,
    to: string,
    lat1?: number,
    lon1?: number,
    lat2?: number,
    lon2?: number
): Promise<{ distanceKm: number; formattedText: string; from: any; to: any }> => {
    try {
        const params = new URLSearchParams({ from, to });
        if (lat1 !== undefined) params.append('lat1', String(lat1));
        if (lon1 !== undefined) params.append('lon1', String(lon1));
        if (lat2 !== undefined) params.append('lat2', String(lat2));
        if (lon2 !== undefined) params.append('lon2', String(lon2));

        const res = await authFetch(`/api/locations/distance?${params.toString()}`);
        if (res.ok) {
            return await res.json();
        }
    } catch (e) {
        console.warn('API getCalculatedDistance failed:', e);
    }
    return {
        distanceKm: 0,
        formattedText: '0 km away',
        from: { location: from },
        to: { location: to }
    };
};

