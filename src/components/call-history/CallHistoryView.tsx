'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CallHistoryItem, CallHistoryResponse, fetchCallHistory } from '@/services/authService';
import styles from './CallHistory.module.css';

interface CallHistoryViewProps {
  initialData: CallHistoryResponse | null;
}

export default function CallHistoryView({ initialData }: CallHistoryViewProps) {
  const [data, setData] = useState<CallHistoryResponse | null>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFreshCallHistory() {
      try {
        const fresh = await fetchCallHistory();
        if (fresh) {
          setData(fresh);
        }
      } catch (err) {
        console.error('Failed to load call history:', err);
        setError('Unable to load your call history. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    }

    loadFreshCallHistory();
  }, []);

  // Format seconds into readable "Xm Ys" format (e.g. 945s -> "15m 45s", 480s -> "8m 00s")
  const formatDuration = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const padSecs = secs < 10 ? `0${secs}` : `${secs}`;
    return `${mins}m ${padSecs}s`;
  };

  const historyList = data?.history || [];
  const totalCalls = data?.total_calls ?? historyList.length;
  const totalMins = data?.total_duration_minutes ?? Math.round(historyList.reduce((acc, item) => acc + item.duration_seconds, 0) / 60);
  const avgSecs = data?.average_duration_seconds ?? (historyList.length ? Math.round(historyList.reduce((acc, item) => acc + item.duration_seconds, 0) / historyList.length) : 0);

  return (
    <div className={styles.container}>
      {/* 1. ScreenHeader Hero Banner */}
      <section className={styles.headerHero} aria-label="Call History Header">
        <div className={styles.headerOrb1} />
        <div className={styles.headerOrb2} />

        <div className={styles.topBar}>
          <div className={styles.headerTitleGroup}>
            <h1 className={styles.pageTitle}>Call History</h1>
            <p className={styles.pageSubtitle}>Review your past 1-on-1 partner practice logs & duration stats</p>
          </div>
          <Link href="/profile" className={styles.backBtn}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Profile</span>
          </Link>
        </div>
      </section>

      {/* 2. Summary Metrics */}
      <section className={styles.summaryGrid} aria-label="Call Summary Statistics">
        <div className={styles.summaryCard}>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryLabel}>Total Practice Calls</span>
            <span className={styles.summaryValue}>{totalCalls} Calls</span>
          </div>
          <div className={styles.summaryIconTile}>📞</div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryLabel}>Total Practice Time</span>
            <span className={styles.summaryValue}>{totalMins} Mins</span>
          </div>
          <div className={styles.summaryIconTile}>⏱️</div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryLabel}>Avg Call Duration</span>
            <span className={styles.summaryValue}>{formatDuration(avgSecs)}</span>
          </div>
          <div className={styles.summaryIconTile}>📊</div>
        </div>
      </section>

      {/* 3. Call History List Section */}
      <section className={styles.section} aria-label="Recent Calls List">
        <div className={styles.sectionHeaderRow}>
          <h2 className={styles.sectionTitle}>Recent Sessions</h2>
          <Link href="/practice/match" className={styles.startMatchBtn}>
            <span>Start Practice Match</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* Loading Spinner State */}
        {isLoading && (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Fetching your practice call records...</p>
          </div>
        )}

        {/* Empty State UI */}
        {!isLoading && historyList.length === 0 && (
          <div className={styles.emptyStateCard}>
            <div className={styles.emptyIconTile}>📞</div>
            <h3 className={styles.emptyTitle}>No calls yet. Start matching!</h3>
            <p className={styles.emptyDesc}>
              Connect with 1-on-1 English practice partners to build your speaking confidence and unlock detailed call logs.
            </p>
            <Link href="/practice/match" className={styles.startMatchBtn}>
              <span>Match a Partner Now</span>
            </Link>
          </div>
        )}

        {/* Call Cards List */}
        {!isLoading && historyList.length > 0 && (
          <div className={styles.callList}>
            {historyList.map((item) => {
              const initials = item.partner_name ? item.partner_name.trim().charAt(0).toUpperCase() : 'P';

              return (
                <div key={item.call_id} className={styles.callCard}>
                  <div className={styles.partnerLeft}>
                    <div className={styles.avatarRing}>
                      <div className={styles.avatarInner}>
                        {item.partner_avatar ? (
                          <img src={item.partner_avatar} alt={item.partner_name} className={styles.avatarImg} />
                        ) : (
                          <span>{initials}</span>
                        )}
                      </div>
                      {item.is_partner_pro && <span className={styles.proBadge}>PRO</span>}
                    </div>

                    <div className={styles.partnerDetails}>
                      <div className={styles.nameRow}>
                        <h3 className={styles.partnerName}>{item.partner_name}</h3>
                        <span className={styles.levelTag}>{item.partner_english_level}</span>
                      </div>
                      <p className={styles.topicText}>Topic: {item.topic}</p>
                      <div className={styles.metaRow}>
                        <span className={styles.timeText}>🕒 {item.started_at}</span>
                        <span className={styles.timeText}>• {item.call_type}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.callRight}>
                    <div className={styles.durationBadge}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{formatDuration(item.duration_seconds)}</span>
                    </div>

                    <Link
                      href="/practice/match"
                      className={styles.callBackBtn}
                      title={`Match again with ${item.partner_name}`}
                      aria-label={`Match again with ${item.partner_name}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
