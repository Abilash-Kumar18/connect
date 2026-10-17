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
  MoreVertical,
  Trash2,
  Sparkles,
  ArrowRightLeft,
  ChevronLeft,
  PlusCircle,
  Clock,
  MapPin,
  TrendingUp,
  CreditCard,
  FileText,
  ThumbsUp,
  Heart,
  Laugh,
  Flame,
} from 'lucide-react';
import { useConnect } from '../context/ConnectContext';
import { ChannelIcon } from './ChannelIcon';
import { Message, MessageType } from '../types';

interface ChatPaneProps {
  onOpenExpenseModal: () => void;
  onOpenMeetingModal: () => void;
  onOpenSummaryModal: () => void;
  onOpenNewChannelModal: () => void;
}

const COMMON_EMOJIS = ['😀', '❤️', '👍', '😂', '💸', '🔥', '🚀', '☕', '📚', '📅', '🎉', '💯'];

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
    toggleImportantMessage,
    togglePinMessageInChat,
    deleteMessage,
    addReaction,
    markExpenseSettled,
    getChannelExpenseSummary,
    simulatePartnerReply,
    togglePinChannel,
    setIsMobileDrawerOpen,
  } = useConnect();

  const [inputText, setInputText] = useState('');
  const [isDraftImportant, setIsDraftImportant] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [topicFilter, setTopicFilter] = useState<'all' | 'important' | 'expense' | 'meeting' | 'pinned'>('all');
  const [topicSearch, setTopicSearch] = useState('');
  const [showTopicSearch, setShowTopicSearch] = useState(false);
  const [showPartnerSimulateMenu, setShowPartnerSimulateMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages.length, activeChannel?.id, topicFilter]);

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
    if (!inputText.trim()) return;

    sendMessage({
      content: inputText.trim(),
      type: 'text',
      isImportant: isDraftImportant,
    });

    setInputText('');
    setIsDraftImportant(false);
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const addEmojiToInput = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F7F2EB] dark:bg-[#1E231B] overflow-hidden relative">
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

          {/* Topic Title & Context Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold font-display text-[#2D3325] dark:text-white truncate">
                {activeChannel.name}
              </h2>
              {activeChannel.isPinned && (
                <span title="Pinned Channel" className="text-[#8B9A6E]">
                  <Pin className="w-3.5 h-3.5 fill-[#8B9A6E]" />
                </span>
              )}
            </div>
            <div className="text-[11px] text-[#788566] dark:text-[#A7B395] truncate flex items-center gap-2">
              <span>{currentUser.name.split(' ')[0]} & {partnerUser.name.split(' ')[0]}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{activeChannel.description}</span>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Search in topic toggle */}
          <button
            onClick={() => setShowTopicSearch(!showTopicSearch)}
            title="Search inside this channel"
            className={`p-2 rounded-xl transition-colors ${
              showTopicSearch || topicSearch
                ? 'bg-[#8B9A6E]/20 text-[#586348] dark:text-[#C5CEB8]'
                : 'text-[#788566] hover:text-[#2D3325] dark:hover:text-white hover:bg-[#EAE2D6] dark:hover:bg-[#252C21]'
            }`}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Expense balance indicator pill (if channel has expenses) */}
          {hasExpenses && (
            <button
              onClick={onOpenSummaryModal}
              title="View itemized expense breakdown"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#8B9A6E]/40 bg-[#EAE2D6]/80 dark:bg-[#252C21] text-[#4A5538] dark:text-[#EAE2D6] text-xs font-semibold hover:bg-[#EAE2D6] transition-colors"
            >
              <Receipt className="w-3.5 h-3.5 text-[#8B9A6E]" />
              <span>
                {Math.abs(channelSummary.netBalance) > 0.01
                  ? `${channelSummary.netBalance > 0 ? 'Jordan owes' : 'You owe'} ${activeChannel.currency || '$'}${Math.abs(channelSummary.netBalance).toFixed(2)}`
                  : 'Settled'}
              </span>
            </button>
          )}

          {/* Pin channel button */}
          <button
            onClick={() => togglePinChannel(activeChannel.id)}
            title={activeChannel.isPinned ? 'Unpin channel' : 'Pin channel to top'}
            className={`p-2 rounded-xl transition-colors ${
              activeChannel.isPinned
                ? 'text-[#8B9A6E] bg-[#EAE2D6] dark:bg-[#252C21]'
                : 'text-[#788566] hover:text-[#2D3325] dark:hover:text-white hover:bg-[#EAE2D6] dark:hover:bg-[#252C21]'
            }`}
          >
            <Pin className={`w-4 h-4 ${activeChannel.isPinned ? 'fill-[#8B9A6E]' : ''}`} />
          </button>

          {/* Switch Sender indicator pill */}
          <button
            onClick={() => setCurrentUserId(currentUser.id === 'alex' ? 'jordan' : 'alex')}
            title={`Currently chatting as ${currentUser.name}. Click to switch to ${partnerUser.name}.`}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#DFD6C7] dark:border-[#353E2F] bg-white dark:bg-[#252C21] text-[#4A5538] dark:text-[#EAE2D6] text-xs font-medium hover:border-[#8B9A6E] transition-colors"
          >
            <ArrowRightLeft className="w-3 h-3 text-[#8B9A6E]" />
            <span className="hidden lg:inline text-[11px]">As:</span>
            <span className="font-semibold text-[11px]">{currentUser.name.split(' ')[0]}</span>
          </button>
        </div>
      </header>

      {/* 2. Sub-Header: Search bar or In-Topic Filter Pills */}
      <div className="px-4 py-2 border-b border-[#EAE2D6] dark:border-[#353E2F] bg-[#F7F2EB]/80 dark:bg-[#1E231B]/80 backdrop-blur-xs flex items-center justify-between gap-2 overflow-x-auto text-[11px]">
        {showTopicSearch ? (
          <div className="relative w-full flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#788566] absolute left-2.5" />
            <input
              type="text"
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
              placeholder={`Filter messages in #${activeChannel.name}...`}
              className="w-full pl-8 pr-7 py-1 rounded-lg border border-[#EAE2D6] dark:border-[#353E2F] bg-[#EEEEEE] dark:bg-[#252C21] text-xs text-[#2D3325] dark:text-[#F7F2EB] focus:outline-none focus:ring-1 focus:ring-[#8B9A6E]"
              autoFocus
            />
            {topicSearch && (
              <button
                onClick={() => setTopicSearch('')}
                className="absolute right-2 text-[#788566] hover:text-[#2D3325] text-xs"
              >
                ×
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
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
            {hasExpenses && (
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
            )}
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
        )}

        {/* Small screen balance trigger */}
        {hasExpenses && (
          <button
            onClick={onOpenSummaryModal}
            className="sm:hidden text-[#8B9A6E] dark:text-[#A3B386] font-semibold whitespace-nowrap text-[11px] underline"
          >
            Balance
          </button>
        )}
      </div>

      {/* 3. Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-16 px-4">
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
                : 'Send your first message or post an expense/meeting note below.'}
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            const senderName = isMe ? currentUser.name : partnerUser.name;

            return (
              <div
                key={msg.id}
                className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* Sender name & Important/Pin badges */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 px-1">
                  <span className="font-medium text-slate-500 dark:text-slate-400">
                    {senderName}
                  </span>
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

                {/* Message Bubble Container with Hover Actions */}
                <div className="relative max-w-[85%] sm:max-w-md group/bubble">
                  {/* EXPENSE MESSAGE CARD */}
                  {msg.type === 'expense' && msg.expense ? (
                    <div
                      className={`p-4 rounded-3xl border shadow-sm transition-all ${
                        msg.expense.isSettled
                          ? 'bg-slate-100/90 dark:bg-slate-900/90 border-[#EAE2D6] dark:border-[#353E2F] opacity-80'
                          : isMe
                          ? 'bg-gradient-to-br from-[#4F593E] to-[#2E3525] text-[#F7F2EB] border-[#8B9A6E]/50 shadow-sm'
                          : 'bg-[#F7F2EB] dark:bg-[#1E231B] border-[#EAE2D6] dark:border-[#353E2F] text-slate-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#EAE2D6]/40 dark:border-white/10">
                        <div className="flex items-center gap-1.5">
                          <Receipt className="w-4 h-4 text-[#8B9A6E] dark:text-[#A3B386]" />
                          <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                            {msg.expense.category}
                          </span>
                        </div>
                        {msg.expense.isSettled ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#EEEEEE] dark:bg-[#2A3125] text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            Settled
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-[#8B9A6E]/20 text-[#8B9A6E] dark:text-[#A3B386] text-[10px] font-semibold">
                            Pending
                          </span>
                        )}
                      </div>

                      <div className="my-2.5">
                        <div className="text-sm font-semibold">{msg.expense.title}</div>
                        <div className="text-2xl font-bold font-mono tabular-nums mt-1 text-[#8B9A6E] dark:text-[#A3B386]">
                          {msg.expense.currency}
                          {msg.expense.amount.toFixed(2)}
                        </div>
                        <div className="text-[11px] opacity-75 mt-1">
                          Paid by {msg.expense.paidBy === 'alex' ? 'Alex' : 'Jordan'} ·{' '}
                          {msg.expense.splitType === 'equally'
                            ? `Split equally (${msg.expense.currency}${(msg.expense.amount / 2).toFixed(2)} each)`
                            : 'Direct non-split'}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#EAE2D6]/40 dark:border-white/10 flex items-center justify-between">
                        <span className="text-[10px] opacity-60">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                        <button
                          type="button"
                          onClick={() => markExpenseSettled(msg.id)}
                          className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                            msg.expense.isSettled
                              ? 'bg-[#EEEEEE] dark:bg-[#252C21] text-slate-700 dark:text-slate-300 hover:bg-[#EAE2D6]'
                              : 'bg-[#8B9A6E] hover:bg-[#79875F] text-white font-semibold shadow-xs'
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
                          ? 'bg-[#8B9A6E] text-white border-[#79875F]'
                          : 'bg-[#F7F2EB] dark:bg-[#1E231B] border-[#EAE2D6] dark:border-[#353E2F] text-slate-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold mb-2 opacity-90">
                        <Calendar className="w-4 h-4 text-[#EAE2D6]" />
                        <span>Meeting & Event Note</span>
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
                  ) : (
                    /* STANDARD TEXT MESSAGE BUBBLE */
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-[#8B9A6E] text-white rounded-br-xs'
                          : 'bg-[#F7F2EB] dark:bg-[#252C21] text-[#2D3325] dark:text-[#F7F2EB] border border-[#EAE2D6] dark:border-[#353E2F] rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                      <div
                        className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                          isMe ? 'text-[#EAF0DE]' : 'text-[#8F9882]'
                        }`}
                      >
                        <span>{formatTimestamp(msg.timestamp)}</span>
                        {isMe && (
                          <span>
                            {msg.status === 'read' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-[#EAF0DE]" />
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
                    {/* Common quick reactions */}
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

                    {/* Important Toggle */}
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

                    {/* Pin in chat Toggle */}
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

                    {/* Delete Message */}
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
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Message Input & Quick Action Bar */}
      <div className="p-3 bg-[#F7F2EB]/95 dark:bg-[#1E231B]/95 border-t border-[#EAE2D6] dark:border-[#353E2F] backdrop-blur-md shrink-0">
        {/* Quick Action Chips Row */}
        <div className="flex items-center gap-1.5 pb-2 overflow-x-auto scrollbar-none text-xs">
          <button
            type="button"
            onClick={onOpenExpenseModal}
            className="px-3 py-1.5 rounded-xl border border-[#DFD6C7] dark:border-[#353E2F] bg-[#EEEEEE] dark:bg-[#252C21] text-[#586348] dark:text-[#C5CEB8] font-semibold flex items-center gap-1.5 hover:bg-[#EAE2D6] transition-colors shrink-0"
          >
            <Receipt className="w-3.5 h-3.5 text-[#8B9A6E]" />
            <span>Add Expense</span>
          </button>

          <button
            type="button"
            onClick={onOpenMeetingModal}
            className="px-3 py-1.5 rounded-xl border border-[#DFD6C7] dark:border-[#353E2F] bg-[#EEEEEE] dark:bg-[#252C21] text-[#586348] dark:text-[#C5CEB8] font-semibold flex items-center gap-1.5 hover:bg-[#EAE2D6] transition-colors shrink-0"
          >
            <Calendar className="w-3.5 h-3.5 text-[#8B9A6E]" />
            <span>Note Meeting</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDraftImportant(!isDraftImportant)}
            className={`px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
              isDraftImportant
                ? 'border-[#8B9A6E] bg-[#8B9A6E]/15 text-[#586348] dark:text-[#EAF0DE]'
                : 'border-[#DFD6C7] dark:border-[#353E2F] bg-[#EEEEEE] dark:bg-[#252C21] text-[#586348] dark:text-[#C5CEB8] hover:bg-[#EAE2D6]'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isDraftImportant ? 'fill-[#8B9A6E] text-[#8B9A6E]' : ''}`} />
            <span>{isDraftImportant ? 'Important Flagged' : 'Mark Important'}</span>
          </button>

          {/* Quick Partner Simulated Reply Chip */}
          <button
            type="button"
            onClick={() => simulatePartnerReply()}
            title={`Simulate an instant realistic reply from ${partnerUser.name}`}
            className="px-3 py-1.5 rounded-xl border border-[#DFD6C7] dark:border-[#353E2F] bg-[#EEEEEE] dark:bg-[#252C21] text-[#586348] dark:text-[#C5CEB8] font-medium flex items-center gap-1.5 hover:bg-[#EAE2D6] transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8B9A6E]" />
            <span>{partnerUser.name.split(' ')[0]} Replies...</span>
          </button>
        </div>

        {/* Emoji Selector Popover */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-2 p-2 rounded-2xl bg-[#F7F2EB] dark:bg-[#252C21] border border-[#EAE2D6] dark:border-[#353E2F] shadow-xl flex flex-wrap gap-1.5"
            >
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => addEmojiToInput(emoji)}
                  className="w-8 h-8 rounded-lg hover:bg-[#EAE2D6] dark:hover:bg-[#353E2F] text-lg flex items-center justify-center transition-transform hover:scale-110"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text Input Row */}
        <form onSubmit={handleSend} className="flex items-end gap-2">
          {/* Emoji Toggle */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2.5 rounded-xl transition-colors ${
              showEmojiPicker
                ? 'text-[#8B9A6E] bg-[#EAE2D6] dark:bg-[#252C21]'
                : 'text-[#788566] hover:text-[#2D3325] dark:hover:text-white hover:bg-[#EAE2D6] dark:hover:bg-[#252C21]'
            }`}
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder={`Message #${activeChannel.name} as ${currentUser.name.split(' ')[0]}...`}
              className="w-full px-4 py-2.5 rounded-2xl border border-[#DFD6C7] dark:border-[#353E2F] bg-[#EEEEEE] dark:bg-[#252C21] text-xs sm:text-sm text-[#2D3325] dark:text-[#F7F2EB] placeholder-[#8F9882] focus:outline-none focus:ring-2 focus:ring-[#8B9A6E]/40 resize-none max-h-32 transition-all leading-relaxed"
            />
          </div>

          {/* Send Button with Tactile Micro-animation */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="submit"
            disabled={!inputText.trim()}
            className={`p-2.5 rounded-2xl flex items-center justify-center transition-all shadow-md ${
              inputText.trim()
                ? 'bg-[#8B9A6E] hover:bg-[#79875F] text-white shadow-[#8B9A6E]/30'
                : 'bg-[#EEEEEE] dark:bg-[#252C21] text-[#A7B395] cursor-not-allowed shadow-none'
            }`}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </form>
      </div>
    </div>
  );
};
