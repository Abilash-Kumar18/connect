import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  CheckCircle2,
  Menu,
  ChevronRight,
  CalendarCheck,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useConnect } from '../context/ConnectContext';

interface MeetingsPageProps {
  onOpenMeetingModal: () => void;
}

export const MeetingsPage: React.FC<MeetingsPageProps> = ({ onOpenMeetingModal }) => {
  const { channels, setIsMobileDrawerOpen, activeMessages } = useConnect();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  const allMessagesRaw = (() => {
    try {
      const saved = localStorage.getItem('connect_messages_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return activeMessages;
  })();

  const allMeetings = (allMessagesRaw as any[]).filter(
    (m) => m.type === 'meeting' && m.meeting
  );

  const getChannel = (channelId: string) => channels.find((c) => c.id === channelId);

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
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-900/50">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-display text-slate-900 dark:text-white">
                Meetings & Review Schedule
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] font-semibold">
                Direct URL: /meetings
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Synchronized milestones, advisor reviews, syncs, and calendar agendas
            </p>
          </div>
        </div>

        <button
          onClick={onOpenMeetingModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Schedule Meeting</span>
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Top Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500">Total Scheduled</div>
            <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-2">
              {allMeetings.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Across all topic workspaces</div>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500">Upcoming Events</div>
            <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-2">
              {allMeetings.filter((m) => !m.meeting?.isCompleted).length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Ready for attendance</div>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500">Primary Channel</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-2 truncate">
              #Meetings & Events
            </div>
            <button
              onClick={() => navigate('/channels/chan_meetings')}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline mt-1 inline-flex items-center gap-0.5"
            >
              Open Channel Chat <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Meetings List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Agenda Timeline</span>
              <span className="text-xs font-normal text-slate-400">({allMeetings.length})</span>
            </h2>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
              {(['all', 'upcoming', 'completed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                    filter === status
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 mt-2">
            {allMeetings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-500">No scheduled meetings yet</p>
                <button
                  onClick={onOpenMeetingModal}
                  className="mt-3 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold"
                >
                  Schedule First Meeting
                </button>
              </div>
            ) : (
              allMeetings.map((msg) => {
                const meeting = msg.meeting!;
                const channel = getChannel(msg.channelId);

                return (
                  <div
                    key={msg.id}
                    className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 px-3 rounded-2xl transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex flex-col items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900/40">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{meeting.title}</span>
                          {meeting.isCompleted && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold">
                              Completed
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-purple-500" />
                            {meeting.date} at {meeting.time}
                          </span>
                          {meeting.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {meeting.location}
                            </span>
                          )}
                          {channel && (
                            <button
                              onClick={() => navigate(`/channels/${channel.id}`)}
                              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                            >
                              #{channel.name}
                            </button>
                          )}
                        </div>

                        {meeting.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            {meeting.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      {channel && (
                        <button
                          onClick={() => navigate(`/channels/${channel.id}`)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:border-purple-400 transition-colors"
                        >
                          View in Chat
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
