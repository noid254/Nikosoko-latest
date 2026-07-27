import React, { useState, useRef, useEffect } from 'react';
import * as api from '../services/api';
import type { ServiceProvider } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (data: api.VerifyOtpResponse, phone: string, nickname?: string, fullProfile?: Partial<ServiceProvider>) => void;
  initialMode?: 'nickname' | 'complete_signup';
}

const CTA_OPTIONS: { id: 'call' | 'whatsapp' | 'book' | 'catalogue' | 'menu' | 'save'; label: string; icon: string }[] = [
  { id: 'call', label: 'Call', icon: '📞' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { id: 'book', label: 'Book', icon: '📅' },
  { id: 'catalogue', label: 'Catalogue', icon: '🛍️' },
  { id: 'menu', label: 'Menu', icon: '📋' },
  { id: 'save', label: 'Save Contact', icon: '🔖' },
];

const RATE_TYPE_OPTIONS = [
  { value: 'per hour', label: 'Per Hour (/hr)' },
  { value: 'per day', label: 'Per Day (/day)' },
  { value: 'per task', label: 'Per Task (/task)' },
  { value: 'per week', label: 'Per Week (/wk)' },
  { value: 'per month', label: 'Per Month (/mo)' },
  { value: 'per piece work', label: 'Per Piece Work' },
  { value: 'per km', label: 'Per Km (/km)' },
];

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin, initialMode = 'nickname' }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [nickname, setNickname] = useState('');
  
  // If initialMode is 'complete_signup', user directly wants to complete sign up
  const [step, setStep] = useState<1 | 2 | 3>(initialMode === 'complete_signup' ? 3 : 1);
  const [step3Mode, setStep3Mode] = useState<'nickname' | 'complete'>(
    initialMode === 'complete_signup' ? 'complete' : 'nickname'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tempAuthResponse, setTempAuthResponse] = useState<api.VerifyOtpResponse | null>(null);

  // Complete Profile Form State
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [coverImageUrl, setCoverImageUrl] = useState<string>('https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=800');
  const [fullName, setFullName] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [serviceTitle, setServiceTitle] = useState('');
  const [category, setCategory] = useState('PERSONAL');
  const [accountType, setAccountType] = useState<'individual' | 'organization'>('individual');
  const [location, setLocation] = useState('Nairobi, Kenya');
  const [about, setAbout] = useState('');
  
  // Rate & Availability
  const [hourlyRate, setHourlyRate] = useState<string>('1500');
  const [rateType, setRateType] = useState<ServiceProvider['rateType']>('per hour');
  const [availableHours, setAvailableHours] = useState('Mon - Sat: 8:00 AM - 6:00 PM');

  // CTA buttons selection
  const [selectedCta, setSelectedCta] = useState<('call' | 'whatsapp' | 'book' | 'catalogue' | 'menu' | 'save')[]>([
    'call', 'whatsapp', 'book', 'save'
  ]);

  // Referral Code
  const [referralCode, setReferralCode] = useState('');

  const handleSuperAdminQuickSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.quickSuperAdminLogin();
      if (response.user) {
        onLogin(response, '254723119356', response.user.name, response.user);
      } else {
        onLogin(response, '254723119356', 'Super Admin');
      }
    } catch (err: any) {
      setError(err.message || 'Super Admin sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const input = e.target.value.replace(/\D/g, '');
    if (input.length <= 9) {
      setPhone(input);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const input = e.target.value.replace(/\D/g, '');
    if (input.length <= 4) {
      setOtp(input);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 9) {
      setError("Please enter a valid 9-digit Safaricom/Airtel number.");
      return;
    }
    setIsLoading(true);
    setError('');
    try {
        const fullPhone = `254${phone}`;
        await api.sendOtp(fullPhone);
        setPhoneNum(fullPhone);
        setStep(2);
    } catch (err: any) {
        setError(err.message || "Failed to send verification code.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
        setError("Please enter the 4-digit verification code.");
        return;
    }
    setIsLoading(true);
    setError('');
    try {
        const fullPhone = `254${phone}`;
        const response = await api.verifyOtp(fullPhone, otp);
        
        if (response.user) {
            // Existing registered user -> automatically sign in immediately!
            onLogin(response, fullPhone, response.user.name, response.user);
        } else {
            // Unregistered user -> prompt for Nickname / setup
            setTempAuthResponse(response);
            setPhoneNum(fullPhone);
            setStep(3);
            setStep3Mode('nickname');
        }
    } catch (err: any) {
        setError(err.message || "Login failed.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCoverImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCtaOption = (id: 'call' | 'whatsapp' | 'book' | 'catalogue' | 'menu' | 'save') => {
    if (selectedCta.includes(id)) {
      setSelectedCta(selectedCta.filter(item => item !== id));
    } else {
      setSelectedCta([...selectedCta, id]);
    }
  };

  const handleNicknameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenNickname = nickname.trim() || 'Guest Member';
    const finalPhone = phoneNum || `254${phone}`;
    
    // Create or use temp response
    const mockResponse: api.VerifyOtpResponse = tempAuthResponse || {
      success: true,
      user: null,
      token: `token_${Date.now()}`,
      isSuperAdmin: false
    };

    onLogin(
      mockResponse, 
      finalPhone, 
      chosenNickname, 
      { 
        name: chosenNickname,
        isProfileCompleted: false 
      }
    );
  };

  const handleCompleteProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
        setError("Please enter your full name.");
        return;
    }
    if (!serviceTitle.trim()) {
        setError("Please enter your profession / service title.");
        return;
    }

    const hasReferral = Boolean(referralCode.trim().length > 0);
    const finalPhone = phoneNum.trim() || `254${phone}`;
    const finalAvatar = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName.trim())}&background=random`;

    const mockResponse: api.VerifyOtpResponse = tempAuthResponse || {
      success: true,
      user: null,
      token: `token_${Date.now()}`,
      isSuperAdmin: false
    };

    onLogin(
        mockResponse, 
        finalPhone, 
        fullName.trim(),
        {
            name: fullName.trim(),
            phone: finalPhone,
            service: serviceTitle.trim(),
            avatarUrl: finalAvatar,
            coverImageUrl: coverImageUrl,
            category,
            accountType,
            location: location.trim() || 'Nairobi, Kenya',
            about: about.trim(),
            hourlyRate: parseFloat(hourlyRate) || 0,
            rateType: rateType,
            shopDetails: { operatingHours: availableHours.trim() },
            cta: selectedCta,
            referralCode: referralCode.trim(),
            isVerified: hasReferral,
            isProfileCompleted: true
        }
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 flex justify-center items-center z-50 p-2 sm:p-4 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className={`bg-white rounded-3xl shadow-2xl w-full ${step === 3 && step3Mode === 'complete' ? 'max-w-4xl' : 'max-w-md'} overflow-hidden relative my-auto max-h-[96vh] flex flex-col border border-gray-100 transition-all duration-300`}>
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-navy via-brand-gold to-brand-navy"></div>
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 pt-5 pb-4 flex-shrink-0 border-b border-gray-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            {step === 3 && step3Mode === 'complete' && initialMode !== 'complete_signup' && (
              <button 
                onClick={() => setStep3Mode('nickname')}
                className="p-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full text-xs font-black transition-colors"
                title="Back to Nickname"
              >
                ← Back
              </button>
            )}
            <div>
              <h2 className="text-lg sm:text-xl font-black text-brand-navy tracking-tight uppercase italic flex items-center gap-2">
                <span>{step === 3 && step3Mode === 'complete' ? 'SKILL PROFILE SETUP' : 'NIKOSOKO LOGIN'}</span>
              </h2>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                {step === 1 && 'Step 1 of 2: Enter Mobile Number'}
                {step === 2 && 'Step 2 of 2: Verification Code'}
                {step === 3 && step3Mode === 'nickname' && 'Enter Nickname to Start'}
                {step === 3 && step3Mode === 'complete' && 'Full Skill Profile PDF & Service Listing'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors text-2xl font-bold p-1">&times;</button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mx-6 mt-3 text-center font-bold border border-red-100 flex-shrink-0">
            {error}
          </div>
        )}
        
        <div className="overflow-y-auto flex-1 p-5 sm:p-7 space-y-6">
          {/* STEP 1: Phone Entry */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Super Admin Quick Fill Option */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-yellow-500/10 border border-amber-400/80 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-black text-gray-900 uppercase tracking-tight truncate">
                    <span>👑</span> <span>Super Admin: 0723119356</span>
                  </div>
                  <p className="text-[10px] text-gray-600 font-bold truncate">
                    Safaricom line • OTP verification required
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setPhone('723119356'); setError(''); }}
                  className="bg-black text-amber-400 hover:bg-gray-900 font-black text-[10px] px-3.5 py-2 rounded-xl shadow-sm transition-all active:scale-95 uppercase tracking-wider shrink-0 border border-amber-400 flex items-center gap-1"
                >
                  <span>⚡ Quick Fill</span>
                </button>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="bg-blue-50/70 border border-blue-200/80 p-3.5 rounded-2xl">
                  <p className="text-xs text-blue-900 font-bold flex items-center gap-2">
                    <span>📱</span> Enter your Safaricom or Airtel mobile phone number
                  </p>
                  <p className="text-[11px] text-blue-800/80 mt-1 font-medium">
                    We'll send a 4-digit security code via SMS to verify your account.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Mobile Number</label>
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl focus-within:ring-2 focus-within:ring-brand-navy transition-all overflow-hidden h-14">
                      <span className="px-4 text-gray-600 font-black border-r border-gray-200 text-sm bg-gray-100 h-full flex items-center">+254</span>
                      <input type="tel" value={phone} onChange={handlePhoneChange} required autoFocus placeholder="723 119 356" className="block w-full p-4 bg-transparent focus:outline-none text-gray-900 font-black text-base tracking-wider" />
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-brand-navy text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 disabled:bg-gray-300 transition-all uppercase text-xs tracking-widest hover:bg-black">
                  {isLoading ? 'Sending Code...' : 'Send Verification OTP'}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="text-xs text-gray-500 font-medium">Verification code sent to</p>
                  <p className="font-black text-brand-navy text-xl mt-1 tracking-wider">+254 {phone}</p>
                  <button type="button" onClick={() => { setStep(1); setError(''); }} className="text-xs text-blue-600 font-bold hover:underline mt-1">Change number</button>
              </div>
              <div className="space-y-2">
                <input type="tel" maxLength={4} value={otp} onChange={handleOtpChange} required autoFocus className="block w-full text-center tracking-[0.5em] text-4xl font-black p-5 border-2 border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-brand-gold text-brand-navy" />
                <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest mt-2">Enter 4-digit SMS code</p>
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-brand-navy text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 disabled:bg-gray-300 transition-all uppercase text-xs tracking-widest hover:bg-black">
                  {isLoading ? 'Verifying...' : 'Confirm Verification Code'}
              </button>
            </form>
          )}

          {/* STEP 3: Nickname Entry (IMMEDIATE USE) */}
          {step === 3 && step3Mode === 'nickname' && (
            <form onSubmit={handleNicknameSubmit} className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-navy to-black text-brand-gold rounded-3xl flex items-center justify-center text-2xl font-black mx-auto shadow-lg">
                  N
                </div>
                <h3 className="text-xl font-black text-gray-900 uppercase italic">Welcome to Nikosoko!</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-xs mx-auto">
                  Enter a nickname to start using the app immediately! You can complete your full Skill Profile anytime from the Side Menu.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Your Nickname / Alias *</label>
                <input 
                  type="text" 
                  required
                  autoFocus
                  value={nickname} 
                  onChange={e => setNickname(e.target.value)} 
                  placeholder="e.g. Captain Nemo, Jane, Sparky" 
                  className="block w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-brand-navy text-gray-900 font-black text-base text-center" 
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-brand-navy text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all uppercase text-xs tracking-widest hover:bg-black"
              >
                Start Using Nikosoko →
              </button>

              <div className="pt-2 text-center border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStep3Mode('complete')}
                  className="text-xs text-brand-navy font-black hover:underline inline-flex items-center gap-1 uppercase tracking-wider"
                >
                  <span>📄 Or Complete Full Skill Profile Now</span>
                  <span>→</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Complete Sign Up Full Form Page */}
          {step === 3 && step3Mode === 'complete' && (
            <form onSubmit={handleCompleteProfileSubmit} className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Input Fields (7 cols) */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Full Name & Phone Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Full Name *</label>
                      <input 
                          type="text" 
                          required
                          value={fullName} 
                          onChange={e => setFullName(e.target.value)} 
                          placeholder="e.g. Jane Wanjiku" 
                          className="block w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-navy text-gray-900 font-bold text-xs" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Phone Number *</label>
                      <input 
                          type="tel" 
                          required
                          value={phoneNum} 
                          onChange={e => setPhoneNum(e.target.value)} 
                          placeholder="254700000000" 
                          className="block w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-navy text-gray-900 font-bold text-xs" 
                      />
                    </div>
                  </div>

                  {/* Profession / Service Title */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Profession / Service Title *</label>
                    <input 
                        type="text" 
                        required
                        value={serviceTitle} 
                        onChange={e => setServiceTitle(e.target.value)} 
                        placeholder="e.g. Electrician, Interior Designer, Cafe Resident, Plumber" 
                        className="block w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-navy text-gray-900 font-bold text-xs" 
                    />
                  </div>

                  {/* Category & Account Type */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Category</label>
                      <select 
                          value={category} 
                          onChange={e => setCategory(e.target.value)}
                          className="block w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-navy text-gray-900 font-bold text-xs"
                      >
                          <option value="PERSONAL">PERSONAL</option>
                          <option value="TRADE">TRADE</option>
                          <option value="PROFESSIONAL">PROFESSIONAL</option>
                          <option value="CREATIVE">CREATIVE</option>
                          <option value="HOME">HOME</option>
                          <option value="EVENT">EVENT</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Account Type</label>
                      <select 
                          value={accountType} 
                          onChange={e => setAccountType(e.target.value as any)}
                          className="block w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-navy text-gray-900 font-bold text-xs"
                      >
                          <option value="individual">Individual</option>
                          <option value="organization">Business / Organization</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Location</label>
                    <input 
                        type="text" 
                        value={location} 
                        onChange={e => setLocation(e.target.value)} 
                        placeholder="e.g. Kilimani, Nairobi, Kenya" 
                        className="block w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-navy text-gray-900 font-bold text-xs" 
                    />
                  </div>

                  {/* About Me Section */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">About Me / Bio</label>
                    <textarea 
                        value={about} 
                        onChange={e => setAbout(e.target.value)} 
                        placeholder="Write a brief overview of your skills, background, and services offered..." 
                        rows={3}
                        className="block w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-navy text-gray-900 font-medium text-xs resize-none" 
                    />
                  </div>

                  {/* Rates & Billing Period */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <label className="block text-[10px] font-black text-slate-800 uppercase tracking-widest">
                      💰 Set Rates & Billing Period
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Rate Amount (Ksh)</span>
                        <input 
                            type="number" 
                            value={hourlyRate} 
                            onChange={e => setHourlyRate(e.target.value)} 
                            placeholder="e.g. 1500" 
                            className="block w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-brand-navy" 
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Billing Period</span>
                        <select 
                            value={rateType} 
                            onChange={e => setRateType(e.target.value as any)}
                            className="block w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-navy"
                        >
                            {RATE_TYPE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Input Available Hours / Schedule */}
                  <div className="p-3.5 bg-blue-50/60 border border-blue-200/60 rounded-2xl space-y-2">
                    <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest flex items-center gap-1">
                      <span>🕒</span> Input Available Hours / Schedule
                    </label>
                    <input 
                        type="text" 
                        value={availableHours} 
                        onChange={e => setAvailableHours(e.target.value)} 
                        placeholder="e.g. Mon - Fri: 8:00 AM - 6:00 PM" 
                        className="block w-full p-2.5 bg-white border border-blue-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['24/7 Available', 'Mon - Fri: 8AM - 5PM', 'Mon - Sat: 8AM - 6PM', 'By Appointment'].map(preset => (
                          <button 
                              key={preset}
                              type="button"
                              onClick={() => setAvailableHours(preset)}
                              className="text-[9px] font-bold bg-white text-blue-800 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-100"
                          >
                              + {preset}
                          </button>
                      ))}
                    </div>
                  </div>

                  {/* Choose Action Buttons to List (CTA) */}
                  <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                    <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest">
                      🔘 Choose Action Buttons to Display
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {CTA_OPTIONS.map(opt => {
                          const isSelected = selectedCta.includes(opt.id);
                          return (
                              <button 
                                  type="button" 
                                  key={opt.id}
                                  onClick={() => toggleCtaOption(opt.id)}
                                  className={`p-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                                      isSelected 
                                          ? 'bg-brand-navy text-white border-brand-navy shadow-xs' 
                                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                                  }`}
                              >
                                  <span>{opt.icon}</span>
                                  <span>{opt.label}</span>
                                  {isSelected && <span className="text-[10px]">✓</span>}
                              </button>
                          );
                      })}
                    </div>
                  </div>

                  {/* Referral Code Field */}
                  <div className="bg-emerald-50/80 border border-emerald-200/80 p-3.5 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-black text-emerald-900 uppercase tracking-widest flex items-center gap-1">
                          <span>⚡</span> Referral Code
                      </label>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          referralCode.trim() ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                          {referralCode.trim() ? '✓ Instant Verified Active' : 'Optional'}
                      </span>
                    </div>
                    <input 
                        type="text" 
                        value={referralCode} 
                        onChange={e => setReferralCode(e.target.value)} 
                        placeholder="Enter referral code for instant verified badge" 
                        className="block w-full p-2.5 bg-white border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 font-black text-xs uppercase tracking-wider" 
                    />
                  </div>
                </div>

                {/* Right Column: Skill Profile PDF Card Preview (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="sticky top-0 bg-slate-900 text-white p-4 rounded-3xl shadow-xl space-y-3 border border-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold italic">
                        📄 Live Skill Profile PDF Card
                      </span>
                      <span className="text-[9px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-gray-300">
                        Preview
                      </span>
                    </div>

                    {/* Card Container */}
                    <div className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl relative">
                      {/* Cover photo */}
                      <div className="h-28 bg-gray-200 relative group overflow-hidden">
                        <img 
                          src={coverImageUrl} 
                          alt="Cover" 
                          className="w-full h-full object-cover"
                        />
                        <button 
                          type="button" 
                          onClick={() => coverInputRef.current?.click()}
                          className="absolute inset-0 bg-black/40 text-white text-xs font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity"
                        >
                          <span>📷</span> Change Cover
                        </button>
                        <input type="file" ref={coverInputRef} onChange={handleCoverFileSelect} accept="image/*" className="hidden" />
                      </div>

                      {/* Profile Avatar & Header info */}
                      <div className="px-4 pb-4 pt-0 relative -mt-10">
                        <div className="flex items-end justify-between">
                          <div className="relative">
                            <div className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-gray-100 overflow-hidden">
                              <img 
                                src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=random`} 
                                alt="Avatar" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button 
                              type="button" 
                              onClick={() => avatarInputRef.current?.click()}
                              className="absolute bottom-0 right-0 bg-brand-navy text-white text-[10px] p-1.5 rounded-full shadow border border-white hover:bg-black"
                            >
                              📷
                            </button>
                            <input type="file" ref={avatarInputRef} onChange={handleAvatarFileSelect} accept="image/*" className="hidden" />
                          </div>

                          <div className="text-right">
                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full italic ${
                              referralCode.trim() ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {referralCode.trim() ? '✓ Instant Verified' : 'Standard'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <h3 className="text-base font-black text-gray-900 leading-tight">
                            {fullName || 'Your Full Name'}
                          </h3>
                          <p className="text-xs font-bold text-brand-navy mt-0.5">
                            {serviceTitle || 'Your Service Title'}
                          </p>
                          <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                            📍 {location}
                          </p>
                        </div>

                        {about && (
                          <p className="text-[11px] text-gray-600 font-medium mt-2 line-clamp-2 bg-gray-50 p-2 rounded-lg italic border border-gray-100">
                            "{about}"
                          </p>
                        )}

                        {/* Rate Tag */}
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                          <span className="font-bold text-gray-400 uppercase text-[10px]">Service Rate</span>
                          <span className="font-black text-brand-navy text-sm">
                            Ksh {hourlyRate || '0'} <span className="text-[10px] font-semibold text-gray-500">/ {rateType}</span>
                          </span>
                        </div>

                        {/* Operating Hours */}
                        <div className="mt-2 text-[10px] font-bold text-blue-900 bg-blue-50 p-2 rounded-lg flex items-center justify-between">
                          <span>🕒 Hours:</span>
                          <span>{availableHours}</span>
                        </div>

                        {/* Selected Action Buttons */}
                        <div className="mt-3 pt-2 border-t border-gray-100 space-y-1">
                          <span className="text-[9px] font-black text-gray-400 uppercase">Profile Action Buttons:</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedCta.map(ctaId => {
                              const option = CTA_OPTIONS.find(o => o.id === ctaId);
                              return (
                                <span key={ctaId} className="text-[10px] bg-brand-navy text-white px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                                  <span>{option?.icon}</span>
                                  <span>{option?.label}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-brand-gold text-black font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all uppercase text-xs tracking-widest hover:bg-yellow-400 mt-2"
                    >
                      Complete Sign Up & Launch Profile
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
