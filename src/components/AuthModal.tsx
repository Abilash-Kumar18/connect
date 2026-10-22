import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useConnect } from '../context/ConnectContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login } = useConnect() as any;
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('alex.morgan@connect.io');
  const [password, setPassword] = useState('••••••••');
  const [name, setName] = useState('Alex Morgan');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    if (mode === 'signup' && !name) {
      setError('Please enter your full name.');
      return;
    }
    setError('');
    try {
      if (mode === 'signin') {
        await login(email, password);
      } else {
        await (login as any)(email, password, name); // fallback
      }
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleQuickDemo = (user: 'alex' | 'jordan') => {
    login(user);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-[#F7F2EB] dark:bg-[#1E231B] border border-[#EAE2D6] dark:border-[#353E2F] rounded-3xl p-6 sm:p-8 shadow-2xl"
      >
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#8B9A6E]/15 text-[#8B9A6E] mb-3 border border-[#8B9A6E]/25">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            {mode === 'signin' ? 'Sign in to CONNECT' : 'Join Your Duo Space'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Two-person context separated workspace for friends & partners
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-[#EEEEEE] dark:bg-[#252C21] rounded-xl mb-5 border border-[#EAE2D6] dark:border-[#353E2F]">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-[#8B9A6E] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-[#8B9A6E] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE2D6] dark:border-[#353E2F] bg-white dark:bg-[#252C21] text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B9A6E] focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EAE2D6] dark:border-[#353E2F] bg-white dark:bg-[#252C21] text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B9A6E] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#EAE2D6] dark:border-[#353E2F] bg-white dark:bg-[#252C21] text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B9A6E] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <div className="text-xs text-rose-500 mt-1">{error}</div>}

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-[#8B9A6E] hover:bg-[#79875F] text-white font-semibold text-sm transition-all shadow-md shadow-[#8B9A6E]/20 active:scale-[0.98]"
          >
            {mode === 'signin' ? 'Sign In to Workspace' : 'Create & Enter'}
          </button>
        </form>

        {/* Quick Demo Instant Access */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#EAE2D6] dark:border-[#353E2F]" />
          </div>
          <span className="relative px-3 bg-[#F7F2EB] dark:bg-[#1E231B] text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Or test instantly as
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleQuickDemo('alex')}
            className="p-3 text-left rounded-2xl border border-[#EAE2D6] dark:border-[#353E2F] bg-white/70 dark:bg-[#252C21]/70 hover:border-[#8B9A6E] hover:bg-[#8B9A6E]/10 transition-all flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-full bg-[#8B9A6E] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              A
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                Alex Morgan
              </div>
              <div className="text-[10px] text-slate-500 truncate">Co-Pilot</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('jordan')}
            className="p-3 text-left rounded-2xl border border-[#EAE2D6] dark:border-[#353E2F] bg-white/70 dark:bg-[#252C21]/70 hover:border-[#8B9A6E] hover:bg-[#8B9A6E]/10 transition-all flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-full bg-[#79875F] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              J
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                Jordan Lee
              </div>
              <div className="text-[10px] text-slate-500 truncate">Research Lead</div>
            </div>
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => handleQuickDemo('alex')}
            className="text-xs text-[#8B9A6E] dark:text-[#A3B386] hover:underline font-semibold"
          >
            Instant Guest Access (No sign-in required)
          </button>
        </div>
      </motion.div>
    </div>
  );
};
