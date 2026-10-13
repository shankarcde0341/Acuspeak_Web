'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  getLiveRooms,
  joinLiveRoom,
  type LiveRoomSummary,
} from '@/services/roomService';
import { isLoggedIn } from '@/services/authService';
import { Avatar } from './Avatar';
import { CreateRoomModal } from './CreateRoomModal';
import styles from '@/app/(dashboard)/live/LivePage.module.css';

interface LiveDashboardClientProps {
  initialRooms: LiveRoomSummary[];
}

const FILTER_TOPICS = [
  'All',
  'Daily English',
  'Business English',
  'Interview English',
  'IELTS / TOEFL',
  'Casual Chat',
  'Debate & Discussions',
];

export function LiveDashboardClient({ initialRooms }: LiveDashboardClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [rooms, setRooms] = useState<LiveRoomSummary[]>(initialRooms);
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const fetchRooms = useCallback(
    async (topic: string) => {
      setIsLoading(true);
      setErrorBanner(null);

      const res = await getLiveRooms({
        topic: topic === 'All' ? undefined : topic,
      });

      setIsLoading(false);
      if (res.error) {
        setErrorBanner(res.error);
      } else {
        setRooms(res.rooms);
      }
    },
    []
  );

  useEffect(() => {
    fetchRooms(selectedTopic);
  }, [selectedTopic, fetchRooms]);

  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
  };

  const handleJoinClick = async (roomId: string) => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }

    setJoiningRoomId(roomId);
    setErrorBanner(null);

    const res = await joinLiveRoom(roomId);
    if (!res.success) {
      setJoiningRoomId(null);
      setErrorBanner(res.error || 'Failed to join the room.');
      return;
    }

    startTransition(() => {
      router.push(`/live/room/${roomId}`);
    });
  };

  const handleRoomCreated = (roomId: string) => {
    setIsModalOpen(false);
    startTransition(() => {
      router.push(`/live/room/${roomId}`);
    });
  };

  return (
    <div className={styles.container}>
      {/* Header and Create Button */}
      <div className={styles.headerRow}>
        <div className={styles.header}>
          <h1 className={styles.title}>Live Rooms</h1>
          <p className={styles.subtitle}>
            Join real-time interactive audio & video conversation rooms to accelerate your English fluency.
          </p>
        </div>
        <button
          type="button"
          className={styles.createButton}
          onClick={() => {
            if (!isLoggedIn()) {
              router.push('/login');
              return;
            }
            setIsModalOpen(true);
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Room
        </button>
      </div>

      {/* Controls Bar: Topic Filters & Refresh */}
      <div className={styles.controlsBar}>
        <div className={styles.topicFilters} role="tablist" aria-label="Topic categories">
          {FILTER_TOPICS.map((topic) => (
            <button
              type="button"
              key={topic}
              role="tab"
              aria-selected={selectedTopic === topic}
              className={`${styles.filterChip} ${selectedTopic === topic ? styles.filterChipActive : ''
                }`}
              onClick={() => handleTopicChange(topic)}
            >
              {topic}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          onClick={() => fetchRooms(selectedTopic)}
          title="Refresh room list"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Refresh
        </button>
      </div>

      {errorBanner && (
        <div
          style={{
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#be123c',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '14px',
            fontFamily: 'var(--font-manrope), sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{errorBanner}</span>
          <button
            onClick={() => setErrorBanner(null)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#be123c',
              fontWeight: 700,
            }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Live Badge & Counter */}
      <div className={styles.kickerRow}>
        <div className={styles.kicker}>
          Live Now ({rooms.length} {rooms.length === 1 ? 'room' : 'rooms'})
        </div>
      </div>

      {/* Room Grid / Skeletons / Empty */}
      {isLoading ? (
        <div className={styles.grid}>
          {[1, 2, 3].map((n) => (
            <div key={n} className={styles.skeletonCard}>
              <div className={styles.skeletonBar} style={{ width: '40%' }} />
              <div className={styles.skeletonBar} style={{ width: '85%', height: '24px' }} />
              <div className={styles.skeletonBar} style={{ width: '60%' }} />
              <div
                className={styles.skeletonBar}
                style={{ width: '100%', height: '40px', marginTop: 'auto' }}
              />
            </div>
          ))}
        </div>
      ) : rooms.length > 0 ? (
        <div className={styles.grid}>
          {rooms.map((room) => {
            const isJoining = joiningRoomId === room.room_id;
            const isCapacityFull = room.participant_count >= room.max_participants;

            return (
              <div key={room.room_id} className={styles.card}>
                <div className={styles.topRow}>
                  {room.is_host ? (
                    <span className={styles.hostChip}>Your Room</span>
                  ) : (
                    <span className={styles.topicChip}>{room.topic}</span>
                  )}
                  <span className={styles.liveBadge}>
                    <span className={styles.liveDot} />
                    LIVE
                  </span>
                </div>

                <h3 className={styles.cardTitle}>{room.title}</h3>

                {room.description ? (
                  <p className={styles.cardDescription}>{room.description}</p>
                ) : (
                  <p className={styles.cardDescription} style={{ fontStyle: 'italic' }}>
                    Open speaking room for active practice and discussion.
                  </p>
                )}

                <div className={styles.hostedRow}>
                  <Avatar name={room.host_name} size={36} tone={room.is_host ? 'gold' : 'blue'} />
                  <div className={styles.hostedDetails}>
                    <span className={styles.hostedText}>{room.host_name}</span>
                    <span className={styles.hostLabel}>Host</span>
                  </div>
                </div>

                <div className={styles.capacityRow}>
                  <span className={styles.countText}>
                    <svg
                      width="15"
                      height="15"
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
                    {room.participant_count} / {room.max_participants} joined
                  </span>
                  {isCapacityFull && (
                    <span
                      style={{
                        fontSize: '11px',
                        color: '#e11d48',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      Full
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  className={`${styles.joinButton} ${room.is_host ? styles.enterHostButton : ''
                    }`}
                  onClick={() => handleJoinClick(room.room_id)}
                  disabled={isJoining || (!room.is_host && isCapacityFull)}
                >
                  {isJoining ? (
                    'Connecting...'
                  ) : room.is_host ? (
                    'Enter Your Room'
                  ) : isCapacityFull ? (
                    'Room Full'
                  ) : (
                    'Join Room'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎙️</div>
          <h3 className={styles.emptyTitle}>No live rooms available</h3>
          <p className={styles.emptySubtitle}>
            {selectedTopic !== 'All'
              ? 'No active rooms match this topic. Try selecting All or create a new room.'
              : 'There are currently no active speaking rooms. Create the first room to start practicing!'}
          </p>
          <button
            type="button"
            className={styles.createButton}
            onClick={() => {
              if (!isLoggedIn()) {
                router.push('/login');
                return;
              }
              setIsModalOpen(true);
            }}
          >
            Create the First Room
          </button>
        </div>
      )}

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleRoomCreated}
      />
    </div>
  );
}
