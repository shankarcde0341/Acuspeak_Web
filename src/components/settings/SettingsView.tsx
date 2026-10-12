'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserProfile, getStoredUser, updateUserSettings, fetchCurrentUser } from '@/services/authService';
import styles from './Settings.module.css';

interface SettingsViewProps {
  initialUser: UserProfile;
}

export default function SettingsView({ initialUser }: SettingsViewProps) {
  const router = useRouter();

  // Form State
  const [name, setName] = useState(initialUser.name || '');
  const [email, setEmail] = useState(initialUser.email || '');
  const [englishLevel, setEnglishLevel] = useState(initialUser.english_level || 'Intermediate Speaker');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(initialUser.daily_goal_minutes || 20);
  const [streakProtection, setStreakProtection] = useState(initialUser.streak_protection || false);

  // Status & Feedback State
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Sync fresh profile data from database on mount
  useEffect(() => {
    let isMounted = true;

    async function loadFreshProfile() {
      try {
        const fresh = await fetchCurrentUser();
        if (fresh && isMounted) {
          if (fresh.name) setName(fresh.name);
          if (fresh.email) setEmail(fresh.email);
          if (fresh.english_level) setEnglishLevel(fresh.english_level);
          if (fresh.daily_goal_minutes) setDailyGoalMinutes(fresh.daily_goal_minutes);
          if (fresh.streak_protection !== undefined) setStreakProtection(fresh.streak_protection);
          return;
        }
      } catch (err) {
        console.warn('Failed to load fresh user settings on client:', err);
      }

      const stored = getStoredUser();
      if (stored && isMounted) {
        if (stored.name) setName(stored.name);
        if (stored.email) setEmail(stored.email);
      }
    }

    loadFreshProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setShowToast(false);

    try {
      const updated = await updateUserSettings({
        name,
        english_level: englishLevel,
        daily_goal_minutes: Number(dailyGoalMinutes),
        streak_protection: streakProtection,
      });

      if (updated) {
        if (updated.name) setName(updated.name);
        if (updated.email) setEmail(updated.email);
        if (updated.english_level) setEnglishLevel(updated.english_level);
        if (updated.daily_goal_minutes) setDailyGoalMinutes(updated.daily_goal_minutes);
        if (updated.streak_protection !== undefined) setStreakProtection(updated.streak_protection);
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* 1. Header Hero */}
      <section className={styles.headerHero} aria-label="Settings Header">
        <div className={styles.headerOrb1} />
        <div className={styles.headerOrb2} />

        <div className={styles.topBar}>
          <div className={styles.headerTitleGroup}>
            <h1 className={styles.pageTitle}>Account Settings</h1>
            <p className={styles.pageSubtitle}>Manage your profile and learning goals</p>
          </div>
          <Link href="/profile" className={styles.backBtn}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Profile</span>
          </Link>
        </div>
      </section>

      {/* 2. Settings Form */}
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <section className="bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-slate-100 text-slate-900 transition-all">
          <div className="flex items-center gap-3.5 pb-4 mb-6 border-b border-slate-100">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#38BDF8] flex items-center justify-center text-white text-lg shadow-sm shrink-0">
              👤
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-outfit text-slate-900 leading-snug">
                Profile & Learning Goals
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
                Personalize your display identity and speaking targets
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 font-outfit" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                className="w-full h-12 rounded-xl bg-slate-100 px-4 text-sm font-medium text-slate-800 placeholder-slate-400 border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 font-outfit" htmlFor="emailAddr">
                Email Address
              </label>
              <input
                id="emailAddr"
                type="email"
                className="w-full h-12 rounded-xl bg-slate-100/70 border border-slate-200/60 px-4 text-sm font-medium text-slate-500 cursor-not-allowed select-none"
                value={email}
                disabled
                title="Email cannot be changed directly"
              />
              <span className="text-[11px] text-slate-400 font-medium mt-1.5 block">
                Verified account email address
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 font-outfit" htmlFor="englishLevel">
                English Fluency Level
              </label>
              <div className="relative">
                <select
                  id="englishLevel"
                  className="w-full h-12 rounded-xl bg-slate-100 px-4 text-sm font-medium text-slate-800 border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer appearance-none pr-10"
                  value={englishLevel}
                  onChange={(e) => setEnglishLevel(e.target.value)}
                >
                  <option value="Beginner Speaker">Beginner Speaker (A1-A2)</option>
                  <option value="Intermediate Speaker">Intermediate Speaker (B1-B2)</option>
                  <option value="Advanced Speaker">Advanced Speaker (C1)</option>
                  <option value="Fluent Native">Fluent / Native Speaker (C2)</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 font-outfit" htmlFor="dailyGoal">
                Daily Practice Target
              </label>
              <div className="relative">
                <select
                  id="dailyGoal"
                  className="w-full h-12 rounded-xl bg-slate-100 px-4 text-sm font-medium text-slate-800 border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer appearance-none pr-10"
                  value={dailyGoalMinutes}
                  onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
                >
                  <option value={10}>10 minutes / day (Casual)</option>
                  <option value={20}>20 minutes / day (Recommended)</option>
                  <option value={30}>30 minutes / day (Dedicated)</option>
                  <option value={60}>60 minutes / day (Intensive)</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Streak Protection Section */}
        <section className="bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-slate-100 text-slate-900 transition-all">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 text-xl shadow-sm shrink-0">
                🔥
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-outfit text-slate-900 leading-snug">
                  Streak Freeze & Protection
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
                  Preserves your daily speaking streak if you miss a single day of practice
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0" aria-label="Toggle Streak Freeze & Protection">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={streakProtection}
                onChange={(e) => setStreakProtection(e.target.checked)}
              />
              <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </section>

        {/* Actions Bar */}
        <div className={styles.actionsBar}>
          {showToast && (
            <div className={styles.toastSuccess}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Settings saved successfully!</span>
            </div>
          )}

          <button
            type="submit"
            className={styles.saveBtn}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
