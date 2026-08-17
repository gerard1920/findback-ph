export type MessageType = "TEXT" | "IMAGE" | "FILE" | "VOICE" | "CALL";

export interface Reaction {
  id: string;
  userId: string;
  emoji: string;
  createdAt?: string;
}

export interface ReplyRef {
  id: string;
  type: string;
  body: string;
  senderId: string;
  senderName: string | null;
}

export interface Sender {
  displayName: string;
  username: string;
  avatarUrl: string | null;
}

export interface AttachmentMeta {
  url: string;
  name: string;
  size: number;
  mime: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: Sender | null;
  type: MessageType;
  body: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentSize: number | null;
  attachmentMime: string | null;
  durationSeconds: number | null;
  replyToId: string | null;
  replyTo: ReplyRef | null;
  reactions: Reaction[];
  status: string;
  deliveredAt: string | null;
  readAt: string | null;
  deletedAt: string | null;
  createdAt: string;
}

export interface ConversationUser {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
}

export interface Conversation {
  id: string;
  item_id: string | null;
  item_title: string | null;
  title: string;
  other_user: ConversationUser | null;
  other_user_id: string;
  created_at: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number;
  pinned: boolean;
}

export interface ConversationData {
  id: string;
  itemId: string | null;
  otherUser: ConversationUser | null;
  itemTitle: string | null;
  pinned: boolean;
}

export interface ConversationPage {
  conversation: ConversationData;
  messages: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface Me {
  id: string;
  email: string;
  displayName: string;
  username: string;
  role: string;
  status: string;
  avatarUrl: string | null;
}

export interface PresenceState {
  online: boolean;
  typing: boolean;
  lastSeen: string | null;
}

export const TYPING_TIMEOUT_MS = 9000;
export const TYPING_THROTTLE_MS = 500;
