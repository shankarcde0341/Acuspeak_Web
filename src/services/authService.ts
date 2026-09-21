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

