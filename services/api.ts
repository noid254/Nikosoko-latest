
import { API_BASE_URL } from '../config';
import type { ServiceProvider, CatalogueItem, Document, QaRibuRequest, SpecialBanner, InboxMessage, Event, Premise, Gig, Ticket, UnitDetails, SetupData, UnitKey } from '../types';
import { mockProviders, SUPER_ADMIN_PROVIDER, mockCatalogueItems, mockDocuments, mockQaRibuRequests, mockSpecialBanners, mockInboxMessages, mockEvents, mockGigs, mockTickets, mockCategories, mockPremises } from './mockData';
import { saveUserProfileToFirestore, getUserProfileFromFirestore, getAllUserProfilesFromFirestore } from './firebase';

// --- Database Configuration (LocalStorage) ---
const DB_KEYS = {
    PROVIDERS: 'nikosoko_db_providers',
    CATALOGUE: 'nikosoko_db_catalogue',
    DOCUMENTS: 'nikosoko_db_documents',
    REQUESTS: 'nikosoko_db_requests',
    BANNERS: 'nikosoko_db_banners',
    MESSAGES: 'nikosoko_db_messages',
    GIGS: 'nikosoko_db_gigs',
    EVENTS: 'nikosoko_db_events',
    PREMISES: 'nikosoko_db_premises',
    TICKETS: 'nikosoko_db_tickets',
    CATEGORIES: 'nikosoko_db_categories'
};

// Initialize DB with seed data
const initDB = () => {
    if (typeof window === 'undefined') return;
    
    // Helper to seed if missing
    const seed = (key: string, data: any[]) => {
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(data));
        }
    };

    seed(DB_KEYS.PROVIDERS, mockProviders);
    seed(DB_KEYS.CATALOGUE, mockCatalogueItems);
    seed(DB_KEYS.DOCUMENTS, mockDocuments);
    seed(DB_KEYS.REQUESTS, mockQaRibuRequests);
    seed(DB_KEYS.BANNERS, mockSpecialBanners);
    seed(DB_KEYS.MESSAGES, mockInboxMessages);
    seed(DB_KEYS.GIGS, mockGigs);
    seed(DB_KEYS.EVENTS, mockEvents);
    seed(DB_KEYS.PREMISES, mockPremises);
    seed(DB_KEYS.TICKETS, mockTickets);
    seed(DB_KEYS.CATEGORIES, mockCategories);

    // Filter out old demo accounts to keep only Super Admin (or new user profiles created at runtime)
    try {
        const storedProviders: ServiceProvider[] = JSON.parse(localStorage.getItem(DB_KEYS.PROVIDERS) || '[]');
        const filteredProviders = storedProviders.filter(p => 
            p.id === SUPER_ADMIN_PROVIDER.id || 
            p.phone === '254723119356' || 
            p.phone === '0723119356' ||
            p.id.startsWith('user-') ||
            p.id.startsWith('custom-')
        );
        const saIndex = filteredProviders.findIndex(p => p.id === SUPER_ADMIN_PROVIDER.id || p.phone === '254723119356' || p.phone === '0723119356');
        if (saIndex === -1) {
            filteredProviders.unshift(SUPER_ADMIN_PROVIDER);
        } else {
            filteredProviders[saIndex] = {
                ...SUPER_ADMIN_PROVIDER,
                ...filteredProviders[saIndex],
                role: 'SuperAdmin',
                skills: SUPER_ADMIN_PROVIDER.skills,
                isVerified: true
            };
        }
        localStorage.setItem(DB_KEYS.PROVIDERS, JSON.stringify(filteredProviders));
    } catch (e) {
        localStorage.setItem(DB_KEYS.PROVIDERS, JSON.stringify([SUPER_ADMIN_PROVIDER]));
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

const delay = (ms: number = 300) => new Promise(res => setTimeout(res, ms));

// --- Auth Token Helpers ---
export const getToken = (): string | null => localStorage.getItem('authToken');
export const setToken = (token: string): void => localStorage.setItem('authToken', token);
export const clearToken = (): void => localStorage.removeItem('authToken');

// --- Auth API ---
export const sendOtp = async (phone: string): Promise<{ success: boolean }> => {
    await delay();
    return { success: true };
};

export interface VerifyOtpResponse {
    success: boolean;
    user: ServiceProvider | null;
    isSuperAdmin: boolean;
    token: string;
}

export const quickSuperAdminLogin = async (): Promise<VerifyOtpResponse> => {
    await delay(200);
    const providers = getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
    let saUser = providers.find(p => p.phone === '254723119356' || p.phone === '0723119356' || p.id === SUPER_ADMIN_PROVIDER.id);
    if (!saUser) saUser = SUPER_ADMIN_PROVIDER;

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
    await delay(400);
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

        const token = 'valid-token-for-254723119356';
        setToken(token);

        return {
            success: true,
            user: saUser,
            isSuperAdmin: true,
            token
        };
    }

    const providers = getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
    let existingUser = providers.find(p => {
        if (!p.phone) return false;
        const pClean = cleanNum(p.phone);
        return pClean === normPhone || (last9.length === 9 && pClean.endsWith(last9));
    });
    
    // Fetch latest profile from Firestore if available
    if (existingUser?.id) {
        const firestoreUser = await getUserProfileFromFirestore(existingUser.id);
        if (firestoreUser) {
            existingUser = { ...existingUser, ...firestoreUser };
            // Update local storage DB
            const index = providers.findIndex(p => p.id === existingUser!.id);
            if (index > -1) {
                providers[index] = existingUser;
                saveTable(DB_KEYS.PROVIDERS, providers);
            }
        }
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
    await delay(200);
    const token = getToken();
    if (token && token.startsWith('valid-token-for-')) {
        const phone = token.replace('valid-token-for-', '');
        const providers = getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.endsWith('723119356') || phone === '254723119356' || phone === '0723119356') {
            let sa = providers.find(p => p.phone === '254723119356' || p.phone === '0723119356') || SUPER_ADMIN_PROVIDER;
            const firestoreSa = await getUserProfileFromFirestore(sa.id);
            if (firestoreSa) {
                sa = { ...sa, ...firestoreSa };
            }
            return sa;
        }
        let user = providers.find(p => p.phone === phone || (phone.startsWith('0') && p.phone === '254' + phone.slice(1)));
        if (user) {
            const firestoreUser = await getUserProfileFromFirestore(user.id);
            if (firestoreUser) {
                user = { ...user, ...firestoreUser };
                const index = providers.findIndex(p => p.id === user!.id);
                if (index > -1) {
                    providers[index] = user;
                    saveTable(DB_KEYS.PROVIDERS, providers);
                }
            }
            return user;
        }
        throw new Error("User not found for token");
    }
    throw new Error("No valid token");
};

// --- Data Fetching (GET) ---
export const getProviders = async (): Promise<ServiceProvider[]> => {
    await delay();
    const localProviders = getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
    try {
        const firestoreProfiles = await getAllUserProfilesFromFirestore();
        if (firestoreProfiles.length > 0) {
            const mergedMap = new Map<string, ServiceProvider>();
            localProviders.forEach(p => mergedMap.set(p.id, p));
            firestoreProfiles.forEach(fp => {
                if (fp.id) {
                    const existing = mergedMap.get(fp.id);
                    mergedMap.set(fp.id, { ...(existing || {} as ServiceProvider), ...fp });
                }
            });
            const mergedList = Array.from(mergedMap.values());
            saveTable(DB_KEYS.PROVIDERS, mergedList);
            return mergedList;
        }
    } catch (e) {
        console.error("Error merging firestore providers:", e);
    }
    return localProviders;
};

export const getEvents = async (): Promise<Event[]> => {
    await delay();
    return getTable<Event>(DB_KEYS.EVENTS);
};

export const getGigs = async (): Promise<Gig[]> => {
    await delay();
    return getTable<Gig>(DB_KEYS.GIGS);
};

export const getCatalogueItems = async (): Promise<CatalogueItem[]> => {
    await delay();
    return getTable<CatalogueItem>(DB_KEYS.CATALOGUE);
};

export const getDocuments = async (): Promise<Document[]> => {
    await delay();
    return getTable<Document>(DB_KEYS.DOCUMENTS);
};

export const getQaRibuRequests = async (): Promise<QaRibuRequest[]> => {
    await delay();
    return getTable<QaRibuRequest>(DB_KEYS.REQUESTS);
};

export const getSpecialBanners = async (): Promise<SpecialBanner[]> => {
    await delay();
    return getTable<SpecialBanner>(DB_KEYS.BANNERS);
};

export const getInboxMessages = async (): Promise<InboxMessage[]> => {
    await delay();
    return getTable<InboxMessage>(DB_KEYS.MESSAGES);
};

export const addInboxMessage = async (messageData: Omit<InboxMessage, 'id'>): Promise<InboxMessage> => {
    await delay(100);
    const messages = getTable<InboxMessage>(DB_KEYS.MESSAGES);
    const newMessage: InboxMessage = {
        ...messageData,
        id: Date.now()
    };
    messages.unshift(newMessage);
    saveTable(DB_KEYS.MESSAGES, messages);
    return newMessage;
};

export const getCategories = async (): Promise<string[]> => {
    await delay();
    return getTable<string>(DB_KEYS.CATEGORIES);
};

export const getTickets = async (): Promise<Ticket[]> => {
    await delay();
    return getTable<Ticket>(DB_KEYS.TICKETS);
};

export const getPremises = async (): Promise<Premise[]> => {
    await delay();
    return getTable<Premise>(DB_KEYS.PREMISES);
};

// --- Data Creation (POST) ---
export const createProvider = async (providerData: Omit<ServiceProvider, 'id'>): Promise<ServiceProvider> => {
    await delay(500);
    const providers = getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
    const newProvider: ServiceProvider = {
        ...providerData,
        id: `sp_${Date.now()}`,
    };
    providers.push(newProvider);
    saveTable(DB_KEYS.PROVIDERS, providers);
    return newProvider;
};

export const addEvent = async (eventData: Omit<Event, 'id'>): Promise<Event> => {
    await delay();
    const events = getTable<Event>(DB_KEYS.EVENTS);
    const newEvent: Event = { ...eventData, id: `ev_${Date.now()}` };
    events.push(newEvent);
    saveTable(DB_KEYS.EVENTS, events);
    return newEvent;
};

export const createGig = async (gigData: Omit<Gig, 'id' | 'providerId'>): Promise<Gig> => {
    await delay();
    const gigs = getTable<Gig>(DB_KEYS.GIGS);
    const newGig: Gig = { ...gigData, id: `gig_${Date.now()}`, providerId: 'sa1' }; // Mock provider ID
    gigs.push(newGig);
    saveTable(DB_KEYS.GIGS, gigs);
    return newGig;
};
    
export const addDocument = async (docData: Omit<Document, 'id'>): Promise<Document> => {
    await delay();
    const docs = getTable<Document>(DB_KEYS.DOCUMENTS);
    const newDoc: Document = { ...docData, id: `doc_${Date.now()}` };
    docs.push(newDoc);
    saveTable(DB_KEYS.DOCUMENTS, docs);
    return newDoc;
};

export const createQaRibuRequest = async (requestData: Omit<QaRibuRequest, 'id' | 'status'>): Promise<QaRibuRequest> => {
    await delay();
    const requests = getTable<QaRibuRequest>(DB_KEYS.REQUESTS);
    const newRequest: QaRibuRequest = {
        ...requestData,
        id: `QRR_${Date.now()}`,
        status: 'Pending',
    };
    requests.push(newRequest);
    saveTable(DB_KEYS.REQUESTS, requests);
    return newRequest;
};
    
export const registerPremise = async (name: string, superhostId: string, details?: Partial<Premise>): Promise<Premise> => {
    await delay();
    const premises = getTable<Premise>(DB_KEYS.PREMISES);
    const newPremise: Premise = {
        id: `p_${Date.now()}`,
        name,
        buildingManagerId: superhostId,
        tenants: [],
        tagline: 'Pending Verification',
        logoUrl: '',
        bannerImageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800',
        about: details?.about || 'New Premise',
        location: details?.location || 'Nairobi',
        amenities: details?.amenities || [],
        contactEmail: '',
        contactPhone: '',
        vacancies: [],
        county: details?.county,
        town: details?.town,
        lrNumber: details?.lrNumber,
        type: details?.type,
        totalUnits: details?.totalUnits,
        verificationStatus: 'Pending',
    };
    premises.push(newPremise);
    saveTable(DB_KEYS.PREMISES, premises);
    return newPremise;
};

// --- Data Modification (PUT) ---
export const updateProvider = async (updatedProvider: ServiceProvider): Promise<ServiceProvider> => {
    await delay();
    if (updatedProvider.id) {
        await saveUserProfileToFirestore(updatedProvider.id, updatedProvider);
    }
    const providers = getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
    const index = providers.findIndex(p => p.id === updatedProvider.id);
    if (index > -1) {
        providers[index] = updatedProvider;
        saveTable(DB_KEYS.PROVIDERS, providers);
    } else {
        providers.push(updatedProvider);
        saveTable(DB_KEYS.PROVIDERS, providers);
    }
    return updatedProvider;
};

export const updateCatalogueItem = async (updatedItem: CatalogueItem): Promise<CatalogueItem> => {
    await delay();
    const items = getTable<CatalogueItem>(DB_KEYS.CATALOGUE);
    const index = items.findIndex(i => i.id === updatedItem.id);
    if (index > -1) {
        items[index] = updatedItem;
        saveTable(DB_KEYS.CATALOGUE, items);
    }
    return updatedItem;
};

export const deleteCatalogueItem = async (id: string): Promise<void> => {
    await delay();
    const items = getTable<CatalogueItem>(DB_KEYS.CATALOGUE);
    const filtered = items.filter(i => i.id !== id);
    saveTable(DB_KEYS.CATALOGUE, filtered);
};

export const updatePremise = async (updatedPremise: Premise): Promise<Premise> => {
    await delay();
    const premises = getTable<Premise>(DB_KEYS.PREMISES);
    const index = premises.findIndex(p => p.id === updatedPremise.id);
    if (index > -1) {
        premises[index] = updatedPremise;
        saveTable(DB_KEYS.PREMISES, premises);
    }
    return updatedPremise;
};

// Helper for linking roles
export const linkUserToRole = async (userId: string, setupData: SetupData, details?: UnitDetails): Promise<ServiceProvider> => {
    await delay();
    const providers = getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
    const premises = getTable<Premise>(DB_KEYS.PREMISES);
    
    const userIndex = providers.findIndex(p => p.id === userId);
    if (userIndex === -1) throw new Error("User not found");

    const user = providers[userIndex];
    user.role = setupData.role;
    user.premiseId = setupData.premiseId;

    if (setupData.role === 'TenantAdmin' || setupData.role === 'Staff') {
        user.unit = setupData.unitId;
    }

    if (details) {
        user.unitDetails = details;
    }

    // Co-host linking
    if (setupData.role === 'Staff' && setupData.adminId) {
        user.tenantId = setupData.adminId;
        const adminIndex = providers.findIndex(p => p.id === setupData.adminId);
        if (adminIndex > -1) {
            const admin = providers[adminIndex];
            if (!admin.coHosts) admin.coHosts = [];
            if (!admin.coHosts.includes(userId)) admin.coHosts.push(userId);
        }
    }
    
    // Update Premise Tenant List
    const premiseIndex = premises.findIndex(p => p.id === setupData.premiseId);
    if (premiseIndex > -1 && setupData.role === 'TenantAdmin') {
        const premise = premises[premiseIndex];
        if (!premise.tenants.includes(userId)) {
            premise.tenants.push(userId);
            saveTable(DB_KEYS.PREMISES, premises);
        }
    }

    saveTable(DB_KEYS.PROVIDERS, providers);
    return user;
};

export const revokeTenantAccess = async (userId: string, premiseId: string, vacancyDetails: any): Promise<void> => {
    await delay();
    const providers = getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
    const premises = getTable<Premise>(DB_KEYS.PREMISES);

    // 1. Update Premise
    const premiseIndex = premises.findIndex(p => p.id === premiseId);
    if (premiseIndex > -1) {
        const premise = premises[premiseIndex];
        premise.tenants = premise.tenants.filter(id => id !== userId);
        if (vacancyDetails) {
            premise.vacancies.push({
                id: `vac_${Date.now()}`,
                unitNumber: vacancyDetails.unitNumber,
                type: vacancyDetails.type,
                floor: vacancyDetails.floor || 'N/A',
                size: vacancyDetails.subtype,
                configuration: vacancyDetails.configuration,
                status: 'Vacant',
                rentAmount: vacancyDetails.price
            } as UnitKey); // Cast for flexibility
        }
        saveTable(DB_KEYS.PREMISES, premises);
    }

    // 2. Reset user
    const userIndex = providers.findIndex(p => p.id === userId);
    if (userIndex > -1) {
        const user = providers[userIndex];
        user.role = undefined;
        user.premiseId = undefined;
        user.unit = undefined;
        user.floor = undefined;
        user.unitDetails = undefined;
        user.coHosts = [];
        saveTable(DB_KEYS.PROVIDERS, providers);
    }
};

export const linkUserToUnit = (userId: string, premiseId: string, unitId: string, details?: UnitDetails): Promise<ServiceProvider> => 
    linkUserToRole(userId, { role: 'TenantAdmin', premiseId, unitId }, details);


export const updateDocument = async (updatedDoc: Document): Promise<Document> => {
    await delay();
    const docs = getTable<Document>(DB_KEYS.DOCUMENTS);
    const index = docs.findIndex(d => d.id === updatedDoc.id);
    if (index > -1) {
        docs[index] = updatedDoc;
        saveTable(DB_KEYS.DOCUMENTS, docs);
    }
    return updatedDoc;
};

export const updateQaRibuRequestStatus = async (requestId: string, status: QaRibuRequest['status']): Promise<QaRibuRequest> => {
    await delay();
    const requests = getTable<QaRibuRequest>(DB_KEYS.REQUESTS);
    const index = requests.findIndex(i => i.id === requestId);
    if (index > -1) {
        requests[index].status = status;
        saveTable(DB_KEYS.REQUESTS, requests);
        return requests[index];
    }
    throw new Error("Request not found");
};


export const initiateAssetTransfer = async (documentId: string, newOwnerPhone: string): Promise<Document> => {
    await delay();
    const docs = getTable<Document>(DB_KEYS.DOCUMENTS);
    const index = docs.findIndex(d => d.id === documentId);
    if (index > -1) {
        docs[index].pendingOwnerPhone = newOwnerPhone;
        saveTable(DB_KEYS.DOCUMENTS, docs);
        return docs[index];
    }
    throw new Error("Document not found");
};
    
export const finalizeAssetTransfer = async (documentId: string, decision: 'accept' | 'deny'): Promise<Document> => {
    await delay();
    const docs = getTable<Document>(DB_KEYS.DOCUMENTS);
    const index = docs.findIndex(d => d.id === documentId);
    if (index > -1 && docs[index].pendingOwnerPhone) {
        if (decision === 'accept') {
            docs[index].ownerPhone = docs[index].pendingOwnerPhone;
        }
        docs[index].pendingOwnerPhone = undefined;
        saveTable(DB_KEYS.DOCUMENTS, docs);
        return docs[index];
    }
    throw new Error("Document or transfer request not found");
};

// --- Data Deletion (DELETE) ---
export const deleteProvider = async (providerId: string): Promise<void> => {
    await delay();
    let providers = getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
    providers = providers.filter(p => p.id !== providerId);
    saveTable(DB_KEYS.PROVIDERS, providers);
};

// --- Search ---
export const searchAssetBySerialOrReg = async (identifier: string): Promise<Document | null> => {
    await delay();
    const docs = getTable<Document>(DB_KEYS.DOCUMENTS);
    const asset = docs.find(doc => doc.isAsset && (doc.registrationNumber === identifier || doc.items?.some(i => i.serial === identifier)));
    return asset || null;
};

// --- KRA / eTIMS Mock Integration ---
export const transmitInvoiceToEtims = (document: Omit<Document, 'id'>, senderPin: string): Promise<{ cuNumber: string; cuSerial: string; qrUrl: string; etimsDate: string }> =>
    new Promise(resolve => {
        console.log(`[MOCK eTIMS] Connecting to middleware with PIN: ${senderPin}...`);
        setTimeout(() => {
            const fakeCuSerial = `KRA${Math.floor(100000 + Math.random() * 900000)}Z`;
            const fakeCuNumber = `${document.number}-ETIMS-${Date.now().toString().slice(-4)}`;
            resolve({
                cuSerial: fakeCuSerial,
                cuNumber: fakeCuNumber,
                etimsDate: new Date().toISOString(),
                qrUrl: `https://etims.kra.go.ke/verify?cu=${fakeCuSerial}&id=${fakeCuNumber}&amt=${document.amount}`
            });
        }, 2000);
    });

// --- Gateman Verification Logic ---

const getDurationForPurpose = (purpose: string): string => {
    const p = purpose.toLowerCase();
    if (p.includes('delivery')) return '15 mins';
    if (p.includes('drop') || p.includes('pickup')) return '10 mins';
    if (p.includes('interview')) return '2 hours';
    if (p.includes('meeting')) return '2 hours';
    if (p.includes('maintenance') || p.includes('repair')) return '4 hours';
    return 'Standard Visit (4 hrs)';
};

export const verifyEntry = async (scanData: string, premiseId: string): Promise<{ allowed: boolean; message: string; request?: QaRibuRequest, user?: ServiceProvider, accessDetails?: { purpose: string, duration: string, role: string } }> => {
    await delay(400);
    const providers = getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
    const premises = getTable<Premise>(DB_KEYS.PREMISES);
    const requests = getTable<QaRibuRequest>(DB_KEYS.REQUESTS);

    let rawInput = scanData.trim();
    
    if (rawInput.startsWith('PROFILE:') || /^\d{9,12}$/.test(rawInput)) {
        let userId = rawInput.startsWith('PROFILE:') ? rawInput.split(':')[1] : '';
        let user: ServiceProvider | undefined;

        if (userId) {
            user = providers.find(p => p.id === userId);
        } else {
            const phoneQuery = rawInput.slice(-9); 
            user = providers.find(p => p.phone.endsWith(phoneQuery));
        }
        
        if (!user) {
            return { allowed: false, message: 'User not found in system.' };
        }

        const premise = premises.find(p => p.id === premiseId);
        const isTenant = premise?.tenants.includes(user.id);
        const activePass = requests.find(r => 
            r.visitorPhone === user!.phone && 
            r.premiseId === premiseId && 
            (r.status === 'Approved' || r.status === 'CheckedIn')
        );

        if (isTenant) {
            return { 
                allowed: true, 
                message: `Access Granted: Tenant`, 
                user,
                accessDetails: {
                    role: 'Resident/Owner',
                    purpose: 'Home',
                    duration: 'Unlimited'
                }
            };
        } else if (activePass) {
            return { 
                allowed: true, 
                message: `Access Granted: Guest`, 
                request: activePass, 
                user,
                accessDetails: {
                    role: 'Visitor',
                    purpose: activePass.visitorPurpose || 'Visit',
                    duration: getDurationForPurpose(activePass.visitorPurpose || '')
                }
            };
        } else {
            return { allowed: false, message: `Access Denied: No active pass found for ${user.name}`, user }; 
        }
    }

    if (rawInput.startsWith('QARIBU:') || /^\d{6}$/.test(rawInput)) {
        let request: QaRibuRequest | undefined;
        let code = '';

        if (rawInput.startsWith('QARIBU:')) {
            const parts = rawInput.split(':');
            if (parts.length < 3) {
                 return { allowed: false, message: 'Invalid Code Format.' };
            }
            const requestId = parts[1];
            code = parts[2];
            request = requests.find(r => r.id === requestId);
        } else {
            code = rawInput;
            request = requests.find(r => r.accessCode === code && r.premiseId === premiseId);
        }

        if (!request) {
            return { allowed: false, message: 'Invalid or Expired Pass.' };
        }
        if (request.premiseId !== premiseId) {
            return { allowed: false, message: 'Pass is for a different premise.' };
        }
        
        if (request.accessCode && request.accessCode !== code) {
            return { allowed: false, message: 'Invalid Access Code.' };
        }

        if (request.status === 'Approved' || request.status === 'CheckedIn') {
            return { 
                allowed: true, 
                message: `Access Granted: ${request.visitorName}`, 
                request,
                accessDetails: {
                    role: 'Visitor',
                    purpose: request.visitorPurpose || 'Visit',
                    duration: getDurationForPurpose(request.visitorPurpose || '')
                }
            };
        } else {
            return { allowed: false, message: `Access Denied. Status: ${request.status}`, request };
        }
    }

    return { allowed: false, message: 'Unknown Code Format.' };
};

export const sendShiftReport = (premiseId: string, stats: any): Promise<void> => 
    new Promise(resolve => {
        console.log(`[DB MOCK] Sending shift report email for premise ${premiseId}. Data:`, stats);
        setTimeout(resolve, 1500);
    });

// --- Security Staff Management ---
export const assignGateman = async (phone: string, premiseId: string): Promise<ServiceProvider> => {
    await delay();
    const providers = getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
    const user = providers.find(p => p.phone.endsWith(phone.slice(-9)));
    if (!user) throw new Error("User with this phone not found on NikoSoko.");
    
    user.role = 'Gateman';
    user.premiseId = premiseId;
    saveTable(DB_KEYS.PROVIDERS, providers);
    return user;
};

export const getSecurityStaff = async (premiseId: string): Promise<ServiceProvider[]> => {
    await delay();
    const providers = getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
    return providers.filter(p => p.role === 'Gateman' && p.premiseId === premiseId);
};

export const revokeSecurityAccess = async (userId: string): Promise<void> => {
    await delay();
    const providers = getTable<ServiceProvider>(DB_KEYS.PROVIDERS);
    const index = providers.findIndex(p => p.id === userId);
    if (index > -1) {
        providers[index].role = undefined;
        providers[index].premiseId = undefined;
        saveTable(DB_KEYS.PROVIDERS, providers);
    }
};
