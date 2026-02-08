"use client";

import { useState } from 'react';
import { WireframeBox } from '@/components/wireframe/WireframeBox';
import { WireframeButton } from '@/components/wireframe/WireframeButton';
import { WireframeText } from '@/components/wireframe/WireframeText';
import { WireframeInput } from '@/components/wireframe/WireframeInput';
import { MacWindow } from '@/components/wireframe/MacWindow';
import { IsoCard } from '@/components/wireframe/IsoCard';
import { IsoButton } from '@/components/wireframe/IsoButton';
import { Calendar, Clock, User, Mail, Briefcase, Laptop, Users, PieChart } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { Interview } from '@/types';

interface ScheduleInterviewProps {
    onSchedule?: () => void;
    onCancel?: () => void;
}

export function ScheduleInterview({ onSchedule, onCancel }: ScheduleInterviewProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        candidateName: '',
        candidateEmail: '',
        position: '',
        date: '',
        time: '',
        duration: '1 hour',
        type: 'Technical' as 'Technical' | 'Behavioral' | 'Case Study',
        interviewers: [] as string[],
        notes: ''
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleInterviewer = (interviewer: string) => {
        setFormData(prev => {
            const current = prev.interviewers;
            if (current.includes(interviewer)) {
                return { ...prev, interviewers: current.filter(i => i !== interviewer) };
            } else {
                return { ...prev, interviewers: [...current, interviewer] };
            }
        });
    };

    const handleSchedule = async () => {
        if (!formData.candidateName || !formData.date || !formData.time) {
            alert("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            // Create a date object from the date and time strings
            const scheduledDateTime = new Date(`${formData.date}T${formData.time}`);

            const interviewData: Omit<Interview, 'id'> = {
                ...formData,
                status: 'Upcoming',
                createdAt: Timestamp.now(),
                scheduledAt: Timestamp.fromDate(scheduledDateTime)
            };

            await addDoc(collection(db!, "interviews"), interviewData);

            if (onSchedule) onSchedule();
        } catch (error) {
            console.error("Error scheduling interview:", error);
            alert("Failed to schedule interview. Please try again.");
        } finally {
            setLoading(false);
        }
    };

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
                                            value={formData.candidateName}
                                            onChange={(e) => handleInputChange('candidateName', e.target.value)}
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
                                            value={formData.candidateEmail}
                                            onChange={(e) => handleInputChange('candidateEmail', e.target.value)}
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
                                            value={formData.position}
                                            onChange={(e) => handleInputChange('position', e.target.value)}
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
                                            value={formData.date}
                                            onChange={(e) => handleInputChange('date', e.target.value)}
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
                                            value={formData.time}
                                            onChange={(e) => handleInputChange('time', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="flex items-center gap-2 mb-2">
                                        <WireframeText variant="caption">Duration</WireframeText>
                                    </label>
                                    <div className="flex gap-2">
                                        {['30 min', '45 min', '1 hour', '1.5 hours'].map((duration) => (
                                            <WireframeButton
                                                key={duration}
                                                variant={formData.duration === duration ? "primary" : "outline"}
                                                size="sm"
                                                onClick={() => handleInputChange('duration', duration)}
                                            >
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
                                    {[
                                        { type: 'Technical', icon: Laptop },
                                        { type: 'Behavioral', icon: Users },
                                        { type: 'Case Study', icon: PieChart }
                                    ].map((item) => (
                                        <IsoCard
                                            key={item.type}
                                            className={`p-4 text-center cursor-pointer transition-colors ${formData.type === item.type ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}
                                            onClick={() => handleInputChange('type', item.type)}
                                        >
                                            <div className="mb-2 flex justify-center">
                                                <item.icon size={32} strokeWidth={1.5} className="text-black" />
                                            </div>
                                            <WireframeText variant="body">{item.type}</WireframeText>
                                        </IsoCard>
                                    ))}
                                </div>
                            </WireframeBox>

                            {/* Interviewers */}
                            <WireframeBox dashed className="p-6">
                                <WireframeText variant="h2" className="mb-4">Assign Interviewers</WireframeText>

                                <div className="space-y-3">
                                    {['Sarah Johnson - Senior Manager', 'Mike Chen - Tech Lead', 'Emma Wilson - HR Director'].map((interviewer) => (
                                        <WireframeBox
                                            key={interviewer}
                                            className={`p-3 flex items-center justify-between cursor-pointer ${formData.interviewers.includes(interviewer) ? 'bg-gray-100' : ''}`}
                                            onClick={() => toggleInterviewer(interviewer)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.interviewers.includes(interviewer)}
                                                    onChange={() => { }} // Handled by parent div click
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
                                    value={formData.notes}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                />
                            </WireframeBox>

                            {/* Actions */}
                            <div className="flex gap-4 justify-end pt-4">
                                <IsoButton variant="secondary" onClick={onCancel} disabled={loading}>
                                    Cancel
                                </IsoButton>
                                <IsoButton variant="primary" onClick={handleSchedule} disabled={loading}>
                                    {loading ? 'Scheduling...' : 'Schedule Interview'}
                                </IsoButton>
                            </div>
                        </div>
                    </div>
                </MacWindow>
            </div>
        </div>
    );
}
