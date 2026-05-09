import time
import random
import threading
from datetime import datetime, timezone
import uuid
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from ml_module.classifier import IncidentClassifier

app = Flask(__name__)
CORS(app)

# In-memory storage for posts
posts_storage = []
MAX_POSTS = 100

# Investigative Patterns (Used only as absolute emergency fallback if node is offline)
NORMAL_POST_TEMPLATES = ["Activity Log: Normal user behavior detected.", "Forensic Update: No anomalies in current packet."]
THREAT_POST_TEMPLATES = ["ALERT: Suspicious signature detected at {cafe}: {link}", "SECURITY WARNING: Heuristic match found: {link}"]
LINKS = ["bit.ly/intel-check", "external-node-7.net"]
CAFES = ["Starbucks", "Blue Bottle", "Local Cyber Cafe", "Unknown Hotspot"]
AMOUNTS = ["$500", "$1000", "Critical Data", "User Credentials"]

from services.incident_service import IncidentService
from services.apify_service import ApifyInstagramService

class PostGenerator:
    def __init__(self):
        self.is_running = False
        self.classifier = IncidentClassifier()
        self.incident_service = IncidentService()
        self.apify_service = ApifyInstagramService()
        if not self.apify_service.api_token:
            print(" [WARNING] APIFY_API_KEY missing! Monitoring will fall back to investigative templates.")
        self.processed_post_ids = set() # Avoid duplicates

    def classify_post(self, text):
        res = self.classifier.classify("", text)
        return {'predicted_label': res['category'], 'confidence': res['confidence'], 'severity': res['severity']}
    
    def generate_post(self):
        """This now attempts to fetch REAL data for monitored profiles with robust fallback"""
        try:
            targets = self.incident_service.get_monitored_profiles()
            if not targets:
                print(" [SURVEILLANCE] No active targets. Using investigative templates...")
                text = random.choice(THREAT_POST_TEMPLATES if random.random() < 0.3 else NORMAL_POST_TEMPLATES).format(
                    cafe=random.choice(CAFES), 
                    link=random.choice(LINKS), 
                    amount=random.choice(AMOUNTS)
                )
                username = "System Template"
            else:
                target = random.choice(targets)
                username = target['username']
                print(f" \033[94m[SURVEILLANCE]\033[0m Scanning live intelligence for @{username}...")
                
                results = self.apify_service.fetch_user_posts(username, limit=3)
                posts = results.get('posts', [])
                
                new_posts = [p for p in posts if p['id'] not in self.processed_post_ids]
                if new_posts:
                    p = random.choice(new_posts)
                    self.processed_post_ids.add(p['id'])
                    text = p['text'] or "Captured forensic intelligence packet."
                else:
                    return None # Don't generate anything if no new real data
        except Exception as e:
            print(f" \033[91m[ERROR]\033[0m Surveillance scan failed: {e}. Aborting cycle to prevent fake data injection.")
            return None
        
        c = self.classify_post(text)
        return {
            "id": str(uuid.uuid4()), 
            "text": text, 
            "timestamp": datetime.now(timezone.utc).isoformat(), 
            "predicted_label": c['predicted_label'], 
            "confidence": c['confidence'], 
            "severity": c['severity'],
            "username": username
        }
    def add(self, p):
        if not p:
            return
        global posts_storage; posts_storage.insert(0, p)
        if len(posts_storage) > MAX_POSTS: posts_storage = posts_storage[:MAX_POSTS]
        
        # Proactively Sync to Backend (5002) for Real-time Dashboard
        try:
            import requests
            sync_data = {
                'text': p['text'],
                'severity': p['severity'],
                'predicted_label': p['predicted_label'],
                'username': p.get('username', 'Simulator Node'),
                'url': p.get('url', "internal://sim-stream")
            }
            res = requests.post('http://127.0.0.1:5002/api/incidents/save', json=sync_data, timeout=2)
            if res.status_code == 200:
                print(f" \033[92m[SYNC]\033[0m Intelligence successfully pushed to Forensic Hub.")
            else:
                print(f" \033[91m[SYNC]\033[0m Push failed: Server returned {res.status_code}")
        except Exception as e:
            print(f" \033[91m[SYNC]\033[0m Push failed: {e}")
            
        print(f"\033[96m[SIM_STREAM]\033[0m Generating Live Intelligence... \033[92mSUCCESS\033[0m")
        print(f"   Post: {p['text'][:50]}... | \033[95m{p['predicted_label'].upper()}\033[0m ({round(p['confidence']*100)}%)")
    def run(self):
        while self.is_running:
            post = self.generate_post()
            if post:
                self.add(post)
            time.sleep(10) # Slower cycle to respect scraper nodes
    def pre_populate(self, count=40):
        print(f"  Pre-populating simulator with {count} posts...")
        for _ in range(count):
            self.add(self.generate_post())

    def start(self):
        if not self.is_running:
            # Removed pre-population of fake data
            self.is_running = True
            t = threading.Thread(target=self.run)
            t.daemon = True
            t.start()

pg = PostGenerator()

@app.route('/feed')
def get_feed():
    return jsonify({
        'posts': posts_storage[:20],
        'total_available': len(posts_storage),
        'generation_active': pg.is_running
    })

@app.route('/feed/stats')
def stats():
    # Calculate distributions dynamically
    severity_dist = {'critical': 0, 'high': 0, 'medium': 0, 'low': 0}
    label_dist = {'phishing': 0, 'malware': 0, 'ddos': 0, 'data_breach': 0, 'normal': 0}
    
    for p in posts_storage:
        sev = p.get('severity', 'low')
        if sev in severity_dist: severity_dist[sev] += 1
        
        lbl = p.get('predicted_label', 'normal')
        if lbl in label_dist: label_dist[lbl] += 1
    
    return jsonify({
        'total_posts': len(posts_storage),
        'severity_distribution': severity_dist,
        'predictions_by_label': label_dist,
        'threat_percentage': round((sum(label_dist.values()) - label_dist['normal']) / max(len(posts_storage), 1) * 100, 1),
        'generation_active': pg.is_running
    })

@app.route('/generate', methods=['POST'])
def manual_generate():
    p = pg.generate_post()
    if not p:
        return jsonify({'success': False, 'message': 'No new data to generate'}), 200
    pg.add(p)
    return jsonify({'success': True, 'post': p}), 200

if __name__ == '__main__':
    pg.start()
    print("  Simulator starting on http://localhost:5003")
    app.run(host='0.0.0.0', port=5003, debug=False)