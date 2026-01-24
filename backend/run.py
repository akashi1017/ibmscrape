"""
Run the FastAPI application
"""
import uvicorn
from dotenv import load_dotenv
import os
from pathlib import Path

# Load environment variables from backend/.env
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=port,
        reload=True# Enable auto-reload during development
    )
