import React, { useState, useEffect } from 'react';
import { resolveLocationCoordinates, calculateHaversineDistance, KENYAN_ESTATES } from '../utils/geoLocations';
import type { Coordinates } from '../types';

interface LocationPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLocation?: string;
    onConfirm: (location: string, coords?: Coordinates) => void;
}

const PRIMARY_ESTATES = [
    { name: 'Ruaka', county: 'Kiambu County', text: 'Ruaka, Kiambu County' },
    { name: 'Kasarani', county: 'Nairobi County', text: 'Kasarani, Nairobi County' },
    { name: 'Westlands', county: 'Nairobi County', text: 'Westlands, Nairobi County' },
    { name: 'Kilimani', county: 'Nairobi County', text: 'Kilimani, Nairobi County' },
    { name: 'Nairobi CBD', county: 'Nairobi County', text: 'Nairobi CBD, Nairobi County' },
    { name: 'Lavington', county: 'Nairobi County', text: 'Lavington, Nairobi County' },
    { name: 'Karen', county: 'Nairobi County', text: 'Karen, Nairobi County' },
    { name: 'Upperhill', county: 'Nairobi County', text: 'Upperhill, Nairobi County' },
    { name: 'Roysambu', county: 'Nairobi County', text: 'Roysambu, Nairobi County' },
    { name: 'Kahawa Sukari', county: 'Kiambu County', text: 'Kahawa Sukari, Kiambu County' },
    { name: 'Thika', county: 'Kiambu County', text: 'Thika, Kiambu County' },
    { name: 'Ngong Road', county: 'Nairobi County', text: 'Ngong Road, Nairobi County' },
    { name: 'South B', county: 'Nairobi County', text: 'South B, Nairobi County' },
    { name: 'Mombasa', county: 'Mombasa County', text: 'Mombasa, Mombasa County' },
    { name: 'Nakuru', county: 'Nakuru County', text: 'Nakuru, Nakuru County' }
];

export const LocationPromptModal: React.FC<LocationPromptModalProps> = ({
    isOpen,
    onClose,
    currentLocation = '',
    onConfirm
}) => {
    const [selectedLocation, setSelectedLocation] = useState(currentLocation || 'Ruaka, Kiambu County');
    const [customCoords, setCustomCoords] = useState<Coordinates | undefined>(undefined);
    const [isLocating, setIsLocating] = useState(false);
    const [gpsError, setGpsError] = useState<string | null>(null);

    // Synchronize current location when modal opens
    useEffect(() => {
        if (currentLocation) {
            setSelectedLocation(currentLocation);
        }
    }, [currentLocation, isOpen]);

    if (!isOpen) return null;

    const resolved = resolveLocationCoordinates(selectedLocation, customCoords);

    // Calculate comparative distances to popular landmarks
    const ruakaGeo = resolveLocationCoordinates('Ruaka');
    const kasaraniGeo = resolveLocationCoordinates('Kasarani');
    const westlandsGeo = resolveLocationCoordinates('Westlands');

    const distToRuaka = calculateHaversineDistance(resolved.lat, resolved.lng, ruakaGeo.lat, ruakaGeo.lng);
    const distToKasarani = calculateHaversineDistance(resolved.lat, resolved.lng, kasaraniGeo.lat, kasaraniGeo.lng);
    const distToWestlands = calculateHaversineDistance(resolved.lat, resolved.lng, westlandsGeo.lat, westlandsGeo.lng);

    const handleDetectGps = () => {
        setIsLocating(true);
        setGpsError(null);

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setCustomCoords({ lat: latitude, lng: longitude });

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
                    setGpsError('Could not detect GPS location. Please select your neighborhood below.');
                },
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
            );
        } else {
            setIsLocating(false);
            setGpsError('Geolocation is not supported by your browser. Please select your neighborhood below.');
        }
    };

    const handleConfirm = () => {
        const trimmed = selectedLocation.trim();
        if (!trimmed) {
            alert('Location is required! You cannot go Live without setting your location.');
            return;
        }
        const coordsToUse: Coordinates = customCoords || { lat: resolved.lat, lng: resolved.lng };
        onConfirm(trimmed, coordsToUse);
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in font-sans">
            <div className="bg-white border-2 border-black p-5 w-full max-w-md rounded-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">📍</span>
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-wider text-black">Location Check-In & Distance Sync</h2>
                            <p className="text-[10px] font-extrabold text-neutral-600 uppercase tracking-tight">Accurate GPS & Kenyan Estate Proximity</p>
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
                    Select or detect your current neighborhood check-in location (e.g. <strong className="text-black font-bold">Ruaka</strong> or <strong className="text-black font-bold">Kasarani</strong>). Distances between service providers and clients are precisely calculated and logged.
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
                            <span>Detecting Precise GPS Location...</span>
                        </>
                    ) : (
                        <>
                            <span>🎯</span>
                            <span>Detect Live GPS Coordinates</span>
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
                        Selected Estate / Neighborhood *
                    </label>
                    <input
                        type="text"
                        value={selectedLocation}
                        onChange={(e) => {
                            setSelectedLocation(e.target.value);
                            setCustomCoords(undefined);
                        }}
                        placeholder="e.g. Ruaka, Kiambu or Kasarani, Nairobi"
                        className="w-full px-3 py-2 border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-neutral-400 bg-gray-50 placeholder-gray-400"
                    />
                </div>

                {/* RESOLVED COORDINATES & DISTANCE VERIFICATION CARD */}
                <div className="p-3 bg-neutral-900 text-white rounded-xl space-y-2 border border-neutral-700">
                    <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider">
                            ● Verified Hub: {resolved.estateName}
                        </span>
                        <span className="text-gray-400 font-mono text-[9px]">
                            [{resolved.lat.toFixed(4)}, {resolved.lng.toFixed(4)}]
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-1 text-[9.5px]">
                        <div className="bg-black/60 p-1.5 rounded-lg border border-neutral-800 text-center">
                            <span className="text-gray-400 block text-[8px] uppercase">To Ruaka</span>
                            <span className="font-bold text-amber-400">{distToRuaka} km</span>
                        </div>
                        <div className="bg-black/60 p-1.5 rounded-lg border border-neutral-800 text-center">
                            <span className="text-gray-400 block text-[8px] uppercase">To Kasarani</span>
                            <span className="font-bold text-emerald-400">{distToKasarani} km</span>
                        </div>
                        <div className="bg-black/60 p-1.5 rounded-lg border border-neutral-800 text-center">
                            <span className="text-gray-400 block text-[8px] uppercase">To Westlands</span>
                            <span className="font-bold text-blue-400">{distToWestlands} km</span>
                        </div>
                    </div>
                </div>

                {/* POPULAR NEIGHBORHOOD PILLS */}
                <div className="space-y-1">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400 block">
                        Quick Hub Check-In:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pt-1">
                        {PRIMARY_ESTATES.map(estate => {
                            const isSelected = selectedLocation.toLowerCase().includes(estate.name.toLowerCase());
                            return (
                                <button
                                    key={estate.name}
                                    type="button"
                                    onClick={() => {
                                        setSelectedLocation(estate.text);
                                        setCustomCoords(undefined);
                                    }}
                                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-black text-white border-black shadow-xs'
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                                    }`}
                                >
                                    {estate.name}
                                </button>
                            );
                        })}
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
                        className="flex-1 py-2.5 bg-black text-white hover:bg-gray-800 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                        <span>Check In & Go Live</span>
                        <span>⚡</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationPromptModal;
