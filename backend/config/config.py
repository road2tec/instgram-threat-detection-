import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""

    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'True') == 'True'

    # Database Configuration (Using MongoDB/Compass)
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/cyber_incidents_db')
    MONGO_DBNAME = os.getenv('MONGO_DBNAME', 'cyber_incidents_db')

    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_ALGORITHM = 'HS256'

    # Rate Limiting
    RATELIMIT_STORAGE_URL = os.getenv('REDIS_URL', 'memory://')
    RATELIMIT_DEFAULT = "100 per hour"

    # Password Security
    BCRYPT_LOG_ROUNDS = int(os.getenv('BCRYPT_LOG_ROUNDS', '12'))

    # API Keys
    NEWS_API_KEY = os.getenv('NEWS_API_KEY', '')

    # ML Model
    MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'models')

    # Data feeds
    RSS_FEEDS = [
        'https://www.cisa.gov/cybersecurity-advisories/all.xml',
        'https://www.us-cert.gov/ncas/current-activity.xml',
    ]

    # Scraping
    REQUEST_TIMEOUT = 30
    USER_AGENT = 'CyberIncidentMonitor/1.0'

    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')

    # Security Headers
    SECURITY_HEADERS = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
    }
