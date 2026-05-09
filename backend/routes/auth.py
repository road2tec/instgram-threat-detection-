from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    jwt_required, create_access_token, create_refresh_token,
    get_jwt_identity, get_jwt
)
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
import logging

from models.user import User
from middleware.auth import token_required, get_current_user, get_database

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create auth blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user
    ---
    POST /api/auth/register
    {
        "email": "user@example.com",
        "password": "SecurePass123!",
        "first_name": "John",
        "last_name": "Doe"
    }
    """
    try:
        # Get request data
        data = request.get_json(force=True)
        if not data:
            return jsonify({
                'error': 'Invalid request',
                'message': 'JSON data required'
            }), 400

        # Extract and validate required fields
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()

        # Validate required fields
        if not all([email, password, first_name, last_name]):
            return jsonify({
                'error': 'Missing fields',
                'message': 'Email, password, first name, and last name are required'
            }), 400

        # Validate email format
        email_valid, email_msg = User.validate_email(email)
        if not email_valid:
            return jsonify({
                'error': 'Invalid email',
                'message': email_msg
            }), 400

        # Validate password strength
        password_valid, password_msg = User.validate_password(password)
        if not password_valid:
            return jsonify({
                'error': 'Invalid password',
                'message': password_msg
            }), 400

        # Get database connection
        db = get_database()

        # Check if user already exists
        existing_user = db.users.find_one({"email": email})
        if existing_user:
            return jsonify({
                'error': 'User exists',
                'message': 'A user with this email already exists'
            }), 409

        # Create new user
        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=data.get('role', 'user')  # Default to 'user' role
        )

        # Set password (will be hashed automatically)
        user.set_password(password)

        # Validate user data
        is_valid, errors = user.validate_user_data()
        if not is_valid:
            return jsonify({
                'error': 'Validation failed',
                'message': 'User data is invalid',
                'details': errors
            }), 400

        # Insert user into database
        result = db.users.insert_one(user.to_dict())

        if not result.inserted_id:
            return jsonify({
                'error': 'Registration failed',
                'message': 'Unable to create user account'
            }), 500

        # Create JWT tokens
        access_token = create_access_token(
            identity=str(user._id),
            expires_delta=current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
        )

        refresh_token = create_refresh_token(
            identity=str(user._id),
            expires_delta=current_app.config['JWT_REFRESH_TOKEN_EXPIRES']
        )

        logger.info(f"New user registered: {email}")

        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_json(),
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_type': 'Bearer'
        }), 201

    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({
            'error': 'Registration failed',
            'message': 'An unexpected error occurred'
        }), 500


@auth_bp.route('/login/', methods=['POST'])
def login():
    """
    Authenticate user and return JWT tokens
    ---
    POST /api/auth/login
    {
        "email": "user@example.com",
        "password": "SecurePass123!"
    }
    """
    try:
        # Get request data
        data = request.get_json(force=True)
        if not data:
            return jsonify({
                'error': 'Invalid request',
                'message': 'JSON data required'
            }), 400

        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({
                'error': 'Missing credentials',
                'message': 'Email and password are required'
            }), 400

        # Get database connection
        db = get_database()

        # Find user by email
        user_data = db.users.find_one({"email": email})
        if not user_data:
            return jsonify({
                'error': 'Invalid credentials',
                'message': 'Email or password is incorrect'
            }), 401

        user = User.from_dict(user_data)

        # Check if user is active
        if not user.is_active:
            return jsonify({
                'error': 'Account deactivated',
                'message': 'Your account has been deactivated'
            }), 401

        # Verify password
        if not user.check_password(password):
            logger.warning(f"Failed login attempt for email: {email}")
            return jsonify({
                'error': 'Invalid credentials',
                'message': 'Email or password is incorrect'
            }), 401

        # Update last login
        user.update_last_login()
        db.users.update_one(
            {"_id": user._id},
            {"$set": {"last_login": user.last_login}}
        )

        # Create JWT tokens
        access_token = create_access_token(
            identity=str(user._id),
            expires_delta=current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
        )

        refresh_token = create_refresh_token(
            identity=str(user._id),
            expires_delta=current_app.config['JWT_REFRESH_TOKEN_EXPIRES']
        )

        logger.info(f"User logged in: {email}")

        return jsonify({
            'message': 'Login successful',
            'user': user.to_json(),
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_type': 'Bearer'
        }), 200

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({
            'error': 'Login failed',
            'message': 'An unexpected error occurred'
        }), 500


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Refresh JWT access token using refresh token
    ---
    POST /api/auth/refresh
    Headers: Authorization: Bearer <refresh_token>
    """
    try:
        current_user_id = get_jwt_identity()

        # Get database connection
        db = get_database()

        # Verify user still exists and is active
        user_data = db.users.find_one({"_id": ObjectId(current_user_id)})
        if not user_data:
            return jsonify({
                'error': 'User not found',
                'message': 'Invalid refresh token'
            }), 401

        user = User.from_dict(user_data)

        if not user.is_active:
            return jsonify({
                'error': 'Account deactivated',
                'message': 'Your account has been deactivated'
            }), 401

        # Create new access token
        access_token = create_access_token(
            identity=str(user._id),
            expires_delta=current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
        )

        return jsonify({
            'message': 'Token refreshed successfully',
            'access_token': access_token,
            'token_type': 'Bearer'
        }), 200

    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        return jsonify({
            'error': 'Token refresh failed',
            'message': 'Unable to refresh token'
        }), 401


@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile():
    """
    Get current user profile
    ---
    GET /api/auth/profile
    Headers: Authorization: Bearer <access_token>
    """
    try:
        user = get_current_user()
        if not user:
            return jsonify({
                'error': 'User not found',
                'message': 'Invalid token'
            }), 401

        return jsonify({
            'user': user.to_json()
        }), 200

    except Exception as e:
        logger.error(f"Get profile error: {str(e)}")
        return jsonify({
            'error': 'Profile fetch failed',
            'message': 'Unable to fetch user profile'
        }), 500


@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    """
    Update current user profile
    ---
    PUT /api/auth/profile
    Headers: Authorization: Bearer <access_token>
    {
        "first_name": "John",
        "last_name": "Doe"
    }
    """
    try:
        user = get_current_user()
        if not user:
            return jsonify({
                'error': 'User not found',
                'message': 'Invalid token'
            }), 401

        data = request.get_json(force=True)
        if not data:
            return jsonify({
                'error': 'Invalid request',
                'message': 'JSON data required'
            }), 400

        # Update allowed fields
        update_fields = {}

        if 'first_name' in data:
            user.first_name = data['first_name'].strip()
            update_fields['first_name'] = user.first_name

        if 'last_name' in data:
            user.last_name = data['last_name'].strip()
            update_fields['last_name'] = user.last_name

        if not update_fields:
            return jsonify({
                'error': 'No updates',
                'message': 'No valid fields provided for update'
            }), 400

        # Validate updated user data
        is_valid, errors = user.validate_user_data()
        if not is_valid:
            return jsonify({
                'error': 'Validation failed',
                'message': 'Updated data is invalid',
                'details': errors
            }), 400

        # Update timestamp
        user.update_timestamp()
        update_fields['updated_at'] = user.updated_at

        # Update in database
        db = get_database()
        result = db.users.update_one(
            {"_id": user._id},
            {"$set": update_fields}
        )

        if result.modified_count == 0:
            return jsonify({
                'error': 'Update failed',
                'message': 'Unable to update profile'
            }), 500

        logger.info(f"Profile updated for user: {user.email}")

        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_json()
        }), 200

    except Exception as e:
        logger.error(f"Update profile error: {str(e)}")
        return jsonify({
            'error': 'Profile update failed',
            'message': 'Unable to update user profile'
        }), 500


@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout():
    """
    Logout user (token invalidation handled client-side)
    ---
    POST /api/auth/logout
    Headers: Authorization: Bearer <access_token>
    """
    try:
        user = get_current_user()
        if user:
            logger.info(f"User logged out: {user.email}")

        return jsonify({
            'message': 'Logged out successfully'
        }), 200

    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return jsonify({
            'error': 'Logout failed',
            'message': 'Unable to logout'
        }), 500


@auth_bp.route('/verify/', methods=['GET'])
@token_required
def verify_token():
    """
    Verify if current JWT token is valid
    ---
    GET /api/auth/verify
    Headers: Authorization: Bearer <access_token>
    """
    try:
        user = get_current_user()
        if not user:
            return jsonify({
                'error': 'Invalid token',
                'message': 'Token is not valid'
            }), 401

        return jsonify({
            'message': 'Token is valid',
            'user': user.to_json()
        }), 200

    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        return jsonify({
            'error': 'Token verification failed',
            'message': 'Unable to verify token'
        }), 401


# Error handlers
@auth_bp.errorhandler(429)
def ratelimit_handler(e):
    """Handle rate limit exceeded"""
    return jsonify({
        'error': 'Rate limit exceeded',
        'message': 'Too many requests. Please try again later.'
    }), 429


@auth_bp.errorhandler(400)
def bad_request_handler(e):
    """Handle bad requests"""
    return jsonify({
        'error': 'Bad request',
        'message': 'The request could not be processed'
    }), 400


@auth_bp.errorhandler(500)
def internal_error_handler(e):
    """Handle internal server errors"""
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred'
    }), 500