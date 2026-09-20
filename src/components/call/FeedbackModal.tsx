'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { submitCallFeedback, logCall } from '@/lib/call';
import { StarIcon } from './icons';
import styles from './FeedbackModal.module.css';

interface FeedbackModalProps {
  name: string;
  gender: string;
  durationSeconds: number;
  roomId?: string;
  targetUserId?: string;
}

export default function FeedbackModal({
  name,
  gender,
  durationSeconds,
  roomId,
  targetUserId,
}: FeedbackModalProps) {
  const router = useRouter();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isPending, setIsPending] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const initial = name.charAt(0).toUpperCase();

  // Focus trap inside the modal
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.focus();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Tab' && cardRef.current) {
        const focusables = cardRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  async function handleSkip() {
    if (isPending) return;
    setIsPending(true);
    try {
      await logCall({
        partner_name: name,
        duration_seconds: durationSeconds,
        partner_gender: gender,
      });
    } catch {
      // Ignore failures silently
    }
    router.replace('/dashboard');
  }

  async function handleSubmit() {
    if (rating === 0 || isPending) return;
    setIsPending(true);
    try {
      await submitCallFeedback({
        room_id: roomId,
        target_user_id: targetUserId || name,
        rating,
        comment: comment.trim() || undefined,
      });
      await logCall({
        partner_name: name,
        duration_seconds: durationSeconds,
        partner_gender: gender,
      });
    } catch {
      // Ignore failures silently
    }
    router.replace('/dashboard');
  }

  return (
    <div className={styles.backdrop}>
      <div
        className={styles.card}
        ref={cardRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
      >
        <h2 id="feedback-title" className={styles.title}>
          How was your call?
        </h2>
        <p className={styles.subtitle}>Rate your practice conversation with {name}</p>

        <div className={styles.avatarRing}>
          <div className={styles.avatarCircle}>{initial}</div>
        </div>

        {/* Rating Stars Group */}
        <div className={styles.starsGroup} role="radiogroup" aria-label="Call rating">
          {[1, 2, 3, 4, 5].map((starValue) => {
            const isFilled = starValue <= rating;
            return (
              <button
                key={starValue}
                type="button"
                className={`${styles.starBtn} ${isFilled ? styles.starBtnFilled : ''}`}
                role="radio"
                aria-checked={rating === starValue}
                aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
                onClick={() => setRating(starValue)}
                disabled={isPending}
              >
                <StarIcon filled={isFilled} className={styles.starIcon} />
              </button>
            );
          })}
        </div>

        {/* Comment Textarea */}
        <label htmlFor="feedback-comment" className={styles.visuallyHidden}>
          Share comments or feedback
        </label>
        <textarea
          id="feedback-comment"
          className={styles.textarea}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share comments or feedback (optional)..."
          maxLength={300}
          disabled={isPending}
        />

        {/* Actions Row */}
        <div className={styles.actionsRow}>
          <button
            type="button"
            className={styles.skipBtn}
            onClick={handleSkip}
            disabled={isPending}
          >
            Skip
          </button>
          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={rating === 0 || isPending}
          >
            {isPending ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
}
