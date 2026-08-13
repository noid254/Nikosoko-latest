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
