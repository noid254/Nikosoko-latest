import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { BusinessAssets, Document } from '../types';
import { ShareModal } from './InvoiceGenerator';

const currencyFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

interface ReceiptGeneratorProps {
    assets: BusinessAssets;
    onSave: (doc: Omit<Document, 'id'>) => void;
    onBack: () => void;
}

const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({ assets, onSave, onBack }) => {
  const [step, setStep] = useState(1);
  const [items, setItems] = useState<any[]>([
      { id: 1, name: 'Standard Service Transaction', qty: 1, price: 2500 }
  ]);
  const [clientName, setClientName] = useState('');
  const [cashReceived, setCashReceived] = useState<number | ''>(2500);
  const [paymentMethod, setPaymentMethod] = useState('M-Pesa');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const [businessName, setBusinessName] = useState(assets.name);
  const [receiptId, setReceiptId] = useState(`R-${Date.now().toString().slice(-6)}`);

  const receiptPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBusinessName(assets.name);
  }, [assets]);
  
  const total = useMemo(() => items.reduce((sum, item) => sum + (item.qty * item.price), 0), [items]);
  const change = useMemo(() => {
    const cash = typeof cashReceived === 'number' ? cashReceived : 0;
    return cash >= total ? cash - total : 0;
  }, [cashReceived, total]);

  const handleSaveAndShare = () => {
      onSave({
          type: 'Receipt',
          number: receiptId,
          issuerName: businessName,
          clientName: clientName || undefined,
          date: new Date().toISOString(),
          amount: total,
          currency: 'Ksh',
          paymentStatus: 'Paid',
          items: items.map(i => ({ description: i.name, quantity: i.qty, price: i.price })),
          paymentInstructions: `Payment Method: ${paymentMethod}\nTendered: ${cashReceived}\nChange: ${change}`
      });
      setIsShareModalOpen(true);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gray-50/60 min-h-screen font-sans pb-20 border-x border-gray-200/80">
      <div className="p-3.5 bg-black text-white sticky top-0 z-20 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <button onClick={onBack} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="text-center">
                <h2 className="font-black text-xs uppercase tracking-wider italic text-white">PAYMENT RECEIPT GENERATOR</h2>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Step {step} of 2</p>
            </div>
            <div className="w-8"></div>
          </div>
          <div className="flex gap-1.5 px-2">
             {[1,2].map(s => <div key={s} className={`h-1 flex-1 rounded-full transition-all ${step >= s ? 'bg-white' : 'bg-white/20'}`}></div>)}
          </div>
      </div>
      
      <div className="p-3.5">
        {step === 1 && (
            <ItemsAndDetailsStep 
                items={items} setItems={setItems}
                clientName={clientName} setClientName={setClientName}
                paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
                onNext={() => setStep(2)}
            />
        )}
        {step === 2 && (
            <PreviewStep 
                ref={receiptPreviewRef}
                logo={assets.logo}
                businessName={businessName}
                tagline={assets.tagline}
                address={assets.address}
                phone={assets.phone}
                email={assets.email}
                receiptId={receiptId}
                items={items}
                total={total}
                cashReceived={cashReceived}
                setCashReceived={setCashReceived}
                change={change}
                paymentMethod={paymentMethod}
                onBack={() => setStep(1)}
                onSaveAndShare={handleSaveAndShare}
            />
        )}
      </div>
      {isShareModalOpen && <ShareModal type="receipt" number={receiptId} fromName={businessName} onDone={onBack} />}
    </div>
  );
};

const formInputClass = "mt-1 w-full p-2.5 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white text-xs font-bold text-black outline-none transition-all placeholder-gray-400";
const labelClass = "block text-[9px] font-black text-black uppercase tracking-widest mb-0.5";

const ItemsAndDetailsStep: React.FC<any> = ({ items, setItems, clientName, setClientName, paymentMethod, setPaymentMethod, onNext }) => {
    const [name, setName] = useState('');
    const [qty, setQty] = useState('1');
    const [price, setPrice] = useState('');

    const addItem = () => {
        if (!name || !price) return;
        setItems([...items, { id: Date.now(), name, qty: parseFloat(qty), price: parseFloat(price) }]);
        setName(''); setQty('1'); setPrice('');
    };

    return (
         <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-white rounded-2xl shadow-xs border border-gray-200 space-y-4">
                <div className="border-b pb-2">
                    <h2 className="text-xs font-black text-black uppercase tracking-wider">Transaction Info</h2>
                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Payer and payment channel</p>
                </div>

                <div>
                    <label className={labelClass}>Customer / Payer Name</label>
                    <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Walk-in Customer" className={formInputClass}/>
                </div>
                <div>
                    <label className={labelClass}>Payment Channel</label>
                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className={formInputClass}>
                        <option>M-Pesa</option>
                        <option>Cash</option>
                        <option>Card Payment</option>
                        <option>Bank Wire</option>
                    </select>
                </div>

                <div className="pt-2 border-t border-gray-200 space-y-2">
                    <label className="text-[9px] font-black uppercase text-black">Add Paid Item / Service</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Item Description" className={formInputClass} />
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[8px] font-bold uppercase text-gray-500">Qty</label>
                            <input value={qty} onChange={e => setQty(e.target.value)} type="number" placeholder="1" className={formInputClass} />
                        </div>
                        <div>
                            <label className="text-[8px] font-bold uppercase text-gray-500">Amount (KES)</label>
                            <input value={price} onChange={e => setPrice(e.target.value)} type="number" placeholder="2500" className={formInputClass}/>
                        </div>
                    </div>
                    <button onClick={addItem} className="w-full bg-black text-white font-black py-2.5 rounded-xl text-[9px] uppercase tracking-widest hover:bg-gray-800">
                        + Add To Receipt
                    </button>
                </div>

                {items.length > 0 && (
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pt-2 border-t border-gray-200">
                        <label className="text-[9px] font-black uppercase text-black">Receipt Items ({items.length})</label>
                        {items.map((i: any) => (
                            <div key={i.id} className="flex justify-between items-center p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                                <div className="min-w-0 pr-2">
                                    <span className="font-bold text-black truncate block">{i.qty}x {i.name}</span>
                                    <span className="text-[9px] text-gray-500">KES {i.price.toLocaleString()} each</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="font-black text-black">KES {(i.qty * i.price).toLocaleString()}</span>
                                    <button onClick={() => setItems(items.filter((x: any) => x.id !== i.id))} className="text-red-600 font-bold px-1.5 py-0.5 hover:bg-red-50 rounded">✕</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button 
                onClick={onNext} 
                disabled={items.length === 0} 
                className="w-full bg-black text-white font-black py-3 rounded-xl shadow-md disabled:bg-gray-300 uppercase text-[10px] tracking-widest transition-all"
            >
                Preview Receipt &rarr;
            </button>
        </div>
    );
};

const PreviewStep = React.forwardRef<HTMLDivElement, any>(({ logo, businessName, tagline, address, phone, email, receiptId, items, total, cashReceived, setCashReceived, change, paymentMethod, onBack, onSaveAndShare }, ref) => {
    return (
        <div className="space-y-4">
            <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-xs">
                 <label className={labelClass}>Amount Tendered / Paid (KES)</label>
                 <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-black text-xs">KES</span>
                    <input 
                        type="number" 
                        value={cashReceived} 
                        onChange={e => setCashReceived(Number(e.target.value))} 
                        className={`${formInputClass} pl-12 text-sm font-black text-black`} 
                        placeholder="0.00" 
                    />
                 </div>
            </div>
            
            {/* THERMAL RECEIPT SLIP PREVIEW */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-300 overflow-hidden font-mono text-xs text-gray-900 p-4 space-y-4" ref={ref}>
                {/* BRAND HEADER */}
                <div className="text-center pb-3 border-b border-black space-y-1">
                    {logo && <img src={logo} alt="logo" className="max-h-12 mx-auto mb-1 object-contain"/>}
                    <h1 className="text-sm font-black uppercase tracking-wider">{businessName || 'SERVICE PROVIDER'}</h1>
                    {tagline && <p className="text-[9px] font-sans italic text-gray-600">"{tagline}"</p>}
                    <div className="text-[8px] font-sans text-gray-500 leading-tight pt-1">
                        {phone && <p>Tel: {phone}</p>}
                        {email && <p>Email: {email}</p>}
                        {address && <p>{address}</p>}
                    </div>
                </div>

                {/* METADATA */}
                <div className="flex justify-between text-[9px] font-bold border-b border-gray-200 pb-2">
                    <span>DATE: {new Date().toLocaleDateString('en-GB')}</span>
                    <span>REF: {receiptId}</span>
                </div>

                {/* LINE ITEMS */}
                <div className="space-y-2">
                    <div className="flex justify-between font-black border-b border-black pb-1 text-[9px] uppercase">
                        <span>ITEM / SERVICE</span>
                        <span>AMOUNT</span>
                    </div>

                    {items.map((i: any) => (
                        <div key={i.id} className="space-y-0.5 text-[10px]">
                            <div className="flex justify-between font-bold">
                                <span className="truncate pr-2">{i.name}</span>
                                <span>KES {currencyFormatter.format(i.price * i.qty)}</span>
                            </div>
                            <div className="text-[8.5px] text-gray-500 font-sans">
                                {i.qty} unit(s) @ KES {currencyFormatter.format(i.price)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* TOTALS */}
                <div className="border-t-2 border-black pt-2 space-y-1 text-xs">
                    <div className="flex justify-between font-black text-sm">
                        <span>TOTAL PAID</span>
                        <span>KES {total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-600 font-sans">
                        <span>Paid Via ({paymentMethod})</span>
                        <span>KES {Number(cashReceived).toLocaleString()}</span>
                    </div>
                    {change > 0 && (
                        <div className="flex justify-between text-[10px] text-emerald-700 font-bold font-sans">
                            <span>Balance / Change</span>
                            <span>KES {change.toLocaleString()}</span>
                        </div>
                    )}
                </div>

                {/* FOOTER & QR */}
                <div className="border-t border-dashed border-gray-300 pt-3 text-center space-y-2">
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=https://nikosoko.app/view/receipt/${receiptId.replace('#', '')}`} 
                        className="w-16 h-16 mx-auto border border-gray-200 p-0.5 rounded-lg" 
                        alt="Verification QR"
                    />
                    <p className="text-[8px] font-black uppercase tracking-widest text-black">OFFICIAL PAYMENT RECEIPT</p>
                    <p className="text-[7.5px] font-sans text-gray-400">Thank you for your business!</p>
                </div>
            </div>

             <div className="flex gap-2">
                <button 
                    onClick={onBack} 
                    className="flex-1 bg-white border border-gray-300 text-black font-black py-3 rounded-xl uppercase text-[10px] tracking-widest shadow-xs hover:bg-gray-50"
                >
                    Edit
                </button>
                <button 
                    onClick={onSaveAndShare} 
                    className="flex-1 bg-black text-white font-black py-3 rounded-xl shadow-md active:scale-95 transition-all uppercase text-[10px] tracking-widest"
                >
                    Save & Share &rarr;
                </button>
            </div>
        </div>
    );
});

export default ReceiptGenerator;
