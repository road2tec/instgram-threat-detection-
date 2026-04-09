from functools import wraps
from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from pymongo import MongoClient
from bson import ObjectId
from models.user import User
import logging

logger = logging.getLogger(__name__)

def get_database():
    """Get MongoDB database connection"""
    mongo_uri = current_app.config.get('MONGO_URI')
    db_name = current_app.config.get('MONGO_DBNAME')

    client = MongoClient(mongo_uri)
    return client[db_name]

def token_required(f):
    """
    Decorator to require JWT token for protected routes
    Usage: @token_required
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"Token validation failed: {str(e)}")
            return jsonify({
                'error': 'Token is invalid or expired',
                'message': 'Please log in again'
            }), 401

    return decorated

def role_required(required_roles):
    """
    Decorator to require specific user roles
    Usage: @role_required(['admin', 'analyst'])
    """
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(*args, **kwargs):
            try:
                # Get current user from JWT
                current_user_id = get_jwt_identity()

                # Get user from database
                db = get_database()
                user_data = db.users.find_one({"_id": ObjectId(current_user_id)})

                if not user_data:
                    return jsonify({
                        'error': 'User not found',
                        'message': 'Invalid user token'
                    }), 401

                user = User.from_dict(user_data)

                # Check if user is active
                if not user.is_active:
                    return jsonify({
                        'error': 'Account deactivated',
                        'message': 'Your account has been deactivated'
                    }), 401

                # Check user role
                if user.role not in required_roles:
                    return jsonify({
                        'error': 'Insufficient privileges',
                        'message': f'This action requires {", ".join(required_roles)} role'
                    }), 403

                # Add user to kwargs for use in the route
                kwargs['current_user'] = user

                return f(*args, **kwargs)

            except Exception as e:
                logger.error(f"Role validation failed: {str(e)}")
                return jsonify({
                    'error': 'Authorization failed',
                    'message': 'Unable to verify user permissions'
                }), 401

        return decorated
    return decorator

def get_current_user():
    """
    Get current authenticated user from JWT token
    Returns: User object or None
    """
    try:
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()

        if not current_user_id:
            return None

        # Get user from database
        db = get_database()
        user_data = db.users.find_one({"_id": ObjectId(current_user_id)})

        if not user_data:
            return None

        user = User.from_dict(user_data)

        # Check if user is active
        if not user.is_active:
            return None

        return user

    except Exception as e:
        logger.error(f"Failed to get current user: {str(e)}")
        return None

def admin_required(f):
    """
    Decorator to require admin role
    Usage: @admin_required
    """
    return role_required(['admin'])(f)

def analyst_required(f):
    """
    Decorator to require analyst or admin role
    Usage: @analyst_required
    """
    return role_required(['admin', 'analyst'])(f)

def optional_auth(f):
    """
    Decorator for routes that work with or without authentication
    Adds current_user to kwargs if authenticated, None otherwise
    Usage: @optional_auth
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            current_user = get_current_user()
            kwargs['current_user'] = current_user
        except:
            kwargs['current_user'] = None

        return f(*args, **kwargs)

    return decorated

class AuthMiddleware:
    """Authentication middleware for request processing"""

    def __init__(self, app=None):
        self.app = app
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        """Initialize the middleware with Flask app"""
        app.before_request(self.before_request)
        app.after_request(self.after_request)

    def before_request(self):
        """Process request before route handling"""
        # Log authentication attempts
        if request.endpoint and any(
            auth_route in request.endpoint
            for auth_route in ['auth.login', 'auth.register']
        ):
            logger.info(f"Authentication attempt from {request.remote_addr}")

    def after_request(self, response):
        """Process response after route handling"""
        # Add security headers
        security_headers = current_app.config.get('SECURITY_HEADERS', {})
        for header_name, header_value in security_headers.items():
            response.headers[header_name] = header_value

        return response

# Rate limiting helpers
def get_rate_limit_key(identifier_type='ip'):
    """
    Generate rate limit key based on identifier type
    Args:
        identifier_type: 'ip', 'user', or 'email'
    """
    if identifier_type == 'ip':
        return f"rate_limit:ip:{request.remote_addr}"
    elif identifier_type == 'user':
        try:
            user = get_current_user()
            return f"rate_limit:user:{user._id}"
        except:
            return f"rate_limit:ip:{request.remote_addr}"
    elif identifier_type == 'email':
        email = request.json.get('email') if request.is_json else None
        if email:
            return f"rate_limit:email:{email.lower()}"
        return f"rate_limit:ip:{request.remote_addr}"

    return f"rate_limit:ip:{request.remote_addr}"