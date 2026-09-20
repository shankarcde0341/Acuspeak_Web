export interface Partner {
  user_id: string;
  name: string;
  country: string;
  gender: 'male' | 'female';
  room_id: string;
}

export interface FeedbackPayload {
  room_id?: string;
  target_user_id?: string;
  rating: number;
  comment?: string;
}

export interface CallLogPayload {
  partner_name: string;
  duration_seconds: number;
  partner_gender: string;
}

export async function getMatchedPartner(): Promise<Partner> {
  return {
    user_id: 'demo-partner-1',
    name: 'Priya Nair',
    country: 'India',
    gender: 'female',
    room_id: 'demo-room-1',
  };
}

export async function endCallSession(roomId?: string): Promise<void> {
  void roomId;
}

export async function submitCallFeedback(payload: FeedbackPayload): Promise<void> {
  void payload;
}

export async function logCall(payload: CallLogPayload): Promise<void> {
  void payload;
}

export async function reportUser(name: string, reason?: string): Promise<void> {
  void name;
  void reason;
}

export async function blockUser(name: string): Promise<void> {
  void name;
}

export async function sendFriendRequest(name: string): Promise<void> {
  void name;
}
