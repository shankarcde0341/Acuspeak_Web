import type { Metadata } from 'next';
import SuccessView from '@/components/payment/SuccessView';

export const metadata: Metadata = {
  title: 'Payment Successful — Acuspeak',
  description: 'Your payment was successful and your Acuspeak Pro membership is now active.',
};

export default function PremiumSuccessPage() {
  return <SuccessView />;
}
