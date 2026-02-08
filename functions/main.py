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
DEEPGRAM_API_KEY = os.environ.get("DEEPGRAM_API_KEY")
ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Default: Rachel
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


def transcribe_audio(audio_data: bytes, content_type: str = "audio/webm") -> str:
    """
    Convert audio to text using Deepgram Nova-2 model.
    
    Args:
        audio_data: Raw audio bytes
        content_type: MIME type of the audio
        
    Returns:
        Transcribed text
    """
    if not DEEPGRAM_API_KEY:
        raise ValueError("DEEPGRAM_API_KEY environment variable is not set")
    
    response = requests.post(
        "https://api.deepgram.com/v1/listen",
        params={
            "model": "nova-2",
            "smart_format": "true",
            "language": "en",
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


def generate_response(user_message: str, chat_history: list, interview_type: str = "technical") -> str:
    """
    Generate AI interviewer response using Groq (FREE tier!).
    
    Args:
        user_message: The user's transcribed speech
        chat_history: Previous conversation messages
        interview_type: Type of interview (technical, behavioral, case_study)
        
    Returns:
        AI generated response text
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



def synthesize_speech(text: str) -> bytes:
    """
    Convert text to speech using ElevenLabs Turbo v2.
    
    Args:
        text: Text to convert to speech
        
    Returns:
        Audio bytes (MP3 format)
    """
    if not ELEVENLABS_API_KEY:
        raise ValueError("ELEVENLABS_API_KEY environment variable is not set")
    
    response = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}",
        headers={
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
        },
        json={
            "text": text,
            "model_id": "eleven_turbo_v2",  # Low-latency model
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75,
                "style": 0.0,
                "use_speaker_boost": True,
            }
        },
        timeout=30,
    )
    
    if response.status_code != 200:
        raise Exception(f"ElevenLabs API error: {response.status_code} - {response.text}")
    
    return response.content


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
    secrets=["DEEPGRAM_API_KEY", "GROQ_API_KEY", "ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID"],
)
def process_interview_turn(req: https_fn.Request) -> https_fn.Response:
    """
    Process a single turn in the interview conversation.
    
    Expects:
        - audio: Audio file (multipart/form-data)
        - history: JSON string of chat history
        - interview_type: Type of interview (optional)
        
    Returns:
        JSON with user_transcript, ai_response_text, and audio_base64
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
        audio_file = req.files.get("audio")
        history_json = req.form.get("history", "[]")
        interview_type = req.form.get("interview_type", "technical")
        
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
        
        # 2. Speech-to-Text (Deepgram)
        audio_data = audio_file.read()
        content_type = audio_file.content_type or "audio/webm"
        
        print(f"Transcribing audio... (Size: {len(audio_data)} bytes, Type: {content_type})")
        user_transcript = transcribe_audio(audio_data, content_type)
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
        
        # 3. Generate AI Response (OpenAI)
        ai_response_text = generate_response(user_transcript, chat_history, interview_type)
        
        # 4. Text-to-Speech (ElevenLabs)
        audio_bytes = synthesize_speech(ai_response_text)
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
    secrets=["DEEPGRAM_API_KEY", "GROQ_API_KEY", "ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID"],
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
            }
        }),
        status=200,
        content_type="application/json"
    )

