import type { Metadata } from 'next';
import { getCurrentUserServer } from '@/lib/userServer';
import DashboardNav from '@/components/DashboardNav';
import AuthGuard from '@/components/auth/AuthGuard';

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
  const user = await getCurrentUserServer();

  return (
    <AuthGuard>
      <div>
        <DashboardNav user={user} />
        <main className="wrap" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-xl)' }}>
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
