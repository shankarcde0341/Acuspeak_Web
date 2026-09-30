'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  endCallSession,
  reportUser,
  blockUser,
  sendFriendRequest,
} from '@/lib/call';
import { getZegoToken } from '@/services/matchService';
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
  token?: string;
}

export default function CallScreen({
  name,
  country,
  gender,
  roomId: propRoomId,
  targetUserId: propTargetUserId,
  token: propToken,
}: CallScreenProps) {
  const router = useRouter();

  const [seconds, setSeconds] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [friendStatus, setFriendStatus] = useState<'idle' | 'sent'>('idle');
  const [reportStatus, setReportStatus] = useState<'idle' | 'reported'>('idle');
  const [blockStatus, setBlockStatus] = useState<'idle' | 'blocked'>('idle');
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [callState, setCallState] = useState<'connecting' | 'connected' | 'ended' | 'error'>('connecting');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasEndedRef = useRef<boolean>(false);

  // References for Zego SDK objects
  const zegoEngineRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const publishStreamIDRef = useRef<string | null>(null);
  const roomIdRef = useRef<string | undefined>(propRoomId);
  const tokenRef = useRef<string | undefined>(propToken);

  const initial = name.charAt(0).toUpperCase();

  // 1. Requirement 1: URL query params cleanup on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // 2. Requirement 3: Guaranteed Teardown function
  const teardownZego = useCallback(async () => {
    const zg = zegoEngineRef.current;
    if (!zg) return;

    if (publishStreamIDRef.current) {
      try {
        zg.stopPublishingStream(publishStreamIDRef.current);
      } catch {
        // Ignore silent teardown errors
      }
      publishStreamIDRef.current = null;
    }

    if (localStreamRef.current) {
      try {
        zg.destroyStream(localStreamRef.current);
      } catch {
        // Ignore silent teardown errors
      }
      localStreamRef.current = null;
    }

    if (roomIdRef.current) {
      try {
        zg.logoutRoom(roomIdRef.current);
      } catch {
        // Ignore silent teardown errors
      }
    }

    try {
      zg.off('roomStateUpdate');
      zg.off('roomUserUpdate');
      zg.off('roomStreamUpdate');
    } catch {
      // Ignore listener removal errors
    }

    zegoEngineRef.current = null;
  }, []);

  // 3. Requirement 3: End Call Handler
  const handleEndCall = useCallback(async () => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;
    setCallState('ended');

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    await teardownZego();

    try {
      await endCallSession(roomIdRef.current);
    } catch {
      // Ignore failures
    }

    setShowFeedback(true);
  }, [teardownZego]);

  // 4. Initialize Zego Web RTC Engine on mount
  useEffect(() => {
    let isCancelled = false;

    async function initZego() {
      if (!roomIdRef.current) {
        setErrorMsg('Invalid call session parameters.');
        setCallState('error');
        return;
      }

      try {
        // Fetch Zego Token and dynamic app_id from backend (Source of Truth)
        const zegoRes = await getZegoToken(roomIdRef.current);
        if (isCancelled) return;

        if (zegoRes.error || !zegoRes.token || !zegoRes.app_id || !zegoRes.user_id) {
          setErrorMsg(zegoRes.error || 'Failed to authenticate voice service.');
          setCallState('error');
          return;
        }

        const appId = zegoRes.app_id;
        const currentUserId = zegoRes.user_id;
        const validToken = zegoRes.token;
        tokenRef.current = validToken;

        // Dynamically import ZegoExpressEngine for browser WebRTC
        const { ZegoExpressEngine } = await import('zego-express-engine-webrtc');
        if (isCancelled) return;

        const zg = new ZegoExpressEngine(appId, 'wss://webim-paas.zego.im/ws');
        zegoEngineRef.current = zg;

        // Event: Room state changes
        zg.on('roomStateUpdate', (roomID: string, state: string) => {
          if (state === 'DISCONNECTED' && !hasEndedRef.current) {
            handleEndCall();
          }
        });

        // Event: Partner leaves room
        zg.on('roomUserUpdate', (roomID: string, updateType: string) => {
          if (updateType === 'DELETE' && !hasEndedRef.current) {
            handleEndCall();
          }
        });

        // Event: Remote audio streams
        zg.on('roomStreamUpdate', async (roomID: string, updateType: string, streamList: any[]) => {
          if (updateType === 'ADD') {
            for (const stream of streamList) {
              try {
                const remoteStream = await zg.startPlayingStream(stream.streamID);
                let audioElem = document.getElementById('remote-voice-player') as HTMLAudioElement;
                if (!audioElem) {
                  audioElem = document.createElement('audio');
                  audioElem.id = 'remote-voice-player';
                  audioElem.autoplay = true;
                  audioElem.hidden = true;
                  document.body.appendChild(audioElem);
                }
                audioElem.srcObject = remoteStream;
                await audioElem.play().catch(() => {
                  // Autoplay policy fallback
                });
              } catch (playErr) {
                console.error('Remote stream play error:', playErr);
              }
            }
          } else if (updateType === 'DELETE') {
            for (const stream of streamList) {
              try {
                zg.stopPlayingStream(stream.streamID);
              } catch {
                // Ignore
              }
            }
          }
        });

        // Login room
        const isLogged = await zg.loginRoom(
          roomIdRef.current,
          validToken,
          { userID: currentUserId, userName: 'Me' },
          { userUpdate: true }
        );

        if (!isLogged) {
          setErrorMsg('Failed to enter voice room.');
          setCallState('error');
          return;
        }

        // Create local mic stream
        const localStream = await zg.createStream({ camera: { video: false, audio: true } });
        localStreamRef.current = localStream;

        // Publish local mic stream
        const pubStreamID = `st_${currentUserId}_${Date.now()}`;
        publishStreamIDRef.current = pubStreamID;
        zg.startPublishingStream(pubStreamID, localStream);

        if (isCancelled) return;

        setCallState('connected');
        startTimeRef.current = Date.now();
        timerRef.current = setInterval(() => {
          if (startTimeRef.current > 0) {
            setSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
          }
        }, 1000);
      } catch (err: any) {
        console.error('Zego initialization failed:', err);
        if (!isCancelled) {
          setErrorMsg(err?.message || 'Voice connection failed. Please check microphone permissions.');
          setCallState('error');
        }
      }
    }

    initZego();

    return () => {
      isCancelled = true;
      teardownZego();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [handleEndCall, teardownZego]);

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  const formattedTime = `${mins}:${secs}`;

  // 5. Mute / Unmute Microphone
  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      if (zegoEngineRef.current && localStreamRef.current) {
        try {
          zegoEngineRef.current.mutePublishStreamAudio(localStreamRef.current, nextMuted);
        } catch {
          // Fallback track toggle
          localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !nextMuted));
        }
      }
      return nextMuted;
    });
  }, []);

  // 6. Sound / Speaker Mute
  const handleToggleSound = useCallback(() => {
    setIsSoundMuted((prev) => {
      const nextSoundMuted = !prev;
      const audioElem = document.getElementById('remote-voice-player') as HTMLAudioElement;
      if (audioElem) {
        audioElem.muted = nextSoundMuted;
      }
      return nextSoundMuted;
    });
  }, []);

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

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        {/* Top Row */}
        <div className={styles.topRow}>
          <div className={styles.timerGroup}>
            <span className={styles.statusLabel}>
              {callState === 'connecting'
                ? 'Connecting...'
                : callState === 'connected'
                  ? 'In Call'
                  : 'Ended'}
            </span>
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

        {/* Center Section or Error Card */}
        {callState === 'error' ? (
          <div className={styles.errorCard}>
            <h2 className={styles.errorTitle}>Voice Connection Failed</h2>
            <p className={styles.errorSub}>{errorMsg || 'Unable to establish live audio stream.'}</p>
            <button
              type="button"
              className={styles.controlBtn}
              style={{ width: 'auto', padding: '12px 24px', borderRadius: '24px' }}
              onClick={() => router.push('/practice')}
            >
              Back to Practice
            </button>
          </div>
        ) : (
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
        )}

        {/* Controls Row */}
        {callState !== 'error' && (
          <div className={styles.controlsRow}>
            {/* Mute Mic */}
            <button
              type="button"
              className={`${styles.controlBtn} ${isMuted ? styles.controlBtnActive : ''}`}
              onClick={handleToggleMute}
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
              onClick={handleToggleSound}
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
        )}
      </div>

      {/* Post-Call Feedback Modal */}
      {showFeedback && (
        <FeedbackModal
          name={name}
          gender={gender}
          durationSeconds={seconds}
          roomId={propRoomId}
          targetUserId={propTargetUserId}
        />
      )}
    </div>
  );
}
