import type { Metadata } from 'next';
import MatchScreen from '@/components/match/MatchScreen';

export const metadata: Metadata = {
  title: 'Find a match — Acuspeak',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MatchPage() {
  return <MatchScreen />;
}
