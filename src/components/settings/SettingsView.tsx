'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserProfile, getStoredUser, updateUserSettings } from '@/services/authService';
import styles from './Settings.module.css';

interface SettingsViewProps {
  initialUser: UserProfile;
}

export default function SettingsView({ initialUser }: SettingsViewProps) {
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'audio' | 'notifications' | 'privacy'>('profile');

  // Form State
  const [name, setName] = useState(initialUser.name || '');
  const [email] = useState(initialUser.email || '');
  const [englishLevel, setEnglishLevel] = useState(initialUser.english_level || 'Intermediate Speaker');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(initialUser.daily_goal_minutes || 20);
  const [preferredAccent, setPreferredAccent] = useState('US English');

  // Audio Toggles & Mic Test
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [autoMute, setAutoMute] = useState(false);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  // Notification Toggles
  const [emailReminders, setEmailReminders] = useState(true);
  const [streakProtection, setStreakProtection] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  // Privacy Toggles
  const [publicProfile, setPublicProfile] = useState(true);
  const [showXpLeaderboard, setShowXpLeaderboard] = useState(true);

  // Status & Feedback State
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Sync client-stored user state on mount
  useEffect(() => {
    const stored = getStoredUser();
    if (stored && stored.name) {
      setName(stored.name);
    }
  }, []);

  // Simulated Mic Test Meter
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTestingMic) {
      interval = setInterval(() => {
        setMicLevel(Math.floor(Math.random() * 80) + 15);
      }, 150);
    } else {
      setMicLevel(0);
    }
    return () => clearInterval(interval);
  }, [isTestingMic]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setShowToast(false);

    try {
      await updateUserSettings({
        name,
        english_level: englishLevel,
        daily_goal_minutes: Number(dailyGoalMinutes),
        noise_suppression: noiseSuppression,
        auto_mute: autoMute,
        email_reminders: emailReminders,
        streak_protection: streakProtection,
        public_profile: publicProfile,
      });

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
            <p className={styles.pageSubtitle}>Manage your profile, audio device, goals, and privacy preferences</p>
          </div>
          <Link href="/profile" className={styles.backBtn}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Profile</span>
          </Link>
        </div>
      </section>

      {/* 2. Navigation Tabs */}
      <nav className={styles.tabsBar} aria-label="Settings navigation categories">
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span>👤</span> Profile & Goals
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'audio' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('audio')}
        >
          <span>🎙️</span> Audio & Voice
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'notifications' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <span>🔔</span> Notifications
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'privacy' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('privacy')}
        >
          <span>🛡️</span> Privacy & Security
        </button>
      </nav>

      {/* 3. Settings Form */}
      <form onSubmit={handleSave}>
        {/* Tab 1: Profile & Goals */}
        {activeTab === 'profile' && (
          <section className={styles.cardSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIconTile}>👤</div>
              <div className={styles.sectionTitleGroup}>
                <h2>Profile & Learning Goals</h2>
                <p>Personalize your display identity and speaking targets</p>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="emailAddr">Email Address</label>
                <input
                  id="emailAddr"
                  type="email"
                  className={styles.input}
                  value={email}
                  disabled
                  title="Email cannot be changed directly"
                />
                <span className={styles.fieldHint}>Verified account email address</span>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="englishLevel">English Fluency Level</label>
                <select
                  id="englishLevel"
                  className={styles.select}
                  value={englishLevel}
                  onChange={(e) => setEnglishLevel(e.target.value)}
                >
                  <option value="Beginner Speaker">Beginner Speaker (A1-A2)</option>
                  <option value="Intermediate Speaker">Intermediate Speaker (B1-B2)</option>
                  <option value="Advanced Speaker">Advanced Speaker (C1)</option>
                  <option value="Fluent Native">Fluent / Native Speaker (C2)</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="dailyGoal">Daily Practice Target</label>
                <select
                  id="dailyGoal"
                  className={styles.select}
                  value={dailyGoalMinutes}
                  onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
                >
                  <option value={10}>10 minutes / day (Casual)</option>
                  <option value={20}>20 minutes / day (Recommended)</option>
                  <option value={30}>30 minutes / day (Dedicated)</option>
                  <option value={60}>60 minutes / day (Intensive)</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="accent">Target English Accent</label>
                <select
                  id="accent"
                  className={styles.select}
                  value={preferredAccent}
                  onChange={(e) => setPreferredAccent(e.target.value)}
                >
                  <option value="US English">American English (General US)</option>
                  <option value="UK English">British English (RP)</option>
                  <option value="Australian English">Australian English</option>
                  <option value="Global English">Global International English</option>
                </select>
              </div>
            </div>
          </section>
        )}

        {/* Tab 2: Audio & Voice */}
        {activeTab === 'audio' && (
          <section className={styles.cardSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIconTile}>🎙️</div>
              <div className={styles.sectionTitleGroup}>
                <h2>Audio & Voice Room Settings</h2>
                <p>Configure your microphone, speakers, and AI audio processing</p>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Microphone Input Device</label>
                <select className={styles.select} defaultValue="default">
                  <option value="default">Default System Microphone</option>
                  <option value="mic-1">Realtek High Definition Audio</option>
                  <option value="mic-2">USB Microphone / Headset</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Audio Output Device</label>
                <select className={styles.select} defaultValue="default">
                  <option value="default">Default System Headphones / Speakers</option>
                  <option value="spk-1">Realtek High Definition Audio Speakers</option>
                </select>
              </div>
            </div>

            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleTitle}>AI Noise Suppression</span>
                <span className={styles.toggleDesc}>Filter out background echoes and ambient room noise during live speaking calls</span>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={noiseSuppression}
                  onChange={(e) => setNoiseSuppression(e.target.checked)}
                />
                <span className={styles.slider} />
              </label>
            </div>

            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleTitle}>Auto-Mute on Join</span>
                <span className={styles.toggleDesc}>Automatically start muted when entering Live Voice Rooms</span>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={autoMute}
                  onChange={(e) => setAutoMute(e.target.checked)}
                />
                <span className={styles.slider} />
              </label>
            </div>

            {/* Interactive Mic Test */}
            <div className={styles.micTestCard}>
              <div className={styles.micTestHeader}>
                <div>
                  <span className={styles.toggleTitle}>Microphone Test Preview</span>
                  <p className={styles.toggleDesc}>Speak into your mic to test audio levels before joining rooms</p>
                </div>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => setIsTestingMic((prev) => !prev)}
                >
                  {isTestingMic ? 'Stop Test' : 'Start Test'}
                </button>
              </div>

              {isTestingMic && (
                <div className={styles.micMeterTrack}>
                  <div className={styles.micMeterFill} style={{ width: `${micLevel}%` }} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tab 3: Notifications */}
        {activeTab === 'notifications' && (
          <section className={styles.cardSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIconTile}>🔔</div>
              <div className={styles.sectionTitleGroup}>
                <h2>Notification Preferences</h2>
                <p>Stay on track with personalized practice reminders and streak protection</p>
              </div>
            </div>

            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleTitle}>Daily Practice Reminders</span>
                <span className={styles.toggleDesc}>Receive email notifications to maintain your daily speaking practice streak</span>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={emailReminders}
                  onChange={(e) => setEmailReminders(e.target.checked)}
                />
                <span className={styles.slider} />
              </label>
            </div>

            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleTitle}>Streak Freeze & Danger Alerts</span>
                <span className={styles.toggleDesc}>Get alerted before midnight if your day streak is about to reset</span>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={streakProtection}
                  onChange={(e) => setStreakProtection(e.target.checked)}
                />
                <span className={styles.slider} />
              </label>
            </div>

            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleTitle}>Interactive Sound Effects</span>
                <span className={styles.toggleDesc}>Play subtle audio cues for lesson completion and XP gains</span>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={soundEffects}
                  onChange={(e) => setSoundEffects(e.target.checked)}
                />
                <span className={styles.slider} />
              </label>
            </div>
          </section>
        )}

        {/* Tab 4: Privacy & Security */}
        {activeTab === 'privacy' && (
          <section className={styles.cardSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIconTile}>🛡️</div>
              <div className={styles.sectionTitleGroup}>
                <h2>Privacy & Profile Visibility</h2>
                <p>Manage who can see your stats and activity across Acuspeak</p>
              </div>
            </div>

            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleTitle}>Public Speaker Profile</span>
                <span className={styles.toggleDesc}>Allow peer practice partners to view your badge achievements and English level</span>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={publicProfile}
                  onChange={(e) => setPublicProfile(e.target.checked)}
                />
                <span className={styles.slider} />
              </label>
            </div>

            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleTitle}>Leaderboard Visibility</span>
                <span className={styles.toggleDesc}>Display your weekly XP rank on the global Acuspeak leaderboard</span>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={showXpLeaderboard}
                  onChange={(e) => setShowXpLeaderboard(e.target.checked)}
                />
                <span className={styles.slider} />
              </label>
            </div>
          </section>
        )}

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
