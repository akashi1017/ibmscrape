"""Quick test to verify backend server is running"""
import requests
import sys

try:
    response = requests.get("http://localhost:8000/", timeout=3)
    print("Server Status: RUNNING")
    print(f"Response: {response.json()}")
    print("\n" + "="*50)
    
    # Test health endpoint
    health = requests.get("http://localhost:8000/api/health", timeout=3)
    print(f"Health Check: {health.json()}")
    print("\nBackend is ready to use!")
    print("API Docs: http://localhost:8000/docs")
    print("\nYou can now test user registration!")
    
except requests.exceptions.ConnectionError:
    print("Server Status: NOT RUNNING")
    print("\nThe server needs to be started first.")
    print("Run: python backend/run.py")
    sys.exit(1)
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
