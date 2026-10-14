import { API_BASE_URL } from './apiConfig';

export interface SupportPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
  website?: string;
}

export interface SupportResponse {
  success: boolean;
  message: string;
  error?: string;
  statusCode?: number;
}

/**
 * Sends a support form submission payload to the FastAPI backend POST /api/support endpoint.
 */
export async function sendSupportMessage(payload: SupportPayload): Promise<SupportResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/support`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        (data && (data.detail || data.message)) ||
        (response.status === 429
          ? 'Too many attempts, please try again later.'
          : response.status === 503
          ? 'Support is temporarily unavailable'
          : 'Failed to send message. Please try again later.');

      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
        statusCode: response.status,
      };
    }

    return {
      success: true,
      message: data?.message || 'Your message has been sent successfully.',
    };
  } catch (error) {
    console.error('Support API network error:', error);
    return {
      success: false,
      message: 'Network error. Please check your internet connection and try again.',
      error: 'Network error',
    };
  }
}
