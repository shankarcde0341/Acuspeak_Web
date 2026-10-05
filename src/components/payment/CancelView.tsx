'use client';

import Link from 'next/link';
import styles from './Success.module.css';

export default function CancelView() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-3xl mx-auto">
          🛒
        </div>

        <h1 className={styles.title}>Checkout Cancelled</h1>
        <p className={styles.subtitle}>
          No charge was made to your account. You can return to compare our pricing tiers whenever you are ready.
        </p>

        <div className={styles.detailsBox}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Status</span>
            <span className={styles.detailValue} style={{ color: '#D97706' }}>
              Cancelled by User
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Amount Charged</span>
            <span className={styles.detailValue}>₹0.00</span>
          </div>
        </div>

        <div className={styles.btnRow}>
          <Link href="/premium" className={styles.primaryBtn}>
            View Pricing Plans
          </Link>
          <Link href="/dashboard" className={styles.secondaryBtn}>
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
