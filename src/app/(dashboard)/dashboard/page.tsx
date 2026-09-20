import Link from 'next/link';
import { getCurrentUser } from '@/lib/user';
import { getDashboardData } from '@/lib/dashboard';
import styles from './Dashboard.module.css';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const data = await getDashboardData();

  const firstName = user.name.split(' ')[0] || user.name;
  const { stats, continueLesson, wordOfTheDay } = data;

  // Circular progress ring calculations for Daily Goal
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const goalRatio = Math.min(stats.dailyGoal.minutesDone / stats.dailyGoal.targetMinutes, 1);
  const strokeDashoffset = circumference - goalRatio * circumference;

  return (
    <div className={styles.container}>
      {/* 1. Greeting */}
      <section className={styles.greetingHeader}>
        <h1 className={styles.title}>Welcome back, {firstName}</h1>
        <p className={styles.subtitle}>
          You&apos;re {stats.dailyGoal.targetMinutes - stats.dailyGoal.minutesDone} minutes away from hitting your daily {stats.dailyGoal.targetMinutes}-minute speaking goal.
        </p>
      </section>

      {/* 2. Stats Row */}
      <section className={styles.statsGrid}>
        {/* Day Streak */}
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Day Streak</span>
            <span className={styles.statValue}>{stats.dayStreak} Days</span>
            <span className={styles.statSubtitle}>Personal best: 12 days</span>
          </div>
          <div className={styles.statIconTile}>🔥</div>
        </div>

        {/* Total XP */}
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total XP</span>
            <span className={styles.statValue}>{stats.totalXp.toLocaleString()} XP</span>
            <span className={styles.statSubtitle}>Level 4 Fluent Speaker</span>
          </div>
          <div className={styles.statIconTile}>🏆</div>
        </div>

        {/* Daily Goal Progress Ring */}
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Daily Goal</span>
            <span className={styles.statValue}>
              {stats.dailyGoal.minutesDone} / {stats.dailyGoal.targetMinutes} mins
            </span>
            <span className={styles.statSubtitle}>{Math.round(goalRatio * 100)}% completed today</span>
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

      {/* 3. Continue Learning */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Continue Learning</h2>
        <div className={styles.continueCard}>
          <div className={styles.continueTopRow}>
            <span className={styles.categoryBadge}>{continueLesson.category}</span>
            <span className={styles.stepText}>
              Step {continueLesson.completedSteps} of {continueLesson.totalSteps}
            </span>
          </div>
          <h3 className={styles.lessonTitle}>{continueLesson.title}</h3>

          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${continueLesson.progressPercent}%` }}
            />
          </div>

          <div className={styles.continueFooter}>
            <span className={styles.progressPercentage}>{continueLesson.progressPercent}% Completed</span>
            <Link href="/lessons" className={styles.primaryBtn}>
              Continue lesson →
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Word of the Day */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Word of the Day</h2>
        <div className={styles.wordCard}>
          <div className={styles.wordHeader}>
            <h3 className={styles.wordTitle}>{wordOfTheDay.word}</h3>
            <span className={styles.wordMeta}>
              {wordOfTheDay.phonetic} • {wordOfTheDay.partOfSpeech}
            </span>
          </div>
          <p className={styles.wordMeaning}>{wordOfTheDay.meaning}</p>
          <blockquote className={styles.wordExample}>&ldquo;{wordOfTheDay.example}&rdquo;</blockquote>
        </div>
      </section>
    </div>
  );
}
