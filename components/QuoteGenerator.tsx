
import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { BusinessAssets, Document } from '../types';
import { ShareModal } from './InvoiceGenerator';

interface QuoteGeneratorProps {
    assets: BusinessAssets;
    onSave: (doc: Omit<Document, 'id'>) => void;
    onBack: () => void;
    onComplete?: () => void;
}

interface LineItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
}

const QuoteGenerator: React.FC<QuoteGeneratorProps> = ({ assets, onSave, onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [fromName, setFromName] = useState(assets.name);
  const [toName, setToName] = useState('Prospect Client');
  const [toDetails, setToDetails] = useState('');
  const [quoteNumber, setQuoteNumber] = useState(`#QTE-${Date.now().toString().slice(-8)}`);
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [validUntil, setValidUntil] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'));

  const [lineItems, setLineItems] = useState<LineItem[]>([
      {id: 1, description: 'Proposed Service', quantity: 1, unitPrice: 0},
  ]);
  
  const [discountRate, setDiscountRate] = useState(0);
  const [taxRate, setTaxRate] = useState(16);
  const [notes, setNotes] = useState('Standard project validity is 30 days.');

  const quotePreviewRef = useRef<HTMLDivElement>(null);

  const { subtotal, discountAmount, taxAmount, totalDue } = useMemo(() => {
    const subtotal = lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const discountAmount = subtotal * (discountRate / 100);
    const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
    const totalDue = subtotal - discountAmount + taxAmount;
    return { subtotal, discountAmount, taxAmount, totalDue };
  }, [lineItems, discountRate, taxRate]);
  
  useEffect(() => {
    setFromName(assets.name);
  }, [assets]);

  const handleSaveAndShare = async () => {
      onSave({
        type: 'Quote',
        number: quoteNumber,
        issuerName: fromName,
        clientName: toName,
        date: new Date(date).toISOString(),
        dueDate: new Date(validUntil).toISOString(),
        amount: totalDue,
        currency: 'Ksh',
        paymentStatus: 'Draft',
        items: lineItems.map(i => ({ description: i.description, quantity: i.quantity, price: i.unitPrice })),
        terms: notes,
        discountRate,
        taxRate
      });
      setIsShareModalOpen(true);
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
       <div className="p-4 bg-white sticky top-0 z-10 shadow-sm border-b">
          <div className="flex justify-between items-center mb-4">
            <button onClick={onBack} className="text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="font-black text-sm text-brand-navy uppercase tracking-widest italic">Quote Constructor</h2>
            <div className="w-6"></div>
          </div>
          <div className="flex justify-center gap-1">
             {[1,2,3].map(s => <div key={s} className={`h-1 flex-1 rounded-full ${step >= s ? 'bg-brand-navy' : 'bg-gray-200'}`}></div>)}
          </div>
      </div>
      
       <div className="p-4 pb-24">
        {step === 1 && (
            <AddressStep 
                toName={toName} setToName={setToName} toDetails={toDetails} setToDetails={setToDetails}
                quoteNumber={quoteNumber} setQuoteNumber={setQuoteNumber}
                date={date} setDate={setDate} validUntil={validUntil} setValidUntil={setValidUntil}
                onNext={() => setStep(2)}
            />
        )}
        {step === 2 && (
            <ItemsStep
                lineItems={lineItems} setLineItems={setLineItems}
                discountRate={discountRate} setDiscountRate={setDiscountRate}
                taxRate={taxRate} setTaxRate={setTaxRate}
                notes={notes} setNotes={setNotes}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
            />
        )}
        {step === 3 && (
            <QuotePreviewView
                ref={quotePreviewRef}
                assets={assets} fromName={fromName}
                toName={toName} toDetails={toDetails}
                quoteNumber={quoteNumber} date={date} validUntil={validUntil}
                lineItems={lineItems} 
                subtotal={subtotal} discountRate={discountRate} discountAmount={discountAmount} taxRate={taxRate} taxAmount={taxAmount} totalDue={totalDue}
                notes={notes}
                onBack={() => setStep(2)}
                onShare={handleSaveAndShare}
            />
        )}
       </div>
       {isShareModalOpen && <ShareModal type="quote" number={quoteNumber} fromName={fromName} onDone={onComplete || onBack} />}
    </div>
  );
};

const formInputClass = "mt-1 w-full p-2.5 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white text-xs font-bold text-black outline-none transition-all placeholder-gray-400";
const labelClass = "block text-[9px] font-black text-black uppercase tracking-widest mb-0.5";

const AddressStep: React.FC<any> = ({ 
    toName, setToName, toDetails, setToDetails, quoteNumber, setQuoteNumber, date, setDate, validUntil, setValidUntil, onNext
}) => (
    <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-200 space-y-4 animate-fade-in">
        <div className="border-b pb-2">
            <h2 className="text-xs font-black text-black uppercase tracking-wider">Client & Quote Reference</h2>
            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Prospect info and proposal validity</p>
        </div>

        <div className="space-y-3">
             <div>
                <label className={labelClass}>Prospect Customer Name</label>
                <input value={toName} onChange={e => setToName(e.target.value)} type="text" className={formInputClass} placeholder="e.g. Kisumu Solar Project" required/>
            </div>

            <div>
                <label className={labelClass}>Client Contact / Address</label>
                <textarea value={toDetails} onChange={e => setToDetails(e.target.value)} rows={2} className={`${formInputClass} h-14`} placeholder="e.g. Milimani, Kisumu • Phone: +254..." />
            </div>

            <div>
                <label className={labelClass}>Quote Reference ID</label>
                <input value={quoteNumber} onChange={e => setQuoteNumber(e.target.value)} type="text" className={formInputClass} required/>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className={labelClass}>Proposal Date</label>
                    <input value={date} onChange={e => setDate(e.target.value)} type="date" className={formInputClass} required/>
                </div>
                <div>
                    <label className={labelClass}>Valid Until</label>
                    <input value={validUntil} onChange={e => setValidUntil(e.target.value)} type="date" className={formInputClass} required/>
                </div>
            </div>

            <button onClick={onNext} className="w-full bg-black text-white font-black py-3 rounded-xl shadow-md mt-2 active:scale-95 transition-all uppercase text-[10px] tracking-widest">
                Add Cost Estimates &rarr;
            </button>
        </div>
    </div>
);

const ItemsStep: React.FC<any> = ({ lineItems, setLineItems, discountRate, setDiscountRate, taxRate, setTaxRate, notes, setNotes, onBack, onNext }) => {
    const [desc, setDesc] = useState('');
    const [qty, setQty] = useState('1');
    const [unitPrice, setUnitPrice] = useState('');

    const addItem = () => {
        const qtyNum = parseFloat(qty);
        const priceNum = parseFloat(unitPrice);
        if (!desc || isNaN(qtyNum) || isNaN(priceNum)) return;
        setLineItems((prev: any) => [...prev, { id: Date.now(), description: desc, quantity: qtyNum, unitPrice: priceNum }]);
        setDesc(''); setQty('1'); setUnitPrice('');
    };
    
    return (
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-200 space-y-4 animate-fade-in">
            <div className="border-b pb-2">
                <h2 className="text-xs font-black text-black uppercase tracking-wider">Itemized Scope & Pricing</h2>
                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Estimated labor & material costs</p>
            </div>

            <div className="space-y-3">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                     <label className="text-[9px] font-black uppercase text-black">New Line Item</label>
                     <input value={desc} onChange={e => setDesc(e.target.value)} type="text" placeholder="e.g. Solar Inverter Installation & Testing" className={formInputClass}/>
                     <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[8px] font-bold uppercase text-gray-500">Qty / Units</label>
                            <input value={qty} onChange={e => setQty(e.target.value)} type="number" placeholder="1" className={formInputClass}/>
                        </div>
                        <div>
                            <label className="text-[8px] font-bold uppercase text-gray-500">Estimated Rate (KES)</label>
                            <input value={unitPrice} onChange={e => setUnitPrice(e.target.value)} type="number" placeholder="3500" className={formInputClass}/>
                        </div>
                     </div>
                     <button onClick={addItem} className="w-full bg-black text-white font-black py-2 rounded-lg text-[9px] uppercase tracking-widest hover:bg-gray-800">
                        + Add Scope Item
                     </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {lineItems.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                            <div className="min-w-0 pr-2">
                                <p className="font-bold text-black truncate">{item.description}</p>
                                <p className="text-[9px] text-gray-500">{item.quantity} x KES {item.unitPrice.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="font-black text-black text-xs">KES {(item.quantity * item.unitPrice).toLocaleString()}</span>
                                <button onClick={() => setLineItems(lineItems.filter((i: any) => i.id !== item.id))} className="text-red-600 font-bold px-1.5 py-0.5 rounded hover:bg-red-50">
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div>
                    <label className={labelClass}>Validity & Scope Notes</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={`${formInputClass} h-14`} />
                </div>

                <div className="flex gap-2 pt-2">
                    <button onClick={onBack} className="flex-1 bg-gray-100 text-black font-black py-3 rounded-xl uppercase text-[10px] tracking-widest border border-gray-200">
                        Back
                    </button>
                    <button onClick={onNext} className="flex-1 bg-black text-white font-black py-3 rounded-xl shadow-md uppercase text-[10px] tracking-widest">
                        Generate Quote &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
};

const QuotePreviewView = React.forwardRef<HTMLDivElement, any>(({ 
    assets, fromName, toName, toDetails, quoteNumber, date, validUntil, lineItems, 
    subtotal, discountRate, discountAmount, taxRate, taxAmount, totalDue, notes, onBack, onShare
}, ref) => {
    return (
        <div className="space-y-4">
            <div 
                ref={ref} 
                className="bg-white rounded-2xl shadow-md border border-gray-300 overflow-hidden font-sans text-xs text-gray-900"
            >
                {/* BLACK HEADER BAND */}
                <div className="bg-black text-white p-4 flex justify-between items-start border-b border-gray-800">
                    <div className="space-y-1">
                        <span className="bg-amber-400 text-black text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                            OFFICIAL PRICE QUOTE
                        </span>
                        <h1 className="text-base font-black tracking-tight leading-tight uppercase">{fromName || 'Service Provider'}</h1>
                        <p className="text-[9px] text-gray-400 font-medium italic">{assets.tagline || 'Specialist Quotation'}</p>
                    </div>

                    <div className="text-right space-y-1">
                        <span className="text-lg font-black tracking-tighter block">{quoteNumber}</span>
                        <p className="text-[8px] text-gray-400 uppercase font-bold">Date: {new Date(date).toLocaleDateString('en-GB')}</p>
                        <p className="text-[8px] text-amber-400 uppercase font-bold">Valid: {new Date(validUntil).toLocaleDateString('en-GB')}</p>
                    </div>
                </div>

                {/* DETAILS ROW */}
                <div className="p-4 grid grid-cols-2 gap-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="space-y-1">
                        <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Prepared By</p>
                        <p className="font-black text-black">{fromName}</p>
                        <p className="text-[9px] text-gray-600 font-medium leading-tight">{assets.phone}</p>
                        <p className="text-[9px] text-gray-600 font-medium leading-tight truncate">{assets.email}</p>
                    </div>

                    <div className="space-y-1 text-right">
                        <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Prepared For</p>
                        <p className="font-black text-black">{toName}</p>
                        <p className="text-[9px] text-gray-600 font-medium leading-tight whitespace-pre-line">{toDetails || 'N/A'}</p>
                    </div>
                </div>

                {/* ITEMS TABLE */}
                <div className="p-4">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-black text-[8px] uppercase tracking-widest text-gray-500 font-black">
                                <th className="pb-2">Proposed Deliverable</th>
                                <th className="pb-2 text-center">Qty</th>
                                <th className="pb-2 text-right">Est. Rate</th>
                                <th className="pb-2 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {lineItems.map((item: any) => (
                                <tr key={item.id}>
                                    <td className="py-2.5 font-bold text-black max-w-[120px] truncate">{item.description}</td>
                                    <td className="py-2.5 text-center font-medium text-gray-600">{item.quantity}</td>
                                    <td className="py-2.5 text-right font-medium text-gray-600">KES {item.unitPrice.toLocaleString()}</td>
                                    <td className="py-2.5 text-right font-black text-black">KES {(item.quantity * item.unitPrice).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-4 pt-3 border-t-2 border-gray-200 flex flex-col items-end space-y-1">
                        <div className="w-48 flex justify-between text-[10px] font-semibold text-gray-600">
                            <span>Subtotal:</span>
                            <span className="font-bold text-black">KES {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="w-48 flex justify-between text-xs font-black pt-2 border-t border-black text-black">
                            <span className="uppercase tracking-wider">Estimated Total:</span>
                            <span className="text-sm font-black text-black">KES {totalDue.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center gap-3">
                    <div className="space-y-1 max-w-[200px]">
                        <p className="text-[8px] font-black uppercase tracking-widest text-black">Quote Terms</p>
                        <p className="text-[8.5px] text-gray-600 font-medium leading-relaxed">{notes}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://nikosoko.app/view/doc/${quoteNumber.replace('#', '')}`} 
                            alt="QR Verification" 
                            className="w-12 h-12 border border-gray-300 rounded-lg p-0.5 bg-white inline-block shadow-xs" 
                        />
                        <p className="text-[7px] text-gray-400 font-mono mt-0.5">Scan Proposal</p>
                    </div>
                </div>
            </div>
            
            {onBack && onShare && (
                <div className="flex gap-2">
                    <button 
                        onClick={onBack} 
                        className="flex-1 bg-white border border-gray-300 text-black font-black py-3 rounded-xl uppercase text-[10px] tracking-widest shadow-xs hover:bg-gray-50"
                    >
                        Edit Inputs
                    </button>
                    <button 
                        onClick={onShare} 
                        className="flex-1 bg-black text-white font-black py-3 rounded-xl shadow-md active:scale-95 transition-all uppercase text-[10px] tracking-widest"
                    >
                        Save & Share &rarr;
                    </button>
                </div>
            )}
        </div>
    )
});

export default QuoteGenerator;
