/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConnectProvider, useConnect } from './context/ConnectContext';
import { Sidebar } from './components/Sidebar';
import { NewChannelModal } from './components/NewChannelModal';
import { ExpenseModal } from './components/ExpenseModal';
import { MeetingModal } from './components/MeetingModal';
import { ExpenseSummaryModal } from './components/ExpenseSummaryModal';
import { AuthModal } from './components/AuthModal';

import { ChannelPage } from './pages/ChannelPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { MeetingsPage } from './pages/MeetingsPage';
import { NotesPage } from './pages/NotesPage';
import { ProfilePage } from './pages/ProfilePage';
import { SplashPage } from './pages/SplashPage';

function RootRedirect() {
  const { activeChannelId } = useConnect();
  const hasSeenSplash = Boolean(sessionStorage.getItem('connect_splash_seen'));

  if (!hasSeenSplash) {
    return <SplashPage />;
  }
  return <Navigate to={`/channels/${activeChannelId || 'chan_general'}`} replace />;
}

function MainWorkspaceLayout() {
  const { isAuthenticated, activeChannelId } = useConnect();

  // Modal open states
  const [isNewChannelOpen, setIsNewChannelOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans antialiased">
      {/* Authentication Modal (if logged out) */}
      {!isAuthenticated && <AuthModal isOpen={true} />}

      {/* Main Dual-Pane Workspace */}
      <div className="flex flex-1 w-full h-full overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          onOpenNewChannel={() => setIsNewChannelOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* Right Active Route Pane */}
        <main className="flex-1 h-full overflow-hidden flex flex-col min-w-0">
          <Routes>
            <Route
              path="/channels"
              element={<Navigate to={`/channels/${activeChannelId || 'chan_general'}`} replace />}
            />
            <Route
              path="/channels/:channelId"
              element={
                <ChannelPage
                  onOpenExpenseModal={() => setIsExpenseOpen(true)}
                  onOpenMeetingModal={() => setIsMeetingOpen(true)}
                  onOpenSummaryModal={() => setIsSummaryOpen(true)}
                  onOpenNewChannelModal={() => setIsNewChannelOpen(true)}
                />
              }
            />
            <Route
              path="/expenses"
              element={<ExpensesPage onOpenExpenseModal={() => setIsExpenseOpen(true)} />}
            />
            <Route
              path="/meetings"
              element={<MeetingsPage onOpenMeetingModal={() => setIsMeetingOpen(true)} />}
            />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route
              path="*"
              element={<Navigate to={`/channels/${activeChannelId || 'chan_general'}`} replace />}
            />
          </Routes>
        </main>
      </div>

      {/* Global Modals */}
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/splash" element={<SplashPage />} />
          <Route path="/*" element={<MainWorkspaceLayout />} />
        </Routes>
      </BrowserRouter>
    </ConnectProvider>
  );
}
