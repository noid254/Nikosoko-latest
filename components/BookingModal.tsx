import React, { useState, useEffect } from 'react';
import type { ServiceProvider, InboxMessage } from '../types';
import { 
    auth, 
    signInWithGoogle, 
    getCachedAccessToken, 
    createGoogleCalendarEvent, 
    googleSignOut 
} from '../services/googleCalendar';
import { User } from 'firebase/auth';

interface BookingModalProps {
    provider: ServiceProvider;
    onClose: () => void;
    onBookingSuccess?: (message: InboxMessage) => void;
}

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const BookingModal: React.FC<BookingModalProps> = ({ provider, onClose, onBookingSuccess }) => {
    // Current local date YYYY-MM-DD
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    const [date, setDate] = useState(tomorrowStr);
    const [time, setTime] = useState('10:00');
    const [notes, setNotes] = useState('');
    const [googleUser, setGoogleUser] = useState<User | null>(auth.currentUser);
    const [accessToken, setAccessToken] = useState<string | null>(getCachedAccessToken());
    
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmedStep, setConfirmedStep] = useState(false);
    const [successData, setSuccessData] = useState<{ eventId?: string; htmlLink?: string } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setGoogleUser(user);
            setAccessToken(getCachedAccessToken());
        });
        return () => unsubscribe();
    }, []);

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

    const handleConfirmBooking = async () => {
        if (!googleUser || !accessToken) {
            setErrorMessage('Email authentication with Google is required to confirm booking.');
            return;
        }

        if (!date || !time) {
            setErrorMessage('Please select a valid date and time.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            // 1. Create Google Calendar Event
            const calResult = await createGoogleCalendarEvent(accessToken, {
                serviceTitle: provider.service || 'Service Booking',
                providerName: provider.name,
                providerEmail: undefined,
                userEmail: googleUser.email || '',
                date,
                time,
                notes,
                location: provider.location || 'Nikosoko Appointment'
            });

            if (!calResult.success) {
                throw new Error(calResult.error || 'Could not sync booking to Google Calendar.');
            }

            // 2. Save Booking to local messages DB
            const newMsg: InboxMessage = {
                id: Date.now(),
                sender: 'user',
                text: `Confirmed Booking with ${provider.name} (${provider.service}) for ${date} at ${time}. Event synced to Google Calendar (${googleUser.email}). Notes: ${notes || 'None'}`,
                timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            };

            // Save to localStorage messages table
            try {
                const existing = JSON.parse(localStorage.getItem('nikosoko_db_messages') || '[]');
                existing.unshift(newMsg);
                localStorage.setItem('nikosoko_db_messages', JSON.stringify(existing));
            } catch (e) {
                console.error('Error saving message to storage:', e);
            }

            if (onBookingSuccess) {
                onBookingSuccess(newMsg);
            }

            setSuccessData({
                eventId: calResult.eventId,
                htmlLink: calResult.htmlLink
            });
        } catch (err: any) {
            console.error('Booking failed:', err);
            setErrorMessage(err.message || 'An unexpected error occurred while confirming booking.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4 font-sans animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-brand-navy p-4 text-white flex items-center justify-between relative">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-400 text-black flex items-center justify-center shadow-sm">
                            <CalendarIcon />
                        </div>
                        <div>
                            <h3 className="font-black text-sm uppercase tracking-wide">Book Appointment</h3>
                            <p className="text-[10px] text-gray-300 font-bold uppercase">Linked with Google Calendar</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Content Body */}
                <div className="p-5 overflow-y-auto space-y-4 flex-1">

                    {/* Success View */}
                    {successData ? (
                        <div className="text-center py-6 space-y-4 animate-fade-in">
                            <div className="flex justify-center">
                                <CheckCircleIcon />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 uppercase">Booking Confirmed!</h2>
                            <p className="text-xs text-gray-600 px-4 leading-relaxed font-medium">
                                Your appointment with <strong className="text-black">{provider.name}</strong> for <strong className="text-black">{date}</strong> at <strong className="text-black">{time}</strong> has been successfully booked and added to your Google Calendar.
                            </p>

                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left text-xs space-y-1.5">
                                <div className="text-[10px] font-black uppercase text-amber-800 tracking-wider">Calendar Event Summary</div>
                                <p className="font-bold text-gray-800">📅 {date} @ {time}</p>
                                <p className="text-gray-600">👤 Provider: {provider.name} ({provider.service})</p>
                                <p className="text-gray-600">📧 Linked Email: {googleUser?.email}</p>
                            </div>

                            <div className="pt-2 flex flex-col gap-2">
                                {successData.htmlLink && (
                                    <a 
                                        href={successData.htmlLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
                                    >
                                        <span>View in Google Calendar</span>
                                        <span>↗</span>
                                    </a>
                                )}
                                <button 
                                    onClick={onClose}
                                    className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs uppercase tracking-wider"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Provider Info Card */}
                            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                <img 
                                    src={provider.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300'} 
                                    alt={provider.name} 
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-sm text-gray-900 truncate">{provider.name}</h4>
                                    <p className="text-xs text-gray-500 font-bold truncate">{provider.service}</p>
                                    <p className="text-[10px] text-amber-600 font-black mt-0.5">
                                        {provider.currency || 'KSh'} {provider.hourlyRate?.toLocaleString() || '1,000'} / session
                                    </p>
                                </div>
                            </div>

                            {/* Error Banner */}
                            {errorMessage && (
                                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-bold leading-relaxed">
                                    ⚠️ {errorMessage}
                                </div>
                            )}

                            {/* STEP 1: Email Authentication with Google */}
                            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                                        1. Authentication & Email
                                    </span>
                                    {googleUser && (
                                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                                            ✓ Connected
                                        </span>
                                    )}
                                </div>

                                {googleUser ? (
                                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-200 shadow-xs">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            {googleUser.photoURL ? (
                                                <img src={googleUser.photoURL} alt="" className="w-7 h-7 rounded-full" />
                                            ) : (
                                                <div className="w-7 h-7 rounded-full bg-amber-400 text-black flex items-center justify-center font-black text-xs">
                                                    {(googleUser.email || 'U')[0].toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-gray-900 truncate">{googleUser.displayName || 'Google User'}</p>
                                                <p className="text-[10px] text-gray-500 truncate">{googleUser.email}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={googleSignOut}
                                            className="text-[10px] text-gray-400 hover:text-red-600 font-bold px-2 py-1"
                                        >
                                            Switch
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-xs text-gray-600 font-medium">
                                            To confirm your booking and automatically sync it to your calendar, please sign in with your Google Email.
                                        </p>
                                        <button 
                                            type="button"
                                            onClick={handleGoogleAuth}
                                            disabled={isAuthenticating}
                                            className="w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl shadow-xs font-black text-xs text-gray-800 flex items-center justify-center gap-2.5 transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            <svg className="w-4 h-4" viewBox="0 0 48 48">
                                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                            </svg>
                                            <span>{isAuthenticating ? 'Connecting Google Account...' : 'Continue with Google Email'}</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* STEP 2: Booking Details Form */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                                    2. Date & Time Selection
                                </span>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Date</label>
                                        <input 
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-brand-navy"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Time</label>
                                        <input 
                                            type="time"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-brand-navy"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Booking Notes / Requirements</label>
                                    <textarea 
                                        rows={2}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="e.g. Need assistance with plumbing repair at 2nd Floor Unit B..."
                                        className="w-full p-2.5 border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-brand-navy resize-none"
                                    />
                                </div>
                            </div>

                            {/* User Confirmation Step */}
                            {googleUser && !confirmedStep ? (
                                <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs space-y-2">
                                    <p className="font-bold text-amber-900 leading-snug">
                                        📅 Sync to Google Calendar Notice
                                    </p>
                                    <p className="text-amber-800 text-[11px] leading-relaxed">
                                        By confirming, an event titled <strong>"Booking: {provider.service} with {provider.name}"</strong> will be added directly to your Google Calendar (<code>{googleUser.email}</code>) on {date} at {time}.
                                    </p>
                                    <button 
                                        onClick={() => setConfirmedStep(true)}
                                        className="w-full mt-1 py-2.5 bg-amber-400 hover:bg-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-transform active:scale-95"
                                    >
                                        I Confirm & Agree
                                    </button>
                                </div>
                            ) : null}

                            {/* Submit Button */}
                            {googleUser && confirmedStep && (
                                <button 
                                    onClick={handleConfirmBooking}
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-brand-navy hover:bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Syncing to Calendar...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Confirm Booking & Add to Calendar 📅</span>
                                        </>
                                    )}
                                </button>
                            )}

                            {!googleUser && (
                                <button 
                                    onClick={handleGoogleAuth}
                                    disabled={isAuthenticating}
                                    className="w-full py-3.5 bg-gray-900 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-transform active:scale-95"
                                >
                                    Sign in with Email to Continue
                                </button>
                            )}
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};
