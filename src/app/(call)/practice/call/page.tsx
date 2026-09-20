import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import CallScreen from '@/components/call/CallScreen';

export const metadata: Metadata = {
  title: 'Practice call — Acuspeak',
  robots: {
    index: false,
    follow: false,
  },
};

interface CallPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function getSingleParam(val: string | string[] | undefined): string | undefined {
  if (Array.isArray(val)) {
    return val[0];
  }
  return val;
}

export default async function PracticeCallPage({ searchParams }: CallPageProps) {
  const params = await searchParams;

  const rawName = getSingleParam(params.name)?.trim() || '';
  const rawCountry = getSingleParam(params.country)?.trim() || '';
  const rawGender = getSingleParam(params.gender)?.trim().toLowerCase() || '';
  const rawRoomId = getSingleParam(params.room_id)?.trim();
  const rawTargetUserId = getSingleParam(params.target_user_id)?.trim();

  // Validate and sanitize inputs
  const name = rawName.slice(0, 40);
  const country = rawCountry.slice(0, 40);

  if (!name) {
    redirect('/practice');
  }

  const gender =
    rawGender === 'male' || rawGender === 'female' || rawGender === 'any'
      ? rawGender
      : 'any';

  const idRegex = /^[A-Za-z0-9_-]{1,64}$/;
  const roomId = rawRoomId && idRegex.test(rawRoomId) ? rawRoomId : undefined;
  const targetUserId =
    rawTargetUserId && idRegex.test(rawTargetUserId) ? rawTargetUserId : undefined;

  return (
    <CallScreen
      name={name}
      country={country}
      gender={gender}
      roomId={roomId}
      targetUserId={targetUserId}
    />
  );
}
