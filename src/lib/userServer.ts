import { cookies } from 'next/headers';
import { fetchCurrentUser } from '@/services/authService';
import { User, DEFAULT_USER } from './user';

export async function getCurrentUserServer(): Promise<User> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (sessionToken) {
      const profile = await fetchCurrentUser(sessionToken);
      if (profile && profile.name) {
        return {
          id: profile.user_id || 'usr_acuspeak_101',
          name: profile.name,
          email: profile.email,
          avatarInitial: profile.name.trim().charAt(0).toUpperCase() || 'U',
        };
      }
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'digest' in error && (error as { digest?: string }).digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    console.error('Error in getCurrentUserServer fetch:', error);
  }

  return DEFAULT_USER;
}
