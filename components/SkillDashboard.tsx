import React, { useState, useMemo, useEffect } from 'react';
import * as api from '../services/api';
import type { ServiceProvider, CurrentPage } from '../types';
import { normalizeSkills } from '../utils/skills';
import { calculateTrustAndRanking } from '../utils/trustEngine';
import {
  ShieldCheck,
  Plus,
  Star,
  MapPin,
  ArrowLeft,
  X
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

// Everything built from this list is sample content, shown so people can see how the hub will look.
const SampleTag: React.FC = () => (
  <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded">Sample</span>
);


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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Joining a sacco with its code: the member sends the code, then waits for the organization to verify.
  const [showSacco, setShowSacco] = useState(false);
  const [saccoReq, setSaccoReq] = useState<api.SaccoRequest | null>(null);
  const [saccoCodeInput, setSaccoCodeInput] = useState('');
  const [saccoBusy, setSaccoBusy] = useState(false);
  const [saccoError, setSaccoError] = useState('');

  // Form states for adding skill
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Woodwork & Joinery');
  const [formCertName, setFormCertName] = useState('');
  const [formSchool, setFormSchool] = useState('');
  const [formYear, setFormYear] = useState('2024');
  const [formRate, setFormRate] = useState('2500');
  const [formLicenseNo, setFormLicenseNo] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const refreshSacco = async () => {
    if (!currentUser?.id) return;
    const r = await api.getMySaccoRequest(currentUser.id);
    if (!r) return;
    setSaccoReq(r);
    // Approved since the last visit: carry the verification into the signed-in profile.
    if (r.status === 'approved' && !currentUser.isSaccoVerified) {
      onUpdateUser?.({ ...currentUser, isSaccoVerified: true, verifiedByOrgName: r.orgName, saccoMember: { saccoId: r.orgId, saccoName: r.orgName, saccoCode: r.code, status: 'Confirmed', requestedAt: r.requestedAt || '', confirmedAt: new Date().toISOString() } } as any);
    }
  };
  useEffect(() => { void refreshSacco(); }, [currentUser?.id]);

  const sendSaccoCode = async () => {
    const code = saccoCodeInput.trim();
    if (!code || !currentUser?.id) { setSaccoError('Enter the code your organization gave you.'); return; }
    setSaccoBusy(true); setSaccoError('');
    const r = await api.requestToJoinOrg(code, currentUser.id);
    setSaccoBusy(false);
    if ('error' in r) { setSaccoError(r.error); return; }
    setSaccoCodeInput('');
    await refreshSacco();
  };

  const saccoStatus: 'approved' | 'pending' | 'rejected' | 'none' =
    saccoReq && saccoReq.status !== 'none' ? saccoReq.status
    : currentUser?.isSaccoVerified && currentUser?.saccoMember?.status !== 'Pending' ? 'approved'
    : currentUser?.saccoMember?.status === 'Pending' ? 'pending'
    : 'none';
  const saccoOrgName = (saccoReq && saccoReq.status !== 'none' ? saccoReq.orgName : '') || currentUser?.saccoMember?.saccoName || currentUser?.verifiedByOrgName || '';

  // User Skills Normalized
  // Only what the member entered. Nothing is made up: no sample skills, no licence numbers, no endorsements.
  const [skillsList, setSkillsList] = useState<SkillItem[]>(() =>
    normalizeSkills(currentUser?.skills).map((s: any, idx: number) => ({
      id: s.id || `sk-${idx}`,
      skillTitle: s.skillTitle || s.name || 'Skill',
      category: s.category || 'General',
      certificationName: s.certificationName || '',
      issuingSchool: s.issuingSchool || '',
      yearObtained: s.yearObtained || '',
      hourlyRate: Number(s.hourlyRate) || Number(currentUser?.hourlyRate) || 0,
      currency: s.currency || 'KES',
      description: s.description || '',
      // Verified only when an organization or the admin has verified it, never because the member typed it.
      verificationStatus: s.isVerified ? 'verified' : 'unverified',
      licenseNumber: s.licenseNumber || '',
      endorsementsCount: Number(s.endorsementsCount) || 0,
    }))
  );

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
      certificationName: formCertName.trim(),
      issuingSchool: formSchool.trim(),
      yearObtained: formYear,
      hourlyRate: parseFloat(formRate) || 0,
      currency: 'KES',
      description: formDesc.trim(),
      verificationStatus: 'unverified',
      licenseNumber: formLicenseNo.trim(),
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
    showToast('✓ Skill added');
  };

  // Compute 5-Pillar Trust and Ranking Breakdown
  const trustBreakdown = useMemo(() => {
    return calculateTrustAndRanking(currentUser || {
      isVerified: true,
      skills: skillsList as any,
      isSaccoVerified: true,
      referredBy: 'REF-MASTER-01',
      rating: 0,
      reviewsCount: 0,
      completionRate: 0.98
    });
  }, [currentUser, skillsList]);

  const level = getLevel(trustBreakdown.totalScore);
  const clientRating = currentUser?.rating || 0;
  const reviewsCount = currentUser?.reviewsCount || 0;

  // Local demand heatmap for the member's primary trade category.
  const primaryCategory = skillsList[0]?.category || 'General Services';
  const heatmapData = useMemo(() => {
    return DEMAND_AREAS.map(area => {
      const intensity = hashToUnit(`${primaryCategory}:${area}`);
      return { area, intensity };
    }).sort((a, b) => b.intensity - a.intensity);
  }, [primaryCategory]);

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
            <p className="text-[11px] text-gray-400">Your trust score and skills</p>
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
                <span className="text-sm font-black text-black ml-1">{reviewsCount > 0 ? clientRating.toFixed(1) : 'New'}</span>
                <span className="text-xs text-gray-400 font-medium">{reviewsCount > 0 ? `(${reviewsCount} reviews)` : '(no reviews yet)'}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="bg-gray-50 p-2.5 border border-gray-200 rounded-xl">
                  <span className="text-[9px] text-gray-400 uppercase font-bold block">Active Skills</span>
                  <span className="text-sm font-black text-black block">{skillsList.length} listed</span>
                </div>
                <div className="bg-gray-50 p-2.5 border border-gray-200 rounded-xl">
                  <span className="text-[9px] text-gray-400 uppercase font-bold block">Daily Rate</span>
                  <span className="text-sm font-black text-black block">{currentUser?.hourlyRate ? `KES ${currentUser.hourlyRate}` : 'Not set yet'}</span>
                </div>
                <button
                  type="button"
                  data-testid="sacco-tile"
                  onClick={() => { setSaccoError(''); setShowSacco(true); void refreshSacco(); }}
                  className="text-left bg-gray-50 p-2.5 border border-gray-200 rounded-xl col-span-2 sm:col-span-1 cursor-pointer hover:border-emerald-400 active:scale-[0.99] transition"
                >
                  <span className="text-[9px] text-gray-400 uppercase font-bold block">Sacco</span>
                  {saccoStatus === 'approved' && <span className="text-sm font-black text-emerald-700 block truncate">{saccoOrgName} ✓</span>}
                  {saccoStatus === 'pending' && <span className="text-sm font-black text-amber-700 block truncate">Waiting for {saccoOrgName || 'verification'}</span>}
                  {(saccoStatus === 'none' || saccoStatus === 'rejected') && <span className="text-sm font-black text-emerald-700 block truncate underline">{saccoStatus === 'rejected' ? 'Not accepted · try again' : 'Not linked · tap to join'}</span>}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* DEMAND HEATMAP */}
        <section className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-black">Where You're Needed Most</h3>
            <SampleTag />
          </div>
          <p className="text-[11px] text-gray-500 -mt-1.5">
            Sample demand figures for <span className="font-bold text-black">{primaryCategory}</span> by area.
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
              <span>Your Skills ({skillsList.length})</span>
            </h3>
          </div>

          <div className="space-y-2.5">
            {skillsList.length === 0 && (
              <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 text-center space-y-2" data-testid="no-skills">
                <p className="text-sm font-bold text-black">No skills listed yet</p>
                <p className="text-xs text-gray-500">Add the skills you work in. Adding a certificate name and the school that issued it counts toward your trust score.</p>
              </div>
            )}
            {skillsList.map((skill) => (
              <div key={skill.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2 hover:border-emerald-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-black">{skill.skillTitle}</h4>
                      {skill.verificationStatus === 'verified'
                        ? <span className="text-[9px] uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black">Verified</span>
                        : <span className="text-[9px] uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-black">Not verified yet</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      <span className="font-bold text-black">{skill.category}</span>{skill.issuingSchool ? <> • {skill.issuingSchool}</> : null}
                    </p>
                  </div>
                  {(skill.certificationName || skill.licenseNumber) && (
                    <div className="text-left sm:text-right text-xs">
                      {skill.certificationName && <span className="text-emerald-800 font-bold">{skill.certificationName}</span>}
                      {skill.licenseNumber && <p className="text-[11px] text-gray-400">License #: {skill.licenseNumber}{skill.yearObtained ? ` (${skill.yearObtained})` : ''}</p>}
                    </div>
                  )}
                </div>
                {skill.description && <p className="text-xs text-gray-600 leading-relaxed">{skill.description}</p>}
                {(skill.hourlyRate > 0 || (skill.endorsementsCount ?? 0) > 0) && (
                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                    {skill.hourlyRate > 0 ? <span>Standard Rate: <strong className="text-black">KES {skill.hourlyRate} / day</strong></span> : <span />}
                    {(skill.endorsementsCount ?? 0) > 0 && (
                      <span className="bg-gray-100 px-2 py-0.5 rounded-full text-gray-700 font-bold">{skill.endorsementsCount} peer endorsements</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* SACCO: ENTER A REFERRAL CODE AND WAIT FOR VERIFICATION */}
      {showSacco && (
        <div className="fixed inset-0 z-[200] bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowSacco(false)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Join a sacco">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-black uppercase text-black">Your Sacco</h3>
                <p className="text-xs text-gray-500 mt-0.5">Join with the referral code your sacco gave you.</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setShowSacco(false)} className="text-gray-400 hover:text-black cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            {saccoStatus === 'approved' && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <p className="font-black">You are a verified member of {saccoOrgName} ✓</p>
                <p className="mt-1 text-xs">Your profile shows this sacco and it counts toward your trust score.</p>
              </div>
            )}

            {saccoStatus === 'pending' && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 space-y-2" role="status">
                <p className="font-black">Waiting for verification</p>
                <p className="text-xs leading-relaxed">
                  Your code{saccoReq && saccoReq.status !== 'none' ? ` (${saccoReq.code})` : ''} was sent to {saccoOrgName || 'the sacco'}. You are verified once they confirm you. This can take a day or two.
                </p>
                <button type="button" onClick={() => void refreshSacco()} className="text-xs font-bold underline cursor-pointer">Check again</button>
              </div>
            )}

            {(saccoStatus === 'none' || saccoStatus === 'rejected') && (
              <form onSubmit={(e) => { e.preventDefault(); void sendSaccoCode(); }} className="space-y-3">
                {saccoStatus === 'rejected' && (
                  <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800" role="status">
                    {saccoOrgName || 'The sacco'} did not confirm your last request. Check the code with them, or try another.
                  </p>
                )}
                <label htmlFor="saccoCode" className="block text-xs font-bold text-gray-700">Referral code</label>
                <input
                  id="saccoCode"
                  value={saccoCodeInput}
                  onChange={(e) => setSaccoCodeInput(e.target.value.toUpperCase())}
                  maxLength={32}
                  autoCapitalize="characters"
                  autoComplete="off"
                  placeholder="Type the code"
                  className="w-full border border-gray-300 rounded-xl px-3 py-3 text-base font-bold tracking-wider focus:outline-none focus:border-emerald-500"
                />
                {saccoError && <p className="text-xs font-semibold text-red-700" role="alert">{saccoError}</p>}
                <button type="submit" disabled={saccoBusy || !saccoCodeInput.trim()} className="w-full bg-black text-white font-black text-sm py-3 rounded-xl disabled:opacity-40 cursor-pointer">
                  {saccoBusy ? 'Sending…' : 'Send for verification'}
                </button>
                <p className="text-[11px] text-gray-500">The sacco sees your name and phone number to check you. Nobody else does.</p>
              </form>
            )}
          </div>
        </div>
      )}

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

    </div>
  );
};

export default SkillDashboard;
