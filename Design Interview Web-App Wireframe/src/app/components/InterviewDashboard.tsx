import { WireframeBox } from './wireframe/WireframeBox';
import { WireframeButton } from './wireframe/WireframeButton';
import { WireframeText } from './wireframe/WireframeText';
import { MacWindow } from './wireframe/MacWindow';
import { IsoCard } from './wireframe/IsoCard';
import { IsoButton } from './wireframe/IsoButton';
import { Calendar, Clock, User, Video } from 'lucide-react';

export function InterviewDashboard() {
  const upcomingInterviews = [
    { id: 1, candidate: 'John Smith', position: 'Senior Developer', date: '2026-02-10', time: '10:00 AM' },
    { id: 2, candidate: 'Sarah Johnson', position: 'Product Manager', date: '2026-02-12', time: '2:00 PM' },
    { id: 3, candidate: 'Mike Chen', position: 'UX Designer', date: '2026-02-15', time: '11:30 AM' },
  ];

  const pastInterviews = [
    { id: 4, candidate: 'Emma Wilson', position: 'Frontend Dev', date: '2026-02-05', status: 'Completed' },
    { id: 5, candidate: 'David Lee', position: 'Backend Dev', date: '2026-02-03', status: 'Completed' },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <MacWindow title="Interview Dashboard">
        <div className="p-6 flex items-center justify-between">
          <WireframeText variant="h1">Interview Dashboard</WireframeText>
          <IsoButton variant="primary">+ Schedule Interview</IsoButton>
        </div>
      </MacWindow>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <IsoCard className="p-4 text-center">
          <WireframeText variant="h2" className="text-3xl">12</WireframeText>
          <WireframeText variant="caption" className="mt-2">Total Interviews</WireframeText>
        </IsoCard>
        <IsoCard className="p-4 text-center">
          <WireframeText variant="h2" className="text-3xl">3</WireframeText>
          <WireframeText variant="caption" className="mt-2">Upcoming</WireframeText>
        </IsoCard>
        <IsoCard className="p-4 text-center">
          <WireframeText variant="h2" className="text-3xl">7</WireframeText>
          <WireframeText variant="caption" className="mt-2">Completed</WireframeText>
        </IsoCard>
        <IsoCard className="p-4 text-center">
          <WireframeText variant="h2" className="text-3xl">2</WireframeText>
          <WireframeText variant="caption" className="mt-2">In Progress</WireframeText>
        </IsoCard>
      </div>

      {/* Upcoming Interviews */}
      <WireframeBox className="p-6">
        <WireframeText variant="h2" className="mb-4">Upcoming Interviews</WireframeText>
        <div className="space-y-3">
          {upcomingInterviews.map((interview) => (
            <WireframeBox key={interview.id} dashed className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User size={20} />
                    <WireframeText variant="body" className="font-bold">
                      {interview.candidate}
                    </WireframeText>
                  </div>
                  <WireframeText variant="caption">{interview.position}</WireframeText>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <WireframeText variant="caption">{interview.date}</WireframeText>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <WireframeText variant="caption">{interview.time}</WireframeText>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <WireframeButton variant="outline" size="sm">Reschedule</WireframeButton>
                  <WireframeButton variant="primary" size="sm">Start Interview</WireframeButton>
                </div>
              </div>
            </WireframeBox>
          ))}
        </div>
      </WireframeBox>

      {/* Past Interviews */}
      <WireframeBox className="p-6">
        <WireframeText variant="h2" className="mb-4">Recent Interviews</WireframeText>
        <div className="space-y-3">
          {pastInterviews.map((interview) => (
            <WireframeBox key={interview.id} dashed className="p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User size={20} />
                    <WireframeText variant="body" className="font-bold">
                      {interview.candidate}
                    </WireframeText>
                    <span className="px-2 py-1 bg-green-200 border border-green-400 text-xs font-mono">
                      {interview.status}
                    </span>
                  </div>
                  <WireframeText variant="caption">{interview.position}</WireframeText>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar size={16} />
                    <WireframeText variant="caption">{interview.date}</WireframeText>
                  </div>
                </div>
                <div className="flex gap-2">
                  <WireframeButton variant="outline" size="sm">View Recording</WireframeButton>
                  <WireframeButton variant="secondary" size="sm">View Notes</WireframeButton>
                </div>
              </div>
            </WireframeBox>
          ))}
        </div>
      </WireframeBox>
    </div>
  );
}