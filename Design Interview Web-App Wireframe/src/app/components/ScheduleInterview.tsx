import { WireframeBox } from './wireframe/WireframeBox';
import { WireframeButton } from './wireframe/WireframeButton';
import { WireframeText } from './wireframe/WireframeText';
import { WireframeInput } from './wireframe/WireframeInput';
import { MacWindow } from './wireframe/MacWindow';
import { IsoCard } from './wireframe/IsoCard';
import { IsoButton } from './wireframe/IsoButton';
import { Calendar, Clock, User, Mail, Briefcase, Laptop, Users, PieChart } from 'lucide-react';

export function ScheduleInterview() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <MacWindow title="Schedule New Interview">
          <div className="p-8">
            <WireframeText variant="h1" className="mb-6">Schedule New Interview</WireframeText>
            
            <div className="space-y-6">
              {/* Candidate Information */}
              <WireframeBox dashed className="p-6">
                <WireframeText variant="h2" className="mb-4">Candidate Information</WireframeText>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 mb-2">
                      <User size={16} />
                      <WireframeText variant="caption">Full Name</WireframeText>
                    </label>
                    <WireframeInput 
                      placeholder="Enter candidate name" 
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 mb-2">
                      <Mail size={16} />
                      <WireframeText variant="caption">Email Address</WireframeText>
                    </label>
                    <WireframeInput 
                      type="email"
                      placeholder="candidate@email.com" 
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 mb-2">
                      <Briefcase size={16} />
                      <WireframeText variant="caption">Position</WireframeText>
                    </label>
                    <WireframeInput 
                      placeholder="e.g., Senior Software Engineer" 
                      className="w-full"
                    />
                  </div>
                </div>
              </WireframeBox>

              {/* Interview Details */}
              <WireframeBox dashed className="p-6">
                <WireframeText variant="h2" className="mb-4">Interview Details</WireframeText>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 mb-2">
                      <Calendar size={16} />
                      <WireframeText variant="caption">Date</WireframeText>
                    </label>
                    <WireframeInput 
                      type="date"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 mb-2">
                      <Clock size={16} />
                      <WireframeText variant="caption">Time</WireframeText>
                    </label>
                    <WireframeInput 
                      type="time"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-2 mb-2">
                    <WireframeText variant="caption">Duration</WireframeText>
                  </label>
                  <div className="flex gap-2">
                    {['30 min', '45 min', '1 hour', '1.5 hours'].map((duration) => (
                      <WireframeButton key={duration} variant="outline" size="sm">
                        {duration}
                      </WireframeButton>
                    ))}
                  </div>
                </div>
              </WireframeBox>

              {/* Interview Type */}
              <WireframeBox dashed className="p-6">
                <WireframeText variant="h2" className="mb-4">Interview Type</WireframeText>
                
                <div className="grid grid-cols-3 gap-4">
                  <IsoCard className="p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="mb-2 flex justify-center">
                      <Laptop size={32} strokeWidth={1.5} className="text-black" />
                    </div>
                    <WireframeText variant="body">Technical</WireframeText>
                  </IsoCard>
                  <IsoCard className="p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="mb-2 flex justify-center">
                      <Users size={32} strokeWidth={1.5} className="text-black" />
                    </div>
                    <WireframeText variant="body">Behavioral</WireframeText>
                  </IsoCard>
                  <IsoCard className="p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="mb-2 flex justify-center">
                      <PieChart size={32} strokeWidth={1.5} className="text-black" />
                    </div>
                    <WireframeText variant="body">Case Study</WireframeText>
                  </IsoCard>
                </div>
              </WireframeBox>

              {/* Interviewers */}
              <WireframeBox dashed className="p-6">
                <WireframeText variant="h2" className="mb-4">Assign Interviewers</WireframeText>
                
                <div className="space-y-3">
                  {['Sarah Johnson - Senior Manager', 'Mike Chen - Tech Lead', 'Emma Wilson - HR Director'].map((interviewer) => (
                    <WireframeBox key={interviewer} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 border-2 border-black"
                        />
                        <WireframeText variant="body">{interviewer}</WireframeText>
                      </div>
                    </WireframeBox>
                  ))}
                </div>
              </WireframeBox>

              {/* Notes */}
              <WireframeBox dashed className="p-6">
                <WireframeText variant="h2" className="mb-4">Additional Notes</WireframeText>
                <textarea
                  placeholder="Add any special instructions or notes..."
                  className="w-full h-32 border-2 border-gray-400 bg-gray-50 p-3 font-mono text-sm resize-none focus:border-black focus:outline-none"
                  style={{
                    boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
              </WireframeBox>

              {/* Actions */}
              <div className="flex gap-4 justify-end pt-4">
                <IsoButton variant="secondary">
                  Save as Draft
                </IsoButton>
                <IsoButton variant="primary">
                  Schedule Interview
                </IsoButton>
              </div>
            </div>
          </div>
        </MacWindow>
      </div>
    </div>
  );
}