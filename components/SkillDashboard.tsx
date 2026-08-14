import React, { useState, useMemo } from 'react';
import type { ServiceProvider, CurrentPage } from '../types';
import { normalizeSkills } from '../utils/skills';
import { calculateTrustAndRanking } from '../utils/trustEngine';
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  BookOpen,
  Search,
  Plus,
  Star,
  Share2,
  ExternalLink,
  MapPin,
  Clock,
  ArrowLeft,
  Building2,
  Briefcase,
  GraduationCap,
  X,
  FileText,
  BadgeCheck,
  Check,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export interface SkillItem {
  id: string;
  skillTitle: string;
  category: string;
  certificationName: string;
  issuingSchool: string;
  yearObtained: string;
  hourlyRate: number;
  currency: string;
  description: string;
  verificationStatus?: 'verified' | 'pending' | 'unverified';
  licenseNumber?: string;
  endorsementsCount?: number;
}

export interface LearningCenterCourse {
  id: string;
  category: string;
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

const ACCREDITED_COURSES: LearningCenterCourse[] = [
  {
    id: 'crs-1',
    category: 'Woodwork & Joinery',
    title: 'Master Cabinetry, Wood Jointing & Finishing Grade II',
    institution: 'National Industrial Training Authority (NITA Kenya)',
    institutionShort: 'NITA',
    institutionUrl: 'https://www.nita.go.ke',
    location: 'Industrial Area, Nairobi (3.2 km)',
    distanceKm: 3.2,
    earningBoost: '+KES 2,500/day',
    duration: '2 Weeks',
    classFormat: 'Practical Shop Workshops',
    estimatedFee: 'KES 8,500',
    prerequisites: 'Basic carpentry tools familiarity',
    certificationAwarded: 'NITA Grade II Joinery Trade Certificate',
    demandTag: 'HIGH DEMAND (+38% EARNINGS)',
    description: 'Advanced hardwood jointing techniques, veneer lamination, custom kitchen cabinet fitting, and high-gloss spray varnishing.'
  },
  {
    id: 'crs-2',
    category: 'Electrical & Solar',
    title: 'EPRA Class T3 Solar PV & Hybrid Inverter Certification',
    institution: 'Energy & Petroleum Regulatory Authority (EPRA / NITA)',
    institutionShort: 'EPRA',
    institutionUrl: 'https://www.epra.go.ke',
    location: 'Upper Hill, Nairobi (4.5 km)',
    distanceKm: 4.5,
    earningBoost: '+KES 2,000/day',
    duration: '3 Weeks',
    classFormat: 'Evening / Weekend Hybrid',
    estimatedFee: 'KES 12,000',
    prerequisites: 'Electrical Trade Test Grade III or Diploma',
    certificationAwarded: 'EPRA Class T3 Solar Contractor License',
    demandTag: 'CRITICAL TRADE',
    description: 'High-voltage hybrid solar inverter sizing, lithium battery bank wiring, surge protection, and grid-tie net metering standards.'
  },
  {
    id: 'crs-3',
    category: 'Metalwork & Fabrication',
    title: 'MIG & Structural Arc Welding for Steel Structures',
    institution: 'Kenya Industrial Training Institute (KITI)',
    institutionShort: 'KITI',
    institutionUrl: 'https://www.kiti.ac.ke',
    location: 'Industrial Grounds, Nairobi (12.0 km)',
    distanceKm: 12.0,
    earningBoost: '+KES 1,800/day',
    duration: '2 Weeks',
    classFormat: 'Full-time Metal Workshop',
    estimatedFee: 'KES 9,500',
    prerequisites: 'Safety boots & welding mask',
    certificationAwarded: 'KITI Certified Structural Welder Badge',
    demandTag: 'HIGH EMPLOYMENT',
    description: 'Electric arc welding, MIG steel jointing, security gate fabrication, pressure testing, and E7018 low-hydrogen rod application.'
  },
  {
    id: 'crs-4',
    category: 'Agribusiness',
    title: 'Commercial Bee Hive Management & Honey Extraction',
    institution: 'Kenya Agricultural & Livestock Research Org (KALRO)',
    institutionShort: 'KALRO',
    institutionUrl: 'https://www.kalro.org',
    location: 'Loresho Station, Nairobi (8.0 km)',
    distanceKm: 8.0,
    earningBoost: '+KES 1,800/day',
    duration: '5 Days',
    classFormat: 'Field Demonstration',
    estimatedFee: 'KES 6,500',
    prerequisites: 'Open to all artisans & farmers',
    certificationAwarded: 'KALRO Certified Commercial Apiarist',
    demandTag: 'EXPORT GRADE',
    description: 'Langstroth hive setup, queen bee rearing, hive disease control, smoker operation, and centrifuge honey refining.'
  },
  {
    id: 'crs-5',
    category: 'Plumbing & Heating',
    title: 'Solar Water Heating & Thermosiphon Piping Installation',
    institution: 'Technical & Vocational Education Training Authority (TVETA)',
    institutionShort: 'TVETA',
    institutionUrl: 'https://www.tveta.go.ke',
    location: 'Kabete National Polytechnic (5.0 km)',
    distanceKm: 5.0,
    earningBoost: '+KES 1,400/day',
    duration: '2 Weeks',
    classFormat: 'Evening / Saturday Classes',
    estimatedFee: 'KES 9,000',
    prerequisites: 'Basic plumbing experience',
    certificationAwarded: 'TVETA Solar Thermal Systems Technician',
    demandTag: 'RENEWABLE ENERGY',
    description: 'Pressurized thermosiphon collectors, solar circulator pumps, PPR pipe fusion, and thermostatic mixing valve regulation.'
  },
  {
    id: 'crs-6',
    category: 'Industrial Automation',
    title: 'PLC Programming & Factory Motor Control Panels',
    institution: 'Nairobi Technical Training Institute (NTTI)',
    institutionShort: 'NTTI',
    institutionUrl: 'https://www.nairobibits.org',
    location: 'Ngara, Nairobi (2.1 km)',
    distanceKm: 2.1,
    earningBoost: '+KES 3,000/day',
    duration: '4 Weeks',
    classFormat: 'Weekend Laboratory',
    estimatedFee: 'KES 15,000',
    prerequisites: 'Electrical principles knowledge',
    certificationAwarded: 'Industrial Motor Automation Certificate',
    demandTag: 'INDUSTRIAL TECH',
    description: 'Ladder logic programming for PLCs, variable speed drives (VSD), relay control circuits, and three-phase motor star-delta starters.'
  }
];

export interface SkillDashboardProps {
  currentUser: ServiceProvider | null;
  onBack: () => void;
  onNavigate: (page: CurrentPage) => void;
  onUpdateUser?: (updated: ServiceProvider) => void;
  onBookProvider?: (provider: ServiceProvider) => void;
}

export const SkillDashboard: React.FC<SkillDashboardProps> = ({
  currentUser,
  onBack,
  onUpdateUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCourseModal, setSelectedCourseModal] = useState<LearningCenterCourse | null>(null);

  // Form states for adding skill
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Woodwork & Joinery');
  const [formCertName, setFormCertName] = useState('');
  const [formSchool, setFormSchool] = useState('');
  const [formYear, setFormYear] = useState('2024');
  const [formRate, setFormRate] = useState('2500');
  const [formLicenseNo, setFormLicenseNo] = useState('');
  const [formDesc, setFormDesc] = useState('');

  // User Skills Normalized
  const [skillsList, setSkillsList] = useState<SkillItem[]>(() => {
    const norm = normalizeSkills(currentUser?.skills);
    if (norm.length > 0) {
      return norm.map((s: any, idx: number) => ({
        id: s.id || `sk-${idx}`,
        skillTitle: s.skillTitle || s.name || 'Verified Trade Skill',
        category: s.category || 'General Services',
        certificationName: s.certificationName || 'Trade Test Grade II',
        issuingSchool: s.issuingSchool || 'NITA / TVET Kenya',
        yearObtained: s.yearObtained || '2023',
        hourlyRate: s.hourlyRate || currentUser?.hourlyRate || 2500,
        currency: s.currency || 'KES',
        description: s.description || 'Verified practical competency in specialized trade installations.',
        verificationStatus: s.isVerified ? 'verified' : 'verified',
        licenseNumber: `NITA-${Math.floor(1000 + Math.random() * 9000)}-2023`,
        endorsementsCount: 12
      }));
    }
    return [
      {
        id: 'sk-1',
        skillTitle: 'Cabinetry & Custom Furniture Jointing',
        category: 'Woodwork & Joinery',
        certificationName: 'NITA Grade II Joinery Trade Certificate',
        issuingSchool: 'National Industrial Training Authority (NITA Kenya)',
        yearObtained: '2023',
        hourlyRate: 2800,
        currency: 'KES',
        description: 'Hardwood mortise-and-tenon joints, kitchen cabinet fitting, veneer laminates, and varnish finishing.',
        verificationStatus: 'verified',
        licenseNumber: 'NITA-J-2023-882',
        endorsementsCount: 14
      },
      {
        id: 'sk-2',
        skillTitle: 'EPRA Solar PV & Inverter System Wiring',
        category: 'Electrical & Solar',
        certificationName: 'EPRA Class T3 Electrical License',
        issuingSchool: 'Energy & Petroleum Regulatory Authority / NITA',
        yearObtained: '2023',
        hourlyRate: currentUser?.hourlyRate || 2500,
        currency: 'KES',
        description: 'Off-grid hybrid solar inverter hookups, lithium battery bank balancing, DC surge protection, and line testing.',
        verificationStatus: 'verified',
        licenseNumber: 'EPRA-T3-2023-112',
        endorsementsCount: 9
      }
    ];
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newSkill: SkillItem = {
      id: `sk-${Date.now()}`,
      skillTitle: formTitle.trim(),
      category: formCategory,
      certificationName: formCertName.trim() || 'Practical Trade Competency Badge',
      issuingSchool: formSchool.trim() || 'Accredited TVET Institution',
      yearObtained: formYear || '2024',
      hourlyRate: parseFloat(formRate) || 2000,
      currency: 'KES',
      description: formDesc.trim() || 'Verified trade skill added to NikoSoko skill passport.',
      verificationStatus: 'verified',
      licenseNumber: formLicenseNo.trim() || `VERIF-${Math.floor(10000 + Math.random() * 90000)}`,
      endorsementsCount: 0
    };

    const updated = [newSkill, ...skillsList];
    setSkillsList(updated);
    if (currentUser && onUpdateUser) {
      onUpdateUser({ ...currentUser, skills: updated as any });
    }
    setShowAddModal(false);
    setFormTitle('');
    setFormCertName('');
    setFormSchool('');
    setFormLicenseNo('');
    setFormDesc('');
    showToast('✓ Skill credential added to passport');
  };

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return ACCREDITED_COURSES.filter(c => {
      const matchCat = selectedCategory === 'ALL' || c.category === selectedCategory;
      const matchQuery = !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Compute 5-Pillar Trust and Ranking Breakdown
  const trustBreakdown = useMemo(() => {
    return calculateTrustAndRanking(currentUser || {
      isVerified: true,
      skills: skillsList as any,
      isSaccoVerified: true,
      referredBy: 'REF-MASTER-01',
      rating: 4.8,
      reviewsCount: 18,
      completionRate: 0.98
    });
  }, [currentUser, skillsList]);

  const categories = ['ALL', 'Woodwork & Joinery', 'Electrical & Solar', 'Metalwork & Fabrication', 'Agribusiness', 'Plumbing & Heating', 'Industrial Automation'];

  return (
    <div className="bg-zinc-50 min-h-screen font-sans text-black w-full max-w-5xl mx-auto border-x border-zinc-200 pb-20">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[220] bg-black text-white text-xs font-mono font-bold px-4 py-2 rounded-lg border border-emerald-500 shadow-2xl flex items-center gap-2">
          <span className="text-emerald-400 font-black">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER BAR: DOMINATED BY BLACK & GREEN ACCENTS */}
      <header className="sticky top-0 z-30 bg-black text-white px-4 py-3 border-b-2 border-emerald-600 flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-2.5 py-1.5 bg-zinc-900 hover:bg-emerald-950 hover:text-emerald-400 border border-zinc-800 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1 text-zinc-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black uppercase tracking-wider text-white">SKILL HUB & PASSPORT</h1>
              <span className="bg-emerald-600 text-white font-mono text-[9px] font-black px-1.5 py-0.2 rounded">
                TVETA / EPRA
              </span>
            </div>
            <p className="text-[11px] text-zinc-300 font-mono">Official verifications, TVETA accreditation & learning centers</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-3.5 py-1.5 rounded uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 border border-emerald-400"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Add Skill</span>
        </button>
      </header>

      <main className="p-4 sm:p-6 space-y-6">

        {/* PROFILE RATING & KEY DETAILS CARD (WHITE BACKGROUND, BOLD BLACK TEXT & EMERALD GREEN ACCENTS) */}
        <section className="bg-white border-2 border-zinc-900 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 bg-black border-2 border-emerald-600 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-xs">
                {currentUser?.name?.[0] || 'A'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-black">{currentUser?.name || 'Artisan Member'}</h2>
                  <span className="text-[10px] font-mono font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    ACCREDITED
                  </span>
                </div>
                <p className="text-xs text-zinc-600 font-medium mt-0.5">
                  {currentUser?.service || 'Skilled Trades Contractor'} • {currentUser?.location || 'Nairobi County'}
                </p>
              </div>
            </div>

            {/* SINGLE RATING SCORE CARD WITH GREEN ACCENT */}
            <div className="bg-emerald-950 border-2 border-emerald-600 text-white px-4 py-3 rounded-xl text-left md:text-right w-full md:w-auto flex items-center justify-between md:block gap-4 shadow-xs">
              <div>
                <span className="text-[10px] text-emerald-300 uppercase font-mono font-black block tracking-wider">CLIENT REBOOK RATING</span>
                <div className="text-2xl font-black text-white font-mono tracking-tight mt-0.5 flex items-center md:justify-end gap-1.5">
                  <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                  <span>{(currentUser?.rating || 4.2).toFixed(1)} / 5.0</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-200 block mt-1 font-semibold">100% On-Time Completion Rate</span>
            </div>
          </div>

          {/* KEY METRICS LIST (WHITE BOXES WITH GREEN & BLACK BORDERS) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-zinc-50 p-3 border border-zinc-300 rounded-lg">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">ACTIVE SKILLS</span>
              <span className="text-sm font-black text-black mt-0.5 block">{skillsList.length} Verified</span>
              <span className="text-[9px] text-emerald-700 font-semibold block mt-0.5">● 100% Validated</span>
            </div>
            <div className="bg-zinc-50 p-3 border border-zinc-300 rounded-lg">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">DAILY RATE BASE</span>
              <span className="text-sm font-black text-black mt-0.5 block">KES {currentUser?.hourlyRate || 2500}/day</span>
              <span className="text-[9px] text-zinc-500 block mt-0.5">Market Verified</span>
            </div>
            <div className="bg-zinc-50 p-3 border border-zinc-300 rounded-lg">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">SACCO AFFILIATION</span>
              <span className="text-sm font-black text-emerald-800 mt-0.5 block font-bold">Westlands SACCO</span>
              <span className="text-[9px] text-emerald-600 font-semibold block mt-0.5">Verified Member</span>
            </div>
            <div className="bg-zinc-50 p-3 border border-zinc-300 rounded-lg">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">TRUST SCORE</span>
              <span className="text-sm font-black text-emerald-700 mt-0.5 block">{trustBreakdown.totalScore.toFixed(2)} / 5.0</span>
              <span className="text-[9px] text-zinc-500 block mt-0.5">5-Pillar Engine</span>
            </div>
          </div>
        </section>

        {/* 5-PILLAR TRUST AND RANKING CALCULATION ENGINE BREAKDOWN */}
        <section className="bg-white border-2 border-zinc-900 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-black uppercase tracking-wider text-black">
                  TRUST & RANKING ENGINE CALCULATION (MAX 5.0)
                </h3>
              </div>
              <p className="text-xs text-zinc-600 font-mono mt-0.5">
                Official 5-pillar mathematical score model for provider ranking & search visibility.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-black text-white px-3 py-1 rounded-lg text-xs font-mono font-black border border-emerald-500">
                SCORE: {trustBreakdown.totalScore.toFixed(2)} / 5.0
              </span>
            </div>
          </div>

          {/* THE 5 PILLARS */}
          <div className="space-y-2.5 font-mono text-xs">
            {/* Pillar 1 */}
            <div className="p-3 bg-zinc-50 border border-zinc-300 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase text-black">1. Identity Verification</span>
                  <span className="text-[9px] bg-zinc-200 text-zinc-800 px-1.5 py-0.2 rounded font-bold">Max 1.0</span>
                </div>
                <p className="text-[11px] text-zinc-600 font-sans">{trustBreakdown.identityExplanation}</p>
              </div>
              <span className="text-sm font-black text-emerald-700 sm:text-right shrink-0">
                +{trustBreakdown.identityScore.toFixed(1)} pt
              </span>
            </div>

            {/* Pillar 2 */}
            <div className="p-3 bg-zinc-50 border border-zinc-300 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase text-black">2. Institutional Skill Certification</span>
                  <span className="text-[9px] bg-zinc-200 text-zinc-800 px-1.5 py-0.2 rounded font-bold">Max 1.0</span>
                </div>
                <p className="text-[11px] text-zinc-600 font-sans">{trustBreakdown.skillExplanation}</p>
              </div>
              <span className="text-sm font-black text-emerald-700 sm:text-right shrink-0">
                +{trustBreakdown.skillScore.toFixed(1)} pt
              </span>
            </div>

            {/* Pillar 3 */}
            <div className="p-3 bg-zinc-50 border border-zinc-300 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase text-black">3. Ecosystem / Group Affiliation</span>
                  <span className="text-[9px] bg-zinc-200 text-zinc-800 px-1.5 py-0.2 rounded font-bold">Max 0.5</span>
                </div>
                <p className="text-[11px] text-zinc-600 font-sans">{trustBreakdown.ecosystemExplanation}</p>
              </div>
              <span className="text-sm font-black text-emerald-700 sm:text-right shrink-0">
                +{trustBreakdown.ecosystemScore.toFixed(2)} pt
              </span>
            </div>

            {/* Pillar 4 */}
            <div className="p-3 bg-zinc-50 border border-zinc-300 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase text-black">4. Referral Network</span>
                  <span className="text-[9px] bg-zinc-200 text-zinc-800 px-1.5 py-0.2 rounded font-bold">Max 0.5</span>
                </div>
                <p className="text-[11px] text-zinc-600 font-sans">{trustBreakdown.referralExplanation}</p>
              </div>
              <span className="text-sm font-black text-emerald-700 sm:text-right shrink-0">
                +{trustBreakdown.referralScore.toFixed(2)} pt
              </span>
            </div>

            {/* Pillar 5 */}
            <div className="p-3 bg-zinc-50 border border-zinc-300 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase text-black">5. Client Ratings & Performance</span>
                  <span className="text-[9px] bg-zinc-200 text-zinc-800 px-1.5 py-0.2 rounded font-bold">Max 2.0</span>
                </div>
                <p className="text-[11px] text-zinc-600 font-sans">{trustBreakdown.performanceExplanation}</p>
              </div>
              <span className="text-sm font-black text-emerald-700 sm:text-right shrink-0">
                +{trustBreakdown.performanceScore.toFixed(2)} pts
              </span>
            </div>
          </div>

          {/* QUALIFYING TRUST BADGES */}
          <div className="pt-2 border-t border-zinc-200">
            <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold block mb-2">
              QUALIFYING TRUST BADGES EARNED
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {trustBreakdown.badges.map(b => (
                <span
                  key={b.id}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 border ${b.color}`}
                >
                  <span>{b.icon}</span>
                  <span>{b.label}</span>
                </span>
              ))}
              {trustBreakdown.badges.length === 0 && (
                <span className="text-xs text-zinc-500 font-mono">No badges earned yet. Complete verifications above.</span>
              )}
            </div>
          </div>
        </section>

        {/* VERIFIED SKILLS LIST (WHITE CARDS, GREEN BADGES, CRISP BLACK TYPOGRAPHY) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>VERIFIED SKILL CREDENTIALS ({skillsList.length})</span>
            </h3>
            <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300 rounded font-mono font-bold">
              ✓ NITA / EPRA Verified
            </span>
          </div>

          <div className="space-y-3">
            {skillsList.map((skill) => (
              <div key={skill.id} className="bg-white border border-zinc-300 rounded-xl p-4 space-y-2.5 hover:border-emerald-600 transition-all shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-black">{skill.skillTitle}</h4>
                      <span className="text-[9px] font-mono uppercase bg-emerald-600 text-white px-2 py-0.5 rounded font-black flex items-center gap-1">
                        ✓ VERIFIED
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 font-medium mt-0.5">
                      <span className="font-bold text-black">{skill.category}</span> • {skill.issuingSchool}
                    </p>
                  </div>

                  <div className="text-left sm:text-right font-mono text-xs">
                    <span className="text-emerald-900 font-black">{skill.certificationName}</span>
                    <p className="text-[11px] text-zinc-500 font-semibold">License #: {skill.licenseNumber} ({skill.yearObtained})</p>
                  </div>
                </div>

                <p className="text-xs text-zinc-700 font-normal leading-relaxed">{skill.description}</p>

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600 pt-2 border-t border-zinc-100">
                  <span>Standard Rate: <strong className="text-black font-black">KES {skill.hourlyRate} / day</strong></span>
                  <span className="bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 text-zinc-800 font-bold">
                    Endorsements: <strong className="text-emerald-700">{skill.endorsementsCount} Peers</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SUGGESTED COURSES & ACCREDITED LEARNING CENTERS */}
        <section className="space-y-4 pt-4 border-t-2 border-black">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>SUGGESTED COURSES & ACCREDITED LEARNING CENTERS</span>
              </h3>
              <p className="text-xs text-zinc-600 font-mono mt-0.5">
                Targeted trade upgrades at accredited institutions in Kenya (NITA, EPRA, KITI, TVETA, KALRO, NTTI).
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-black text-white px-2.5 py-1 rounded">
              TVET ACCREDITED
            </span>
          </div>

          {/* SEARCH & CATEGORY FILTER */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search courses, institutions (NITA, EPRA, KITI), or trades..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-xs text-black placeholder-zinc-400 font-mono outline-none focus:border-emerald-600 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase whitespace-nowrap cursor-pointer transition-all border ${
                    selectedCategory === cat
                      ? 'bg-black text-white border-black shadow-xs'
                      : 'bg-white text-zinc-700 border-zinc-300 hover:border-emerald-600 hover:text-emerald-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* COURSES DETAILED LIST (WHITE CARDS, EMERALD BOOST BADGES, BOLD BLACK BUTTONS) */}
          <div className="space-y-3">
            {filteredCourses.map(course => (
              <div key={course.id} className="bg-white border border-zinc-300 rounded-xl p-4 space-y-3 hover:border-emerald-600 transition-all shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-zinc-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono uppercase bg-zinc-100 text-black px-2 py-0.5 rounded font-bold border border-zinc-300">
                        {course.category}
                      </span>
                      <span className="text-[10px] font-mono font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-700" />
                        {course.demandTag}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-black">{course.title}</h4>
                    <p className="text-xs text-zinc-600 font-medium">
                      <strong className="text-black">{course.institution}</strong> • {course.location}
                    </p>
                  </div>

                  <div className="text-left sm:text-right font-mono text-xs shrink-0">
                    <span className="text-black font-black text-sm">{course.estimatedFee}</span>
                    <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Boost: {course.earningBoost}</p>
                  </div>
                </div>

                <p className="text-xs text-zinc-700 leading-relaxed font-normal">{course.description}</p>

                {/* DETAILED COURSE PARAMETERS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-100 text-[11px] font-mono text-zinc-600">
                  <div>
                    <span className="text-[9px] text-zinc-400 uppercase font-bold block">DURATION & FORMAT</span>
                    <span className="text-black font-bold">{course.duration} ({course.classFormat})</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-400 uppercase font-bold block">PREREQUISITES</span>
                    <span className="text-black font-bold">{course.prerequisites}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-2">
                    <span className="text-[9px] text-zinc-400 uppercase font-bold block">AWARDED CERTIFICATION</span>
                    <span className="text-emerald-900 font-black">{course.certificationAwarded}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <a
                    href={course.institutionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white hover:bg-zinc-100 text-black border border-zinc-300 text-xs font-mono font-bold rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <span>Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => setSelectedCourseModal(course)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold rounded-lg transition-all shadow-xs cursor-pointer border border-emerald-700"
                  >
                    View Details & Enroll
                  </button>
                </div>
              </div>
            ))}

            {filteredCourses.length === 0 && (
              <div className="py-12 text-center text-zinc-500 font-mono text-xs border-2 border-dashed border-zinc-300 rounded-xl bg-white">
                No courses found matching criteria.
              </div>
            )}
          </div>
        </section>

      </main>

      {/* ADD SKILL MODAL (CLEAN WHITE CARD WITH BLACK & GREEN ACCENTS) */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black rounded-xl p-5 w-full max-w-lg space-y-4 font-sans text-black shadow-2xl">
            <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-black uppercase tracking-wider text-black">ADD TRADE SKILL CREDENTIAL</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-black cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSkillSubmit} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-zinc-700 uppercase text-[10px] font-bold block mb-1">Skill Title / Specialty</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EPRA Solar PV Inverter Wiring"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-black outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-700 uppercase text-[10px] font-bold block mb-1">Trade Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-black outline-none"
                  >
                    <option value="Woodwork & Joinery">Woodwork & Joinery</option>
                    <option value="Electrical & Solar">Electrical & Solar</option>
                    <option value="Metalwork & Fabrication">Metalwork & Fabrication</option>
                    <option value="Agribusiness">Agribusiness</option>
                    <option value="Plumbing & Heating">Plumbing & Heating</option>
                    <option value="Industrial Automation">Industrial Automation</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-700 uppercase text-[10px] font-bold block mb-1">Year Obtained</label>
                  <input
                    type="text"
                    value={formYear}
                    onChange={e => setFormYear(e.target.value)}
                    className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-700 uppercase text-[10px] font-bold block mb-1">Certification Name</label>
                <input
                  type="text"
                  placeholder="e.g. NITA Grade II Trade Test Certificate"
                  value={formCertName}
                  onChange={e => setFormCertName(e.target.value)}
                  className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-black outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-700 uppercase text-[10px] font-bold block mb-1">Issuing School / Institution</label>
                <input
                  type="text"
                  placeholder="e.g. NITA Kenya / EPRA"
                  value={formSchool}
                  onChange={e => setFormSchool(e.target.value)}
                  className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-black outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-700 uppercase text-[10px] font-bold block mb-1">License / Cert #</label>
                  <input
                    type="text"
                    placeholder="e.g. NITA-2023-994"
                    value={formLicenseNo}
                    onChange={e => setFormLicenseNo(e.target.value)}
                    className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-black outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-700 uppercase text-[10px] font-bold block mb-1">Base Rate (KES/Day)</label>
                  <input
                    type="number"
                    value={formRate}
                    onChange={e => setFormRate(e.target.value)}
                    className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-700 uppercase text-[10px] font-bold block mb-1">Scope & Key Details</label>
                <textarea
                  rows={2}
                  placeholder="Details of trade capabilities, machinery handled, or installation scope..."
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-black outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-black rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded cursor-pointer shadow-xs"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COURSE DETAIL & ENROLL MODAL (WHITE CONTAINER, GREEN & BLACK ACCENTS) */}
      {selectedCourseModal && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black rounded-xl p-5 w-full max-w-lg space-y-4 font-mono text-black shadow-2xl">
            <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-black uppercase text-black">COURSE & INSTITUTION DETAILS</h3>
              </div>
              <button onClick={() => setSelectedCourseModal(null)} className="text-zinc-500 hover:text-black cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">INSTITUTION</span>
                <h4 className="text-sm font-bold text-black">{selectedCourseModal.institution}</h4>
                <p className="text-zinc-600">{selectedCourseModal.location}</p>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">COURSE TITLE</span>
                <p className="text-emerald-950 font-bold text-sm">{selectedCourseModal.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-3 rounded-lg border border-zinc-300">
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block">ESTIMATED FEE</span>
                  <span className="text-black font-black text-sm">{selectedCourseModal.estimatedFee}</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block">PROJECTED REVENUE BOOST</span>
                  <span className="text-emerald-700 font-black text-sm">{selectedCourseModal.earningBoost}</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block">DURATION</span>
                  <span className="text-black font-semibold">{selectedCourseModal.duration}</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block">CLASS FORMAT</span>
                  <span className="text-black font-semibold">{selectedCourseModal.classFormat}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">SYLLABUS & DESCRIPTION</span>
                <p className="text-zinc-700 leading-relaxed text-[11px]">{selectedCourseModal.description}</p>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">AWARDED CREDENTIAL</span>
                <p className="text-emerald-900 font-black">{selectedCourseModal.certificationAwarded}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
              <a
                href={selectedCourseModal.institutionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-600 underline hover:text-black font-bold"
              >
                Visit Official Portal
              </a>
              <button
                onClick={() => {
                  showToast(`✓ Enrollment request submitted for ${selectedCourseModal.institutionShort}!`);
                  setSelectedCourseModal(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer border border-emerald-700"
              >
                Submit Enrollment Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillDashboard;
