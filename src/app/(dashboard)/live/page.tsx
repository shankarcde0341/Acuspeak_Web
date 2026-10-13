import type { Metadata } from 'next';
import { getRooms } from '@/lib/rooms';
import { LiveDashboardClient } from '@/components/live/LiveDashboardClient';

export const metadata: Metadata = {
  title: 'Live Rooms — Acuspeak',
  description: 'Join real-time English conversation rooms with audio, video, chat, and host controls.',
};

export default async function LivePage() {
  const initialRooms = await getRooms();

  return <LiveDashboardClient initialRooms={initialRooms} />;
}
