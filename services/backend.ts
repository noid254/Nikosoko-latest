// Which backend this front talks to. Nikosoko is a front on the Qaribu platform (one server, one database); this switch lets the
// screens keep working with their own storage until the platform is ready to replace it. It is chosen when the app is built:
//   VITE_BACKEND=platform   use the Qaribu platform API (sign-in, professionals, bookings)
//   anything else           the earlier behaviour, unchanged
export const USE_PLATFORM = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_BACKEND === 'platform';

// Where the platform API is served from (the same address the Qaribu app uses unless this is set).
export const PLATFORM_URL = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_PLATFORM_URL || '/api';
