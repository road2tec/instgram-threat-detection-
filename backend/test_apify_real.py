import os
from dotenv import load_dotenv
load_dotenv()

from services.apify_service import ApifyInstagramService

def test():
    api_token = os.getenv('APIFY_API_KEY')
    print(f"Using Token: {api_token[:10]}...")
    
    service = ApifyInstagramService(api_token)
    # Search for something very likely to succeed
    result = service.fetch_user_posts("instagram", limit=2)
    
    print(f"Profile: {result.get('profile', {}).get('username')}")
    print(f"Posts count: {len(result.get('posts', []))}")
    
    if not result.get('posts'):
        print("[FAILURE] Still got dummy or empty data.")
    else:
        print("[SUCCESS] Real data captured!")

if __name__ == "__main__":
    test()
