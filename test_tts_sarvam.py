import requests
import json
import base64

# Configuration
URL = "http://127.0.0.1:5001/interview-92a23/us-central1/process_interview_turn"
AUDIO_FILE = "test_audio.wav"

def test_tts(provider, language):
    print(f"\n--- Testing TTS Provider: {provider}, Language: {language} ---")
    
    # Create dummy wav if not exists
    try:
        open(AUDIO_FILE, 'rb').close()
    except FileNotFoundError:
        import wave, struct
        with wave.open(AUDIO_FILE, "w") as f:
            f.setnchannels(1)
            f.setsampwidth(2)
            f.setframerate(44100)
            data = struct.pack("<h", 0) * 44100
            f.writeframes(data)

    files = {'audio': (AUDIO_FILE, open(AUDIO_FILE, 'rb'), 'audio/wav')}
    data = {
        'history': '[]',
        'interview_type': 'technical',
        'tts_provider': provider,
        'tts_language': language
    }
    
    try:
        response = requests.post(URL, files=files, data=data)
        
        if response.status_code == 200:
            res_json = response.json()
            audio_b64 = res_json.get("audio_base64", "")
            print(f"✅ Success! Received audio length: {len(audio_b64)}")
            
            # Save audio to check
            if audio_b64:
                filename = f"output_{provider}_{language}.mp3" # Sarvam might return wav/mp3 base64
                with open(filename, "wb") as f:
                    f.write(base64.b64decode(audio_b64))
                print(f"   Saved audio to {filename}")
        else:
            print(f"❌ Failed! Status: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    # Test Edge (Default)
    test_tts('edge', 'en-US-AriaNeural')
    
    # Test Sarvam (Hindi) - Make sure SARVAM_API_KEY is set in functions/.env or system env
    # Note: This will fail if the local function emulator doesn't have the key
    test_tts('sarvam', 'hi-IN')
