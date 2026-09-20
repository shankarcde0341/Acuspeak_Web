'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { RoomDetail, RoomParticipant } from '@/lib/rooms';
import { leaveRoom, endRoom, removeParticipant } from '@/lib/rooms';
import { Avatar } from './Avatar';
import { RoomDialog } from './RoomDialog';
import {
  ChevronLeftIcon,
  HandIcon,
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  ExitIcon,
  MinusCircleIcon,
} from '../call/icons';
import styles from './RoomScreen.module.css';

export interface RoomScreenProps {
  room: RoomDetail;
}

export function RoomScreen({ room }: RoomScreenProps) {
  const router = useRouter();
  const leavingRef = useRef(false);

  const initialListeners = room.participants.filter(
    (p) => p.user_id !== room.host_id
  );

  const [listeners, setListeners] = useState<RoomParticipant[]>(initialListeners);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [pendingRemoveUser, setPendingRemoveUser] = useState<RoomParticipant | null>(null);
  const [notice, setNotice] = useState<'ended' | 'removed' | null>(null);

  const handleLeaveOrEnd = async () => {
    if (leavingRef.current) return;
    leavingRef.current = true;

    try {
      if (room.is_host) {
        await endRoom(room.room_id);
      } else {
        await leaveRoom(room.room_id);
      }
    } catch {
      // Ignore failures
    }
    router.replace('/live');
  };

  const handleConfirmRemove = async () => {
    if (!pendingRemoveUser) return;
    const targetUser = pendingRemoveUser;
    setPendingRemoveUser(null);
    try {
      await removeParticipant(room.room_id, targetUser.user_id);
    } catch {
      // Ignore failure
    }
    setListeners((prev) => prev.filter((p) => p.user_id !== targetUser.user_id));
  };

  const handleNoticeClose = () => {
    setNotice(null);
    router.replace('/live');
  };

  const backOrLeaveLabel = room.is_host ? 'End room' : 'Leave room';

  return (
    <div className={styles.root}>
      <div className={styles.column}>
        {/* Header */}
        <header className={styles.header}>
          <button
            type="button"
            className={styles.headerBackButton}
            onClick={handleLeaveOrEnd}
            aria-label={backOrLeaveLabel}
          >
            <ChevronLeftIcon style={{ width: '20px', height: '20px' }} />
          </button>

          <h2 className={styles.headerTopic}>{room.topic}</h2>

          <div className={styles.liveBadge}>
            <span className={styles.liveDot} />
            <span className={styles.liveText}>LIVE</span>
          </div>
        </header>

        {/* Title block */}
        <div className={styles.titleBlock}>
          <h1 className={styles.roomTitle}>{room.title}</h1>
          <p className={styles.hostSubtitle}>Hosted by {room.host_name}</p>
        </div>

        {/* Middle region */}
        <main className={styles.middleRegion}>
          {/* Speakers section */}
          <div className={styles.sectionLabel}>Speakers</div>

          <div className={styles.hostContainer}>
            <div className={styles.hostHalo} />
            <div className={styles.hostContent}>
              <Avatar name={room.host_name} size={100} tone="gold" />
              <div className={styles.hostName}>{room.host_name}</div>
              <div className={styles.hostChip}>HOST</div>
            </div>
          </div>

          {/* Listeners section */}
          <div className={`${styles.sectionLabel} ${styles.listenersLabel}`}>
            Listeners ({listeners.length})
          </div>

          {listeners.length > 0 ? (
            <div className={styles.listenersGrid}>
              {listeners.map((listener, index) => (
                <div
                  key={listener.user_id}
                  className={styles.listenerTile}
                  style={{ animationDelay: `${60 + index * 40}ms` }}
                >
                  <Avatar name={listener.name} size={60} tone="blue" />
                  <span className={styles.listenerName}>{listener.name}</span>

                  {room.is_host && (
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => setPendingRemoveUser(listener)}
                      aria-label={`Remove ${listener.name}`}
                    >
                      <MinusCircleIcon style={{ width: '16px', height: '16px' }} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyListeners}>
              No other listeners in the room yet.
            </p>
          )}
        </main>

        {/* Footer Toolbar */}
        <footer
          className={styles.footer}
          role="toolbar"
          aria-label="Room controls"
        >
          {/* Raise Hand */}
          <button
            type="button"
            className={`${styles.controlButton} ${
              isHandRaised ? styles.activeControlButton : ''
            }`}
            onClick={() => setIsHandRaised((prev) => !prev)}
          >
            <div className={styles.buttonIcon}>
              <HandIcon
                style={{
                  width: '20px',
                  height: '20px',
                  color: isHandRaised ? 'var(--text-primary)' : 'var(--gold)',
                }}
              />
            </div>
            <span className={styles.buttonLabel}>
              {isHandRaised ? 'Hand raised' : 'Raise hand'}
            </span>
          </button>

          {/* Mute / Unmute */}
          <button
            type="button"
            className={`${styles.controlButton} ${
              !isMuted ? styles.activeControlButton : ''
            }`}
            onClick={() => setIsMuted((prev) => !prev)}
          >
            <div className={styles.buttonIcon}>
              {isMuted ? (
                <MicOffIcon
                  style={{ width: '20px', height: '20px', color: 'var(--flame)' }}
                />
              ) : (
                <MicIcon style={{ width: '20px', height: '20px' }} />
              )}
            </div>
            <span className={styles.buttonLabel}>
              {isMuted ? 'Unmute' : 'Mute'}
            </span>
          </button>

          {/* Camera On / Off */}
          <button
            type="button"
            className={`${styles.controlButton} ${
              isCamOn ? styles.activeControlButton : ''
            }`}
            onClick={() => setIsCamOn((prev) => !prev)}
          >
            <div className={styles.buttonIcon}>
              {isCamOn ? (
                <VideoIcon style={{ width: '20px', height: '20px' }} />
              ) : (
                <VideoOffIcon
                  style={{
                    width: '20px',
                    height: '20px',
                    color: 'var(--primary-light)',
                  }}
                />
              )}
            </div>
            <span className={styles.buttonLabel}>
              {isCamOn ? 'Cam On' : 'Cam Off'}
            </span>
          </button>

          {/* Leave / End Room */}
          <button
            type="button"
            className={`${styles.controlButton} ${styles.leaveControlButton}`}
            onClick={handleLeaveOrEnd}
          >
            <div className={styles.buttonIcon}>
              <ExitIcon style={{ width: '20px', height: '20px', color: '#ffffff' }} />
            </div>
            <span className={styles.buttonLabel}>
              {room.is_host ? 'End Room' : 'Leave'}
            </span>
          </button>
        </footer>
      </div>

      {/* Dialogs */}
      {pendingRemoveUser && (
        <RoomDialog
          variant="confirm-remove"
          targetName={pendingRemoveUser.name}
          onConfirm={handleConfirmRemove}
          onCancel={() => setPendingRemoveUser(null)}
          onClose={() => setPendingRemoveUser(null)}
        />
      )}

      {notice && (
        <RoomDialog
          variant={notice === 'ended' ? 'notice-ended' : 'notice-removed'}
          onClose={handleNoticeClose}
        />
      )}
    </div>
  );
}
