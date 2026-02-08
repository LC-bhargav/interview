import { useState, useRef, useCallback } from "react";

interface AudioRecorderState {
    isRecording: boolean;
    isPaused: boolean;
    error: string | null;
}

export interface UseAudioRecorderReturn {
    isRecording: boolean;
    isPaused: boolean;
    error: string | null;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<Blob | null>;
    pauseRecording: () => void;
    resumeRecording: () => void;
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
    const [state, setState] = useState<AudioRecorderState>({
        isRecording: false,
        isPaused: false,
        error: null,
    });

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    const startRecording = useCallback(async () => {
        try {
            // Reset any previous error
            setState(prev => ({ ...prev, error: null }));

            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                }
            });

            streamRef.current = stream;

            // Determine the best supported MIME type
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : 'audio/mp4';

            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onerror = () => {
                setState(prev => ({ ...prev, error: 'Recording error occurred' }));
            };

            // Start recording with 100ms timeslice for smoother data collection
            mediaRecorderRef.current.start(100);
            setState({ isRecording: true, isPaused: false, error: null });

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
            setState(prev => ({ ...prev, error: errorMessage }));
            console.error('Error starting recording:', err);
        }
    }, []);

    const stopRecording = useCallback((): Promise<Blob | null> => {
        return new Promise((resolve) => {
            if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
                resolve(null);
                return;
            }

            mediaRecorderRef.current.onstop = () => {
                // Get the MIME type from the recorder
                const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                audioChunksRef.current = []; // Reset for next recording

                // Stop all tracks to release the microphone
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }

                setState({ isRecording: false, isPaused: false, error: null });
                resolve(audioBlob);
            };

            mediaRecorderRef.current.stop();
        });
    }, []);

    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.pause();
            setState(prev => ({ ...prev, isPaused: true }));
        }
    }, []);

    const resumeRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
            mediaRecorderRef.current.resume();
            setState(prev => ({ ...prev, isPaused: false }));
        }
    }, []);

    return {
        isRecording: state.isRecording,
        isPaused: state.isPaused,
        error: state.error,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
    };
};
