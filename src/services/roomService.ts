import { getAuthToken, logoutUser } from './authService';

import { API_BASE_URL } from './apiConfig';

export interface LiveRoomParticipant {
  user_id: string;
  name: string;
  role: 'host' | 'speaker' | 'listener' | string;
  joined_at: string;
  is_muted?: boolean;
  is_cam_on?: boolean;
}

export interface LiveRoomSummary {
  room_id: string;
  title: string;
  topic: string;
  description?: string;
  host_id: string;
  host_name: string;
  max_participants: number;
  participant_count: number;
  is_host: boolean;
  created_at: string;
  status: 'active' | 'ended' | string;
}

export interface LiveRoomDetail extends LiveRoomSummary {
  participants: LiveRoomParticipant[];
  is_user_joined?: boolean;
  my_role?: 'host' | 'speaker' | 'listener' | string | null;
}

export interface LiveRoomsResponse {
  rooms: LiveRoomSummary[];
  total: number;
  page: number;
  limit: number;
  error?: string;
}

export interface CreateLiveRoomPayload {
  title: string;
  topic: string;
  description?: string;
  max_participants?: number;
}

export interface JoinLiveRoomResponse {
  success: boolean;
  room?: LiveRoomDetail;
  my_role?: string;
  message?: string;
  error?: string;
}

export interface LiveZegoTokenResponse {
  app_id?: number;
  user_id?: string;
  user_name?: string;
  token?: string;
  expires_in?: number;
  room_id?: string;
  error?: string;
}

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Fetches active live rooms from FastAPI backend with topic, search, and pagination.
 */
export async function getLiveRooms(params?: {
  topic?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<LiveRoomsResponse> {
  try {
    const query = new URLSearchParams();
    if (params?.topic && params.topic.toLowerCase() !== 'all') {
      query.set('topic', params.topic);
    }
    if (params?.search) {
      query.set('search', params.search);
    }
    if (params?.page) {
      query.set('page', String(params.page));
    }
    if (params?.limit) {
      query.set('limit', String(params.limit));
    }

    const qs = query.toString();
    const url = `${API_BASE_URL}/api/live/rooms${qs ? `?${qs}` : ''}`;
    const headers = getAuthHeaders();

    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      return {
        rooms: [],
        total: 0,
        page: 1,
        limit: 20,
        error: errData?.detail || 'Failed to fetch live rooms.',
      };
    }

    const data: LiveRoomsResponse = await response.json();
    return data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error';
    return {
      rooms: [],
      total: 0,
      page: 1,
      limit: 20,
      error: message,
    };
  }
}

/**
 * Fetches detailed metadata for a specific live room.
 */
export async function getLiveRoomDetail(roomId: string): Promise<LiveRoomDetail | null> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/live/rooms/${roomId}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data: LiveRoomDetail = await response.json();
    return data;
  } catch {
    return null;
  }
}

/**
 * Creates a new live room in FastAPI backend. Creator is authoritative host.
 */
export async function createLiveRoom(
  payload: CreateLiveRoomPayload
): Promise<{ room?: LiveRoomDetail; error?: string }> {
  try {
    const token = getAuthToken();
    if (!token) {
      return { error: 'Please sign in to create a live room.' };
    }

    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/live/rooms/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return { error: data?.detail || 'Failed to create room.' };
    }

    return { room: data as LiveRoomDetail };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error creating room.';
    return { error: message };
  }
}

/**
 * Validates session and joins user to the live room.
 */
export async function joinLiveRoom(roomId: string): Promise<JoinLiveRoomResponse> {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, error: 'Please sign in to join live rooms.' };
    }

    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/live/rooms/${roomId}/join`, {
      method: 'POST',
      headers,
    });

    const data = await response.json().catch(() => null);
    if (response.status === 401) {
      logoutUser();
      return { success: false, error: 'Session expired. Please log in again.' };
    }

    if (!response.ok) {
      return { success: false, error: data?.detail || 'Unable to join room.' };
    }

    return data as JoinLiveRoomResponse;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error joining room.';
    return { success: false, error: message };
  }
}

/**
 * Securely requests a short-lived ZegoCloud Token04 from the FastAPI backend.
 */
export async function getLiveZegoToken(roomId: string): Promise<LiveZegoTokenResponse> {
  try {
    const token = getAuthToken();
    if (!token) {
      return { error: 'Authentication required for voice/video access.' };
    }

    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/live/zego/token`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ room_id: roomId }),
    });

    const data = await response.json().catch(() => null);
    if (response.status === 401) {
      logoutUser();
      return { error: 'Session expired. Please log in again.' };
    }

    if (!response.ok) {
      return { error: data?.detail || 'Failed to authenticate streaming token.' };
    }

    return data as LiveZegoTokenResponse;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Voice/video server connection failed.';
    return { error: message };
  }
}

/**
 * Leaves the live room, updating backend participant records.
 */
export async function leaveLiveRoom(roomId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/live/rooms/${roomId}/leave`, {
      method: 'POST',
      headers,
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return { success: false, error: data?.detail || 'Failed to leave room.' };
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Network error leaving room.' };
  }
}

/**
 * Host-only endpoint to terminate a live room.
 */
export async function endLiveRoom(roomId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/live/rooms/${roomId}/end`, {
      method: 'POST',
      headers,
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return { success: false, error: data?.detail || 'Failed to end room.' };
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Network error ending room.' };
  }
}

/**
 * Host-only endpoint to remove/kick a participant.
 */
export async function kickParticipant(
  roomId: string,
  targetUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/live/rooms/${roomId}/kick`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ target_user_id: targetUserId }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return { success: false, error: data?.detail || 'Failed to remove participant.' };
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Network error removing participant.' };
  }
}

/**
 * Updates participant media state (mic/cam/role).
 */
export async function updateParticipantState(
  roomId: string,
  state: { is_muted?: boolean; is_cam_on?: boolean; role?: string }
): Promise<void> {
  try {
    const headers = getAuthHeaders();
    await fetch(`${API_BASE_URL}/api/live/rooms/${roomId}/participant-state`, {
      method: 'POST',
      headers,
      body: JSON.stringify(state),
    });
  } catch {
    // Non-blocking state update
  }
}
