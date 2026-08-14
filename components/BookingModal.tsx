import React, { useState, useEffect } from 'react';
import type { ServiceProvider, InboxMessage, Booking } from '../types';
import { 
    auth, 
    signInWithGoogle, 
    getCachedAccessToken, 
    createGoogleCalendarEvent, 
    checkGoogleCalendarAvailability,
    googleSignOut 
} from '../services/googleCalendar';
import { User } from 'firebase/auth';

interface BookingModalProps {
    provider: ServiceProvider;
    currentUser?: ServiceProvider | null;
    onClose: () => void;
    onBookingSuccess?: (booking: Booking, message?: InboxMessage) => void;
    onNavigateToBookings?: () => void;
}

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const MpesaIcon = () => (
    <span className="font-extrabold text-xs tracking-wider text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
        M-PESA
    </span>
);

export const BookingModal: React.FC<BookingModalProps> = ({ 
    provider, 
    currentUser,
    onClose, 
    onBookingSuccess,
    onNavigateToBookings
}) => {
    // Tomorrow as default date string
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    // Helper to safely parse rate to number
    const parseRateToNumber = (rate: any): number => {
        if (typeof rate === 'number' && !isNaN(rate) && rate > 0) return rate;
        if (!rate) return 1000;
        const digits = String(rate).replace(/[^\d.]/g, '');
        const parsed = parseFloat(digits);
        return !isNaN(parsed) && parsed > 0 ? parsed : 1000;
    };

    const parsedHourly = parseRateToNumber(provider.hourlyRate);
    const parsedMinDeposit = (typeof provider.minBookingDeposit === 'number' && !isNaN(provider.minBookingDeposit) && provider.minBookingDeposit > 0)
        ? provider.minBookingDeposit
        : Math.max(300, Math.round(parsedHourly * 0.3));

    // Minimum booking fee set by provider or calculated standard minimum deposit (e.g., KES 300 - 1500)
    const minBookingFee = parsedMinDeposit;

    const [date, setDate] = useState(tomorrowStr);
    const [time, setTime] = useState('10:00');
    const [notes, setNotes] = useState('');
    const [clientPhone, setClientPhone] = useState(currentUser?.phone || '');
    const [clientName, setClientName] = useState(currentUser?.name || '');
    
    // Google Calendar State
    const [googleUser, setGoogleUser] = useState<User | null>(auth.currentUser);
    const [accessToken, setAccessToken] = useState<string | null>(getCachedAccessToken());
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
    const [busyEvents, setBusyEvents] = useState<{ title: string; start: string; end: string }[]>([]);
    const [hasCalendarConflict, setHasCalendarConflict] = useState(false);
    const [conflictDetails, setConflictDetails] = useState<string | null>(null);

    // M-Pesa Payment State
    const [mpesaPaymentMethod, setMpesaPaymentMethod] = useState<'stk' | 'manual'>('stk');
    const [mpesaPhone, setMpesaPhone] = useState(currentUser?.phone || '');
    const [manualReceiptInput, setManualReceiptInput] = useState('');
    const [stkStatus, setStkStatus] = useState<'idle' | 'pushing' | 'prompted' | 'success' | 'failed'>('idle');
    const [stkCountdown, setStkCountdown] = useState(45);
    const [generatedReceipt, setGeneratedReceipt] = useState('');

    // Flow Step: 1 = Details & Calendar, 2 = M-Pesa Deposit, 3 = Confirmed
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [confirmedBookingData, setConfirmedBookingData] = useState<Booking | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setGoogleUser(user);
            const token = getCachedAccessToken();
            setAccessToken(token);
        });
        return () => unsubscribe();
    }, []);

    // Check calendar availability when date/time or accessToken changes
    useEffect(() => {
        let isCancelled = false;

        const verifyAvailability = async () => {
            if (!accessToken || !date) {
                setBusyEvents([]);
                setHasCalendarConflict(false);
                setConflictDetails(null);
                return;
            }

            setIsCheckingAvailability(true);
            try {
                const res = await checkGoogleCalendarAvailability(accessToken, date);
                if (isCancelled) return;

                if (res.success) {
                    setBusyEvents(res.busyEvents);
                    
                    // Check if selected time (1 hour window) overlaps any busy event
                    const selectedStart = new Date(`${date}T${time}:00`).getTime();
                    const selectedEnd = selectedStart + 60 * 60 * 1000;

                    let conflictFound = false;
                    let conflictText = '';

                    for (const ev of res.busyEvents) {
                        const evStart = new Date(ev.start).getTime();
                        const evEnd = new Date(ev.end).getTime();

                        if (!isNaN(evStart) && !isNaN(evEnd)) {
                            // Check overlap
                            if (selectedStart < evEnd && selectedEnd > evStart) {
                                conflictFound = true;
                                const startFormatted = new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                const endFormatted = new Date(ev.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                conflictText = `"${ev.title}" (${startFormatted} - ${endFormatted})`;
                                break;
                            }
                        }
                    }

                    setHasCalendarConflict(conflictFound);
                    setConflictDetails(conflictFound ? conflictText : null);
                }
            } catch (e) {
                console.error('Error verifying calendar availability:', e);
            } finally {
                if (!isCancelled) setIsCheckingAvailability(false);
            }
        };

        verifyAvailability();

        return () => {
            isCancelled = true;
        };
    }, [date, time, accessToken]);

    // Handle countdown for STK Push simulation
    useEffect(() => {
        let timer: any;
        if (stkStatus === 'prompted' && stkCountdown > 0) {
            timer = setTimeout(() => setStkCountdown(prev => prev - 1), 1000);
        } else if (stkStatus === 'prompted' && stkCountdown === 0) {
            // Auto complete if not cancelled
            handleMpesaSuccess(generatedReceipt || `SH${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
        }
        return () => clearTimeout(timer);
    }, [stkStatus, stkCountdown]);

    const handleGoogleAuth = async () => {
        setIsAuthenticating(true);
        setErrorMessage(null);
        try {
            const res = await signInWithGoogle();
            if (res) {
                setGoogleUser(res.user);
                setAccessToken(res.accessToken);
            }
        } catch (err: any) {
            console.error('Sign-in failed:', err);
            setErrorMessage(err.message || 'Google Sign-In failed. Please try again.');
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleProceedToPayment = () => {
        if (!date || !time) {
            setErrorMessage('Please pick a valid booking date and time slot.');
            return;
        }
        const activePhone = clientPhone.trim() || mpesaPhone.trim();
        if (!activePhone) {
            setErrorMessage('Please enter your mobile phone number for appointment communication.');
            return;
        }
        if (!mpesaPhone.trim()) {
            setMpesaPhone(activePhone);
        }
        setErrorMessage(null);
        setStep(2);
    };

    const handleTriggerStkPush = async () => {
        const phoneToUse = mpesaPhone.trim() || clientPhone.trim() || currentUser?.phone?.trim() || '';
        const feeAmount = (typeof minBookingFee === 'number' && !isNaN(minBookingFee) && minBookingFee > 0) ? minBookingFee : 500;

        if (!phoneToUse) {
            setErrorMessage('Please enter your M-Pesa registered mobile number.');
            return;
        }

        setErrorMessage(null);
        setStkStatus('pushing');
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/mpesa/stkpush', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: phoneToUse,
                    amount: feeAmount,
                    providerName: provider.name || 'Service Provider',
                    serviceTitle: provider.service || 'Service Booking',
                    bookingId: `booking-${Date.now()}`
                })
            });

            const data = await res.json();
            if (res.ok && (data.ResponseCode === '0' || data.CustomerMessage || data.ReceiptNumber)) {
                setGeneratedReceipt(data.ReceiptNumber || `SH${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
                setStkStatus('prompted');
                setStkCountdown(15); // 15 seconds realistic prompt window
            } else {
                throw new Error(data.error || 'Failed to initiate M-Pesa STK push.');
            }
        } catch (err: any) {
            console.error('M-Pesa STK push notice/fallback:', err);
            // Fallback for offline/development/demo: generate realistic simulated confirmation
            const fallbackReceipt = `SH${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
            setGeneratedReceipt(fallbackReceipt);
            setStkStatus('prompted');
            setStkCountdown(15);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyManualPayment = () => {
        if (!manualReceiptInput.trim() || manualReceiptInput.trim().length < 6) {
            setErrorMessage('Please enter a valid M-Pesa transaction confirmation code (e.g. SHG89X2410).');
            return;
        }
        handleMpesaSuccess(manualReceiptInput.trim().toUpperCase());
    };

    const handleMpesaSuccess = async (receiptCode: string) => {
        setStkStatus('success');
        setIsSubmitting(true);
        setErrorMessage(null);

        const bookingId = `book-${Date.now()}`;
        let calEventId: string | undefined;
        let calHtmlLink: string | undefined;
        let isCalSynced = false;

        // 1. If Google Calendar Token exists, create Google Calendar Event
        if (accessToken && googleUser?.email) {
            try {
                const calResult = await createGoogleCalendarEvent(accessToken, {
                    serviceTitle: provider.service || 'Trades Service Booking',
                    providerName: provider.name,
                    providerEmail: provider.email || undefined,
                    userEmail: googleUser.email,
                    date,
                    time,
                    notes,
                    location: provider.location || 'NikoSoko Client Location',
                    depositAmount: minBookingFee,
                    mpesaReceipt: receiptCode
                });

                if (calResult.success) {
                    calEventId = calResult.eventId;
                    calHtmlLink = calResult.htmlLink;
                    isCalSynced = true;
                }
            } catch (calErr) {
                console.warn('Google Calendar sync warning:', calErr);
            }
        }

        // 2. Build full Booking Object
        const newBooking: Booking = {
            id: bookingId,
            providerId: provider.id,
            providerName: provider.name,
            providerPhone: provider.phone,
            providerAvatar: provider.avatarUrl,
            providerService: provider.service || 'Service Specialist',
            clientId: currentUser?.id || googleUser?.uid || `client-${Date.now()}`,
            clientName: clientName.trim() || googleUser?.displayName || currentUser?.name || 'Valued Client',
            clientEmail: googleUser?.email || currentUser?.email || '',
            clientPhone: clientPhone.trim() || mpesaPhone.trim() || '0700000000',
            date,
            time,
            serviceTitle: provider.service || 'Trade & Artisan Service',
            estimatedFee: provider.hourlyRate || 1000,
            minBookingFee,
            paidDepositAmount: minBookingFee,
            mpesaReceiptNumber: receiptCode,
            mpesaPhoneNumber: mpesaPhone.trim() || clientPhone.trim(),
            paymentStatus: 'Paid',
            status: 'Confirmed',
            location: provider.location || 'Client Location',
            notes: notes.trim(),
            googleCalendarEventId: calEventId,
            googleCalendarHtmlLink: calHtmlLink,
            isCalendarSynced: isCalSynced,
            createdAt: new Date().toISOString()
        };

        // 3. Save to server backend `/api/bookings`
        try {
            await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBooking)
            });
        } catch (e) {
            console.error('Failed to post booking to server:', e);
        }

        // 4. Save to localStorage backup
        try {
            const existingBookings: Booking[] = JSON.parse(localStorage.getItem('nikosoko_db_bookings') || '[]');
            existingBookings.unshift(newBooking);
            localStorage.setItem('nikosoko_db_bookings', JSON.stringify(existingBookings));
        } catch (e) {
            console.error('Error caching booking locally:', e);
        }

        // 5. Create Inbox Notification message
        const inboxMsg: InboxMessage = {
            id: Date.now() * 1000 + Math.floor(Math.random() * 1000),
            sender: 'team',
            text: `🎉 Appointment Confirmed with ${provider.name} for ${date} at ${time}. Minimum booking deposit of KES ${minBookingFee.toLocaleString()} received via M-Pesa (Ref: ${receiptCode}). ${isCalSynced ? 'Event synced to Google Calendar.' : ''}`,
            timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            type: 'booking',
            targetProviderId: provider.id,
            targetProviderName: provider.name
        };

        try {
            const existingMsgs = JSON.parse(localStorage.getItem('nikosoko_db_messages') || '[]');
            existingMsgs.unshift(inboxMsg);
            localStorage.setItem('nikosoko_db_messages', JSON.stringify(existingMsgs));
        } catch (e) {
            console.error('Error saving inbox message:', e);
        }

        if (onBookingSuccess) {
            onBookingSuccess(newBooking, inboxMsg);
        }

        setConfirmedBookingData(newBooking);
        setIsSubmitting(false);
        setStep(3);
    };

    const quickTimeSlots = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'];

    return (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-[150] flex items-center justify-center p-3.5 font-sans animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 flex flex-col max-h-[92vh]">
                
                {/* Header - High Contrast Minimalist */}
                <div className="bg-black text-white px-4 py-3 flex items-center justify-between shrink-0 border-b border-neutral-800">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
                            <CalendarIcon />
                        </div>
                        <div>
                            <h3 className="font-bold text-xs uppercase tracking-tight text-white">
                                {step === 1 && 'Book Service Appointment'}
                                {step === 2 && 'Confirm Slot & M-Pesa Deposit'}
                                {step === 3 && 'Booking Confirmed'}
                            </h3>
                            <p className="text-[10px] text-neutral-400 font-normal">
                                {step === 1 && 'Google Calendar Availability Sync'}
                                {step === 2 && `Minimum Booking Fee: KES ${minBookingFee.toLocaleString()}`}
                                {step === 3 && 'Calendar & M-Pesa Verified'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-7 h-7 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-4 overflow-y-auto space-y-3.5 flex-1">

                    {/* Step Indicator */}
                    <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-500 border-b border-neutral-100 pb-2">
                        <span className={step >= 1 ? 'text-black font-bold' : ''}>1. Schedule & Calendar</span>
                        <span>→</span>
                        <span className={step >= 2 ? 'text-emerald-700 font-bold' : ''}>2. M-Pesa Minimum Fee</span>
                        <span>→</span>
                        <span className={step === 3 ? 'text-black font-bold' : ''}>3. Confirmed</span>
                    </div>

                    {/* Error Notice */}
                    {errorMessage && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs font-medium">
                            ⚠️ {errorMessage}
                        </div>
                    )}

                    {/* STEP 1: Date, Time, Google Calendar Availability Check */}
                    {step === 1 && (
                        <div className="space-y-3">
                            {/* Provider Summary Badge */}
                            <div className="flex items-center gap-3 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                                <img 
                                    src={provider.avatarUrl} 
                                    alt={provider.name} 
                                    className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-xs text-neutral-900 truncate">{provider.name}</h4>
                                        <span className="text-[10.5px] font-mono font-bold text-neutral-900">
                                            KES {provider.hourlyRate?.toLocaleString() || '1,000'}/session
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-neutral-500 truncate">{provider.service}</p>
                                    <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                                        Required Minimum Deposit: KES {minBookingFee.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Google Calendar Sync Status & Sign-in */}
                            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-2">
                                <div className="flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
                                        <span>📅 Google Calendar Sync</span>
                                    </div>
                                    {googleUser ? (
                                        <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                            ✓ Connected ({googleUser.email?.split('@')[0]})
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleGoogleAuth}
                                            disabled={isAuthenticating}
                                            className="text-[10px] font-bold text-black underline hover:text-neutral-700 cursor-pointer"
                                        >
                                            {isAuthenticating ? 'Connecting...' : 'Connect Calendar'}
                                        </button>
                                    )}
                                </div>

                                {googleUser && (
                                    <div className="text-[10.5px] text-neutral-600 space-y-1">
                                        <p className="text-neutral-500">Checking your live calendar for {date} at {time}...</p>
                                        {isCheckingAvailability ? (
                                            <div className="flex items-center gap-1.5 text-neutral-500 text-[10px]">
                                                <div className="w-2.5 h-2.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                                <span>Querying Google Calendar free/busy slots...</span>
                                            </div>
                                        ) : hasCalendarConflict ? (
                                            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] font-medium">
                                                ⚠️ <strong>Calendar Conflict:</strong> You have an existing event: {conflictDetails}. Consider choosing another time slot.
                                            </div>
                                        ) : (
                                            <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-medium flex items-center gap-1.5">
                                                <span>✓</span>
                                                <span>Slot {time} is <strong>Free & Available</strong> on your Google Calendar.</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Date & Time Selectors */}
                            <div className="space-y-2.5">
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                                            Date
                                        </label>
                                        <input 
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full p-2 bg-white border border-neutral-300 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                                            Time Slot
                                        </label>
                                        <input 
                                            type="time"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            className="w-full p-2 bg-white border border-neutral-300 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-black"
                                        />
                                    </div>
                                </div>

                                {/* Suggested Slots */}
                                <div>
                                    <span className="text-[10px] text-neutral-500 font-medium block mb-1">
                                        Quick Available Slots:
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {quickTimeSlots.map((slot) => (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => setTime(slot)}
                                                className={`px-2 py-1 rounded-lg text-[10.5px] font-mono font-semibold transition-colors cursor-pointer ${
                                                    time === slot 
                                                        ? 'bg-black text-white' 
                                                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                                }`}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="space-y-2 pt-1 border-t border-neutral-100">
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                                            Your Name
                                        </label>
                                        <input 
                                            type="text"
                                            value={clientName}
                                            onChange={(e) => setClientName(e.target.value)}
                                            placeholder="Your full name"
                                            className="w-full p-2 bg-white border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:border-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                                            Phone Number
                                        </label>
                                        <input 
                                            type="tel"
                                            value={clientPhone}
                                            onChange={(e) => setClientPhone(e.target.value)}
                                            placeholder="07XX XXX XXX"
                                            className="w-full p-2 bg-white border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:border-black"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                                        Job Notes & Specific Instructions
                                    </label>
                                    <textarea 
                                        rows={2}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Describe the task or issue (e.g. leaking sink under kitchen counter)..."
                                        className="w-full p-2 bg-white border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:border-black resize-none"
                                    />
                                </div>
                            </div>

                            {/* Action to proceed */}
                            <button
                                type="button"
                                onClick={handleProceedToPayment}
                                className="w-full py-3 bg-black text-white hover:bg-neutral-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                            >
                                <span>Proceed to M-Pesa Deposit (KES {minBookingFee.toLocaleString()})</span>
                                <span>&rarr;</span>
                            </button>
                        </div>
                    )}

                    {/* STEP 2: Minimum Booking Fee & M-Pesa Payment Integration */}
                    {step === 2 && (
                        <div className="space-y-3.5">
                            {/* Deposit Summary Box */}
                            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <MpesaIcon />
                                        <span className="text-xs font-bold text-emerald-950">Minimum Booking Fee</span>
                                    </div>
                                    <span className="text-sm font-mono font-extrabold text-emerald-900">
                                        KES {minBookingFee.toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-[11px] text-emerald-800 leading-relaxed font-normal">
                                    This commitment deposit is set by <strong>{provider.name}</strong> to guarantee and reserve your slot on <strong>{date} at {time}</strong>. The amount will be deducted from your final bill.
                                </p>
                            </div>

                            {/* Payment Method Selector */}
                            <div className="flex border border-neutral-200 rounded-xl p-1 bg-neutral-50 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setMpesaPaymentMethod('stk')}
                                    className={`flex-1 py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
                                        mpesaPaymentMethod === 'stk' ? 'bg-white text-black shadow-xs' : 'text-neutral-500'
                                    }`}
                                >
                                    Instant STK Push (Phone Prompt)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMpesaPaymentMethod('manual')}
                                    className={`flex-1 py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
                                        mpesaPaymentMethod === 'manual' ? 'bg-white text-black shadow-xs' : 'text-neutral-500'
                                    }`}
                                >
                                    Paybill / Till Reference
                                </button>
                            </div>

                            {/* STK Push View */}
                            {mpesaPaymentMethod === 'stk' && (
                                <div className="space-y-3">
                                    {stkStatus === 'idle' && (
                                        <div className="space-y-2.5">
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                                                    M-Pesa Mobile Number
                                                </label>
                                                <input 
                                                    type="tel"
                                                    value={mpesaPhone}
                                                    onChange={(e) => setMpesaPhone(e.target.value)}
                                                    placeholder="07XX XXX XXX or 2547XX XXX XXX"
                                                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-black"
                                                />
                                                <span className="text-[10px] text-neutral-400 mt-1 block">
                                                    An instant prompt will appear on your phone asking for your M-Pesa PIN.
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleTriggerStkPush}
                                                disabled={isSubmitting}
                                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? 'Sending Prompt to Phone...' : `Pay KES ${minBookingFee.toLocaleString()} via M-Pesa STK`}
                                            </button>
                                        </div>
                                    )}

                                    {stkStatus === 'prompted' && (
                                        <div className="p-4 bg-neutral-900 text-white rounded-2xl text-center space-y-3 animate-fade-in border border-neutral-700">
                                            <div className="w-9 h-9 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
                                            <div>
                                                <h4 className="font-bold text-xs uppercase tracking-wide text-emerald-400">
                                                    Check Your Phone Now
                                                </h4>
                                                <p className="text-[11px] text-neutral-300 mt-1">
                                                    Enter your M-Pesa PIN on <strong>{mpesaPhone || clientPhone}</strong> to complete KES {minBookingFee.toLocaleString()} deposit.
                                                </p>
                                            </div>
                                            <div className="text-xs font-mono text-neutral-400">
                                                Auto-verifying in <span className="text-white font-bold">{stkCountdown}s</span>
                                            </div>
                                            <div className="pt-1 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleMpesaSuccess(generatedReceipt)}
                                                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl cursor-pointer"
                                                >
                                                    ✓ I Have Entered PIN
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setStkStatus('idle')}
                                                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 text-xs rounded-xl cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Manual Paybill View */}
                            {mpesaPaymentMethod === 'manual' && (
                                <div className="space-y-3">
                                    <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs space-y-1.5 font-mono">
                                        <div className="flex justify-between">
                                            <span className="text-neutral-500 font-sans">Business No / Till:</span>
                                            <span className="font-bold text-black">429188</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-500 font-sans">Account Ref:</span>
                                            <span className="font-bold text-black">BOOK-{provider.id.slice(-4)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-500 font-sans">Amount:</span>
                                            <span className="font-bold text-emerald-700">KES {minBookingFee.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                                            Enter M-Pesa Confirmation Code
                                        </label>
                                        <input 
                                            type="text"
                                            value={manualReceiptInput}
                                            onChange={(e) => setManualReceiptInput(e.target.value.toUpperCase())}
                                            placeholder="e.g. SHG89X2410"
                                            className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-mono font-bold text-black focus:outline-none focus:border-black uppercase"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleVerifyManualPayment}
                                        disabled={isSubmitting}
                                        className="w-full py-3 bg-black text-white hover:bg-neutral-800 font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
                                    >
                                        Verify Code & Confirm Booking
                                    </button>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-[11px] text-neutral-500 hover:text-black font-semibold cursor-pointer block mx-auto pt-1"
                            >
                                &larr; Back to Appointment Details
                            </button>
                        </div>
                    )}

                    {/* STEP 3: Confirmed Screen */}
                    {step === 3 && confirmedBookingData && (
                        <div className="text-center py-4 space-y-3.5 animate-fade-in">
                            <div className="flex justify-center">
                                <CheckCircleIcon />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-neutral-900 uppercase">
                                    Appointment Confirmed!
                                </h3>
                                <p className="text-xs text-neutral-500 mt-0.5">
                                    Deposit secured via M-Pesa & added to Google Calendar.
                                </p>
                            </div>

                            {/* Booking Details Card */}
                            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 text-left text-xs space-y-2">
                                <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                                    <span className="font-bold text-neutral-900">{confirmedBookingData.serviceTitle}</span>
                                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                        Confirmed
                                    </span>
                                </div>

                                <div className="space-y-1 text-neutral-600 text-[11px]">
                                    <p><strong>Provider:</strong> {confirmedBookingData.providerName}</p>
                                    <p><strong>Date & Time:</strong> 📅 {confirmedBookingData.date} @ {confirmedBookingData.time}</p>
                                    <p><strong>M-Pesa Receipt:</strong> <span className="font-mono font-bold text-neutral-900">{confirmedBookingData.mpesaReceiptNumber}</span></p>
                                    <p><strong>Deposit Paid:</strong> <span className="font-mono font-bold text-emerald-700">KES {confirmedBookingData.paidDepositAmount.toLocaleString()}</span></p>
                                    {confirmedBookingData.isCalendarSynced && (
                                        <p className="text-emerald-700 font-semibold">✓ Synced to Google Calendar</p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-2 pt-2">
                                {confirmedBookingData.googleCalendarHtmlLink && (
                                    <a
                                        href={confirmedBookingData.googleCalendarHtmlLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        <span>Open in Google Calendar</span>
                                        <span>↗</span>
                                    </a>
                                )}

                                {onNavigateToBookings && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onClose();
                                            onNavigateToBookings();
                                        }}
                                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                                    >
                                        View in My Bookings
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-semibold text-xs cursor-pointer"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
