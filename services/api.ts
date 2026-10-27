import type { ServiceProvider, CatalogueItem, Document, InboxMessage, LocationCheckInLog, HeroBanner } from '../types';
import { mockProviders, SUPER_ADMIN_PROVIDER, mockCatalogueItems, mockDocuments, mockInboxMessages } from './mockData';
import { USE_PLATFORM } from './backend';
import * as platform from './platform';
import { saveUserProfileToFirestore } from './firebase';

// --- Database Configuration (LocalStorage & SQLite Mirror) ---
const DB_KEYS = {
    PROVIDERS: 'nikosoko_db_providers',
    PROFILES_INDEX: 'nikosoko_user_profiles_db', // Persistent index by phone/email/id
    CATALOGUE: 'nikosoko_db_catalogue',
    DOCUMENTS: 'nikosoko_db_documents',
    MESSAGES: 'nikosoko_db_messages'
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
    seed(DB_KEYS.MESSAGES, mockInboxMessages);

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

// --- Auth API & Active OTP Store ---
const activeOtpStore = new Map<string, { code: string; expiresAt: number }>();

export const sendOtp = async (target: string): Promise<{ success: boolean; devCode: string; message: string }> => {
    if (USE_PLATFORM) {
        // The server issues and checks the code; nothing about it is known here.
        await platform.requestCode(target);
        return { success: true, devCode: '', message: `A sign-in code was sent to ${target} if it can sign in.` };
    }
    await delay(150);
    const cleanTarget = String(target).trim().toLowerCase();
    const cleanNum = cleanTarget.replace(/\D/g, '');
    const last9 = cleanNum.slice(-9);
    const isSuperAdminPhone = last9 === '723119356' || cleanTarget === 'noid254@gmail.com' || cleanTarget === 'admin@nikosoko.com';

    // Generate 6-digit OTP code (or 3232 for superadmin default)
    const devCode = isSuperAdminPhone ? '3232' : Math.floor(100000 + Math.random() * 900000).toString();
    activeOtpStore.set(cleanTarget, {
        code: devCode,
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes expiry
    });

    try {
        await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: cleanTarget })
        });
    } catch {
        // Fallback
    }

    return {
        success: true,
        devCode: isSuperAdminPhone ? '3232' : devCode,
        message: `OTP verification code dispatched to ${target}`
    };
};

export interface VerifyOtpResponse {
    success: boolean;
    user: ServiceProvider | null;
    isSuperAdmin: boolean;
    token: string;
}

export const verifyOtp = async (target: string, otp: string): Promise<VerifyOtpResponse> => {
    if (USE_PLATFORM) {
        const { token } = await platform.verifyCode(target, otp.trim());
        setToken(token);
        return { success: true, user: await platform.getMyProvider(), isSuperAdmin: false, token };
    }
    await delay(200);
    const cleanTarget = String(target).trim().toLowerCase();
    const cleanNum = (p: string) => (p ? p.replace(/\D/g, '') : '');
    const normPhone = cleanNum(cleanTarget);
    const last9 = normPhone.slice(-9);

    if (!otp || otp.trim().length < 4) {
        throw new Error('Please enter a valid OTP verification code.');
    }

    const trimmedOtp = otp.trim();

    // Check if target is SuperAdmin phone
    const isSuperAdminPhone = normPhone === '254723119356' || normPhone === '0723119356' || last9 === '723119356' || cleanTarget === 'noid254@gmail.com' || cleanTarget === 'admin@nikosoko.com';

    if (isSuperAdminPhone) {
        const storedOtp = activeOtpStore.get(cleanTarget);
        const isSaCodeValid = trimmedOtp === '3232' || (storedOtp && storedOtp.code === trimmedOtp);
        if (!isSaCodeValid) {
            throw new Error('Incorrect code for Super Admin. Default code is 3232.');
        }

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

    // Verify OTP against active store & backend
    const storedOtp = activeOtpStore.get(cleanTarget);
    const isLocalValid = storedOtp && storedOtp.code === trimmedOtp && Date.now() < storedOtp.expiresAt;

    let backendOk = false;
    let existingUser: ServiceProvider | null = null;

    try {
        const res = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: cleanTarget, code: trimmedOtp })
        });
        if (res.ok) {
            backendOk = true;
            const data = await res.json();
            if (data.provider) {
                existingUser = data.provider;
            }
        }
    } catch {
        // Fallback
    }

    if (!isLocalValid && !backendOk) {
        throw new Error('Incorrect OTP verification code. Please enter the valid code sent to your phone.');
    }

    // Clear used OTP
    activeOtpStore.delete(cleanTarget);

    // 2. Fallback to local persistent index or localStorage table
    if (!existingUser) {
        const index = getPersistentProfilesIndex();
        if (index[cleanTarget] || index[`phone_${normPhone}`] || index[`phone_${last9}`]) {
            existingUser = index[cleanTarget] || index[`phone_${normPhone}`] || index[`phone_${last9}`];
        }
    }

    if (!existingUser) {
        const providers = getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
        existingUser = providers.find(p => {
            if (p.email && p.email.toLowerCase() === cleanTarget) return true;
            if (!p.phone) return false;
            const pClean = cleanNum(p.phone);
            return pClean === normPhone || (last9.length === 9 && pClean.endsWith(last9));
        }) || null;
    }

    if (existingUser) {
        saveToProfilesIndex(existingUser);
    }

    const token = 'valid-token-for-' + (existingUser?.phone || existingUser?.email || cleanTarget);
    setToken(token);

    return {
        success: true,
        user: existingUser || null,
        isSuperAdmin: false,
        token
    };
};

export const getMyProfile = async (): Promise<ServiceProvider> => {
    if (USE_PLATFORM) return platform.getMyProvider();
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
    if (USE_PLATFORM) return platform.getProfessionals().catch(() => []);
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

// --- Hero banners ---
export const getHeroBanners = async (all = false): Promise<HeroBanner[]> => {
    try {
        const res = await fetch(all ? '/api/banners/all' : '/api/banners');
        return res.ok ? await res.json() : [];
    } catch { return []; }
};
export const saveHeroBanner = async (b: Partial<HeroBanner>): Promise<boolean> => {
    try {
        const res = await fetch('/api/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
        return res.ok;
    } catch { return false; }
};
export const deleteHeroBanner = async (id: string): Promise<boolean> => {
    try { return (await fetch(`/api/banners/${id}`, { method: 'DELETE' })).ok; } catch { return false; }
};

// --- Ratings ---
// Averages are computed on the server from real ratings; the client never calculates them.
export const submitRating = async (
    providerId: string, rating: number, comment: string, userId?: string
): Promise<{ rating: number; reviewsCount: number } | { error: string } | null> => {
    // Only OTP-verified users (who have a user id) can rate.
    if (!userId) return { error: 'Verify your phone number to rate.' };
    try {
        const res = await fetch('/api/ratings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ providerId, rating, comment, raterKey: userId })
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) return { error: data?.error || 'Your rating was not saved.' };
        return data;
    } catch {
        return null;
    }
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
export const addCatalogueItem = async (newItem: CatalogueItem): Promise<CatalogueItem> => {
    try {
        await fetch('/api/catalogue', {
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

// --- Location Check-in & Distance API Services ---

export const recordLocationCheckIn = async (data: Partial<LocationCheckInLog> & { providerId?: string }): Promise<{ success: boolean; log: LocationCheckInLog; resolvedCoords?: any }> => {
    try {
        const res = await fetch('/api/locations/checkin', {
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
