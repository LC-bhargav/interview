import { WireframeBox } from './wireframe/WireframeBox';
import { WireframeButton } from './wireframe/WireframeButton';
import { WireframeText } from './wireframe/WireframeText';
import { WireframeImage } from './wireframe/WireframeImage';
import { MacWindow } from './wireframe/MacWindow';
import { IsoCard } from './wireframe/IsoCard';
import { IsoButton } from './wireframe/IsoButton';
import { Mic, Video, VideoOff, PhoneOff, MessageSquare, Users } from 'lucide-react';
import { useState } from 'react';

export function InterviewRoom() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  const questions = [
    "Tell me about yourself and your background.",
    "What is your experience with React and modern web development?",
    "Describe a challenging project you worked on and how you overcame obstacles.",
    "Where do you see yourself in 5 years?",
    "Do you have any questions for us?"
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <WireframeBox className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <WireframeText variant="h3">Interview Session</WireframeText>
          <WireframeBox dashed className="px-3 py-1">
            <WireframeText variant="caption">🔴 Recording</WireframeText>
          </WireframeBox>
        </div>
        <div className="flex items-center gap-3">
          <WireframeText variant="caption">Duration: 15:32</WireframeText>
          <WireframeButton variant="outline" size="sm">End Interview</WireframeButton>
        </div>
      </WireframeBox>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-3 gap-4 p-4">
        {/* Video Area */}
        <div className="col-span-2 space-y-4">
          {/* Candidate Video */}
          <MacWindow title="Candidate - John Smith" className="relative h-[500px]">
            <WireframeImage height="100%" label="CANDIDATE VIDEO FEED" />
          </MacWindow>

          {/* Interviewer Video (Picture-in-Picture) */}
          <MacWindow title="Your Camera" className="h-32">
            <WireframeImage height="100%" label="YOUR VIDEO" />
          </MacWindow>

          {/* Controls */}
          <WireframeBox className="p-4">
            <div className="flex items-center justify-center gap-4">
              <WireframeButton variant="outline" size="lg">
                <Mic className="mr-2" size={20} />
                Mute
              </WireframeButton>
              <WireframeButton variant="outline" size="lg">
                <Video className="mr-2" size={20} />
                Stop Video
              </WireframeButton>
              <WireframeButton variant="outline" size="lg">
                <MessageSquare className="mr-2" size={20} />
                Chat
              </WireframeButton>
              <WireframeButton variant="primary" size="lg" className="bg-red-600 hover:bg-red-700">
                <PhoneOff className="mr-2" size={20} />
                Leave
              </WireframeButton>
            </div>
          </WireframeBox>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Question Progress */}
          <IsoCard className="p-4">
            <WireframeText variant="h3" className="mb-3">Interview Progress</WireframeText>
            <div className="space-y-2">
              <div className="flex justify-between mb-2">
                <WireframeText variant="caption">Question {currentQuestion + 1} of {questions.length}</WireframeText>
                <WireframeText variant="caption">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</WireframeText>
              </div>
              <div className="w-full h-4 border-2 border-black bg-white">
                <div 
                  className="h-full bg-black transition-all"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          </IsoCard>

          {/* Current Question */}
          <IsoCard className="p-4" color="bg-yellow-50">
            <WireframeText variant="h3" className="mb-3">Current Question</WireframeText>
            <WireframeBox dashed className="p-4 bg-white">
              <WireframeText variant="body">{questions[currentQuestion]}</WireframeText>
            </WireframeBox>
            <div className="flex gap-2 mt-3">
              <IsoButton 
                variant="secondary" 
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                className="flex-1 text-xs"
              >
                ← Prev
              </IsoButton>
              <IsoButton 
                variant="primary" 
                onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                className="flex-1 text-xs"
              >
                Next →
              </IsoButton>
            </div>
          </IsoCard>

          {/* Notes */}
          <WireframeBox className="p-4 flex-1">
            <WireframeText variant="h3" className="mb-3">Interview Notes</WireframeText>
            <textarea
              placeholder="Type your notes here..."
              className="w-full h-48 border-2 border-gray-400 p-3 font-mono text-sm resize-none focus:border-black focus:outline-none"
              style={{
                boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1)'
              }}
            />
          </WireframeBox>

          {/* Rating */}
          <WireframeBox className="p-4">
            <WireframeText variant="h3" className="mb-3">Quick Rating</WireframeText>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  className="w-10 h-10 border-2 border-black hover:bg-black hover:text-white font-mono font-bold transition-colors"
                  style={{
                    boxShadow: '2px 2px 0px rgba(0,0,0,1)'
                  }}
                >
                  {rating}
                </button>
              ))}
            </div>
          </WireframeBox>
        </div>
      </div>
    </div>
  );
}