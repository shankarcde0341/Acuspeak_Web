'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserProfile,
  AchievementsData,
  AchievementItem,
  fetchCurrentUser,
  fetchAchievements,
  logoutUser,
  getStoredUser,
} from '@/services/authService';
import styles from '@/app/(dashboard)/profile/Profile.module.css';

interface ProfileViewProps {
  initialUser: UserProfile;
  initialAchievements: AchievementsData | null;
}

export default function ProfileView({ initialUser, initialAchievements }: ProfileViewProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [achievementsData, setAchievementsData] = useState<AchievementsData | null>(initialAchievements);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 1. Check local storage fallback for client hydration
    const stored = getStoredUser();
    if (stored && stored.name) {
      setUser((prev) => ({
        ...prev,
        name: stored.name,
        email: stored.email || prev.email,
      }));
    }

    // 2. Fetch fresh user profile & achievements from FastAPI backend
    async function loadFreshData() {
      try {
        const [freshUser, freshAchievements] = await Promise.all([
          fetchCurrentUser(),
          fetchAchievements(),
        ]);
        if (freshUser) {
          setUser(freshUser);
        }
        if (freshAchievements) {
          setAchievementsData(freshAchievements);
        }
      } catch (err) {
        console.error('Failed to refresh profile data:', err);
      }
    }

    loadFreshData();
  }, []);

  const handleLogout = () => {
    logoutUser();
  };

  // Stats calculation
  const totalXp = user.total_xp ?? 1240;
  const dayStreak = user.day_streak ?? 5;
  const targetMinutes = user.daily_goal_minutes ?? 20;
  const completedMinutes = user.daily_goal_completed_minutes ?? 12;
  const minutesLeft = Math.max(0, targetMinutes - completedMinutes);

  // Circular progress ring math for Daily Goal
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const goalRatio = Math.min(completedMinutes / Math.max(1, targetMinutes), 1);
  const strokeDashoffset = circumference - goalRatio * circumference;

  // Avatar initials fallback
  const initials = user.name ? user.name.trim().charAt(0).toUpperCase() : 'U';

  const menuRows = [
    {
      id: 'membership',
      title: 'My Membership',
      icon: '👑',
      href: '/membership',
      tag: user.is_premium ? 'PREMIUM ACTIVE' : 'UPGRADE',
    },
    {
      id: 'certificates',
      title: 'Certificates',
      icon: '📜',
      href: '/certificates',
    },
    {
      id: 'referral',
      title: 'Invite & Earn 20% Off',
      icon: '🎁',
      href: '/referral',
      tag: 'EARN 20% OFF',
    },
    {
      id: 'leaderboard',
      title: 'Leaderboard',
      icon: '🏆',
      href: '/leaderboard',
    },
    {
      id: 'vocabulary',
      title: 'Saved Vocabulary',
      icon: '📚',
      href: '/vocabulary',
    },
    {
      id: 'call-history',
      title: 'Call History',
      icon: '📞',
      href: '/call-history',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: '⚙️',
      href: '/settings',
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: '🔒',
      href: '/privacy',
    },
    {
      id: 'terms',
      title: 'Terms & Conditions',
      icon: '📄',
      href: '/terms',
    },
  ];

  const defaultAchievements: AchievementItem[] = [
    {
      id: 'ach_1',
      title: 'First Step',
      description: 'Complete your first English speaking lesson',
      icon: '🎯',
      is_unlocked: true,
      progress_percent: 100,
      category: 'Lessons',
    },
    {
      id: 'ach_2',
      title: 'On Fire',
      description: 'Reach a 5-day speaking practice streak',
      icon: '🔥',
      is_unlocked: true,
      progress_percent: 100,
      category: 'Streaks',
    },
    {
      id: 'ach_3',
      title: 'Chatterbox',
      description: 'Practice 30 minutes of live peer speaking',
      icon: '🗣️',
      is_unlocked: true,
      progress_percent: 100,
      category: 'Practice',
    },
    {
      id: 'ach_4',
      title: 'XP Master',
      description: 'Earn 1,000 total experience points',
      icon: '🏆',
      is_unlocked: true,
      progress_percent: 100,
      category: 'Experience',
    },
    {
      id: 'ach_5',
      title: 'Fluency Pro',
      description: 'Complete 10 Business English modules',
      icon: '💎',
      is_unlocked: false,
      progress_percent: 60,
      category: 'Mastery',
    },
    {
      id: 'ach_6',
      title: 'Community Star',
      description: 'Participate in 5 Live Voice Rooms',
      icon: '🌟',
      is_unlocked: false,
      progress_percent: 40,
      category: 'Live Rooms',
    },
  ];

  const listAchievements = achievementsData?.achievements || defaultAchievements;
  const unlockedCount = achievementsData?.unlocked_count ?? listAchievements.filter((a) => a.is_unlocked).length;
  const totalCount = achievementsData?.total_count ?? listAchievements.length;

  return (
    <div className={styles.container}>
      {/* 1. Header Hero Banner */}
      <section className={styles.headerHero} aria-label="Profile Header">
        <div className={styles.headerOrb1} />
        <div className={styles.headerOrb2} />

        <div className={styles.topBar}>
          <h1 className={styles.pageTitle}>Profile</h1>
          <div className={styles.headerActions}>
            <Link
              href="/settings"
              className={styles.settingsBtn}
              aria-label="Account Settings"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className={styles.signOutBtn}
              aria-label="Sign out of your account"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* 2. Centered User Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.avatarRing}>
            <div className={styles.avatarInner}>
              {user.picture ? (
                <img src={user.picture} alt={user.name} className={styles.avatarImg} />
              ) : (
                <span>{initials}</span>
              )}
            </div>
          </div>

          <div className={styles.nameRow}>
            <h2 className={styles.userName}>{user.name}</h2>
            {user.is_premium && <span className={styles.proBadge}>✦ PRO</span>}
          </div>

          <p className={styles.userEmail}>{user.email}</p>

          <div className={styles.badgesRow}>
            <span className={styles.levelBadge}>
              <svg className="w-3.5 h-3.5 text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{user.english_level || 'Intermediate Speaker'}</span>
            </span>
          </div>
        </div>
      </section>

      {/* 3. Stats Grid Section */}
      <section className={styles.statsGrid} aria-label="Speaking Statistics">
        {/* Total XP */}
        <div className={styles.glassCard}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total XP</span>
            <span className={styles.statValue}>{totalXp.toLocaleString()} XP</span>
            <span className={styles.statSubtitle}>Level 4 Fluent Speaker</span>
          </div>
          <div className={styles.statIconTile}>🏆</div>
        </div>

        {/* Day Streak */}
        <div className={styles.glassCard}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Day Streak</span>
            <span className={styles.statValue}>{dayStreak} Days</span>
            <span className={styles.statSubtitle}>Personal best: 12 days</span>
          </div>
          <div className={styles.statIconTile}>🔥</div>
        </div>

        {/* Daily Goal Left */}
        <div className={styles.glassCard}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Daily Goal Left</span>
            <span className={styles.statValue}>{minutesLeft} Mins</span>
            <span className={styles.statSubtitle}>
              {completedMinutes} / {targetMinutes} mins done
            </span>
          </div>
          <div className={styles.ringContainer}>
            <svg className={styles.ringSvg} viewBox="0 0 56 56">
              <circle className={styles.ringBg} cx="28" cy="28" r={radius} />
              <circle
                className={styles.ringProgress}
                cx="28"
                cy="28"
                r={radius}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <span className={styles.ringText}>{Math.round(goalRatio * 100)}%</span>
          </div>
        </div>
      </section>

      {/* 4. Conditional Premium CTA Banner */}
      {!user.is_premium && (
        <section className={styles.premiumBanner} aria-label="Upgrade to Premium">
          <div className={styles.bannerContent}>
            <div className={styles.bannerTitleRow}>
              <span className={styles.bannerIcon}>💎</span>
              <h3 className={styles.bannerTitle}>Upgrade to Acuspeak Pro</h3>
            </div>
            <p className={styles.bannerDesc}>
              Unlock unlimited 1-on-1 partner practice calls, real-time AI pronunciation feedback, and exclusive Business English certificates.
            </p>
          </div>
          <Link href="/membership" className={styles.bannerCtaBtn}>
            <span>Upgrade Now</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </section>
      )}

      {/* 5. Achievements Section */}
      <section className={styles.section} aria-label="Achievements & Badges">
        <div className={styles.sectionHeaderRow}>
          <h2 className={styles.sectionTitle}>Achievements</h2>
          <span className={styles.unlockedBadge}>
            {unlockedCount} / {totalCount} Unlocked
          </span>
        </div>

        <div className={styles.achievementsGrid}>
          {listAchievements.map((item) => (
            <div
              key={item.id}
              className={`${styles.achievementCard} ${!item.is_unlocked ? styles.achievementLocked : ''}`}
            >
              <div className={styles.achievementHeader}>
                <div className={styles.achievementIconTile}>{item.icon}</div>
                <span className={styles.statusIcon}>
                  {item.is_unlocked ? '✅' : '🔒'}
                </span>
              </div>
              <h3 className={styles.achievementTitle}>{item.title}</h3>
              <p className={styles.achievementDesc}>{item.description}</p>
              <div className={styles.progressTrack}>
                <div
                  className={`${styles.progressFill} ${!item.is_unlocked ? styles.progressFillLocked : ''}`}
                  style={{ width: `${item.progress_percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. More / Navigation Menu Links */}
      <section className={styles.section} aria-label="Account Navigation">
        <h2 className={styles.sectionTitle}>Account & Preferences</h2>
        <nav className={styles.menuList} aria-label="Profile links">
          {menuRows.map((row) => (
            <Link key={row.id} href={row.href} className={styles.menuRowCard}>
              <div className={styles.menuLeft}>
                <div className={styles.menuIconTile}>{row.icon}</div>
                <span className={styles.menuLabel}>{row.title}</span>
              </div>
              <div className={styles.menuRight}>
                {row.tag && <span className={styles.menuTag}>{row.tag}</span>}
                <svg
                  className={styles.chevronIcon}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </nav>
      </section>
    </div>
  );
}
