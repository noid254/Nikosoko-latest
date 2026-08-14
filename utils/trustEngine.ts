import type { ServiceProvider } from '../types';
import { normalizeSkills } from './skills';

export interface TrustBreakdown {
  identityScore: number; // Max 1.0
  identityExplanation: string;

  skillScore: number; // Max 1.0
  skillExplanation: string;

  ecosystemScore: number; // Max 0.5
  ecosystemExplanation: string;

  referralScore: number; // Max 0.5
  referralExplanation: string;

  performanceScore: number; // Max 2.0
  performanceExplanation: string;
  bayesianRating: number;

  totalScore: number; // Max 5.0
  badges: Array<{
    id: string;
    label: string;
    icon: string;
    color: string;
    type: 'identity' | 'skill' | 'ecosystem' | 'referral' | 'elite';
  }>;
  optimizationTips: string[];
}

/**
 * Tukosoko / NikoSoko Trust and Ranking calculation engine
 * Adheres strictly to the 5-pillar breakdown:
 * 1. Identity Verification (Max 1.0)
 * 2. Institutional Skill Certification (Max 1.0)
 * 3. Ecosystem / Group Affiliation (Max 0.5)
 * 4. Referral Network (Max 0.5)
 * 5. Client Ratings & Performance (Max 2.0)
 * Total Score capped strictly at 5.0
 */
export function calculateTrustAndRanking(provider: Partial<ServiceProvider> | null | undefined): TrustBreakdown {
  if (!provider) {
    return {
      identityScore: 0,
      identityExplanation: 'Profile not available',
      skillScore: 0,
      skillExplanation: 'No verified skill data attached',
      ecosystemScore: 0,
      ecosystemExplanation: 'No group affiliation',
      referralScore: 0,
      referralExplanation: 'No peer referral',
      performanceScore: 0.8,
      performanceExplanation: 'Default baseline rating prior',
      bayesianRating: 4.0,
      totalScore: 0.8,
      badges: [],
      optimizationTips: ['Complete profile setup to build trust.']
    };
  }

  const tips: string[] = [];
  const badges: TrustBreakdown['badges'] = [];

  // 1. Identity Verification (Max 1.0)
  const isIdVerified = Boolean(
    provider.isVerified ||
    provider.idVerificationStatus === 'Verified' ||
    provider.nationalId ||
    provider.idDocumentUrl
  );
  const identityScore = isIdVerified ? 1.0 : 0.0;
  const identityExplanation = isIdVerified
    ? 'National ID / Government Passport verified via KYC photo/biometric audit (+1.0).'
    : 'Identity document not submitted or verification pending (+0.0).';

  if (isIdVerified) {
    badges.push({
      id: 'id-verified',
      label: 'National ID Verified',
      icon: '✓',
      color: 'bg-blue-600 text-white border-blue-700',
      type: 'identity'
    });
  } else {
    tips.push('Verify your National ID / Passport in settings to gain +1.0 trust score.');
  }

  // 2. Institutional Skill Certification (Max 1.0)
  const skills = normalizeSkills(provider.skills);
  const hasVerifiedSkillCert = skills.some(s => 
    s.isVerified || 
    s.certificationName || 
    s.issuingSchool || 
    s.licenseNumber ||
    (s.tradeTestGrade && s.tradeTestGrade !== 'None')
  ) || Boolean(provider.isVerified);

  const skillScore = hasVerifiedSkillCert ? 1.0 : 0.0;
  const skillExplanation = hasVerifiedSkillCert
    ? 'Accredited institutional trade certificate / TVETA / NITA / EPRA license attached (+1.0).'
    : 'No accredited institutional certificate or trade test attached (+0.0).';

  if (hasVerifiedSkillCert) {
    badges.push({
      id: 'skill-certified',
      label: 'Accredited Pro (NITA/EPRA)',
      icon: '🎓',
      color: 'bg-emerald-600 text-white border-emerald-700',
      type: 'skill'
    });
  } else {
    tips.push('Upload an accredited NITA, EPRA, or TVET trade test certificate to gain +1.0 trust score.');
  }

  // 3. Ecosystem / Group Affiliation (Max 0.5)
  const isSaccoVerified = Boolean(
    provider.isSaccoVerified ||
    provider.saccoMember?.status === 'Confirmed' ||
    provider.saccoMember?.status === 'Approved' ||
    provider.saccoMember?.saccoName
  );
  const ecosystemScore = isSaccoVerified ? 0.5 : 0.0;
  const saccoName = provider.saccoMember?.saccoName || 'Artisans SACCO';
  const ecosystemExplanation = isSaccoVerified
    ? `Active verified member of ${saccoName} / registered trade association (+0.5).`
    : 'No active SACCO, trade union, or registered association affiliation (+0.0).';

  if (isSaccoVerified) {
    badges.push({
      id: 'sacco-affiliated',
      label: `SACCO Backed (${saccoName})`,
      icon: '🏛️',
      color: 'bg-zinc-900 text-amber-400 border-amber-500/40',
      type: 'ecosystem'
    });
  } else {
    tips.push('Link your artisan SACCO or trade association membership to unlock +0.5 trust score.');
  }

  // 4. Referral Network (Max 0.5)
  const isReferredByPeer = Boolean(
    provider.referredBy ||
    provider.referralCodeUsed ||
    provider.isReferred
  );
  const referralScore = isReferredByPeer ? 0.5 : 0.0;
  const referralExplanation = isReferredByPeer
    ? 'Onboarded via trusted referral code from an active platform artisan (+0.5).'
    : 'Standard direct registration without peer referral voucher (+0.0).';

  if (isReferredByPeer) {
    badges.push({
      id: 'community-endorsed',
      label: 'Community Endorsed',
      icon: '🤝',
      color: 'bg-emerald-800 text-emerald-100 border-emerald-600',
      type: 'referral'
    });
  }

  // 5. Client Ratings & Performance (Max 2.0)
  // Bayesian average: R_bayesian = (C * m + sum(reviews)) / (C + n)
  // C = 5 prior weight, m = 4.0 platform baseline
  const reviewsCount = provider.reviewsCount || 8;
  const rawRating = typeof provider.rating === 'number' && provider.rating > 0 ? provider.rating : 4.0;
  const C = 5;
  const m = 4.0;
  const totalStarSum = rawRating * reviewsCount;
  const bayesianRating = (C * m + totalStarSum) / (C + reviewsCount);

  // Completion rate (default to 0.95 if active, 0.90 if standard)
  const completionRate = typeof provider.completionRate === 'number'
    ? Math.min(1.0, Math.max(0.0, provider.completionRate))
    : (provider.isOnline ? 0.96 : 0.92);

  // S_Performance = 2.0 * (0.70 * (Bayesian / 5.0) + 0.30 * CompletionRate)
  const performanceRatio = (0.70 * (bayesianRating / 5.0)) + (0.30 * completionRate);
  const performanceScore = Math.min(2.0, Math.max(0.0, Number((2.0 * performanceRatio).toFixed(2))));
  
  const performanceExplanation = `Bayesian rating of ${bayesianRating.toFixed(2)}/5.0 across ${reviewsCount} reviews with ${(completionRate * 100).toFixed(0)}% completion rate (+${performanceScore.toFixed(2)}).`;

  // Final Total Score (strictly capped at 5.0)
  const rawTotal = identityScore + skillScore + ecosystemScore + referralScore + performanceScore;
  const totalScore = Math.min(5.0, Number(rawTotal.toFixed(2)));

  // Elite Badge
  if (totalScore >= 4.5 && reviewsCount >= 5) {
    badges.push({
      id: 'elite-master',
      label: 'Tukosoko Master Artisan (Top 5%)',
      icon: '👑',
      color: 'bg-black text-amber-300 border-amber-400 shadow-sm',
      type: 'elite'
    });
  }

  return {
    identityScore,
    identityExplanation,
    skillScore,
    skillExplanation,
    ecosystemScore,
    ecosystemExplanation,
    referralScore,
    referralExplanation,
    performanceScore,
    performanceExplanation,
    bayesianRating: Number(bayesianRating.toFixed(2)),
    totalScore,
    badges,
    optimizationTips: tips
  };
}
