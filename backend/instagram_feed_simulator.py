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

# Templates
NORMAL_POST_TEMPLATES = ["Coffee at {cafe} ☕", "Sunset tonight 🌅", "Workout complete! 💪"]
THREAT_POST_TEMPLATES = ["🚨 URGENT: Check {link}", "⚠️ SECURITY ALERT: {link}", "Win ${amount}! {link}"]
CAFES = ["Starbucks", "Blue Bottle"]; LINKS = ["bit.ly/123", "scam.net"]; AMOUNTS = ["1000", "500"]

class PostGenerator:
    def __init__(self):
        self.is_running = False
        self.classifier = IncidentClassifier()
    def classify_post(self, text):
        res = self.classifier.classify("", text)
        return {'predicted_label': res['category'], 'confidence': res['confidence'], 'severity': res['severity']}
    def generate_post(self):
        text = random.choice(THREAT_POST_TEMPLATES if random.random() < 0.3 else NORMAL_POST_TEMPLATES).format(cafe=random.choice(CAFES), link=random.choice(LINKS), amount=random.choice(AMOUNTS))
        c = self.classify_post(text)
        return {"id": str(uuid.uuid4()), "text": text, "timestamp": datetime.now(timezone.utc).isoformat(), "predicted_label": c['predicted_label'], "confidence": c['confidence'], "severity": c['severity']}
    def add(self, p):
        global posts_storage; posts_storage.insert(0, p)
        if len(posts_storage) > MAX_POSTS: posts_storage = posts_storage[:MAX_POSTS]
        
        # Proactively Sync to Backend (8080) for Real-time Dashboard
        try:
            import requests
            requests.post('http://localhost:8080/api/incidents/save', json=p, timeout=1)
        except:
            pass
            
        print(f"📝 Post: {p['text'][:40]}... | {p['predicted_label']} ({p['confidence']})")
    def run(self):
        while self.is_running:
            self.add(self.generate_post()); time.sleep(3)
    def pre_populate(self, count=40):
        print(f"📊 Pre-populating simulator with {count} posts...")
        for _ in range(count):
            self.add(self.generate_post())

    def start(self):
        if not self.is_running:
            self.pre_populate(40)
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

if __name__ == '__main__':
    pg.start()
    print("📡 Simulator starting on http://localhost:5003")
    app.run(host='0.0.0.0', port=5003, debug=False)