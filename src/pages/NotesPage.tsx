import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Star,
  Pin,
  Search,
  Menu,
  ChevronRight,
  FileText,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useConnect } from '../context/ConnectContext';

export const NotesPage: React.FC = () => {
  const {
    channels,
    setIsMobileDrawerOpen,
    activeMessages,
    toggleImportantMessage,
    togglePinMessageInChat,
  } = useConnect();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('all');

  const allMessagesRaw = (() => {
    try {
      const saved = localStorage.getItem('connect_messages_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return activeMessages;
  })();

  const importantNotes = (allMessagesRaw as any[]).filter(
    (m) => m.isImportant || m.isPinnedInChat
  );

  const getChannel = (channelId: string) => channels.find((c) => c.id === channelId);

  const filteredNotes = importantNotes.filter((m) => {
    if (selectedChannelId !== 'all' && m.channelId !== selectedChannelId) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const contentMatch = m.content?.toLowerCase().includes(q);
      const titleMatch = m.expense?.title?.toLowerCase().includes(q) || m.meeting?.title?.toLowerCase().includes(q);
      if (!contentMatch && !titleMatch) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F7F2EB] dark:bg-[#1E231B] text-[#2D3325] dark:text-[#F7F2EB] overflow-hidden">
      {/* Header */}
      <header className="h-16 px-4 sm:px-6 border-b border-[#EAE2D6] dark:border-[#353E2F] bg-[#F7F2EB]/95 dark:bg-[#1E231B]/95 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="md:hidden p-2 -ml-1 rounded-xl text-[#586348] dark:text-[#C5CEB8] hover:bg-[#EAE2D6] dark:hover:bg-[#252C21]"
            title="Open Channels List"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-[#8B9A6E]/15 text-[#8B9A6E] flex items-center justify-center border border-[#8B9A6E]/30">
            <Star className="w-5 h-5 fill-[#8B9A6E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-display text-[#2D3325] dark:text-white">
                Important & Pinned Hub
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#EAE2D6] dark:bg-[#252C21] text-[#586348] dark:text-[#C5CEB8] text-[11px] font-semibold">
                Direct URL: /notes
              </span>
            </div>
            <p className="text-xs text-[#788566] dark:text-[#A7B395]">
              Key agreements, study notes, and pinned reminders across all topic channels
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Search & Channel Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#788566] absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search across all important notes and pinned agreements..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl border border-[#DFD6C7] dark:border-[#353E2F] bg-white dark:bg-[#252C21] text-xs text-[#2D3325] dark:text-[#F7F2EB] placeholder-[#8F9882] focus:outline-none focus:ring-2 focus:ring-[#8B9A6E]/40"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedChannelId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedChannelId === 'all'
                  ? 'bg-[#8B9A6E] text-white shadow-xs'
                  : 'bg-white dark:bg-[#252C21] border border-[#DFD6C7] dark:border-[#353E2F] text-[#586348] dark:text-[#C5CEB8] hover:bg-[#EAE2D6]'
              }`}
            >
              All Topics ({importantNotes.length})
            </button>
            {channels.map((ch) => {
              const count = importantNotes.filter((n) => n.channelId === ch.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannelId(ch.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedChannelId === ch.id
                      ? 'bg-[#8B9A6E] text-white shadow-xs'
                      : 'bg-white dark:bg-[#252C21] border border-[#DFD6C7] dark:border-[#353E2F] text-[#586348] dark:text-[#C5CEB8] hover:bg-[#EAE2D6]'
                  }`}
                >
                  #{ch.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#252C21] rounded-3xl border border-[#EAE2D6] dark:border-[#353E2F]">
            <Star className="w-12 h-12 text-[#8B9A6E]/30 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#2D3325] dark:text-white">
              No important notes found
            </h3>
            <p className="text-xs text-[#788566] max-w-sm mx-auto mt-1">
              Star or pin messages in any channel to keep important references right here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map((msg) => {
              const channel = getChannel(msg.channelId);
              const isAlex = msg.senderId === 'alex';

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-3xl bg-white dark:bg-[#252C21] border border-[#EAE2D6] dark:border-[#353E2F] shadow-xs flex flex-col justify-between group hover:border-[#8B9A6E] transition-all"
                >
                  <div>
                    {/* Note Card Header */}
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#EAE2D6] dark:border-[#353E2F]">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full text-[10px] font-bold text-white flex items-center justify-center ${
                            isAlex ? 'bg-[#8B9A6E]' : 'bg-[#67754E]'
                          }`}
                        >
                          {isAlex ? 'A' : 'J'}
                        </span>
                        <span className="text-xs font-semibold text-[#2D3325] dark:text-white">
                          {isAlex ? 'Alex Morgan' : 'Jordan Lee'}
                        </span>
                        <span className="text-[10px] text-[#8F9882]">
                          {new Date(msg.timestamp).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {msg.isPinnedInChat && (
                          <span title="Pinned in Chat" className="p-1 text-[#8B9A6E]">
                            <Pin className="w-3.5 h-3.5 fill-[#8B9A6E]" />
                          </span>
                        )}
                        {msg.isImportant && (
                          <span title="Starred / High Priority" className="p-1 text-[#8B9A6E]">
                            <Star className="w-3.5 h-3.5 fill-[#8B9A6E]" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="py-3 text-xs text-[#2D3325] dark:text-[#F7F2EB] leading-relaxed">
                      {msg.content}
                    </div>

                    {/* Expense / Meeting attachment preview if any */}
                    {msg.expense && (
                      <div className="mb-2 p-2.5 rounded-xl bg-[#EEEEEE] dark:bg-[#1E231B] border border-[#DFD6C7] dark:border-[#353E2F] text-xs text-[#2D3325] dark:text-[#F7F2EB] flex items-center justify-between">
                        <span className="font-semibold">{msg.expense.title}</span>
                        <span className="font-mono font-bold text-[#586348]">${msg.expense.amount.toFixed(2)}</span>
                      </div>
                    )}
                    {msg.meeting && (
                      <div className="mb-2 p-2.5 rounded-xl bg-[#EEEEEE] dark:bg-[#1E231B] border border-[#DFD6C7] dark:border-[#353E2F] text-xs text-[#2D3325] dark:text-[#F7F2EB] flex items-center justify-between">
                        <span className="font-semibold">{msg.meeting.title}</span>
                        <span className="text-[#586348]">{msg.meeting.date}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer with Channel Link */}
                  <div className="pt-3 border-t border-[#EAE2D6] dark:border-[#353E2F] flex items-center justify-between">
                    {channel ? (
                      <button
                        onClick={() => navigate(`/channels/${channel.id}`)}
                        className="text-xs font-semibold text-[#8B9A6E] hover:underline flex items-center gap-1"
                      >
                        <span>#{channel.name}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span />
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleImportantMessage(msg.id)}
                        className="text-[11px] text-[#788566] hover:text-[#8B9A6E] transition-colors"
                      >
                        {msg.isImportant ? 'Unstar' : 'Star'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
