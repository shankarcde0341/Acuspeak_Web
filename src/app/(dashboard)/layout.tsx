import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/user';
import DashboardNav from '@/components/DashboardNav';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div>
      <DashboardNav user={user} />
      <main className="wrap" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-xl)' }}>
        {children}
      </main>
    </div>
  );
}
