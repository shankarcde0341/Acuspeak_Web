'use client';

import { useEffect, useRef } from 'react';
import { AlertCircleIcon } from '../call/icons';
import styles from './RoomDialog.module.css';

export interface RoomDialogProps {
  variant: 'confirm-remove' | 'notice-ended' | 'notice-removed';
  targetName?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose: () => void;
}

export function RoomDialog({
  variant,
  targetName = '',
  onConfirm,
  onCancel,
  onClose,
}: RoomDialogProps) {
  const initialFocusRef = useRef<HTMLButtonElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    initialFocusRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (variant === 'confirm-remove' && onCancel) {
          onCancel();
        }
      }

      if (e.key === 'Tab' && cardRef.current) {
        const focusables = cardRef.current.querySelectorAll<HTMLButtonElement>('button:not([disabled])');
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [variant, onCancel]);

  let title = '';
  let message: string | null = null;
  let iconClass = styles.iconFlame;

  if (variant === 'confirm-remove') {
    title = 'Remove participant';
    message = `Are you sure you want to remove ${targetName} from the room?`;
    iconClass = styles.iconFlame;
  } else if (variant === 'notice-ended') {
    title = 'Room ended';
    message = 'The host has ended this live room.';
    iconClass = styles.iconPrimary;
  } else if (variant === 'notice-removed') {
    title = 'You have been removed from the room';
    message = null;
    iconClass = styles.iconFlame;
  }

  return (
    <div className={styles.backdrop} role="presentation">
      <div
        ref={cardRef}
        className={styles.card}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="room-dialog-title"
        aria-describedby={message ? 'room-dialog-message' : undefined}
      >
        <div className={`${styles.icon} ${iconClass}`}>
          <AlertCircleIcon style={{ width: '100%', height: '100%' }} />
        </div>

        <h2 id="room-dialog-title" className={styles.title}>
          {title}
        </h2>

        {message && (
          <p id="room-dialog-message" className={styles.message}>
            {message}
          </p>
        )}

        {variant === 'confirm-remove' ? (
          <div className={styles.buttonRow}>
            <button
              ref={initialFocusRef}
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.removeButton}
              onClick={onConfirm}
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            ref={initialFocusRef}
            type="button"
            className={styles.okButton}
            onClick={onClose}
          >
            OK
          </button>
        )}
      </div>
    </div>
  );
}
