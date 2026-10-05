import Link from 'next/link';
import styles from './Terms.module.css';

export interface TermsSection {
  id: string;
  icon: string;
  title: string;
  content: string;
  bullets?: string[];
}

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: 'agreement',
    icon: '📄',
    title: '1. Agreement to Terms',
    content:
      'By accessing or using the Acuspeak web application, live practice rooms, lessons, or membership services, you agree to be legally bound by these Terms & Conditions. If you do not agree to all terms, please refrain from using our platform.',
  },
  {
    id: 'account',
    icon: '🔑',
    title: '2. Account Security & Credentials',
    content:
      'You are responsible for maintaining the confidentiality of your authentication credentials (Google OAuth or Phone OTP login session) and for all activities that occur under your account.',
    bullets: [
      'You must provide accurate and complete registration information.',
      'You may not share or transfer your account access to another individual.',
      'Notify us immediately if you suspect unauthorized access to your account.',
    ],
  },
  {
    id: 'acceptable-use',
    icon: '🤝',
    title: '3. Acceptable Use & Conduct Guidelines',
    content:
      'Acuspeak is a supportive global community designed for English speaking practice. To maintain a safe environment, all users must abide by our community conduct standards during 1-on-1 partner calls and Live Voice Rooms:',
    bullets: [
      'No Harassment or Bullying: Intimidation, personal attacks, or abusive language will result in immediate suspension.',
      'Zero Tolerance for Hate Speech: Discriminatory speech based on race, religion, gender, nationality, or orientation is strictly prohibited.',
      'No Spam or Unsolicited Promotion: Commercial advertising, spamming links, or soliciting money is forbidden.',
      'Appropriate Content: Transmitting offensive or sexually explicit media during video/audio practice calls is strictly banned.',
    ],
  },
  {
    id: 'reporting-blocking',
    icon: '🛡️',
    title: '4. User Safety, Reporting & Account Reviews',
    content:
      'We provide built-in reporting and partner blocking tools. Our Community Safety Team reviews all submitted reports. We reserve the right to issue warnings, suspend features, or permanently terminate accounts violating community rules without prior notice.',
  },
  {
    id: 'subscriptions',
    icon: '💳',
    title: '5. Subscriptions & Billing',
    content:
      'Acuspeak Pro memberships are billed on a recurring monthly or annual basis via Stripe:',
    bullets: [
      'Renewal: Your subscription automatically renews unless canceled prior to the next billing date.',
      'Cancellation: You can cancel your membership at any time via the Membership page. Your Pro access remains active until the end of the current billing cycle.',
    ],
  },
  {
    id: 'refunds',
    icon: '💵',
    title: '6. Refund Policy',
    content:
      'Subscription fees and digital membership access payments are non-refundable, except where required by mandatory applicable consumer protection laws.',
  },
  {
    id: 'certificates',
    icon: '📜',
    title: '7. Certificates & Accomplishments',
    content:
      'Certificates issued upon completing speaking tracks represent practice validation and module progress within Acuspeak. They do not constitute official academic degrees or accredited English language certifications (e.g. IELTS/TOEFL).',
  },
  {
    id: 'changes',
    icon: '📝',
    title: '8. Modifications to Terms',
    content:
      'We reserve the right to modify or update these terms at any time. We will notify users of material changes via email or in-app announcements. Continued use of the platform constitutes acceptance of updated terms.',
  },
  {
    id: 'contact',
    icon: '⚖️',
    title: '9. Legal Contact & Enquiries',
    content:
      'If you have questions regarding these Terms & Conditions or legal inquiries, please contact our Legal Team:',
  },
];

export default function TermsView() {
  return (
    <div className={styles.container}>
      {/* 1. Hero Header */}
      <section className={styles.headerHero} aria-label="Terms & Conditions Header">
        <div className={styles.headerOrb1} />
        <div className={styles.headerOrb2} />

        <div className={styles.topBar}>
          <div className={styles.headerTitleGroup}>
            <h1 className={styles.pageTitle}>Terms &amp; Conditions</h1>
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

      {/* 2. Callout Summary Notice */}
      <div className={styles.summaryNoticeCard}>
        <div className={styles.noticeIconTile}>📋</div>
        <p className={styles.noticeText}>
          <strong>Community Terms Summary:</strong> By using Acuspeak, you agree to treat practice partners with respect, abide by our zero-tolerance anti-harassment policy, and follow our membership terms.
        </p>
      </div>

      {/* 3. Policy Content Container */}
      <main className={styles.termsContent}>
        {TERMS_SECTIONS.map((section) => (
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
                  <span className={styles.contactTitle}>Legal &amp; Compliance Team</span>
                  <span className={styles.contactEmail}>legal@acuspeak.app</span>
                </div>
                <a href="mailto:legal@acuspeak.app" className={styles.emailBtn}>
                  <span>Send Legal Inquiry</span>
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
