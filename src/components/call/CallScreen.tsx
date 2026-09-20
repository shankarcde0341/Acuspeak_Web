'use client';

import { useState, useEffect, useRef } from 'react';
import {
  endCallSession,
  reportUser,
  blockUser,
  sendFriendRequest,
} from '@/lib/call';
import {
  PersonAddIcon,
  FlagIcon,
  BanIcon,
  CheckIcon,
  MicIcon,
  MicOffIcon,
  PhoneIcon,
  VolumeHighIcon,
  VolumeMuteIcon,
} from './icons';
import FeedbackModal from './FeedbackModal';
import styles from './CallScreen.module.css';

interface CallScreenProps {
  name: string;
  country: string;
  gender: string;
  roomId?: string;
  targetUserId?: string;
}

export default function CallScreen({
  name,
  country,
  gender,
  roomId,
  targetUserId,
}: CallScreenProps) {
  const [seconds, setSeconds] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [friendStatus, setFriendStatus] = useState<'idle' | 'sent'>('idle');
  const [reportStatus, setReportStatus] = useState<'idle' | 'reported'>('idle');
  const [blockStatus, setBlockStatus] = useState<'idle' | 'blocked'>('idle');
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasEndedRef = useRef<boolean>(false);

  const initial = name.charAt(0).toUpperCase();

  useEffect(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      if (startTimeRef.current > 0) {
        setSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  const formattedTime = `${mins}:${secs}`;

  async function handleAddFriend() {
    if (friendStatus === 'sent') return;
    setFriendStatus('sent');
    try {
      await sendFriendRequest(name);
    } catch {
      // Ignore failures silently
    }
  }

  async function handleReport() {
    if (reportStatus === 'reported') return;
    setReportStatus('reported');
    try {
      await reportUser(name);
    } catch {
      // Ignore failures silently
    }
  }

  async function handleBlock() {
    if (blockStatus === 'blocked') return;
    setBlockStatus('blocked');
    try {
      await blockUser(name);
    } catch {
      // Ignore failures silently
    }
  }

  async function handleEndCall() {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    try {
      await endCallSession(roomId);
    } catch {
      // Ignore failures silently
    }
    setShowFeedback(true);
  }

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        {/* Top Row */}
        <div className={styles.topRow}>
          <div className={styles.timerGroup}>
            <span className={styles.statusLabel}>In Call</span>
            <span className={styles.timer} role="timer">
              {formattedTime}
            </span>
          </div>

          <div className={styles.actionsGroup}>
            {/* Add Friend */}
            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleAddFriend}
              disabled={friendStatus === 'sent'}
              aria-label={friendStatus === 'sent' ? 'Friend request sent' : 'Add friend'}
            >
              {friendStatus === 'sent' ? (
                <CheckIcon className={styles.actionIcon} />
              ) : (
                <PersonAddIcon className={styles.actionIcon} />
              )}
            </button>

            {/* Report User */}
            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleReport}
              disabled={reportStatus === 'reported'}
              aria-label={reportStatus === 'reported' ? 'Reported' : 'Report user'}
            >
              {reportStatus === 'reported' ? (
                <CheckIcon className={styles.actionIcon} />
              ) : (
                <FlagIcon className={styles.actionIcon} />
              )}
            </button>

            {/* Block User */}
            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleBlock}
              disabled={blockStatus === 'blocked'}
              aria-label={blockStatus === 'blocked' ? 'Blocked' : 'Block user'}
            >
              {blockStatus === 'blocked' ? (
                <CheckIcon className={styles.actionIcon} />
              ) : (
                <BanIcon className={styles.actionIcon} />
              )}
            </button>
          </div>
        </div>

        {/* Center Section */}
        <div className={styles.centerSection}>
          <div className={styles.avatarRing}>
            <div className={styles.avatarCircle}>{initial}</div>
          </div>

          <h1 className={styles.partnerName}>{name}</h1>
          <p className={styles.partnerCountry}>{country}</p>

          {/* Waveform Bars */}
          <div className={styles.waveform} aria-hidden="true">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={styles.waveBar}
                style={{ '--i': i } as React.CSSProperties}
              />
            ))}
          </div>
        </div>

        {/* Controls Row */}
        <div className={styles.controlsRow}>
          {/* Mute Mic */}
          <button
            type="button"
            className={`${styles.controlBtn} ${isMuted ? styles.controlBtnActive : ''}`}
            onClick={() => setIsMuted((prev) => !prev)}
            aria-pressed={isMuted}
            aria-label="Mute microphone"
          >
            {isMuted ? (
              <MicOffIcon className={styles.controlIcon} />
            ) : (
              <MicIcon className={styles.controlIcon} />
            )}
          </button>

          {/* End Call */}
          <button
            type="button"
            className={styles.endCallBtn}
            onClick={handleEndCall}
            aria-label="End call"
          >
            <PhoneIcon className={styles.endCallIcon} />
          </button>

          {/* Sound / Mute Speaker */}
          <button
            type="button"
            className={`${styles.controlBtn} ${isSoundMuted ? styles.controlBtnActive : ''}`}
            onClick={() => setIsSoundMuted((prev) => !prev)}
            aria-pressed={isSoundMuted}
            aria-label="Mute speaker"
          >
            {isSoundMuted ? (
              <VolumeMuteIcon className={styles.controlIcon} />
            ) : (
              <VolumeHighIcon className={styles.controlIcon} />
            )}
          </button>
        </div>
      </div>

      {/* Post-Call Feedback Modal */}
      {showFeedback && (
        <FeedbackModal
          name={name}
          gender={gender}
          durationSeconds={seconds}
          roomId={roomId}
          targetUserId={targetUserId}
        />
      )}
    </div>
  );
}
