import { getAuthToken } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  avatar_initial: string;
  picture?: string | null;
  is_premium: boolean;
  weekly_xp: number;
  streak: number;
  is_current_user: boolean;
}

export interface LeaderboardResponse {
  current_user_rank: LeaderboardEntry | null;
  podium: LeaderboardEntry[];
  rankings: LeaderboardEntry[];
  week_end_days_left: number;
}

/**
 * Fetches weekly champions leaderboard rankings from FastAPI backend /api/leaderboard/weekly.
 */
export async function fetchWeeklyLeaderboard(token?: string): Promise<LeaderboardResponse | null> {
  try {
    const sessionToken = token || getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/leaderboard/weekly`, {
      method: 'GET',
      headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
      cache: 'no-store',
    });

    if (!response.ok) return null;
    const data: LeaderboardResponse = await response.json();
    return data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'digest' in error && (error as { digest?: string }).digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    console.error('Failed to fetch leaderboard rankings:', error);
    return null;
  }
}
