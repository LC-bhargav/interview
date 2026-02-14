"""
Firebase Cloud Functions for Interview AI

This module provides the real-time interview processing loop:
1. Deepgram: Speech-to-Text (STT)
2. Groq: LLM Response Generation (FREE tier with no billing!)
3. ElevenLabs: Text-to-Speech (TTS)
"""

import os
import json
import base64
import requests
from typing import Optional
from firebase_functions import https_fn, options
from firebase_admin import initialize_app, firestore
from groq import Groq
from dotenv import load_dotenv

# Load environment variables for local development
load_dotenv()

# Initialize Firebase
initialize_app()

# Initialize clients from environment variables

# Initialize clients from environment variables
DEEPGRAM_API_KEY = os.environ.get("DEEPGRAM_API_KEY")
ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Default: Rachel
SARVAM_API_KEY = os.environ.get("SARVAM_API_KEY")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

# Configure Groq
groq_client = None

def get_groq_client():
    """Lazy initialization of Groq client."""
    global groq_client
    if groq_client is None:
        if not GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        groq_client = Groq(api_key=GROQ_API_KEY)
    return groq_client


def transcribe_audio(audio_data: bytes, language: str = "en", content_type: str = "audio/webm") -> str:
    """
    Convert audio to text using Deepgram Nova-2 model.
    """
    if not DEEPGRAM_API_KEY:
        raise ValueError("DEEPGRAM_API_KEY environment variable is not set")
    
    response = requests.post(
        "https://api.deepgram.com/v1/listen",
        params={
            "model": "nova-2",
            "smart_format": "true",
            "language": language,
        },
        headers={
            "Authorization": f"Token {DEEPGRAM_API_KEY}",
            "Content-Type": content_type,
        },
        data=audio_data,
        timeout=30,
    )
    
    if response.status_code != 200:
        raise Exception(f"Deepgram API error: {response.status_code} - {response.text}")
    
    result = response.json()
    transcript = result.get("results", {}).get("channels", [{}])[0].get("alternatives", [{}])[0].get("transcript", "")
    
    return transcript


def transcribe_audio_sarvam(audio_data: bytes, language_code: str = "hi-IN", content_type: str = "audio/webm") -> str:
    """
    Convert audio to text using Sarvam AI (saarika:v2.5).
    """
    if not SARVAM_API_KEY:
        raise ValueError("SARVAM_API_KEY environment variable is not set")
    
    headers = {
        "api-subscription-key": SARVAM_API_KEY,
    }
    
    # Sarvam might reject complex content types, strip params
    if ";" in content_type:
        content_type = content_type.split(";")[0].strip()

    files = {
        "file": ("audio.webm", audio_data, content_type)
    }
    
    data = {
        "model": "saarika:v2.5",
        "language_code": language_code,
        "with_diarization": "false"
    }

    response = requests.post(
        "https://api.sarvam.ai/speech-to-text",
        headers=headers,
        files=files,
        data=data,
        timeout=30
    )
    
    if response.status_code != 200:
        raise Exception(f"Sarvam STT API error: {response.status_code} - {response.text}")
    
    result = response.json()
    transcript = result.get("transcript", "")
    
    return transcript


def generate_response(user_message: str, chat_history: list, interview_type: str = "technical") -> str:
    """
    Generate AI interviewer response using Groq (FREE tier!).
    """
    client = get_groq_client()
    
    # System prompts for different interview types
    system_prompts = {
        "technical": """You are a senior technical interviewer at a top tech company. 
Your goal is to assess the candidate's technical skills through thoughtful questions and follow-ups.
- Ask one question at a time
- Keep responses concise (2-3 sentences max)
- Be professional but encouraging
- If the answer is incomplete, ask a clarifying follow-up
- Probe for depth of understanding""",
        
        "behavioral": """You are an experienced HR interviewer focusing on behavioral competencies.
Use the STAR method (Situation, Task, Action, Result) to probe candidates.
- Ask one behavioral question at a time
- Keep responses brief (2-3 sentences)
- Be warm and professional
- Look for specific examples, not general statements
- Ask follow-up questions to get concrete details""",
        
        "case_study": """You are a management consultant conducting a case interview.
Present business problems and guide the candidate through structured problem-solving.
- Start with a clear business scenario
- Keep responses concise (2-3 sentences)
- Let the candidate lead the analysis
- Provide hints if they're stuck
- Evaluate their framework and logical thinking"""
    }
    
    system_prompt = system_prompts.get(interview_type, system_prompts["technical"])
    
    # Build messages array (OpenAI-compatible format)
    messages = [{"role": "system", "content": system_prompt}]
    
    # Add chat history
    for msg in chat_history:
        messages.append({
            "role": msg.get("role", "user"),
            "content": msg.get("content", "")
        })
    
    # Add current user message
    messages.append({"role": "user", "content": user_message})
    
    # Generate response using Groq (llama-3.3-70b-versatile is fast and free)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=200,
        temperature=0.7,
    )
    
    return response.choices[0].message.content or ""


import asyncio
import edge_tts

def synthesize_speech_edge(text: str) -> bytes:
    """
    Convert text to speech using Edge-TTS (Free).
    """
    voice = "en-US-AriaNeural"
    communicate = edge_tts.Communicate(text, voice)
    
    async def get_audio():
        audio_data = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]
        return audio_data

    try:
        # Run async function in sync wrapper
        return asyncio.run(get_audio())
    except Exception as e:
        raise Exception(f"Edge-TTS error: {str(e)}")


def synthesize_speech_sarvam(text: str, language_code: str = "hi-IN", speaker: str = "priya") -> bytes:
    """
    Convert text to speech using Sarvam AI.
    """
    if not SARVAM_API_KEY:
        raise ValueError("SARVAM_API_KEY environment variable is not set")
    
    # Map 'en-IN' to a valid speaker if needed, though 'meera' works for multiple
    
    headers = {
        "api-subscription-key": SARVAM_API_KEY,
        "Content-Type": "application/json"
    }
    
    payload = {
        "inputs": [text],
        "target_language_code": language_code,
        "speaker": speaker,
        "pace": 1.0,
        "speech_sample_rate": 8000,
        "enable_preprocessing": True,
        "model": "bulbul:v3"
    }

    response = requests.post(
        "https://api.sarvam.ai/text-to-speech",
        headers=headers,
        json=payload,
        timeout=30
    )
    
    if response.status_code != 200:
        raise Exception(f"Sarvam AI API error: {response.status_code} - {response.text}")
    
    result = response.json()
    # Sarvam returns audio as base64 string in 'audios' array
    audio_base64 = result.get("audios", [""])[0]
    
    if not audio_base64:
        raise Exception("Sarvam AI returned empty audio")
        
    return base64.b64decode(audio_base64)


# Configure CORS for the function
cors_options = options.CorsOptions(
    cors_origins="*",  # Allow all origins for debugging
    cors_methods=["POST", "OPTIONS"],
)


@https_fn.on_request(
    cors=cors_options,
    memory=options.MemoryOption.GB_1,
    timeout_sec=60,
    min_instances=0,  # Set to 1 in production for lower latency
    secrets=["DEEPGRAM_API_KEY", "GROQ_API_KEY", "ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID", "SARVAM_API_KEY"],
)
def process_interview_turn(req: https_fn.Request) -> https_fn.Response:
    """
    Process a single turn in the interview conversation.
    """
    try:
        # Handle preflight OPTIONS request
        if req.method == "OPTIONS":
            return https_fn.Response("", status=204)
        
        if req.method != "POST":
            return https_fn.Response(
                json.dumps({"error": "Method not allowed"}),
                status=405,
                content_type="application/json"
            )
        
        # 1. Parse request
        print("DEBUG: Request Form Data:", req.form)
        audio_file = req.files.get("audio")
        history_json = req.form.get("history", "[]")
        interview_type = req.form.get("interview_type", "technical")
        
        # TTS Options
        tts_provider = req.form.get("tts_provider", "edge")  # 'edge' or 'sarvam'
        tts_language = req.form.get("tts_language", "hi-IN")
        tts_model = req.form.get("tts_model", "bulbul:v3")
        
        if not audio_file:
            print("Error: No audio file provided")
            return https_fn.Response(
                json.dumps({"error": "No audio file provided"}),
                status=400,
                content_type="application/json"
            )
        
        # Parse chat history
        try:
            chat_history = json.loads(history_json)
        except json.JSONDecodeError:
            chat_history = []
        
        # 2. Speech-to-Text (Deepgram or Sarvam)
        audio_data = audio_file.read()
        content_type = audio_file.content_type or "audio/webm"
        
        # Check if we should use Sarvam STT (for Indic languages when Sarvam TTS selected)
        use_sarvam_stt = False
        if tts_provider == "sarvam" and tts_language:
            if not tts_language.startswith("en-"):
                use_sarvam_stt = True
        
        if use_sarvam_stt:
            print(f"Transcribing audio with Sarvam (Language: {tts_language})...")
            user_transcript = transcribe_audio_sarvam(audio_data, language_code=tts_language, content_type=content_type)
        else:
            # Fallback to Deepgram for English
            stt_language = "en"
            print(f"Transcribing audio with Deepgram (Language: {stt_language})...")
            user_transcript = transcribe_audio(audio_data, language=stt_language, content_type=content_type)

        print(f"Transcript: '{user_transcript}'")
        
        if not user_transcript.strip():
            print("Error: Empty transcript")
            return https_fn.Response(
                json.dumps({
                    "error": "Could not transcribe audio. Please speak more clearly.",
                    "user_transcript": "",
                    "ai_response_text": "",
                    "audio_base64": ""
                }),
                status=200,
                content_type="application/json"
            )
        
        # 3. Generate AI Response (Groq)
        ai_response_text = generate_response(user_transcript, chat_history, interview_type)
        
        # 4. Text-to-Speech
        print(f"Synthesizing speech using {tts_provider}...")
        if tts_provider == "sarvam":
            audio_bytes = synthesize_speech_sarvam(ai_response_text, tts_language)
        else:
            audio_bytes = synthesize_speech_edge(ai_response_text)
            
        audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
        
        # 5. Return response
        return https_fn.Response(
            json.dumps({
                "user_transcript": user_transcript,
                "ai_response_text": ai_response_text,
                "audio_base64": audio_base64,
            }),
            status=200,
            content_type="application/json"
        )
        
    except Exception as e:
        print(f"Error processing interview turn: {str(e)}")
        return https_fn.Response(
            json.dumps({"error": str(e)}),
            status=500,
            content_type="application/json"
        )


@https_fn.on_request(
    cors=cors_options,
    secrets=["DEEPGRAM_API_KEY", "GROQ_API_KEY", "ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID", "SARVAM_API_KEY"],
)
def health_check(req: https_fn.Request) -> https_fn.Response:
    """Simple health check endpoint."""
    return https_fn.Response(
        json.dumps({
            "status": "healthy",
            "services": {
                "groq": bool(GROQ_API_KEY),
                "deepgram": bool(DEEPGRAM_API_KEY),
                "elevenlabs": bool(ELEVENLABS_API_KEY),
                "sarvam": bool(SARVAM_API_KEY),
            }
        }),
        status=200,
        content_type="application/json"
    )
