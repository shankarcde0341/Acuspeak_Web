import type { Metadata } from 'next';
import PrivacyView from '@/components/privacy/PrivacyView';

export const metadata: Metadata = {
  title: 'Privacy Policy — Acuspeak',
  description: 'Read the Acuspeak Privacy Policy. Learn how we protect your personal data, voice interactions, and security.',
};

export default function PrivacyPage() {
  return <PrivacyView />;
}
