import requests
import json

base_url = "http://localhost:8080"
manifest_url = f"{base_url}/manifest.webmanifest"
sw_url = f"{base_url}/sw.js"

print(f"Checking {manifest_url}...")
try:
    r = requests.get(manifest_url)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print("Manifest content summary:")
        data = r.json()
        print(json.dumps({k: data.get(k) for k in ['name', 'id', 'start_url', 'scope', 'display']}, indent=2))
except Exception as e:
    print(f"Manifest fetch failed: {e}")

print(f"\nChecking {sw_url}...")
try:
    r = requests.get(sw_url)
    print(f"Status: {r.status_code}")
except Exception as e:
    print(f"SW fetch failed: {e}")
