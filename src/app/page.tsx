"use client";

import { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Auth } from '@/components/views/Auth';
import { InterviewRoom } from '@/components/views/InterviewRoom';
import { WireframeButton } from '@/components/wireframe/WireframeButton';
import { MacWindow } from '@/components/wireframe/MacWindow';

type View = 'auth' | 'room';

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<View>('auth');

  // If still loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <div className="font-mono text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  // If no user, show auth
  if (!user) {
    return <Auth onAuthSuccess={() => setCurrentView('room')} />;
  }

  // If user exists and on auth view, redirect to room
  if (currentView === 'auth') {
    setCurrentView('room');
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    setCurrentView('auth');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <MacWindow title="InterviewApp - Interview Room">
        <div className="p-4 flex items-center justify-between">
          <div className="font-mono text-2xl font-bold uppercase">InterviewApp</div>
          <div className="flex gap-3">
            <WireframeButton
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </WireframeButton>
          </div>
        </div>
      </MacWindow>

      {/* Content */}
      {currentView === 'room' && <InterviewRoom onEnd={handleLogout} />}
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
