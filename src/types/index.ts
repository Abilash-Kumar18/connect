export type UserRole = 'partner_1' | 'partner_2';

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  statusText: string;
  statusState: 'online' | 'away' | 'busy' | 'offline';
  role: string;
}

export type ChannelCategory =
  | 'general'
  | 'expenses'
  | 'college'
  | 'meetings'
  | 'projects'
  | 'personal';

export interface Channel {
  id: string;
  name: string;
  description: string;
  category: ChannelCategory;
  icon: string;
  isPinned: boolean;
  pinnedAt?: number;
  createdAt: number;
  unreadCount: number;
  lastMessageSnippet?: string;
  lastMessageTimestamp?: number;
  currency?: string;
  colorTheme?: string;
}

export type MessageType = 'text' | 'expense' | 'meeting' | 'note';

export type SplitType = 'equally' | 'you_owe_full' | 'partner_owes_full';

export interface ExpenseData {
  amount: number;
  currency: string;
  category: string;
  title: string;
  paidBy: string; // userId
  splitWith: string; // userId
  splitType: SplitType;
  isSettled: boolean;
  settledAt?: number;
}

export interface MeetingData {
  title: string;
  date: string;
  time: string;
  location?: string;
  notes?: string;
  isCompleted?: boolean;
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  timestamp: number;
  type: MessageType;
  isImportant?: boolean;
  isPinnedInChat?: boolean;
  status: 'sent' | 'delivered' | 'read';
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  expense?: ExpenseData;
  meeting?: MeetingData;
}

export interface ExpenseSummary {
  totalAmount: number;
  user1Paid: number;
  user2Paid: number;
  netBalance: number; // positive = user2 owes user1, negative = user1 owes user2
  unsettledCount: number;
}

export interface BackgroundSettings {
  imageUrl: string;
  opacity: number; // 0.1 to 1.0 (default 0.35)
  blur: number; // 0 to 10 px
}

