import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Smile,
  Leaf,
  Coffee,
  Trophy,
  Car,
  Lightbulb,
  Hash,
  Flag,
  Search,
  X,
  Sticker as StickerIcon,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useConnect } from '../context/ConnectContext';

interface EmojiStickerPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  onSelectSticker: (sticker: { name: string; url: string }) => void;
  onUploadCustomSticker?: (file: File) => void;
}

const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: 'Smileys & People',
    icon: Smile,
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇',
      '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑',
      '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬',
      '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵',
      '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁',
      '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱',
      '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '💀', '☠️',
      '💩', '🤡', '👻', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽',
      '🙀', '😿', '😾', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
      '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊',
      '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🧠', '🫀',
    ],
  },
  {
    id: 'nature',
    name: 'Animals & Nature',
    icon: Leaf,
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷',
      '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴',
      '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍',
      '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳',
      '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪',
      '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐',
      '🦌', '🐕', '🐩', '🦮', '🐈', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀',
      '🍁', '🍂', '🍃', '🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '💐', '🍄', '🌱',
    ],
  },
  {
    id: 'food',
    name: 'Food & Drink',
    icon: Coffee,
    emojis: [
      '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑',
      '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽',
      '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚',
      '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🫓',
      '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🍝', '🍜', '🍲', '🍛',
      '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡',
      '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩',
      '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🫖', '🍵', '🍶', '🍾', '🍷', '🍸',
      '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧋', '🧃', '🧉', '🧊',
    ],
  },
  {
    id: 'activities',
    name: 'Activities',
    icon: Trophy,
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸',
      '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋',
      '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸',
      '⛹️', '🤺', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴',
      '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🤹',
      '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🎻',
      '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩',
    ],
  },
  {
    id: 'travel',
    name: 'Travel & Places',
    icon: Car,
    emojis: [
      '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛',
      '🚜', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠',
      '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉',
      '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️',
      '🛳️', '⛴️', '🚢', '⚓', '🛟', '⛽', '🚧', '🚦', '🚥', '🗺️', '🗿', '🗽', '🗼',
      '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲', '⛱️', '🏖️', '🏝️', '🏜️', '🌋',
      '⛰️', '🏔️', '🗻', '🏕️', '⛺', '🏠', '🏡', '🏢', '🏣', '🏥', '🏦', '🏨',
    ],
  },
  {
    id: 'objects',
    name: 'Objects',
    icon: Lightbulb,
    emojis: [
      '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '💽', '💾',
      '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟',
      '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳',
      '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴',
      '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔨',
      '⚒️', '🛠️', '⛏️', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣',
      '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿',
      '🧿', '💈', '⚗️', '🔭', '🔬', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🧪',
    ],
  },
  {
    id: 'symbols',
    name: 'Symbols',
    icon: Hash,
    emojis: [
      '💘', '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💔', '❤️‍🔥', '❤️‍🩹', '❤️',
      '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💯', '💢', '💬', '👁️‍🗨️',
      '🗨️', '🗯️', '💭', '💤', '💮', '♨️', '🛑', '🌀', '♠️', '♥️', '♦️', '♣️',
      '🃏', '🔇', '🔈', '🔉', '🔊', '📢', '📣', '🔔', '🔕', '🎵', '🎶', '🏧',
      '⚠️', '⛔', '🚫', '☢️', '☣️', '⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️',
      '↖️', '↕️', '↔️', '↩️', '↪️', '🔄', '🔙', '🔚', '🔛', '🔜', '🔝', '🛐',
      '⚛️', '🕉️', '✡️', '☸️', '☯️', '✝️', '☮️', '♈', '♉', '♊', '♋', '♌',
      '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🔀', '🔁', '▶️', '⏸️', '⏹️',
      '⏺️', '📶', '♀️', '♂️', '✖️', '➕', '➖', '➗', '♾️', '‼️', '⁉️', '❓',
      '❔', '❕', '❗', '⭕', '✅', '☑️', '✔️', '❌', '❎', '✨', '⭐', '🌟',
    ],
  },
  {
    id: 'flags',
    name: 'Flags',
    icon: Flag,
    emojis: [
      '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇮🇳', '🇺🇸', '🇬🇧', '🇨🇦',
      '🇦🇺', '🇩🇪', '🇫🇷', '🇯🇵', '🇰🇷', '🇨🇳', '🇧🇷', '🇪🇸', '🇮🇹', '🇷🇺', '🇲🇽', '🇮🇩',
      '🇸🇦', '🇹🇷', '🇿🇦', '🇳🇱', '🇸🇪', '🇳🇴', '🇩🇰', '🇫🇮', '🇵🇱', '🇳🇿', '🇸🇬', '🇲🇾',
    ],
  },
];

export const EmojiStickerPicker: React.FC<EmojiStickerPickerProps> = ({
  isOpen,
  onClose,
  onSelectEmoji,
  onSelectSticker,
  onUploadCustomSticker,
}) => {
  const { stickers, enabledStickerIds } = useConnect();
  const [activeTab, setActiveTab] = useState<'emoji' | 'sticker'>('emoji');
  const [activeCategory, setActiveCategory] = useState<string>('smileys');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([
    '❤️', '😊', '👍', '🔥', '😂', '✨', '🎉', '☕', '🙌', '😍', '👏', '🚀'
  ]);
  const pickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stickersToShow = useMemo(() => {
    const list = (stickers || []).filter((s) => (enabledStickerIds || []).includes(s.id));
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((s) => s.name.toLowerCase().includes(q));
  }, [stickers, enabledStickerIds, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleEmojiClick = (emoji: string) => {
    onSelectEmoji(emoji);
    setRecentEmojis((prev) => {
      const filtered = prev.filter((e) => e !== emoji);
      return [emoji, ...filtered].slice(0, 24);
    });
  };

  const currentCategoryData = useMemo(() => {
    return EMOJI_CATEGORIES.find((cat) => cat.id === activeCategory) || EMOJI_CATEGORIES[0];
  }, [activeCategory]);

  const filteredEmojis = useMemo(() => {
    if (!searchQuery.trim()) {
      if (activeCategory === 'recent') {
        return recentEmojis;
      }
      return currentCategoryData.emojis;
    }
    const query = searchQuery.toLowerCase();
    // Search across all categories
    const results: string[] = [];
    EMOJI_CATEGORIES.forEach((cat) => {
      if (cat.name.toLowerCase().includes(query)) {
        results.push(...cat.emojis.slice(0, 16));
      }
    });
    // Fallback: return top emojis if query matches
    if (results.length === 0) {
      return EMOJI_CATEGORIES[0].emojis.slice(0, 36);
    }
    return Array.from(new Set(results));
  }, [searchQuery, activeCategory, currentCategoryData, recentEmojis]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadCustomSticker) {
      onUploadCustomSticker(file);
    }
    if (e.target) e.target.value = '';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={pickerRef}
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          className="absolute bottom-16 left-3 sm:left-6 z-50 bg-white dark:bg-[#1a1f18] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-[340px] sm:w-[380px] h-[420px] flex flex-col overflow-hidden backdrop-blur-md"
        >
          {/* TOP CATEGORY BAR (Image 3 Header) */}
          {activeTab === 'emoji' && (
            <div className="flex items-center justify-between px-2 pt-2 pb-1 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('recent');
                  setSearchQuery('');
                }}
                className={`p-1.5 rounded-lg transition-colors relative ${
                  activeCategory === 'recent'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
                title="Recent"
              >
                <Clock className="w-4 h-4" />
                {activeCategory === 'recent' && (
                  <div className="absolute bottom-0 left-1 right-1 h-0.5 bg-emerald-500 rounded-full" />
                )}
              </button>

              {EMOJI_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setSearchQuery('');
                    }}
                    className={`p-1.5 rounded-lg transition-colors relative ${
                      isActive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                    title={cat.name}
                  >
                    <Icon className="w-4 h-4" />
                    {isActive && (
                      <div className="absolute bottom-0 left-1 right-1 h-0.5 bg-emerald-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* SEARCH BAR (Image 3) */}
          <div className="p-2.5 shrink-0">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'emoji' ? 'Search emoji' : 'Search stickers'}
                className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/90 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-zinc-400 hover:text-zinc-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 overflow-y-auto px-3 pb-2 scrollbar-thin">
            {activeTab === 'emoji' ? (
              <div>
                <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-2 px-1">
                  {searchQuery
                    ? `Search results for "${searchQuery}"`
                    : activeCategory === 'recent'
                    ? 'Recently Used'
                    : currentCategoryData.name}
                </div>

                <div className="grid grid-cols-8 gap-1.5 text-center">
                  {filteredEmojis.map((emoji, idx) => (
                    <button
                      key={`${emoji}-${idx}`}
                      type="button"
                      onClick={() => handleEmojiClick(emoji)}
                      className="w-8 h-8 flex items-center justify-center text-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-transform hover:scale-125 cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* STICKERS TAB */
              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    Stickers & Reaction Badges
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Sticker</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {stickersToShow.length === 0 ? (
                  <div className="py-10 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl mb-2 shadow-inner">
                      🎨
                    </div>
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                      No stickers selected to show
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-1 max-w-[220px]">
                      Enable your favorite stickers in Settings (⚙️) near the CONNECT heading, or upload your own!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2.5">
                    {stickersToShow.map((stk) => (
                      <button
                        key={stk.id}
                        type="button"
                        onClick={() => {
                          onSelectSticker({ name: stk.name, url: stk.url });
                          onClose();
                        }}
                        className="group p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden relative mb-1.5 bg-zinc-200 dark:bg-zinc-700 shadow-xs group-hover:scale-105 transition-transform">
                          <img
                            src={stk.url}
                            alt={stk.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {stk.emojiBadge && (
                            <div className="absolute top-1 right-1 text-sm bg-white/80 dark:bg-black/60 rounded-full w-5 h-5 flex items-center justify-center">
                              {stk.emojiBadge}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-200 truncate w-full">
                          {stk.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* BOTTOM SWITCHER BAR (Image 3: Emoji | Sticker) - NO GIF TAB PER USER REQUEST */}
          <div className="p-1.5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/80 flex items-center justify-center gap-6 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('emoji')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'emoji'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Smile className="w-4 h-4" />
              <span>Emoji</span>
            </button>

            {/* STICKER TAB */}
            <button
              type="button"
              onClick={() => setActiveTab('sticker')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'sticker'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <StickerIcon className="w-4 h-4" />
              <span>Stickers</span>
            </button>
            {/* NOTE: GIF IS EXPLICITLY DISALLOWED PER USER INSTRUCTION "don't allow gif" */}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
