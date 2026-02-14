"""
Local Development Server for Interview AI Backend

Run this to start the backend locally:
    python local_server.py

This creates a Flask server that mimics the Firebase Cloud Functions.
"""

import os
import json
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import the processing functions from main.py
from main import (
    transcribe_audio,
    transcribe_audio_sarvam,
    generate_response,
    synthesize_speech_edge,
    synthesize_speech_sarvam,
    DEEPGRAM_API_KEY,
    ELEVENLABS_API_KEY,
    GROQ_API_KEY,
    SARVAM_API_KEY,
    get_groq_client,
)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route('/interview-92a23/us-central1/process_interview_turn', methods=['POST', 'OPTIONS'])
def process_interview_turn():
    """Process a single turn in the interview conversation."""
    
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        # 1. Parse request
        print("DEBUG: Request Form Data:", request.form)
        audio_file = request.files.get('audio')
        history_json = request.form.get('history', '[]')
        interview_type = request.form.get('interview_type', 'technical')
        
        # TTS Options
        tts_provider = request.form.get('tts_provider', 'edge')
        tts_language = request.form.get('tts_language', 'hi-IN')
        tts_model = request.form.get('tts_model', 'bulbul:v3')
        
        if not audio_file:
            print("Error: No audio file provided")
            return jsonify({"error": "No audio file provided"}), 400
        
        # Parse chat history
        try:
            chat_history = json.loads(history_json)
        except json.JSONDecodeError:
            chat_history = []
        
        # 2. Speech-to-Text (Deepgram or Sarvam)
        audio_data = audio_file.read()
        content_type = audio_file.content_type or 'audio/webm'
        
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
            return jsonify({
                "error": "Could not transcribe audio. Please speak more clearly.",
                "user_transcript": "",
                "ai_response_text": "",
                "audio_base64": ""
            }), 200
        
        # 3. Generate AI Response
        ai_response_text = generate_response(user_transcript, chat_history, interview_type)
        print(f"AI Response: '{ai_response_text}'")
        
        # 4. Text-to-Speech
        print(f"Synthesizing speech using {tts_provider}...")
        if tts_provider == 'sarvam':
            audio_bytes = synthesize_speech_sarvam(ai_response_text, tts_language)
        else:
            audio_bytes = synthesize_speech_edge(ai_response_text)
            
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        # 5. Return response
        return jsonify({
            "user_transcript": user_transcript,
            "ai_response_text": ai_response_text,
            "audio_base64": audio_base64,
        }), 200
        
    except Exception as e:
        print(f"Error processing interview turn: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/interview-92a23/us-central1/health_check', methods=['GET'])
def health_check():
    """Simple health check endpoint."""
    return jsonify({
        "status": "healthy",
        "services": {
            "groq": bool(GROQ_API_KEY),
            "deepgram": bool(DEEPGRAM_API_KEY),
            "elevenlabs": bool(ELEVENLABS_API_KEY),
            "sarvam": bool(SARVAM_API_KEY),
        }
    }), 200


if __name__ == '__main__':
    print("\n🎙️  Interview AI Backend - Local Development Server")
    print("=" * 50)
    print(f"✅ Groq API Key:      {'Set' if GROQ_API_KEY else '❌ Missing!'}")
    print(f"✅ Deepgram API Key:  {'Set' if DEEPGRAM_API_KEY else '❌ Missing!'}")
    print(f"✅ ElevenLabs Key:    {'Set' if ELEVENLABS_API_KEY else '❌ Missing!'}")
    print(f"✅ Sarvam API Key:    {'Set' if SARVAM_API_KEY else '❌ Missing!'}")
    print("=" * 50)
    print("🚀 Starting server on http://127.0.0.1:5001")
    print("=" * 50 + "\n")
    
    app.run(host='127.0.0.1', port=5001, debug=True)
