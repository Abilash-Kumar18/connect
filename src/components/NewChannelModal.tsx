import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useConnect } from '../context/ConnectContext';
import { ChannelCategory } from '../types';
import { AVAILABLE_ICONS } from './ChannelIcon';

interface NewChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { id: ChannelCategory; label: string; desc: string }[] = [
  { id: 'general', label: 'General Chat', desc: 'Daily banter, shared links & chats' },
  { id: 'expenses', label: 'Daily Expenses', desc: 'Track spending & automatic split tallies' },
  { id: 'college', label: 'College & Prints', desc: 'Lab manuals, xerox & study materials' },
  { id: 'meetings', label: 'Meetings & Events', desc: 'Schedules, calendar invites & reviews' },
  { id: 'projects', label: 'Project Work', desc: 'Sprints, tasks, repos & deliverables' },
  { id: 'personal', label: 'Personal & Trip', desc: 'Travel planning, wishlist & ideas' },
];

export const NewChannelModal: React.FC<NewChannelModalProps> = ({ isOpen, onClose }) => {
  const { createChannel } = useConnect();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ChannelCategory>('general');
  const [selectedIcon, setSelectedIcon] = useState('MessageCircle');
  const [currency, setCurrency] = useState('$');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a channel title.');
      return;
    }
    const newChanId = createChannel({
      name: name.trim(),
      description: description.trim() || `${name} duo channel`,
      category,
      icon: selectedIcon,
      currency,
    });
    setName('');
    setDescription('');
    onClose();
    if (newChanId) {
      navigate(`/channels/${newChanId}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-500" />
              Create New Topic Channel
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Keep specific topics context-separated from standard messages
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto pr-1">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Topic / Channel Name *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400">#</span>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="e.g. Apartment Groceries, Seminar Prints, Hackathon 2026"
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this channel dedicated to?"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.id);
                    // auto pick a good default icon
                    if (cat.id === 'expenses') setSelectedIcon('Receipt');
                    else if (cat.id === 'college') setSelectedIcon('Printer');
                    else if (cat.id === 'meetings') setSelectedIcon('Calendar');
                    else if (cat.id === 'projects') setSelectedIcon('Briefcase');
                    else if (cat.id === 'personal') setSelectedIcon('Heart');
                  }}
                  className={`p-2.5 text-left rounded-xl border text-xs transition-all ${
                    category === cat.id
                      ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="font-medium">{cat.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {cat.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Choose Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVAILABLE_ICONS.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedIcon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setSelectedIcon(item.name)}
                    title={item.label}
                    className={`h-11 rounded-xl flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-indigo-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Currency setting for expense categories */}
          {(category === 'expenses' || category === 'college') && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Currency Symbol
              </label>
              <div className="flex gap-2">
                {['$', '€', '£', '₹', '¥'].map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setCurrency(sym)}
                    className={`w-10 h-9 rounded-xl border text-sm font-semibold transition-all ${
                      currency === sym
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 active:scale-95"
            >
              Create Channel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
