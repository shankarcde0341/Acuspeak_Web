'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LeaderboardResponse, LeaderboardEntry, fetchWeeklyLeaderboard } from '@/services/leaderboardService';
import styles from '@/app/(dashboard)/leaderboard/Leaderboard.module.css';

interface LeaderboardViewProps {
  initialData: LeaderboardResponse | null;
}

export default function LeaderboardView({ initialData }: LeaderboardViewProps) {
  const [data, setData] = useState<LeaderboardResponse | null>(initialData);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    fetchWeeklyLeaderboard().then((res) => {
      if (res) setData(res);
      setLoading(false);
    });
  }, []);

  const defaultRankings: LeaderboardEntry[] = [
    { rank: 1, user_id: 'u_1', name: 'Aarav Mehta', avatar_initial: 'A', is_premium: true, weekly_xp: 2450, streak: 14, is_current_user: false },
    { rank: 2, user_id: 'u_2', name: 'Ananya Sharma', avatar_initial: 'A', is_premium: true, weekly_xp: 2180, streak: 10, is_current_user: false },
    { rank: 3, user_id: 'u_3', name: 'Priya Patel', avatar_initial: 'P', is_premium: false, weekly_xp: 1890, streak: 8, is_current_user: false },
    { rank: 4, user_id: 'u_4', name: 'Rohan Iyer', avatar_initial: 'R', is_premium: false, weekly_xp: 1560, streak: 6, is_current_user: false },
    { rank: 5, user_id: 'u_me', name: 'You', avatar_initial: 'Y', is_premium: false, weekly_xp: 1240, streak: 5, is_current_user: true },
    { rank: 6, user_id: 'u_6', name: 'Vikram Singh', avatar_initial: 'V', is_premium: false, weekly_xp: 1120, streak: 4, is_current_user: false },
    { rank: 7, user_id: 'u_7', name: 'Neha Kapoor', avatar_initial: 'N', is_premium: true, weekly_xp: 980, streak: 5, is_current_user: false },
    { rank: 8, user_id: 'u_8', name: 'Rishabh Verma', avatar_initial: 'R', is_premium: false, weekly_xp: 840, streak: 3, is_current_user: false },
    { rank: 9, user_id: 'u_9', name: 'Kavya Menon', avatar_initial: 'K', is_premium: false, weekly_xp: 720, streak: 2, is_current_user: false },
    { rank: 10, user_id: 'u_10', name: 'Kabir Das', avatar_initial: 'K', is_premium: false, weekly_xp: 650, streak: 4, is_current_user: false },
  ];

  const rankings = data?.rankings && data.rankings.length > 0 ? data.rankings : defaultRankings;
  const podium = data?.podium && data.podium.length >= 3 ? data.podium : rankings.slice(0, 3);
  const currentUserRank = data?.current_user_rank || rankings.find((r) => r.is_current_user) || rankings[4];

  const rank1 = podium.find((p) => p.rank === 1) || podium[0];
  const rank2 = podium.find((p) => p.rank === 2) || podium[1];
  const rank3 = podium.find((p) => p.rank === 3) || podium[2];

  const listRemaining = rankings.filter((r) => r.rank >= 4);

  return (
    <div className={styles.container}>
      {/* 1. Header & Hero Section */}
      <section className={styles.heroHero} aria-label="Weekly Champions Banner">
        <div className={styles.heroOrb1} />
        <div className={styles.heroOrb2} />

        <div className={styles.topBar}>
          <Link href="/profile" className={styles.backLink}>
            <span>← Back to Profile</span>
          </Link>
          <span className={styles.topBadge}>🏆 RESETTING IN {data?.week_end_days_left ?? 2} DAYS</span>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.trophyIconTile}>🏆</div>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>Weekly Champions</h1>
            <p className={styles.heroSubtext}>
              Practice speaking, complete lessons, and earn XP to climb the leaderboard every week!
            </p>
          </div>
        </div>
      </section>

      {/* 2. Podium Section (Top 3 Users) */}
      <section className={styles.podiumSection} aria-label="Top 3 Podium">
        {/* Rank 2 (Silver - Left) */}
        {rank2 && (
          <div className={`${styles.podiumCard} ${styles.podiumRank2}`}>
            <span className={styles.crownBadge}>🥈</span>
            <div className={`${styles.avatarCircle} ${styles.avatarRank2}`}>
              {rank2.picture ? (
                <img src={rank2.picture} alt={rank2.name} className={styles.avatarImg} />
              ) : (
                <span>{rank2.avatar_initial}</span>
              )}
            </div>
            <div className={styles.podiumName}>
              <span>{rank2.name}</span>
              {rank2.is_premium && <span className={styles.proChip}>PRO</span>}
            </div>
            <span className={styles.podiumXp}>{rank2.weekly_xp.toLocaleString()} XP</span>
            <span className={`${styles.podiumRankBadge} ${styles.badgeRank2}`}>2ND PLACE</span>
          </div>
        )}

        {/* Rank 1 (Gold - Center Highest) */}
        {rank1 && (
          <div className={`${styles.podiumCard} ${styles.podiumRank1}`}>
            <span className={styles.crownBadge}>👑</span>
            <div className={`${styles.avatarCircle} ${styles.avatarRank1}`}>
              {rank1.picture ? (
                <img src={rank1.picture} alt={rank1.name} className={styles.avatarImg} />
              ) : (
                <span>{rank1.avatar_initial}</span>
              )}
            </div>
            <div className={styles.podiumName}>
              <span>{rank1.name}</span>
              {rank1.is_premium && <span className={styles.proChip}>PRO</span>}
            </div>
            <span className={styles.podiumXp}>{rank1.weekly_xp.toLocaleString()} XP</span>
            <span className={`${styles.podiumRankBadge} ${styles.badgeRank1}`}>1ST PLACE</span>
          </div>
        )}

        {/* Rank 3 (Bronze - Right) */}
        {rank3 && (
          <div className={`${styles.podiumCard} ${styles.podiumRank3}`}>
            <span className={styles.crownBadge}>🥉</span>
            <div className={`${styles.avatarCircle} ${styles.avatarRank3}`}>
              {rank3.picture ? (
                <img src={rank3.picture} alt={rank3.name} className={styles.avatarImg} />
              ) : (
                <span>{rank3.avatar_initial}</span>
              )}
            </div>
            <div className={styles.podiumName}>
              <span>{rank3.name}</span>
              {rank3.is_premium && <span className={styles.proChip}>PRO</span>}
            </div>
            <span className={styles.podiumXp}>{rank3.weekly_xp.toLocaleString()} XP</span>
            <span className={`${styles.podiumRankBadge} ${styles.badgeRank3}`}>3RD PLACE</span>
          </div>
        )}
      </section>

      {/* 3. User Rank Summary Card */}
      {currentUserRank && (
        <section className={styles.userSummaryCard} aria-label="Your Rank Summary">
          <div className={styles.summaryLeft}>
            <span className={styles.summaryRankNumber}>#{currentUserRank.rank}</span>
            <div className={styles.summaryAvatar}>
              {currentUserRank.picture ? (
                <img src={currentUserRank.picture} alt={currentUserRank.name} className={styles.avatarImg} />
              ) : (
                <span>{currentUserRank.avatar_initial}</span>
              )}
            </div>
            <div className={styles.summaryText}>
              <div className={styles.summaryName}>
                <span>{currentUserRank.name} (You)</span>
                {currentUserRank.is_premium && <span className="ml-2 text-xs font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full">PRO</span>}
              </div>
              <span className={styles.summarySub}>Top 10% Weekly Speaker</span>
            </div>
          </div>

          <div className={styles.summaryRight}>
            <span className={styles.summaryXp}>{currentUserRank.weekly_xp.toLocaleString()} XP</span>
            <span className={styles.summaryStreak}>🔥 {currentUserRank.streak} Day Streak</span>
          </div>
        </section>
      )}

      {/* 4. Remaining Leaderboard List (Rank 4 onwards) */}
      <section className={styles.section} aria-label="Full Leaderboard Rankings">
        <h2 className={styles.sectionTitle}>Global Rankings</h2>

        {loading ? (
          <div className="space-y-3">
            <div className={styles.skeletonBox} />
            <div className={styles.skeletonBox} />
            <div className={styles.skeletonBox} />
          </div>
        ) : (
          <ol className={styles.rankingsList}>
            {listRemaining.map((entry) => (
              <li
                key={entry.user_id}
                className={`${styles.rankRowCard} ${entry.is_current_user ? styles.rankRowMe : ''}`}
              >
                <div className={styles.rowLeft}>
                  <span className={`${styles.rankNum} ${entry.is_current_user ? styles.rankNumMe : ''}`}>
                    #{entry.rank}
                  </span>
                  <div className={styles.rowAvatar}>
                    {entry.picture ? (
                      <img src={entry.picture} alt={entry.name} className={styles.avatarImg} />
                    ) : (
                      <span>{entry.avatar_initial}</span>
                    )}
                  </div>
                  <div className={styles.rowName}>
                    <span>{entry.name}</span>
                    {entry.is_current_user && <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">(You)</span>}
                    {entry.is_premium && <span className={styles.proChip}>PRO</span>}
                  </div>
                </div>

                <div className={styles.rowRight}>
                  <div className={styles.streakPill}>
                    <span>🔥</span>
                    <span>{entry.streak}d</span>
                  </div>
                  <span className={styles.xpBadge}>{entry.weekly_xp.toLocaleString()} XP</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
