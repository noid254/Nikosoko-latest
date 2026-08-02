import React from 'react';
import { ServiceProvider } from '../types';

interface DesktopBannerLayoutProps {
  children: React.ReactNode;
  currentUser: ServiceProvider | null;
  onOpenSignUp: () => void;
  onOpenLogin: () => void;
}

const DesktopBannerLayout: React.FC<DesktopBannerLayoutProps> = ({
  children,
  currentUser,
  onOpenSignUp,
  onOpenLogin
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col lg:flex-row overflow-x-hidden">
      {/* PC / Desktop Banner Encouraging Sign-up to Trade Skills & Time */}
      <aside className="hidden lg:flex lg:w-[460px] xl:w-[540px] 2xl:w-[620px] shrink-0 bg-gradient-to-br from-slate-900 via-brand-navy to-slate-950 text-white p-8 xl:p-12 flex-col justify-between border-r border-slate-800/80 relative overflow-hidden shadow-2xl">
        {/* Glow Accents */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Logo */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20 font-black text-black">
              🏪
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white block">
                Niko<span className="text-amber-400">Soko</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Hyperlocal Skill & Service Marketplace
              </span>
            </div>
          </div>

          {/* Hero Banner Message */}
          <div className="space-y-4 pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <span>⚡</span> Trade Your Skill & Time For Money
            </div>

            <h1 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight text-white">
              Turn Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-teal-200">Skills & Time</span> Into Daily Income.
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed font-medium">
              Join thousands of skilled artisans, technicians, and service providers on NikoSoko. Create your profile, list your rates, and get booked by nearby clients with zero commission!
            </p>
          </div>

          {/* Value Propositions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <span className="text-xl p-1.5 bg-amber-400/10 rounded-xl">🛠️</span>
              <div>
                <h4 className="text-xs font-bold text-white">Monetize Any Skill</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">TV mounting, gas delivery, plumbing, electrical, braiding & more.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <span className="text-xl p-1.5 bg-emerald-400/10 rounded-xl">💸</span>
              <div>
                <h4 className="text-xs font-bold text-white">0% Commission</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Keep 100% of your money paid directly via M-Pesa or cash.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <span className="text-xl p-1.5 bg-blue-400/10 rounded-xl">📍</span>
              <div>
                <h4 className="text-xs font-bold text-white">Hyperlocal Discovery</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Get discovered by nearby customers searching for your skills in real time.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <span className="text-xl p-1.5 bg-purple-400/10 rounded-xl">🛡️</span>
              <div>
                <h4 className="text-xs font-bold text-white">Sacco & ID Verified</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Build trust with verified badges, door profiles & digital gate passes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 space-y-4">
          {!currentUser ? (
            <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 p-5 rounded-3xl text-slate-950 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-950">Ready to start earning?</span>
                <span className="text-[10px] font-black bg-black/20 text-slate-950 px-2.5 py-0.5 rounded-full">100% Free Signup</span>
              </div>
              <p className="text-xs font-bold text-slate-900 leading-snug">
                Create your NikoSoko profile now to start trading your time and skill for money today!
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={onOpenSignUp}
                  className="flex-1 bg-slate-950 text-white font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider hover:bg-slate-900 transition-all shadow-md active:scale-95 cursor-pointer text-center"
                >
                  🚀 Sign Up & Start Trading
                </button>
                <button
                  onClick={onOpenLogin}
                  className="bg-slate-900/20 hover:bg-slate-900/30 text-slate-950 font-black py-3 px-3 rounded-xl text-xs transition-all cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🟢</span>
                <div>
                  <span className="text-xs font-black text-white block">Logged in as {currentUser.name}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Your provider profile is live & active</span>
                </div>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-black px-2.5 py-1 rounded-lg">Online</span>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span>© NikoSoko PWA Platform</span>
            <span>Hyperlocal Trade Network</span>
          </div>
        </div>
      </aside>

      {/* Default Mobile View (Framed centered mobile view on desktop PC) */}
      <main className="flex-1 min-h-screen bg-slate-900 flex justify-center items-start overflow-y-auto">
        <div className="w-full max-w-md min-h-screen bg-white shadow-2xl relative flex flex-col lg:border-x border-slate-800">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DesktopBannerLayout;
