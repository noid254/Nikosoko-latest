import React, { useState, useRef } from 'react';
import * as api from '../services/api';
import { uploadImageToStorage, saveUserProfileToFirestore } from '../services/firebase';
import type { ServiceProvider } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (data: api.VerifyOtpResponse, phone: string, nickname?: string, fullProfile?: Partial<ServiceProvider>) => void;
  initialMode?: 'nickname' | 'complete_signup';
}

const CTA_OPTIONS: { id: 'call' | 'whatsapp' | 'book' | 'catalogue' | 'menu' | 'save' | 'chat'; label: string; icon: string }[] = [
  { id: 'call', label: 'Call', icon: '📞' },
  { id: 'book', label: 'Book', icon: '📅' },
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '📱' },
  { id: 'catalogue', label: 'Catalogue', icon: '🛍️' },
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
  
  // Auth Mode: 'phone' | 'google' | 'email'
  const [authMethod, setAuthMethod] = useState<'phone' | 'google' | 'email'>('phone');
  const [emailInput, setEmailInput] = useState('');
  const [emailNameInput, setEmailNameInput] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  // Steps: 1 = Auth Select / Input, 2 = OTP, 3 = Floating Prompt / Choice Form
  const [step, setStep] = useState<1 | 2 | 3>(initialMode === 'complete_signup' ? 3 : 1);
  const [step3Mode, setStep3Mode] = useState<'choice' | 'nickname' | 'complete'>(
    initialMode === 'complete_signup' ? 'complete' : 'choice'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tempAuthResponse, setTempAuthResponse] = useState<api.VerifyOtpResponse | null>(null);

  // Complete Profile Form State
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const idDocInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  // Identity Verification State
  const [idType, setIdType] = useState<'National ID' | 'Passport' | 'Alien Card' | 'Driving License'>('National ID');
  const [idNumber, setIdNumber] = useState('');
  const [idDocumentUrl, setIdDocumentUrl] = useState('');
  const [idDocFile, setIdDocFile] = useState<File | null>(null);
  const [selfieUrl, setSelfieUrl] = useState('');
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

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
  const [selectedCta, setSelectedCta] = useState<('call' | 'whatsapp' | 'book' | 'catalogue' | 'menu' | 'save' | 'chat')[]>([
    'call', 'book', 'chat'
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

  const handleGoogleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = googleEmail.trim() || 'user@gmail.com';
    const cleanName = googleName.trim() || cleanEmail.split('@')[0] || 'Google Member';
    
    setIsLoading(true);
    setTimeout(() => {
      const mockResponse: api.VerifyOtpResponse = {
        success: true,
        user: null,
        token: `google_token_${Date.now()}`,
        isSuperAdmin: false
      };
      setTempAuthResponse(mockResponse);
      setPhoneNum(cleanEmail);
      setFullName(cleanName);
      setNickname(cleanName);
      setStep(3);
      setStep3Mode('choice');
      setIsLoading(false);
    }, 400);
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }
    const cleanEmail = emailInput.trim();
    const cleanName = emailNameInput.trim() || cleanEmail.split('@')[0] || 'Email Member';
    
    setIsLoading(true);
    setTimeout(() => {
      const mockResponse: api.VerifyOtpResponse = {
        success: true,
        user: null,
        token: `email_token_${Date.now()}`,
        isSuperAdmin: false
      };
      setTempAuthResponse(mockResponse);
      setPhoneNum(cleanEmail);
      setFullName(cleanName);
      setNickname(cleanName);
      setStep(3);
      setStep3Mode('choice');
      setIsLoading(false);
    }, 400);
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
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdDocFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setIdDocumentUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelfieSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelfieFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelfieUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCtaOption = (id: 'call' | 'whatsapp' | 'book' | 'catalogue' | 'menu' | 'save' | 'chat') => {
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

  const handleCompleteProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !serviceTitle.trim()) {
        setError("Please enter your name and profession.");
        return;
    }

    setIsLoading(true);
    try {
        const hasReferral = Boolean(referralCode.trim().length > 0);
        const finalPhone = phoneNum.trim() || `254${phone}`;
        const tempUserId = `sp_${Date.now()}`;
        let finalAvatar = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName.trim())}&background=random`;
        let finalIdDoc = idDocumentUrl;
        let finalSelfie = selfieUrl;

        // Upload avatar to Firebase Storage if selected file or base64 data URL
        if (avatarFile) {
            finalAvatar = await uploadImageToStorage(avatarFile, `users/${tempUserId}/avatar_${Date.now()}`);
        } else if (avatarUrl && avatarUrl.startsWith('data:')) {
            finalAvatar = await uploadImageToStorage(avatarUrl, `users/${tempUserId}/avatar_${Date.now()}`);
        }

        // Upload ID document & Selfie
        if (idDocFile) {
            finalIdDoc = await uploadImageToStorage(idDocFile, `users/${tempUserId}/id_doc_${Date.now()}`);
        }
        if (selfieFile) {
            finalSelfie = await uploadImageToStorage(selfieFile, `users/${tempUserId}/selfie_${Date.now()}`);
        }

        const isIdentityVerified = Boolean(finalIdDoc || finalSelfie || idNumber.trim());

        const mockResponse: api.VerifyOtpResponse = tempAuthResponse || {
          success: true,
          user: null,
          token: `token_${Date.now()}`,
          isSuperAdmin: false
        };

        const fullProfileData: Partial<ServiceProvider> = {
            id: tempUserId,
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
            isVerified: isIdentityVerified || hasReferral,
            idVerificationStatus: isIdentityVerified ? 'Verified' : 'Unverified',
            idType: isIdentityVerified ? idType : undefined,
            idNumber: idNumber.trim() || undefined,
            idDocumentUrl: finalIdDoc || undefined,
            selfieUrl: finalSelfie || undefined,
            rating: isIdentityVerified ? 5.0 : 4.8,
            isProfileCompleted: true
        };

        saveUserProfileToFirestore(tempUserId, fullProfileData).catch(console.error);

        onLogin(
            mockResponse, 
            finalPhone, 
            fullName.trim(),
            fullProfileData
        );
    } catch (err: any) {
        console.error("Error during profile registration:", err);
        setError("Failed to upload avatar or complete profile.");
    } finally {
        setIsLoading(false);
    }
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
          
          {/* STEP 1: Auth Method Selection & Inputs */}
          {step === 1 && (
            <div className="space-y-3">
              {/* Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-100 rounded-lg border border-neutral-200">
                <button
                  type="button"
                  onClick={() => { setAuthMethod('phone'); setError(''); }}
                  className={`py-1.5 text-[9px] font-black uppercase tracking-wider rounded transition-all cursor-pointer ${
                    authMethod === 'phone' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  📱 Phone OTP
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMethod('google'); setError(''); }}
                  className={`py-1.5 text-[9px] font-black uppercase tracking-wider rounded transition-all cursor-pointer ${
                    authMethod === 'google' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  🌐 Google
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMethod('email'); setError(''); }}
                  className={`py-1.5 text-[9px] font-black uppercase tracking-wider rounded transition-all cursor-pointer ${
                    authMethod === 'email' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  ✉️ Email
                </button>
              </div>

              {/* PHONE AUTH METHOD */}
              {authMethod === 'phone' && (
                <div className="space-y-3">
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

              {/* GOOGLE AUTH METHOD */}
              {authMethod === 'google' && (
                <form onSubmit={handleGoogleSignIn} className="space-y-2.5 animate-fade-in">
                  <div className="text-center bg-blue-50/60 p-2.5 rounded border border-blue-200">
                    <span className="text-xs font-black text-blue-900 block">Fast Google Account Access</span>
                    <span className="text-[9px] text-blue-700 font-medium block mt-0.5">
                      Bypass SMS delays • Continue instantly with Google
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-extrabold text-black uppercase tracking-wider">
                      Google Email Address *
                    </label>
                    <input 
                      type="email" 
                      required
                      value={googleEmail} 
                      onChange={e => setGoogleEmail(e.target.value)} 
                      placeholder="e.g. wanjiku@gmail.com" 
                      className="w-full p-2 bg-neutral-50 border border-black rounded text-xs font-bold text-black focus:outline-none focus:bg-white" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-extrabold text-black uppercase tracking-wider">
                      Full Name (Optional)
                    </label>
                    <input 
                      type="text" 
                      value={googleName} 
                      onChange={e => setGoogleName(e.target.value)} 
                      placeholder="e.g. Jane Wanjiku" 
                      className="w-full p-2 bg-neutral-50 border border-black rounded text-xs font-bold text-black focus:outline-none focus:bg-white" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2.5 rounded transition-all uppercase text-[10px] tracking-wider cursor-pointer shadow-xs flex items-center justify-center gap-2"
                  >
                    <span>🌐 Continue with Google</span>
                    <span>&rarr;</span>
                  </button>
                </form>
              )}

              {/* EMAIL AUTH METHOD */}
              {authMethod === 'email' && (
                <form onSubmit={handleEmailSignIn} className="space-y-2.5 animate-fade-in">
                  <div className="text-center bg-purple-50/60 p-2.5 rounded border border-purple-200">
                    <span className="text-xs font-black text-purple-900 block">Email Sign In</span>
                    <span className="text-[9px] text-purple-700 font-medium block mt-0.5">
                      Instant access using your work or personal email
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-extrabold text-black uppercase tracking-wider">
                      Work / Personal Email *
                    </label>
                    <input 
                      type="email" 
                      required
                      value={emailInput} 
                      onChange={e => setEmailInput(e.target.value)} 
                      placeholder="e.g. alex@nikosoko.com" 
                      className="w-full p-2 bg-neutral-50 border border-black rounded text-xs font-bold text-black focus:outline-none focus:bg-white" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-extrabold text-black uppercase tracking-wider">
                      Full Name / Display Name
                    </label>
                    <input 
                      type="text" 
                      value={emailNameInput} 
                      onChange={e => setEmailNameInput(e.target.value)} 
                      placeholder="e.g. Alex Kip" 
                      className="w-full p-2 bg-neutral-50 border border-black rounded text-xs font-bold text-black focus:outline-none focus:bg-white" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-black hover:bg-neutral-800 text-white font-extrabold py-2.5 rounded transition-all uppercase text-[10px] tracking-wider cursor-pointer shadow-xs flex items-center justify-center gap-2"
                  >
                    <span>✉️ Continue with Email</span>
                    <span>&rarr;</span>
                  </button>
                </form>
              )}

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

          {/* STEP 3 - COMPLETE SIGN UP FORM (MINIMALIST INTERIOR DESIGN MAGAZINE STYLE) */}
          {step === 3 && step3Mode === 'complete' && (
            <form onSubmit={handleCompleteProfileSubmit} className="space-y-2.5 animate-fade-in text-neutral-900 text-xs">
              
              {/* Header section with category badge */}
              <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-900 block">Registration Portfolio</span>
                  <span className="text-[8px] text-neutral-400 font-medium tracking-wide">Architectural Service Details</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep3Mode('choice')}
                  className="text-[9px] font-bold text-neutral-500 hover:text-black uppercase tracking-wider cursor-pointer underline"
                >
                  &larr; Switch
                </button>
              </div>

              {/* Row 1: Profile Photo & Full Name */}
              <label className="block p-3 border border-neutral-200 bg-neutral-50/70 hover:bg-neutral-100/80 focus-within:border-black focus-within:bg-white transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                    <div className="w-11 h-11 rounded-none border border-black bg-white overflow-hidden flex items-center justify-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Photo</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 bg-black text-white text-[8px] p-1 cursor-pointer hover:bg-neutral-800"
                      title="Upload Avatar Photo"
                    >
                      📷
                    </button>
                    <input type="file" ref={avatarInputRef} onChange={handleAvatarFileSelect} accept="image/*" className="hidden" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="block text-[8px] font-black text-neutral-500 uppercase tracking-[0.18em] group-hover:text-black transition-colors">
                      Full Legal Name *
                    </span>
                    <input 
                      type="text" 
                      required
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)} 
                      placeholder="e.g. Jane Wanjiku" 
                      className="w-full mt-0.5 bg-transparent border-b border-transparent group-hover:border-neutral-300 focus:border-black text-xs font-bold text-black focus:outline-none py-0.5 placeholder-neutral-400" 
                    />
                  </div>
                </div>
              </label>

              {/* Row 2: Profession / Skill */}
              <label className="block p-3 border border-neutral-200 bg-neutral-50/70 hover:bg-neutral-100/80 focus-within:border-black focus-within:bg-white transition-all cursor-pointer group">
                <span className="block text-[8px] font-black text-neutral-500 uppercase tracking-[0.18em] group-hover:text-black transition-colors">
                  Profession / Primary Skill *
                </span>
                <input 
                  type="text" 
                  required
                  value={serviceTitle} 
                  onChange={e => setServiceTitle(e.target.value)} 
                  placeholder="e.g. Interior Architect, Electrician, Carpenter" 
                  className="w-full mt-0.5 bg-transparent border-b border-transparent group-hover:border-neutral-300 focus:border-black text-xs font-bold text-black focus:outline-none py-0.5 placeholder-neutral-400" 
                />
              </label>

              {/* Row 3: Category Selection */}
              <label className="block p-3 border border-neutral-200 bg-neutral-50/70 hover:bg-neutral-100/80 focus-within:border-black focus-within:bg-white transition-all cursor-pointer group">
                <span className="block text-[8px] font-black text-neutral-500 uppercase tracking-[0.18em] group-hover:text-black transition-colors mb-1">
                  Service Category
                </span>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-white border border-neutral-300 p-2 text-xs font-bold text-black focus:outline-none focus:border-black cursor-pointer"
                >
                  <option value="PERSONAL">PERSONAL SERVICES</option>
                  <option value="TRADE">TECHNICAL TRADE & REPAIRS</option>
                  <option value="PROFESSIONAL">PROFESSIONAL CONSULTING</option>
                  <option value="CREATIVE">CREATIVE & DESIGN</option>
                  <option value="HOME">HOME & ESTATE</option>
                  <option value="EVENT">EVENTS & PRODUCTION</option>
                </select>
              </label>

              {/* Row 4: Account Type */}
              <label className="block p-3 border border-neutral-200 bg-neutral-50/70 hover:bg-neutral-100/80 focus-within:border-black focus-within:bg-white transition-all cursor-pointer group">
                <span className="block text-[8px] font-black text-neutral-500 uppercase tracking-[0.18em] group-hover:text-black transition-colors mb-1">
                  Account Operating Type
                </span>
                <select 
                  value={accountType} 
                  onChange={e => setAccountType(e.target.value as any)}
                  className="w-full bg-white border border-neutral-300 p-2 text-xs font-bold text-black focus:outline-none focus:border-black cursor-pointer"
                >
                  <option value="individual">Individual Professional</option>
                  <option value="organization">Registered Organization / Sacco</option>
                </select>
              </label>

              {accountType === 'organization' && (
                <label className="block p-3 border border-neutral-200 bg-neutral-50/70 hover:bg-neutral-100/80 focus-within:border-black focus-within:bg-white transition-all cursor-pointer group">
                  <span className="block text-[8px] font-black text-neutral-500 uppercase tracking-[0.18em] group-hover:text-black transition-colors">
                    Sacco / Organization Registration No.
                  </span>
                  <input 
                    type="text" 
                    value={saccoRegNo} 
                    onChange={e => setSaccoRegNo(e.target.value)} 
                    placeholder="e.g. REG-SOC/2026/09" 
                    className="w-full mt-0.5 bg-white border border-neutral-300 p-2 text-xs font-mono font-bold text-black focus:outline-none focus:border-black" 
                  />
                </label>
              )}

              {/* Row 5: Location & Estate */}
              <label className="block p-3 border border-neutral-200 bg-neutral-50/70 hover:bg-neutral-100/80 focus-within:border-black focus-within:bg-white transition-all cursor-pointer group">
                <span className="block text-[8px] font-black text-neutral-500 uppercase tracking-[0.18em] group-hover:text-black transition-colors">
                  Primary Location / Estate
                </span>
                <input 
                  type="text" 
                  value={location} 
                  onChange={e => setLocation(e.target.value)} 
                  placeholder="e.g. Ruaka, Kiambu County" 
                  className="w-full mt-0.5 bg-transparent border-b border-transparent group-hover:border-neutral-300 focus:border-black text-xs font-bold text-black focus:outline-none py-0.5 placeholder-neutral-400" 
                />
              </label>

              {/* Row 6: Experience & Portfolio Bio */}
              <label className="block p-3 border border-neutral-200 bg-neutral-50/70 hover:bg-neutral-100/80 focus-within:border-black focus-within:bg-white transition-all cursor-pointer group">
                <span className="block text-[8px] font-black text-neutral-500 uppercase tracking-[0.18em] group-hover:text-black transition-colors">
                  Experience & Portfolio Bio
                </span>
                <textarea 
                  value={about} 
                  onChange={e => setAbout(e.target.value)} 
                  placeholder="Brief description of specialized expertise, work philosophy, or qualifications..." 
                  rows={2}
                  className="w-full mt-1 bg-white border border-neutral-200 p-2 text-xs text-black focus:outline-none focus:border-black resize-none placeholder-neutral-400" 
                />
              </label>

              {/* Row 7: Rate Card (Full Row) */}
              <label className="block p-3 border border-neutral-200 bg-neutral-50/70 hover:bg-neutral-100/80 focus-within:border-black focus-within:bg-white transition-all cursor-pointer group">
                <span className="block text-[8px] font-black text-neutral-500 uppercase tracking-[0.18em] group-hover:text-black transition-colors mb-1.5">
                  Standard Service Rate & Billing Unit
                </span>
                <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                  <div>
                    <span className="text-[7.5px] font-extrabold text-neutral-400 uppercase block mb-0.5">Rate Amount (KES)</span>
                    <input 
                      type="number" 
                      value={hourlyRate} 
                      onChange={e => setHourlyRate(e.target.value)} 
                      placeholder="1500" 
                      className="w-full p-2 bg-white border border-neutral-300 text-xs font-black text-black focus:outline-none focus:border-black" 
                    />
                  </div>
                  <div>
                    <span className="text-[7.5px] font-extrabold text-neutral-400 uppercase block mb-0.5">Billing Unit</span>
                    <select 
                      value={rateType} 
                      onChange={e => setRateType(e.target.value as any)}
                      className="w-full p-2 bg-white border border-neutral-300 text-xs font-bold text-black focus:outline-none focus:border-black cursor-pointer"
                    >
                      {RATE_TYPE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </label>

              {/* Row 8: Profile Buttons Offer */}
              <div className="p-3 border border-neutral-200 bg-neutral-50/70 transition-all">
                <span className="block text-[8px] font-black text-neutral-500 uppercase tracking-[0.18em] mb-2">
                  Active Profile Action Offers (Select Buttons to Offer)
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {CTA_OPTIONS.map(opt => {
                    const isSelected = selectedCta.includes(opt.id);
                    return (
                      <button 
                        type="button" 
                        key={opt.id}
                        onClick={() => toggleCtaOption(opt.id)}
                        className={`p-2 transition-all border flex items-center justify-center gap-1.5 cursor-pointer text-[10px] uppercase tracking-wider font-extrabold ${
                          isSelected 
                            ? 'bg-black text-white border-black shadow-xs' 
                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-black'
                        }`}
                      >
                        <span>{opt.icon}</span>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 9: Identity Verification & Rating Boost */}
              <div className="p-3 border border-emerald-300 bg-emerald-50/50 rounded-lg space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">🛡️</span>
                  <div>
                    <span className="block text-[9px] font-black uppercase text-emerald-950 tracking-wider">
                      Identity Verification & Rating Boost
                    </span>
                    <span className="block text-[8px] text-emerald-800 font-semibold leading-tight mt-0.5">
                      Verified profiles get a Verified Badge ✓, boosted rating score (5.0★), and feature FIRST in search results!
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[7.5px] font-extrabold text-neutral-600 uppercase mb-0.5">
                      Doc Type
                    </label>
                    <select
                      value={idType}
                      onChange={e => setIdType(e.target.value as any)}
                      className="w-full bg-white border border-neutral-300 p-1.5 text-xs font-bold text-black focus:outline-none focus:border-black cursor-pointer"
                    >
                      <option value="National ID">National ID</option>
                      <option value="Passport">Passport</option>
                      <option value="Alien Card">Alien Card</option>
                      <option value="Driving License">Driving License</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[7.5px] font-extrabold text-neutral-600 uppercase mb-0.5">
                      ID / Passport No.
                    </label>
                    <input
                      type="text"
                      value={idNumber}
                      onChange={e => setIdNumber(e.target.value)}
                      placeholder="e.g. 34567890"
                      className="w-full bg-white border border-neutral-300 p-1.5 text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* Upload Buttons for ID Doc & Selfie */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* ID Document Photo */}
                  <div className="border border-dashed border-neutral-400 bg-white p-2 text-center rounded relative">
                    <span className="block text-[7.5px] font-black uppercase text-neutral-500 mb-1">
                      1. ID / Passport Scan
                    </span>
                    {idDocumentUrl ? (
                      <div className="relative h-12 w-full overflow-hidden rounded border border-neutral-300">
                        <img src={idDocumentUrl} alt="ID Document" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[7px] font-bold py-0.5">✓ Uploaded</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => idDocInputRef.current?.click()}
                        className="w-full py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[8.5px] font-bold uppercase rounded border border-neutral-300 cursor-pointer"
                      >
                        📷 Upload ID
                      </button>
                    )}
                    <input type="file" ref={idDocInputRef} onChange={handleIdDocSelect} accept="image/*" className="hidden" />
                  </div>

                  {/* Selfie Verification Photo */}
                  <div className="border border-dashed border-neutral-400 bg-white p-2 text-center rounded relative">
                    <span className="block text-[7.5px] font-black uppercase text-neutral-500 mb-1">
                      2. Live Selfie Photo
                    </span>
                    {selfieUrl ? (
                      <div className="relative h-12 w-full overflow-hidden rounded border border-neutral-300">
                        <img src={selfieUrl} alt="Selfie Verification" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[7px] font-bold py-0.5">✓ Uploaded</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => selfieInputRef.current?.click()}
                        className="w-full py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[8.5px] font-bold uppercase rounded border border-neutral-300 cursor-pointer"
                      >
                        🤳 Take Selfie
                      </button>
                    )}
                    <input type="file" ref={selfieInputRef} onChange={handleSelfieSelect} accept="image/*" className="hidden" />
                  </div>
                </div>
              </div>

              {/* Row 10: Referral Code (Optional) */}
              <label className="block p-3 border border-neutral-200 bg-neutral-50/70 hover:bg-neutral-100/80 focus-within:border-black focus-within:bg-white transition-all cursor-pointer group">
                <span className="block text-[8px] font-black text-neutral-500 uppercase tracking-[0.18em] group-hover:text-black transition-colors">
                  Referral Code (Optional)
                </span>
                <input 
                  type="text" 
                  value={referralCode} 
                  onChange={e => setReferralCode(e.target.value)} 
                  placeholder="Enter code for priority verification" 
                  className="w-full mt-0.5 bg-transparent border-b border-transparent group-hover:border-neutral-300 focus:border-black text-xs font-bold text-black uppercase tracking-wider focus:outline-none py-0.5 placeholder-neutral-400" 
                />
              </label>

              {/* Mandatory Non-Optional Save Button */}
              <button 
                type="submit" 
                className="w-full py-3.5 bg-black text-white hover:bg-neutral-800 font-extrabold uppercase text-[10px] tracking-[0.2em] transition-all cursor-pointer shadow-md mt-4 active:scale-[0.99] flex items-center justify-center gap-2 border border-black"
              >
                <span>SAVE & COMPLETE REGISTRATION</span>
                <span>&rarr;</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default AuthModal;
