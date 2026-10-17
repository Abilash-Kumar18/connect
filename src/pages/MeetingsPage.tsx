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
          <div className="w-10 h-10 rounded-xl bg-[#8B9A6E]/15 text-[#586348] dark:text-[#C5CEB8] flex items-center justify-center border border-[#8B9A6E]/30">
            <Calendar className="w-5 h-5 text-[#8B9A6E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-display text-[#2D3325] dark:text-white">
                Meetings & Review Schedule
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#EAE2D6] dark:bg-[#252C21] text-[#586348] dark:text-[#C5CEB8] text-[11px] font-semibold">
                Direct URL: /meetings
              </span>
            </div>
            <p className="text-xs text-[#788566] dark:text-[#A7B395]">
              Synchronized milestones, advisor reviews, syncs, and calendar agendas
            </p>
          </div>
        </div>

        <button
          onClick={onOpenMeetingModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8B9A6E] hover:bg-[#79875F] text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Schedule Meeting</span>
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Top Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-3xl bg-white dark:bg-[#252C21] border border-[#EAE2D6] dark:border-[#353E2F]">
            <div className="text-xs font-semibold text-[#788566] dark:text-[#A7B395]">Total Scheduled</div>
            <div className="text-2xl font-bold font-mono text-[#586348] dark:text-[#C5CEB8] mt-2">
              {allMeetings.length}
            </div>
            <div className="text-[11px] text-[#8F9882] mt-1">Across all topic workspaces</div>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-[#252C21] border border-[#EAE2D6] dark:border-[#353E2F]">
            <div className="text-xs font-semibold text-[#788566] dark:text-[#A7B395]">Upcoming Events</div>
            <div className="text-2xl font-bold font-mono text-[#8B9A6E] mt-2">
              {allMeetings.filter((m) => !m.meeting?.isCompleted).length}
            </div>
            <div className="text-[11px] text-[#8F9882] mt-1">Ready for attendance</div>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-[#252C21] border border-[#EAE2D6] dark:border-[#353E2F]">
            <div className="text-xs font-semibold text-[#788566] dark:text-[#A7B395]">Primary Channel</div>
            <div className="text-sm font-bold text-[#2D3325] dark:text-white mt-2 truncate">
              #Meetings & Events
            </div>
            <button
              onClick={() => navigate('/channels/chan_meetings')}
              className="text-[11px] text-[#8B9A6E] hover:underline mt-1 inline-flex items-center gap-0.5"
            >
              Open Channel Chat <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Meetings List */}
        <div className="bg-white dark:bg-[#252C21] rounded-3xl border border-[#EAE2D6] dark:border-[#353E2F] p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#EAE2D6] dark:border-[#353E2F]">
            <h2 className="text-sm font-bold text-[#2D3325] dark:text-white flex items-center gap-2">
              <span>Agenda Timeline</span>
              <span className="text-xs font-normal text-[#8F9882]">({allMeetings.length})</span>
            </h2>

            <div className="flex items-center bg-[#EEEEEE] dark:bg-[#1E231B] p-1 rounded-xl text-xs border border-[#DFD6C7] dark:border-[#353E2F]">
              {(['all', 'upcoming', 'completed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                    filter === status
                      ? 'bg-[#8B9A6E] text-white shadow-xs'
                      : 'text-[#586348] dark:text-[#C5CEB8] hover:text-[#2D3325]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#EAE2D6] dark:divide-[#353E2F] mt-2">
            {allMeetings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-10 h-10 text-[#8B9A6E]/30 mx-auto mb-2" />
                <p className="text-xs font-medium text-[#788566]">No scheduled meetings yet</p>
                <button
                  onClick={onOpenMeetingModal}
                  className="mt-3 px-4 py-2 rounded-xl bg-[#8B9A6E] text-white text-xs font-semibold hover:bg-[#79875F]"
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
                    className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F7F2EB]/60 dark:hover:bg-[#1E231B]/50 px-3 rounded-2xl transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#8B9A6E]/15 text-[#586348] dark:text-[#C5CEB8] flex flex-col items-center justify-center shrink-0 border border-[#8B9A6E]/30">
                        <Calendar className="w-5 h-5 text-[#8B9A6E]" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#2D3325] dark:text-white flex items-center gap-2">
                          <span>{meeting.title}</span>
                          {meeting.isCompleted && (
                            <span className="px-2 py-0.5 rounded-full bg-[#EAE2D6] dark:bg-[#1E231B] text-[#586348] dark:text-[#C5CEB8] text-[10px] font-semibold">
                              Completed
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[#788566] dark:text-[#A7B395] mt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-medium text-[#4A5538] dark:text-[#EAE2D6]">
                            <Clock className="w-3.5 h-3.5 text-[#8B9A6E]" />
                            {meeting.date} at {meeting.time}
                          </span>
                          {meeting.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#8F9882]" />
                              {meeting.location}
                            </span>
                          )}
                          {channel && (
                            <button
                              onClick={() => navigate(`/channels/${channel.id}`)}
                              className="text-[#8B9A6E] hover:underline font-medium"
                            >
                              #{channel.name}
                            </button>
                          )}
                        </div>

                        {meeting.notes && (
                          <p className="text-xs text-[#586348] dark:text-[#C5CEB8] mt-2 bg-[#EEEEEE] dark:bg-[#1E231B] p-2.5 rounded-xl border border-[#DFD6C7] dark:border-[#353E2F]">
                            {meeting.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      {channel && (
                        <button
                          onClick={() => navigate(`/channels/${channel.id}`)}
                          className="px-3 py-1.5 rounded-xl border border-[#DFD6C7] dark:border-[#353E2F] text-[#586348] dark:text-[#C5CEB8] text-xs font-semibold hover:border-[#8B9A6E] hover:text-[#8B9A6E] transition-colors"
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
