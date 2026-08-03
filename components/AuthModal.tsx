import React, { useState, useRef } from 'react';
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
  { id: 'save', label: 'Save', icon: '🔖' },
];

const RATE_TYPE_OPTIONS = [
  { value: 'per hour', label: 'Per Hour (/hr)' },
  { value: 'per day', label: 'Per Day (/day)' },
  { value: 'per task', label: 'Per Task (/task)' },
  { value: 'per piece work', label: 'Piece Work' },
];

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin, initialMode = 'nickname' }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [nickname, setNickname] = useState('');
  
  // Steps: 1 = Phone, 2 = OTP, 3 = Floating Prompt / Choice Form
  const [step, setStep] = useState<1 | 2 | 3>(initialMode === 'complete_signup' ? 3 : 1);
  const [step3Mode, setStep3Mode] = useState<'choice' | 'nickname' | 'complete'>(
    initialMode === 'complete_signup' ? 'complete' : 'choice'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tempAuthResponse, setTempAuthResponse] = useState<api.VerifyOtpResponse | null>(null);

  // Complete Profile Form State
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [fullName, setFullName] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [serviceTitle, setServiceTitle] = useState('');
  const [category, setCategory] = useState('PERSONAL');
  const [accountType, setAccountType] = useState<'individual' | 'organization'>('individual');
  const [saccoRegNo, setSaccoRegNo] = useState('');
  const [location, setLocation] = useState('Nairobi, Kenya');
  const [about, setAbout] = useState('');
  const [hourlyRate, setHourlyRate] = useState<string>('1500');
  const [rateType, setRateType] = useState<ServiceProvider['rateType']>('per hour');
  const [selectedCta, setSelectedCta] = useState<('call' | 'whatsapp' | 'book' | 'catalogue' | 'menu' | 'save')[]>([
    'call', 'whatsapp', 'book', 'save'
  ]);
  const [referralCode, setReferralCode] = useState('');

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
      setError("Please enter a valid 9-digit mobile number.");
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
        setError("Enter 4-digit code.");
        return;
    }
    setIsLoading(true);
    setError('');
    try {
        const fullPhone = `254${phone}`;
        const response = await api.verifyOtp(fullPhone, otp);
        
        if (response.user) {
            onLogin(response, fullPhone, response.user.name, response.user);
        } else {
            setTempAuthResponse(response);
            setPhoneNum(fullPhone);
            setStep(3);
            setStep3Mode('choice');
        }
    } catch (err: any) {
        setError(err.message || "Invalid OTP code.");
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
    if (!fullName.trim() || !serviceTitle.trim()) {
        setError("Please enter your name and profession.");
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
            category,
            accountType,
            saccoCode: saccoRegNo.trim() ? `SACCO-${saccoRegNo.trim().toUpperCase()}` : undefined,
            location: location.trim() || 'Nairobi, Kenya',
            about: about.trim(),
            hourlyRate: parseFloat(hourlyRate) || 0,
            rateType: rateType,
            cta: selectedCta,
            referralCode: referralCode.trim(),
            isVerified: hasReferral,
            isProfileCompleted: true
        }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[150] p-3 backdrop-blur-xs animate-fade-in font-sans">
      <div className={`bg-white rounded-xl border border-black shadow-xl w-full ${step === 3 && step3Mode === 'complete' ? 'max-w-md' : 'max-w-xs'} overflow-hidden relative my-auto max-h-[90vh] flex flex-col transition-all duration-150`}>
        
        {/* Minimal Black Header */}
        <div className="bg-black text-white px-3.5 py-2.5 flex justify-between items-center shrink-0 border-b border-neutral-800">
          <div className="min-w-0">
            <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-400 block leading-none">
              {step === 1 && 'Authentication • Step 1'}
              {step === 2 && 'Authentication • Step 2'}
              {step === 3 && step3Mode === 'choice' && 'Account Setup Option'}
              {step === 3 && step3Mode === 'nickname' && 'Continue with Nickname'}
              {step === 3 && step3Mode === 'complete' && 'Complete Profile'}
            </span>
            <h2 className="text-xs font-black uppercase tracking-wider text-white mt-0.5">
              {step === 3 && step3Mode === 'complete' ? 'Skill Profile Setup' : 'Nikosoko Sign In'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-neutral-400 hover:text-white transition-colors text-sm font-bold font-mono p-1 cursor-pointer"
            title="Close"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-[11px] p-2 mx-3.5 mt-2.5 rounded text-center font-bold border border-red-200 shrink-0">
            {error}
          </div>
        )}
        
        <div className="overflow-y-auto flex-1 p-3.5 space-y-3">
          
          {/* STEP 1: Phone Entry */}
          {step === 1 && (
            <div className="space-y-3">
              {/* Quick Fill Super Admin for easy testing */}
              <div className="bg-neutral-50 border border-dashed border-neutral-300 p-2 rounded flex items-center justify-between text-xs">
                <div>
                  <span className="text-[8px] font-bold uppercase text-neutral-400 block">Super Admin Fill</span>
                  <p className="text-[11px] font-mono font-bold text-black">0723119356</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setPhone('723119356'); setError(''); }}
                  className="bg-black text-white hover:bg-neutral-800 font-bold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider transition-all cursor-pointer"
                >
                  Fill
                </button>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-2.5">
                <div className="space-y-1">
                  <label className="block text-[9.5px] font-extrabold text-black uppercase tracking-wider">
                    Enter Phone Number *
                  </label>
                  <div className="flex items-center border border-black rounded bg-white overflow-hidden focus-within:ring-1 focus-within:ring-black">
                    <span className="px-2.5 text-black font-extrabold text-xs bg-neutral-100 border-r border-neutral-300 py-2">
                      +254
                    </span>
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={handlePhoneChange} 
                      required 
                      autoFocus 
                      placeholder="712 345 678" 
                      className="w-full px-2.5 py-2 text-black font-bold text-xs tracking-wider focus:outline-none" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full bg-black text-white hover:bg-neutral-800 font-bold py-2.5 rounded transition-all uppercase text-[10px] tracking-wider cursor-pointer disabled:bg-neutral-300 flex items-center justify-center gap-1"
                >
                  {isLoading ? 'Sending Code...' : 'Continue & Send OTP \u2192'}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <div className="text-center bg-neutral-50 p-2 rounded border border-dashed border-neutral-300">
                <span className="text-[8.5px] text-neutral-400 font-bold uppercase block">Sent to +254 {phone}</span>
                <button 
                  type="button" 
                  onClick={() => { setStep(1); setError(''); }} 
                  className="text-[9.5px] text-black font-bold underline mt-0.5 cursor-pointer"
                >
                  Change Number
                </button>
              </div>

              <div className="space-y-1">
                <label className="block text-[9.5px] font-extrabold text-black uppercase tracking-wider text-center">
                  Enter 4-Digit OTP Code
                </label>
                <input 
                  type="tel" 
                  maxLength={4} 
                  value={otp} 
                  onChange={handleOtpChange} 
                  required 
                  autoFocus 
                  placeholder="• • • •"
                  className="w-full text-center tracking-[0.5em] text-xl font-black p-2.5 border border-black rounded bg-neutral-50 focus:outline-none focus:bg-white text-black font-mono" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-black text-white hover:bg-neutral-800 font-bold py-2.5 rounded transition-all uppercase text-[10px] tracking-wider cursor-pointer disabled:bg-neutral-300 flex items-center justify-center gap-1"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP \u2192'}
              </button>
            </form>
          )}

          {/* STEP 3 - FLOATING WINDOW PROMPT: Complete Sign Up vs Continue with Nickname */}
          {step === 3 && step3Mode === 'choice' && (
            <div className="space-y-3 animate-fade-in text-center py-1">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-black mx-auto">
                ✓
              </div>

              <div>
                <h3 className="text-xs font-black text-black uppercase tracking-wider">OTP Verified!</h3>
                <p className="text-[10.5px] text-neutral-600 font-medium mt-0.5">
                  Choose how to finish your setup:
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {/* Option 1: Complete Sign Up (Full Profile Form) */}
                <button
                  type="button"
                  onClick={() => setStep3Mode('complete')}
                  className="w-full p-2.5 bg-black text-white hover:bg-neutral-800 rounded border border-black transition-all cursor-pointer text-left flex items-center justify-between group active:scale-98"
                >
                  <div>
                    <span className="text-[10.5px] font-black uppercase tracking-wider block">1. Complete Sign Up</span>
                    <span className="text-[8.5px] text-neutral-300 font-normal block">
                      Upload photo, profession & rate card
                    </span>
                  </div>
                  <span className="text-xs font-bold">&rarr;</span>
                </button>

                {/* Option 2: Continue with Nickname (Fast Skip) */}
                <button
                  type="button"
                  onClick={() => setStep3Mode('nickname')}
                  className="w-full p-2.5 bg-neutral-50 hover:bg-neutral-100 text-black rounded border border-dashed border-neutral-400 transition-all cursor-pointer text-left flex items-center justify-between group active:scale-98"
                >
                  <div>
                    <span className="text-[10.5px] font-black uppercase tracking-wider block">2. Continue with Nickname</span>
                    <span className="text-[8.5px] text-neutral-500 font-normal block">
                      Quick alias, skip profile details for now
                    </span>
                  </div>
                  <span className="text-xs font-bold text-neutral-400 group-hover:text-black">&rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 - NICKNAME FORM */}
          {step === 3 && step3Mode === 'nickname' && (
            <form onSubmit={handleNicknameSubmit} className="space-y-3 animate-fade-in">
              <div className="text-center">
                <h3 className="text-xs font-black text-black uppercase tracking-wider">Enter Nickname</h3>
                <p className="text-[10px] text-neutral-500 font-medium">
                  Enter an alias to start immediately.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-extrabold text-black uppercase tracking-wider">
                  Nickname / Alias *
                </label>
                <input 
                  type="text" 
                  required
                  autoFocus
                  value={nickname} 
                  onChange={e => setNickname(e.target.value)} 
                  placeholder="e.g. John M., Sparky" 
                  className="w-full p-2 bg-neutral-50 border border-black rounded text-xs font-bold text-black focus:outline-none focus:bg-white" 
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-black text-white hover:bg-neutral-800 font-bold py-2.5 rounded transition-all uppercase text-[10px] tracking-wider cursor-pointer"
              >
                Continue &rarr;
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep3Mode('complete')}
                  className="text-[9px] font-bold text-neutral-500 hover:text-black underline cursor-pointer"
                >
                  Complete Full Skill Profile Instead &rarr;
                </button>
              </div>
            </form>
          )}

          {/* STEP 3 - COMPLETE SIGN UP FORM */}
          {step === 3 && step3Mode === 'complete' && (
            <form onSubmit={handleCompleteProfileSubmit} className="space-y-3 animate-fade-in text-neutral-900 text-xs">
              
              <div className="flex justify-between items-center pb-1 border-b border-dashed border-neutral-300">
                <span className="text-[9px] font-extrabold uppercase text-neutral-400">Profile Details</span>
                <button
                  type="button"
                  onClick={() => setStep3Mode('choice')}
                  className="text-[9px] font-bold text-black underline cursor-pointer"
                >
                  &larr; Switch Option
                </button>
              </div>

              {/* Avatar Upload & Name */}
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full border border-black bg-neutral-100 overflow-hidden flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[9px] font-bold text-neutral-400">Photo</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-black text-white text-[8px] p-0.5 rounded-full cursor-pointer"
                  >
                    📷
                  </button>
                  <input type="file" ref={avatarInputRef} onChange={handleAvatarFileSelect} accept="image/*" className="hidden" />
                </div>

                <div className="flex-1 space-y-1">
                  <label className="block text-[8.5px] font-extrabold text-black uppercase tracking-wider">Full Name *</label>
                  <input 
                    type="text" 
                    required
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)} 
                    placeholder="e.g. Jane Wanjiku" 
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-bold text-black focus:outline-none focus:border-black" 
                  />
                </div>
              </div>

              {/* Service Title */}
              <div className="space-y-1">
                <label className="block text-[8.5px] font-extrabold text-black uppercase tracking-wider">Profession / Skill *</label>
                <input 
                  type="text" 
                  required
                  value={serviceTitle} 
                  onChange={e => setServiceTitle(e.target.value)} 
                  placeholder="e.g. Electrician, Carpenter, Welder" 
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-bold text-black focus:outline-none focus:border-black" 
                />
              </div>

              {/* Category & Account Type */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-[8.5px] font-extrabold text-black uppercase tracking-wider">Category</label>
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-[11px] font-bold text-black focus:outline-none focus:border-black cursor-pointer"
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
                  <label className="block text-[8.5px] font-extrabold text-black uppercase tracking-wider">Account Type</label>
                  <select 
                    value={accountType} 
                    onChange={e => setAccountType(e.target.value as any)}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-[11px] font-bold text-black focus:outline-none focus:border-black cursor-pointer"
                  >
                    <option value="individual">Individual</option>
                    <option value="organization">Organization / Sacco</option>
                  </select>
                </div>
              </div>

              {accountType === 'organization' && (
                <div className="space-y-1 bg-neutral-50 p-2 rounded border border-neutral-300">
                  <label className="block text-[8.5px] font-extrabold text-black uppercase tracking-wider">
                    Sacco / Org Reg No.
                  </label>
                  <input 
                    type="text" 
                    value={saccoRegNo} 
                    onChange={e => setSaccoRegNo(e.target.value)} 
                    placeholder="e.g. REG-SOC/2026/09" 
                    className="w-full p-1.5 bg-white border border-neutral-300 rounded text-xs font-mono font-bold text-black" 
                  />
                </div>
              )}

              {/* Location & About */}
              <div className="space-y-1">
                <label className="block text-[8.5px] font-extrabold text-black uppercase tracking-wider">Location / Estate</label>
                <input 
                  type="text" 
                  value={location} 
                  onChange={e => setLocation(e.target.value)} 
                  placeholder="e.g. Ruaka, Kiambu County" 
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-bold text-black focus:outline-none focus:border-black" 
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[8.5px] font-extrabold text-black uppercase tracking-wider">Bio / Experience</label>
                <textarea 
                  value={about} 
                  onChange={e => setAbout(e.target.value)} 
                  placeholder="Brief description of field experience and service..." 
                  rows={2}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-normal text-black focus:outline-none focus:border-black resize-none" 
                />
              </div>

              {/* Rate Card */}
              <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-2 rounded border border-neutral-200">
                <div>
                  <span className="text-[8px] font-extrabold text-neutral-500 uppercase block mb-0.5">Rate (KES)</span>
                  <input 
                    type="number" 
                    value={hourlyRate} 
                    onChange={e => setHourlyRate(e.target.value)} 
                    placeholder="1500" 
                    className="w-full p-1.5 bg-white border border-neutral-300 rounded text-xs font-black text-black" 
                  />
                </div>
                <div>
                  <span className="text-[8px] font-extrabold text-neutral-500 uppercase block mb-0.5">Unit</span>
                  <select 
                    value={rateType} 
                    onChange={e => setRateType(e.target.value as any)}
                    className="w-full p-1.5 bg-white border border-neutral-300 rounded text-[11px] font-bold text-black"
                  >
                    {RATE_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons to Display */}
              <div className="space-y-1">
                <span className="text-[8.5px] font-extrabold text-black uppercase tracking-wider block">
                  Profile Buttons
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {CTA_OPTIONS.map(opt => {
                    const isSelected = selectedCta.includes(opt.id);
                    return (
                      <button 
                        type="button" 
                        key={opt.id}
                        onClick={() => toggleCtaOption(opt.id)}
                        className={`p-1 rounded text-[9.5px] font-bold transition-all border flex items-center justify-center gap-1 cursor-pointer ${
                          isSelected 
                            ? 'bg-black text-white border-black' 
                            : 'bg-white text-neutral-600 border-neutral-300 hover:border-black'
                        }`}
                      >
                        <span>{opt.icon}</span>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Referral Code */}
              <div className="space-y-1">
                <label className="block text-[8.5px] font-extrabold text-black uppercase tracking-wider">
                  Referral Code (Optional)
                </label>
                <input 
                  type="text" 
                  value={referralCode} 
                  onChange={e => setReferralCode(e.target.value)} 
                  placeholder="Code for verified badge" 
                  className="w-full p-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs font-bold text-black uppercase tracking-wider" 
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-black text-white hover:bg-neutral-800 font-bold py-2.5 rounded transition-all uppercase text-[10px] tracking-wider cursor-pointer active:scale-98 shadow-xs mt-1"
              >
                Save & Complete Registration &rarr;
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default AuthModal;
