import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getCurrentUserServer } from '@/lib/userServer';
import { fetchCurrentUser, fetchAchievements, UserProfile, AchievementsData } from '@/services/authService';
import ProfileView from '@/components/profile/ProfileView';

export const metadata: Metadata = {
  title: 'Profile — Acuspeak',
  description: 'Manage your Acuspeak account, view streak, XP, achievements, and membership details.',
};

export default async function ProfilePage() {
  const userServer = await getCurrentUserServer();
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;

  let initialUser: UserProfile = {
    user_id: userServer.id,
    email: userServer.email,
    name: userServer.name,
    is_premium: false,
    english_level: 'Intermediate Speaker',
    day_streak: 1,
    total_xp: 100,
    daily_goal_minutes: 20,
    daily_goal_completed_minutes: 0,
  };

  let initialAchievements: AchievementsData | null = null;

  if (sessionToken) {
    try {
      const [userProfile, achievements] = await Promise.all([
        fetchCurrentUser(sessionToken),
        fetchAchievements(sessionToken),
      ]);
      if (userProfile) {
        initialUser = userProfile;
      }
      if (achievements) {
        initialAchievements = achievements;
      }
    } catch (e) {
      console.error('Error fetching initial profile server data:', e);
    }
  }

  return <ProfileView initialUser={initialUser} initialAchievements={initialAchievements} />;
}
