'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCheckoutStatus, CheckoutStatusResult } from '@/services/paymentService';
import styles from './Success.module.css';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  const [statusResult, setStatusResult] = useState<CheckoutStatusResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      setErrorMsg('No payment checkout session found.');
      return;
    }

    let retries = 0;
    const maxRetries = 5;

    async function pollStatus() {
      const res = await getCheckoutStatus(sessionId!);
      if (res && res.status === 'paid') {
        setStatusResult(res);
        setLoading(false);
      } else if (retries < maxRetries) {
        retries += 1;
        setTimeout(pollStatus, 1000 * Math.pow(1.2, retries));
      } else {
        setLoading(false);
        setErrorMsg('Payment status verification timed out. Please check your membership page.');
      }
    }

    pollStatus();
  }, [sessionId]);

  if (loading) {
    return (
      <div className={styles.card}>
        <div className="flex justify-center my-4">
          <svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <h2 className={styles.title}>Confirming Your Payment</h2>
        <p className={styles.subtitle}>
          Securing session with backend, upgrading account to Pro, and unlocking features...
        </p>
      </div>
    );
  }

  if (errorMsg || !statusResult) {
    return (
      <div className={styles.card}>
        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-2xl mx-auto">
          ✕
        </div>
        <h2 className={styles.title}>Verification Pending</h2>
        <p className={styles.subtitle}>{errorMsg || 'Unable to confirm payment status.'}</p>
        <div className={styles.btnRow}>
          <Link href="/membership" className={styles.primaryBtn}>
            Go to Membership
          </Link>
          <Link href="/dashboard" className={styles.secondaryBtn}>
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.glowOrb} />
      <div className={styles.iconRing}>💎</div>

      <h1 className={styles.title}>Welcome to Acuspeak Pro!</h1>
      <p className={styles.subtitle}>
        Your payment was processed successfully. All Pro features, unlimited live calls, and AI feedback are now active on your account.
      </p>

      <div className={styles.bonusChip}>
        <span>🏆 Reward Unlocked: +500 Bonus XP Credited!</span>
      </div>

      <div className={styles.detailsBox}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Session ID</span>
          <span className={styles.detailValue}>{sessionId?.slice(0, 18)}...</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Plan</span>
          <span className={styles.detailValue}>{statusResult.plan_id.toUpperCase()} PRO</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Amount Paid</span>
          <span className={styles.detailValue}>₹{statusResult.amount_inr}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Account Email</span>
          <span className={styles.detailValue}>{statusResult.email}</span>
        </div>
      </div>

      <div className={styles.btnRow}>
        <Link href="/dashboard" className={styles.primaryBtn}>
          <span>Explore Dashboard</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
        <Link href="/membership" className={styles.secondaryBtn}>
          My Membership
        </Link>
      </div>
    </div>
  );
}

export default function SuccessView() {
  return (
    <div className={styles.container}>
      <Suspense
        fallback={
          <div className={styles.card}>
            <p className={styles.subtitle}>Loading payment receipt...</p>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
