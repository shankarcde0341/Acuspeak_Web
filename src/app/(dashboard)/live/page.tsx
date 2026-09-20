import type { Metadata } from 'next';
import Link from 'next/link';
import { getRooms } from '@/lib/rooms';
import { Avatar } from '@/components/live/Avatar';
import styles from './LivePage.module.css';

export const metadata: Metadata = {
  title: 'Live rooms — Acuspeak',
};

export default async function LivePage() {
  const rooms = await getRooms();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Live</h1>
        <p className={styles.subtitle}>
          Join a live voice room and practice speaking with others.
        </p>
      </header>

      <div className={styles.kicker}>Live now ({rooms.length})</div>

      {rooms.length > 0 ? (
        <div className={styles.grid}>
          {rooms.map((room) => (
            <div key={room.room_id} className={styles.card}>
              <div className={styles.topRow}>
                {room.is_host ? (
                  <span className={styles.hostChip}>Your room</span>
                ) : (
                  <span className={styles.topicChip}>{room.topic}</span>
                )}
                <span className={styles.liveBadge}>
                  <span className={styles.liveDot} />
                  LIVE
                </span>
              </div>

              <h3 className={styles.cardTitle}>{room.title}</h3>

              <div className={styles.hostedRow}>
                <Avatar name={room.host_name} size={38} tone="gold" />
                <span className={styles.hostedText}>
                  Hosted by {room.host_name}
                </span>
              </div>

              <p className={styles.countText}>
                {room.participant_count} in the room
              </p>

              <Link
                href={`/live/room/${room.room_id}`}
                className={styles.joinButton}
              >
                {room.is_host ? 'Enter room' : 'Join room'}
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>No live rooms available right now.</p>
      )}
    </div>
  );
}
