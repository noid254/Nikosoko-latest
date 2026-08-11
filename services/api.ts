import { API_BASE_URL } from '../config';
import type { ServiceProvider, CatalogueItem, Document, SpecialBanner, InboxMessage, Event, Gig, Ticket, SetupData, UnitDetails } from '../types';
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
        const res = await fetch('/api/providers');
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
export const sendOtp = async (phone: string): Promise<{ success: boolean }> => {
    await delay(100);
    return { success: true };
};

export interface VerifyOtpResponse {
    success: boolean;
    user: ServiceProvider | null;
    isSuperAdmin: boolean;
    token: string;
}

export const quickSuperAdminLogin = async (): Promise<VerifyOtpResponse> => {
    await delay(100);
    const providers = getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
    let saUser = providers.find(p => p.phone === '254723119356' || p.phone === '0723119356' || p.id === SUPER_ADMIN_PROVIDER.id);
    if (!saUser) saUser = SUPER_ADMIN_PROVIDER;

    saveToProfilesIndex(saUser);

    const token = 'valid-token-for-254723119356';
    setToken(token);

    return {
        success: true,
        user: saUser,
        isSuperAdmin: true,
        token
    };
};

export const verifyOtp = async (phone: string, otp: string): Promise<VerifyOtpResponse> => {
    await delay(200);
    const cleanNum = (p: string) => (p ? p.replace(/\D/g, '') : '');
    const normPhone = cleanNum(phone);
    const last9 = normPhone.slice(-9);

    if (!otp || otp.trim().length < 4) {
        throw new Error('Please enter a valid 4-digit verification OTP code.');
    }

    const isSuperAdminPhone = normPhone === '254723119356' || normPhone === '0723119356' || last9 === '723119356';

    if (isSuperAdminPhone) {
        const providers = getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
        let saUser = providers.find(p => p.phone === '254723119356' || p.phone === '0723119356' || p.id === SUPER_ADMIN_PROVIDER.id);
        if (!saUser) saUser = SUPER_ADMIN_PROVIDER;

        saveToProfilesIndex(saUser);
        const token = 'valid-token-for-254723119356';
        setToken(token);

        return {
            success: true,
            user: saUser,
            isSuperAdmin: true,
            token
        };
    }

    // 1. Check SQLite backend server for registered profile
    let existingUser: ServiceProvider | null = null;
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, email: phone })
        });
        if (res.ok) {
            const data = await res.json();
            if (data.provider) {
                existingUser = data.provider;
            }
        }
    } catch (e) {
        // Fallback to local index
    }

    // 2. Fallback to local persistent index or localStorage table
    if (!existingUser) {
        const index = getPersistentProfilesIndex();
        if (index[`phone_${normPhone}`]) {
            existingUser = index[`phone_${normPhone}`];
        } else if (index[`phone_${last9}`]) {
            existingUser = index[`phone_${last9}`];
        }
    }

    if (!existingUser) {
        const providers = getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
        existingUser = providers.find(p => {
            if (!p.phone) return false;
            const pClean = cleanNum(p.phone);
            return pClean === normPhone || (last9.length === 9 && pClean.endsWith(last9));
        }) || null;
    }

    if (existingUser) {
        saveToProfilesIndex(existingUser);
    }

    const token = 'valid-token-for-' + (existingUser?.phone || phone);
    setToken(token);

    return {
        success: true,
        user: existingUser || null,
        isSuperAdmin: false,
        token
    };
};

export const getMyProfile = async (): Promise<ServiceProvider> => {
    await delay(100);
    const token = getToken();
    if (token && token.startsWith('valid-token-for-')) {
        const phone = token.replace('valid-token-for-', '');
        const normPhone = phone.replace(/\D/g, '');
        const index = getPersistentProfilesIndex();
        
        if (index[`phone_${normPhone}`]) {
            return index[`phone_${normPhone}`];
        }

        const providers = getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
        if (normPhone.endsWith('723119356') || phone === '254723119356' || phone === '0723119356') {
            return providers.find(p => p.phone === '254723119356' || p.phone === '0723119356') || SUPER_ADMIN_PROVIDER;
        }

        const user = providers.find(p => p.phone && p.phone.replace(/\D/g, '').endsWith(normPhone.slice(-9)));
        if (user) {
            saveToProfilesIndex(user);
            return user;
        }
    }
    throw new Error("No valid token or profile");
};

// --- Data Fetching (GET) ---
export const getProviders = async (): Promise<ServiceProvider[]> => {
    try {
        const res = await fetch('/api/providers');
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
        const res = await fetch('/api/gigs');
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
        const res = await fetch('/api/catalogue');
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
        const res = await fetch('/api/banners');
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
        const res = await fetch('/api/messages');
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
        await fetch('/api/messages', {
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
        await fetch('/api/providers', {
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
        await fetch('/api/gigs', {
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
        await fetch(`/api/providers/${updatedProvider.id}`, {
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
        await fetch('/api/catalogue', {
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

export const deleteCatalogueItem = async (id: string): Promise<void> => {
    try {
        await fetch(`/api/catalogue/${id}`, { method: 'DELETE' });
    } catch {
        // Fallback
    }
    const items = getTable<CatalogueItem>(DB_KEYS.CATALOGUE);
    const filtered = items.filter(i => i.id !== id);
    saveTable(DB_KEYS.CATALOGUE, filtered);
};

export const deleteProvider = async (id: string): Promise<void> => {
    try {
        await fetch(`/api/providers/${id}`, { method: 'DELETE' });
    } catch {
        // Fallback
    }
    const providers = getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
    const filtered = providers.filter(p => p.id !== id);
    saveTable(DB_KEYS.PROVIDERS, filtered);
};
