
import React, { useState } from 'react';
import type { Premise, UnitKey, Enquiry } from '../types';
import QRScannerView from './QRScannerView';

interface PremiseManagementViewProps {
    premise: Premise;
    onBack: () => void;
    onUpdate: (updated: Premise) => void;
}

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>;
const KeyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;

const PremiseManagementView: React.FC<PremiseManagementViewProps> = ({ premise, onBack, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'inventory' | 'leads' | 'qr'>('overview');
    const [editedData, setEditedData] = useState<Premise>({ ...premise });
    const [issuingKey, setIssuingKey] = useState(false);
    const [scanningUnit, setScanningUnit] = useState<UnitKey | null>(null);
    
    // Real Estate Listing-style Form for Keys
    const unitFileInputRef = React.useRef<HTMLInputElement>(null);
    const [issueForm, setIssueForm] = useState({ 
        phone: '', 
        unitNumber: '', 
        floor: '',
        type: 'Commercial' as UnitKey['type'],
        configuration: '', // e.g. "Two Bedroom", "Open Office"
        size: '', // sqft
        rentAmount: '',
        description: '',
        amenities: [] as string[],
        images: [] as string[]
    });
    
    const [leads, setLeads] = useState<Enquiry[]>([
        { id: 'l1', userName: 'Alice Kariuki', userPhone: '0711000111', date: '2023-10-27', status: 'New', vacancyType: '2 Bedroom' },
        { id: 'l2', userName: 'Ben Juma', userPhone: '0722333444', date: '2023-10-26', status: 'Contacted', vacancyType: 'Office Suite' },
    ]);

    const handleSave = () => {
        onUpdate(editedData);
        alert("Registry synchronization complete.");
    };

    const handleIssueKey = () => {
        if (!issueForm.unitNumber || !issueForm.configuration) {
            alert("Minimum requirements: Unit Number and Unit Nature/Configuration.");
            return;
        }
        
        const newKeyId = `U-${issueForm.unitNumber}-${Date.now().toString().slice(-4)}`;
        const isAssigned = issueForm.phone.trim().length > 0;

        const newUnit: UnitKey = {
            id: newKeyId,
            unitNumber: issueForm.unitNumber,
            floor: issueForm.floor || 'N/A',
            type: issueForm.type,
            configuration: issueForm.configuration,
            size: issueForm.size,
            status: isAssigned ? 'Occupied' : 'Vacant',
            isListed: !isAssigned, // Auto-list as vacant if not assigned
            tenantId: isAssigned ? issueForm.phone : undefined,
            rentAmount: parseFloat(issueForm.rentAmount) || 0,
            description: issueForm.description,
            images: issueForm.images,
            amenities: issueForm.amenities
        };
        
        setEditedData(prev => ({ 
            ...prev, 
            tenants: isAssigned ? [...prev.tenants, newKeyId] : prev.tenants,
            vacancies: !isAssigned ? [...prev.vacancies, newUnit] : prev.vacancies
        }));
        
        if (isAssigned) {
            alert(`Digital Key Issued to +254${issueForm.phone} for Unit ${issueForm.unitNumber}.`);
        } else {
            alert(`Unit ${issueForm.unitNumber} created and listed as Vacant.`);
        }

        setIssuingKey(false);
        setIssueForm({ phone: '', unitNumber: '', floor: '', type: 'Commercial', configuration: '', size: '', rentAmount: '', description: '', amenities: [], images: [] });
    };

    const handleRevokeKey = (id: string) => {
        if (confirm("Revoke all digital access privileges? This will automatically list this unit as a vacancy using the pre-registered property features.")) {
            setEditedData(prev => ({ ...prev, tenants: prev.tenants.filter(t => t !== id) }));
            
            const unitPart = id.split('-')[1];
            // Automation: Convert pre-registered features back into a vacancy listing
            setEditedData(prev => ({
                ...prev,
                vacancies: [
                    ...prev.vacancies,
                    { 
                        id: `v_${Date.now()}`, 
                        unitNumber: unitPart || '?', 
                        floor: 'N/A', 
                        type: 'Commercial', 
                        configuration: 'Retail Shell (Pre-listed)', 
                        status: 'Vacant', 
                        rentAmount: 0 // Ideally fetched from saved unit state
                    }
                ]
            }));
        }
    };

    const inputClass = "w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-brand-navy outline-none focus:bg-white focus:border-brand-gold transition-all placeholder-gray-300";
    const labelClass = "text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1 block";

    if (scanningUnit) {
        return (
            <QRScannerView 
                onBack={() => setScanningUnit(null)} 
                onScanSuccess={(data) => {
                    const userId = data.startsWith('PROFILE:') ? data.split(':')[1] : data;
                    const newKeyId = `U-${scanningUnit.unitNumber}-${Date.now().toString().slice(-4)}`;
                    setEditedData(prev => ({
                        ...prev,
                        tenants: [...prev.tenants, newKeyId],
                        vacancies: prev.vacancies.filter(v => v.id !== scanningUnit.id)
                    }));
                    alert(`Unit ${scanningUnit.unitNumber} assigned to ID: ${userId}.`);
                    setScanningUnit(null);
                }}
                overlay={(
                    <div className="absolute top-20 left-6 right-6 text-center pointer-events-none">
                        <p className="text-white font-black text-xs uppercase tracking-[0.3em] mb-2 shadow-sm">Assigning Unit {scanningUnit.unitNumber}</p>
                        <p className="text-gray-400 text-[9px] uppercase tracking-widest leading-relaxed">Scan the tenant's profile QR code to link the digital key.</p>
                    </div>
                )}
            />
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-32">
            <header className="bg-white p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 z-40 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-3 bg-gray-50 rounded-2xl active:scale-90 transition-transform"><BackIcon /></button>
                    <div>
                        <h1 className="text-xl font-black text-brand-navy uppercase tracking-tight italic leading-none">{editedData.name}</h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Property Control</p>
                    </div>
                </div>
                <button onClick={handleSave} className="bg-brand-navy text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">Save Sync</button>
            </header>

            <nav className="flex gap-1 p-1 bg-white border-b border-gray-100 overflow-x-auto no-scrollbar sticky top-[81px] z-30">
                {[
                    { id: 'overview', label: 'Identity' },
                    { id: 'keys', label: 'Keys' },
                    { id: 'inventory', label: 'Vacancies' },
                    { id: 'leads', label: 'Leads' },
                    { id: 'qr', label: 'Gate' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 min-w-[80px] py-4 text-[9px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === tab.id ? 'text-brand-navy border-brand-gold bg-gray-50' : 'text-gray-400 border-transparent'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            <main className="p-6 max-w-lg mx-auto w-full space-y-8 animate-fade-in">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                            <div><label className={labelClass}>Official Building Name</label><input value={editedData.name} onChange={e => setEditedData(p=>({...p, name: e.target.value}))} className={inputClass} /></div>
                            <div><label className={labelClass}>Location Registry</label><input value={editedData.location} onChange={e => setEditedData(p=>({...p, location: e.target.value}))} className={inputClass} /></div>
                            <div><label className={labelClass}>Bio / Tagline</label><textarea value={editedData.about} onChange={e => setEditedData(p=>({...p, about: e.target.value}))} className={`${inputClass} h-32 resize-none`} /></div>
                        </div>
                    </div>
                )}

                {activeTab === 'keys' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-end px-1">
                            <div>
                                <h2 className="text-xl font-black text-brand-navy uppercase tracking-tight italic leading-none">Access Registry</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Issue Keys & Record Features</p>
                            </div>
                            {!issuingKey && (
                                <button onClick={() => setIssuingKey(true)} className="bg-brand-navy text-white p-4 rounded-2xl shadow-xl active:scale-90 transition-transform">
                                    <PlusIcon />
                                </button>
                            )}
                        </div>

                        {issuingKey && (
                            <div className="bg-white p-8 rounded-[40px] border border-brand-gold/30 shadow-2xl space-y-8 animate-slide-in-up">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-brand-gold/10 rounded-xl text-brand-gold"><BuildingIcon /></div>
                                        <h4 className="text-[10px] font-black text-brand-navy uppercase tracking-widest">New Property Listing & Key</h4>
                                    </div>
                                    <button onClick={() => setIssuingKey(false)} className="text-gray-300 p-2 text-2xl hover:text-gray-500">&times;</button>
                                </div>
                                
                                <div className="space-y-8">
                                    {/* Section 1: Unit Identification */}
                                    <div className="space-y-4">
                                        <h5 className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] border-b border-gray-50 pb-2">1. Unit Identification</h5>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className={labelClass}>Unit Number*</label><input className={inputClass} placeholder="e.g. 402B" value={issueForm.unitNumber} onChange={e => setIssueForm(p => ({ ...p, unitNumber: e.target.value }))} /></div>
                                            <div><label className={labelClass}>Floor Level</label><input className={inputClass} placeholder="e.g. 4th" value={issueForm.floor} onChange={e => setIssueForm(p => ({ ...p, floor: e.target.value }))} /></div>
                                        </div>
                                    </div>

                                    {/* Section 2: Property Nature */}
                                    <div className="space-y-4">
                                        <h5 className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] border-b border-gray-50 pb-2">2. Nature of Premise</h5>
                                        <div>
                                            <label className={labelClass}>Usage Type</label>
                                            <select className={inputClass} value={issueForm.type} onChange={e => setIssueForm(p => ({ ...p, type: e.target.value as any }))}>
                                                <option>Commercial</option>
                                                <option>Residential</option>
                                                <option>Retail</option>
                                                <option>Office</option>
                                                <option>Hospitality</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Rental Configuration* (Listing Title)</label>
                                            <input className={inputClass} placeholder="e.g. Two Bedroom Penthouse" value={issueForm.configuration} onChange={e => setIssueForm(p => ({ ...p, configuration: e.target.value }))} />
                                        </div>
                                    </div>

                                    {/* Section 3: Physicals & Price */}
                                    <div className="space-y-4">
                                        <h5 className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] border-b border-gray-50 pb-2">3. Dimensions & Valuation</h5>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className={labelClass}>Area (Floor sqft)</label><input className={inputClass} placeholder="e.g. 900" value={issueForm.size} onChange={e => setIssueForm(p => ({ ...p, size: e.target.value }))} /></div>
                                            <div><label className={labelClass}>Proposed Rent (Ksh)</label><input className={inputClass} placeholder="Optional" value={issueForm.rentAmount} onChange={e => setIssueForm(p => ({ ...p, rentAmount: e.target.value }))} /></div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className={labelClass}>Unit Pictures</label>
                                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                                {issueForm.images.map((img, i) => (
                                                    <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                                        <img src={img} className="w-full h-full object-cover" />
                                                        <button onClick={() => setIssueForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))} className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl-lg">&times;</button>
                                                    </div>
                                                ))}
                                                <input 
                                                    type="file" 
                                                    ref={unitFileInputRef} 
                                                    accept="image/*" 
                                                    multiple 
                                                    className="hidden" 
                                                    onChange={(e) => {
                                                        const files = e.target.files;
                                                        if (files) {
                                                            Array.from(files).forEach((file: File) => {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    if (reader.result) {
                                                                        setIssueForm(p => ({ ...p, images: [...p.images, reader.result as string] }));
                                                                    }
                                                                };
                                                                reader.readAsDataURL(file);
                                                            });
                                                        }
                                                    }} 
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => unitFileInputRef.current?.click()}
                                                    className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
                                                >
                                                    <PlusIcon />
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Short Description</label>
                                            <textarea className={`${inputClass} h-20 resize-none`} placeholder="Key features for future listing..." value={issueForm.description} onChange={e => setIssueForm(p=>({...p, description: e.target.value}))} />
                                        </div>
                                    </div>

                                    {/* Section 4: Keyholder (Optional) */}
                                    <div className="space-y-4">
                                        <h5 className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] border-b border-gray-50 pb-2">4. Assignment (Optional)</h5>
                                        <div>
                                            <label className={labelClass}>Tenant Phone Number</label>
                                            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden px-4 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-gold transition-all shadow-inner">
                                                <span className="text-gray-400 font-bold text-sm">+254</span>
                                                <input className="w-full p-4 bg-transparent outline-none font-bold text-brand-navy" placeholder="722 000 000" value={issueForm.phone} onChange={e => setIssueForm(p => ({ ...p, phone: e.target.value }))} />
                                            </div>
                                            <p className="text-[8px] font-black text-brand-gold uppercase tracking-widest mt-2 ml-1 italic">Leave blank to list as Vacant. Digital Key will bypass to tenant if provided.</p>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={handleIssueKey} className="w-full bg-brand-navy text-white font-black py-5 rounded-[28px] uppercase tracking-[0.3em] text-[10px] shadow-2xl active:scale-95 transition-all border border-white/10">Authorize & Register Key</button>
                            </div>
                        )}

                        <div className="space-y-3">
                            {editedData.tenants.length > 0 ? editedData.tenants.map((tId, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-[32px] border border-gray-100 flex items-center justify-between shadow-sm group hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner"><KeyIcon /></div>
                                        <div className="min-w-0">
                                            <p className="font-black text-brand-navy text-sm uppercase tracking-tight truncate italic">Unit {tId.split('-')[1] || '?'}</p>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest truncate">Registry Ref: {tId}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleRevokeKey(tId)} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all active:scale-90"><TrashIcon /></button>
                                </div>
                            )) : !issuingKey && <div className="text-center py-24 border-2 border-dashed border-gray-100 rounded-[48px] opacity-30"><p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-navy italic">No digital keys issued</p></div>}
                        </div>
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="space-y-6">
                        <div className="px-1 flex justify-between items-end">
                            <div><h2 className="text-xl font-black text-brand-navy uppercase tracking-tight italic leading-none">Vacancies</h2><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Registry-Synced Listings</p></div>
                            <button onClick={() => { setIssuingKey(true); setActiveTab('keys'); }} className="bg-brand-navy text-white p-3 rounded-2xl shadow-xl active:scale-90"><PlusIcon /></button>
                        </div>
                        <div className="space-y-4">
                            {editedData.vacancies.map(u => (
                                <div key={u.id} className="bg-white p-6 rounded-[40px] border border-gray-100 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-3xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center font-black">
                                                <span className="text-[9px] text-gray-300">UNIT</span>
                                                <span className="text-xl text-brand-navy italic">{u.unitNumber}</span>
                                            </div>
                                            <div>
                                                <p className="font-black text-brand-navy text-sm uppercase tracking-tight">{u.configuration}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{u.floor} Floor • {u.size || 'N/A'} sqft</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-brand-gold uppercase">{u.rentAmount ? `Ksh ${u.rentAmount.toLocaleString()}` : 'POA'}</p>
                                        </div>
                                    </div>
                                    
                                    {u.images && u.images.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                            {u.images.map((img, i) => <img key={i} src={img} className="w-20 h-20 rounded-xl object-cover bg-gray-100" />)}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${u.isListed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{u.isListed ? 'Publicly Listed' : 'Unlisted'}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1 flex flex-col gap-2">
                                                <button 
                                                    onClick={() => {
                                                        const phone = prompt("Enter Tenant Phone Number:");
                                                        if (phone) {
                                                            const newKeyId = `U-${u.unitNumber}-${Date.now().toString().slice(-4)}`;
                                                            setEditedData(prev => ({
                                                                ...prev,
                                                                tenants: [...prev.tenants, newKeyId],
                                                                vacancies: prev.vacancies.filter(v => v.id !== u.id)
                                                            }));
                                                            alert(`Unit ${u.unitNumber} assigned to +254${phone}.`);
                                                        }
                                                    }}
                                                    className="text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shadow-sm w-full"
                                                >
                                                    Phone Assign
                                                </button>
                                                <button 
                                                    onClick={() => setScanningUnit(u)}
                                                    className="text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm w-full flex items-center justify-center gap-2"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                                                    Scan to Assign
                                                </button>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    setEditedData(prev => ({
                                                        ...prev,
                                                        vacancies: prev.vacancies.map(v => v.id === u.id ? { ...v, isListed: !v.isListed } : v)
                                                    }));
                                                }}
                                                className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg border transition-all flex-1 ${u.isListed ? 'bg-red-50 text-red-500 border-red-100' : 'bg-brand-navy text-white border-brand-navy shadow-md'}`}
                                            >
                                                {u.isListed ? 'Unlist Unit' : 'List Unit'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {editedData.vacancies.length === 0 && <div className="text-center py-20 opacity-30"><p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-navy italic">Fully Occupied</p></div>}
                        </div>
                    </div>
                )}

                {activeTab === 'leads' && (
                    <div className="space-y-6">
                        <div className="px-1">
                            <h2 className="text-xl font-black text-brand-navy uppercase tracking-tight italic leading-none">Property Leads</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Tenant Inquiries</p>
                        </div>
                        <div className="space-y-3">
                            {leads.map(lead => (
                                <div key={lead.id} className="bg-white p-5 rounded-[32px] border border-gray-100 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">👤</div>
                                        <div>
                                            <p className="font-black text-brand-navy text-sm uppercase tracking-tight">{lead.userName}</p>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Interested in {lead.vacancyType}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <a href={`tel:${lead.userPhone}`} className="text-xs font-black text-blue-600 uppercase tracking-widest">Call &rarr;</a>
                                        <p className="text-[8px] text-gray-300 font-bold uppercase mt-1">{lead.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {activeTab === 'qr' && (
                    <div className="space-y-8 animate-fade-in flex flex-col items-center py-10">
                        <div className="text-center space-y-2 mb-4">
                            <h2 className="text-xl font-black text-brand-navy uppercase tracking-tight italic leading-none">Gateman Master Key</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Premise ID Authentication</p>
                        </div>
                        
                        <div className="bg-white p-8 rounded-[48px] shadow-2xl border border-gray-100 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PREMISE:${editedData.id}`} className="w-64 h-64 mix-blend-multiply relative z-10" alt="Master Key" />
                        </div>
                        
                        <div className="max-w-xs text-center">
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">Security staff should scan this code to link their session to this property for entry verification.</p>
                            <button className="mt-8 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] underline underline-offset-8">Print Gate Poster</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PremiseManagementView;
