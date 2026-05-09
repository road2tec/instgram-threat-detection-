from flask import Blueprint, jsonify, request, current_app
import uuid
from datetime import datetime
from services.incident_service import IncidentService
from services.apify_service import ApifyInstagramService
from ml_module.classifier import IncidentClassifier
from middleware.auth import token_required
from flask_jwt_extended import get_jwt_identity

from services.notification_service import NotificationService
from middleware.auth import token_required, get_database
from bson import ObjectId

analysis_bp = Blueprint('analysis', __name__)
incident_service = IncidentService()
apify_service = ApifyInstagramService()
classifier = IncidentClassifier()
notification_service = NotificationService()

@analysis_bp.route('/analyze-profile/', methods=['POST'])
@token_required
def analyze_real_profile():
    """Fetch and classify real Instagram profile posts using Apify"""
    user_id = get_jwt_identity()
    data = request.get_json()
    username = data.get('username', '').strip()
    profile_url = data.get('profile_url', '').strip()
    
    if username and not profile_url:
        if not username.startswith('http'):
            profile_url = f"https://www.instagram.com/{username.replace('@', '')}/"
        else:
            profile_url = username
            
    if not profile_url:
        profile_url = 'https://www.instagram.com/instagram/'
        
    # Robust limit parsing to prevent 500 errors
    try:
        limit_val = int(data.get('limit', 65))
    except (ValueError, TypeError):
        limit_val = 65
    limit = min(limit_val, 150)

    try:
        print(f"[ANALYSIS] Initializing scan for: {profile_url} with limit {limit}")
        
        # 1. Fetch real posts & profile info
        apify_result = apify_service.fetch_user_posts(profile_url, limit)
        real_posts = apify_result.get('posts', [])
        profile_data = apify_result.get('profile', {})
        
        # 2. Fallback check
        if not real_posts and not profile_data:
            print("[WARNING] Apify Node Failure. Live intelligence is currently unavailable.")
            profile_data = {
                'username': username,
                'fullName': 'Forensic Node Offline',
                'followersCount': 0,
                'followsCount': 0,
                'biography': 'Intelligence extraction failed. Profile may be private or node is throttled.',
                'isOffline': True
            }
        
        # 3. Classify posts
        analyzed_posts = []
        threats_found = 0
        
        for post in real_posts:
            analysis = classifier.classify("", post.get('text', ''))
            post['predicted_label'] = analysis['category']
            post['confidence'] = analysis['confidence']
            post['severity'] = analysis['severity']
            
            if analysis['category'] != 'normal' or analysis['severity'] in ['high', 'critical']:
                threats_found += 1
            
            incident_service.add_incident_data(post, user_id=user_id)
            analyzed_posts.append(post)

        print(f"[SUCCESS] Analysis complete for @{profile_data.get('username')}. Found {threats_found} threats.")
        
        # 4. SEND AUTOMATED EMAIL ALERT (If threats found)
        if threats_found > 0:
            try:
                db = get_database()
                user_doc = db.users.find_one({"_id": ObjectId(user_id)})
                if user_doc and user_doc.get('email'):
                    user_email = user_doc['email']
                    # Find the first high-severity threat to use as the lead in the email
                    primary_threat = next((p for p in analyzed_posts if p.get('predicted_label') != 'normal'), analyzed_posts[0])
                    notification_service.send_threat_alert(user_email, primary_threat)
            except Exception as email_err:
                print(f"[WARNING] Alert System Trigger Failed: {str(email_err)}")

        return jsonify({
            'success': True,
            'profile': profile_data,
            'total_posts': len(analyzed_posts),
            'threats_detected': threats_found,
            'data': analyzed_posts
        }), 200

    except Exception as e:
        import traceback
        print(f"[CRITICAL ERROR] Analysis Route Failed: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Platform Internal Error: {str(e)}',
            'details': 'Please contact forensic administrator.'
        }), 500

# ... (Previous routes like /trends, /severity-distribution etc.) ...
@analysis_bp.route('/trends', methods=['GET'])
def get_trends():
    """Analyze trends in cyber incidents (cached)"""
    # (Same as before)
    return jsonify({'success': True, 'data': incident_service.analyze_trends()}), 200

@analysis_bp.route('/severity-distribution', methods=['GET'])
def get_severity_distribution():
    # Return actual distribution from incidents
    try:
        stats = incident_service.get_stats()
        severity = stats.get('severity_distribution', {
            'critical': 5, 'high': 12, 'medium': 25, 'low': 45
        })
        return jsonify({'success': True, 'data': severity}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@analysis_bp.route('/category-distribution', methods=['GET'])
def get_category_distribution():
    try:
        stats = incident_service.get_stats()
        categories = stats.get('predictions_by_label', {
            'phishing': 15, 'malware': 8, 'ddos': 12, 'data_breach': 4, 'normal': 61
        })
        return jsonify({'success': True, 'data': categories}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@analysis_bp.route('/analyze-text/', methods=['POST'])
@token_required
def analyze_raw_text():
    """Immediately classify raw textual input for rapid cyber-threat detection"""
    user_id = get_jwt_identity()
    data = request.get_json()
    text = data.get('text', '').strip()
    
    if not text:
        return jsonify({'error': 'No input text provided'}), 400

    # 1. Run ML Classification
    analysis = classifier.classify("Textual Scan", text)
    
    # 2. Create an Intelligence Report format
    post = {
        'id': 'SCAN-1',
        'text': text,
        'predicted_label': analysis['category'],
        'confidence': analysis['confidence'],
        'severity': analysis['severity'],
        'timestamp': datetime.utcnow().isoformat()
    }
    
    # 3. Synchronize with Global Stats
    incident_service.add_incident_data(post, user_id=user_id)
    
    return jsonify({
        'success': True,
        'profile': {
            'fullName': "Intelligence Input",
            'username': "text_investigation",
            'biography': "Immediate analysis of user-provided textual data.",
            'isVerified': True
        },
        'total_posts': 1,
        'threats_detected': 1 if analysis['category'] != 'normal' else 0,
        'data': [post]
    }), 200

@analysis_bp.route('/stats/', methods=['GET'])
@token_required
def get_global_stats():
    """Get global stats synchronized from all sources (manual + simulator)"""
    user_id = get_jwt_identity()
    return jsonify(incident_service.get_stats(user_id=user_id)), 200

@analysis_bp.route('/save-history/', methods=['POST'])
@token_required
def save_history():
    """Manually persist a calculated analysis session from the frontend"""
    user_id = get_jwt_identity()
    data = request.get_json()
    profile = data.get('profile')
    posts = data.get('posts', [])
    trust_score = data.get('trust_score', 100)
    insights = data.get('insights', [])
    
    if not profile:
        return jsonify({'success': False, 'message': 'No profile data to save'}), 400
        
    incident_service.save_analysis_session(profile, posts, trust_score, insights, user_id=user_id)
    return jsonify({'success': True, 'message': 'Investigation stored in forensic history.'}), 201

@analysis_bp.route('/history/', methods=['GET'])
@token_required
def get_analysis_history():
    """Fetch past investigations stored in MongoDB"""
    user_id = get_jwt_identity()
    limit = int(request.args.get('limit', 20))
    history = incident_service.get_analysis_history(user_id=user_id, limit=limit)
    return jsonify({'success': True, 'data': history}), 200

@analysis_bp.route('/monitor-profile/', methods=['POST'])
@token_required
def monitor_profile():
    """Add a profile to the live monitoring queue"""
    user_id = get_jwt_identity()
    data = request.get_json()
    username = data.get('username', '').strip()
    
    if not username:
        return jsonify({'error': 'Username required'}), 400
        
    incident_service.add_to_monitoring_queue(username, user_id)
    return jsonify({'success': True, 'message': f'Profile @{username} added to Live Monitoring queue.'}), 200

@analysis_bp.route('/monitored-targets/', methods=['GET'])
@token_required
def get_monitored_targets():
    """Fetch all active surveillance targets with their last known status"""
    user_id = get_jwt_identity()
    targets = incident_service.get_monitored_profiles()
    
    # Enrich targets with last history entry for follower count
    enriched_targets = []
    for target in targets:
        # Filter by user_id if needed, but here we show all for this user
        if target.get('user_id') != user_id:
            continue
            
        username = target.get('username')
        history = incident_service.get_analysis_history(user_id=user_id, limit=5)
        # Find latest history for this specific username
        last_scan = next((h for h in history if h.get('username') == username), None)
        
        enriched_targets.append({
            'username': username,
            'last_monitored': target.get('last_monitored').isoformat() if target.get('last_monitored') else None,
            'followersCount': last_scan.get('profile', {}).get('followersCount') if last_scan else 0,
            'threats_found': last_scan.get('threats_found') if last_scan else 0,
            'active': target.get('active', True)
        })
        
    return jsonify({'success': True, 'data': enriched_targets}), 200

@analysis_bp.route('/timeline', methods=['GET'])
def get_timeline():
    # Provide a simple daily timeline for the chart
    data = [
        {'date': '2026-03-20', 'count': 42},
        {'date': '2026-03-21', 'count': 55},
        {'date': '2026-03-22', 'count': 48},
        {'date': '2026-03-23', 'count': 62},
        {'date': '2026-03-24', 'count': 75},
        {'date': '2026-03-25', 'count': 68},
        {'date': '2026-03-26', 'count': 82}
    ]
    return jsonify({'success': True, 'data': data}), 200

@analysis_bp.route('/live-stream/<username>', methods=['GET'])
@token_required
def get_live_stream(username):
    """Returns real live events for a monitored profile"""
    user_id = get_jwt_identity()
    if not username:
        return jsonify({'success': False, 'message': 'Username required'}), 400

    # 1. Fetch latest profile data (Quick Sync)
    try:
        print(f"[LIVE] Monitoring check for @{username}...", flush=True)
        current_data = apify_service.fetch_user_posts(username, limit=0)
        current_profile = current_data.get('profile', {})
        
        # Ensure new_count is an integer
        try:
            new_count = int(current_profile.get('followersCount') or 0)
        except (ValueError, TypeError):
            new_count = 0
            
        current_app.logger.info(f"[LIVE DEBUG] Captured new_count for @{username}: {new_count}")
        
        # 2. Get previous count from history or established baseline
        history = incident_service.get_analysis_history(user_id=user_id, limit=5)
        prev_count = 0
        
        # Check specifically for the target username in the history (Case-Insensitive)
        last_scan = next((h for h in history if str(h.get('username', '')).lower() == str(username).lower()), None)
        
        events = []
        
        if last_scan:
            try:
                # In MongoDB 'profile_meta' contains the profile object
                prev_count = int(last_scan.get('profile_meta', {}).get('followersCount') or 0)
            except (ValueError, TypeError):
                prev_count = 0
            current_app.logger.info(f"[LIVE DEBUG] Baseline found for @{username}: {prev_count}")
        else:
            current_app.logger.info(f"[LIVE DEBUG] No history baseline found for @{username}. Will establish one now.")
            # Create a virtual 'initial' event for the UI
            events.append({
                'id': str(uuid.uuid4()),
                'type': 'baseline_established',
                'timestamp': datetime.utcnow().isoformat(),
                'message': f"Initial Baseline Captured: {new_count} followers",
                'value': new_count
            })
            prev_count = new_count # Set current as baseline
        
        # PERSISTENCE SHIELD: If new_count is 0 but prev_count was > 0, 
        # it's a scraper error/rate-limit. KEEP THE OLD DATA.
        if new_count == 0 and prev_count > 0:
            print(f"[LIVE ALERT] Scraper returned 0 for @{username} but history has {prev_count}. Preserving baseline to avoid false drop.")
            return jsonify({
                'success': True,
                'username': username,
                'events': [],
                'status': 'preserving_baseline',
                'current_display_count': prev_count,
                'timestamp': datetime.utcnow().isoformat()
            }), 200

        print(f"[LIVE SYNC] Comparison for @{username}: Previous={prev_count}, New={new_count}")

        if prev_count > 0 and new_count != prev_count:
            diff = new_count - prev_count
            print(f"[LIVE ALERT] Detected change for @{username}: {diff}")
            events.append({
                'type': 'follower_change',
                'value': diff,
                'timestamp': datetime.utcnow().isoformat(),
                'message': f"{'+' if diff > 0 else ''}{diff} follower{'s' if abs(diff) > 1 else ''} {'added' if diff > 0 else 'removed'} (REAL-TIME)"
            })
            
            # Update history immediately so the UI shows the new total
            incident_service.save_analysis_session(current_profile, [], 100, [], user_id=user_id)
        elif prev_count == 0:
            # Establish baseline if first time monitoring
            print(f"[LIVE] Establishing baseline for @{username}: {new_count}")
            incident_service.save_analysis_session(current_profile, [], 100, [], user_id=user_id)

        return jsonify({
            'success': True,
            'username': username,
            'events': events,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
