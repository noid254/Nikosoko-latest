
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { Document, DocumentItem } from '../types';
import LoadingSpinner from './LoadingSpinner';

const cleanJsonString = (str: string) => str.replace(/```json\n?|```/g, '').trim();

interface ScanDocumentViewProps {
    onBack: () => void;
    onSave: (doc: Omit<Document, 'id'>) => void;
}

// Workflow steps
type ScanStep = 'selection' | 'capture-receipt' | 'ocr-processing' | 'capture-front' | 'capture-back' | 'capture-serial' | 'confirm' | 'saving';

const ScanDocumentView: React.FC<ScanDocumentViewProps> = ({ onBack, onSave }) => {
    const [step, setStep] = useState<ScanStep>('selection');
    const [receiptImage, setReceiptImage] = useState<string | null>(null);
    const [frontImage, setFrontImage] = useState<string | null>(null);
    const [backImage, setBackImage] = useState<string | null>(null);
    const [serialImage, setSerialImage] = useState<string | null>(null);

    const [docData, setDocData] = useState<Partial<Omit<Document, 'id'>>>({
        type: 'Receipt',
        isAsset: true,
        verificationStatus: 'Unverified',
        currency: 'Ksh'
    });
    
    const [isStreaming, setIsStreaming] = useState(false);
    const [activeCaptureType, setActiveCaptureType] = useState<ScanStep | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startCamera = async (targetStep: ScanStep) => {
        setActiveCaptureType(targetStep);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setIsStreaming(true);
            }
        } catch (err) { 
            alert("Camera access is required for digital registry authentication."); 
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
        setIsStreaming(false);
    };

    const capture = () => {
        if (videoRef.current && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            ctx?.drawImage(videoRef.current, 0, 0);
            const data = canvasRef.current.toDataURL('image/jpeg', 0.85);
            
            if (activeCaptureType === 'capture-receipt') {
                setReceiptImage(data);
                setStep('ocr-processing');
                handleRunOCR(data);
            } else if (activeCaptureType === 'capture-front') {
                setFrontImage(data);
                setStep('selection');
            } else if (activeCaptureType === 'capture-back') {
                setBackImage(data);
                setStep('selection');
            } else if (activeCaptureType === 'capture-serial') {
                setSerialImage(data);
                setStep('selection');
            }
            
            stopCamera();
        }
    };

    const handleRunOCR = async (base64Full: string) => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const base64 = base64Full.split(',')[1];
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64 } },
                    { text: "Digital Asset Registry OCR: Extract Store Name (issuerName), Transaction Date (YYYY-MM-DD), Total Amount, and look closely for an IMEI or SERIAL NUMBER. Return JSON ONLY: { 'issuerName': '', 'date': '', 'amount': 0, 'serial': '' }." }
                ]}
            });
            const data = JSON.parse(cleanJsonString(response.text || '{}'));
            
            setDocData(prev => ({
                ...prev,
                issuerName: data.issuerName || 'Merchant Store',
                date: data.date || new Date().toISOString().split('T')[0],
                amount: data.amount || 0,
                items: [{ 
                    description: 'New Asset', 
                    quantity: 1, 
                    price: data.amount || 0, 
                    serial: data.serial || '' 
                }]
            }));
            
            setStep('selection');
            if (!data.serial) {
                alert("Receipt scanning complete, but no Serial Number was detected. Legal Trace requires a manual serial entry below.");
            }
        } catch (e) {
            console.error("OCR Failed", e);
            setStep('selection');
        }
    };

    const handleFinalSave = () => {
        const serial = docData.items?.[0]?.serial;
        if (!serial || serial.trim().length < 4) {
            alert("VALIDATION ERROR: An asset is not valid without a serial number or IMEI for legal trace.");
            return;
        }

        if (!frontImage || !backImage || !serialImage) {
            alert("MANDATORY PHOTOS: Please capture Front, Back, and Serial Label views of the item.");
            return;
        }

        setStep('saving');
        
        onSave({
            ...docData,
            scannedImageUrl: receiptImage!,
            productImages: [frontImage, backImage, serialImage],
            registrationNumber: serial,
            verificationStatus: 'Pending',
        } as Omit<Document, 'id'>);
        
        setTimeout(() => onBack(), 2000);
    };

    if (isStreaming) {
        let title = "Align Frame";
        if (activeCaptureType === 'capture-receipt') title = "Receipt (Flat Surface)";
        if (activeCaptureType === 'capture-front') title = "Asset: Front View";
        if (activeCaptureType === 'capture-back') title = "Asset: Back View";
        if (activeCaptureType === 'capture-serial') title = "Asset: Serial Label";

        return (
            <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-6">
                <div className="w-full relative aspect-[3/4] rounded-[40px] overflow-hidden border-4 border-white/20 shadow-2xl">
                    <video ref={videoRef} className="w-full h-full object-cover" playsInline />
                    <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-brand-gold shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse"></div>
                    <div className="absolute bottom-10 left-0 right-0 text-center">
                        <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-white/10">{title}</span>
                    </div>
                </div>
                <div className="mt-10 flex gap-8 items-center">
                    <button onClick={stopCamera} className="text-white font-black text-xs uppercase tracking-widest">Cancel</button>
                    <button onClick={capture} className="w-20 h-20 rounded-full bg-white border-[6px] border-gray-200 active:scale-90 transition-transform shadow-2xl flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full border-2 border-gray-100"></div>
                    </button>
                    <div className="w-14"></div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
            </div>
        );
    }

    if (step === 'ocr-processing') {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-brand-navy p-10 text-center space-y-6">
                <LoadingSpinner message="AI Registry Extraction..." />
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest animate-pulse">Reading serial codes and imei</p>
            </div>
        );
    }

    if (step === 'saving') {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-white p-10 text-center space-y-6 animate-fade-in">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-4xl shadow-inner ring-1 ring-green-100">✓</div>
                <h2 className="text-2xl font-black text-brand-navy uppercase tracking-tight italic">Registry Saved</h2>
                <p className="text-gray-400 font-medium text-sm leading-relaxed">Your asset is now secured in the digital vault. Legal trace sequence initialized.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
            <header className="p-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-brand-navy"><BackIcon /></button>
                    <h1 className="text-lg font-black text-brand-navy uppercase tracking-tight italic">Asset Registry</h1>
                </div>
            </header>

            <main className="p-6 flex-1 space-y-8 overflow-y-auto no-scrollbar pb-32">
                <div className="space-y-6 animate-fade-in">
                    {/* Step 1: Receipt */}
                    <div className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100">
                        <h2 className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-4">Step 1: Store Receipt</h2>
                        <button 
                            onClick={() => startCamera('capture-receipt')} 
                            className={`w-full overflow-hidden rounded-[24px] border-2 transition-all p-6 flex flex-col items-center justify-center min-h-[120px] ${receiptImage ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-dashed border-gray-200 shadow-inner'}`}
                        >
                            {receiptImage ? (
                                <div className="flex items-center gap-4 w-full">
                                    <img src={receiptImage} className="w-16 h-16 object-cover rounded-xl shadow-sm border border-white" />
                                    <div className="text-left">
                                        <p className="font-black text-brand-navy text-xs uppercase">{docData.issuerName || 'Receipt Detected'}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Total: Ksh {docData.amount?.toLocaleString()}</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <span className="text-3xl mb-2">📄</span>
                                    <span className="font-black text-brand-navy text-[10px] uppercase tracking-widest">Scan Official Receipt</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Step 2: Product Visuals */}
                    <div className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100">
                        <h2 className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-4">Step 2: Legal ID Photos</h2>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'capture-front', img: frontImage, label: 'Front' },
                                { id: 'capture-back', img: backImage, label: 'Back' },
                                { id: 'capture-serial', img: serialImage, label: 'SN Label' }
                            ].map(btn => (
                                <button 
                                    key={btn.id}
                                    onClick={() => startCamera(btn.id as any)}
                                    className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all overflow-hidden ${btn.img ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-gray-50 border-dashed border-gray-200'}`}
                                >
                                    {btn.img ? (
                                        <img src={btn.img} className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <span className="text-xl mb-1">📷</span>
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{btn.label}</span>
                                        </>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 3: Serial Validation */}
                    {receiptImage && (
                        <div className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 space-y-4 animate-slide-in-up">
                            <h2 className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Step 3: Identity Validation</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-gray-300 ml-1">Asset Description</label>
                                    <input 
                                        value={docData.items?.[0]?.description || ''} 
                                        onChange={e => setDocData(p => ({...p, items: [{...p.items?.[0]!, description: e.target.value}]}))} 
                                        className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-brand-navy border border-transparent focus:bg-white outline-none" 
                                        placeholder="e.g. MacBook Pro M3" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-gray-300 ml-1">Serial Number (Trace Key)</label>
                                    <input 
                                        value={docData.items?.[0]?.serial || ''} 
                                        onChange={e => setDocData(p => ({...p, items: [{...p.items?.[0]!, serial: e.target.value}]}))} 
                                        className={`w-full p-4 rounded-2xl font-mono font-black border transition-all outline-none ${docData.items?.[0]?.serial ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-400 border-red-100'}`} 
                                        placeholder="REQUIRED" 
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-gray-100 z-20">
                <button 
                    disabled={!receiptImage || !frontImage || !backImage || !serialImage || !docData.items?.[0]?.serial}
                    onClick={handleFinalSave} 
                    className="w-full max-w-md mx-auto bg-brand-navy text-white font-black py-5 rounded-[28px] shadow-2xl disabled:bg-gray-200 disabled:text-gray-400 text-xs uppercase tracking-[0.3em] active:scale-95 transition-all flex items-center justify-center gap-3 border border-white/10"
                >
                    Secure To Vault
                </button>
            </div>
        </div>
    );
};

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>;

export default ScanDocumentView;
