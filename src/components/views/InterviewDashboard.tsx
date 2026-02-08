"use client";

import { useEffect, useState } from 'react';
import { WireframeBox } from '@/components/wireframe/WireframeBox';
import { WireframeButton } from '@/components/wireframe/WireframeButton';
import { WireframeText } from '@/components/wireframe/WireframeText';
import { MacWindow } from '@/components/wireframe/MacWindow';
import { IsoCard } from '@/components/wireframe/IsoCard';
import { IsoButton } from '@/components/wireframe/IsoButton';
import { Calendar, Clock, User } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Interview } from '@/types';

interface InterviewDashboardProps {
    onNavigate: (view: string) => void;
}

export function InterviewDashboard({ onNavigate }: InterviewDashboardProps) {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) return;

        // Sort by scheduledAt (single field) to avoid composite index requirement
        const q = query(collection(db, "interviews"), orderBy("scheduledAt", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedInterviews: Interview[] = [];
            snapshot.forEach((doc) => {
                fetchedInterviews.push({ id: doc.id, ...doc.data() } as Interview);
            });
            setInterviews(fetchedInterviews);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching interviews:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const upcomingInterviews = interviews.filter(i => {
        // Handle both older records (without scheduledAt) and new ones
        let interviewDate: Date;
        if (i.scheduledAt) {
            interviewDate = i.scheduledAt.toDate();
        } else {
            interviewDate = new Date(`${i.date}T${i.time}`);
        }

        return interviewDate >= new Date() && i.status !== 'Completed' && i.status !== 'Cancelled';
    });

    const pastInterviews = interviews.filter(i => {
        let interviewDate: Date;
        if (i.scheduledAt) {
            interviewDate = i.scheduledAt.toDate();
        } else {
            interviewDate = new Date(`${i.date}T${i.time}`);
        }

        return interviewDate < new Date() || i.status === 'Completed';
    });

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <MacWindow title="Interview Dashboard">
                <div className="p-6 flex items-center justify-between">
                    <WireframeText variant="h1">Interview Dashboard</WireframeText>
                    <IsoButton variant="primary" onClick={() => onNavigate('schedule')}>
                        + Schedule Interview
                    </IsoButton>
                </div>
            </MacWindow>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <IsoCard className="p-4 text-center">
                    <WireframeText variant="h2" className="text-3xl">{interviews.length}</WireframeText>
                    <WireframeText variant="caption" className="mt-2">Total Interviews</WireframeText>
                </IsoCard>
                <IsoCard className="p-4 text-center">
                    <WireframeText variant="h2" className="text-3xl">{upcomingInterviews.length}</WireframeText>
                    <WireframeText variant="caption" className="mt-2">Upcoming</WireframeText>
                </IsoCard>
                <IsoCard className="p-4 text-center">
                    <WireframeText variant="h2" className="text-3xl">{pastInterviews.filter(i => i.status === 'Completed').length}</WireframeText>
                    <WireframeText variant="caption" className="mt-2">Completed</WireframeText>
                </IsoCard>
                <IsoCard className="p-4 text-center">
                    <WireframeText variant="h2" className="text-3xl">{upcomingInterviews.length}</WireframeText>
                    <WireframeText variant="caption" className="mt-2">Pending</WireframeText>
                </IsoCard>
            </div>

            {/* Upcoming Interviews */}
            <WireframeBox className="p-6">
                <WireframeText variant="h2" className="mb-4">Upcoming Interviews</WireframeText>
                {loading ? (
                    <div className="text-center py-8">Loading interviews...</div>
                ) : upcomingInterviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No upcoming interviews scheduled.</div>
                ) : (
                    <div className="space-y-3">
                        {upcomingInterviews.map((interview) => (
                            <WireframeBox key={interview.id} dashed className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <User size={20} />
                                            <WireframeText variant="body" className="font-bold">
                                                {interview.candidateName}
                                            </WireframeText>
                                        </div>
                                        <WireframeText variant="caption">{interview.position} • {interview.type}</WireframeText>
                                        <div className="flex gap-4 mt-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} />
                                                <WireframeText variant="caption">{interview.date}</WireframeText>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} />
                                                <WireframeText variant="caption">{interview.time} ({interview.duration})</WireframeText>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <WireframeButton variant="outline" size="sm">Reschedule</WireframeButton>
                                        <WireframeButton variant="primary" size="sm" onClick={() => onNavigate('room')}>
                                            Start Interview
                                        </WireframeButton>
                                    </div>
                                </div>
                            </WireframeBox>
                        ))}
                    </div>
                )}
            </WireframeBox>

            {/* Past Interviews */}
            <WireframeBox className="p-6">
                <WireframeText variant="h2" className="mb-4">Recent Interviews</WireframeText>
                {/* For now just showing static past interviews if empty, or we can just show fetched past ones */}
                <div className="space-y-3">
                    {pastInterviews.length > 0 ? pastInterviews.map((interview) => (
                        <WireframeBox key={interview.id} dashed className="p-4 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <User size={20} />
                                        <WireframeText variant="body" className="font-bold">
                                            {interview.candidateName}
                                        </WireframeText>
                                        <span className={`px-2 py-1 text-xs font-mono border ${interview.status === 'Completed' ? 'bg-green-200 border-green-400' : 'bg-gray-200 border-gray-400'}`}>
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
                    )) : (
                        <div className="text-center py-4 text-gray-400">No past interviews found.</div>
                    )}
                </div>
            </WireframeBox>
        </div>
    );
}
