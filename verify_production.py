
import requests
import struct
import wave

# Create dummy wav
def create_dummy_wav(filename="prod_test.wav"):
    with wave.open(filename, "w") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(44100)
        data = struct.pack("<h", 0) * 44100
        f.writeframes(data)

create_dummy_wav()

url = "https://interview-production-ac52.up.railway.app/interview-92a23/us-central1/process_interview_turn"
files = {'audio': ('prod_test.wav', open('prod_test.wav', 'rb'), 'audio/wav')}
data = {'history': '[]', 'interview_type': 'technical'}

print(f"Testing Production URL: {url}...")

try:
    response = requests.post(url, files=files, data=data, timeout=30)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        res = response.json()
        print("Response JSON:", res)
            
    else:
        print(f"❌ Error: {response.text}")

except Exception as e:
    print(f"❌ Connection Failed: {e}")
