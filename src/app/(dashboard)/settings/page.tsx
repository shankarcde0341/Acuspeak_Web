import type { Metadata } from 'next';
import { getCurrentUserServer } from '@/lib/userServer';
import { fetchCurrentUser, UserProfile } from '@/services/authService';
import SettingsView from '@/components/settings/SettingsView';

export const metadata: Metadata = {
  title: 'Settings — Acuspeak',
  description: 'Customize your Acuspeak profile, daily goals, audio settings, notifications, and privacy.',
};

export default async function SettingsPage() {
  const userServer = await getCurrentUserServer();

  let initialUser: UserProfile = {
    user_id: userServer.id,
    email: userServer.email,
    name: userServer.name,
    is_premium: false,
    english_level: 'Intermediate Speaker',
    day_streak: 5,
    total_xp: 1240,
    daily_goal_minutes: 20,
    daily_goal_completed_minutes: 12,
  };

  const freshUser = await fetchCurrentUser();
  if (freshUser) {
    initialUser = freshUser;
  }

  return <SettingsView initialUser={initialUser} />;
}
