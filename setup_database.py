"""
Script to set up the PostgreSQL database
This will create the database if it doesn't exist
"""
import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent / "backend" / ".env"
load_dotenv(dotenv_path=env_path)

# Get database URL from environment or use default
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/postgres"
)

# Extract database name
db_name = "digit_classification_db"

def create_database():
    """Create the database if it doesn't exist"""
    try:
        # Connect to default postgres database
        # Extract connection details from DATABASE_URL
        url_parts = DATABASE_URL.replace("postgresql://", "").split("/")
        auth_host_port = url_parts[0].split("@")
        
        if len(auth_host_port) == 2:
            auth, host_port = auth_host_port
            user, password = auth.split(":")
            host, port = host_port.split(":")
        else:
            user = "postgres"
            password = "postgres"
            host = "localhost"
            port = "5432"
        
        # Connect to postgres database to create new database
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s",
            (db_name,)
        )
        exists = cursor.fetchone()
        
        if not exists:
            # Create database
            cursor.execute(sql.SQL("CREATE DATABASE {}").format(
                sql.Identifier(db_name)
            ))
            print(f"✅ Database '{db_name}' created successfully!")
        else:
            print(f"✅ Database '{db_name}' already exists!")
        
        cursor.close()
        conn.close()
        
        print(f"\n📝 Update backend/.env with:")
        print(f"DATABASE_URL=postgresql://{user}:{password}@{host}:{port}/{db_name}")
        
    except psycopg2.OperationalError as e:
        print(f"❌ Error connecting to PostgreSQL: {e}")
        print("\nPossible issues:")
        print("1. PostgreSQL is not installed")
        print("2. PostgreSQL service is not running")
        print("3. Wrong password in DATABASE_URL")
        print("\nPlease check the setup_postgresql.md file for installation instructions.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("Setting up PostgreSQL database...")
    create_database()
