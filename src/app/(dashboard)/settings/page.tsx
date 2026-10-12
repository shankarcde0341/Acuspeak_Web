import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getCurrentUserServer } from '@/lib/userServer';
import { fetchCurrentUser, UserProfile } from '@/services/authService';
import SettingsView from '@/components/settings/SettingsView';

export const metadata: Metadata = {
  title: 'Settings — Acuspeak',
  description: 'Customize your Acuspeak profile and daily learning goals.',
};

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;

  let initialUser: UserProfile = {
    user_id: '',
    email: '',
    name: '',
    is_premium: false,
    day_streak: 1,
    total_xp: 100,
    daily_goal_minutes: 20,
    daily_goal_completed_minutes: 0,
    streak_protection: false,
  };

  if (sessionToken) {
    const freshUser = await fetchCurrentUser(sessionToken);
    if (freshUser) {
      initialUser = freshUser;
    }
  }

  // Fallback to getCurrentUserServer if freshUser didn't load
  if (!initialUser.email) {
    const userServer = await getCurrentUserServer();
    initialUser.user_id = userServer.id;
    initialUser.email = userServer.email;
    initialUser.name = userServer.name;
  }

  return <SettingsView initialUser={initialUser} />;
}
