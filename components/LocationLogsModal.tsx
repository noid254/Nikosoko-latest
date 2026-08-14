import React, { useState, useEffect } from 'react';
import type { LocationCheckInLog, Coordinates } from '../types';
import { KENYAN_ESTATES, calculateHaversineDistance, resolveLocationCoordinates, getLocalCheckInLogs, recordLocationCheckIn } from '../utils/geoLocations';
import { getLocationCheckInLogs } from '../services/api';

interface LocationLogsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLocation?: string;
    onSelectLocation?: (locationName: string, coords?: Coordinates) => void;
}

export const LocationLogsModal: React.FC<LocationLogsModalProps> = ({
    isOpen,
    onClose,
    currentLocation = 'Ruaka, Kiambu County',
    onSelectLocation
}) => {
    const [activeTab, setActiveTab] = useState<'logs' | 'calculator' | 'matrix'>('logs');
    const [logs, setLogs] = useState<LocationCheckInLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Interactive Distance Calculator State
    const [fromEstate, setFromEstate] = useState('Ruaka');
    const [toEstate, setToEstate] = useState('Kasarani');
    const [simulatedUser, setSimulatedUser] = useState('Guest Visitor');

    useEffect(() => {
        if (!isOpen) return;

        const loadLogs = async () => {
            setIsLoading(true);
            try {
                const apiLogs = await getLocationCheckInLogs({ limit: 50 });
                const localLogs = getLocalCheckInLogs();
                
                // Combine and deduplicate
                const combined = [...apiLogs];
                localLogs.forEach(locLog => {
                    if (!combined.some(l => l.id === locLog.id)) {
                        combined.push(locLog);
                    }
                });

                // Sort by timestamp descending
                combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                setLogs(combined);
            } catch (err) {
                console.error('Failed to load checkin logs:', err);
                setLogs(getLocalCheckInLogs());
            } finally {
                setIsLoading(false);
            }
        };

        loadLogs();
    }, [isOpen]);

    if (!isOpen) return null;

    // Calculate distance between fromEstate and toEstate
    const fromGeo = resolveLocationCoordinates(fromEstate);
    const toGeo = resolveLocationCoordinates(toEstate);
    const calculatedDist = calculateHaversineDistance(fromGeo.lat, fromGeo.lng, toGeo.lat, toGeo.lng);

    const handleRecordSimulatedCheckIn = async (location: string) => {
        const geo = resolveLocationCoordinates(location);
        const newLog = await recordLocationCheckIn(
            { id: `usr_${Date.now()}`, name: simulatedUser || 'Visitor', role: 'Member', location },
            location,
            { lat: geo.lat, lng: geo.lng },
            'manual_update',
            `Manual check-in at ${location}`
        );

        setLogs(prev => [newLog, ...prev]);
        if (onSelectLocation) {
            onSelectLocation(location, { lat: geo.lat, lng: geo.lng });
        }
    };

    const estateNames = Object.keys(KENYAN_ESTATES);

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-fade-in font-sans">
            <div className="bg-white border-2 border-black w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-black text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <span className="text-xl p-1 bg-white/20 rounded-lg">📍</span>
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-wider">Location Check-In & Distance Logs</h2>
                            <p className="text-[10px] text-gray-300 font-mono">SQLite Distance Verification & Estate Registry</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white font-mono font-bold text-lg p-1 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50 text-[11px] font-black uppercase tracking-wider">
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`flex-1 py-2.5 text-center transition-all cursor-pointer ${
                            activeTab === 'logs' ? 'bg-white text-black border-b-2 border-black font-extrabold' : 'text-gray-500 hover:text-black'
                        }`}
                    >
                        Check-in Logs ({logs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('calculator')}
                        className={`flex-1 py-2.5 text-center transition-all cursor-pointer ${
                            activeTab === 'calculator' ? 'bg-white text-black border-b-2 border-black font-extrabold' : 'text-gray-500 hover:text-black'
                        }`}
                    >
                        Distance Calculator
                    </button>
                    <button
                        onClick={() => setActiveTab('matrix')}
                        className={`flex-1 py-2.5 text-center transition-all cursor-pointer ${
                            activeTab === 'matrix' ? 'bg-white text-black border-b-2 border-black font-extrabold' : 'text-gray-500 hover:text-black'
                        }`}
                    >
                        Estates Matrix
                    </button>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* TAB 1: LOGS */}
                    {activeTab === 'logs' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] text-gray-600 font-medium">
                                    Stored check-in coordinates distinguishing user locations (e.g. <strong>Ruaka</strong> vs <strong>Kasarani</strong>).
                                </p>
                                <span className="text-[9.5px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                                    SQLite Synced
                                </span>
                            </div>

                            {/* Quick Check-in Buttons */}
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                                <span className="text-[9.5px] font-black uppercase tracking-widest text-gray-500 block">
                                    Quick Check-in Simulator:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {['Ruaka, Kiambu County', 'Kasarani, Nairobi County', 'Westlands, Nairobi County', 'Kilimani, Nairobi County', 'Thika, Kiambu County'].map(loc => (
                                        <button
                                            key={loc}
                                            onClick={() => handleRecordSimulatedCheckIn(loc)}
                                            className="px-2.5 py-1 text-[10px] font-bold bg-white hover:bg-black hover:text-white border border-gray-300 rounded-lg transition-colors cursor-pointer"
                                        >
                                            + Check in at {loc.split(',')[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Logs list */}
                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    <p className="text-xs text-gray-500 mt-2 font-bold">Loading check-in logs...</p>
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                    <p className="text-xs text-gray-500 font-bold">No location check-in logs recorded yet.</p>
                                    <p className="text-[10px] text-gray-400 mt-1">Use the quick check-in buttons above or Go Live in profile.</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                    {logs.map((log, idx) => (
                                        <div 
                                            key={log.id || idx}
                                            className="p-3 bg-white rounded-xl border border-gray-200 hover:border-black transition-all shadow-2xs text-left space-y-1.5"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                    <span className="font-bold text-xs text-black">{log.userName}</span>
                                                    <span className="text-[9px] font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                                        {log.userRole || 'Member'}
                                                    </span>
                                                </div>
                                                <span className="text-[9px] font-mono text-gray-400">
                                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="font-bold text-gray-800 flex items-center gap-1">
                                                    📍 {log.locationName || log.estateName}
                                                </span>
                                                <span className="font-mono text-[9.5px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                                                    [{log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}]
                                                </span>
                                            </div>

                                            {log.notes && (
                                                <p className="text-[10px] text-gray-500 italic">
                                                    "{log.notes}"
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: DISTANCE CALCULATOR */}
                    {activeTab === 'calculator' && (
                        <div className="space-y-4">
                            <p className="text-[11px] text-gray-600 font-medium">
                                Exact Haversine formula distance calculation between Kenyan estates & check-in hubs:
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-black block mb-1">
                                        From Location:
                                    </label>
                                    <select
                                        value={fromEstate}
                                        onChange={e => setFromEstate(e.target.value)}
                                        className="w-full p-2.5 border-2 border-black rounded-xl text-xs font-bold bg-gray-50 text-black"
                                    >
                                        {estateNames.map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                    <span className="text-[9px] font-mono text-gray-500 block mt-1">
                                        [{fromGeo.lat.toFixed(4)}, {fromGeo.lng.toFixed(4)}]
                                    </span>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-black block mb-1">
                                        To Location:
                                    </label>
                                    <select
                                        value={toEstate}
                                        onChange={e => setToEstate(e.target.value)}
                                        className="w-full p-2.5 border-2 border-black rounded-xl text-xs font-bold bg-gray-50 text-black"
                                    >
                                        {estateNames.map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                    <span className="text-[9px] font-mono text-gray-500 block mt-1">
                                        [{toGeo.lat.toFixed(4)}, {toGeo.lng.toFixed(4)}]
                                    </span>
                                </div>
                            </div>

                            {/* Result Display Box */}
                            <div className="p-4 bg-neutral-900 text-white rounded-2xl border-2 border-black space-y-2 text-center shadow-lg">
                                <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold block">
                                    Calculated Geodesic Distance
                                </span>
                                <div className="text-3xl font-black font-mono text-emerald-400">
                                    {calculatedDist} km
                                </div>
                                <p className="text-[11px] text-gray-300 font-medium">
                                    From <strong className="text-white">{fromGeo.estateName} ({fromGeo.county})</strong> to <strong className="text-white">{toGeo.estateName} ({toGeo.county})</strong>
                                </p>
                            </div>

                            {/* Comparison highlights */}
                            <div className="space-y-1.5 pt-2">
                                <span className="text-[9.5px] font-black uppercase tracking-wider text-gray-500 block">
                                    Key Benchmark Routes:
                                </span>
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="font-bold text-gray-800 block">Ruaka ↔ Kasarani</span>
                                        <span className="font-mono text-emerald-600 font-extrabold">13.5 km</span>
                                    </div>
                                    <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="font-bold text-gray-800 block">Ruaka ↔ Westlands</span>
                                        <span className="font-mono text-emerald-600 font-extrabold">8.8 km</span>
                                    </div>
                                    <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="font-bold text-gray-800 block">Kasarani ↔ Nairobi CBD</span>
                                        <span className="font-mono text-emerald-600 font-extrabold">12.0 km</span>
                                    </div>
                                    <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="font-bold text-gray-800 block">Ruaka ↔ Nairobi CBD</span>
                                        <span className="font-mono text-emerald-600 font-extrabold">12.5 km</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: MATRIX */}
                    {activeTab === 'matrix' && (
                        <div className="space-y-3">
                            <p className="text-[11px] text-gray-600 font-medium">
                                Full distance matrix relative to <strong className="text-black">{fromEstate}</strong>:
                            </p>

                            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                                {Object.entries(KENYAN_ESTATES).map(([name, coords]) => {
                                    const dist = calculateHaversineDistance(fromGeo.lat, fromGeo.lng, coords.lat, coords.lng);
                                    return (
                                        <div 
                                            key={name}
                                            className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-200 hover:border-black transition-colors"
                                        >
                                            <div>
                                                <span className="font-bold text-xs text-black block">{name}</span>
                                                <span className="text-[9px] text-gray-500">{coords.county}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className={`font-mono text-xs font-black ${dist === 0 ? 'text-blue-600' : dist < 10 ? 'text-emerald-600' : 'text-gray-800'}`}>
                                                    {dist === 0 ? '0.0 km (Current)' : `${dist} km`}
                                                </span>
                                                <span className="text-[8.5px] text-gray-400 block font-mono">
                                                    [{coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}]
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 bg-gray-100 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-[10px] text-gray-500 font-mono">
                        NikoSoko Spatial Geo Engine v2.0
                    </span>
                    <button
                        onClick={onClose}
                        className="py-2 px-5 bg-black text-white hover:bg-gray-800 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationLogsModal;
