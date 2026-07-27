
import React from 'react';
import type { CurrentPage } from '../types';

interface ToolAction {
    label: string;
    icon: string;
    page: CurrentPage;
    color: string;
}

interface MyToolkitProps {
    // Added missing props to match usage in App.tsx
    allTools: any[];
    selectedTools: CurrentPage[];
    onSave: (tools: CurrentPage[]) => void;
    onNavigate: (page: CurrentPage) => void;
    onBack: () => void;
}

const TOOLS: ToolAction[] = [
    { label: 'Qaribu', icon: '🔑', page: 'qaribu', color: 'bg-emerald-600' },
    { label: 'Nikosoko', icon: '🏠', page: 'home', color: 'bg-brand-navy' },
    { label: 'My Places', icon: '🏢', page: 'myplaces', color: 'bg-brand-navy' },
    { label: 'My Journey', icon: '🚀', page: 'journey', color: 'bg-brand-gold' },
];

const MyToolkit: React.FC<MyToolkitProps> = ({ onNavigate, onBack }) => {
    return (
        <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
            <header className="p-4 bg-white shadow-sm flex items-center gap-4 sticky top-0 z-10 border-b border-gray-100">
                <button onClick={onBack} className="text-gray-600 hover:text-gray-900 active:scale-90 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-xl font-black text-brand-navy uppercase tracking-tight">Toolkit</h1>
            </header>
            
            <main className="p-5 flex-1 overflow-y-auto no-scrollbar">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8 text-center">Essential Neighborhood Tools</p>
                
                <div className="grid grid-cols-2 gap-4">
                    {TOOLS.map(tool => (
                        <button 
                            key={tool.page}
                            onClick={() => onNavigate(tool.page)}
                            className="bg-white p-6 rounded-[32px] shadow-sm hover:shadow-xl transition-all flex flex-col items-center justify-center aspect-square border border-gray-50 active:scale-95 group"
                        >
                            <div className={`w-14 h-14 ${tool.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform mb-3`}>
                                {tool.icon}
                            </div>
                            <span className="text-xs font-black text-brand-navy uppercase tracking-widest">{tool.label}</span>
                        </button>
                    ))}
                </div>
            </main>

            <footer className="p-6 bg-white border-t border-gray-100 text-center">
                 <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">Customize tools coming soon</p>
            </footer>
        </div>
    );
};

export default MyToolkit;
