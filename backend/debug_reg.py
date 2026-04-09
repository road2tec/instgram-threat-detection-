import sys
from unittest.mock import MagicMock
sys.modules['flask_jwt_extended'] = MagicMock()
sys.modules['flask_limiter'] = MagicMock()
sys.modules['flask_limiter.util'] = MagicMock()

import os
from dotenv import load_dotenv
load_dotenv()

from models.user import User
from pymongo import MongoClient

def test():
    try:
        email = "test_test@example.com"
        password = "TestPass123!"
        first_name = "Test"
        last_name = "User"
        
        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name
        )
        user.set_password(password)
        
        mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/cyber_incidents_db')
        db_name = os.getenv('MONGO_DBNAME', 'cyber_incidents_db')
        client = MongoClient(mongo_uri)
        db = client[db_name]
        
        print(f"Connecting to {mongo_uri}...")
        
        # Check if exists
        existing = db.users.find_one({"email": email})
        if existing:
            print("User already exists")
            return
            
        result = db.users.insert_one(user.to_dict())
        print(f"Inserted ID: {result.inserted_id}")
        
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test()
