import requests
import json

def test_registration():
    url = "http://localhost:8080/api/auth/register"
    payload = {
        "email": "final_test_user@example.com",
        "password": "password123",
        "first_name": "Final",
        "last_name": "Test"
    }
    
    try:
        print(f"Testing registration at {url}...")
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_registration()
