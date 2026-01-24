from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
from pathlib import Path

# Load environment variables from backend/.env
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

# SQLite database URL - uses a file in the project root
# If DATABASE_URL is set, use it; otherwise use SQLite
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{(Path(__file__).parent.parent / 'database.db').absolute()}"
)

# Enable SQLite foreign keys (requires connect_args for SQLite)
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
