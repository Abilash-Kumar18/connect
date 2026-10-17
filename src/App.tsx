/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ConnectProvider, useConnect } from './context/ConnectContext';
import { SplashView } from './components/SplashView';
import { Sidebar } from './components/Sidebar';
import { ChatPane } from './components/ChatPane';
import { NewChannelModal } from './components/NewChannelModal';
import { ExpenseModal } from './components/ExpenseModal';
import { MeetingModal } from './components/MeetingModal';
import { ExpenseSummaryModal } from './components/ExpenseSummaryModal';
import { AuthModal } from './components/AuthModal';

function MainLayout() {
  const { isAuthenticated } = useConnect();

  // Splash screen state (shown once on first visit)
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('connect_splash_seen');
  });

  // Modal open states
  const [isNewChannelOpen, setIsNewChannelOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleEnterApp = () => {
    sessionStorage.setItem('connect_splash_seen', 'true');
    setShowSplash(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans antialiased">
      {/* 1. Animated Splash Entry */}
      {showSplash && <SplashView onEnter={handleEnterApp} />}

      {/* 2. Authentication Modal (if logged out or prompted) */}
      {!isAuthenticated && <AuthModal isOpen={true} />}

      {/* 3. Main Dual-Pane Workspace */}
      <div className="flex flex-1 w-full h-full overflow-hidden">
        {/* Left Navigation Sidebar (Desktop + Mobile Slide-over Drawer) */}
        <Sidebar
          onOpenNewChannel={() => setIsNewChannelOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* Right Conversation Stream */}
        <ChatPane
          onOpenExpenseModal={() => setIsExpenseOpen(true)}
          onOpenMeetingModal={() => setIsMeetingOpen(true)}
          onOpenSummaryModal={() => setIsSummaryOpen(true)}
          onOpenNewChannelModal={() => setIsNewChannelOpen(true)}
        />
      </div>

      {/* 4. Global Modals */}
      <NewChannelModal
        isOpen={isNewChannelOpen}
        onClose={() => setIsNewChannelOpen(false)}
      />

      <ExpenseModal
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
      />

      <MeetingModal
        isOpen={isMeetingOpen}
        onClose={() => setIsMeetingOpen(false)}
      />

      <ExpenseSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
      />

      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ConnectProvider>
      <MainLayout />
    </ConnectProvider>
  );
}
