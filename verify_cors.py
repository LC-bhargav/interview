
import requests

# Test Production
url = "https://interview-production-ac52.up.railway.app/interview-92a23/us-central1/process_interview_turn"

print(f"Checking Headers for: {url}")

try:
    # 1. Check OPTIONS (Preflight)
    print("\n--- OPTIONS Request ---")
    resp_opt = requests.options(url, headers={
        "Access-Control-Request-Method": "POST",
        "Origin": "https://interview-olive-ten.vercel.app" 
    })
    print(f"Status: {resp_opt.status_code}")
    print("Headers:")
    for k, v in resp_opt.headers.items():
        if "Access-Control" in k:
            print(f"  {k}: {v}")

    # 2. Check POST (Actual Request)
    print("\n--- POST Request ---")
    resp_post = requests.post(url, json={}, headers={
        "Origin": "https://interview-olive-ten.vercel.app"
    })
    print(f"Status: {resp_post.status_code}")
    print("Headers:")
    for k, v in resp_post.headers.items():
        if "Access-Control" in k:
            print(f"  {k}: {v}")

except Exception as e:
    print(f"Error: {e}")
