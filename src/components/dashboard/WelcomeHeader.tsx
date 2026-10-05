'use client';

import { useState, useEffect } from 'react';
import { fetchCurrentUser, getStoredUser } from '@/services/authService';
import styles from '@/app/(dashboard)/dashboard/Dashboard.module.css';

interface WelcomeHeaderProps {
  initialName: string;
  targetMinutes: number;
  minutesDone: number;
}

export default function WelcomeHeader({ initialName, targetMinutes, minutesDone }: WelcomeHeaderProps) {
  const [name, setName] = useState<string>(initialName);

  useEffect(() => {
    // 1. Check client storage first for immediate responsive render
    const stored = getStoredUser();
    if (stored && stored.name) {
      setName(stored.name);
    }

    // 2. Fetch authoritative user profile directly from FastAPI backend / MongoDB
    fetchCurrentUser().then((profile) => {
      if (profile && profile.name) {
        setName(profile.name);
      }
    });
  }, []);

  const firstName = name && name.trim() ? (name.trim().split(' ')[0] || name) : 'Learner';
  const remainingMins = Math.max(0, targetMinutes - minutesDone);

  return (
    <section className={styles.greetingHeader}>
      <h1 className={styles.title}>Welcome back, {firstName}</h1>
      <p className={styles.subtitle}>
        You&apos;re {remainingMins} minutes away from hitting your daily {targetMinutes}-minute speaking goal.
      </p>
    </section>
  );
}
