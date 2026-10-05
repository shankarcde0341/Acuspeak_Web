import type { Metadata } from 'next';
import { fetchWeeklyLeaderboard } from '@/services/leaderboardService';
import LeaderboardView from '@/components/leaderboard/LeaderboardView';

export const metadata: Metadata = {
  title: 'Weekly Champions Leaderboard — Acuspeak',
  description: 'View weekly top English speakers, podium rankings, streak counts, and XP scores.',
};

export default async function LeaderboardPage() {
  const initialData = await fetchWeeklyLeaderboard();

  return <LeaderboardView initialData={initialData} />;
}
