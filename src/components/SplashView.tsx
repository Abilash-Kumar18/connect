import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Layers, Receipt, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';

interface SplashViewProps {
  onEnter: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ onEnter }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1F17] text-[#F7F2EB] overflow-hidden px-4">
      {/* Subtle background ambient mesh */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#8B9A6E]/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#EAE2D6]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8B9A6E]/15 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-xl w-full text-center py-10 px-6 sm:px-10 rounded-3xl bg-[#22291F]/90 backdrop-blur-xl border border-[#384332] shadow-2xl shadow-black/50"
      >
        {/* Animated Brand Emblem */}
        <motion.div
          initial={{ rotate: -15, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="mx-auto w-20 h-20 mb-6 rounded-2xl bg-gradient-to-tr from-[#8B9A6E] via-[#A8B78D] to-[#EAE2D6] p-0.5 shadow-xl shadow-[#8B9A6E]/30 flex items-center justify-center"
        >
          <div className="w-full h-full bg-[#181D15] rounded-[14px] flex items-center justify-center relative overflow-hidden">
            {/* Geometric interconnected duo circles */}
            <div className="absolute -left-1 w-8 h-8 rounded-full border-2 border-[#8B9A6E] opacity-90" />
            <div className="absolute -right-1 w-8 h-8 rounded-full border-2 border-[#EAE2D6] opacity-90" />
            <div className="w-3.5 h-3.5 rounded-full bg-white shadow-md z-10 animate-ping opacity-60" />
            <div className="w-2.5 h-2.5 rounded-full bg-white z-20" />
          </div>
        </motion.div>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-display text-white">
            CONNECT
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#B9C4A7] font-medium">
            Purpose-Driven Duo Communication
          </p>
        </motion.div>

        {/* Core Value Proposition */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-4 text-xs sm:text-sm text-[#DFD6C7] leading-relaxed max-w-md mx-auto"
        >
          No more lost expenses, buried prints, or forgotten meeting dates in an endless single chat.
          Organize your two-person conversations into dedicated topic channels.
        </motion.p>

        {/* Feature Grid Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="grid grid-cols-3 gap-3 my-8 text-left"
        >
          <div className="p-3 rounded-2xl bg-[#1C2219]/80 border border-[#353F2E]">
            <Layers className="w-5 h-5 text-[#8B9A6E] mb-2" />
            <div className="text-xs font-semibold text-[#F7F2EB]">Context Channels</div>
            <div className="text-[11px] text-[#A7B395] mt-0.5">Separate work, college & fun</div>
          </div>
          <div className="p-3 rounded-2xl bg-[#1C2219]/80 border border-[#353F2E]">
            <Receipt className="w-5 h-5 text-[#8B9A6E] mb-2" />
            <div className="text-xs font-semibold text-[#F7F2EB]">Daily Expenses</div>
            <div className="text-[11px] text-[#A7B395] mt-0.5">Auto split & balance tally</div>
          </div>
          <div className="p-3 rounded-2xl bg-[#1C2219]/80 border border-[#353F2E]">
            <Calendar className="w-5 h-5 text-[#DFD6C7] mb-2" />
            <div className="text-xs font-semibold text-[#F7F2EB]">Meeting Notes</div>
            <div className="text-[11px] text-[#A7B395] mt-0.5">Dates, reviews & schedules</div>
          </div>
        </motion.div>

        {/* CTA Launch Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={onEnter}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#8B9A6E] hover:bg-[#79875F] text-white font-semibold text-sm tracking-wide shadow-lg shadow-[#8B9A6E]/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>Open CONNECT</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        <div className="mt-6 text-[11px] text-[#788566] flex items-center justify-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#8B9A6E]" />
          <span>Local persistence enabled · Cross-tab real-time sync</span>
        </div>
      </motion.div>
    </div>
  );
};
