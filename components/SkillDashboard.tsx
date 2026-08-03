import React, { useState } from 'react';
import type { ServiceProvider, CurrentPage } from '../types';
import OrgDetailModal from './OrgDetailModal';

export interface SkillCert {
  id: string;
  skillTitle: string;
  category: 'Electrical' | 'Plumbing' | 'Transport/Boda' | 'Mechanic' | 'Construction' | 'Technology' | 'Agribusiness' | 'Other';
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
    skillCategory: 'Electrical & Solar PV',
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
      { query: 'EV Charger Installation Nairobi', count: 210, surge: '+310%' }
    ]
  },
  'Plumbing': {
    skillCategory: 'Plumbing & Drainage',
    totalSearchesWeekly: 980,
    growthRate: '+120% search surge',
    hotspots: [
      { areaName: 'Eastlands (Donholm / Buruburu)', searchCountWeekly: 310, demandLevel: 'EXTREME', avgBudget: 'KES 2,200/day', peakHours: '6:00 AM - 10:00 AM', heatPercentage: 92, topQuery: 'burst pipe repair plumber' },
      { areaName: 'Syokimau & Kitengela', searchCountWeekly: 270, demandLevel: 'HIGH', avgBudget: 'KES 2,800/day', peakHours: 'Weekends 8:00 AM', heatPercentage: 80, topQuery: 'borehole pump installation' },
      { areaName: 'Kasarani & Roysambu', searchCountWeekly: 240, demandLevel: 'HIGH', avgBudget: 'KES 2,000/day', peakHours: 'Evenings 5:00 PM', heatPercentage: 72, topQuery: 'instant shower heater installation' }
    ],
    topSearchQueries: [
      { query: 'Instant Shower Wiring & Fitting', count: 290, surge: '+160%' },
      { query: 'Sewer Line Unblocking Service', count: 250, surge: '+110%' }
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
      { query: 'EV Scooter Technician', count: 310, surge: '+350%' }
    ]
  },
  'Agribusiness': {
    skillCategory: 'Agribusiness & Apiary',
    totalSearchesWeekly: 820,
    growthRate: '+195% search surge',
    hotspots: [
      { areaName: 'Kajiado & Kitengela Farms', searchCountWeekly: 310, demandLevel: 'EXTREME', avgBudget: 'KES 3,500/day', peakHours: '6:00 AM - 11:00 AM', heatPercentage: 95, topQuery: 'beehive honey harvesting expert' },
      { areaName: 'Ruiru & Juja Farm Corridor', searchCountWeekly: 260, demandLevel: 'HIGH', avgBudget: 'KES 4,000/day', peakHours: 'Mornings 7:00 AM', heatPercentage: 84, topQuery: 'farm tractor ploughing service' }
    ],
    topSearchQueries: [
      { query: 'Commercial Honey Extractor Tech', count: 240, surge: '+230%' },
      { query: 'Disc Plough Tractor Driver', count: 210, surge: '+170%' }
    ]
  },
  'Other': {
    skillCategory: 'Specialist Trades & Crafts',
    totalSearchesWeekly: 760,
    growthRate: '+140% search surge',
    hotspots: [
      { areaName: 'Industrial Area & City Center', searchCountWeekly: 340, demandLevel: 'EXTREME', avgBudget: 'KES 3,000/day', peakHours: '8:00 AM - 5:00 PM', heatPercentage: 90, topQuery: 'certified MIG/TIG welder near me' },
      { areaName: 'Mombasa Road (Syokimau / Athi River)', searchCountWeekly: 250, demandLevel: 'HIGH', avgBudget: 'KES 3,200/day', peakHours: 'Mornings', heatPercentage: 78, topQuery: 'heavy machinery hydraulic tech' }
    ],
    topSearchQueries: [
      { query: 'High-Rise Steel Welder NITA 1', count: 220, surge: '+180%' }
    ]
  }
};

interface NearbyAcquireSkill {
  id: string;
  category: 'Electrical' | 'Plumbing' | 'Transport/Boda' | 'Agribusiness' | 'Mechanical' | 'Construction';
  title: string;
  institution: string;
  institutionShort: string;
  location: string;
  distanceKm: number;
  earningBoost: string;
  duration: string;
  classFormat: string;
  estimatedFee: string;
  prerequisites: string;
  certificationAwarded: string;
  demandTag: string;
  description: string;
}

const NEARBY_ACQUIRE_SKILLS: NearbyAcquireSkill[] = [
  {
    id: 'acq-1',
    category: 'Electrical',
    title: 'EV Scooter Battery & Swapping Station Tech',
    institution: 'National Industrial Training Authority (NITA)',
    institutionShort: 'NITA',
    location: 'Industrial Area (3.2 km)',
    distanceKm: 3.2,
    earningBoost: '+KES 1,500/day',
    duration: '2 Weeks',
    classFormat: 'Weekend Practical',
    estimatedFee: 'KES 8,500',
    prerequisites: 'Basic Electrical knowledge',
    certificationAwarded: 'NITA Certified EV Tech Badge',
    demandTag: '+240% SURGE',
    description: 'Learn lithium cell diagnostics, swapping station maintenance, and EV battery setup for boda fleets.'
  },
  {
    id: 'acq-2',
    category: 'Electrical',
    title: 'EPRA Class T3 Solar PV & Inverter License',
    institution: 'Energy & Petroleum Regulatory Authority / NITA',
    institutionShort: 'EPRA',
    location: 'Upper Hill (4.5 km)',
    distanceKm: 4.5,
    earningBoost: '+KES 2,000/day',
    duration: '3 Weeks',
    classFormat: 'Evening Hybrid',
    estimatedFee: 'KES 12,000',
    prerequisites: 'NITA Grade II or Electrical Diploma',
    certificationAwarded: 'EPRA Class T3 Solar License',
    demandTag: '+185% SURGE',
    description: 'Qualify for high-voltage hybrid solar inverter installs, net metering, and off-grid battery banks.'
  },
  {
    id: 'acq-3',
    category: 'Transport/Boda',
    title: 'Executive Chauffeur & Defensive Driving',
    institution: 'Automobile Association of Kenya (AA Kenya)',
    institutionShort: 'AA',
    location: 'Upper Hill Branch (2.1 km)',
    distanceKm: 2.1,
    earningBoost: '+KES 1,200/day',
    duration: '1 Week',
    classFormat: 'Intensive Practical',
    estimatedFee: 'KES 7,500',
    prerequisites: 'Valid Driving License',
    certificationAwarded: 'AA Chauffeur & NTSA PSV Badge',
    demandTag: 'HIGH TRUST',
    description: 'Executive protocol, defensive driving maneuvers, client security, and VIP transport ethics.'
  },
  {
    id: 'acq-4',
    category: 'Agribusiness',
    title: 'Commercial Apiary & Honey Extraction',
    institution: 'Kenya Agricultural & Livestock Research Org (KALRO)',
    institutionShort: 'KALRO',
    location: 'Loresho Station (8.0 km)',
    distanceKm: 8.0,
    earningBoost: '+KES 1,800/day',
    duration: '5 Days',
    classFormat: 'Field Workshop',
    estimatedFee: 'KES 6,500',
    prerequisites: 'Open to all artisans & farmers',
    certificationAwarded: 'KALRO Certified Apiarism Badge',
    demandTag: 'EXPORT GRADE',
    description: 'Hive inspection, queen rearing, smoker operation, and centrifuge honey extraction.'
  },
  {
    id: 'acq-5',
    category: 'Mechanical',
    title: 'Excavator & Heavy Hydraulic Equipment Operator',
    institution: 'Kenya Industrial Training Institute (KITI)',
    institutionShort: 'KITI',
    location: 'Industrial Grounds (12 km)',
    distanceKm: 12.0,
    earningBoost: '+KES 2,500/day',
    duration: '1 Month',
    classFormat: 'Hands-on Machine Time',
    estimatedFee: 'KES 22,000',
    prerequisites: 'Valid Driving License',
    certificationAwarded: 'KITI Heavy Operator Cert',
    demandTag: 'CONSTRUCTION',
    description: 'Operate trench excavators and motor graders with safety and hydraulic system checks.'
  },
  {
    id: 'acq-6',
    category: 'Plumbing',
    title: 'Solar Water Heater & Thermosiphon Piping',
    institution: 'Technical & Vocational Education Authority (TVETA)',
    institutionShort: 'TVETA',
    location: 'Utalii Campus (5.0 km)',
    distanceKm: 5.0,
    earningBoost: '+KES 1,400/day',
    duration: '2 Weeks',
    classFormat: 'Evening & Saturday',
    estimatedFee: 'KES 9,000',
    prerequisites: 'Plumbing experience',
    certificationAwarded: 'TVETA Certified Solar Heating Tech',
    demandTag: 'RENEWABLE',
    description: 'Thermosiphon solar collectors, pressure pumps, and PPR pipe sizing.'
  }
];

interface SkillDashboardProps {
  currentUser: ServiceProvider | null;
  onBack: () => void;
  onNavigate: (page: CurrentPage) => void;
  onUpdateUser?: (updated: ServiceProvider) => void;
  onBookProvider?: (provider: ServiceProvider) => void;
}

const SkillDashboard: React.FC<SkillDashboardProps> = ({
  currentUser,
  onBack,
  onNavigate,
  onUpdateUser
}) => {
  // Navigation tabs: 'my_skills' | 'heatmaps' | 'recommended'
  const [activeTab, setActiveTab] = useState<'my_skills' | 'heatmaps' | 'recommended'>('my_skills');

  // User skills state
  const [userSkills, setUserSkills] = useState<SkillCert[]>(() => {
    if (currentUser?.skills && (currentUser.skills as any[]).length > 0) {
      return currentUser.skills as any[];
    }
    return [
      {
        id: 'sk-1',
        skillTitle: 'EPRA Certified Solar & Inverter Technician',
        category: 'Electrical',
        certificationName: 'EPRA Class T3 Electrical License',
        issuingSchool: 'NITA Kenya',
        yearObtained: '2023',
        hourlyRate: currentUser?.hourlyRate || 2500,
        currency: 'KES',
        description: currentUser?.about || 'Residential wiring, solar inverter hookups, lithium batteries, and fault diagnosis.',
        portfolioImages: currentUser?.works?.length ? currentUser.works : [
          'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600'
        ],
        verificationStatus: 'verified',
        licenseNumber: 'EPRA-T3-2023-112'
      },
      {
        id: 'sk-2',
        skillTitle: 'Beehive & Commercial Honey Harvesting',
        category: 'Agribusiness',
        certificationName: 'Beekeeping & Apiary Management Cert',
        issuingSchool: 'KALRO Apiary Unit',
        yearObtained: '2023',
        hourlyRate: 3500,
        currency: 'KES',
        description: 'Honey harvesting with protective gear, centrifuge extraction, and hive setup.',
        portfolioImages: [
          'https://images.unsplash.com/photo-1587049352847-4a222e784d38?q=80&w=600'
        ],
        verificationStatus: 'verified',
        licenseNumber: 'KALRO-AP-88421'
      }
    ];
  });

  // State for Heatmap & Recommended filters
  const [heatmapCategory, setHeatmapCategory] = useState<string>('Electrical');
  const [recommendedCategory, setRecommendedCategory] = useState<string>('ALL');

  // Modals & PDP state
  const [selectedOrgForModal, setSelectedOrgForModal] = useState<{ orgName: string; cert?: any } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [verifyingSkill, setVerifyingSkill] = useState<SkillCert | null>(null);

  // Form fields for Add Skill
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<SkillCert['category']>('Electrical');
  const [formCertName, setFormCertName] = useState('');
  const [formSchool, setFormSchool] = useState('');
  const [formYear, setFormYear] = useState('2024');
  const [formRate, setFormRate] = useState('2500');
  const [formDesc, setFormDesc] = useState('');
  const [formCertFile, setFormCertFile] = useState<string | null>(null);
  const [formCertFileName, setFormCertFileName] = useState('');
  const [formLicenseNo, setFormLicenseNo] = useState('');

  // Form fields for Verification Modal
  const [verifLicense, setVerifLicense] = useState('');
  const [verifCertFile, setVerifCertFile] = useState<string | null>(null);
  const [verifFileName, setVerifFileName] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const resetAddForm = () => {
    setFormTitle('');
    setFormCertName('');
    setFormSchool('');
    setFormDesc('');
    setFormCertFile(null);
    setFormCertFileName('');
    setFormLicenseNo('');
    setFormRate('2500');
    setFormYear('2024');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isVerification: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (isVerification) {
        setVerifCertFile(result);
        setVerifFileName(file.name);
      } else {
        setFormCertFile(result);
        setFormCertFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const isVerified = Boolean(formLicenseNo.trim() || formCertFile);

    const newSkill: SkillCert = {
      id: `sk-${Date.now()}`,
      skillTitle: formTitle.trim(),
      category: formCategory,
      certificationName: formCertName.trim() || 'Practical Competency Badge',
      issuingSchool: formSchool.trim() || 'Accredited Institution',
      yearObtained: formYear || '2024',
      hourlyRate: parseFloat(formRate) || 2000,
      currency: 'KES',
      description: formDesc.trim() || 'Verified practical skill added to profile.',
      certificateImageUrl: formCertFile || undefined,
      portfolioImages: formCertFile ? [formCertFile] : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600'],
      verificationStatus: isVerified ? 'verified' : 'unverified',
      licenseNumber: formLicenseNo.trim() || undefined
    };

    const updated = [newSkill, ...userSkills];
    setUserSkills(updated);
    if (currentUser && onUpdateUser) {
      onUpdateUser({ ...currentUser, skills: updated as any });
    }
    setShowAddModal(false);
    resetAddForm();
    showToast(isVerified ? '✓ Skill added & verified!' : '⚡ Skill added to profile');
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingSkill) return;

    const updated = userSkills.map(s => {
      if (s.id === verifyingSkill.id) {
        return {
          ...s,
          verificationStatus: 'verified' as const,
          licenseNumber: verifLicense.trim() || s.licenseNumber || ('VERIF-' + Math.floor(10000 + Math.random() * 90000)),
          certificateImageUrl: verifCertFile || s.certificateImageUrl
        };
      }
      return s;
    });

    setUserSkills(updated);
    if (currentUser && onUpdateUser) {
      onUpdateUser({ ...currentUser, skills: updated as any });
    }
    setVerifyingSkill(null);
    setVerifLicense('');
    setVerifCertFile(null);
    setVerifFileName('');
    showToast('✓ Certification Verified & Badged!');
  };

  const handleDeleteSkill = (id: string) => {
    if (!confirm('Remove this skill from your profile?')) return;
    const updated = userSkills.filter(s => s.id !== id);
    setUserSkills(updated);
    if (currentUser && onUpdateUser) {
      onUpdateUser({ ...currentUser, skills: updated as any });
    }
    showToast('Skill removed');
  };

  const filteredRecommended = recommendedCategory === 'ALL'
    ? NEARBY_ACQUIRE_SKILLS
    : NEARBY_ACQUIRE_SKILLS.filter(item => item.category === recommendedCategory);

  const currentHeatmapData = HEATMAP_DATABASE[heatmapCategory] || HEATMAP_DATABASE['Electrical'];

  return (
    <div className="bg-white min-h-screen font-sans text-neutral-900 max-w-xl mx-auto border-x border-neutral-200 relative flex flex-col shadow-lg">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[220] bg-black text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl border border-emerald-500 animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP COMPACT HEADER (Black & White + Emerald) */}
      <header className="sticky top-0 z-40 bg-black text-white px-4 py-3 border-b border-neutral-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-neutral-700 text-white transition-all cursor-pointer"
            title="Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black uppercase tracking-wider text-white">SKILL HUB</h1>
              <span className="bg-emerald-500 text-black text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                VERIFIED
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => { resetAddForm(); setShowAddModal(true); }}
          className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer border border-emerald-400 flex items-center gap-1 shadow-sm"
        >
          <span>+</span> Add Skill
        </button>
      </header>

      {/* 3 CLEAN SIMPLE NAVIGATION TABS */}
      <nav className="sticky top-[53px] z-30 bg-neutral-900 border-b border-neutral-800 p-1.5 grid grid-cols-3 gap-1 shadow-xs">
        <button
          onClick={() => setActiveTab('my_skills')}
          className={`py-2 px-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'my_skills'
              ? 'bg-white text-black shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <span>⚡</span>
          <span>My Skills ({userSkills.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('heatmaps')}
          className={`py-2 px-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'heatmaps'
              ? 'bg-white text-black shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <span>🗺️</span>
          <span>Heat Maps</span>
        </button>

        <button
          onClick={() => setActiveTab('recommended')}
          className={`py-2 px-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'recommended'
              ? 'bg-emerald-500 text-black shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <span>🎓</span>
          <span>Recommended</span>
        </button>
      </nav>

      {/* MAIN DASHBOARD CONTENT */}
      <main className="flex-1 p-4 space-y-4">
        {/* ========================================================= */}
        {/* TAB 1: MY SKILLS & ADD / VERIFY */}
        {/* ========================================================= */}
        {activeTab === 'my_skills' && (
          <div className="space-y-4">
            {/* Quick Banner */}
            <div className="bg-neutral-950 text-white p-3.5 rounded-xl border border-neutral-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">Skill Accreditation</h3>
                </div>
                <p className="text-xs text-neutral-300 font-medium mt-0.5">
                  Upload certificates or license numbers to get verified badges.
                </p>
              </div>
              <button
                onClick={() => { resetAddForm(); setShowAddModal(true); }}
                className="bg-white hover:bg-neutral-200 text-black text-xs font-black px-3 py-1.5 rounded-lg uppercase transition-all shrink-0 cursor-pointer"
              >
                + Add Skill
              </button>
            </div>

            {/* User Skills List */}
            <div className="space-y-3">
              {userSkills.map((skill) => {
                const isVerified = skill.verificationStatus === 'verified';

                return (
                  <div
                    key={skill.id}
                    className="bg-white p-3.5 rounded-xl border border-neutral-200 space-y-2.5 shadow-xs hover:border-black transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center font-black text-lg shrink-0 border border-neutral-800">
                          {skill.category === 'Electrical' ? '⚡' : skill.category === 'Plumbing' ? '🔧' : skill.category === 'Transport/Boda' ? '🏍️' : skill.category === 'Agribusiness' ? '🐝' : '🛠️'}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-sm text-black truncate">
                              {skill.skillTitle}
                            </h3>
                            {isVerified ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase border border-emerald-300">
                                ✓ Verified Cert
                              </span>
                            ) : (
                              <span className="bg-neutral-100 text-neutral-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase border border-neutral-300">
                                Unverified
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-neutral-600 font-bold">
                            {skill.certificationName} • {skill.issuingSchool}
                          </p>

                          {skill.licenseNumber && (
                            <p className="text-[10px] font-mono text-neutral-500 font-bold">
                              Lic #{skill.licenseNumber}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="bg-black text-white text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded">
                          KES {skill.hourlyRate.toLocaleString()}/d
                        </span>
                        <button
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Certificate Preview or Upload Button */}
                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                      {skill.certificateImageUrl ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={skill.certificateImageUrl}
                            alt="Certificate"
                            className="w-8 h-8 rounded border border-neutral-300 object-cover"
                          />
                          <span className="text-[10px] font-mono text-emerald-700 font-bold">
                            📄 Certificate Uploaded
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-neutral-400 font-medium">
                          No certificate uploaded yet
                        </span>
                      )}

                      {!isVerified && (
                        <button
                          onClick={() => setVerifyingSkill(skill)}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase rounded tracking-wider transition-all cursor-pointer shadow-xs"
                        >
                          Upload & Verify
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: DEMAND HEATMAPS */}
        {/* ========================================================= */}
        {activeTab === 'heatmaps' && (
          <div className="space-y-4">
            {/* Category Selector */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {['Electrical', 'Plumbing', 'Transport/Boda', 'Agribusiness', 'Other'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setHeatmapCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                    heatmapCategory === cat
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {cat === 'Electrical' ? '⚡ Electrical' : cat === 'Plumbing' ? '🔧 Plumbing' : cat === 'Transport/Boda' ? '🏍️ Boda EV' : cat === 'Agribusiness' ? '🐝 Agri' : '🛠️ Other'}
                </button>
              ))}
            </div>

            {/* Demand Header */}
            <div className="bg-black text-white p-4 rounded-xl border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                  {currentHeatmapData.skillCategory}
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">
                  {currentHeatmapData.totalSearchesWeekly.toLocaleString()} <span className="text-xs font-normal text-neutral-400">searches/wk</span>
                </h3>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs font-black px-2.5 py-1 rounded border border-emerald-500/30 uppercase">
                {currentHeatmapData.growthRate}
              </span>
            </div>

            {/* Hotspots List */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-black">
                🔥 Hotspot Locations & Peak Budgets
              </h3>

              {currentHeatmapData.hotspots.map((spot, idx) => (
                <div key={idx} className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-xs text-black">{spot.areaName}</h4>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                      spot.demandLevel === 'EXTREME'
                        ? 'bg-black text-emerald-400'
                        : 'bg-neutral-100 text-neutral-800'
                    }`}>
                      {spot.demandLevel}
                    </span>
                  </div>

                  {/* Heat progress bar */}
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${spot.heatPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-600 font-medium">
                    <span>Budget: <strong className="text-black font-bold">{spot.avgBudget}</strong></span>
                    <span>Peak: <strong className="text-black font-bold">{spot.peakHours}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: RECOMMENDED SKILLS FROM ORGS NEARBY */}
        {/* ========================================================= */}
        {activeTab === 'recommended' && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="bg-neutral-900 text-white p-3.5 rounded-xl border border-neutral-800">
              <span className="bg-emerald-500 text-black text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                NEARBY ACCREDITATION LISTINGS
              </span>
              <h2 className="text-xs font-black text-white uppercase mt-1">
                Acquire Practical Skills from Local TVET Orgs
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {['ALL', 'Electrical', 'Transport/Boda', 'Agribusiness', 'Mechanical', 'Plumbing'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setRecommendedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                    recommendedCategory === cat
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {cat === 'ALL' ? 'All' : cat}
                </button>
              ))}
            </div>

            {/* List of recommended courses */}
            <div className="space-y-3">
              {filteredRecommended.map((course) => {
                const isSaved = enrolledCourseIds.includes(course.id);

                return (
                  <div key={course.id} className="bg-white p-3.5 rounded-xl border border-neutral-200 space-y-2.5 shadow-xs">
                    <div className="flex items-start justify-between gap-2 border-b border-neutral-100 pb-2">
                      <div>
                        <span className="text-[9px] font-black bg-black text-emerald-400 px-2 py-0.5 rounded uppercase">
                          {course.demandTag}
                        </span>
                        <h3 className="text-xs font-black text-black uppercase mt-1">
                          {course.title}
                        </h3>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded shrink-0">
                        {course.earningBoost}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                      {course.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                      <div>
                        <span className="text-neutral-400 text-[9px] uppercase font-bold block">Org:</span>
                        <button
                          onClick={() => setSelectedOrgForModal({ orgName: course.institutionShort })}
                          className="font-black text-black hover:underline cursor-pointer"
                        >
                          🏢 {course.institutionShort} &rarr;
                        </button>
                      </div>
                      <div>
                        <span className="text-neutral-400 text-[9px] uppercase font-bold block">Location:</span>
                        <span className="font-bold text-black">{course.location}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 text-[9px] uppercase font-bold block">Duration:</span>
                        <span className="font-bold text-black">{course.duration}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 text-[9px] uppercase font-bold block">Fee:</span>
                        <span className="font-bold text-black">{course.estimatedFee}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          if (isSaved) {
                            setEnrolledCourseIds(prev => prev.filter(id => id !== course.id));
                            showToast('Removed from training list');
                          } else {
                            setEnrolledCourseIds(prev => [...prev, course.id]);
                            showToast(`Saved interest in ${course.institutionShort} course`);
                          }
                        }}
                        className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          isSaved
                            ? 'bg-emerald-600 text-white'
                            : 'bg-black text-white hover:bg-neutral-800'
                        }`}
                      >
                        {isSaved ? '✓ Interested / Saved' : '🎓 Register Interest'}
                      </button>
                      <button
                        onClick={() => setSelectedOrgForModal({ orgName: course.institutionShort })}
                        className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-black rounded-lg text-xs font-bold uppercase transition-all cursor-pointer border border-neutral-300"
                      >
                        Org Info
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL: ADD NEW SKILL (WITH CERTIFICATE UPLOAD) */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-neutral-800 overflow-hidden shadow-2xl my-auto">
            <div className="bg-black text-white p-4 flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-black text-base">⚡</span>
                <h3 className="text-xs font-black uppercase tracking-wider">Add & Verify New Skill</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSkillSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-800 uppercase block mb-1 text-[10px]">Skill Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar Inverter & Wiring Tech"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-neutral-300 focus:border-black outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-neutral-800 uppercase block mb-1 text-[10px]">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-neutral-300 focus:border-black outline-none font-bold bg-white"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Transport/Boda">Transport/Boda</option>
                    <option value="Agribusiness">Agribusiness</option>
                    <option value="Mechanic">Mechanic</option>
                    <option value="Construction">Construction</option>
                    <option value="Technology">Technology</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-800 uppercase block mb-1 text-[10px]">Daily Rate (KES)</label>
                  <input
                    type="number"
                    value={formRate}
                    onChange={(e) => setFormRate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-neutral-300 focus:border-black outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-neutral-800 uppercase block mb-1 text-[10px]">Certification / Course</label>
                  <input
                    type="text"
                    placeholder="e.g. NITA Solar Grade II"
                    value={formCertName}
                    onChange={(e) => setFormCertName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-neutral-300 focus:border-black outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-800 uppercase block mb-1 text-[10px]">Issuing Institution</label>
                  <input
                    type="text"
                    placeholder="e.g. NITA / EPRA / AA"
                    value={formSchool}
                    onChange={(e) => setFormSchool(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-neutral-300 focus:border-black outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-800 uppercase block mb-1 text-[10px]">License Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. EPRA-T3-2024-99"
                  value={formLicenseNo}
                  onChange={(e) => setFormLicenseNo(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-neutral-300 focus:border-black outline-none font-mono font-bold"
                />
              </div>

              {/* Certification File Upload */}
              <div className="bg-neutral-50 p-3 rounded-xl border border-dashed border-neutral-400 space-y-2">
                <label className="font-bold text-neutral-900 uppercase block text-[10px]">
                  Upload Certificate Document / Image (Instant Verification)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, false)}
                  className="w-full text-xs text-neutral-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-black file:text-white file:font-black file:uppercase file:text-[10px] cursor-pointer"
                />
                {formCertFileName && (
                  <p className="text-[10px] text-emerald-700 font-mono font-bold truncate">
                    ✓ File Selected: {formCertFileName}
                  </p>
                )}
              </div>

              <div>
                <label className="font-bold text-neutral-800 uppercase block mb-1 text-[10px]">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe your practical tools and experience..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-neutral-300 focus:border-black outline-none font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black font-bold uppercase rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase rounded-lg shadow-sm cursor-pointer"
                >
                  Save & Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VERIFY SKILL CERTIFICATE */}
      {/* ========================================================= */}
      {verifyingSkill && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-neutral-800 overflow-hidden shadow-2xl my-auto">
            <div className="bg-black text-white p-3.5 flex items-center justify-between border-b border-neutral-800">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Verify Accreditation Badge
              </h3>
              <button
                onClick={() => setVerifyingSkill(null)}
                className="text-neutral-400 hover:text-white text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="p-4 space-y-3 text-xs">
              <p className="text-neutral-700 font-medium">
                Uploading verification for: <strong className="text-black">{verifyingSkill.skillTitle}</strong>
              </p>

              <div>
                <label className="font-bold text-neutral-800 uppercase block mb-1 text-[10px]">License / Registration #</label>
                <input
                  type="text"
                  placeholder="e.g. EPRA-T3-889"
                  value={verifLicense}
                  onChange={(e) => setVerifLicense(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-neutral-300 focus:border-black outline-none font-mono font-bold"
                />
              </div>

              <div className="bg-neutral-50 p-3 rounded-xl border border-dashed border-neutral-400 space-y-2">
                <label className="font-bold text-neutral-900 uppercase block text-[10px]">
                  Upload Certificate File / Image
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, true)}
                  className="w-full text-xs text-neutral-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:bg-black file:text-white file:font-black file:uppercase file:text-[9px] cursor-pointer"
                />
                {verifFileName && (
                  <p className="text-[10px] text-emerald-700 font-mono font-bold truncate">
                    ✓ Attached: {verifFileName}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVerifyingSkill(null)}
                  className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-black font-bold uppercase rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase rounded-lg cursor-pointer shadow-sm"
                >
                  Confirm & Badge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ORG DETAILS (NITA, EPRA, AA, KALRO, ETC) */}
      {/* ========================================================= */}
      {selectedOrgForModal && (
        <OrgDetailModal
          isOpen={true}
          orgName={selectedOrgForModal.orgName}
          fullSkillCert={selectedOrgForModal.cert}
          onClose={() => setSelectedOrgForModal(null)}
        />
      )}
    </div>
  );
};

export default SkillDashboard;
