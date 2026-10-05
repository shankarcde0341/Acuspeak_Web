import type { Metadata } from 'next';
import { fetchReferralData } from '@/services/referralService';
import ReferralView from '@/components/referral/ReferralView';

export const metadata: Metadata = {
  title: 'Invite & Earn — Acuspeak',
  description: 'Invite friends to Acuspeak and earn Rs. 50 cashback + 20% discount on membership plans.',
};

export default async function ReferralPage() {
  const initialData = await fetchReferralData();

  return <ReferralView initialData={initialData} />;
}
