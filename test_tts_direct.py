
import sys
import os

# Add functions directory to path
sys.path.append(os.path.join(os.getcwd(), 'functions'))

from functions.main import synthesize_speech

try:
    print("Testing Edge-TTS...")
    text = "Hello! This is a test of the new free text to speech system."
    audio_bytes = synthesize_speech(text)
    
    print(f"Success! Generated {len(audio_bytes)} bytes of audio.")
    
    # Save to file to verify
    with open("test_output.mp3", "wb") as f:
        f.write(audio_bytes)
    print("Saved to test_output.mp3")

except Exception as e:
    print(f"❌ Error: {e}")
