import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import type { ServiceProvider } from '../types';
import TermsAndConditionsModal from './TermsAndConditionsModal';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (data: api.VerifyOtpResponse, phone: string, nickname?: string, fullProfile?: Partial<ServiceProvider>) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [nickname, setNickname] = useState('');
  
  // Auth Mode: 'email' | 'google' | 'phone'
  const [authMethod, setAuthMethod] = useState<'email' | 'google' | 'phone'>('email');
  const [emailInput, setEmailInput] = useState('');
  const [otpSentTarget, setOtpSentTarget] = useState('');
  const [, setMobileNumber] = useState('');
  const [useApp, setUseApp] = useState(false); // sign in with an authenticator app instead of SMS
  const [resendTimer, setResendTimer] = useState<number>(30);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(true);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);

  // Steps: 1 = Auth Select / Input, 2 = OTP, 3 = Floating Prompt / Choice Form
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tempAuthResponse, setTempAuthResponse] = useState<api.VerifyOtpResponse | null>(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  const [phoneNum, setPhoneNum] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const input = e.target.value.replace(/\D/g, '');
    if (input.length <= 9) {
      setPhone(input);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    // SMS and authenticator codes are 6 digits; backup codes look like ABCD-EFGH.
    const input = useApp ? e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '') : e.target.value.replace(/\D/g, '');
    if (input.length <= (useApp ? 9 : 6)) {
      setOtp(input);
    }
  };

  const handleUseAuthenticator = () => {
    if (phone.length < 9) { setError('Enter your 9-digit mobile number first.'); return; }
    if (!termsAccepted) { setError('Please accept the Terms & Conditions and Kenya DPA 2019 to continue.'); return; }
    const fullPhone = `254${phone}`;
    setError('');
    setUseApp(true);
    setOtp('');
    setPhoneNum(fullPhone);
    setMobileNumber(fullPhone);
    setOtpSentTarget(`+254 ${phone}`);
    setStep(2);
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (phone.length < 9) {
      setError("Please enter a valid 9-digit mobile number.");
      return;
    }
    if (!termsAccepted) {
      setError("Please accept the Terms & Conditions and Kenya DPA 2019 to continue.");
      return;
    }
    setIsLoading(true);
    setError('');
    try {
        const fullPhone = `254${phone}`;
        const res = await api.sendOtp(fullPhone);
        setUseApp(Boolean(res.useAuthenticator));
        setResendTimer(30);
        setPhoneNum(fullPhone);
        setMobileNumber(fullPhone);
        setOtpSentTarget(`+254 ${phone}`);
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
        const target = otpSentTarget || (phone ? `254${phone}` : emailInput);
        const response = await api.verifyOtp(target, otp, useApp ? 'totp' : 'sms');
        
        if (response.user) {
            onLogin(response, target, response.user.name, response.user);
        } else {
            setTempAuthResponse(response);
            setPhoneNum(target);
            setStep(3);
        }
    } catch (err: any) {
        setError(err.message || "Invalid OTP code.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleNicknameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenNickname = nickname.trim() || 'Guest Member';
    const finalPhone = phoneNum || `254${phone}`;
    
    const mockResponse: api.VerifyOtpResponse = tempAuthResponse || {
      success: true,
      user: null,
      token: api.getToken() || '',
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

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[150] p-3 backdrop-blur-xs animate-fade-in font-sans">
      <div className={`bg-white rounded-xl border border-black shadow-xl w-full max-w-xs overflow-hidden relative my-auto max-h-[90vh] flex flex-col transition-all duration-150`}>
        
        {/* Minimal Black Header */}
        <div className="bg-black text-white px-4 py-3 flex justify-between items-center shrink-0 border-b border-neutral-800">
          <div className="min-w-0">
            <h2 className="text-sm font-black uppercase tracking-wider text-amber-400 leading-none">
              Karibu Soko
            </h2>
            <p className="text-[10px] text-neutral-300 font-medium mt-1">
              {step === 1 && 'Enter phone number to continue'}
              {step === 2 && 'Demand OTP verification code'}
              {step === 3 && 'Continue with Nickname'}
            </p>
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
          <div className="bg-red-50 text-red-600 text-[11px] p-2.5 mx-3.5 mt-2.5 rounded text-center font-bold border border-red-200 shrink-0">
            {error}
          </div>
        )}
        
        <div className="overflow-y-auto flex-1 p-4 space-y-3.5">
          
          {/* STEP 1: Phone Number Input */}
          {step === 1 && (
            <div className="space-y-3.5">
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-black uppercase tracking-wider">
                    Mobile Phone Number *
                  </label>
                  <div className="flex items-center border border-black rounded bg-white overflow-hidden focus-within:ring-2 focus-within:ring-black">
                    <span className="px-3 text-black font-extrabold text-xs bg-neutral-100 border-r border-neutral-300 py-2.5 select-none">
                      +254
                    </span>
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={handlePhoneChange} 
                      required 
                      autoFocus 
                      placeholder="Enter mobile number" 
                      className="w-full px-3 py-2.5 text-black font-bold text-sm tracking-wider focus:outline-none" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full bg-black text-white hover:bg-neutral-800 font-extrabold py-3 rounded transition-all uppercase text-[11px] tracking-wider cursor-pointer disabled:bg-neutral-300 flex items-center justify-center gap-1 shadow-xs active:scale-[0.99]"
                >
                  {isLoading ? 'Sending OTP Code...' : 'Continue & Send OTP \u2192'}
                </button>
                <button
                  type="button"
                  onClick={handleUseAuthenticator}
                  className="w-full text-[11px] font-bold text-black underline hover:text-neutral-700 cursor-pointer py-1"
                >
                  Use authenticator app instead
                </button>
              </form>

              {/* TERMS & CONDITIONS MANDATORY CHECKBOX */}
              <div className="pt-2 border-t border-neutral-200 space-y-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-neutral-400 text-black focus:ring-black cursor-pointer"
                  />
                  <span className="text-[9.5px] text-neutral-600 leading-tight">
                    I accept the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="font-bold text-black underline hover:text-neutral-700 cursor-pointer"
                    >
                      Terms of Service & Kenya Data Protection Act 2019
                    </button>
                  </span>
                </label>
              </div>

            </div>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-3.5">
              <div className="text-center bg-neutral-50 p-2.5 rounded border border-neutral-300">
                <span className="text-[10px] text-neutral-600 font-bold uppercase block">
                  {useApp ? 'Signing in as' : 'OTP Sent To'}: <strong className="text-black font-mono">{otpSentTarget || (phone ? `+254 ${phone}` : '')}</strong>
                </span>
                <button 
                  type="button" 
                  onClick={() => { setStep(1); setError(''); }} 
                  className="text-[10px] text-black font-bold underline mt-1 cursor-pointer hover:text-neutral-700"
                >
                  Change Phone Number
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold text-black uppercase tracking-wider text-center">
                  {useApp ? 'Code from your authenticator app *' : 'Enter OTP Verification Code *'}
                </label>
                {useApp && <p className="text-[10px] text-neutral-500 text-center">Open Authenticator and type the 6 digits shown for NikoSoko. Lost your phone? Use one of your backup codes.</p>}
                <input 
                  type={useApp ? 'text' : 'tel'} 
                  autoComplete="one-time-code"
                  maxLength={useApp ? 9 : 6} 
                  value={otp} 
                  onChange={handleOtpChange} 
                  required 
                  autoFocus 
                  placeholder="Enter Code"
                  className="w-full text-center tracking-[0.3em] text-xl font-black p-3 border border-black rounded bg-neutral-50 focus:outline-none focus:bg-white text-black font-mono" 
                />
              </div>

              {useApp ? (
                <p className="text-center text-[10px] text-neutral-500 pt-0.5">
                  No SMS is sent for this number because it is protected by an authenticator app. Lost it? Type one of your backup codes above, or ask the admin to reset it.
                </p>
              ) : (
              <div className="flex items-center justify-between text-[9.5px] pt-0.5">
                <span className="text-neutral-500 font-medium">
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Did not receive SMS?'}
                </span>
                <button
                  type="button"
                  disabled={resendTimer > 0 || isLoading}
                  onClick={() => handleSendOtp()}
                  className="font-bold text-black underline disabled:text-neutral-400 cursor-pointer"
                >
                  Resend OTP
                </button>
              </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-black text-white hover:bg-neutral-800 font-extrabold py-3 rounded transition-all uppercase text-[11px] tracking-wider cursor-pointer disabled:bg-neutral-300 flex items-center justify-center gap-1 shadow-xs active:scale-[0.99]"
              >
                {isLoading ? 'Verifying OTP...' : 'Verify OTP Code \u2192'}
              </button>
            </form>
          )}

          {/* STEP 3 - NICKNAME FORM */}
          {step === 3 && (
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
            </form>
          )}

        </div>
      </div>

      {showTermsModal && (
        <TermsAndConditionsModal
          onClose={() => setShowTermsModal(false)}
          onAccept={() => {
            setTermsAccepted(true);
            setShowTermsModal(false);
          }}
        />
      )}
    </div>
  );
};

export default AuthModal;
