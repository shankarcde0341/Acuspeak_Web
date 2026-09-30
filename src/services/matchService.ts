import { getAuthToken, logoutUser } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PartnerInfo {
  id: string;
  name: string;
}

export interface MatchResponse {
  status: 'searching' | 'matched' | 'idle';
  room_id?: string | null;
  partner?: PartnerInfo | null;
  error?: string;
}

export interface CancelResponse {
  message?: string;
  status?: string;
  error?: string;
}

export interface ZegoTokenResponse {
  app_id?: number;
  user_id?: string;
  token?: string;
  expires_in?: number;
  error?: string;
}

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (!token) {
    if (typeof window !== 'undefined') {
      logoutUser();
    }
    throw new Error('Authentication required');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Sends POST /api/match/join to start or join matchmaking.
 */
export async function joinMatch(): Promise<MatchResponse> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/match/join`, {
      method: 'POST',
      headers,
    });

    if (response.status === 401) {
      logoutUser();
      return { status: 'idle', error: 'Session expired. Please log in again.' };
    }

    const data = await response.json();
    if (!response.ok) {
      return { status: 'idle', error: data.detail || data.error || 'Failed to join matchmaking.' };
    }
    return data as MatchResponse;
  } catch (error: any) {
    console.error('joinMatch network error:', error);
    return { status: 'idle', error: error?.message || 'Unable to connect to matchmaking server.' };
  }
}

/**
 * Sends GET /api/match/status to poll matchmaking status.
 */
export async function getMatchStatus(): Promise<MatchResponse> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/match/status`, {
      method: 'GET',
      headers,
    });

    if (response.status === 401) {
      logoutUser();
      return { status: 'idle', error: 'Session expired. Please log in again.' };
    }

    const data = await response.json();
    if (!response.ok) {
      return { status: 'idle', error: data.detail || data.error || 'Failed to fetch match status.' };
    }
    return data as MatchResponse;
  } catch (error: any) {
    console.error('getMatchStatus network error:', error);
    return { status: 'idle', error: error?.message || 'Unable to connect to matchmaking server.' };
  }
}

/**
 * Sends POST /api/match/cancel to cancel active search or end call state.
 */
export async function cancelMatch(): Promise<CancelResponse> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/match/cancel`, {
      method: 'POST',
      headers,
    });

    if (response.status === 401) {
      logoutUser();
      return { error: 'Session expired. Please log in again.' };
    }

    const data = await response.json();
    if (!response.ok) {
      return { error: data.detail || data.error || 'Failed to cancel matchmaking.' };
    }
    return data as CancelResponse;
  } catch (error: any) {
    console.error('cancelMatch network error:', error);
    return { error: error?.message || 'Unable to connect to matchmaking server.' };
  }
}

/**
 * Sends POST /api/zego/token to fetch voice session token for the given room_id.
 */
export async function getZegoToken(roomId: string): Promise<ZegoTokenResponse> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/zego/token`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ room_id: roomId }),
    });

    if (response.status === 401) {
      logoutUser();
      return { error: 'Session expired. Please log in again.' };
    }

    const data = await response.json();
    if (!response.ok) {
      return { error: data.detail || data.error || 'Failed to generate voice token.' };
    }
    return data as ZegoTokenResponse;
  } catch (error: any) {
    console.error('getZegoToken network error:', error);
    return { error: error?.message || 'Unable to connect to voice service.' };
  }
}
