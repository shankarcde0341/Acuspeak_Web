import type { Lesson } from '@/lib/lessons';
import styles from './LessonRow.module.css';

interface LessonRowProps {
  lesson: Lesson;
  index: number;
}

export default function LessonRow({ lesson, index }: LessonRowProps) {
  return (
    <li
      className={styles.row}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className={styles.numberCircle}>{index + 1}</div>

      <div className={styles.textBlock}>
        <h3 className={styles.title}>{lesson.title}</h3>
        <p className={styles.description}>{lesson.description}</p>

        <div className={styles.metaRow}>
          {/* Badge 1: Clock + Duration */}
          <span className={styles.badge}>
            <svg
              className={styles.badgeIcon}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
            </svg>
            {lesson.duration_minutes} min
          </span>

          {/* Badge 2: Bolt + XP */}
          <span className={`${styles.badge} ${styles.xpBadge}`}>
            <svg
              className={styles.badgeIcon}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            +{lesson.xp_reward} XP
          </span>

          {/* Badge 3: Level */}
          <span className={styles.badge}>{lesson.level}</span>
        </div>
      </div>
    </li>
  );
}
