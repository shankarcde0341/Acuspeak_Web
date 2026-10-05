'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  SubscriptionStatusResult,
  fetchMySubscription,
  cancelSubscription,
} from '@/services/paymentService';
import styles from './Membership.module.css';

interface MembershipViewProps {
  initialSubscription: SubscriptionStatusResult | null;
}

export default function MembershipView({ initialSubscription }: MembershipViewProps) {
  const [subData, setSubData] = useState<SubscriptionStatusResult | null>(initialSubscription);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchMySubscription().then((data) => {
      if (data) setSubData(data);
    });
  }, []);

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      const res = await cancelSubscription();
      setShowCancelModal(false);
      setIsCancelling(false);
      if (res.error) {
        setNotification(`Error: ${res.error}`);
      } else {
        setNotification('Your membership has been cancelled.');
        setSubData((prev) =>
          prev
            ? {
              ...prev,
              is_premium: false,
              plan_name: 'Free Tier',
              days_left: 0,
            }
            : null
        );
      }
    } catch {
      setIsCancelling(false);
      setShowCancelModal(false);
      setNotification('An error occurred during cancellation.');
    }
  };

  const isPro = subData?.is_premium;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Membership</h1>
        <Link href="/profile" className="text-xs font-bold text-blue-600 hover:underline">
          ← Back to Profile
        </Link>
      </header>

      {notification && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm font-semibold p-4 rounded-xl flex items-center justify-between">
          <span>{notification}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Membership Card */}
      {isPro ? (
        <div className={`${styles.statusCard} ${styles.statusCardPro}`}>
          <div className={styles.cardTopRow}>
            <span className={styles.proBadge}>✦ PRO MEMBERSHIP ACTIVE</span>
            <span className={styles.daysLeftBadge}>⏱ {subData.days_left} Days Remaining</span>
          </div>

          <div>
            <h2 className={styles.planTitle}>{subData.plan_name}</h2>
            {subData.premium_until && (
              <p className={styles.untilText}>
                Active until {new Date(subData.premium_until).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>

          <div className={styles.featuresGrid}>
            {(subData.features && subData.features.length > 0
              ? subData.features
              : [
                'Unlimited Live 1-on-1 Practice Calls',
                'Real-Time AI Pronunciation & Grammar Feedback',
                'Gender & Level Matching Filter',
                'Official Verified Speaking Certificates',
                'Priority Queue Matchmaking',
                'Ad-Free Experience',
              ]
            ).map((feat, idx) => (
              <div key={idx} className={styles.featurePill}>
                <svg className={styles.checkIcon} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <div className={styles.actionRow}>
            <span className="text-xs opacity-75">Auto-renewal powered by Acuspeak Gateway</span>
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className={styles.cancelBtn}
            >
              Cancel Membership
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.statusCard}>
          <div className={styles.cardTopRow}>
            <span className="bg-slate-100 text-slate-700 font-bold text-xs px-3 py-1 rounded-full">
              FREE TIER
            </span>
          </div>

          <div>
            <h2 className="font-bold text-2xl text-slate-900 font-outfit">Standard Account</h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              You are currently on the Acuspeak Free Tier with basic lesson access.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <span className="text-blue-500">✓</span> Basic Speaking Lessons
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <span className="text-blue-500">✓</span> Daily Goal Tracking
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
              <span className="text-slate-300">✕</span> Unlimited Live Peer Calls (Pro Only)
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
              <span className="text-slate-300">✕</span> AI Pronunciation Feedback (Pro Only)
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Upgrade anytime for unlimited practice.</span>
            <Link href="/premium" className={styles.upgradeBtn}>
              <span>Upgrade to Pro</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showCancelModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalBox}>
            <h3 className={styles.modalTitle}>Cancel Membership?</h3>
            <p className={styles.modalDesc}>
              Are you sure you want to cancel your Acuspeak Pro membership? You will lose access to unlimited live peer calls, AI pronunciation feedback, and verified certificates.
            </p>
            <div className={styles.modalBtnRow}>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className={styles.modalCancelBtn}
                disabled={isCancelling}
              >
                Keep Membership
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className={styles.modalConfirmBtn}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
