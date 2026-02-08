"""
Interview AI Backend - Flask Server for Railway Deployment

This is the main entry point for Railway deployment.
Provides REST API endpoints for the interview AI system.
"""

import os
import json
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import requests
from groq import Groq

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# API Keys from environment
DEEPGRAM_API_KEY = os.environ.get("DEEPGRAM_API_KEY")
ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

# Lazy Groq client
groq_client = None

def get_groq_client():
    global groq_client
    if groq_client is None:
        if not GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY not set")
        groq_client = Groq(api_key=GROQ_API_KEY)
    return groq_client


def transcribe_audio(audio_data: bytes, content_type: str = "audio/webm") -> str:
    """Convert audio to text using Deepgram."""
    if not DEEPGRAM_API_KEY:
        raise ValueError("DEEPGRAM_API_KEY not set")
    
    response = requests.post(
        "https://api.deepgram.com/v1/listen",
        params={"model": "nova-2", "smart_format": "true", "language": "en"},
        headers={"Authorization": f"Token {DEEPGRAM_API_KEY}", "Content-Type": content_type},
        data=audio_data,
        timeout=30,
    )
    
    if response.status_code != 200:
        raise Exception(f"Deepgram error: {response.status_code}")
    
    result = response.json()
    return result.get("results", {}).get("channels", [{}])[0].get("alternatives", [{}])[0].get("transcript", "")


def generate_response(user_message: str, chat_history: list, interview_type: str = "technical") -> str:
    """Generate AI response using Groq."""
    client = get_groq_client()
    
    prompts = {
        "technical": "You are a senior technical interviewer. Ask one question at a time, keep responses to 2-3 sentences.",
        "behavioral": "You are an HR interviewer using STAR method. Ask one behavioral question at a time, keep responses brief.",
        "case_study": "You are a management consultant conducting a case interview. Keep responses concise.",
    }
    
    messages = [{"role": "system", "content": prompts.get(interview_type, prompts["technical"])}]
    messages.extend([{"role": m.get("role", "user"), "content": m.get("content", "")} for m in chat_history])
    messages.append({"role": "user", "content": user_message})
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=200,
        temperature=0.7,
    )
    
    return response.choices[0].message.content or ""


def synthesize_speech(text: str) -> bytes:
    """Convert text to speech using ElevenLabs."""
    if not ELEVENLABS_API_KEY:
        raise ValueError("ELEVENLABS_API_KEY not set")
    
    response = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}",
        headers={"xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json"},
        json={
            "text": text,
            "model_id": "eleven_turbo_v2",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "use_speaker_boost": True},
        },
        timeout=30,
    )
    
    if response.status_code != 200:
        raise Exception(f"ElevenLabs error: {response.status_code}")
    
    return response.content


@app.route('/interview-92a23/us-central1/process_interview_turn', methods=['POST', 'OPTIONS'])
def process_interview_turn():
    """Process a single interview turn."""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        audio_file = request.files.get('audio')
        history_json = request.form.get('history', '[]')
        interview_type = request.form.get('interview_type', 'technical')
        
        if not audio_file:
            return jsonify({"error": "No audio file"}), 400
        
        chat_history = json.loads(history_json) if history_json else []
        
        # 1. Transcribe
        audio_data = audio_file.read()
        content_type = audio_file.content_type or 'audio/webm'
        user_transcript = transcribe_audio(audio_data, content_type)
        
        if not user_transcript.strip():
            return jsonify({"error": "Could not transcribe", "user_transcript": "", "ai_response_text": "", "audio_base64": ""}), 200
        
        # 2. Generate response
        ai_response = generate_response(user_transcript, chat_history, interview_type)
        
        # 3. Synthesize speech (with fallback if ElevenLabs fails)
        audio_base64 = ""
        try:
            audio_bytes = synthesize_speech(ai_response)
            audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        except Exception as e:
            print(f"ElevenLabs failed (continuing without audio): {e}")
            # Continue without audio - the text response will still work
        
        return jsonify({
            "user_transcript": user_transcript,
            "ai_response_text": ai_response,
            "audio_base64": audio_base64,
        }), 200
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/interview-92a23/us-central1/health_check', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "services": {"groq": bool(GROQ_API_KEY), "deepgram": bool(DEEPGRAM_API_KEY), "elevenlabs": bool(ELEVENLABS_API_KEY)},
    }), 200


@app.route('/', methods=['GET'])
def home():
    """Root endpoint."""
    return jsonify({"message": "Interview AI Backend", "status": "running"}), 200


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)
