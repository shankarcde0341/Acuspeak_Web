'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { User } from '@/lib/user';
import styles from './UserMenu.module.css';

interface UserMenuProps {
  user: User;
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={styles.menuContainer} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span className={styles.avatar}>{user.avatarInitial}</span>
        <span className={styles.userName}>{user.name}</span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="menu">
          <Link
            href="/profile"
            className={styles.dropdownItem}
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            Update Profile
          </Link>
          <Link
            href="/settings"
            className={styles.dropdownItem}
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            Settings
          </Link>
          <div className={styles.dropdownDivider} />
          <Link
            href="/login"
            className={`${styles.dropdownItem} ${styles.logoutItem}`}
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            Logout
          </Link>
        </div>
      )}
    </div>
  );
}
