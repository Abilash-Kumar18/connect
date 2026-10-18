import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Search,
  Pin,
  PinOff,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  UserCheck,
  ChevronDown,
  Layers,
  Sparkles,
  ArrowRightLeft,
  X,
  RotateCcw,
  LogOut,
  SlidersHorizontal,
  MessageCircle,
  Receipt,
  Calendar,
  Star,
  User,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useConnect } from '../context/ConnectContext';
import { ChannelIcon } from './ChannelIcon';
import { ChannelCategory, Channel } from '../types';

interface SidebarProps {
  onOpenNewChannel: () => void;
  onOpenAuth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenNewChannel, onOpenAuth }) => {
  const {
    currentUser,
    partnerUser,
    setCurrentUserId,
    updateUserStatus,
    channels,
    activeChannelId,
    setActiveChannelId,
    togglePinChannel,
    searchQuery,
    setSearchQuery,
    channelFilter,
    setChannelFilter,
    darkMode,
    toggleDarkMode,
    soundEnabled,
    toggleSound,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
    resetToDefaults,
  } = useConnect();

  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Filter channels
  const filteredChannels = channels
    .filter((ch) => {
      // Category filter
      if (channelFilter === 'pinned') return ch.isPinned;
      if (channelFilter !== 'all') return ch.category === channelFilter;
      return true;
    })
    .filter((ch) => {
      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        ch.name.toLowerCase().includes(q) ||
        ch.description.toLowerCase().includes(q) ||
        (ch.lastMessageSnippet && ch.lastMessageSnippet.toLowerCase().includes(q))
      );
    })
    // Sort pinned to the top, then recent
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const timeA = a.lastMessageTimestamp || a.createdAt;
      const timeB = b.lastMessageTimestamp || b.createdAt;
      return timeB - timeA;
    });

  const handleSwitchUser = () => {
    const nextId = currentUser.id === 'alex' ? 'jordan' : 'alex';
    setCurrentUserId(nextId);
  };

  const formatRelativeTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / (60 * 1000));
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));

    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#F7F2EB] dark:bg-[#1E231B] border-r border-[#EAE2D6] dark:border-[#353E2F] text-[#2D3325] dark:text-[#F7F2EB] select-none">
      {/* Top Header: Brand Wordmark & Duo Status */}
      <div className="p-4 border-b border-[#EAE2D6] dark:border-[#353E2F]">
        <div className="flex items-center justify-between">
          <div
            onClick={() => {
              navigate('/channels');
              setIsMobileDrawerOpen(false);
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#8B9A6E] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-[#8B9A6E]/30 group-hover:scale-105 transition-transform">
              C
            </div>
            <div>
              <span className="font-bold tracking-tight font-display text-base text-[#2D3325] dark:text-[#F7F2EB] group-hover:text-[#8B9A6E] transition-colors">
                CONNECT
              </span>
              <span className="text-[10px] text-[#788566] dark:text-[#B7C2A5] block font-normal -mt-0.5">
                Duo Context Space
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenNewChannel}
              title="Create new topic channel"
              className="p-1.5 rounded-lg text-[#788566] dark:text-[#B7C2A5] hover:text-[#2D3325] dark:hover:text-white hover:bg-[#EAE2D6] dark:hover:bg-[#2A3324] transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={toggleDarkMode}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-1.5 rounded-lg text-[#788566] dark:text-[#B7C2A5] hover:text-[#2D3325] dark:hover:text-white hover:bg-[#EAE2D6] dark:hover:bg-[#2A3324] transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
              className="p-1.5 rounded-lg text-[#788566] dark:text-[#B7C2A5] hover:text-[#2D3325] dark:hover:text-white hover:bg-[#EAE2D6] dark:hover:bg-[#2A3324] transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileDrawerOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-[#788566] hover:text-[#2D3325] hover:bg-[#EAE2D6] dark:hover:bg-[#2A3324]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current User Card & Duo Switcher */}
        <div className="mt-3.5 p-2.5 rounded-2xl bg-[#EAE2D6]/60 dark:bg-[#252C21] border border-[#EAE2D6] dark:border-[#353E2F] flex items-center justify-between">
          <div
            onClick={() => {
              navigate('/profile');
              setIsMobileDrawerOpen(false);
            }}
            className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1 group"
          >
            <div className="relative">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                  currentUser.id === 'alex' ? 'bg-[#8B9A6E]' : 'bg-[#67754E]'
                }`}
              >
                {currentUser.name[0]}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#8B9A6E] ring-2 ring-[#F7F2EB] dark:ring-[#252C21]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-[#2D3325] dark:text-white truncate flex items-center gap-1.5">
                <span>{currentUser.name}</span>
                <span className="text-[10px] text-[#788566] dark:text-[#A7B395] font-normal">You</span>
              </div>
            </div>
          </div>

          {/* Quick Duo Switcher (Alex ⇄ Jordan) */}
          <button
            onClick={handleSwitchUser}
            title={`Switch to view as ${partnerUser.name}`}
            className="p-1.5 rounded-xl border border-[#D8CFC2] dark:border-[#384232] bg-[#F7F2EB] dark:bg-[#1E231B] text-[#586348] dark:text-[#C5CEB8] hover:text-[#8B9A6E] hover:border-[#8B9A6E] transition-all flex items-center gap-1 text-[11px] font-medium shrink-0 ml-1"
          >
            <ArrowRightLeft className="w-3 h-3 text-[#8B9A6E]" />
            <span className="hidden sm:inline">{partnerUser.name.split(' ')[0]}</span>
          </button>
        </div>

        {/* Top Primary Page Navigation (Individual URLs) */}
        <div className="mt-3 grid grid-cols-5 gap-1 p-1 bg-[#EAE2D6] dark:bg-[#252C21] rounded-2xl border border-[#DFD6C7] dark:border-[#353E2F]">
          {[
            {
              id: 'chat',
              label: 'Chat',
              icon: MessageCircle,
              path: `/channels/${activeChannelId || 'chan_general'}`,
              isMatch: location.pathname.startsWith('/channels'),
            },
            {
              id: 'expenses',
              label: 'Bills',
              icon: Receipt,
              path: '/expenses',
              isMatch: location.pathname === '/expenses',
            },
            {
              id: 'meetings',
              label: 'Meets',
              icon: Calendar,
              path: '/meetings',
              isMatch: location.pathname === '/meetings',
            },
            {
              id: 'notes',
              label: 'Notes',
              icon: Star,
              path: '/notes',
              isMatch: location.pathname === '/notes',
            },
            {
              id: 'profile',
              label: 'Pair',
              icon: User,
              path: '/profile',
              isMatch: location.pathname === '/profile',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileDrawerOpen(false);
                }}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-semibold transition-all ${
                  item.isMatch
                    ? 'bg-[#8B9A6E] text-white shadow-xs'
                    : 'text-[#586348] dark:text-[#C5CEB8] hover:bg-[#F7F2EB]/60 dark:hover:bg-[#1E231B]'
                }`}
                title={`Navigate to ${item.label} (${item.path})`}
              >
                <Icon
                  className={`w-3.5 h-3.5 mb-0.5 ${
                    item.isMatch ? 'text-white' : 'text-[#788566] dark:text-[#A7B395]'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar & Filter Categories */}
      <div className="p-3 space-y-2 border-b border-[#EAE2D6] dark:border-[#353E2F]">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#788566] dark:text-[#A7B395] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search channels & topics..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#DFD6C7] dark:border-[#353E2F] bg-[#EEEEEE] dark:bg-[#252C21] text-xs text-[#2D3325] dark:text-[#F7F2EB] placeholder-[#8F9882] focus:outline-none focus:ring-2 focus:ring-[#8B9A6E]/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-[#788566] hover:text-[#2D3325] text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* Filter categories tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          <button
            onClick={() => setChannelFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
              channelFilter === 'all'
                ? 'bg-[#8B9A6E] text-white shadow-xs'
                : 'bg-[#EEEEEE] dark:bg-[#252C21] text-[#586348] dark:text-[#C5CEB8] hover:bg-[#EAE2D6]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setChannelFilter('pinned')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              channelFilter === 'pinned'
                ? 'bg-[#8B9A6E] text-white shadow-xs'
                : 'bg-[#EEEEEE] dark:bg-[#252C21] text-[#586348] dark:text-[#C5CEB8] hover:bg-[#EAE2D6]'
            }`}
          >
            <Pin className="w-3 h-3" />
            <span>Pinned</span>
          </button>
          <button
            onClick={() => setChannelFilter('expenses')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
              channelFilter === 'expenses'
                ? 'bg-[#8B9A6E] text-white shadow-xs'
                : 'bg-[#EEEEEE] dark:bg-[#252C21] text-[#586348] dark:text-[#C5CEB8] hover:bg-[#EAE2D6]'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setChannelFilter('college')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
              channelFilter === 'college'
                ? 'bg-[#8B9A6E] text-white shadow-xs'
                : 'bg-[#EEEEEE] dark:bg-[#252C21] text-[#586348] dark:text-[#C5CEB8] hover:bg-[#EAE2D6]'
            }`}
          >
            College
          </button>
          <button
            onClick={() => setChannelFilter('meetings')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
              channelFilter === 'meetings'
                ? 'bg-[#8B9A6E] text-white shadow-xs'
                : 'bg-[#EEEEEE] dark:bg-[#252C21] text-[#586348] dark:text-[#C5CEB8] hover:bg-[#EAE2D6]'
            }`}
          >
            Meetings
          </button>
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {filteredChannels.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Layers className="w-8 h-8 text-[#A7B395] dark:text-[#4A5539] mx-auto mb-2" />
            <p className="text-xs font-medium text-[#586348]">No channels found</p>
            <p className="text-[11px] text-[#8F9882] mt-0.5">
              {searchQuery ? 'Try another keyword' : 'Create a topic above to begin'}
            </p>
          </div>
        ) : (
          filteredChannels.map((channel) => {
            const isChannelRoute = location.pathname.startsWith('/channels');
            const isPathMatch = location.pathname === `/channels/${channel.id}`;
            const isActive = isPathMatch || (isChannelRoute && channel.id === activeChannelId);

            return (
              <div
                key={channel.id}
                onClick={() => {
                  setActiveChannelId(channel.id);
                  navigate(`/channels/${channel.id}`);
                  setIsMobileDrawerOpen(false);
                }}
                className={`relative group p-2.5 rounded-2xl cursor-pointer transition-all duration-150 flex items-start gap-3 ${
                  isActive
                    ? 'bg-[#EAE2D6] dark:bg-[#2A3324] border border-[#8B9A6E]/70 shadow-xs'
                    : 'hover:bg-[#EAE2D6]/50 dark:hover:bg-[#252C21] border border-transparent'
                } ${channel.isPinned ? 'ring-1 ring-[#8B9A6E]/30' : ''}`}
              >
                {/* Channel Icon Container */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#8B9A6E] text-white shadow-xs'
                      : 'bg-[#EEEEEE] dark:bg-[#252C21] text-[#586348] dark:text-[#C5CEB8] group-hover:bg-[#EAE2D6]'
                  }`}
                >
                  <ChannelIcon name={channel.icon} className="w-4 h-4" />
                </div>

                {/* Channel Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-xs font-semibold truncate ${
                        isActive
                          ? 'text-[#2D3325] dark:text-white'
                          : 'text-[#4A5538] dark:text-[#EAE2D6]'
                      }`}
                    >
                      {channel.name}
                    </span>
                    <span className="text-[10px] text-[#788566] dark:text-[#A7B395] font-mono shrink-0">
                      {formatRelativeTime(channel.lastMessageTimestamp)}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#6B7558] dark:text-[#B7C2A5] truncate mt-0.5">
                    {channel.lastMessageSnippet || channel.description}
                  </p>
                </div>

                {/* Right badges & pin action */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Pin button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePinChannel(channel.id);
                    }}
                    title={channel.isPinned ? 'Unpin channel' : 'Pin channel to top'}
                    className={`p-1 rounded-md transition-opacity ${
                      channel.isPinned
                        ? 'text-[#8B9A6E] opacity-100'
                        : 'text-[#8F9882] opacity-0 group-hover:opacity-100 hover:text-[#586348]'
                    }`}
                  >
                    <Pin className={`w-3.5 h-3.5 ${channel.isPinned ? 'fill-[#8B9A6E]' : ''}`} />
                  </button>

                  {/* Unread badge */}
                  {channel.unreadCount > 0 && !isActive && (
                    <span className="w-4 h-4 rounded-full bg-[#8B9A6E] text-white text-[10px] font-bold flex items-center justify-center">
                      {channel.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Partner Connection Footer */}
      <div className="p-3 border-t border-[#EAE2D6] dark:border-[#353E2F] bg-[#EAE2D6]/40 dark:bg-[#252C21]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] text-white ${
                  partnerUser.id === 'alex' ? 'bg-[#8B9A6E]' : 'bg-[#67754E]'
                }`}
              >
                {partnerUser.name[0]}
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#8B9A6E] ring-1 ring-white dark:ring-[#252C21]" />
            </div>
            <div className="text-[11px]">
              <span className="font-semibold text-[#2D3325] dark:text-[#EAE2D6] block leading-tight">
                {partnerUser.name}
              </span>
              <span className="text-[10px] text-[#788566] dark:text-[#A7B395] truncate block">
                {partnerUser.statusText}
              </span>
            </div>
          </div>

          <button
            onClick={resetToDefaults}
            title="Reset sample data"
            className="p-1.5 rounded-lg text-[#788566] hover:text-[#2D3325] dark:hover:text-white hover:bg-[#EAE2D6] dark:hover:bg-[#353E2F]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:block w-80 lg:w-88 h-full shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-over) */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Drawer Body */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-4/5 max-w-sm h-full shadow-2xl z-50"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
