import type { Metadata } from 'next';
import CancelView from '@/components/payment/CancelView';

export const metadata: Metadata = {
  title: 'Checkout Cancelled — Acuspeak',
  description: 'Your payment checkout was cancelled. No charges were made.',
};

export default function PremiumCancelPage() {
  return <CancelView />;
}
