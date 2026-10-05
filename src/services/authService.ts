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
  is_registered?: boolean;
  is_new_user?: boolean;
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
  user_id?: string;
  is_registered?: boolean;
  is_new_user?: boolean;
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

export interface UserProfile {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  is_premium?: boolean;
  english_level?: string;
  day_streak?: number;
  total_xp?: number;
  daily_goal_minutes?: number;
  daily_goal_completed_minutes?: number;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  is_unlocked: boolean;
  progress_percent: number;
  category: string;
}

export interface AchievementsData {
  total_count: number;
  unlocked_count: number;
  achievements: AchievementItem[];
}

/**
 * Fetches current authenticated user profile from FastAPI backend /api/auth/me endpoint.
 */
export async function fetchCurrentUser(token?: string): Promise<UserProfile | null> {
  try {
    const sessionToken = token || getAuthToken();
    if (!sessionToken) return null;

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const data: UserProfile = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }
}

/**
 * Fetches user achievements from FastAPI backend /api/achievements endpoint.
 */
export async function fetchAchievements(token?: string): Promise<AchievementsData | null> {
  try {
    const sessionToken = token || getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/achievements`, {
      method: 'GET',
      headers: sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {},
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const data: AchievementsData = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch achievements:', error);
    return null;
  }
}

/**
 * Retrieves session token from localStorage if available.
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('session_token');
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

export interface UpdateSettingsPayload {
  name?: string;
  english_level?: string;
  daily_goal_minutes?: number;
  noise_suppression?: boolean;
  auto_mute?: boolean;
  email_reminders?: boolean;
  streak_protection?: boolean;
  public_profile?: boolean;
}

/**
 * Updates user profile and preferences on FastAPI backend and syncs local storage.
 */
export async function updateUserSettings(payload: UpdateSettingsPayload): Promise<UserProfile | null> {
  try {
    const sessionToken = getAuthToken();

    // Sync localStorage user object immediately if name changed
    if (payload.name && typeof window !== 'undefined') {
      const stored = getStoredUser() || { email: '', name: '' };
      stored.name = payload.name;
      localStorage.setItem('acuspeak_user', JSON.stringify(stored));
    }

    if (!sessionToken) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn('Backend update failed, local storage updated.');
      return null;
    }

    const updatedUser: UserProfile = await response.json();
    return updatedUser;
  } catch (error) {
    console.error('Failed to update settings:', error);
    return null;
  }
}

export interface CallHistoryItem {
  call_id: string;
  partner_name: string;
  partner_avatar?: string | null;
  is_partner_pro: boolean;
  partner_english_level: string;
  started_at: string;
  duration_seconds: number;
  call_type: string;
  topic: string;
  status: string;
}

export interface CallHistoryResponse {
  total_calls: number;
  total_duration_minutes: number;
  average_duration_seconds: number;
  history: CallHistoryItem[];
}

/**
 * Fetches user's authoritative call history records from FastAPI backend /api/calls/history endpoint.
 */
export async function fetchCallHistory(token?: string): Promise<CallHistoryResponse | null> {
  try {
    const sessionToken = token || getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/calls/history`, {
      method: 'GET',
      headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const data: CallHistoryResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch call history:', error);
    return null;
  }
}



