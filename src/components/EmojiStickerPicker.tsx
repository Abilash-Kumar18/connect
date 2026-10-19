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

const BUILT_IN_STICKERS = [
  {
    id: 'love_duo',
    name: 'Love You!',
    url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '💖',
  },
  {
    id: 'coffee_break',
    name: 'Coffee Time',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '☕',
  },
  {
    id: 'ship_rocket',
    name: "Let's Ship It!",
    url: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '🚀',
  },
  {
    id: 'celebrate_party',
    name: 'Party Time!',
    url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '🎉',
  },
  {
    id: 'pizza_treat',
    name: 'Pizza Split',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '🍕',
  },
  {
    id: 'coding_grind',
    name: 'Coding Hard',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '💻',
  },
  {
    id: 'handshake_deal',
    name: 'Agreed!',
    url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '🤝',
  },
  {
    id: 'money_settled',
    name: 'Paid Up!',
    url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '💸',
  },
  {
    id: 'on_my_way',
    name: 'On My Way!',
    url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '🏃',
  },
  {
    id: 'awesome_applause',
    name: 'Awesome Work!',
    url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '👏',
  },
  {
    id: 'cute_kitty',
    name: 'Kitty Hug',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '🐱',
  },
  {
    id: 'happy_pup',
    name: 'Happy Pup',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&auto=format&fit=crop&q=80',
    emojiBadge: '🐶',
  },
];

export const EmojiStickerPicker: React.FC<EmojiStickerPickerProps> = ({
  isOpen,
  onClose,
  onSelectEmoji,
  onSelectSticker,
  onUploadCustomSticker,
}) => {
  const [activeTab, setActiveTab] = useState<'emoji' | 'sticker'>('emoji');
  const [activeCategory, setActiveCategory] = useState<string>('smileys');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([
    '❤️', '😊', '👍', '🔥', '😂', '✨', '🎉', '☕', '🙌', '😍', '👏', '🚀'
  ]);
  const pickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

                <div className="grid grid-cols-3 gap-2.5">
                  {BUILT_IN_STICKERS.map((stk) => (
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
                        <div className="absolute top-1 right-1 text-sm bg-white/80 dark:bg-black/60 rounded-full w-5 h-5 flex items-center justify-center">
                          {stk.emojiBadge}
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-200 truncate w-full">
                        {stk.name}
                      </span>
                    </button>
                  ))}
                </div>
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
