import React, { useState, useEffect } from 'react';

export const EmailSettingsPage: React.FC = () => {
  const [config, setConfig] = useState({
    accountSid: '',
    authToken: '',
    verifyServiceSid: '',
    phoneNumber: ''
  });

  const [showToken, setShowToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Test SMS State
  const [testPhoneRecipient, setTestPhoneRecipient] = useState('0723119356');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSmsSettings();
  }, []);

  const fetchSmsSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/sms-settings');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.error('Failed to load Twilio SMS settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch('/api/admin/sms-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveMessage({ type: 'success', text: '✓ Twilio Verify API configuration saved persistently!' });
        setTimeout(() => setSaveMessage(null), 4000);
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Failed to save Twilio settings' });
      }
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.message || 'Connection error saving settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestSms = async () => {
    if (!testPhoneRecipient.trim()) return;

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/test-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testPhone: testPhoneRecipient.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          type: 'success',
          text: `🎉 LIVE SUCCESS! ${data.message}`
        });
      } else {
        setTestResult({
          type: 'error',
          text: `🚨 Twilio Delivery Error: ${data.error || 'Check Account SID, Auth Token & Verify Service SID'}`
        });
      }
    } catch (err: any) {
      setTestResult({
        type: 'error',
        text: `Network Error: ${err.message}`
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const isConfigured = Boolean(config.accountSid && config.authToken && (config.verifyServiceSid || config.phoneNumber));

  return (
    <div className="space-y-6 font-sans text-slate-800">
      
      {/* Page Title & Status Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border-2 border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📱</span>
            <h1 className="text-lg font-black uppercase tracking-wider text-amber-400">
              Twilio Verify API SMS Gateway
            </h1>
          </div>
          <p className="text-xs text-slate-300">
            Configure Twilio Account SID, Auth Token, and Verify Service SID to send live 6-digit verification codes via SMS.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {isConfigured ? (
            <div className="bg-emerald-500/20 border-2 border-emerald-500 text-emerald-300 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Twilio Verify Ready</span>
            </div>
          ) : (
            <div className="bg-amber-500/20 border-2 border-amber-500 text-amber-300 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span>Dev Simulation Mode</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Form + Test Gateway */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Credentials Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveSettings} className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <span>🔑</span> Twilio API Credentials
              </h2>
            </div>

            {saveMessage && (
              <div className={`p-3.5 rounded-xl text-xs font-bold border text-center ${
                saveMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-rose-50 text-rose-900 border-rose-300'
              }`}>
                {saveMessage.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                  Twilio Account SID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={config.accountSid}
                  onChange={e => setConfig({ ...config, accountSid: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                  Twilio Auth Token *
                </label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••••••••••••••••••••••"
                    value={config.authToken}
                    onChange={e => setConfig({ ...config, authToken: e.target.value })}
                    className="w-full p-2.5 pr-12 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-slate-950"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold hover:text-slate-900 cursor-pointer"
                  >
                    {showToken ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                    Twilio Verify Service SID (VA...) *
                  </label>
                  <input
                    type="text"
                    placeholder="VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={config.verifyServiceSid}
                    onChange={e => setConfig({ ...config, verifyServiceSid: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-slate-950"
                  />
                  <span className="text-[9.5px] text-slate-500 mt-1 block">
                    Recommended for high-deliverability SMS verification.
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                    Twilio Phone Number (Optional Fallback)
                  </label>
                  <input
                    type="text"
                    placeholder="+1234567890"
                    value={config.phoneNumber}
                    onChange={e => setConfig({ ...config, phoneNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-slate-950"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-black hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all cursor-pointer shadow-md disabled:bg-slate-300"
              >
                {isSaving ? 'Saving Credentials...' : 'Save Twilio Configuration ✓'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column (1 Col): Live SMS Dispatch Tester */}
        <div className="space-y-6">
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <span className="text-lg">🧪</span>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Test SMS Gateway
              </h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Send a test SMS via Twilio Verify API to ensure mobile deliverability to Kenya (+254) numbers.
            </p>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                  Recipient Phone Number
                </label>
                <input
                  type="tel"
                  value={testPhoneRecipient}
                  onChange={e => setTestPhoneRecipient(e.target.value)}
                  placeholder="0723119356 or +254..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-slate-950"
                />
              </div>

              <button
                type="button"
                onClick={handleSendTestSms}
                disabled={isSendingTest || !testPhoneRecipient.trim()}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer shadow-sm border border-amber-500 disabled:opacity-50"
              >
                {isSendingTest ? 'Sending Test SMS...' : 'Dispatch Test SMS Code →'}
              </button>

              {testResult && (
                <div className={`p-3 rounded-xl text-xs font-bold border ${
                  testResult.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}>
                  {testResult.text}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmailSettingsPage;
