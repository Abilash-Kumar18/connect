import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  User as UserIcon,
  Sparkles,
  X,
  Check,
  Upload,
  Trash2,
  ArrowRightLeft,
  Eye,
  EyeOff,
  Plus,
  Radio,
  Camera,
  Heart,
  Coffee,
  PartyPopper,
  DollarSign,
  ShieldCheck,
  Smile,
} from 'lucide-react';
import { useConnect } from '../context/ConnectContext';
import { StickerItem } from '../data/stickersData';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'profile' | 'stickers';
}

const PRESET_STATUSES = [
  'Available 🟢',
  'In Campus Library 📚',
  'Studying for Exams 🎓',
  'Busy / In Lab 🔬',
  'Coffee Break ☕',
  'Shipping Code 🚀',
  'Taking a Nap 😴',
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'profile',
}) => {
  const {
    currentUser,
    partnerUser,
    setCurrentUserId,
    updateUserProfile,
    stickers,
    enabledStickerIds,
    toggleStickerToShow,
    setAllStickersToShow,
    addCustomSticker,
    removeCustomSticker,
  } = useConnect();

  const [activeTab, setActiveTab] = useState<'profile' | 'stickers'>(defaultTab);

  // Profile Form States
  const [name, setName] = useState(currentUser.name);
  const [handle, setHandle] = useState(currentUser.handle);
  const [role, setRole] = useState(currentUser.role);
  const [statusText, setStatusText] = useState(currentUser.statusText);
  const [statusState, setStatusState] = useState<User['statusState']>(currentUser.statusState);
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar);
  const [isSaved, setIsSaved] = useState(false);

  // Custom Sticker Form States
  const [showAddStickerForm, setShowAddStickerForm] = useState(false);
  const [newStickerName, setNewStickerName] = useState('');
  const [newStickerEmoji, setNewStickerEmoji] = useState('✨');
  const [newStickerImage, setNewStickerImage] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const stickerFileInputRef = useRef<HTMLInputElement>(null);

  // Keep state synced when switching user
  React.useEffect(() => {
    setName(currentUser.name);
    setHandle(currentUser.handle);
    setRole(currentUser.role);
    setStatusText(currentUser.statusText);
    setStatusState(currentUser.statusState);
    setAvatarPreview(currentUser.avatar);
  }, [currentUser]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setAvatarPreview(url);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim() || currentUser.name,
      handle: handle.trim() || currentUser.handle,
      role: role.trim() || currentUser.role,
      statusText: statusText.trim(),
      statusState,
      avatar: avatarPreview,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSwitchUser = () => {
    const nextId = currentUser.id === 'alex' ? 'jordan' : 'alex';
    setCurrentUserId(nextId);
  };

  const handleCustomStickerFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setNewStickerImage(url);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCreateCustomSticker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStickerImage || !newStickerName.trim()) return;
    addCustomSticker({
      name: newStickerName.trim(),
      url: newStickerImage,
      emojiBadge: newStickerEmoji || '✨',
    });
    setNewStickerName('');
    setNewStickerEmoji('✨');
    setNewStickerImage(null);
    setShowAddStickerForm(false);
  };

  const romanticStickers = stickers.filter((s) => s.category === 'romantic');
  const workStickers = stickers.filter((s) => s.category === 'work');
  const funStickers = stickers.filter((s) => s.category === 'fun');
  const dealsStickers = stickers.filter((s) => s.category === 'deals');
  const customStickers = stickers.filter((s) => s.category === 'custom');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full max-w-2xl bg-white dark:bg-[#1a1f18] rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh] overflow-hidden text-zinc-900 dark:text-zinc-100"
          >
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/70 dark:bg-zinc-900/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#8B9A6E]/15 text-[#8B9A6E] flex items-center justify-center border border-[#8B9A6E]/30 shadow-xs">
                  <Settings className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-display leading-tight">
                    Settings &amp; Duo Profile
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Manage your user details and stickers to show in chat
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation Pill Bar */}
            <div className="px-5 pt-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2 shrink-0 bg-white dark:bg-[#1a1f18]">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-[#8B9A6E] text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>User Details &amp; Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('stickers')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'stickers'
                    ? 'bg-[#8B9A6E] text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Stickers to Show</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === 'stickers'
                      ? 'bg-white/20 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {enabledStickerIds.length} active
                </span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
              {activeTab === 'profile' ? (
                /* TAB 1: USER DETAILS & PROFILE */
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  {/* Avatar Showcase & Upload */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group shrink-0">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-[#8B9A6E] flex items-center justify-center text-white font-bold text-2xl shadow-md border-2 border-white dark:border-zinc-800">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          name[0] || 'U'
                        )}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-4 h-4 rounded-full ring-2 ring-white dark:ring-zinc-900 ${
                          statusState === 'online'
                            ? 'bg-emerald-500'
                            : statusState === 'away'
                            ? 'bg-amber-500'
                            : statusState === 'busy'
                            ? 'bg-rose-500'
                            : 'bg-zinc-400'
                        }`}
                      />
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                        {name} ({handle})
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5">{role}</p>

                      <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#8B9A6E] hover:bg-[#79875F] text-white flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Photo</span>
                        </button>
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />

                        {avatarPreview && (
                          <button
                            type="button"
                            onClick={() => setAvatarPreview('')}
                            className="px-3 py-1.5 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          >
                            Remove Photo
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={handleSwitchUser}
                          className="px-3 py-1.5 rounded-xl text-xs font-medium border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition-colors"
                          title="Switch to act as partner"
                        >
                          <ArrowRightLeft className="w-3 h-3 text-[#8B9A6E]" />
                          <span>Switch to {partnerUser.name.split(' ')[0]}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#8B9A6E]/40"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                        Handle / Username
                      </label>
                      <input
                        type="text"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        placeholder="e.g. @alex"
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#8B9A6E]/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                      Role / Bio
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Duo Partner 1 · Computer Science"
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#8B9A6E]/40"
                    />
                  </div>

                  {/* Status & Availability Presence */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block">
                      Custom Status Message
                    </label>
                    <input
                      type="text"
                      value={statusText}
                      onChange={(e) => setStatusText(e.target.value)}
                      placeholder="e.g. In Campus Library 📚"
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#8B9A6E]/40"
                    />

                    {/* Quick Presets */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {PRESET_STATUSES.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setStatusText(preset)}
                          className="px-2.5 py-1 rounded-lg text-[11px] bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Availability Radio Pills */}
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1.5">
                      Presence State
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'online', label: 'Online', color: 'bg-emerald-500' },
                        { id: 'away', label: 'Away', color: 'bg-amber-500' },
                        { id: 'busy', label: 'Busy / In Lab', color: 'bg-rose-500' },
                        { id: 'offline', label: 'Invisible', color: 'bg-zinc-400' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setStatusState(item.id as any)}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                            statusState === item.id
                              ? 'border-[#8B9A6E] bg-[#8B9A6E]/15 text-[#586348] dark:text-[#EAF0DE]'
                              : 'border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100'
                          }`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-xs text-emerald-600 font-semibold">
                      {isSaved && '✓ User profile saved successfully!'}
                    </span>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#8B9A6E] hover:bg-[#79875F] text-white flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* TAB 2: STICKERS TO SHOW */
                <div className="space-y-5">
                  {/* Sticky Summary Bar */}
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#8B9A6E]" />
                        <span>Active Stickers in Chat Picker</span>
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        {enabledStickerIds.length} of {stickers.length} stickers will be shown when you open the sticker picker.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setAllStickersToShow(true)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                      >
                        Show All
                      </button>
                      <button
                        type="button"
                        onClick={() => setAllStickersToShow(false)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Hide All
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddStickerForm(!showAddStickerForm)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#8B9A6E] hover:bg-[#79875F] text-white flex items-center gap-1 transition-colors shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Sticker</span>
                      </button>
                    </div>
                  </div>

                  {/* Add Custom Sticker Form Popover */}
                  <AnimatePresence>
                    {showAddStickerForm && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleCreateCustomSticker}
                        className="p-4 rounded-2xl bg-[#8B9A6E]/10 border border-[#8B9A6E]/30 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-zinc-900 dark:text-white">
                            Upload a Custom Photo Sticker
                          </h5>
                          <button
                            type="button"
                            onClick={() => setShowAddStickerForm(false)}
                            className="text-zinc-400 hover:text-zinc-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                              Sticker Title *
                            </label>
                            <input
                              type="text"
                              required
                              value={newStickerName}
                              onChange={(e) => setNewStickerName(e.target.value)}
                              placeholder="e.g. Best Duo!"
                              className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                              Emoji Badge
                            </label>
                            <input
                              type="text"
                              value={newStickerEmoji}
                              onChange={(e) => setNewStickerEmoji(e.target.value)}
                              placeholder="✨"
                              className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-center"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                              Sticker Image *
                            </label>
                            <button
                              type="button"
                              onClick={() => stickerFileInputRef.current?.click()}
                              className="w-full px-3 py-1.5 rounded-xl border border-dashed border-[#8B9A6E] text-xs text-[#8B9A6E] hover:bg-[#8B9A6E]/10 truncate"
                            >
                              {newStickerImage ? '✓ Image Chosen' : '+ Choose File'}
                            </button>
                            <input
                              ref={stickerFileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleCustomStickerFile}
                              className="hidden"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setShowAddStickerForm(false)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!newStickerName.trim() || !newStickerImage}
                            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#8B9A6E] text-white hover:bg-[#79875F] disabled:opacity-50"
                          >
                            Add to My Stickers
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Sticker Sections */}
                  {[
                    { title: '💖 Romantic & Duo Affection', list: romanticStickers },
                    { title: '☕ Campus Study & Work Grind', list: workStickers },
                    { title: '🎉 Fun & Celebrations', list: funStickers },
                    { title: '🤝 Deals & Finance Splits', list: dealsStickers },
                    ...(customStickers.length > 0
                      ? [{ title: '🎨 Custom Uploaded Stickers', list: customStickers }]
                      : []),
                  ].map((group) => (
                    <div key={group.title} className="space-y-2.5">
                      <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 px-1">
                        {group.title}
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {group.list.map((stk) => {
                          const isShowing = enabledStickerIds.includes(stk.id);

                          return (
                            <div
                              key={stk.id}
                              className={`p-3 rounded-2xl border transition-all flex flex-col items-center text-center relative ${
                                isShowing
                                  ? 'border-[#8B9A6E] bg-white dark:bg-zinc-900 shadow-xs'
                                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 opacity-55'
                              }`}
                            >
                              {/* Visual Thumbnail */}
                              <div className="w-16 h-16 rounded-xl overflow-hidden relative mb-2 bg-zinc-200 dark:bg-zinc-800 shadow-xs">
                                <img
                                  src={stk.url}
                                  alt={stk.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                                <div className="absolute top-1 right-1 text-xs bg-white/90 dark:bg-black/70 rounded-full w-4 h-4 flex items-center justify-center">
                                  {stk.emojiBadge}
                                </div>
                              </div>

                              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate w-full mb-2">
                                {stk.name}
                              </span>

                              {/* Toggle Switch */}
                              <div className="w-full pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                                <span className="text-[10px] font-medium text-zinc-400">
                                  {isShowing ? 'Showing' : 'Hidden'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleStickerToShow(stk.id)}
                                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    isShowing ? 'bg-[#8B9A6E]' : 'bg-zinc-300 dark:bg-zinc-700'
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                      isShowing ? 'translate-x-4' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                              </div>

                              {stk.category === 'custom' && (
                                <button
                                  type="button"
                                  onClick={() => removeCustomSticker(stk.id)}
                                  className="absolute top-1.5 right-1.5 p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                  title="Delete custom sticker"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/70 dark:bg-zinc-900/70">
              <span className="text-xs text-zinc-400">
                Changes apply instantly across your duo workspace.
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#8B9A6E] hover:bg-[#79875F] text-white shadow-xs transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
