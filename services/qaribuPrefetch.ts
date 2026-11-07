import { clearBrandKitCache, getBrandKit } from './documentsApi';
import { clearMeCache, getMe } from './visitorsApi';

// Gate pass and My Invoice open at once for someone who has used them before: what their first screen needs is fetched
// while they are still on the home page. Only after the person has opened Qaribu once on this device, so nobody who never
// uses it has an account made for them by a prefetch.
const USED = 'qaribu_used_v1';

export const markQaribuUsed = (): void => {
  try { localStorage.setItem(USED, '1'); } catch { /* private window: nothing remembered */ }
};

export const prefetchQaribu = (): void => {
  try { if (localStorage.getItem(USED) !== '1') return; } catch { return; }
  void getMe().catch(() => undefined);
  void getBrandKit().catch(() => undefined);
};

// On sign-out, so the next person on this phone never sees the last one's screen for a moment.
export const clearQaribuCache = (): void => {
  clearMeCache();
  clearBrandKitCache();
};
