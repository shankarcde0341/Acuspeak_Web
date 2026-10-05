import type { Metadata } from 'next';
import { fetchCallHistory } from '@/services/authService';
import CallHistoryView from '@/components/call-history/CallHistoryView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Call History — Acuspeak',
  description: 'View your 1-on-1 partner practice call logs, partner details, and total speaking duration.',
};

export default async function CallHistoryPage() {
  const initialData = await fetchCallHistory();

  return <CallHistoryView initialData={initialData} />;
}
