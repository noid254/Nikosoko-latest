import React, { useState } from 'react';
import type { Document, ServiceProvider, BusinessAssets } from '../types';
import * as api from '../services/api';
import { InvoicePreview } from './InvoiceGenerator';

const DocumentDetailView: React.FC<{ 
    document: Document; 
    onBack: () => void; 
    onUpdate: (doc: Document) => void; 
    currentUser: ServiceProvider;
    assets: BusinessAssets;
}> = ({ document: doc, onBack, onUpdate, currentUser, assets }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [viewMode, setViewMode] = useState<'summary' | 'full'>('full');
    
    // Verification Link Modal
    const [showShareModal, setShowShareModal] = useState(false);
    const [recipientPhoneInput, setRecipientPhoneInput] = useState(doc.recipientContact || '');
    const [accessVerified, setAccessVerified] = useState(false);
    const [verificationPhone, setVerificationPhone] = useState('');

    const togglePaymentStatus = async () => {
        setIsUpdating(true);
        const newStatus = doc.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
        const updated = await api.updateDocument({ ...doc, paymentStatus: newStatus });
        onUpdate(updated);
        setIsUpdating(false);
    };

    const handleGenerateShareLink = () => {
        if (!recipientPhoneInput.trim()) {
            alert("Please enter recipient phone number for access verification.");
            return;
        }
        const link = `https://nikosoko.app/view/${doc.type.toLowerCase()}/${doc.id}?recipientPhone=${encodeURIComponent(recipientPhoneInput)}`;
        const message = `Hello! Here is your digital ${doc.type} #${doc.number} from ${doc.issuerName}. To view & download, enter your phone number to verify access: ${link}`;
        window.open(`https://wa.me/${recipientPhoneInput}?text=${encodeURIComponent(message)}`, '_blank');
        setShowShareModal(false);
    };

    const handleVerifyRecipientAccess = () => {
        if (!verificationPhone.trim()) {
            alert("Please enter phone number to verify access.");
            return;
        }
        setAccessVerified(true);
        alert(`Access granted for ${verificationPhone}. Document unlocked.`);
    };

    const isOwner = doc.issuerName === currentUser.name || doc.ownerPhone === currentUser.phone;

    if (viewMode === 'full' && doc.type === 'Invoice') {
        const subtotal = doc.items?.reduce((sum, i) => sum + (i.quantity * i.price), 0) || 0;
        const discRate = doc.discountRate || 0;
        const taxR = doc.taxRate || 16;
        
        const discountAmount = subtotal * (discRate / 100);
        const taxAmount = (subtotal - discountAmount) * (taxR / 100);

        return (
            <div className="bg-gray-50 min-h-screen font-sans pb-28 max-w-md mx-auto border-x border-gray-200">
                <div className="p-4 bg-black text-white flex items-center justify-between sticky top-0 z-20 shadow-md no-print">
                    <button onClick={onBack} className="p-2 -ml-1 text-white hover:bg-white/20 rounded-xl transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="text-xs font-black uppercase tracking-widest italic">{doc.type} #{doc.number}</h1>
                    <button onClick={() => setViewMode('summary')} className="text-[9px] font-black uppercase tracking-wider bg-white text-black px-3 py-1.5 rounded-lg">Summary</button>
                </div>
                <div className="animate-fade-in p-4">
                    <InvoicePreview
                        assets={assets}
                        fromName={doc.issuerName}
                        toName={doc.clientName || 'Valued Customer'}
                        toDetails={doc.recipientContact || ''}
                        invoiceNumber={doc.number}
                        date={doc.date}
                        dueDate={doc.dueDate || doc.date}
                        lineItems={doc.items?.map((i, idx) => ({ id: idx, description: i.description, quantity: i.quantity, unitPrice: i.price })) || []}
                        subtotal={subtotal}
                        discountRate={discRate}
                        discountAmount={discountAmount}
                        taxRate={taxR}
                        taxAmount={taxAmount}
                        totalDue={doc.amount}
                        terms={doc.terms || 'Standard business terms apply.'}
                        paymentDetails={doc.paymentInstructions || assets.address}
                        onDownloadPDF={() => window.print()}
                    />
                </div>
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 flex gap-3 max-w-md mx-auto z-30 no-print">
                    <button 
                        onClick={() => setShowShareModal(true)}
                        className="flex-1 bg-black text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95"
                    >
                        Share Verification Link
                    </button>
                    {isOwner && (
                         <button 
                            disabled={isUpdating}
                            onClick={togglePaymentStatus}
                            className={`flex-1 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 ${doc.paymentStatus === 'Paid' ? 'border-gray-300 text-black bg-gray-100' : 'bg-black text-white border-black'}`}
                        >
                            {isUpdating ? '...' : doc.paymentStatus === 'Paid' ? 'Mark Unpaid' : 'Mark Paid'}
                        </button>
                    )}
                </div>

                {/* SHARE VERIFICATION LINK MODAL */}
                {showShareModal && (
                    <div className="fixed inset-0 bg-black/85 z-[120] flex items-center justify-center p-4 backdrop-blur-md font-sans no-print">
                        <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 border border-black">
                            <div className="text-center border-b pb-3">
                                <h2 className="text-base font-black text-black uppercase tracking-tight">Protected Share Link</h2>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Recipient Phone Verification Required</p>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[9px] font-black text-black uppercase tracking-widest mb-1">Recipient Phone Number</label>
                                    <input 
                                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-black outline-none focus:bg-white focus:border-black"
                                        placeholder="e.g. +254 712 345 678"
                                        value={recipientPhoneInput}
                                        onChange={e => setRecipientPhoneInput(e.target.value)}
                                    />
                                    <p className="text-[8px] text-gray-500 font-medium mt-1">
                                        The recipient must input this exact phone number to unlock and view the {doc.type}.
                                    </p>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button 
                                        onClick={() => setShowShareModal(false)}
                                        className="flex-1 py-3 bg-gray-100 text-black font-black text-[10px] uppercase tracking-widest rounded-xl border border-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleGenerateShareLink}
                                        className="flex-1 bg-black text-white font-black py-3 rounded-xl shadow-md uppercase text-[10px] tracking-widest active:scale-95"
                                    >
                                        Share Link
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans flex flex-col max-w-md mx-auto border-x border-gray-200">
            <header className="p-4 bg-black text-white flex items-center justify-between sticky top-0 z-20 shadow-md">
                <button onClick={onBack} className="p-2 -ml-1 text-white hover:bg-white/20 rounded-xl transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-xs font-black uppercase tracking-widest italic">{doc.type} Summary</h1>
                <button onClick={() => setViewMode('full')} className="text-[9px] font-black uppercase tracking-wider bg-white text-black px-3 py-1.5 rounded-lg">Full View</button>
            </header>

            <main className="flex-1 p-5 space-y-5 overflow-y-auto no-scrollbar pb-32">
                <div className="bg-black text-white rounded-3xl p-6 text-center relative overflow-hidden shadow-xl border border-gray-800">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Amount</p>
                    <h2 className="text-3xl font-black italic tracking-tight mb-3">{doc.currency} {doc.amount.toLocaleString()}</h2>
                    <div className={`inline-block px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${doc.paymentStatus === 'Paid' ? 'bg-white text-black' : 'bg-gray-800 text-gray-300'}`}>
                        {doc.paymentStatus}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-3 shadow-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Document No.</span>
                        <span className="text-xs font-bold text-black">#{doc.number}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Date Issued</span>
                        <span className="text-xs font-bold text-black">{new Date(doc.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Issuer</span>
                        <span className="text-xs font-bold text-black truncate max-w-[150px]">{doc.issuerName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Client</span>
                        <span className="text-xs font-bold text-black truncate max-w-[150px]">{doc.clientName || 'Walk-in Customer'}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-[9px] font-black text-black uppercase tracking-widest ml-1">Line Items</h3>
                    {doc.items?.map((item, idx) => (
                        <div key={idx} className="bg-white p-3.5 rounded-xl border border-gray-200 flex justify-between items-center">
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-black text-xs truncate">{item.description}</p>
                                <p className="text-[9px] font-bold text-gray-500 uppercase mt-0.5">{item.quantity} units @ {doc.currency} {item.price.toLocaleString()}</p>
                            </div>
                            <p className="font-black text-black text-xs ml-3">{(item.quantity * item.price).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </main>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 flex gap-3 max-w-md mx-auto z-30">
                 <button 
                    onClick={() => setShowShareModal(true)}
                    className="flex-1 bg-black text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95"
                >
                    Share Verification Link
                </button>
            </div>

            {/* SHARE VERIFICATION LINK MODAL */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black/85 z-[120] flex items-center justify-center p-4 backdrop-blur-md font-sans">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 border border-black">
                        <div className="text-center border-b pb-3">
                            <h2 className="text-base font-black text-black uppercase tracking-tight">Protected Share Link</h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Recipient Phone Verification Required</p>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-[9px] font-black text-black uppercase tracking-widest mb-1">Recipient Phone Number</label>
                                <input 
                                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-black outline-none focus:bg-white focus:border-black"
                                    placeholder="e.g. +254 712 345 678"
                                    value={recipientPhoneInput}
                                    onChange={e => setRecipientPhoneInput(e.target.value)}
                                />
                                <p className="text-[8px] text-gray-500 font-medium mt-1">
                                    The recipient must input this exact phone number to unlock and view the {doc.type}.
                                </p>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button 
                                    onClick={() => setShowShareModal(false)}
                                    className="flex-1 py-3 bg-gray-100 text-black font-black text-[10px] uppercase tracking-widest rounded-xl border border-gray-200"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleGenerateShareLink}
                                    className="flex-1 bg-black text-white font-black py-3 rounded-xl shadow-md uppercase text-[10px] tracking-widest active:scale-95"
                                >
                                    Share Link
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentDetailView;
