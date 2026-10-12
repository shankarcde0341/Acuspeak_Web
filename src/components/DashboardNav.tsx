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

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link
          href="/"
          onClick={handleLogoClick}
          className={styles.logoLink}
          aria-label="Acuspeak - Home"
        >
          <div className={styles.logoMark} aria-hidden="true">A</div>
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
              href="/practice/match"
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
