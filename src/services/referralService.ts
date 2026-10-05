import { getAuthToken } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ReferralData {
  referral_code: string;
  referral_link: string;
  referral_count: number;
  referral_discount_active: boolean;
  cashback_earned_inr: number;
  total_rewards_inr: number;
  share_message: string;
}

/**
 * Fetches current user's referral details & statistics from FastAPI backend /api/referral.
 */
export async function fetchReferralData(token?: string): Promise<ReferralData | null> {
  try {
    const sessionToken = token || getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/referral`, {
      method: 'GET',
      headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
      cache: 'no-store',
    });

    if (!response.ok) return null;
    const data: ReferralData = await response.json();
    return data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'digest' in error && (error as { digest?: string }).digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    console.error('Failed to fetch referral data:', error);
    return null;
  }
}

/**
 * Applies a referral promo code via FastAPI backend /api/referral/apply.
 */
export async function applyReferralCode(code: string): Promise<{ message: string; success: boolean; error?: string }> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/referral/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { message: '', success: false, error: data.detail || 'Failed to apply referral code' };
    }
    return data;
  } catch (error) {
    console.error('Apply referral code error:', error);
    return { message: '', success: false, error: 'Unable to connect to referral server.' };
  }
}
