import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Layers,
  Receipt,
  Calendar,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  Users,
  CheckCircle2,
  KeyRound,
  UserPlus,
} from 'lucide-react';

interface SplashViewProps {
  onEnter: (user?: string, profile?: { name?: string; role?: string }) => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ onEnter }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'demo'>('signin');

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('alex.morgan@connect.io');
  const [signInPassword, setSignInPassword] = useState('••••••••');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up State
  const [fullName, setFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Form Feedback
  const [error, setError] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim()) {
      setError('Please provide your email address.');
      return;
    }
    setError('');
    // If logging in as Jordan
    const isJordan = signInEmail.toLowerCase().includes('jordan');
    onEnter(isJordan ? 'jordan' : 'alex');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !signUpEmail.trim()) {
      setError('Please provide both your name and email.');
      return;
    }
    setError('');
    const newId = `user_${Date.now()}`;
    onEnter(newId, {
      name: fullName.trim(),
      role: partnerName.trim() ? `Duo with ${partnerName.trim()}` : 'Duo Partner',
    });
  };

  const handleQuickDemo = (user: 'alex' | 'jordan') => {
    onEnter(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090B] text-[#FAFAFA] overflow-y-auto px-4 py-8">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#8B9A6E]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-zinc-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8B9A6E]/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-lg w-full rounded-3xl bg-zinc-950/90 backdrop-blur-2xl border border-zinc-800 shadow-2xl shadow-black/80 p-6 sm:p-8 my-auto"
      >
        {/* Animated Brand Emblem & Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ rotate: -10, scale: 0.85 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mx-auto w-16 h-16 mb-4 rounded-2xl bg-gradient-to-tr from-zinc-700 via-zinc-800 to-zinc-900 p-0.5 shadow-xl flex items-center justify-center border border-zinc-700/60"
          >
            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute -left-1 w-7 h-7 rounded-full border-2 border-zinc-400 opacity-80" />
              <div className="absolute -right-1 w-7 h-7 rounded-full border-2 border-zinc-200 opacity-80" />
              <div className="w-2.5 h-2.5 rounded-full bg-white z-20 shadow-sm" />
            </div>
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
            CONNECT
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400 font-medium">
            Purpose-Driven Duo Communication
          </p>

          <p className="mt-2 text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Organize expenses, prints, and notes into dedicated topic channels for you and your partner.
          </p>
        </div>

        {/* Authentication Mode Switcher Tabs */}
        <div className="grid grid-cols-3 p-1 bg-zinc-900/90 rounded-2xl mb-5 border border-zinc-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setError('');
            }}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'signin'
                ? 'bg-white text-zinc-950 shadow-sm font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setError('');
            }}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'signup'
                ? 'bg-white text-zinc-950 shadow-sm font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('demo');
              setError('');
            }}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'demo'
                ? 'bg-white text-zinc-950 shadow-sm font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Demo Duo</span>
          </button>
        </div>

        {/* Tab 1: Sign In Form */}
        <AnimatePresence mode="wait">
          {authMode === 'signin' && (
            <motion.form
              key="signin"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSignIn}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="alex.morgan@connect.io"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900/80 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-zinc-300">
                    Password
                  </label>
                  <span className="text-[10px] text-zinc-400 hover:text-zinc-200 cursor-pointer">
                    Forgot code?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900/80 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3.5 top-3 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 p-2 rounded-xl text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Sign In &amp; Open CONNECT</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Instant One-Click Demo Profiles */}
              <div className="pt-3 border-t border-zinc-800/80">
                <div className="text-[11px] text-zinc-400 text-center mb-2 font-medium">
                  Or sign in instantly as:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('alex')}
                    className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all text-left flex items-center gap-2 cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-full bg-white text-zinc-950 font-extrabold text-xs flex items-center justify-center shrink-0">
                      A
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate group-hover:underline">
                        Alex Morgan
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">Co-Pilot</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('jordan')}
                    className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all text-left flex items-center gap-2 cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-full bg-zinc-300 text-zinc-950 font-extrabold text-xs flex items-center justify-center shrink-0">
                      J
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate group-hover:underline">
                        Jordan Lee
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">Research Lead</div>
                    </div>
                  </button>
                </div>
              </div>
            </motion.form>
          )}

          {/* Tab 2: Sign Up / Create Account Form */}
          {authMode === 'signup' && (
            <motion.form
              key="signup"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSignUp}
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900/80 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900/80 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900/80 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-3.5 top-3 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  >
                    {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Partner / Companion Name (Optional)
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="e.g. Jordan Lee"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900/80 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 p-2 rounded-xl text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                <span>Create Duo Account &amp; Enter</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          )}

          {/* Tab 3: Quick Duo Demo Profiles */}
          {authMode === 'demo' && (
            <motion.div
              key="demo"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="text-xs text-zinc-400 text-center mb-3">
                Experience the duo space instantly without typing credentials:
              </div>

              <div
                onClick={() => handleQuickDemo('alex')}
                className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/70 hover:bg-zinc-800 hover:border-zinc-600 transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                      alt="Alex"
                      className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      <span>Alex Morgan</span>
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-white/10 text-zinc-300">
                        Co-Pilot
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      alex.morgan@connect.io
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-white text-zinc-950 text-xs font-bold group-hover:scale-105 transition-transform"
                >
                  Enter →
                </button>
              </div>

              <div
                onClick={() => handleQuickDemo('jordan')}
                className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/70 hover:bg-zinc-800 hover:border-zinc-600 transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                      alt="Jordan"
                      className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      <span>Jordan Lee</span>
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-white/10 text-zinc-300">
                        Research
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      jordan.lee@connect.io · In Library 📚
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-white text-zinc-950 text-xs font-bold group-hover:scale-105 transition-transform"
                >
                  Enter →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guest access footer link */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => handleQuickDemo('alex')}
            className="text-xs text-zinc-400 hover:text-white transition-colors underline underline-offset-4 cursor-pointer"
          >
            Continue as Guest (Instant Preview)
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-zinc-800/80 text-left">
          <div className="p-2.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
            <Layers className="w-4 h-4 text-zinc-300 mb-1" />
            <div className="text-[11px] font-bold text-white">Channels</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Topic separated</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
            <Receipt className="w-4 h-4 text-zinc-300 mb-1" />
            <div className="text-[11px] font-bold text-white">Expenses</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Auto split tally</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
            <Calendar className="w-4 h-4 text-zinc-300 mb-1" />
            <div className="text-[11px] font-bold text-white">Meetings</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Duo schedules</div>
          </div>
        </div>

        {/* Security & Sync Footer Badge */}
        <div className="mt-4 text-[10px] text-zinc-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
          <span>Local persistence enabled · Cross-tab real-time sync</span>
        </div>
      </motion.div>
    </div>
  );
};

