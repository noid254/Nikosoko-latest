
import React, { useState } from 'react';
import type { ServiceProvider, CatalogueItem, AppBrandingConfig } from '../types';

import DashboardPage from './admin/DashboardPage';
import UsersPage from './admin/UsersPage';
import AnalyticsPage from './admin/AnalyticsPage';
import AppearancePage from './admin/AppearancePage';
import BroadcastPage from './admin/BroadcastPage';
import CategoriesPage from './admin/CategoriesPage';
import OrganizationsPage from './admin/OrganizationsPage';
import CatalogueAdminPage from './admin/CatalogueAdminPage';
import EmailSettingsPage from './admin/EmailSettingsPage';
import BannersPage from './admin/BannersPage';

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
    onCreateOrganization: (orgData: any) => void;
    onApproveRequest: (orgId: string, userId: string) => void;
    onRejectRequest: (orgId: string, userId: string) => void;
    catalogueItems?: CatalogueItem[];
    onVerifyCatalogueItem?: (itemId: string, isVerified: boolean) => void;
    onDeleteCatalogueItem?: (itemId: string) => void;
    brandingConfig?: AppBrandingConfig;
    onSaveBrandingConfig?: (config: AppBrandingConfig) => void;
}

export type AdminPage = 'Dashboard' | 'Users' | 'Catalogue' | 'Organizations' | 'Analytics' | 'Appearance' | 'Banners' | 'Broadcast' | 'Categories' | 'Email & OTP';

const Icon: React.FC<{ d: string }> = ({ d }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const ICONS: Record<AdminPage, string> = {
    'Dashboard': 'M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6V11h-6v9zm0-16v5h6V4h-6z',
    'Users': 'M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 20a8 8 0 0116 0',
    'Catalogue': 'M4 6h16M4 12h16M4 18h10',
    'Organizations': 'M4 21V5a1 1 0 011-1h8a1 1 0 011 1v16M14 9h5a1 1 0 011 1v11M8 8h2M8 12h2M8 16h2',
    'Analytics': 'M5 20V10M12 20V4M19 20v-7',
    'Appearance': 'M12 3a9 9 0 100 18c1.1 0 1.5-.8 1.2-1.6-.4-1 .3-2.4 1.6-2.4H17a4 4 0 004-4c0-5-4-10-9-10z',
    'Banners': 'M3 5h18v10H3zM8 19h8M12 15v4',
    'Broadcast': 'M4 12l16-7v14L4 12zm4 1v5',
    'Categories': 'M7 7h.01M3 5v5.6c0 .5.2 1 .6 1.4l8 8a2 2 0 002.8 0l5.6-5.6a2 2 0 000-2.8l-8-8A2 2 0 0010.6 3H5a2 2 0 00-2 2z',
    'Email & OTP': 'M3 7l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
};

const NAV_GROUPS: { label: string; pages: AdminPage[] }[] = [
    { label: 'Overview', pages: ['Dashboard', 'Analytics'] },
    { label: 'People and listings', pages: ['Users', 'Organizations', 'Catalogue', 'Categories'] },
    { label: 'Reach', pages: ['Banners', 'Broadcast', 'Appearance'] },
    { label: 'System', pages: ['Email & OTP'] },
];

const PAGE_TITLES: Record<AdminPage, string> = {
    'Dashboard': 'Overview', 'Users': 'People', 'Catalogue': 'Catalogue', 'Organizations': 'Organizations',
    'Analytics': 'Analytics', 'Appearance': 'Appearance', 'Banners': 'Location banners', 'Broadcast': 'Broadcast',
    'Categories': 'Categories', 'Email & OTP': 'Email and OTP',
};

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = (props) => {
    const { onBack, providers, initialPage } = props;
    const [activePage, setActivePage] = useState<AdminPage>(initialPage || 'Dashboard');

    const renderPage = () => {
        switch (activePage) {
            case 'Dashboard':
                return <DashboardPage providers={providers} onSwitchPage={setActivePage} onViewProvider={props.onViewProvider} onUpdateProvider={props.onUpdateProvider} />;
            case 'Users':
                return <UsersPage providers={props.providers} onViewProvider={props.onViewProvider} onUpdateProvider={props.onUpdateProvider} onDeleteProvider={props.onDeleteProvider} isSuperAdmin={true} />;
            case 'Catalogue':
                return <CatalogueAdminPage catalogueItems={props.catalogueItems || []} providers={props.providers} onVerifyItem={props.onVerifyCatalogueItem || (() => {})} onDeleteItem={props.onDeleteCatalogueItem} />;
            case 'Analytics':
                return <AnalyticsPage providers={props.providers} />;
            case 'Organizations':
                return <OrganizationsPage providers={props.providers} onCreate={props.onCreateOrganization} onApproveRequest={props.onApproveRequest} onRejectRequest={props.onRejectRequest} />;
            case 'Appearance':
                return <AppearancePage brandingConfig={props.brandingConfig} onSaveBrandingConfig={props.onSaveBrandingConfig} />;
            case 'Banners':
                return <BannersPage />;
            case 'Broadcast':
                return <BroadcastPage onBroadcast={props.onBroadcast} providers={props.providers} categories={props.categories} />;
            case 'Categories':
                return <CategoriesPage categories={props.categories} onAddCategory={props.onAddCategory} onDeleteCategory={props.onDeleteCategory} />;
            case 'Email & OTP':
                return <EmailSettingsPage />;
            default: return null;
        }
    };

    const today = new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="min-h-screen bg-[#F3F5F3] text-[#14211C] flex" style={{ fontFamily: "'IBM Plex Sans', 'Inter', system-ui, sans-serif" }}>
            <aside className="hidden md:flex w-[248px] shrink-0 flex-col bg-[#10201A] text-[#C9D6CF] sticky top-0 h-screen">
                <div className="px-6 pt-7 pb-6">
                    <p className="text-[19px] font-semibold tracking-tight text-white">NikoSoko</p>
                    <p className="text-xs text-[#7F948A] mt-0.5">Admin console</p>
                </div>
                <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Admin sections">
                    {NAV_GROUPS.map(group => (
                        <div key={group.label} className="mb-5">
                            <p className="px-3 mb-1.5 text-xs text-[#6F857B]">{group.label}</p>
                            <ul>
                                {group.pages.map(page => {
                                    const active = activePage === page;
                                    return (
                                        <li key={page}>
                                            <button
                                                onClick={() => setActivePage(page)}
                                                aria-current={active ? 'page' : undefined}
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5FD3A6] ${active ? 'bg-[#1C3A2F] text-white font-medium' : 'hover:bg-[#162B23] hover:text-white'}`}
                                            >
                                                <span className={active ? 'text-[#5FD3A6]' : 'text-[#7F948A]'}><Icon d={ICONS[page]} /></span>
                                                {PAGE_TITLES[page]}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>
                <div className="p-4 border-t border-[#1E352B]">
                    <button onClick={onBack} className="w-full text-sm text-[#C9D6CF] hover:text-white hover:bg-[#162B23] rounded-md px-3 py-2 text-left transition-colors">Back to the app</button>
                </div>
            </aside>

            <div className="flex-1 min-w-0 flex flex-col">
                <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-[#E3E7E3] px-8 h-16 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight leading-none">{PAGE_TITLES[activePage]}</h1>
                        <p className="text-xs text-[#5F6E66] mt-1">{today}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            className="md:hidden border border-[#D9DFDA] rounded-md text-sm px-2 py-1.5"
                            value={activePage}
                            onChange={e => setActivePage(e.target.value as AdminPage)}
                            aria-label="Section"
                        >
                            {NAV_GROUPS.flatMap(g => g.pages).map(p => <option key={p} value={p}>{PAGE_TITLES[p]}</option>)}
                        </select>
                        <button onClick={onBack} className="text-sm font-medium border border-[#D9DFDA] hover:bg-[#F3F5F3] rounded-md px-3.5 py-1.5 transition-colors">Back to the app</button>
                    </div>
                </header>
                <main className="flex-1 px-8 py-8">
                    <div className="max-w-[1400px] mx-auto space-y-6">{renderPage()}</div>
                </main>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
