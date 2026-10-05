import { getAuthToken } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PlanItem {
  id: string;
  name: string;
  price_inr: number;
  billing_period: string;
  days: number;
  is_popular: boolean;
  badge: string;
  description: string;
  features: string[];
}

export interface CheckoutSessionResult {
  session_id: string;
  checkout_url: string;
  plan_id: string;
  amount_inr: number;
  error?: string;
}

export interface CheckoutStatusResult {
  status: string; // "paid" | "unpaid" | "expired"
  plan_id: string;
  email: string;
  is_premium: boolean;
  amount_inr: number;
  error?: string;
}

export interface SubscriptionStatusResult {
  is_premium: boolean;
  plan_id?: string | null;
  plan_name?: string;
  premium_until?: string | null;
  days_left: number;
  features: string[];
  error?: string;
}

/**
 * Fetches server-authoritative plans catalog from FastAPI backend /api/checkout/plans.
 */
export async function fetchPlansCatalog(): Promise<PlanItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/checkout/plans`, {
      method: 'GET',
      cache: 'no-store',
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.plans || [];
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'digest' in error && (error as { digest?: string }).digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    console.error('Failed to fetch plans catalog:', error);
    return [];
  }
}

/**
 * Creates a secure payment checkout session with FastAPI backend /api/checkout/create.
 */
export async function createCheckoutSession(
  planId: string,
  referralCode?: string
): Promise<CheckoutSessionResult> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/checkout/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ plan_id: planId, referral_code: referralCode }),
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        session_id: '',
        checkout_url: '',
        plan_id: planId,
        amount_inr: 0,
        error: data.detail || data.error || 'Checkout session creation failed',
      };
    }
    return data;
  } catch (error) {
    console.error('Checkout error:', error);
    return {
      session_id: '',
      checkout_url: '',
      plan_id: planId,
      amount_inr: 0,
      error: 'Unable to connect to the payment gateway server.',
    };
  }
}

/**
 * Polls backend status endpoint /api/checkout/status?session_id=... to confirm payment completion securely.
 */
export async function getCheckoutStatus(sessionId: string): Promise<CheckoutStatusResult | null> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/checkout/status?session_id=${encodeURIComponent(sessionId)}`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });

    if (!response.ok) return null;
    const data: CheckoutStatusResult = await response.json();
    return data;
  } catch (error) {
    console.error('Checkout status poll error:', error);
    return null;
  }
}

/**
 * Retrieves current active membership details from FastAPI backend /api/subscription/my-plan.
 */
export async function fetchMySubscription(): Promise<SubscriptionStatusResult | null> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/subscription/my-plan`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });

    if (!response.ok) return null;
    const data: SubscriptionStatusResult = await response.json();
    return data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'digest' in error && (error as { digest?: string }).digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    console.error('Fetch subscription error:', error);
    return null;
  }
}

/**
 * Cancels current user's membership subscription via FastAPI backend /api/subscription/cancel.
 */
export async function cancelSubscription(): Promise<{ message: string; is_premium: boolean; error?: string }> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/subscription/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return { message: '', is_premium: true, error: data.detail || 'Cancellation failed' };
    }
    return data;
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return { message: '', is_premium: true, error: 'Unable to connect to server.' };
  }
}
