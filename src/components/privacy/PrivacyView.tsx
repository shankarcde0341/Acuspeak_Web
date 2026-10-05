import Link from 'next/link';
import styles from './Privacy.module.css';

export interface PolicySection {
  id: string;
  icon: string;
  title: string;
  content: string;
  bullets?: string[];
}

export const PRIVACY_SECTIONS: PolicySection[] = [
  {
    id: 'introduction',
    icon: '📜',
    title: '1. Introduction',
    content:
      'Welcome to Acuspeak. We are deeply committed to protecting your personal privacy, safeguarding your voice data, and providing a transparent English speaking practice experience. This Privacy Policy outlines how we collect, process, and protect your information when you access our web application, practice tools, and live speaking rooms.',
  },
  {
    id: 'information-collected',
    icon: '📊',
    title: '2. Information We Collect',
    content:
      'We only collect essential data necessary to provide personalized AI feedback, maintain your daily practice streak, and connect you with 1-on-1 peer practice partners:',
    bullets: [
      'Account & Authentication: Name, verified email address, and profile image retrieved via Google OAuth 2.0 or Phone OTP verification.',
      'Learning Progress Data: Total experience points (XP), daily practice goal progress, streak logs, completed lesson categories, and unlocked achievement badges.',
      'Call & Room Metadata: Timestamps of practice calls, partner usernames, room topic selections, and call duration logs.',
    ],
  },
  {
    id: 'data-usage',
    icon: '🎯',
    title: '3. How We Use Your Data',
    content:
      'Your information is strictly used to deliver, personalize, and improve your English fluency experience:',
    bullets: [
      'Customizing daily practice recommendations and tracking fluency progress.',
      'Displaying weekly leaderboard ranks and unlocked achievements.',
      'No Data Sales Guarantee: We NEVER sell, rent, or monetize your personal information or profile details to third-party advertisers.',
    ],
  },
  {
    id: 'voice-privacy',
    icon: '🔒',
    title: '4. Voice Interactions & Audio Privacy',
    content:
      'Your live 1-on-1 partner practice calls use encrypted WebRTC peer-to-peer streaming technology. We store session metadata (call duration and timestamps) only. We do NOT record, transcribe, or store raw audio calls on our servers.',
  },
  {
    id: 'third-parties',
    icon: '🤝',
    title: '5. Third-Party Services & Security',
    content:
      'We partner with industry-standard, secure service providers to power your Acuspeak account:',
    bullets: [
      'Google OAuth 2.0 for secure single sign-on authentication.',
      'Stripe Payment Gateway for PCI-compliant subscription billing.',
      'MongoDB Atlas cloud infrastructure for encrypted database storage.',
    ],
  },
  {
    id: 'user-rights',
    icon: '⚖️',
    title: '6. Your Rights & Data Controls',
    content:
      'You maintain full ownership of your personal data. You may request account deletion, data export, or a complete reset of your speaking progress at any time. Account deletion requests are processed within 30 days of submission.',
  },
  {
    id: 'contact',
    icon: '📧',
    title: '7. Contact Us',
    content:
      'If you have questions, concerns, or privacy requests regarding your data, please contact our Data Protection Officer directly:',
  },
];

export default function PrivacyView() {
  return (
    <div className={styles.container}>
      {/* 1. Hero Header */}
      <section className={styles.headerHero} aria-label="Privacy Policy Header">
        <div className={styles.headerOrb1} />
        <div className={styles.headerOrb2} />

        <div className={styles.topBar}>
          <div className={styles.headerTitleGroup}>
            <h1 className={styles.pageTitle}>Privacy Policy</h1>
            <span className={styles.pageMeta}>Last updated: October 2026</span>
          </div>
          <Link href="/profile" className={styles.backBtn}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Profile</span>
          </Link>
        </div>
      </section>

      {/* 2. Callout Highlight Banner */}
      <div className={styles.guaranteeCard}>
        <div className={styles.guaranteeIconTile}>🔒</div>
        <p className={styles.guaranteeText}>
          <strong>Data Security Guarantee:</strong> Acuspeak uses end-to-end encrypted audio streams and industry-standard security. We <strong>never sell or monetize</strong> your personal voice data.
        </p>
      </div>

      {/* 3. Policy Sections Container */}
      <main className={styles.policyContent}>
        {PRIVACY_SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className={styles.sectionBlock}>
            <div className={styles.sectionHeaderRow}>
              <span className={styles.sectionIcon}>{section.icon}</span>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
            </div>
            <p className={styles.sectionParagraph}>{section.content}</p>

            {section.bullets && (
              <ul className={styles.bulletList}>
                {section.bullets.map((bullet, idx) => (
                  <li key={idx} className={styles.bulletItem}>
                    <div className={styles.bulletDot} />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {section.id === 'contact' && (
              <div className={styles.contactCard}>
                <div className={styles.contactInfo}>
                  <span className={styles.contactTitle}>Data Privacy Officer</span>
                  <span className={styles.contactEmail}>privacy@acuspeak.app</span>
                </div>
                <a href="mailto:privacy@acuspeak.app" className={styles.emailBtn}>
                  <span>Send Email</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>
              </div>
            )}
          </section>
        ))}
      </main>
    </div>
  );
}
