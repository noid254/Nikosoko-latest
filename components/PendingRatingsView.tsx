import React, { useState } from 'react';
import type { ServiceProvider } from '../types';

interface PendingRatingsViewProps {
  unratedProviders: ServiceProvider[];
  onRateProvider: (providerId: string, rating: number, comment: string) => void;
  onFlagProvider: (providerId: string, reason: string) => void;
  onSnoozeProvider?: (providerId: string) => void;
  onBack: () => void;
  targetProvider?: ServiceProvider | null;
  onContinueAction?: () => void;
}

const StarIcon = ({ filled, onClick }: { filled: boolean; onClick?: () => void }) => (
  <svg 
    onClick={onClick}
    className={`w-6 h-6 ${filled ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-transparent'} transition-colors cursor-pointer hover:scale-110`} 
    viewBox="0 0 20 20" 
    stroke="currentColor" 
    strokeWidth={1}
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export const PendingRatingsView: React.FC<PendingRatingsViewProps> = ({
  unratedProviders,
  onRateProvider,
  onFlagProvider,
  onSnoozeProvider,
  onBack,
  targetProvider,
  onContinueAction
}) => {
  const [selectedProviderId, setSelectedProviderId] = useState<string>(
    unratedProviders[0]?.id || ''
  );
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [commentText, setCommentText] = useState<string>('');
  const [flagReason, setFlagReason] = useState<string>('');
  const [showFlagInput, setShowFlagInput] = useState<boolean>(false);
  const [ratedCountThisSession, setRatedCountThisSession] = useState<number>(0);

  const selectedProvider = unratedProviders.find(p => p.id === selectedProviderId) || unratedProviders[0];

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;

    onRateProvider(selectedProvider.id, ratingValue, commentText);
    setRatedCountThisSession(prev => prev + 1);
    setCommentText('');
    setRatingValue(5);
    setShowFlagInput(false);

    // Auto select next unrated provider
    const nextUnrated = unratedProviders.filter(p => p.id !== selectedProvider.id);
    if (nextUnrated.length > 0) {
      setSelectedProviderId(nextUnrated[0].id);
    }
  };

  const handleFlagSubmit = () => {
    if (!selectedProvider || !flagReason.trim()) return;
    onFlagProvider(selectedProvider.id, flagReason);
    setRatedCountThisSession(prev => prev + 1);
    setFlagReason('');
    setShowFlagInput(false);

    const nextUnrated = unratedProviders.filter(p => p.id !== selectedProvider.id);
    if (nextUnrated.length > 0) {
      setSelectedProviderId(nextUnrated[0].id);
    }
  };

  const isClearToProceed = unratedProviders.length <= 3 || ratedCountThisSession > 0;

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-28 max-w-md mx-auto border-x border-gray-100 relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 px-3.5 py-3 flex items-center justify-between shadow-2xs">
        <button
          type="button"
          onClick={onBack}
          className="p-2 bg-gray-50 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-1.5 text-xs font-black"
        >
          <span>← Back</span>
        </button>

        <div className="text-center">
          <h1 className="text-xs font-black text-brand-navy tracking-tight uppercase leading-none">
            Pending Service Ratings
          </h1>
          <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mt-0.5">
            {unratedProviders.length} Providers Pending
          </p>
        </div>

        <div className="w-12"></div>
      </header>

      {/* Content */}
      <main className="p-3.5 space-y-4">

        {/* Informational Alert Box */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 rounded-2xl shadow-md space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <h2 className="font-black text-xs uppercase tracking-wide">Rate Your Interactions</h2>
          </div>
          <p className="text-[11px] font-semibold text-amber-100 leading-snug">
            You have contacted <strong className="text-white underline">{unratedProviders.length} service providers</strong>. Please choose which provider you want to rate first below to maintain trust across Nikosoko!
          </p>
        </div>

        {/* Provider Selector Carousel / List */}
        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-700">
            1. Choose Provider to Rate First ({unratedProviders.length} Remaining)
          </label>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {unratedProviders.map((provider, index) => {
              const isSelected = provider.id === selectedProvider?.id;
              return (
                <button
                  key={provider.id ? `pending_${provider.id}_${index}` : `pending_${index}`}
                  type="button"
                  onClick={() => {
                    setSelectedProviderId(provider.id);
                    setShowFlagInput(false);
                  }}
                  className={`flex-shrink-0 w-36 p-2.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-brand-navy text-white border-brand-navy ring-2 ring-brand-navy/30 scale-102 shadow-md'
                      : 'bg-white text-gray-900 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <img
                      src={provider.avatarUrl}
                      alt={provider.name}
                      className="w-8 h-8 rounded-full object-cover border border-white"
                    />
                    <div className="min-w-0">
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase block w-fit ${
                        isSelected ? 'bg-amber-400 text-black' : 'bg-amber-100 text-amber-800'
                      }`}>
                        #{index + 1} Pending
                      </span>
                    </div>
                  </div>
                  <h3 className="font-extrabold text-[11px] leading-tight truncate">
                    {provider.name}
                  </h3>
                  <p className={`text-[9px] truncate font-medium ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                    {provider.service}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Provider Rating Form Card */}
        {selectedProvider ? (
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4 animate-fade-in">
            {/* Header profile info */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={selectedProvider.avatarUrl}
                  alt={selectedProvider.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-brand-navy shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm text-gray-900 truncate">{selectedProvider.name}</h3>
                  <p className="text-xs text-brand-navy font-bold truncate">{selectedProvider.service}</p>
                  <p className="text-[10px] text-gray-500 font-medium truncate">{selectedProvider.location || 'Nairobi, Kenya'}</p>
                </div>
              </div>
              {onSnoozeProvider && (
                <button
                  type="button"
                  onClick={() => onSnoozeProvider(selectedProvider.id)}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 transition-colors cursor-pointer"
                  title="Prompt window will disappear and return in 6 hours"
                >
                  ⏰ Snooze 6h
                </button>
              )}
            </div>

            <form onSubmit={handleRatingSubmit} className="space-y-4">
              {/* Star Rating Input */}
              <div className="text-center space-y-1 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">
                  Select Rating Score
                </span>
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      filled={star <= ratingValue}
                      onClick={() => setRatingValue(star)}
                    />
                  ))}
                </div>
                <p className="text-xs font-black text-brand-navy">
                  {ratingValue === 5 && '🌟 Excellent Service (5/5)'}
                  {ratingValue === 4 && '👍 Very Good (4/5)'}
                  {ratingValue === 3 && '👌 Satisfactory (3/5)'}
                  {ratingValue === 2 && '⚠️ Needs Improvement (2/5)'}
                  {ratingValue === 1 && '👎 Unsatisfactory (1/5)'}
                </p>
              </div>

              {/* Preset Feedback Tags */}
              <div>
                <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1.5">
                  Quick Feedback Tag:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['Punctual & Fast', 'Fair Pricing', 'High Quality Work', 'Courteous', 'Doorstep Ready'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setCommentText(prev => prev ? `${prev} • ${tag}` : tag)}
                      className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-2.5 py-1 rounded-lg transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text area */}
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-700 tracking-wider mb-1">
                  Written Feedback (Optional)
                </label>
                <textarea
                  rows={2}
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder={`Write your experience with ${selectedProvider.name}...`}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-medium text-gray-900 focus:outline-none focus:border-brand-navy focus:bg-white"
                />
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  className="w-full bg-brand-navy hover:bg-black text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-98"
                >
                  Submit Rating for {selectedProvider.name.split(' ')[0]}
                </button>

                {!showFlagInput ? (
                  <button
                    type="button"
                    onClick={() => setShowFlagInput(true)}
                    className="w-full text-center text-[10px] font-black text-red-600 hover:underline py-1"
                  >
                    🚩 Flag or Report Profile Issue
                  </button>
                ) : (
                  <div className="bg-red-50 p-3 rounded-xl border border-red-200 space-y-2">
                    <span className="text-[10px] font-black text-red-800 uppercase block">Report Profile / Service Issue</span>
                    <input
                      type="text"
                      value={flagReason}
                      onChange={e => setFlagReason(e.target.value)}
                      placeholder="Reason for flagging..."
                      className="w-full bg-white border border-red-300 rounded-lg p-2 text-xs font-semibold text-gray-900"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleFlagSubmit}
                        className="flex-1 bg-red-600 text-white py-1.5 rounded-lg text-xs font-black uppercase"
                      >
                        Confirm Flag
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowFlagInput(false)}
                        className="px-3 bg-gray-200 text-gray-700 rounded-lg text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </form>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-2">
            <span className="text-4xl">🎉</span>
            <h3 className="font-extrabold text-sm text-emerald-900">All Pending Ratings Completed!</h3>
            <p className="text-xs text-emerald-700 font-medium">Thank you for rating your service providers and keeping Nikosoko trustworthy!</p>
          </div>
        )}

        {/* Continue to Target Provider CTA if available */}
        {targetProvider && (
          <div className="bg-white p-3.5 rounded-2xl border border-amber-300 shadow-sm space-y-2 text-center">
            <span className="text-[10px] font-extrabold uppercase text-gray-500 block">Pending CTA Target:</span>
            <p className="text-xs font-extrabold text-gray-900">Contacting {targetProvider.name}</p>
            <button
              type="button"
              onClick={() => {
                if (onContinueAction) onContinueAction();
                onBack();
              }}
              disabled={!isClearToProceed && unratedProviders.length > 3}
              className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                isClearToProceed || unratedProviders.length <= 3
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isClearToProceed || unratedProviders.length <= 3
                ? `Continue to Contact ${targetProvider.name.split(' ')[0]} ➔`
                : 'Rate at least 1 provider above to proceed'}
            </button>
          </div>
        )}

      </main>
    </div>
  );
};

export default PendingRatingsView;
