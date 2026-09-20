import type { Metadata } from 'next';
import Link from 'next/link';
import { getMatchedPartner } from '@/lib/call';
import styles from './Practice.module.css';

export const metadata: Metadata = {
  title: 'Practice — Acuspeak',
};

export default async function PracticePage() {
  const partner = await getMatchedPartner();

  const initial = partner.name.charAt(0).toUpperCase();

  const query = new URLSearchParams({
    name: partner.name,
    country: partner.country,
    gender: partner.gender,
    room_id: partner.room_id,
    target_user_id: partner.user_id,
  }).toString();

  const callUrl = `/practice/call?${query}`;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Practice</h1>
        <p className={styles.subtitle}>
          Talk with a real partner and build speaking confidence.
        </p>
      </header>

      <div className={styles.partnerCard}>
        <div className={styles.leftSection}>
          <div className={styles.avatarCircle}>{initial}</div>
          <div className={styles.infoColumn}>
            <div className={styles.nameRow}>
              <h3 className={styles.partnerName}>{partner.name}</h3>
              <span className={styles.onlineBadge}>
                <span className={styles.onlineDot} /> Online
              </span>
            </div>
            <span className={styles.countryText}>{partner.country}</span>
          </div>
        </div>

        <Link href={callUrl} className={styles.startBtn}>
          Start call
        </Link>
      </div>

      <p className={styles.helperText}>
        You&apos;ll join a live voice call. Rate your partner when it ends.
      </p>
    </div>
  );
}
