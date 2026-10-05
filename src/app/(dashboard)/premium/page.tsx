import type { Metadata } from 'next';
import { fetchPlansCatalog } from '@/services/paymentService';
import PricingView from '@/components/payment/PricingView';

export const metadata: Metadata = {
  title: 'Upgrade to Premium — Acuspeak',
  description: 'Choose your Acuspeak membership plan for unlimited live 1-on-1 English practice and AI feedback.',
};

export default async function PremiumPricingPage() {
  const initialPlans = await fetchPlansCatalog();

  return <PricingView initialPlans={initialPlans} />;
}
