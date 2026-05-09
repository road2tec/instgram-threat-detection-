import os
import json
import feedparser
import requests
from datetime import datetime
from typing import List, Dict, Optional
from pymongo import MongoClient
from models.incident import Incident
from ml_module.classifier import IncidentClassifier

class IncidentService:
    """Service for handling incident-related operations with persistent disk storage and MongoDB sessions"""
    
    # Class-level cache to ensure all instances share the same session data in RAM
    incidents_cache = []
    _initialized = False
    
    _STORAGE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'persistence', 'incidents_history.json')

    def __init__(self):
        self.classifier = IncidentClassifier()
        # Initialize MongoDB
        self.mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/cyber_incidents_db')
        self.client = MongoClient(self.mongo_uri)
        self.db = self.client.get_database()
        
        if not IncidentService._initialized:
            self._ensure_storage_dir()
            self._load_from_disk()
            IncidentService._initialized = True

    def _ensure_storage_dir(self):
        os.makedirs(os.path.dirname(self._STORAGE_PATH), exist_ok=True)

    def _load_from_disk(self):
        """Hydrate the cache from local JSON storage on startup"""
        if os.path.exists(self._STORAGE_PATH):
            try:
                with open(self._STORAGE_PATH, 'r', encoding='utf-8') as f:
                    stored_data = json.load(f)
                    loaded = []
                    for item in stored_data:
                        incident = Incident(
                            title=item.get('title', 'Analytical Report'),
                            description=item.get('description', ''),
                            source=item.get('source', 'Historical Record'),
                            url=item.get('url', ''),
                            published_date=datetime.fromisoformat(item.get('published_date')) if item.get('published_date') else datetime.utcnow()
                        )
                        incident.id = item.get('id')
                        incident.severity = item.get('severity', 'low')
                        incident.category = item.get('category', 'normal')
                        incident.tags = item.get('tags', [])
                        incident.user_id = item.get('user_id')
                        loaded.append(incident)
                    
                    IncidentService.incidents_cache = loaded
                    print(f"[STORAGE] Persistent Storage: Loaded {len(loaded)} records from disk.")
                
                # Bootstrap with a welcome incident if totally empty
                if not IncidentService.incidents_cache:
                    self.add_incident_data({
                        'text': 'Cyber-Violet System Initialized. Forensic monitoring nodes are now active and scanning global clusters.',
                        'username': 'SYSTEM-CORE',
                        'severity': 'low',
                        'predicted_label': 'normal'
                    })
            except Exception as e:
                print(f"[ERROR] Persistence Load Error: {str(e)}")

    def _save_to_disk(self):
        """Commit current cache state to physical disk"""
        try:
            temp_list = [i.to_dict() for i in IncidentService.incidents_cache]
            for item in temp_list:
                if isinstance(item.get('published_date'), datetime):
                    item['published_date'] = item['published_date'].isoformat()
            
            with open(self._STORAGE_PATH, 'w', encoding='utf-8') as f:
                json.dump(temp_list, f, indent=4, ensure_ascii=False)
        except Exception as e:
            print(f"[ERROR] Persistence Save Error: {str(e)}")

    def add_incident_data(self, data: Dict, user_id: Optional[str] = None):
        """Add a manually analyzed post to global cache and commit to disk"""
        from models.incident import Incident
        
        incident = Incident(
            title="Analytic Scan Result",
            description=data.get('text', ''),
            source=f"Instagram Scan: {data.get('username', 'Unknown')}",
            url=data.get('url', ''),
            published_date=datetime.utcnow(),
            user_id=user_id
        )
        
        incident.severity = data.get('severity', 'low')
        incident.category = data.get('predicted_label', 'normal')
        
        last_id = IncidentService.incidents_cache[-1].id if IncidentService.incidents_cache else 0
        incident.id = int(last_id) + 1
        
        IncidentService.incidents_cache.append(incident)
        self._save_to_disk()
        
        # TERMINAL LOGGING FOR LIVE FEEDBACK (Safe for emojis on Windows)
        try:
            print(f"\033[94m[INGESTION]\033[0m Intelligence successfully captured from {incident.source}")
            # Use .encode().decode() to strip unprintable characters for the console if needed
            safe_description = incident.description[:60].encode('ascii', 'ignore').decode('ascii')
            print(f" > Content: {safe_description}...")
        except:
            print(f"\033[94m[INGESTION]\033[0m Intelligence captured (Content contains special characters)")
        print(f" > Analysis: Category=\033[93m{incident.category.upper()}\033[0m | Severity=\033[91m{incident.severity.upper()}\033[0m")

    # --- MONGODB SESSION HISTORY METHODS ---
    
    def save_analysis_session(self, profile: Dict, posts: List[Dict], trust_score: float, insights: List[Dict], user_id: Optional[str] = None):
        """Save a complete investigation session to MongoDB for historical tracking"""
        try:
            session_data = {
                'user_id': user_id,
                'username': profile.get('username'),
                'full_name': profile.get('fullName'),
                'timestamp': datetime.utcnow(),
                'trust_score': trust_score,
                'total_posts': len(posts),
                'threats_found': sum(1 for p in posts if p.get('predicted_label') != 'normal'),
                'profile_meta': profile,
                'analyzed_posts': posts[:10], # Store top 10 for quick preview
                'forensic_insights': insights
            }
            self.db.analysis_history.insert_one(session_data)
            print(f"[DB] Investigation Stored: {profile.get('username')} saved to MongoDB history.")
        except Exception as e:
            print(f"[ERROR] MongoDB History Error: {str(e)}")

    def get_analysis_history(self, user_id: Optional[str] = None, limit=20) -> List[Dict]:
        """Fetch past investigation reports from MongoDB"""
        try:
            query = {}
            if user_id:
                query['user_id'] = user_id
                
            history = list(self.db.analysis_history.find(query).sort('timestamp', -1).limit(limit))
            # Convert ObjectIds and Datetimes to strings for JSON
            for item in history:
                item['_id'] = str(item['_id'])
                item['timestamp'] = item['timestamp'].isoformat()
            return history
        except Exception as e:
            print(f"[ERROR] MongoDB History Fetch Error: {str(e)}")
            return []

    # --- END MONGODB METHODS ---

    def add_to_monitoring_queue(self, username, user_id=None):
        """Register a profile for background surveillance"""
        try:
            self.db.monitored_profiles.update_one(
                {'username': username.lower(), 'user_id': user_id},
                {'$set': {'last_monitored': datetime.utcnow(), 'active': True}},
                upsert=True
            )
            print(f"[DB] Target Added to Surveillance: @{username}")
        except Exception as e:
            print(f"[ERROR] Surveillance Queue Error: {str(e)}")

    def get_monitored_profiles(self):
        """Fetch all active targets for the simulator"""
        try:
            return list(self.db.monitored_profiles.find({'active': True}))
        except:
            return []

    def get_stats(self, user_id: Optional[str] = None) -> Dict:
        """Get summarized stats for dashboard charts from persistent cache with case-insensitive counting"""
        severity_dist = {'critical': 0, 'high': 0, 'medium': 0, 'low': 0}
        label_dist = {'phishing': 0, 'malware': 0, 'ddos': 0, 'data_breach': 0, 'normal': 0}
        
        filtered_cache = IncidentService.incidents_cache
        if user_id:
            filtered_cache = [i for i in filtered_cache if i.user_id == user_id]
        
        for incident in filtered_cache:
            # Handle case sensitivity for severity
            sev = str(incident.severity).lower().strip()
            if sev in severity_dist: 
                severity_dist[sev] += 1
            else:
                # Default to low if unknown
                severity_dist['low'] += 1
            
            # Handle case sensitivity for labels
            lbl = str(incident.category).lower().strip()
            if lbl in label_dist: 
                label_dist[lbl] += 1
            else:
                # Map unknown to normal or handle specifically
                label_dist['normal'] += 1
            
        return {
            'total_posts': len(filtered_cache),
            'severity_distribution': severity_dist,
            'predictions_by_label': label_dist
        }

    def get_incidents(self, severity=None, category=None, limit=100, user_id: Optional[str] = None) -> List[Dict]:
        """Get incidents with optional filters from persistent cache"""
        filtered = IncidentService.incidents_cache
        if user_id: filtered = [i for i in filtered if i.user_id == user_id]
        if severity: filtered = [i for i in filtered if i.severity == severity]
        if category: filtered = [i for i in filtered if i.category == category]
        return [i.to_dict() for i in reversed(filtered)][:limit]

    def get_incident_by_id(self, incident_id: int) -> Optional[Dict]:
        for incident in IncidentService.incidents_cache:
            if int(incident.id) == int(incident_id):
                return incident.to_dict()
        return None

    def analyze_trends(self) -> Dict:
        return {
            'total': len(IncidentService.incidents_cache),
            'by_severity': self.get_stats()['severity_distribution'],
            'by_category': self.get_stats()['predictions_by_label'],
            'recent_increase': 5.2
        }
