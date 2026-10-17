import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  User,
  ArrowRightLeft,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  RotateCcw,
  ShieldCheck,
  Key,
  Radio,
  CheckCircle2,
  Menu,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useConnect } from '../context/ConnectContext';

export const ProfilePage: React.FC = () => {
  const {
    currentUser,
    partnerUser,
    setCurrentUserId,
    updateUserStatus,
    darkMode,
    toggleDarkMode,
    soundEnabled,
    toggleSound,
    resetToDefaults,
    setIsMobileDrawerOpen,
  } = useConnect();
  const navigate = useNavigate();

  const [statusText, setStatusText] = useState(currentUser.statusText);
  const [statusSaved, setStatusSaved] = useState(false);

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserStatus(statusText, currentUser.statusState);
    setStatusSaved(true);
    setTimeout(() => setStatusSaved(false), 2000);
  };

  const handleSwitchUser = () => {
    const nextId = currentUser.id === 'alex' ? 'jordan' : 'alex';
    setCurrentUserId(nextId);
    setStatusText(nextId === 'alex' ? 'Focusing on final project prep 🎯' : 'In Campus Library 📚');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="h-16 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="md:hidden p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Open Channels List"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-900/50">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-display text-slate-900 dark:text-white">
                Duo Profile & Pairing
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold">
                Direct URL: /profile
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Manage your identity, duo pairing handshake, and application preferences
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/channels')}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-indigo-500 transition-colors"
        >
          Back to Chat
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-4xl mx-auto w-full">
        {/* Duo Pairing Status Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border border-indigo-500/20 dark:border-indigo-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Private Duo Relationship Channel
                  </h3>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Encrypted & Paired
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Connected between {currentUser.name} & {partnerUser.name}
                </p>
              </div>
            </div>

            <button
              onClick={handleSwitchUser}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 shrink-0"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Switch View to {partnerUser.name.split(' ')[0]}</span>
            </button>
          </div>
        </div>

        {/* Current Active User Profile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Profile */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Current Active Identity
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 text-[11px] font-semibold">
                You
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-md ${
                  currentUser.id === 'alex' ? 'bg-indigo-600' : 'bg-emerald-600'
                }`}
              >
                {currentUser.name[0]}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {currentUser.name}
                </h4>
                <div className="text-xs text-slate-400">{currentUser.handle}</div>
                <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                  {currentUser.role}
                </div>
              </div>
            </div>

            {/* Status Update Form */}
            <form onSubmit={handleStatusSubmit} className="mt-5 space-y-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block">
                Status Message:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  placeholder="What are you doing? (e.g. In lab, preparing report)"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-all shrink-0"
                >
                  {statusSaved ? 'Saved!' : 'Save'}
                </button>
              </div>
            </form>
          </div>

          {/* Partner Profile */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Duo Partner
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 text-[11px] font-semibold">
                Online
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-md ${
                  partnerUser.id === 'alex' ? 'bg-indigo-600' : 'bg-emerald-600'
                }`}
              >
                {partnerUser.name[0]}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {partnerUser.name}
                </h4>
                <div className="text-xs text-slate-400">{partnerUser.handle}</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                  {partnerUser.role}
                </div>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400">Current status: </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                "{partnerUser.statusText}"
              </span>
            </div>
          </div>
        </div>

        {/* Preferences & Reset */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            App Experience & System
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 flex items-center justify-between transition-colors text-left"
            >
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Appearance</div>
                <div className="text-[11px] text-slate-400">
                  {darkMode ? 'Dark Theme' : 'Light Theme'}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </div>
            </button>

            <button
              onClick={toggleSound}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 flex items-center justify-between transition-colors text-left"
            >
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Audio Feedback</div>
                <div className="text-[11px] text-slate-400">
                  {soundEnabled ? 'Synthesizer Active' : 'Muted'}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
            </button>

            <button
              onClick={resetToDefaults}
              className="p-4 rounded-2xl border border-red-200/60 dark:border-red-900/40 hover:border-red-400 flex items-center justify-between transition-colors text-left group"
            >
              <div>
                <div className="text-xs font-bold text-red-600 dark:text-red-400">Reset Data</div>
                <div className="text-[11px] text-slate-400">Restore default demo channels</div>
              </div>
              <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 group-hover:rotate-180 transition-transform duration-300">
                <RotateCcw className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
