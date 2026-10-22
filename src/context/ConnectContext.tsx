import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  User,
  Channel,
  Message,
  ExpenseSummary,
  ChannelCategory,
  ExpenseData,
  MessageType,
  BackgroundSettings,
  AttachmentData,
  PollData,
  ContactData,
} from '../types';
import { INITIAL_USERS, INITIAL_CHANNELS, INITIAL_MESSAGES } from '../data/seedData';
import { StickerItem, INITIAL_STICKERS } from '../data/stickersData';
import { apiService } from '../services/api.ts';

interface ConnectContextType {
  currentUser: User;
  partnerUser: User;
  setCurrentUserId: (id: string) => void;
  updateUserStatus: (statusText: string, state: User['statusState']) => void;
  updateUserProfile: (data: Partial<User>) => void;
  stickers: StickerItem[];
  enabledStickerIds: string[];
  toggleStickerToShow: (id: string) => void;
  setAllStickersToShow: (enabled: boolean) => void;
  addCustomSticker: (sticker: { name: string; url: string; emojiBadge?: string }) => void;
  removeCustomSticker: (id: string) => void;
  channels: Channel[];
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
  activeChannel: Channel | undefined;
  activeMessages: Message[];
  createChannel: (data: {
    name: string;
    description: string;
    category: ChannelCategory;
    icon: string;
    currency?: string;
  }) => string;
  togglePinChannel: (id: string) => void;
  deleteChannel: (id: string) => void;
  sendMessage: (args: {
    content: string;
    type?: MessageType;
    isImportant?: boolean;
    expense?: ExpenseData;
    meeting?: any;
    attachment?: AttachmentData;
    poll?: PollData;
    contact?: ContactData;
    stickerUrl?: string;
    overrideSenderId?: string;
  }) => void;
  votePoll: (messageId: string, optionId: string) => void;
  toggleImportantMessage: (messageId: string) => void;
  togglePinMessageInChat: (messageId: string) => void;
  deleteMessage: (messageId: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  markExpenseSettled: (messageId: string) => void;
  settleAllChannelExpenses: (channelId: string) => void;
  getChannelExpenseSummary: (channelId: string) => ExpenseSummary;
  simulatePartnerReply: (customText?: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  channelFilter: ChannelCategory | 'all' | 'pinned';
  setChannelFilter: (filter: ChannelCategory | 'all' | 'pinned') => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  isAuthenticated: boolean;
  login: (emailOrUser: string | 'alex' | 'jordan', password?: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;
  resetToDefaults: () => void;
  customBackgrounds: Record<string, BackgroundSettings>;
  getChatBackground: (channelId?: string) => BackgroundSettings | null;
  setChatBackground: (target: string, settings: BackgroundSettings | null) => void;
}

const ConnectContext = createContext<ConnectContextType | undefined>(undefined);
