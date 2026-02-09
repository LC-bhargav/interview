
import requests
import wave
import struct

# Create a 1-second silence WAV file
def create_dummy_wav(filename="test_audio.wav"):
    with wave.open(filename, "w") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(44100)
        data = struct.pack("<h", 0) * 44100
        f.writeframes(data)
    print(f"Created {filename}")

create_dummy_wav()

url = "http://127.0.0.1:5001/interview-92a23/us-central1/process_interview_turn"
files = {'audio': ('test_audio.wav', open('test_audio.wav', 'rb'), 'audio/wav')}
data = {'history': '[]', 'interview_type': 'technical'}

print(f"Sending request to {url}...")
try:
    response = requests.post(url, files=files, data=data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        res_json = response.json()
        transcript = res_json.get("user_transcript", "")
        ai_text = res_json.get("ai_response_text", "")
        audio = res_json.get("audio_base64", "")
        
        print(f"Transcript: {transcript[:50]}...")
        print(f"AI Response: {ai_text[:50]}...")
        print(f"Audio Length: {len(audio)}")
        
        if len(audio) > 100:
            print("✅ TTS SUCCESS! Audio generated.")
        else:
            print("❌ TTS FAILED. No audio generated.")
            print(res_json)
    else:
        print(f"❌ Error: {response.text}")

except Exception as e:
    print(f"❌ Connection failed: {e}")
