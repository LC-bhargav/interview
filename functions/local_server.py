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
    generate_response,
    synthesize_speech,
    DEEPGRAM_API_KEY,
    ELEVENLABS_API_KEY,
    GROQ_API_KEY,
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
        audio_file = request.files.get('audio')
        history_json = request.form.get('history', '[]')
        interview_type = request.form.get('interview_type', 'technical')
        
        if not audio_file:
            print("Error: No audio file provided")
            return jsonify({"error": "No audio file provided"}), 400
        
        # Parse chat history
        try:
            chat_history = json.loads(history_json)
        except json.JSONDecodeError:
            chat_history = []
        
        # 2. Speech-to-Text (Deepgram)
        audio_data = audio_file.read()
        content_type = audio_file.content_type or 'audio/webm'
        
        print(f"Transcribing audio... (Size: {len(audio_data)} bytes, Type: {content_type})")
        user_transcript = transcribe_audio(audio_data, content_type)
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
        
        # 4. Text-to-Speech (ElevenLabs)
        audio_bytes = synthesize_speech(ai_response_text)
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
        }
    }), 200


if __name__ == '__main__':
    print("\n🎙️  Interview AI Backend - Local Development Server")
    print("=" * 50)
    print(f"✅ Groq API Key:      {'Set' if GROQ_API_KEY else '❌ Missing!'}")
    print(f"✅ Deepgram API Key:  {'Set' if DEEPGRAM_API_KEY else '❌ Missing!'}")
    print(f"✅ ElevenLabs Key:    {'Set' if ELEVENLABS_API_KEY else '❌ Missing!'}")
    print("=" * 50)
    print("🚀 Starting server on http://127.0.0.1:5001")
    print("=" * 50 + "\n")
    
    app.run(host='127.0.0.1', port=5001, debug=True)
