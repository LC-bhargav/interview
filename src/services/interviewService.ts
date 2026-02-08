/**
 * Interview API Service
 * 
 * Handles communication between the frontend and Python Cloud Functions
 * for the real-time interview loop.
 */

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: number;
}

export interface InterviewTurnResponse {
    user_transcript: string;
    ai_response_text: string;
    audio_base64: string;
    error?: string;
}

export type InterviewType = 'technical' | 'behavioral' | 'case_study';

// Cloud Function URL - Railway Deployment (24/7 available)
const CLOUD_FUNCTION_URL = process.env.NEXT_PUBLIC_CLOUD_FUNCTION_URL ||
    'https://interview-production-ac52.up.railway.app/interview-92a23/us-central1/process_interview_turn';

/**
 * Process a single turn in the interview.
 * Sends audio to the backend, receives transcript and AI response.
 */
export async function processInterviewTurn(
    audioBlob: Blob,
    chatHistory: ChatMessage[],
    interviewType: InterviewType = 'technical'
): Promise<InterviewTurnResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('history', JSON.stringify(chatHistory));
    formData.append('interview_type', interviewType);

    try {
        const response = await fetch(CLOUD_FUNCTION_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Interview API error: ${response.status} - ${errorText}`);
        }

        const data: InterviewTurnResponse = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        return data;
    } catch (error) {
        console.error("Backend connection error:", error);
        console.error("Tried URL:", CLOUD_FUNCTION_URL);

        // Re-throw the error instead of using mock response for now
        // This helps identify the actual issue
        if (error instanceof Error) {
            throw new Error(`Backend connection failed: ${error.message}. URL: ${CLOUD_FUNCTION_URL}`);
        }
        throw error;
    }
}

/**
 * Play audio from base64-encoded MP3 data.
 */
export function playAudioFromBase64(base64Audio: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!base64Audio) {
            resolve();
            return;
        }

        const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);

        audio.onended = () => resolve();
        audio.onerror = (e) => reject(new Error(`Audio playback error: ${e}`));

        audio.play().catch(reject);
    });
}

/**
 * Check if the Cloud Function is healthy.
 */
export async function checkHealth(): Promise<boolean> {
    try {
        const healthUrl = CLOUD_FUNCTION_URL.replace('process_interview_turn', 'health_check');
        const response = await fetch(healthUrl);
        return response.ok;
    } catch {
        return false;
    }
}
