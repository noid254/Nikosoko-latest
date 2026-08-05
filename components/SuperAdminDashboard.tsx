
import React, { useState } from 'react';
import type { ServiceProvider, SpecialBanner, Premise, CatalogueItem } from '../types';

import DashboardPage from './admin/DashboardPage';
import UsersPage from './admin/UsersPage';
import AnalyticsPage from './admin/AnalyticsPage';
import AppearancePage from './admin/AppearancePage';
import BroadcastPage from './admin/BroadcastPage';
import CategoriesPage from './admin/CategoriesPage';
import OrganizationsPage from './admin/OrganizationsPage';
import PropertiesPage from './admin/PropertiesPage';

import CatalogueAdminPage from './admin/CatalogueAdminPage';

interface SuperAdminDashboardProps {
    onBack: () => void;
    providers: ServiceProvider[];
    onUpdateProvider: (provider: ServiceProvider) => void;
    onDeleteProvider: (providerId: string) => void;
    onViewProvider: (provider: ServiceProvider) => void;
    categories: string[];
    onAddCategory: (name: string) => void;
    onDeleteCategory: (name:string) => void;
    onBroadcast: (message: string, filters: Record<string, string>) => void;
    initialPage?: AdminPage;
    specialBanners: SpecialBanner[];
    onAddBanner: (banner: Omit<SpecialBanner, 'id'>) => void;
    onDeleteBanner: (bannerId: string) => void;
    onCreateOrganization: (orgData: any) => void;
    onApproveRequest: (orgId: string, userId: string) => void;
    onRejectRequest: (orgId: string, userId: string) => void;
    premises: Premise[];
    onUpdatePremise: (premise: Premise) => void;
    catalogueItems?: CatalogueItem[];
    onVerifyCatalogueItem?: (itemId: string, isVerified: boolean) => void;
    onDeleteCatalogueItem?: (itemId: string) => void;
}

export type AdminPage = 'Dashboard' | 'Users' | 'Catalogue' | 'Organizations' | 'Properties' | 'Analytics' | 'Appearance' | 'Broadcast' | 'Categories';

// Icons
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0012 12a5.995 5.995 0 00-3-5.197M15 21a9 9 0 00-3-5.197" /></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const MegaphoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.514C18.118 1.94 18 2.684 18 3.5A3.5 3.5 0 0114.5 7H11" /></svg>;
const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 8v-5z" /></svg>;
const PaintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>;
const OrgIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>;


const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = (props) => {
    const { onBack, providers, initialPage } = props;
    const [activePage, setActivePage] = useState<AdminPage>(initialPage || 'Dashboard');
    
    const renderPage = () => {
        switch (activePage) {
            case 'Dashboard':
                return <DashboardPage 
                    providers={providers} 
                    onSwitchPage={setActivePage} 
                    onViewProvider={props.onViewProvider}
                    onUpdateProvider={props.onUpdateProvider}
                />;
            case 'Users':
                return <UsersPage 
                    providers={props.providers} 
                    onViewProvider={props.onViewProvider} 
                    onUpdateProvider={props.onUpdateProvider} 
                    onDeleteProvider={props.onDeleteProvider} 
                />;
            case 'Catalogue':
                return <CatalogueAdminPage
                    catalogueItems={props.catalogueItems || []}
                    providers={props.providers}
                    onVerifyItem={props.onVerifyCatalogueItem || (() => {})}
                    onDeleteItem={props.onDeleteCatalogueItem}
                />;
            case 'Analytics':
                return <AnalyticsPage providers={props.providers} />;
            case 'Organizations':
                return <OrganizationsPage 
                    providers={props.providers}
                    onCreate={props.onCreateOrganization}
                    onApproveRequest={props.onApproveRequest}
                    onRejectRequest={props.onRejectRequest}
                />;
            case 'Properties':
                return <PropertiesPage 
                    premises={props.premises}
                    onUpdatePremise={props.onUpdatePremise}
                />;
            case 'Appearance':
                return <AppearancePage 
                    categories={props.categories}
                    specialBanners={props.specialBanners}
                    onAddBanner={props.onAddBanner}
                    onDeleteBanner={props.onDeleteBanner}
                />;
            case 'Broadcast':
                return <BroadcastPage 
                    onBroadcast={props.onBroadcast}
                    providers={props.providers}
                    categories={props.categories}
                />;
            case 'Categories':
                return <CategoriesPage 
                    categories={props.categories}
                    onAddCategory={props.onAddCategory}
                    onDeleteCategory={props.onDeleteCategory}
                />;
            default: return null;
        }
    }

    const navItems: { page: AdminPage, icon: React.ReactNode }[] = [
        { page: 'Dashboard', icon: <HomeIcon/> },
        { page: 'Users', icon: <UsersIcon/> },
        { page: 'Catalogue', icon: <TagIcon/> },
        { page: 'Organizations', icon: <OrgIcon/> },
        { page: 'Properties', icon: <BuildingIcon/> },
        { page: 'Analytics', icon: <ChartIcon/> },
        { page: 'Appearance', icon: <PaintIcon/> },
        { page: 'Broadcast', icon: <MegaphoneIcon/> },
        { page: 'Categories', icon: <TagIcon/> }
    ];

    return (
        <div className="bg-slate-100 min-h-screen font-sans flex flex-col md:flex-row">
            {/* High-Contrast PC Sidebar */}
            <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col justify-between border-r border-slate-800">
                <div>
                    <div className="p-5 flex items-center justify-between border-b border-slate-800 bg-slate-950">
                        <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
                                👑
                            </span>
                            <div>
                                <h1 className="text-base font-black text-white tracking-tight leading-none">Admin Console</h1>
                                <p className="text-[10px] text-slate-400 font-mono mt-1">v1.2 • Super Admin</p>
                            </div>
                        </div>
                        <button onClick={onBack} className="md:hidden text-slate-400 hover:text-white p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <nav className="p-4 space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-1.5">Navigation Hub</p>
                        <ul>
                            {navItems.map(item => {
                                const isActive = activePage === item.page;
                                return (
                                    <li key={item.page} className="mb-1">
                                        <button
                                            onClick={() => setActivePage(item.page)}
                                            className={`w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                                isActive
                                                    ? 'bg-amber-400 text-slate-950 shadow-md transform translate-x-1'
                                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                            }`}
                                        >
                                            <span className={isActive ? 'text-slate-950' : 'text-slate-400'}>{item.icon}</span>
                                            <span>{item.page}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-950/50">
                    <button
                        onClick={onBack}
                        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                    >
                        <span>Exit Admin Console</span>
                        <span>&rarr;</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Viewport */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b-2 border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Section:</span>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{activePage}</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            System Live • PC Interface
                        </div>
                        <button
                            onClick={onBack}
                            className="hidden md:flex items-center gap-2 text-xs font-black text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                        >
                            Return to App &rarr;
                        </button>
                    </div>
                </header>
                <main className="flex-1 p-6 overflow-y-auto bg-slate-100">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {renderPage()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
