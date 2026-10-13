import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRoom } from '@/lib/rooms';
import { RoomScreen } from '@/components/live/RoomScreen';

interface RoomPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: RoomPageProps): Promise<Metadata> {
  const { id } = await params;
  if (!id || !/^[A-Za-z0-9_-]{1,64}$/.test(id)) {
    return { title: 'Room not found — Acuspeak' };
  }

  const room = await getRoom(id).catch(() => null);
  return {
    title: room?.title ? `${room.title} — Acuspeak Live` : 'Live Room — Acuspeak',
    robots: { index: false, follow: false },
  };
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { id } = await params;

  if (!id || !/^[A-Za-z0-9_-]{1,64}$/.test(id)) {
    notFound();
  }

  const room = await getRoom(id).catch(() => null);

  return <RoomScreen roomId={id} initialRoom={room} />;
}
