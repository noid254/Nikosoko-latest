
import React from 'react';

type HubView = 'myDocuments' | 'quoteGenerator' | 'invoiceGenerator' | 'brandKit' | 'receiptGenerator' | 'scanDocument';

interface InvoiceHubProps {
    onNavigate: (view: HubView) => void;
    onBack: () => void;
}

const InvoiceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const QuoteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
);

const ReceiptIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
);

const ScanIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const InvoiceHub: React.FC<InvoiceHubProps> = ({ onNavigate, onBack }) => {
    return (
        <div className="w-full max-w-md mx-auto bg-gray-50/60 min-h-screen font-sans pb-12 border-x border-gray-200/80">
            {/* TOP COMPACT HEADER */}
            <header className="p-4 bg-black text-white flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onBack} 
                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-sm font-black uppercase tracking-wider italic">MY WORKSHOP</h1>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Financial Document Suite</p>
                    </div>
                </div>
                <button 
                    onClick={() => onNavigate('myDocuments')} 
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider transition-all"
                >
                    All Docs &rarr;
                </button>
            </header>

            <main className="p-4 space-y-4">
                {/* EXECUTIVE FINANCIAL OVERVIEW BANNER */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <span className="text-[9px] font-black text-black uppercase tracking-widest">Ledger Snapshot</span>
                        <span className="text-[8px] bg-emerald-50 text-emerald-700 font-black px-2 py-0.5 rounded-full uppercase border border-emerald-200">
                            Verified Business
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center divide-x divide-gray-100">
                        <div className="px-1">
                            <p className="text-[8px] font-extrabold text-gray-400 uppercase tracking-wider">Active Invoices</p>
                            <p className="text-lg font-black text-black mt-0.5">3</p>
                        </div>
                        <div className="px-1">
                            <p className="text-[8px] font-extrabold text-gray-400 uppercase tracking-wider">Quotes Sent</p>
                            <p className="text-lg font-black text-black mt-0.5">1</p>
                        </div>
                        <div className="px-1">
                            <p className="text-[8px] font-extrabold text-gray-400 uppercase tracking-wider">Receipts</p>
                            <p className="text-lg font-black text-emerald-600 mt-0.5">5</p>
                        </div>
                    </div>
                </div>

                {/* CREATE DOCUMENT ACTIONS */}
                <div>
                    <h2 className="text-[10px] font-black text-black uppercase tracking-widest mb-2 px-1">Generate Document</h2>
                    <div className="grid grid-cols-2 gap-2.5">
                        <button 
                            onClick={() => onNavigate('invoiceGenerator')}
                            className="bg-black text-white p-3.5 rounded-2xl shadow-sm text-left hover:bg-gray-900 transition-all active:scale-[0.98] border border-black flex flex-col justify-between group h-28"
                        >
                            <div className="p-2 bg-white/10 rounded-xl w-fit text-emerald-400 group-hover:scale-105 transition-transform">
                                <InvoiceIcon />
                            </div>
                            <div>
                                <h3 className="font-black text-xs uppercase tracking-wider text-white">Tax Invoice</h3>
                                <p className="text-[8px] text-gray-400 font-medium tracking-tight">Client bill & line items</p>
                            </div>
                        </button>

                        <button 
                            onClick={() => onNavigate('quoteGenerator')}
                            className="bg-white text-black p-3.5 rounded-2xl shadow-xs text-left hover:bg-gray-50 transition-all active:scale-[0.98] border border-gray-300 flex flex-col justify-between group h-28"
                        >
                            <div className="p-2 bg-gray-100 rounded-xl w-fit text-black group-hover:scale-105 transition-transform">
                                <QuoteIcon />
                            </div>
                            <div>
                                <h3 className="font-black text-xs uppercase tracking-wider text-black">Price Quote</h3>
                                <p className="text-[8px] text-gray-500 font-medium tracking-tight">Est. proposal & terms</p>
                            </div>
                        </button>

                        <button 
                            onClick={() => onNavigate('receiptGenerator')}
                            className="bg-white text-black p-3.5 rounded-2xl shadow-xs text-left hover:bg-gray-50 transition-all active:scale-[0.98] border border-gray-300 flex flex-col justify-between group h-28"
                        >
                            <div className="p-2 bg-gray-100 rounded-xl w-fit text-black group-hover:scale-105 transition-transform">
                                <ReceiptIcon />
                            </div>
                            <div>
                                <h3 className="font-black text-xs uppercase tracking-wider text-black">Instant Receipt</h3>
                                <p className="text-[8px] text-gray-500 font-medium tracking-tight">Proof of cash/M-Pesa</p>
                            </div>
                        </button>

                        <button 
                            onClick={() => onNavigate('scanDocument')}
                            className="bg-white text-black p-3.5 rounded-2xl shadow-xs text-left hover:bg-gray-50 transition-all active:scale-[0.98] border border-gray-300 flex flex-col justify-between group h-28"
                        >
                            <div className="p-2 bg-gray-100 rounded-xl w-fit text-black group-hover:scale-105 transition-transform">
                                <ScanIcon />
                            </div>
                            <div>
                                <h3 className="font-black text-xs uppercase tracking-wider text-black">Scan Asset / QR</h3>
                                <p className="text-[8px] text-gray-500 font-medium tracking-tight">Camera document capture</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* MY DOCUMENTS & BRAND CONFIGURATION */}
                <div className="space-y-2 pt-2">
                    <h2 className="text-[10px] font-black text-black uppercase tracking-widest px-1">Registry Folders</h2>
                    
                    <button 
                        onClick={() => onNavigate('myDocuments')}
                        className="w-full bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between hover:bg-gray-50 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-black text-white rounded-xl flex items-center justify-center font-black text-sm">
                                📁
                            </div>
                            <div className="text-left">
                                <h3 className="font-black text-xs text-black uppercase tracking-wider">All Financial Records</h3>
                                <p className="text-[9px] text-gray-500 font-medium">Invoices, Quotes, Receipts & Exports</p>
                            </div>
                        </div>
                        <span className="text-xs font-black text-black group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </button>

                    <button 
                        onClick={() => onNavigate('brandKit')}
                        className="w-full bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between hover:bg-gray-50 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-amber-100 text-amber-900 rounded-xl flex items-center justify-center font-black text-sm">
                                💼
                            </div>
                            <div className="text-left">
                                <h3 className="font-black text-xs text-black uppercase tracking-wider">Brand & Business Profile</h3>
                                <p className="text-[9px] text-gray-500 font-medium">Header logo, tax pin & default payment terms</p>
                            </div>
                        </div>
                        <span className="text-xs font-black text-black group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </button>
                </div>
            </main>
        </div>
    );
};

export default InvoiceHub;
