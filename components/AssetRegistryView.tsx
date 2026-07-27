import React, { useState } from 'react';
import type { Document, ServiceProvider, CurrentPage } from '../types';

interface AssetRegistryViewProps {
    documents: Document[];
    currentUser: Partial<ServiceProvider> | null;
    onNavigate: (page: CurrentPage) => void;
    onSelectDocument: (doc: Document) => void;
    onBack: () => void;
}

const AssetRegistryView: React.FC<AssetRegistryViewProps> = ({ documents, currentUser, onNavigate, onSelectDocument, onBack }) => {
    const [activeTab, setActiveTab] = useState<'Assets' | 'Documents'>('Assets');
    const [transferringAsset, setTransferringAsset] = useState<Document | null>(null);
    const [recipientPhone, setRecipientPhone] = useState('');
    const [generatedTransferLink, setGeneratedTransferLink] = useState<string | null>(null);

    // Recipient Link Acceptance Modal State
    const [showAcceptLinkModal, setShowAcceptLinkModal] = useState(false);
    const [verifyPhoneInput, setVerifyPhoneInput] = useState('');
    const [otpInput, setOtpInput] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [isTransferVerified, setIsTransferVerified] = useState(false);
    
    const myAssets = documents.filter(doc => doc.isAsset || doc.type === 'Receipt');
    const myDocs = documents.filter(doc => !doc.isAsset);

    const handleGenerateTransferLink = () => {
        if (!recipientPhone.trim()) {
            alert("Please enter recipient's phone number to generate the transfer link.");
            return;
        }
        const link = `https://nikosoko.app/asset/transfer/${transferringAsset?.id || 'ast-101'}?recipient=${encodeURIComponent(recipientPhone)}`;
        setGeneratedTransferLink(link);
    };

    const handleSendTransferViaWhatsApp = () => {
        if (!generatedTransferLink) return;
        const msg = `Hello! You have been transferred a digitised asset on Nikosoko: ${transferringAsset?.items?.[0]?.description || transferringAsset?.model || 'Asset'}. Please verify your phone number and enter OTP to confirm receipt: ${generatedTransferLink}`;
        window.open(`https://wa.me/${recipientPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const handleSendOTP = () => {
        if (!verifyPhoneInput.trim()) {
            alert("Please enter recipient phone number.");
            return;
        }
        setOtpSent(true);
        alert(`OTP code "8842" sent to ${verifyPhoneInput}`);
    };

    const handleVerifyOTP = () => {
        if (otpInput === '8842' || otpInput.length === 4) {
            setIsTransferVerified(true);
            setTimeout(() => {
                alert("Asset Transfer Confirmed! Asset registry has been digitally assigned to recipient.");
                setShowAcceptLinkModal(false);
                setTransferringAsset(null);
                setGeneratedTransferLink(null);
                setOtpSent(false);
                setVerifyPhoneInput('');
                setOtpInput('');
                setIsTransferVerified(false);
            }, 1000);
        } else {
            alert("Invalid OTP code. Enter 8842 or 4 digits.");
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col font-sans max-w-md mx-auto border-x border-gray-200">
            <header className="p-5 bg-black text-white flex items-center justify-between sticky top-0 z-20 shadow-md">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div>
                        <h1 className="text-base font-black uppercase tracking-wider text-white">MY ASSETS</h1>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Vault & Link Transfer</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowAcceptLinkModal(true)} 
                    className="text-[9px] font-black uppercase tracking-wider bg-white text-black px-3 py-1.5 rounded-xl border border-gray-300 hover:bg-gray-200"
                >
                    Test Transfer Link
                </button>
            </header>

            <div className="flex bg-white p-1 mx-5 mt-5 rounded-2xl border border-gray-200 shadow-inner">
                {(['Assets', 'Documents'] as const).map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-black text-white shadow-md' : 'text-gray-500'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <main className="p-5 flex-1 overflow-y-auto no-scrollbar pb-24 space-y-4">
                {activeTab === 'Assets' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-sm font-black text-black uppercase tracking-tight">Registered Assets & Receipts</h2>
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Digital Proof of Ownership</p>
                            </div>
                            <button 
                                onClick={() => onNavigate('registerAsset')}
                                className="bg-black text-white text-xs font-black px-3 py-2 rounded-xl uppercase tracking-wider shadow-md hover:bg-gray-800 active:scale-95 transition-all"
                            >
                                + Register
                            </button>
                        </div>

                        {myAssets.length > 0 ? (
                            <div className="space-y-3">
                                {myAssets.map(asset => (
                                    <div key={asset.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center text-xl">
                                                {asset.productImages?.[0] ? (
                                                    <img src={asset.productImages[0]} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <span>📦</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-xs text-black truncate">{asset.items?.[0]?.description || asset.model || 'Digitised Asset'}</h3>
                                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{asset.registrationNumber || `REF #${asset.number}`}</p>
                                                <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase mt-1 inline-block bg-black text-white">
                                                    Verified Registry
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 border-t pt-2 border-gray-100">
                                            <button 
                                                onClick={() => onSelectDocument(asset)}
                                                className="flex-1 py-2.5 bg-gray-100 text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-colors"
                                            >
                                                Details
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setTransferringAsset(asset);
                                                    setGeneratedTransferLink(null);
                                                }}
                                                className="flex-1 py-2.5 bg-black text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-md active:scale-95 transition-all"
                                            >
                                                Transfer Asset
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white border border-gray-200 rounded-3xl p-6">
                                <p className="text-xs font-bold text-gray-500 uppercase">No registered assets in vault</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'Documents' && (
                    <div className="space-y-3">
                        {myDocs.map(doc => (
                            <div 
                                key={doc.id} 
                                onClick={() => onSelectDocument(doc)}
                                className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm">
                                        📄
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-black text-xs">{doc.type} #{doc.number}</h3>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase">{doc.clientName || 'General Entry'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-black">{doc.currency} {doc.amount.toLocaleString()}</p>
                                    <p className="text-[8px] text-gray-400 font-medium">{new Date(doc.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* TRANSFER LINK GENERATOR MODAL */}
            {transferringAsset && (
                <div className="fixed inset-0 bg-black/80 z-[120] flex items-center justify-center p-4 backdrop-blur-sm font-sans">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 border border-black">
                        <div className="text-center border-b pb-3">
                            <h2 className="text-base font-black text-black uppercase tracking-tight">Transfer Asset via Link</h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                                {transferringAsset.items?.[0]?.description || transferringAsset.model || 'Asset'}
                            </p>
                        </div>

                        {!generatedTransferLink ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[9px] font-black text-black uppercase tracking-widest mb-1">Recipient Phone Number</label>
                                    <input 
                                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-black outline-none focus:bg-white focus:border-black"
                                        placeholder="e.g. +254 712 345 678"
                                        value={recipientPhone}
                                        onChange={e => setRecipientPhone(e.target.value)}
                                    />
                                    <p className="text-[8px] text-gray-500 font-medium mt-1">
                                        Recipient will verify receipt by entering their phone number & OTP.
                                    </p>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button 
                                        onClick={() => setTransferringAsset(null)}
                                        className="flex-1 py-3 bg-gray-100 text-black font-black text-[10px] uppercase tracking-widest rounded-xl border border-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleGenerateTransferLink}
                                        className="flex-1 bg-black text-white font-black py-3 rounded-xl shadow-md uppercase text-[10px] tracking-widest active:scale-95"
                                    >
                                        Generate Link
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 text-center space-y-2">
                                    <span className="text-[9px] font-black text-black uppercase tracking-widest block">Transfer Link Ready</span>
                                    <p className="text-[10px] font-mono bg-white p-2 border rounded-xl text-black break-all">
                                        {generatedTransferLink}
                                    </p>
                                </div>

                                <button 
                                    onClick={handleSendTransferViaWhatsApp}
                                    className="w-full bg-black text-white font-black py-3 rounded-xl shadow-md uppercase text-[10px] tracking-widest active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <span>Send via WhatsApp / SMS</span>
                                </button>

                                <button 
                                    onClick={() => {
                                        setShowAcceptLinkModal(true);
                                    }}
                                    className="w-full bg-gray-100 text-black border border-gray-300 font-black py-2.5 rounded-xl uppercase text-[9px] tracking-widest"
                                >
                                    Simulate Recipient Link Click (OTP Verification)
                                </button>

                                <button 
                                    onClick={() => setTransferringAsset(null)}
                                    className="w-full text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest pt-1"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* RECIPIENT LINK CONFIRMATION & OTP MODAL */}
            {showAcceptLinkModal && (
                <div className="fixed inset-0 bg-black/85 z-[130] flex items-center justify-center p-4 backdrop-blur-md font-sans">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 border border-black">
                        <div className="text-center border-b pb-3">
                            <span className="text-2xl mb-1 block">🔐</span>
                            <h2 className="text-base font-black text-black uppercase tracking-tight">Confirm Asset Receipt</h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">OTP Phone Verification Required</p>
                        </div>

                        {!isTransferVerified ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[9px] font-black text-black uppercase tracking-widest mb-1">Enter Recipient Phone Number</label>
                                    <input 
                                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-black outline-none focus:bg-white focus:border-black"
                                        placeholder="+254 7XX XXX XXX"
                                        value={verifyPhoneInput}
                                        onChange={e => setVerifyPhoneInput(e.target.value)}
                                    />
                                </div>

                                {!otpSent ? (
                                    <button 
                                        onClick={handleSendOTP}
                                        className="w-full bg-black text-white font-black py-3 rounded-xl shadow-md uppercase text-[10px] tracking-widest active:scale-95"
                                    >
                                        Send Verification OTP
                                    </button>
                                ) : (
                                    <div className="space-y-3 animate-fade-in">
                                        <div>
                                            <label className="block text-[9px] font-black text-black uppercase tracking-widest mb-1">Enter 4-Digit OTP Code (Demo: 8842)</label>
                                            <input 
                                                className="w-full p-3 bg-gray-50 border border-black rounded-xl text-center text-lg font-black tracking-[0.5em] text-black outline-none"
                                                placeholder="8842"
                                                maxLength={4}
                                                value={otpInput}
                                                onChange={e => setOtpInput(e.target.value)}
                                            />
                                        </div>

                                        <button 
                                            onClick={handleVerifyOTP}
                                            className="w-full bg-black text-white font-black py-3 rounded-xl shadow-md uppercase text-[10px] tracking-widest active:scale-95"
                                        >
                                            Confirm Receipt & OTP
                                        </button>
                                    </div>
                                )}

                                <button 
                                    onClick={() => setShowAcceptLinkModal(false)}
                                    className="w-full py-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="py-6 text-center space-y-2 animate-fade-in">
                                <div className="text-4xl text-green-600 mb-2">✅</div>
                                <h3 className="font-black text-sm text-black uppercase">Asset Transfer Verified!</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Ownership record updated in vault registry.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetRegistryView;
