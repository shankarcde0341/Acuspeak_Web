import { getCurrentUser } from './user';

export interface RoomParticipant {
  user_id: string;
  name: string;
}

export interface Room {
  room_id: string;
  title: string;
  topic: string;
  host_id: string;
  host_name: string;
  participant_count: number;
  is_host: boolean;
}

export interface RoomDetail extends Room {
  participants: RoomParticipant[];
}

export async function getRooms(): Promise<Room[]> {
  const currentUser = await getCurrentUser();

  const rooms: RoomDetail[] = [
    {
      room_id: 'demo-room-1',
      title: 'Morning small talk',
      topic: 'Daily English',
      host_id: 'host-1',
      host_name: 'Aarav Mehta',
      participant_count: 5,
      is_host: false,
      participants: [
        { user_id: 'host-1', name: 'Aarav Mehta' },
        { user_id: 'p-101', name: 'Ananya Sharma' },
        { user_id: 'p-102', name: 'Priya Patel' },
        { user_id: 'p-103', name: 'Vikram Singh' },
        { user_id: 'p-104', name: 'Kabir Das' },
      ],
    },
    {
      room_id: 'demo-room-2',
      title: 'Mock interview practice',
      topic: 'Interview English',
      host_id: 'host-2',
      host_name: 'Neha Kapoor',
      participant_count: 6,
      is_host: false,
      participants: [
        { user_id: 'host-2', name: 'Neha Kapoor' },
        { user_id: 'p-201', name: 'Rishabh Verma' },
        { user_id: 'p-202', name: 'Divya Gupta' },
        { user_id: 'p-203', name: 'Aditya Rao' },
        { user_id: 'p-204', name: 'Meera Nair' },
        { user_id: 'p-205', name: 'Siddharth Joshi' },
      ],
    },
    {
      room_id: 'demo-room-3',
      title: 'Pitch your idea',
      topic: 'Business English',
      host_id: 'host-3',
      host_name: 'Rohan Iyer',
      participant_count: 4,
      is_host: false,
      participants: [
        { user_id: 'host-3', name: 'Rohan Iyer' },
        { user_id: 'p-301', name: 'Kavya Menon' },
        { user_id: 'p-302', name: 'Tarun Deshmukh' },
        { user_id: 'p-303', name: 'Ishita Banerjee' },
      ],
    },
    {
      room_id: 'demo-room-4',
      title: 'Planning a trip',
      topic: 'Travel English',
      host_id: currentUser.id,
      host_name: currentUser.name,
      participant_count: 5,
      is_host: true,
      participants: [
        { user_id: currentUser.id, name: currentUser.name },
        { user_id: 'p-401', name: 'Arjun Reddy' },
        { user_id: 'p-402', name: 'Sanjana Chawla' },
        { user_id: 'p-403', name: 'Manish Pandey' },
        { user_id: 'p-404', name: 'Nisha Agarwal' },
      ],
    },
  ];

  return rooms.map(({ participants, ...summary }) => ({
    ...summary,
    participant_count: participants.length,
  }));
}

export async function getRoom(roomId: string): Promise<RoomDetail | null> {
  const currentUser = await getCurrentUser();

  const allRooms: RoomDetail[] = [
    {
      room_id: 'demo-room-1',
      title: 'Morning small talk',
      topic: 'Daily English',
      host_id: 'host-1',
      host_name: 'Aarav Mehta',
      participant_count: 5,
      is_host: false,
      participants: [
        { user_id: 'host-1', name: 'Aarav Mehta' },
        { user_id: 'p-101', name: 'Ananya Sharma' },
        { user_id: 'p-102', name: 'Priya Patel' },
        { user_id: 'p-103', name: 'Vikram Singh' },
        { user_id: 'p-104', name: 'Kabir Das' },
      ],
    },
    {
      room_id: 'demo-room-2',
      title: 'Mock interview practice',
      topic: 'Interview English',
      host_id: 'host-2',
      host_name: 'Neha Kapoor',
      participant_count: 6,
      is_host: false,
      participants: [
        { user_id: 'host-2', name: 'Neha Kapoor' },
        { user_id: 'p-201', name: 'Rishabh Verma' },
        { user_id: 'p-202', name: 'Divya Gupta' },
        { user_id: 'p-203', name: 'Aditya Rao' },
        { user_id: 'p-204', name: 'Meera Nair' },
        { user_id: 'p-205', name: 'Siddharth Joshi' },
      ],
    },
    {
      room_id: 'demo-room-3',
      title: 'Pitch your idea',
      topic: 'Business English',
      host_id: 'host-3',
      host_name: 'Rohan Iyer',
      participant_count: 4,
      is_host: false,
      participants: [
        { user_id: 'host-3', name: 'Rohan Iyer' },
        { user_id: 'p-301', name: 'Kavya Menon' },
        { user_id: 'p-302', name: 'Tarun Deshmukh' },
        { user_id: 'p-303', name: 'Ishita Banerjee' },
      ],
    },
    {
      room_id: 'demo-room-4',
      title: 'Planning a trip',
      topic: 'Travel English',
      host_id: currentUser.id,
      host_name: currentUser.name,
      participant_count: 5,
      is_host: true,
      participants: [
        { user_id: currentUser.id, name: currentUser.name },
        { user_id: 'p-401', name: 'Arjun Reddy' },
        { user_id: 'p-402', name: 'Sanjana Chawla' },
        { user_id: 'p-403', name: 'Manish Pandey' },
        { user_id: 'p-404', name: 'Nisha Agarwal' },
      ],
    },
  ];

  const found = allRooms.find((r) => r.room_id === roomId);
  if (!found) return null;

  return {
    ...found,
    participant_count: found.participants.length,
  };
}

export async function leaveRoom(_roomId: string): Promise<void> {
  // No-op async stub for leaving a room
}

export async function endRoom(_roomId: string): Promise<void> {
  // No-op async stub for ending a room
}

export async function removeParticipant(_roomId: string, _userId: string): Promise<void> {
  // No-op async stub for removing a participant
}
