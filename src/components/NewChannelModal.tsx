import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Hash, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useConnect } from '../context/ConnectContext';
import { ChannelCategory } from '../types';
import { AVAILABLE_ICONS } from './ChannelIcon';

interface NewChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
}


const SUGGESTIONS = [
  { name: 'Apartment Groceries', cat: 'expenses' as ChannelCategory, icon: 'Receipt' },
  { name: 'Seminar Prints', cat: 'college' as ChannelCategory, icon: 'Printer' },
  { name: 'Hackathon 2026', cat: 'projects' as ChannelCategory, icon: 'Briefcase' },
  { name: 'Weekend Trip', cat: 'personal' as ChannelCategory, icon: 'Heart' },
];

export const NewChannelModal: React.FC<NewChannelModalProps> = ({ isOpen, onClose }) => {
  const { createChannel } = useConnect();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ChannelCategory>('general');
  const [selectedIcon, setSelectedIcon] = useState('MessageCircle');
  const [currency, setCurrency] = useState('₹');
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

  const applySuggestion = (s: typeof SUGGESTIONS[0]) => {
    setName(s.name);
    setCategory(s.cat);
    setSelectedIcon(s.icon);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-lg bg-[#F7F2EB] dark:bg-[#1E231B] border border-[#DFD6C7] dark:border-[#384332] rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE2D6] dark:border-[#353E2F]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8B9A6E]/15 text-[#8B9A6E] dark:text-[#A3B386] flex items-center justify-center font-bold text-lg shadow-xs">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-[#2D3325] dark:text-[#F7F2EB]">
                Create Topic Channel
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#788566] dark:text-[#A7B395] hover:text-[#2D3325] dark:hover:text-white hover:bg-[#EAE2D6] dark:hover:bg-[#252C21] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto pr-1">
          {/* Topic / Channel Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#2D3325] dark:text-[#F7F2EB] flex items-center gap-1.5">
                <span>Topic / Channel Name</span>
              </label>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#8B9A6E]/15 text-[#6E7E52] dark:text-[#A3B386]">
                Required
              </span>
            </div>

            <div
              className={`flex items-center rounded-2xl border bg-white dark:bg-[#181D15] transition-all overflow-hidden shadow-xs ${
                error
                  ? 'border-rose-400 ring-2 ring-rose-400/20'
                  : 'border-[#DFD6C7] dark:border-[#384332] focus-within:border-[#8B9A6E] focus-within:ring-2 focus-within:ring-[#8B9A6E]/30'
              }`}
            >
              <div className="pl-3.5 pr-2 py-2.5 flex items-center justify-center select-none">
                <span className="w-6 h-6 rounded-lg bg-[#8B9A6E]/15 dark:bg-[#8B9A6E]/20 text-[#6E7E52] dark:text-[#A3B386] flex items-center justify-center font-bold text-xs">
                  #
                </span>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="e.g. apartment-groceries"
                className="flex-1 bg-transparent py-2.5 pr-3 text-sm font-medium text-[#2D3325] dark:text-[#F7F2EB] placeholder-[#8F9882] dark:placeholder-[#6C7662] focus:outline-none"
                autoFocus
              />
              {name && (
                <button
                  type="button"
                  onClick={() => setName('')}
                  className="mr-3 p-1 rounded-lg text-[#8F9882] hover:text-[#2D3325] dark:hover:text-white hover:bg-[#EAE2D6] dark:hover:bg-[#252C21] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {error ? (
              <p className="text-xs text-rose-500 font-medium mt-1.5 ml-1">{error}</p>
            ) : (
              /* Quick Suggestions */
              <div className="flex items-center gap-1.5 flex-wrap pt-2">
                <span className="text-[11px] text-[#788566] dark:text-[#A7B395] font-medium mr-0.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#8B9A6E]" />
                  Suggestions:
                </span>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => applySuggestion(s)}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-[#EAE2D6]/70 dark:bg-[#252C21] text-[#586348] dark:text-[#C5CEB8] hover:bg-[#8B9A6E] hover:text-white dark:hover:bg-[#8B9A6E] transition-all border border-[#DFD6C7] dark:border-[#384332]"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#2D3325] dark:text-[#F7F2EB]">
                Description
              </label>
              <span className="text-[10px] text-[#788566] dark:text-[#A7B395]">
                Optional
              </span>
            </div>
            <div className="flex items-center rounded-2xl border border-[#DFD6C7] dark:border-[#384332] bg-white dark:bg-[#181D15] px-3.5 py-2.5 transition-all focus-within:border-[#8B9A6E] focus-within:ring-2 focus-within:ring-[#8B9A6E]/30 overflow-hidden shadow-xs">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this channel dedicated to?"
                className="w-full bg-transparent text-sm text-[#2D3325] dark:text-[#F7F2EB] placeholder-[#8F9882] dark:placeholder-[#6C7662] focus:outline-none"
              />
            </div>
          </div>


          {/* Icon Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#2D3325] dark:text-[#F7F2EB]">
                Channel Icon
              </label>
              <span className="text-[11px] text-[#788566] dark:text-[#A7B395]">
                Custom badge
              </span>
            </div>
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
                    className={`h-11 rounded-2xl flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'border-[#8B9A6E] bg-[#8B9A6E] text-white shadow-md shadow-[#8B9A6E]/30 scale-105'
                        : 'border-[#DFD6C7] dark:border-[#384332] bg-white/70 dark:bg-[#252C21]/60 text-[#788566] dark:text-[#A7B395] hover:text-[#8B9A6E] hover:border-[#8B9A6E] hover:bg-white dark:hover:bg-[#252C21]'
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
              <label className="block text-xs font-semibold text-[#2D3325] dark:text-[#F7F2EB] mb-1.5">
                Currency Symbol
              </label>
              <div className="flex gap-2">
                {['$', '€', '£', '₹', '¥'].map((sym) => {
                  const isSelected = currency === sym;
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => setCurrency(sym)}
                      className={`w-11 h-9 rounded-xl border text-sm font-semibold transition-all ${
                        isSelected
                          ? 'border-[#8B9A6E] bg-[#8B9A6E] text-white shadow-xs'
                          : 'border-[#DFD6C7] dark:border-[#384332] bg-white dark:bg-[#252C21] text-[#4A5538] dark:text-[#C5CEB8] hover:border-[#8B9A6E]'
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#EAE2D6] dark:border-[#353E2F]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-[#DFD6C7] dark:border-[#384332] text-xs font-semibold text-[#586348] dark:text-[#C5CEB8] hover:bg-[#EAE2D6] dark:hover:bg-[#252C21] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-[#8B9A6E] hover:bg-[#79875F] text-white text-xs font-semibold transition-all shadow-md shadow-[#8B9A6E]/30 active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Create Channel</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
