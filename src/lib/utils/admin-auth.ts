export const ADMIN_SESSION_KEY = 'filetools_admin_session';

export function setAdminSession() {
  if (typeof window !== 'undefined') {
    const token = generateSessionToken();
    sessionStorage.setItem(ADMIN_SESSION_KEY, token);
  }
}

function generateSessionToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
}

export function getAdminSessionToken(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(ADMIN_SESSION_KEY);
  }
  return null;
}

export function clearAdminSession() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

export function isAdminAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  }
  return false;
}
