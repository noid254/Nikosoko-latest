
import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { BusinessAssets, Document } from '../types';

interface InvoiceGeneratorProps {
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
  unit?: string;
}

const formInputClass = "mt-1 w-full p-2.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-xs font-bold text-black outline-none transition-all duration-150 placeholder-gray-400 focus:bg-white focus:border-black focus:ring-4 focus:ring-black/10 focus:shadow-md focus:scale-[1.005]";
const labelClass = "block text-[9px] font-black text-black uppercase tracking-widest mb-0.5";

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ assets, onSave, onBack, onComplete }) => {
  // Check if Brand Kit exists to skip straight to customer details (Step 2)
  const hasBrandKit = Boolean(
    assets?.name || 
    (typeof window !== 'undefined' && localStorage.getItem('nikosoko_business_assets'))
  );

  const [step, setStep] = useState(hasBrandKit ? 2 : 1);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // STEP 1: BRAND KIT & ISSUER PROFILE
  const [fromName, setFromName] = useState(assets.name || 'Blackwood Design');
  const [tagline, setTagline] = useState(assets.tagline || 'Your Tagline Here');
  const [issuerEmail, setIssuerEmail] = useState(assets.email || 'blackwooddesign@mail.com');
  const [issuerPhone, setIssuerPhone] = useState(assets.phone || '(555) 123-4567');
  const [issuerAddress, setIssuerAddress] = useState(assets.address || 'Main Street Anytown\nUnited States of America');
  const [paymentDetails, setPaymentDetails] = useState('Account BA 1982-1856\n1234 Main Street United States');

  // STEP 2: CUSTOMER & DOCUMENT REF
  const [toName, setToName] = useState('Seraphina Blue');
  const [toPhone, setToPhone] = useState('(555) 123-4567-9876');
  const [toEmail, setToEmail] = useState('Seraphinablue@mail.com');
  const [toDetails, setToDetails] = useState('');
  
  const [invoiceNumber, setInvoiceNumber] = useState('#89874632');
  const [accountNumber, setAccountNumber] = useState('123-456-789');
  const [currency, setCurrency] = useState('$');
  
  const [date, setDate] = useState('2025-08-05');
  const [dueDate, setDueDate] = useState('2025-08-25');

  // STEP 3: SCOPE & PRICING & TERMS
  const [terms, setTerms] = useState('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua quis nostrud.');

  const [lineItems, setLineItems] = useState<LineItem[]>([
      { id: 1, description: 'Logo Design', quantity: 35, unitPrice: 10, unit: 'Hour' },
      { id: 2, description: 'Visual Identity Design', quantity: 30, unitPrice: 10, unit: 'Hour' },
      { id: 3, description: 'Brochure Design', quantity: 20, unitPrice: 10, unit: 'Hour' },
      { id: 4, description: 'Social Media Design', quantity: 20, unitPrice: 10, unit: 'Hour' },
      { id: 5, description: 'Merchandise Design', quantity: 15, unitPrice: 10, unit: 'Hour' },
  ]);
  
  const [discountRate, setDiscountRate] = useState(0);
  const [taxRate, setTaxRate] = useState(10);
  
  const invoicePreviewRef = useRef<HTMLDivElement>(null);

  const { subtotal, discountAmount, taxAmount, totalDue } = useMemo(() => {
    const subtotal = lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const discountAmount = subtotal * (discountRate / 100);
    const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
    const totalDue = subtotal - discountAmount + taxAmount;
    return { subtotal, discountAmount, taxAmount, totalDue };
  }, [lineItems, discountRate, taxRate]);
  
  useEffect(() => {
    if (assets.name) setFromName(assets.name);
    if (assets.tagline) setTagline(assets.tagline);
    if (assets.email) setIssuerEmail(assets.email);
    if (assets.phone) setIssuerPhone(assets.phone);
    if (assets.address) setIssuerAddress(assets.address);
  }, [assets]);

  const saveBrandKitLocally = () => {
    try {
        const bk = { name: fromName, tagline, email: issuerEmail, phone: issuerPhone, address: issuerAddress, paymentDetails };
        localStorage.setItem('nikosoko_business_assets', JSON.stringify(bk));
    } catch (e) {
        console.error('Failed to save brand kit:', e);
    }
  };

  const handleSaveAndShare = async () => {
      saveBrandKitLocally();
      onSave({
        type: 'Invoice',
        number: invoiceNumber,
        issuerName: fromName,
        clientName: toName,
        recipientContact: `${toPhone ? toPhone : ''}${toPhone && toEmail ? ' • ' : ''}${toEmail ? toEmail : ''}`,
        date: new Date(date).toISOString(),
        dueDate: new Date(dueDate).toISOString(),
        amount: totalDue,
        currency,
        paymentStatus: 'Pending',
        items: lineItems.map(i => ({ description: i.description, quantity: i.quantity, price: i.unitPrice })),
        terms,
        paymentInstructions: paymentDetails,
        discountRate,
        taxRate
      });
      setIsShareModalOpen(true);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-gray-50/60 min-h-screen font-sans pb-20 border-x border-gray-200/80 no-print">
       <div className="p-3.5 bg-black text-white sticky top-0 z-20 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <button onClick={step === 1 ? onBack : () => setStep(step - 1)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="text-center">
                <h2 className="font-black text-xs uppercase tracking-wider italic text-white">TAX INVOICE GENERATOR</h2>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                  Step {step} of 4: {step === 1 ? 'Brand Kit' : step === 2 ? 'Client Details' : step === 3 ? 'Items & Rates' : 'A4 Preview'}
                </p>
            </div>
            <div className="w-8"></div>
          </div>
          <div className="flex gap-1.5 px-2">
             {[1, 2, 3, 4].map(s => <div key={s} className={`h-1 flex-1 rounded-full transition-all ${step >= s ? 'bg-white' : 'bg-white/20'}`}></div>)}
          </div>
      </div>
      
       <div className="p-3.5 sm:p-5">
        {step === 1 && (
            <BrandKitStep 
                fromName={fromName} setFromName={setFromName}
                tagline={tagline} setTagline={setTagline}
                issuerEmail={issuerEmail} setIssuerEmail={setIssuerEmail}
                issuerPhone={issuerPhone} setIssuerPhone={setIssuerPhone}
                issuerAddress={issuerAddress} setIssuerAddress={setIssuerAddress}
                paymentDetails={paymentDetails} setPaymentDetails={setPaymentDetails}
                onNext={() => {
                    saveBrandKitLocally();
                    setStep(2);
                }}
            />
        )}
        {step === 2 && (
            <AddressStep 
                fromName={fromName}
                toName={toName} setToName={setToName} 
                toPhone={toPhone} setToPhone={setToPhone}
                toEmail={toEmail} setToEmail={setToEmail}
                toDetails={toDetails} setToDetails={setToDetails}
                invoiceNumber={invoiceNumber} setInvoiceNumber={setInvoiceNumber}
                accountNumber={accountNumber} setAccountNumber={setAccountNumber}
                currency={currency} setCurrency={setCurrency}
                date={date} setDate={setDate} dueDate={dueDate} setDueDate={setDueDate}
                onEditBrandKit={() => setStep(1)}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
            />
        )}
        {step === 3 && (
            <ItemsStep
                lineItems={lineItems} setLineItems={setLineItems}
                discountRate={discountRate} setDiscountRate={setDiscountRate}
                taxRate={taxRate} setTaxRate={setTaxRate}
                currency={currency}
                paymentDetails={paymentDetails} setPaymentDetails={setPaymentDetails}
                terms={terms} setTerms={setTerms}
                onBack={() => setStep(2)}
                onNext={() => setStep(4)}
            />
        )}
        {step === 4 && (
            <InvoicePreview
                ref={invoicePreviewRef}
                assets={{ ...assets, email: issuerEmail, phone: issuerPhone, address: issuerAddress, tagline }}
                fromName={fromName}
                toName={toName} toPhone={toPhone} toEmail={toEmail} toDetails={toDetails}
                invoiceNumber={invoiceNumber} accountNumber={accountNumber} currency={currency}
                date={date} dueDate={dueDate}
                lineItems={lineItems} 
                subtotal={subtotal} discountRate={discountRate} discountAmount={discountAmount} taxRate={taxRate} taxAmount={taxAmount} totalDue={totalDue}
                terms={terms} paymentDetails={paymentDetails}
                onBack={() => setStep(3)}
                onDownloadPDF={handleDownloadPDF}
                onShare={handleSaveAndShare}
            />
        )}
       </div>
       {isShareModalOpen && <ShareModal type="invoice" number={invoiceNumber} fromName={fromName} onDone={onComplete || onBack} />}
    </div>
  );
};

const BrandKitStep: React.FC<any> = ({
    fromName, setFromName, tagline, setTagline, issuerEmail, setIssuerEmail, 
    issuerPhone, setIssuerPhone, issuerAddress, setIssuerAddress, paymentDetails, setPaymentDetails, onNext
}) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4 animate-fade-in">
        <div className="border-b pb-3 flex items-center justify-between">
            <div>
                <h2 className="text-xs font-black text-black uppercase tracking-wider">Step 1: Brand Kit & Issuer Setup</h2>
                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Define your business identity & billing profile</p>
            </div>
            <div className="w-7 h-7 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center">1</div>
        </div>

        <div className="space-y-3.5">
             <div>
                <label className={labelClass}>Business / Brand Name *</label>
                <input value={fromName} onChange={e => setFromName(e.target.value)} type="text" className={formInputClass} placeholder="e.g. Blackwood Design" required/>
            </div>

            <div>
                <label className={labelClass}>Tagline / Subtitle</label>
                <input value={tagline} onChange={e => setTagline(e.target.value)} type="text" className={formInputClass} placeholder="e.g. Your Tagline Here"/>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
                <div>
                    <label className={labelClass}>Business Email</label>
                    <input value={issuerEmail} onChange={e => setIssuerEmail(e.target.value)} type="email" className={formInputClass} placeholder="blackwooddesign@mail.com"/>
                </div>
                <div>
                    <label className={labelClass}>Business Phone</label>
                    <input value={issuerPhone} onChange={e => setIssuerPhone(e.target.value)} type="text" className={formInputClass} placeholder="(555) 123-4567"/>
                </div>
            </div>

            <div>
                <label className={labelClass}>Official Business Address / Location</label>
                <textarea value={issuerAddress} onChange={e => setIssuerAddress(e.target.value)} rows={2} className={`${formInputClass} h-14`} placeholder="e.g. Main Street Anytown, United States of America" />
            </div>

            <div>
                <label className={labelClass}>Default Payment Account Details</label>
                <textarea value={paymentDetails} onChange={e => setPaymentDetails(e.target.value)} rows={2} className={`${formInputClass} h-14`} placeholder="Account BA 1982-1856&#10;1234 Main Street United States" />
            </div>

            <button onClick={onNext} className="w-full bg-black text-white font-black py-3.5 rounded-xl shadow-md mt-2 active:scale-95 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                Save Brand Kit & Continue &rarr;
            </button>
        </div>
    </div>
);

const AddressStep: React.FC<any> = ({ 
    fromName, toName, setToName, toPhone, setToPhone, toEmail, setToEmail, toDetails, setToDetails,
    invoiceNumber, setInvoiceNumber, accountNumber, setAccountNumber, currency, setCurrency,
    date, setDate, dueDate, setDueDate, onEditBrandKit, onBack, onNext
}) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4 animate-fade-in">
        
        {/* BRAND KIT CONTEXT BANNER */}
        <div className="bg-gray-100 border border-gray-200 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-black text-xs">
                    ✓
                </div>
                <div>
                    <span className="text-[8px] font-black uppercase text-gray-500 tracking-wider block">Active Issuer Brand Kit</span>
                    <span className="font-black text-black text-xs">{fromName || 'Blackwood Design'}</span>
                </div>
            </div>
            <button onClick={onEditBrandKit} className="text-[9px] font-black uppercase tracking-widest text-black underline hover:text-gray-700 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 shadow-2xs">
                Edit Brand Kit
            </button>
        </div>

        <div className="border-b pb-2 flex items-center justify-between">
            <div>
                <h2 className="text-xs font-black text-black uppercase tracking-wider">Step 2: Customer & Document Ref</h2>
                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Specify recipient details (Contact info skippable)</p>
            </div>
            <div className="w-7 h-7 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center">2</div>
        </div>

        <div className="space-y-3.5">
             <div>
                <label className={labelClass}>Customer / Client Name *</label>
                <input value={toName} onChange={e => setToName(e.target.value)} type="text" className={formInputClass} placeholder="e.g. Seraphina Blue" required autoFocus/>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
                <div>
                    <div className="flex justify-between items-center">
                        <label className={labelClass}>Client Phone</label>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">*Skippable</span>
                    </div>
                    <input value={toPhone} onChange={e => setToPhone(e.target.value)} type="text" className={formInputClass} placeholder="(555) 123-4567-9876"/>
                </div>
                <div>
                    <div className="flex justify-between items-center">
                        <label className={labelClass}>Client Email</label>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">*Skippable</span>
                    </div>
                    <input value={toEmail} onChange={e => setToEmail(e.target.value)} type="email" className={formInputClass} placeholder="Seraphinablue@mail.com"/>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <div>
                    <label className={labelClass}>Invoice No. *</label>
                    <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} type="text" className={formInputClass} required/>
                </div>
                <div>
                    <label className={labelClass}>Account No. *</label>
                    <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} type="text" className={formInputClass} required/>
                </div>
                <div>
                    <label className={labelClass}>Currency</label>
                    <select value={currency} onChange={e => setCurrency(e.target.value)} className={formInputClass}>
                        <option value="$">$ (USD)</option>
                        <option value="KES ">KES</option>
                        <option value="€">€ (EUR)</option>
                        <option value="£">£ (GBP)</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
                <div>
                    <label className={labelClass}>Issue Date</label>
                    <input value={date} onChange={e => setDate(e.target.value)} type="date" className={formInputClass} required/>
                </div>
                <div>
                    <label className={labelClass}>Payment Due Date</label>
                    <input value={dueDate} onChange={e => setDueDate(e.target.value)} type="date" className={formInputClass} required/>
                </div>
            </div>

            <div className="flex gap-2 pt-2">
                <button onClick={onBack} className="w-1/3 bg-gray-100 text-black font-black py-3.5 rounded-xl uppercase text-[10px] tracking-widest border border-gray-200">
                    &larr; Brand Kit
                </button>
                <button onClick={onNext} className="w-2/3 bg-black text-white font-black py-3.5 rounded-xl shadow-md active:scale-95 transition-all uppercase text-[10px] tracking-widest">
                    Proceed to Items & Rates &rarr;
                </button>
            </div>
        </div>
    </div>
);

const ItemsStep: React.FC<any> = ({ lineItems, setLineItems, discountRate, setDiscountRate, taxRate, setTaxRate, currency, paymentDetails, setPaymentDetails, terms, setTerms, onBack, onNext }) => {
    const [desc, setDesc] = useState('');
    const [qty, setQty] = useState('10');
    const [unitPrice, setUnitPrice] = useState('10');
    const [unit, setUnit] = useState('Hour');

    const addItem = () => {
        const qtyNum = parseFloat(qty);
        const priceNum = parseFloat(unitPrice);
        if (!desc || isNaN(qtyNum) || isNaN(priceNum)) return;
        setLineItems((prev: any) => [...prev, { id: Date.now(), description: desc, quantity: qtyNum, unitPrice: priceNum, unit: unit || 'Hour' }]);
        setDesc(''); setQty('10'); setUnitPrice('10');
    };
    
    return (
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-200 space-y-4 animate-fade-in">
            <div className="border-b pb-2 flex items-center justify-between">
                <div>
                    <h2 className="text-xs font-black text-black uppercase tracking-wider">Step 3: Items, Rates & Terms</h2>
                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Itemize scope, units, rate and conditions</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center">3</div>
            </div>

            <div className="space-y-3">
                {/* Add Item Form */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                     <label className="text-[9px] font-black uppercase text-black">New Item Description</label>
                     <input value={desc} onChange={e => setDesc(e.target.value)} type="text" placeholder="e.g. Logo Design" className={formInputClass}/>
                     <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="text-[8px] font-bold uppercase text-gray-500">Rate ({currency})</label>
                            <input value={unitPrice} onChange={e => setUnitPrice(e.target.value)} type="number" placeholder="10" className={formInputClass}/>
                        </div>
                        <div>
                            <label className="text-[8px] font-bold uppercase text-gray-500">Unit Type</label>
                            <input value={unit} onChange={e => setUnit(e.target.value)} type="text" placeholder="Hour" className={formInputClass}/>
                        </div>
                        <div>
                            <label className="text-[8px] font-bold uppercase text-gray-500">Subtotal Units</label>
                            <input value={qty} onChange={e => setQty(e.target.value)} type="number" placeholder="35" className={formInputClass}/>
                        </div>
                     </div>
                     <button onClick={addItem} className="w-full bg-black text-white font-black py-2 rounded-lg text-[9px] uppercase tracking-widest hover:bg-gray-800">
                        + Add Item to Invoice
                     </button>
                </div>

                {/* Line Items List */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {lineItems.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                            <div className="min-w-0 pr-2">
                                <p className="font-bold text-black truncate">{item.description}</p>
                                <p className="text-[9px] text-gray-500">{currency}{item.unitPrice} / {item.unit || 'Hour'} ({item.quantity} units)</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="font-black text-black text-xs">{currency}{(item.quantity * item.unitPrice).toLocaleString()}</span>
                                <button onClick={() => setLineItems(lineItems.filter((i: any) => i.id !== item.id))} className="text-red-600 font-bold px-1.5 py-0.5 rounded hover:bg-red-50">
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tax & Discount */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                        <label className={labelClass}>Discount (%)</label>
                        <input value={discountRate} onChange={e => setDiscountRate(parseFloat(e.target.value) || 0)} type="number" className={formInputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>VAT / Tax (%)</label>
                        <input value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)} type="number" className={formInputClass} />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Terms & Conditions</label>
                    <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={2} className={`${formInputClass} h-14`} />
                </div>

                <div className="flex gap-2 pt-2">
                    <button onClick={onBack} className="w-1/3 bg-gray-100 text-black font-black py-3 rounded-xl uppercase text-[10px] tracking-widest border border-gray-200">
                        &larr; Back
                    </button>
                    <button onClick={onNext} className="w-2/3 bg-black text-white font-black py-3 rounded-xl shadow-md uppercase text-[10px] tracking-widest">
                        Generate A4 Preview &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
};

export const InvoicePreview = React.forwardRef<HTMLDivElement, any>(({ 
    assets, fromName, toName, toPhone, toEmail, toDetails, invoiceNumber, accountNumber, currency = '$',
    date, dueDate, lineItems, subtotal, discountRate, discountAmount, taxRate, taxAmount, totalDue, 
    terms, paymentDetails, onBack, onDownloadPDF, onShare
}, ref) => {
    // Date formatting helper
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    const formattedDate = formatDate(date);
    const formattedDueDate = formatDate(dueDate);

    // Format currency helper
    const formatAmount = (val: number) => {
        const formattedNum = val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        return `${currency}${formattedNum}`;
    };

    return (
        <div className="space-y-4">
            {/* PAPER SHEET CANVAS - STANDARD A4 PORTRAIT FORMAT ARCHITECTURE */}
            <div 
                ref={ref} 
                className="bg-[#F4F4F4] p-3 sm:p-6 font-sans text-xs text-gray-900 overflow-hidden rounded-2xl border border-gray-300 shadow-2xl print-area-a4 w-full max-w-[210mm] mx-auto min-h-[297mm]"
            >
                <div className="bg-white p-6 sm:p-10 rounded-none border border-gray-200 shadow-2xs relative space-y-6 sm:space-y-8 flex flex-col justify-between min-h-[280mm]">
                    
                    <div>
                        {/* TOP HEADER: BRANDING (TOP RIGHT) & QR CODE (TOP LEFT) */}
                        <div className="flex justify-between items-start relative z-10 mb-2">
                            {/* TOP LEFT: SQUARE QR CODE CARD OVERLAPPING SIDEBAR */}
                            <div className="w-20 h-20 bg-white border border-gray-200 shadow-md p-1 rounded-xs flex items-center justify-center relative z-20">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://nikosoko.app/view/doc/${(invoiceNumber || '').replace('#', '')}`}
                                    alt="Document QR"
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            {/* TOP RIGHT: COMPANY BRANDING */}
                            <div className="text-right flex items-center justify-end gap-2.5">
                                <div className="w-7 h-7 rounded-full border-2 border-black flex items-center justify-center p-0.5 flex-shrink-0">
                                    <div className="w-3 h-3 rounded-full border border-black bg-black"></div>
                                </div>
                                <div className="text-left">
                                    <h2 className="text-sm sm:text-base font-black text-black tracking-tight leading-none uppercase">
                                        {fromName || assets?.name || 'Blackwood Design'}
                                    </h2>
                                    <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium tracking-wide mt-1">
                                        {assets?.tagline || 'Your Tagline Here'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* MAIN TITLE: INVOICE */}
                        <div className="text-center py-2">
                            <h1 className="text-3xl sm:text-4xl font-black text-[#1e1e1e] tracking-tight uppercase leading-none">
                                INVOICE
                            </h1>
                            <p className="text-[10px] sm:text-[11px] text-gray-400 font-semibold tracking-wider mt-1.5 uppercase">
                                Document Payment Information
                            </p>
                        </div>

                        {/* TWO-COLUMN MIDSECTION: DARK CHARCOAL SIDEBAR (LEFT) + CARDS & PAYMENT (RIGHT) */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start mt-4">
                            
                            {/* LEFT CHARCOAL SIDEBAR BLOCK (col-span-5) */}
                            <div className="sm:col-span-5 bg-[#222222] text-white p-5 rounded-none shadow-xs space-y-4 font-sans text-xs">
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider">Date :</p>
                                        <p className="font-bold text-white text-xs mt-0.5">{formattedDate || '05 August 2025'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider">Due Date :</p>
                                        <p className="font-bold text-white text-xs mt-0.5">{formattedDueDate || '25 August 2025'}</p>
                                    </div>
                                </div>

                                <div className="w-8 border-t border-gray-600 my-2"></div>

                                <div className="space-y-1">
                                    <p className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider mb-1">To</p>
                                    <p className="font-black text-white text-sm">{toName || 'Seraphina Blue'}</p>
                                    {toPhone && <p className="text-xs text-gray-300 font-medium leading-normal">{toPhone}</p>}
                                    {toEmail && <p className="text-xs text-gray-300 font-medium leading-normal">{toEmail}</p>}
                                    {!toPhone && !toEmail && toDetails && (
                                        <p className="text-xs text-gray-300 font-medium whitespace-pre-line leading-relaxed">{toDetails}</p>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT SECTION: REFERENCE CARDS & PAYMENT METHOD (col-span-7) */}
                            <div className="sm:col-span-7 space-y-4 pt-1">
                                
                                {/* DOCUMENT CARDS CONTAINER */}
                                <div className="bg-white border border-gray-200 p-3.5 rounded-none flex justify-around items-center text-center shadow-2xs">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Account No:</p>
                                        <p className="font-black text-black text-xs sm:text-sm">{accountNumber || '123-456-789'}</p>
                                    </div>
                                    <div className="h-8 w-[1px] bg-gray-200"></div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Invoice No:</p>
                                        <p className="font-black text-black text-xs sm:text-sm">{invoiceNumber || '#89874632'}</p>
                                    </div>
                                </div>

                                {/* PAYMENT METHOD SECTION */}
                                <div className="space-y-1.5 pt-1 px-1">
                                    <h3 className="text-xs font-black uppercase text-black tracking-wider">Payment Method</h3>
                                    <div className="w-6 h-[2.5px] bg-black my-1"></div>
                                    <div className="text-xs text-gray-600 font-medium leading-relaxed space-y-1">
                                        <p className="font-bold text-gray-900">{fromName || 'Account Name'}</p>
                                        <p className="text-gray-600 whitespace-pre-line leading-normal">{paymentDetails || 'Account BA 1982-1856\n1234 Main Street United States'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ITEMIZED TABLE */}
                        <div className="pt-4">
                            <div className="bg-[#222222] text-white px-4 py-2.5 font-bold text-[10px] uppercase tracking-wider grid grid-cols-12 gap-2 rounded-t-none">
                                <div className="col-span-6 text-left">Item Description</div>
                                <div className="col-span-2 text-right">Rate</div>
                                <div className="col-span-2 text-center">Unit</div>
                                <div className="col-span-2 text-right">Subtotal</div>
                            </div>

                            <div className="divide-y divide-gray-100 border-x border-b border-gray-200 bg-white text-xs">
                                {lineItems.map((item: any, idx: number) => {
                                    const itemSub = item.quantity * item.unitPrice;
                                    return (
                                        <div key={item.id || idx} className="px-4 py-3 grid grid-cols-12 gap-2 items-center text-gray-800">
                                            <div className="col-span-6 font-bold text-black text-xs">{item.description}</div>
                                            <div className="col-span-2 text-right font-medium text-gray-700">{formatAmount(item.unitPrice)}</div>
                                            <div className="col-span-2 text-center font-medium text-gray-500 text-[10px]">{item.unit || 'Hour'}</div>
                                            <div className="col-span-2 text-right font-black text-black">{formatAmount(itemSub)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* FINANCIAL TOTALS BREAKDOWN */}
                        <div className="flex justify-end pt-3">
                            <div className="w-60 space-y-1.5 text-xs font-bold text-gray-800">
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Subtotal</span>
                                    <span>:</span>
                                    <span className="font-black text-black text-right w-24">{formatAmount(subtotal)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between items-center text-red-600">
                                        <span>Discount ({discountRate}%)</span>
                                        <span>:</span>
                                        <span className="font-black text-right w-24">- {formatAmount(discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Tax Vat ({taxRate}%)</span>
                                    <span>:</span>
                                    <span className="font-black text-black text-right w-24">{formatAmount(taxAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center text-black font-black pt-2 border-t border-gray-300">
                                    <span className="uppercase tracking-wider">Total</span>
                                    <span>:</span>
                                    <span className="text-base font-black text-black text-right w-24">{formatAmount(totalDue)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER SECTION: TERMS (BOTTOM LEFT) & CONTACT DETAILS WITH ICONS (BOTTOM RIGHT) */}
                    <div className="pt-6 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end text-xs">
                        {/* BOTTOM LEFT: TERMS & CONDITIONS */}
                        <div className="sm:col-span-7 space-y-1">
                            <p className="text-[9px] text-gray-500 leading-relaxed font-medium">
                                {terms || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua quis nostrud.'}
                            </p>
                        </div>

                        {/* BOTTOM RIGHT: CONTACT INFO WITH MINIMALIST BLACK ICONS */}
                        <div className="sm:col-span-5 flex flex-col items-start sm:items-end space-y-2 text-xs text-gray-700 font-medium">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-[#222222] text-white flex items-center justify-center rounded-xs flex-shrink-0">
                                    <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                                </div>
                                <div className="text-left sm:text-right">
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">E-mail</p>
                                    <p className="font-bold text-black text-[10px]">{assets?.email || 'blackwooddesign@mail.com'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-[#222222] text-white flex items-center justify-center rounded-xs flex-shrink-0">
                                    <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                                </div>
                                <div className="text-left sm:text-right">
                                    <p className="font-bold text-black text-[10px]">{assets?.address || 'Main Street Anytown\nUnited States of America'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-2 no-print">
                <button 
                    onClick={onDownloadPDF || (() => window.print())}
                    className="w-full bg-[#222222] text-white font-black py-3.5 rounded-xl uppercase text-[10px] tracking-widest shadow-md hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                    Download A4 PDF / Print Invoice
                </button>

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
        </div>
    );
});

export const ShareModal: React.FC<any> = ({ type, number, fromName, onDone }) => {
    const [contact, setContact] = useState('');
    const [nickname, setNickname] = useState('');

    const handleShare = (method: 'whatsapp' | 'system') => {
        const link = `https://nikosoko.app/view/${type}/${number.replace('#', '')}`;
        const message = `Hello ${nickname || 'Valued Client'}, here is your digital ${type} ${number} from ${fromName}. View here: ${link}`;
        
        if (method === 'whatsapp') {
            const cleanPhone = contact.replace(/\D/g, '');
            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
        } else if (navigator.share) {
            navigator.share({ title: `${type} from ${fromName}`, text: message, url: link });
        }
        onDone();
    };

    return (
        <div className="fixed inset-0 bg-black/85 flex justify-center items-center z-[120] p-4 backdrop-blur-sm animate-fade-in font-sans no-print">
            <div className="bg-white p-5 rounded-3xl shadow-2xl w-full max-w-sm border border-black space-y-4">
                <div className="text-center border-b pb-3">
                    <h2 className="text-sm font-black text-black uppercase tracking-tight">Share {type}</h2>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Direct client delivery</p>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className={labelClass}>Client Phone or Email</label>
                        <input value={contact} onChange={e => setContact(e.target.value)} className={formInputClass} placeholder="e.g. +254 712 345 678" autoFocus />
                    </div>
                    <div>
                        <label className={labelClass}>Recipient Name (Optional)</label>
                        <input value={nickname} onChange={e => setNickname(e.target.value)} className={formInputClass} placeholder="e.g. Mr. Omondi" />
                    </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                    <button 
                        onClick={() => handleShare('whatsapp')} 
                        className="w-full bg-[#25D366] text-white font-black py-3 rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all text-[10px] tracking-widest uppercase"
                    >
                        💬 Share via WhatsApp
                    </button>
                    <button 
                        onClick={() => handleShare('system')} 
                        className="w-full bg-black text-white font-black py-3 rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all text-[10px] tracking-widest uppercase"
                    >
                        📲 Native Share
                    </button>
                    <button onClick={onDone} className="w-full text-gray-400 font-black py-2 uppercase text-[9px] tracking-widest">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceGenerator;

