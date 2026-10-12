import type { Metadata } from 'next';
import Link from 'next/link';
import SupportForm from '@/components/support/SupportForm';
import BrandLogo from '@/components/BrandLogo';

export const metadata: Metadata = {
  title: 'Support | Acuspeak',
  description: 'Get in touch with the Acuspeak team. Send us a message for support, feedback, or inquiries.',
};

export default function SupportPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)' }}>
      {/* Top Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'var(--glass)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--glass-border)',
        }}
      >
        <div
          style={{
            maxWidth: '1080px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <BrandLogo size="md" />

          <Link
            href="/dashboard"
            style={{
              fontFamily: 'var(--font-outfit), sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              color: 'var(--primary)',
              textDecoration: 'none',
            }}
          >
            Go to Dashboard →
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          maxWidth: '1080px',
          margin: '0 auto',
          padding: '48px 24px 72px 24px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-outfit), sans-serif',
              fontWeight: 700,
              fontSize: '36px',
              color: 'var(--text-primary)',
              marginBottom: '12px',
              letterSpacing: '-0.02em',
            }}
          >
            Contact Acuspeak Support
          </h1>
        </div>

        <SupportForm />
      </main>
    </div>
  );
}
