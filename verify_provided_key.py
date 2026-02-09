
import requests

api_key = "sk_9d33ec85c5bd36efe4f9f788fca1e7f7f97d81912a68a9ae"

print(f"Testing Key: {api_key}")

response = requests.get(
    "https://api.elevenlabs.io/v1/user",
    headers={"xi-api-key": api_key}
)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code == 200:
    print("✅ VALID")
else:
    print("❌ INVALID")
