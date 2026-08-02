import React, { useState } from 'react';
import type { ServiceProvider, CurrentPage } from '../types';

export interface SkillCert {
    id: string;
    skillTitle: string;
    category: 'Electrical' | 'Plumbing' | 'Transport/Boda' | 'Mechanic' | 'Construction' | 'Technology' | 'Other';
    certificationName: string;
    issuingSchool: string;
    yearObtained: string;
    hourlyRate: number;
    currency: string;
    description: string;
    certificateImageUrl?: string;
    portfolioImages: string[];
    verificationStatus?: 'verified' | 'pending' | 'unverified';
    licenseNumber?: string;
}

interface LocationHotspot {
    areaName: string;
    searchCountWeekly: number;
    demandLevel: 'EXTREME' | 'HIGH' | 'MODERATE' | 'SURGING';
    avgBudget: string;
    peakHours: string;
    heatPercentage: number;
    topQuery: string;
}

interface SkillHeatMapData {
    skillCategory: string;
    totalSearchesWeekly: number;
    growthRate: string;
    hotspots: LocationHotspot[];
    topSearchQueries: { query: string; count: number; surge: string }[];
}

const HEATMAP_DATABASE: Record<string, SkillHeatMapData> = {
    'Electrical': {
        skillCategory: 'Electrical & Solar',
        totalSearchesWeekly: 1420,
        growthRate: '+185% search surge',
        hotspots: [
            { areaName: 'Kilimani & Lavington', searchCountWeekly: 420, demandLevel: 'EXTREME', avgBudget: 'KES 3,500/day', peakHours: '8:00 AM - 12:00 PM', heatPercentage: 95, topQuery: 'solar inverter wiring near me' },
            { areaName: 'Westlands & Parklands', searchCountWeekly: 380, demandLevel: 'EXTREME', avgBudget: 'KES 4,000/day', peakHours: '1:00 PM - 5:00 PM', heatPercentage: 88, topQuery: 'emergency electrical fault repair' },
            { areaName: 'Thika Road (Ruiru / Juja)', searchCountWeekly: 310, demandLevel: 'HIGH', avgBudget: 'KES 2,500/day', peakHours: 'Weekends 9:00 AM', heatPercentage: 75, topQuery: 'house wiring epra certified' },
            { areaName: 'Karen & Langata', searchCountWeekly: 310, demandLevel: 'SURGING', avgBudget: 'KES 4,500/day', peakHours: 'Mornings 7:00 AM', heatPercentage: 70, topQuery: 'backup generator connection' }
        ],
        topSearchQueries: [
            { query: 'EPRA Solar Inverter Installer', count: 340, surge: '+210%' },
            { query: 'Circuit Breaker Tripping Fix', count: 280, surge: '+140%' },
            { query: 'EV Charger Installation Nairobi', count: 210, surge: '+310%' },
            { query: '3-Phase Power System Tech', count: 180, surge: '+95%' }
        ]
    },
    'Plumbing': {
        skillCategory: 'Plumbing & Drainage',
        totalSearchesWeekly: 980,
        growthRate: '+120% search surge',
        hotspots: [
            { areaName: 'Eastlands (Donholm / Buruburu)', searchCountWeekly: 310, demandLevel: 'EXTREME', avgBudget: 'KES 2,200/day', peakHours: '6:00 AM - 10:00 AM', heatPercentage: 92, topQuery: 'burst pipe repair plumber' },
            { areaName: 'Syokimau & Kitengela', searchCountWeekly: 270, demandLevel: 'HIGH', avgBudget: 'KES 2,800/day', peakHours: 'Weekends 8:00 AM', heatPercentage: 80, topQuery: 'borehole pump installation' },
            { areaName: 'Kasarani & Roysambu', searchCountWeekly: 240, demandLevel: 'HIGH', avgBudget: 'KES 2,000/day', peakHours: 'Evenings 5:00 PM', heatPercentage: 72, topQuery: 'instant shower heater installation' },
            { areaName: 'Gigiri & Runda', searchCountWeekly: 160, demandLevel: 'SURGING', avgBudget: 'KES 4,000/day', peakHours: '10:00 AM - 3:00 PM', heatPercentage: 65, topQuery: 'solar water heater plumbing' }
        ],
        topSearchQueries: [
            { query: 'Instant Shower Wiring & Fitting', count: 290, surge: '+160%' },
            { query: 'Sewer Line Unblocking Service', count: 250, surge: '+110%' },
            { query: 'Water Tank Booster Pump Fix', count: 190, surge: '+190%' }
        ]
    },
    'Transport/Boda': {
        skillCategory: 'Transport & Boda EV',
        totalSearchesWeekly: 1850,
        growthRate: '+240% search surge',
        hotspots: [
            { areaName: 'CBD & Industrial Area', searchCountWeekly: 650, demandLevel: 'EXTREME', avgBudget: 'KES 1,800/task', peakHours: '7:00 AM - 7:00 PM', heatPercentage: 98, topQuery: 'express parcel boda rider' },
            { areaName: 'Upperhill & Kilimani', searchCountWeekly: 480, demandLevel: 'EXTREME', avgBudget: 'KES 2,000/task', peakHours: '11:00 AM - 3:00 PM', heatPercentage: 90, topQuery: 'corporate document delivery' },
            { areaName: 'Ngong Road & Dagoretti', searchCountWeekly: 410, demandLevel: 'HIGH', avgBudget: 'KES 1,500/task', peakHours: 'Mornings & Evenings', heatPercentage: 78, topQuery: 'electric boda battery swap rider' }
        ],
        topSearchQueries: [
            { query: 'Dedicated Errand Rider Nairobi', count: 410, surge: '+280%' },
            { query: 'EV Scooter Technician', count: 310, surge: '+350%' },
            { query: 'Heavy Luggage Carrier Boda', count: 220, surge: '+90%' }
        ]
    },
    'Other': {
        skillCategory: 'Specialist Agriculture & Custom Skills',
        totalSearchesWeekly: 760,
        growthRate: '+190% search surge',
        hotspots: [
            { areaName: 'Kajiado & Kitengela Farms', searchCountWeekly: 280, demandLevel: 'EXTREME', avgBudget: 'KES 3,500/day', peakHours: '6:00 AM - 11:00 AM', heatPercentage: 94, topQuery: 'beehive honey harvesting expert' },
            { areaName: 'Ruiru & Juja Agricultural Zone', searchCountWeekly: 220, demandLevel: 'HIGH', avgBudget: 'KES 4,000/day', peakHours: 'Mornings 7:00 AM', heatPercentage: 82, topQuery: 'farm tractor ploughing service' },
            { areaName: 'Naivasha & Limuru Corridor', searchCountWeekly: 160, demandLevel: 'SURGING', avgBudget: 'KES 4,500/day', peakHours: 'Weekends', heatPercentage: 70, topQuery: 'greenhouse setup technician' }
        ],
        topSearchQueries: [
            { query: 'Honey Extractor & Centrifuge Operator', count: 210, surge: '+230%' },
            { query: 'Disc Plough Tractor Driver', count: 190, surge: '+170%' },
            { query: 'Drip Irrigation System Installer', count: 160, surge: '+150%' }
        ]
    }
};

interface UpskillRecommendation {
    id: string;
    currentCategory: string;
    recommendedSkill: string;
    potentialRateIncrease: string;
    additionalHoursPerWeek: number;
    estimatedCost: string;
    duration: string;
    accreditedSchools: string[];
    description: string;
    isEnrolled?: boolean;
}

const UPSKILL_RECOMMENDATIONS: UpskillRecommendation[] = [
    {
        id: 'up-1',
        currentCategory: 'Electrical',
        recommendedSkill: 'EV Scooter Battery & Swapping Station Tech',
        potentialRateIncrease: '+KES 1,200/day',
        additionalHoursPerWeek: 18,
        estimatedCost: 'KES 8,500',
        duration: '2 Weeks (Weekend Classes)',
        accreditedSchools: ['NITA Kenya (Nairobi)', 'KITI Nakuru', 'East Africa Institute of Tech'],
        description: 'Learn electric motorcycle lithium battery health diagnostics, controller mapping, and battery swapping station maintenance to capture rapid EV fleet growth.'
    },
    {
        id: 'up-2',
        currentCategory: 'Electrical',
        recommendedSkill: 'Solar PV Inverter & Grid-Tie Systems',
        potentialRateIncrease: '+KES 1,500/day',
        additionalHoursPerWeek: 22,
        estimatedCost: 'KES 12,000',
        duration: '3 Weeks (Evening / Hybrid)',
        accreditedSchools: ['Strathmore Energy Research Centre', 'NITA Kenya', 'PC Kinyanjui TVET'],
        description: 'Upgrade your Class T2 to T3 EPRA certification. Master solar hybrid inverters, lithium bank sizing, and remote telemetry monitoring.'
    },
    {
        id: 'up-3',
        currentCategory: 'Plumbing',
        recommendedSkill: 'Solar Water Heating & Pressurized Plumbing',
        potentialRateIncrease: '+KES 1,000/day',
        additionalHoursPerWeek: 15,
        estimatedCost: 'KES 7,000',
        duration: '2 Weeks',
        accreditedSchools: ['Kabete National Polytechnic', 'Kiambu Inst of Science & Tech'],
        description: 'Combine plumbing with renewable energy. Install thermosiphon solar water collectors, pressure valves, and circulation pumps for residential homes.'
    },
    {
        id: 'up-4',
        currentCategory: 'Other',
        recommendedSkill: 'Drip Irrigation & Automated Farm Sensors',
        potentialRateIncrease: '+KES 1,800/day',
        additionalHoursPerWeek: 20,
        estimatedCost: 'KES 9,000',
        duration: '2 Weeks',
        accreditedSchools: ['Baraton TVET', 'KALRO Training Center', 'JJKUAT Extension Unit'],
        description: 'Expand farm services from bee/tractor work into automated drip systems, solar water pumps, and smart soil moisture monitoring.'
    }
];

interface SkillDashboardProps {
    currentUser: ServiceProvider | null;
    onBack: () => void;
    onNavigate: (page: CurrentPage) => void;
    onUpdateUser?: (updated: ServiceProvider) => void;
    onBookProvider?: (provider: ServiceProvider) => void;
}

const SkillDashboard: React.FC<SkillDashboardProps> = ({ currentUser, onBack, onNavigate, onUpdateUser, onBookProvider }) => {
    // Active Tab in $kill Hub
    const [activeTab, setActiveTab] = useState<'skills' | 'heatmap' | 'upskill'>('skills');

    // Initial user skills from currentUser or default multi-skill profiles
    const [userSkills, setUserSkills] = useState<SkillCert[]>(() => {
        if (currentUser?.skills && (currentUser.skills as any[]).length > 0) {
            return currentUser.skills as any[];
        }
        return [
            {
                id: 'sk-1',
                skillTitle: 'Beehive & Honey Harvesting Services',
                category: 'Other',
                certificationName: 'Beekeeping & Apiary Management Cert',
                issuingSchool: 'Baraton TVET / KALRO Apiary Unit',
                yearObtained: '2023',
                hourlyRate: 2500,
                currency: 'KES',
                description: 'Professional honey harvesting with protective suits, smoke pumps, centrifuges, and hive maintenance kits.',
                portfolioImages: [
                    'https://images.unsplash.com/photo-1587049352847-4a222e784d38?q=80&w=600',
                    'https://images.unsplash.com/photo-1587049352851-8d4e89133924?q=80&w=600'
                ],
                verificationStatus: 'verified',
                licenseNumber: 'KALRO-AP-88421'
            },
            {
                id: 'sk-2',
                skillTitle: 'Tractor Ploughing & Land Preparation',
                category: 'Construction',
                certificationName: 'Heavy Machinery & Tractor Operation Licence',
                issuingSchool: 'KITI Kenya (Kenya Industrial Training Inst.)',
                yearObtained: '2022',
                hourlyRate: 3500,
                currency: 'KES',
                description: 'Tractor operator equipped for commercial farm land tilling, disc ploughing, rotavator preparation, and harvesting logistics.',
                portfolioImages: [
                    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600',
                    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=600'
                ],
                verificationStatus: 'verified',
                licenseNumber: 'KITI-HM-2022-99'
            },
            {
                id: 'sk-3',
                skillTitle: currentUser?.service || 'EPRA Certified Solar & Inverter Technician',
                category: 'Electrical',
                certificationName: 'EPRA Class T3 Electrical License',
                issuingSchool: 'NITA Kenya',
                yearObtained: '2023',
                hourlyRate: currentUser?.hourlyRate || 1500,
                currency: 'KES',
                description: currentUser?.about || 'Specializing in residential wiring, solar inverter hookups, circuit breakers, and electrical fault detection.',
                portfolioImages: currentUser?.works?.length ? currentUser.works : [
                    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600'
                ],
                verificationStatus: 'verified',
                licenseNumber: 'EPRA/T3/10492'
            }
        ];
    });

    // Selected skill for Heatmap view
    const [heatmapSkillCategory, setHeatmapSkillCategory] = useState<string>('Electrical');

    // Selected Skill PDP
    const [selectedSkillPDP, setSelectedSkillPDP] = useState<SkillCert | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSkill, setEditingSkill] = useState<SkillCert | null>(null);

    // Verification Modal
    const [verifyingSkill, setVerifyingSkill] = useState<SkillCert | null>(null);
    const [verifLicence, setVerifLicence] = useState('');
    const [verifCertUrl, setVerifCertUrl] = useState('');

    // Form fields for adding/editing skill
    const [newTitle, setNewTitle] = useState('');
    const [newCategory, setNewCategory] = useState<SkillCert['category']>('Electrical');
    const [newCertName, setNewCertName] = useState('');
    const [newSchool, setNewSchool] = useState('');
    const [newYear, setNewYear] = useState('2024');
    const [newRate, setNewRate] = useState('1500');
    const [newDesc, setNewDesc] = useState('');
    const [newImage, setNewImage] = useState('');
    const [newLicenseNo, setNewLicenseNo] = useState('');

    const [savedToast, setSavedToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('$kill Hub Updated Successfully!');

    // Enrolled Courses Tracking
    const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

    const handleSaveAllSkills = () => {
        if (currentUser && onUpdateUser) {
            onUpdateUser({
                ...currentUser,
                skills: userSkills as any
            });
        }
        setToastMessage('💾 $kill Hub Saved Successfully!');
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2500);
    };

    const handleAddSkill = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newCertName.trim()) return;

        const newSkillItem: SkillCert = {
            id: `sk-${Date.now()}`,
            skillTitle: newTitle,
            category: newCategory,
            certificationName: newCertName,
            issuingSchool: newSchool || 'Accredited Institution',
            yearObtained: newYear,
            hourlyRate: parseFloat(newRate) || 1000,
            currency: 'KES',
            description: newDesc || 'Verified practical skill listed on $kill Hub.',
            portfolioImages: newImage.trim() ? [newImage.trim()] : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600'],
            verificationStatus: newLicenseNo.trim() ? 'verified' : 'unverified',
            licenseNumber: newLicenseNo.trim() || undefined
        };

        const updated = [newSkillItem, ...userSkills];
        setUserSkills(updated);
        if (currentUser && onUpdateUser) {
            onUpdateUser({
                ...currentUser,
                skills: updated as any
            });
        }
        setShowAddModal(false);
        resetForm();
        setToastMessage('⚡ New Skill Added to $kill Hub!');
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2500);
    };

    const handleEditSkill = (skill: SkillCert, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingSkill(skill);
        setNewTitle(skill.skillTitle);
        setNewCategory(skill.category);
        setNewCertName(skill.certificationName);
        setNewSchool(skill.issuingSchool);
        setNewYear(skill.yearObtained);
        setNewRate(skill.hourlyRate.toString());
        setNewDesc(skill.description);
        setNewImage(skill.portfolioImages[0] || '');
        setNewLicenseNo(skill.licenseNumber || '');
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSkill || !newTitle.trim()) return;

        const updated = userSkills.map(s => {
            if (s.id === editingSkill.id) {
                return {
                    ...s,
                    skillTitle: newTitle,
                    category: newCategory,
                    certificationName: newCertName,
                    issuingSchool: newSchool,
                    yearObtained: newYear,
                    hourlyRate: parseFloat(newRate) || 1000,
                    description: newDesc,
                    portfolioImages: newImage.trim() ? [newImage.trim(), ...s.portfolioImages.slice(1)] : s.portfolioImages,
                    licenseNumber: newLicenseNo.trim() || s.licenseNumber,
                    verificationStatus: newLicenseNo.trim() ? 'verified' : s.verificationStatus
                };
            }
            return s;
        });

        setUserSkills(updated);
        if (currentUser && onUpdateUser) {
            onUpdateUser({
                ...currentUser,
                skills: updated as any
            });
        }
        setEditingSkill(null);
        resetForm();
    };

    const handleDeleteSkill = (skillId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to remove this skill profile from $kill Hub?')) return;
        const updated = userSkills.filter(s => s.id !== skillId);
        setUserSkills(updated);
        if (selectedSkillPDP?.id === skillId) setSelectedSkillPDP(null);
        if (currentUser && onUpdateUser) {
            onUpdateUser({
                ...currentUser,
                skills: updated as any
            });
        }
    };

    const handleVerifySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!verifyingSkill) return;

        const updated = userSkills.map(s => {
            if (s.id === verifyingSkill.id) {
                return {
                    ...s,
                    verificationStatus: 'verified' as const,
                    licenseNumber: verifLicence || 'NITA-VERIFIED-' + Math.floor(10000 + Math.random() * 90000),
                    certificateImageUrl: verifCertUrl || s.certificateImageUrl
                };
            }
            return s;
        });

        setUserSkills(updated);
        if (currentUser && onUpdateUser) {
            onUpdateUser({
                ...currentUser,
                skills: updated as any
            });
        }
        setVerifyingSkill(null);
        setVerifLicence('');
        setVerifCertUrl('');
        setToastMessage('✅ Certification Verified Successfully!');
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2500);
    };

    const resetForm = () => {
        setNewTitle('');
        setNewCertName('');
        setNewSchool('');
        setNewDesc('');
        setNewImage('');
        setNewLicenseNo('');
    };

    const currentHeatmapData = HEATMAP_DATABASE[heatmapSkillCategory] || HEATMAP_DATABASE['Electrical'];

    return (
        <div className="bg-gray-50 h-screen max-h-screen font-sans max-w-md mx-auto border-x border-gray-200 relative flex flex-col overflow-hidden">
            {/* Notification Toast */}
            {savedToast && (
                <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[150] bg-black text-white font-black text-xs px-4 py-2 rounded-full shadow-2xl border border-amber-400 animate-fade-in flex items-center gap-1.5">
                    {toastMessage}
                </div>
            )}

            {/* Top Header */}
            <header className="py-2.5 px-3.5 bg-black text-white flex items-center justify-between flex-shrink-0 z-30 shadow-md">
                <div className="flex items-center gap-2 min-w-0">
                    <button onClick={onBack} className="p-1.5 bg-white/10 rounded-xl hover:bg-white/20 transition-all flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="min-w-0">
                        <h1 className="text-sm font-black uppercase tracking-wider italic truncate flex items-center gap-1">
                            <span>$KILL HUB</span>
                            <span className="bg-amber-400 text-black text-[7px] font-black px-1.5 py-0.2 rounded uppercase not-italic">Pro</span>
                        </h1>
                        <p className="text-[7.5px] font-bold uppercase tracking-widest text-gray-400 truncate">Skills, Heatmaps & Accreditation</p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button 
                        onClick={() => { resetForm(); setShowAddModal(true); }} 
                        className="bg-white/15 text-white hover:bg-white/25 text-[9.5px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all active:scale-95 border border-white/20"
                    >
                        + Add Skill
                    </button>
                    <button 
                        onClick={handleSaveAllSkills} 
                        className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider shadow-md hover:bg-emerald-600 transition-all active:scale-95 flex items-center gap-1 border border-emerald-400"
                    >
                        <span>💾</span> SAVE
                    </button>
                </div>
            </header>

            {/* $KILL HUB TABS NAVIGATION */}
            <nav className="bg-gray-900 text-white p-1.5 grid grid-cols-3 gap-1 flex-shrink-0 border-b border-gray-800 shadow-inner">
                <button
                    onClick={() => setActiveTab('skills')}
                    className={`py-1.5 px-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                        activeTab === 'skills' ? 'bg-amber-400 text-black shadow-md scale-100' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <span>⚡</span>
                    <span className="truncate">My Skills ({userSkills.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('heatmap')}
                    className={`py-1.5 px-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                        activeTab === 'heatmap' ? 'bg-amber-400 text-black shadow-md scale-100' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <span>🗺️</span>
                    <span className="truncate">Demand Heatmap</span>
                </button>

                <button
                    onClick={() => setActiveTab('upskill')}
                    className={`py-1.5 px-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                        activeTab === 'upskill' ? 'bg-amber-400 text-black shadow-md scale-100' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <span>🚀</span>
                    <span className="truncate">Upgrade & Earn</span>
                </button>
            </nav>

            <main className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                {/* TAB 1: MY SKILLS & ACCREDITATION */}
                {activeTab === 'skills' && (
                    <div className="space-y-3 animate-fade-in">
                        {/* Verification Status Banner */}
                        <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white p-3 rounded-2xl border border-amber-400/30 shadow-md flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-amber-400 text-xs">🛡️</span>
                                    <h3 className="text-[10px] font-black uppercase tracking-wider text-amber-400">Accredited Skill Verification</h3>
                                </div>
                                <p className="text-[8.5px] text-gray-300 font-medium">Verified skill badges rank 3x higher in client searches across Nairobi & TVET directories.</p>
                            </div>
                            <button
                                onClick={() => {
                                    const unverif = userSkills.find(s => s.verificationStatus !== 'verified');
                                    setVerifyingSkill(unverif || userSkills[0]);
                                }}
                                className="bg-amber-400 text-black text-[8.5px] font-black px-2.5 py-1.5 rounded-xl uppercase tracking-wider hover:bg-amber-300 transition-all flex-shrink-0 shadow-sm"
                            >
                                Verify Now
                            </button>
                        </div>

                        {/* User Active Skills List */}
                        <section className="space-y-2">
                            <div className="flex justify-between items-center">
                                <h2 className="text-[11px] font-black uppercase tracking-wider text-black">Active $kill Profiles ({userSkills.length})</h2>
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Tap card for PDP</span>
                            </div>

                            <div className="space-y-2">
                                {userSkills.map(skill => {
                                    const sTitle = skill.skillTitle || (skill as any).name || 'Skill Profile';
                                    const sRate = skill.hourlyRate || 0;
                                    const sCurrency = skill.currency || 'Ksh';
                                    return (
                                        <div 
                                            key={skill.id}
                                            onClick={() => setSelectedSkillPDP(skill)}
                                            className="bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group relative"
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex gap-2.5 items-start min-w-0">
                                                    <div className="w-10 h-10 bg-black text-white rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0 shadow-xs border border-gray-800">
                                                        {skill.category === 'Electrical' ? '⚡' : skill.category === 'Plumbing' ? '🔧' : skill.category === 'Transport/Boda' ? '🏍️' : sTitle.toLowerCase().includes('honey') ? '🐝' : sTitle.toLowerCase().includes('tractor') ? '🚜' : '🛠️'}
                                                    </div>
                                                    <div className="min-w-0 space-y-0.5">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <h3 className="font-black text-xs text-black truncate group-hover:underline">{sTitle}</h3>
                                                            {skill.verificationStatus === 'verified' ? (
                                                                <span className="bg-emerald-100 text-emerald-800 text-[7px] font-black px-1.5 py-0.2 rounded-full uppercase flex items-center gap-0.5 border border-emerald-300">
                                                                    ✓ Verified Accreditation
                                                                </span>
                                                            ) : (
                                                                <span className="bg-amber-100 text-amber-800 text-[7px] font-black px-1.5 py-0.2 rounded-full uppercase flex items-center gap-0.5 border border-amber-300">
                                                                    ⏳ Unverified
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[9px] text-gray-600 font-bold truncate">{skill.certificationName || 'Certified Competency'}</p>
                                                        <p className="text-[8.5px] text-gray-400 font-semibold truncate">{skill.issuingSchool || 'NikoSoko Skill Hub'} ({skill.yearObtained || '2024'}) {skill.licenseNumber ? `• Lic: ${skill.licenseNumber}` : ''}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                                    <span className="bg-black text-white text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg">
                                                        {sCurrency} {sRate.toLocaleString()}/d
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        {skill.verificationStatus !== 'verified' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setVerifyingSkill(skill); }}
                                                                className="px-1.5 py-0.5 bg-amber-400 text-black rounded-md text-[8px] font-black uppercase tracking-wider hover:bg-amber-300 transition-all"
                                                            >
                                                                Verify
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={(e) => handleEditSkill(skill, e)} 
                                                            className="p-1 bg-gray-100 hover:bg-black hover:text-white text-gray-700 rounded-md text-[10px] font-bold transition-all"
                                                            title="Edit"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button 
                                                            onClick={(e) => handleDeleteSkill(skill.id, e)} 
                                                            className="p-1 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-md text-[10px] font-bold transition-all"
                                                            title="Delete"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                )}

                {/* TAB 2: DEMAND HEAT MAP */}
                {activeTab === 'heatmap' && (
                    <div className="space-y-3 animate-fade-in">
                        {/* Category Selector Pill Row */}
                        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-2xs space-y-1.5">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[9px] font-black uppercase tracking-wider text-black">Select Skill Field for Live Heatmap</span>
                                <span className="text-[7.5px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-1.5 py-0.5 rounded-md">Live GPS Demand Data</span>
                            </div>
                            <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                                {['Electrical', 'Plumbing', 'Transport/Boda', 'Other'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setHeatmapSkillCategory(cat)}
                                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex-shrink-0 ${
                                            heatmapSkillCategory === cat
                                                ? 'bg-black text-white shadow-sm'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {cat === 'Electrical' ? '⚡ Electrical & Solar' : cat === 'Plumbing' ? '🔧 Plumbing' : cat === 'Transport/Boda' ? '🏍️ Boda & Logistics' : '🛠️ Specialist Ag'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Overview Stats Header */}
                        <div className="bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-500 p-3.5 rounded-2xl border border-amber-600 text-black shadow-inner space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase tracking-widest bg-black text-amber-400 px-2 py-0.5 rounded-full">
                                    {currentHeatmapData.skillCategory} Demand
                                </span>
                                <span className="text-[8px] font-extrabold uppercase text-black/80">{currentHeatmapData.growthRate}</span>
                            </div>
                            <div className="flex items-baseline justify-between pt-1">
                                <div>
                                    <span className="text-xl font-black text-black">{currentHeatmapData.totalSearchesWeekly.toLocaleString()}</span>
                                    <span className="text-[9px] font-extrabold text-black/80 ml-1">Weekly Client Searches in Nairobi & Environs</span>
                                </div>
                            </div>
                        </div>

                        {/* Hotspot Location Cards */}
                        <section className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-[10px] font-black uppercase tracking-wider text-black flex items-center gap-1">
                                    <span>🔥 Search Hotspots & Peak Rates</span>
                                </h3>
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Highest Demand Zones</span>
                            </div>

                            <div className="space-y-2">
                                {currentHeatmapData.hotspots.map((hotspot, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <h4 className="font-black text-xs text-black">{hotspot.areaName}</h4>
                                                    <span className={`text-[7px] font-black px-1.5 py-0.2 rounded uppercase ${
                                                        hotspot.demandLevel === 'EXTREME' ? 'bg-red-600 text-white' : hotspot.demandLevel === 'HIGH' ? 'bg-amber-500 text-black' : 'bg-emerald-600 text-white'
                                                    }`}>
                                                        {hotspot.demandLevel} DEMAND
                                                    </span>
                                                </div>
                                                <p className="text-[8.5px] font-bold text-gray-500 uppercase mt-0.5">Top Query: <span className="text-black italic">"{hotspot.topQuery}"</span></p>
                                            </div>

                                            <div className="text-end flex-shrink-0">
                                                <p className="text-xs font-black text-black">{hotspot.avgBudget}</p>
                                                <p className="text-[8px] font-bold text-emerald-600 uppercase">{hotspot.searchCountWeekly} searches/wk</p>
                                            </div>
                                        </div>

                                        {/* Heat Intensity Bar */}
                                        <div className="space-y-0.5">
                                            <div className="flex justify-between text-[7.5px] font-extrabold text-gray-400 uppercase">
                                                <span>Heat Intensity</span>
                                                <span>Peak Hours: {hotspot.peakHours}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 rounded-full transition-all duration-500" 
                                                    style={{ width: `${hotspot.heatPercentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Top Searched Queries Cloud */}
                        <section className="bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                            <h3 className="text-[10px] font-black uppercase tracking-wider text-black">Top Client Search Keywords</h3>
                            <div className="flex flex-wrap gap-1.5">
                                {currentHeatmapData.topSearchQueries.map((item, i) => (
                                    <div key={i} className="bg-gray-50 hover:bg-black hover:text-white transition-all text-black border border-gray-200 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                                        <span className="text-[9px] font-black">{item.query}</span>
                                        <span className="bg-amber-400 text-black text-[7px] font-black px-1 rounded">{item.surge}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {/* TAB 3: UPGRADE & TRADE MORE HOURS */}
                {activeTab === 'upskill' && (
                    <div className="space-y-3 animate-fade-in">
                        {/* Earning Multiplier Banner */}
                        <div className="bg-black text-white p-3.5 rounded-2xl border border-amber-400/40 shadow-md space-y-1">
                            <div className="flex items-center gap-1.5">
                                <span className="text-amber-400 text-sm">💡</span>
                                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">Trading More Hours with Cross-Skilling</h3>
                            </div>
                            <p className="text-[9px] text-gray-300 leading-relaxed font-medium">
                                Technicians with 2 or more complementary certified skills earn <strong className="text-white">+40% higher daily rates</strong> and trade an extra 15–22 billable hours per week on Nikosoko.
                            </p>
                        </div>

                        {/* Recommended Skills Cards */}
                        <section className="space-y-2.5">
                            <h2 className="text-[11px] font-black uppercase tracking-wider text-black">High Yield Skills To Learn Next</h2>

                            <div className="space-y-2.5">
                                {UPSKILL_RECOMMENDATIONS.map((rec) => {
                                    const isEnrolled = enrolledCourseIds.includes(rec.id);
                                    return (
                                        <div key={rec.id} className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs space-y-2.5">
                                            <div className="flex justify-between items-start gap-2 border-b border-gray-100 pb-2">
                                                <div>
                                                    <span className="text-[7.5px] font-black uppercase tracking-widest bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                                                        Fits Your {rec.currentCategory} Profile
                                                    </span>
                                                    <h3 className="text-xs font-black text-black uppercase leading-tight mt-1">{rec.recommendedSkill}</h3>
                                                </div>

                                                <div className="text-end flex-shrink-0">
                                                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-lg border border-emerald-300 block">
                                                        {rec.potentialRateIncrease}
                                                    </span>
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mt-0.5 block">
                                                        +{rec.additionalHoursPerWeek} hrs/wk demand
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-[9.5px] text-gray-700 font-medium leading-relaxed">{rec.description}</p>

                                            {/* Course Logistics & Schools */}
                                            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 space-y-1">
                                                <div className="flex justify-between text-[8.5px] font-bold text-black uppercase">
                                                    <span>Duration: {rec.duration}</span>
                                                    <span>Est Cost: {rec.estimatedCost}</span>
                                                </div>
                                                <p className="text-[8px] font-semibold text-gray-500 uppercase">
                                                    Accredited Centers: <span className="text-black font-bold">{rec.accreditedSchools.join(' • ')}</span>
                                                </p>
                                            </div>

                                            {/* Enroll / Save Action */}
                                            <button
                                                onClick={() => {
                                                    if (isEnrolled) {
                                                        setEnrolledCourseIds(prev => prev.filter(id => id !== rec.id));
                                                    } else {
                                                        setEnrolledCourseIds(prev => [...prev, rec.id]);
                                                        setToastMessage(`🎓 Saved Interest in ${rec.recommendedSkill}!`);
                                                        setSavedToast(true);
                                                        setTimeout(() => setSavedToast(false), 2500);
                                                    }
                                                }}
                                                className={`w-full py-2 rounded-xl text-[9.5px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                                                    isEnrolled
                                                        ? 'bg-emerald-600 text-white border border-emerald-500'
                                                        : 'bg-black text-white hover:bg-gray-800'
                                                }`}
                                            >
                                                {isEnrolled ? (
                                                    <>
                                                        <span>✓</span> Enrolled / Saved to Training Checklist
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>🎓</span> Register Interest / Get TVET Admission Info
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                )}
            </main>

            {/* SKILL PDP PROFILE PAGE MODAL */}
            {selectedSkillPDP && (() => {
                const pdpTitle = selectedSkillPDP.skillTitle || (selectedSkillPDP as any).name || 'Skill Profile';
                const pdpCategory = selectedSkillPDP.category || 'Other';
                const pdpImages = selectedSkillPDP.portfolioImages || [];
                const pdpRate = selectedSkillPDP.hourlyRate || 0;
                const pdpCurrency = selectedSkillPDP.currency || 'Ksh';
                const pdpCertName = selectedSkillPDP.certificationName || 'Verified Accreditation';
                const pdpSchool = selectedSkillPDP.issuingSchool || 'Accredited Institution';
                const pdpYear = selectedSkillPDP.yearObtained || '2024';
                const pdpDesc = selectedSkillPDP.description || 'Verified skill profile and equipment specification.';

                return (
                    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[120] flex items-center justify-center p-3 font-sans">
                        <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-black max-h-[92vh] flex flex-col animate-fade-in relative">
                            {/* Header Banner & Close */}
                            <div className="relative h-20 bg-black overflow-hidden flex-shrink-0">
                                <img 
                                    src={pdpImages[0] || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=800'} 
                                    className="w-full h-full object-cover opacity-80" 
                                    alt="" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
                                
                                <button 
                                    onClick={() => setSelectedSkillPDP(null)} 
                                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 z-30 hover:bg-black transition-colors"
                                >
                                    ✕
                                </button>

                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
                                    <span className="text-[7.5px] font-black uppercase text-white tracking-widest">$KILL HUB PDP</span>
                                </div>

                                {/* Centered Floating Icon */}
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-black text-white text-lg font-black flex items-center justify-center border-3 border-white shadow-md z-20">
                                    {pdpTitle.toLowerCase().includes('honey') ? '🐝' : pdpTitle.toLowerCase().includes('tractor') ? '🚜' : pdpCategory === 'Electrical' ? '⚡' : '🛠️'}
                                </div>
                            </div>

                            {/* PDP Content */}
                            <div className="pt-7 px-3.5 pb-3 overflow-y-auto space-y-2.5 flex-1">
                                <div className="text-center space-y-1">
                                    <h2 className="font-black text-xs text-black uppercase leading-tight">{pdpTitle}</h2>
                                    <div className="flex items-center justify-center gap-1 text-[9px] text-gray-600 font-bold uppercase">
                                        <span>Offered by {currentUser?.name || 'Verified Specialist'}</span>
                                        <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-black text-[8px] flex items-center gap-0.5 border border-amber-200">
                                            ⭐ {currentUser?.rating ? currentUser.rating.toFixed(1) : '5.0'}
                                        </span>
                                    </div>
                                    <div className="inline-block mt-0.5 bg-black text-white px-2.5 py-0.5 rounded-full">
                                        <span className="text-xs font-black">{pdpCurrency} {pdpRate.toLocaleString()}</span>
                                        <span className="text-[8px] text-gray-300 font-semibold uppercase"> / Daily Rate</span>
                                    </div>
                                </div>

                                {/* Certification Proof */}
                                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 space-y-1">
                                    <div className="flex justify-between items-center border-b pb-1">
                                        <h4 className="text-[8px] font-black text-black uppercase tracking-widest">Verified Accreditation</h4>
                                        <span className={`text-[7.5px] font-black px-1 py-0.2 rounded uppercase ${
                                            selectedSkillPDP.verificationStatus === 'verified' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-black'
                                        }`}>
                                            {selectedSkillPDP.verificationStatus === 'verified' ? 'Verified' : 'Pending Verification'}
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-black">{pdpCertName}</p>
                                    <p className="text-[9.5px] font-semibold text-gray-600">Issued by: <span className="text-black font-bold">{pdpSchool}</span> ({pdpYear})</p>
                                    {selectedSkillPDP.licenseNumber && (
                                        <p className="text-[8.5px] font-bold text-gray-500 uppercase">Lic/Reg: {selectedSkillPDP.licenseNumber}</p>
                                    )}
                                </div>

                                {/* Description & Equipment Details */}
                                <div className="bg-white p-2.5 rounded-xl border border-gray-200 space-y-1">
                                    <h4 className="text-[8px] font-black text-black uppercase tracking-widest">Operational Scope & Equipment</h4>
                                    <p className="text-xs text-gray-700 leading-relaxed font-medium">{pdpDesc}</p>
                                </div>

                                {/* Portfolio Photos */}
                                {pdpImages.length > 0 && (
                                    <div className="space-y-1.5">
                                        <h4 className="text-[8px] font-black text-black uppercase tracking-widest">Equipment & Work Portfolio</h4>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {pdpImages.map((img, i) => (
                                                <img key={i} src={img} className="w-full h-16 object-cover rounded-lg border border-gray-200" alt="" />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* PDP Action CTA Buttons: Call, Book, Chat */}
                            <div className="p-3 bg-gray-50 border-t border-gray-200 grid grid-cols-3 gap-2">
                                <button 
                                    onClick={() => {
                                        alert(`Direct Call initiating for ${pdpTitle}...`);
                                        setSelectedSkillPDP(null);
                                    }}
                                    className="bg-black text-white py-2 rounded-xl font-black text-[9px] uppercase tracking-wider shadow-sm hover:bg-gray-900 active:scale-95 transition-all text-center"
                                >
                                    📞 Call
                                </button>
                                <button 
                                    onClick={() => {
                                        if (onBookProvider) {
                                            onBookProvider({
                                                id: currentUser?.id || 'skill_' + selectedSkillPDP.id,
                                                name: currentUser?.name || 'Skill Practitioner',
                                                service: pdpTitle,
                                                phone: currentUser?.phone || '+254700000000',
                                                avatarUrl: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300',
                                                coverImageUrl: pdpImages[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600',
                                                hourlyRate: pdpRate,
                                                rateType: 'per hour',
                                                currency: pdpCurrency,
                                                location: currentUser?.location || 'Nairobi, Kenya',
                                                rating: 4.9,
                                                distanceKm: 1.2,
                                                category: pdpCategory as any,
                                                about: pdpDesc,
                                                isVerified: true,
                                                isOnline: true,
                                                accountType: 'individual',
                                                works: pdpImages,
                                                flagCount: 0,
                                                views: 120,
                                                cta: ['call', 'whatsapp', 'book']
                                            });
                                        } else {
                                            alert(`Booking request sent for ${pdpTitle}!`);
                                        }
                                        setSelectedSkillPDP(null);
                                    }}
                                    className="bg-emerald-600 text-white py-2 rounded-xl font-black text-[9px] uppercase tracking-wider shadow-sm hover:bg-emerald-700 active:scale-95 transition-all text-center"
                                >
                                    📅 Book
                                </button>
                                <button 
                                    onClick={() => {
                                        alert(`Opening WhatsApp chat for ${pdpTitle}...`);
                                        setSelectedSkillPDP(null);
                                    }}
                                    className="bg-white text-black border border-black py-2 rounded-xl font-black text-[9px] uppercase tracking-wider hover:bg-gray-100 active:scale-95 transition-all text-center"
                                >
                                    💬 Chat
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ADD OR EDIT SKILL MODAL */}
            {(showAddModal || editingSkill) && (
                <div className="fixed inset-0 bg-black/85 z-[120] flex items-center justify-center p-3 font-sans">
                    <form onSubmit={editingSkill ? handleSaveEdit : handleAddSkill} className="bg-white w-full max-w-sm rounded-3xl p-4 shadow-2xl space-y-2.5 border border-black relative max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b pb-2">
                            <div>
                                <h2 className="text-xs font-black text-black uppercase tracking-tight">{editingSkill ? 'Edit Skill Profile' : 'Add New Skill'}</h2>
                                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">$kill Hub Listing</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button 
                                    type="submit"
                                    className="py-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-wider rounded-lg shadow-xs active:scale-95 flex items-center gap-1 border border-emerald-500"
                                >
                                    <span>💾</span> SAVE
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => { setShowAddModal(false); setEditingSkill(null); resetForm(); }}
                                    className="p-1 text-gray-400 hover:text-black font-bold text-sm"
                                    title="Close"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div>
                                <label className="block text-[8px] font-black uppercase text-black mb-0.5">Skill Profile Title</label>
                                <input 
                                    required
                                    className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-black outline-none focus:bg-white focus:border-black"
                                    placeholder="e.g. Honey Harvesting Kit & Beehive Service"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[8px] font-black uppercase text-black mb-0.5">Category</label>
                                    <select 
                                        className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-black outline-none"
                                        value={newCategory}
                                        onChange={e => setNewCategory(e.target.value as any)}
                                    >
                                        <option value="Electrical">Electrical</option>
                                        <option value="Plumbing">Plumbing</option>
                                        <option value="Transport/Boda">Transport/Boda</option>
                                        <option value="Mechanic">Mechanic</option>
                                        <option value="Construction">Construction</option>
                                        <option value="Technology">Technology</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[8px] font-black uppercase text-black mb-0.5">Daily Rate (KES)</label>
                                    <input 
                                        type="number"
                                        className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-black outline-none"
                                        value={newRate}
                                        onChange={e => setNewRate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[8px] font-black uppercase text-black mb-0.5">Certification / Accreditation Name</label>
                                <input 
                                    required
                                    className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-black outline-none focus:bg-white focus:border-black"
                                    placeholder="e.g. EPRA Class T3 / NITA Professional Cert / KITI Licence"
                                    value={newCertName}
                                    onChange={e => setNewCertName(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2">
                                    <label className="block text-[8px] font-black uppercase text-black mb-0.5">School / Institution</label>
                                    <input 
                                        className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-black outline-none"
                                        placeholder="e.g. NITA Kenya / Baraton TVET"
                                        value={newSchool}
                                        onChange={e => setNewSchool(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-black uppercase text-black mb-0.5">Year</label>
                                    <input 
                                        className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-black outline-none"
                                        value={newYear}
                                        onChange={e => setNewYear(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[8px] font-black uppercase text-black mb-0.5">License / EPRA / NITA Number (Optional)</label>
                                <input 
                                    className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium text-black outline-none"
                                    placeholder="e.g. EPRA/T3/10492"
                                    value={newLicenseNo}
                                    onChange={e => setNewLicenseNo(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-[8px] font-black uppercase text-black mb-0.5">Equipment / Portfolio Photo (Upload from Phone)</label>
                                <input 
                                    type="file"
                                    accept="image/*"
                                    className="w-full p-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium text-black outline-none file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-black file:bg-black file:text-white"
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                                if (reader.result) {
                                                    setNewImage(reader.result as string);
                                                }
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                {newImage && (
                                    <div className="mt-1 flex items-center gap-2">
                                        <img src={newImage} className="w-10 h-10 object-cover rounded-lg border border-gray-300" alt="Preview" />
                                        <button type="button" onClick={() => setNewImage('')} className="text-[9px] font-bold text-red-600">Remove</button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-[8px] font-black uppercase text-black mb-0.5">Skill & Kit Description</label>
                                <textarea 
                                    className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium text-black outline-none h-12"
                                    placeholder="Equipment list, suit details, tractor specs, or service scope..."
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-1">
                            <button 
                                type="button" 
                                onClick={() => { setShowAddModal(false); setEditingSkill(null); resetForm(); }}
                                className="w-full py-2 text-gray-500 hover:text-black font-bold text-[9px] uppercase tracking-widest rounded-xl bg-gray-100 border border-gray-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* VERIFICATION MODAL */}
            {verifyingSkill && (
                <div className="fixed inset-0 bg-black/85 z-[130] flex items-center justify-center p-3 font-sans">
                    <form onSubmit={handleVerifySubmit} className="bg-white w-full max-w-sm rounded-3xl p-4 shadow-2xl space-y-3 border border-black relative">
                        <div className="flex justify-between items-center border-b pb-2">
                            <div className="flex items-center gap-1.5">
                                <span className="text-amber-500 text-sm">🛡️</span>
                                <div>
                                    <h2 className="text-xs font-black text-black uppercase">Verify Certification</h2>
                                    <p className="text-[8px] text-gray-500 font-bold uppercase">{verifyingSkill.skillTitle}</p>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setVerifyingSkill(null)}
                                className="p-1 text-gray-400 hover:text-black font-bold text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[8.5px] font-medium text-amber-900">
                            Submit your official licensing authority number (EPRA, NITA, TVET, KALRO) or certificate photo URL to receive the Verified Accreditation Badge.
                        </div>

                        <div className="space-y-2">
                            <div>
                                <label className="block text-[8px] font-black uppercase text-black mb-0.5">Licensing Reg / Certificate Number</label>
                                <input 
                                    required
                                    className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-black outline-none focus:bg-white focus:border-black"
                                    placeholder="e.g. EPRA/T3/10492 or NITA-2023-8812"
                                    value={verifLicence}
                                    onChange={e => setVerifLicence(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-[8px] font-black uppercase text-black mb-0.5">Certificate Photo (Upload from Phone)</label>
                                <input 
                                    type="file"
                                    accept="image/*"
                                    className="w-full p-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium text-black outline-none file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-black file:bg-black file:text-white"
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                                if (reader.result) {
                                                    setVerifCertUrl(reader.result as string);
                                                }
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                {verifCertUrl && (
                                    <div className="mt-1 flex items-center gap-2">
                                        <img src={verifCertUrl} className="w-10 h-10 object-cover rounded-lg border border-gray-300" alt="Preview" />
                                        <button type="button" onClick={() => setVerifCertUrl('')} className="text-[9px] font-bold text-red-600">Remove</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-2 flex items-center gap-2">
                            <button 
                                type="button"
                                onClick={() => setVerifyingSkill(null)}
                                className="w-1/3 py-2 text-gray-600 font-bold text-[9px] uppercase tracking-wider rounded-xl bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="w-2/3 py-2 bg-black text-white font-black text-[9.5px] uppercase tracking-wider rounded-xl shadow-md hover:bg-gray-800 transition-all border border-amber-400"
                            >
                                Submit Verification
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default SkillDashboard;
