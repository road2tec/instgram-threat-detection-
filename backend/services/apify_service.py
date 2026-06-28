import requests
import time
import os
import json
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()

class ApifyInstagramService:
    """High-Performance Persistent Instagram Scraper Service with Async Polling"""

    def __init__(self, api_token: str = None):
        # Priority: Constructor Argon > Env Var > Hardcoded Default
        self.api_token = api_token or os.getenv('APIFY_API_KEY')
        self.actor_id = "apify~instagram-scraper"
        self.run_url = f"https://api.apify.com/v2/acts/{self.actor_id}/runs?token={self.api_token}"
        self.dataset_url = "https://api.apify.com/v2/datasets/{dataset_id}/items?token={token}"

    def fetch_user_posts(self, profile_url: str, limit: int = 65) -> Dict:
        """Deep Investigative Scan of an Instagram Profile (ASync Polling Strategy)"""
        # Extract username correctly from URL (ignore query params)
        clean_url = profile_url.split('?')[0].rstrip('/')
        username = clean_url.split('/')[-1] if '/' in clean_url else clean_url.replace('@', '')
        
        # Always build a clean URL in the format Apify's validation regex expects
        profile_url = f"https://www.instagram.com/{username}/"

        # Use at least 1 result to ensure we get profile metadata via the posts scraper
        fetch_limit = limit if limit > 0 else 1
        
        payload = {
            "addParentData": True,
            "directUrls": [profile_url],
            "resultsLimit": fetch_limit,
            "resultsType": "posts", # 'posts' is more reliable for metadata
            "timestamp": int(time.time()) # Cache buster
        }

        print(f"[APIFY] Apify Deep-Scan: Initializing ASync run for {profile_url}...")
        
        try:
            # 1. Start the Actor (ASync)
            run_response = requests.post(self.run_url, json=payload, timeout=30)
            if run_response.status_code not in [200, 201]:
                print(f"[ERROR] Apify Run Failed: {run_response.status_code}")
                print(f"[ERROR] Response Body: {run_response.text}")
                return self._get_fallback_data(profile_url)

            run_data = run_response.json().get('data', {})
            run_id = run_data.get('id')
            dataset_id = run_data.get('defaultDatasetId')

            # 2. Poll for Completion
            print(f"[APIFY] Apify Deep-Scan: Waiting for node {run_id} to capture data...")
            start_time = time.time()
            items = []
            
            # Use shorter poll interval for "details only" (limit=0) requests
            poll_interval = 2 if limit == 0 else 4
            max_wait = 60 if limit == 0 else 120

            while time.time() - start_time < max_wait:
                status_url = f"https://api.apify.com/v2/actor-runs/{run_id}?token={self.api_token}"
                status_res = requests.get(status_url, timeout=10).json().get('data', {})
                status = status_res.get('status')
                
                if status == 'SUCCEEDED':
                    # 3. GET items from dataset
                    fetch_url = self.dataset_url.format(dataset_id=dataset_id, token=self.api_token)
                    items_res = requests.get(fetch_url, timeout=20)
                    if items_res.status_code == 200:
                        items_raw = items_res.json()
                        # Handle wrapped responses
                        if isinstance(items_raw, dict):
                            items = items_raw.get('items', [])
                        else:
                            items = items_raw
                        
                        if items:
                            print(f"[DEBUG] Apify Items Keys: {list(items[0].keys())}")
                        break
                elif status in ['FAILED', 'ABORTED', 'TIMED-OUT']:
                    break
                
                time.sleep(poll_interval) # Poll interval

            if items:
                print(f"[SUCCESS] Apify: Captured {len(items)} items for {profile_url}")
                processed = self._process_items(items)
                print(f"[DEBUG] Processed Profile Data: {json.dumps(processed.get('profile', {}))}")
                return processed
            else:
                print(f"[WARNING] Apify: No items found for {profile_url}. Status: {status}")
                return self._get_fallback_data(profile_url)

        except Exception as e:
            print(f"[ERROR] Apify Scraper Error: {str(e)}")
            return self._get_fallback_data(profile_url)

    def _get_fallback_data(self, profile_url: str) -> Dict:
        """Dynamic Error Handler: Prevents crashes while signaling data absence"""
        clean_url = profile_url.split('?')[0].rstrip('/')
        username = clean_url.split('/')[-1] if '/' in clean_url else clean_url.replace('@', '')
        
        print(f"[NODE ERROR] Live Intelligence Offline for @{username}. No fake data injected as per forensic policy.")
        
        return {
            'posts': [],
            'profile': {
                'username': username,
                'fullName': f"Node @{username}",
                'followersCount': 0, # Zero indicates data not yet captured
                'followsCount': 0,
                'biography': "Real-time extraction failed. Surveillance node is retrying...",
                'profilePicUrl': '',
                'isVerified': False,
                'isOffline': True
            }
        }

    def _process_items(self, items: List[Dict]) -> Dict:
        """Convert Apify items to a standard forensic format"""
        processed_posts = []
        profile_info = {}
        
        for item in items:
            # Priority 1: Profile metadata (Comprehensive check for metadata variants)
            # We try to build the profile info from any item that has these fields
            if not profile_info or profile_info.get('followersCount') == 0:
                current_username = item.get('username', item.get('ownerUsername', item.get('userUsername')))
                current_fullName = item.get('fullName', item.get('ownerFullName', item.get('userFullName')))
                
                if current_username:
                    # FUZZY METADATA EXTRACTION (Deep Scan)
                    def get_nested(obj, key):
                        if not obj: return None
                        val = obj.get(key)
                        if val is None: # Try nested common keys
                            for sub in ['owner', 'user', 'ownerDirectory']:
                                if isinstance(obj.get(sub), dict):
                                    val = obj[sub].get(key)
                                    if val is not None: break
                        return val

                    followers = get_nested(item, 'followersCount')
                    if followers is None: followers = get_nested(item, 'followers')
                    if followers is None: followers = get_nested(item, 'userFollowers')
                    if followers is None: followers = get_nested(item, 'edge_followed_by', {}).get('count') # Try edge_followed_by directly on item
                    if followers is None and isinstance(item.get('owner'), dict):
                        followers = item['owner'].get('edge_followed_by', {}).get('count')
                    
                    # Last resort: deep search ALL keys
                    if followers is None:
                        for k, v in item.items():
                            if 'follower' in k.lower() and isinstance(v, (int, float)):
                                followers = v; break
                            if isinstance(v, dict):
                                for sk, sv in v.items():
                                    if 'follower' in sk.lower() and isinstance(sv, (int, float)):
                                        followers = sv; break

                    follows = get_nested(item, 'followsCount')
                    if follows is None: follows = get_nested(item, 'following')
                    if follows is None: follows = get_nested(item, 'userFollowing')
                    if follows is None: follows = get_nested(item, 'edge_follow', {}).get('count')
                    if follows is None and isinstance(item.get('owner'), dict):
                        follows = item['owner'].get('edge_follow', {}).get('count')

                    profile_info = {
                        'username': current_username,
                        'fullName': current_fullName or f"@{current_username}",
                        'biography': get_nested(item, 'biography') or profile_info.get('biography', ''),
                        'followersCount': int(followers or 0),
                        'followsCount': int(follows or 0),
                        'postsCount': int(get_nested(item, 'postsCount') or item.get('edge_owner_to_timeline_media', {}).get('count', 0)),
                        'profilePicUrl': get_nested(item, 'profilePicUrl') or profile_info.get('profilePicUrl', ''),
                        'isVerified': get_nested(item, 'isVerified') or item.get('verified', False),
                        'isPrivate': get_nested(item, 'isPrivate') or False
                    }
            
            # Priority 2: Post content
            if 'caption' in item or 'shortCode' in item:
                processed_posts.append({
                    'id': item.get('id', item.get('shortCode')),
                    'text': item.get('caption', ''),
                    'url': item.get('url', ''),
                    'timestamp': item.get('timestamp', ''),
                    'likes': item.get('likesCount', 0),
                    'comments': item.get('commentsCount', 0),
                    'username': item.get('ownerUsername', '')
                })
                
        return {'posts': processed_posts, 'profile': profile_info}

from datetime import datetime
