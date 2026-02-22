import requests

url = "https://interview-production-ac52.up.railway.app/"
print(f"Checking root: {url}")
try:
    r = requests.get(url, timeout=10)
    print(f"Root status: {r.status_code}")
    print(f"Root body: {r.text}")
except Exception as e:
    print(f"Root error: {e}")

health_url = "https://interview-production-ac52.up.railway.app/interview-92a23/us-central1/health_check"
print(f"\nChecking health: {health_url}")
try:
    r = requests.get(health_url, timeout=10)
    print(f"Health status: {r.status_code}")
    print(f"Health body: {r.text}")
except Exception as e:
    print(f"Health error: {e}")
