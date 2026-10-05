import type { Metadata } from 'next';
import { getCurrentUserServer } from '@/lib/userServer';
import { fetchCurrentUser, fetchAchievements, UserProfile } from '@/services/authService';
import ProfileView from '@/components/profile/ProfileView';

export const metadata: Metadata = {
  title: 'Profile — Acuspeak',
  description: 'Manage your Acuspeak account, view streak, XP, achievements, and membership details.',
};

export default async function ProfilePage() {
  const userServer = await getCurrentUserServer();

  const initialUser: UserProfile = {
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

  const initialAchievements = await fetchAchievements();

  return <ProfileView initialUser={initialUser} initialAchievements={initialAchievements} />;
}
