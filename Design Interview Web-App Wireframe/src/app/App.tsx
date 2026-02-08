import { useState } from 'react';
import { InterviewDashboard } from './components/InterviewDashboard';
import { InterviewRoom } from './components/InterviewRoom';
import { ScheduleInterview } from './components/ScheduleInterview';
import { Auth } from './components/Auth';
import { WireframeButton } from './components/wireframe/WireframeButton';
import { WireframeBox } from './components/wireframe/WireframeBox';
import { MacWindow } from './components/wireframe/MacWindow';

type View = 'auth' | 'dashboard' | 'schedule' | 'room';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('auth');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation - Only show when not on auth page */}
      {currentView !== 'auth' && (
        <MacWindow title="InterviewApp - Navigation">
          <div className="p-4 flex items-center justify-between">
            <div className="font-mono text-2xl font-bold uppercase">InterviewApp</div>
            <div className="flex gap-3">
              <WireframeButton 
                variant={currentView === 'dashboard' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('dashboard')}
              >
                Dashboard
              </WireframeButton>
              <WireframeButton 
                variant={currentView === 'schedule' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('schedule')}
              >
                Schedule
              </WireframeButton>
              <WireframeButton 
                variant={currentView === 'room' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('room')}
              >
                Interview Room
              </WireframeButton>
              <WireframeButton 
                variant="outline"
                size="sm"
                onClick={() => setCurrentView('auth')}
              >
                Logout
              </WireframeButton>
            </div>
          </div>
        </MacWindow>
      )}

      {/* Content */}
      {currentView === 'auth' && <Auth />}
      {currentView === 'dashboard' && <InterviewDashboard />}
      {currentView === 'schedule' && <ScheduleInterview />}
      {currentView === 'room' && <InterviewRoom />}
    </div>
  );
}