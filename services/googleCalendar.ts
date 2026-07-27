import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    onAuthStateChanged, 
    signOut, 
    User 
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App if not already initialized
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Auth Provider with Calendar Events Scope
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuthListener = (
    onSuccess: (user: User, token: string) => void,
    onFailure: () => void
) => {
    return onAuthStateChanged(auth, async (user: User | null) => {
        if (user && cachedAccessToken) {
            onSuccess(user, cachedAccessToken);
        } else {
            if (!isSigningIn) {
                cachedAccessToken = null;
                onFailure();
            }
        }
    });
};

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string } | null> => {
    try {
        isSigningIn = true;
        const result = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (!credential?.accessToken) {
            throw new Error('Failed to obtain Google access token');
        }
        cachedAccessToken = credential.accessToken;
        return { user: result.user, accessToken: cachedAccessToken };
    } catch (error: any) {
        console.error('Google Sign-In Error:', error);
        throw error;
    } finally {
        isSigningIn = false;
    }
};

export const getCachedAccessToken = (): string | null => cachedAccessToken;

export const googleSignOut = async () => {
    await signOut(auth);
    cachedAccessToken = null;
};

export interface BookingCalendarPayload {
    serviceTitle: string;
    providerName: string;
    providerEmail?: string;
    userEmail: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    notes?: string;
    location?: string;
}

export interface CalendarEventResult {
    success: boolean;
    eventId?: string;
    htmlLink?: string;
    error?: string;
}

export const createGoogleCalendarEvent = async (
    accessToken: string,
    booking: BookingCalendarPayload
): Promise<CalendarEventResult> => {
    try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Nairobi';
        
        // Construct ISO start and end strings
        const startDateTimeStr = `${booking.date}T${booking.time}:00`;
        const startDate = new Date(startDateTimeStr);
        
        // Default duration: 1 hour
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        
        const formatIso = (d: Date) => d.toISOString();

        const eventData = {
            summary: `Booking: ${booking.serviceTitle} with ${booking.providerName}`,
            description: `Appointment confirmed via Nikosoko Marketplace.\nClient Email: ${booking.userEmail}\nProvider: ${booking.providerName}\nNotes: ${booking.notes || 'None'}`,
            start: {
                dateTime: formatIso(startDate),
                timeZone: timeZone
            },
            end: {
                dateTime: formatIso(endDate),
                timeZone: timeZone
            },
            location: booking.location || 'Nikosoko Appointment',
            attendees: [
                { email: booking.userEmail },
                ...(booking.providerEmail ? [{ email: booking.providerEmail }] : [])
            ],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'popup', minutes: 30 },
                    { method: 'email', minutes: 120 }
                ]
            }
        };

        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });

        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody.error?.message || `Google Calendar API returned status ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            eventId: data.id,
            htmlLink: data.htmlLink
        };
    } catch (err: any) {
        console.error('Failed to create calendar event:', err);
        return {
            success: false,
            error: err.message || 'Failed to connect to Google Calendar'
        };
    }
};
