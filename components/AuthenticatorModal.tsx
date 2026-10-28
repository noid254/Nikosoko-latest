import React, { useEffect, useState } from 'react';
import * as api from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** True for the admin account, which cannot use the console until this is done. */
  required?: boolean;
  onEnabled: (isSuperAdmin: boolean) => void;
}

const group = (s: string) => s.replace(/(.{4})/g, '$1 ').trim();

const AuthenticatorModal: React.FC<Props> = ({ isOpen, onClose, required = false, onEnabled }) => {
  const [setup, setSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [wasAdmin, setWasAdmin] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setSetup(null); setCode(''); setBackupCodes(null); setError('');
    api.startAuthenticatorSetup().then(setSetup).catch(e => setError(e.message));
  }, [isOpen]);

  if (!isOpen) return null;

  const copy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const res = await api.confirmAuthenticatorSetup(code);
      setBackupCodes(res.backupCodes);
      setWasAdmin(res.isSuperAdmin);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const finish = () => { onEnabled(wasAdmin); onClose(); };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Set up authenticator app">
      <div className="w-full max-w-md bg-white text-black rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-black leading-tight">{backupCodes ? 'Save your backup codes' : 'Set up your authenticator app'}</h2>
              <p className="text-sm text-neutral-600 mt-1">
                {backupCodes
                  ? 'If you lose your phone, each code signs you in once. Keep them somewhere safe.'
                  : required
                    ? 'The admin console needs this. You will use the app instead of an SMS code.'
                    : 'Sign in with a code from the app instead of waiting for an SMS.'}
              </p>
            </div>
            {!required && !backupCodes && (
              <button onClick={onClose} className="text-neutral-400 hover:text-black text-xl leading-none" aria-label="Close">&times;</button>
            )}
          </div>

          {!backupCodes && (
            <>
              <ol className="text-sm space-y-2 text-neutral-800 list-decimal pl-5">
                <li>Open <strong>Google Authenticator</strong> and tap <strong>+</strong>.</li>
                <li>Choose <strong>Enter a setup key</strong>.</li>
                <li>Type the account name <strong>NikoSoko</strong>, paste the key below, and keep <strong>Time based</strong> on.</li>
              </ol>

              {setup ? (
                <div className="rounded-xl bg-black text-white p-4 space-y-3">
                  <p className="text-xs text-white/60">Setup key</p>
                  <p className="font-mono text-lg font-bold tracking-wider text-emerald-400 break-all select-all">{group(setup.secret)}</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => copy(setup.secret, 'key')} className="text-xs font-bold bg-white text-black rounded-full px-3 py-1.5">{copied === 'key' ? 'Copied' : 'Copy key'}</button>
                    <a href={setup.otpauthUrl} className="text-xs font-bold border border-white/40 rounded-full px-3 py-1.5">Open in app</a>
                  </div>
                </div>
              ) : !error ? (
                <p className="text-sm text-neutral-500">Preparing your key…</p>
              ) : null}

              <form onSubmit={confirm} className="space-y-3">
                <label className="block text-sm font-bold">
                  Enter the 6-digit code the app shows
                  <input
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    className="mt-1 w-full text-center tracking-[0.3em] text-xl font-black font-mono p-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </label>
                {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
                <button disabled={busy || code.length !== 6 || !setup} className="w-full bg-black text-white font-bold py-3 rounded-full disabled:bg-neutral-300">
                  {busy ? 'Checking…' : 'Turn on authenticator'}
                </button>
              </form>
            </>
          )}

          {backupCodes && (
            <>
              <div className="grid grid-cols-2 gap-2 font-mono font-bold text-sm">
                {backupCodes.map(c => <div key={c} className="rounded-lg border border-neutral-300 px-3 py-2 text-center select-all">{c}</div>)}
              </div>
              <div className="flex gap-2">
                <button onClick={() => copy(backupCodes.join('\n'), 'codes')} className="flex-1 border border-black rounded-full py-2.5 text-sm font-bold">{copied === 'codes' ? 'Copied' : 'Copy all'}</button>
                <button onClick={finish} className="flex-1 bg-black text-white rounded-full py-2.5 text-sm font-bold">I have saved them</button>
              </div>
              <p className="text-xs text-neutral-500">These codes are shown once. We cannot show them again.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthenticatorModal;
