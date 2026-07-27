
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
                    className={`text-3xl transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
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
        <div className="fixed inset-0 bg-black/85 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in font-sans">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden transform transition-all border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 p-4 text-white text-center relative border-b border-amber-400/30">
                    {!isPostponeBlocked && (
                        <button 
                            onClick={handleSkipOrPostpone} 
                            className="absolute top-3.5 right-3.5 text-amber-400 hover:text-white text-[9.5px] font-black uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-full border border-amber-400/30 transition-all hover:scale-105"
                        >
                            Skip / Postpone ({postponeCount}/{maxPostpones})
                        </button>
                    )}

                    <div className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider mb-1">
                        <span>📱</span> Contact Review
                    </div>

                    <h2 className="text-base font-black uppercase tracking-tight italic">
                        {mode === 'flag' 
                            ? "Flag / Report Profile" 
                            : isPostponeBlocked 
                                ? "Rating Required" 
                                : "Rate Previous Interaction"}
                    </h2>

                    {subtitle && (
                        <p className="text-[10px] text-amber-300 mt-1 font-bold bg-white/10 py-1 px-2.5 rounded-xl inline-block">
                            {subtitle}
                        </p>
                    )}

                    {isPostponeBlocked && mode === 'rate' && (
                        <p className="text-[9.5px] text-red-300 mt-1 font-bold bg-red-950/60 py-1 px-3 rounded-full inline-block uppercase tracking-wider border border-red-500/40">
                            Postpone limit reached ({postponeCount}/{maxPostpones}). Rating required to continue.
                        </p>
                    )}
                </div>

                {/* Body */}
                <div className="p-5">
                    <div className="flex flex-col items-center mb-4 text-center">
                        <img 
                            src={currentProvider.avatarUrl} 
                            alt={currentProvider.name} 
                            className="w-16 h-16 rounded-2xl border-2 border-amber-400 shadow-md object-cover mb-1.5"
                        />
                        <h3 className="font-black text-gray-900 text-base">{currentProvider.name}</h3>
                        <p className="text-[11px] text-gray-500 font-bold">{currentProvider.service}</p>
                    </div>

                    {mode === 'rate' ? (
                        <div className="text-center">
                            <p className="text-xs text-gray-600 mb-2 font-semibold">How was your recent contact with this provider?</p>
                            <StarInput rating={rating} setRating={setRating} />
                            
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write a brief review (optional)..."
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 mb-3 resize-none font-medium"
                                rows={2}
                            />

                            <button 
                                onClick={handleSubmitRate}
                                disabled={rating === 0}
                                className="w-full bg-black text-white font-black py-3 rounded-2xl shadow-md hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all active:scale-95 uppercase text-xs tracking-wider border border-black"
                            >
                                Submit Star Review
                            </button>

                            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col items-center gap-2">
                                <button 
                                    onClick={() => setMode('flag')}
                                    className="text-xs text-red-600 hover:text-red-700 font-black flex items-center justify-center gap-1 transition-colors"
                                >
                                    <span>🚩</span> Flag / Report Profile
                                </button>

                                {!isPostponeBlocked && (
                                    <button 
                                        onClick={handleSkipOrPostpone} 
                                        className="text-xs text-gray-500 font-bold hover:text-black underline tracking-wide"
                                    >
                                        Postpone for now ({maxPostpones - postponeCount} left)
                                    </button>
                                )}
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
                                        className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all border ${
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
                                placeholder="Write details or reason for flagging (required for review)..."
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-red-400 mb-3 resize-none font-medium"
                                rows={3}
                            />

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setMode('rate')}
                                    className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-2xl text-xs uppercase tracking-wider hover:bg-gray-200"
                                >
                                    Back
                                </button>
                                <button 
                                    onClick={handleSubmitFlag}
                                    className="flex-1 bg-red-600 text-white font-black py-2.5 rounded-2xl shadow-md hover:bg-red-700 transition-all active:scale-95 uppercase text-xs tracking-wider"
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
