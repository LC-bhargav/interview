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
    tts_error?: string;  // ElevenLabs error if TTS failed
}

export type InterviewType = 'technical' | 'behavioral' | 'case_study';

// Cloud Function URL - Railway Deployment (24/7 available)
// Cloud Function URL - Railway Deployment (24/7 available)
// If not set (Production), use the local proxy path /api/interview/... which redirects to Railway
const CLOUD_FUNCTION_URL = process.env.NEXT_PUBLIC_CLOUD_FUNCTION_URL ||
    '/api/interview/process_interview_turn';


export interface TTSOptions {
    provider: 'edge' | 'sarvam';
    language: string;
    model?: string;
}

/**
 * Process a single turn in the interview.
 * Sends audio to the backend, receives transcript and AI response.
 */
export async function processInterviewTurn(
    audioBlob: Blob,
    chatHistory: ChatMessage[],
    interviewType: InterviewType = 'technical',
    ttsOptions: TTSOptions = { provider: 'edge', language: 'en-US-AriaNeural' }
): Promise<InterviewTurnResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('history', JSON.stringify(chatHistory));
    formData.append('interview_type', interviewType);

    // Add TTS options
    formData.append('tts_provider', ttsOptions.provider);
    formData.append('tts_language', ttsOptions.language);
    if (ttsOptions.model) {
        formData.append('tts_model', ttsOptions.model);
    }

    console.log('[Interview API] Sending request to:', CLOUD_FUNCTION_URL);
    console.log('[Interview API] Audio blob size:', audioBlob.size, 'bytes');

    try {
        const response = await fetch(CLOUD_FUNCTION_URL, {
            method: 'POST',
            body: formData,
        });

        console.log('[Interview API] Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Interview API] Error response:', errorText);
            throw new Error(`Interview API error: ${response.status} - ${errorText}`);
        }

        const data: InterviewTurnResponse = await response.json();

        console.log('[Interview API] Received response:');
        console.log('[Interview API] - User transcript:', data.user_transcript?.substring(0, 50) || '(empty)');
        console.log('[Interview API] - AI response:', data.ai_response_text?.substring(0, 50) || '(empty)');
        console.log('[Interview API] - Audio base64 length:', data.audio_base64?.length || 0);

        if (data.error) {
            console.error('[Interview API] Error in response:', data.error);
            throw new Error(data.error);
        }

        if (data.tts_error) {
            console.error('[Interview API] ⚠️ TTS (ElevenLabs) Error:', data.tts_error);
        }

        if (!data.audio_base64) {
            console.warn('[Interview API] ⚠️ No audio data in response - voice playback will be skipped');
        }

        return data;
    } catch (error) {
        console.error("[Interview API] Connection error:", error);
        console.error("[Interview API] Tried URL:", CLOUD_FUNCTION_URL);

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
        // Debug logging
        console.log('[Audio Playback] Attempting to play audio...');
        console.log('[Audio Playback] Base64 length:', base64Audio?.length || 0);

        if (!base64Audio) {
            console.warn('[Audio Playback] No audio data provided - skipping playback');
            resolve();
            return;
        }

        if (base64Audio.length < 100) {
            console.warn('[Audio Playback] Audio data seems too short:', base64Audio.substring(0, 50));
        }

        const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);

        audio.oncanplaythrough = () => {
            console.log('[Audio Playback] Audio loaded and ready to play');
        };

        audio.onended = () => {
            console.log('[Audio Playback] Playback completed successfully');
            resolve();
        };

        audio.onerror = (e) => {
            console.error('[Audio Playback] Error:', e);
            console.error('[Audio Playback] Audio error code:', audio.error?.code);
            console.error('[Audio Playback] Audio error message:', audio.error?.message);
            reject(new Error(`Audio playback error: ${audio.error?.message || e}`));
        };

        audio.play()
            .then(() => {
                console.log('[Audio Playback] play() started successfully');
            })
            .catch((err) => {
                console.error('[Audio Playback] play() failed:', err);
                reject(err);
            });
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
