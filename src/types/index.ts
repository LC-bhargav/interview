import { Timestamp } from 'firebase/firestore';

export interface Interview {
    id?: string;
    candidateName: string;
    candidateEmail: string;
    position: string;
    date: string;
    time: string;
    duration: string;
    type: 'Technical' | 'Behavioral' | 'Case Study';
    interviewers: string[]; // List of interviewer names or IDs
    notes?: string;
    status: 'Upcoming' | 'Completed' | 'Cancelled';
    createdAt: Timestamp;
    scheduledAt: Timestamp;
}
