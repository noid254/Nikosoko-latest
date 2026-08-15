import React, { useState, useEffect } from 'react';
import type { ServiceProvider, Booking, CurrentPage } from '../types';
import { 
    auth, 
    signInWithGoogle, 
    getCachedAccessToken, 
    checkGoogleCalendarAvailability, 
    deleteGoogleCalendarEvent,
    googleSignOut 
} from '../services/googleCalendar';
import { User } from 'firebase/auth';

interface BookingsViewProps {
    currentUser: ServiceProvider | null;
    providers: ServiceProvider[];
    onBack: () => void;
    onNavigate: (page: CurrentPage) => void;
    onSelectProvider: (provider: ServiceProvider) => void;
    onUpdateCurrentUser?: (updated: ServiceProvider) => void;
}

const CalendarIcon = () => (
    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const PhoneIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const WhatsAppIcon = () => (
    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.983.536 1.776.815 2.796.815 3.18 0 5.767-2.587 5.767-5.766.001-3.18-2.586-5.767-5.767-5.767zm3.393 8.163c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.158-.535-1.871-.777-3.078-2.687-3.172-2.812-.092-.124-.757-.999-.757-1.905s.475-1.353.644-1.539c.169-.187.369-.234.493-.234.124 0 .248.001.356.006.113.005.265-.043.415.319.155.374.529 1.29.575 1.384.046.094.077.204.015.328-.061.124-.092.202-.183.309-.092.108-.194.241-.277.324-.093.093-.19.195-.082.381.109.186.483.797 1.036 1.289.711.633 1.31.829 1.496.922.186.093.295.078.404-.047.108-.124.464-.541.588-.727.124-.186.248-.155.418-.093.17.062 1.08.51 1.266.603.186.093.309.14.355.217.046.077.046.449-.098.854z" />
    </svg>
);

const MpesaBadge = () => (
    <span className="font-extrabold text-[9px] tracking-wider text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded border border-emerald-300">
        M-PESA
    </span>
);

const CANCELLATION_REASONS = [
    'Schedule Conflict / Change of Time',
    'Service No Longer Needed',
    'Emergency / Urgent Personal Matter',
    'Incorrect Date or Details Selected',
    'Provider or Client Unavailable',
    'Other Reason'
];

export const BookingsView: React.FC<BookingsViewProps> = ({
    currentUser,
    providers,
    onBack,
    onNavigate,
    onSelectProvider,
    onUpdateCurrentUser
}) => {
    const [activeTab, setActiveTab] = useState<'my_bookings' | 'received_bookings' | 'calendar_sync'>('my_bookings');
    const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'>('all');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [googleUser, setGoogleUser] = useState<User | null>(auth.currentUser);
    const [accessToken, setAccessToken] = useState<string | null>(getCachedAccessToken());
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    
    // Cancellation Modal State
    const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
    const [selectedCancelReason, setSelectedCancelReason] = useState(CANCELLATION_REASONS[0]);
    const [customCancelNote, setCustomCancelNote] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    // Calendar check state
    const [checkDate, setCheckDate] = useState(new Date().toISOString().split('T')[0]);
    const [calendarEvents, setCalendarEvents] = useState<{ title: string; start: string; end: string }[]>([]);
    const [isCheckingCal, setIsCheckingCal] = useState(false);

    // Provider custom deposit setting
    const [customDeposit, setCustomDeposit] = useState(
        currentUser?.minBookingDeposit ? String(currentUser.minBookingDeposit) : '500'
    );
    const [depositSavedNotice, setDepositSavedNotice] = useState(false);

    // Load bookings from SQLite backend and local cache
    const loadBookings = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/bookings');
            const contentType = res.headers.get('content-type');
            if (res.ok && contentType && contentType.includes('application/json')) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setBookings(data);
                    return;
                }
            }
        } catch (e) {
            console.warn('API bookings load fallback:', e);
        }

        // Fallback to local storage
        try {
            const cached = JSON.parse(localStorage.getItem('nikosoko_db_bookings') || '[]');
            if (Array.isArray(cached) && cached.length > 0) {
                setBookings(cached);
            } else {
                // Seed initial realistic bookings for demonstration (Confirmed + Pending Request)
                const seedBookings: Booking[] = [
                    {
                        id: 'seed-book-01',
                        providerId: 'pro-001',
                        providerName: 'Kamau Electrics & Solar',
                        providerPhone: '0712345678',
                        providerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300',
                        providerService: 'Licensed Electrical Wiring & Solar Installation',
                        clientId: currentUser?.id || 'client-demo',
                        clientName: currentUser?.name || 'Jane Wanjiku',
                        clientEmail: currentUser?.email || 'wanjiku.jane@gmail.com',
                        clientPhone: currentUser?.phone || '0722000000',
                        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                        time: '11:00',
                        serviceTitle: 'Solar Inverter Inspection & Domestic Wiring',
                        estimatedFee: 1500,
                        minBookingFee: 500,
                        paidDepositAmount: 500,
                        mpesaReceiptNumber: 'SHK892X019',
                        mpesaPhoneNumber: '0722000000',
                        paymentStatus: 'Paid',
                        status: 'Confirmed',
                        location: 'Westlands, Nairobi',
                        notes: 'Check backup inverter circuit breaker trips.',
                        isCalendarSynced: true,
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: 'seed-book-02',
                        providerId: currentUser?.id || 'pro-002',
                        providerName: currentUser?.name || 'Mama Ouma Plumbing Services',
                        providerPhone: currentUser?.phone || '0722987654',
                        providerAvatar: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300',
                        providerService: 'Pipe Repair & Water Heater Maintenance',
                        clientId: 'client-009',
                        clientName: 'David Kiprono',
                        clientEmail: 'dkiprono@yahoo.com',
                        clientPhone: '0711998877',
                        date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
                        time: '14:30',
                        serviceTitle: 'Instant Shower Installation & Leak Check',
                        estimatedFee: 1200,
                        minBookingFee: 400,
                        paidDepositAmount: 400,
                        mpesaReceiptNumber: 'SHM441Z890',
                        mpesaPhoneNumber: '0711998877',
                        paymentStatus: 'Paid',
                        status: 'Pending',
                        location: 'Kilimani, Nairobi (Near Yaya Centre)',
                        notes: 'Water pressure is low and instant shower needs wiring & testing.',
                        isCalendarSynced: false,
                        createdAt: new Date().toISOString()
                    }
                ];
                setBookings(seedBookings);
                localStorage.setItem('nikosoko_db_bookings', JSON.stringify(seedBookings));
            }
        } catch (e) {
            console.error('Error loading local bookings:', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();

        const unsubscribe = auth.onAuthStateChanged((user) => {
            setGoogleUser(user);
            setAccessToken(getCachedAccessToken());
        });
        return () => unsubscribe();
    }, []);

    // Check calendar availability when date changes in Calendar tab
    useEffect(() => {
        const fetchDaySchedule = async () => {
            if (!accessToken || !checkDate) return;
            setIsCheckingCal(true);
            try {
                const res = await checkGoogleCalendarAvailability(accessToken, checkDate);
                if (res.success) {
                    setCalendarEvents(res.busyEvents);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsCheckingCal(false);
            }
        };

        if (activeTab === 'calendar_sync') {
            fetchDaySchedule();
        }
    }, [checkDate, accessToken, activeTab]);

    const handleGoogleAuth = async () => {
        setIsAuthenticating(true);
        try {
            const res = await signInWithGoogle();
            if (res) {
                setGoogleUser(res.user);
                setAccessToken(res.accessToken);
            }
        } catch (err) {
            console.error('Google sign-in error:', err);
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleUpdateBookingStatus = async (bookingId: string, newStatus: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled') => {
        const now = new Date().toISOString();
        const updatedList = bookings.map(b => b.id === bookingId ? { ...b, status: newStatus, updatedAt: now } : b);
        setBookings(updatedList);
        localStorage.setItem('nikosoko_db_bookings', JSON.stringify(updatedList));

        try {
            await fetch(`/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (e) {
            console.error('API update failed:', e);
        }
    };

    // Open Cancellation Modal
    const handleInitiateCancel = (booking: Booking) => {
        setCancellingBooking(booking);
        setSelectedCancelReason(CANCELLATION_REASONS[0]);
        setCustomCancelNote('');
    };

    // Confirm Cancellation with structured audit logging & calendar unlinking
    const handleConfirmCancelBooking = async () => {
        if (!cancellingBooking) return;
        setIsCancelling(true);

        const booking = cancellingBooking;
        const now = new Date().toISOString();
        const combinedReason = customCancelNote.trim() 
            ? `${selectedCancelReason} - ${customCancelNote.trim()}`
            : selectedCancelReason;
        const cancelledByRole: 'client' | 'provider' | 'admin' = (currentUser && (booking.providerId === currentUser.id || booking.providerPhone === currentUser.phone))
            ? 'provider'
            : 'client';

        // 1. If Google Calendar event exists, attempt removal
        if (booking.googleCalendarEventId && accessToken) {
            try {
                await deleteGoogleCalendarEvent(accessToken, booking.googleCalendarEventId);
            } catch (e) {
                console.error('Failed to remove event from Google Calendar:', e);
            }
        }

        // 2. Update local state & storage
        const updatedList = bookings.map(b => {
            if (b.id === booking.id) {
                return {
                    ...b,
                    status: 'Cancelled' as const,
                    cancellationReason: combinedReason,
                    cancelledBy: cancelledByRole,
                    cancelledAt: now,
                    updatedAt: now
                };
            }
            return b;
        });
        setBookings(updatedList);
        localStorage.setItem('nikosoko_db_bookings', JSON.stringify(updatedList));

        // 3. Call server cancellation API
        try {
            await fetch(`/api/bookings/${booking.id}/cancel`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reason: combinedReason,
                    cancelledBy: cancelledByRole
                })
            });
        } catch (e) {
            console.error('Server cancel booking API failed:', e);
        } finally {
            setIsCancelling(false);
            setCancellingBooking(null);
        }
    };

    const handleSaveCustomDeposit = () => {
        if (!currentUser || !onUpdateCurrentUser) return;
        const val = parseInt(customDeposit, 10);
        if (isNaN(val) || val < 0) return;

        const updated: ServiceProvider = {
            ...currentUser,
            minBookingDeposit: val
        };

        onUpdateCurrentUser(updated);
        setDepositSavedNotice(true);
        setTimeout(() => setDepositSavedNotice(false), 3000);
    };

    // Filter user's bookings vs provider's received appointments
    const clientBookings = bookings.filter(b => {
        if (!currentUser) return true;
        return b.clientId === currentUser.id || b.clientPhone === currentUser.phone || !currentUser.isVerified;
    });

    const receivedBookings = bookings.filter(b => {
        if (!currentUser) return false;
        return b.providerId === currentUser.id || b.providerPhone === currentUser.phone;
    });

    // Count pending requests needing attention
    const pendingReceivedCount = receivedBookings.filter(b => b.status === 'Pending').length;
    const pendingClientCount = clientBookings.filter(b => b.status === 'Pending').length;

    // Apply status filter
    const activeList = activeTab === 'my_bookings' ? clientBookings : receivedBookings;
    const filteredList = activeList.filter(b => {
        if (statusFilter === 'all') return true;
        return b.status === statusFilter;
    });

    return (
        <div className="w-full max-w-md mx-auto bg-white min-h-screen flex flex-col font-sans pb-20 border-x border-neutral-100">
            {/* Header - Black & White with Emerald and Live Calendar indicators */}
            <header className="px-3.5 py-3 bg-black text-white shadow-xs flex items-center justify-between sticky top-0 z-20 border-b border-neutral-800">
                <div className="flex items-center gap-2.5">
                    <button 
                        onClick={onBack} 
                        className="p-1 rounded-full hover:bg-neutral-800 transition-colors text-white cursor-pointer"
                        title="Back"
                    >
                        <BackIcon />
                    </button>
                    <div>
                        <h1 className="text-xs font-bold tracking-tight text-white uppercase flex items-center gap-1.5">
                            <span>Bookings & Requests</span>
                            <span className="text-[9.5px] font-mono bg-neutral-900 border border-neutral-700 text-neutral-300 px-1.5 py-0.2 rounded-full">
                                Sync
                            </span>
                        </h1>
                        <p className="text-[10px] text-neutral-400 font-normal">
                            Google Calendar & M-Pesa Integration
                        </p>
                    </div>
                </div>

                {/* Google Calendar Status in Header */}
                {googleUser ? (
                    <div className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 text-[10px] font-medium px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="truncate max-w-[80px]">{googleUser.email?.split('@')[0]}</span>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={isAuthenticating}
                        className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                    >
                        {isAuthenticating ? 'Connecting...' : '+ Google Sync'}
                    </button>
                )}
            </header>

            {/* Main Navigation Tabs */}
            <div className="p-2 border-b border-neutral-200 bg-neutral-50 flex gap-1 text-xs">
                <button
                    type="button"
                    onClick={() => setActiveTab('my_bookings')}
                    className={`flex-1 py-1.5 px-2 rounded-xl font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                        activeTab === 'my_bookings'
                            ? 'bg-black text-white shadow-xs'
                            : 'text-neutral-600 hover:bg-neutral-200/60'
                    }`}
                >
                    <span>My Bookings ({clientBookings.length})</span>
                    {pendingClientCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('received_bookings')}
                    className={`flex-1 py-1.5 px-2 rounded-xl font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                        activeTab === 'received_bookings'
                            ? 'bg-black text-white shadow-xs'
                            : 'text-neutral-600 hover:bg-neutral-200/60'
                    }`}
                >
                    <span>Requests ({receivedBookings.length})</span>
                    {pendingReceivedCount > 0 && (
                        <span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.2 rounded-full animate-bounce">
                            {pendingReceivedCount}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('calendar_sync')}
                    className={`py-1.5 px-2.5 rounded-xl font-bold transition-all text-center cursor-pointer ${
                        activeTab === 'calendar_sync'
                            ? 'bg-black text-white shadow-xs'
                            : 'text-neutral-600 hover:bg-neutral-200/60'
                    }`}
                    title="Calendar Availability & Rates"
                >
                    Calendar & Deposit
                </button>
            </div>

            {/* Sub-Filters (All / Pending / Confirmed / Completed / Cancelled) */}
            {activeTab !== 'calendar_sync' && (
                <div className="px-3 pt-2.5 pb-1 flex gap-1.5 overflow-x-auto no-scrollbar text-[11px] font-semibold border-b border-neutral-100">
                    {(['all', 'Pending', 'Confirmed', 'Completed', 'Cancelled'] as const).map((filterKey) => {
                        const count = activeList.filter(b => filterKey === 'all' ? true : b.status === filterKey).length;
                        const isSelected = statusFilter === filterKey;

                        return (
                            <button
                                key={filterKey}
                                onClick={() => setStatusFilter(filterKey)}
                                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                                    isSelected
                                        ? 'bg-black text-white'
                                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                }`}
                            >
                                {filterKey === 'all' ? 'All' : filterKey} ({count})
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Main Content Area */}
            <main className="p-3 flex-1 space-y-3">

                {/* TAB 1: Client Bookings */}
                {activeTab === 'my_bookings' && (
                    <div className="space-y-3">
                        {filteredList.length > 0 ? (
                            <div className="space-y-3">
                                {filteredList.map((b) => {
                                    const providerObj = providers.find(p => p.id === b.providerId);
                                    const isPending = b.status === 'Pending';
                                    const isConfirmed = b.status === 'Confirmed';
                                    const isCancelled = b.status === 'Cancelled';
                                    const isCompleted = b.status === 'Completed';

                                    return (
                                        <div 
                                            key={b.id}
                                            className={`border rounded-2xl p-3 bg-white shadow-2xs space-y-2.5 transition-all ${
                                                isCancelled 
                                                    ? 'border-neutral-200 bg-neutral-50/50 opacity-75' 
                                                    : isPending
                                                    ? 'border-amber-300 bg-amber-50/20 hover:border-amber-400'
                                                    : 'border-neutral-200 hover:border-black'
                                            }`}
                                        >
                                            {/* Header row */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div 
                                                    className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                                                    onClick={() => providerObj && onSelectProvider(providerObj)}
                                                >
                                                    <img 
                                                        src={b.providerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300'} 
                                                        alt={b.providerName} 
                                                        className="w-10 h-10 rounded-full object-cover border border-neutral-200 shrink-0"
                                                    />
                                                    <div className="min-w-0">
                                                        <h3 className="font-bold text-xs text-neutral-900 truncate">
                                                            {b.providerName}
                                                        </h3>
                                                        <p className="text-[11px] text-neutral-500 truncate">
                                                            {b.serviceTitle || b.providerService}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Status Badge */}
                                                <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                                                    isCancelled 
                                                        ? 'bg-red-50 text-red-700 border-red-200' 
                                                        : isPending
                                                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                                                        : isCompleted
                                                        ? 'bg-neutral-100 text-black border-neutral-300'
                                                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                }`}>
                                                    {isPending ? '⏳ Pending Request' : isCancelled ? '✕ Cancelled' : isConfirmed ? '✓ Confirmed' : b.status}
                                                </span>
                                            </div>

                                            {/* Date, Time & M-Pesa Deposit Info */}
                                            <div className="bg-neutral-50 rounded-xl p-2.5 border border-neutral-200/80 text-xs space-y-1.5">
                                                <div className="flex items-center justify-between font-mono">
                                                    <span className="font-sans text-neutral-600">📅 Appointment:</span>
                                                    <span className="font-bold text-neutral-900">{b.date} @ {b.time}</span>
                                                </div>
                                                
                                                <div className="flex items-center justify-between font-mono">
                                                    <span className="font-sans text-neutral-600 flex items-center gap-1">
                                                        <MpesaBadge /> Deposit:
                                                    </span>
                                                    <span className="font-bold text-emerald-700">
                                                        KES {b.paidDepositAmount.toLocaleString()} ({b.mpesaReceiptNumber || 'Paid'})
                                                    </span>
                                                </div>

                                                {b.location && (
                                                    <div className="text-[11px] text-neutral-600 flex items-center gap-1 pt-0.5">
                                                        <span>📍 Location:</span>
                                                        <span className="font-medium text-neutral-900">{b.location}</span>
                                                    </div>
                                                )}

                                                {b.notes && (
                                                    <p className="text-[11px] text-neutral-600 pt-1 border-t border-neutral-200 italic">
                                                        "{b.notes}"
                                                    </p>
                                                )}

                                                {/* Cancellation Audit Box if Cancelled */}
                                                {isCancelled && (
                                                    <div className="pt-1.5 border-t border-red-200 text-[10.5px] bg-red-50/70 p-2 rounded-lg text-red-900 space-y-0.5">
                                                        <div className="font-bold flex items-center gap-1">
                                                            <span>✕ Cancelled by:</span>
                                                            <span className="capitalize">{b.cancelledBy || 'User'}</span>
                                                            {b.cancelledAt && (
                                                                <span className="font-normal text-red-700 text-[9.5px]">
                                                                    ({new Date(b.cancelledAt).toLocaleDateString()})
                                                                </span>
                                                            )}
                                                        </div>
                                                        {b.cancellationReason && (
                                                            <p className="text-red-800 italic">
                                                                Reason: "{b.cancellationReason}"
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center justify-between pt-1 text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    {b.googleCalendarHtmlLink ? (
                                                        <a
                                                            href={b.googleCalendarHtmlLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                                        >
                                                            <span>Google Calendar</span>
                                                            <span>↗</span>
                                                        </a>
                                                    ) : b.isCalendarSynced ? (
                                                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                            ✓ Calendar Synced
                                                        </span>
                                                    ) : null}
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    {b.providerPhone && (
                                                        <>
                                                            <a
                                                                href={`tel:${b.providerPhone}`}
                                                                className="p-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-black transition-colors"
                                                                title="Call Provider"
                                                            >
                                                                <PhoneIcon />
                                                            </a>
                                                            <a
                                                                href={`https://wa.me/${b.providerPhone.replace(/\D/g, '')}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                                                                title="WhatsApp Provider"
                                                            >
                                                                <WhatsAppIcon />
                                                            </a>
                                                        </>
                                                    )}

                                                    {/* Cancel Button */}
                                                    {!isCancelled && !isCompleted && (
                                                        <button
                                                            onClick={() => handleInitiateCancel(b)}
                                                            className="px-2.5 py-1 text-[10.5px] font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            Cancel Booking
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-neutral-200 p-5 space-y-2.5">
                                <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-lg text-neutral-500">
                                    📅
                                </div>
                                <h3 className="text-xs font-bold uppercase text-black">
                                    {statusFilter === 'all' ? 'No Active Bookings' : `No ${statusFilter} Bookings`}
                                </h3>
                                <p className="text-[11px] text-neutral-500 font-normal max-w-xs mx-auto leading-relaxed">
                                    Book verified trades specialists and artisans on $kill Hub with instant Google Calendar sync and M-Pesa deposit protection.
                                </p>
                                <button
                                    onClick={() => onNavigate('skill_id')}
                                    className="inline-block bg-black text-white font-semibold px-4 py-2 rounded-xl text-xs uppercase tracking-wider hover:bg-neutral-800 shadow-xs cursor-pointer transition-all active:scale-95"
                                >
                                    Browse $kill Hub &rarr;
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: Received Bookings / Requests (For Providers) */}
                {activeTab === 'received_bookings' && (
                    <div className="space-y-3">
                        {filteredList.length > 0 ? (
                            <div className="space-y-3">
                                {filteredList.map((b) => {
                                    const isPending = b.status === 'Pending';
                                    const isCancelled = b.status === 'Cancelled';
                                    const isCompleted = b.status === 'Completed';

                                    return (
                                        <div 
                                            key={b.id}
                                            className={`border rounded-2xl p-3 bg-white shadow-2xs space-y-2.5 ${
                                                isPending
                                                    ? 'border-amber-400 bg-amber-50/30'
                                                    : isCancelled
                                                    ? 'border-neutral-200 bg-neutral-50 opacity-75'
                                                    : 'border-neutral-200'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-neutral-500 block">
                                                        Client Request
                                                    </span>
                                                    <h3 className="font-bold text-xs text-neutral-900">
                                                        {b.clientName}
                                                    </h3>
                                                    <p className="text-[11px] text-neutral-500 font-mono">
                                                        {b.clientPhone}
                                                    </p>
                                                </div>
                                                <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${
                                                    isPending
                                                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                                                        : isCancelled
                                                        ? 'bg-red-50 text-red-700 border-red-200'
                                                        : isCompleted
                                                        ? 'bg-neutral-100 text-black border-neutral-300'
                                                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                }`}>
                                                    {isPending ? '⏳ New Request' : isCancelled ? '✕ Cancelled' : b.status}
                                                </span>
                                            </div>

                                            <div className="bg-neutral-50 rounded-xl p-2.5 border border-neutral-200 text-xs space-y-1 font-mono">
                                                <div className="flex justify-between">
                                                    <span className="font-sans text-neutral-500">Service:</span>
                                                    <span className="font-bold text-black truncate max-w-[180px]">{b.serviceTitle}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-sans text-neutral-500">Date & Time:</span>
                                                    <span className="font-bold text-black">{b.date} @ {b.time}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-sans text-neutral-500 flex items-center gap-1">
                                                        <MpesaBadge /> Deposit:
                                                    </span>
                                                    <span className="font-bold text-emerald-700">
                                                        KES {b.paidDepositAmount.toLocaleString()} ({b.mpesaReceiptNumber || 'Paid'})
                                                    </span>
                                                </div>
                                                {b.location && (
                                                    <div className="pt-1 font-sans text-[11px] text-neutral-700">
                                                        📍 <strong>Location:</strong> {b.location}
                                                    </div>
                                                )}
                                                {b.notes && (
                                                    <div className="pt-1 font-sans text-[11px] text-neutral-600 italic">
                                                        Task Notes: "{b.notes}"
                                                    </div>
                                                )}

                                                {/* Cancellation audit info */}
                                                {isCancelled && (
                                                    <div className="pt-1.5 border-t border-red-200 text-[10.5px] bg-red-50 p-2 rounded-lg text-red-900 font-sans space-y-0.5">
                                                        <div className="font-bold">
                                                            ✕ Cancelled by: <span className="capitalize">{b.cancelledBy || 'User'}</span>
                                                        </div>
                                                        {b.cancellationReason && (
                                                            <p className="text-red-800 italic">
                                                                Reason: "{b.cancellationReason}"
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Bar for Provider */}
                                            <div className="flex items-center justify-between pt-1">
                                                <div className="flex items-center gap-1.5">
                                                    {b.clientPhone && (
                                                        <>
                                                            <a
                                                                href={`tel:${b.clientPhone}`}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-black text-white text-[10.5px] font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
                                                            >
                                                                <PhoneIcon />
                                                                <span>Call</span>
                                                            </a>
                                                            <a
                                                                href={`https://wa.me/${b.clientPhone.replace(/\D/g, '')}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white text-[10.5px] font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                                                            >
                                                                <WhatsAppIcon />
                                                                <span>WhatsApp</span>
                                                            </a>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    {isPending && (
                                                        <button
                                                            onClick={() => handleUpdateBookingStatus(b.id, 'Confirmed')}
                                                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10.5px] rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            Accept & Confirm
                                                        </button>
                                                    )}

                                                    {b.status === 'Confirmed' && (
                                                        <button
                                                            onClick={() => handleUpdateBookingStatus(b.id, 'Completed')}
                                                            className="px-2.5 py-1 bg-neutral-900 hover:bg-black text-white font-semibold text-[10.5px] rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            Mark Done
                                                        </button>
                                                    )}

                                                    {!isCancelled && !isCompleted && (
                                                        <button
                                                            onClick={() => handleInitiateCancel(b)}
                                                            className="px-2 py-1 text-red-600 hover:bg-red-50 text-[10.5px] font-semibold rounded-lg transition-colors cursor-pointer border border-red-200"
                                                        >
                                                            {isPending ? 'Decline' : 'Cancel Slot'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-neutral-200 p-5 space-y-2.5">
                                <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-lg text-neutral-500">
                                    📥
                                </div>
                                <h3 className="text-xs font-bold uppercase text-black">
                                    {statusFilter === 'all' ? 'No Client Booking Requests' : `No ${statusFilter} Requests`}
                                </h3>
                                <p className="text-[11px] text-neutral-500 font-normal max-w-xs mx-auto leading-relaxed">
                                    When clients book your services from your profile or saved contacts, their requests, schedules, and M-Pesa deposits will appear here for one-click confirmation.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: Calendar Availability & Provider Deposit Configuration */}
                {activeTab === 'calendar_sync' && (
                    <div className="space-y-4">
                        {/* Google Calendar Account Card */}
                        <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200 space-y-2.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon />
                                    <h3 className="font-bold text-xs uppercase tracking-tight text-neutral-900">
                                        Google Calendar Sync
                                    </h3>
                                </div>
                                {googleUser ? (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                        ✓ Active
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold text-neutral-500 bg-neutral-200 px-2 py-0.5 rounded-full">
                                        Offline
                                    </span>
                                )}
                            </div>

                            {googleUser ? (
                                <div className="space-y-2">
                                    <p className="text-[11px] text-neutral-600">
                                        Connected as <strong className="text-black">{googleUser.email}</strong>. Appointments booked via NikoSoko are automatically synced to this Google Calendar.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={googleSignOut}
                                        className="text-[10px] font-bold text-neutral-500 hover:text-black underline cursor-pointer"
                                    >
                                        Disconnect Google Calendar
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-[11px] text-neutral-600">
                                        Connect your Google Calendar to allow instant schedule availability checks and automatic event creation.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleGoogleAuth}
                                        disabled={isAuthenticating}
                                        className="w-full py-2.5 bg-black text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-all cursor-pointer"
                                    >
                                        {isAuthenticating ? 'Connecting...' : 'Connect Google Calendar'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Real-time Day Schedule Inspector */}
                        {googleUser && (
                            <div className="bg-white rounded-2xl p-3.5 border border-neutral-200 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-700">
                                        Inspect Calendar Availability
                                    </label>
                                    <input 
                                        type="date"
                                        value={checkDate}
                                        onChange={(e) => setCheckDate(e.target.value)}
                                        className="p-1 text-xs border border-neutral-300 rounded-lg font-mono font-bold"
                                    />
                                </div>

                                {isCheckingCal ? (
                                    <div className="text-center py-4 text-[11px] text-neutral-500">
                                        Checking Google Calendar schedule...
                                    </div>
                                ) : calendarEvents.length > 0 ? (
                                    <div className="space-y-1.5 pt-1">
                                        <span className="text-[10px] text-neutral-500 font-semibold block">
                                            Busy Slots on {checkDate}:
                                        </span>
                                        {calendarEvents.map((ev, i) => (
                                            <div key={i} className="p-2 bg-neutral-50 border border-neutral-200 rounded-lg text-[11px] flex justify-between">
                                                <span className="font-semibold text-neutral-900 truncate pr-2">{ev.title}</span>
                                                <span className="font-mono text-neutral-500 shrink-0">
                                                    {new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(ev.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 font-medium text-center">
                                        ✓ No conflicting events found on your Google Calendar for {checkDate}. All slots available!
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Minimum Booking Fee Setting (For Providers) */}
                        {currentUser && (
                            <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200 space-y-2.5">
                                <div>
                                    <h3 className="font-bold text-xs uppercase tracking-tight text-neutral-900">
                                        Your Minimum Booking Deposit (M-Pesa)
                                    </h3>
                                    <p className="text-[10.5px] text-neutral-500 leading-tight mt-0.5">
                                        Set the required commitment fee clients must pay via M-Pesa to confirm a booking with you.
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-neutral-500">
                                            KES
                                        </span>
                                        <input 
                                            type="number"
                                            value={customDeposit}
                                            onChange={(e) => setCustomDeposit(e.target.value)}
                                            placeholder="500"
                                            className="w-full pl-11 pr-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-bold text-black focus:outline-none focus:border-black"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSaveCustomDeposit}
                                        className="px-4 py-2 bg-black text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
                                    >
                                        Save Rate
                                    </button>
                                </div>

                                {depositSavedNotice && (
                                    <p className="text-[10.5px] font-bold text-emerald-700">
                                        ✓ Minimum booking fee updated to KES {customDeposit}!
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

            </main>

            {/* CANCELLATION MODAL */}
            {cancellingBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-4.5 shadow-2xl border border-neutral-200 space-y-3.5 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                            <div>
                                <h2 className="text-xs font-bold uppercase tracking-tight text-neutral-900">
                                    Cancel Booking
                                </h2>
                                <p className="text-[10.5px] text-neutral-500">
                                    {cancellingBooking.providerName} • {cancellingBooking.date} @ {cancellingBooking.time}
                                </p>
                            </div>
                            <button
                                onClick={() => setCancellingBooking(null)}
                                className="p-1 text-neutral-400 hover:text-black rounded-full cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Booking Details Summary */}
                        <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1 font-mono">
                            <div className="flex justify-between">
                                <span className="font-sans text-neutral-500">Service:</span>
                                <span className="font-bold text-neutral-900 truncate max-w-[170px]">{cancellingBooking.serviceTitle}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-sans text-neutral-500">Deposit:</span>
                                <span className="font-bold text-emerald-700">KES {cancellingBooking.paidDepositAmount} ({cancellingBooking.mpesaReceiptNumber})</span>
                            </div>
                        </div>

                        {/* Reason Selection */}
                        <div className="space-y-1.5">
                            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-neutral-700">
                                Reason for Cancellation *
                            </label>
                            <select
                                value={selectedCancelReason}
                                onChange={(e) => setSelectedCancelReason(e.target.value)}
                                className="w-full p-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 font-medium focus:outline-none focus:border-black"
                            >
                                {CANCELLATION_REASONS.map((r, idx) => (
                                    <option key={idx} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        {/* Custom Note */}
                        <div className="space-y-1.5">
                            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-neutral-700">
                                Additional Notes (Optional)
                            </label>
                            <textarea
                                value={customCancelNote}
                                onChange={(e) => setCustomCancelNote(e.target.value)}
                                placeholder="Explain any special details or reschedule requests..."
                                rows={2}
                                className="w-full p-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-black resize-none"
                            />
                        </div>

                        {/* Policy & Calendar Notice */}
                        <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-900 space-y-0.5 leading-tight">
                            <p className="font-bold">⚠️ Cancellation Policy:</p>
                            <p>
                                Cancelling this appointment updates your booking record and unlinks the event from Google Calendar.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setCancellingBooking(null)}
                                className="flex-1 py-2 rounded-xl text-xs font-bold border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                            >
                                Keep Booking
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmCancelBooking}
                                disabled={isCancelling}
                                className="flex-1 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                            >
                                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default BookingsView;
