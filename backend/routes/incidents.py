from flask import Blueprint, jsonify, request
from services.incident_service import IncidentService
from config.config import Config

incidents_bp = Blueprint('incidents', __name__)
incident_service = IncidentService()

@incidents_bp.route('/', methods=['GET'])
def get_incidents():
    """Get all incidents with optional filters"""
    try:
        severity = request.args.get('severity')
        category = request.args.get('category')
        limit = int(request.args.get('limit', 100))

        incidents = incident_service.get_incidents(
            severity=severity,
            category=category,
            limit=limit
        )

        return jsonify({
            'success': True,
            'data': incidents,
            'count': len(incidents)
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@incidents_bp.route('/<int:incident_id>', methods=['GET'])
def get_incident(incident_id):
    """Get a specific incident by ID"""
    try:
        incident = incident_service.get_incident_by_id(incident_id)

        if incident:
            return jsonify({
                'success': True,
                'data': incident
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Incident not found'
            }), 404

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@incidents_bp.route('/refresh', methods=['POST'])
def refresh_incidents():
    """Refresh incidents from all configured feeds"""
    try:
        incident_service.refresh_cache(Config.RSS_FEEDS)

        return jsonify({
            'success': True,
            'message': 'Incidents refreshed successfully',
            'count': len(incident_service.incidents_cache)
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@incidents_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get incident statistics"""
    try:
        stats = {
            'total': len(incident_service.incidents_cache),
            'by_severity': {},
            'by_category': {}
        }

        for incident in incident_service.incidents_cache:
            # Count by severity
            severity = incident.severity
            stats['by_severity'][severity] = stats['by_severity'].get(severity, 0) + 1

            # Count by category
            category = incident.category
            stats['by_category'][category] = stats['by_category'].get(category, 0) + 1

        return jsonify({
            'success': True,
            'data': stats
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@incidents_bp.route('/save', methods=['POST'])
def save_incident():
    """Save an incident from the simulator or external source to global stats"""
    try:
        data = request.get_json()
        from services.incident_service import IncidentService
        service = IncidentService()
        service.add_incident_data({
            'text': data.get('text', ''),
            'username': data.get('username', 'Simulator'),
            'url': data.get('url', ''),
            'severity': data.get('severity', 'low'),
            'predicted_label': data.get('predicted_label', 'normal')
        })
        return jsonify({'success': True}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400
