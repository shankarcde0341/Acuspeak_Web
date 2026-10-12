'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  VocabularyWord,
  VOCABULARY_WORDS,
  getSavedWordIds,
  toggleSaveWordId,
} from '@/lib/vocabulary';
import styles from './VocabularyView.module.css';

export default function VocabularyView() {
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [words, setWords] = useState<VocabularyWord[]>(VOCABULARY_WORDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastXp, setToastXp] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Initialize saved words from localStorage on client mount
  useEffect(() => {
    const ids = getSavedWordIds();
    setSavedIds(ids);
    setIsLoading(false);
  }, []);

  // Filtered words according to active tab
  const displayedWords =
    activeTab === 'all'
      ? words
      : words.filter((w) => savedIds.includes(w.id));

  // Current active word
  const currentWord: VocabularyWord | undefined = displayedWords[currentIndex];
  const isCurrentSaved = currentWord ? savedIds.includes(currentWord.id) : false;

  // Safe index adjustment when tab or list size changes
  useEffect(() => {
    if (currentIndex >= displayedWords.length) {
      setCurrentIndex(Math.max(0, displayedWords.length - 1));
    }
    setIsFlipped(false);
  }, [activeTab, displayedWords.length, currentIndex]);

  // Toast notification timer
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
      setToastXp(null);
    }, 2800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Audio pronunciation using Web Speech API
  const handleSpeak = useCallback(
    (e: React.MouseEvent, wordToSpeak: string) => {
      e.stopPropagation();
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(wordToSpeak);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    []
  );

  // Toggle save handler
  const handleToggleSave = useCallback(
    (e: React.MouseEvent, wordId: string) => {
      e.stopPropagation();
      const isSavedNow = toggleSaveWordId(wordId);
      const updated = getSavedWordIds();
      setSavedIds(updated);

      if (isSavedNow) {
        setToastXp(5);
        setToastMessage('Saved to your vocabulary deck! ✨');
      } else {
        setToastXp(null);
        setToastMessage('Word removed from deck.');
      }
    },
    []
  );

  // Flip card
  const handleFlipCard = () => {
    setIsFlipped((prev) => !prev);
  };

  // Previous card
  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Next card
  const handleNext = () => {
    if (currentIndex < displayedWords.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Shuffle deck
  const handleShuffle = () => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setWords(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setToastXp(null);
    setToastMessage('Deck shuffled! Ready for study.');
  };

  // Keyboard navigation (Left / Right / Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'ArrowLeft') {
        if (currentIndex > 0) {
          setIsFlipped(false);
          setCurrentIndex((prev) => prev - 1);
        }
      } else if (e.code === 'ArrowRight') {
        if (currentIndex < displayedWords.length - 1) {
          setIsFlipped(false);
          setCurrentIndex((prev) => prev + 1);
        }
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, displayedWords.length]);

  return (
    <div className={styles.container}>
      {/* Header Banner */}
      <header className={styles.headerHero}>
        <div className={styles.headerOrb1} aria-hidden="true" />
        <div className={styles.headerOrb2} aria-hidden="true" />

        <div className={styles.topBar}>
          <div className={styles.headerTitleGroup}>
            <h1 className={styles.pageTitle}>Saved Vocabulary & Flashcards</h1>
            <p className={styles.pageSubtitle}>
              Master high-impact conversational, interview, and business vocabulary through interactive spaced-repetition flashcards.
            </p>
          </div>

          <Link href="/profile" className={styles.backBtn} aria-label="Return to Profile">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back to Profile</span>
          </Link>
        </div>
      </header>

      {/* Toolbar: Mode Tabs & Shuffle Action */}
      <div className={styles.toolbarRow}>
        <div className={styles.tabsContainer} role="tablist" aria-label="Study modes">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            className={`${styles.tabButton} ${activeTab === 'all' ? styles.tabButtonActive : ''}`}
            onClick={() => {
              setActiveTab('all');
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
          >
            <span>All Words</span>
            <span className={styles.tabCountBadge}>{words.length}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'saved'}
            className={`${styles.tabButton} ${activeTab === 'saved' ? styles.tabButtonActive : ''}`}
            onClick={() => {
              setActiveTab('saved');
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={activeTab === 'saved' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span>Saved Words</span>
            <span className={styles.tabCountBadge}>{savedIds.length}</span>
          </button>
        </div>

        <div className={styles.toolbarActions}>
          <button
            type="button"
            className={styles.shuffleBtn}
            onClick={handleShuffle}
            title="Randomize the study order of this deck"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="16 3 21 3 21 8" />
              <line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" />
              <line x1="15" y1="15" x2="21" y2="21" />
              <line x1="4" y1="4" x2="9" y2="9" />
            </svg>
            <span>Shuffle Deck</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className={styles.skeletonCard} aria-busy="true" aria-label="Loading vocabulary cards">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <div className={styles.skeletonLine} style={{ width: '120px', height: '28px' }} />
            <div className={styles.skeletonLine} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div className={styles.skeletonLine} style={{ width: '240px', height: '48px' }} />
            <div className={styles.skeletonLine} style={{ width: '140px', height: '24px' }} />
          </div>
          <div className={styles.skeletonLine} style={{ width: '100%', height: '20px' }} />
        </div>
      ) : displayedWords.length === 0 ? (
        /* Empty State */
        <div className={styles.emptyStateCard}>
          <div className={styles.emptyStateIcon} aria-hidden="true">
            📚
          </div>
          <h2 className={styles.emptyStateTitle}>No Saved Words Yet</h2>
          <p className={styles.emptyStateDesc}>
            You haven&apos;t saved any vocabulary words to your personal deck yet. Switch to &ldquo;All Words&rdquo; and tap the bookmark icon on any flashcard to save words for focused review.
          </p>
          <button
            type="button"
            className={styles.flipActionButton}
            onClick={() => {
              setActiveTab('all');
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
          >
            <span>Browse All Flashcards</span>
          </button>
        </div>
      ) : currentWord ? (
        <>
          {/* Progress Tracker */}
          <section className={styles.progressSection} aria-label="Deck study progress">
            <div className={styles.progressInfo}>
              <span>
                Card {currentIndex + 1} of {displayedWords.length}
              </span>
              <span>
                {Math.round(((currentIndex + 1) / displayedWords.length) * 100)}% Completed
              </span>
            </div>
            <div className={styles.progressBarTrack} role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemin={1} aria-valuemax={displayedWords.length}>
              <div
                className={styles.progressBarFill}
                style={{
                  width: `${((currentIndex + 1) / displayedWords.length) * 100}%`,
                }}
              />
            </div>
          </section>

          {/* 3D Flip Flashcard */}
          <div
            className={styles.cardContainer}
            onClick={handleFlipCard}
            role="button"
            tabIndex={0}
            aria-label={`Flashcard for ${currentWord.word}. Click or press space to flip.`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleFlipCard();
              }
            }}
          >
            <div className={`${styles.cardInner} ${isFlipped ? styles.isFlipped : ''}`}>
              {/* Card FRONT */}
              <div className={`${styles.cardFace} ${styles.cardFront}`}>
                <div className={styles.cardTopRow}>
                  <div className={styles.badgesGroup}>
                    <span className={styles.levelBadge}>
                      {currentWord.levelCode} • {currentWord.level}
                    </span>
                    <span className={styles.trackBadge}>
                      🎯 {currentWord.track} Track
                    </span>
                  </div>

                  <div className={styles.cardActionIcons}>
                    <button
                      type="button"
                      className={styles.iconActionBtn}
                      onClick={(e) => handleSpeak(e, currentWord.word)}
                      title={`Listen to pronunciation of ${currentWord.word}`}
                      aria-label="Pronounce word"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: isSpeaking ? '#2563EB' : 'inherit' }}
                        aria-hidden="true"
                      >
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      className={`${styles.iconActionBtn} ${isCurrentSaved ? styles.savedActive : ''}`}
                      onClick={(e) => handleToggleSave(e, currentWord.id)}
                      title={isCurrentSaved ? 'Remove from saved words' : 'Save to vocabulary deck (+5 XP)'}
                      aria-label={isCurrentSaved ? 'Remove from saved words' : 'Save word'}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={isCurrentSaved ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className={styles.cardMainFront}>
                  <h2 className={styles.wordTitle}>{currentWord.word}</h2>
                  <div className={styles.phoneticPill}>
                    <span>{currentWord.phonetic}</span>
                    <span className={styles.partOfSpeechBadge}>{currentWord.partOfSpeech}</span>
                  </div>
                </div>

                <div className={styles.cardBottomHint}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  <span>Click card or press Space to see definition &amp; example</span>
                </div>
              </div>

              {/* Card BACK */}
              <div className={`${styles.cardFace} ${styles.cardBack}`}>
                <div className={styles.cardTopRow}>
                  <div className={styles.badgesGroup}>
                    <span className={styles.levelBadge}>
                      {currentWord.word} • {currentWord.partOfSpeech}
                    </span>
                  </div>

                  <div className={styles.cardActionIcons}>
                    <button
                      type="button"
                      className={styles.iconActionBtn}
                      onClick={(e) => handleSpeak(e, currentWord.word)}
                      title={`Listen to pronunciation of ${currentWord.word}`}
                      aria-label="Pronounce word"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      className={`${styles.iconActionBtn} ${isCurrentSaved ? styles.savedActive : ''}`}
                      onClick={(e) => handleToggleSave(e, currentWord.id)}
                      title={isCurrentSaved ? 'Remove from saved words' : 'Save word'}
                      aria-label={isCurrentSaved ? 'Remove from saved words' : 'Save word'}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={isCurrentSaved ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className={styles.cardMainBack}>
                  <div className={styles.definitionBox}>
                    <span className={styles.sectionLabel}>Meaning &amp; Definition</span>
                    <p className={styles.definitionText}>{currentWord.meaning}</p>
                  </div>

                  <div className={styles.exampleBox}>
                    <span className={styles.sectionLabel}>Contextual Spoken Example</span>
                    <p className={styles.exampleText}>&ldquo;{currentWord.example}&rdquo;</p>
                  </div>

                  {currentWord.synonyms && currentWord.synonyms.length > 0 && (
                    <div className={styles.definitionBox}>
                      <span className={styles.sectionLabel}>Alternative Synonyms</span>
                      <div className={styles.synonymsRow}>
                        {currentWord.synonyms.map((syn) => (
                          <span key={syn} className={styles.synonymTag}>
                            {syn}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.cardBottomHint}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  <span>Click card to return to word view</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls Bar */}
          <div className={styles.controlsBar}>
            <button
              type="button"
              className={styles.navButton}
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="Previous flashcard"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Previous</span>
            </button>

            <button
              type="button"
              className={styles.flipActionButton}
              onClick={handleFlipCard}
              aria-label="Flip flashcard"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <span>{isFlipped ? 'Show Word Front' : 'Flip to Meaning'}</span>
            </button>

            <button
              type="button"
              className={styles.navButton}
              onClick={handleNext}
              disabled={currentIndex === displayedWords.length - 1}
              aria-label="Next flashcard"
            >
              <span>Next</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </>
      ) : null}

      {/* XP Toast Notification */}
      {toastMessage && (
        <aside className={styles.xpToast} role="status" aria-live="polite">
          {toastXp ? <span className={styles.xpBadge}>+{toastXp} XP</span> : <span>✨</span>}
          <span>{toastMessage}</span>
        </aside>
      )}
    </div>
  );
}
