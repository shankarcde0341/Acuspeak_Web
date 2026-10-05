'use client';

import { useState } from 'react';
import type { WordOfTheDayData } from '@/lib/dashboard';
import styles from '@/app/(dashboard)/dashboard/Dashboard.module.css';

interface WordOfTheDayCardProps {
  wordData: WordOfTheDayData;
}

export default function WordOfTheDayCard({ wordData }: WordOfTheDayCardProps) {
  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const [isPlayingExample, setIsPlayingExample] = useState(false);

  const speakText = (text: string, isExample = false) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    // Stop active speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = isExample ? 0.95 : 0.85; // Slightly slower pace for word pronunciation
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Samantha') ||
            v.name.includes('Daniel') ||
            v.name.includes('Karen'))
      ) || voices.find((v) => v.lang.startsWith('en'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    if (isExample) {
      setIsPlayingExample(true);
    } else {
      setIsPlayingWord(true);
    }

    utterance.onend = () => {
      setIsPlayingWord(false);
      setIsPlayingExample(false);
    };

    utterance.onerror = () => {
      setIsPlayingWord(false);
      setIsPlayingExample(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={styles.wordCard}>
      <div className={styles.wordHeader}>
        <div className={styles.wordTitleGroup}>
          <h3 className={styles.wordTitle}>{wordData.word}</h3>
          <span className={styles.wordMeta}>
            {wordData.phonetic} • {wordData.partOfSpeech}
          </span>
        </div>

        <button
          type="button"
          onClick={() => speakText(wordData.word, false)}
          className={`${styles.speakerBtn} ${isPlayingWord ? styles.speakerBtnPlaying : ''}`}
          title="Listen to word pronunciation"
          aria-label={`Listen to pronunciation of ${wordData.word}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {isPlayingWord ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.536 8.464a5 5 0 010 7.072M12 6v12M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            )}
          </svg>
          <span>{isPlayingWord ? 'Playing...' : 'Pronounce'}</span>
        </button>
      </div>

      <p className={styles.wordMeaning}>{wordData.meaning}</p>

      <div className={styles.wordExampleRow}>
        <blockquote className={styles.wordExample}>&ldquo;{wordData.example}&rdquo;</blockquote>
        <button
          type="button"
          onClick={() => speakText(wordData.example, true)}
          className={`${styles.exampleSpeakerBtn} ${isPlayingExample ? styles.speakerBtnPlaying : ''}`}
          title="Listen to example sentence"
          aria-label="Listen to example sentence"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.536 8.464a5 5 0 010 7.072M12 6v12M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
          <span>Listen Sentence</span>
        </button>
      </div>
    </div>
  );
}
