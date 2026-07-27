
import React, { useState, useMemo } from 'react';
import type { Document, DocumentType, ServiceProvider } from '../types';

const statusStyles: Record<Document['paymentStatus'], string> = {
    Paid: 'bg-green-50 text-green-700',
    Pending: 'bg-orange-50 text-orange-700',
    Overdue: 'bg-red-50 text-red-700',
    Draft: 'bg-gray-50 text-gray-400',
};

const documentIcons: Record<DocumentType, React.ReactNode> = {
    Invoice: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Quote: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
    Receipt: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>,
};

const DocumentListItem: React.FC<{ doc: Document; onClick: () => void }> = ({ doc, onClick }) => {
    return (
        <button onClick={onClick} className="w-full text-left bg-white p-5 rounded-[32px] shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 flex items-center justify-between group active:scale-[0.98]">
            <div className="flex items-center gap-5">
                <div className={`p-3.5 rounded-2xl ${doc.paymentStatus === 'Paid' ? 'bg-green-50 text-green-600' : 'bg-brand-navy/5 text-brand-navy'}`}>
                    {documentIcons[doc.type]}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-black text-brand-navy text-sm uppercase tracking-tight italic">{doc.type}</p>
                        <span className="text-[9px] font-black text-gray-300">#{doc.number}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 truncate max-w-[140px]">
                        {doc.clientName || 'Merchant Ledger'}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm font-black text-brand-navy">{doc.currency} {doc.amount.toLocaleString()}</p>
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-1 inline-block ${statusStyles[doc.paymentStatus]}`}>{doc.paymentStatus}</span>
            </div>
        </button>
    );
};

interface MyDocumentsViewProps {
    documents: Document[];
    onScan: () => void;
    onSelectDocument: (doc: Document) => void;
    currentUser: Partial<ServiceProvider> | null;
    onBack: () => void;
}

const MyDocumentsView: React.FC<MyDocumentsViewProps> = ({ documents, onScan, onSelectDocument, currentUser, onBack }) => {
    const [typeFilter, setTypeFilter] = useState<'All' | DocumentType>('All');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'amount'>('newest');
    
    const financialDocuments = useMemo(() => documents.filter(doc => !doc.isAsset), [documents]);

    const filteredDocuments = useMemo(() => {
        let results = [...financialDocuments];
        
        if (typeFilter !== 'All') {
            results = results.filter(doc => doc.type === typeFilter);
        }
        
        results.sort((a, b) => {
            if (sortOrder === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
            if (sortOrder === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
            if (sortOrder === 'amount') return b.amount - a.amount;
            return 0;
        });
        
        return results;
    }, [financialDocuments, typeFilter, sortOrder]);

    return (
        <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
            <header className="p-6 bg-white border-b border-gray-100 flex flex-col gap-6 sticky top-0 z-20 shadow-sm">
                <div className="flex items-center justify-between">
                    <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-brand-navy active:scale-90 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="text-xl font-black text-brand-navy uppercase tracking-tighter italic">Ledger Registry</h1>
                    <button onClick={onScan} className="p-2 bg-gray-50 rounded-xl text-brand-navy hover:bg-gray-100 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {['All', 'Invoice', 'Quote', 'Receipt'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setTypeFilter(f as any)}
                            className={`px-6 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-full transition-all border ${typeFilter === f ? 'bg-brand-navy text-white border-brand-navy shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                     <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Sort By:</span>
                     <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner flex-1">
                        {['newest', 'amount'].map(s => (
                            <button 
                                key={s}
                                onClick={() => setSortOrder(s as any)}
                                className={`flex-1 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${sortOrder === s ? 'bg-white text-brand-navy shadow-sm' : 'text-gray-400'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="p-6 space-y-4 flex-1 overflow-y-auto no-scrollbar pb-24">
                {filteredDocuments.length > 0 ? (
                    <div className="space-y-4 animate-fade-in">
                        {filteredDocuments.map(doc => <DocumentListItem key={doc.id} doc={doc} onClick={() => onSelectDocument(doc)} />)}
                    </div>
                ) : (
                    <div className="text-center py-24 opacity-30 flex flex-col items-center">
                        <div className="p-12 bg-white rounded-full mb-8 shadow-inner ring-1 ring-black/5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gray-900">Ledger Clear</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3">No matching records found.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyDocumentsView;
