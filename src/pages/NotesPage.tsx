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
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="h-16 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="md:hidden p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Open Channels List"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900/50">
            <Star className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-display text-slate-900 dark:text-white">
                Important & Pinned Hub
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[11px] font-semibold">
                Direct URL: /notes
              </span>
            </div>
            <p className="text-xs text-slate-500">
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
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search across all important notes and pinned agreements..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedChannelId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedChannelId === 'all'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
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
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
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
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Star className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No important notes found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
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
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between group hover:border-amber-400 dark:hover:border-amber-500 transition-all"
                >
                  <div>
                    {/* Note Card Header */}
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full text-[10px] font-bold text-white flex items-center justify-center ${
                            isAlex ? 'bg-indigo-600' : 'bg-emerald-600'
                          }`}
                        >
                          {isAlex ? 'A' : 'J'}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {isAlex ? 'Alex Morgan' : 'Jordan Lee'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.timestamp).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {msg.isPinnedInChat && (
                          <span title="Pinned in Chat" className="p-1 text-amber-500">
                            <Pin className="w-3.5 h-3.5 fill-amber-500" />
                          </span>
                        )}
                        {msg.isImportant && (
                          <span title="Starred / High Priority" className="p-1 text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="py-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {msg.content}
                    </div>

                    {/* Expense / Meeting attachment preview if any */}
                    {msg.expense && (
                      <div className="mb-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                        <span className="font-semibold">{msg.expense.title}</span>
                        <span className="font-mono font-bold">${msg.expense.amount.toFixed(2)}</span>
                      </div>
                    )}
                    {msg.meeting && (
                      <div className="mb-2 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-800 dark:text-purple-300 flex items-center justify-between">
                        <span className="font-semibold">{msg.meeting.title}</span>
                        <span>{msg.meeting.date}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer with Channel Link */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    {channel ? (
                      <button
                        onClick={() => navigate(`/channels/${channel.id}`)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
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
                        className="text-[11px] text-slate-400 hover:text-amber-500 transition-colors"
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
