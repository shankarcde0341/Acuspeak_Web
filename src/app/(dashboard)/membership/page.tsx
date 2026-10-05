import type { Metadata } from 'next';
import { fetchMySubscription } from '@/services/paymentService';
import MembershipView from '@/components/payment/MembershipView';

export const metadata: Metadata = {
  title: 'My Membership — Acuspeak',
  description: 'Manage your active Acuspeak Pro membership, view validity dates, and features.',
};

export default async function MembershipPage() {
  const initialSubscription = await fetchMySubscription();

  return <MembershipView initialSubscription={initialSubscription} />;
}
