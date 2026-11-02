import React from 'react';

export const GREEN = '#22C27A';

export const Shell: React.FC<{ title: string; onBack: () => void; children: React.ReactNode }> = ({ title, onBack, children }) => (
  <div className="min-h-screen bg-neutral-50 text-black">
    <header className="bg-black text-white px-3 py-3 flex items-center gap-2 sticky top-0 z-30">
      <button onClick={onBack} aria-label="Back" className="p-1.5 cursor-pointer">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <h1 className="font-black tracking-tight text-lg">{title}</h1>
    </header>
    <div className="px-3 py-4 pb-24 max-w-xl mx-auto">{children}</div>
  </div>
);

export const SignInPrompt: React.FC<{ what: string; onSignIn: () => void }> = ({ what, onSignIn }) => (
  <div className="rounded-2xl bg-black text-white p-6 text-center">
    <p className="font-bold">Sign in to use {what}</p>
    <p className="text-white/60 text-sm mt-1">We confirm your phone number first.</p>
    <button onClick={onSignIn} className="mt-4 px-6 py-3 rounded-xl font-black text-black cursor-pointer" style={{ background: GREEN }}>Sign in</button>
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white border border-neutral-200 rounded-2xl p-4 ${className}`}>{children}</div>
);

export const Field: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...p }) => (
  <label className="block mt-3">
    <span className="text-[11px] font-black uppercase tracking-wider text-neutral-500">{label}</span>
    <input {...p} className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-3 text-base outline-none focus:border-black" />
  </label>
);

export const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'dark' | 'green' | 'line' }> = ({ tone = 'dark', className = '', ...p }) => (
  <button {...p} className={`px-4 py-3 rounded-xl font-black text-sm cursor-pointer disabled:opacity-50 ${tone === 'dark' ? 'bg-black text-white' : tone === 'green' ? 'text-black' : 'border border-neutral-300 bg-white'} ${className}`}
    style={tone === 'green' ? { background: GREEN } : undefined} />
);

export const Tabs: React.FC<{ tabs: string[]; value: string; onChange: (t: string) => void }> = ({ tabs, value, onChange }) => (
  <div className="flex gap-1 p-1 rounded-xl bg-neutral-200 mb-4 overflow-x-auto no-scrollbar">
    {tabs.map(t => (
      <button key={t} onClick={() => onChange(t)} className={`flex-1 whitespace-nowrap px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer ${value === t ? 'bg-black text-white' : 'text-neutral-600'}`}>{t}</button>
    ))}
  </div>
);

export const Err: React.FC<{ msg: string }> = ({ msg }) => (msg ? <p className="mt-3 text-sm font-semibold text-red-700">{msg}</p> : null);

export const copy = async (text: string) => { try { await navigator.clipboard.writeText(text); return true; } catch { return false; } };
