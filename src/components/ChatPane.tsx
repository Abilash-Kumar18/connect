import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  Pin,
  Star,
  Receipt,
  Calendar,
  Send,
  Smile,
  Search,
  Filter,
  Check,
  CheckCheck,
  Trash2,
  Sparkles,
  ArrowRightLeft,
  Clock,
  MapPin,
  FileText,
  Paperclip,
  Mic,
  Download,
  Play,
  Pause,
  User,
  BarChart2,
  X,
} from 'lucide-react';
import { useConnect } from '../context/ConnectContext';
import { ChannelIcon } from './ChannelIcon';
import { Message, MessageType } from '../types';
import { WallpaperModal } from './WallpaperModal';
import { AttachmentMenu } from './AttachmentMenu';
import { EmojiStickerPicker } from './EmojiStickerPicker';
import { ContactModal } from './ContactModal';
import { PollModal } from './PollModal';
import { CameraModal } from './CameraModal';

interface ChatPaneProps {
  onOpenExpenseModal: () => void;
  onOpenMeetingModal: () => void;
  onOpenSummaryModal: () => void;
  onOpenNewChannelModal: () => void;
}

export const ChatPane: React.FC<ChatPaneProps> = ({
  onOpenExpenseModal,
  onOpenMeetingModal,
  onOpenSummaryModal,
  onOpenNewChannelModal,
}) => {
  const {
    currentUser,
    partnerUser,
    setCurrentUserId,
    activeChannel,
    activeMessages,
    sendMessage,
    votePoll,
    toggleImportantMessage,
    togglePinMessageInChat,
    deleteMessage,
    addReaction,
    markExpenseSettled,
    getChannelExpenseSummary,
    simulatePartnerReply,
    togglePinChannel,
    setIsMobileDrawerOpen,
    getChatBackground,
  } = useConnect();

  const [inputText, setInputText] = useState('');
  const [isDraftImportant, setIsDraftImportant] = useState(false);
  const [topicFilter, setTopicFilter] = useState<'all' | 'important' | 'expense' | 'meeting' | 'pinned'>('all');
  const [topicSearch, setTopicSearch] = useState('');
  const [showTopicSearch, setShowTopicSearch] = useState(false);
  const [showPartnerSimulateMenu, setShowPartnerSimulateMenu] = useState(false);
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);

  // Attachment & Picker Popups
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiStickerPicker, setShowEmojiStickerPicker] = useState(false);

  // Attachment Modals
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);

  // Audio Playback
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Hidden File Inputs
  const docInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const stickerUploadRef = useRef<HTMLInputElement>(null);

  // Voice Access (Web Speech API)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const activeBg = activeChannel ? getChatBackground(activeChannel.id) : null;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSendingRef = useRef(false);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages.length, activeChannel?.id, topicFilter]);

  // Initialize Speech Recognition for Voice Access
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript}` : transcript;
          });
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceAccess = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch {
          setIsListening(false);
        }
      } else {
        const simulatedSpoken = 'Voice message noted.';
        setInputText((prev) => (prev ? `${prev} ${simulatedSpoken}` : simulatedSpoken));
      }
    }
  };

  if (!activeChannel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
        <div className="w-16 h-16 rounded-2xl bg-[#EAE2D6]/60 dark:bg-[#252C21] flex items-center justify-center text-[#8B9A6E] mb-4">
          <ChannelIcon name="MessageCircle" className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          No topic channel selected
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Pick a conversation topic from the sidebar or create a new dedicated channel to begin.
        </p>
        <button
          onClick={onOpenNewChannelModal}
          className="mt-4 px-4 py-2 rounded-xl bg-[#8B9A6E] hover:bg-[#79875F] text-white text-xs font-semibold shadow-sm transition-colors"
        >
          Create Channel
        </button>
      </div>
    );
  }

  const channelSummary = getChannelExpenseSummary(activeChannel.id);
  const hasExpenses = activeMessages.some((m) => m.type === 'expense');
  const pinnedInChatCount = activeMessages.filter((m) => m.isPinnedInChat).length;

  // Filter messages based on topic filter and search
  const filteredMessages = activeMessages.filter((msg) => {
    if (topicFilter === 'important' && !msg.isImportant) return false;
    if (topicFilter === 'expense' && msg.type !== 'expense') return false;
    if (topicFilter === 'meeting' && msg.type !== 'meeting') return false;
    if (topicFilter === 'pinned' && !msg.isPinnedInChat) return false;

    if (topicSearch.trim()) {
      const q = topicSearch.toLowerCase();
      const matchContent = msg.content.toLowerCase().includes(q);
      const matchExpense = msg.expense?.title.toLowerCase().includes(q);
      const matchMeeting = msg.meeting?.title.toLowerCase().includes(q);
      return matchContent || matchExpense || matchMeeting;
    }
    return true;
  });

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isSendingRef.current) return;

    isSendingRef.current = true;

    sendMessage({
      content: text,
      type: 'text',
      isImportant: isDraftImportant,
    });

    setInputText('');
    setIsDraftImportant(false);
    setShowEmojiStickerPicker(false);
    setShowAttachmentMenu(false);

    setTimeout(() => {
      isSendingRef.current = false;
    }, 250);
  };

  const addEmojiToInput = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const togglePlayAudio = (id: string, url?: string) => {
    if (playingAudioId === id) {
      audioPlayerRef.current?.pause();
      setPlayingAudioId(null);
    } else if (url) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(url);
      audio.onended = () => setPlayingAudioId(null);
      audio.play().catch(() => {});
      audioPlayerRef.current = audio;
      setPlayingAudioId(id);
    }
  };

  // Attachment file handlers
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      sendMessage({
        content: file.name,
        type: 'document',
        attachment: {
          name: file.name,
          url: event.target?.result as string,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          mimeType: file.type,
        },
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      sendMessage({
        content: file.name,
        type: 'media',
        attachment: {
          name: file.name,
          url: event.target?.result as string,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          mimeType: file.type,
        },
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      sendMessage({
        content: 'Voice Note',
        type: 'audio',
        attachment: {
          name: file.name,
          url: event.target?.result as string,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          duration: '0:14',
        },
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCustomStickerUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      sendMessage({
        content: 'Custom Sticker',
        type: 'sticker',
        stickerUrl: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (dataUrl: string) => {
    sendMessage({
      content: 'Camera Photo',
      type: 'media',
      attachment: {
        name: `Photo_${new Date().toISOString().slice(0, 10)}.jpg`,
        url: dataUrl,
        size: 'Camera snapshot',
      },
    });
  };

  const handleSendContact = (contact: any) => {
    sendMessage({
      content: `Contact: ${contact.name}`,
      type: 'contact',
      contact,
    });
  };

  const handleSendPoll = (poll: any) => {
    sendMessage({
      content: `Poll: ${poll.question}`,
      type: 'poll',
      poll,
    });
  };

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F7F2EB] dark:bg-[#1E231B] overflow-hidden relative">
      {/* Custom Background Image Layer */}
      {activeBg && (
        <>
          <div
            className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center transition-all duration-300"
            style={{
              backgroundImage: `url(${activeBg.imageUrl})`,
              opacity: activeBg.opacity ?? 0.35,
              filter: activeBg.blur ? `blur(${activeBg.blur}px)` : undefined,
            }}
          />
          <div className="absolute inset-0 pointer-events-none z-0 bg-white/30 dark:bg-black/50 transition-colors" />
        </>
      )}

      {/* 1. Header Bar */}
      <header className="h-16 px-4 border-b border-[#EAE2D6] dark:border-[#353E2F] bg-[#F7F2EB]/95 dark:bg-[#1E231B]/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mobile Back / Drawer Button */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="md:hidden p-2 -ml-1 rounded-xl text-[#586348] dark:text-[#C5CEB8] hover:bg-[#EAE2D6] dark:hover:bg-[#252C21]"
            title="Open Channels List"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Channel Icon */}
          <div className="w-9 h-9 rounded-xl bg-[#8B9A6E]/15 text-[#586348] dark:text-[#C5CEB8] flex items-center justify-center shrink-0 border border-[#8B9A6E]/30">
            <ChannelIcon name={activeChannel.icon} className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {activeChannel.name}
              </h2>
              {activeChannel.isPinned && (
                <Pin className="w-3 h-3 text-[#8B9A6E] fill-[#8B9A6E] shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {currentUser.name.split(' ')[0]} &amp; {partnerUser.name.split(' ')[0]}
              {activeChannel.description ? ` · ${activeChannel.description}` : ''}
            </p>
          </div>
        </div>

        {/* Right Header Action Items */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* In-chat Topic Search Toggle */}
          <button
            onClick={() => setShowTopicSearch(!showTopicSearch)}
            className={`p-2 rounded-xl transition-colors ${
              showTopicSearch || topicSearch
                ? 'text-[#8B9A6E] bg-[#EAE2D6] dark:bg-[#252C21]'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-[#EAE2D6] dark:hover:bg-[#252C21]'
            }`}
            title="Search inside this channel"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Expense Balance pill button (if channel has expenses) */}
          {hasExpenses && (
            <button
              onClick={onOpenSummaryModal}
              className="px-2.5 py-1.5 rounded-xl border border-[#DFD6C7] dark:border-[#353E2F] bg-[#EEEEEE] dark:bg-[#252C21] hover:bg-[#EAE2D6] transition-colors text-xs font-semibold flex items-center gap-1.5 text-[#586348] dark:text-[#C5CEB8]"
              title="Click to view shared expense summary"
            >
              <Receipt className="w-3.5 h-3.5 text-[#8B9A6E]" />
              <span className="hidden sm:inline">
                {channelSummary.netBalance === 0
                  ? 'All Settled'
                  : channelSummary.netBalance > 0
                  ? `${partnerUser.name.split(' ')[0]} owes ₹${channelSummary.netBalance.toFixed(2)}`
                  : `You owe ₹${Math.abs(channelSummary.netBalance).toFixed(2)}`}
              </span>
            </button>
          )}

          {/* Pin Channel */}
          <button
            onClick={() => togglePinChannel(activeChannel.id)}
            className={`p-2 rounded-xl transition-colors ${
              activeChannel.isPinned
                ? 'text-[#8B9A6E] bg-[#EAE2D6] dark:bg-[#252C21]'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-[#EAE2D6] dark:hover:bg-[#252C21]'
            }`}
            title={activeChannel.isPinned ? 'Unpin channel' : 'Pin channel to top'}
          >
            <Pin className={`w-4 h-4 ${activeChannel.isPinned ? 'fill-[#8B9A6E]' : ''}`} />
          </button>

          {/* Wallpaper / Background Setting Button */}
          <button
            onClick={() => setIsWallpaperModalOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-[#EAE2D6] dark:hover:bg-[#252C21] transition-colors relative"
            title="Channel Wallpaper / Background Photo"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            {activeBg && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#8B9A6E]" />
            )}
          </button>

          {/* Switch Active User */}
          <button
            onClick={() => setCurrentUserId(partnerUser.id)}
            className="px-2 py-1.5 rounded-xl border border-[#DFD6C7] dark:border-[#353E2F] bg-[#EEEEEE] dark:bg-[#252C21] text-[#586348] dark:text-[#C5CEB8] text-xs font-medium flex items-center gap-1 hover:bg-[#EAE2D6] transition-colors"
            title={`Switch to act as ${partnerUser.name}`}
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span className="hidden sm:inline">As: {currentUser.name.split(' ')[0]}</span>
          </button>
        </div>
      </header>

      {/* Optional Search bar dropdown */}
      <AnimatePresence>
        {showTopicSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-2 bg-[#F7F2EB] dark:bg-[#1E231B] border-b border-[#EAE2D6] dark:border-[#353E2F] flex items-center gap-2 z-10 shrink-0"
          >
            <Search className="w-4 h-4 text-[#8B9A6E]" />
            <input
              type="text"
              autoFocus
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
              placeholder={`Search messages, expenses, or notes in #${activeChannel.name}...`}
              className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none"
            />
            {topicSearch && (
              <button
                onClick={() => setTopicSearch('')}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. In-Chat Filter Tabs */}
      <div className="px-4 py-2 border-b border-[#EAE2D6]/80 dark:border-[#353E2F]/80 bg-[#F7F2EB]/80 dark:bg-[#1E231B]/80 flex items-center justify-between text-xs z-10 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setTopicFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              topicFilter === 'all'
                ? 'bg-[#8B9A6E] text-white shadow-xs'
                : 'bg-[#EEEEEE] dark:bg-[#252C21] text-[#586348] dark:text-[#C5CEB8] hover:bg-[#EAE2D6]'
            }`}
          >
            All Messages ({activeMessages.length})
          </button>
          <button
            onClick={() => setTopicFilter('important')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
              topicFilter === 'important'
                ? 'bg-[#8B9A6E] text-white shadow-xs'
                : 'bg-[#EEEEEE] dark:bg-[#252C21] text-[#586348] dark:text-[#C5CEB8] hover:bg-[#EAE2D6]'
            }`}
          >
            <Star className="w-3 h-3" />
            <span>Important</span>
          </button>
          <button
            onClick={() => setTopicFilter('expense')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
              topicFilter === 'expense'
                ? 'bg-[#8B9A6E] text-white shadow-xs'
                : 'bg-[#EEEEEE] dark:bg-[#252C21] text-[#586348] dark:text-[#C5CEB8] hover:bg-[#EAE2D6]'
            }`}
          >
            <Receipt className="w-3 h-3" />
            <span>Expenses</span>
          </button>
          <button
            onClick={() => setTopicFilter('meeting')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
              topicFilter === 'meeting'
                ? 'bg-[#8B9A6E] text-white shadow-xs'
                : 'bg-[#EEEEEE] dark:bg-[#252C21] text-[#586348] dark:text-[#C5CEB8] hover:bg-[#EAE2D6]'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>Meetings</span>
          </button>
          {pinnedInChatCount > 0 && (
            <button
              onClick={() => setTopicFilter('pinned')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                topicFilter === 'pinned'
                  ? 'bg-[#8B9A6E] text-white shadow-xs'
                  : 'bg-[#EEEEEE] dark:bg-[#252C21] text-[#586348] dark:text-[#C5CEB8] hover:bg-[#EAE2D6]'
              }`}
            >
              <Pin className="w-3 h-3" />
              <span>Pinned ({pinnedInChatCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Messages Feed (Bottom-anchored without awkward gap) */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-2 space-y-3 relative z-10 flex flex-col">
        {/* Spacer to push messages down snugly above the message box */}
        <div className="mt-auto" />

        {filteredMessages.length === 0 ? (
          <div className="text-center py-12 px-4 my-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#EAE2D6]/60 dark:bg-[#252C21] flex items-center justify-center text-[#8B9A6E] mx-auto mb-3">
              <ChannelIcon name={activeChannel.icon} className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {topicFilter !== 'all'
                ? `No ${topicFilter} messages match this filter`
                : `Start of #${activeChannel.name}`}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {topicFilter !== 'all'
                ? 'Try clearing the filter tabs above.'
                : 'Type a message or use the attachment button below to post.'}
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* Important/Pin badges */}
                {(msg.isImportant || msg.isPinnedInChat) && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 px-1">
                    {msg.isImportant && (
                      <span className="text-amber-500 flex items-center gap-0.5 font-semibold">
                        <Star className="w-3 h-3 fill-amber-500" />
                        <span>Important</span>
                      </span>
                    )}
                    {msg.isPinnedInChat && (
                      <span className="text-[#8B9A6E] flex items-center gap-0.5 font-semibold">
                        <Pin className="w-3 h-3 fill-[#8B9A6E]" />
                        <span>Pinned</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Message Bubble Container with Hover Actions */}
                <div className="relative max-w-[85%] sm:max-w-md group/bubble">
                  {/* EXPENSE MESSAGE CARD */}
                  {msg.type === 'expense' && msg.expense ? (
                    <div
                      className={`p-4 rounded-3xl border shadow-sm transition-all ${
                        msg.expense.isSettled
                          ? 'bg-zinc-100/90 dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800 opacity-80'
                          : isMe
                          ? 'bg-zinc-950 text-white border-zinc-800 shadow-sm'
                          : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-200/40 dark:border-white/10">
                        <div className="flex items-center gap-1.5">
                          <Receipt className={`w-4 h-4 ${isMe ? 'text-zinc-300' : 'text-zinc-700 dark:text-zinc-300'}`} />
                          <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                            {msg.expense.category}
                          </span>
                        </div>
                        {msg.expense.isSettled ? (
                          <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
                            Settled
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isMe ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/20 text-black dark:text-white'
                          }`}>
                            Pending
                          </span>
                        )}
                      </div>

                      <div className="my-2.5">
                        <div className="text-sm font-semibold">{msg.expense.title}</div>
                        <div className={`text-2xl font-bold font-mono tabular-nums mt-1 ${
                          isMe ? 'text-white' : 'text-zinc-900 dark:text-white'
                        }`}>
                          {msg.expense.currency === '$' ? '₹' : (msg.expense.currency || '₹')}
                          {msg.expense.amount.toFixed(2)}
                        </div>
                        <div className="text-[11px] opacity-75 mt-1">
                          Paid by {msg.expense.paidBy === 'alex' ? 'Alex' : 'Jordan'} ·{' '}
                          {msg.expense.splitType === 'equally'
                            ? `Split equally (${msg.expense.currency === '$' ? '₹' : (msg.expense.currency || '₹')}${(msg.expense.amount / 2).toFixed(2)} each)`
                            : 'Direct non-split'}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-200/40 dark:border-white/10 flex items-center justify-between">
                        <span className="text-[10px] opacity-60">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                        <button
                          type="button"
                          onClick={() => markExpenseSettled(msg.id)}
                          className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                            msg.expense.isSettled
                              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                              : isMe
                              ? 'bg-white hover:bg-zinc-200 text-zinc-950 font-semibold shadow-xs'
                              : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-950 font-semibold shadow-xs'
                          }`}
                        >
                          {msg.expense.isSettled ? 'Mark Unsettled' : 'Mark Settled'}
                        </button>
                      </div>
                    </div>
                  ) : msg.type === 'meeting' && msg.meeting ? (
                    /* MEETING / EVENT CARD */
                    <div
                      className={`p-4 rounded-3xl border shadow-sm ${
                        isMe
                          ? 'bg-zinc-950 text-white border-zinc-800'
                          : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold mb-2 opacity-90">
                        <Calendar className="w-4 h-4 text-[#FF4757]" />
                        <span>Meeting &amp; Event</span>
                      </div>
                      <div className="text-sm font-bold">{msg.meeting.title}</div>
                      <div className="space-y-1 my-2 text-xs opacity-90">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {msg.meeting.date} · {msg.meeting.time}
                          </span>
                        </div>
                        {msg.meeting.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{msg.meeting.location}</span>
                          </div>
                        )}
                        {msg.meeting.notes && (
                          <div className="flex items-start gap-1.5 pt-1">
                            <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span className="opacity-80">{msg.meeting.notes}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] opacity-60 text-right">
                        {formatTimestamp(msg.timestamp)}
                      </div>
                    </div>
                  ) : msg.type === 'media' ? (
                    /* MEDIA / PHOTO / VIDEO CARD */
                    <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
                      {msg.attachment?.url && (
                        <img
                          src={msg.attachment.url}
                          alt={msg.attachment.name || 'Photo'}
                          className="max-w-full max-h-72 object-cover rounded-t-2xl hover:opacity-95 transition-opacity cursor-pointer"
                          onClick={() => window.open(msg.attachment?.url, '_blank')}
                        />
                      )}
                      {msg.content && msg.content !== msg.attachment?.name && msg.content !== 'Camera Photo' && (
                        <p className="px-3 pt-2 text-xs font-medium text-zinc-800 dark:text-zinc-200">
                          {msg.content}
                        </p>
                      )}
                      <div className="px-3 py-1.5 flex items-center justify-between text-[10px] opacity-60">
                        <span>{msg.attachment?.size || 'Photo'}</span>
                        <div className="flex items-center gap-1">
                          <span>{formatTimestamp(msg.timestamp)}</span>
                          {isMe && <CheckCheck className="w-3 h-3 text-emerald-500" />}
                        </div>
                      </div>
                    </div>
                  ) : msg.type === 'document' ? (
                    /* DOCUMENT ATTACHMENT CARD */
                    <div
                      className={`p-3.5 rounded-2xl border flex items-center gap-3 min-w-[220px] shadow-xs ${
                        isMe
                          ? 'bg-zinc-950 text-white border-zinc-800'
                          : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#7F66FF] flex items-center justify-center text-white shrink-0 shadow-xs">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-semibold truncate">
                          {msg.attachment?.name || msg.content}
                        </div>
                        <div className="text-[10px] opacity-60 mt-0.5">
                          {msg.attachment?.size || 'Document'} · {formatTimestamp(msg.timestamp)}
                        </div>
                      </div>
                      {msg.attachment?.url && (
                        <a
                          href={msg.attachment.url}
                          download={msg.attachment.name || 'document'}
                          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0"
                          title="Download document"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ) : msg.type === 'audio' ? (
                    /* AUDIO / VOICE NOTE PLAYER CARD */
                    <div
                      className={`p-3 rounded-2xl border flex items-center gap-3 min-w-[220px] shadow-xs ${
                        isMe
                          ? 'bg-zinc-950 text-white border-zinc-800'
                          : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => togglePlayAudio(msg.id, msg.attachment?.url)}
                        className="w-10 h-10 rounded-full bg-[#FF9500] flex items-center justify-center text-white shrink-0 hover:scale-105 active:scale-95 transition-transform shadow-xs"
                      >
                        {playingAudioId === msg.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 h-5 mb-1">
                          {[35, 70, 45, 90, 60, 30, 80, 100, 40, 75, 85, 40, 65, 95, 50, 30, 75].map((h, i) => (
                            <span
                              key={i}
                              className={`w-1 rounded-full transition-all duration-150 ${
                                playingAudioId === msg.id
                                  ? 'bg-[#FF9500] animate-pulse'
                                  : isMe
                                  ? 'bg-zinc-500'
                                  : 'bg-zinc-400'
                              }`}
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-[10px] opacity-60">
                          <span>{msg.attachment?.duration || '0:12'}</span>
                          <span>{formatTimestamp(msg.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ) : msg.type === 'contact' ? (
                    /* CONTACT CARD */
                    <div
                      className={`p-3.5 rounded-2xl border min-w-[220px] shadow-xs ${
                        isMe
                          ? 'bg-zinc-950 text-white border-zinc-800'
                          : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 pb-2 border-b border-zinc-200/40 dark:border-white/10">
                        <div className="w-10 h-10 rounded-full bg-[#00A8FF] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
                          {msg.contact?.name?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-bold truncate">{msg.contact?.name}</div>
                          {msg.contact?.phone && (
                            <div className="text-[11px] opacity-70 truncate">{msg.contact.phone}</div>
                          )}
                          {msg.contact?.email && (
                            <div className="text-[10px] opacity-60 truncate">{msg.contact.email}</div>
                          )}
                        </div>
                      </div>
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-[10px] opacity-60">{formatTimestamp(msg.timestamp)}</span>
                        {msg.contact?.phone && (
                          <a
                            href={`tel:${msg.contact.phone}`}
                            className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[#00A8FF]/20 text-[#00A8FF] hover:bg-[#00A8FF]/30 transition-colors"
                          >
                            Call
                          </a>
                        )}
                      </div>
                    </div>
                  ) : msg.type === 'poll' ? (
                    /* POLL CARD WITH REAL-TIME VOTING */
                    <div
                      className={`p-4 rounded-3xl border min-w-[260px] max-w-sm shadow-xs ${
                        isMe
                          ? 'bg-zinc-950 text-white border-zinc-800'
                          : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-[#FFC048] flex items-center justify-center text-zinc-950">
                          <BarChart2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider opacity-80">Poll</span>
                      </div>
                      <h4 className="text-sm font-bold mb-3">{msg.poll?.question}</h4>
                      <div className="space-y-2">
                        {msg.poll?.options.map((option) => {
                          const totalVotes = msg.poll!.options.reduce((acc, opt) => acc + opt.votes.length, 0);
                          const pct = totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0;
                          const hasVoted = option.votes.includes(currentUser.id);

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => votePoll?.(msg.id, option.id)}
                              className={`w-full relative overflow-hidden p-2.5 rounded-xl border text-left transition-all ${
                                hasVoted
                                  ? 'border-[#FFC048] ring-1 ring-[#FFC048]/50'
                                  : 'border-zinc-200/50 dark:border-zinc-700/50 hover:bg-white/5'
                              }`}
                            >
                              <div
                                className="absolute inset-y-0 left-0 bg-[#FFC048]/25 transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                              <div className="relative flex items-center justify-between text-xs font-medium z-10">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                      hasVoted ? 'bg-[#FFC048] border-[#FFC048] text-zinc-950' : 'border-zinc-400'
                                    }`}
                                  >
                                    {hasVoted && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span>{option.text}</span>
                                </div>
                                <span className="text-[11px] font-mono opacity-80">
                                  {pct}% ({option.votes.length})
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-3 pt-2 border-t border-zinc-200/40 dark:border-white/10 flex items-center justify-between text-[10px] opacity-60">
                        <span>
                          {msg.poll?.options.reduce((acc, o) => acc + o.votes.length, 0) || 0} votes
                          {msg.poll?.allowsMultipleAnswers ? ' · Multiple answers' : ' · Single choice'}
                        </span>
                        <span>{formatTimestamp(msg.timestamp)}</span>
                      </div>
                    </div>
                  ) : msg.type === 'sticker' ? (
                    /* STICKER MESSAGE */
                    <div className="relative group/sticker">
                      <div className="p-1 rounded-2xl transition-transform hover:scale-105">
                        <img
                          src={msg.stickerUrl}
                          alt={msg.content || 'Sticker'}
                          className="w-32 h-32 sm:w-36 sm:h-36 object-cover rounded-2xl shadow-md border border-zinc-200/50 dark:border-zinc-700/50"
                        />
                        {msg.content && msg.content !== 'Custom Sticker' && (
                          <div className="mt-1 text-center text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                            {msg.content}
                          </div>
                        )}
                        <div className="text-[10px] text-right opacity-60 mt-0.5">
                          {formatTimestamp(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* STANDARD TEXT MESSAGE BUBBLE */
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 rounded-br-xs'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                      <div
                        className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                          isMe ? 'text-zinc-400 dark:text-zinc-600' : 'text-zinc-400'
                        }`}
                      >
                        <span>{formatTimestamp(msg.timestamp)}</span>
                        {isMe && (
                          <span>
                            {msg.status === 'read' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-white dark:text-zinc-950" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Reaction Pills on Bubble */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 px-1">
                      {Object.entries(msg.reactions).map(([emoji, userIds]) => {
                        const hasReacted = userIds.includes(currentUser.id);
                        return (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => addReaction(msg.id, emoji)}
                            className={`px-2 py-0.5 rounded-full text-[11px] border flex items-center gap-1 transition-all ${
                              hasReacted
                                ? 'border-[#8B9A6E] bg-[#8B9A6E]/15 text-[#5B6B44] dark:text-[#B5C49A]'
                                : 'border-[#EAE2D6] dark:border-[#353E2F] bg-white dark:bg-[#1E231B] text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span className="font-semibold text-[10px]">{userIds.length}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Message Action Menu (Hover Toolbar) */}
                  <div
                    className={`absolute top-0 -translate-y-1/2 opacity-0 group-hover/bubble:opacity-100 transition-opacity z-10 flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md ${
                      isMe ? 'right-0 -translate-x-2' : 'left-0 translate-x-2'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => addReaction(msg.id, '❤️')}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-xs"
                      title="Heart"
                    >
                      ❤️
                    </button>
                    <button
                      type="button"
                      onClick={() => addReaction(msg.id, '👍')}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-xs"
                      title="Thumbs Up"
                    >
                      👍
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleImportantMessage(msg.id)}
                      className={`p-1 rounded text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700 ${
                        msg.isImportant ? 'text-amber-500' : ''
                      }`}
                      title={msg.isImportant ? 'Remove Important' : 'Mark as Important'}
                    >
                      <Star className={`w-3.5 h-3.5 ${msg.isImportant ? 'fill-amber-500' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => togglePinMessageInChat(msg.id)}
                      className={`p-1 rounded text-slate-400 hover:text-[#8B9A6E] hover:bg-[#EEEEEE] dark:hover:bg-[#252C21] ${
                        msg.isPinnedInChat ? 'text-[#8B9A6E]' : ''
                      }`}
                      title={msg.isPinnedInChat ? 'Unpin from chat' : 'Pin in chat'}
                    >
                      <Pin className={`w-3.5 h-3.5 ${msg.isPinnedInChat ? 'fill-[#8B9A6E]' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteMessage(msg.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Delete message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} className="h-0 w-0 -mt-3 pointer-events-none" />
      </div>

      {/* 4. WhatsApp-Style Input Message Bar (Matching Images 1, 2, 3) */}
      <div className="px-3 pt-2 pb-3 bg-[#F7F2EB]/95 dark:bg-[#1E231B]/95 border-t border-[#EAE2D6] dark:border-[#353E2F] backdrop-blur-md shrink-0 relative z-30">
        {/* Attachment Menu Popup (Image 2) */}
        <AttachmentMenu
          isOpen={showAttachmentMenu}
          onClose={() => setShowAttachmentMenu(false)}
          onSelectDocument={() => docInputRef.current?.click()}
          onSelectPhotosVideos={() => mediaInputRef.current?.click()}
          onSelectCamera={() => setShowCameraModal(true)}
          onSelectAudio={() => audioInputRef.current?.click()}
          onSelectContact={() => setShowContactModal(true)}
          onSelectPoll={() => setShowPollModal(true)}
          onSelectEvent={onOpenMeetingModal}
          onSelectNewSticker={() => setShowEmojiStickerPicker(true)}
          onSelectExpense={onOpenExpenseModal}
        />

        {/* Emoji & Sticker Picker Popup (Image 3) */}
        <EmojiStickerPicker
          isOpen={showEmojiStickerPicker}
          onClose={() => setShowEmojiStickerPicker(false)}
          onSelectEmoji={addEmojiToInput}
          onSelectSticker={(stk) => {
            sendMessage({
              content: stk.name,
              type: 'sticker',
              stickerUrl: stk.url,
            });
          }}
          onUploadCustomSticker={(file) => {
            handleCustomStickerUpload(file);
          }}
        />

        {/* Hidden File Inputs for Attachment Menu */}
        <input
          ref={docInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.zip,.csv,.xlsx"
          onChange={handleDocumentUpload}
          className="hidden"
        />
        <input
          ref={mediaInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleMediaUpload}
          className="hidden"
        />
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          onChange={handleAudioUpload}
          className="hidden"
        />
        <input
          ref={stickerUploadRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleCustomStickerUpload(file);
            e.target.value = '';
          }}
          className="hidden"
        />

        {/* Live Voice Speech Recognition Status Banner */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="mb-2 px-3.5 py-1.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-xs text-red-600 dark:text-red-400"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="font-semibold">Listening to your voice... Speak now</span>
              </div>
              <button
                type="button"
                onClick={toggleVoiceAccess}
                className="text-xs font-bold underline hover:opacity-80 cursor-pointer"
              >
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pill Container (Identical to Image 1) */}
        <div className="w-full bg-white dark:bg-[#252C21] rounded-full shadow-xs border border-[#DFD6C7] dark:border-[#353E2F] px-3 py-1.5 flex items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-[#8B9A6E]/30 focus-within:border-[#8B9A6E]">
          {/* Attachment Button (Paperclip) */}
          <button
            type="button"
            onClick={() => {
              setShowAttachmentMenu((prev) => !prev);
              setShowEmojiStickerPicker(false);
            }}
            className={`p-2 rounded-full transition-colors ${
              showAttachmentMenu
                ? 'text-[#8B9A6E] bg-[#EEEEEE] dark:bg-[#353E2F]'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-[#EEEEEE] dark:hover:bg-[#353E2F]'
            }`}
            title="Attach Document, Photo, Camera, Audio, Contact, Poll, Event..."
          >
            <Paperclip className="w-5 h-5 -rotate-45" />
          </button>

          {/* Emoji & Sticker Button (Image 3) */}
          <button
            type="button"
            onClick={() => {
              setShowEmojiStickerPicker((prev) => !prev);
              setShowAttachmentMenu(false);
            }}
            className={`p-2 rounded-full transition-colors ${
              showEmojiStickerPicker
                ? 'text-[#8B9A6E] bg-[#EEEEEE] dark:bg-[#353E2F]'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-[#EEEEEE] dark:hover:bg-[#353E2F]'
            }`}
            title="Emoji and Stickers"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Message Input Field: "Type a message" */}
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message"
            className="flex-1 bg-transparent border-0 outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 py-1.5 focus:ring-0 focus:outline-none"
          />

          {/* Right Action: Voice Access (Mic) or Send Button */}
          {inputText.trim() ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleVoiceAccess}
                className={`p-2 rounded-full transition-colors ${
                  isListening
                    ? 'text-red-500 bg-red-100 dark:bg-red-950/40'
                    : 'text-zinc-400 hover:text-zinc-600'
                }`}
                title="Voice Access (Speech to text)"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => handleSend()}
                className="p-2 rounded-full bg-[#8B9A6E] hover:bg-[#79875F] text-white shadow-xs transition-transform active:scale-95"
                title="Send message"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          ) : (
            /* Voice Access Microphone Button (Image 1) */
            <button
              type="button"
              onClick={toggleVoiceAccess}
              className={`p-2 rounded-full transition-all active:scale-90 ${
                isListening
                  ? 'text-white bg-red-500 shadow-md animate-pulse'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-[#EEEEEE] dark:hover:bg-[#353E2F]'
              }`}
              title="Voice Access: Click to speak"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Wallpaper & Background Photo Modal */}
      <WallpaperModal
        isOpen={isWallpaperModalOpen}
        onClose={() => setIsWallpaperModalOpen(false)}
        channelId={activeChannel.id}
        channelName={activeChannel.name}
      />

      {/* Contact Sharing Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        onSendContact={handleSendContact}
      />

      {/* Interactive Poll Modal */}
      <PollModal
        isOpen={showPollModal}
        onClose={() => setShowPollModal(false)}
        onSendPoll={handleSendPoll}
      />

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapturePhoto={handleCameraCapture}
      />
    </div>
  );
};
