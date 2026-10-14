import {
  getLiveRooms,
  getLiveRoomDetail,
  getLiveZegoToken,
  leaveLiveRoom,
  endLiveRoom,
  kickParticipant,
  updateParticipantState,
  type LiveRoomSummary,
  type LiveRoomDetail,
  type LiveRoomParticipant,
} from '@/services/roomService';

export type RoomParticipant = LiveRoomParticipant;
export type Room = LiveRoomSummary;
export type RoomDetail = LiveRoomDetail;

export {
  getLiveRooms,
  getLiveRoomDetail,
  getLiveZegoToken,
  leaveLiveRoom,
  endLiveRoom,
  kickParticipant,
  updateParticipantState,
};

export async function getRooms(): Promise<Room[]> {
  try {
    const res = await getLiveRooms();
    return res.rooms || [];
  } catch {
    return [];
  }
}

export async function getRoom(roomId: string): Promise<RoomDetail | null> {
  try {
    return await getLiveRoomDetail(roomId);
  } catch {
    return null;
  }
}

export async function leaveRoom(roomId: string): Promise<void> {
  await leaveLiveRoom(roomId);
}

export async function endRoom(roomId: string): Promise<void> {
  await endLiveRoom(roomId);
}

export async function removeParticipant(roomId: string, userId: string): Promise<void> {
  await kickParticipant(roomId, userId);
}

import { API_BASE_URL } from '@/services/apiConfig';

export async function recordRoomParticipation(roomId: string, title?: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/rooms/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ room_id: roomId, title }),
    });
  } catch {
    // Non-blocking telemetry
  }
}
