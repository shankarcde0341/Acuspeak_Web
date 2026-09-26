"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  ScriptLine,
  reportLessonProgress,
  getLessonData,
} from '@/services/lessonService';
import styles from './InteractiveLesson.module.css';

export interface InteractiveLessonProps {
  script?: ScriptLine[];
  lessonId?: string;
  lessonTitle?: string;
  categoryTitle?: string;
  xpReward?: number;
  onComplete?: () => void;
}

const DEFAULT_WAVEFORM_HEIGHTS = [
  12, 24, 36, 18, 42, 28, 15, 30, 48, 22, 14, 38, 50, 32, 20, 40, 26, 18, 34, 44,
  16, 28, 22, 12,
];

export default function InteractiveLesson({
  script: propScript,
  lessonId = 'travel-10',
  lessonTitle: propTitle,
  categoryTitle: propCategory,
  xpReward: propXp,
  onComplete,
}: InteractiveLessonProps) {
  // Resolve lesson data dynamically if props are omitted
  const lessonData = getLessonData(lessonId);
  const script = propScript || lessonData.script;
  const lessonTitle = propTitle || lessonData.title;
  const categoryTitle =
    propCategory || lessonData.categoryTitle || 'Business Conversation';
  const xpReward = propXp || lessonData.xp;

  // Roleplay Character Selector State: 'all' or specific speaker name (e.g., 'Alex')
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [activeLineIndex, setActiveLineIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [completedIndices, setCompletedIndices] = useState<Set<number>>(
    new Set([0])
  );
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [waveformBars, setWaveformBars] = useState<number[]>(
    DEFAULT_WAVEFORM_HEIGHTS
  );
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [userIsSpeakingTurn, setUserIsSpeakingTurn] = useState<boolean>(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const simulationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Extract unique speakers dynamically from the current script
  const uniqueSpeakers = useMemo(() => {
    return Array.from(new Set(script.map((line) => line.speaker)));
  }, [script]);

  const firstSpeaker = script[0]?.speaker || 'Alex';

  // Initialize SpeechSynthesis engine safely
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
      if (simulationTimeoutRef.current) {
        clearTimeout(simulationTimeoutRef.current);
      }
    };
  }, []);

  // Update progress completion set
  const markLineCompleted = useCallback((index: number) => {
    setCompletedIndices((prev) => {
      const next = new Set(prev);
      for (let i = 0; i <= index; i++) {
        next.add(i);
      }
      return next;
    });
  }, []);

  // Animate audio visualizer waveform when playing
  useEffect(() => {
    if (isPlaying) {
      animationIntervalRef.current = setInterval(() => {
        setWaveformBars(
          DEFAULT_WAVEFORM_HEIGHTS.map((baseHeight) => {
            const randomVariance = Math.floor(Math.random() * 20) - 10;
            return Math.max(8, Math.min(52, baseHeight + randomVariance));
          })
        );
      }, 120);
    } else {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
      setWaveformBars(DEFAULT_WAVEFORM_HEIGHTS);
    }

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // Handle lesson full completion
  const handleCheckCompletion = useCallback(
    (index: number) => {
      markLineCompleted(index);
      if (index === script.length - 1) {
        setIsCompleted(true);
        reportLessonProgress({
          lessonId,
          completedLineIds: script.map((s) => s.line_id),
          currentLineId: script[index].line_id,
          isCompleted: true,
          xpEarned: xpReward,
        });
        if (onComplete) {
          onComplete();
        }
      }
    },
    [lessonId, markLineCompleted, onComplete, script, xpReward]
  );

  // Forward declaration ref for speakLine inside speech synth callback
  const speakLineRef = useRef<(index: number) => void>(() => {});

  // Play text via SpeechSynthesis fallback
  const speakSpeechSynth = useCallback(
    (index: number, targetLine: ScriptLine) => {
      if (synthRef.current) {
        const utterance = new SpeechSynthesisUtterance(targetLine.text);
        utterance.rate = playbackSpeed;

        const voices = synthRef.current.getVoices();
        if (voices.length > 0) {
          if (
            targetLine.speaker === 'Waitress' ||
            targetLine.speaker === 'Priya' ||
            targetLine.speaker === 'Assistant' ||
            targetLine.speaker === 'Resident' ||
            targetLine.speaker === 'Candidate' ||
            targetLine.speaker === 'Sneha' ||
            targetLine.speaker === 'Anita' ||
            targetLine.speaker === 'Meera' ||
            targetLine.speaker === 'Divya' ||
            targetLine.speaker === 'Pooja' ||
            targetLine.speaker === 'Nisha'
          ) {
            const femaleVoice = voices.find(
              (v) =>
                v.lang.startsWith('en') &&
                (v.name.includes('Female') ||
                  v.name.includes('Zira') ||
                  v.name.includes('Samantha') ||
                  v.name.includes('Priya') ||
                  v.name.includes('Google US English'))
            );
            if (femaleVoice) utterance.voice = femaleVoice;
          } else {
            const maleVoice = voices.find(
              (v) =>
                v.lang.startsWith('en') &&
                (v.name.includes('Male') ||
                  v.name.includes('David') ||
                  v.name.includes('Alex') ||
                  v.name.includes('George'))
            );
            if (maleVoice) utterance.voice = maleVoice;
          }
        }

        utterance.onstart = () => {
          setIsPlaying(true);
        };

        utterance.onend = () => {
          setIsPlaying(false);
          handleCheckCompletion(index);

          if (index < script.length - 1) {
            simulationTimeoutRef.current = setTimeout(() => {
              speakLineRef.current(index + 1);
            }, 600);
          }
        };

        utterance.onerror = () => {
          setIsPlaying(false);
        };

        synthRef.current.speak(utterance);
      } else {
        // Pure simulation fallback
        setIsPlaying(true);
        const duration = Math.max(1800, targetLine.text.length * 90) / playbackSpeed;

        simulationTimeoutRef.current = setTimeout(() => {
          setIsPlaying(false);
          handleCheckCompletion(index);
          if (index < script.length - 1) {
            simulationTimeoutRef.current = setTimeout(() => {
              speakLineRef.current(index + 1);
            }, 600);
          }
        }, duration);
      }
    },
    [handleCheckCompletion, playbackSpeed, script]
  );

  // Main playback trigger
  const speakLine = useCallback(
    (index: number) => {
      if (index < 0 || index >= script.length) return;

      // Stop previous playing audio / speech / timers
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (simulationTimeoutRef.current) {
        clearTimeout(simulationTimeoutRef.current);
      }

      setActiveLineIndex(index);
      markLineCompleted(index);

      const targetLine = script[index];
      const isUserRole = selectedRole !== 'all' && targetLine.speaker === selectedRole;

      if (isUserRole) {
        // In roleplay mode, if it's the user's turn, pause audio so user can speak the line
        setIsPlaying(false);
        setUserIsSpeakingTurn(true);
        return;
      }

      setUserIsSpeakingTurn(false);

      // If audio_url is present, attempt playing HTML5 Audio first
      if (targetLine.audio_url) {
        try {
          const audio = new Audio(targetLine.audio_url);
          audio.playbackRate = playbackSpeed;
          currentAudioRef.current = audio;

          audio.onplay = () => {
            setIsPlaying(true);
          };

          audio.onended = () => {
            setIsPlaying(false);
            handleCheckCompletion(index);
            if (index < script.length - 1) {
              simulationTimeoutRef.current = setTimeout(() => {
                speakLineRef.current(index + 1);
              }, 600);
            }
          };

          audio.onerror = () => {
            speakSpeechSynth(index, targetLine);
          };

          audio.play().catch(() => {
            speakSpeechSynth(index, targetLine);
          });
        } catch (e) {
          speakSpeechSynth(index, targetLine);
        }
      } else {
        speakSpeechSynth(index, targetLine);
      }
    },
    [handleCheckCompletion, markLineCompleted, playbackSpeed, script, selectedRole, speakSpeechSynth]
  );

  useEffect(() => {
    speakLineRef.current = speakLine;
  }, [speakLine]);

  const togglePlayPause = () => {
    if (isPlaying) {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      if (simulationTimeoutRef.current) {
        clearTimeout(simulationTimeoutRef.current);
      }
      setIsPlaying(false);
    } else {
      speakLine(activeLineIndex);
    }
  };

  const handlePreviousLine = () => {
    if (activeLineIndex > 0) {
      const prevIndex = activeLineIndex - 1;
      speakLine(prevIndex);
    }
  };

  const handleNextLine = () => {
    if (activeLineIndex < script.length - 1) {
      const nextIndex = activeLineIndex + 1;
      speakLine(nextIndex);
    }
  };

  const handleLineClick = (index: number) => {
    speakLine(index);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setUserIsSpeakingTurn(false);
    if (synthRef.current) synthRef.current.cancel();
    if (currentAudioRef.current) currentAudioRef.current.pause();
    if (simulationTimeoutRef.current) clearTimeout(simulationTimeoutRef.current);
    setIsPlaying(false);
  };

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
  };

  const handleRestart = () => {
    setActiveLineIndex(0);
    setCompletedIndices(new Set([0]));
    setIsCompleted(false);
    speakLine(0);
  };

  const completedCount = completedIndices.size;
  const totalCount = script.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const activeLineObj = script[activeLineIndex];
  const isCurrentLineUserRole =
    selectedRole !== 'all' && activeLineObj?.speaker === selectedRole;

  return (
    <main className={styles.lessonContainer}>
      {/* Header Block */}
      <header className={styles.headerCard}>
        <div className={styles.badgeRow}>
          <span className={styles.eyebrowPill}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {categoryTitle}
          </span>

          <span className={styles.liveBadge}>
            <span className={styles.liveDot} aria-hidden="true" />
            Interactive Lesson
          </span>
        </div>

        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{lessonTitle}</h1>
          <p className={styles.subtitle}>
            Practice conversation flow, select your role character, and read along!
          </p>
        </div>

        {/* Script Roleplayer / Character Selector */}
        <div className={styles.roleplayerSection}>
          <div className={styles.roleplayerHeader}>
            <span className={styles.roleplayerLabel}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Script Roleplayer Mode:
            </span>
          </div>

          <div className={styles.rolePickerList} role="radiogroup" aria-label="Roleplay Character Selection">
            <button
              type="button"
              role="radio"
              aria-checked={selectedRole === 'all'}
              className={`${styles.rolePill} ${
                selectedRole === 'all' ? styles.rolePillActive : ''
              }`}
              onClick={() => handleRoleChange('all')}
            >
              🎧 Full Dialogue (Listen All)
            </button>

            {uniqueSpeakers.map((speaker) => (
              <button
                key={speaker}
                type="button"
                role="radio"
                aria-checked={selectedRole === speaker}
                className={`${styles.rolePill} ${
                  selectedRole === speaker ? styles.rolePillActiveRole : ''
                }`}
                onClick={() => handleRoleChange(speaker)}
              >
                🎭 Practice as {speaker}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressSection}>
          <div className={styles.progressMeta}>
            <span>
              Line {activeLineIndex + 1} of {totalCount} ({progressPercent}% Completed)
            </span>
            <span className={styles.xpBadge}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              +{xpReward} XP
            </span>
          </div>

          <div
            className={styles.progressBarTrack}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Lesson completion progress"
          >
            <div
              className={styles.progressBarFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Audio Controller Section placed AT THE TOP OF THE SCRIPT */}
      <section
        className={styles.waveformSection}
        aria-label="Audio Playback Controls"
      >
        <div className={styles.waveformHeaderRow}>
          <span className={styles.waveformTitle}>
            Audio Controller & Visualizer
          </span>
          <button
            type="button"
            className={styles.speedToggleBtn}
            onClick={cycleSpeed}
            aria-label={`Playback speed: ${playbackSpeed}x. Click to change.`}
          >
            ⚡ {playbackSpeed}x Speed
          </button>
        </div>

        {/* Waveform Visualizer Bars */}
        <div className={styles.waveformBarContainer} aria-hidden="true">
          {waveformBars.map((height, i) => (
            <div
              key={i}
              className={`${styles.waveformBar} ${
                isPlaying ? styles.waveformBarActive : ''
              }`}
              style={{ height: `${height}px` }}
            />
          ))}
        </div>

        {/* Audio Controller Action Buttons (Play/Pause, Previous, Next) */}
        <div className={styles.controlsRow}>
          <button
            type="button"
            className={styles.controlBtnSecondary}
            onClick={handlePreviousLine}
            disabled={activeLineIndex === 0}
            aria-label="Previous sentence"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="19 20 9 12 19 4 19 20" />
              <line x1="5" y1="19" x2="5" y2="5" />
            </svg>
            Previous
          </button>

          <button
            type="button"
            className={styles.controlBtnPrimary}
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          >
            {isPlaying ? (
              <>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                {isCurrentLineUserRole ? 'Listen Prompt' : 'Play Audio'}
              </>
            )}
          </button>

          <button
            type="button"
            className={styles.controlBtnSecondary}
            onClick={handleNextLine}
            disabled={activeLineIndex === script.length - 1}
            aria-label="Next sentence"
          >
            Next
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>
        </div>

        {/* Dynamic Roleplay Speaker Alert Banner when user's turn */}
        {selectedRole !== 'all' && isCurrentLineUserRole && (
          <div className={styles.yourTurnBanner} aria-live="polite">
            <div className={styles.yourTurnInfo}>
              <span className={styles.yourTurnPulseDot} />
              <span>
                🎤 <strong>Your Turn to Speak ({selectedRole})!</strong> Read line {activeLineIndex + 1} aloud.
              </span>
            </div>
            <button
              type="button"
              className={styles.doneSpeakingBtn}
              onClick={handleNextLine}
            >
              I Spoke This Line → Next
            </button>
          </div>
        )}
      </section>

      {/* Completion Modal Popup Overlay & Card */}
      {isCompleted && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="completion-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsCompleted(false);
            }
          }}
        >
          <div className={styles.completionModalCard}>
            <button
              type="button"
              className={styles.closeModalBtn}
              onClick={() => setIsCompleted(false)}
              aria-label="Close completion modal"
            >
              ✕
            </button>
            <div className={styles.modalIconBadge}>🎉</div>
            <h2 id="completion-modal-title" className={styles.completionTitle}>
              Lesson Complete!
            </h2>
            <p className={styles.completionSubtext}>
              Awesome job! You completed all {script.length} lines and earned{' '}
              <strong>+{xpReward} XP</strong>.
            </p>
            <div className={styles.modalActionRow}>
              <button
                type="button"
                className={styles.restartBtn}
                onClick={handleRestart}
              >
                Practice Again
              </button>
              <button
                type="button"
                className={styles.closeSecondaryBtn}
                onClick={() => setIsCompleted(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Chat Bubbles List */}
      <ol className={styles.chatList} aria-label="Conversation Script">
        {script.map((line, idx) => {
          const isLeft = line.speaker === firstSpeaker;
          const isActive = idx === activeLineIndex;
          const isUserRoleLine = selectedRole !== 'all' && line.speaker === selectedRole;

          return (
            <li
              key={line.line_id}
              tabIndex={0}
              role="button"
              aria-pressed={isActive}
              aria-label={`${line.speaker} says: ${line.text}`}
              className={`${styles.chatItem} ${
                isLeft ? styles.chatItemAlex : styles.chatItemPriya
              }`}
              onClick={() => handleLineClick(idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleLineClick(idx);
                }
              }}
            >
              {/* Speaker Avatar Circle */}
              <div
                className={`${styles.avatarCircle} ${
                  isLeft ? styles.avatarAlex : styles.avatarPriya
                }`}
                aria-hidden="true"
              >
                {line.speaker.charAt(0)}
              </div>

              {/* Chat Speech Bubble */}
              <article
                className={`${styles.chatBubbleCard} ${
                  isActive ? styles.activeBubbleCard : ''
                } ${isUserRoleLine ? styles.userRoleBubbleCard : ''}`}
              >
                <div className={styles.bubbleHeader}>
                  <span
                    className={`${styles.speakerLabel} ${
                      isLeft ? styles.speakerAlex : styles.speakerPriya
                    }`}
                  >
                    {line.speaker}
                    {selectedRole !== 'all' && (
                      <span className={styles.roleTag}>
                        {isUserRoleLine ? ' (YOU)' : ' (AI Partner)'}
                      </span>
                    )}
                  </span>

                  {isActive && isPlaying && (
                    <span className={styles.playingIndicator}>
                      <span className={styles.playingDot} />
                      Playing
                    </span>
                  )}

                  {isActive && !isPlaying && isUserRoleLine && (
                    <span className={styles.yourTurnTag}>
                      🎤 Your Turn
                    </span>
                  )}
                </div>

                <p className={styles.speechText}>{line.text}</p>

                <div className={styles.lineActionRow}>
                  {isUserRoleLine && isActive ? (
                    <button
                      type="button"
                      className={styles.speakActionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextLine();
                      }}
                      aria-label="Mark line spoken and advance"
                    >
                      Done Speaking → Next
                    </button>
                  ) : null}

                  <button
                    type="button"
                    className={styles.listenBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLineClick(idx);
                    }}
                    aria-label={`Listen to ${line.speaker}'s line`}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                    Listen
                  </button>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
