import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Calendar, Clock, MapPin, FileText } from 'lucide-react';
import { useConnect } from '../context/ConnectContext';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MeetingModal: React.FC<MeetingModalProps> = ({ isOpen, onClose }) => {
  const { activeChannel, sendMessage } = useConnect();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('Tomorrow, Oct 17');
  const [time, setTime] = useState('3:30 PM');
  const [location, setLocation] = useState('Engineering Hall Room 304');
  const [notes, setNotes] = useState('Bring laptop and 2 physical report copies.');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a meeting or event title.');
      return;
    }

    sendMessage({
      content: `📅 ${title.trim()} on ${date} at ${time}`,
      type: 'meeting',
      meeting: {
        title: title.trim(),
        date: date.trim(),
        time: time.trim(),
        location: location.trim(),
        notes: notes.trim(),
        isCompleted: false,
      },
    });

    setTitle('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#F7F2EB] dark:bg-[#1E231B] border border-[#EAE2D6] dark:border-[#353E2F] rounded-3xl p-6 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D6] dark:border-[#353E2F]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#8B9A6E]/15 text-[#8B9A6E] dark:text-[#A3B386]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                Note Meeting / Event
              </h3>
              <p className="text-[11px] text-slate-500">
                Adding to #{activeChannel?.name || 'Meetings'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-[#EEEEEE] dark:hover:bg-[#252C21] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Event / Meeting Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              placeholder="e.g. Capstone Sprint Review, Study Group"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE2D6] dark:border-[#353E2F] bg-white dark:bg-[#252C21] text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B9A6E]"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#8B9A6E]" />
                Date
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. Friday Oct 17"
                className="w-full px-3 py-2 rounded-xl border border-[#EAE2D6] dark:border-[#353E2F] bg-white dark:bg-[#252C21] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B9A6E]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#8B9A6E]" />
                Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 4:00 PM"
                className="w-full px-3 py-2 rounded-xl border border-[#EAE2D6] dark:border-[#353E2F] bg-white dark:bg-[#252C21] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B9A6E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#8B9A6E]" />
              Location / Room
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Central Library, Lab 202, Google Meet"
              className="w-full px-3.5 py-2 rounded-xl border border-[#EAE2D6] dark:border-[#353E2F] bg-white dark:bg-[#252C21] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B9A6E]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#8B9A6E]" />
              Notes / Agenda
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key items, what to bring, topics to cover"
              className="w-full px-3.5 py-2 rounded-xl border border-[#EAE2D6] dark:border-[#353E2F] bg-white dark:bg-[#252C21] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B9A6E] resize-none"
            />
          </div>

          {error && <p className="text-xs text-rose-500">{error}</p>}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#EAE2D6] dark:border-[#353E2F] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-[#EEEEEE] dark:hover:bg-[#252C21]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#8B9A6E] hover:bg-[#79875F] text-white text-xs font-semibold shadow-md shadow-[#8B9A6E]/20 active:scale-95 transition-all"
            >
              Save Meeting Card
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
