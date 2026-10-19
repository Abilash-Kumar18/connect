import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { User, Channel, Message, ExpenseSummary, ChannelCategory, ExpenseData, MessageType, BackgroundSettings } from '../types';
import { INITIAL_USERS, INITIAL_CHANNELS, INITIAL_MESSAGES } from '../data/seedData';

interface ConnectContextType {
  currentUser: User;
  partnerUser: User;
  setCurrentUserId: (id: string) => void;
  updateUserStatus: (statusText: string, state: User['statusState']) => void;
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
    overrideSenderId?: string;
  }) => void;
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
  login: (asUser?: 'alex' | 'jordan') => void;
  logout: () => void;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;
  resetToDefaults: () => void;
  customBackgrounds: Record<string, BackgroundSettings>;
  getChatBackground: (channelId?: string) => BackgroundSettings | null;
  setChatBackground: (target: string, settings: BackgroundSettings | null) => void;
}

const ConnectContext = createContext<ConnectContextType | undefined>(undefined);

// Web Audio synthesizer for tactile UI sound without external audio files
const playSoundEffect = (type: 'send' | 'receive' | 'settle' | 'pop') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'send') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'receive') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } else if (type === 'settle') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.07);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch {
    // AudioContext blocked or not supported
  }
};

const STORAGE_KEYS = {
  USERS: 'connect_users_v2',
  CHANNELS: 'connect_channels_v2',
  MESSAGES: 'connect_messages_v2',
  ACTIVE_USER: 'connect_active_user_v2',
  ACTIVE_CHAN: 'connect_active_chan_v2',
  DARK_MODE: 'connect_dark_mode_v2',
  SOUND: 'connect_sound_v2',
  AUTH: 'connect_auth_state_v2',
  CHAT_BG: 'connect_chat_bg_v2',
};

const deduplicateMessages = (msgList: Message[]): Message[] => {
  const seenIds = new Set<string>();
  const result: Message[] = [];
  for (let i = 0; i < msgList.length; i++) {
    const m = msgList[i];
    if (!m || !m.id || seenIds.has(m.id)) continue;
    seenIds.add(m.id);

    // Filter out accidental duplicate messages with identical content within 2 seconds
    const prev = result[result.length - 1];
    if (
      prev &&
      prev.channelId === m.channelId &&
      prev.senderId === m.senderId &&
      prev.content === m.content &&
      Math.abs(prev.timestamp - m.timestamp) < 2000
    ) {
      continue;
    }

    result.push(m);
  }
  return result;
};

export const ConnectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Unique session/tab identifier to ignore self-broadcast messages
  const tabId = useMemo(() => `tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, []);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
    return saved !== null ? saved === 'true' : true;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
    return saved !== null ? saved === 'true' : true;
  });

  // Users state
  const [users, setUsers] = useState<Record<string, User>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.alex && parsed.alex.statusText === 'Focusing on final project prep 🎯') {
          parsed.alex.statusText = '';
        }
        return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserIdState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_USER) || 'alex';
  });

  // Channels state
  const [channels, setChannels] = useState<Channel[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHANNELS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((c: Channel) => ({
            ...c,
            currency: c.currency === '$' || !c.currency ? '₹' : c.currency,
            lastMessageSnippet: c.lastMessageSnippet?.replace(/\$/g, '₹') || c.lastMessageSnippet,
          }));
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_CHANNELS;
  });

  const [activeChannelId, setActiveChannelIdState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_CHAN);
    if (saved && channels.some((c) => c.id === saved)) return saved;
    return channels[0]?.id || 'chan_general';
  });

  // Messages state with deduplication
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const migrated = parsed.map((m: Message) => {
            if (m.expense && (m.expense.currency === '$' || !m.expense.currency)) {
              return {
                ...m,
                content: m.content ? m.content.replace(/\$/g, '₹') : m.content,
                expense: {
                  ...m.expense,
                  currency: '₹',
                },
              };
            }
            return m;
          });
          return deduplicateMessages(migrated);
        }
      } catch {
        // fallback
      }
    }
    return deduplicateMessages(INITIAL_MESSAGES);
  });

  // Navigation & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<ChannelCategory | 'all' | 'pinned'>('all');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Sync dark mode class with DOM
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(darkMode));
  }, [darkMode]);

  // Persist storage updates
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
  }, [channels]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAN, activeChannelId);
  }, [activeChannelId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND, String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH, String(isAuthenticated));
  }, [isAuthenticated]);

  // Chat Wallpaper background state
  const [customBackgrounds, setCustomBackgrounds] = useState<Record<string, BackgroundSettings>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHAT_BG);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHAT_BG, JSON.stringify(customBackgrounds));
  }, [customBackgrounds]);

  // Real-time multi-tab synchronization via BroadcastChannel
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('connect_duo_sync');
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const data = event.data;
      if (!data || data.senderTabId === tabId) return; // Prevent self-tab duplicate delivery

      if (data.type === 'NEW_MESSAGE' && data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) {
            return prev;
          }
          return [...prev, data.message];
        });
        if (soundEnabled && data.message.senderId !== currentUserId) {
          playSoundEffect('receive');
        }
      } else if (data.type === 'UPDATE_MESSAGES' && Array.isArray(data.messages)) {
        setMessages(deduplicateMessages(data.messages));
      } else if (data.type === 'UPDATE_CHANNELS' && Array.isArray(data.channels)) {
        setChannels(data.channels);
      } else if (data.type === 'UPDATE_USERS' && data.users) {
        setUsers(data.users);
      } else if (data.type === 'UPDATE_BACKGROUNDS' && data.backgrounds) {
        setCustomBackgrounds(data.backgrounds);
      }
    };

    return () => {
      channel.close();
      if (channelRef.current === channel) {
        channelRef.current = null;
      }
    };
  }, [currentUserId, soundEnabled, tabId]);

  const broadcastEvent = useCallback(
    (eventData: any) => {
      const payload = { ...eventData, senderTabId: tabId };
      if (channelRef.current) {
        try {
          channelRef.current.postMessage(payload);
          return;
        } catch {
          // ignore
        }
      }
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const bc = new BroadcastChannel('connect_duo_sync');
          bc.postMessage(payload);
          bc.close();
        } catch {
          // ignore
        }
      }
    },
    [tabId]
  );

  const currentUser = useMemo(() => users[currentUserId] || INITIAL_USERS.alex, [users, currentUserId]);
  const partnerUser = useMemo(() => {
    const partnerId = currentUserId === 'alex' ? 'jordan' : 'alex';
    return users[partnerId] || INITIAL_USERS.jordan;
  }, [users, currentUserId]);

  const setCurrentUserId = (id: string) => {
    setCurrentUserIdState(id);
    if (soundEnabled) playSoundEffect('pop');
  };

  const updateUserStatus = (statusText: string, state: User['statusState']) => {
    setUsers((prev) => {
      const next = {
        ...prev,
        [currentUserId]: {
          ...prev[currentUserId],
          statusText,
          statusState: state,
        },
      };
      broadcastEvent({ type: 'UPDATE_USERS', users: next });
      return next;
    });
  };

  const activeChannel = useMemo(
    () => channels.find((c) => c.id === activeChannelId),
    [channels, activeChannelId]
  );

  const activeMessages = useMemo(
    () => messages.filter((m) => m.channelId === activeChannelId),
    [messages, activeChannelId]
  );

  const setActiveChannelId = (id: string) => {
    setActiveChannelIdState(id);
    setIsMobileDrawerOpen(false);
    // Clear unread count for this channel
    setChannels((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c));
      broadcastEvent({ type: 'UPDATE_CHANNELS', channels: next });
      return next;
    });
    if (soundEnabled) playSoundEffect('pop');
  };

  const createChannel = ({
    name,
    description,
    category,
    icon,
    currency = '₹',
  }: {
    name: string;
    description: string;
    category: ChannelCategory;
    icon: string;
    currency?: string;
  }) => {
    const newChan: Channel = {
      id: `chan_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category,
      icon,
      isPinned: false,
      createdAt: Date.now(),
      unreadCount: 0,
      currency,
      lastMessageSnippet: 'Topic created. Start connecting!',
      lastMessageTimestamp: Date.now(),
    };

    setChannels((prev) => {
      const next = [newChan, ...prev];
      broadcastEvent({ type: 'UPDATE_CHANNELS', channels: next });
      return next;
    });

    setActiveChannelIdState(newChan.id);
    if (soundEnabled) playSoundEffect('settle');
    return newChan.id;
  };

  const togglePinChannel = (id: string) => {
    setChannels((prev) => {
      const next = prev.map((c) => {
        if (c.id === id) {
          const isPinned = !c.isPinned;
          return {
            ...c,
            isPinned,
            pinnedAt: isPinned ? Date.now() : undefined,
          };
        }
        return c;
      });
      broadcastEvent({ type: 'UPDATE_CHANNELS', channels: next });
      return next;
    });
    if (soundEnabled) playSoundEffect('pop');
  };

  const deleteChannel = (id: string) => {
    setChannels((prev) => {
      const next = prev.filter((c) => c.id !== id);
      broadcastEvent({ type: 'UPDATE_CHANNELS', channels: next });
      return next;
    });
    setMessages((prev) => {
      const next = prev.filter((m) => m.channelId !== id);
      broadcastEvent({ type: 'UPDATE_MESSAGES', messages: next });
      return next;
    });
    if (activeChannelId === id) {
      const remaining = channels.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        setActiveChannelIdState(remaining[0].id);
      }
    }
  };

  const sendMessage = ({
    content,
    type = 'text',
    isImportant = false,
    expense,
    meeting,
    overrideSenderId,
  }: {
    content: string;
    type?: MessageType;
    isImportant?: boolean;
    expense?: ExpenseData;
    meeting?: any;
    overrideSenderId?: string;
  }) => {
    const senderId = overrideSenderId || currentUserId;
    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      channelId: activeChannelId,
      senderId,
      content,
      timestamp: Date.now(),
      type,
      isImportant,
      isPinnedInChat: false,
      status: 'delivered',
      expense,
      meeting,
    };

    // Update messages
    setMessages((prev) => {
      if (prev.some((m) => m.id === newMsg.id)) {
        return prev;
      }
      return [...prev, newMsg];
    });
    broadcastEvent({ type: 'NEW_MESSAGE', message: newMsg });

    // Update channel snippet and timestamp
    setChannels((prev) => {
      const next = prev.map((c) => {
        if (c.id === activeChannelId) {
          let snippet = content;
          if (type === 'expense' && expense) {
            snippet = `💸 ${expense.title || 'Expense'}: ${expense.currency}${expense.amount.toFixed(2)}`;
          } else if (type === 'meeting' && meeting) {
            snippet = `📅 ${meeting.title || 'Meeting'}: ${meeting.date || ''}`;
          }
          return {
            ...c,
            lastMessageSnippet: snippet,
            lastMessageTimestamp: Date.now(),
          };
        }
        return c;
      });
      broadcastEvent({ type: 'UPDATE_CHANNELS', channels: next });
      return next;
    });

    if (soundEnabled) {
      if (senderId === currentUserId) {
        playSoundEffect('send');
      } else {
        playSoundEffect('receive');
      }
    }
  };

  const toggleImportantMessage = (messageId: string) => {
    setMessages((prev) => {
      const next = prev.map((m) => (m.id === messageId ? { ...m, isImportant: !m.isImportant } : m));
      broadcastEvent({ type: 'UPDATE_MESSAGES', messages: next });
      return next;
    });
    if (soundEnabled) playSoundEffect('pop');
  };

  const togglePinMessageInChat = (messageId: string) => {
    setMessages((prev) => {
      const next = prev.map((m) => (m.id === messageId ? { ...m, isPinnedInChat: !m.isPinnedInChat } : m));
      broadcastEvent({ type: 'UPDATE_MESSAGES', messages: next });
      return next;
    });
    if (soundEnabled) playSoundEffect('pop');
  };

  const deleteMessage = (messageId: string) => {
    setMessages((prev) => {
      const next = prev.filter((m) => m.id !== messageId);
      broadcastEvent({ type: 'UPDATE_MESSAGES', messages: next });
      return next;
    });
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages((prev) => {
      const next = prev.map((m) => {
        if (m.id === messageId) {
          const reactions = { ...(m.reactions || {}) };
          const userList = reactions[emoji] || [];
          if (userList.includes(currentUserId)) {
            // Remove reaction
            const filtered = userList.filter((id) => id !== currentUserId);
            if (filtered.length === 0) {
              delete reactions[emoji];
            } else {
              reactions[emoji] = filtered;
            }
          } else {
            // Add reaction
            reactions[emoji] = [...userList, currentUserId];
          }
          return { ...m, reactions };
        }
        return m;
      });
      broadcastEvent({ type: 'UPDATE_MESSAGES', messages: next });
      return next;
    });
    if (soundEnabled) playSoundEffect('pop');
  };

  const markExpenseSettled = (messageId: string) => {
    setMessages((prev) => {
      const next = prev.map((m) => {
        if (m.id === messageId && m.expense) {
          return {
            ...m,
            expense: {
              ...m.expense,
              isSettled: !m.expense.isSettled,
              settledAt: !m.expense.isSettled ? Date.now() : undefined,
            },
          };
        }
        return m;
      });
      broadcastEvent({ type: 'UPDATE_MESSAGES', messages: next });
      return next;
    });
    if (soundEnabled) playSoundEffect('settle');
  };

  const settleAllChannelExpenses = (channelId: string) => {
    setMessages((prev) => {
      const next = prev.map((m) => {
        if (m.channelId === channelId && m.expense && !m.expense.isSettled) {
          return {
            ...m,
            expense: {
              ...m.expense,
              isSettled: true,
              settledAt: Date.now(),
            },
          };
        }
        return m;
      });
      broadcastEvent({ type: 'UPDATE_MESSAGES', messages: next });
      return next;
    });
    if (soundEnabled) playSoundEffect('settle');
  };

  const getChannelExpenseSummary = (channelId: string): ExpenseSummary => {
    const channelExpenses = messages.filter(
      (m) => m.channelId === channelId && m.type === 'expense' && m.expense && !m.expense.isSettled
    );

    let totalAmount = 0;
    let user1Paid = 0;
    let user2Paid = 0;
    let netBalance = 0; // positive = user2 owes user1 (alex), negative = user1 owes user2

    channelExpenses.forEach((m) => {
      if (!m.expense) return;
      const amt = m.expense.amount || 0;
      totalAmount += amt;

      if (m.expense.paidBy === 'alex') {
        user1Paid += amt;
        if (m.expense.splitType === 'equally') {
          netBalance += amt / 2;
        } else if (m.expense.splitType === 'partner_owes_full') {
          netBalance += amt;
        }
      } else {
        user2Paid += amt;
        if (m.expense.splitType === 'equally') {
          netBalance -= amt / 2;
        } else if (m.expense.splitType === 'partner_owes_full') {
          netBalance -= amt;
        }
      }
    });

    return {
      totalAmount,
      user1Paid,
      user2Paid,
      netBalance,
      unsettledCount: channelExpenses.length,
    };
  };

  const simulatePartnerReply = (customText?: string) => {
    const partnerId = currentUserId === 'alex' ? 'jordan' : 'alex';
    const partnerName = users[partnerId]?.name || 'Partner';

    let reply = customText;
    if (!reply) {
      const channel = activeChannel;
      if (channel?.category === 'expenses') {
        reply = `Got it! Just checked the calculation and it looks accurate. Thanks for covering it! 🙌`;
      } else if (channel?.category === 'college') {
        reply = `Sounds good! I am picking up the remaining sheets right after lecture.`;
      } else if (channel?.category === 'meetings') {
        reply = `Marked on my calendar. I'll join 5 minutes early to test the deck.`;
      } else {
        const casualReplies = [
          `Sounds great, let's do that! 👍`,
          `Got your message! On my way now.`,
          `Totally agree, that works much better for our schedule.`,
          `Noted! Reviewing the details right now.`,
          `Super clear, thank you! ✨`,
        ];
        reply = casualReplies[Math.floor(Math.random() * casualReplies.length)];
      }
    }

    sendMessage({
      content: reply,
      type: 'text',
      overrideSenderId: partnerId,
    });
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const toggleSound = () => setSoundEnabled((prev) => !prev);

  const login = (asUser: 'alex' | 'jordan' = 'alex') => {
    setCurrentUserIdState(asUser);
    setIsAuthenticated(true);
    if (soundEnabled) playSoundEffect('settle');
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const resetToDefaults = () => {
    setUsers(INITIAL_USERS);
    setChannels(INITIAL_CHANNELS);
    setMessages(INITIAL_MESSAGES);
    setActiveChannelIdState('chan_general');
    localStorage.removeItem(STORAGE_KEYS.CHANNELS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    if (soundEnabled) playSoundEffect('settle');
  };

  const setChatBackground = useCallback((target: string, settings: BackgroundSettings | null) => {
    setCustomBackgrounds((prev) => {
      const next = { ...prev };
      if (settings) {
        next[target] = settings;
      } else {
        delete next[target];
      }
      if (channelRef.current) {
        try {
          channelRef.current.postMessage({
            type: 'UPDATE_BACKGROUNDS',
            backgrounds: next,
            senderTabId: tabId,
          });
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, [tabId]);

  const getChatBackground = useCallback((channelId?: string): BackgroundSettings | null => {
    if (channelId && customBackgrounds[channelId]) {
      return customBackgrounds[channelId];
    }
    return customBackgrounds['global'] || null;
  }, [customBackgrounds]);

  const value = {
    currentUser,
    partnerUser,
    setCurrentUserId,
    updateUserStatus,
    channels,
    activeChannelId,
    setActiveChannelId,
    activeChannel,
    activeMessages,
    createChannel,
    togglePinChannel,
    deleteChannel,
    sendMessage,
    toggleImportantMessage,
    togglePinMessageInChat,
    deleteMessage,
    addReaction,
    markExpenseSettled,
    settleAllChannelExpenses,
    getChannelExpenseSummary,
    simulatePartnerReply,
    searchQuery,
    setSearchQuery,
    channelFilter,
    setChannelFilter,
    darkMode,
    toggleDarkMode,
    soundEnabled,
    toggleSound,
    isAuthenticated,
    login,
    logout,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
    resetToDefaults,
    customBackgrounds,
    getChatBackground,
    setChatBackground,
  };

  return <ConnectContext.Provider value={value}>{children}</ConnectContext.Provider>;
};

export const useConnect = () => {
  const context = useContext(ConnectContext);
  if (!context) {
    throw new Error('useConnect must be used within a ConnectProvider');
  }
  return context;
};
