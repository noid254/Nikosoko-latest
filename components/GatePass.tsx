import React, { useState, useMemo } from 'react';
import type { QaRibuRequest, ServiceProvider, Premise, UnitKey } from '../types';
import MyPlaces from './MyPlaces';
import PremiseManagementView from './PremiseManagementView';

type GatePassProps = {
    allProviders: ServiceProvider[];
    allTenants: ServiceProvider[];
    premises: Premise[]; 
    currentUser: ServiceProvider | null;
    isAuthenticated: boolean;
    qaribuRequests: QaRibuRequest[];
    onUpdateRequestStatus: (id: string, status: QaRibuRequest['status']) => Promise<void>;
    onScanClick: () => void;
    onBack: () => void;
    onStartShift?: () => void;
    onAuthClick?: () => void;
    onSelectProvider?: (provider: ServiceProvider) => void;
    onSelectPremise?: (premise: Premise) => void;
    onInitiateContact?: (provider: ServiceProvider) => boolean;
    onNavigate: (page: any) => void;
};

const ScanIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6.5 6.5v-1m-6.5-13L5.5 1m-4 4.5h1m13.5 6.5l-1-1M5.5 12.5v1m13.5-6.5L18 5m-1 6.5v-1m-6.5 6.5L5.5 18m13.5-6.5h-1M10 14v-4m-2 4h4" /></svg>;
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.002l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>;

const WalletCard: React.FC<{ 
    req: QaRibuRequest; 
    isActive: boolean; 
    onClick: () => void; 
    onClose: () => void; 
    onShare: () => void;
    onViewDoor?: () => void; 
}> = ({ req, isActive, onClick, onClose, onShare, onViewDoor }) => {
    return (
        <div 
            onClick={onClick} 
            className={`rounded-[32px] shadow-xl overflow-hidden flex flex-col cursor-pointer border border-white/20 transition-all duration-500 mb-4 ${isActive ? 'scale-105 z-20 ring-4 ring-brand-gold/20' : 'scale-100 z-10'} ${req.status === 'CheckedIn' ? 'bg-brand-navy' : req.premiseType === 'Residence' ? 'bg-gradient-to-br from-emerald-600 to-teal-800' : 'bg-gradient-to-br from-blue-600 to-blue-800'}`}
        >
            <div className="p-5 flex justify-between items-start text-white">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-70">{req.status}</p>
                        {req.isDigitalKey && <span className="text-[8px] bg-brand-gold text-brand-navy px-1.5 py-0.5 rounded font-black uppercase">Master Pass</span>}
                    </div>
                    <h3 className="text-lg font-bold font-serif leading-tight">{req.premiseName}</h3>
                    {req.targetUnit && <p className="text-[10px] font-black uppercase tracking-widest mt-1 text-brand-gold">Unit {req.targetUnit}</p>}
                </div>
                {isActive && (
                    <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="bg-white/20 p-2 rounded-full backdrop-blur-md hover:bg-white/40">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                )}
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center py-6 bg-white/5">
                <div className="bg-white p-3 rounded-2xl shadow-lg border border-white/10 group-hover:scale-105 transition-transform">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=QARIBU:${req.id}`} alt="Access QR" className="w-32 h-32 mix-blend-multiply" />
                </div>
                {isActive && <p className="text-white font-mono text-xs font-bold tracking-[0.4em] mt-5 bg-black/20 px-5 py-2 rounded-full border border-white/10">{req.accessCode || 'SCAN ME'}</p>}
            </div>

            <div className="p-4 bg-black/20 backdrop-blur-md text-white flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <img src={req.visitorAvatar || 'https://ui-avatars.com/api/?name=' + req.visitorName} className="w-10 h-10 rounded-full border-2 border-white/30 object-cover" alt="" />
                    <div className="min-w-0">
                        <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest">Authorized Keyholder</p>
                        <p className="font-bold text-sm truncate">{req.visitorName}</p>
                    </div>
                </div>
                {isActive && (
                    <div className="flex gap-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onShare(); }}
                            className="bg-brand-gold text-brand-navy p-2 rounded-xl shadow-lg active:scale-95 transition-all"
                        >
                            <ShareIcon />
                        </button>
                        {req.isDigitalKey && onViewDoor && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onViewDoor(); }}
                                className="bg-white text-brand-navy font-black text-[9px] px-3 py-2 rounded-lg uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                            >
                                Door Profile
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const GatePass: React.FC<GatePassProps> = ({ 
    currentUser, qaribuRequests, onScanClick, 
    onBack, onStartShift, isAuthenticated, onAuthClick, premises, allProviders, 
    onSelectProvider, onSelectPremise, onInitiateContact, onNavigate
}) => {
    const [activeTab, setActiveTab] = useState<'wallet' | 'places'>('wallet');
    const [walletFilter, setWalletFilter] = useState<'passes' | 'invites'>('passes');
    const [activeCardId, setActiveCardId] = useState<string | null>(null);
    const [selectedPremiseForControl, setSelectedPremiseForControl] = useState<Premise | null>(null);

    const isGateman = currentUser?.role === 'Gateman';
    const isManager = currentUser?.role === 'BuildingManager' || currentUser?.phone === '254723119356';

    const effectivePasses = useMemo(() => {
        const list = [...qaribuRequests.filter(r => r.visitorPhone === currentUser?.phone)];
        // Auto-generate a master pass for unit holders
        if (currentUser?.premiseId && currentUser?.unit && !list.find(r => r.premiseId === currentUser.premiseId && r.isDigitalKey)) {
            const p = premises.find(x => x.id === currentUser.premiseId);
            if (p) {
                list.unshift({
                    id: `MASTER_${currentUser.id}`,
                    premiseId: p.id,
                    premiseName: p.name,
                    hostId: currentUser.id,
                    hostName: currentUser.name,
                    targetUnit: currentUser.unit,
                    visitorName: currentUser.name,
                    visitorPhone: currentUser.phone,
                    visitorAvatar: currentUser.avatarUrl,
                    status: 'Approved',
                    isDigitalKey: true,
                    premiseType: 'Commercial',
                    accessCode: 'MASTER'
                });
            }
        }
        return list;
    }, [qaribuRequests, currentUser, premises]);

    const myInvites = qaribuRequests.filter(r => r.hostId === currentUser?.id);
    const displayedWallet = walletFilter === 'passes' ? effectivePasses : myInvites;

    if (selectedPremiseForControl) {
        return (
            <PremiseManagementView 
                premise={selectedPremiseForControl} 
                onBack={() => setSelectedPremiseForControl(null)} 
                onUpdate={() => setSelectedPremiseForControl(null)}
            />
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col font-sans">
            <header className="bg-white px-6 py-5 flex flex-col border-b border-gray-100 sticky top-0 z-40 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={onBack} className="p-3 -ml-3 text-gray-900 bg-gray-50 rounded-2xl active:scale-90 transition-all"><BackIcon /></button>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tighter italic uppercase leading-none">$KILL QARIBU</h1>
                    <div className="w-12"></div>
                </div>
                <div className="flex bg-gray-100 p-1.5 rounded-[20px] shadow-inner ring-1 ring-black/5">
                    <button onClick={() => setActiveTab('wallet')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-[15px] transition-all duration-300 ${activeTab === 'wallet' ? 'bg-white text-brand-navy shadow-md' : 'text-gray-400'}`}>My Wallet</button>
                    <button onClick={() => setActiveTab('places')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-[15px] transition-all duration-300 ${activeTab === 'places' ? 'bg-white text-brand-navy shadow-md' : 'text-gray-400'}`}>My Premises</button>
                </div>
            </header>

            <main className="flex-1 relative overflow-hidden flex flex-col">
                {activeTab === 'wallet' ? (
                    <div className="flex-1 flex flex-col animate-fade-in">
                        <div className="flex justify-between items-end px-6 pt-6 mb-4">
                            <div className="flex gap-6">
                                <button onClick={() => setWalletFilter('passes')} className={`text-[9px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${walletFilter === 'passes' ? 'border-brand-navy text-brand-navy' : 'border-transparent text-gray-400'}`}>My Passes ({effectivePasses.length})</button>
                                <button onClick={() => setWalletFilter('invites')} className={`text-[9px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${walletFilter === 'invites' ? 'border-brand-navy text-brand-navy' : 'border-transparent text-gray-400'}`}>My Invites ({myInvites.length})</button>
                            </div>
                        </div>
                        
                        <div className="p-6 flex-1 overflow-y-auto no-scrollbar pb-32">
                            {displayedWallet.length > 0 ? (
                                <div className="space-y-2">
                                    {displayedWallet.map((req) => (
                                        <WalletCard 
                                            key={req.id} 
                                            req={req} 
                                            isActive={activeCardId === req.id} 
                                            onClick={() => setActiveCardId(req.id)} 
                                            onClose={() => setActiveCardId(null)} 
                                            onShare={() => {}}
                                            onViewDoor={() => {
                                                const unitObj: UnitKey = {
                                                    id: req.targetUnit || '0',
                                                    unitNumber: req.targetUnit || '?',
                                                    floor: '',
                                                    type: 'Commercial',
                                                    status: 'Occupied',
                                                    configuration: ''
                                                };
                                                onNavigate({ page: 'doorProfile', unit: unitObj, premise: premises.find(p => p.id === req.premiseId) });
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-4">
                                    <div className="p-12 bg-white rounded-[40px] shadow-inner"><WalletIcon /></div>
                                    <p className="font-black text-[10px] uppercase tracking-[0.3em] text-brand-navy">No active keys found</p>
                                </div>
                            )}
                        </div>
                        <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none px-6 gap-3">
                            <button onClick={() => !isAuthenticated ? onAuthClick?.() : onScanClick()} className="pointer-events-auto flex-1 bg-brand-navy text-white py-5 rounded-[28px] shadow-2xl font-black flex items-center justify-center gap-4 active:scale-95 transition-all text-xs tracking-[0.2em] uppercase border border-white/10">
                                <ScanIcon /> <span>Check-In Entry</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 animate-fade-in bg-white h-full overflow-y-auto no-scrollbar pb-24">
                        {isManager ? (
                             <div className="p-6 space-y-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h2 className="text-2xl font-black text-brand-navy uppercase tracking-tight italic leading-none">Property Hub</h2>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Admin & Key Control</p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            const newP: Premise = { id: `p_${Date.now()}`, name: 'New Property', tagline: 'Secure Registry', logoUrl: '', bannerImageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800', about: '', location: 'Nairobi', amenities: [], contactEmail: '', contactPhone: '', vacancies: [], buildingManagerId: currentUser?.id || '', tenants: [], verificationStatus: 'Pending' };
                                            setSelectedPremiseForControl(newP);
                                        }} 
                                        className="bg-brand-navy text-white p-3 rounded-2xl shadow-xl active:scale-90 border border-white/10"
                                    >
                                        <PlusIcon />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {premises.filter(p => p.buildingManagerId === currentUser?.id || currentUser?.phone === '254723119356').map(p => (
                                        <div key={p.id} className="bg-gray-50 p-4 rounded-3xl border border-gray-200 flex flex-col gap-4 shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <img src={p.logoUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200'} className="w-14 h-14 rounded-2xl object-cover bg-white p-1" alt="" />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-brand-navy truncate text-sm uppercase tracking-tight">{p.name}</h4>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{p.tenants.length} Active Keyholders</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setSelectedPremiseForControl(p)}
                                                className="flex items-center justify-center gap-2 bg-white text-brand-navy font-black text-[9px] py-3.5 rounded-xl border border-gray-100 uppercase tracking-widest"
                                            >
                                                <EditIcon /> Manage Property & Keys
                                            </button>
                                        </div>
                                    ))}
                                    {premises.filter(p => p.buildingManagerId === currentUser?.id || currentUser?.phone === '254723119356').length === 0 && (
                                         <div className="text-center py-24 border-2 border-dashed border-gray-100 rounded-[40px] px-10">
                                            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest leading-relaxed">No registered premises found.</p>
                                        </div>
                                    )}
                                </div>
                             </div>
                        ) : (
                            <MyPlaces onBack={onBack} premises={premises} providers={allProviders} onSelectPremise={onSelectPremise} onSelectProvider={onSelectProvider!} onNavigate={onNavigate} onInitiateContact={onInitiateContact!} />
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default GatePass;