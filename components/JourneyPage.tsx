import React, { useState, useEffect, useMemo } from 'react';
import type { ServiceProvider } from '../types';

interface JourneyPageProps {
    providers: ServiceProvider[];
    currentUser: ServiceProvider | null;
    onSelectProvider: (provider: ServiceProvider) => void;
    onBack: () => void;
}

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>;
const SyncIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;

const JourneyPage: React.FC<JourneyPageProps> = ({ currentUser, providers, onSelectProvider, onBack }) => {
    const [isSynced, setIsSynced] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(true);
    const [userSteps, setUserSteps] = useState(2280);
    const stepTarget = 6000;
    
    const profession = currentUser?.service || 'Delivery Guy';
    const locationName = currentUser?.location?.split(',')[0] || 'Gachie';
    const localRank = 5;
    const professionRank = 220;

    const leaderboard = useMemo(() => {
        const list = providers.map((p, idx) => ({
            ...p,
            steps: idx === 0 ? 5500 : Math.floor(Math.random() * 4000) + 1000
        }));
        if (currentUser && !list.find(p => p.id === currentUser.id)) {
            list.push({ ...currentUser, steps: userSteps });
        }
        return list.sort((a, b) => b.steps - a.steps);
    }, [providers, currentUser, userSteps]);

    const handleSync = () => {
        setShowPermissionModal(false);
        setIsSynced(true);
        setTimeout(() => {
            setUserSteps(prev => prev + Math.floor(Math.random() * 100));
        }, 2000);
    };

    if (showPermissionModal) {
        return (
            <div className="fixed inset-0 bg-brand-navy flex flex-col items-center justify-center p-8 z-[60] text-center font-sans">
                <div className="w-24 h-24 bg-white/10 rounded-[40px] flex items-center justify-center mb-8 animate-pulse border border-white/20">
                    <span className="text-4xl">👟</span>
                </div>
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tight mb-4">Sync Your Steps</h2>
                <p className="text-white/60 text-sm leading-relaxed mb-10 max-w-xs">
                    Allow NikoSoko to access your motion data to track your neighborhood journey and rank among your peers.
                </p>
                <div className="w-full space-y-4">
                    <button 
                        onClick={handleSync}
                        className="w-full bg-brand-gold text-brand-navy font-black py-5 rounded-[28px] shadow-2xl active:scale-95 transition-all text-xs uppercase tracking-[0.2em]"
                    >
                        Sync Now
                    </button>
                    <button onClick={onBack} className="text-white/40 font-bold text-[10px] uppercase tracking-widest hover:text-white transition-colors">Maybe Later</button>
                </div>
            </div>
        );
    }

    const progressPercent = Math.min((userSteps / stepTarget) * 100, 100);

    return (
        <div className="bg-white min-h-screen font-sans flex flex-col pb-24">
            <header className="p-6 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <button onClick={onBack} className="p-3 -ml-3 text-gray-400 active:scale-90 transition-transform">
                    <BackIcon />
                </button>
                <h1 className="text-[10px] font-black text-brand-navy uppercase tracking-[0.4em] italic">My Journey</h1>
                <button onClick={() => setIsSynced(false)} className={`p-3 -mr-3 text-brand-navy ${!isSynced ? 'animate-spin' : ''}`}>
                    <SyncIcon />
                </button>
            </header>

            <main className="flex-1 space-y-10 px-6">
                
                {/* Dashboard: Bold Steps & Progress */}
                <section className="bg-brand-navy rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold/10 blur-[80px] rounded-full -mr-10 -mt-10"></div>
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <p className="text-brand-gold text-[10px] font-black uppercase tracking-[0.4em] mb-4">Current Steps</p>
                        <span className="text-8xl font-black italic tracking-tighter mb-6">{userSteps.toLocaleString()}</span>
                        
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                            <div 
                                className="h-full bg-brand-gold shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all duration-1000" 
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                        
                        <div className="flex justify-between w-full text-[9px] font-black uppercase tracking-widest text-white/40">
                            <span>Target: {stepTarget.toLocaleString()}</span>
                            <span>{Math.round(progressPercent)}%</span>
                        </div>
                    </div>
                </section>

                {/* User Stats Card */}
                <section className="px-2">
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-800">
                            You have <span className="text-brand-navy font-black">{userSteps.toLocaleString()} steps</span>
                        </p>
                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                            Number <span className="text-brand-navy font-black">{localRank}</span> in <span className="uppercase text-brand-gold font-black">{locationName}</span> and <span className="text-brand-navy font-black">{professionRank}</span> amongst <span className="uppercase font-black">{profession}s</span> countrywide.
                        </p>
                    </div>
                </section>

                {/* Leaderboard */}
                <section className="space-y-6">
                    <div className="flex justify-between items-end px-2">
                        <div>
                            <h2 className="text-xl font-black text-brand-navy italic uppercase tracking-tighter leading-none">Leaderboard</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Neighbourhood Active</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {leaderboard.map((p, idx) => {
                            const isMe = p.id === currentUser?.id;
                            return (
                                <div 
                                    key={p.id} 
                                    onClick={() => onSelectProvider(p)}
                                    className={`flex items-center gap-4 p-4 rounded-[28px] transition-all border ${isMe ? 'bg-brand-navy text-white border-brand-navy shadow-xl scale-[1.02]' : 'bg-gray-50 border-gray-100 hover:bg-white hover:shadow-md cursor-pointer'}`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <img src={p.avatarUrl} className={`w-11 h-11 rounded-2xl object-cover ${isMe ? 'border-2 border-brand-gold' : 'border border-gray-200'}`} alt="" />
                                        <div className={`absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${idx === 0 ? 'bg-brand-gold text-brand-navy shadow-lg' : isMe ? 'bg-white text-brand-navy' : 'bg-gray-200 text-gray-500'}`}>
                                            {idx + 1}
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={`font-bold text-sm truncate uppercase tracking-tight ${isMe ? 'text-white' : 'text-brand-navy'}`}>
                                            {p.name} <span className={`text-[10px] font-medium opacity-60 ml-1`}>{p.service}</span>
                                        </p>
                                        <p className={`text-[11px] font-black italic ${isMe ? 'text-brand-gold' : 'text-gray-500'}`}>
                                            {p.steps.toLocaleString()} steps
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <div className={`w-2 h-2 rounded-full ${p.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

            </main>
        </div>
    );
};

export default JourneyPage;