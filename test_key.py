
import os
import requests
from dotenv import load_dotenv

# Load from functions/.env
load_dotenv('functions/.env')

api_key = os.environ.get("ELEVENLABS_API_KEY")

if not api_key:
    print("No API Key found in functions/.env")
    exit(1)

print(f"Testing Key: {api_key[:5]}...{api_key[-5:]}")

response = requests.get(
    "https://api.elevenlabs.io/v1/user",
    headers={"xi-api-key": api_key}
)

if response.status_code == 200:
    print("✅ API Key is VALID!")
    user_data = response.json()
    print(f"User: {user_data.get('subscription', {}).get('tier', 'unknown')} tier")
    print(f"Chars used: {user_data.get('subscription', {}).get('character_count', 0)}")
    print(f"Chars limit: {user_data.get('subscription', {}).get('character_limit', 0)}")
else:
    print(f"❌ API Key is INVALID. Status: {response.status_code}")
    print(response.text)
