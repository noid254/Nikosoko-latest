import type { Skill } from '../types';

export function normalizeSkills(rawSkills: any): Skill[] {
  if (!rawSkills) return [];
  let parsed = rawSkills;
  if (typeof rawSkills === 'string') {
    try {
      parsed = JSON.parse(rawSkills);
    } catch {
      return [{ id: 'sk-0', skillTitle: rawSkills, name: rawSkills, category: 'General' }];
    }
  }
  if (!Array.isArray(parsed)) {
    if (typeof parsed === 'object' && parsed !== null) {
      return [{
        id: parsed.id || 'sk-0',
        skillTitle: parsed.skillTitle || parsed.name || 'General Skill',
        name: parsed.name || parsed.skillTitle || 'General Skill',
        ...parsed
      }];
    }
    return [];
  }
  return parsed.map((item: any, idx: number) => {
    if (typeof item === 'string') {
      return {
        id: `sk-${idx}`,
        skillTitle: item,
        name: item,
        category: 'General'
      };
    }
    if (typeof item === 'object' && item !== null) {
      return {
        id: item.id || `sk-${idx}`,
        skillTitle: item.skillTitle || item.name || 'General Skill',
        name: item.name || item.skillTitle || 'General Skill',
        ...item
      };
    }
    return {
      id: `sk-${idx}`,
      skillTitle: String(item),
      name: String(item),
      category: 'General'
    };
  });
}

// Default titles new accounts got at sign-up. They are not real skills or professions.
export const PLACEHOLDER_TITLES = /^(general trades?( professional)?|trades? specialist|general skill|service skill|skilled service|professional artisan|general tradesperson)$/i;

export function isPlaceholderTitle(value?: string | null): boolean {
  return !value || PLACEHOLDER_TITLES.test(value.trim());
}

/**
 * For display: a skill still titled with a sign-up placeholder (e.g. "General Trades")
 * takes the person's listed profession instead (e.g. "Interior designer").
 * Rate, description and certificates on the skill are kept. Stored data is not changed.
 */
export function withProfessionTitles(skills: Skill[], profession?: string | null): Skill[] {
  const prof = isPlaceholderTitle(profession) ? '' : (profession || '').trim();
  return skills.map((s) => {
    if (!isPlaceholderTitle(s.skillTitle || s.name)) return s;
    return prof ? { ...s, skillTitle: prof, name: prof } : s;
  });
}
