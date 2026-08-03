import React, { useState } from 'react';

interface LocationPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLocation?: string;
    onConfirm: (location: string) => void;
}

const POPULAR_ESTATES = [
    'Ruaka, Kiambu County',
    'Westlands, Nairobi County',
    'Kilimani, Nairobi County',
    'Nairobi CBD, Nairobi County',
    'Lavington, Nairobi County',
    'Karen, Nairobi County',
    'Upperhill, Nairobi County',
    'Ngong Road, Kajiado County',
    'Kasarani, Nairobi County',
    'Thika, Kiambu County',
    'Mombasa, Mombasa County',
    'Nakuru, Nakuru County',
    'Kisumu, Kisumu County'
];

export const LocationPromptModal: React.FC<LocationPromptModalProps> = ({
    isOpen,
    onClose,
    currentLocation = '',
    onConfirm
}) => {
    const [selectedLocation, setSelectedLocation] = useState(currentLocation || '');
    const [isLocating, setIsLocating] = useState(false);
    const [gpsError, setGpsError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleDetectGps = () => {
        setIsLocating(true);
        setGpsError(null);

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 4000);
                        const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                            { signal: controller.signal }
                        );
                        clearTimeout(timeoutId);
                        if (res.ok) {
                            const data = await res.json();
                            const addr = data.address || {};
                            const suburb = addr.suburb || addr.neighbourhood || addr.quarter || addr.town || addr.city || addr.village || 'Ruaka';
                            const county = addr.county || addr.state || 'Kiambu County';
                            const locationName = `${suburb}, ${county}`;
                            setSelectedLocation(locationName);
                            setIsLocating(false);
                            return;
                        }
                    } catch (e) {
                        // Fallback to location name if fetch fails or times out
                    }
                    setIsLocating(false);
                    setSelectedLocation('Ruaka, Kiambu County');
                },
                (err) => {
                    setIsLocating(false);
                    setGpsError('Could not detect location. Please type or select your location below.');
                },
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
            );
        } else {
            setIsLocating(false);
            setGpsError('Geolocation is not supported by your browser. Please type or select your location.');
        }
    };

    const handleConfirm = () => {
        const trimmed = selectedLocation.trim();
        if (!trimmed) {
            alert('Location is required! You cannot go Live without setting your location.');
            return;
        }
        onConfirm(trimmed);
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in font-sans">
            <div className="bg-white border-2 border-black p-5 w-full max-w-sm rounded-2xl shadow-2xl space-y-4">
                <div className="flex items-start justify-between border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">📍</span>
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-wider text-black">Update Your Location</h2>
                            <p className="text-[10px] font-extrabold text-neutral-600 uppercase tracking-tight">Location required to Go Live</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-black font-mono font-bold text-lg p-1 cursor-pointer"
                        title="Cancel"
                    >
                        ✕
                    </button>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                    To be visible to nearby clients when you <strong className="text-black font-black">Go Live</strong>, please confirm your location name or neighborhood (e.g. Ruaka, Kiambu County).
                </p>

                {/* GPS AUTO-DETECT BUTTON */}
                <button
                    onClick={handleDetectGps}
                    disabled={isLocating}
                    className="w-full py-2.5 px-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                    {isLocating ? (
                        <>
                            <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                            <span>Detecting Location Name...</span>
                        </>
                    ) : (
                        <>
                            <span>🎯</span>
                            <span>Detect My Location Name</span>
                        </>
                    )}
                </button>

                {gpsError && (
                    <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded-lg border border-red-200">
                        {gpsError}
                    </p>
                )}

                {/* MANUAL LOCATION INPUT */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-black block">
                        Estate & County Name *
                    </label>
                    <input
                        type="text"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        placeholder="e.g. Ruaka, Kiambu County"
                        className="w-full px-3 py-2 border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-neutral-400 bg-gray-50 placeholder-gray-400"
                    />
                </div>

                {/* POPULAR NEIGHBORHOOD PILLS */}
                <div className="space-y-1">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400 block">
                        Quick Select Location:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pt-1">
                        {POPULAR_ESTATES.map(estate => (
                            <button
                                key={estate}
                                type="button"
                                onClick={() => setSelectedLocation(estate)}
                                className={`px-2 py-1 text-[9.5px] font-bold rounded-lg border transition-all cursor-pointer ${
                                    selectedLocation.includes(estate)
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                                }`}
                            >
                                {estate}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="pt-2 border-t border-dashed border-gray-200 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 bg-white text-gray-600 hover:text-black border border-gray-300 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                        Stay Offline
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="flex-1 py-2.5 bg-black text-white hover:bg-gray-800 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                        Go Live ⚡
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationPromptModal;
