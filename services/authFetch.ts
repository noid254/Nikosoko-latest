// fetch() wrapper that sends the signed session token issued by /api/auth/verify-otp.
// A 401 means the session is missing or expired: the token is cleared and the app is told to sign out.

export const AUTH_EXPIRED_EVENT = 'nikosoko:auth-expired';

export const authFetch = async (input: string, init: RequestInit = {}): Promise<Response> => {
  let token: string | null = null;
  try {
    token = localStorage.getItem('authToken');
  } catch {
    token = null;
  }

  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(input, { ...init, headers });

  if (res.status === 401 && token) {
    try {
      localStorage.removeItem('authToken');
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }
  return res;
};
