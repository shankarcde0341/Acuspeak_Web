'use client';

import React, { useState } from 'react';
import { createLiveRoom } from '@/services/roomService';
import styles from './CreateRoomModal.module.css';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (roomId: string) => void;
}

const PRESET_TOPICS = [
  'Daily English',
  'Business English',
  'Interview English',
  'IELTS / TOEFL',
  'Casual Chat',
  'Debate & Discussions',
];

const CAPACITY_OPTIONS = [4, 8, 12, 16];

export function CreateRoomModal({ isOpen, onClose, onCreated }: CreateRoomModalProps) {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('Daily English');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(12);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 3) {
      setErrorMsg('Please enter a descriptive room title (at least 3 characters).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await createLiveRoom({
      title: title.trim(),
      topic,
      description: description.trim(),
      max_participants: maxParticipants,
    });

    setIsSubmitting(false);

    if (res.error || !res.room) {
      setErrorMsg(res.error || 'Failed to create room. Please try again.');
      return;
    }

    onCreated(res.room.room_id);
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Fixed Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Create Live Room</h2>
            <p className={styles.subtitle}>
              Start a real-time voice & video session as the host.
            </p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        {/* Form with Scrollable Body and Fixed Footer */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.scrollableBody}>
            {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

            {/* Room Title */}
            <div className={styles.field}>
              <label htmlFor="room-title" className={styles.label}>
                Room Title <span className={styles.required}>*</span>
              </label>
              <input
                id="room-title"
                type="text"
                className={styles.input}
                placeholder="e.g. Daily Small Talk & Idioms Practice"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
                autoFocus
              />
            </div>

            {/* Topic */}
            <div className={styles.field}>
              <label className={styles.label}>
                Conversation Topic <span className={styles.required}>*</span>
              </label>
              <div className={styles.topicPills}>
                {PRESET_TOPICS.map((t) => (
                  <button
                    type="button"
                    key={t}
                    className={`${styles.topicPill} ${topic === t ? styles.topicPillActive : ''}`}
                    onClick={() => setTopic(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className={styles.field}>
              <label htmlFor="room-desc" className={styles.label}>
                Description (Optional)
              </label>
              <textarea
                id="room-desc"
                className={styles.textarea}
                placeholder="Tell participants what speaking skills or prompt you'll cover..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={300}
              />
            </div>

            {/* Max Participants */}
            <div className={styles.field}>
              <label className={styles.label}>
                Room Capacity (Max Participants)
              </label>
              <div className={styles.capacityRow}>
                {CAPACITY_OPTIONS.map((cap) => (
                  <button
                    type="button"
                    key={cap}
                    className={`${styles.capacityButton} ${
                      maxParticipants === cap ? styles.capacityButtonActive : ''
                    }`}
                    onClick={() => setMaxParticipants(cap)}
                  >
                    {cap} People
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting && <div className={styles.spinner} />}
              {isSubmitting ? 'Creating...' : 'Start Live Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
