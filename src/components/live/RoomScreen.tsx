'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { RoomDetail, RoomParticipant } from '@/lib/rooms';
import { recordRoomParticipation } from '@/lib/rooms';
import {
  getLiveRoomDetail,
  getLiveZegoToken,
  leaveLiveRoom,
  endLiveRoom,
  kickParticipant,
  updateParticipantState,
} from '@/services/roomService';
import { Avatar } from './Avatar';
import { RoomDialog } from './RoomDialog';
import {
  ChevronLeftIcon,
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  ExitIcon,
  MinusCircleIcon,
} from '../call/icons';
import styles from './RoomScreen.module.css';

interface ZegoUser {
  userID: string;
  userName: string;
}

interface ZegoStreamItem {
  streamID: string;
  user: ZegoUser;
  extraInfo?: string;
}

interface ZegoBroadcastMsg {
  message: string;
  messageID: number | string;
  sendTime: number;
  fromUser: ZegoUser;
}

interface RemoteStreamState {
  streamID: string;
  stream: MediaStream;
  userID: string;
  userName: string;
  isCamOn: boolean;
  isMuted: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
  isMe: boolean;
}

interface IZegoExpressEngine {
  loginRoom(
    roomID: string,
    token: string,
    user: { userID: string; userName: string },
    config?: { userUpdate?: boolean; maxMemberCount?: number }
  ): Promise<boolean>;
  logoutRoom(roomID?: string): void;
  createStream(source?: {
    camera?: { video?: boolean; audio?: boolean };
  }): Promise<MediaStream>;
  destroyStream(stream: MediaStream): void;
  startPublishingStream(streamID: string, localStream: MediaStream): boolean;
  stopPublishingStream(streamID: string): boolean;
  startPlayingStream(streamID: string): Promise<MediaStream>;
  stopPlayingStream(streamID: string): void;
  muteMicrophone(enable: boolean): boolean;
  mutePublishStreamAudio(localStream: MediaStream, enable: boolean): boolean;
  mutePublishStreamVideo(localStream: MediaStream, enable: boolean): boolean;
  sendBroadcastMessage(
    roomID: string,
    message: string
  ): Promise<{ errorCode: number; messageID: number }>;
  setSoundLevelDelegate(enable: boolean, timeSpan?: number): void;
  on(event: string, callback: (...args: unknown[]) => void): void;
  off(event: string, callback?: (...args: unknown[]) => void): void;
}

export interface RoomScreenProps {
  room?: RoomDetail | null;
  roomId?: string;
  initialRoom?: RoomDetail | null;
}

// Sub-component for individual participant video / avatar tile
interface VideoTileProps {
  stream?: MediaStream | null;
  name: string;
  role: string;
  isHost: boolean;
  isMe: boolean;
  isCamOn: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  tone?: 'gold' | 'blue';
}

function VideoTile({
  stream,
  name,
  role,
  isHost,
  isMe,
  isCamOn,
  isMuted,
  isSpeaking,
  tone = 'blue',
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideo = isCamOn && stream && stream.getVideoTracks().length > 0;

  return (
    <div className={`${styles.tile} ${isSpeaking ? styles.tileSpeaking : ''}`}>
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMe}
          className={styles.videoElement}
        />
      ) : (
        <div className={styles.avatarFallback}>
          {isSpeaking && <div className={styles.speakingPulse} />}
          <Avatar name={name} size={isHost ? 84 : 68} tone={tone} />
        </div>
      )}

      {/* Mic status indicator */}
      <div className={styles.micStatusBadge}>
        {isMuted ? (
          <span className={styles.micMutedIcon} title="Muted">
            <MicOffIcon style={{ width: '16px', height: '16px' }} />
          </span>
        ) : (
          <span className={styles.micActiveIcon} title="Microphone Active">
            <MicIcon style={{ width: '16px', height: '16px' }} />
          </span>
        )}
      </div>

      {/* Bottom overlay badge */}
      <div className={styles.tileBadge}>
        <span className={styles.tileName}>
          {name} {isMe ? '(You)' : ''}
        </span>
        <span
          className={`${styles.roleChip} ${
            role === 'host'
              ? styles.roleHost
              : role === 'speaker'
              ? styles.roleSpeaker
              : styles.roleListener
          }`}
        >
          {role}
        </span>
      </div>
    </div>
  );
}

export function RoomScreen({ room: propRoom, roomId: propRoomId, initialRoom }: RoomScreenProps) {
  const router = useRouter();

  // Resolved room state
  const [room, setRoom] = useState<RoomDetail | null>(propRoom || initialRoom || null);
  const effectiveRoomId = propRoom?.room_id || propRoomId || initialRoom?.room_id || '';

  // Connection & Media states
  const [connectionState, setConnectionState] = useState<
    'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error'
  >('connecting');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [myRole, setMyRole] = useState<'host' | 'speaker' | 'listener'>('speaker');
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStreamState[]>([]);
  const [speakingUserIds, setSpeakingUserIds] = useState<Set<string>>(new Set());

  // UI Drawers & Chat
  const [activeTab, setActiveTab] = useState<'none' | 'chat' | 'participants'>('none');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Dialogs
  const [pendingRemoveUser, setPendingRemoveUser] = useState<RoomParticipant | null>(null);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [notice, setNotice] = useState<'ended' | 'removed' | null>(null);

  // Refs
  const zegoEngineRef = useRef<IZegoExpressEngine | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const publishStreamIDRef = useRef<string | null>(null);
  const myUserIdRef = useRef<string>('');
  const myUserNameRef = useRef<string>('Me');
  const leavingRef = useRef(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Sync initial participants and role
  useEffect(() => {
    if (room) {
      setParticipants(room.participants || []);
      if (room.is_host) {
        setMyRole('host');
      } else if (room.my_role === 'listener') {
        setMyRole('listener');
      } else {
        setMyRole('speaker');
      }
    }
  }, [room]);

  // Teardown helper
  const teardownZego = useCallback(async () => {
    const zg = zegoEngineRef.current;
    if (!zg) return;

    if (publishStreamIDRef.current) {
      try {
        zg.stopPublishingStream(publishStreamIDRef.current);
      } catch {
        // Safe teardown
      }
      publishStreamIDRef.current = null;
    }

    if (localStreamRef.current) {
      try {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        zg.destroyStream(localStreamRef.current);
      } catch {
        // Safe teardown
      }
      localStreamRef.current = null;
    }

    for (const rStream of remoteStreams) {
      try {
        zg.stopPlayingStream(rStream.streamID);
      } catch {
        // Safe teardown
      }
    }

    if (effectiveRoomId) {
      try {
        zg.logoutRoom(effectiveRoomId);
      } catch {
        // Safe teardown
      }
    }

    try {
      zg.off('roomStateUpdate');
      zg.off('roomUserUpdate');
      zg.off('roomStreamUpdate');
      zg.off('IMRecvBroadcastMessage');
      zg.off('capturedSoundLevelUpdate');
      zg.off('soundLevelUpdate');
    } catch {
      // Safe teardown
    }

    zegoEngineRef.current = null;
  }, [effectiveRoomId, remoteStreams]);

  // Initial Room metadata fetch and Zego WebRTC initialization
  useEffect(() => {
    let isCancelled = false;

    async function initSession() {
      if (!effectiveRoomId) {
        setErrorMsg('Invalid room identifier.');
        setConnectionState('error');
        return;
      }

      try {
        // 1. Fetch room metadata if not already available
        let currentRoom = room;
        if (!currentRoom) {
          currentRoom = await getLiveRoomDetail(effectiveRoomId);
          if (isCancelled) return;
          if (!currentRoom) {
            setErrorMsg('Room not found or session has ended.');
            setConnectionState('error');
            return;
          }
          setRoom(currentRoom);
          setParticipants(currentRoom.participants || []);
        }

        recordRoomParticipation(effectiveRoomId, currentRoom.title);

        // 2. Fetch Zego Token04 securely from FastAPI backend
        const tokenRes = await getLiveZegoToken(effectiveRoomId);
        if (isCancelled) return;

        if (tokenRes.error || !tokenRes.token || !tokenRes.app_id || !tokenRes.user_id) {
          setErrorMsg(tokenRes.error || 'Failed to authenticate streaming credentials.');
          setConnectionState('error');
          return;
        }

        const { app_id, user_id, user_name, token } = tokenRes;
        myUserIdRef.current = user_id;
        myUserNameRef.current = user_name || 'Me';

        // 3. Dynamically import ZegoExpressEngine WebRTC client SDK
        const { ZegoExpressEngine } = await import('zego-express-engine-webrtc');
        if (isCancelled) return;

        const zg = new ZegoExpressEngine(app_id, 'wss://webim-paas.zego.im/ws') as unknown as IZegoExpressEngine;
        zegoEngineRef.current = zg;

        // Event: Room state changes
        zg.on('roomStateUpdate', (_roomID: unknown, state: unknown) => {
          if (state === 'CONNECTED') {
            setConnectionState('connected');
          } else if (state === 'CONNECTING') {
            setConnectionState('reconnecting');
          } else if (state === 'DISCONNECTED') {
            setConnectionState('disconnected');
          }
        });

        // Event: Participant user updates
        zg.on('roomUserUpdate', (_roomID: unknown, updateType: unknown, userList: unknown) => {
          const users = userList as ZegoUser[];
          if (updateType === 'ADD') {
            setParticipants((prev) => {
              const existingIds = new Set(prev.map((p) => p.user_id));
              const newEntries = users
                .filter((u) => !existingIds.has(u.userID))
                .map((u) => ({
                  user_id: u.userID,
                  name: u.userName || 'Participant',
                  role: u.userID === currentRoom?.host_id ? 'host' : 'speaker',
                  joined_at: new Date().toISOString(),
                  is_muted: false,
                  is_cam_on: false,
                }));
              return [...prev, ...newEntries];
            });
          } else if (updateType === 'DELETE') {
            const removedIds = new Set(users.map((u) => u.userID));
            setParticipants((prev) => prev.filter((p) => !removedIds.has(p.user_id)));
            setRemoteStreams((prev) => prev.filter((s) => !removedIds.has(s.userID)));
          }
        });

        // Event: Remote stream publishing / stopping
        zg.on('roomStreamUpdate', async (_roomID: unknown, updateType: unknown, streamList: unknown) => {
          const streams = streamList as ZegoStreamItem[];
          if (updateType === 'ADD') {
            for (const st of streams) {
              try {
                const mediaStream = await zg.startPlayingStream(st.streamID);
                setRemoteStreams((prev) => {
                  const filtered = prev.filter((item) => item.streamID !== st.streamID);
                  return [
                    ...filtered,
                    {
                      streamID: st.streamID,
                      stream: mediaStream,
                      userID: st.user.userID,
                      userName: st.user.userName || 'Peer',
                      isCamOn: mediaStream.getVideoTracks().length > 0,
                      isMuted: false,
                    },
                  ];
                });
              } catch (playErr) {
                console.warn('Failed to start playing remote stream:', playErr);
              }
            }
          } else if (updateType === 'DELETE') {
            for (const st of streams) {
              zg.stopPlayingStream(st.streamID);
              setRemoteStreams((prev) => prev.filter((item) => item.streamID !== st.streamID));
            }
          }
        });

        // Event: Real-time Broadcast Messages (Chat & Control signals)
        zg.on('IMRecvBroadcastMessage', (_roomID: unknown, chatList: unknown) => {
          const list = chatList as ZegoBroadcastMsg[];
          for (const item of list) {
            // Check for control packets
            try {
              if (item.message.startsWith('{') && item.message.endsWith('}')) {
                const parsed = JSON.parse(item.message);
                if (parsed.type === 'ROOM_ENDED') {
                  setNotice('ended');
                  return;
                }
                if (parsed.type === 'KICK_USER' && parsed.targetUserId === myUserIdRef.current) {
                  setNotice('removed');
                  return;
                }
                if (parsed.type === 'MEDIA_STATE' && parsed.userId) {
                  setRemoteStreams((prev) =>
                    prev.map((s) =>
                      s.userID === parsed.userId
                        ? {
                            ...s,
                            isMuted: parsed.is_muted ?? s.isMuted,
                            isCamOn: parsed.is_cam_on ?? s.isCamOn,
                          }
                        : s
                    )
                  );
                  continue;
                }
              }
            } catch {
              // Standard text chat
            }

            // Normal text chat message
            const newMsg: ChatMessage = {
              id: String(item.messageID || Date.now() + Math.random()),
              senderId: item.fromUser.userID,
              senderName: item.fromUser.userName || 'User',
              text: item.message,
              time: new Date(item.sendTime || Date.now()).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              isMe: item.fromUser.userID === myUserIdRef.current,
            };

            setChatMessages((prev) => [...prev, newMsg]);
            setActiveTab((currentTab) => {
              if (currentTab !== 'chat') {
                setUnreadChatCount((count) => count + 1);
              }
              return currentTab;
            });
          }
        });

        // Event: Audio energy / sound level monitoring
        zg.setSoundLevelDelegate(true, 300);
        zg.on('capturedSoundLevelUpdate', (soundLevel: unknown) => {
          const lvl = typeof soundLevel === 'number' ? soundLevel : 0;
          setSpeakingUserIds((prev) => {
            const next = new Set(prev);
            if (lvl > 10) {
              next.add(myUserIdRef.current);
            } else {
              next.delete(myUserIdRef.current);
            }
            return next;
          });
        });

        zg.on('soundLevelUpdate', (soundLevelList: unknown) => {
          const list = soundLevelList as Array<{ streamID: string; soundLevel: number }>;
          setSpeakingUserIds((prev) => {
            const next = new Set(prev);
            for (const item of list) {
              const matchedStream = remoteStreams.find((s) => s.streamID === item.streamID);
              if (matchedStream) {
                if (item.soundLevel > 10) {
                  next.add(matchedStream.userID);
                } else {
                  next.delete(matchedStream.userID);
                }
              }
            }
            return next;
          });
        });

        // 4. Log in to Zego Room
        const isLogged = await zg.loginRoom(
          effectiveRoomId,
          token,
          { userID: user_id, userName: myUserNameRef.current },
          { userUpdate: true }
        );

        if (!isLogged) {
          setErrorMsg('Failed to enter the live room.');
          setConnectionState('error');
          return;
        }

        // 5. Create local stream (audio by default, video disabled initially)
        try {
          const localStream = await zg.createStream({
            camera: { video: false, audio: true },
          });
          localStreamRef.current = localStream;

          // Publish local audio stream
          const pubStreamID = `st_${user_id}_${Date.now()}`;
          publishStreamIDRef.current = pubStreamID;
          zg.startPublishingStream(pubStreamID, localStream);
        } catch (mediaErr) {
          console.warn('Microphone permission or capture error:', mediaErr);
        }

        if (isCancelled) return;
        setConnectionState('connected');
      } catch (err: unknown) {
        console.error('Zego initialization failed:', err);
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : 'Failed to connect to live room.';
          setErrorMsg(message);
          setConnectionState('error');
        }
      }
    }

    initSession();

    return () => {
      isCancelled = true;
      teardownZego();
    };
  }, [effectiveRoomId, teardownZego]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Microphone toggle
  const handleToggleMic = async () => {
    const zg = zegoEngineRef.current;
    const localStream = localStreamRef.current;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted;
      });
      if (zg) {
        zg.mutePublishStreamAudio(localStream, nextMuted);
      }
    }

    if (effectiveRoomId) {
      updateParticipantState(effectiveRoomId, { is_muted: nextMuted });
      if (zg) {
        zg.sendBroadcastMessage(
          effectiveRoomId,
          JSON.stringify({
            type: 'MEDIA_STATE',
            userId: myUserIdRef.current,
            is_muted: nextMuted,
            is_cam_on: isCamOn,
          })
        ).catch(() => {});
      }
    }
  };

  // Camera toggle
  const handleToggleCam = async () => {
    const zg = zegoEngineRef.current;
    let localStream = localStreamRef.current;
    const nextCamOn = !isCamOn;

    try {
      if (!nextCamOn) {
        // Turn off camera
        if (localStream) {
          localStream.getVideoTracks().forEach((track) => {
            track.enabled = false;
          });
          if (zg) {
            zg.mutePublishStreamVideo(localStream, true);
          }
        }
        setIsCamOn(false);
      } else {
        // Turn on camera
        if (localStream && localStream.getVideoTracks().length > 0) {
          localStream.getVideoTracks().forEach((track) => {
            track.enabled = true;
          });
          if (zg) {
            zg.mutePublishStreamVideo(localStream, false);
          }
        } else if (zg) {
          // Acquire video track from user media
          const userMedia = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          const videoTrack = userMedia.getVideoTracks()[0];
          if (localStream && videoTrack) {
            localStream.addTrack(videoTrack);
            zg.mutePublishStreamVideo(localStream, false);
          }
        }
        setIsCamOn(true);
      }

      if (effectiveRoomId) {
        updateParticipantState(effectiveRoomId, { is_cam_on: nextCamOn });
        if (zg) {
          zg.sendBroadcastMessage(
            effectiveRoomId,
            JSON.stringify({
              type: 'MEDIA_STATE',
              userId: myUserIdRef.current,
              is_muted: isMuted,
              is_cam_on: nextCamOn,
            })
          ).catch(() => {});
        }
      }
    } catch (camErr) {
      console.warn('Camera access denied or unavailable:', camErr);
      setErrorMsg('Camera access was denied or is unavailable on this device.');
      setIsCamOn(false);
    }
  };

  // Role toggle: Speaker <-> Listener
  const handleToggleRole = async () => {
    const zg = zegoEngineRef.current;
    const localStream = localStreamRef.current;
    if (myRole === 'host') return; // Host remains host

    if (myRole === 'speaker') {
      // Switch to Listener
      setMyRole('listener');
      setIsMuted(true);
      setIsCamOn(false);

      if (localStream && zg && publishStreamIDRef.current) {
        zg.stopPublishingStream(publishStreamIDRef.current);
        publishStreamIDRef.current = null;
      }

      if (effectiveRoomId) {
        updateParticipantState(effectiveRoomId, {
          role: 'listener',
          is_muted: true,
          is_cam_on: false,
        });
      }
    } else {
      // Switch to Speaker
      setMyRole('speaker');
      setIsMuted(false);

      if (localStream && zg && !publishStreamIDRef.current) {
        const pubStreamID = `st_${myUserIdRef.current}_${Date.now()}`;
        publishStreamIDRef.current = pubStreamID;
        zg.startPublishingStream(pubStreamID, localStream);
      }

      if (effectiveRoomId) {
        updateParticipantState(effectiveRoomId, { role: 'speaker', is_muted: false });
      }
    }
  };

  // Send Broadcast Chat Message
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const zg = zegoEngineRef.current;
    const messageText = chatInput.trim();
    setChatInput('');

    const newMsg: ChatMessage = {
      id: String(Date.now()),
      senderId: myUserIdRef.current,
      senderName: myUserNameRef.current,
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setChatMessages((prev) => [...prev, newMsg]);

    if (zg && effectiveRoomId) {
      try {
        await zg.sendBroadcastMessage(effectiveRoomId, messageText);
      } catch (chatErr) {
        console.warn('Failed to broadcast chat message:', chatErr);
      }
    }
  };

  // Kick participant (Host-only)
  const handleConfirmKick = async () => {
    if (!pendingRemoveUser || !effectiveRoomId) return;
    const target = pendingRemoveUser;
    setPendingRemoveUser(null);

    const zg = zegoEngineRef.current;
    if (zg) {
      zg.sendBroadcastMessage(
        effectiveRoomId,
        JSON.stringify({ type: 'KICK_USER', targetUserId: target.user_id })
      ).catch(() => {});
    }

    await kickParticipant(effectiveRoomId, target.user_id);
    setParticipants((prev) => prev.filter((p) => p.user_id !== target.user_id));
  };

  // End room (Host-only) or Leave room (Participant)
  const handleLeaveOrEnd = async () => {
    if (leavingRef.current) return;

    if (room?.is_host && !showConfirmEnd) {
      setShowConfirmEnd(true);
      return;
    }

    leavingRef.current = true;
    setShowConfirmEnd(false);

    const zg = zegoEngineRef.current;
    if (room?.is_host) {
      if (zg && effectiveRoomId) {
        zg.sendBroadcastMessage(effectiveRoomId, JSON.stringify({ type: 'ROOM_ENDED' })).catch(
          () => {}
        );
      }
      await endLiveRoom(effectiveRoomId);
    } else {
      await leaveLiveRoom(effectiveRoomId);
    }

    await teardownZego();
    router.replace('/live');
  };

  const handleNoticeClose = () => {
    setNotice(null);
    router.replace('/live');
  };

  // Calculate dynamic grid CSS class
  const totalCount = 1 + remoteStreams.length;
  const gridLayoutClass =
    totalCount === 1
      ? styles.gridSingle
      : totalCount === 2
      ? styles.gridTwo
      : totalCount <= 4
      ? styles.gridFour
      : styles.gridMulti;

  return (
    <div className={styles.root}>
      {/* Top Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={handleLeaveOrEnd}
            aria-label={room?.is_host ? 'End Room' : 'Leave Room'}
          >
            <ChevronLeftIcon style={{ width: '20px', height: '20px' }} />
          </button>
          <div className={styles.roomInfo}>
            <h1 className={styles.roomTitle}>{room?.title || 'Live Voice Room'}</h1>
            <p className={styles.topicSubtitle}>
              <span>{room?.topic || 'General Practice'}</span>
              <span>•</span>
              <span>Hosted by {room?.host_name || 'Host'}</span>
            </p>
          </div>
        </div>

        <div className={styles.headerRight}>
          {room?.is_host && <span className={styles.hostBadge}>HOST</span>}
          <div className={styles.liveBadge}>
            <span className={styles.liveDot} />
            <span>LIVE</span>
          </div>
        </div>
      </header>

      {/* Main Stage & Drawers */}
      <div className={styles.mainContainer}>
        {/* Stage with Video Grid */}
        <main className={styles.stage}>
          {errorMsg && (
            <div className={styles.errorBanner}>
              {errorMsg}
              <button
                onClick={() => setErrorMsg(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  marginLeft: '12px',
                  cursor: 'pointer',
                }}
              >
                &times;
              </button>
            </div>
          )}

          <div className={`${styles.videoGrid} ${gridLayoutClass}`}>
            {/* Local participant tile */}
            <VideoTile
              stream={localStreamRef.current}
              name={myUserNameRef.current}
              role={myRole}
              isHost={!!room?.is_host}
              isMe={true}
              isCamOn={isCamOn}
              isMuted={isMuted}
              isSpeaking={speakingUserIds.has(myUserIdRef.current)}
              tone={room?.is_host ? 'gold' : 'blue'}
            />

            {/* Remote participants video tiles */}
            {remoteStreams.map((rStream) => {
              const matchedParticipant = participants.find((p) => p.user_id === rStream.userID);
              const isRemoteHost = rStream.userID === room?.host_id;

              return (
                <VideoTile
                  key={rStream.streamID}
                  stream={rStream.stream}
                  name={rStream.userName}
                  role={isRemoteHost ? 'host' : matchedParticipant?.role || 'speaker'}
                  isHost={isRemoteHost}
                  isMe={false}
                  isCamOn={rStream.isCamOn}
                  isMuted={rStream.isMuted}
                  isSpeaking={speakingUserIds.has(rStream.userID)}
                  tone={isRemoteHost ? 'gold' : 'blue'}
                />
              );
            })}
          </div>
        </main>

        {/* Side Drawer: Chat */}
        {activeTab === 'chat' && (
          <aside className={styles.sideDrawer} aria-label="Room live chat">
            <div className={styles.drawerHeader}>
              <h2 className={styles.drawerTitle}>Live Chat</h2>
              <button
                type="button"
                className={styles.drawerCloseBtn}
                onClick={() => setActiveTab('none')}
                aria-label="Close chat"
              >
                &times;
              </button>
            </div>

            <div className={styles.chatBody}>
              <div className={styles.chatMessages}>
                {chatMessages.length === 0 ? (
                  <p className={styles.chatEmpty}>
                    No messages yet. Send a greeting to everyone in the room!
                  </p>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`${styles.chatBubble} ${
                        msg.isMe ? styles.chatBubbleMe : styles.chatBubbleOther
                      }`}
                    >
                      {!msg.isMe && <span className={styles.chatSender}>{msg.senderName}</span>}
                      <div
                        className={`${styles.chatText} ${
                          msg.isMe ? styles.chatTextMe : styles.chatTextOther
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className={styles.chatTime}>{msg.time}</span>
                    </div>
                  ))
                )}
                <div ref={chatBottomRef} />
              </div>

              <form onSubmit={handleSendChat} className={styles.chatInputContainer}>
                <input
                  type="text"
                  className={styles.chatInput}
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  maxLength={500}
                />
                <button
                  type="submit"
                  className={styles.chatSendBtn}
                  disabled={!chatInput.trim()}
                  aria-label="Send message"
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
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            </div>
          </aside>
        )}

        {/* Side Drawer: Participants */}
        {activeTab === 'participants' && (
          <aside className={styles.sideDrawer} aria-label="Room participants list">
            <div className={styles.drawerHeader}>
              <h2 className={styles.drawerTitle}>
                Participants ({participants.length || totalCount})
              </h2>
              <button
                type="button"
                className={styles.drawerCloseBtn}
                onClick={() => setActiveTab('none')}
                aria-label="Close participants"
              >
                &times;
              </button>
            </div>

            <div className={styles.participantsList}>
              {/* Myself */}
              <div className={styles.participantRow}>
                <div className={styles.participantLeft}>
                  <Avatar name={myUserNameRef.current} size={36} tone={room?.is_host ? 'gold' : 'blue'} />
                  <div className={styles.participantText}>
                    <span className={styles.participantName}>
                      {myUserNameRef.current} (You)
                    </span>
                    <span className={styles.participantRole}>
                      {room?.is_host ? 'Host' : myRole}
                    </span>
                  </div>
                </div>
                <div>
                  {isMuted ? (
                    <MicOffIcon style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                  ) : (
                    <MicIcon style={{ width: '16px', height: '16px', color: '#10b981' }} />
                  )}
                </div>
              </div>

              {/* Other participants */}
              {participants
                .filter((p) => p.user_id !== myUserIdRef.current)
                .map((p) => (
                  <div key={p.user_id} className={styles.participantRow}>
                    <div className={styles.participantLeft}>
                      <Avatar name={p.name} size={36} tone={p.user_id === room?.host_id ? 'gold' : 'blue'} />
                      <div className={styles.participantText}>
                        <span className={styles.participantName}>{p.name}</span>
                        <span className={styles.participantRole}>
                          {p.user_id === room?.host_id ? 'Host' : p.role || 'Speaker'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {room?.is_host && p.user_id !== room?.host_id && (
                        <button
                          type="button"
                          className={styles.kickBtn}
                          onClick={() => setPendingRemoveUser(p)}
                          title={`Remove ${p.name}`}
                        >
                          <MinusCircleIcon style={{ width: '14px', height: '14px' }} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </aside>
        )}
      </div>

      {/* Footer Controls Toolbar */}
      <footer className={styles.footer} role="toolbar" aria-label="Room controls">
        <div className={styles.toolbarGroup}>
          {/* Mute / Unmute */}
          <button
            type="button"
            className={`${styles.controlBtn} ${isMuted ? styles.controlBtnMuted : styles.controlBtnActive}`}
            onClick={handleToggleMic}
            aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? (
              <MicOffIcon style={{ width: '20px', height: '20px' }} />
            ) : (
              <MicIcon style={{ width: '20px', height: '20px' }} />
            )}
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          {/* Camera On / Off */}
          <button
            type="button"
            className={`${styles.controlBtn} ${isCamOn ? styles.controlBtnActive : ''}`}
            onClick={handleToggleCam}
            aria-label={isCamOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isCamOn ? (
              <VideoIcon style={{ width: '20px', height: '20px' }} />
            ) : (
              <VideoOffIcon style={{ width: '20px', height: '20px' }} />
            )}
            <span>{isCamOn ? 'Cam On' : 'Cam Off'}</span>
          </button>

          {/* Speaker / Listener Toggle */}
          {!room?.is_host && (
            <button
              type="button"
              className={`${styles.controlBtn} ${myRole === 'speaker' ? styles.controlBtnActive : ''}`}
              onClick={handleToggleRole}
              aria-label="Switch between speaker and listener"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              <span>{myRole === 'speaker' ? 'Speaking' : 'Listening'}</span>
            </button>
          )}

          {/* Participants Drawer Toggle */}
          <button
            type="button"
            className={`${styles.controlBtn} ${activeTab === 'participants' ? styles.controlBtnActive : ''}`}
            onClick={() => setActiveTab((prev) => (prev === 'participants' ? 'none' : 'participants'))}
            aria-label="View participants"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Users</span>
          </button>

          {/* Chat Drawer Toggle */}
          <button
            type="button"
            className={`${styles.controlBtn} ${activeTab === 'chat' ? styles.controlBtnActive : ''}`}
            onClick={() => {
              setActiveTab((prev) => (prev === 'chat' ? 'none' : 'chat'));
              setUnreadChatCount(0);
            }}
            aria-label="Toggle chat"
          >
            {unreadChatCount > 0 && <span className={styles.chatBadge}>{unreadChatCount}</span>}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Chat</span>
          </button>

          {/* Leave / End Room */}
          <button
            type="button"
            className={styles.leaveBtn}
            onClick={handleLeaveOrEnd}
            aria-label={room?.is_host ? 'End room for everyone' : 'Leave room'}
          >
            <ExitIcon style={{ width: '18px', height: '18px' }} />
            <span>{room?.is_host ? 'End Room' : 'Leave'}</span>
          </button>
        </div>
      </footer>

      {/* Connecting Overlay */}
      {connectionState === 'connecting' && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
          <h2 className={styles.loadingText}>Joining Live Room...</h2>
          <p className={styles.loadingSubtext}>
            Securing ZegoCloud token & initializing audio/video streams...
          </p>
        </div>
      )}

      {/* Confirmation Dialogs */}
      {pendingRemoveUser && (
        <RoomDialog
          variant="confirm-remove"
          targetName={pendingRemoveUser.name}
          onConfirm={handleConfirmKick}
          onCancel={() => setPendingRemoveUser(null)}
          onClose={() => setPendingRemoveUser(null)}
        />
      )}

      {showConfirmEnd && (
        <RoomDialog
          variant="confirm-end"
          onConfirm={handleLeaveOrEnd}
          onCancel={() => setShowConfirmEnd(false)}
          onClose={() => setShowConfirmEnd(false)}
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
