'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { User } from '@/lib/user';
import UserMenu from './UserMenu';
import styles from './DashboardNav.module.css';

interface DashboardNavProps {
  user: User;
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();

  const isLessonsActive = pathname.startsWith('/lessons');
  const isPracticeActive = pathname.startsWith('/practice');
  const isLiveActive = pathname.startsWith('/live');

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/dashboard" className={styles.logoLink}>
          <div className={styles.logoMark}>A</div>
          <span>Acuspeak</span>
        </Link>

        <ul className={styles.navPills}>
          <li>
            <Link
              href="/lessons"
              className={`${styles.pill} ${isLessonsActive ? styles.pillActive : ''}`}
              aria-current={isLessonsActive ? 'page' : undefined}
            >
              Lessons
            </Link>
          </li>
          <li>
            <Link
              href="/practice"
              className={`${styles.pill} ${isPracticeActive ? styles.pillActive : ''}`}
              aria-current={isPracticeActive ? 'page' : undefined}
            >
              Practice
            </Link>
          </li>
          <li>
            <Link
              href="/live"
              className={`${styles.pill} ${isLiveActive ? styles.pillActive : ''}`}
              aria-current={isLiveActive ? 'page' : undefined}
            >
              Live
            </Link>
          </li>
        </ul>

        <UserMenu user={user} />
      </div>
    </header>
  );
}
