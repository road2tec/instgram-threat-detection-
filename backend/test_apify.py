import requests

import os
api_token = os.getenv('APIFY_API_KEY')
actor_id = "apify~instagram-scraper"
base_url = f"https://api.apify.com/v2/acts/{actor_id}/runs?token={api_token}"

payload = {
    "directUrls": ["https://www.instagram.com/instagram/"],
    "resultsLimit": 1
}

print(f"Testing Apify Token: {api_token}...")
response = requests.post(base_url, json=payload)
print(f"Status: {response.status_code}")
print(f"Response: {response.text[:500]}")
