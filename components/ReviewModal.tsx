
import React, { useState } from 'react';
import type { ServiceProvider } from '../types';

interface ReviewModalProps {
    pendingProviders: ServiceProvider[];
    isForced: boolean;
    postponeCount?: number;
    maxPostpones?: number;
    subtitle?: string;
    onRate: (providerId: string, rating: number, comment: string) => void;
    onFlag?: (providerId: string, reason: string) => void;
    onPostpone?: () => void;
    onNeverHappened?: (providerId: string) => void;
    onClose: () => void;
}

const FLAG_REASONS = [
    "Inappropriate content / service",
    "Unresponsive / Wrong contact info",
    "Spam or Scam activity",
    "Unprofessional behavior",
    "Other reason"
];

const StarInput: React.FC<{ rating: number; setRating: (r: number) => void }> = ({ rating, setRating }) => {
    return (
        <div className="flex gap-2 justify-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-transform hover:scale-110 ${star <= rating ? 'text-amber-400' : 'text-gray-300'}`}
                >
                    ★
                </button>
            ))}
        </div>
    );
};

const ReviewModal: React.FC<ReviewModalProps> = ({ 
    pendingProviders, 
    isForced, 
    postponeCount = 0, 
    maxPostpones = 3,
    subtitle,
    onRate, 
    onFlag, 
    onPostpone,
    onNeverHappened,
    onClose 
}) => {
    // We handle one provider at a time from the list
    const currentProvider = pendingProviders[0];
    const [mode, setMode] = useState<'rate' | 'flag'>('rate');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [selectedFlagReason, setSelectedFlagReason] = useState(FLAG_REASONS[0]);
    const [flagTextReason, setFlagTextReason] = useState('');

    if (!currentProvider) return null;

    const isPostponeBlocked = isForced || postponeCount >= maxPostpones;

    const handleSkipOrPostpone = () => {
        if (isPostponeBlocked) {
            alert(`Maximum ${maxPostpones} postpones reached. Please rate or flag this provider before proceeding.`);
            return;
        }
        if (onPostpone) {
            onPostpone();
        } else {
            onClose();
        }
    };

    const handleNever = () => {
        if (onNeverHappened) {
            onNeverHappened(currentProvider.id);
        } else {
            onClose();
        }
    };

    const handleSubmitRate = () => {
        if (rating === 0) {
            alert("Please select a star rating.");
            return;
        }
        onRate(currentProvider.id, rating, comment);
        // Reset local state for next provider
        setRating(0);
        setComment('');
        setMode('rate');
    };

    const handleSubmitFlag = () => {
        const fullReason = flagTextReason.trim() 
            ? `${selectedFlagReason}: ${flagTextReason.trim()}`
            : selectedFlagReason;

        if (onFlag) {
            onFlag(currentProvider.id, fullReason);
        } else {
            // Fallback: rate as 1 star with flag note
            onRate(currentProvider.id, 1, `[FLAGGED]: ${fullReason}`);
        }
        setFlagTextReason('');
        setMode('rate');
    };

    return (
        <div className="fixed inset-0 bg-black/85 z-[100] flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in font-sans">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 p-4 text-white text-center relative border-b border-amber-400/30 flex-shrink-0">
                    <button 
                        onClick={onClose} 
                        className="absolute top-3.5 right-3.5 text-gray-400 hover:text-white font-mono font-bold text-lg p-1 transition-colors"
                        title="Close"
                    >
                        ✕
                    </button>

                    <div className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-1.5">
                        <span>📱</span> Service Reminder
                    </div>

                    <h2 className="text-base font-black uppercase tracking-wide italic text-white leading-tight">
                        {mode === 'flag' 
                            ? "Flag / Report Profile" 
                            : "Rate Your Interaction"}
                    </h2>

                    {subtitle && (
                        <p className="text-[10.5px] text-amber-300 mt-1.5 font-bold leading-normal px-2 break-words">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Body */}
                <div className="p-5 overflow-y-auto no-scrollbar flex-1">
                    <div className="flex flex-col items-center mb-4 text-center">
                        <img 
                            src={currentProvider.avatarUrl} 
                            alt={currentProvider.name} 
                            className="w-16 h-16 rounded-2xl border-2 border-amber-400 shadow-md object-cover mb-1.5"
                        />
                        <h3 className="font-black text-gray-900 text-base leading-tight">{currentProvider.name}</h3>
                        <p className="text-[11px] text-amber-600 font-bold uppercase tracking-wider mt-0.5">{currentProvider.service}</p>
                    </div>

                    {mode === 'rate' ? (
                        <div className="text-center space-y-3">
                            <p className="text-xs text-gray-600 font-medium leading-relaxed">
                                Did you complete your service with {currentProvider.name}? Please leave a quick rating:
                            </p>
                            
                            <StarInput rating={rating} setRating={setRating} />
                            
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write a brief review (optional)..."
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none font-medium"
                                rows={2}
                            />

                            <button 
                                onClick={handleSubmitRate}
                                disabled={rating === 0}
                                className="w-full bg-black text-white font-black py-3 rounded-2xl shadow-md hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all active:scale-95 uppercase text-xs tracking-wider border border-black cursor-pointer"
                            >
                                Submit Rating
                            </button>

                            {/* Service Status Actions: Never Happened / Postpone / Flag */}
                            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                                <button 
                                    onClick={handleNever}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <span>🚫</span>
                                    <span>Never Happened (Service Didn't Take Place)</span>
                                </button>

                                <div className="flex items-center justify-between text-xs pt-1">
                                    <button 
                                        onClick={() => setMode('flag')}
                                        className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                        <span>🚩</span> Report Issue
                                    </button>

                                    {!isPostponeBlocked && (
                                        <button 
                                            onClick={handleSkipOrPostpone} 
                                            className="text-gray-500 font-bold hover:text-black underline tracking-wide cursor-pointer"
                                        >
                                            Remind Later in 6h ({maxPostpones - postponeCount} left)
                                        </button>
                                    )}
                                </div>
                                <p className="text-[9.5px] text-gray-500 text-center mt-2 font-medium">
                                    💡 Closing or postponing snoozes this prompt for 6 hours if action remains unfulfilled.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="text-xs font-black text-gray-800 mb-2 uppercase tracking-wider">Select Reason for Flagging:</p>
                            <div className="space-y-1.5 mb-3">
                                {FLAG_REASONS.map((reason) => (
                                    <button
                                        key={reason}
                                        type="button"
                                        onClick={() => setSelectedFlagReason(reason)}
                                        className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                            selectedFlagReason === reason 
                                                ? 'bg-red-50 border-red-500 text-red-700 shadow-xs' 
                                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {selectedFlagReason === reason ? '• ' : ''}{reason}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={flagTextReason}
                                onChange={(e) => setFlagTextReason(e.target.value)}
                                placeholder="Write details or reason for flagging..."
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-red-400 mb-3 resize-none font-medium"
                                rows={3}
                            />

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setMode('rate')}
                                    className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-2xl text-xs uppercase tracking-wider hover:bg-gray-200 cursor-pointer"
                                >
                                    Back
                                </button>
                                <button 
                                    onClick={handleSubmitFlag}
                                    className="flex-1 bg-red-600 text-white font-black py-2.5 rounded-2xl shadow-md hover:bg-red-700 transition-all active:scale-95 uppercase text-xs tracking-wider cursor-pointer"
                                >
                                    Submit Flag
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
