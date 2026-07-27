
import React, { useEffect, useState } from 'react';

interface QRScannerViewProps {
    onScanSuccess: (data: string) => void | Promise<void>;
    onBack: () => void;
    overlay?: React.ReactNode;
}

const QRScannerView: React.FC<QRScannerViewProps> = ({ onScanSuccess, onBack, overlay }) => {
    const [scanning, setScanning] = useState(true);

    const triggerScan = (data: string) => {
        setScanning(false);
        // Realistic processing delay for "verification" effect
        setTimeout(() => {
            onScanSuccess(data);
            setScanning(true);
        }, 1200);
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center font-sans overflow-hidden">
            <div className="relative w-full h-full flex flex-col">
                {/* Simulated Camera Feed */}
                <div className="absolute inset-0 bg-gray-950 flex items-center justify-center overflow-hidden">
                     <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=600')] bg-cover bg-center grayscale animate-pulse"></div>
                     <div className="relative w-72 h-72 border-2 border-brand-gold/30 rounded-3xl">
                        <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-brand-gold rounded-tl-3xl"></div>
                        <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-brand-gold rounded-tr-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-brand-gold rounded-bl-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-brand-gold rounded-br-3xl"></div>
                        
                        {/* Scanning Line Animation */}
                        <div className="absolute inset-x-4 h-1 bg-brand-gold animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_rgba(245,158,11,0.8)]"></div>
                     </div>
                </div>

                {/* Toolbar */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
                    <button onClick={onBack} className="bg-white/10 backdrop-blur-md text-white p-3 rounded-2xl border border-white/10 active:scale-95 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="text-white text-[10px] font-black uppercase tracking-[0.3em] bg-black/40 px-6 py-2 rounded-full backdrop-blur-md border border-white/5">
                        {scanning ? 'System Ready' : 'Verifying ID...'}
                    </div>
                    <div className="w-12"></div> 
                </div>

                {overlay}

                {/* Simulation Control Panel */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center z-20 bg-gradient-to-t from-black via-black/90 to-transparent pt-20">
                    <p className="text-brand-gold text-[10px] font-black uppercase tracking-[0.4em] mb-6 opacity-80">Simulation Hub</p>
                    <div className="w-full space-y-6 max-h-[45vh] overflow-y-auto no-scrollbar pb-10">
                        
                        {/* Visitor Passes Group */}
                        <div className="space-y-2">
                            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest ml-1">Gate & Visitor Passes</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => triggerScan('QARIBU:qrr1')} 
                                    className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-200 text-[10px] font-black py-4 rounded-2xl border border-emerald-500/30 transition-all uppercase tracking-widest"
                                >
                                    Pass: Approved (qrr1)
                                </button>
                                <button 
                                    onClick={() => triggerScan('QARIBU:qrr_dummy')} 
                                    className="bg-amber-600/20 hover:bg-amber-600/40 text-amber-200 text-[10px] font-black py-4 rounded-2xl border border-amber-500/30 transition-all uppercase tracking-widest"
                                >
                                    Pass: Unknown
                                </button>
                            </div>
                        </div>

                        {/* Identity Keys Group */}
                        <div className="space-y-2">
                            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest ml-1">Identity & Masters</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => triggerScan('PROFILE:h1')} 
                                    className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-200 text-[10px] font-black py-4 rounded-2xl border border-blue-500/30 transition-all uppercase tracking-widest"
                                >
                                    ID: James Waweru (h1)
                                </button>
                                <button 
                                    onClick={() => triggerScan('PREMISE:p-plaza')} 
                                    className="bg-white/5 hover:bg-white/10 text-white text-[10px] font-black py-4 rounded-2xl border border-white/10 transition-all uppercase tracking-widest"
                                >
                                    Premise Hub (p-plaza)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes scan {
                    0% { transform: translateY(-140px); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(140px); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default QRScannerView;
