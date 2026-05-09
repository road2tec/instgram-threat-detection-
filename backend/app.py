from flask import Flask, jsonify, request, make_response
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from pymongo import MongoClient
import logging
from datetime import datetime, timedelta

# Import configurations and routes
from config.config import Config
from routes import incidents_bp, analysis_bp, auth_bp
from middleware.auth import AuthMiddleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app():
    """Create and configure Flask application"""
    app = Flask(__name__)
    app.config.from_object(Config)
    app.url_map.strict_slashes = False

    # Initialize JWT
    jwt = JWTManager(app)

    # Initialize MongoDB connection test
    try:
        client = MongoClient(app.config['MONGO_URI'])
        db = client[app.config['MONGO_DBNAME']]
        # Test connection
        client.admin.command('ping')
        logger.info(f"MongoDB connected successfully to {app.config['MONGO_DBNAME']}")
    except Exception as e:
        logger.error(f"MongoDB connection failed: {str(e)}")

    # Manual CORS is handled in before_request/after_request

    # Initialize authentication middleware
    auth_middleware = AuthMiddleware(app)

    # JWT configuration
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'error': 'Token expired',
            'message': 'Your session has expired. Please log in again.'
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'error': 'Invalid token',
            'message': 'The provided token is invalid.'
        }), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'error': 'Missing token',
            'message': 'Authentication token is required.'
        }), 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'error': 'Token revoked',
            'message': 'Your session has been revoked. Please log in again.'
        }), 401

    # Register blueprints with strict slashes disabled to prevent redirects
    app.register_blueprint(auth_bp, strict_slashes=False)
    app.register_blueprint(incidents_bp, url_prefix='/api/incidents', strict_slashes=False)
    app.register_blueprint(analysis_bp, url_prefix='/api/analysis', strict_slashes=False)

    # Root routes
    @app.route('/')
    def index():
        return {
            'message': 'Cyber Incident Feed Monitoring Tool API',
            'version': '2.0.0',
            'status': 'running',
            'features': [
                'User Authentication',
                'Real-time Incident Monitoring',
                'ML-based Threat Classification',
                'Role-based Access Control'
            ],
            'endpoints': {
                'auth': '/api/auth',
                'incidents': '/api/incidents',
                'analysis': '/api/analysis'
            }
        }

    @app.route('/health')
    def health():
        """Health check endpoint with database connectivity"""
        try:
            # Test MongoDB connection
            client = MongoClient(app.config['MONGO_URI'])
            db = client[app.config['MONGO_DBNAME']]
            client.admin.command('ping')

            return {
                'status': 'healthy',
                'database': 'connected',
                'timestamp': str(datetime.utcnow()),
                'version': '2.0.0'
            }, 200
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return {
                'status': 'unhealthy',
                'database': 'disconnected',
                'error': str(e),
                'timestamp': str(datetime.utcnow())
            }, 503

    # --- UNIFIED SECURITY & CORS GATEWAY ---
    @app.before_request
    def security_gate():
        origin = request.headers.get('Origin')
        # Handle OPTIONS preflight immediately
        if request.method == 'OPTIONS':
            response = make_response('', 200)
            response.headers['Access-Control-Allow-Origin'] = origin if origin else '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Max-Age'] = '86400'
            return response
        logger.info(f"[{request.method}] {request.path}")

    @app.after_request
    def apply_cors_headers(response):
        origin = request.headers.get('Origin')
        response.headers['Access-Control-Allow-Origin'] = origin if origin else '*'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
        return response

    @app.route('/api')
    def api_info():
        """API information endpoint"""
        return {
            'name': 'Cyber Incident Monitoring API',
            'version': '2.0.0',
            'description': 'Advanced cybersecurity incident monitoring with ML classification',
            'authentication': 'JWT Bearer Token',
            'rate_limiting': 'Enabled',
            'documentation': {
                'auth_endpoints': {
                    'register': 'POST /api/auth/register',
                    'login': 'POST /api/auth/login',
                    'refresh': 'POST /api/auth/refresh',
                    'profile': 'GET/PUT /api/auth/profile',
                    'logout': 'POST /api/auth/logout',
                    'verify': 'GET /api/auth/verify'
                },
                'data_endpoints': {
                    'incidents': 'GET/POST /api/incidents',
                    'analysis': 'GET /api/analysis/*'
                }
            }
        }

    # Global error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'error': 'Not found',
            'message': 'The requested resource was not found'
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {str(error)}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        }), 500

    @app.errorhandler(429)
    def ratelimit_handler(error):
        return jsonify({
            'error': 'Rate limit exceeded',
            'message': 'Too many requests. Please try again later.'
        }), 429

    logger.info("Flask application created successfully with authentication")
    return app

if __name__ == '__main__':
    from datetime import datetime

    app = create_app()
    logger.info("Starting Cyber Incident Monitoring Tool with Authentication")
    logger.info(f"MongoDB URL: {app.config.get('MONGO_URI')}")
    logger.info(f"CORS Origins: {app.config.get('CORS_ORIGINS')}")

    app.run(
        debug=app.config['DEBUG'],
        host='0.0.0.0',
        port=5002,
        use_reloader=False
    )
