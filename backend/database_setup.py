"""
Database setup script - Run this to create the database tables
"""
import os
import sys
from sqlalchemy import create_engine, text
from backend.database import Base, engine
from backend.models import User, Prediction

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

if __name__ == "__main__":
    create_tables()
