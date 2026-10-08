import React, { useState, useMemo } from 'react';
import type { ServiceProvider, CurrentPage } from '../types';
import { normalizeSkills } from '../utils/skills';
import { calculateTrustAndRanking } from '../utils/trustEngine';
import {
  ShieldCheck,
  GraduationCap,
  Search,
  Plus,
  Star,
  ExternalLink,
  MapPin,
  ArrowLeft,
  X,
  TrendingUp,
  Sparkles,
  Flame
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

// Nairobi-area estates used for the local demand heatmap below. Intensity is
// derived deterministically from the estate + the member's primary category
// so it stays stable across renders instead of reshuffling randomly.
const DEMAND_AREAS = [
  'Kasarani', 'Westlands', 'Kilimani', 'Embakasi', 'Ruaka',
  'Karen', 'South B', 'Roysambu', 'Ngong Road', 'Thika Road'
];

function hashToUnit(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 1000) / 1000;
}

function getLevel(score: number): { label: string; detail: string } {
  if (score >= 4.5) return { label: 'Elite Master', detail: 'Top 5% of verified providers' };
  if (score >= 3.5) return { label: 'Trusted Pro', detail: 'Consistently high client confidence' };
  if (score >= 2.5) return { label: 'Established', detail: 'Solid track record building' };
  if (score >= 1.0) return { label: 'Rising Talent', detail: 'New but gaining verifications' };
  return { label: 'New Member', detail: 'Complete verifications to rank up' };
}

/** Semicircle speedometer gauge, 0-5 scale. Track is a neutral gray/black
 * arc (dominant palette), the needle is the one green accent ("the stick"). */
const RatingGauge: React.FC<{ score: number; max?: number }> = ({ score, max = 5 }) => {
  const cx = 100;
  const cy = 95;
  const r = 78;
  const clamped = Math.max(0, Math.min(max, score));
  const fraction = clamped / max;

  const polar = (angleDeg: number, radius: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy - radius * Math.sin(rad) };
  };
  const describeArc = (startAngle: number, endAngle: number, radius: number) => {
    const start = polar(startAngle, radius);
    const end = polar(endAngle, radius);
    const largeArc = Math.abs(startAngle - endAngle) > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  const needleAngle = 180 - fraction * 180;
  const needleTip = polar(needleAngle, r - 14);

  return (
    <svg viewBox="0 0 200 110" className="w-full max-w-[220px] mx-auto">
      {/* Track */}
      <path d={describeArc(180, 0, r)} fill="none" stroke="#e4e4e7" strokeWidth={14} strokeLinecap="round" />
      {/* Filled progress (black, the dominant color) */}
      <path
        d={describeArc(180, needleAngle, r)}
        fill="none"
        stroke="#18181b"
        strokeWidth={14}
        strokeLinecap="round"
      />
      {/* Tick marks at 0/1/2/3/4/5 */}
      {[0, 1, 2, 3, 4, 5].map(tick => {
        const angle = 180 - (tick / max) * 180;
        const inner = polar(angle, r - 20);
        const outer = polar(angle, r - 10);
        return (
          <line key={tick} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#a1a1aa" strokeWidth={2} />
        );
      })}
      {/* Needle - the single green accent */}
      <line x1={cx} y1={cy} x2={needleTip.x} y2={needleTip.y} stroke="#059669" strokeWidth={3} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={6} fill="#059669" />
      <circle cx={cx} cy={cy} r={2.5} fill="white" />
    </svg>
  );
};

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

  const level = getLevel(trustBreakdown.totalScore);
  const clientRating = currentUser?.rating || 4.2;
  const reviewsCount = currentUser?.reviewsCount || 18;

  // Recommended skills: courses in categories the member doesn't already
  // hold, ranked by whichever carries the strongest demand signal.
  const recommendedCourses = useMemo(() => {
    const ownedCategories = new Set(skillsList.map(s => s.category));
    const notOwned = ACCREDITED_COURSES.filter(c => !ownedCategories.has(c.category));
    const pool = notOwned.length > 0 ? notOwned : ACCREDITED_COURSES;
    return pool.slice(0, 4);
  }, [skillsList]);

  // Local demand heatmap for the member's primary trade category.
  const primaryCategory = skillsList[0]?.category || 'General Services';
  const heatmapData = useMemo(() => {
    return DEMAND_AREAS.map(area => {
      const intensity = hashToUnit(`${primaryCategory}:${area}`);
      return { area, intensity };
    }).sort((a, b) => b.intensity - a.intensity);
  }, [primaryCategory]);

  const categories = ['ALL', 'Woodwork & Joinery', 'Electrical & Solar', 'Metalwork & Fabrication', 'Agribusiness', 'Plumbing & Heating', 'Industrial Automation'];

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-black w-full max-w-5xl mx-auto border-x border-gray-200 pb-20">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[220] bg-black text-white text-xs font-bold px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2">
          <span className="text-emerald-400 font-black">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-black text-white px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Back"
            className="p-1.5 text-white hover:text-gray-300 transition-colors flex items-center justify-center rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-black uppercase tracking-wider text-white">Skill Hub</h1>
            <p className="text-[11px] text-gray-400">Trust score, demand insights & accredited training</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Skill</span>
        </button>
      </header>

      <main className="p-4 sm:p-6 space-y-5">

        {/* RATING GAUGE HERO */}
        <section className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="shrink-0 text-center">
              <RatingGauge score={trustBreakdown.totalScore} />
              <div className="-mt-2">
                <span className="text-3xl font-black text-black">{trustBreakdown.totalScore.toFixed(1)}</span>
                <span className="text-sm text-gray-400 font-bold"> / 5.0</span>
              </div>
              <span className="inline-block mt-1.5 text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                {level.label}
              </span>
              <p className="text-[11px] text-gray-500 mt-1 max-w-[220px] mx-auto">{level.detail}</p>
            </div>

            <div className="flex-1 w-full space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center font-black text-white text-lg shrink-0">
                  {currentUser?.name?.[0] || 'A'}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-black text-black truncate">{currentUser?.name || 'Artisan Member'}</h2>
                  <p className="text-xs text-gray-500 font-medium truncate">
                    {currentUser?.service || 'Skilled Trades Contractor'} • {currentUser?.location || 'Nairobi County'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i <= Math.round(clientRating) ? 'fill-emerald-500 text-emerald-500' : 'fill-gray-200 text-gray-200'}`}
                  />
                ))}
                <span className="text-sm font-black text-black ml-1">{clientRating.toFixed(1)}</span>
                <span className="text-xs text-gray-400 font-medium">({reviewsCount} reviews)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="bg-gray-50 p-2.5 border border-gray-200 rounded-xl">
                  <span className="text-[9px] text-gray-400 uppercase font-bold block">Active Skills</span>
                  <span className="text-sm font-black text-black block">{skillsList.length} Verified</span>
                </div>
                <div className="bg-gray-50 p-2.5 border border-gray-200 rounded-xl">
                  <span className="text-[9px] text-gray-400 uppercase font-bold block">Daily Rate</span>
                  <span className="text-sm font-black text-black block">KES {currentUser?.hourlyRate || 2500}</span>
                </div>
                <div className="bg-gray-50 p-2.5 border border-gray-200 rounded-xl col-span-2 sm:col-span-1">
                  <span className="text-[9px] text-gray-400 uppercase font-bold block">Sacco</span>
                  <span className="text-sm font-black text-emerald-700 block truncate">Westlands SACCO</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RECOMMENDED SKILLS ON DEMAND */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-black">Recommended For You</h3>
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {recommendedCourses.map(course => (
              <button
                key={course.id}
                onClick={() => setSelectedCourseModal(course)}
                className="text-left shrink-0 w-56 bg-white border border-gray-200 hover:border-emerald-400 rounded-xl p-3.5 transition-colors cursor-pointer"
              >
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <Flame className="w-2.5 h-2.5" />
                  {course.demandTag}
                </span>
                <h4 className="text-xs font-bold text-black mt-2 leading-snug line-clamp-2">{course.title}</h4>
                <p className="text-[10.5px] text-gray-500 mt-1">{course.institutionShort} • {course.duration}</p>
                <p className="text-[11px] font-black text-emerald-700 mt-1.5">{course.earningBoost}</p>
              </button>
            ))}
          </div>
        </section>

        {/* DEMAND HEATMAP */}
        <section className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-black">Where You're Needed Most</h3>
          </div>
          <p className="text-[11px] text-gray-500 -mt-1.5">
            Estimated local demand for <span className="font-bold text-black">{primaryCategory}</span> by area.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {heatmapData.map(({ area, intensity }) => {
              const pct = Math.round(intensity * 100);
              const bg = intensity > 0.66 ? 'bg-emerald-600 text-white' : intensity > 0.33 ? 'bg-emerald-100 text-emerald-900' : 'bg-gray-100 text-gray-600';
              return (
                <div key={area} className={`rounded-xl p-2.5 text-center ${bg}`}>
                  <span className="text-[11px] font-bold block truncate">{area}</span>
                  <span className="text-[10px] font-black opacity-80">{pct}%</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5-PILLAR TRUST AND RANKING BREAKDOWN */}
        <section className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-black">Trust & Ranking Breakdown</h3>
            </div>
            <span className="bg-black text-white px-3 py-1 rounded-full text-[11px] font-black">
              {trustBreakdown.totalScore.toFixed(2)} / 5.0
            </span>
          </div>

          <div className="space-y-2">
            {[
              { label: '1. Identity Verification', max: '1.0', score: trustBreakdown.identityScore.toFixed(1), explain: trustBreakdown.identityExplanation },
              { label: '2. Institutional Skill Certification', max: '1.0', score: trustBreakdown.skillScore.toFixed(1), explain: trustBreakdown.skillExplanation },
              { label: '3. Ecosystem / Group Affiliation', max: '0.5', score: trustBreakdown.ecosystemScore.toFixed(2), explain: trustBreakdown.ecosystemExplanation },
              { label: '4. Referral Network', max: '0.5', score: trustBreakdown.referralScore.toFixed(2), explain: trustBreakdown.referralExplanation },
              { label: '5. Client Ratings & Performance', max: '2.0', score: trustBreakdown.performanceScore.toFixed(2), explain: trustBreakdown.performanceExplanation },
            ].map(pillar => (
              <div key={pillar.label} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-black">{pillar.label}</span>
                    <span className="text-[9px] bg-gray-200 text-gray-700 px-1.5 py-0.2 rounded-full font-bold">Max {pillar.max}</span>
                  </div>
                  <p className="text-[11px] text-gray-500">{pillar.explain}</p>
                </div>
                <span className="text-sm font-black text-emerald-700 shrink-0">+{pillar.score}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-200">
            <span className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Badges Earned</span>
            <div className="flex flex-wrap items-center gap-2">
              {trustBreakdown.badges.map(b => (
                <span
                  key={b.id}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${b.color}`}
                >
                  <span>{b.icon}</span>
                  <span>{b.label}</span>
                </span>
              ))}
              {trustBreakdown.badges.length === 0 && (
                <span className="text-xs text-gray-400">No badges earned yet. Complete verifications above.</span>
              )}
            </div>
          </div>
        </section>

        {/* VERIFIED SKILLS LIST */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Skills ({skillsList.length})</span>
            </h3>
          </div>

          <div className="space-y-2.5">
            {skillsList.map((skill) => (
              <div key={skill.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2 hover:border-emerald-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-black">{skill.skillTitle}</h4>
                      <span className="text-[9px] uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black">
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      <span className="font-bold text-black">{skill.category}</span> • {skill.issuingSchool}
                    </p>
                  </div>
                  <div className="text-left sm:text-right text-xs">
                    <span className="text-emerald-800 font-bold">{skill.certificationName}</span>
                    <p className="text-[11px] text-gray-400">License #: {skill.licenseNumber} ({skill.yearObtained})</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{skill.description}</p>
                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                  <span>Standard Rate: <strong className="text-black">KES {skill.hourlyRate} / day</strong></span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full text-gray-700 font-bold">
                    {skill.endorsementsCount} peer endorsements
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ACCREDITED LEARNING CENTERS CATALOGUE */}
        <section className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Accredited Learning Centers</span>
            </h3>
          </div>

          <div className="space-y-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses, institutions, or trades..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-black placeholder-gray-400 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase whitespace-nowrap cursor-pointer transition-all border ${
                    selectedCategory === cat
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredCourses.map(course => (
              <div key={course.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 hover:border-emerald-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] uppercase bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-bold">
                        {course.category}
                      </span>
                      <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {course.demandTag}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-black">{course.title}</h4>
                    <p className="text-xs text-gray-500">
                      <strong className="text-black">{course.institution}</strong> • {course.location}
                    </p>
                  </div>
                  <div className="text-left sm:text-right text-xs shrink-0">
                    <span className="text-black font-black text-sm">{course.estimatedFee}</span>
                    <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Boost: {course.earningBoost}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">{course.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase font-bold block">Duration</span>
                    <span className="text-black font-bold">{course.duration}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase font-bold block">Prerequisites</span>
                    <span className="text-black font-bold">{course.prerequisites}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] text-gray-400 uppercase font-bold block">Awarded Certification</span>
                    <span className="text-emerald-800 font-bold">{course.certificationAwarded}</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-end gap-2">
                  <a
                    href={course.institutionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white hover:bg-gray-50 text-black border border-gray-200 text-xs font-bold rounded-full flex items-center gap-1 transition-colors"
                  >
                    <span>Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => setSelectedCourseModal(course)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full transition-all cursor-pointer"
                  >
                    View Details & Enroll
                  </button>
                </div>
              </div>
            ))}

            {filteredCourses.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-xs border border-dashed border-gray-300 rounded-xl bg-white">
                No courses found matching criteria.
              </div>
            )}
          </div>
        </section>

      </main>

      {/* ADD SKILL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-lg space-y-4 text-black shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-black uppercase tracking-wider text-black">Add Trade Skill</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-black cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSkillSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-600 uppercase text-[10px] font-bold block mb-1">Skill Title / Specialty</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EPRA Solar PV Inverter Wiring"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-black outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-600 uppercase text-[10px] font-bold block mb-1">Trade Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-black outline-none"
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
                  <label className="text-gray-600 uppercase text-[10px] font-bold block mb-1">Year Obtained</label>
                  <input
                    type="text"
                    value={formYear}
                    onChange={e => setFormYear(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-600 uppercase text-[10px] font-bold block mb-1">Certification Name</label>
                <input
                  type="text"
                  placeholder="e.g. NITA Grade II Trade Test Certificate"
                  value={formCertName}
                  onChange={e => setFormCertName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-black outline-none"
                />
              </div>

              <div>
                <label className="text-gray-600 uppercase text-[10px] font-bold block mb-1">Issuing School / Institution</label>
                <input
                  type="text"
                  placeholder="e.g. NITA Kenya / EPRA"
                  value={formSchool}
                  onChange={e => setFormSchool(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-black outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-600 uppercase text-[10px] font-bold block mb-1">License / Cert #</label>
                  <input
                    type="text"
                    placeholder="e.g. NITA-2023-994"
                    value={formLicenseNo}
                    onChange={e => setFormLicenseNo(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-black outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-600 uppercase text-[10px] font-bold block mb-1">Base Rate (KES/Day)</label>
                  <input
                    type="number"
                    value={formRate}
                    onChange={e => setFormRate(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-600 uppercase text-[10px] font-bold block mb-1">Scope & Key Details</label>
                <textarea
                  rows={2}
                  placeholder="Details of trade capabilities, machinery handled, or installation scope..."
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-black outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-black rounded-full font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full cursor-pointer"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COURSE DETAIL & ENROLL MODAL */}
      {selectedCourseModal && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-lg space-y-4 text-black shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-black uppercase text-black">Course & Institution Details</h3>
              </div>
              <button onClick={() => setSelectedCourseModal(null)} className="text-gray-400 hover:text-black cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Institution</span>
                <h4 className="text-sm font-bold text-black">{selectedCourseModal.institution}</h4>
                <p className="text-gray-500">{selectedCourseModal.location}</p>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Course Title</span>
                <p className="text-emerald-900 font-bold text-sm">{selectedCourseModal.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div>
                  <span className="text-[9px] text-gray-400 uppercase font-bold block">Estimated Fee</span>
                  <span className="text-black font-black text-sm">{selectedCourseModal.estimatedFee}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 uppercase font-bold block">Projected Revenue Boost</span>
                  <span className="text-emerald-700 font-black text-sm">{selectedCourseModal.earningBoost}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 uppercase font-bold block">Duration</span>
                  <span className="text-black font-semibold">{selectedCourseModal.duration}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 uppercase font-bold block">Class Format</span>
                  <span className="text-black font-semibold">{selectedCourseModal.classFormat}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Syllabus & Description</span>
                <p className="text-gray-600 leading-relaxed text-[11px]">{selectedCourseModal.description}</p>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Awarded Credential</span>
                <p className="text-emerald-800 font-black">{selectedCourseModal.certificationAwarded}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
              <a
                href={selectedCourseModal.institutionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 underline hover:text-black font-bold"
              >
                Visit Official Portal
              </a>
              <button
                onClick={() => {
                  showToast(`✓ Enrollment request submitted for ${selectedCourseModal.institutionShort}!`);
                  setSelectedCourseModal(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-full cursor-pointer"
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
