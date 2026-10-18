import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Image as ImageIcon,
  Upload,
  X,
  Trash2,
  Check,
  Eye,
  Sparkles,
} from 'lucide-react';
import { useConnect } from '../context/ConnectContext';
import { BackgroundSettings } from '../types';

interface WallpaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelId?: string;
  channelName?: string;
}

// Preset aesthetic backgrounds curated for duo chat
const PRESET_WALLPAPERS = [
  {
    id: 'minimal_arch',
    title: 'Monochrome Architecture',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    category: 'Architecture',
  },
  {
    id: 'cozy_coffee',
    title: 'Warm Cafe Glow',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    category: 'Cozy',
  },
  {
    id: 'mountain_mist',
    title: 'Moody Highlands',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    category: 'Nature',
  },
  {
    id: 'night_stars',
    title: 'Cosmic Duo Night',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    category: 'Night',
  },
  {
    id: 'abstract_dark',
    title: 'Minimalist Charcoal',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    category: 'Abstract',
  },
];

// Utility: compress and resize uploaded photo to guarantee fast loading and save to localStorage
const compressImage = (file: File, maxWidth = 1600, quality = 0.82): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const WallpaperModal: React.FC<WallpaperModalProps> = ({
  isOpen,
  onClose,
  channelId,
  channelName,
}) => {
  const { activeChannel, getChatBackground, setChatBackground } = useConnect();
  const targetChannelId = channelId || activeChannel?.id || 'chan_general';

  const currentBg = getChatBackground(targetChannelId);

  // Modal form state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [opacity, setOpacity] = useState<number>(0.35);
  const [blur, setBlur] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state on modal open
  useEffect(() => {
    if (isOpen) {
      if (currentBg) {
        setSelectedImage(currentBg.imageUrl);
        setOpacity(currentBg.opacity ?? 0.35);
        setBlur(currentBg.blur ?? 0);
      } else {
        setSelectedImage(null);
        setOpacity(0.35);
        setBlur(0);
      }
      setUploadError(null);
    }
  }, [isOpen, currentBg]);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    setUploadError(null);
    setIsProcessing(true);
    try {
      const dataUrl = await compressImage(file);
      setSelectedImage(dataUrl);
    } catch {
      setUploadError('Failed to process image. Please try a different photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleSave = () => {
    if (selectedImage) {
      const settings: BackgroundSettings = {
        imageUrl: selectedImage,
        opacity,
        blur,
      };
      setChatBackground(targetChannelId, settings);
    } else {
      setChatBackground(targetChannelId, null);
    }
    onClose();
  };

  const handleRemove = () => {
    setChatBackground(targetChannelId, null);
    setChatBackground('global', null);
    setSelectedImage(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-white dark:bg-[#121214] text-zinc-900 dark:text-zinc-100 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 sm:p-6 z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-zinc-900 dark:text-white">
                  Chat Wallpaper & Photo Background
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Upload your personal photo to customize your chat space
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Upload Drop Zone */}
          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                isDragging
                  ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900/80 scale-[1.01]'
                  : 'border-zinc-300 dark:border-zinc-800 hover:border-zinc-500 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-900/40'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 mx-auto flex items-center justify-center mb-2 shadow-xs">
                {isProcessing ? (
                  <Sparkles className="w-6 h-6 animate-spin text-zinc-900 dark:text-white" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {isProcessing ? 'Processing photo...' : 'Click or drag photo here to upload'}
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                Supports JPG, PNG, WebP · Auto-optimized for instant loading & localStorage sync
              </p>
            </div>
            {uploadError && (
              <p className="text-xs text-rose-500 font-medium mt-1.5 px-1">{uploadError}</p>
            )}
          </div>

          {/* Real-time Miniature Preview */}
          {selectedImage && (
            <div className="mt-4 p-3 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
              <div className="flex items-center justify-between pb-2 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
                  Live Chat Preview
                </span>
                <span className="text-[10px] opacity-75">Bubbles automatically adjust contrast</span>
              </div>

              {/* Preview Window with photo in background */}
              <div className="relative rounded-xl overflow-hidden h-40 flex flex-col justify-end p-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-950">
                {/* Background image in preview */}
                <div
                  className="absolute inset-0 bg-cover bg-center pointer-events-none transition-all"
                  style={{
                    backgroundImage: `url(${selectedImage})`,
                    opacity,
                    filter: blur > 0 ? `blur(${blur}px)` : undefined,
                  }}
                />
                {/* Contrast overlay */}
                <div className="absolute inset-0 pointer-events-none bg-white/20 dark:bg-black/40" />

                {/* Simulated messages inside preview */}
                <div className="relative z-10 space-y-2">
                  <div className="flex justify-start">
                    <div className="bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100 px-3 py-1.5 rounded-xl rounded-bl-xs text-[11px] shadow-sm max-w-[75%] border border-zinc-200/60 dark:border-zinc-800">
                      Awesome, heading over now!
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 px-3 py-1.5 rounded-xl rounded-br-xs text-[11px] shadow-sm max-w-[75%] font-medium">
                      See you at the library ☕
                    </div>
                  </div>
                </div>
              </div>

              {/* Sliders for Opacity & Blur */}
              <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 mb-1">
                    <span className="font-semibold">Photo Opacity</span>
                    <span className="font-mono text-[11px]">{Math.round(opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="w-full accent-zinc-900 dark:accent-white cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 mb-1">
                    <span className="font-semibold">Soft Blur</span>
                    <span className="font-mono text-[11px]">{blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="1"
                    value={blur}
                    onChange={(e) => setBlur(parseInt(e.target.value, 10))}
                    className="w-full accent-zinc-900 dark:accent-white cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Preset Photo Backdrops */}
          <div className="mt-4">
            <h5 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
              Or pick an aesthetic photography backdrop
            </h5>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {PRESET_WALLPAPERS.map((preset) => {
                const isSelected = selectedImage === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedImage(preset.url);
                      setUploadError(null);
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-4/3 group border transition-all ${
                      isSelected
                        ? 'ring-2 ring-zinc-900 dark:ring-white border-transparent scale-95 shadow-md'
                        : 'border-zinc-200 dark:border-zinc-800 hover:opacity-90'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-white font-medium px-1 text-center truncate">
                        {preset.category}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
            <div>
              {currentBg && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Wallpaper</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!selectedImage}
                className={`px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 ${
                  selectedImage
                    ? 'bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-950'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed shadow-none'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Background</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
