const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginSuccessResponse {
  message: string;
  email: string;
  name: string;
}

export interface LoginErrorResponse {
  error: string;
}

export type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

/**
 * Authenticates user credentials with FastAPI backend /api/login endpoint.
 */
export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.detail || data.error || 'Authentication failed' };
    }

    return data as LoginResponse;
  } catch (error) {
    console.error('Login network error:', error);
    return { error: 'Unable to connect to the authentication server. Please check your connection.' };
  }
}

export interface SendOtpResponse {
  message?: string;
  debug_code?: string;
  error?: string;
}

export interface VerifyPhoneCredentials {
  phone: string;
  otp: string;
  name?: string;
  referral?: string;
}

export interface VerifyPhoneResponse {
  message?: string;
  session_token?: string;
  name?: string;
  email?: string;
  error?: string;
}

/**
 * Sends OTP request to FastAPI backend /api/auth/phone/send-otp.
 */
export async function sendPhoneOtp(phone: string): Promise<SendOtpResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/phone/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { error: data.detail || data.error || 'Failed to send OTP code.' };
    }
    return data;
  } catch (error) {
    console.error('Send OTP network error:', error);
    return { error: 'Unable to connect to the authentication server.' };
  }
}

/**
 * Verifies Phone OTP with FastAPI backend /api/auth/phone/verify-otp.
 */
export async function verifyPhoneOtp(credentials: VerifyPhoneCredentials): Promise<VerifyPhoneResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/phone/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (!response.ok) {
      return { error: data.detail || data.error || 'OTP verification failed.' };
    }
    return data;
  } catch (error) {
    console.error('Verify OTP network error:', error);
    return { error: 'Unable to connect to the authentication server.' };
  }
}

/**
 * Initiates backend-authoritative Google OAuth 2.0 flow.
 */
export function initiateGoogleLogin(): void {
  window.location.href = `${API_BASE_URL}/api/auth/google/login`;
}

/**
 * Persists user session in both localStorage and HTTP cookies for client and server middleware validation.
 */
export function setAuthSession(user: { email: string; name: string }, token?: string): void {
  if (typeof window === 'undefined') return;

  const sessionToken = token || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  localStorage.setItem('session_token', sessionToken);
  localStorage.setItem('acuspeak_user', JSON.stringify(user));

  // Set cookies for Next.js server middleware verification (30 days TTL)
  const maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
  document.cookie = `acuspeak_logged_in=true; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `session_token=${encodeURIComponent(sessionToken)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Checks whether user has an active session in client storage or cookies.
 */
export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;

  const hasLocalStorageToken = !!localStorage.getItem('session_token') || !!localStorage.getItem('acuspeak_user');
  const hasCookie = document.cookie.includes('acuspeak_logged_in=true') || document.cookie.includes('session_token=');

  return hasLocalStorageToken || hasCookie;
}

/**
 * Retrieves logged in user details from localStorage if available.
 */
export function getStoredUser(): { email: string; name: string } | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem('acuspeak_user');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore JSON parse errors
  }
  return null;
}

/**
 * Clears locally stored authentication tokens, session cookies, and redirects to login page.
 */
export function logoutUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('session_token');
    localStorage.removeItem('acuspeak_user');

    // Expire cookies
    document.cookie = 'acuspeak_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    window.location.href = '/login';
  }
}



