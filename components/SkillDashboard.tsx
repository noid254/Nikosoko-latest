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

interface NearbyAcquireSkill {
  id: string;
  category: 'Electrical' | 'Plumbing' | 'Transport/Boda' | 'Agribusiness' | 'Mechanical' | 'Construction' | 'Joinery';
  title: string;
  institution: string;
  institutionShort: string;
  institutionUrl: string;
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
    category: 'Joinery',
    title: 'Master Cabinetry, Wood Jointing & Finishing',
    institution: 'National Industrial Training Authority (NITA)',
    institutionShort: 'NITA',
    institutionUrl: 'https://www.nita.go.ke',
    location: 'Industrial Area, Nairobi (3.2 km)',
    distanceKm: 3.2,
    earningBoost: '+KES 2,500/day',
    duration: '2 Weeks',
    classFormat: 'Hands-on Workshop',
    estimatedFee: 'KES 8,500',
    prerequisites: 'Basic woodworking tools interest',
    certificationAwarded: 'NITA Grade II Joinery Cert',
    demandTag: '🔥 TOP REVENUE (38%)',
    description: 'Learn hardwood jointing, custom kitchen cabinet fitting, veneer laminates, and varnish finishing.'
  },
  {
    id: 'acq-2',
    category: 'Electrical',
    title: 'EPRA Class T3 Solar PV & Inverter License',
    institution: 'Energy & Petroleum Regulatory Authority / NITA',
    institutionShort: 'EPRA',
    institutionUrl: 'https://www.epra.go.ke',
    location: 'Upper Hill (4.5 km)',
    distanceKm: 4.5,
    earningBoost: '+KES 2,000/day',
    duration: '3 Weeks',
    classFormat: 'Evening Hybrid',
    estimatedFee: 'KES 12,000',
    prerequisites: 'NITA Grade II or Electrical diploma',
    certificationAwarded: 'EPRA Class T3 Solar License',
    demandTag: 'HIGH DEMAND',
    description: 'Qualify for high-voltage hybrid solar inverter installs, net metering, and off-grid battery banks.'
  },
  {
    id: 'acq-3',
    category: 'Mechanical',
    title: 'MIG & Arc Welding for Structural Steel',
    institution: 'Kenya Industrial Training Institute (KITI)',
    institutionShort: 'KITI',
    institutionUrl: 'https://www.kiti.ac.ke',
    location: 'Industrial Grounds (12 km)',
    distanceKm: 12.0,
    earningBoost: '+KES 1,800/day',
    duration: '2 Weeks',
    classFormat: 'Practical Metal Shop',
    estimatedFee: 'KES 9,500',
    prerequisites: 'Safety boots & goggles',
    certificationAwarded: 'KITI Certified Metal Fabrication Badge',
    demandTag: '+25% REVENUE',
    description: 'Master electric arc welding, MIG steel jointing, gate fabrication, and structural testing.'
  },
  {
    id: 'acq-4',
    category: 'Agribusiness',
    title: 'Commercial Apiary & Honey Extraction',
    institution: 'Kenya Agricultural & Livestock Research Org (KALRO)',
    institutionShort: 'KALRO',
    institutionUrl: 'https://www.kalro.org',
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
    category: 'Plumbing',
    title: 'Solar Water Heater & Thermosiphon Piping',
    institution: 'Technical & Vocational Education Authority (TVETA)',
    institutionShort: 'TVETA',
    institutionUrl: 'https://www.tveta.go.ke',
    location: 'Kabete National Polytechnic (5.0 km)',
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

interface JuaKaliMentor {
  id: string;
  name: string;
  craftTitle: string;
  rating: number;
  reviewsCount: number;
  hourlyRate: number;
  location: string;
  experienceYears: number;
  avatarUrl: string;
  specialty: string;
  badge: string;
  availableDays: string;
}

const JUA_KALI_MENTORS: JuaKaliMentor[] = [
  {
    id: 'm-1',
    name: 'Fundi Njoroge',
    craftTitle: 'Master Joiner & Cabinetmaker',
    rating: 4.9,
    reviewsCount: 124,
    hourlyRate: 500,
    location: 'Gikomba Workshop Hub',
    experienceYears: 24,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300',
    specialty: 'Hardwood jointing, kitchen cabinets & wood varnishing',
    badge: 'TOP REVENUE MENTOR',
    availableDays: 'Mon - Sat'
  },
  {
    id: 'm-2',
    name: 'Mama Sarah Otieno',
    craftTitle: 'Industrial Upholstery & Cushioning',
    rating: 4.8,
    reviewsCount: 98,
    hourlyRate: 450,
    location: 'Kamukunji Artisans Market',
    experienceYears: 18,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300',
    specialty: 'Sofa leatherwork, auto interior stitching & foam sizing',
    badge: 'VERIFIED MASTER',
    availableDays: 'Tue - Sun'
  },
  {
    id: 'm-3',
    name: 'Mzee Hassan Kiprop',
    craftTitle: 'Arc & Structural Metal Welder',
    rating: 4.9,
    reviewsCount: 142,
    hourlyRate: 600,
    location: 'Industrial Area Shed 4',
    experienceYears: 30,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300',
    specialty: 'Security gates, MIG welding & steel trusses',
    badge: 'SENIOR ARTISAN',
    availableDays: 'Weekdays'
  },
  {
    id: 'm-4',
    name: 'David Kimani',
    craftTitle: 'Solar PV & Hybrid Inverter Specialist',
    rating: 4.7,
    reviewsCount: 76,
    hourlyRate: 550,
    location: 'Westlands Tech Yard',
    experienceYears: 12,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300',
    specialty: 'Off-grid batteries, inverter wiring & trouble diagnostics',
    badge: 'EPRA CERTIFIED',
    availableDays: 'Sat & Sun'
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
  onUpdateUser
}) => {
  // Skill score out of 5.0 (default 4.2 if not set)
  const skillScore = currentUser?.rating || 4.2;

  // Active user skills state
  const [userSkills, setUserSkills] = useState<SkillCert[]>(() => {
    if (currentUser?.skills && (currentUser.skills as any[]).length > 0) {
      return currentUser.skills as any[];
    }
    return [
      {
        id: 'sk-1',
        skillTitle: 'Joinery & Custom Cabinet Fitting',
        category: 'Construction',
        certificationName: 'NITA Grade II Joinery & Furniture Cert',
        issuingSchool: 'NITA Kenya',
        yearObtained: '2023',
        hourlyRate: 2800,
        currency: 'KES',
        description: 'Custom hardwood jointing, kitchen cabinets, varnish finishing, and doorway frames.',
        portfolioImages: [
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600'
        ],
        verificationStatus: 'verified',
        licenseNumber: 'NITA-J-2023-882'
      },
      {
        id: 'sk-2',
        skillTitle: 'EPRA Certified Solar & Inverter Technician',
        category: 'Electrical',
        certificationName: 'EPRA Class T3 Electrical License',
        issuingSchool: 'EPRA / NITA',
        yearObtained: '2023',
        hourlyRate: currentUser?.hourlyRate || 2500,
        currency: 'KES',
        description: 'Residential solar wiring, inverter hookups, battery banks, and fault diagnosis.',
        portfolioImages: [
          'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600'
        ],
        verificationStatus: 'verified',
        licenseNumber: 'EPRA-T3-2023-112'
      }
    ];
  });

  // Category filter for recommendations
  const [recommendedCategory, setRecommendedCategory] = useState<string>('ALL');

  // Modals & PDP state
  const [selectedOrgForModal, setSelectedOrgForModal] = useState<{ orgName: string; cert?: any } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [verifyingSkill, setVerifyingSkill] = useState<SkillCert | null>(null);
  const [selectedMentorForBooking, setSelectedMentorForBooking] = useState<JuaKaliMentor | null>(null);
  const [showMentorApplyModal, setShowMentorApplyModal] = useState(false);

  // Form fields for Add Skill
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<SkillCert['category']>('Construction');
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

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

  // Mentor booking modal form
  const [mentorDate, setMentorDate] = useState('Tomorrow 10:00 AM');
  const [mentorTopic, setMentorTopic] = useState('Practical hardwood jointing & estimation techniques');

  // Mentor application modal form
  const [mentorCraft, setMentorCraft] = useState('Joinery & Carpentry');
  const [mentorExp, setMentorExp] = useState('10');
  const [mentorRateInput, setMentorRateInput] = useState('500');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
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

  const filteredRecommended = recommendedCategory === 'ALL'
    ? NEARBY_ACQUIRE_SKILLS
    : NEARBY_ACQUIRE_SKILLS.filter(item => item.category === recommendedCategory || (recommendedCategory === 'Joinery' && item.category === 'Joinery'));

  // Speedometer Gauge Angle Calculation
  // Scale 0 to 5.0 mapped to arc -90deg (0) to +90deg (5.0)
  const clampedScore = Math.max(0, Math.min(5.0, skillScore));
  const pointerAngle = -90 + (clampedScore / 5.0) * 180; // degrees

  return (
    <div className="bg-slate-950 min-h-screen font-sans text-slate-100 w-full max-w-5xl mx-auto border-x border-slate-800/80 relative flex flex-col shadow-2xl pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[220] bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl border border-emerald-500/80 animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md text-white px-3 sm:px-6 py-3 border-b border-slate-800/80 flex items-center justify-between gap-2 shadow-md">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-700/70 text-slate-200 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold shrink-0"
            title="Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <h1 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white truncate">SKILL HUB</h1>
            <div className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/50 rounded-full text-[9px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.3)] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden xs:inline">LIVE RATING: </span><span>4.2★</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden xs:flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-full text-xs font-bold text-slate-200">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="User" className="w-4 h-4 rounded-full object-cover shrink-0" />
            ) : (
              <span className="w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-400 flex items-center justify-center text-[10px] font-black shrink-0">
                {currentUser?.name?.[0] || 'A'}
              </span>
            )}
            <span className="truncate max-w-[70px] sm:max-w-[120px]">{currentUser?.name || 'Alex Chen'}</span>
          </div>

          <button
            onClick={() => { resetAddForm(); setShowAddModal(true); }}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black px-2.5 py-1.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer border border-emerald-400 flex items-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.4)] shrink-0"
            title="Add New Skill"
          >
            <span>+ Skill</span>
          </button>
        </div>
      </header>

      {/* SINGLE-PAGE BODY CONTENT */}
      <main className="p-3 sm:p-5 lg:p-6 space-y-6">

        {/* ========================================================= */}
        {/* SECTION 1: SPEED CLOCK DASHBOARD (GAUGE RATING 0 to 5)    */}
        {/* ========================================================= */}
        <section className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                SPEED CLOCK & REVENUE PIE
              </span>
              <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider mt-0.5">
                Skill Scale (0 to 5.0)
              </h2>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono font-black px-2 py-0.5 rounded-md uppercase shrink-0">
              TOP 8% ARTISAN
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* SVG SPEEDOMETER GAUGE WIDGET */}
            <div className="lg:col-span-5 relative flex flex-col items-center justify-center pt-2 pb-1">
              <svg className="w-full max-w-[240px] sm:max-w-[280px] h-auto overflow-visible mx-auto" viewBox="0 0 200 115">
                <defs>
                  {/* Arc gradients for revenue slices */}
                  <linearGradient id="gradJoinery" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                  <linearGradient id="gradWelding" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0284C7" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                  <linearGradient id="gradPlumbing" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#D97706" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                  <linearGradient id="gradElectrical" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                  <linearGradient id="gradPainting" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#E11D48" />
                    <stop offset="100%" stopColor="#F43F5E" />
                  </linearGradient>
                </defs>

                {/* Background Arc Slices */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="url(#gradJoinery)"
                  strokeWidth="18"
                  strokeDasharray="95.5 251.3"
                  strokeDashoffset="0"
                  transform="rotate(-180 100 100)"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="url(#gradWelding)"
                  strokeWidth="18"
                  strokeDasharray="62.8 251.3"
                  strokeDashoffset="-96"
                  transform="rotate(-180 100 100)"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="url(#gradPlumbing)"
                  strokeWidth="18"
                  strokeDasharray="45.2 251.3"
                  strokeDashoffset="-159"
                  transform="rotate(-180 100 100)"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="url(#gradElectrical)"
                  strokeWidth="18"
                  strokeDasharray="30.1 251.3"
                  strokeDashoffset="-205"
                  transform="rotate(-180 100 100)"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="url(#gradPainting)"
                  strokeWidth="18"
                  strokeDasharray="17.6 251.3"
                  strokeDashoffset="-235"
                  transform="rotate(-180 100 100)"
                />

                {/* Ticks & Numbers */}
                <text x="12" y="105" fill="#94A3B8" fontSize="9" fontWeight="900">0</text>
                <text x="32" y="50" fill="#94A3B8" fontSize="9" fontWeight="900">1.0</text>
                <text x="68" y="22" fill="#94A3B8" fontSize="9" fontWeight="900">2.0</text>
                <text x="118" y="22" fill="#94A3B8" fontSize="9" fontWeight="900">3.0</text>
                <text x="156" y="50" fill="#94A3B8" fontSize="9" fontWeight="900">4.0</text>
                <text x="178" y="105" fill="#10B981" fontSize="10" fontWeight="900">5.0</text>

                {/* POINTER NEEDLE */}
                <g transform={`rotate(${pointerAngle} 100 100)`}>
                  <polygon points="100,28 96,100 104,100" fill="#10B981" />
                  <line x1="100" y1="25" x2="100" y2="100" stroke="#000000" strokeWidth="1" />
                  <circle cx="100" cy="100" r="10" fill="#0F172A" stroke="#10B981" strokeWidth="3" />
                  <circle cx="100" cy="100" r="4" fill="#10B981" />
                </g>
              </svg>

              {/* Readout Display inside Gauge */}
              <div className="text-center -mt-3">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                    {skillScore.toFixed(1)}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-emerald-400">/ 5.0</span>
                </div>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">
                  YOUR SKILL SPEEDOMETER
                </p>
              </div>
            </div>

            {/* REVENUE PIE BREAKDOWN LEGEND */}
            <div className="lg:col-span-7 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 gap-2">
                <span className="truncate">MARKET REVENUE DISTRIBUTION (WHY JOINERY LEADS)</span>
                <span className="text-emerald-400 shrink-0">🔥 38% BIGGEST PIE</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {/* Slice 1: Joinery */}
                <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="font-bold text-slate-200 truncate text-[11px]">Joinery</span>
                  </div>
                  <span className="font-black text-emerald-400 text-xs shrink-0">38%</span>
                </div>

                {/* Slice 2: Welding */}
                <div className="p-2 rounded-xl bg-cyan-950/50 border border-cyan-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
                    <span className="font-bold text-slate-200 truncate text-[11px]">Welding</span>
                  </div>
                  <span className="font-black text-cyan-400 text-xs shrink-0">25%</span>
                </div>

                {/* Slice 3: Plumbing */}
                <div className="p-2 rounded-xl bg-amber-950/50 border border-amber-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="font-bold text-slate-200 truncate text-[11px]">Plumbing</span>
                  </div>
                  <span className="font-black text-amber-400 text-xs shrink-0">18%</span>
                </div>

                {/* Slice 4: Electrical */}
                <div className="p-2 rounded-xl bg-purple-950/50 border border-purple-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0" />
                    <span className="font-bold text-slate-200 truncate text-[11px]">Electrical</span>
                  </div>
                  <span className="font-black text-purple-400 text-xs shrink-0">12%</span>
                </div>

                {/* Slice 5: Painting */}
                <div className="p-2 rounded-xl bg-rose-950/50 border border-rose-500/40 flex items-center justify-between col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
                    <span className="font-bold text-slate-200 truncate text-[11px]">Painting</span>
                  </div>
                  <span className="font-black text-rose-400 text-xs shrink-0">7%</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-medium pt-1 leading-relaxed">
                💡 <strong>Market Insight:</strong> Joinery & Carpentry represents the largest slice of client spending (avg KES 48,000/project). Adding cabinetry or timber finishing boosts your speed rating fast.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: YOUR ACTIVE SKILLS & BADGES                     */}
        {/* ========================================================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span>⚡ YOUR VERIFIED SKILLS & BADGES ({userSkills.length})</span>
            </h3>
            <button
              onClick={() => { resetAddForm(); setShowAddModal(true); }}
              className="text-emerald-400 hover:text-emerald-300 text-xs font-bold uppercase cursor-pointer"
            >
              + Add Skill
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userSkills.map((skill, idx) => {
              const isVerified = skill.verificationStatus === 'verified';

              return (
                <div
                  key={skill.id ? `sk_${skill.id}_${idx}` : `sk_${idx}`}
                  className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-2 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="font-black text-xs text-white uppercase tracking-wider truncate">
                            {skill.skillTitle}
                          </h4>
                          {isVerified ? (
                            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500/50 text-[9px] font-black rounded-md uppercase tracking-wider shrink-0">
                              ✓ VERIFIED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-500/50 text-[9px] font-black rounded-md uppercase tracking-wider shrink-0">
                              UNVERIFIED
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                          {skill.certificationName} &bull; <strong className="text-slate-300">{skill.issuingSchool}</strong>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-emerald-400 block">
                          KES {(skill.hourlyRate || 0).toLocaleString()}/day
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-normal line-clamp-2 leading-relaxed">
                      {skill.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
                    {skill.licenseNumber ? (
                      <span className="text-[10px] font-mono text-slate-400 font-bold truncate">
                        REG #: {skill.licenseNumber}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">No license # uploaded</span>
                    )}

                    {!isVerified && (
                      <button
                        onClick={() => setVerifyingSkill(skill)}
                        className="px-2.5 py-1 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase rounded-lg hover:bg-emerald-400 cursor-pointer transition-all shrink-0"
                      >
                        Verify License
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: RECOMMENDED SKILLS & ACCREDITED TVET INSTITUTIONS */}
        {/* ========================================================= */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>🎓 HIGH-DEMAND SKILLS & TVET INSTITUTIONS</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Accredited institutions offering practical craft upgrades in Kenya.
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {['ALL', 'Joinery', 'Electrical', 'Plumbing', 'Agribusiness', 'Mechanical'].map((cat) => (
              <button
                key={cat}
                onClick={() => setRecommendedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all border ${
                  recommendedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {cat === 'ALL' ? '🌐 All Courses' : cat}
              </button>
            ))}
          </div>

          {/* List of Recommended Skill Courses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecommended.map((course, idx) => {
              const isSaved = enrolledCourseIds.includes(course.id);

              return (
                <div
                  key={course.id ? `crs_${course.id}_${idx}` : `crs_${idx}`}
                  className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-md hover:border-emerald-500/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                      <div className="min-w-0">
                        <span className="text-[9px] font-black bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                          {course.demandTag}
                        </span>
                        <h4 className="font-black text-sm text-white uppercase tracking-wider mt-1.5 leading-snug">
                          {course.title}
                        </h4>
                        <p className="text-xs text-slate-300 font-bold mt-0.5 truncate">
                          🏛️ {course.institution}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-emerald-400 block">
                          {course.earningBoost}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          {course.estimatedFee}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-normal leading-relaxed line-clamp-3">
                      {course.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <div className="truncate">
                        <strong className="text-slate-300">Duration:</strong> {course.duration} ({course.classFormat})
                      </div>
                      <div className="truncate">
                        <strong className="text-slate-300">Location:</strong> {course.location}
                      </div>
                      <div className="truncate">
                        <strong className="text-slate-300">Prerequisites:</strong> {course.prerequisites}
                      </div>
                      <div className="truncate">
                        <strong className="text-slate-300">Award:</strong> {course.certificationAwarded}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 mt-auto">
                    <button
                      onClick={() => {
                        if (isSaved) {
                          setEnrolledCourseIds(prev => prev.filter(id => id !== course.id));
                          showToast('Removed from saved list');
                        } else {
                          setEnrolledCourseIds(prev => [...prev, course.id]);
                          showToast(`✓ Registered interest in ${course.institutionShort}`);
                        }
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        isSaved
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      }`}
                    >
                      {isSaved ? '✓ Enrolled / Interested' : '🎓 Register Interest'}
                    </button>

                    <a
                      href={course.institutionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-2 bg-emerald-950/90 hover:bg-emerald-900/90 text-emerald-400 hover:text-emerald-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-emerald-500/50 flex items-center gap-1 shrink-0"
                      title={`Visit official ${course.institutionShort} website`}
                    >
                      <span>🌐 Visit Website</span>
                    </a>

                    <button
                      onClick={() => setSelectedOrgForModal({ orgName: course.institutionShort })}
                      className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border border-slate-700 shrink-0"
                    >
                      Campus Info
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: JUA KALI MENTOR NETWORK (EARN FROM MENTORING)  */}
        {/* ========================================================= */}
        <section className="space-y-3 pt-3">
          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-3xl p-4 sm:p-5 space-y-3 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/90 border border-emerald-500/40 px-2 py-0.5 rounded-md inline-block">
                  JUA KALI ARTISAN MENTORSHIP
                </span>
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white mt-1.5">
                  Learn Practical Crafts or Earn as a Mentor
                </h3>
                <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed">
                  Top-rated Jua Kali master artisans share hands-on workshop techniques 1-on-1 and earn hourly mentoring fees.
                </p>
              </div>

              <button
                onClick={() => setShowMentorApplyModal(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black px-3 py-2 rounded-xl uppercase tracking-wider shrink-0 transition-all cursor-pointer border border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)] self-start"
              >
                + Become Mentor
              </button>
            </div>

            {/* List of Master Mentors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {JUA_KALI_MENTORS.map((mentor) => (
                <div
                  key={mentor.id}
                  className="bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800 space-y-2.5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={mentor.avatarUrl}
                          alt={mentor.name}
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover border-2 border-emerald-500/60 shadow-md shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-black text-xs text-white uppercase tracking-wider truncate">
                              {mentor.name}
                            </h4>
                            <span className="text-[9px] font-black bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded uppercase shrink-0">
                              {mentor.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 font-bold mt-0.5 truncate">
                            {mentor.craftTitle} &bull; <strong className="text-emerald-400">{mentor.experienceYears} Yrs Exp</strong>
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium truncate">
                            📍 {mentor.location} ({mentor.availableDays})
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 justify-end text-xs font-black text-emerald-400">
                          <span>★ {mentor.rating}</span>
                          <span className="text-[10px] text-slate-400">({mentor.reviewsCount})</span>
                        </div>
                        <span className="text-xs font-black text-white block mt-0.5">
                          KES {mentor.hourlyRate}/hr
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-normal bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 leading-relaxed">
                      🔧 <strong>Mentorship focus:</strong> {mentor.specialty}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 mt-auto">
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
                      ✓ Earns from paid 1-on-1 sessions
                    </span>
                    <button
                      onClick={() => setSelectedMentorForBooking(mentor)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all shadow-sm shrink-0 text-center"
                    >
                      Book 1-on-1 Session &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================= */}
      {/* MODAL: ADD NEW SKILL (WITH CERTIFICATE UPLOAD)             */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full border border-slate-800 overflow-hidden shadow-2xl my-auto max-h-[90vh] flex flex-col">
            <div className="bg-slate-950 text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-black text-base">⚡</span>
                <h3 className="text-xs font-black uppercase tracking-wider">Add & Verify Skill</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSkillSubmit} className="p-4 space-y-3 text-xs overflow-y-auto flex-1">
              <div>
                <label className="font-bold text-slate-300 uppercase block mb-1 text-[10px]">Skill Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Joinery & Custom Cabinet Fitting"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-300 uppercase block mb-1 text-[10px]">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 outline-none font-bold"
                  >
                    <option value="Construction">Joinery / Carpentry</option>
                    <option value="Electrical">Electrical & Solar</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Transport/Boda">Transport/Boda</option>
                    <option value="Agribusiness">Agribusiness</option>
                    <option value="Mechanic">Mechanic / Welder</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 uppercase block mb-1 text-[10px]">Daily Rate (KES)</label>
                  <input
                    type="number"
                    value={formRate}
                    onChange={(e) => setFormRate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-300 uppercase block mb-1 text-[10px]">Certification / Course</label>
                  <input
                    type="text"
                    placeholder="e.g. NITA Joinery Grade II"
                    value={formCertName}
                    onChange={(e) => setFormCertName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 uppercase block mb-1 text-[10px]">Issuing Institution</label>
                  <input
                    type="text"
                    placeholder="e.g. NITA / TVETA / EPRA"
                    value={formSchool}
                    onChange={(e) => setFormSchool(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 uppercase block mb-1 text-[10px]">License Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. NITA-J-2024-99"
                  value={formLicenseNo}
                  onChange={(e) => setFormLicenseNo(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 outline-none font-mono font-bold"
                />
              </div>

              {/* Certificate Upload */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-dashed border-slate-700 space-y-2">
                <label className="font-bold text-slate-200 uppercase block text-[10px]">
                  Upload Certificate Document / Image (Instant Verification)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, false)}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-emerald-500 file:text-slate-950 file:font-black file:uppercase file:text-[10px] cursor-pointer"
                />
                {formCertFileName && (
                  <p className="text-[10px] text-emerald-400 font-mono font-bold truncate">
                    ✓ File Selected: {formCertFileName}
                  </p>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-300 uppercase block mb-1 text-[10px]">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe your practical tools and experience..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 outline-none font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold uppercase rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase rounded-xl shadow-sm cursor-pointer"
                >
                  Save & Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VERIFY SKILL CERTIFICATE                            */}
      {/* ========================================================= */}
      {verifyingSkill && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-sm w-full border border-slate-800 overflow-hidden shadow-2xl my-auto max-h-[90vh] flex flex-col">
            <div className="bg-slate-950 text-white p-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Verify Accreditation Badge
              </h3>
              <button
                onClick={() => setVerifyingSkill(null)}
                className="text-slate-400 hover:text-white text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="p-4 space-y-3 text-xs overflow-y-auto flex-1">
              <p className="text-slate-300 font-medium">
                Uploading verification for: <strong className="text-white">{verifyingSkill.skillTitle}</strong>
              </p>

              <div>
                <label className="font-bold text-slate-300 uppercase block mb-1 text-[10px]">License / Registration #</label>
                <input
                  type="text"
                  placeholder="e.g. NITA-J-889"
                  value={verifLicense}
                  onChange={(e) => setVerifLicense(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 outline-none font-mono font-bold"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-dashed border-slate-700 space-y-2">
                <label className="font-bold text-slate-200 uppercase block text-[10px]">
                  Upload Certificate File / Image
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, true)}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-emerald-500 file:text-slate-950 file:font-black file:uppercase file:text-[9px] cursor-pointer"
                />
                {verifFileName && (
                  <p className="text-[10px] text-emerald-400 font-mono font-bold truncate">
                    ✓ Attached: {verifFileName}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVerifyingSkill(null)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold uppercase rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase rounded-xl cursor-pointer shadow-sm"
                >
                  Confirm & Badge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: BOOK 1-ON-1 JUA KALI MENTOR SESSION                 */}
      {/* ========================================================= */}
      {selectedMentorForBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-sm w-full border border-slate-800 overflow-hidden shadow-2xl my-auto max-h-[90vh] flex flex-col">
            <div className="bg-slate-950 text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-black text-base">🛠️</span>
                <h3 className="text-xs font-black uppercase tracking-wider">Book Mentorship Session</h3>
              </div>
              <button
                onClick={() => setSelectedMentorForBooking(null)}
                className="text-slate-400 hover:text-white text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs overflow-y-auto flex-1">
              <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                <img
                  src={selectedMentorForBooking.avatarUrl}
                  alt={selectedMentorForBooking.name}
                  className="w-10 h-10 rounded-xl object-cover border border-emerald-500/50 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-black text-white text-xs truncate">{selectedMentorForBooking.name}</h4>
                  <p className="text-[10px] text-emerald-400 font-bold truncate">{selectedMentorForBooking.craftTitle}</p>
                  <p className="text-[9px] text-slate-400 truncate">Rate: KES {selectedMentorForBooking.hourlyRate}/hr &bull; {selectedMentorForBooking.location}</p>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 uppercase block mb-1 text-[10px]">Preferred Session Time</label>
                <input
                  type="text"
                  value={mentorDate}
                  onChange={(e) => setMentorDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 outline-none font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 uppercase block mb-1 text-[10px]">Workshop Topic / Skill Focus</label>
                <textarea
                  rows={2}
                  value={mentorTopic}
                  onChange={(e) => setMentorTopic(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 outline-none font-medium"
                />
              </div>

              <div className="bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-500/40 text-[10px] text-emerald-300 font-medium leading-relaxed">
                💡 Mentorship fees are held in escrow and released directly to the artisan upon completion of your 1-on-1 session.
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMentorForBooking(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold uppercase rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMentorForBooking(null);
                    showToast(`✓ Mentorship session requested with ${selectedMentorForBooking.name}!`);
                  }}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase rounded-xl shadow-sm cursor-pointer"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: BECOME A JUA KALI MENTOR                            */}
      {/* ========================================================= */}
      {showMentorApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-sm w-full border border-slate-800 overflow-hidden shadow-2xl my-auto max-h-[90vh] flex flex-col">
            <div className="bg-slate-950 text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-black text-base">⭐</span>
                <h3 className="text-xs font-black uppercase tracking-wider">Become a Jua Kali Mentor</h3>
              </div>
              <button
                onClick={() => setShowMentorApplyModal(false)}
                className="text-slate-400 hover:text-white text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowMentorApplyModal(false);
                showToast('✓ Mentor application submitted! Verification badge active.');
              }}
              className="p-4 space-y-3 text-xs overflow-y-auto flex-1"
            >
              <p className="text-slate-300 font-medium leading-relaxed">
                Pass on your practical craft skills to upcoming artisans and earn extra hourly revenue.
              </p>

              <div>
                <label className="font-bold text-slate-300 uppercase block mb-1 text-[10px]">Your Primary Craft / Specialty</label>
                <input
                  type="text"
                  required
                  value={mentorCraft}
                  onChange={(e) => setMentorCraft(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-300 uppercase block mb-1 text-[10px]">Years of Practical Exp</label>
                  <input
                    type="number"
                    value={mentorExp}
                    onChange={(e) => setMentorExp(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 uppercase block mb-1 text-[10px]">Mentoring Rate (KES/hr)</label>
                  <input
                    type="number"
                    value={mentorRateInput}
                    onChange={(e) => setMentorRateInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 outline-none font-bold"
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] text-slate-400 font-medium">
                🔒 Requirements: Must have a verified profile and minimum 4.0 rating or NITA certification.
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMentorApplyModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold uppercase rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase rounded-xl shadow-sm cursor-pointer"
                >
                  Submit & Earn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ORG DETAILS (NITA, EPRA, AA, KALRO, TVETA)          */}
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
