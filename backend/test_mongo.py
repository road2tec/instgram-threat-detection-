from pymongo import MongoClient
import time

def test_mongo():
    uri = "mongodb://localhost:27017/cyber_incidents_db"
    db_name = "cyber_incidents_db"
    
    try:
        print(f"Connecting to MongoDB at {uri}...")
        client = MongoClient(uri, serverSelectionTimeoutMS=2000)
        db = client[db_name]
        
        print("Testing write to 'test_collection'...")
        start = time.time()
        result = db.test_collection.insert_one({"test": "ai", "time": time.time()})
        print(f"Write successful! ID: {result.inserted_id}")
        print(f"Time taken: {time.time() - start:.2f}s")
        
        # Clean up
        db.test_collection.delete_one({"_id": result.inserted_id})
        print("Cleanup successful.")
        
    except Exception as e:
        print(f"MongoDB Error: {str(e)}")

if __name__ == "__main__":
    test_mongo()
