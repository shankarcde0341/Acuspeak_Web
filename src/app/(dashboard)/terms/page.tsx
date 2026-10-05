import type { Metadata } from 'next';
import TermsView from '@/components/terms/TermsView';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Acuspeak',
  description: 'Read the Acuspeak Terms & Conditions. Learn about account security, community conduct guidelines, and subscriptions.',
};

export default function TermsPage() {
  return <TermsView />;
}
