"use client";

import { WireframeBox } from '@/components/wireframe/WireframeBox';
import { WireframeButton } from '@/components/wireframe/WireframeButton';
import { WireframeText } from '@/components/wireframe/WireframeText';
import { WireframeImage } from '@/components/wireframe/WireframeImage';
import { MacWindow } from '@/components/wireframe/MacWindow';
import { IsoCard } from '@/components/wireframe/IsoCard';
import { IsoButton } from '@/components/wireframe/IsoButton';
// ... (imports remain mostly same, adding VideoOff)
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import {
    processInterviewTurn,
    playAudioFromBase64,
    ChatMessage,
    InterviewType
} from '@/services/interviewService';

interface InterviewRoomProps {
    onEnd?: () => void;
    interviewType?: InterviewType;
}

export function InterviewRoom({ onEnd, interviewType = 'technical' }: InterviewRoomProps) {

    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);
    const [isVideoOn, setIsVideoOn] = useState(true);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const { isRecording, startRecording, stopRecording, error: recordingError } = useAudioRecorder();



    // Timer for interview duration
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Video stream initialization
    useEffect(() => {
        let stream: MediaStream | null = null;

        const startVideo = async () => {
            if (isVideoOn) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (err) {
                    console.error("Error accessing camera:", err);
                    setError("Could not access camera. Please allow permissions.");
                    setIsVideoOn(false);
                }
            }
        };

        startVideo();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isVideoOn]);

    const toggleVideo = () => {
        setIsVideoOn(!isVideoOn);
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const [ttsProvider, setTtsProvider] = useState<'edge' | 'sarvam'>('edge');
    const [ttsLanguage, setTtsLanguage] = useState<string>('en-US-AriaNeural');
    const [showSettings, setShowSettings] = useState(false);

    // sarvam languages
    const sarvamLanguages = [
        { code: 'hi-IN', name: 'Hindi' },
        { code: 'bn-IN', name: 'Bengali' },
        { code: 'kn-IN', name: 'Kannada' },
        { code: 'ml-IN', name: 'Malayalam' },
        { code: 'mr-IN', name: 'Marathi' },
        { code: 'od-IN', name: 'Odia' },
        { code: 'pa-IN', name: 'Punjabi' },
        { code: 'ta-IN', name: 'Tamil' },
        { code: 'te-IN', name: 'Telugu' },
        { code: 'gu-IN', name: 'Gujarati' },
        { code: 'en-IN', name: 'English (India)' },
    ];

    const handleToggleRecording = async () => {
        if (isRecording) {
            // Stop recording and process
            setIsProcessing(true);
            setError(null);

            try {
                const audioBlob = await stopRecording();

                if (!audioBlob) {
                    throw new Error('No audio recorded');
                }

                // Process the interview turn
                const response = await processInterviewTurn(
                    audioBlob,
                    chatHistory,
                    interviewType,
                    {
                        provider: ttsProvider,
                        language: ttsLanguage
                    }
                );

                // Update chat history
                const newMessages: ChatMessage[] = [
                    { role: 'user', content: response.user_transcript, timestamp: Date.now() },
                    { role: 'assistant', content: response.ai_response_text, timestamp: Date.now() },
                ];

                setChatHistory(prev => [...prev, ...newMessages]);

                // Play the AI response audio
                if (response.audio_base64) {
                    await playAudioFromBase64(response.audio_base64);
                }

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to process recording';
                setError(errorMessage);
                console.error('Interview turn error:', err);
            } finally {
                setIsProcessing(false);
            }
        } else {
            // Start recording
            setError(null);
            try {
                await startRecording();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
                setError(errorMessage);
            }
        }
    };

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            {/* Header */}
            {/* ... (Header remains same) */}
            <WireframeBox className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <WireframeText variant="h3">Interview Session</WireframeText>
                    <WireframeBox dashed className="px-3 py-1">
                        <WireframeText variant="caption">🔴 Recording</WireframeText>
                    </WireframeBox>
                </div>
                <div className="flex items-center gap-3">
                    <WireframeText variant="caption">Duration: {formatDuration(duration)}</WireframeText>
                    <WireframeButton variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
                        Settings
                    </WireframeButton>
                    <WireframeButton variant="outline" size="sm" onClick={onEnd}>End Interview</WireframeButton>
                </div>
            </WireframeBox>

            {/* Settings Modal */}
            {showSettings && (
                <div className="absolute top-16 right-4 z-50 w-80 shadow-xl">
                    <MacWindow title="Audio Settings">
                        <div className="p-4 space-y-4 bg-white">
                            <div>
                                <label className="block text-sm font-bold mb-1">TTS Provider</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setTtsProvider('edge');
                                            setTtsLanguage('en-US-AriaNeural');
                                        }}
                                        className={`flex-1 px-3 py-2 border-2 text-sm font-mono ${ttsProvider === 'edge' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`}
                                    >
                                        Edge (Free)
                                    </button>
                                    <button
                                        onClick={() => {
                                            setTtsProvider('sarvam');
                                            setTtsLanguage('hi-IN');
                                        }}
                                        className={`flex-1 px-3 py-2 border-2 text-sm font-mono ${ttsProvider === 'sarvam' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`}
                                    >
                                        Sarvam AI
                                    </button>
                                </div>
                            </div>

                            {ttsProvider === 'sarvam' && (
                                <div>
                                    <label className="block text-sm font-bold mb-1">Language</label>
                                    <select
                                        value={ttsLanguage}
                                        onChange={(e) => setTtsLanguage(e.target.value)}
                                        className="w-full p-2 border-2 border-black font-mono text-sm"
                                    >
                                        {sarvamLanguages.map((lang) => (
                                            <option key={lang.code} value={lang.code}>
                                                {lang.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {ttsProvider === 'edge' && (
                                <div className="text-xs text-gray-500 font-mono">
                                    Using default English (Aria) voice.
                                </div>
                            )}

                            <WireframeButton variant="primary" size="sm" className="w-full" onClick={() => setShowSettings(false)}>
                                Done
                            </WireframeButton>
                        </div>
                    </MacWindow>
                </div>
            )}

            {/* Error Display */}
            {/* ... (Error display remains same) */}
            {(error || recordingError) && (
                <div className="mx-4 mt-2">
                    <WireframeBox className="p-3 bg-red-50 border-red-400">
                        <WireframeText variant="caption" className="text-red-600">
                            {error || recordingError}
                        </WireframeText>
                    </WireframeBox>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden">
                {/* Video Area */}
                <div className="col-span-2 flex flex-col gap-4">
                    {/* Candidate Video */}
                    {/* Candidate Video */}
                    <MacWindow title="AI Interviewer" className="relative flex-1">
                        <WireframeImage height="100%" label="AI INTERVIEWER" />

                        {/* Interviewer Video (Picture-in-Picture) */}
                        <MacWindow title="Your Camera" className="h-48 w-72 absolute bottom-32 left-1/2 -translate-x-1/2 shadow-xl z-20 transition-all hover:scale-105">
                            {isVideoOn ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover bg-black transform scale-x-[-1]"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center text-gray-500">
                                    <VideoOff size={24} />
                                    <span className="text-[10px] mt-1">Camera Off</span>
                                </div>
                            )}
                        </MacWindow>
                    </MacWindow>

                    {/* Controls */}
                    <WireframeBox className="p-4">
                        <div className="flex items-center justify-center gap-4">
                            <WireframeButton
                                variant={isRecording ? "primary" : "outline"}
                                size="lg"
                                onClick={handleToggleRecording}
                                disabled={isProcessing}
                                className={isRecording ? "bg-red-600 hover:bg-red-700" : ""}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 animate-spin" size={20} />
                                        Processing...
                                    </>
                                ) : isRecording ? (
                                    <>
                                        <MicOff className="mr-2" size={20} />
                                        Stop Recording
                                    </>
                                ) : (
                                    <>
                                        <Mic className="mr-2" size={20} />
                                        Start Recording
                                    </>
                                )}
                            </WireframeButton>
                            <WireframeButton variant="outline" size="lg" onClick={toggleVideo}>
                                {isVideoOn ? (
                                    <>
                                        <Video className="mr-2" size={20} />
                                        Stop Video
                                    </>
                                ) : (
                                    <>
                                        <VideoOff className="mr-2" size={20} />
                                        Start Video
                                    </>
                                )}
                            </WireframeButton>
                            <WireframeButton variant="outline" size="lg">
                                <MessageSquare className="mr-2" size={20} />
                                Chat
                            </WireframeButton>
                            <WireframeButton variant="primary" size="lg" className="bg-red-600 hover:bg-red-700" onClick={onEnd}>
                                <PhoneOff className="mr-2" size={20} />
                                Leave
                            </WireframeButton>
                        </div>
                    </WireframeBox>
                </div>

                {/* Sidebar */}
                {/* ... (Sidebar remains same) */}
                <div className="flex flex-col gap-4 overflow-hidden">
                    {/* Conversation Progress */}
                    <IsoCard className="p-4">
                        <WireframeText variant="h3" className="mb-3">Interview Progress</WireframeText>
                        <div className="space-y-2">
                            <div className="flex justify-between mb-2">
                                <WireframeText variant="caption">
                                    {chatHistory.filter(m => m.role === 'assistant').length} exchanges
                                </WireframeText>
                                <WireframeText variant="caption">{formatDuration(duration)}</WireframeText>
                            </div>
                            <div className="w-full h-4 border-2 border-black bg-white">
                                <div
                                    className="h-full bg-black transition-all"
                                    style={{ width: `${Math.min(100, chatHistory.filter(m => m.role === 'assistant').length * 20)}%` }}
                                />
                            </div>
                        </div>
                    </IsoCard>

                    {/* Current Question (from AI) */}
                    <IsoCard className="p-4" color="bg-yellow-50">
                        <WireframeText variant="h3" className="mb-3">Current Question</WireframeText>
                        <WireframeBox dashed className="p-4 bg-white">
                            <WireframeText variant="body">
                                {/* Show latest AI response, or default starter question */}
                                {chatHistory.filter(m => m.role === 'assistant').slice(-1)[0]?.content
                                    || "Hello! Let's begin the interview. Please introduce yourself and tell me about your background."}
                            </WireframeText>
                        </WireframeBox>
                    </IsoCard>

                    {/* Chat History */}
                    <WireframeBox className="p-4 flex-1 overflow-hidden flex flex-col">
                        <WireframeText variant="h3" className="mb-3">Conversation</WireframeText>
                        <div className="flex-1 overflow-y-auto space-y-3">
                            {chatHistory.length === 0 ? (
                                <WireframeText variant="caption" className="text-gray-400">
                                    Click &quot;Start Recording&quot; to begin the interview...
                                </WireframeText>
                            ) : (
                                chatHistory.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-2 rounded ${msg.role === 'user'
                                            ? 'bg-blue-50 border-l-4 border-blue-400'
                                            : 'bg-gray-50 border-l-4 border-gray-400'
                                            }`}
                                    >
                                        <WireframeText variant="caption" className="font-bold mb-1">
                                            {msg.role === 'user' ? 'You' : 'Interviewer'}
                                        </WireframeText>
                                        <WireframeText variant="caption">{msg.content}</WireframeText>
                                    </div>
                                ))
                            )}
                        </div>
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
