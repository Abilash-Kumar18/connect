import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Image as ImageIcon,
  Camera,
  Headphones,
  User,
  BarChart2,
  Calendar,
  Sparkles,
  Receipt,
} from 'lucide-react';

interface AttachmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDocument: () => void;
  onSelectPhotosVideos: () => void;
  onSelectCamera: () => void;
  onSelectAudio: () => void;
  onSelectContact: () => void;
  onSelectPoll: () => void;
  onSelectEvent: () => void;
  onSelectNewSticker: () => void;
  onSelectExpense?: () => void;
}

export const AttachmentMenu: React.FC<AttachmentMenuProps> = ({
  isOpen,
  onClose,
  onSelectDocument,
  onSelectPhotosVideos,
  onSelectCamera,
  onSelectAudio,
  onSelectContact,
  onSelectPoll,
  onSelectEvent,
  onSelectNewSticker,
  onSelectExpense,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

  const menuItems = [
    {
      id: 'document',
      label: 'Document',
      icon: FileText,
      bgColor: 'bg-[#7F66FF]',
      action: onSelectDocument,
    },
    {
      id: 'photos_videos',
      label: 'Photos & videos',
      icon: ImageIcon,
      bgColor: 'bg-[#007AFF]',
      action: onSelectPhotosVideos,
    },
    {
      id: 'camera',
      label: 'Camera',
      icon: Camera,
      bgColor: 'bg-[#FF2D55]',
      action: onSelectCamera,
    },
    {
      id: 'audio',
      label: 'Audio',
      icon: Headphones,
      bgColor: 'bg-[#FF9500]',
      action: onSelectAudio,
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: User,
      bgColor: 'bg-[#00A8FF]',
      action: onSelectContact,
    },
    {
      id: 'poll',
      label: 'Poll',
      icon: BarChart2,
      bgColor: 'bg-[#FFC048]',
      action: onSelectPoll,
    },
    {
      id: 'event',
      label: 'Event',
      icon: Calendar,
      bgColor: 'bg-[#FF4757]',
      action: onSelectEvent,
    },
    {
      id: 'new_sticker',
      label: 'New sticker',
      icon: Sparkles,
      bgColor: 'bg-[#00D2D3]',
      action: onSelectNewSticker,
    },
    ...(onSelectExpense
      ? [
          {
            id: 'expense',
            label: 'Add Expense',
            icon: Receipt,
            bgColor: 'bg-[#8B9A6E]',
            action: onSelectExpense,
          },
        ]
      : []),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="absolute bottom-16 left-3 z-50 bg-white dark:bg-[#1f241d] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-2 min-w-[200px] w-52 overflow-hidden backdrop-blur-md"
        >
          <div className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className="flex items-center gap-3.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all hover:translate-x-0.5 text-left group"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs ${item.bgColor} transition-transform group-hover:scale-110`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
